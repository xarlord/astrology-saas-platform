/**
 * Transit Service Tests
 * Testing transit API service
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { transitService, normalizeTransits } from '../../services/transit.service';
import type { TransitReading } from '../../services/transit.service';

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
      const mockTransitReading: TransitReading = {
        date: '2024-02-01',
        transits: [
          { transitPlanet: 'Saturn', natalPlanet: 'Sun', aspect: 'conjunction', orb: 2.5 },
        ],
      };
      const mockResponse = { data: { data: mockTransitReading } };
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
      expect(result.transits![0].transitPlanet).toBe('Saturn');
    });

    it('should call api.post with correct arguments', async () => {
      const mockResponse = { data: { data: { date: '2024-02-01', transits: [] } } };
      (api.post as any).mockResolvedValue(mockResponse);

      await transitService.calculateTransits('chart-123', '2024-01-01', '2024-03-01');

      expect(api.post).toHaveBeenCalledWith(
        '/transits/calculate',
        {
          chartId: 'chart-123',
          startDate: '2024-01-01',
          endDate: '2024-03-01',
        },
      );
    });

    it('should propagate errors on API failure', async () => {
      const mockError = new Error('Calculation failed');
      (api.post as any).mockRejectedValue(mockError);

      await expect(
        transitService.calculateTransits('chart-123', '2024-01-01', '2024-03-01'),
      ).rejects.toThrow('Calculation failed');
    });

    it('should throw on null response data', async () => {
      const mockResponse = { data: null };
      (api.post as any).mockResolvedValue(mockResponse);

      await expect(
        transitService.calculateTransits('chart-123', '2024-01-01', '2024-03-01'),
      ).rejects.toThrow();
    });

    it('should preserve custom errors from inner calls', async () => {
      const customError = new Error('Custom error');
      (api.post as any).mockRejectedValue(customError);

      await expect(
        transitService.calculateTransits('chart-123', '2024-01-01', '2024-03-01'),
      ).rejects.toThrow('Custom error');
    });
  });

  describe('getTodayTransits', () => {
    it('should fetch today transits', async () => {
      const mockReading: TransitReading = {
        date: '2024-02-22',
        transits: [
          { transitPlanet: 'Mars', natalPlanet: 'Moon', aspect: 'square', orb: 1.2 },
        ],
      };
      const mockResponse = { data: { data: mockReading } };
      (api.get as any).mockResolvedValue(mockResponse);

      const result = await transitService.getTodayTransits();

      expect(api.get).toHaveBeenCalledWith('/transits/today');
      expect(result.transits).toHaveLength(1);
      expect(result.date).toBe('2024-02-22');
    });

    it('should handle empty transit response', async () => {
      const mockResponse = { data: { data: { date: '2024-02-22', transits: [] } } };
      (api.get as any).mockResolvedValue(mockResponse);

      const result = await transitService.getTodayTransits();

      expect(result.transits).toHaveLength(0);
    });

    it('should propagate errors on API failure', async () => {
      const mockError = new Error('Service unavailable');
      (api.get as any).mockRejectedValue(mockError);

      await expect(transitService.getTodayTransits()).rejects.toThrow('Service unavailable');
    });

    it('should throw on null response', async () => {
      (api.get as any).mockResolvedValue({ data: null });

      await expect(transitService.getTodayTransits()).rejects.toThrow();
    });
  });

  describe('getTransitCalendar', () => {
    it('should fetch transit calendar for month', async () => {
      const mockResponse = {
        data: {
          data: {
            month: 2,
            year: 2024,
            calendarData: [
              {
                date: '2024-02-01',
                day: 1,
                aspects: [
                  { planet1: 'Saturn', planet2: 'Sun', type: 'conjunction', orb: 2.5 },
                ],
                moonPhase: { phase: 'Full Moon', degrees: 180, illumination: 0.99 },
              },
            ],
          },
        },
      };
      (api.get as any).mockResolvedValue(mockResponse);

      const result = await transitService.getTransitCalendar(2, 2024);

      expect(api.get).toHaveBeenCalledWith('/transits/calendar', {
        params: { month: 2, year: 2024 },
      });
      expect(result).toHaveLength(1);
      expect(result[0].date).toBe('2024-02-01');
      expect(result[0].transits).toHaveLength(1);
    });

    it('should pass correct params for different months', async () => {
      const mockResponse = {
        data: {
          data: {
            month: 12,
            year: 2024,
            calendarData: [],
          },
        },
      };
      (api.get as any).mockResolvedValue(mockResponse);

      await transitService.getTransitCalendar(12, 2024);

      expect(api.get).toHaveBeenCalledWith('/transits/calendar', {
        params: { month: 12, year: 2024 },
      });
    });

    it('should propagate errors on calendar fetch failure', async () => {
      const mockError = new Error('Calendar unavailable');
      (api.get as any).mockRejectedValue(mockError);

      await expect(transitService.getTransitCalendar(2, 2024)).rejects.toThrow('Calendar unavailable');
    });
  });

  describe('getTransitForecast', () => {
    it('should fetch transit forecast with default duration', async () => {
      const mockResponse = {
        data: {
          data: {
            chart: { id: 'chart-1', name: 'My Chart' },
            duration: 'month',
            startDate: '2024-01-01',
            endDate: '2024-01-31',
            groupedByType: {},
            forecast: [
              { type: 'conjunction', date: '2024-01-15', planet1: 'Mars', planet2: 'Venus', orb: 1.5, intensity: 7 },
            ],
          },
        },
      };
      (api.get as any).mockResolvedValue(mockResponse);

      const result = await transitService.getTransitForecast();

      expect(api.get).toHaveBeenCalledWith('/transits/forecast', {
        params: { duration: 'month' },
      });
      expect(result).toHaveLength(1);
      expect(result[0].date).toBe('2024-01-15');
      expect(result[0].transits![0].transitPlanet).toBe('Mars');
    });

    it('should fetch forecast with custom duration', async () => {
      const mockResponse = {
        data: {
          data: {
            chart: { id: 'chart-1', name: 'My Chart' },
            duration: 'week',
            startDate: '2024-01-01',
            endDate: '2024-01-07',
            groupedByType: {},
            forecast: [],
          },
        },
      };
      (api.get as any).mockResolvedValue(mockResponse);

      await transitService.getTransitForecast('week');

      expect(api.get).toHaveBeenCalledWith('/transits/forecast', {
        params: { duration: 'week' },
      });
    });

    it('should support all duration types', async () => {
      const durations = ['week', 'month', 'quarter', 'year'] as const;
      const mockResponse = {
        data: {
          data: {
            chart: { id: 'chart-1', name: 'My Chart' },
            duration: 'week',
            startDate: '2024-01-01',
            endDate: '2024-01-07',
            groupedByType: {},
            forecast: [],
          },
        },
      };
      (api.get as any).mockResolvedValue(mockResponse);

      for (const duration of durations) {
        await transitService.getTransitForecast(duration);
        expect(api.get).toHaveBeenCalledWith('/transits/forecast', {
          params: { duration },
        });
        vi.clearAllMocks();
      }
    });

    it('should propagate errors on forecast failure', async () => {
      const mockError = new Error('Forecast unavailable');
      (api.get as any).mockRejectedValue(mockError);

      await expect(transitService.getTransitForecast()).rejects.toThrow('Forecast unavailable');
    });
  });

  describe('getTransitDetails', () => {
    it('should fetch specific transit details', async () => {
      const mockReading: TransitReading = {
        date: '2024-02-01',
        transits: [
          { transitPlanet: 'Saturn', natalPlanet: 'Sun', aspect: 'conjunction', orb: 2.5 },
        ],
      };
      const mockResponse = { data: { data: mockReading } };
      (api.get as any).mockResolvedValue(mockResponse);

      const result = await transitService.getTransitDetails('transit-123');

      expect(api.get).toHaveBeenCalledWith('/transits/transit-123');
      expect(result.date).toBe('2024-02-01');
      expect(result.transits).toHaveLength(1);
      expect(result.transits![0].transitPlanet).toBe('Saturn');
    });

    it('should handle transit not found', async () => {
      const mockError = new Error('Transit not found');
      (api.get as any).mockRejectedValue(mockError);

      await expect(transitService.getTransitDetails('nonexistent')).rejects.toThrow(
        'Transit not found',
      );
    });

    it('should throw on null response data', async () => {
      (api.get as any).mockResolvedValue({ data: null });

      await expect(transitService.getTransitDetails('transit-123')).rejects.toThrow();
    });

    it('should preserve custom errors on re-throw', async () => {
      const customError = new Error('Not found');
      (api.get as any).mockRejectedValue(customError);

      await expect(transitService.getTransitDetails('transit-123')).rejects.toThrow('Not found');
    });
  });

  describe('normalizeTransits', () => {
    it('should return empty array for null input', () => {
      expect(normalizeTransits(null)).toEqual([]);
    });

    it('should return empty array for undefined input', () => {
      expect(normalizeTransits(undefined)).toEqual([]);
    });

    it('should return transits array if present', () => {
      const reading: TransitReading = {
        date: '2024-01-01',
        transits: [
          { transitPlanet: 'Mars', natalPlanet: 'Venus', aspect: 'square', orb: 3.0 },
        ],
      };
      const result = normalizeTransits(reading);
      expect(result).toEqual([
        { transitPlanet: 'Mars', natalPlanet: 'Venus', aspect: 'square', orb: 3.0 },
      ]);
    });

    it('should convert majorAspects to NormalizedTransit format', () => {
      const reading: TransitReading = {
        date: '2024-01-01',
        majorAspects: [
          { planet1: 'Saturn', planet2: 'Moon', type: 'opposition', orb: 1.5, applying: true },
        ],
      };
      const result = normalizeTransits(reading);
      expect(result).toEqual([
        { transitPlanet: 'Saturn', natalPlanet: 'Moon', aspect: 'opposition', orb: 1.5 },
      ]);
    });

    it('should prefer transits over majorAspects when both exist', () => {
      const reading: TransitReading = {
        date: '2024-01-01',
        transits: [
          { transitPlanet: 'Mars', natalPlanet: 'Venus', aspect: 'trine', orb: 1.0 },
        ],
        majorAspects: [
          { planet1: 'Jupiter', planet2: 'Sun', type: 'conjunction', orb: 2.0 },
        ],
      };
      const result = normalizeTransits(reading);
      expect(result).toHaveLength(1);
      expect(result[0].transitPlanet).toBe('Mars');
    });

    it('should return empty array when no transit data present', () => {
      const reading: TransitReading = {
        date: '2024-01-01',
      };
      expect(normalizeTransits(reading)).toEqual([]);
    });
  });
});
