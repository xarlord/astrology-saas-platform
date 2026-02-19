/**
 * Unit Tests for Chart Controller
 * Tests chart CRUD operations and calculation
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import { Request, Response } from 'express';
import {
  createChart,
  getUserCharts,
  getChart,
  updateChart,
  deleteChart,
  calculateChart,
} from '../../controllers/chart.controller';
import { AppError } from '../../middleware/errorHandler';
import ChartModel from '../../modules/charts/models/chart.model';
import { swissEphemeris } from '../../modules/shared';

// Mock dependencies
jest.mock('../../modules/charts/models/chart.model', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    findByUserId: jest.fn(),
    countByUserId: jest.fn(),
    findByIdAndUserId: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    updateCalculatedData: jest.fn(),
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

describe('Chart Controller', () => {
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

  describe('createChart', () => {
    it('should create new chart successfully', async () => {
      const chartData = {
        name: 'My Natal Chart',
        type: 'natal',
        birth_date: '1990-01-15',
        birth_time: '14:30:00',
        birth_place_name: 'New York, NY',
        birth_latitude: 40.7128,
        birth_longitude: -74.0060,
        birth_timezone: 'America/New_York',
        house_system: 'placidus',
        zodiac: 'tropical',
      };

      mockRequest.body = chartData;

      const createdChart = {
        id: '456',
        user_id: '123',
        ...chartData,
        birth_date: new Date(chartData.birth_date),
      };

      (ChartModel.create as jest.Mock).mockResolvedValue(createdChart);

      await createChart(mockRequest as Request, mockResponse as Response, mockNext);

      expect(ChartModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: '123',
          name: chartData.name,
          type: 'natal',
        })
      );
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: { chart: createdChart },
      });
    });

    it('should throw 400 if required fields missing', async () => {
      mockRequest.body = {
        name: 'Test Chart',
        // Missing birth_date, birth_place_name, etc.
      };

      await expect(createChart(mockRequest as Request, mockResponse as Response, mockNext)).rejects.toThrow(AppError);
      await expect(createChart(mockRequest as Request, mockResponse as Response, mockNext)).rejects.toThrow('Missing required fields');
    });

    it('should use default values for optional fields', async () => {
      const chartData = {
        name: 'Test Chart',
        birth_date: '1990-01-15',
        birth_place_name: 'New York, NY',
        birth_latitude: 40.7128,
        birth_longitude: -74.0060,
        birth_timezone: 'America/New_York',
      };

      mockRequest.body = chartData;

      (ChartModel.create as jest.Mock).mockResolvedValue({ id: '456' });

      await createChart(mockRequest as Request, mockResponse as Response, mockNext);

      expect(ChartModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'natal',
          birth_time_unknown: false,
          house_system: 'placidus',
          zodiac: 'tropical',
        })
      );
    });

    it('should handle birth_time_unknown flag', async () => {
      const chartData = {
        name: 'Test Chart',
        birth_date: '1990-01-15',
        birth_time_unknown: true,
        birth_place_name: 'New York, NY',
        birth_latitude: 40.7128,
        birth_longitude: -74.0060,
        birth_timezone: 'America/New_York',
      };

      mockRequest.body = chartData;

      (ChartModel.create as jest.Mock).mockResolvedValue({ id: '456' });

      await createChart(mockRequest as Request, mockResponse as Response, mockNext);

      expect(ChartModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          birth_time_unknown: true,
          birth_time: '12:00:00',
        })
      );
    });

    it('should accept sidereal_mode for sidereal charts', async () => {
      const chartData = {
        name: 'Sidereal Chart',
        birth_date: '1990-01-15',
        birth_place_name: 'New York, NY',
        birth_latitude: 40.7128,
        birth_longitude: -74.0060,
        birth_timezone: 'America/New_York',
        zodiac: 'sidereal',
        sidereal_mode: 'lahiri',
      };

      mockRequest.body = chartData;

      (ChartModel.create as jest.Mock).mockResolvedValue({ id: '456' });

      await createChart(mockRequest as Request, mockResponse as Response, mockNext);

      expect(ChartModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          zodiac: 'sidereal',
          sidereal_mode: 'lahiri',
        })
      );
    });
  });

  describe('getUserCharts', () => {
    it('should get user charts with pagination', async () => {
      mockRequest.query = { page: '1', limit: '10' };

      const mockCharts = [
        { id: '1', name: 'Chart 1' },
        { id: '2', name: 'Chart 2' },
      ];

      (ChartModel.findByUserId as jest.Mock).mockResolvedValue(mockCharts);
      (ChartModel.countByUserId as jest.Mock).mockResolvedValue(2);

      await getUserCharts(mockRequest as Request, mockResponse as Response, mockNext);

      expect(ChartModel.findByUserId).toHaveBeenCalledWith('123', 10, 0);
      expect(ChartModel.countByUserId).toHaveBeenCalledWith('123');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          charts: mockCharts,
          pagination: {
            page: 1,
            limit: 10,
            total: 2,
            pages: 1,
          },
        },
      });
    });

    it('should use default pagination values', async () => {
      mockRequest.query = {};

      (ChartModel.findByUserId as jest.Mock).mockResolvedValue([]);
      (ChartModel.countByUserId as jest.Mock).mockResolvedValue(0);

      await getUserCharts(mockRequest as Request, mockResponse as Response, mockNext);

      expect(ChartModel.findByUserId).toHaveBeenCalledWith('123', 20, 0);
    });

    it('should calculate pagination correctly', async () => {
      mockRequest.query = { page: '2', limit: '10' };

      (ChartModel.findByUserId as jest.Mock).mockResolvedValue([]);
      (ChartModel.countByUserId as jest.Mock).mockResolvedValue(25);

      await getUserCharts(mockRequest as Request, mockResponse as Response, mockNext);

      expect(ChartModel.findByUserId).toHaveBeenCalledWith('123', 10, 10);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            pagination: expect.objectContaining({
              page: 2,
              pages: 3,
            }),
          }),
        })
      );
    });
  });

  describe('getChart', () => {
    it('should get specific chart by id', async () => {
      mockRequest.params = { id: '456' };

      const mockChart = {
        id: '456',
        user_id: '123',
        name: 'My Chart',
      };

      (ChartModel.findByIdAndUserId as jest.Mock).mockResolvedValue(mockChart);

      await getChart(mockRequest as Request, mockResponse as Response, mockNext);

      expect(ChartModel.findByIdAndUserId).toHaveBeenCalledWith('456', '123');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: { chart: mockChart },
      });
    });

    it('should throw 404 if chart not found', async () => {
      mockRequest.params = { id: '999' };

      (ChartModel.findByIdAndUserId as jest.Mock).mockResolvedValue(null);

      await expect(getChart(mockRequest as Request, mockResponse as Response, mockNext)).rejects.toThrow(AppError);
      await expect(getChart(mockRequest as Request, mockResponse as Response, mockNext)).rejects.toThrow('Chart not found');
    });
  });

  describe('updateChart', () => {
    it('should update chart name', async () => {
      mockRequest.params = { id: '456' };
      mockRequest.body = { name: 'Updated Chart Name' };

      const updatedChart = {
        id: '456',
        name: 'Updated Chart Name',
      };

      (ChartModel.update as jest.Mock).mockResolvedValue(updatedChart);

      await updateChart(mockRequest as Request, mockResponse as Response, mockNext);

      expect(ChartModel.update).toHaveBeenCalledWith('456', '123', {
        name: 'Updated Chart Name',
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should update house system', async () => {
      mockRequest.params = { id: '456' };
      mockRequest.body = { house_system: 'whole_sign' };

      (ChartModel.update as jest.Mock).mockResolvedValue({ id: '456', house_system: 'whole_sign' });

      await updateChart(mockRequest as Request, mockResponse as Response, mockNext);

      expect(ChartModel.update).toHaveBeenCalledWith('456', '123', {
        house_system: 'whole_sign',
      });
    });

    it('should update zodiac type', async () => {
      mockRequest.params = { id: '456' };
      mockRequest.body = { zodiac: 'sidereal', sidereal_mode: 'fagan-bradley' };

      (ChartModel.update as jest.Mock).mockResolvedValue({ id: '456', zodiac: 'sidereal' });

      await updateChart(mockRequest as Request, mockResponse as Response, mockNext);

      expect(ChartModel.update).toHaveBeenCalledWith('456', '123', {
        zodiac: 'sidereal',
        sidereal_mode: 'fagan-bradley',
      });
    });

    it('should throw 404 if chart not found', async () => {
      mockRequest.params = { id: '999' };
      mockRequest.body = { name: 'Updated' };

      (ChartModel.update as jest.Mock).mockResolvedValue(null);

      await expect(updateChart(mockRequest as Request, mockResponse as Response, mockNext)).rejects.toThrow(AppError);
      await expect(updateChart(mockRequest as Request, mockResponse as Response, mockNext)).rejects.toThrow('Chart not found');
    });
  });

  describe('deleteChart', () => {
    it('should delete chart successfully', async () => {
      mockRequest.params = { id: '456' };

      (ChartModel.softDelete as jest.Mock).mockResolvedValue(true);

      await deleteChart(mockRequest as Request, mockResponse as Response, mockNext);

      expect(ChartModel.softDelete).toHaveBeenCalledWith('456', '123');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Chart deleted successfully',
      });
    });

    it('should throw 404 if chart not found', async () => {
      mockRequest.params = { id: '999' };

      (ChartModel.softDelete as jest.Mock).mockResolvedValue(false);

      await expect(deleteChart(mockRequest as Request, mockResponse as Response, mockNext)).rejects.toThrow(AppError);
      await expect(deleteChart(mockRequest as Request, mockResponse as Response, mockNext)).rejects.toThrow('Chart not found');
    });
  });

  describe('calculateChart', () => {
    it('should return cached calculation if exists', async () => {
      mockRequest.params = { id: '456' };

      const mockChart = {
        id: '456',
        calculated_data: {
          jd: 2451545.0,
          planets: { sun: { sign: 'capricorn' } },
          houses: { houses: [] },
        },
      };

      (ChartModel.findByIdAndUserId as jest.Mock).mockResolvedValue(mockChart);

      await calculateChart(mockRequest as Request, mockResponse as Response, mockNext);

      expect(swissEphemeris.calculateNatalChart).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: { chart: mockChart },
      });
    });

    it('should calculate chart if not cached', async () => {
      mockRequest.params = { id: '456' };

      const mockChart = {
        id: '456',
        birth_date: '1990-01-15',
        birth_time: '14:30:00',
        birth_latitude: 40.7128,
        birth_longitude: -74.0060,
        house_system: 'placidus',
        calculated_data: null,
      };

      const calculatedData = {
        jd: 2451545.0,
        planets: { sun: { sign: 'capricorn', position: 295.5 } },
        houses: { houses: [{ cusp: 300, sign: 'aquarius' }] },
        aspects: [],
      };

      const updatedChart = {
        id: '456',
        calculated_data: calculatedData,
      };

      (ChartModel.findByIdAndUserId as jest.Mock).mockResolvedValue(mockChart);
      (swissEphemeris.calculateNatalChart as jest.Mock).mockReturnValue(calculatedData);
      (ChartModel.updateCalculatedData as jest.Mock).mockResolvedValue(updatedChart);

      await calculateChart(mockRequest as Request, mockResponse as Response, mockNext);

      expect(swissEphemeris.calculateNatalChart).toHaveBeenCalledWith({
        birthDate: new Date(mockChart.birth_date),
        birthTime: mockChart.birth_time,
        latitude: mockChart.birth_latitude,
        longitude: mockChart.birth_longitude,
        houseSystem: mockChart.house_system,
      });
      expect(ChartModel.updateCalculatedData).toHaveBeenCalledWith('456', '123', calculatedData);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should throw 404 if chart not found', async () => {
      mockRequest.params = { id: '999' };

      (ChartModel.findByIdAndUserId as jest.Mock).mockResolvedValue(null);

      await expect(calculateChart(mockRequest as Request, mockResponse as Response, mockNext)).rejects.toThrow(AppError);
      await expect(calculateChart(mockRequest as Request, mockResponse as Response, mockNext)).rejects.toThrow('Chart not found');
    });
  });

  describe('Response Structure', () => {
    it('should always return success: true for successful operations', async () => {
      mockRequest.params = { id: '456' };
      (ChartModel.findByIdAndUserId as jest.Mock).mockResolvedValue({
        id: '456',
        calculated_data: { jd: 2451545.0 },
      });

      await calculateChart(mockRequest as Request, mockResponse as Response, mockNext);

      const response = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(response.success).toBe(true);
    });

    it('should include data object in responses', async () => {
      mockRequest.body = {
        name: 'Test',
        birth_date: '1990-01-15',
        birth_place_name: 'New York',
        birth_latitude: 40.7128,
        birth_longitude: -74.0060,
        birth_timezone: 'America/New_York',
      };
      (ChartModel.create as jest.Mock).mockResolvedValue({ id: '456' });

      await createChart(mockRequest as Request, mockResponse as Response, mockNext);

      const response = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(response.data).toBeDefined();
      expect(response.data.chart).toBeDefined();
    });
  });
});
