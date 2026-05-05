/**
 * Transit Service Tests
 * Testing transit API service
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { transitService, normalizeTransits } from '../../services/transit.service';
import { createMockResponse, createMockError } from './utils';

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
      const mockReading = {
        date: '2024-02-01',
        transits: [
          { transitPlanet: 'Saturn', natalPlanet: 'Sun', aspect: 'conjunction', orb: 2.5 },
        ],
        majorAspects: [],
      };
      const mockResponse = createMockResponse(mockReading);
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
      );
      expect(result.date).toBe('2024-02-01');
      expect(result.transits).toHaveLength(1);
    });

    it('should normalize transits from majorAspects when transits not present', async () => {
      const mockReading = {
        date: '2024-02-01',
        majorAspects: [
          { planet1: 'Saturn', planet2: 'Sun', type: 'square', orb: 3.0, applying: true },
        ],
      };
      const mockResponse = createMockResponse(mockReading);
      (api.post as any).mockResolvedValue(mockResponse);

      const result = await transitService.calculateTransits(
        'chart-123',
        '2024-01-01',
        '2024-03-01',
      );

      expect(result.transits).toHaveLength(1);
      expect(result.transits?.[0].transitPlanet).toBe('Saturn');
      expect(result.transits?.[0].natalPlanet).toBe('Sun');
      expect(result.transits?.[0].aspect).toBe('square');
    });

    it('should throw on API failure', async () => {
      const mockError = createMockError('Calculation failed', 500);
      (api.post as any).mockRejectedValue(mockError);

      await expect(
        transitService.calculateTransits('chart-123', '2024-01-01', '2024-03-01'),
      ).rejects.toThrow('Calculation failed');
    });

    it('should handle null data response gracefully', async () => {
      const mockResponse = { data: { data: null } };
      (api.post as any).mockResolvedValue(mockResponse);

      const result = await transitService.calculateTransits('chart-123', '2024-01-01', '2024-03-01');
      expect(result).toEqual({ transits: [] });
    });
  });

  describe('getTodayTransits', () => {
    it('should fetch today transits', async () => {
      const mockReading = {
        date: '2024-02-22',
        transits: [
          { transitPlanet: 'Jupiter', natalPlanet: 'Moon', aspect: 'trine', orb: 1.5 },
        ],
        majorAspects: [],
      };
      const mockResponse = createMockResponse(mockReading);
      (api.get as any).mockResolvedValue(mockResponse);

      const result = await transitService.getTodayTransits();

      expect(api.get).toHaveBeenCalledWith('/transits/today');
      expect(result.transits).toHaveLength(1);
      expect(result.date).toBe('2024-02-22');
    });

    it('should handle empty transit response', async () => {
      const mockReading = {
        date: '2024-02-22',
        transits: [],
        majorAspects: [],
      };
      const mockResponse = createMockResponse(mockReading);
      (api.get as any).mockResolvedValue(mockResponse);

      const result = await transitService.getTodayTransits();

      expect(result.transits).toHaveLength(0);
    });

    it('should throw on API failure', async () => {
      const mockError = createMockError('Service unavailable', 503);
      (api.get as any).mockRejectedValue(mockError);

      await expect(transitService.getTodayTransits()).rejects.toThrow('Service unavailable');
    });

    it('should handle null data response gracefully', async () => {
      (api.get as any).mockResolvedValue({ data: { data: null } });

      const result = await transitService.getTodayTransits();
      expect(result).toEqual({ transits: [] });
    });
  });

  describe('getTransitCalendar', () => {
    it('should fetch transit calendar for month', async () => {
      const mockCalendarData = {
        month: 2,
        year: 2024,
        calendarData: [
          {
            date: '2024-02-01',
            day: 1,
            aspects: [{ planet1: 'Saturn', planet2: 'Sun', type: 'square', orb: 3.0 }],
          },
          {
            date: '2024-02-02',
            day: 2,
            aspects: [],
          },
        ],
      };
      const mockResponse = createMockResponse(mockCalendarData);
      (api.get as any).mockResolvedValue(mockResponse);

      const result = await transitService.getTransitCalendar(2, 2024);

      expect(api.get).toHaveBeenCalledWith('/transits/calendar', {
        params: { month: 2, year: 2024 },
      });
      expect(result).toHaveLength(2);
      expect(result[0].date).toBe('2024-02-01');
      expect(result[0].transits).toHaveLength(1);
    });

    it('should pass correct params for different months', async () => {
      const mockCalendarData = {
        month: 12,
        year: 2024,
        calendarData: [],
      };
      const mockResponse = createMockResponse(mockCalendarData);
      (api.get as any).mockResolvedValue(mockResponse);

      await transitService.getTransitCalendar(12, 2024);

      expect(api.get).toHaveBeenCalledWith('/transits/calendar', {
        params: { month: 12, year: 2024 },
      });
    });

    it('should throw on calendar fetch failure', async () => {
      const mockError = createMockError('Calendar unavailable', 500);
      (api.get as any).mockRejectedValue(mockError);

      await expect(transitService.getTransitCalendar(2, 2024)).rejects.toThrow('Calendar unavailable');
    });
  });

  describe('getTransitForecast', () => {
    it('should fetch transit forecast with default duration', async () => {
      const mockForecastData = {
        chart: { id: 'chart-1', name: 'My Chart' },
        duration: 'month',
        startDate: '2024-02-01',
        endDate: '2024-02-28',
        groupedByType: {},
        forecast: [
          { type: 'conjunction', date: '2024-02-15', planet1: 'Venus', planet2: 'Mars', orb: 1.0, applying: true, intensity: 7 },
        ],
      };
      const mockResponse = createMockResponse(mockForecastData);
      (api.get as any).mockResolvedValue(mockResponse);

      const result = await transitService.getTransitForecast();

      expect(api.get).toHaveBeenCalledWith('/transits/forecast', {
        params: { duration: 'month' },
      });
      expect(result).toHaveLength(1);
      expect(result[0].date).toBe('2024-02-15');
      expect(result[0].transits).toHaveLength(1);
    });

    it('should fetch forecast with custom duration', async () => {
      const mockForecastData = {
        chart: { id: 'chart-1', name: 'My Chart' },
        duration: 'week',
        startDate: '2024-02-01',
        endDate: '2024-02-07',
        groupedByType: {},
        forecast: [],
      };
      const mockResponse = createMockResponse(mockForecastData);
      (api.get as any).mockResolvedValue(mockResponse);

      await transitService.getTransitForecast('week');

      expect(api.get).toHaveBeenCalledWith('/transits/forecast', {
        params: { duration: 'week' },
      });
    });

    it('should support all duration types', async () => {
      const durations = ['week', 'month', 'quarter', 'year'] as const;
      const mockForecastData = {
        chart: { id: 'chart-1', name: 'My Chart' },
        duration: 'week',
        startDate: '2024-02-01',
        endDate: '2024-02-07',
        groupedByType: {},
        forecast: [],
      };
      const mockResponse = createMockResponse(mockForecastData);
      (api.get as any).mockResolvedValue(mockResponse);

      for (const duration of durations) {
        await transitService.getTransitForecast(duration);
        expect(api.get).toHaveBeenCalledWith('/transits/forecast', {
          params: { duration },
        });
        vi.clearAllMocks();
      }
    });

    it('should throw on forecast failure', async () => {
      const mockError = createMockError('Forecast unavailable', 500);
      (api.get as any).mockRejectedValue(mockError);

      await expect(transitService.getTransitForecast()).rejects.toThrow('Forecast unavailable');
    });
  });

  describe('getTransitDetails', () => {
    it('should fetch specific transit details', async () => {
      const mockReading = {
        date: '2024-02-15',
        transits: [
          { transitPlanet: 'Saturn', natalPlanet: 'Sun', aspect: 'conjunction', orb: 2.5 },
        ],
        majorAspects: [],
      };
      const mockResponse = createMockResponse(mockReading);
      (api.get as any).mockResolvedValue(mockResponse);

      const result = await transitService.getTransitDetails('transit-123');

      expect(api.get).toHaveBeenCalledWith('/transits/transit-123');
      expect(result.transits).toHaveLength(1);
      expect(result.transits?.[0].transitPlanet).toBe('Saturn');
    });

    it('should handle transit not found', async () => {
      const mockError = createMockError('Transit not found', 404);
      (api.get as any).mockRejectedValue(mockError);

      await expect(transitService.getTransitDetails('nonexistent')).rejects.toThrow(
        'Transit not found',
      );
    });

    it('should handle null data response gracefully', async () => {
      (api.get as any).mockResolvedValue({ data: { data: null } });

      const result = await transitService.getTransitDetails('transit-123');
      expect(result).toEqual({ transits: [] });
    });
  });

  describe('normalizeTransits', () => {
    it('should return empty array for null reading', () => {
      expect(normalizeTransits(null)).toEqual([]);
    });

    it('should return empty array for undefined reading', () => {
      expect(normalizeTransits(undefined)).toEqual([]);
    });

    it('should return transits array when present', () => {
      const reading = {
        date: '2024-02-01',
        transits: [
          { transitPlanet: 'Saturn', natalPlanet: 'Sun', aspect: 'conjunction', orb: 2.5 },
        ],
      };
      const result = normalizeTransits(reading as any);
      expect(result).toHaveLength(1);
      expect(result[0].transitPlanet).toBe('Saturn');
    });

    it('should convert majorAspects to transits when transits not present', () => {
      const reading = {
        date: '2024-02-01',
        majorAspects: [
          { planet1: 'Mars', planet2: 'Venus', type: 'square', orb: 3.0, applying: true },
        ],
      };
      const result = normalizeTransits(reading as any);
      expect(result).toHaveLength(1);
      expect(result[0].transitPlanet).toBe('Mars');
      expect(result[0].natalPlanet).toBe('Venus');
      expect(result[0].aspect).toBe('square');
    });

    it('should return empty array when neither transits nor majorAspects present', () => {
      const reading = { date: '2024-02-01' };
      expect(normalizeTransits(reading as any)).toEqual([]);
    });
  });
});
