/**
 * Tests for Chart Store
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { act } from '@testing-library/react';
import { useChartStore } from '../../stores/chartStore';

// Mock the chartService
vi.mock('../../services', () => ({
  chartService: {
    getCharts: vi.fn(),
    getChart: vi.fn(),
    createChart: vi.fn(),
    updateChart: vi.fn(),
    deleteChart: vi.fn(),
    calculateChart: vi.fn(),
  },
}));

// Import after mocking
import { chartService } from '../../services';

const mockChart = {
  id: 'chart-1',
  userId: 'user-1',
  name: 'Test Chart',
  birthDate: '1990-01-15T10:30:00Z',
  birthLocation: {
    city: 'New York',
    country: 'USA',
    latitude: 40.7128,
    longitude: -74.006,
  },
  chartData: {
    sun: { sign: 'Capricorn', degree: 25 },
    moon: { sign: 'Cancer', degree: 10 },
  },
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const mockBirthData = {
  name: 'New Chart',
  birthDate: '1990-06-20T14:00:00Z',
  birthLocation: {
    city: 'Los Angeles',
    country: 'USA',
    latitude: 34.0522,
    longitude: -118.2437,
  },
};

describe('chartStore', () => {
  // Helper to reset store state
  const resetStore = () => {
    useChartStore.setState({
      charts: [],
      currentChart: null,
      isLoading: false,
      error: null,
      pagination: null,
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
      const state = useChartStore.getState();

      expect(state.charts).toEqual([]);
      expect(state.currentChart).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.pagination).toBeNull();
    });
  });

  describe('loadCharts action', () => {
    it('should load charts successfully', async () => {
      const mockResponse = {
        charts: [mockChart],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      };

      vi.mocked(chartService.getCharts).mockResolvedValueOnce(mockResponse);

      await act(async () => {
        await useChartStore.getState().loadCharts(1, 20);
      });

      const state = useChartStore.getState();

      expect(chartService.getCharts).toHaveBeenCalledWith(1, 20);
      expect(state.charts).toEqual([mockChart]);
      expect(state.pagination).toEqual(mockResponse.pagination);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should use default pagination values', async () => {
      const mockResponse = {
        charts: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      };

      vi.mocked(chartService.getCharts).mockResolvedValueOnce(mockResponse);

      await act(async () => {
        await useChartStore.getState().loadCharts();
      });

      expect(chartService.getCharts).toHaveBeenCalledWith(1, 20);
    });

    it('should set loading state during load', async () => {
      const mockResponse = {
        charts: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      };

      vi.mocked(chartService.getCharts).mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(() => resolve(mockResponse), 100))
      );

      const loadPromise = act(async () => {
        await useChartStore.getState().loadCharts();
      });

      expect(useChartStore.getState().isLoading).toBe(true);

      await loadPromise;

      expect(useChartStore.getState().isLoading).toBe(false);
    });

    it('should handle load error', async () => {
      vi.mocked(chartService.getCharts).mockRejectedValueOnce(new Error('Failed to load'));

      await act(async () => {
        await useChartStore.getState().loadCharts();
      });

      const state = useChartStore.getState();

      expect(state.error).toBe('Failed to load');
      expect(state.isLoading).toBe(false);
    });

    it('should handle non-Error load failures', async () => {
      vi.mocked(chartService.getCharts).mockRejectedValueOnce('Unknown error');

      await act(async () => {
        await useChartStore.getState().loadCharts();
      });

      const state = useChartStore.getState();

      expect(state.error).toBe('Failed to load charts');
    });
  });

  describe('loadChart action', () => {
    it('should load a single chart successfully', async () => {
      vi.mocked(chartService.getChart).mockResolvedValueOnce({ chart: mockChart });

      await act(async () => {
        await useChartStore.getState().loadChart('chart-1');
      });

      const state = useChartStore.getState();

      expect(chartService.getChart).toHaveBeenCalledWith('chart-1');
      expect(state.currentChart).toEqual(mockChart);
      expect(state.isLoading).toBe(false);
    });

    it('should handle single chart load error', async () => {
      vi.mocked(chartService.getChart).mockRejectedValueOnce(new Error('Chart not found'));

      await act(async () => {
        await useChartStore.getState().loadChart('non-existent');
      });

      const state = useChartStore.getState();

      expect(state.error).toBe('Chart not found');
      expect(state.currentChart).toBeNull();
    });
  });

  describe('createChart action', () => {
    it('should create a new chart successfully', async () => {
      const newChart = { ...mockChart, id: 'chart-2', name: 'New Chart' };
      vi.mocked(chartService.createChart).mockResolvedValueOnce({ chart: newChart });

      const result = await act(async () => {
        return await useChartStore.getState().createChart(mockBirthData);
      });

      const state = useChartStore.getState();

      expect(chartService.createChart).toHaveBeenCalledWith(mockBirthData);
      expect(state.charts).toHaveLength(1);
      expect(state.charts[0]).toEqual(newChart);
      expect(state.currentChart).toEqual(newChart);
      expect(result).toEqual(newChart);
    });

    it('should add new chart to existing charts', async () => {
      useChartStore.setState({ charts: [mockChart] });

      const newChart = { ...mockChart, id: 'chart-2' };
      vi.mocked(chartService.createChart).mockResolvedValueOnce({ chart: newChart });

      await act(async () => {
        await useChartStore.getState().createChart(mockBirthData);
      });

      const state = useChartStore.getState();

      expect(state.charts).toHaveLength(2);
      expect(state.charts[0]).toEqual(newChart); // New chart should be first
    });

    it('should handle create error', async () => {
      vi.mocked(chartService.createChart).mockRejectedValueOnce(new Error('Create failed'));

      await act(async () => {
        try {
          await useChartStore.getState().createChart(mockBirthData);
          expect.fail('Should have thrown');
        } catch {
          // Expected
        }
      });

      const state = useChartStore.getState();

      expect(state.error).toBe('Create failed');
    });
  });

  describe('updateChart action', () => {
    it('should update chart successfully', async () => {
      useChartStore.setState({ charts: [mockChart], currentChart: mockChart });

      const updatedChart = { ...mockChart, name: 'Updated Name' };
      vi.mocked(chartService.updateChart).mockResolvedValueOnce({ chart: updatedChart });

      await act(async () => {
        await useChartStore.getState().updateChart('chart-1', { name: 'Updated Name' });
      });

      const state = useChartStore.getState();

      expect(chartService.updateChart).toHaveBeenCalledWith('chart-1', { name: 'Updated Name' });
      expect(state.charts[0]).toEqual(updatedChart);
      expect(state.currentChart).toEqual(updatedChart);
    });

    it('should not update currentChart if different chart is updated', async () => {
      const otherChart = { ...mockChart, id: 'chart-2' };
      useChartStore.setState({ charts: [mockChart, otherChart], currentChart: mockChart });

      const updatedOtherChart = { ...otherChart, name: 'Updated' };
      vi.mocked(chartService.updateChart).mockResolvedValueOnce({ chart: updatedOtherChart });

      await act(async () => {
        await useChartStore.getState().updateChart('chart-2', { name: 'Updated' });
      });

      const state = useChartStore.getState();

      expect(state.currentChart).toEqual(mockChart); // Should remain unchanged
      expect(state.charts[1]).toEqual(updatedOtherChart);
    });

    it('should handle update error', async () => {
      vi.mocked(chartService.updateChart).mockRejectedValueOnce(new Error('Update failed'));

      await act(async () => {
        try {
          await useChartStore.getState().updateChart('chart-1', { name: 'Test' });
          expect.fail('Should have thrown');
        } catch {
          // Expected
        }
      });

      expect(useChartStore.getState().error).toBe('Update failed');
    });
  });

  describe('deleteChart action', () => {
    it('should delete chart successfully', async () => {
      useChartStore.setState({ charts: [mockChart] });

      vi.mocked(chartService.deleteChart).mockResolvedValueOnce(undefined);

      await act(async () => {
        await useChartStore.getState().deleteChart('chart-1');
      });

      const state = useChartStore.getState();

      expect(chartService.deleteChart).toHaveBeenCalledWith('chart-1');
      expect(state.charts).toHaveLength(0);
    });

    it('should clear currentChart if deleted', async () => {
      useChartStore.setState({ charts: [mockChart], currentChart: mockChart });

      vi.mocked(chartService.deleteChart).mockResolvedValueOnce(undefined);

      await act(async () => {
        await useChartStore.getState().deleteChart('chart-1');
      });

      const state = useChartStore.getState();

      expect(state.currentChart).toBeNull();
    });

    it('should not clear currentChart if different chart is deleted', async () => {
      const otherChart = { ...mockChart, id: 'chart-2' };
      useChartStore.setState({ charts: [mockChart, otherChart], currentChart: mockChart });

      vi.mocked(chartService.deleteChart).mockResolvedValueOnce(undefined);

      await act(async () => {
        await useChartStore.getState().deleteChart('chart-2');
      });

      const state = useChartStore.getState();

      expect(state.currentChart).toEqual(mockChart);
      expect(state.charts).toHaveLength(1);
    });

    it('should handle delete error', async () => {
      vi.mocked(chartService.deleteChart).mockRejectedValueOnce(new Error('Delete failed'));

      await act(async () => {
        try {
          await useChartStore.getState().deleteChart('chart-1');
          expect.fail('Should have thrown');
        } catch {
          // Expected
        }
      });

      expect(useChartStore.getState().error).toBe('Delete failed');
    });
  });

  describe('calculateChart action', () => {
    it('should calculate chart successfully', async () => {
      useChartStore.setState({ charts: [mockChart] });

      const calculatedChart = { ...mockChart, chartData: { calculated: true } };
      vi.mocked(chartService.calculateChart).mockResolvedValueOnce({ chart: calculatedChart });

      await act(async () => {
        await useChartStore.getState().calculateChart('chart-1');
      });

      const state = useChartStore.getState();

      expect(chartService.calculateChart).toHaveBeenCalledWith('chart-1');
      expect(state.charts[0]).toEqual(calculatedChart);
    });

    it('should update currentChart if it is the calculated one', async () => {
      useChartStore.setState({ charts: [mockChart], currentChart: mockChart });

      const calculatedChart = { ...mockChart, chartData: { calculated: true } };
      vi.mocked(chartService.calculateChart).mockResolvedValueOnce({ chart: calculatedChart });

      await act(async () => {
        await useChartStore.getState().calculateChart('chart-1');
      });

      const state = useChartStore.getState();

      expect(state.currentChart).toEqual(calculatedChart);
    });

    it('should handle calculate error', async () => {
      vi.mocked(chartService.calculateChart).mockRejectedValueOnce(new Error('Calculation failed'));

      await act(async () => {
        try {
          await useChartStore.getState().calculateChart('chart-1');
          expect.fail('Should have thrown');
        } catch {
          // Expected
        }
      });

      expect(useChartStore.getState().error).toBe('Calculation failed');
    });
  });

  describe('setCurrentChart action', () => {
    it('should set current chart', () => {
      act(() => {
        useChartStore.getState().setCurrentChart(mockChart);
      });

      expect(useChartStore.getState().currentChart).toEqual(mockChart);
    });

    it('should set current chart to null', () => {
      useChartStore.setState({ currentChart: mockChart });

      act(() => {
        useChartStore.getState().setCurrentChart(null);
      });

      expect(useChartStore.getState().currentChart).toBeNull();
    });
  });

  describe('clearCurrentChart action', () => {
    it('should clear current chart', () => {
      useChartStore.setState({ currentChart: mockChart });

      act(() => {
        useChartStore.getState().clearCurrentChart();
      });

      expect(useChartStore.getState().currentChart).toBeNull();
    });
  });

  describe('clearError action', () => {
    it('should clear error', () => {
      useChartStore.setState({ error: 'Some error' });

      act(() => {
        useChartStore.getState().clearError();
      });

      expect(useChartStore.getState().error).toBeNull();
    });
  });

  describe('selector hooks', () => {
    it('useCharts should return charts', () => {
      useChartStore.setState({ charts: [mockChart] });
      const charts = useChartStore.getState().charts;
      expect(charts).toEqual([mockChart]);
    });

    it('useCurrentChart should return current chart', () => {
      useChartStore.setState({ currentChart: mockChart });
      const currentChart = useChartStore.getState().currentChart;
      expect(currentChart).toEqual(mockChart);
    });

    it('useChartLoading should return loading state', () => {
      useChartStore.setState({ isLoading: true });
      const isLoading = useChartStore.getState().isLoading;
      expect(isLoading).toBe(true);
    });

    it('useChartError should return error', () => {
      useChartStore.setState({ error: 'Test error' });
      const error = useChartStore.getState().error;
      expect(error).toBe('Test error');
    });
  });
});
