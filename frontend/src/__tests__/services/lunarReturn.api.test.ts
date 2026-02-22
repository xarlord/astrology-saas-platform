/**
 * Lunar Return API Service Tests
 * Comprehensive tests for lunar return feature API calls
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getNextLunarReturn,
  getCurrentLunarReturn,
  calculateLunarReturnChart,
  getLunarMonthForecast,
  getLunarReturnHistory,
  deleteLunarReturn,
  calculateCustomLunarReturn,
} from '../../services/lunarReturn.api';
import { setupLocalStorageMock } from './utils';

// Helper to create mock axios response
const createMockResponse = <T>(data: T) => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {},
});

// Mock the api module
vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from '../../services/api';

const mockApi = api as unknown as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  put: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

describe('lunarReturn.api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupLocalStorageMock();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getNextLunarReturn', () => {
    it('should fetch next lunar return date', async () => {
      const mockData = {
        nextReturn: new Date('2024-02-15T00:00:00Z'),
        natalMoon: {
          sign: 'Scorpio',
          degree: 15,
          minute: 30,
          second: 45,
        },
      };
      mockApi.get.mockResolvedValueOnce(createMockResponse({ data: mockData }));

      const result = await getNextLunarReturn();

      expect(mockApi.get).toHaveBeenCalledWith('/lunar-return/next');
      expect(result.natalMoon.sign).toBe('Scorpio');
      expect(result.natalMoon.degree).toBe(15);
    });

    it('should handle error when fetching next lunar return', async () => {
      mockApi.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(getNextLunarReturn()).rejects.toThrow('Network error');
    });
  });

  describe('getCurrentLunarReturn', () => {
    it('should fetch current lunar return info', async () => {
      const mockData = {
        returnDate: new Date('2024-01-15T00:00:00Z'),
        daysUntil: 14,
      };
      mockApi.get.mockResolvedValueOnce(createMockResponse({ data: mockData }));

      const result = await getCurrentLunarReturn();

      expect(mockApi.get).toHaveBeenCalledWith('/lunar-return/current');
      expect(result.daysUntil).toBe(14);
    });

    it('should handle zero days until return', async () => {
      const mockData = {
        returnDate: new Date(),
        daysUntil: 0,
      };
      mockApi.get.mockResolvedValueOnce(createMockResponse({ data: mockData }));

      const result = await getCurrentLunarReturn();

      expect(result.daysUntil).toBe(0);
    });
  });

  describe('calculateLunarReturnChart', () => {
    it('should calculate lunar return chart for specific date', async () => {
      const returnDate = new Date('2024-02-15T00:00:00Z');
      const mockData = {
        returnDate,
        moonPosition: {
          sign: 'Scorpio',
          degree: 15,
          minute: 30,
          second: 0,
        },
        moonPhase: 'Full Moon',
        housePlacement: 4,
        aspects: [
          {
            planets: ['Moon', 'Sun'] as [string, string],
            type: 'opposition' as const,
            orb: 2.5,
            applying: false,
            interpretation: 'Emotional tension',
          },
        ],
        theme: 'Transformation and Release',
        intensity: 8,
      };
      mockApi.post.mockResolvedValueOnce(createMockResponse({ data: mockData }));

      const result = await calculateLunarReturnChart(returnDate);

      expect(mockApi.post).toHaveBeenCalledWith('/lunar-return/chart', { returnDate });
      expect(result.moonPosition.sign).toBe('Scorpio');
      expect(result.housePlacement).toBe(4);
      expect(result.aspects).toHaveLength(1);
    });

    it('should handle chart calculation error', async () => {
      mockApi.post.mockRejectedValueOnce(new Error('Invalid date'));

      await expect(calculateLunarReturnChart(new Date())).rejects.toThrow('Invalid date');
    });
  });

  describe('getLunarMonthForecast', () => {
    const mockForecast = {
      userId: 'user-1',
      returnDate: new Date('2024-02-15T00:00:00Z'),
      theme: 'Deep emotional transformation',
      intensity: 7,
      emotionalTheme: 'Healing past wounds',
      actionAdvice: ['Journal your feelings', 'Practice self-care'],
      keyDates: [
        {
          date: new Date('2024-02-20T00:00:00Z'),
          type: 'full-moon' as const,
          description: 'Peak emotional intensity',
          significance: 'Time for release',
        },
      ],
      predictions: [
        {
          category: 'relationships' as const,
          prediction: 'Deep connections formed',
          likelihood: 8,
          advice: ['Be open', 'Communicate honestly'],
        },
      ],
      rituals: [
        {
          phase: 'new-moon' as const,
          title: 'Intention Setting',
          description: 'Set intentions for the lunar month',
          materials: ['Candle', 'Paper', 'Pen'],
          steps: ['Light candle', 'Write intentions', 'Meditate'],
        },
      ],
      journalPrompts: ['What emotions am I ready to release?'],
    };

    it('should fetch lunar month forecast without date', async () => {
      mockApi.post.mockResolvedValueOnce(createMockResponse({ data: mockForecast }));

      const result = await getLunarMonthForecast();

      expect(mockApi.post).toHaveBeenCalledWith('/lunar-return/forecast', {
        returnDate: null,
      });
      expect(result.theme).toBe('Deep emotional transformation');
      expect(result.predictions).toHaveLength(1);
    });

    it('should fetch lunar month forecast with specific date', async () => {
      const returnDate = new Date('2024-02-15T00:00:00Z');
      mockApi.post.mockResolvedValueOnce(createMockResponse({ data: mockForecast }));

      const result = await getLunarMonthForecast(returnDate);

      expect(mockApi.post).toHaveBeenCalledWith('/lunar-return/forecast', {
        returnDate,
      });
    });

    it('should include all prediction categories', async () => {
      const fullForecast = {
        ...mockForecast,
        predictions: [
          { category: 'relationships', prediction: 'Love blooms', likelihood: 7, advice: [] },
          { category: 'career', prediction: 'New opportunities', likelihood: 6, advice: [] },
          { category: 'finances', prediction: 'Stable growth', likelihood: 5, advice: [] },
          { category: 'health', prediction: 'Focus on wellness', likelihood: 8, advice: [] },
          { category: 'creativity', prediction: 'Artistic inspiration', likelihood: 9, advice: [] },
          { category: 'spirituality', prediction: 'Deep insights', likelihood: 8, advice: [] },
        ] as const,
      };
      mockApi.post.mockResolvedValueOnce(createMockResponse({ data: fullForecast }));

      const result = await getLunarMonthForecast();

      expect(result.predictions).toHaveLength(6);
    });
  });

  describe('getLunarReturnHistory', () => {
    const mockHistory = {
      returns: [
        {
          id: 'return-1',
          returnDate: new Date('2024-01-15T00:00:00Z'),
          theme: 'New Beginnings',
          intensity: 7,
          emotionalTheme: 'Hope',
          actionAdvice: ['Start fresh'],
          keyDates: [],
          predictions: [],
          rituals: [],
          journalPrompts: [],
          createdAt: new Date('2024-01-15T00:00:00Z'),
        },
        {
          id: 'return-2',
          returnDate: new Date('2023-12-17T00:00:00Z'),
          theme: 'Reflection',
          intensity: 5,
          emotionalTheme: 'Contemplation',
          actionAdvice: [],
          keyDates: [],
          predictions: [],
          rituals: [],
          journalPrompts: [],
          createdAt: new Date('2023-12-17T00:00:00Z'),
        },
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
      },
    };

    it('should fetch lunar return history with default pagination', async () => {
      mockApi.get.mockResolvedValueOnce(createMockResponse({ data: mockHistory }));

      const result = await getLunarReturnHistory();

      expect(mockApi.get).toHaveBeenCalledWith('/lunar-return/history', {
        params: { page: 1, limit: 10 },
      });
      expect(result.returns).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
    });

    it('should fetch history with custom pagination', async () => {
      mockApi.get.mockResolvedValueOnce(createMockResponse({ data: mockHistory }));

      const result = await getLunarReturnHistory(2, 5);

      expect(mockApi.get).toHaveBeenCalledWith('/lunar-return/history', {
        params: { page: 2, limit: 5 },
      });
    });

    it('should handle empty history', async () => {
      const emptyHistory = {
        returns: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      };
      mockApi.get.mockResolvedValueOnce(createMockResponse({ data: emptyHistory }));

      const result = await getLunarReturnHistory();

      expect(result.returns).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });

    it('should handle history fetch error', async () => {
      mockApi.get.mockRejectedValueOnce(new Error('Unauthorized'));

      await expect(getLunarReturnHistory()).rejects.toThrow('Unauthorized');
    });
  });

  describe('deleteLunarReturn', () => {
    it('should delete a saved lunar return', async () => {
      mockApi.delete.mockResolvedValueOnce({ status: 204 });

      await deleteLunarReturn('return-1');

      expect(mockApi.delete).toHaveBeenCalledWith('/lunar-return/return-1');
    });

    it('should handle delete error', async () => {
      mockApi.delete.mockRejectedValueOnce(new Error('Not found'));

      await expect(deleteLunarReturn('invalid-id')).rejects.toThrow('Not found');
    });
  });

  describe('calculateCustomLunarReturn', () => {
    const mockResult = {
      chart: {
        returnDate: new Date('2024-02-15T00:00:00Z'),
        moonPosition: {
          sign: 'Scorpio',
          degree: 15,
          minute: 0,
          second: 0,
        },
        moonPhase: 'Full Moon',
        housePlacement: 4,
        aspects: [],
        theme: 'Transformation',
        intensity: 8,
      },
      returnDate: new Date('2024-02-15T00:00:00Z'),
      forecast: {
        userId: 'user-1',
        returnDate: new Date('2024-02-15T00:00:00Z'),
        theme: 'Deep transformation',
        intensity: 8,
        emotionalTheme: 'Release',
        actionAdvice: [],
        keyDates: [],
        predictions: [],
        rituals: [],
        journalPrompts: [],
      },
    };

    it('should calculate custom lunar return with forecast', async () => {
      mockApi.post.mockResolvedValueOnce(createMockResponse({ data: mockResult }));

      const returnDate = new Date('2024-02-15T00:00:00Z');
      const result = await calculateCustomLunarReturn(returnDate, true);

      expect(mockApi.post).toHaveBeenCalledWith('/lunar-return/calculate', {
        returnDate,
        includeForecast: true,
      });
      expect(result.chart).toBeDefined();
      expect(result.forecast).toBeDefined();
    });

    it('should calculate custom lunar return without forecast', async () => {
      const resultWithoutForecast = {
        chart: mockResult.chart,
        returnDate: mockResult.returnDate,
      };
      mockApi.post.mockResolvedValueOnce(createMockResponse({ data: resultWithoutForecast }));

      const returnDate = new Date('2024-02-15T00:00:00Z');
      const result = await calculateCustomLunarReturn(returnDate, false);

      expect(mockApi.post).toHaveBeenCalledWith('/lunar-return/calculate', {
        returnDate,
        includeForecast: false,
      });
      expect(result.forecast).toBeUndefined();
    });

    it('should default includeForecast to true', async () => {
      mockApi.post.mockResolvedValueOnce(createMockResponse({ data: mockResult }));

      const returnDate = new Date('2024-02-15T00:00:00Z');
      await calculateCustomLunarReturn(returnDate);

      expect(mockApi.post).toHaveBeenCalledWith('/lunar-return/calculate', {
        returnDate,
        includeForecast: true,
      });
    });

    it('should handle calculation error', async () => {
      mockApi.post.mockRejectedValueOnce(new Error('Invalid location'));

      await expect(calculateCustomLunarReturn(new Date())).rejects.toThrow('Invalid location');
    });
  });
});
