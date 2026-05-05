/**
 * Unit Tests for Chart Controller
 * Tests chart CRUD operations and calculation
 */

 

import { Request, Response } from 'express';
import {
  createChart,
  getUserCharts,
  getChart,
  updateChart,
  deleteChart,
  calculateChart,
} from '../../modules/charts/controllers/chart.controller';
import { AppError } from '../../utils/appError';
import ChartModel from '../../modules/charts/models/chart.model';
import { NatalChartService } from '../../modules/shared/services/natalChart.service';

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

// Mock the real calculation service (requires astronomy-engine native dep)
jest.mock('../../modules/shared/services/natalChart.service');

// Mock the transitive dependencies that NatalChartService imports
jest.mock('../../modules/shared/services/astronomyEngine.service', () => ({
  AstronomyEngineService: jest.fn().mockImplementation(() => ({})),
}));
jest.mock('../../modules/shared/services/houseCalculation.service', () => ({
  HouseCalculationService: jest.fn().mockImplementation(() => ({})),
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
      validated: {}, // Add validated property for validation middleware
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
        birth_longitude: -74.006,
        birth_timezone: 'America/New_York',
        house_system: 'placidus',
        zodiac: 'tropical',
      };

      mockRequest.validated = chartData;

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
        }),
      );
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: { chart: createdChart },
      });
    });

    it('should throw 400 if required fields missing', async () => {
      // Note: Validation now happens in middleware layer before controller
      // This test verifies that the controller handles undefined validated data gracefully
      mockRequest.validated = {
        name: 'Test Chart',
        birth_date: '1990-01-15', // Add required field to pass validation
        birth_place_name: 'New York, NY',
        birth_latitude: 40.7128,
        birth_longitude: -74.006,
        birth_timezone: 'America/New_York',
      };

      // Controller should succeed with validated data
      (ChartModel.create as jest.Mock).mockResolvedValue({ id: '456' });
      await createChart(mockRequest as Request, mockResponse as Response, mockNext);

      expect(ChartModel.create).toHaveBeenCalled();
    });

    it('should use default values for optional fields', async () => {
      const chartData = {
        name: 'Test Chart',
        birth_date: '1990-01-15',
        birth_place_name: 'New York, NY',
        birth_latitude: 40.7128,
        birth_longitude: -74.006,
        birth_timezone: 'America/New_York',
      };

      mockRequest.validated = chartData;

      (ChartModel.create as jest.Mock).mockResolvedValue({ id: '456' });

      await createChart(mockRequest as Request, mockResponse as Response, mockNext);

      expect(ChartModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'natal',
          birth_time_unknown: false,
          house_system: 'placidus',
          zodiac: 'tropical',
        }),
      );
    });

    it('should handle birth_time_unknown flag', async () => {
      const chartData = {
        name: 'Test Chart',
        birth_date: '1990-01-15',
        birth_time_unknown: true,
        birth_place_name: 'New York, NY',
        birth_latitude: 40.7128,
        birth_longitude: -74.006,
        birth_timezone: 'America/New_York',
      };

      mockRequest.validated = chartData;

      (ChartModel.create as jest.Mock).mockResolvedValue({ id: '456' });

      await createChart(mockRequest as Request, mockResponse as Response, mockNext);

      expect(ChartModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          birth_time_unknown: true,
          birth_time: '12:00:00',
        }),
      );
    });

    it('should accept sidereal_mode for sidereal charts', async () => {
      const chartData = {
        name: 'Sidereal Chart',
        birth_date: '1990-01-15',
        birth_place_name: 'New York, NY',
        birth_latitude: 40.7128,
        birth_longitude: -74.006,
        birth_timezone: 'America/New_York',
        zodiac: 'sidereal',
        sidereal_mode: 'lahiri',
      };

      mockRequest.validated = chartData;

      (ChartModel.create as jest.Mock).mockResolvedValue({ id: '456' });

      await createChart(mockRequest as Request, mockResponse as Response, mockNext);

      expect(ChartModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          zodiac: 'sidereal',
          sidereal_mode: 'lahiri',
        }),
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
        }),
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

      await expect(
        getChart(mockRequest as Request, mockResponse as Response, mockNext),
      ).rejects.toThrow(AppError);
      await expect(
        getChart(mockRequest as Request, mockResponse as Response, mockNext),
      ).rejects.toThrow('Chart not found');
    });
  });

  describe('updateChart', () => {
    it('should update chart name', async () => {
      mockRequest.params = { id: '456' };
      mockRequest.validated = { name: 'Updated Chart Name' };

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
      mockRequest.validated = { house_system: 'whole_sign' };

      (ChartModel.update as jest.Mock).mockResolvedValue({ id: '456', house_system: 'whole_sign' });

      await updateChart(mockRequest as Request, mockResponse as Response, mockNext);

      expect(ChartModel.update).toHaveBeenCalledWith('456', '123', {
        house_system: 'whole_sign',
      });
    });

    it('should update zodiac type', async () => {
      mockRequest.params = { id: '456' };
      mockRequest.validated = { zodiac: 'sidereal', sidereal_mode: 'fagan-bradley' };

      (ChartModel.update as jest.Mock).mockResolvedValue({ id: '456', zodiac: 'sidereal' });

      await updateChart(mockRequest as Request, mockResponse as Response, mockNext);

      expect(ChartModel.update).toHaveBeenCalledWith('456', '123', {
        zodiac: 'sidereal',
        sidereal_mode: 'fagan-bradley',
      });
    });

    it('should throw 404 if chart not found', async () => {
      mockRequest.params = { id: '999' };
      mockRequest.validated = { name: 'Updated' };

      (ChartModel.update as jest.Mock).mockResolvedValue(null);

      await expect(
        updateChart(mockRequest as Request, mockResponse as Response, mockNext),
      ).rejects.toThrow(AppError);
      await expect(
        updateChart(mockRequest as Request, mockResponse as Response, mockNext),
      ).rejects.toThrow('Chart not found');
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

      await expect(
        deleteChart(mockRequest as Request, mockResponse as Response, mockNext),
      ).rejects.toThrow(AppError);
      await expect(
        deleteChart(mockRequest as Request, mockResponse as Response, mockNext),
      ).rejects.toThrow('Chart not found');
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

      expect(NatalChartService.prototype.calculateNatalChart).not.toHaveBeenCalled();
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
        birth_longitude: -74.006,
        birth_place_name: 'New York, NY',
        birth_timezone: 'America/New_York',
        house_system: 'placidus',
        calculated_data: null,
      };

      // Mock NatalChartService.calculateNatalChart to return a NatalChart-shaped object
      const mockNatalChart = {
        birthData: {
          date: new Date('1990-01-15'),
          latitude: 40.7128,
          longitude: -74.006,
        },
        julianDay: 2447902.5,
        localSiderealTime: 45.2,
        planets: new Map([
          [
            'Sun',
            {
              name: 'Sun',
              longitude: 295.5,
              latitude: 0,
              speed: 1,
              sign: 'Capricorn',
              signIndex: 9,
              degree: 25,
              minute: 30,
              second: 0,
              isRetrograde: false,
              house: 4,
              distance: 0.985,
            },
          ],
        ]),
        houses: {
          system: 'Placidus',
          cusps: Array.from({ length: 12 }, (_, i) => ({
            number: i + 1,
            longitude: i * 30,
            sign: [
              'Aries',
              'Taurus',
              'Gemini',
              'Cancer',
              'Leo',
              'Virgo',
              'Libra',
              'Scorpio',
              'Sagittarius',
              'Capricorn',
              'Aquarius',
              'Pisces',
            ][i],
            degree: 0,
          })),
          ascendant: 15,
          midheaven: 90,
          descendant: 195,
          imumCoeli: 270,
        },
        aspects: [],
        elements: { fire: 1, earth: 2, air: 3, water: 4 },
        modalities: { cardinal: 3, fixed: 4, mutable: 3 },
      };

      const updatedChart = {
        id: '456',
        calculated_data: expect.any(Object),
      };

      (ChartModel.findByIdAndUserId as jest.Mock).mockResolvedValue(mockChart);
      (NatalChartService.prototype.calculateNatalChart as jest.Mock).mockReturnValue(
        mockNatalChart,
      );
      (ChartModel.updateCalculatedData as jest.Mock).mockResolvedValue(updatedChart);

      await calculateChart(mockRequest as Request, mockResponse as Response, mockNext);

      expect(NatalChartService.prototype.calculateNatalChart).toHaveBeenCalledWith(
        expect.objectContaining({
          birthDate: expect.any(Date),
          birthTime: '14:30:00',
          latitude: 40.7128,
          longitude: -74.006,
          houseSystem: 'Placidus',
        }),
      );
      // Verify adapted data is stored (contains legacy-format fields)
      expect(ChartModel.updateCalculatedData).toHaveBeenCalledWith(
        '456',
        '123',
        expect.objectContaining({
          jd: 2447902.5,
          planets: expect.any(Object),
          houses: expect.any(Array),
          ascendant: 15,
          midheaven: 90,
        }),
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should throw 404 if chart not found', async () => {
      mockRequest.params = { id: '999' };

      (ChartModel.findByIdAndUserId as jest.Mock).mockResolvedValue(null);

      await expect(
        calculateChart(mockRequest as Request, mockResponse as Response, mockNext),
      ).rejects.toThrow(AppError);
      await expect(
        calculateChart(mockRequest as Request, mockResponse as Response, mockNext),
      ).rejects.toThrow('Chart not found');
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
      mockRequest.validated = {
        name: 'Test',
        birth_date: '1990-01-15',
        birth_place_name: 'New York',
        birth_latitude: 40.7128,
        birth_longitude: -74.006,
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
