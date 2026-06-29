/**
 * AI Controller Unit Tests
 *
 * Tests the actual exported functions from ai.controller.ts:
 *   generateNatal, generateTransit, generateCompatibility,
 *   generateLunarReturn, generateSolarReturn, checkStatus,
 *   getUsageStats, clearCache
 *
 * ai.controller exports plain async functions with signature
 * (req: AuthenticatedRequest, res: Response) => Promise<void>.
 * They throw AppError for validation errors and call res.json() on success.
 * In production the route layer wraps them in asyncHandler(); here we call
 * them directly and assert the thrown rejection / res.json response.
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import type { Response } from 'express';
import { AppError } from '../../utils/appError';
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

// ---------------------------------------------------------------------------
// Mocks — both services export class instances via `export default new Cls()`.
// jest.mock() factories are hoisted above const declarations, so we use a
// mutable registry and delegate to it lazily (per the repo's mock-hoisting
// gotcha documented in CLAUDE.md).
// ---------------------------------------------------------------------------

const mockInterpretation: Record<string, jest.Mock> = {};

jest.mock('../../modules/ai/services/aiInterpretation.service', () => ({
  __esModule: true,
  default: new Proxy(
    {},
    {
      get: (_t, prop) => mockInterpretation[prop as string],
    },
  ),
}));

const mockOpenai: Record<string, jest.Mock> = {};

jest.mock('../../modules/ai/services/openai.service', () => ({
  __esModule: true,
  default: new Proxy(
    {},
    {
      get: (_t, prop) => mockOpenai[prop as string],
    },
  ),
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
// Fixtures
// ---------------------------------------------------------------------------

const mockUser = { id: 'user-123', email: 'test@example.com' };

const chartData = {
  planets: [
    { name: 'Sun', sign: 'Leo', degree: 15.5, house: 5 },
    { name: 'Moon', sign: 'Cancer', degree: 10.2, house: 4 },
  ],
  houses: [{ number: 1, sign: 'Aries', cusp: 0 }],
  aspects: [{ planet1: 'Sun', planet2: 'Moon', type: 'trine', degree: 120 }],
};

const transitData = {
  natalChart: chartData,
  currentTransits: [
    { planet: 'Jupiter', sign: 'Taurus', degree: 5.5, aspect: 'conjunction', natalPlanet: 'Sun' },
  ],
  startDate: '2026-06-29',
  endDate: '2026-07-29',
};

// controller destructures chartA/chartB from validated payload
const synastryData = {
  chartA: chartData,
  chartB: { ...chartData, planets: [{ name: 'Sun', sign: 'Scorpio', degree: 1, house: 1 }] },
};

const interpretationResult = {
  interpretation: 'You are a confident and creative person...',
  keyThemes: ['Leadership', 'Creativity'],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildRes() {
  const res: any = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res as Response;
}

function buildReq(overrides: any = {}): any {
  return {
    user: mockUser,
    validated: undefined,
    method: 'POST',
    path: '/api/v1/ai/natal',
    ...overrides,
  };
}

describe('AI Controller', () => {
  let res: Response;

  beforeEach(() => {
    jest.clearAllMocks();
    res = buildRes();

    // Populate the mock registries with fresh jest.fn() instances.
    // These are created here (after jest.mock hoisting) and assigned onto the
    // shared registry objects that the module-level Proxies delegate to.
    for (const m of [
      'generateNatal',
      'generateTransit',
      'generateCompatibility',
      'generateLunarReturn',
      'generateSolarReturn',
      'clearCache',
    ]) {
      mockInterpretation[m] = jest.fn();
    }
    for (const m of ['isConfigured', 'getConfigStatus', 'getUsageStats']) {
      mockOpenai[m] = jest.fn();
    }
  });

  // -------------------------------------------------------------------------
  describe('generateNatal', () => {
    it('should generate a natal interpretation successfully', async () => {
      mockInterpretation.generateNatal.mockResolvedValue(interpretationResult);
      const req = buildReq({ validated: chartData });

      await generateNatal(req, res);

      expect(mockInterpretation.generateNatal).toHaveBeenCalledWith(chartData);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: interpretationResult });
    });

    it('should throw AppError 400 when chart data is missing', async () => {
      const req = buildReq({ validated: null });
      await expect(generateNatal(req, res)).rejects.toThrow(AppError);
    });

    it('should throw AppError 400 when planets array is empty', async () => {
      const req = buildReq({ validated: { planets: [] } });
      await expect(generateNatal(req, res)).rejects.toThrow(/planet/i);
    });

    it('should throw AppError 400 when planets array is undefined', async () => {
      const req = buildReq({ validated: {} });
      await expect(generateNatal(req, res)).rejects.toThrow(AppError);
    });

    it('should propagate service errors', async () => {
      mockInterpretation.generateNatal.mockRejectedValue(new Error('AI service unavailable'));
      const req = buildReq({ validated: chartData });
      await expect(generateNatal(req, res)).rejects.toThrow('AI service unavailable');
    });

    it('should log the generation request with userId', async () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const logger = require('../../utils/logger').default;
      mockInterpretation.generateNatal.mockResolvedValue(interpretationResult);
      const req = buildReq({ validated: chartData });

      await generateNatal(req, res);

      expect(logger.info).toHaveBeenCalledWith('Generating AI natal interpretation', {
        userId: mockUser.id,
      });
    });
  });

  // -------------------------------------------------------------------------
  describe('generateTransit', () => {
    it('should generate a transit forecast successfully', async () => {
      const forecast = { interpretation: 'Jupiter conjunct Sun brings opportunities' };
      mockInterpretation.generateTransit.mockResolvedValue(forecast);
      const req = buildReq({ validated: transitData });

      await generateTransit(req, res);

      expect(mockInterpretation.generateTransit).toHaveBeenCalledWith(transitData);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: forecast });
    });

    it('should throw AppError 400 when transit data is missing', async () => {
      const req = buildReq({ validated: null });
      await expect(generateTransit(req, res)).rejects.toThrow(AppError);
    });

    it('should throw AppError 400 when currentTransits is empty', async () => {
      const req = buildReq({ validated: { currentTransits: [] } });
      await expect(generateTransit(req, res)).rejects.toThrow(AppError);
    });

    it('should throw AppError 400 when currentTransits is undefined', async () => {
      const req = buildReq({ validated: {} });
      await expect(generateTransit(req, res)).rejects.toThrow(AppError);
    });
  });

  // -------------------------------------------------------------------------
  describe('generateCompatibility', () => {
    it('should generate a compatibility report successfully', async () => {
      const report = { interpretation: 'Strong compatibility', compatibilityScore: 85 };
      mockInterpretation.generateCompatibility.mockResolvedValue(report);
      const req = buildReq({ validated: synastryData });

      await generateCompatibility(req, res);

      expect(mockInterpretation.generateCompatibility).toHaveBeenCalledWith({
        chartA: synastryData.chartA,
        chartB: synastryData.chartB,
      });
      expect(res.json).toHaveBeenCalledWith({ success: true, data: report });
    });

    it('should throw AppError 400 when both charts missing', async () => {
      // validated is an object but neither chart is present — controller checks
      // `if (!chartA || !chartB)` and throws AppError 400.
      const req = buildReq({ validated: {} });
      await expect(generateCompatibility(req, res)).rejects.toThrow(AppError);
    });

    it('should throw AppError 400 when chartA is missing', async () => {
      const req = buildReq({ validated: { chartB: chartData } });
      await expect(generateCompatibility(req, res)).rejects.toThrow(AppError);
    });

    it('should throw AppError 400 when chartB is missing', async () => {
      const req = buildReq({ validated: { chartA: chartData } });
      await expect(generateCompatibility(req, res)).rejects.toThrow(AppError);
    });

    it('should throw AppError 400 when chartA has no planets', async () => {
      const req = buildReq({
        validated: {
          chartA: { planets: [] },
          chartB: chartData,
        },
      });
      await expect(generateCompatibility(req, res)).rejects.toThrow(AppError);
    });

    it('should throw AppError 400 when chartB has no planets', async () => {
      const req = buildReq({
        validated: {
          chartA: chartData,
          chartB: { planets: [] },
        },
      });
      await expect(generateCompatibility(req, res)).rejects.toThrow(AppError);
    });
  });

  // -------------------------------------------------------------------------
  describe('generateLunarReturn', () => {
    it('should generate a lunar return interpretation successfully', async () => {
      mockInterpretation.generateLunarReturn.mockResolvedValue(interpretationResult);
      const req = buildReq({ validated: chartData });

      await generateLunarReturn(req, res);

      expect(mockInterpretation.generateLunarReturn).toHaveBeenCalledWith(chartData);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: interpretationResult });
    });

    it('should throw AppError 400 when chart data is missing', async () => {
      const req = buildReq({ validated: null });
      await expect(generateLunarReturn(req, res)).rejects.toThrow(AppError);
    });
  });

  // -------------------------------------------------------------------------
  describe('generateSolarReturn', () => {
    it('should generate a solar return interpretation successfully', async () => {
      mockInterpretation.generateSolarReturn.mockResolvedValue(interpretationResult);
      const req = buildReq({ validated: chartData });

      await generateSolarReturn(req, res);

      expect(mockInterpretation.generateSolarReturn).toHaveBeenCalledWith(chartData);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: interpretationResult });
    });

    it('should throw AppError 400 when chart data is missing', async () => {
      const req = buildReq({ validated: null });
      await expect(generateSolarReturn(req, res)).rejects.toThrow(AppError);
    });
  });

  // -------------------------------------------------------------------------
  describe('checkStatus', () => {
    it('should report available when configured', async () => {
      mockOpenai.isConfigured.mockReturnValue(true);
      const configStatus = { model: 'gpt-4' };
      mockOpenai.getConfigStatus.mockReturnValue(configStatus);

      const req: any = {};
      await checkStatus(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          available: true,
          service: 'openai',
          model: 'gpt-4',
        },
      });
    });

    it('should report unavailable when not configured', async () => {
      mockOpenai.isConfigured.mockReturnValue(false);
      mockOpenai.getConfigStatus.mockReturnValue({ model: null });

      const req: any = {};
      await checkStatus(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ available: false, service: null }),
        }),
      );
    });
  });

  // -------------------------------------------------------------------------
  describe('getUsageStats', () => {
    it('should return usage statistics', async () => {
      const stats = { available: true, usage: { totalRequests: 10, totalTokens: 500, totalCost: 0.02 } };
      mockOpenai.getUsageStats.mockResolvedValue(stats);

      const req: any = {};
      await getUsageStats(req, res);

      expect(mockOpenai.getUsageStats).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ success: true, data: stats });
    });

    it('should propagate service errors', async () => {
      mockOpenai.getUsageStats.mockRejectedValue(new Error('DB down'));
      const req: any = {};
      await expect(getUsageStats(req, res)).rejects.toThrow('DB down');
    });
  });

  // -------------------------------------------------------------------------
  describe('clearCache', () => {
    it('should clear the cache and log the action', async () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const logger = require('../../utils/logger').default;
      mockInterpretation.clearCache.mockResolvedValue(undefined);
      const req = buildReq();

      await clearCache(req, res);

      expect(mockInterpretation.clearCache).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith('AI interpretation cache cleared', {
        userId: mockUser.id,
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Cache cleared successfully',
      });
    });
  });

  // -------------------------------------------------------------------------
  describe('AuthenticatedRequest type safety', () => {
    it('should access user.id from AuthenticatedRequest on success path', async () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const logger = require('../../utils/logger').default;
      mockInterpretation.generateNatal.mockResolvedValue(interpretationResult);
      const req = buildReq({ validated: chartData });

      await generateNatal(req, res);

      // logger.info receives the user.id extracted from req.user — proving
      // the controller reads the authenticated user from AuthenticatedRequest.
      expect(logger.info).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ userId: mockUser.id }),
      );
    });

    it('should access user.id when clearing cache', async () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const logger = require('../../utils/logger').default;
      mockInterpretation.clearCache.mockResolvedValue(undefined);
      const req = buildReq();

      await clearCache(req, res);

      expect(logger.info).toHaveBeenCalledWith('AI interpretation cache cleared', {
        userId: mockUser.id,
      });
    });
  });
});
