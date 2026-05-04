/**
 * Tests for useTransits Hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTransits } from '../../hooks/useTransits';
import type { Transit, TransitChart } from '../../services/api.types';

// Mock transit data
const mockTransit: Transit = {
  id: 'transit-1',
  planet: 'Saturn',
  aspect: 'Square',
  natalPlanet: 'Sun',
  type: 'major',
  start_date: '2024-01-01',
  end_date: '2024-01-31',
  degree: 0,
  sign: 'Pisces',
  exact_date: '2024-01-15',
  interpretation: 'A challenging transit',
};

const mockMinorTransit: Transit = {
  id: 'transit-2',
  planet: 'Moon',
  aspect: 'Conjunction',
  natalPlanet: 'Venus',
  type: 'minor',
  start_date: '2024-01-15',
  end_date: '2024-01-16',
  degree: 2,
  sign: 'Taurus',
  exact_date: '2024-01-15',
  interpretation: 'Emotional connection',
};

// Mock the transit store
const mockTransitStore = {
  dateRange: null as { start: string; end: string } | null,
  transits: [] as Transit[],
  transitChart: null as TransitChart | null,
  energyLevel: 50,
  isLoading: false,
  error: null as string | null,
  setDateRange: vi.fn(),
  loadTransits: vi.fn(),
  loadTodayTransits: vi.fn(),
  loadTransitCalendar: vi.fn(),
  loadTransitForecast: vi.fn(),
  clearTransits: vi.fn(),
  clearError: vi.fn(),
};

vi.mock('../../stores', () => ({
  useTransitStore: vi.fn((selector?: (state: typeof mockTransitStore) => unknown) => {
    if (selector) {
      return selector(mockTransitStore);
    }
    return mockTransitStore;
  }),
}));

describe('useTransits', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTransitStore.dateRange = null;
    mockTransitStore.transits = [];
    mockTransitStore.transitChart = null;
    mockTransitStore.energyLevel = 50;
    mockTransitStore.isLoading = false;
    mockTransitStore.error = null;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should return transit state from store', () => {
      const { result } = renderHook(() => useTransits());

      expect(result.current.dateRange).toBeNull();
      expect(result.current.transits).toEqual([]);
      expect(result.current.transitChart).toBeNull();
      expect(result.current.energyLevel).toBe(50);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should return transits when present', () => {
      mockTransitStore.transits = [mockTransit];

      const { result } = renderHook(() => useTransits());

      expect(result.current.transits).toHaveLength(1);
      expect(result.current.transits[0]).toEqual(mockTransit);
    });
  });

  describe('loadTransits', () => {
    it('should provide loadTransits function', () => {
      const { result } = renderHook(() => useTransits());

      expect(typeof result.current.loadTransits).toBe('function');
    });

    it('should call store loadTransits and setDateRange on success', async () => {
      mockTransitStore.loadTransits.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useTransits());

      let loadResult: boolean | undefined;
      await act(async () => {
        loadResult = await result.current.loadTransits('chart-1', '2024-01-01', '2024-01-31');
      });

      expect(mockTransitStore.loadTransits).toHaveBeenCalledWith(
        'chart-1',
        '2024-01-01',
        '2024-01-31',
      );
      expect(mockTransitStore.setDateRange).toHaveBeenCalledWith('2024-01-01', '2024-01-31');
      expect(loadResult).toBe(true);
    });

    it('should return false on loadTransits failure', async () => {
      mockTransitStore.loadTransits.mockRejectedValueOnce(new Error('Load failed'));

      const { result } = renderHook(() => useTransits());

      let loadResult: boolean | undefined;
      await act(async () => {
        loadResult = await result.current.loadTransits('chart-1', '2024-01-01', '2024-01-31');
      });

      expect(loadResult).toBe(false);
    });
  });

  describe('loadTodayTransits', () => {
    it('should provide loadTodayTransits function', () => {
      const { result } = renderHook(() => useTransits());

      expect(typeof result.current.loadTodayTransits).toBe('function');
    });

    it('should call store loadTodayTransits and return true on success', async () => {
      mockTransitStore.loadTodayTransits.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useTransits());

      let loadResult: boolean | undefined;
      await act(async () => {
        loadResult = await result.current.loadTodayTransits();
      });

      expect(mockTransitStore.loadTodayTransits).toHaveBeenCalled();
      expect(loadResult).toBe(true);
    });

    it('should return false on loadTodayTransits failure', async () => {
      mockTransitStore.loadTodayTransits.mockRejectedValueOnce(new Error('Failed'));

      const { result } = renderHook(() => useTransits());

      let loadResult: boolean | undefined;
      await act(async () => {
        loadResult = await result.current.loadTodayTransits();
      });

      expect(loadResult).toBe(false);
    });
  });

  describe('loadTransitCalendar', () => {
    it('should provide loadTransitCalendar function', () => {
      const { result } = renderHook(() => useTransits());

      expect(typeof result.current.loadTransitCalendar).toBe('function');
    });

    it('should call store loadTransitCalendar and return true on success', async () => {
      mockTransitStore.loadTransitCalendar.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useTransits());

      let loadResult: boolean | undefined;
      await act(async () => {
        loadResult = await result.current.loadTransitCalendar(1, 2024);
      });

      expect(mockTransitStore.loadTransitCalendar).toHaveBeenCalledWith(1, 2024);
      expect(loadResult).toBe(true);
    });

    it('should return false on loadTransitCalendar failure', async () => {
      mockTransitStore.loadTransitCalendar.mockRejectedValueOnce(new Error('Failed'));

      const { result } = renderHook(() => useTransits());

      let loadResult: boolean | undefined;
      await act(async () => {
        loadResult = await result.current.loadTransitCalendar(1, 2024);
      });

      expect(loadResult).toBe(false);
    });
  });

  describe('loadTransitForecast', () => {
    it('should provide loadTransitForecast function', () => {
      const { result } = renderHook(() => useTransits());

      expect(typeof result.current.loadTransitForecast).toBe('function');
    });

    it('should call store loadTransitForecast with week duration', async () => {
      mockTransitStore.loadTransitForecast.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useTransits());

      let loadResult: boolean | undefined;
      await act(async () => {
        loadResult = await result.current.loadTransitForecast('week');
      });

      expect(mockTransitStore.loadTransitForecast).toHaveBeenCalledWith('week');
      expect(loadResult).toBe(true);
    });

    it('should call store loadTransitForecast with month duration', async () => {
      mockTransitStore.loadTransitForecast.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useTransits());

      await act(async () => {
        await result.current.loadTransitForecast('month');
      });

      expect(mockTransitStore.loadTransitForecast).toHaveBeenCalledWith('month');
    });

    it('should call store loadTransitForecast with quarter duration', async () => {
      mockTransitStore.loadTransitForecast.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useTransits());

      await act(async () => {
        await result.current.loadTransitForecast('quarter');
      });

      expect(mockTransitStore.loadTransitForecast).toHaveBeenCalledWith('quarter');
    });

    it('should call store loadTransitForecast with year duration', async () => {
      mockTransitStore.loadTransitForecast.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useTransits());

      await act(async () => {
        await result.current.loadTransitForecast('year');
      });

      expect(mockTransitStore.loadTransitForecast).toHaveBeenCalledWith('year');
    });

    it('should return false on loadTransitForecast failure', async () => {
      mockTransitStore.loadTransitForecast.mockRejectedValueOnce(new Error('Failed'));

      const { result } = renderHook(() => useTransits());

      let loadResult: boolean | undefined;
      await act(async () => {
        loadResult = await result.current.loadTransitForecast('week');
      });

      expect(loadResult).toBe(false);
    });
  });

  describe('getMajorTransits', () => {
    it('should filter major transits', () => {
      mockTransitStore.transits = [mockTransit, mockMinorTransit];

      const { result } = renderHook(() => useTransits());

      const majorTransits = result.current.getMajorTransits();

      expect(majorTransits).toHaveLength(1);
      expect(majorTransits[0].type).toBe('major');
    });

    it('should return empty array when no major transits', () => {
      mockTransitStore.transits = [mockMinorTransit];

      const { result } = renderHook(() => useTransits());

      const majorTransits = result.current.getMajorTransits();

      expect(majorTransits).toHaveLength(0);
    });
  });

  describe('getMinorTransits', () => {
    it('should filter minor transits', () => {
      mockTransitStore.transits = [mockTransit, mockMinorTransit];

      const { result } = renderHook(() => useTransits());

      const minorTransits = result.current.getMinorTransits();

      expect(minorTransits).toHaveLength(1);
      expect(minorTransits[0].type).toBe('minor');
    });

    it('should return empty array when no minor transits', () => {
      mockTransitStore.transits = [mockTransit];

      const { result } = renderHook(() => useTransits());

      const minorTransits = result.current.getMinorTransits();

      expect(minorTransits).toHaveLength(0);
    });
  });

  describe('getTransitsByPlanet', () => {
    it('should filter transits by planet', () => {
      mockTransitStore.transits = [mockTransit, mockMinorTransit];

      const { result } = renderHook(() => useTransits());

      const saturnTransits = result.current.getTransitsByPlanet('Saturn');

      expect(saturnTransits).toHaveLength(1);
      expect(saturnTransits[0].planet).toBe('Saturn');
    });

    it('should return empty array when no transits match planet', () => {
      mockTransitStore.transits = [mockTransit];

      const { result } = renderHook(() => useTransits());

      const jupiterTransits = result.current.getTransitsByPlanet('Jupiter');

      expect(jupiterTransits).toHaveLength(0);
    });
  });

  describe('getActiveTransitsForDate', () => {
    it('should return transits active on specific date', () => {
      mockTransitStore.transits = [mockTransit];

      const { result } = renderHook(() => useTransits());

      const activeTransits = result.current.getActiveTransitsForDate(new Date('2024-01-15'));

      expect(activeTransits).toHaveLength(1);
    });

    it('should return empty array when no transits are active', () => {
      mockTransitStore.transits = [mockTransit];

      const { result } = renderHook(() => useTransits());

      const activeTransits = result.current.getActiveTransitsForDate(new Date('2024-06-15'));

      expect(activeTransits).toHaveLength(0);
    });
  });

  describe('getEnergyLabel', () => {
    it('should return "High" for energy level >= 80', () => {
      mockTransitStore.energyLevel = 85;

      const { result } = renderHook(() => useTransits());

      expect(result.current.getEnergyLabel()).toBe('High');
    });

    it('should return "Moderate to High" for energy level 60-79', () => {
      mockTransitStore.energyLevel = 70;

      const { result } = renderHook(() => useTransits());

      expect(result.current.getEnergyLabel()).toBe('Moderate to High');
    });

    it('should return "Moderate" for energy level 40-59', () => {
      mockTransitStore.energyLevel = 50;

      const { result } = renderHook(() => useTransits());

      expect(result.current.getEnergyLabel()).toBe('Moderate');
    });

    it('should return "Low to Moderate" for energy level 20-39', () => {
      mockTransitStore.energyLevel = 30;

      const { result } = renderHook(() => useTransits());

      expect(result.current.getEnergyLabel()).toBe('Low to Moderate');
    });

    it('should return "Low" for energy level < 20', () => {
      mockTransitStore.energyLevel = 10;

      const { result } = renderHook(() => useTransits());

      expect(result.current.getEnergyLabel()).toBe('Low');
    });
  });

  describe('getEnergyColor', () => {
    it('should return "green" for energy level >= 80', () => {
      mockTransitStore.energyLevel = 85;

      const { result } = renderHook(() => useTransits());

      expect(result.current.getEnergyColor()).toBe('green');
    });

    it('should return "blue" for energy level 60-79', () => {
      mockTransitStore.energyLevel = 70;

      const { result } = renderHook(() => useTransits());

      expect(result.current.getEnergyColor()).toBe('blue');
    });

    it('should return "yellow" for energy level 40-59', () => {
      mockTransitStore.energyLevel = 50;

      const { result } = renderHook(() => useTransits());

      expect(result.current.getEnergyColor()).toBe('yellow');
    });

    it('should return "orange" for energy level 20-39', () => {
      mockTransitStore.energyLevel = 30;

      const { result } = renderHook(() => useTransits());

      expect(result.current.getEnergyColor()).toBe('orange');
    });

    it('should return "red" for energy level < 20', () => {
      mockTransitStore.energyLevel = 10;

      const { result } = renderHook(() => useTransits());

      expect(result.current.getEnergyColor()).toBe('red');
    });
  });

  describe('utility methods', () => {
    it('should expose setDateRange from store', () => {
      const { result } = renderHook(() => useTransits());

      expect(result.current.setDateRange).toBe(mockTransitStore.setDateRange);
    });

    it('should expose clearTransits from store', () => {
      const { result } = renderHook(() => useTransits());

      act(() => {
        result.current.clearTransits();
      });

      expect(mockTransitStore.clearTransits).toHaveBeenCalled();
    });

    it('should expose clearError from store', () => {
      const { result } = renderHook(() => useTransits());

      act(() => {
        result.current.clearError();
      });

      expect(mockTransitStore.clearError).toHaveBeenCalled();
    });
  });
});
