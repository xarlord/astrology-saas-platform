/**
 * Unit Tests for AI Controller
 * Tests AI controller functions with mocked dependencies
 */

import { Request, Response } from 'express';
import {
  generateNatal,
  generateTransit,
  generateCompatibility,
  generateLunarReturn,
  generateSolarReturn,
  checkStatus,
  getUsageStats,
  clearCache,
} from '../../modules/ai/controllers/ai.controller';

// Mock the AI services
jest.mock('../../modules/ai/services/aiInterpretation.service');
jest.mock('../../modules/ai/services/openai.service');
jest.mock('../../utils/logger');

import aiInterpretationService from '../../modules/ai/services/aiInterpretation.service';
import openaiService from '../../modules/ai/services/openai.service';

describe('AI Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseObject: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup mock response
    responseObject = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };

    mockResponse = responseObject as Response;

    // Setup mock request with user
    mockRequest = {
      user: { userId: 1, email: 'test@example.com' },
      body: {},
    };
  });

  describe('generateNatal', () => {
    it('should generate AI natal interpretation successfully', async () => {
      const chartData = {
        planets: [
          { planet: 'sun', sign: 'aries', degree: 15, house: 1 },
        ],
      };

      mockRequest.body = chartData;

      const mockInterpretation = {
        ai: true,
        source: 'ai-enhanced',
        overview: { text: 'Test interpretation' },
        planetsInSigns: [],
        houses: [],
        aspects: [],
        patterns: [],
      };

      (aiInterpretationService.generateNatal as jest.Mock).mockResolvedValue(mockInterpretation);

      await generateNatal(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockInterpretation,
      });

      expect(aiInterpretationService.generateNatal).toHaveBeenCalledWith(chartData);
    });

    it('should return 400 when planets are missing', async () => {
      mockRequest.body = {};

      await expect(
        generateNatal(mockRequest as Request, mockResponse as Response)
      ).rejects.toThrow();

      expect(aiInterpretationService.generateNatal).not.toHaveBeenCalled();
    });
  });

  describe('generateTransit', () => {
    it('should generate AI transit forecast successfully', async () => {
      const transitData = {
        currentTransits: [
          {
            planet: 'Jupiter',
            type: 'conjunction',
            natalPlanet: 'Sun',
            orb: 3,
            startDate: '2024-01-15',
            endDate: '2024-02-20',
          },
        ],
      };

      mockRequest.body = transitData;

      const mockForecast = {
        ai: true,
        forecast: 'Test forecast',
      };

      (aiInterpretationService.generateTransit as jest.Mock).mockResolvedValue(mockForecast);

      await generateTransit(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockForecast,
      });

      expect(aiInterpretationService.generateTransit).toHaveBeenCalledWith(transitData);
    });

    it('should return 400 when transits are missing', async () => {
      mockRequest.body = {};

      await expect(
        generateTransit(mockRequest as Request, mockResponse as Response)
      ).rejects.toThrow();

      expect(aiInterpretationService.generateTransit).not.toHaveBeenCalled();
    });
  });

  describe('generateCompatibility', () => {
    it('should generate AI compatibility analysis successfully', async () => {
      const synastryData = {
        chartA: {
          planets: [{ planet: 'sun', sign: 'aries', degree: 15, house: 1 }],
        },
        chartB: {
          planets: [{ planet: 'sun', sign: 'libra', degree: 10, house: 7 }],
        },
      };

      mockRequest.body = synastryData;

      const mockAnalysis = {
        ai: true,
        compatibility: 85,
        analysis: 'Strong compatibility',
      };

      (aiInterpretationService.generateCompatibility as jest.Mock).mockResolvedValue(mockAnalysis);

      await generateCompatibility(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockAnalysis,
      });

      expect(aiInterpretationService.generateCompatibility).toHaveBeenCalledWith(synastryData);
    });

    it('should return 400 when chartA is missing', async () => {
      mockRequest.body = {
        chartB: { planets: [{ planet: 'sun', sign: 'aries', degree: 15, house: 1 }] },
      };

      await expect(
        generateCompatibility(mockRequest as Request, mockResponse as Response)
      ).rejects.toThrow();
    });

    it('should return 400 when chartB is missing', async () => {
      mockRequest.body = {
        chartA: { planets: [{ planet: 'sun', sign: 'aries', degree: 15, house: 1 }] },
      };

      await expect(
        generateCompatibility(mockRequest as Request, mockResponse as Response)
      ).rejects.toThrow();
    });
  });

  describe('generateLunarReturn', () => {
    it('should generate AI lunar return interpretation successfully', async () => {
      const chartData = {
        planets: [
          { planet: 'moon', sign: 'cancer', degree: 15, house: 4 },
        ],
      };

      mockRequest.body = chartData;

      const mockInterpretation = {
        ai: true,
        interpretation: 'Monthly forecast',
      };

      (aiInterpretationService.generateLunarReturn as jest.Mock).mockResolvedValue(mockInterpretation);

      await generateLunarReturn(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockInterpretation,
      });

      expect(aiInterpretationService.generateLunarReturn).toHaveBeenCalledWith(chartData);
    });

    it('should return 400 when planets are missing', async () => {
      mockRequest.body = {};

      await expect(
        generateLunarReturn(mockRequest as Request, mockResponse as Response)
      ).rejects.toThrow();
    });
  });

  describe('generateSolarReturn', () => {
    it('should generate AI solar return interpretation successfully', async () => {
      const chartData = {
        planets: [
          { planet: 'sun', sign: 'aries', degree: 15, house: 1 },
        ],
      };

      mockRequest.body = chartData;

      const mockInterpretation = {
        ai: true,
        interpretation: 'Yearly forecast',
      };

      (aiInterpretationService.generateSolarReturn as jest.Mock).mockResolvedValue(mockInterpretation);

      await generateSolarReturn(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockInterpretation,
      });

      expect(aiInterpretationService.generateSolarReturn).toHaveBeenCalledWith(chartData);
    });

    it('should return 400 when planets are missing', async () => {
      mockRequest.body = {};

      await expect(
        generateSolarReturn(mockRequest as Request, mockResponse as Response)
      ).rejects.toThrow();
    });
  });

  describe('checkStatus', () => {
    it('should return AI service status', async () => {
      const mockStatus = {
        configured: true,
        model: 'gpt-4-turbo',
        maxTokens: 2000,
        temperature: 0.7,
      };

      (openaiService.isConfigured as jest.Mock).mockReturnValue(true);
      (openaiService.getConfigStatus as jest.Mock).mockReturnValue(mockStatus);

      await checkStatus(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          available: true,
          service: 'openai',
          ...mockStatus,
        },
      });

      expect(openaiService.isConfigured).toHaveBeenCalled();
      expect(openaiService.getConfigStatus).toHaveBeenCalled();
    });

    it('should return unavailable when not configured', async () => {
      (openaiService.isConfigured as jest.Mock).mockReturnValue(false);
      (openaiService.getConfigStatus as jest.Mock).mockReturnValue({
        configured: false,
        model: 'gpt-4-turbo',
        maxTokens: 2000,
        temperature: 0.7,
      });

      await checkStatus(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          available: false,
          service: null,
          configured: false,
          model: 'gpt-4-turbo',
          maxTokens: 2000,
          temperature: 0.7,
        },
      });
    });
  });

  describe('getUsageStats', () => {
    it('should return AI usage statistics', async () => {
      const mockStats = {
        available: true,
        usage: {
          totalRequests: 100,
          totalTokens: 50000,
          totalCost: 0.5,
        },
      };

      (openaiService.getUsageStats as jest.Mock).mockResolvedValue(mockStats);

      await getUsageStats(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockStats,
      });

      expect(openaiService.getUsageStats).toHaveBeenCalled();
    });
  });

  describe('clearCache', () => {
    it('should clear AI interpretation cache', async () => {
      (aiInterpretationService.clearCache as jest.Mock).mockResolvedValue(undefined);

      await clearCache(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Cache cleared successfully',
      });

      expect(aiInterpretationService.clearCache).toHaveBeenCalled();
    });
  });
});
