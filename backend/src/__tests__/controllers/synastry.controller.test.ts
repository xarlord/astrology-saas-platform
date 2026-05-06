/**
 * Unit Tests for Synastry Controller
 * Tests synastry chart comparison, compatibility, and report CRUD operations
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { Response } from 'express';
import {
  compareCharts,
  getCompatibility,
  getSynastryReports,
  getSynastryReport,
  deleteSynastryReport,
  updateSynastryReport,
} from '../../modules/synastry/controllers/synastry.controller';
import {
  calculateSynastryChart,
  calculateCompositeChart,
  calculateCategoryScores,
  calculateElementalBalance,
} from '../../modules/synastry/services/synastry.service';

// ---------------------------------------------------------------------------
// Mock knex
// ---------------------------------------------------------------------------

// `var` is required because jest.mock factory functions are hoisted above
// `let`/`const` declarations, causing TDZ errors.  `var` is hoisted and
// initialised to undefined, so the factory can safely assign to it.
// eslint-disable-next-line no-var
var mockKnexChain: any;
// eslint-disable-next-line no-var
var mockKnex: jest.Mock;

jest.mock('../../config/database', () => {
  // Resolution value for when the chain is awaited directly (thenable).
  // Tests set this via mockKnexChain._setResolveValue(value).
  let _resolveValue: any = undefined;

  mockKnexChain = {
    // Chainable methods — return `this` so calls can be chained
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    count: jest.fn().mockReturnThis(),

    // Terminal methods — return a promise (configured via mockResolvedValueOnce)
    first: jest.fn(),
    returning: jest.fn(),
    del: jest.fn(),
    update: jest.fn(),

    // Thenable interface — makes `await knex('table').where(...)` work
    then(resolve: any, reject?: any) {
      return Promise.resolve(_resolveValue).then(resolve, reject);
    },

    // Helper for tests to set what the chain resolves to when awaited
    _setResolveValue(val: any) {
      _resolveValue = val;
    },
  };

  mockKnex = jest.fn().mockReturnValue(mockKnexChain);
  return mockKnex;
});

// ---------------------------------------------------------------------------
// Mock synastry service
// ---------------------------------------------------------------------------

jest.mock('../../modules/synastry/services/synastry.service', () => ({
  calculateSynastryChart: jest.fn(),
  calculateCompositeChart: jest.fn(),
  calculateCategoryScores: jest.fn(),
  calculateElementalBalance: jest.fn(),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Sample chart DB row with all planet fields populated */
function makeChartRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'chart-1',
    userId: 'user-1',
    sunSign: 'leo',
    sunDegree: 15,
    sunMinute: 30,
    sunSecond: 0,
    moonSign: 'pisces',
    moonDegree: 10,
    moonMinute: 0,
    moonSecond: 0,
    mercurySign: 'virgo',
    mercuryDegree: 5,
    mercuryMinute: 0,
    mercurySecond: 0,
    venusSign: 'cancer',
    venusDegree: 20,
    venusMinute: 0,
    venusSecond: 0,
    marsSign: 'aries',
    marsDegree: 8,
    marsMinute: 0,
    marsSecond: 0,
    jupiterSign: 'sagittarius',
    jupiterDegree: 1,
    jupiterMinute: 0,
    jupiterSecond: 0,
    saturnSign: 'capricorn',
    saturnDegree: 12,
    saturnMinute: 0,
    saturnSecond: 0,
    uranusSign: 'aquarius',
    uranusDegree: 3,
    uranusMinute: 0,
    uranusSecond: 0,
    neptuneSign: 'pisces',
    neptuneDegree: 18,
    neptuneMinute: 0,
    neptuneSecond: 0,
    plutoSign: 'scorpio',
    plutoDegree: 25,
    plutoMinute: 0,
    plutoSecond: 0,
    ...overrides,
  };
}

const sampleSynastryResult = {
  id: 'synastry_chart-1_chart-2',
  chart1Id: 'chart-1',
  chart2Id: 'chart-2',
  synastryAspects: [
    {
      planet1: 'sun',
      planet2: 'moon',
      aspect: 'conjunction' as const,
      orb: 2.5,
      applying: true,
      interpretation: 'Strong emotional connection',
      weight: 3,
      soulmateIndicator: true,
    },
  ],
  overallCompatibility: 8.5,
  relationshipTheme: 'Highly compatible',
  strengths: ['Natural flow and ease'],
  challenges: ['Every relationship requires effort'],
  advice: 'Celebrate your strengths.',
};

const sampleScores = {
  overall: 8,
  romantic: 7.5,
  communication: 8,
  emotional: 9,
  intellectual: 7,
  spiritual: 6,
  values: 8,
};

const sampleElementalBalance = {
  fire: 3,
  earth: 2,
  air: 4,
  water: 3,
  balance: 'balanced',
};

const sampleCompositeChart = {
  chart1Id: 'chart-1',
  chart2Id: 'chart-2',
  planets: {},
  interpretation: 'Composite chart interpretation',
};

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe('Synastry Controller', () => {
  let mockRequest: Record<string, unknown>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Re-establish the mockKnex return value since clearAllMocks resets it
    mockKnex.mockReturnValue(mockKnexChain);

    // Reset chain methods that return `this` for chaining
    mockKnexChain.where.mockReturnThis();
    mockKnexChain.orderBy.mockReturnThis();
    mockKnexChain.limit.mockReturnThis();
    mockKnexChain.offset.mockReturnThis();
    mockKnexChain.insert.mockReturnThis();
    mockKnexChain.count.mockReturnThis();

    // Default: chain resolves to undefined when awaited
    mockKnexChain._setResolveValue(undefined);

    mockRequest = {
      user: { id: 'user-1', email: 'test@example.com' },
      body: {},
      params: {},
      query: {},
      method: 'GET',
      path: '/test',
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  // =========================================================================
  // compareCharts  (uses AuthenticatedRequest — req.user?.id with optional chain)
  // =========================================================================
  describe('compareCharts', () => {
    it('should call next with UnauthorizedError when user is undefined', async () => {
      mockRequest.user = undefined;

      await compareCharts(mockRequest as any, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 401, message: 'User authentication required' }),
      );
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should call next with UnauthorizedError when user exists but id is missing', async () => {
      mockRequest.user = { id: undefined as any, email: 'test@example.com' };

      await compareCharts(mockRequest as any, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 401, message: 'User authentication required' }),
      );
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should call next with BadRequestError when chart1Id is missing', async () => {
      mockRequest.body = { chart2Id: 'chart-2' };

      await compareCharts(mockRequest as any, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 400, message: 'chart1Id and chart2Id are required' }),
      );
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should call next with BadRequestError when chart2Id is missing', async () => {
      mockRequest.body = { chart1Id: 'chart-1' };

      await compareCharts(mockRequest as any, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 400, message: 'chart1Id and chart2Id are required' }),
      );
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should call next with BadRequestError when chart1Id equals chart2Id', async () => {
      mockRequest.body = { chart1Id: 'chart-1', chart2Id: 'chart-1' };

      await compareCharts(mockRequest as any, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 400, message: 'Cannot compare a chart with itself' }),
      );
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should call next with NotFoundError when one or both charts are not found', async () => {
      mockRequest.body = { chart1Id: 'chart-1', chart2Id: 'chart-2' };

      // knex('charts').where({id: chart1Id}).first() => null (chart1 missing)
      // knex('charts').where({id: chart2Id}).first() => chart row (but never reached due to Promise.all)
      mockKnexChain.first.mockResolvedValueOnce(null);
      mockKnexChain.first.mockResolvedValueOnce(makeChartRow({ id: 'chart-2' }));

      await compareCharts(mockRequest as any, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 404, message: 'One or both charts not found' }),
      );
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should create a new synastry record when no existing one is found', async () => {
      mockRequest.body = { chart1Id: 'chart-1', chart2Id: 'chart-2' };

      const chartRow1 = makeChartRow({ id: 'chart-1' });
      const chartRow2 = makeChartRow({ id: 'chart-2', userId: 'user-2' });

      // knex calls in order:
      //   1) knex('charts').where({id:'chart-1'}).first() -> chartRow1
      //   2) knex('charts').where({id:'chart-2'}).first() -> chartRow2
      //   3) knex('synastry_charts').where(...).first()    -> undefined (no existing)
      mockKnexChain.first
        .mockResolvedValueOnce(chartRow1)
        .mockResolvedValueOnce(chartRow2)
        .mockResolvedValueOnce(undefined);

      // knex('synastry_charts').insert(...).returning('id') -> [{id: 42}]
      // The controller does: const inserted = <returning result>; synastryId = inserted[0].id
      mockKnexChain.returning.mockResolvedValueOnce([{ id: 42 }]);

      // Aspect inserts: knex('synastry_aspects').insert({...})
      // insert() returns mockKnexChain (mockReturnThis), then await resolves via
      // the thenable interface to _resolveValue (default: undefined). No extra setup needed.

      (calculateSynastryChart as jest.Mock).mockReturnValue(sampleSynastryResult);

      await compareCharts(mockRequest as any, mockResponse as Response, mockNext);

      expect(calculateSynastryChart).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          id: 42,
          overallCompatibility: 8.5,
        }),
      });
    });

    it('should reuse existing synastry record when one is already saved', async () => {
      mockRequest.body = { chart1Id: 'chart-1', chart2Id: 'chart-2' };

      const chartRow1 = makeChartRow({ id: 'chart-1' });
      const chartRow2 = makeChartRow({ id: 'chart-2', userId: 'user-2' });

      mockKnexChain.first
        .mockResolvedValueOnce(chartRow1)
        .mockResolvedValueOnce(chartRow2)
        // Existing synastry found
        .mockResolvedValueOnce({ id: 99 });

      (calculateSynastryChart as jest.Mock).mockReturnValue(sampleSynastryResult);

      await compareCharts(mockRequest as any, mockResponse as Response, mockNext);

      // insert should NOT have been called for synastry_charts
      expect(mockKnexChain.insert).not.toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          id: 99,
        }),
      });
    });

    it('should call next(error) when an unexpected error occurs', async () => {
      mockRequest.body = { chart1Id: 'chart-1', chart2Id: 'chart-2' };

      const error = new Error('DB connection lost');
      mockKnexChain.first.mockRejectedValueOnce(error);

      await compareCharts(mockRequest as any, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('DB connection lost') }));
    });
  });

  // =========================================================================
  // getCompatibility  (uses AuthenticatedRequest — req.user?.id with optional chain)
  // =========================================================================
  describe('getCompatibility', () => {
    it('should call next with UnauthorizedError when user is undefined', async () => {
      mockRequest.user = undefined;

      await getCompatibility(mockRequest as any, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 401, message: 'User authentication required' }),
      );
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should call next with UnauthorizedError when user exists but id is missing', async () => {
      mockRequest.user = { id: undefined as any, email: 'test@example.com' };

      await getCompatibility(mockRequest as any, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 401, message: 'User authentication required' }),
      );
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should call next with BadRequestError when chart IDs are missing', async () => {
      mockRequest.body = {};

      await getCompatibility(mockRequest as any, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 400, message: 'chart1Id and chart2Id are required' }),
      );
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should call next with NotFoundError when charts are not found', async () => {
      mockRequest.body = { chart1Id: 'chart-1', chart2Id: 'chart-2' };

      // First chart fetch returns null
      mockKnexChain.first.mockResolvedValueOnce(null);

      await getCompatibility(mockRequest as any, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 404, message: 'One or both charts not found' }),
      );
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return compatibility scores with composite chart when includeComposite is true', async () => {
      mockRequest.body = {
        chart1Id: 'chart-1',
        chart2Id: 'chart-2',
        includeComposite: true,
      };

      const chartRow1 = makeChartRow({ id: 'chart-1' });
      const chartRow2 = makeChartRow({ id: 'chart-2' });
      mockKnexChain.first.mockResolvedValueOnce(chartRow1).mockResolvedValueOnce(chartRow2);

      (calculateCategoryScores as jest.Mock).mockReturnValue(sampleScores);
      (calculateElementalBalance as jest.Mock).mockReturnValue(sampleElementalBalance);
      (calculateCompositeChart as jest.Mock).mockReturnValue(sampleCompositeChart);

      await getCompatibility(mockRequest as any, mockResponse as Response, mockNext);

      expect(calculateCompositeChart).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          chart1Id: 'chart-1',
          chart2Id: 'chart-2',
          scores: sampleScores,
          elementalBalance: sampleElementalBalance,
          compositeChart: sampleCompositeChart,
        }),
      });
    });

    it('should return compatibility scores without composite chart by default', async () => {
      mockRequest.body = {
        chart1Id: 'chart-1',
        chart2Id: 'chart-2',
      };

      const chartRow1 = makeChartRow({ id: 'chart-1' });
      const chartRow2 = makeChartRow({ id: 'chart-2' });
      mockKnexChain.first.mockResolvedValueOnce(chartRow1).mockResolvedValueOnce(chartRow2);

      (calculateCategoryScores as jest.Mock).mockReturnValue(sampleScores);
      (calculateElementalBalance as jest.Mock).mockReturnValue(sampleElementalBalance);

      await getCompatibility(mockRequest as any, mockResponse as Response, mockNext);

      expect(calculateCompositeChart).not.toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          chart1Id: 'chart-1',
          chart2Id: 'chart-2',
          scores: sampleScores,
          elementalBalance: sampleElementalBalance,
        }),
      });
      // Verify compositeChart is absent
      const callArgs = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(callArgs.data).not.toHaveProperty('compositeChart');
    });
  });

  // =========================================================================
  // getSynastryReports  (uses AuthenticatedRequest — req.user?.id)
  // =========================================================================
  describe('getSynastryReports', () => {
    it('should call next with UnauthorizedError when no user is authenticated', async () => {
      mockRequest.user = undefined;

      await getSynastryReports(mockRequest as any, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 401, message: 'User authentication required' }),
      );
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return paginated synastry reports', async () => {
      mockRequest.query = { page: '1', limit: '10' };

      const dbReports = [
        {
          id: 1,
          chart1_id: 'c1',
          chart2_id: 'c2',
          synastry_aspects: JSON.stringify([{ planet1: 'sun', planet2: 'moon' }]),
          compatibility_score: 8,
          relationship_theme: 'Harmonious',
          strengths: ['Mutual respect'],
          challenges: ['Communication'],
          advice: 'Be patient',
          is_favorite: false,
          notes: null,
          created_at: '2026-01-01T00:00:00Z',
        },
      ];

      // First knex call: reports list
      // await knex('synastry_charts').where(...).orderBy(...).limit(...).offset(...)
      // No terminal method -- resolves via the thenable interface
      mockKnexChain._setResolveValue(dbReports);

      // Second knex call: count
      // await knex('synastry_charts').where(...).count('* as count').first()
      // Terminal method .first() returns a promise
      mockKnexChain.first.mockResolvedValueOnce({ count: 1 });

      await getSynastryReports(mockRequest as any, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          reports: [
            expect.objectContaining({
              id: 1,
              chart1Id: 'c1',
              chart2Id: 'c2',
              synastryAspects: [{ planet1: 'sun', planet2: 'moon' }],
              overallCompatibility: 8,
              relationshipTheme: 'Harmonious',
              strengths: ['Mutual respect'],
              challenges: ['Communication'],
              advice: 'Be patient',
              isFavorite: false,
              notes: null,
              createdAt: '2026-01-01T00:00:00Z',
            }),
          ],
          pagination: {
            page: 1,
            limit: 10,
            total: 1,
            totalPages: 1,
          },
        },
      });
    });

    it('should use default pagination when query params are omitted', async () => {
      mockRequest.query = {};

      mockKnexChain._setResolveValue([]);
      mockKnexChain.first.mockResolvedValueOnce({ count: 0 });

      await getSynastryReports(mockRequest as any, mockResponse as Response, mockNext);

      const callArgs = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(callArgs.data.pagination.page).toBe(1);
      expect(callArgs.data.pagination.limit).toBe(10);
      expect(callArgs.data.pagination.totalPages).toBe(0);
    });
  });

  // =========================================================================
  // getSynastryReport  (uses AuthenticatedRequest — req.user?.id)
  // =========================================================================
  describe('getSynastryReport', () => {
    it('should call next with UnauthorizedError when no user is authenticated', async () => {
      mockRequest.user = undefined;
      mockRequest.params = { id: '1' };

      await getSynastryReport(mockRequest as any, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 401, message: 'User authentication required' }),
      );
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should call next with NotFoundError when report is not found', async () => {
      mockRequest.params = { id: '999' };

      // knex('synastry_charts').where({id, user_id}).first() => undefined
      mockKnexChain.first.mockResolvedValueOnce(undefined);

      await getSynastryReport(mockRequest as any, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 404, message: 'Synastry report not found' }),
      );
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return a report with its aspects', async () => {
      mockRequest.params = { id: '42' };

      const dbReport = {
        id: 42,
        chart1_id: 'c1',
        chart2_id: 'c2',
        synastry_aspects: JSON.stringify([
          { planet1: 'sun', planet2: 'moon', aspect: 'conjunction' },
        ]),
        compatibility_score: 8.5,
        user_id: 'user-1',
      };

      const dbAspects = [
        {
          id: 1,
          synastry_chart_id: 42,
          planet1: 'sun',
          planet2: 'moon',
          aspect: 'conjunction',
          orb: 2.5,
          applying: true,
          interpretation: 'Strong emotional bond',
          weight: 3,
          soulmate_indicator: true,
        },
      ];

      // First knex call: knex('synastry_charts').where(...).first() -> dbReport
      mockKnexChain.first.mockResolvedValueOnce(dbReport);

      // Second knex call: knex('synastry_aspects').where(...)
      // No terminal method, resolves via thenable
      mockKnexChain._setResolveValue(dbAspects);

      await getSynastryReport(mockRequest as any, mockResponse as Response, mockNext);

      expect(mockKnex).toHaveBeenCalledWith('synastry_charts');
      expect(mockKnex).toHaveBeenCalledWith('synastry_aspects');
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          id: 42,
          synastryAspects: [{ planet1: 'sun', planet2: 'moon', aspect: 'conjunction' }],
          aspects: dbAspects,
        }),
      });
    });
  });

  // =========================================================================
  // deleteSynastryReport  (uses AuthenticatedRequest — req.user?.id)
  // =========================================================================
  describe('deleteSynastryReport', () => {
    it('should call next with UnauthorizedError when no user is authenticated', async () => {
      mockRequest.user = undefined;
      mockRequest.params = { id: '1' };

      await deleteSynastryReport(mockRequest as any, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 401, message: 'User authentication required' }),
      );
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should call next with NotFoundError when report is not found', async () => {
      mockRequest.params = { id: '999' };

      // knex('synastry_charts').where({id, user_id}).first() => undefined
      mockKnexChain.first.mockResolvedValueOnce(undefined);

      await deleteSynastryReport(mockRequest as any, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 404, message: 'Synastry report not found' }),
      );
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should delete the report and return success', async () => {
      mockRequest.params = { id: '42' };

      // Report exists
      mockKnexChain.first.mockResolvedValueOnce({ id: 42, user_id: 'user-1' });
      // del() resolves
      mockKnexChain.del.mockResolvedValueOnce(1);

      await deleteSynastryReport(mockRequest as any, mockResponse as Response, mockNext);

      expect(mockKnexChain.del).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Synastry report deleted successfully',
      });
    });
  });

  // =========================================================================
  // updateSynastryReport  (uses AuthenticatedRequest — req.user?.id)
  // =========================================================================
  describe('updateSynastryReport', () => {
    it('should call next with UnauthorizedError when no user is authenticated', async () => {
      mockRequest.user = undefined;
      mockRequest.params = { id: '1' };

      await updateSynastryReport(mockRequest as any, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 401, message: 'User authentication required' }),
      );
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should call next with NotFoundError when report is not found', async () => {
      mockRequest.params = { id: '999' };
      mockRequest.body = { isFavorite: true };

      // knex('synastry_charts').where({id, user_id}).first() => undefined
      mockKnexChain.first.mockResolvedValueOnce(undefined);

      await updateSynastryReport(mockRequest as any, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 404, message: 'Synastry report not found' }),
      );
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should update isFavorite on the report', async () => {
      mockRequest.params = { id: '42' };
      mockRequest.body = { isFavorite: true };

      // Report exists
      mockKnexChain.first.mockResolvedValueOnce({ id: 42, user_id: 'user-1' });
      // update resolves
      mockKnexChain.update.mockResolvedValueOnce(1);

      await updateSynastryReport(mockRequest as any, mockResponse as Response, mockNext);

      expect(mockKnexChain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          is_favorite: true,
          updated_at: expect.any(String),
        }),
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Synastry report updated successfully',
      });
    });

    it('should update notes on the report', async () => {
      mockRequest.params = { id: '42' };
      mockRequest.body = { notes: 'Great compatibility!' };

      mockKnexChain.first.mockResolvedValueOnce({ id: 42, user_id: 'user-1' });
      mockKnexChain.update.mockResolvedValueOnce(1);

      await updateSynastryReport(mockRequest as any, mockResponse as Response, mockNext);

      expect(mockKnexChain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          notes: 'Great compatibility!',
          updated_at: expect.any(String),
        }),
      );
    });

    it('should update both isFavorite and notes simultaneously', async () => {
      mockRequest.params = { id: '42' };
      mockRequest.body = { isFavorite: false, notes: 'Updated notes' };

      mockKnexChain.first.mockResolvedValueOnce({ id: 42, user_id: 'user-1' });
      mockKnexChain.update.mockResolvedValueOnce(1);

      await updateSynastryReport(mockRequest as any, mockResponse as Response, mockNext);

      expect(mockKnexChain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          is_favorite: false,
          notes: 'Updated notes',
          updated_at: expect.any(String),
        }),
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Synastry report updated successfully',
      });
    });
  });
});
