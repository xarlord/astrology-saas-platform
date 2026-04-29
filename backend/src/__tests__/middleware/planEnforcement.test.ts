/**
 * Unit Tests for Plan Enforcement Middleware
 * Tests chart creation limits and AI interpretation limits per subscription tier
 */

import { Response, NextFunction } from 'express';
import { enforceChartLimit, enforceAILimit } from '../../middleware/planEnforcement';
import { AppError } from '../../utils/appError';

// Mock dependencies
jest.mock('../../modules/users/models/user.model', () => ({
  __esModule: true,
  default: {
    findById: jest.fn(),
  },
}));

jest.mock('../../modules/charts/models', () => ({
  ChartModel: {
    countByUserId: jest.fn(),
  },
}));

jest.mock('../../modules/ai/models/aiUsage.model', () => ({
  __esModule: true,
  default: {
    getByDateRange: jest.fn(),
  },
}));

import UserModel from '../../modules/users/models/user.model';
import { ChartModel } from '../../modules/charts/models';
import aiUsageModel from '../../modules/ai/models/aiUsage.model';

const mockRequest = (userId?: string) =>
  ({
    user: userId ? { id: userId, email: 'test@example.com' } : undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any;

const mockResponse = () =>
  ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  }) as unknown as Response;

const mockNext = jest.fn() as NextFunction;

describe('Plan Enforcement Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('enforceChartLimit', () => {
    it('should call next() for free user under chart limit', async () => {
      (UserModel.findById as jest.Mock).mockResolvedValue({
        id: 'user-1',
        plan: 'free',
      });
      (ChartModel.countByUserId as jest.Mock).mockResolvedValue(2);

      const req = mockRequest('user-1');
      const res = mockResponse();

      await enforceChartLimit(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should reject free user at chart limit (3 charts)', async () => {
      (UserModel.findById as jest.Mock).mockResolvedValue({
        id: 'user-1',
        plan: 'free',
      });
      (ChartModel.countByUserId as jest.Mock).mockResolvedValue(3);

      const req = mockRequest('user-1');
      const res = mockResponse();

      await enforceChartLimit(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      const err = (mockNext as jest.Mock).mock.calls[0][0];
      expect(err.statusCode).toBe(403);
      expect(err.message).toContain('Chart limit reached');
    });

    it('should allow pro user with under 25 charts', async () => {
      (UserModel.findById as jest.Mock).mockResolvedValue({
        id: 'user-1',
        plan: 'pro',
      });
      (ChartModel.countByUserId as jest.Mock).mockResolvedValue(24);

      const req = mockRequest('user-1');
      const res = mockResponse();

      await enforceChartLimit(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should reject pro user at 25 charts', async () => {
      (UserModel.findById as jest.Mock).mockResolvedValue({
        id: 'user-1',
        plan: 'pro',
      });
      (ChartModel.countByUserId as jest.Mock).mockResolvedValue(25);

      const req = mockRequest('user-1');
      const res = mockResponse();

      await enforceChartLimit(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      const err = (mockNext as jest.Mock).mock.calls[0][0];
      expect(err.statusCode).toBe(403);
      expect(err.message).toContain('25');
    });

    it('should allow premium user regardless of chart count', async () => {
      (UserModel.findById as jest.Mock).mockResolvedValue({
        id: 'user-1',
        plan: 'premium',
      });

      const req = mockRequest('user-1');
      const res = mockResponse();

      await enforceChartLimit(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      // Should not even check chart count for premium
      expect(ChartModel.countByUserId).not.toHaveBeenCalled();
    });

    it('should return 401 when user is not authenticated', async () => {
      const req = mockRequest();
      const res = mockResponse();

      await enforceChartLimit(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      const err = (mockNext as jest.Mock).mock.calls[0][0];
      expect(err.statusCode).toBe(401);
    });

    it('should return 404 when user not found', async () => {
      (UserModel.findById as jest.Mock).mockResolvedValue(null);

      const req = mockRequest('nonexistent');
      const res = mockResponse();

      await enforceChartLimit(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      const err = (mockNext as jest.Mock).mock.calls[0][0];
      expect(err.statusCode).toBe(404);
    });
  });

  describe('enforceAILimit', () => {
    it('should call next() for free user under AI limit', async () => {
      (UserModel.findById as jest.Mock).mockResolvedValue({
        id: 'user-1',
        plan: 'free',
      });
      (aiUsageModel.getByDateRange as jest.Mock).mockResolvedValue([{}, {}, {}]); // 3 uses

      const req = mockRequest('user-1');
      const res = mockResponse();

      await enforceAILimit(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should reject free user at AI limit (5/month)', async () => {
      (UserModel.findById as jest.Mock).mockResolvedValue({
        id: 'user-1',
        plan: 'free',
      });
      (aiUsageModel.getByDateRange as jest.Mock).mockResolvedValue([{}, {}, {}, {}, {}]); // 5 uses

      const req = mockRequest('user-1');
      const res = mockResponse();

      await enforceAILimit(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      const err = (mockNext as jest.Mock).mock.calls[0][0];
      expect(err.statusCode).toBe(403);
      expect(err.message).toContain('AI interpretation limit');
    });

    it('should allow pro user without limit check (unlimited)', async () => {
      (UserModel.findById as jest.Mock).mockResolvedValue({
        id: 'user-1',
        plan: 'pro',
      });

      const req = mockRequest('user-1');
      const res = mockResponse();

      await enforceAILimit(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(aiUsageModel.getByDateRange).not.toHaveBeenCalled();
    });

    it('should allow premium user without limit check (unlimited)', async () => {
      (UserModel.findById as jest.Mock).mockResolvedValue({
        id: 'user-1',
        plan: 'premium',
      });

      const req = mockRequest('user-1');
      const res = mockResponse();

      await enforceAILimit(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(aiUsageModel.getByDateRange).not.toHaveBeenCalled();
    });

    it('should return 401 when user is not authenticated', async () => {
      const req = mockRequest();
      const res = mockResponse();

      await enforceAILimit(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      const err = (mockNext as jest.Mock).mock.calls[0][0];
      expect(err.statusCode).toBe(401);
    });
  });
});
