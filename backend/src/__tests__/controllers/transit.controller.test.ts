/**
 * Unit Tests for Transit Controller
 * Tests transit calculations and forecasting
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Response } from 'express';
import {
  calculateTransits,
  getTodayTransits,
  getTransitCalendar,
  getTransitDetails,
  getTransitForecast,
} from '../../modules/transits/controllers/transit.controller';
import { AppError } from '../../utils/appError';
import ChartModel from '../../modules/charts/models/chart.model';

// ---------------------------------------------------------------------------
// Mock setup
// ---------------------------------------------------------------------------

// Mock ChartModel
jest.mock('../../modules/charts/models/chart.model', () => ({
  __esModule: true,
  default: {
    findByIdAndUserId: jest.fn(),
    findByUserId: jest.fn(),
  },
}));

// Mock knex for transit_readings lookups
jest.mock('../../config/database', () => {
  const first = jest.fn();
  const where = jest.fn(() => ({ first }));
  const knex = jest.fn(() => ({ where }));
  (knex as any).raw = jest.fn();
  return { __esModule: true, default: knex };
});

// Auto-mock AstronomyEngineService. jest.mock (not jest.doMock!) hoists the
 module,
// creating a mock class. The controller creates a module-level singleton at import time.
  // We then find that singleton instance via mock.instances[0].
jest.mock('../../modules/shared/services/astronomyEngine.service');

import { AstronomyEngineService } from '../../modules/shared/services/astronomyEngine.service';
import knex from '../../config/database';

// Access the chained mock functions from the hoisted mock
const getKnexMocks = () => {
  // knex() returns { where }, where() returns { first }
  const first = jest.fn();
  const where = jest.fn(() => ({ first }));
  (knex as jest.Mock).mockReturnValue({ where });
  return { first, where };
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeMockPositions(): Map<string, any> {
  const positions = new Map<string, any>();
  const planetData = [
    { name: 'Sun', longitude: 280, latitude: 0, speed: 1, isRetrograde: false },
    { name: 'Moon', longitude: 100, latitude: 5, speed: 13, isRetrograde: false },
    { name: 'Mercury', longitude: 305, latitude: 2, speed: 1.5, isRetrograde: false },
    { name: 'Venus', longitude: 340, latitude: -1, speed: 1.2, isRetrograde: false },
    { name: 'Mars', longitude: 15, latitude: 1, speed: 0.8, isRetrograde: false },
    { name: 'Jupiter', longitude: 45, latitude: -2, speed: 0.3, isRetrograde: false },
    { name: 'Saturn', longitude: 350, latitude: 2, speed: 0.2, isRetrograde: false },
    { name: 'Uranus', longitude: 50, latitude: -1, speed: 0.1, isRetrograde: false },
    { name: 'Neptune', longitude: 355, latitude: 1, speed: 0.08, isRetrograde: false },
    { name: 'Pluto', longitude: 300, latitude: -3, speed: 0.05, isRetrograde: false },
  ];
  for (const p of planetData) {
    positions.set(p.name, {
      ...p,
      name: p.name,
      distance: 1,
      sign: 'Aries',
      signIndex: 0,
      degree: 0,
      minute: 0,
      second: 0,
    });
  }
  return positions;
}

/**
 * Get the mock instance that the AstronomyEngineService that the controller uses.
  * The controller creates a module-level singleton at import time, so the auto-mock creates it once.
  */
function getEngineMockInstance() {
  return (AstronomyEngineService as jest.Mock).mock.instances[0];
}



// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Transit Controller', () => {
  let mockRequest: Partial<any>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Re-apply mock return values on the auto-mocked instance
    const engine = getEngineMockInstance();
    if (engine) {
      engine.calculatePlanetaryPositions.mockReturnValue(makeMockPositions());
      engine.calculateChiron.mockReturnValue({
        longitude: 200,
        sign: 'Libra',
        degree: 20,
        isRetrograde: false,
      });
      engine.calculateLunarNodes.mockReturnValue({
        northNode: { longitude: 150, sign: 'Virgo', degree: 0 },
        southNode: { longitude: 330, sign: 'Pisces', degree: 0 },
      });
    }

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

  describe('calculateTransits', () => {
    it('should calculate transits for date range', async () => {
      const mockChart = {
        id: '456',
        birth_date: new Date('1990-01-01'),
        birth_latitude: 40.7,
        birth_longitude: -74.0,
        calculated_data: {
          jd: 2451545.0,
          planets: { sun: { longitude: 280 }, moon: { longitude: 100 } },
          houses: { houses: [] },
        },
      };

      mockRequest.body = {
        chartId: '456',
        startDate: '2024-01-01',
        endDate: '2024-01-07',
      };

      (ChartModel.findByIdAndUserId as jest.Mock).mockResolvedValue(mockChart);

      await calculateTransits(mockRequest, mockResponse as Response, mockNext);

      expect(ChartModel.findByIdAndUserId).toHaveBeenCalledWith('456', '123');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            chartId: '456',
            startDate: '2024-01-01',
            endDate: '2024-01-07',
          }),
        })
      );
    });

    it('should throw 404 if chart not found', async () => {
      mockRequest.body = {
        chartId: '999',
        startDate: '2024-01-01',
        endDate: '2024-01-07',
      };

      (ChartModel.findByIdAndUserId as jest.Mock).mockResolvedValue(null);

      await expect(calculateTransits(mockRequest, mockResponse as Response, mockNext)).rejects.toThrow(AppError);
      await expect(calculateTransits(mockRequest, mockResponse as Response, mockNext)).rejects.toThrow('Chart not found');
    });

    it('should throw 400 if chart not calculated', async () => {
      const mockChart = {
        id: '456',
        calculated_data: null,
      };

      mockRequest.body = {
        chartId: '456',
        startDate: '2024-01-01',
        endDate: '2024-01-07',
      };

      (ChartModel.findByIdAndUserId as jest.Mock).mockResolvedValue(mockChart);
      await expect(calculateTransits(mockRequest, mockResponse as Response, mockNext)).rejects.toThrow(AppError);
      await expect(calculateTransits(mockRequest, mockResponse as Response, mockNext)).rejects.toThrow('Chart must be calculated first');
    });
  });

  describe('getTodayTransits', () => {
    it("should get today's transits", async () => {
      const mockChart = {
        id: '456',
        name: 'My Chart',
        birth_date: new Date('1990-01-01'),
        birth_latitude: 40.7,
        birth_longitude: -74.0,
        calculated_data: {
          jd: 2451545.0,
          planets: { sun: { longitude: 280 }, moon: { longitude: 100 } },
          houses: { houses: [] },
        },
      };

      (ChartModel.findByUserId as jest.Mock).mockResolvedValue([mockChart]);

      await getTodayTransits(mockRequest, mockResponse as Response, mockNext);
      expect(ChartModel.findByUserId).toHaveBeenCalledWith('123', 1, 0);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should fall back to general transits if no charts found', async () => {
      (ChartModel.findByUserId as jest.Mock).mockResolvedValue([]);
      await getTodayTransits(mockRequest, mockResponse as Response, mockNext);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ isGeneral: true }),
        }),
      );
    });

    it('should fall back to general transits if chart not calculated', async () => {
      const mockChart = {
        id: '456',
        calculated_data: null,
      };

      (ChartModel.findByUserId as jest.Mock).mockResolvedValue([mockChart]);
      await getTodayTransits(mockRequest, mockResponse as Response, mockNext);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ isGeneral: true }),
        }),
      );
    });
  });

  describe('getTransitCalendar', () => {
    it('should get transit calendar for month', async () => {
      const mockChart = {
        id: '456',
        birth_date: new Date('1990-01-01'),
        birth_latitude: 40.7,
        birth_longitude: -74.0,
        calculated_data: {
          jd: 2451545.0,
          planets: { sun: { longitude: 280 } },
          houses: {},
        },
      };

      mockRequest.query = { month: '1', year: '2024' };
      (ChartModel.findByUserId as jest.Mock).mockResolvedValue([mockChart]);

      await getTransitCalendar(mockRequest, mockResponse as Response, mockNext);
      expect(ChartModel.findByUserId).toHaveBeenCalledWith('123', 1, 0);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should throw 404 if no charts found', async () => {
      mockRequest.query = { month: '1', year: '2024' };

      (ChartModel.findByUserId as jest.Mock).mockResolvedValue([]);

      await expect(getTransitCalendar(mockRequest, mockResponse as Response, mockNext)).rejects.toThrow(AppError);
    });
  });

  describe('getTransitDetails', () => {
    it('should return stored transit reading by ID', async () => {
      mockRequest.params = { id: 'reading-789' };

      const { first } = getKnexMocks();
      const mockReading = {
        id: 'reading-789',
        user_id: '123',
        chart_id: 'chart-456',
        start_date: '2024-01-01',
        end_date: '2024-01-31',
        transit_data: { readings: [{ date: '2024-01-15', aspects: [] }] },
        moon_phases: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };
      first.mockResolvedValue(mockReading);

      await getTransitDetails(mockRequest, mockResponse as Response, mockNext);

      expect(knex).toHaveBeenCalledWith('transit_readings');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            id: 'reading-789',
            chartId: 'chart-456',
            startDate: '2024-01-01',
            endDate: '2024-01-31',
          }),
        }),
      );
    });

    it('should throw 404 if transit reading not found', async () => {
      mockRequest.params = { id: 'nonexistent' };
      const { first } = getKnexMocks();
      first.mockResolvedValue(null);

      await expect(getTransitDetails(mockRequest, mockResponse as Response, mockNext))
        .rejects.toThrow(AppError);
      await expect(getTransitDetails(mockRequest, mockResponse as Response, mockNext))
        .rejects.toThrow('Transit reading not found');
    });

    it('should parse string transit_data and moon_phases', async () => {
      mockRequest.params = { id: 'reading-json' };

      const { first } = getKnexMocks();
      const mockReading = {
        id: 'reading-json',
        user_id: '123',
        chart_id: 'chart-1',
        start_date: '2024-02-01',
        end_date: '2024-02-28',
        transit_data: JSON.stringify({ readings: [] }),
        moon_phases: JSON.stringify([{ phase: 'full' }]),
        created_at: '2024-02-01T00:00:00Z',
        updated_at: '2024-02-01T00:00:00Z',
      };
      first.mockResolvedValue(mockReading);

      await getTransitDetails(mockRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      const response = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(response.data.transitData).toEqual({ readings: [] });
      expect(response.data.moonPhases).toEqual([{ phase: 'full' }]);
    });
  });

  describe('getTransitForecast', () => {
    it('should get weekly forecast', async () => {
      const mockChart = {
        id: '456',
        name: 'My Chart',
        birth_date: new Date('1990-01-01'),
        birth_latitude: 40.7,
        birth_longitude: -74.0,
        calculated_data: {
          jd: 2451545.0,
          planets: { sun: { longitude: 280 } },
          houses: {},
        },
      };

      mockRequest.query = { duration: 'week' };

      (ChartModel.findByUserId as jest.Mock).mockResolvedValue([mockChart]);

      await getTransitForecast(mockRequest, mockResponse as Response, mockNext);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            duration: 'week',
          }),
        })
      );
    });

    it('should throw 404 if no charts found', async () => {
      mockRequest.query = { duration: 'week' };

      (ChartModel.findByUserId as jest.Mock).mockResolvedValue([]);

      await expect(getTransitForecast(mockRequest, mockResponse as Response, mockNext)).rejects.toThrow(AppError);
    });
  });

  describe('Response Structure', () => {
    it('should always return success: true for successful operations', async () => {
      const mockChart = {
        id: '456',
        name: 'Chart',
        birth_date: new Date('1990-01-01'),
        birth_latitude: 40.7,
        birth_longitude: -74.0,
        calculated_data: { jd: 2451545.0, planets: { sun: { longitude: 280 } }, houses: {} },
      };

      mockRequest.body = {
        chartId: '456',
        startDate: '2024-01-01',
        endDate: '2024-01-07',
      };

      (ChartModel.findByIdAndUserId as jest.Mock).mockResolvedValue(mockChart);

      await calculateTransits(mockRequest, mockResponse as Response, mockNext);
      const response = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(response.success).toBe(true);
    });
  });
});
