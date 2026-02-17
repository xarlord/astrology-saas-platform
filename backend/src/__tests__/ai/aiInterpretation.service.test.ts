/**
 * AI Interpretation Service Tests
 * Tests hybrid AI/rule-based interpretation service
 */

process.env.NODE_ENV = 'test';

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

// Mock the analysis module
const mockGenerateCompletePersonalityAnalysis = jest.fn();
jest.mock('../../modules/analysis/services/interpretation.service', () => ({
  generateCompletePersonalityAnalysis: mockGenerateCompletePersonalityAnalysis,
}));

import { describe, it, expect, beforeEach } from '@jest/globals';

describe('AI Interpretation Service - Basic Functionality', () => {
  let aiInterpretationService: any;
  let openaiService: any;
  let aiCacheService: any;

  beforeAll(() => {
    // Import after mocks are set up
    aiInterpretationService = require('../../modules/ai/services/aiInterpretation.service').default;
    openaiService = require('../../modules/ai/services/openai.service').default;
    aiCacheService = require('../../modules/ai/services/aiCache.service').default;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset all mocks
    mockGenerateCompletePersonalityAnalysis.mockReset();
  });

  describe('generateNatal', () => {
    it('should fallback to rule-based when AI is not configured', async () => {
      // Mock isConfigured to return false
      openaiService.isConfigured = jest.fn().mockReturnValue(false);

      const chartData = {
        planets: [
          { planet: 'sun', sign: 'aries', degree: 15, house: 1 },
        ],
      };

      const mockRuleBased = {
        overview: { sunSign: { sign: 'aries' } },
        planetsInSigns: [],
        houses: [],
        aspects: [],
        patterns: [],
      };

      mockGenerateCompletePersonalityAnalysis.mockReturnValue(mockRuleBased);

      const result = await aiInterpretationService.generateNatal(chartData);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('ai', false);
      expect(result).toHaveProperty('source', 'rule-based');
      expect(result).toHaveProperty('overview');
    });

    it('should return valid interpretation structure', async () => {
      openaiService.isConfigured = jest.fn().mockReturnValue(false);

      const chartData = {
        planets: [{ planet: 'sun', sign: 'aries', degree: 15, house: 1 }],
      };

      mockGenerateCompletePersonalityAnalysis.mockReturnValue({
        overview: {},
        planetsInSigns: [],
        houses: [],
        aspects: [],
        patterns: [],
      });

      const result = await aiInterpretationService.generateNatal(chartData);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('ai');
      expect(result).toHaveProperty('source');
    });
  });

  describe('generateTransit', () => {
    it('should fallback to rule-based when AI unavailable for transits', async () => {
      openaiService.isConfigured = jest.fn().mockReturnValue(false);

      const transitData = {
        currentTransits: [
          { planet: 'jupiter', type: 'trine', natalPlanet: 'sun' },
        ],
      };

      const result = await aiInterpretationService.generateTransit(transitData);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('ai', false);
      expect(result).toHaveProperty('source', 'rule-based');
      expect(result).toHaveProperty('forecast');
    });
  });

  describe('generateCompatibility', () => {
    it('should fallback when AI unavailable for compatibility', async () => {
      openaiService.isConfigured = jest.fn().mockReturnValue(false);

      const synastryData = {
        chartA: { planets: [] },
        chartB: { planets: [] },
      };

      const result = await aiInterpretationService.generateCompatibility(synastryData);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('ai', false);
      expect(result).toHaveProperty('compatibility', 50);
      expect(result).toHaveProperty('analysis');
    });
  });

  describe('batchGenerateNatal', () => {
    it('should handle batch processing', async () => {
      openaiService.isConfigured = jest.fn().mockReturnValue(false);

      const charts = [
        { planets: [{ planet: 'sun', sign: 'aries', degree: 15, house: 1 }] },
        { planets: [{ planet: 'sun', sign: 'taurus', degree: 20, house: 2 }] },
      ];

      mockGenerateCompletePersonalityAnalysis.mockReturnValue({
        overview: {},
        planetsInSigns: [],
        houses: [],
        aspects: [],
        patterns: [],
      });

      const results = await aiInterpretationService.batchGenerateNatal(charts);

      expect(results).toHaveLength(2);
      expect(results[0]).toHaveProperty('chartIndex', 0);
      expect(results[0]).toHaveProperty('success');
      expect(results[1]).toHaveProperty('chartIndex', 1);
      expect(results[1]).toHaveProperty('success');
    });
  });

  describe('service status', () => {
    it('should return service status', () => {
      const status = aiInterpretationService.getStatus();

      expect(status).toBeDefined();
      expect(status).toHaveProperty('aiConfigured');
      expect(status).toHaveProperty('cacheEnabled');
      expect(status).toHaveProperty('fallbackAvailable');
    });

    it('should check if AI is configured', () => {
      openaiService.isConfigured = jest.fn().mockReturnValue(true);

      const isConfigured = aiInterpretationService.isAIConfigured();

      expect(typeof isConfigured).toBe('boolean');
    });
  });

  describe('cache management', () => {
    it('should expose clearCache method', async () => {
      aiCacheService.clear = jest.fn().mockResolvedValue(undefined);

      await aiInterpretationService.clearCache();

      expect(aiCacheService.clear).toHaveBeenCalled();
    });
  });
});
