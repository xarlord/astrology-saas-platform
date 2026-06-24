/**
 * Monthly Transit Controller Unit Tests
 * Tests getMonthlyTransitReport and getCurrentMonthlyReport functions.
 *
 * Controllers follow the project convention: standalone async functions
 * (req, res) that throw AppError on failure (caught by global errorHandler).
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

import { Response } from 'express';
import { getMonthlyTransitReport, getCurrentMonthlyReport } from '../../modules/reports/controllers/monthlyTransit.controller';
import { AppError, UnauthorizedError, NotFoundError, ForbiddenError } from '../../utils/appError';
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
    it('should throw UnauthorizedError (401) if user is not authenticated', async () => {
      const req = createMockRequest({ user: null });
      const res = createMockResponse();

      await expect(getMonthlyTransitReport(req, res)).rejects.toThrow(UnauthorizedError);
      await expect(getMonthlyTransitReport(req, res)).rejects.toMatchObject({
        statusCode: 401,
        message: 'Authentication required',
      });
    });

    it('should throw NotFoundError (404) if user not found', async () => {
      const req = createMockRequest();
      const res = createMockResponse();
      (UserModel.findById as jest.Mock).mockResolvedValue(null);

      await expect(getMonthlyTransitReport(req, res)).rejects.toThrow(NotFoundError);
      await expect(getMonthlyTransitReport(req, res)).rejects.toMatchObject({
        statusCode: 404,
        message: 'User not found',
      });
    });

    it('should throw ForbiddenError (403) if user is not premium', async () => {
      const req = createMockRequest();
      const res = createMockResponse();
      (UserModel.findById as jest.Mock).mockResolvedValue({
        id: 'user-123',
        plan: 'free',
      });

      await expect(getMonthlyTransitReport(req, res)).rejects.toThrow(ForbiddenError);
      await expect(getMonthlyTransitReport(req, res)).rejects.toMatchObject({
        statusCode: 403,
        message: expect.stringContaining('Premium subscription'),
      });
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

      await getMonthlyTransitReport(req, res);

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

      await getMonthlyTransitReport(req, res);

      expect(mockRegistry.generateMonthlyTransitReport).toHaveBeenCalledWith('user-123', '2024-02');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockReport,
      });
    });

    it('should propagate service errors (no try/catch swallowing)', async () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const serviceError = new AppError('Service unavailable', 503);
      (UserModel.findById as jest.Mock).mockResolvedValue({
        id: 'user-123',
        plan: 'premium',
      });
      mockRegistry.generateMonthlyTransitReport.mockRejectedValue(serviceError);

      // Controller should propagate the error directly (global errorHandler catches it)
      await expect(getMonthlyTransitReport(req, res)).rejects.toBe(serviceError);
    });
  });

  describe('getCurrentMonthlyReport', () => {
    it('should throw UnauthorizedError (401) if user is not authenticated', async () => {
      const req = createMockRequest({ user: null, method: 'GET', path: '/api/v1/reports/monthly/current' });
      const res = createMockResponse();

      await expect(getCurrentMonthlyReport(req, res)).rejects.toThrow(UnauthorizedError);
    });

    it('should generate current month report for premium user', async () => {
      const req = createMockRequest({ method: 'GET', path: '/api/v1/reports/monthly/current' });
      const res = createMockResponse();
      const mockReport = {
        userId: 'user-123',
        month: '2024-03',
        dailyTransits: [],
      };
      (UserModel.findById as jest.Mock).mockResolvedValue({
        id: 'user-123',
        plan: 'premium',
      });
      mockRegistry.generateMonthlyTransitReport.mockResolvedValue(mockReport);

      await getCurrentMonthlyReport(req, res);

      // Current month endpoint calls service with only userId (no month)
      expect(mockRegistry.generateMonthlyTransitReport).toHaveBeenCalledWith('user-123');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockReport,
      });
    });
  });
});
