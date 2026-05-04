/**
 * Chart Service
 */

import api from './api';
import type { Chart, BirthData, ApiResponse } from './api.types';
import {
  transformChart,
  transformCharts,
  birthDataToAPI,
  type APIChart,
  type BirthData as FrontendBirthData,
} from '@/utils/apiTransformers';

// Re-export types from api.types for consumers
export type { Chart, BirthData } from './api.types';

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
  totalPages: number;
}

interface ChartListResponse {
  charts: Chart[];
  pagination: PaginationInfo;
}

interface ChartResponse {
  chart: Chart;
}

export const chartService = {
  /**
   * Create new chart
   */
  async createChart(data: BirthData): Promise<ChartResponse> {
    // Transform frontend BirthData to API format
    const apiData = birthDataToAPI(data as unknown as FrontendBirthData);
    const response = await api.post<ApiResponse<{ chart: APIChart }>>('/charts', apiData);

    // Transform API response back to frontend format
    const apiChart = response.data.data.chart;
    return {
      chart: transformChart(apiChart) as unknown as Chart,
    };
  },

  /**
   * Get user's charts
   */
  async getCharts(page = 1, limit = 20): Promise<ChartListResponse> {
    const response = await api.get<ApiResponse<{ charts: APIChart[]; pagination: PaginationInfo }>>(
      '/charts',
      { params: { page, limit } },
    );

    // Transform API charts to frontend format
    const apiCharts = response.data.data.charts;
    return {
      charts: transformCharts(apiCharts) as unknown as Chart[],
      pagination: {
        ...response.data.data.pagination,
        totalPages: response.data.data.pagination.pages,
      },
    };
  },

  /**
   * Get chart by ID
   */
  async getChart(id: string): Promise<ChartResponse> {
    const response = await api.get<ApiResponse<{ chart: APIChart }>>(`/charts/${id}`);

    // Transform API chart to frontend format
    const apiChart = response.data.data.chart;
    return {
      chart: transformChart(apiChart) as unknown as Chart,
    };
  },

  /**
   * Update chart
   */
  async updateChart(id: string, data: Partial<BirthData>): Promise<ChartResponse> {
    // Transform frontend BirthData to API format
    const apiData = birthDataToAPI(data as unknown as FrontendBirthData);
    const response = await api.put<ApiResponse<{ chart: APIChart }>>(`/charts/${id}`, apiData);

    // Transform API response back to frontend format
    const apiChart = response.data.data.chart;
    return {
      chart: transformChart(apiChart) as unknown as Chart,
    };
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
  async calculateChart(id: string): Promise<ChartResponse> {
    const response = await api.post<ApiResponse<{ chart: APIChart }>>(`/charts/${id}/calculate`);

    // Transform API chart to frontend format
    const apiChart = response.data.data.chart;
    return {
      chart: transformChart(apiChart) as unknown as Chart,
    };
  },
};
