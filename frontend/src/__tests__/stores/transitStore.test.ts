/**
 * Tests for Transit Store
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { act } from '@testing-library/react';
import { useTransitStore } from '../../stores/transitStore';

// Mock the transitService
vi.mock('../../services', () => ({
  transitService: {
    calculateTransits: vi.fn(),
    getTodayTransits: vi.fn(),
    getTransitCalendar: vi.fn(),
    getTransitForecast: vi.fn(),
  },
}));

// Import after mocking
import { transitService } from '../../services';

const mockTransit = {
  id: 'transit-1',
  planet: 'Saturn',
  aspect: 'square',
  targetPlanet: 'Sun',
  sign: 'Pisces',
  degree: 15,
  startDate: '2024-02-01',
  endDate: '2024-02-28',
  interpretation: 'A challenging transit',
};

const mockTransitChart = {
  chartId: 'chart-1',
  transits: [mockTransit],
  energy_level: 75,
};

describe('transitStore', () => {
  // Helper to reset store state
  const resetStore = () => {
    useTransitStore.setState({
      dateRange: null,
      transits: [],
      transitChart: null,
      energyLevel: 50,
      isLoading: false,
      error: null,
    });
  };

  beforeEach(() => {
    resetStore();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useTransitStore.getState();

      expect(state.dateRange).toBeNull();
      expect(state.transits).toEqual([]);
      expect(state.transitChart).toBeNull();
      expect(state.energyLevel).toBe(50);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('setDateRange action', () => {
    it('should set date range', () => {
      act(() => {
        useTransitStore.getState().setDateRange('2024-02-01', '2024-02-28');
      });

      const state = useTransitStore.getState();

      expect(state.dateRange).toEqual({
        start: '2024-02-01',
        end: '2024-02-28',
      });
    });

    it('should override existing date range', () => {
      useTransitStore.setState({
        dateRange: { start: '2024-01-01', end: '2024-01-31' },
      });

      act(() => {
        useTransitStore.getState().setDateRange('2024-03-01', '2024-03-31');
      });

      const state = useTransitStore.getState();

      expect(state.dateRange).toEqual({
        start: '2024-03-01',
        end: '2024-03-31',
      });
    });
  });

  describe('loadTransits action', () => {
    it('should load transits successfully', async () => {
      vi.mocked(transitService.calculateTransits).mockResolvedValueOnce({
        ...mockTransitChart,
        transits: [mockTransit],
      } as any);

      await act(async () => {
        await useTransitStore.getState().loadTransits('chart-1', '2024-02-01', '2024-02-28');
      });

      const state = useTransitStore.getState();

      expect(transitService.calculateTransits).toHaveBeenCalledWith(
        'chart-1',
        '2024-02-01',
        '2024-02-28',
      );
      expect(state.transits).toHaveLength(1);
      expect(state.dateRange).toEqual({ start: '2024-02-01', end: '2024-02-28' });
      expect(state.energyLevel).toBe(75);
      expect(state.isLoading).toBe(false);
    });

    it('should handle null transits in response', async () => {
      vi.mocked(transitService.calculateTransits).mockResolvedValueOnce({
        chartId: 'chart-1',
        transits: null,
      } as any);

      await act(async () => {
        await useTransitStore.getState().loadTransits('chart-1', '2024-02-01', '2024-02-28');
      });

      const state = useTransitStore.getState();

      expect(state.transits).toEqual([]);
    });

    it('should handle missing energy_level in response', async () => {
      vi.mocked(transitService.calculateTransits).mockResolvedValueOnce({
        chartId: 'chart-1',
        transits: [mockTransit],
      } as any);

      await act(async () => {
        await useTransitStore.getState().loadTransits('chart-1', '2024-02-01', '2024-02-28');
      });

      const state = useTransitStore.getState();

      expect(state.energyLevel).toBe(50); // Default value
    });

    it('should set loading state during load', async () => {
      vi.mocked(transitService.calculateTransits).mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(() => resolve({} as any), 100)),
      );

      const loadPromise = act(async () => {
        await useTransitStore.getState().loadTransits('chart-1', '2024-02-01', '2024-02-28');
      });

      expect(useTransitStore.getState().isLoading).toBe(true);

      await loadPromise;

      expect(useTransitStore.getState().isLoading).toBe(false);
    });

    it('should handle load transits error', async () => {
      vi.mocked(transitService.calculateTransits).mockRejectedValueOnce(
        new Error('Calculation failed'),
      );

      await act(async () => {
        try {
          await useTransitStore.getState().loadTransits('chart-1', '2024-02-01', '2024-02-28');
          expect.fail('Should have thrown');
        } catch {
          // Expected
        }
      });

      const state = useTransitStore.getState();

      expect(state.error).toBe('Calculation failed');
      expect(state.isLoading).toBe(false);
    });

    it('should handle non-Error load failures', async () => {
      vi.mocked(transitService.calculateTransits).mockRejectedValueOnce('Unknown');

      await act(async () => {
        try {
          await useTransitStore.getState().loadTransits('chart-1', '2024-02-01', '2024-02-28');
          expect.fail('Should have thrown');
        } catch {
          // Expected
        }
      });

      expect(useTransitStore.getState().error).toBe('Failed to load transits');
    });
  });

  describe('loadTodayTransits action', () => {
    it('should load today transits successfully', async () => {
      vi.mocked(transitService.getTodayTransits).mockResolvedValueOnce({
        transits: [mockTransit],
        energyLevel: 80,
      });

      await act(async () => {
        await useTransitStore.getState().loadTodayTransits();
      });

      const state = useTransitStore.getState();

      expect(transitService.getTodayTransits).toHaveBeenCalled();
      expect(state.transits).toHaveLength(1);
      expect(state.energyLevel).toBe(80);
      expect(state.isLoading).toBe(false);
    });

    it('should handle null transits in today response', async () => {
      vi.mocked(transitService.getTodayTransits).mockResolvedValueOnce({
        transits: null,
        energyLevel: 60,
      });

      await act(async () => {
        await useTransitStore.getState().loadTodayTransits();
      });

      const state = useTransitStore.getState();

      expect(state.transits).toEqual([]);
    });

    it('should handle missing energyLevel in today response', async () => {
      vi.mocked(transitService.getTodayTransits).mockResolvedValueOnce({
        transits: [mockTransit],
      });

      await act(async () => {
        await useTransitStore.getState().loadTodayTransits();
      });

      const state = useTransitStore.getState();

      expect(state.energyLevel).toBe(50); // Default
    });

    it('should handle today transits error', async () => {
      vi.mocked(transitService.getTodayTransits).mockRejectedValueOnce(new Error('API error'));

      await act(async () => {
        try {
          await useTransitStore.getState().loadTodayTransits();
          expect.fail('Should have thrown');
        } catch {
          // Expected
        }
      });

      const state = useTransitStore.getState();

      expect(state.error).toBe('API error');
    });
  });

  describe('loadTransitCalendar action', () => {
    it('should load transit calendar successfully', async () => {
      vi.mocked(transitService.getTransitCalendar).mockResolvedValueOnce({
        transits: [mockTransit],
      });

      await act(async () => {
        await useTransitStore.getState().loadTransitCalendar(2, 2024);
      });

      const state = useTransitStore.getState();

      expect(transitService.getTransitCalendar).toHaveBeenCalledWith(2, 2024);
      expect(state.transits).toHaveLength(1);
      expect(state.isLoading).toBe(false);
    });

    it('should handle null transits in calendar response', async () => {
      vi.mocked(transitService.getTransitCalendar).mockResolvedValueOnce({
        transits: null,
      });

      await act(async () => {
        await useTransitStore.getState().loadTransitCalendar(2, 2024);
      });

      expect(useTransitStore.getState().transits).toEqual([]);
    });

    it('should handle calendar load error', async () => {
      vi.mocked(transitService.getTransitCalendar).mockRejectedValueOnce(
        new Error('Calendar error'),
      );

      await act(async () => {
        try {
          await useTransitStore.getState().loadTransitCalendar(2, 2024);
          expect.fail('Should have thrown');
        } catch {
          // Expected
        }
      });

      expect(useTransitStore.getState().error).toBe('Calendar error');
    });
  });

  describe('loadTransitForecast action', () => {
    it('should load transit forecast for week', async () => {
      vi.mocked(transitService.getTransitForecast).mockResolvedValueOnce({
        transits: [mockTransit],
        energyLevel: 65,
      });

      await act(async () => {
        await useTransitStore.getState().loadTransitForecast('week');
      });

      const state = useTransitStore.getState();

      expect(transitService.getTransitForecast).toHaveBeenCalledWith('week');
      expect(state.transits).toHaveLength(1);
      expect(state.energyLevel).toBe(65);
    });

    it('should load transit forecast for different durations', async () => {
      const durations: Array<'week' | 'month' | 'quarter' | 'year'> = [
        'week',
        'month',
        'quarter',
        'year',
      ];

      for (const duration of durations) {
        vi.mocked(transitService.getTransitForecast).mockResolvedValueOnce({
          transits: [],
          energyLevel: 50,
        });

        await act(async () => {
          await useTransitStore.getState().loadTransitForecast(duration);
        });

        expect(transitService.getTransitForecast).toHaveBeenCalledWith(duration);
      }
    });

    it('should handle forecast load error', async () => {
      vi.mocked(transitService.getTransitForecast).mockRejectedValueOnce(
        new Error('Forecast error'),
      );

      await act(async () => {
        try {
          await useTransitStore.getState().loadTransitForecast('month');
          expect.fail('Should have thrown');
        } catch {
          // Expected
        }
      });

      expect(useTransitStore.getState().error).toBe('Forecast error');
    });
  });

  describe('clearTransits action', () => {
    it('should clear all transit state', () => {
      useTransitStore.setState({
        transits: [mockTransit] as any,
        transitChart: mockTransitChart as any,
        dateRange: { start: '2024-01-01', end: '2024-01-31' },
        energyLevel: 80,
      });

      act(() => {
        useTransitStore.getState().clearTransits();
      });

      const state = useTransitStore.getState();

      expect(state.transits).toEqual([]);
      expect(state.transitChart).toBeNull();
      expect(state.dateRange).toBeNull();
      expect(state.energyLevel).toBe(50); // Reset to default
    });
  });

  describe('clearError action', () => {
    it('should clear error', () => {
      useTransitStore.setState({ error: 'Some error' });

      act(() => {
        useTransitStore.getState().clearError();
      });

      expect(useTransitStore.getState().error).toBeNull();
    });
  });

  describe('selector hooks', () => {
    it('useTransits should return transits', () => {
      useTransitStore.setState({ transits: [mockTransit] as any });
      const transits = useTransitStore.getState().transits;
      expect(transits).toEqual([mockTransit]);
    });

    it('useTransitChart should return transit chart', () => {
      useTransitStore.setState({ transitChart: mockTransitChart as any });
      const transitChart = useTransitStore.getState().transitChart;
      expect(transitChart).toEqual(mockTransitChart);
    });

    it('useEnergyLevel should return energy level', () => {
      useTransitStore.setState({ energyLevel: 85 });
      const energyLevel = useTransitStore.getState().energyLevel;
      expect(energyLevel).toBe(85);
    });

    it('useTransitLoading should return loading state', () => {
      useTransitStore.setState({ isLoading: true });
      const isLoading = useTransitStore.getState().isLoading;
      expect(isLoading).toBe(true);
    });
  });
});
