/**
 * Unit Tests for Analysis Controller
 * Tests personality analysis and chart interpretation
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Request, Response } from 'express';
import {
  getPersonalityAnalysis,
  getAspectAnalysis,
  getAspectPatterns,
  getPlanetsInSigns,
  getHousesAnalysis,
} from '../../modules/analysis/controllers/analysis.controller';
import { AppError } from '../../utils/appError';
import ChartModel from '../../modules/charts/models/chart.model';
import { swissEphemeris } from '../../modules/shared';
import { generateCompletePersonalityAnalysis } from '../../modules/analysis/services/interpretation.service';

// Mock dependencies
jest.mock('../../modules/charts/models/chart.model', () => ({
  __esModule: true,
  default: {
    findByIdAndUserId: jest.fn(),
  },
}));

jest.mock('../../modules/shared', () => ({
  swissEphemeris: {
    calculateNatalChart: jest.fn(),
    calculateTransits: jest.fn(),
    PLANET_SYMBOLS: {
      sun: '☉',
      moon: '☽',
      mercury: '☿',
    },
  },
}));

jest.mock('../../modules/analysis/services/interpretation.service', () => ({
  generateCompletePersonalityAnalysis: jest.fn(),
}));

describe('Analysis Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequest = {
      user: { id: '123', email: 'test@example.com' },
      body: {},
      params: {},
      query: {},
      get: jest.fn().mockReturnValue('test-agent'),
      ip: '127.0.0.1',
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  const mockChartWithCalculatedData = {
    id: '456',
    birth_date: new Date('1990-01-15'),
    calculated_data: {
      jd: 2451545.0,
      planets: {
        sun: {
          sign: 'capricorn',
          position: 295.5,
          longitude: 295.5,
          retrograde: false,
          speed: 1,
          latitude: 0,
        },
        moon: {
          sign: 'pisces',
          position: 350.2,
          longitude: 350.2,
          retrograde: false,
          speed: 1,
          latitude: 0,
        },
      },
      houses: {
        houses: [
          { cusp: 300, sign: 'aquarius' },
          { cusp: 330, sign: 'pisces' },
          { cusp: 0, sign: 'aries' },
          { cusp: 30, sign: 'taurus' },
          { cusp: 60, sign: 'gemini' },
          { cusp: 90, sign: 'cancer' },
          { cusp: 120, sign: 'leo' },
          { cusp: 150, sign: 'virgo' },
          { cusp: 180, sign: 'libra' },
          { cusp: 210, sign: 'scorpio' },
          { cusp: 240, sign: 'sagittarius' },
          { cusp: 270, sign: 'capricorn' },
        ],
      },
      aspects: [
        { aspect: 'trine', orb: 2, planet1: 'sun', planet2: 'jupiter' },
        { aspect: 'square', orb: 3, planet1: 'venus', planet2: 'mars' },
      ],
    },
  };

  describe('getPersonalityAnalysis', () => {
    it('should return complete personality analysis', async () => {
      mockRequest.params = { chartId: '456' };

      const mockAnalysis = {
        overview: {
          sunSign: { sign: 'capricorn', interpretation: 'Ambitious and disciplined' },
          moonSign: { sign: 'pisces', interpretation: 'Sensitive and intuitive' },
        },
        strengths: ['determined', 'practical'],
        challenges: ['reserved', 'pessimistic'],
      };

      (ChartModel.findByIdAndUserId as jest.Mock).mockResolvedValue(mockChartWithCalculatedData);
      (generateCompletePersonalityAnalysis as jest.Mock).mockReturnValue(mockAnalysis);

      await getPersonalityAnalysis(mockRequest as Request, mockResponse as Response, mockNext);

      // Check that response was successful
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should throw 404 if chart not found', async () => {
      mockRequest.params = { chartId: '999' };

      (ChartModel.findByIdAndUserId as jest.Mock).mockResolvedValue(null);

      await expect(
        getPersonalityAnalysis(mockRequest as Request, mockResponse as Response, mockNext),
      ).rejects.toThrow(AppError);
      await expect(
        getPersonalityAnalysis(mockRequest as Request, mockResponse as Response, mockNext),
      ).rejects.toThrow('Chart not found');
    });

    it('should throw 400 if chart not calculated', async () => {
      const mockChart = {
        id: '456',
        calculated_data: null,
      };

      mockRequest.params = { chartId: '456' };

      (ChartModel.findByIdAndUserId as jest.Mock).mockResolvedValue(mockChart);

      await expect(
        getPersonalityAnalysis(mockRequest as Request, mockResponse as Response, mockNext),
      ).rejects.toThrow(AppError);
      await expect(
        getPersonalityAnalysis(mockRequest as Request, mockResponse as Response, mockNext),
      ).rejects.toThrow('Chart must be calculated first');
    });
  });

  describe('getAspectAnalysis', () => {
    it('should return aspect analysis', async () => {
      mockRequest.params = { chartId: '456' };

      (ChartModel.findByIdAndUserId as jest.Mock).mockResolvedValue(mockChartWithCalculatedData);

      await getAspectAnalysis(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            aspectAnalysis: expect.objectContaining({
              chartId: '456',
              aspectsByType: expect.any(Object),
              aspectGrid: expect.any(Object),
              majorAspects: expect.any(Array),
              harmonicAspects: expect.any(Array),
              challengingAspects: expect.any(Array),
            }),
          }),
        }),
      );
    });

    it('should throw 404 if chart not found', async () => {
      mockRequest.params = { chartId: '999' };

      (ChartModel.findByIdAndUserId as jest.Mock).mockResolvedValue(null);

      await expect(
        getAspectAnalysis(mockRequest as Request, mockResponse as Response, mockNext),
      ).rejects.toThrow(AppError);
    });

    it('should filter major aspects by orb', async () => {
      mockRequest.params = { chartId: '456' };

      (ChartModel.findByIdAndUserId as jest.Mock).mockResolvedValue(mockChartWithCalculatedData);

      await getAspectAnalysis(mockRequest as Request, mockResponse as Response, mockNext);

      const response = (mockResponse.json as jest.Mock).mock.calls[0][0];
      const majorAspects = response.data.aspectAnalysis.majorAspects;
      // Should filter aspects with orb <= 3
      expect(Array.isArray(majorAspects)).toBe(true);
    });

    it('should identify harmonious aspects', async () => {
      mockRequest.params = { chartId: '456' };

      (ChartModel.findByIdAndUserId as jest.Mock).mockResolvedValue(mockChartWithCalculatedData);

      await getAspectAnalysis(mockRequest as Request, mockResponse as Response, mockNext);

      const response = (mockResponse.json as jest.Mock).mock.calls[0][0];
      const harmonicAspects = response.data.aspectAnalysis.harmonicAspects;
      expect(Array.isArray(harmonicAspects)).toBe(true);
    });

    it('should identify challenging aspects', async () => {
      mockRequest.params = { chartId: '456' };

      (ChartModel.findByIdAndUserId as jest.Mock).mockResolvedValue(mockChartWithCalculatedData);

      await getAspectAnalysis(mockRequest as Request, mockResponse as Response, mockNext);

      const response = (mockResponse.json as jest.Mock).mock.calls[0][0];
      const challengingAspects = response.data.aspectAnalysis.challengingAspects;
      expect(Array.isArray(challengingAspects)).toBe(true);
    });
  });

  describe('getAspectPatterns', () => {
    it('should return aspect patterns', async () => {
      mockRequest.params = { chartId: '456' };

      const mockAnalysis = {
        patterns: {
          stelliums: [],
          grandTrines: [],
          tSquares: [],
          grandCrosses: [],
          yods: [],
          kites: [],
        },
      };

      (ChartModel.findByIdAndUserId as jest.Mock).mockResolvedValue(mockChartWithCalculatedData);
      (generateCompletePersonalityAnalysis as jest.Mock).mockReturnValue(mockAnalysis);

      await getAspectPatterns(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should throw 404 if chart not found', async () => {
      mockRequest.params = { chartId: '999' };

      (ChartModel.findByIdAndUserId as jest.Mock).mockResolvedValue(null);

      await expect(
        getAspectPatterns(mockRequest as Request, mockResponse as Response, mockNext),
      ).rejects.toThrow(AppError);
    });

    it('should throw 400 if chart not calculated', async () => {
      const mockChart = {
        id: '456',
        calculated_data: null,
      };

      mockRequest.params = { chartId: '456' };

      (ChartModel.findByIdAndUserId as jest.Mock).mockResolvedValue(mockChart);

      await expect(
        getAspectPatterns(mockRequest as Request, mockResponse as Response, mockNext),
      ).rejects.toThrow(AppError);
    });
  });

  describe('getPlanetsInSigns', () => {
    it('should return planets in signs', async () => {
      mockRequest.params = { chartId: '456' };

      (ChartModel.findByIdAndUserId as jest.Mock).mockResolvedValue(mockChartWithCalculatedData);
      (swissEphemeris.PLANET_SYMBOLS as any) = {
        sun: '☉',
        moon: '☽',
        mercury: '☿',
      };

      await getPlanetsInSigns(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            planetsInSigns: expect.any(Array),
          }),
        }),
      );
    });

    it('should include planet symbols', async () => {
      mockRequest.params = { chartId: '456' };

      (ChartModel.findByIdAndUserId as jest.Mock).mockResolvedValue(mockChartWithCalculatedData);

      await getPlanetsInSigns(mockRequest as Request, mockResponse as Response, mockNext);

      const response = (mockResponse.json as jest.Mock).mock.calls[0][0];
      const planetsInSigns = response.data.planetsInSigns;
      expect(Array.isArray(planetsInSigns)).toBe(true);
      expect(planetsInSigns[0]).toHaveProperty('symbol');
    });

    it('should include retrograde information', async () => {
      mockRequest.params = { chartId: '456' };

      (ChartModel.findByIdAndUserId as jest.Mock).mockResolvedValue(mockChartWithCalculatedData);

      await getPlanetsInSigns(mockRequest as Request, mockResponse as Response, mockNext);

      const response = (mockResponse.json as jest.Mock).mock.calls[0][0];
      const planetsInSigns = response.data.planetsInSigns;
      expect(planetsInSigns[0]).toHaveProperty('retrograde');
    });

    it('should throw 404 if chart not found', async () => {
      mockRequest.params = { chartId: '999' };

      (ChartModel.findByIdAndUserId as jest.Mock).mockResolvedValue(null);

      await expect(
        getPlanetsInSigns(mockRequest as Request, mockResponse as Response, mockNext),
      ).rejects.toThrow(AppError);
    });
  });

  describe('getHousesAnalysis', () => {
    it('should return houses analysis', async () => {
      mockRequest.params = { chartId: '456' };

      (ChartModel.findByIdAndUserId as jest.Mock).mockResolvedValue(mockChartWithCalculatedData);

      await getHousesAnalysis(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            housesAnalysis: expect.objectContaining({
              houses: expect.any(Array),
              planetsInHouses: expect.any(Object),
              houseRulers: expect.any(Object),
              emptyHouses: expect.any(Array),
              stelliums: expect.any(Array),
            }),
          }),
        }),
      );
    });

    it('should identify planets in houses', async () => {
      mockRequest.params = { chartId: '456' };

      (ChartModel.findByIdAndUserId as jest.Mock).mockResolvedValue(mockChartWithCalculatedData);

      await getHousesAnalysis(mockRequest as Request, mockResponse as Response, mockNext);

      const response = (mockResponse.json as jest.Mock).mock.calls[0][0];
      const housesAnalysis = response.data.housesAnalysis;
      expect(typeof housesAnalysis.planetsInHouses).toBe('object');
    });

    it('should throw 404 if chart not found', async () => {
      mockRequest.params = { chartId: '999' };

      (ChartModel.findByIdAndUserId as jest.Mock).mockResolvedValue(null);

      await expect(
        getHousesAnalysis(mockRequest as Request, mockResponse as Response, mockNext),
      ).rejects.toThrow(AppError);
    });

    it('should throw 400 if chart not calculated', async () => {
      const mockChart = {
        id: '456',
        calculated_data: null,
      };

      mockRequest.params = { chartId: '456' };

      (ChartModel.findByIdAndUserId as jest.Mock).mockResolvedValue(mockChart);

      await expect(
        getHousesAnalysis(mockRequest as Request, mockResponse as Response, mockNext),
      ).rejects.toThrow(AppError);
    });
  });

  describe('getHousesAnalysis - house rulers', () => {
    it('should calculate house rulers with correct ruling planets', async () => {
      mockRequest.params = { chartId: '456' };

      const richChart = {
        id: '456',
        calculated_data: {
          planets: {
            sun: {
              sign: 'capricorn',
              position: 295,
              longitude: 295,
              retrograde: false,
              speed: 1,
              latitude: 0,
            },
            moon: {
              sign: 'pisces',
              position: 350,
              longitude: 350,
              retrograde: false,
              speed: 1,
              latitude: 0,
            },
            mercury: {
              sign: 'aquarius',
              position: 310,
              longitude: 310,
              retrograde: false,
              speed: 1,
              latitude: 0,
            },
            venus: {
              sign: 'pisces',
              position: 345,
              longitude: 345,
              retrograde: false,
              speed: 1,
              latitude: 0,
            },
            mars: {
              sign: 'aries',
              position: 5,
              longitude: 5,
              retrograde: false,
              speed: 1,
              latitude: 0,
            },
            jupiter: {
              sign: 'leo',
              position: 135,
              longitude: 135,
              retrograde: false,
              speed: 1,
              latitude: 0,
            },
            saturn: {
              sign: 'sagittarius',
              position: 255,
              longitude: 255,
              retrograde: false,
              speed: 1,
              latitude: 0,
            },
          },
          houses: {
            houses: [
              { cusp: 300 },
              { cusp: 330 },
              { cusp: 0 },
              { cusp: 30 },
              { cusp: 60 },
              { cusp: 90 },
              { cusp: 120 },
              { cusp: 150 },
              { cusp: 180 },
              { cusp: 210 },
              { cusp: 240 },
              { cusp: 270 },
            ],
          },
          aspects: [],
        },
      };

      (ChartModel.findByIdAndUserId as jest.Mock).mockResolvedValue(richChart);

      await getHousesAnalysis(mockRequest as Request, mockResponse as Response, mockNext);

      const response = (mockResponse.json as jest.Mock).mock.calls[0][0];
      const rulers = response.data.housesAnalysis.houseRulers;

      // House 1 cusp at 300° = Aquarius → ruler is uranus (not in planets, so null)
      expect(rulers[1].ruler).toBe('uranus');
      expect(rulers[1].rulerInHouse).toBeNull();

      // House 2 cusp at 330° = Pisces → ruler is neptune (not in planets, so null)
      expect(rulers[2].ruler).toBe('neptune');

      // House 3 cusp at 0° = Aries → ruler is mars, mars is at 5° in house 3
      expect(rulers[3].ruler).toBe('mars');
      expect(rulers[3].rulerInHouse).toBe(3);
    });

    it('should identify empty houses', async () => {
      mockRequest.params = { chartId: '456' };

      (ChartModel.findByIdAndUserId as jest.Mock).mockResolvedValue(mockChartWithCalculatedData);

      await getHousesAnalysis(mockRequest as Request, mockResponse as Response, mockNext);

      const response = (mockResponse.json as jest.Mock).mock.calls[0][0];
      const empty = response.data.housesAnalysis.emptyHouses;
      expect(Array.isArray(empty)).toBe(true);
      // With only sun (295.5) and moon (350.2), most houses should be empty
      expect(empty.length).toBeGreaterThan(0);
    });

    it('should identify stelliums (3+ planets in same sign or house)', async () => {
      mockRequest.params = { chartId: '456' };

      const stelliumChart = {
        id: '456',
        calculated_data: {
          planets: {
            sun: {
              sign: 'pisces',
              position: 350,
              longitude: 350,
              retrograde: false,
              speed: 1,
              latitude: 0,
            },
            moon: {
              sign: 'pisces',
              position: 345,
              longitude: 345,
              retrograde: false,
              speed: 1,
              latitude: 0,
            },
            mercury: {
              sign: 'pisces',
              position: 340,
              longitude: 340,
              retrograde: false,
              speed: 1,
              latitude: 0,
            },
            venus: {
              sign: 'pisces',
              position: 355,
              longitude: 355,
              retrograde: false,
              speed: 1,
              latitude: 0,
            },
          },
          houses: {
            houses: [
              { cusp: 300 },
              { cusp: 330 },
              { cusp: 0 },
              { cusp: 30 },
              { cusp: 60 },
              { cusp: 90 },
              { cusp: 120 },
              { cusp: 150 },
              { cusp: 180 },
              { cusp: 210 },
              { cusp: 240 },
              { cusp: 270 },
            ],
          },
          aspects: [],
        },
      };

      (ChartModel.findByIdAndUserId as jest.Mock).mockResolvedValue(stelliumChart);

      await getHousesAnalysis(mockRequest as Request, mockResponse as Response, mockNext);

      const response = (mockResponse.json as jest.Mock).mock.calls[0][0];
      const stelliums = response.data.housesAnalysis.stelliums;
      expect(Array.isArray(stelliums)).toBe(true);
      // 4 planets in Pisces should create a stellium
      const signStelliums = stelliums.filter((s: any) => s.type === 'sign' && s.sign === 'pisces');
      expect(signStelliums.length).toBeGreaterThan(0);
      expect(signStelliums[0].planets.length).toBeGreaterThanOrEqual(3);
    });

    it('should build aspect grid with planet pairs', async () => {
      mockRequest.params = { chartId: '456' };

      (ChartModel.findByIdAndUserId as jest.Mock).mockResolvedValue(mockChartWithCalculatedData);

      await getAspectAnalysis(mockRequest as Request, mockResponse as Response, mockNext);

      const response = (mockResponse.json as jest.Mock).mock.calls[0][0];
      const grid = response.data.aspectAnalysis.aspectGrid;
      expect(grid).toBeDefined();
      expect(grid.planets).toBeDefined();
      expect(grid.grid).toBeDefined();
      // The grid should contain the aspect between sun and jupiter
      expect(grid.grid.sun?.jupiter).toBe('trine');
    });
  });

  describe('getHousesAnalysis - house rulers', () => {
    it('should calculate house rulers with correct ruling planets', async () => {
      mockRequest.params = { chartId: '456' };

      const richChart = {
        id: '456',
        calculated_data: {
          planets: {
            sun: { sign: 'capricorn', position: 295, longitude: 295, retrograde: false, speed: 1, latitude: 0 },
            moon: { sign: 'pisces', position: 350, longitude: 350, retrograde: false, speed: 1, latitude: 0 },
            mercury: { sign: 'aquarius', position: 310, longitude: 310, retrograde: false, speed: 1, latitude: 0 },
            venus: { sign: 'pisces', position: 345, longitude: 345, retrograde: false, speed: 1, latitude: 0 },
            mars: { sign: 'aries', position: 5, longitude: 5, retrograde: false, speed: 1, latitude: 0 },
            jupiter: { sign: 'leo', position: 135, longitude: 135, retrograde: false, speed: 1, latitude: 0 },
            saturn: { sign: 'sagittarius', position: 255, longitude: 255, retrograde: false, speed: 1, latitude: 0 },
          },
          houses: {
            houses: [
              { cusp: 300 }, { cusp: 330 }, { cusp: 0 }, { cusp: 30 },
              { cusp: 60 }, { cusp: 90 }, { cusp: 120 }, { cusp: 150 },
              { cusp: 180 }, { cusp: 210 }, { cusp: 240 }, { cusp: 270 },
            ],
          },
          aspects: [],
        },
      };

      (ChartModel.findByIdAndUserId as jest.Mock).mockResolvedValue(richChart);

      await getHousesAnalysis(mockRequest as Request, mockResponse as Response, mockNext);

      const response = (mockResponse.json as jest.Mock).mock.calls[0][0];
      const rulers = response.data.housesAnalysis.houseRulers;

      // House 1 cusp at 300° = Aquarius → ruler is uranus (not in planets, so null)
      expect(rulers[1].ruler).toBe('uranus');
      expect(rulers[1].rulerInHouse).toBeNull();

      // House 2 cusp at 330° = Pisces → ruler is neptune (not in planets, so null)
      expect(rulers[2].ruler).toBe('neptune');

      // House 3 cusp at 0° = Aries → ruler is mars, mars is at 5° in house 3
      expect(rulers[3].ruler).toBe('mars');
      expect(rulers[3].rulerInHouse).toBe(3);
    });

    it('should identify empty houses', async () => {
      mockRequest.params = { chartId: '456' };

      (ChartModel.findByIdAndUserId as jest.Mock).mockResolvedValue(mockChartWithCalculatedData);

      await getHousesAnalysis(mockRequest as Request, mockResponse as Response, mockNext);

      const response = (mockResponse.json as jest.Mock).mock.calls[0][0];
      const empty = response.data.housesAnalysis.emptyHouses;
      expect(Array.isArray(empty)).toBe(true);
      // With only sun (295.5) and moon (350.2), most houses should be empty
      expect(empty.length).toBeGreaterThan(0);
    });

    it('should identify stelliums (3+ planets in same sign or house)', async () => {
      mockRequest.params = { chartId: '456' };

      const stelliumChart = {
        id: '456',
        calculated_data: {
          planets: {
            sun: { sign: 'pisces', position: 350, longitude: 350, retrograde: false, speed: 1, latitude: 0 },
            moon: { sign: 'pisces', position: 345, longitude: 345, retrograde: false, speed: 1, latitude: 0 },
            mercury: { sign: 'pisces', position: 340, longitude: 340, retrograde: false, speed: 1, latitude: 0 },
            venus: { sign: 'pisces', position: 355, longitude: 355, retrograde: false, speed: 1, latitude: 0 },
          },
          houses: {
            houses: [
              { cusp: 300 }, { cusp: 330 }, { cusp: 0 }, { cusp: 30 },
              { cusp: 60 }, { cusp: 90 }, { cusp: 120 }, { cusp: 150 },
              { cusp: 180 }, { cusp: 210 }, { cusp: 240 }, { cusp: 270 },
            ],
          },
          aspects: [],
        },
      };

      (ChartModel.findByIdAndUserId as jest.Mock).mockResolvedValue(stelliumChart);

      await getHousesAnalysis(mockRequest as Request, mockResponse as Response, mockNext);

      const response = (mockResponse.json as jest.Mock).mock.calls[0][0];
      const stelliums = response.data.housesAnalysis.stelliums;
      expect(Array.isArray(stelliums)).toBe(true);
      // 4 planets in Pisces should create a stellium
      const signStelliums = stelliums.filter((s: any) => s.type === 'sign' && s.sign === 'pisces');
      expect(signStelliums.length).toBeGreaterThan(0);
      expect(signStelliums[0].planets.length).toBeGreaterThanOrEqual(3);
    });

    it('should build aspect grid with planet pairs', async () => {
      mockRequest.params = { chartId: '456' };

      (ChartModel.findByIdAndUserId as jest.Mock).mockResolvedValue(mockChartWithCalculatedData);

      await getAspectAnalysis(mockRequest as Request, mockResponse as Response, mockNext);

      const response = (mockResponse.json as jest.Mock).mock.calls[0][0];
      const grid = response.data.aspectAnalysis.aspectGrid;
      expect(grid).toBeDefined();
      expect(grid.planets).toBeDefined();
      expect(grid.grid).toBeDefined();
      // The grid should contain the aspect between sun and jupiter
      expect(grid.grid.sun?.jupiter).toBe('trine');
    });
  });

  describe('Response Structure', () => {
    it('should always return success: true for successful operations', async () => {
      mockRequest.params = { chartId: '456' };
      (ChartModel.findByIdAndUserId as jest.Mock).mockResolvedValue(mockChartWithCalculatedData);
      (generateCompletePersonalityAnalysis as jest.Mock).mockReturnValue({});

      await getPersonalityAnalysis(mockRequest as Request, mockResponse as Response, mockNext);

      const response = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(response.success).toBe(true);
    });

    it('should include data object in responses', async () => {
      mockRequest.params = { chartId: '456' };
      (ChartModel.findByIdAndUserId as jest.Mock).mockResolvedValue(mockChartWithCalculatedData);

      await getPlanetsInSigns(mockRequest as Request, mockResponse as Response, mockNext);

      const response = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(response.data).toBeDefined();
    });
  });
});
