/**
 * Transit Service
 */

import api from './api';

export interface TransitReading {
  date: string;
  transits: {
    transitPlanet: string;
    natalPlanet: string;
    aspect: string;
    orb: number;
  }[];
  housePositions: Record<string, number>;
}

interface TransitsResponse {
  data: TransitReading;
}

interface TodayTransitsResponse {
  data: TransitReading;
}

interface TransitCalendarResponse {
  data: TransitReading[];
}

interface TransitForecastResponse {
  data: TransitReading[];
}

interface TransitDetailsResponse {
  data: TransitReading;
}

export const transitService = {
  /**
   * Calculate transits for date range
   */
  async calculateTransits(chartId: string, startDate: string, endDate: string): Promise<TransitReading> {
    const { data } = await api.post<TransitsResponse>('/transits/calculate', {
      chartId,
      startDate,
      endDate,
    });
    return data.data;
  },

  /**
   * Get today's transits
   */
  async getTodayTransits(): Promise<TransitReading> {
    const { data } = await api.get<TodayTransitsResponse>('/transits/today');
    return data.data;
  },

  /**
   * Get transit calendar
   */
  async getTransitCalendar(month: number, year: number): Promise<TransitReading[]> {
    const { data } = await api.get<TransitCalendarResponse>('/transits/calendar', {
      params: { month, year },
    });
    return data.data;
  },

  /**
   * Get transit forecast
   */
  async getTransitForecast(duration: 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<TransitReading[]> {
    const { data } = await api.get<TransitForecastResponse>('/transits/forecast', {
      params: { duration },
    });
    return data.data;
  },

  /**
   * Get transit details
   */
  async getTransitDetails(id: string): Promise<TransitReading> {
    const { data } = await api.get<TransitDetailsResponse>(`/transits/${id}`);
    return data.data;
  },
};
