/**
 * Unit Tests for Lunar Return Controller
 * Tests all 7 controller functions
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

// ---------------------------------------------------------------------------
// Mocks MUST be hoisted and self-contained (no external variable references).
// We use a mutable object so the mock factory can return a function that
// delegates to a jest.fn() we create after module setup.
// ---------------------------------------------------------------------------

const mockRegistry = {
  knex: null as jest.Mock<any, any> | null,
  calculateNextLunarReturn: null as jest.Mock<any, any> | null,
  calculateLunarReturnChart: null as jest.Mock<any, any> | null,
  generateLunarMonthForecast: null as jest.Mock<any, any> | null,
  getCurrentLunarReturn: null as jest.Mock<any, any> | null,
};

jest.mock('../../config/database', () => {
  // This factory runs before any variable outside `jest.mock` scope is initialized,
  // so we return a function that delegates to the registry entry set up later.
  const fn = (...args: any[]) => (mockRegistry.knex as any)(...args);
  return fn;
});

jest.mock('../../modules/lunar/services/lunarReturn.service', () => ({
  calculateNextLunarReturn: (...args: any[]) => (mockRegistry.calculateNextLunarReturn as any)(...args),
  calculateLunarReturnChart: (...args: any[]) => (mockRegistry.calculateLunarReturnChart as any)(...args),
  generateLunarMonthForecast: (...args: any[]) => (mockRegistry.generateLunarMonthForecast as any)(...args),
  getCurrentLunarReturn: (...args: any[]) => (mockRegistry.getCurrentLunarReturn as any)(...args),
}));

// Now import everything -- after mocks are set up.
import { Response } from 'express';
import {
  getNextLunarReturn,
  getCurrentLunarReturn,
  getLunarReturnChart,
  getLunarMonthForecast,
  getLunarReturnHistory,
  deleteLunarReturn,
  calculateCustomLunarReturn,
} from '../../modules/lunar/controllers/lunarReturn.controller';

// ---------------------------------------------------------------------------
// Wire up the registry to real jest.fn() instances
// ---------------------------------------------------------------------------

// Mock knex chain
const mockKnexChain = {
  where: jest.fn().mockReturnThis(),
  first: jest.fn(),
  insert: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  offset: jest.fn().mockReturnThis(),
  count: jest.fn().mockReturnThis(),
  del: jest.fn(),
};

const mockKnex = jest.fn().mockReturnValue(mockKnexChain);
mockRegistry.knex = mockKnex;

mockRegistry.calculateNextLunarReturn = jest.fn();
mockRegistry.calculateLunarReturnChart = jest.fn();
mockRegistry.generateLunarMonthForecast = jest.fn();
mockRegistry.getCurrentLunarReturn = jest.fn();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resetKnexChain() {
  // Must re-wire mockKnex to return the chain object -- clearAllMocks wipes this.
  mockKnex.mockReturnValue(mockKnexChain);
  mockKnexChain.where.mockReturnThis();
  mockKnexChain.first.mockResolvedValue(undefined);
  mockKnexChain.insert.mockReturnThis();
  mockKnexChain.orderBy.mockReturnThis();
  mockKnexChain.limit.mockReturnThis();
  mockKnexChain.offset.mockReturnThis();
  mockKnexChain.count.mockReturnThis();
  mockKnexChain.del.mockResolvedValue(undefined);
}

const natalChartRow = {
  id: 'chart-1',
  userId: 'user-123',
  moonSign: 'taurus',
  moonDegree: 15,
  moonMinute: 30,
  moonSecond: 0,
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Lunar Return Controller', () => {
  let mockRequest: Partial<any>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    resetKnexChain();

    mockRequest = {
      user: { id: 'user-123', email: 'test@example.com' },
      body: {},
      params: {},
      query: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  // =========================================================================
  // getNextLunarReturn
  // =========================================================================
  describe('getNextLunarReturn', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockRequest.user = undefined;

      await getNextLunarReturn(mockRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Unauthorized',
      });
      expect(mockKnex).not.toHaveBeenCalled();
    });

    it('should return 404 if no natal chart found', async () => {
      mockKnexChain.first.mockResolvedValue(undefined);

      await getNextLunarReturn(mockRequest, mockResponse as Response, mockNext);

      expect(mockKnex).toHaveBeenCalledWith('charts');
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Natal chart not found. Please create a birth chart first.',
      });
    });

    it('should return next return and natal moon on happy path', async () => {
      mockKnexChain.first.mockResolvedValue(natalChartRow);
      const mockNextReturn = new Date('2026-05-20');
      mockRegistry.calculateNextLunarReturn!.mockReturnValue(mockNextReturn);

      await getNextLunarReturn(mockRequest, mockResponse as Response, mockNext);

      expect(mockRegistry.calculateNextLunarReturn).toHaveBeenCalledWith({
        sign: 'taurus',
        degree: 15,
        minute: 30,
        second: 0,
      });
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          nextReturn: mockNextReturn,
          natalMoon: {
            sign: 'taurus',
            degree: 15,
            minute: 30,
            second: 0,
          },
        },
      });
    });

    it('should call next on unexpected error', async () => {
      const error = new Error('DB down');
      mockKnexChain.first.mockRejectedValue(error);

      await getNextLunarReturn(mockRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // =========================================================================
  // getCurrentLunarReturn
  // =========================================================================
  describe('getCurrentLunarReturn', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockRequest.user = undefined;

      await getCurrentLunarReturn(mockRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Unauthorized',
      });
      expect(mockRegistry.getCurrentLunarReturn).not.toHaveBeenCalled();
    });

    it('should return current lunar return data on happy path', async () => {
      const mockResult = {
        returnDate: new Date('2024-06-15'),
        daysUntil: 42,
      };
      mockRegistry.getCurrentLunarReturn!.mockResolvedValue(mockResult);

      await getCurrentLunarReturn(mockRequest, mockResponse as Response, mockNext);

      expect(mockRegistry.getCurrentLunarReturn).toHaveBeenCalledWith('user-123');
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
      });
    });

    it('should call next on service error', async () => {
      const error = new Error('Service failure');
      mockRegistry.getCurrentLunarReturn!.mockRejectedValue(error);

      await getCurrentLunarReturn(mockRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // =========================================================================
  // getLunarReturnChart
  // =========================================================================
  describe('getLunarReturnChart', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockRequest.user = undefined;

      await getLunarReturnChart(mockRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Unauthorized',
      });
    });

    it('should return 400 if returnDate is missing', async () => {
      mockRequest.body = {};

      await getLunarReturnChart(mockRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'returnDate is required',
      });
    });

    it('should return 400 if returnDate is invalid format', async () => {
      mockRequest.body = { returnDate: 'not-a-date' };

      await getLunarReturnChart(mockRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid date format',
      });
    });

    it('should return 404 if no natal chart found', async () => {
      mockRequest.body = { returnDate: '2026-05-20' };
      mockKnexChain.first.mockResolvedValue(undefined);

      await getLunarReturnChart(mockRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Natal chart not found. Please create a birth chart first.',
      });
    });

    it('should return chart data on happy path', async () => {
      mockRequest.body = { returnDate: '2026-05-20' };
      mockKnexChain.first.mockResolvedValue(natalChartRow);
      const mockChart = { houses: [1, 2, 3], planets: { moon: { sign: 'taurus' } } };
      mockRegistry.calculateLunarReturnChart!.mockReturnValue(mockChart);

      await getLunarReturnChart(mockRequest, mockResponse as Response, mockNext);

      expect(mockRegistry.calculateLunarReturnChart).toHaveBeenCalledWith(
        expect.objectContaining({ moon: { sign: 'taurus', degree: 15, minute: 30, second: 0 } }),
        expect.any(Date),
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockChart,
      });
    });

    it('should call next on unexpected error', async () => {
      mockRequest.body = { returnDate: '2026-05-20' };
      const error = new Error('Unexpected');
      mockKnexChain.first.mockRejectedValue(error);

      await getLunarReturnChart(mockRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // =========================================================================
  // getLunarMonthForecast
  // =========================================================================
  describe('getLunarMonthForecast', () => {
    const mockForecast = {
      theme: 'Renewal',
      intensity: 'high',
      emotionalTheme: 'Hopeful',
      actionAdvice: [{ action: 'Meditate daily' }],
      keyDates: [{ date: '2026-05-20', note: 'Full moon' }],
      predictions: [{ text: 'New opportunities' }],
      rituals: [{ name: 'Full moon bath' }],
      journalPrompts: [{ prompt: 'What are you grateful for?' }],
    };

    it('should return 401 if user is not authenticated', async () => {
      mockRequest.user = undefined;

      await getLunarMonthForecast(mockRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Unauthorized',
      });
    });

    it('should return 400 if returnDate is invalid format', async () => {
      mockRequest.body = { returnDate: 'bad-date' };

      await getLunarMonthForecast(mockRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid date format',
      });
    });

    it('should return 404 if no natal chart found', async () => {
      mockRequest.body = { returnDate: '2026-05-20' };
      mockKnexChain.first.mockResolvedValue(undefined);

      await getLunarMonthForecast(mockRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Natal chart not found. Please create a birth chart first.',
      });
    });

    it('should return forecast with provided date on happy path', async () => {
      mockRequest.body = { returnDate: '2026-05-20' };
      mockKnexChain.first.mockResolvedValueOnce(natalChartRow);
      // existing forecast lookup
      mockKnexChain.first.mockResolvedValueOnce({ id: 'existing-1' });
      mockRegistry.generateLunarMonthForecast!.mockReturnValue(mockForecast);

      await getLunarMonthForecast(mockRequest, mockResponse as Response, mockNext);

      expect(mockRegistry.generateLunarMonthForecast).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({ moon: { sign: 'taurus', degree: 15, minute: 30, second: 0 } }),
        expect.any(Date),
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockForecast,
      });
    });

    it('should calculate next return date if no date provided', async () => {
      mockRequest.body = {};
      const calculatedDate = new Date('2026-06-15');
      mockKnexChain.first.mockResolvedValueOnce(natalChartRow);
      // existing forecast lookup returns nothing so it inserts
      mockKnexChain.first.mockResolvedValueOnce(undefined);
      mockRegistry.calculateNextLunarReturn!.mockReturnValue(calculatedDate);
      mockRegistry.generateLunarMonthForecast!.mockReturnValue(mockForecast);

      await getLunarMonthForecast(mockRequest, mockResponse as Response, mockNext);

      expect(mockRegistry.calculateNextLunarReturn).toHaveBeenCalledWith({
        sign: 'taurus',
        degree: 15,
        minute: 30,
        second: 0,
      });
      expect(mockRegistry.generateLunarMonthForecast).toHaveBeenCalledWith(
        'user-123',
        expect.any(Object),
        calculatedDate,
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockForecast,
      });
    });

    it('should save new forecast to DB when no existing forecast', async () => {
      mockRequest.body = { returnDate: '2026-05-20' };
      mockKnexChain.first.mockResolvedValueOnce(natalChartRow);
      // no existing forecast
      mockKnexChain.first.mockResolvedValueOnce(undefined);
      mockRegistry.generateLunarMonthForecast!.mockReturnValue(mockForecast);

      await getLunarMonthForecast(mockRequest, mockResponse as Response, mockNext);

      expect(mockKnex).toHaveBeenCalledWith('lunar_returns');
      expect(mockKnexChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-123',
          theme: 'Renewal',
          intensity: 'high',
          emotionalTheme: 'Hopeful',
        }),
      );
    });

    it('should skip save when forecast already exists', async () => {
      mockRequest.body = { returnDate: '2026-05-20' };
      mockKnexChain.first.mockResolvedValueOnce(natalChartRow);
      // existing forecast found
      mockKnexChain.first.mockResolvedValueOnce({ id: 'existing-1' });
      mockRegistry.generateLunarMonthForecast!.mockReturnValue(mockForecast);

      await getLunarMonthForecast(mockRequest, mockResponse as Response, mockNext);

      expect(mockKnexChain.insert).not.toHaveBeenCalled();
    });

    it('should call next on unexpected error', async () => {
      mockRequest.body = { returnDate: '2026-05-20' };
      const error = new Error('DB fail');
      mockKnexChain.first.mockRejectedValue(error);

      await getLunarMonthForecast(mockRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // =========================================================================
  // getLunarReturnHistory
  // =========================================================================
  describe('getLunarReturnHistory', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockRequest.user = undefined;

      await getLunarReturnHistory(mockRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Unauthorized',
      });
    });

    it('should return paginated results with parsed JSON fields', async () => {
      mockRequest.query = { page: '2', limit: '5' };

      const dbReturns = [
        {
          id: 'lr-1',
          returnDate: '2026-04-01',
          theme: 'Growth',
          intensity: 'medium',
          emotionalTheme: 'Calm',
          actionAdvice: '[{"action":"Rest"}]',
          keyDates: '[{"date":"2026-04-15"}]',
          predictions: '[{"text":"Progress"}]',
          rituals: '[{"name":"Meditation"}]',
          journalPrompts: '[{"prompt":"Reflect"}]',
          createdAt: '2026-04-01T00:00:00Z',
        },
      ];

      // The history handler makes two separate knex calls:
      //   1) list query  -> chain with orderBy/limit/offset resolving to rows
      //   2) count query -> chain with count/first resolving to count
      const listChain = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockResolvedValue(dbReturns),
      };
      const countChain = {
        where: jest.fn().mockReturnThis(),
        count: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({ count: 12 }),
      };

      let knexCallIndex = 0;
      mockKnex.mockImplementation((_table: string) => {
        knexCallIndex++;
        if (knexCallIndex === 1) return listChain;
        return countChain;
      });

      await getLunarReturnHistory(mockRequest, mockResponse as Response, mockNext);

      expect(listChain.limit).toHaveBeenCalledWith(5);
      expect(listChain.offset).toHaveBeenCalledWith(5); // (page 2 - 1) * 5

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          returns: [
            {
              id: 'lr-1',
              returnDate: '2026-04-01',
              theme: 'Growth',
              intensity: 'medium',
              emotionalTheme: 'Calm',
              actionAdvice: [{ action: 'Rest' }],
              keyDates: [{ date: '2026-04-15' }],
              predictions: [{ text: 'Progress' }],
              rituals: [{ name: 'Meditation' }],
              journalPrompts: [{ prompt: 'Reflect' }],
              createdAt: '2026-04-01T00:00:00Z',
            },
          ],
          pagination: {
            page: 2,
            limit: 5,
            total: 12,
            totalPages: 3, // ceil(12/5)
          },
        },
      });
    });

    it('should use default pagination when query params missing', async () => {
      mockRequest.query = {};

      const listChain = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockResolvedValue([]),
      };
      const countChain = {
        where: jest.fn().mockReturnThis(),
        count: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({ count: 0 }),
      };

      let callIdx = 0;
      mockKnex.mockImplementation(() => {
        callIdx++;
        return callIdx === 1 ? listChain : countChain;
      });

      await getLunarReturnHistory(mockRequest, mockResponse as Response, mockNext);

      expect(listChain.limit).toHaveBeenCalledWith(10);
      expect(listChain.offset).toHaveBeenCalledWith(0);
    });

    it('should call next on unexpected error', async () => {
      const error = new Error('DB error');
      mockKnex.mockImplementation(() => {
        throw error;
      });

      await getLunarReturnHistory(mockRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // =========================================================================
  // deleteLunarReturn
  // =========================================================================
  describe('deleteLunarReturn', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockRequest.user = undefined;

      await deleteLunarReturn(mockRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Unauthorized',
      });
    });

    it('should return 404 if lunar return not found', async () => {
      mockRequest.params = { id: 'lr-nonexistent' };
      mockKnexChain.first.mockResolvedValue(undefined);

      await deleteLunarReturn(mockRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Lunar return not found',
      });
    });

    it('should delete and return success on happy path', async () => {
      mockRequest.params = { id: 'lr-1' };
      mockKnexChain.first.mockResolvedValue({ id: 'lr-1', userId: 'user-123' });
      mockKnexChain.del.mockResolvedValue(1);

      await deleteLunarReturn(mockRequest, mockResponse as Response, mockNext);

      expect(mockKnexChain.del).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Lunar return deleted successfully',
      });
    });

    it('should call next on unexpected error', async () => {
      mockRequest.params = { id: 'lr-1' };
      const error = new Error('DB fail');
      mockKnexChain.first.mockRejectedValue(error);

      await deleteLunarReturn(mockRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // =========================================================================
  // calculateCustomLunarReturn
  // =========================================================================
  describe('calculateCustomLunarReturn', () => {
    const mockChart = {
      houses: [1, 2, 3],
      planets: { moon: { sign: 'taurus' } },
    };
    const mockForecast = {
      theme: 'Transformation',
      intensity: 'high',
      emotionalTheme: 'Intense',
      actionAdvice: [],
      keyDates: [],
      predictions: [],
      rituals: [],
      journalPrompts: [],
    };

    it('should return 401 if user is not authenticated', async () => {
      mockRequest.user = undefined;

      await calculateCustomLunarReturn(mockRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Unauthorized',
      });
    });

    it('should return 400 if returnDate is missing', async () => {
      mockRequest.body = {};

      await calculateCustomLunarReturn(mockRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'returnDate is required',
      });
    });

    it('should return 400 if returnDate is invalid format', async () => {
      mockRequest.body = { returnDate: 'invalid' };

      await calculateCustomLunarReturn(mockRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid date format',
      });
    });

    it('should return 404 if no natal chart found', async () => {
      mockRequest.body = { returnDate: '2026-05-20' };
      mockKnexChain.first.mockResolvedValue(undefined);

      await calculateCustomLunarReturn(mockRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Natal chart not found. Please create a birth chart first.',
      });
    });

    it('should return chart with forecast when includeForecast is true', async () => {
      mockRequest.body = { returnDate: '2026-05-20', includeForecast: true };
      mockKnexChain.first.mockResolvedValue(natalChartRow);
      mockRegistry.calculateLunarReturnChart!.mockReturnValue(mockChart);
      mockRegistry.generateLunarMonthForecast!.mockReturnValue(mockForecast);

      await calculateCustomLunarReturn(mockRequest, mockResponse as Response, mockNext);

      expect(mockRegistry.calculateLunarReturnChart).toHaveBeenCalledWith(
        expect.objectContaining({ moon: { sign: 'taurus', degree: 15, minute: 30, second: 0 } }),
        expect.any(Date),
      );
      expect(mockRegistry.generateLunarMonthForecast).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({ moon: { sign: 'taurus', degree: 15, minute: 30, second: 0 } }),
        expect.any(Date),
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          chart: mockChart,
          returnDate: expect.any(Date),
          forecast: mockForecast,
        },
      });
    });

    it('should return chart without forecast when includeForecast is false', async () => {
      mockRequest.body = { returnDate: '2026-05-20', includeForecast: false };
      mockKnexChain.first.mockResolvedValue(natalChartRow);
      mockRegistry.calculateLunarReturnChart!.mockReturnValue(mockChart);

      await calculateCustomLunarReturn(mockRequest, mockResponse as Response, mockNext);

      expect(mockRegistry.generateLunarMonthForecast).not.toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          chart: mockChart,
          returnDate: expect.any(Date),
        },
      });
    });

    it('should include forecast by default when includeForecast not specified', async () => {
      mockRequest.body = { returnDate: '2026-05-20' };
      mockKnexChain.first.mockResolvedValue(natalChartRow);
      mockRegistry.calculateLunarReturnChart!.mockReturnValue(mockChart);
      mockRegistry.generateLunarMonthForecast!.mockReturnValue(mockForecast);

      await calculateCustomLunarReturn(mockRequest, mockResponse as Response, mockNext);

      expect(mockRegistry.generateLunarMonthForecast).toHaveBeenCalled();
    });

    it('should call next on unexpected error', async () => {
      mockRequest.body = { returnDate: '2026-05-20' };
      const error = new Error('Unexpected');
      mockKnexChain.first.mockRejectedValue(error);

      await calculateCustomLunarReturn(mockRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
