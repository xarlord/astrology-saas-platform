/**
 * Unit Tests for Lunar Return Controller
 * Tests the getCurrentLunarReturn endpoint specifically
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import { Response } from 'express';
import { getCurrentLunarReturn } from '../../modules/lunar/controllers/lunarReturn.controller';

// ---------------------------------------------------------------------------
// Mock setup
// ---------------------------------------------------------------------------

const mockServiceGetCurrent = jest.fn();
jest.mock('../../modules/lunar/services/lunarReturn.service', () => ({
  calculateNextLunarReturn: jest.fn(),
  calculateLunarReturnChart: jest.fn(),
  generateLunarMonthForecast: jest.fn(),
  getCurrentLunarReturn: (...args: any[]) => mockServiceGetCurrent(...args),
}));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Lunar Return Controller', () => {
  let mockRequest: Partial<any>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

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

  describe('getCurrentLunarReturn', () => {
    it('should return current lunar return data for authenticated user', async () => {
      const mockResult = {
        returnDate: new Date('2024-06-15'),
        daysUntil: 42,
      };
      mockServiceGetCurrent.mockResolvedValue(mockResult);

      await getCurrentLunarReturn(mockRequest, mockResponse as Response, mockNext);

      expect(mockServiceGetCurrent).toHaveBeenCalledWith('user-123');
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
      });
    });

    it('should return 401 if user is not authenticated', async () => {
      mockRequest.user = undefined;

      await getCurrentLunarReturn(mockRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Unauthorized',
      });
      expect(mockServiceGetCurrent).not.toHaveBeenCalled();
    });

    it('should call next on service error', async () => {
      const error = new Error('Service failure');
      mockServiceGetCurrent.mockRejectedValue(error);

      await getCurrentLunarReturn(mockRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
