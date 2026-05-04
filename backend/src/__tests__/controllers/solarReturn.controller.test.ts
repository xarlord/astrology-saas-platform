/**
 * Solar Return Controller Unit Tests
 * Comprehensive tests for solarReturn.controller.ts
 *
 * Covers all 8 controller methods with auth, validation, ownership,
 * not-found, conflict, and happy-path scenarios.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-var-requires */

import { Response, NextFunction } from 'express';
import {
  calculateSolarReturn,
  getSolarReturnByYear,
  getSolarReturnById,
  getSolarReturnHistory,
  recalculateSolarReturn,
  getSolarReturnStats,
  deleteSolarReturn,
  getAvailableYears,
} from '../../modules/solar/controllers/solarReturn.controller';
import solarReturnService from '../../modules/solar/services/solarReturn.service';
import solarReturnModel from '../../modules/solar/models/solarReturn.model';
import {
  UnauthorizedError,
  BadRequestError,
  NotFoundError,
  ConflictError,
} from '../../utils/appError';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Mock the service -- default export singleton
jest.mock('../../modules/solar/services/solarReturn.service', () => ({
  __esModule: true,
  default: {
    calculateSolarReturn: jest.fn(),
    calculateLuckyDays: jest.fn(),
    generateYearlyThemes: jest.fn(),
  },
}));

// Mock the model -- default export singleton
jest.mock('../../modules/solar/models/solarReturn.model', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    findByUserAndYear: jest.fn(),
    findById: jest.fn(),
    findByUserId: jest.fn(),
    findRecent: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    getStats: jest.fn(),
  },
}));

// Mock interpretations
jest.mock('../../data/solarReturnInterpretations', () => ({
  generateSolarReturnInterpretation: jest.fn().mockReturnValue({ summary: 'test interpretation' }),
}));

// Mock errorHandler -- asyncHandler just calls the handler directly so thrown
// errors propagate to our try/catch in tests
jest.mock('../../middleware/errorHandler', () => ({
  asyncHandler: (fn: (...args: unknown[]) => unknown) => fn,
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const currentYear = new Date().getFullYear();

/** Minimal, valid chart data that satisfies the controller */
const mockChartData = {
  planets: [
    {
      planet: 'sun',
      sign: 'capricorn',
      degree: 10,
      minute: 30,
      second: 0,
      house: 1,
      retrograde: false,
    },
  ],
  houses: [],
  aspects: [],
  ascendant: { sign: 'scorpio', degree: 15, minute: 0, second: 0 },
  mc: { sign: 'leo', degree: 5, minute: 0, second: 0 },
  moonPhase: { phase: 'new', illumination: 50 },
};

const mockSolarReturn = {
  id: 'sr-1',
  userId: 'user-123',
  chartId: 'chart-abc',
  year: currentYear,
  returnDate: new Date(`${currentYear}-01-15T12:00:00Z`),
  returnLocation: {
    name: 'New York',
    latitude: 40.7128,
    longitude: -74.006,
    timezone: 'America/New_York',
  },
  calculatedData: mockChartData,
  interpretation: { summary: 'test interpretation', luckyDays: [], themes: ['Self-discovery'] },
  isRelocated: false,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

/** Build a request stub */
function buildRequest(overrides: Record<string, any> = {}): any {
  return {
    user: { id: 'user-123' },
    body: {},
    params: {},
    query: {},
    ...overrides,
  };
}

/** Build a response stub */
function buildResponse(): Partial<Response> {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('SolarReturnController', () => {
  let req: any;
  let res: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    req = buildRequest();
    res = buildResponse();
  });

  // =========================================================================
  // 1. calculateSolarReturn
  // =========================================================================
  describe('calculateSolarReturn', () => {
    it('should throw UnauthorizedError when no user is authenticated', async () => {
      req.user = undefined;

      try {
        await calculateSolarReturn(req, res as Response, {} as NextFunction);
        fail('Expected UnauthorizedError');
      } catch (err) {
        expect(err).toBeInstanceOf(UnauthorizedError);
        expect((err as UnauthorizedError).message).toBe('User authentication required');
      }
    });

    it('should throw BadRequestError when natalChartId is missing', async () => {
      req.body = { year: currentYear };

      try {
        await calculateSolarReturn(req, res as Response, {} as NextFunction);
        fail('Expected BadRequestError');
      } catch (err) {
        expect(err).toBeInstanceOf(BadRequestError);
        expect((err as BadRequestError).message).toBe('natalChartId and year are required');
      }
    });

    it('should throw BadRequestError when year is missing', async () => {
      req.body = { natalChartId: 'chart-abc' };

      try {
        await calculateSolarReturn(req, res as Response, {} as NextFunction);
        fail('Expected BadRequestError');
      } catch (err) {
        expect(err).toBeInstanceOf(BadRequestError);
        expect((err as BadRequestError).message).toBe('natalChartId and year are required');
      }
    });

    it('should throw BadRequestError when year is too far in the past', async () => {
      req.body = { natalChartId: 'chart-abc', year: currentYear - 5 };

      try {
        await calculateSolarReturn(req, res as Response, {} as NextFunction);
        fail('Expected BadRequestError');
      } catch (err) {
        expect(err).toBeInstanceOf(BadRequestError);
        expect((err as BadRequestError).message).toBe('Year must be within reasonable range');
      }
    });

    it('should throw BadRequestError when year is too far in the future', async () => {
      req.body = { natalChartId: 'chart-abc', year: currentYear + 10 };

      try {
        await calculateSolarReturn(req, res as Response, {} as NextFunction);
        fail('Expected BadRequestError');
      } catch (err) {
        expect(err).toBeInstanceOf(BadRequestError);
        expect((err as BadRequestError).message).toBe('Year must be within reasonable range');
      }
    });

    it('should throw ConflictError when solar return already exists for the year', async () => {
      req.body = { natalChartId: 'chart-abc', year: currentYear };
      (solarReturnModel.findByUserAndYear as jest.Mock).mockResolvedValue(mockSolarReturn);

      try {
        await calculateSolarReturn(req, res as Response, {} as NextFunction);
        fail('Expected ConflictError');
      } catch (err) {
        expect(err).toBeInstanceOf(ConflictError);
        expect((err as ConflictError).message).toBe(
          `Solar return for ${currentYear} already exists. Use recalculate to update.`,
        );
      }
    });

    it('should create a solar return and return 201 on happy path', async () => {
      req.body = {
        natalChartId: 'chart-abc',
        year: currentYear,
        location: { name: 'NYC', latitude: 40.7, longitude: -74.0, timezone: 'America/New_York' },
        houseSystem: 'placidus',
        zodiacType: 'tropical',
      };

      (solarReturnModel.findByUserAndYear as jest.Mock).mockResolvedValue(null);
      (solarReturnService.calculateSolarReturn as jest.Mock).mockResolvedValue({
        returnDate: new Date(`${currentYear}-01-15T12:00:00Z`),
        chartData: mockChartData,
      });
      (solarReturnService.calculateLuckyDays as jest.Mock).mockReturnValue([
        { date: `${currentYear}-06-15`, reason: 'Jupiter trine', intensity: 8 },
      ]);
      (solarReturnService.generateYearlyThemes as jest.Mock).mockReturnValue([
        'Self-discovery',
        'New beginnings',
      ]);
      (solarReturnModel.create as jest.Mock).mockResolvedValue(mockSolarReturn);

      await calculateSolarReturn(req, res as Response, {} as NextFunction);

      expect(solarReturnModel.findByUserAndYear).toHaveBeenCalledWith('user-123', currentYear);
      expect(solarReturnService.calculateSolarReturn).toHaveBeenCalledWith(
        expect.objectContaining({ natalChartId: 'chart-abc', year: currentYear }),
      );
      expect(solarReturnModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-123',
          chartId: 'chart-abc',
          year: currentYear,
          isRelocated: true,
        }),
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, data: mockSolarReturn }),
      );
    });

    it('should use default houseSystem and zodiacType when not provided', async () => {
      req.body = { natalChartId: 'chart-abc', year: currentYear };

      (solarReturnModel.findByUserAndYear as jest.Mock).mockResolvedValue(null);
      (solarReturnService.calculateSolarReturn as jest.Mock).mockResolvedValue({
        returnDate: new Date(),
        chartData: mockChartData,
      });
      (solarReturnService.calculateLuckyDays as jest.Mock).mockReturnValue([]);
      (solarReturnService.generateYearlyThemes as jest.Mock).mockReturnValue([]);
      (solarReturnModel.create as jest.Mock).mockResolvedValue(mockSolarReturn);

      await calculateSolarReturn(req, res as Response, {} as NextFunction);

      expect(solarReturnService.calculateSolarReturn).toHaveBeenCalledWith(
        expect.objectContaining({
          houseSystem: 'placidus',
          zodiacType: 'tropical',
        }),
      );
    });

    it('should set isRelocated to false when location is not provided', async () => {
      req.body = { natalChartId: 'chart-abc', year: currentYear };

      (solarReturnModel.findByUserAndYear as jest.Mock).mockResolvedValue(null);
      (solarReturnService.calculateSolarReturn as jest.Mock).mockResolvedValue({
        returnDate: new Date(),
        chartData: mockChartData,
      });
      (solarReturnService.calculateLuckyDays as jest.Mock).mockReturnValue([]);
      (solarReturnService.generateYearlyThemes as jest.Mock).mockReturnValue([]);
      (solarReturnModel.create as jest.Mock).mockResolvedValue(mockSolarReturn);

      await calculateSolarReturn(req, res as Response, {} as NextFunction);

      expect(solarReturnModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ isRelocated: false }),
      );
    });
  });

  // =========================================================================
  // 2. getSolarReturnByYear
  // =========================================================================
  describe('getSolarReturnByYear', () => {
    it('should throw UnauthorizedError when no user is authenticated', async () => {
      req.user = undefined;
      req.params = { year: String(currentYear) };

      try {
        await getSolarReturnByYear(req, res as Response, {} as NextFunction);
        fail('Expected UnauthorizedError');
      } catch (err) {
        expect(err).toBeInstanceOf(UnauthorizedError);
        expect((err as UnauthorizedError).message).toBe('User authentication required');
      }
    });

    it('should throw BadRequestError for non-numeric year', async () => {
      req.params = { year: 'abc' };

      try {
        await getSolarReturnByYear(req, res as Response, {} as NextFunction);
        fail('Expected BadRequestError');
      } catch (err) {
        expect(err).toBeInstanceOf(BadRequestError);
        expect((err as BadRequestError).message).toBe('Invalid year parameter');
      }
    });

    it('should throw NotFoundError when solar return does not exist for the year', async () => {
      req.params = { year: String(currentYear) };
      (solarReturnModel.findByUserAndYear as jest.Mock).mockResolvedValue(null);

      try {
        await getSolarReturnByYear(req, res as Response, {} as NextFunction);
        fail('Expected NotFoundError');
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundError);
        expect((err as NotFoundError).message).toBe(`Solar return for ${currentYear} not found`);
      }
    });

    it('should return solar return data on happy path', async () => {
      req.params = { year: String(currentYear) };
      (solarReturnModel.findByUserAndYear as jest.Mock).mockResolvedValue(mockSolarReturn);

      await getSolarReturnByYear(req, res as Response, {} as NextFunction);

      expect(solarReturnModel.findByUserAndYear).toHaveBeenCalledWith('user-123', currentYear);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, data: mockSolarReturn }),
      );
    });
  });

  // =========================================================================
  // 3. getSolarReturnById
  // =========================================================================
  describe('getSolarReturnById', () => {
    it('should throw UnauthorizedError when no user is authenticated', async () => {
      req.user = undefined;
      req.params = { id: 'sr-1' };

      try {
        await getSolarReturnById(req, res as Response, {} as NextFunction);
        fail('Expected UnauthorizedError');
      } catch (err) {
        expect(err).toBeInstanceOf(UnauthorizedError);
        expect((err as UnauthorizedError).message).toBe('User authentication required');
      }
    });

    it('should throw NotFoundError when solar return does not exist', async () => {
      req.params = { id: 'sr-nonexistent' };
      (solarReturnModel.findById as jest.Mock).mockResolvedValue(null);

      try {
        await getSolarReturnById(req, res as Response, {} as NextFunction);
        fail('Expected NotFoundError');
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundError);
        expect((err as NotFoundError).message).toBe('Solar return not found');
      }
    });

    it('should throw UnauthorizedError when user does not own the solar return', async () => {
      req.user = { id: 'user-other' };
      req.params = { id: 'sr-1' };
      (solarReturnModel.findById as jest.Mock).mockResolvedValue(mockSolarReturn);

      try {
        await getSolarReturnById(req, res as Response, {} as NextFunction);
        fail('Expected UnauthorizedError');
      } catch (err) {
        expect(err).toBeInstanceOf(UnauthorizedError);
        expect((err as UnauthorizedError).message).toBe('Access denied');
      }
    });

    it('should return solar return data on happy path', async () => {
      req.params = { id: 'sr-1' };
      (solarReturnModel.findById as jest.Mock).mockResolvedValue(mockSolarReturn);

      await getSolarReturnById(req, res as Response, {} as NextFunction);

      expect(solarReturnModel.findById).toHaveBeenCalledWith('sr-1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, data: mockSolarReturn }),
      );
    });
  });

  // =========================================================================
  // 4. getSolarReturnHistory
  // =========================================================================
  describe('getSolarReturnHistory', () => {
    const mockHistory = [mockSolarReturn];

    it('should throw UnauthorizedError when no user is authenticated', async () => {
      req.user = undefined;

      try {
        await getSolarReturnHistory(req, res as Response, {} as NextFunction);
        fail('Expected UnauthorizedError');
      } catch (err) {
        expect(err).toBeInstanceOf(UnauthorizedError);
        expect((err as UnauthorizedError).message).toBe('User authentication required');
      }
    });

    it('should return recent solar returns when includeRelocated is not set', async () => {
      (solarReturnModel.findRecent as jest.Mock).mockResolvedValue(mockHistory);

      await getSolarReturnHistory(req, res as Response, {} as NextFunction);

      expect(solarReturnModel.findRecent).toHaveBeenCalledWith('user-123', 10);
      expect(solarReturnModel.findByUserId).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockHistory,
          count: mockHistory.length,
        }),
      );
    });

    it('should use custom limit from query string', async () => {
      req.query = { limit: '5' };
      (solarReturnModel.findRecent as jest.Mock).mockResolvedValue(mockHistory);

      await getSolarReturnHistory(req, res as Response, {} as NextFunction);

      expect(solarReturnModel.findRecent).toHaveBeenCalledWith('user-123', 5);
    });

    it('should return all solar returns (including relocated) when includeRelocated=true', async () => {
      req.query = { includeRelocated: 'true' };
      (solarReturnModel.findByUserId as jest.Mock).mockResolvedValue(mockHistory);

      await getSolarReturnHistory(req, res as Response, {} as NextFunction);

      expect(solarReturnModel.findByUserId).toHaveBeenCalledWith('user-123');
      expect(solarReturnModel.findRecent).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockHistory,
          count: mockHistory.length,
        }),
      );
    });
  });

  // =========================================================================
  // 5. recalculateSolarReturn
  // =========================================================================
  describe('recalculateSolarReturn', () => {
    const newLocation = {
      name: 'London',
      latitude: 51.5,
      longitude: -0.12,
      timezone: 'Europe/London',
    };

    it('should throw UnauthorizedError when no user is authenticated', async () => {
      req.user = undefined;
      req.params = { id: 'sr-1' };

      try {
        await recalculateSolarReturn(req, res as Response, {} as NextFunction);
        fail('Expected UnauthorizedError');
      } catch (err) {
        expect(err).toBeInstanceOf(UnauthorizedError);
        expect((err as UnauthorizedError).message).toBe('User authentication required');
      }
    });

    it('should throw BadRequestError when location is not provided', async () => {
      req.params = { id: 'sr-1' };
      req.body = {};

      try {
        await recalculateSolarReturn(req, res as Response, {} as NextFunction);
        fail('Expected BadRequestError');
      } catch (err) {
        expect(err).toBeInstanceOf(BadRequestError);
        expect((err as BadRequestError).message).toBe('location is required for recalculation');
      }
    });

    it('should throw NotFoundError when solar return does not exist', async () => {
      req.params = { id: 'sr-nonexistent' };
      req.body = { location: newLocation };
      (solarReturnModel.findById as jest.Mock).mockResolvedValue(null);

      try {
        await recalculateSolarReturn(req, res as Response, {} as NextFunction);
        fail('Expected NotFoundError');
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundError);
        expect((err as NotFoundError).message).toBe('Solar return not found');
      }
    });

    it('should throw UnauthorizedError when user does not own the solar return', async () => {
      req.user = { id: 'user-other' };
      req.params = { id: 'sr-1' };
      req.body = { location: newLocation };
      (solarReturnModel.findById as jest.Mock).mockResolvedValue(mockSolarReturn);

      try {
        await recalculateSolarReturn(req, res as Response, {} as NextFunction);
        fail('Expected UnauthorizedError');
      } catch (err) {
        expect(err).toBeInstanceOf(UnauthorizedError);
        expect((err as UnauthorizedError).message).toBe('Access denied');
      }
    });

    it('should recalculate and return updated solar return on happy path', async () => {
      req.params = { id: 'sr-1' };
      req.body = { location: newLocation, houseSystem: 'koch', zodiacType: 'sidereal' };

      const updatedSolarReturn = {
        ...mockSolarReturn,
        isRelocated: true,
        returnLocation: newLocation,
      };

      (solarReturnModel.findById as jest.Mock).mockResolvedValue(mockSolarReturn);
      (solarReturnService.calculateSolarReturn as jest.Mock).mockResolvedValue({
        returnDate: new Date(`${currentYear}-01-15T14:00:00Z`),
        chartData: mockChartData,
      });
      (solarReturnService.calculateLuckyDays as jest.Mock).mockReturnValue([]);
      (solarReturnService.generateYearlyThemes as jest.Mock).mockReturnValue([
        'Career',
        'Ambition',
      ]);
      (solarReturnModel.update as jest.Mock).mockResolvedValue(updatedSolarReturn);

      await recalculateSolarReturn(req, res as Response, {} as NextFunction);

      expect(solarReturnService.calculateSolarReturn).toHaveBeenCalledWith(
        expect.objectContaining({
          natalChartId: mockSolarReturn.chartId,
          year: mockSolarReturn.year,
          location: newLocation,
          houseSystem: 'koch',
          zodiacType: 'sidereal',
        }),
      );
      expect(solarReturnModel.update).toHaveBeenCalledWith(
        'sr-1',
        expect.objectContaining({ isRelocated: true, returnLocation: newLocation }),
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: updatedSolarReturn,
          message: 'Solar return recalculated with new location',
        }),
      );
    });

    it('should use default houseSystem and zodiacType when not provided', async () => {
      req.params = { id: 'sr-1' };
      req.body = { location: newLocation };

      (solarReturnModel.findById as jest.Mock).mockResolvedValue(mockSolarReturn);
      (solarReturnService.calculateSolarReturn as jest.Mock).mockResolvedValue({
        returnDate: new Date(),
        chartData: mockChartData,
      });
      (solarReturnService.calculateLuckyDays as jest.Mock).mockReturnValue([]);
      (solarReturnService.generateYearlyThemes as jest.Mock).mockReturnValue([]);
      (solarReturnModel.update as jest.Mock).mockResolvedValue(mockSolarReturn);

      await recalculateSolarReturn(req, res as Response, {} as NextFunction);

      expect(solarReturnService.calculateSolarReturn).toHaveBeenCalledWith(
        expect.objectContaining({
          houseSystem: 'placidus',
          zodiacType: 'tropical',
        }),
      );
    });
  });

  // =========================================================================
  // 6. getSolarReturnStats
  // =========================================================================
  describe('getSolarReturnStats', () => {
    const mockStats = {
      total: 5,
      relocated: 2,
      byYear: { [currentYear]: 1, [currentYear - 1]: 1 },
    };

    it('should throw UnauthorizedError when no user is authenticated', async () => {
      req.user = undefined;

      try {
        await getSolarReturnStats(req, res as Response, {} as NextFunction);
        fail('Expected UnauthorizedError');
      } catch (err) {
        expect(err).toBeInstanceOf(UnauthorizedError);
        expect((err as UnauthorizedError).message).toBe('User authentication required');
      }
    });

    it('should return stats on happy path', async () => {
      (solarReturnModel.getStats as jest.Mock).mockResolvedValue(mockStats);

      await getSolarReturnStats(req, res as Response, {} as NextFunction);

      expect(solarReturnModel.getStats).toHaveBeenCalledWith('user-123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, data: mockStats }),
      );
    });
  });

  // =========================================================================
  // 7. deleteSolarReturn
  // =========================================================================
  describe('deleteSolarReturn', () => {
    it('should throw UnauthorizedError when no user is authenticated', async () => {
      req.user = undefined;
      req.params = { id: 'sr-1' };

      try {
        await deleteSolarReturn(req, res as Response, {} as NextFunction);
        fail('Expected UnauthorizedError');
      } catch (err) {
        expect(err).toBeInstanceOf(UnauthorizedError);
        expect((err as UnauthorizedError).message).toBe('User authentication required');
      }
    });

    it('should throw NotFoundError when solar return does not exist', async () => {
      req.params = { id: 'sr-nonexistent' };
      (solarReturnModel.findById as jest.Mock).mockResolvedValue(null);

      try {
        await deleteSolarReturn(req, res as Response, {} as NextFunction);
        fail('Expected NotFoundError');
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundError);
        expect((err as NotFoundError).message).toBe('Solar return not found');
      }
    });

    it('should throw UnauthorizedError when user does not own the solar return', async () => {
      req.user = { id: 'user-other' };
      req.params = { id: 'sr-1' };
      (solarReturnModel.findById as jest.Mock).mockResolvedValue(mockSolarReturn);

      try {
        await deleteSolarReturn(req, res as Response, {} as NextFunction);
        fail('Expected UnauthorizedError');
      } catch (err) {
        expect(err).toBeInstanceOf(UnauthorizedError);
        expect((err as UnauthorizedError).message).toBe('Access denied');
      }
    });

    it('should delete solar return and return 200 on happy path', async () => {
      req.params = { id: 'sr-1' };
      (solarReturnModel.findById as jest.Mock).mockResolvedValue(mockSolarReturn);
      (solarReturnModel.delete as jest.Mock).mockResolvedValue(true);

      await deleteSolarReturn(req, res as Response, {} as NextFunction);

      expect(solarReturnModel.findById).toHaveBeenCalledWith('sr-1');
      expect(solarReturnModel.delete).toHaveBeenCalledWith('sr-1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Solar return deleted successfully',
        }),
      );
    });
  });

  // =========================================================================
  // 8. getAvailableYears
  // =========================================================================
  describe('getAvailableYears', () => {
    const mockReturns = [
      { ...mockSolarReturn, year: currentYear },
      { ...mockSolarReturn, year: currentYear - 1, id: 'sr-2' },
      { ...mockSolarReturn, year: currentYear - 2, id: 'sr-3' },
    ];

    it('should throw UnauthorizedError when no user is authenticated', async () => {
      req.user = undefined;

      try {
        await getAvailableYears(req, res as Response, {} as NextFunction);
        fail('Expected UnauthorizedError');
      } catch (err) {
        expect(err).toBeInstanceOf(UnauthorizedError);
        expect((err as UnauthorizedError).message).toBe('User authentication required');
      }
    });

    it('should return sorted years (descending) on happy path', async () => {
      (solarReturnModel.findByUserId as jest.Mock).mockResolvedValue(mockReturns);

      await getAvailableYears(req, res as Response, {} as NextFunction);

      expect(solarReturnModel.findByUserId).toHaveBeenCalledWith('user-123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: [currentYear, currentYear - 1, currentYear - 2],
        }),
      );
    });

    it('should return an empty array when user has no solar returns', async () => {
      (solarReturnModel.findByUserId as jest.Mock).mockResolvedValue([]);

      await getAvailableYears(req, res as Response, {} as NextFunction);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: [] }));
    });
  });
});
