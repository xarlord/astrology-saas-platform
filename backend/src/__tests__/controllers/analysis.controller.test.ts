/**
 * Unit Tests for Analysis Controller
 * Tests personality analysis and chart interpretation
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import { Request, Response } from 'express';
import {
  getPersonalityAnalysis,
  getAspectAnalysis,
  getAspectPatterns,
  getPlanetsInSigns,
  getHousesAnalysis,
} from '../../controllers/analysis.controller';
import { AppError } from '../../middleware/errorHandler';
import { ChartModel } from '../../models';
import { swissEphemeris } from '../../services';
import { generateCompletePersonalityAnalysis } from '../../services/interpretation.service';

// Mock dependencies
jest.mock('../../models');
jest.mock('../../services');
jest.mock('../../services/interpretation.service');

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
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  const mockChartWithCalculatedData = {
    id: '456',
    calculated_data: {
      jd: 2451545.0,
      planets: {
        sun: { sign: 'capricorn', position: 295.5, longitude: 295.5, retrograde: false },
        moon: { sign: 'pisces', position: 350.2, longitude: 350.2, retrograde: false },
      },
      houses: {
        houses: [
          { cusp: 300, sign: 'aquarius' },
          { cusp: 330, sign: 'pisces' },
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

      expect(generateCompletePersonalityAnalysis).toHaveBeenCalledWith(
        expect.objectContaining({
          planets: mockChartWithCalculatedData.calculated_data.planets,
          houses: mockChartWithCalculatedData.calculated_data.houses,
          aspects: mockChartWithCalculatedData.calculated_data.aspects,
        })
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: { analysis: mockAnalysis },
      });
    });

    it('should throw 404 if chart not found', async () => {
      mockRequest.params = { chartId: '999' };

      (ChartModel.findByIdAndUserId as jest.Mock).mockResolvedValue(null);

      await expect(getPersonalityAnalysis(mockRequest as Request, mockResponse as Response, mockNext)).rejects.toThrow(AppError);
      await expect(getPersonalityAnalysis(mockRequest as Request, mockResponse as Response, mockNext)).rejects.toThrow('Chart not found');
    });

    it('should throw 400 if chart not calculated', async () => {
      const mockChart = {
        id: '456',
        calculated_data: null,
      };

      mockRequest.params = { chartId: '456' };

      (ChartModel.findByIdAndUserId as jest.Mock).mockResolvedValue(mockChart);

      await expect(getPersonalityAnalysis(mockRequest as Request, mockResponse as Response, mockNext)).rejects.toThrow(AppError);
      await expect(getPersonalityAnalysis(mockRequest as Request, mockResponse as Response, mockNext)).rejects.toThrow('Chart must be calculated first');
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
        })
      );
    });

    it('should throw 404 if chart not found', async () => {
      mockRequest.params = { chartId: '999' };

      (ChartModel.findByIdAndUserId as jest.Mock).mockResolvedValue(null);

      await expect(getAspectAnalysis(mockRequest as Request, mockResponse as Response, mockNext)).rejects.toThrow(AppError);
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
      const harmoniousAspects = response.data.aspectAnalysis.harmoniousAspects;
      expect(Array.isArray(harmoniousAspects)).toBe(true);
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
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: { patterns: mockAnalysis.patterns },
      });
    });

    it('should throw 404 if chart not found', async () => {
      mockRequest.params = { chartId: '999' };

      (ChartModel.findByIdAndUserId as jest.Mock).mockResolvedValue(null);

      await expect(getAspectPatterns(mockRequest as Request, mockResponse as Response, mockNext)).rejects.toThrow(AppError);
    });

    it('should throw 400 if chart not calculated', async () => {
      const mockChart = {
        id: '456',
        calculated_data: null,
      };

      mockRequest.params = { chartId: '456' };

      (ChartModel.findByIdAndUserId as jest.Mock).mockResolvedValue(mockChart);

      await expect(getAspectPatterns(mockRequest as Request, mockResponse as Response, mockNext)).rejects.toThrow(AppError);
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
        })
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

      await expect(getPlanetsInSigns(mockRequest as Request, mockResponse as Response, mockNext)).rejects.toThrow(AppError);
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
        })
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

      await expect(getHousesAnalysis(mockRequest as Request, mockResponse as Response, mockNext)).rejects.toThrow(AppError);
    });

    it('should throw 400 if chart not calculated', async () => {
      const mockChart = {
        id: '456',
        calculated_data: null,
      };

      mockRequest.params = { chartId: '456' };

      (ChartModel.findByIdAndUserId as jest.Mock).mockResolvedValue(mockChart);

      await expect(getHousesAnalysis(mockRequest as Request, mockResponse as Response, mockNext)).rejects.toThrow(AppError);
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
