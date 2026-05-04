/**
 * Transit Service Tests
 * Testing transit API service
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { transitService, TransitServiceError } from '../../services/transit.service';
import { mockTransit, createMockResponse, createMockError } from './utils';

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

// Import after mock
import api from '../../services/api';

describe('transitService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('calculateTransits', () => {
    it('should calculate transits for a date range', async () => {
      const mockTransitChart = {
        chart_id: 'chart-123',
        date: '2024-02-01',
        transits: [mockTransit],
        energy_level: 7,
        dominant_themes: ['transformation', 'discipline'],
      };
      const mockResponse = createMockResponse(mockTransitChart);
      (api.post as any).mockResolvedValue(mockResponse);

      const result = await transitService.calculateTransits(
        'chart-123',
        '2024-01-01',
        '2024-03-01',
      );

      expect(api.post).toHaveBeenCalledWith(
        '/transits/calculate',
        {
          chartId: 'chart-123',
          startDate: '2024-01-01',
          endDate: '2024-03-01',
        },
        { timeout: 45000 },
      );
      expect(result.chart_id).toBe('chart-123');
      expect(result.transits).toHaveLength(1);
    });

    it('should use correct timeout for transit calculations', async () => {
      const mockResponse = createMockResponse({
        chart_id: 'chart-123',
        date: '2024-02-01',
        transits: [],
        energy_level: 5,
        dominant_themes: [],
      });
      (api.post as any).mockResolvedValue(mockResponse);

      await transitService.calculateTransits('chart-123', '2024-01-01', '2024-03-01');

      expect(api.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        expect.objectContaining({ timeout: 45000 }),
      );
    });

    it('should throw TransitServiceError on failure', async () => {
      const mockError = createMockError('Calculation failed', 500);
      (api.post as any).mockRejectedValue(mockError);

      await expect(
        transitService.calculateTransits('chart-123', '2024-01-01', '2024-03-01'),
      ).rejects.toThrow(TransitServiceError);
    });

    it('should throw error with correct code on no data', async () => {
      const mockResponse = { data: null };
      (api.post as any).mockResolvedValue(mockResponse);

      await expect(
        transitService.calculateTransits('chart-123', '2024-01-01', '2024-03-01'),
      ).rejects.toThrow('No data received');
    });

    it('should preserve TransitServiceError from inner calls', async () => {
      const customError = new TransitServiceError('Custom error', 'CUSTOM_CODE');
      (api.post as any).mockRejectedValue(customError);

      await expect(
        transitService.calculateTransits('chart-123', '2024-01-01', '2024-03-01'),
      ).rejects.toThrow('Custom error');
    });
  });

  describe('getTodayTransits', () => {
    it('should fetch today transits', async () => {
      const mockResponse = createMockResponse({
        transits: [mockTransit],
        energyLevel: 8,
        dateRange: { start: '2024-02-22', end: '2024-02-22' },
      });
      (api.get as any).mockResolvedValue(mockResponse);

      const result = await transitService.getTodayTransits();

      expect(api.get).toHaveBeenCalledWith('/transits/today', { timeout: 45000 });
      expect(result.transits).toHaveLength(1);
      expect(result.energyLevel).toBe(8);
    });

    it('should handle empty transit response', async () => {
      const mockResponse = createMockResponse({
        transits: [],
        energyLevel: 0,
        dateRange: { start: '2024-02-22', end: '2024-02-22' },
      });
      (api.get as any).mockResolvedValue(mockResponse);

      const result = await transitService.getTodayTransits();

      expect(result.transits).toHaveLength(0);
    });

    it('should throw TransitServiceError on API failure', async () => {
      const mockError = createMockError('Service unavailable', 503);
      (api.get as any).mockRejectedValue(mockError);

      await expect(transitService.getTodayTransits()).rejects.toThrow(TransitServiceError);
    });

    it('should throw error with NO_DATA code when no data received', async () => {
      (api.get as any).mockResolvedValue({ data: null });

      await expect(transitService.getTodayTransits()).rejects.toThrow('No data received');
    });
  });

  describe('getTransitCalendar', () => {
    it('should fetch transit calendar for month', async () => {
      const mockResponse = createMockResponse({
        transits: [mockTransit],
        month: 2,
        year: 2024,
      });
      (api.get as any).mockResolvedValue(mockResponse);

      const result = await transitService.getTransitCalendar(2, 2024);

      expect(api.get).toHaveBeenCalledWith('/transits/calendar', {
        params: { month: 2, year: 2024 },
        timeout: 45000,
      });
      expect(result.month).toBe(2);
      expect(result.year).toBe(2024);
    });

    it('should pass correct params for different months', async () => {
      const mockResponse = createMockResponse({
        transits: [],
        month: 12,
        year: 2024,
      });
      (api.get as any).mockResolvedValue(mockResponse);

      await transitService.getTransitCalendar(12, 2024);

      expect(api.get).toHaveBeenCalledWith('/transits/calendar', {
        params: { month: 12, year: 2024 },
        timeout: 45000,
      });
    });

    it('should throw TransitServiceError on calendar fetch failure', async () => {
      const mockError = createMockError('Calendar unavailable', 500);
      (api.get as any).mockRejectedValue(mockError);

      await expect(transitService.getTransitCalendar(2, 2024)).rejects.toThrow(TransitServiceError);
    });
  });

  describe('getTransitForecast', () => {
    it('should fetch transit forecast with default duration', async () => {
      const mockResponse = createMockResponse({
        transits: [mockTransit],
        energyLevel: 6,
        duration: 'month',
      });
      (api.get as any).mockResolvedValue(mockResponse);

      const result = await transitService.getTransitForecast();

      expect(api.get).toHaveBeenCalledWith('/transits/forecast', {
        params: { duration: 'month' },
        timeout: 30000,
      });
      expect(result.duration).toBe('month');
    });

    it('should fetch forecast with custom duration', async () => {
      const mockResponse = createMockResponse({
        transits: [],
        energyLevel: 5,
        duration: 'week',
      });
      (api.get as any).mockResolvedValue(mockResponse);

      await transitService.getTransitForecast('week');

      expect(api.get).toHaveBeenCalledWith('/transits/forecast', {
        params: { duration: 'week' },
        timeout: 30000,
      });
    });

    it('should support all duration types', async () => {
      const durations = ['week', 'month', 'quarter', 'year'] as const;
      const mockResponse = createMockResponse({
        transits: [],
        energyLevel: 5,
        duration: 'week',
      });
      (api.get as any).mockResolvedValue(mockResponse);

      for (const duration of durations) {
        await transitService.getTransitForecast(duration);
        expect(api.get).toHaveBeenCalledWith('/transits/forecast', {
          params: { duration },
          timeout: 30000,
        });
        vi.clearAllMocks();
      }
    });

    it('should use shorter timeout for forecast', async () => {
      const mockResponse = createMockResponse({
        transits: [],
        energyLevel: 5,
        duration: 'month',
      });
      (api.get as any).mockResolvedValue(mockResponse);

      await transitService.getTransitForecast('month');

      expect(api.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ timeout: 30000 }),
      );
    });

    it('should throw TransitServiceError on forecast failure', async () => {
      const mockError = createMockError('Forecast unavailable', 500);
      (api.get as any).mockRejectedValue(mockError);

      await expect(transitService.getTransitForecast()).rejects.toThrow(TransitServiceError);
    });
  });

  describe('getTransitDetails', () => {
    it('should fetch specific transit details', async () => {
      const mockResponse = createMockResponse(mockTransit);
      (api.get as any).mockResolvedValue(mockResponse);

      const result = await transitService.getTransitDetails('transit-123');

      expect(api.get).toHaveBeenCalledWith('/transits/transit-123', { timeout: 45000 });
      expect(result.id).toBe('transit-123');
      expect(result.planet).toBe('Saturn');
    });

    it('should handle transit not found', async () => {
      const mockError = createMockError('Transit not found', 404);
      (api.get as any).mockRejectedValue(mockError);

      await expect(transitService.getTransitDetails('nonexistent')).rejects.toThrow(
        TransitServiceError,
      );
    });

    it('should throw error with correct code on no data', async () => {
      (api.get as any).mockResolvedValue({ data: null });

      await expect(transitService.getTransitDetails('transit-123')).rejects.toThrow(
        'No data received',
      );
    });

    it('should preserve TransitServiceError on re-throw', async () => {
      const customError = new TransitServiceError('Not found', 'NOT_FOUND', 404);
      (api.get as any).mockRejectedValue(customError);

      await expect(transitService.getTransitDetails('transit-123')).rejects.toThrow('Not found');
    });
  });

  describe('TransitServiceError', () => {
    it('should create error with message and code', () => {
      const error = new TransitServiceError('Test error', 'TEST_CODE');

      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.name).toBe('TransitServiceError');
    });

    it('should create error with status code', () => {
      const error = new TransitServiceError('Not found', 'NOT_FOUND', 404);

      expect(error.statusCode).toBe(404);
    });

    it('should be instance of Error', () => {
      const error = new TransitServiceError('Test', 'CODE');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(TransitServiceError);
    });
  });
});
