/**
 * Chart Service
 */

import api from './api';
import type { Chart, BirthData, ApiResponse } from './api.types';
import {
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
  async createChart(data: Record<string, unknown>): Promise<ChartResponse> {
    // The form may send data already in API format (snake_case) or in frontend format (camelCase).
    // Detect which format we have and transform accordingly.
    let apiData: Record<string, unknown>;
    if ('birth_date' in data || 'birth_latitude' in data) {
      // Already in API format — pass through directly
      apiData = data;
    } else {
      // Frontend camelCase format — transform to API format
      apiData = birthDataToAPI(data as unknown as FrontendBirthData) as unknown as Record<string, unknown>;
    }

    const response = await api.post<ApiResponse<{ chart: Chart }>>('/charts', apiData);
    return { chart: response.data.data.chart };
  },

  /**
   * Get user's charts
   */
  async getCharts(page = 1, limit = 20): Promise<ChartListResponse> {
    const response = await api.get<ApiResponse<{ charts: Chart[]; pagination: PaginationInfo }>>(
      '/charts',
      { params: { page, limit } },
    );

    return {
      charts: response.data.data.charts,
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
    const response = await api.get<ApiResponse<{ chart: Chart }>>(`/charts/${id}`);
    return { chart: response.data.data.chart };
  },

  /**
   * Update chart
   */
  async updateChart(id: string, data: Partial<BirthData>): Promise<ChartResponse> {
    const apiData = birthDataToAPI(data as unknown as FrontendBirthData);
    const response = await api.put<ApiResponse<{ chart: Chart }>>(`/charts/${id}`, apiData);
    return { chart: response.data.data.chart };
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
  async calculateChart(id: string, options?: { useTrueAngles?: boolean }): Promise<ChartResponse> {
    const params = new URLSearchParams({ force: 'true' });
    if (options?.useTrueAngles !== undefined) {
      params.set('use_true_angles', String(options.useTrueAngles));
    }
    const response = await api.post<ApiResponse<{ chart: Chart }>>(`/charts/${id}/calculate?${params}`);
    return { chart: response.data.data.chart };
  },
};
