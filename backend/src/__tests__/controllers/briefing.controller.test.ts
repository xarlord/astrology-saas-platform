/**
 * Briefing Controller Unit Tests
 * Tests both exported controller functions: getBriefing, getBriefingByDate.
 *
 * Covers issue #358 (getBriefingByDate now queries by date, not "latest").
 * Also provides the missing controller coverage flagged in #355.
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

// ---------------------------------------------------------------------------
// Mock Registry — mutable object so the jest.mock factories can delegate to
// jest.fn() instances created after module setup.
// ---------------------------------------------------------------------------

const mockRegistry = {
  getLatestBriefing: null as jest.Mock<any, any> | null,
  getBriefingByDate: null as jest.Mock<any, any> | null,
  generateBriefing: null as jest.Mock<any, any> | null,
  formatBriefingContent: null as jest.Mock<any, any> | null,
};

jest.mock('../../modules/jobs/services/dailyBriefing.service', () => ({
  __esModule: true,
  getLatestBriefing: (...args: any[]) => (mockRegistry.getLatestBriefing as any)(...args),
  getBriefingByDate: (...args: any[]) => (mockRegistry.getBriefingByDate as any)(...args),
  generateBriefing: (...args: any[]) => (mockRegistry.generateBriefing as any)(...args),
  formatBriefingContent: (...args: any[]) => (mockRegistry.formatBriefingContent as any)(...args),
}));

jest.mock('../../utils/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

// ---------------------------------------------------------------------------
// Imports (after mocks are set up)
// ---------------------------------------------------------------------------

import { Response } from 'express';
import { getBriefing, getBriefingByDate } from '../../modules/jobs/controllers/briefing.controller';

// ---------------------------------------------------------------------------
// Wire up registry to real jest.fn() instances
// ---------------------------------------------------------------------------

mockRegistry.getLatestBriefing = jest.fn();
mockRegistry.getBriefingByDate = jest.fn();
mockRegistry.generateBriefing = jest.fn();
mockRegistry.formatBriefingContent = jest.fn();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createMockRequest(overrides: Record<string, any> = {}) {
  return {
    user: { id: 'user-123', email: 'test@example.com' },
    params: {},
    query: {},
    body: {},
    ...overrides,
  };
}

function createMockResponse() {
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return res as Response;
}

const mockBriefing = {
  userId: 'user-123',
  date: '2026-04-08',
  moonPhase: { phase: 'waxing-crescent', sign: 'Taurus', illumination: 23.5 },
  topTransits: [],
  dailyTheme: 'A day of harmonious flow.',
  affirmation: 'Your intentions are taking root.',
  planetaryHighlight: { planet: 'sun', sign: 'aries', message: 'Vitality activated.' },
};

const mockContent = {
  title: 'Your Cosmic Briefing — Wednesday, April 8',
  summary: 'summary text',
  pushBody: 'push body',
  emailHtml: '<p>html</p>',
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Briefing Controller', () => {
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockResponse = createMockResponse();
    mockRegistry.formatBriefingContent!.mockReturnValue(mockContent);
  });

  // =========================================================================
  // getBriefing (GET /)
  // =========================================================================
  describe('getBriefing', () => {
    it('should return cached briefing when one exists for today', async () => {
      mockRegistry.getLatestBriefing!.mockResolvedValue(mockBriefing);

      await getBriefing(createMockRequest() as any, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ briefing: mockBriefing, content: mockContent }),
        }),
      );
      // Must not generate on-the-fly when a cached briefing exists
      expect(mockRegistry.generateBriefing).not.toHaveBeenCalled();
    });

    it('should generate on-the-fly when no cached briefing exists', async () => {
      mockRegistry.getLatestBriefing!.mockResolvedValue(null);
      mockRegistry.generateBriefing!.mockResolvedValue(mockBriefing);

      await getBriefing(createMockRequest() as any, mockResponse as Response);

      expect(mockRegistry.generateBriefing).toHaveBeenCalledWith('user-123');
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true }),
      );
    });

    it('should return 401 when user is not authenticated', async () => {
      await getBriefing(createMockRequest({ user: undefined }) as any, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false }),
      );
    });

    it('should return 404 when generation fails with "No natal chart found"', async () => {
      mockRegistry.getLatestBriefing!.mockResolvedValue(null);
      mockRegistry.generateBriefing!.mockRejectedValue(new Error('No natal chart found for user'));

      await getBriefing(createMockRequest() as any, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });

    it('should rethrow unexpected generation errors', async () => {
      mockRegistry.getLatestBriefing!.mockResolvedValue(null);
      const unexpected = new Error('DB down');
      mockRegistry.generateBriefing!.mockRejectedValue(unexpected);

      await expect(
        getBriefing(createMockRequest() as any, mockResponse as Response),
      ).rejects.toThrow('DB down');
    });
  });

  // =========================================================================
  // getBriefingByDate (GET /:date) — issue #358 regression tests
  // =========================================================================
  describe('getBriefingByDate', () => {
    it('should return the briefing for the requested date', async () => {
      mockRegistry.getBriefingByDate!.mockResolvedValue(mockBriefing);

      await getBriefingByDate(
        createMockRequest({ params: { date: '2026-04-08' } }) as any,
        mockResponse as Response,
      );

      // CRITICAL: must call getBriefingByDate(userId, date), NOT getLatestBriefing(userId)
      expect(mockRegistry.getBriefingByDate).toHaveBeenCalledWith('user-123', '2026-04-08');
      expect(mockRegistry.getLatestBriefing).not.toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ briefing: mockBriefing, content: mockContent }),
        }),
      );
    });

    it('should return 404 when no briefing exists for the date', async () => {
      mockRegistry.getBriefingByDate!.mockResolvedValue(null);

      await getBriefingByDate(
        createMockRequest({ params: { date: '1999-01-01' } }) as any,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining('1999-01-01'),
        }),
      );
    });

    it('should return 400 for an invalid date format', async () => {
      await getBriefingByDate(
        createMockRequest({ params: { date: '08-04-2026' } }) as any,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      // Must NOT hit the DB on invalid input
      expect(mockRegistry.getBriefingByDate).not.toHaveBeenCalled();
    });

    it('should return 400 for a malformed date (not YYYY-MM-DD)', async () => {
      await getBriefingByDate(
        createMockRequest({ params: { date: '2026-4-8' } }) as any,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should return 401 when user is not authenticated', async () => {
      await getBriefingByDate(
        createMockRequest({ user: undefined, params: { date: '2026-04-08' } }) as any,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockRegistry.getBriefingByDate).not.toHaveBeenCalled();
    });
  });
});
