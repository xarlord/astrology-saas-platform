/**
 * Chart Store
 *
 * Manages astrological chart state and CRUD operations
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { chartService } from '../services';
import type { Chart, BirthData } from '../services/api.types';

interface ChartState {
  // State
  charts: Chart[];
  currentChart: Chart | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;

  // Actions
  loadCharts: (page?: number, limit?: number) => Promise<void>;
  loadChart: (id: string) => Promise<void>;
  createChart: (data: BirthData) => Promise<Chart>;
  updateChart: (id: string, data: Partial<BirthData>) => Promise<void>;
  deleteChart: (id: string) => Promise<void>;
  calculateChart: (id: string) => Promise<void>;
  setCurrentChart: (chart: Chart | null) => void;
  clearCurrentChart: () => void;
  clearError: () => void;
}

export const useChartStore = create<ChartState>()(
  devtools(
    (set, _get) => ({
      // Initial state
      charts: [],
      currentChart: null,
      isLoading: false,
      error: null,
      pagination: null,

      // Load all charts
      loadCharts: async (page = 1, limit = 20) => {
        set({ isLoading: true, error: null });
        try {
          const response = await chartService.getCharts(page, limit);
          set({
            charts: response.charts,
            pagination: response.pagination,
            isLoading: false,
          });
        } catch (error: unknown) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load charts',
            isLoading: false,
          });
        }
      },

      // Load single chart
      loadChart: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await chartService.getChart(id);
          set({
            currentChart: response.chart,
            isLoading: false,
          });
        } catch (error: unknown) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load chart',
            isLoading: false,
          });
        }
      },

      // Create new chart
      createChart: async (data: BirthData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await chartService.createChart(data);
          const newChart = response.chart;

          // Add to charts list
          set((state) => ({
            charts: [newChart, ...state.charts],
            currentChart: newChart,
            isLoading: false,
          }));

          return newChart;
        } catch (error: unknown) {
          set({
            error: error instanceof Error ? error.message : 'Failed to create chart',
            isLoading: false,
          });
          throw error;
        }
      },

      // Update chart
      updateChart: async (id: string, data: Partial<BirthData>) => {
        set({ isLoading: true, error: null });
        try {
          const response = await chartService.updateChart(id, data);
          const updatedChart = response.chart;

          // Update in charts list
          set((state) => ({
            charts: state.charts.map((c) => (c.id === id ? updatedChart : c)),
            currentChart: state.currentChart?.id === id ? updatedChart : state.currentChart,
            isLoading: false,
          }));
        } catch (error: unknown) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update chart',
            isLoading: false,
          });
          throw error;
        }
      },

      // Delete chart
      deleteChart: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          await chartService.deleteChart(id);

          // Remove from charts list
          set((state) => ({
            charts: state.charts.filter((c) => c.id !== id),
            currentChart: state.currentChart?.id === id ? null : state.currentChart,
            isLoading: false,
          }));
        } catch (error: unknown) {
          set({
            error: error instanceof Error ? error.message : 'Failed to delete chart',
            isLoading: false,
          });
          throw error;
        }
      },

      // Calculate chart
      calculateChart: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await chartService.calculateChart(id);
          const calculatedChart = response.chart;

          // Update in charts list
          set((state) => ({
            charts: state.charts.map((c) => (c.id === id ? calculatedChart : c)),
            currentChart: state.currentChart?.id === id ? calculatedChart : state.currentChart,
            isLoading: false,
          }));
        } catch (error: unknown) {
          set({
            error: error instanceof Error ? error.message : 'Failed to calculate chart',
            isLoading: false,
          });
          throw error;
        }
      },

      // Set current chart
      setCurrentChart: (chart: Chart | null) => {
        set({ currentChart: chart });
      },

      // Clear current chart
      clearCurrentChart: () => {
        set({ currentChart: null });
      },

      // Clear error
      clearError: () => set({ error: null }),
    }),
    { name: 'ChartStore' },
  ),
);

// Selector hooks for optimized re-renders
export const useCharts = () => useChartStore((state) => state.charts);
export const useCurrentChart = () => useChartStore((state) => state.currentChart);
export const useChartLoading = () => useChartStore((state) => state.isLoading);
export const useChartError = () => useChartStore((state) => state.error);

export default useChartStore;
