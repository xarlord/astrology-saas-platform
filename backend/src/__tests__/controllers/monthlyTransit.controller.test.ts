/**
 * Monthly Transit Controller Unit Tests
 * Tests getMonthlyTransitReport function
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

// ---------------------------------------------------------------------------
// Mock Registry
// ---------------------------------------------------------------------------

const mockRegistry = {
  generateMonthlyTransitReport: null as jest.Mock<any, any> | null,
};

jest.mock('../../modules/reports/services/monthlyTransit.service', () => ({
  __esModule: true,
  generateMonthlyTransitReport: (...args: any[]) => (mockRegistry.generateMonthlyTransitReport as any)(...args),
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
import { getMonthlyTransitReport } from '../../modules/reports/controllers/monthlyTransit.controller';
import { AppError } from '../../utils/appError';
import UserModel from '../../modules/users/models/user.model';

// Mock UserModel
jest.mock('../../modules/users/models/user.model', () => ({
  __esModule: true,
  default: {
    findById: jest.fn(),
  },
}));

// ---------------------------------------------------------------------------
// Wire up registry to real jest.fn() instances
// ---------------------------------------------------------------------------

mockRegistry.generateMonthlyTransitReport = jest.fn();

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
    method: 'POST',
    path: '/api/v1/reports/monthly',
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

describe('Monthly Transit Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getMonthlyTransitReport', () => {
    it('should return 401 if user is not authenticated', async () => {
      const req = createMockRequest({ user: null });
      const res = createMockResponse();
      const next = jest.fn() as unknown as NextFunction;

      await getMonthlyTransitReport(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'Authentication required',
        }),
      );
    });

    it('should return 404 if user not found', async () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const next = jest.fn() as unknown as NextFunction;
      (UserModel.findById as jest.Mock).mockResolvedValue(null);

      await getMonthlyTransitReport(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 404,
          message: 'User not found',
        }),
      );
    });

    it('should return 403 if user is not premium', async () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const next = jest.fn() as unknown as NextFunction;
      (UserModel.findById as jest.Mock).mockResolvedValue({
        id: 'user-123',
        plan: 'free',
      });

      await getMonthlyTransitReport(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403,
          message: expect.stringContaining('Premium subscription'),
        }),
      );
    });

    it('should generate report for premium user', async () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const mockReport = {
        userId: 'user-123',
        month: '2024-01',
        dailyTransits: [
          { date: '2024-01-01', sun: { sign: 'Capricorn', degree: 10 } },
        ],
      };
      (UserModel.findById as jest.Mock).mockResolvedValue({
        id: 'user-123',
        plan: 'premium',
      });
      mockRegistry.generateMonthlyTransitReport.mockResolvedValue(mockReport);

      await getMonthlyTransitReport(req, res, jest.fn() as unknown as NextFunction);

      expect(UserModel.findById).toHaveBeenCalledWith('user-123');
      expect(mockRegistry.generateMonthlyTransitReport).toHaveBeenCalledWith('user-123', undefined);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockReport,
      });
    });

    it('should generate report with custom month', async () => {
      const req = createMockRequest({ body: { month: '2024-02' } });
      const res = createMockResponse();
      const mockReport = {
        userId: 'user-123',
        month: '2024-02',
        dailyTransits: [
          { date: '2024-02-01', sun: { sign: 'Aquarius', degree: 10 } },
        ],
      };
      (UserModel.findById as jest.Mock).mockResolvedValue({
        id: 'user-123',
        plan: 'premium',
      });
      mockRegistry.generateMonthlyTransitReport.mockResolvedValue(mockReport);

      await getMonthlyTransitReport(req, res, jest.fn() as unknown as NextFunction);

      expect(mockRegistry.generateMonthlyTransitReport).toHaveBeenCalledWith('user-123', '2024-02');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockReport,
      });
    });

    it('should call next on service error', async () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const next = jest.fn() as unknown as NextFunction;
      const serviceError = new AppError('Service unavailable', 503);
      (UserModel.findById as jest.Mock).mockResolvedValue({
        id: 'user-123',
        plan: 'premium',
      });
      mockRegistry.generateMonthlyTransitReport.mockRejectedValue(serviceError);

      await getMonthlyTransitReport(req, res, next);

      expect(next).toHaveBeenCalledWith(serviceError);
    });
  });
});
