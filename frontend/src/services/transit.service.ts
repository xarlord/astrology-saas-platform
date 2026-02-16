/**
 * Transit Service
 */

import api from './api';

export interface TransitReading {
  date: string;
  transits: Array<{
    transitPlanet: string;
    natalPlanet: string;
    aspect: string;
    orb: number;
  }>;
  housePositions: Record<string, number>;
}

export const transitService = {
  /**
   * Calculate transits for date range
   */
  async calculateTransits(chartId: string, startDate: string, endDate: string): Promise<any> {
    const { data } = await api.post('/transits/calculate', {
      chartId,
      startDate,
      endDate,
    });
    return data.data;
  },

  /**
   * Get today's transits
   */
  async getTodayTransits(): Promise<any> {
    const { data } = await api.get('/transits/today');
    return data.data;
  },

  /**
   * Get transit calendar
   */
  async getTransitCalendar(month: number, year: number): Promise<any> {
    const { data } = await api.get('/transits/calendar', {
      params: { month, year },
    });
    return data.data;
  },

  /**
   * Get transit forecast
   */
  async getTransitForecast(duration: 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<any> {
    const { data } = await api.get('/transits/forecast', {
      params: { duration },
    });
    return data.data;
  },

  /**
   * Get transit details
   */
  async getTransitDetails(id: string): Promise<any> {
    const { data } = await api.get(`/transits/${id}`);
    return data.data;
  },
};
