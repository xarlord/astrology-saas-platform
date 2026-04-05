/**
 * Calendar Controller Unit Tests
 * Tests all 3 exported controller functions: getMonthEvents, createCustomEvent, deleteEvent
 * Also exercises the internal generateGlobalEvents helper and capitalize utility.
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

// ---------------------------------------------------------------------------
// Mock Registry — mutable object so the jest.mock factories can delegate to
// jest.fn() instances created after module setup.
// ---------------------------------------------------------------------------

const mockRegistry = {
  findByMonth: null as jest.Mock<any, any> | null,
  create: null as jest.Mock<any, any> | null,
  delete: null as jest.Mock<any, any> | null,
  calculateMoonPhases: null as jest.Mock<any, any> | null,
};

jest.mock('../../modules/calendar/models/calendarEvent.model', () => ({
  __esModule: true,
  default: {
    findByMonth: (...args: any[]) => (mockRegistry.findByMonth as any)(...args),
    create: (...args: any[]) => (mockRegistry.create as any)(...args),
    delete: (...args: any[]) => (mockRegistry.delete as any)(...args),
  },
}));

jest.mock('../../modules/calendar/services/globalEvents.service', () => ({
  __esModule: true,
  default: {
    calculateMoonPhases: (...args: any[]) => (mockRegistry.calculateMoonPhases as any)(...args),
  },
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
import {
  getMonthEvents,
  createCustomEvent,
  deleteEvent,
} from '../../modules/calendar/controllers/calendar.controller';

// ---------------------------------------------------------------------------
// Wire up registry to real jest.fn() instances
// ---------------------------------------------------------------------------

mockRegistry.findByMonth = jest.fn();
mockRegistry.create = jest.fn();
mockRegistry.delete = jest.fn();
mockRegistry.calculateMoonPhases = jest.fn();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createMockRequest(overrides: Record<string, any> = {}) {
  return {
    user: { id: 'user-123', email: 'test@example.com' },
    params: {},
    query: {},
    body: {},
    method: 'GET',
    path: '/api/calendar',
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

const mockNext = jest.fn();

// Sample moon phase data for mocking globalEventsService.calculateMoonPhases
const makeNewMoon = (dateStr: string, sign: string) => ({
  date: new Date(dateStr),
  phase: 'new' as const,
  sign,
  degree: 10,
  illumination: 0,
});

const makeFullMoon = (dateStr: string, sign: string) => ({
  date: new Date(dateStr),
  phase: 'full' as const,
  sign,
  degree: 25,
  illumination: 100,
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Calendar Controller', () => {
  let mockRequest: Partial<any>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = createMockRequest();
    mockResponse = createMockResponse();
    mockNext.mockClear();

    // Default: no personal events
    mockRegistry.findByMonth!.mockResolvedValue([]);
    // Default: no moon phases
    mockRegistry.calculateMoonPhases!.mockResolvedValue([]);
  });

  // =========================================================================
  // getMonthEvents
  // =========================================================================
  describe('getMonthEvents', () => {
    it('should return 400 for invalid month (out of range)', async () => {
      mockRequest.params = { year: '2026', month: '13' };

      await getMonthEvents(mockRequest as any, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      const error = mockNext.mock.calls[0][0] as Error & { statusCode: number };
      expect(error.message).toBe('Invalid year or month. Month must be 1-12.');
      expect(error.statusCode).toBe(400);
    });

    it('should return 400 for month = 0', async () => {
      mockRequest.params = { year: '2026', month: '0' };

      await getMonthEvents(mockRequest as any, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      const error = mockNext.mock.calls[0][0] as Error & { statusCode: number };
      expect(error.statusCode).toBe(400);
    });

    it('should return 400 for non-numeric year', async () => {
      mockRequest.params = { year: 'abc', month: '6' };

      await getMonthEvents(mockRequest as any, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      const error = mockNext.mock.calls[0][0] as Error & { statusCode: number };
      expect(error.statusCode).toBe(400);
    });

    it('should return 400 for non-numeric month', async () => {
      mockRequest.params = { year: '2026', month: 'abc' };

      await getMonthEvents(mockRequest as any, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      const error = mockNext.mock.calls[0][0] as Error & { statusCode: number };
      expect(error.statusCode).toBe(400);
    });

    it('should return personal events only when includeGlobal is not "true"', async () => {
      mockRequest.params = { year: '2026', month: '4' };
      mockRequest.query = { includeGlobal: 'false' };

      const personalEvents = [
        { id: 'pe-1', event_type: 'custom', event_date: new Date('2026-04-10') },
      ];
      mockRegistry.findByMonth!.mockResolvedValue(personalEvents);

      await getMonthEvents(mockRequest as any, mockResponse as Response, mockNext);

      expect(mockRegistry.findByMonth).toHaveBeenCalledWith('user-123', 2026, 4);
      expect(mockRegistry.calculateMoonPhases).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: personalEvents,
        meta: { year: 2026, month: 4, total: 1 },
      });
    });

    it('should include global events when includeGlobal is "true"', async () => {
      mockRequest.params = { year: '2026', month: '4' };
      mockRequest.query = { includeGlobal: 'true' };

      const personalEvents = [
        { id: 'pe-1', event_type: 'custom', event_date: new Date('2026-04-10') },
      ];
      mockRegistry.findByMonth!.mockResolvedValue(personalEvents);

      // Return a new moon in April 2026 and a full moon in April 2026
      mockRegistry.calculateMoonPhases!.mockImplementation(
        async (_year: number, phase: string) => {
          if (phase === 'new') {
            return [makeNewMoon('2026-04-17', 'aries')];
          }
          if (phase === 'full') {
            return [makeFullMoon('2026-04-02', 'libra')];
          }
          return [];
        },
      );

      await getMonthEvents(mockRequest as any, mockResponse as Response, mockNext);

      // calculateMoonPhases called twice: once for 'new', once for 'full'
      expect(mockRegistry.calculateMoonPhases).toHaveBeenCalledTimes(2);
      expect(mockRegistry.calculateMoonPhases).toHaveBeenCalledWith(2026, 'new');
      expect(mockRegistry.calculateMoonPhases).toHaveBeenCalledWith(2026, 'full');

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.success).toBe(true);
      // 1 personal + 1 new moon + 1 full moon = 3
      expect(jsonCall.data.length).toBe(3);
      expect(jsonCall.meta.total).toBe(3);
      expect(jsonCall.meta.year).toBe(2026);
      expect(jsonCall.meta.month).toBe(4);

      // Verify global event structure
      const globalNewMoon = jsonCall.data.find(
        (e: any) => e.event_type === 'new_moon',
      );
      expect(globalNewMoon).toBeDefined();
      expect(globalNewMoon.event_type).toBe('new_moon');
      expect(globalNewMoon.interpretation).toContain('New Moon in Aries');
      expect(globalNewMoon.user_id).toBeNull();
      expect(globalNewMoon.event_data).toEqual({
        sign: 'aries',
        degree: 10,
        illumination: 0,
      });

      const globalFullMoon = jsonCall.data.find(
        (e: any) => e.event_type === 'full_moon',
      );
      expect(globalFullMoon).toBeDefined();
      expect(globalFullMoon.interpretation).toContain('Full Moon in Libra');
    });

    it('should default includeGlobal to "true" when query param is absent', async () => {
      mockRequest.params = { year: '2026', month: '4' };
      mockRequest.query = {};

      mockRegistry.calculateMoonPhases!.mockResolvedValue([]);

      await getMonthEvents(mockRequest as any, mockResponse as Response, mockNext);

      expect(mockRegistry.calculateMoonPhases).toHaveBeenCalledTimes(2);
    });

    it('should filter moon phases to only those within the requested month', async () => {
      mockRequest.params = { year: '2026', month: '4' };
      mockRequest.query = { includeGlobal: 'true' };

      mockRegistry.calculateMoonPhases!.mockImplementation(
        async (_year: number, phase: string) => {
          if (phase === 'new') {
            return [
              makeNewMoon('2026-03-29', 'aries'), // March - should be excluded
              makeNewMoon('2026-04-17', 'aries'), // April - should be included
              makeNewMoon('2026-05-15', 'taurus'), // May - should be excluded
            ];
          }
          return [];
        },
      );

      await getMonthEvents(mockRequest as any, mockResponse as Response, mockNext);

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      // Only the April new moon should appear
      const globalEvents = jsonCall.data.filter(
        (e: any) => e.event_type === 'new_moon',
      );
      expect(globalEvents.length).toBe(1);
      expect(globalEvents[0].event_data.sign).toBe('aries');
    });

    it('should call next on model error', async () => {
      mockRequest.params = { year: '2026', month: '4' };
      const error = new Error('DB failure');
      mockRegistry.findByMonth!.mockRejectedValue(error);

      await getMonthEvents(mockRequest as any, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should call next on globalEventsService error', async () => {
      mockRequest.params = { year: '2026', month: '4' };
      mockRequest.query = { includeGlobal: 'true' };

      const error = new Error('Moon phase calc failed');
      mockRegistry.calculateMoonPhases!.mockRejectedValue(error);

      await getMonthEvents(mockRequest as any, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // =========================================================================
  // createCustomEvent
  // =========================================================================
  describe('createCustomEvent', () => {
    it('should return 400 if event_type is missing', async () => {
      mockRequest.body = { event_date: '2026-04-15' };

      await createCustomEvent(mockRequest as any, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      const error = mockNext.mock.calls[0][0] as Error & { statusCode: number };
      expect(error.message).toBe('event_type and event_date are required');
      expect(error.statusCode).toBe(400);
    });

    it('should return 400 if event_date is missing', async () => {
      mockRequest.body = { event_type: 'custom' };

      await createCustomEvent(mockRequest as any, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      const error = mockNext.mock.calls[0][0] as Error & { statusCode: number };
      expect(error.statusCode).toBe(400);
    });

    it('should create event with all fields provided', async () => {
      mockRequest.body = {
        event_type: 'custom',
        event_date: '2026-04-15',
        event_data: { note: 'Special day' },
        interpretation: 'A day of significance',
      };

      const createdEvent = {
        id: 'ev-1',
        user_id: 'user-123',
        event_type: 'custom',
        event_date: new Date('2026-04-15'),
        event_data: { note: 'Special day' },
        interpretation: 'A day of significance',
      };
      mockRegistry.create!.mockResolvedValue(createdEvent);

      await createCustomEvent(mockRequest as any, mockResponse as Response, mockNext);

      expect(mockRegistry.create).toHaveBeenCalledWith('user-123', {
        event_type: 'custom',
        event_date: expect.any(Date),
        event_data: { note: 'Special day' },
        interpretation: 'A day of significance',
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: createdEvent,
      });
    });

    it('should use defaults when event_data and interpretation are omitted', async () => {
      mockRequest.body = {
        event_type: 'retrograde',
        event_date: '2026-06-01',
      };

      const createdEvent = {
        id: 'ev-2',
        user_id: 'user-123',
        event_type: 'retrograde',
        event_date: new Date('2026-06-01'),
        event_data: {},
        interpretation: '',
      };
      mockRegistry.create!.mockResolvedValue(createdEvent);

      await createCustomEvent(mockRequest as any, mockResponse as Response, mockNext);

      expect(mockRegistry.create).toHaveBeenCalledWith('user-123', {
        event_type: 'retrograde',
        event_date: expect.any(Date),
        event_data: {},
        interpretation: '',
      });
    });

    it('should call next on model error', async () => {
      mockRequest.body = {
        event_type: 'custom',
        event_date: '2026-04-15',
      };

      const error = new Error('Insert failed');
      mockRegistry.create!.mockRejectedValue(error);

      await createCustomEvent(mockRequest as any, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // =========================================================================
  // deleteEvent
  // =========================================================================
  describe('deleteEvent', () => {
    it('should return 404 if event not found or does not belong to user', async () => {
      mockRequest.params = { id: 'nonexistent-id' };
      mockRegistry.delete!.mockResolvedValue(false);

      await deleteEvent(mockRequest as any, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      const error = mockNext.mock.calls[0][0] as Error & { statusCode: number };
      expect(error.message).toBe('Event not found or does not belong to user');
      expect(error.statusCode).toBe(404);
    });

    it('should delete event and return success message', async () => {
      mockRequest.params = { id: 'ev-1' };
      mockRegistry.delete!.mockResolvedValue(true);

      await deleteEvent(mockRequest as any, mockResponse as Response, mockNext);

      expect(mockRegistry.delete).toHaveBeenCalledWith('ev-1', 'user-123');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Event deleted successfully',
      });
    });

    it('should call next on model error', async () => {
      mockRequest.params = { id: 'ev-1' };
      const error = new Error('Delete failed');
      mockRegistry.delete!.mockRejectedValue(error);

      await deleteEvent(mockRequest as any, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
