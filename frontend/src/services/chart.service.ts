/**
 * Chart Service
 */

import api from './api';
import type { BirthData, Chart } from '../types/chart.types';
export type { BirthData, Chart, ChartCalculatedData } from '../types/chart.types';

interface ChartPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const chartService = {
  /**
   * Create new chart
   */
  async createChart(data: BirthData): Promise<{ chart: Chart }> {
    const response = await api.post<{ data: { chart: Chart } }>('/charts', data);
    return response.data.data;
  },

  /**
   * Get user's charts
   */
  async getCharts(page = 1, limit = 20): Promise<{ charts: Chart[]; pagination: ChartPagination }> {
    const response = await api.get<{ data: { charts: Chart[]; pagination: ChartPagination } }>('/charts', { params: { page, limit } });
    return response.data.data;
  },

  /**
   * Get chart by ID
   */
  async getChart(id: string): Promise<{ chart: Chart }> {
    const response = await api.get<{ data: { chart: Chart } }>(`/charts/${id}`);
    return response.data.data;
  },

  /**
   * Update chart
   */
  async updateChart(id: string, data: Partial<BirthData>): Promise<{ chart: Chart }> {
    const response = await api.put<{ data: { chart: Chart } }>(`/charts/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete chart
   */
  async deleteChart(id: string): Promise<void> {
    await api.delete(`/charts/${id}`);
  },

  /**
   * Calculate chart
   */
  async calculateChart(id: string): Promise<{ chart: Chart }> {
    const response = await api.post<{ data: { chart: Chart } }>(`/charts/${id}/calculate`);
    return response.data.data;
  },
};
