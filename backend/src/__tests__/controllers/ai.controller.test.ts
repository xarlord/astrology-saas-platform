/**
 * Unit Tests for AI Controller
 * Tests AI-powered interpretation endpoints (natal, transit, compatibility, lunar return, solar return)
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { Response } from 'express';
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
import aiInterpretationService from '../../modules/ai/services/aiInterpretation.service';
import openaiService from '../../modules/ai/services/openai.service';

// ---------------------------------------------------------------------------
// Test utilities
// ---------------------------------------------------------------------------

interface MockResponse {
  status: jest.Mock;
  json: jest.Mock;
  statusCode?: number;
  body?: any;
}

function createMockResponse(): MockResponse {
  const res: MockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return res;
}

function createAuthenticatedRequest(overrides: Record<string, unknown> = {}) {
  return {
    user: { id: 'user-123', email: 'test@example.com' },
    validated: overrides.validated,
    ...overrides,
  };
}

function createUnauthenticatedRequest(overrides: Record<string, unknown> = {}) {
  return {
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('AI Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateNatal', () => {
    it('should generate natal interpretation successfully', async () => {
      const chartData = {
        planets: [
          { name: 'Sun', sign: 'Leo', degree: 15, house: 5 },
          { name: 'Moon', sign: 'Pisces', degree: 10, house: 12 },
        ],
        houses: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      };

      const mockInterpretation = {
        coreIdentity: 'You are a creative leader...',
        emotionalNature: 'You feel deeply...',
        mentalStyle: 'You think intuitively...',
      };

      (aiInterpretationService.generateNatal as jest.Mock).mockResolvedValue(mockInterpretation);

      const req = createAuthenticatedRequest({ validated: chartData });
      const res = createMockResponse();

      await generateNatal(req as any, res as unknown as Response);

      expect(aiInterpretationService.generateNatal).toHaveBeenCalledWith(chartData);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockInterpretation,
      });
    });

    it('should throw error if chart data is missing planets', async () => {
      const req = createAuthenticatedRequest({ validated: {} });
      const res = createMockResponse();

      await expect(generateNatal(req as any, res as unknown as Response)).rejects.toThrow(
        'Chart data must include at least one planet position',
      );
    });

    it('should throw error if planets array is empty', async () => {
      const req = createAuthenticatedRequest({ validated: { planets: [] } });
      const res = createMockResponse();

      await expect(generateNatal(req as any, res as unknown as Response)).rejects.toThrow(
        'Chart data must include at least one planet position',
      );
    });

    it('should handle service errors', async () => {
      const chartData = { planets: [{ name: 'Sun', sign: 'Leo', degree: 15 }] };

      (aiInterpretationService.generateNatal as jest.Mock).mockRejectedValue(
        new Error('OpenAI API error'),
      );

      const req = createAuthenticatedRequest({ validated: chartData });
      const res = createMockResponse();

      await expect(generateNatal(req as any, res as unknown as Response)).rejects.toThrow(
        'OpenAI API error',
      );
    });
  });

  describe('generateTransit', () => {
    it('should generate transit interpretation successfully', async () => {
      const transitData = {
        currentTransits: [
          { planet: 'Jupiter', type: 'trine', aspect: 'Sun' },
          { planet: 'Saturn', type: 'square', aspect: 'Moon' },
        ],
      };

      const mockInterpretation = {
        forecast: 'A period of growth and challenge...',
        keyThemes: ['expansion', 'discipline'],
      };

      (aiInterpretationService.generateTransit as jest.Mock).mockResolvedValue(mockInterpretation);

      const req = createAuthenticatedRequest({ validated: transitData });
      const res = createMockResponse();

      await generateTransit(req as any, res as unknown as Response);

      expect(aiInterpretationService.generateTransit).toHaveBeenCalledWith(transitData);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockInterpretation,
      });
    });

    it('should throw error if transit data is missing transits', async () => {
      const req = createAuthenticatedRequest({ validated: {} });
      const res = createMockResponse();

      await expect(generateTransit(req as any, res as unknown as Response)).rejects.toThrow(
        'Transit data must include at least one transit event',
      );
    });

    it('should throw error if transits array is empty', async () => {
      const req = createAuthenticatedRequest({ validated: { currentTransits: [] } });
      const res = createMockResponse();

      await expect(generateTransit(req as any, res as unknown as Response)).rejects.toThrow(
        'Transit data must include at least one transit event',
      );
    });
  });

  describe('generateCompatibility', () => {
    it('should generate compatibility analysis successfully', async () => {
      const synastryData = {
        chartA: {
          planets: [{ name: 'Sun', sign: 'Leo', degree: 15 }],
        },
        chartB: {
          planets: [{ name: 'Sun', sign: 'Aquarius', degree: 15 }],
        },
      };

      const mockAnalysis = {
        compatibility: 'Challenging but transformative...',
        strengths: ['growth opportunity', 'balance'],
        challenges: ['tension', 'different approaches'],
      };

      (aiInterpretationService.generateCompatibility as jest.Mock).mockResolvedValue(mockAnalysis);

      const req = createAuthenticatedRequest({ validated: synastryData });
      const res = createMockResponse();

      await generateCompatibility(req as any, res as unknown as Response);

      expect(aiInterpretationService.generateCompatibility).toHaveBeenCalledWith(synastryData);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockAnalysis,
      });
    });

    it('should throw error if chartA is missing', async () => {
      const req = createAuthenticatedRequest({ validated: {} });
      const res = createMockResponse();

      await expect(generateCompatibility(req as any, res as unknown as Response)).rejects.toThrow(
        'Both chartA and chartB are required for compatibility analysis',
      );
    });

    it('should throw error if chartB is missing', async () => {
      const req = createAuthenticatedRequest({ validated: { chartA: { planets: [] } } });
      const res = createMockResponse();

      await expect(generateCompatibility(req as any, res as unknown as Response)).rejects.toThrow(
        'Both chartA and chartB are required for compatibility analysis',
      );
    });

    it('should throw error if chartA has no planets', async () => {
      const req = createAuthenticatedRequest({
        validated: {
          chartA: { planets: [] },
          chartB: { planets: [{ name: 'Sun', sign: 'Leo', degree: 15 }] },
        },
      });
      const res = createMockResponse();

      await expect(generateCompatibility(req as any, res as unknown as Response)).rejects.toThrow(
        'chartA must include at least one planet position',
      );
    });

    it('should throw error if chartB has no planets', async () => {
      const req = createAuthenticatedRequest({
        validated: {
          chartA: { planets: [{ name: 'Sun', sign: 'Leo', degree: 15 }] },
          chartB: { planets: [] },
        },
      });
      const res = createMockResponse();

      await expect(generateCompatibility(req as any, res as unknown as Response)).rejects.toThrow(
        'chartB must include at least one planet position',
      );
    });
  });

  describe('generateLunarReturn', () => {
    it('should generate lunar return interpretation successfully', async () => {
      const chartData = {
        planets: [{ name: 'Moon', sign: 'Cancer', degree: 15 }],
        houses: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      };

      const mockInterpretation = {
        emotionalForecast: 'A month of emotional introspection...',
        keyThemes: ['home', 'family', 'intuition'],
      };

      (aiInterpretationService.generateLunarReturn as jest.Mock).mockResolvedValue(mockInterpretation);

      const req = createAuthenticatedRequest({ validated: chartData });
      const res = createMockResponse();

      await generateLunarReturn(req as any, res as unknown as Response);

      expect(aiInterpretationService.generateLunarReturn).toHaveBeenCalledWith(chartData);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockInterpretation,
      });
    });

    it('should throw error if chart data is missing planets', async () => {
      const req = createAuthenticatedRequest({ validated: {} });
      const res = createMockResponse();

      await expect(generateLunarReturn(req as any, res as unknown as Response)).rejects.toThrow(
        'Chart data must include at least one planet position',
      );
    });
  });

  describe('generateSolarReturn', () => {
    it('should generate solar return interpretation successfully', async () => {
      const chartData = {
        planets: [{ name: 'Sun', sign: 'Leo', degree: 15 }],
        houses: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      };

      const mockInterpretation = {
        yearlyForecast: 'A year of creative expression...',
        keyThemes: ['leadership', 'creativity', 'self-expression'],
      };

      (aiInterpretationService.generateSolarReturn as jest.Mock).mockResolvedValue(mockInterpretation);

      const req = createAuthenticatedRequest({ validated: chartData });
      const res = createMockResponse();

      await generateSolarReturn(req as any, res as unknown as Response);

      expect(aiInterpretationService.generateSolarReturn).toHaveBeenCalledWith(chartData);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockInterpretation,
      });
    });

    it('should throw error if chart data is missing planets', async () => {
      const req = createAuthenticatedRequest({ validated: {} });
      const res = createMockResponse();

      await expect(generateSolarReturn(req as any, res as unknown as Response)).rejects.toThrow(
        'Chart data must include at least one planet position',
      );
    });
  });

  describe('checkStatus', () => {
    it('should return AI service status when configured', async () => {
      (openaiService.isConfigured as jest.Mock).mockReturnValue(true);
      (openaiService.getConfigStatus as jest.Mock).mockReturnValue({
        apiKeyConfigured: true,
        model: 'gpt-4',
      });

      const req = createUnauthenticatedRequest();
      const res = createMockResponse();

      await checkStatus(req as any, res as unknown as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          available: true,
          service: 'openai',
          apiKeyConfigured: true,
          model: 'gpt-4',
        },
      });
    });

    it('should return unavailable status when not configured', async () => {
      (openaiService.isConfigured as jest.Mock).mockReturnValue(false);
      (openaiService.getConfigStatus as jest.Mock).mockReturnValue({
        apiKeyConfigured: false,
        model: null,
      });

      const req = createUnauthenticatedRequest();
      const res = createMockResponse();

      await checkStatus(req as any, res as unknown as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          available: false,
          service: null,
          apiKeyConfigured: false,
          model: null,
        },
      });
    });
  });

  describe('getUsageStats', () => {
    it('should return AI usage statistics', async () => {
      const mockStats = {
        totalRequests: 1234,
        totalTokens: 1234567,
        requestsThisMonth: 56,
        tokensThisMonth: 7890,
      };

      (openaiService.getUsageStats as jest.Mock).mockResolvedValue(mockStats);

      const req = createUnauthenticatedRequest();
      const res = createMockResponse();

      await getUsageStats(req as any, res as unknown as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockStats,
      });
    });
  });

  describe('clearCache', () => {
    it('should clear AI interpretation cache successfully', async () => {
      (aiInterpretationService.clearCache as jest.Mock).mockResolvedValue(undefined);

      const req = createAuthenticatedRequest();
      const res = createMockResponse();

      await clearCache(req as any, res as unknown as Response);

      expect(aiInterpretationService.clearCache).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Cache cleared successfully',
      });
    });
  });
});
