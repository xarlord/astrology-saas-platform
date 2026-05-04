/**
 * Tests for useCharts Hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCharts } from '../../hooks/useCharts';
import type { Chart, BirthData } from '../../services/api.types';

// Mock chart data
const mockChart: Chart = {
  id: 'chart-1',
  name: 'Test Chart',
  type: 'natal',
  birthData: {
    date: '1990-01-15',
    time: '12:00',
    location: 'New York',
    latitude: 40.7128,
    longitude: -74.006,
  } as BirthData,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockChart2: Chart = {
  id: 'chart-2',
  name: 'Second Chart',
  type: 'solar-return',
  birthData: {
    date: '1995-06-20',
    time: '08:30',
    location: 'Los Angeles',
    latitude: 34.0522,
    longitude: -118.2437,
  } as BirthData,
  createdAt: '2024-01-02T00:00:00Z',
  updatedAt: '2024-01-02T00:00:00Z',
};

// Mock the chart store
const mockChartStore = {
  charts: [] as Chart[],
  currentChart: null as Chart | null,
  isLoading: false,
  error: null as string | null,
  pagination: null as {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null,
  loadCharts: vi.fn(),
  loadChart: vi.fn(),
  createChart: vi.fn(),
  updateChart: vi.fn(),
  deleteChart: vi.fn(),
  calculateChart: vi.fn(),
  setCurrentChart: vi.fn(),
  clearCurrentChart: vi.fn(),
  clearError: vi.fn(),
};

vi.mock('../../stores', () => ({
  useChartStore: vi.fn((selector?: (state: typeof mockChartStore) => unknown) => {
    if (selector) {
      return selector(mockChartStore);
    }
    return mockChartStore;
  }),
}));

describe('useCharts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockChartStore.charts = [];
    mockChartStore.currentChart = null;
    mockChartStore.isLoading = false;
    mockChartStore.error = null;
    mockChartStore.pagination = null;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should return chart state from store', () => {
      const { result } = renderHook(() => useCharts(false));

      expect(result.current.charts).toEqual([]);
      expect(result.current.currentChart).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.pagination).toBeNull();
    });

    it('should return hasMore as false when no pagination', () => {
      const { result } = renderHook(() => useCharts(false));

      expect(result.current.hasMore).toBe(false);
    });

    it('should return hasMore correctly based on pagination', () => {
      mockChartStore.pagination = { page: 1, limit: 20, total: 50, totalPages: 3 };

      const { result } = renderHook(() => useCharts(false));

      expect(result.current.hasMore).toBe(true);
    });
  });

  describe('autoLoad', () => {
    it('should auto-load charts when autoLoad is true', async () => {
      mockChartStore.loadCharts.mockResolvedValueOnce(undefined);

      renderHook(() => useCharts(true));

      await waitFor(() => {
        expect(mockChartStore.loadCharts).toHaveBeenCalled();
      });
    });

    it('should not auto-load charts when autoLoad is false', () => {
      renderHook(() => useCharts(false));

      expect(mockChartStore.loadCharts).not.toHaveBeenCalled();
    });

    it('should not auto-load charts when autoLoad is not specified (defaults to true)', async () => {
      mockChartStore.loadCharts.mockResolvedValueOnce(undefined);

      renderHook(() => useCharts());

      await waitFor(() => {
        expect(mockChartStore.loadCharts).toHaveBeenCalled();
      });
    });
  });

  describe('createChart', () => {
    it('should provide createChart function', () => {
      const { result } = renderHook(() => useCharts(false));

      expect(typeof result.current.createChart).toBe('function');
    });

    it('should call store createChart and return chart on success', async () => {
      mockChartStore.createChart.mockResolvedValueOnce(mockChart);

      const { result } = renderHook(() => useCharts(false));

      const birthData: BirthData = {
        date: '1990-01-15',
        time: '12:00',
        location: 'New York',
      } as BirthData;

      let createdChart: Chart | null = null;
      await act(async () => {
        createdChart = await result.current.createChart(birthData);
      });

      expect(mockChartStore.createChart).toHaveBeenCalledWith(birthData);
      expect(createdChart).toEqual(mockChart);
    });

    it('should return null on createChart failure', async () => {
      mockChartStore.createChart.mockRejectedValueOnce(new Error('Create failed'));

      const { result } = renderHook(() => useCharts(false));

      const birthData: BirthData = {
        date: '1990-01-15',
        time: '12:00',
        location: 'New York',
      } as BirthData;

      let createdChart: Chart | null = 'not-null' as unknown as Chart | null;
      await act(async () => {
        createdChart = await result.current.createChart(birthData);
      });

      expect(createdChart).toBeNull();
    });
  });

  describe('updateChart', () => {
    it('should provide updateChart function', () => {
      const { result } = renderHook(() => useCharts(false));

      expect(typeof result.current.updateChart).toBe('function');
    });

    it('should call store updateChart and return true on success', async () => {
      mockChartStore.updateChart.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useCharts(false));

      let updateResult: boolean | undefined;
      await act(async () => {
        updateResult = await result.current.updateChart('chart-1', { name: 'Updated' });
      });

      expect(mockChartStore.updateChart).toHaveBeenCalledWith('chart-1', { name: 'Updated' });
      expect(updateResult).toBe(true);
    });

    it('should return false on updateChart failure', async () => {
      mockChartStore.updateChart.mockRejectedValueOnce(new Error('Update failed'));

      const { result } = renderHook(() => useCharts(false));

      let updateResult: boolean | undefined;
      await act(async () => {
        updateResult = await result.current.updateChart('chart-1', { name: 'Updated' });
      });

      expect(updateResult).toBe(false);
    });
  });

  describe('deleteChart', () => {
    it('should provide deleteChart function', () => {
      const { result } = renderHook(() => useCharts(false));

      expect(typeof result.current.deleteChart).toBe('function');
    });

    it('should call store deleteChart and return true on success', async () => {
      mockChartStore.deleteChart.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useCharts(false));

      let deleteResult: boolean | undefined;
      await act(async () => {
        deleteResult = await result.current.deleteChart('chart-1');
      });

      expect(mockChartStore.deleteChart).toHaveBeenCalledWith('chart-1');
      expect(deleteResult).toBe(true);
    });

    it('should return false on deleteChart failure', async () => {
      mockChartStore.deleteChart.mockRejectedValueOnce(new Error('Delete failed'));

      const { result } = renderHook(() => useCharts(false));

      let deleteResult: boolean | undefined;
      await act(async () => {
        deleteResult = await result.current.deleteChart('chart-1');
      });

      expect(deleteResult).toBe(false);
    });
  });

  describe('calculateChart', () => {
    it('should provide calculateChart function', () => {
      const { result } = renderHook(() => useCharts(false));

      expect(typeof result.current.calculateChart).toBe('function');
    });

    it('should call store calculateChart and return true on success', async () => {
      mockChartStore.calculateChart.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useCharts(false));

      let calcResult: boolean | undefined;
      await act(async () => {
        calcResult = await result.current.calculateChart('chart-1');
      });

      expect(mockChartStore.calculateChart).toHaveBeenCalledWith('chart-1');
      expect(calcResult).toBe(true);
    });

    it('should return false on calculateChart failure', async () => {
      mockChartStore.calculateChart.mockRejectedValueOnce(new Error('Calculate failed'));

      const { result } = renderHook(() => useCharts(false));

      let calcResult: boolean | undefined;
      await act(async () => {
        calcResult = await result.current.calculateChart('chart-1');
      });

      expect(calcResult).toBe(false);
    });
  });

  describe('getChartById', () => {
    it('should return chart by id', () => {
      mockChartStore.charts = [mockChart, mockChart2];

      const { result } = renderHook(() => useCharts(false));

      expect(result.current.getChartById('chart-1')).toEqual(mockChart);
      expect(result.current.getChartById('chart-2')).toEqual(mockChart2);
    });

    it('should return undefined for non-existent chart', () => {
      mockChartStore.charts = [mockChart];

      const { result } = renderHook(() => useCharts(false));

      expect(result.current.getChartById('non-existent')).toBeUndefined();
    });
  });

  describe('getChartsByType', () => {
    it('should filter charts by type', () => {
      mockChartStore.charts = [mockChart, mockChart2];

      const { result } = renderHook(() => useCharts(false));

      expect(result.current.getChartsByType('natal')).toEqual([mockChart]);
      expect(result.current.getChartsByType('solar-return')).toEqual([mockChart2]);
    });

    it('should return empty array when no charts match type', () => {
      mockChartStore.charts = [mockChart];

      const { result } = renderHook(() => useCharts(false));

      expect(result.current.getChartsByType('synastry')).toEqual([]);
    });

    it('should return empty array when no charts exist', () => {
      mockChartStore.charts = [];

      const { result } = renderHook(() => useCharts(false));

      expect(result.current.getChartsByType('natal')).toEqual([]);
    });
  });

  describe('loadMore', () => {
    it('should load next page when hasMore is true', async () => {
      mockChartStore.pagination = { page: 1, limit: 20, total: 50, totalPages: 3 };
      mockChartStore.loadCharts.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useCharts(false));

      await act(async () => {
        await result.current.loadMore();
      });

      expect(mockChartStore.loadCharts).toHaveBeenCalledWith(2, 20);
    });

    it('should not load when on last page', async () => {
      mockChartStore.pagination = { page: 3, limit: 20, total: 50, totalPages: 3 };

      const { result } = renderHook(() => useCharts(false));

      await act(async () => {
        await result.current.loadMore();
      });

      expect(mockChartStore.loadCharts).not.toHaveBeenCalled();
    });

    it('should not load when pagination is null', async () => {
      mockChartStore.pagination = null;

      const { result } = renderHook(() => useCharts(false));

      await act(async () => {
        await result.current.loadMore();
      });

      expect(mockChartStore.loadCharts).not.toHaveBeenCalled();
    });
  });

  describe('utility methods', () => {
    it('should expose loadCharts from store', () => {
      const { result } = renderHook(() => useCharts(false));

      expect(result.current.loadCharts).toBe(mockChartStore.loadCharts);
    });

    it('should expose loadChart from store', () => {
      const { result } = renderHook(() => useCharts(false));

      expect(result.current.loadChart).toBe(mockChartStore.loadChart);
    });

    it('should expose setCurrentChart from store', () => {
      const { result } = renderHook(() => useCharts(false));

      act(() => {
        result.current.setCurrentChart(mockChart);
      });

      expect(mockChartStore.setCurrentChart).toHaveBeenCalledWith(mockChart);
    });

    it('should expose clearCurrentChart from store', () => {
      const { result } = renderHook(() => useCharts(false));

      act(() => {
        result.current.clearCurrentChart();
      });

      expect(mockChartStore.clearCurrentChart).toHaveBeenCalled();
    });

    it('should expose clearError from store', () => {
      const { result } = renderHook(() => useCharts(false));

      act(() => {
        result.current.clearError();
      });

      expect(mockChartStore.clearError).toHaveBeenCalled();
    });
  });
});
