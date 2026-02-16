/**
 * Chart Service
 */

import api from './api';

export interface BirthData {
  name: string;
  type?: 'natal' | 'synastry' | 'composite' | 'transit' | 'progressed';
  birth_date: string;
  birth_time: string;
  birth_time_unknown?: boolean;
  birth_place_name: string;
  birth_latitude: number;
  birth_longitude: number;
  birth_timezone: string;
  house_system?: 'placidus' | 'koch' | 'porphyry' | 'whole' | 'equal' | 'topocentric';
  zodiac?: 'tropical' | 'sidereal';
  sidereal_mode?: string;
}

export interface Chart {
  id: string;
  name: string;
  type: string;
  birth_date: string;
  birth_time: string;
  birth_place_name: string;
  calculated_data?: any;
  created_at: string;
}

export const chartService = {
  /**
   * Create new chart
   */
  async createChart(data: BirthData): Promise<{ chart: Chart }> {
    const { responseData } = await api.post('/charts', data);
    return responseData.data;
  },

  /**
   * Get user's charts
   */
  async getCharts(page = 1, limit = 20): Promise<{ charts: Chart[]; pagination: any }> {
    const { data } = await api.get('/charts', { params: { page, limit } });
    return data.data;
  },

  /**
   * Get specific chart
   */
  async getChart(id: string): Promise<{ chart: Chart }> {
    const { data } = await api.get(`/charts/${id}`);
    return data.data;
  },

  /**
   * Update chart
   */
  async updateChart(id: string, data: Partial<BirthData>): Promise<{ chart: Chart }> {
    const { responseData } = await api.put(`/charts/${id}`, data);
    return responseData.data;
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
    const { data } = await api.post(`/charts/${id}/calculate`);
    return data.data;
  },
};
