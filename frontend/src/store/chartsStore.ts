/**
 * Charts Store - Zustand
 */

import { create } from 'zustand';
import { chartService, Chart, BirthData } from '../services';

interface ChartsState {
  charts: Chart[];
  currentChart: Chart | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;

  // Actions
  fetchCharts: (page?: number, limit?: number) => Promise<void>;
  fetchChart: (id: string) => Promise<void>;
  createChart: (data: BirthData) => Promise<void>;
  updateChart: (id: string, data: Partial<BirthData>) => Promise<void>;
  deleteChart: (id: string) => Promise<void>;
  calculateChart: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useChartsStore = create<ChartsState>((set) => ({
  charts: [],
  currentChart: null,
  isLoading: false,
  error: null,
  pagination: null,

  fetchCharts: async (page = 1, limit = 20) => {
    set({ isLoading: true, error: null });
    try {
      const response = await chartService.getCharts(page, limit);
      set({
        charts: response.charts,
        pagination: response.pagination,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.error?.message || 'Failed to fetch charts',
        isLoading: false,
      });
    }
  },

  fetchChart: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await chartService.getChart(id);
      set({
        currentChart: response.chart,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.error?.message || 'Failed to fetch chart',
        isLoading: false,
      });
    }
  },

  createChart: async (data: BirthData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await chartService.createChart(data);
      set((state) => ({
        charts: [response.chart, ...state.charts],
        currentChart: response.chart,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.error?.message || 'Failed to create chart',
        isLoading: false,
      });
      throw error;
    }
  },

  updateChart: async (id: string, data: Partial<BirthData>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await chartService.updateChart(id, data);
      set((state) => ({
        charts: state.charts.map((c) => (c.id === id ? response.chart : c)),
        currentChart: state.currentChart?.id === id ? response.chart : state.currentChart,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.error?.message || 'Failed to update chart',
        isLoading: false,
      });
    }
  },

  deleteChart: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await chartService.deleteChart(id);
      set((state) => ({
        charts: state.charts.filter((c) => c.id !== id),
        currentChart: state.currentChart?.id === id ? null : state.currentChart,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.error?.message || 'Failed to delete chart',
        isLoading: false,
      });
    }
  },

  calculateChart: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await chartService.calculateChart(id);
      set((state) => ({
        charts: state.charts.map((c) => (c.id === id ? response.chart : c)),
        currentChart: state.currentChart?.id === id ? response.chart : state.currentChart,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.error?.message || 'Failed to calculate chart',
        isLoading: false,
      });
    }
  },

  clearError: () => set({ error: null }),
}));
