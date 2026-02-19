/**
 * OpenAI Service Tests
 * Comprehensive test suite for AI-powered astrological interpretations
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

// Set test environment before importing anything
process.env.NODE_ENV = 'test';
process.env.OPENAI_API_KEY = 'test-api-key'; // Set a test API key

// Mock logger before any imports
const mockLogger = {
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};

jest.mock('../../utils/logger', () => ({
  default: mockLogger,
  __esModule: true,
}));

// Mock aiUsageService
const mockAiUsageService = {
  record: jest.fn().mockResolvedValue(undefined),
};

jest.mock('../../modules/ai/services/aiUsage.service', () => ({
  __esModule: true,
  default: mockAiUsageService,
}));

// Mock OpenAI module BEFORE importing service
const mockCreate = jest.fn();

const mockChat = {
  completions: {
    create: mockCreate,
  },
};

const mockOpenAIInstance = {
  chat: mockChat,
};

const MockOpenAI = jest.fn().mockImplementation(() => mockOpenAIInstance);

jest.mock('openai', () => ({
  __esModule: true,
  default: MockOpenAI,
}));

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import openaiService from '../../modules/ai/services/openai.service';

describe('OpenAI Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    openaiService.clearCache();
    // Default mock behavior
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: 'test response' } }],
      usage: {
        prompt_tokens: 100,
        completion_tokens: 50,
      },
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('generateNatalInterpretation', () => {
    const validChartData = {
      planets: [
        { planet: 'sun', sign: 'aries', degree: 15, house: 1 },
        { planet: 'moon', sign: 'taurus', degree: 10, house: 2 },
      ],
      houses: [{ house: 1, sign: 'aries', degree: 0 }],
      aspects: [{ planet1: 'sun', planet2: 'moon', type: 'conjunction', orb: 5 }],
      birthDate: '1990-04-15',
      birthTime: '10:30',
      birthPlace: 'New York, NY',
    };

    it.skip('should generate natal chart interpretation successfully', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                sunInAries: 'You are a natural leader...',
                moonInTaurus: 'You seek emotional stability...',
              }),
            },
          },
        ],
        usage: {
          prompt_tokens: 100,
          completion_tokens: 50,
        },
      };

      mockCreate.mockResolvedValueOnce(mockResponse);

      const result = await openaiService.generateNatalInterpretation(validChartData);

      expect(result.success).toBe(true);
      expect(result.interpretation).toBeDefined();
      expect(mockCreate).toHaveBeenCalledTimes(1);
    });

    it.skip('should handle markdown text responses', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: '# Natal Chart Interpretation\n\nYour Sun in Aries...',
            },
          },
        ],
        usage: {
          prompt_tokens: 100,
          completion_tokens: 50,
        },
      };

      mockCreate.mockResolvedValueOnce(mockResponse);

      const result = await openaiService.generateNatalInterpretation(validChartData);

      expect(result.success).toBe(true);
      expect(result.interpretation.text).toBeDefined();
      expect(result.interpretation.generated).toBe(true);
    });

    it.skip('should use cached interpretations on second call', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({ sunInAries: 'Test interpretation' }),
            },
          },
        ],
        usage: {
          prompt_tokens: 100,
          completion_tokens: 50,
        },
      };

      mockCreate.mockResolvedValueOnce(mockResponse);

      const result1 = await openaiService.generateNatalInterpretation(validChartData);
      const result2 = await openaiService.generateNatalInterpretation(validChartData);

      expect(result1.interpretation).toEqual(result2.interpretation);
      expect(result1.cached).toBe(false);
      expect(result2.cached).toBe(true);
      expect(mockCreate).toHaveBeenCalledTimes(1);
    });

    it('should validate input data', async () => {
      const invalidData = {
        planets: [],
      };

      const result = await openaiService.generateNatalInterpretation(invalidData as any);

      expect(result.success).toBe(false);
      expect(result.error).toContain('at least one planet');
    });

    it('should handle API errors gracefully', async () => {
      mockCreate.mockRejectedValueOnce(new Error('API Error'));

      const result = await openaiService.generateNatalInterpretation(validChartData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('generateTransitForecast', () => {
    const validTransitData = {
      currentTransits: [
        {
          planet: 'Jupiter',
          type: 'conjunction',
          natalPlanet: 'Sun',
          orb: 3,
          startDate: '2024-01-15',
          endDate: '2024-02-20',
          strength: 'strong' as const,
        },
      ],
      forecastStartDate: '2024-01-01',
      forecastEndDate: '2024-03-31',
    };

    it.skip('should generate transit forecast successfully', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                overallTheme: 'A period of expansion...',
                opportunities: ['Growth opportunities ahead...'],
              }),
            },
          },
        ],
        usage: {
          prompt_tokens: 100,
          completion_tokens: 50,
        },
      };

      mockCreate.mockResolvedValueOnce(mockResponse);

      const result = await openaiService.generateTransitForecast(validTransitData);

      expect(result.success).toBe(true);
      expect(result.interpretation).toBeDefined();
    });

    it('should validate transit input data', async () => {
      const invalidData = {
        currentTransits: [],
      };

      const result = await openaiService.generateTransitForecast(invalidData as any);

      expect(result.success).toBe(false);
      expect(result.error).toContain('at least one transit');
    });
  });

  describe('generateCompatibilityAnalysis', () => {
    const validSynastryData = {
      chartA: {
        planets: [{ planet: 'sun', sign: 'aries', degree: 15, house: 1 }],
      },
      chartB: {
        planets: [{ planet: 'sun', sign: 'libra', degree: 20, house: 7 }],
      },
    };

    it.skip('should generate compatibility analysis successfully', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                strengths: ['Your Suns create balance...'],
                challenges: ['Different emotional needs...'],
              }),
            },
          },
        ],
        usage: {
          prompt_tokens: 100,
          completion_tokens: 50,
        },
      };

      mockCreate.mockResolvedValueOnce(mockResponse);

      const result = await openaiService.generateCompatibilityAnalysis(validSynastryData);

      expect(result.success).toBe(true);
      expect(result.interpretation).toBeDefined();
    });

    it('should validate synastry input data', async () => {
      const invalidData = {
        chartA: null,
        chartB: null,
      };

      const result = await openaiService.generateCompatibilityAnalysis(invalidData as any);

      expect(result.success).toBe(false);
      expect(result.error).toContain('must include both charts');
    });
  });

  describe('generateLunarReturnInterpretation', () => {
    it.skip('should generate lunar return interpretation successfully', async () => {
      const chartData = {
        planets: [{ planet: 'sun', sign: 'cancer', degree: 10, house: 4 }],
      };

      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                emotionalTheme: 'A month of sensitivity...',
              }),
            },
          },
        ],
        usage: {
          prompt_tokens: 100,
          completion_tokens: 50,
        },
      };

      mockCreate.mockResolvedValueOnce(mockResponse);

      const result = await openaiService.generateLunarReturnInterpretation(chartData);

      expect(result.success).toBe(true);
      expect(result.interpretation).toBeDefined();
    });
  });

  describe('generateSolarReturnInterpretation', () => {
    it.skip('should generate solar return interpretation successfully', async () => {
      const chartData = {
        planets: [{ planet: 'sun', sign: 'leo', degree: 5, house: 5 }],
      };

      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                yearTheme: 'A year of creativity...',
              }),
            },
          },
        ],
        usage: {
          prompt_tokens: 100,
          completion_tokens: 50,
        },
      };

      mockCreate.mockResolvedValueOnce(mockResponse);

      const result = await openaiService.generateSolarReturnInterpretation(chartData);

      expect(result.success).toBe(true);
      expect(result.interpretation).toBeDefined();
    });
  });

  describe('Configuration Status', () => {
    it('should report configuration status', () => {
      const status = openaiService.getConfigStatus();

      expect(status).toHaveProperty('configured');
      expect(status).toHaveProperty('model');
      expect(status).toHaveProperty('maxTokens');
      expect(status).toHaveProperty('temperature');
    });

    it('should return usage stats placeholder', async () => {
      const stats = await openaiService.getUsageStats();

      expect(stats).toHaveProperty('available');
      expect(stats).toHaveProperty('usage');
    });
  });
});
