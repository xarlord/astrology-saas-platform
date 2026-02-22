/**
 * Chart Service Tests
 * Testing chart API service
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { chartService } from '../../services/chart.service';
import {
  mockChart,
  createMockResponse,
  createMockError,
} from './utils';

// Mock the api module with hoisted mock
vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

// Mock the transformers
vi.mock('../../utils/apiTransformers', () => ({
  transformChart: vi.fn((chart) => chart),
  transformCharts: vi.fn((charts) => charts),
  birthDataToAPI: vi.fn((data) => ({
    name: data.name,
    birth_date: data.birth_date || data.birthDate,
    birth_time: data.birth_time || data.birthTime,
    birth_place: data.birth_place_name || data.birthPlace,
    latitude: data.birth_latitude || data.latitude,
    longitude: data.birth_longitude || data.longitude,
    timezone: data.birth_timezone || data.timezone,
    house_system: data.house_system || 'placidus',
    zodiac_type: data.zodiac || 'tropical',
  })),
}));

// Import after mock
import api from '../../services/api';

describe('chartService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createChart', () => {
    it('should create a chart with birth data', async () => {
      const mockResponse = createMockResponse({ chart: mockChart });
      (api.post as any).mockResolvedValue(mockResponse);

      const birthData = {
        name: 'John Doe',
        birth_date: '1990-01-15',
        birth_time: '14:30',
        birth_place_name: 'New York, NY',
        birth_latitude: 40.7128,
        birth_longitude: -74.006,
        birth_timezone: 'America/New_York',
        house_system: 'placidus' as const,
        zodiac: 'tropical' as const,
      };

      const result = await chartService.createChart(birthData);

      expect(api.post).toHaveBeenCalledWith('/charts', expect.any(Object));
      expect(result.chart).toBeDefined();
    });

    it('should transform birth data before sending to API', async () => {
      const mockResponse = createMockResponse({ chart: mockChart });
      (api.post as any).mockResolvedValue(mockResponse);

      await chartService.createChart({
        name: 'Test Chart',
        birthDate: '1990-06-15',
        birthTime: '10:00',
        birthPlace: 'Los Angeles, CA',
        latitude: 34.0522,
        longitude: -118.2437,
        timezone: 'America/Los_Angeles',
      });

      expect(api.post).toHaveBeenCalled();
    });

    it('should handle chart creation errors', async () => {
      const mockError = createMockError('Invalid birth data', 400);
      (api.post as any).mockRejectedValue(mockError);

      await expect(chartService.createChart({
        name: '',
        birth_date: 'invalid-date',
        birth_time: '',
        birth_place_name: '',
        birth_latitude: 0,
        birth_longitude: 0,
        birth_timezone: '',
      })).rejects.toThrow();
    });
  });

  describe('getCharts', () => {
    it('should fetch paginated charts', async () => {
      const mockResponse = createMockResponse({
        charts: [mockChart],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          pages: 1,
        },
      });
      (api.get as any).mockResolvedValue(mockResponse);

      const result = await chartService.getCharts(1, 20);

      expect(api.get).toHaveBeenCalledWith('/charts', {
        params: { page: 1, limit: 20 },
      });
      expect(result.charts).toHaveLength(1);
      expect(result.pagination.page).toBe(1);
    });

    it('should use default pagination values', async () => {
      const mockResponse = createMockResponse({
        charts: [],
        pagination: { page: 1, limit: 20, total: 0, pages: 0 },
      });
      (api.get as any).mockResolvedValue(mockResponse);

      await chartService.getCharts();

      expect(api.get).toHaveBeenCalledWith('/charts', {
        params: { page: 1, limit: 20 },
      });
    });

    it('should handle custom pagination', async () => {
      const mockResponse = createMockResponse({
        charts: [],
        pagination: { page: 2, limit: 10, total: 15, pages: 2 },
      });
      (api.get as any).mockResolvedValue(mockResponse);

      const result = await chartService.getCharts(2, 10);

      expect(api.get).toHaveBeenCalledWith('/charts', {
        params: { page: 2, limit: 10 },
      });
      expect(result.pagination.page).toBe(2);
    });

    it('should transform pagination to include totalPages', async () => {
      const mockResponse = createMockResponse({
        charts: [],
        pagination: { page: 1, limit: 20, total: 100, pages: 5 },
      });
      (api.get as any).mockResolvedValue(mockResponse);

      const result = await chartService.getCharts();

      expect(result.pagination.totalPages).toBe(5);
    });
  });

  describe('getChart', () => {
    it('should fetch a specific chart by ID', async () => {
      const mockResponse = createMockResponse({ chart: mockChart });
      (api.get as any).mockResolvedValue(mockResponse);

      const result = await chartService.getChart('chart-123');

      expect(api.get).toHaveBeenCalledWith('/charts/chart-123');
      expect(result.chart).toBeDefined();
    });

    it('should handle chart not found', async () => {
      const mockError = createMockError('Chart not found', 404);
      (api.get as any).mockRejectedValue(mockError);

      await expect(chartService.getChart('nonexistent')).rejects.toThrow();
    });

    it('should transform chart data from API', async () => {
      const apiChart = {
        ...mockChart,
        calculated_data: {
          planets: [{ name: 'Sun', longitude: 0 }],
          houses: [],
          aspects: [],
          points: [],
        },
      };
      const mockResponse = createMockResponse({ chart: apiChart });
      (api.get as any).mockResolvedValue(mockResponse);

      const result = await chartService.getChart('chart-123');

      expect(result.chart).toBeDefined();
    });
  });

  describe('updateChart', () => {
    it('should update chart data', async () => {
      const updatedChart = { ...mockChart, name: 'Updated Name' };
      const mockResponse = createMockResponse({ chart: updatedChart });
      (api.put as any).mockResolvedValue(mockResponse);

      const result = await chartService.updateChart('chart-123', {
        name: 'Updated Name',
      });

      expect(api.put).toHaveBeenCalledWith('/charts/chart-123', expect.any(Object));
      expect(result.chart).toBeDefined();
    });

    it('should handle partial updates', async () => {
      const mockResponse = createMockResponse({ chart: mockChart });
      (api.put as any).mockResolvedValue(mockResponse);

      await chartService.updateChart('chart-123', {
        birth_time: '15:00',
      });

      expect(api.put).toHaveBeenCalledWith('/charts/chart-123', expect.any(Object));
    });

    it('should handle update errors', async () => {
      const mockError = createMockError('Update failed', 500);
      (api.put as any).mockRejectedValue(mockError);

      await expect(chartService.updateChart('chart-123', {})).rejects.toThrow();
    });
  });

  describe('deleteChart', () => {
    it('should delete a chart', async () => {
      (api.delete as any).mockResolvedValue({ data: {} });

      await chartService.deleteChart('chart-123');

      expect(api.delete).toHaveBeenCalledWith('/charts/chart-123');
    });

    it('should handle delete errors', async () => {
      const mockError = createMockError('Delete failed', 500);
      (api.delete as any).mockRejectedValue(mockError);

      await expect(chartService.deleteChart('chart-123')).rejects.toThrow();
    });

    it('should handle not found error gracefully', async () => {
      const mockError = createMockError('Chart not found', 404);
      (api.delete as any).mockRejectedValue(mockError);

      await expect(chartService.deleteChart('nonexistent')).rejects.toThrow();
    });
  });

  describe('calculateChart', () => {
    it('should trigger chart calculation', async () => {
      const calculatedChart = {
        ...mockChart,
        calculated_data: {
          planets: [
            { planet: 'Sun', name: 'Sun', longitude: 295.5, latitude: 0, speed: 1, house: 4, sign: 'Capricorn', degree: 25, minute: 30, position: "25deg30' Capricorn", retrograde: false },
            { planet: 'Moon', name: 'Moon', longitude: 120.5, latitude: 0, speed: 13, house: 10, sign: 'Leo', degree: 0, minute: 30, position: "0deg30' Leo", retrograde: false },
          ],
          houses: [],
          aspects: [],
          points: [],
        },
      };
      const mockResponse = createMockResponse({ chart: calculatedChart });
      (api.post as any).mockResolvedValue(mockResponse);

      const result = await chartService.calculateChart('chart-123');

      expect(api.post).toHaveBeenCalledWith('/charts/chart-123/calculate');
      expect(result.chart).toBeDefined();
    });

    it('should handle calculation errors', async () => {
      const mockError = createMockError('Calculation failed', 500);
      (api.post as any).mockRejectedValue(mockError);

      await expect(chartService.calculateChart('chart-123')).rejects.toThrow();
    });

    it('should return transformed chart data', async () => {
      const mockResponse = createMockResponse({ chart: mockChart });
      (api.post as any).mockResolvedValue(mockResponse);

      const result = await chartService.calculateChart('chart-123');

      expect(result).toHaveProperty('chart');
    });
  });
});
