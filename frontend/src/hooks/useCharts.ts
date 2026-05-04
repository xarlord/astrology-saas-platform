/**
 * useCharts Hook
 *
 * Custom hook for chart CRUD operations
 * Wraps the chart store for easier use in components
 */

import { useCallback, useEffect } from 'react';
import { useChartStore } from '../stores';
import type { Chart, BirthData } from '../services/api.types';

export const useCharts = (autoLoad = true) => {
  const {
    charts,
    currentChart,
    isLoading,
    error,
    pagination,
    loadCharts,
    loadChart,
    createChart,
    updateChart,
    deleteChart,
    calculateChart,
    setCurrentChart,
    clearCurrentChart,
    clearError,
  } = useChartStore();

  // Auto-load charts on mount
  useEffect(() => {
    if (autoLoad) {
      void loadCharts();
    }
  }, [autoLoad, loadCharts]);

  // Create chart wrapper
  const handleCreateChart = useCallback(
    async (data: BirthData): Promise<Chart | null> => {
      try {
        const chart = await createChart(data);
        return chart;
      } catch {
        return null;
      }
    },
    [createChart],
  );

  // Update chart wrapper
  const handleUpdateChart = useCallback(
    async (id: string, data: Partial<BirthData>): Promise<boolean> => {
      try {
        await updateChart(id, data);
        return true;
      } catch {
        return false;
      }
    },
    [updateChart],
  );

  // Delete chart wrapper
  const handleDeleteChart = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        await deleteChart(id);
        return true;
      } catch {
        return false;
      }
    },
    [deleteChart],
  );

  // Calculate chart wrapper
  const handleCalculateChart = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        await calculateChart(id);
        return true;
      } catch {
        return false;
      }
    },
    [calculateChart],
  );

  // Get chart by ID
  const getChartById = useCallback(
    (id: string): Chart | undefined => {
      return charts.find((c) => c.id === id);
    },
    [charts],
  );

  // Get charts by type
  const getChartsByType = useCallback(
    (type: string): Chart[] => {
      return charts.filter((c) => c.type === type);
    },
    [charts],
  );

  // Load more charts (pagination)
  const loadMore = useCallback(async () => {
    if (pagination && pagination.page < pagination.totalPages) {
      await loadCharts(pagination.page + 1, pagination.limit);
    }
  }, [pagination, loadCharts]);

  return {
    // State
    charts,
    currentChart,
    isLoading,
    error,
    pagination,

    // Methods
    loadCharts,
    loadChart,
    createChart: handleCreateChart,
    updateChart: handleUpdateChart,
    deleteChart: handleDeleteChart,
    calculateChart: handleCalculateChart,
    setCurrentChart,
    clearCurrentChart,
    clearError,

    // Computed
    getChartById,
    getChartsByType,
    loadMore,
    hasMore: pagination ? pagination.page < pagination.totalPages : false,
  };
};

export default useCharts;
