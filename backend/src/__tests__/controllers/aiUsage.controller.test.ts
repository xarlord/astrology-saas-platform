/**
 * AI Usage Controller Unit Tests
 * Tests all 3 exported functions:
 *   getUserStats, getUsageHistory, getDailyUsage
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

// ---------------------------------------------------------------------------
// Mock Registry
// ---------------------------------------------------------------------------

const mockRegistry = {
  getUserStats: null as jest.Mock<any, any> | null,
  getUsageHistory: null as jest.Mock<any, any> | null,
  getDailyUsage: null as jest.Mock<any, any> | null,
};

jest.mock('../../modules/ai/services/aiUsage.service', () => ({
  __esModule: true,
  default: {
    getUserStats: (...args: any[]) => (mockRegistry.getUserStats as any)(...args),
    getUsageHistory: (...args: any[]) => (mockRegistry.getUsageHistory as any)(...args),
    getDailyUsage: (...args: any[]) => (mockRegistry.getDailyUsage as any)(...args),
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

import { Response, NextFunction } from 'express';
import {
  getUserStats,
  getUsageHistory,
  getDailyUsage,
} from '../../modules/ai/controllers/aiUsage.controller';
import { AppError } from '../../utils/appError';

// ---------------------------------------------------------------------------
// Wire up registry to real jest.fn() instances
// ---------------------------------------------------------------------------

mockRegistry.getUserStats = jest.fn();
mockRegistry.getUsageHistory = jest.fn();
mockRegistry.getDailyUsage = jest.fn();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createMockRequest(overrides: Record<string, any> = {}) {
  return {
    user: { id: 'user-123' },
    params: {},
    query: {},
    body: {},
    headers: {},
    method: 'GET',
    path: '/api/v1/ai/usage',
    ...overrides,
  };
}

function createMockResponse() {
  const res: Partial<Response> = {
    json: jest.fn().mockReturnThis(),
    status: jest.fn().mockReturnThis(),
  };
  return res as Response;
}

// ---------------------------------------------------------------------------
// Test Suites
// ---------------------------------------------------------------------------

describe('AI Usage Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserStats', () => {
    it('should return 401 if user is not authenticated', async () => {
      const req = createMockRequest({ user: null });
      const res = createMockResponse();
      const next = jest.fn() as unknown as NextFunction;

      await getUserStats(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'Unauthorized',
        }),
      );
    });

    it('should return user stats for authenticated user', async () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const mockStats = {
        totalRequests: 150,
        monthRequests: 45,
        remainingQuota: 55,
      };
      mockRegistry.getUserStats.mockResolvedValue(mockStats);

      await getUserStats(req, res, jest.fn() as unknown as NextFunction);

      expect(mockRegistry.getUserStats).toHaveBeenCalledWith('user-123');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockStats,
      });
    });

    it('should call next on service error', async () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const next = jest.fn() as unknown as NextFunction;
      const serviceError = new AppError('Service unavailable', 503);
      mockRegistry.getUserStats.mockRejectedValue(serviceError);

      await getUserStats(req, res, next);

      expect(next).toHaveBeenCalledWith(serviceError);
    });
  });

  describe('getUsageHistory', () => {
    it('should return 401 if user is not authenticated', async () => {
      const req = createMockRequest({ user: null });
      const res = createMockResponse();
      const next = jest.fn() as unknown as NextFunction;

      await getUsageHistory(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'Unauthorized',
        }),
      );
    });

    it('should return usage history with default limit', async () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const mockHistory = [
        { id: '1', type: 'natal', timestamp: '2024-01-15T10:00:00Z' },
        { id: '2', type: 'transit', timestamp: '2024-01-14T09:30:00Z' },
      ];
      mockRegistry.getUsageHistory.mockResolvedValue(mockHistory);

      await getUsageHistory(req, res, jest.fn() as unknown as NextFunction);

      expect(mockRegistry.getUsageHistory).toHaveBeenCalledWith('user-123', 50);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockHistory,
      });
    });

    it('should return usage history with custom limit', async () => {
      const req = createMockRequest({ query: { limit: '20' } });
      const res = createMockResponse();
      const mockHistory = [{ id: '1', type: 'natal', timestamp: '2024-01-15T10:00:00Z' }];
      mockRegistry.getUsageHistory.mockResolvedValue(mockHistory);

      await getUsageHistory(req, res, jest.fn() as unknown as NextFunction);

      expect(mockRegistry.getUsageHistory).toHaveBeenCalledWith('user-123', 20);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockHistory,
      });
    });

    it('should call next on service error', async () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const next = jest.fn() as unknown as NextFunction;
      const serviceError = new AppError('Service unavailable', 503);
      mockRegistry.getUsageHistory.mockRejectedValue(serviceError);

      await getUsageHistory(req, res, next);

      expect(next).toHaveBeenCalledWith(serviceError);
    });
  });

  describe('getDailyUsage', () => {
    it('should return 401 if user is not authenticated', async () => {
      const req = createMockRequest({ user: null });
      const res = createMockResponse();
      const next = jest.fn() as unknown as NextFunction;

      await getDailyUsage(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'Unauthorized',
        }),
      );
    });

    it('should return daily usage with default days', async () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const mockDailyUsage = [
        { date: '2024-01-15', count: 12 },
        { date: '2024-01-14', count: 8 },
      ];
      mockRegistry.getDailyUsage.mockResolvedValue(mockDailyUsage);

      await getDailyUsage(req, res, jest.fn() as unknown as NextFunction);

      expect(mockRegistry.getDailyUsage).toHaveBeenCalledWith('user-123', 30);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockDailyUsage,
      });
    });

    it('should return daily usage with custom days', async () => {
      const req = createMockRequest({ query: { days: '30' } });
      const res = createMockResponse();
      const mockDailyUsage = [
        { date: '2024-01-15', count: 12 },
      ];
      mockRegistry.getDailyUsage.mockResolvedValue(mockDailyUsage);

      await getDailyUsage(req, res, jest.fn() as unknown as NextFunction);

      expect(mockRegistry.getDailyUsage).toHaveBeenCalledWith('user-123', 30);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockDailyUsage,
      });
    });

    it('should call next on service error', async () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const next = jest.fn() as unknown as NextFunction;
      const serviceError = new AppError('Service unavailable', 503);
      mockRegistry.getDailyUsage.mockRejectedValue(serviceError);

      await getDailyUsage(req, res, next);

      expect(next).toHaveBeenCalledWith(serviceError);
    });
  });
});
