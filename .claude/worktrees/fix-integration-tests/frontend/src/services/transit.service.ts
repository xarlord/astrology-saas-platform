/**
 * Transit Service
 * Handles all transit calculation and forecast API calls
 * Includes timeout management and error recovery
 */

import api from './api';
import type { Transit, TransitChart } from './api.types';

// Error class for transit-specific errors
export class TransitServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'TransitServiceError';
  }
}

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

export interface TransitCalculationResponse {
  transits: Transit[];
  energyLevel: number;
  dateRange: { start: string; end: string };
}

export interface TransitCalendarResponse {
  transits: Transit[];
  month: number;
  year: number;
}

export interface TransitForecastResponse {
  transits: Transit[];
  energyLevel: number;
  duration: string;
}

// Configuration
const TRANSIT_TIMEOUT = 45000; // 45 seconds for transit calculations
const FORECAST_TIMEOUT = 30000; // 30 seconds for forecasts

export const transitService = {
  /**
   * Calculate transits for date range
   * @throws TransitServiceError on failure
   */
  async calculateTransits(
    chartId: string,
    startDate: string,
    endDate: string
  ): Promise<TransitChart> {
    try {
      const response = await api.post<{ data: TransitChart }>(
        '/transits/calculate',
        { chartId, startDate, endDate },
        { timeout: TRANSIT_TIMEOUT }
      );

      if (!response.data?.data) {
        throw new TransitServiceError(
          'No data received from transit calculation',
          'NO_DATA'
        );
      }

      return response.data.data;
    } catch (error) {
      if (error instanceof TransitServiceError) throw error;

      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new TransitServiceError(
        `Failed to calculate transits: ${message}`,
        'CALCULATE_FAILED'
      );
    }
  },

  /**
   * Get today's transits
   * @throws TransitServiceError on failure
   */
  async getTodayTransits(): Promise<TransitCalculationResponse> {
    try {
      const response = await api.get<{ data: TransitCalculationResponse }>(
        '/transits/today',
        { timeout: TRANSIT_TIMEOUT }
      );

      if (!response.data?.data) {
        throw new TransitServiceError(
          'No data received for today\'s transits',
          'NO_DATA'
        );
      }

      return response.data.data;
    } catch (error) {
      if (error instanceof TransitServiceError) throw error;

      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new TransitServiceError(
        `Failed to get today's transits: ${message}`,
        'GET_TODAY_FAILED'
      );
    }
  },

  /**
   * Get transit calendar
   * @throws TransitServiceError on failure
   */
  async getTransitCalendar(month: number, year: number): Promise<TransitCalendarResponse> {
    try {
      const response = await api.get<{ data: TransitCalendarResponse }>(
        '/transits/calendar',
        {
          params: { month, year },
          timeout: TRANSIT_TIMEOUT,
        }
      );

      if (!response.data?.data) {
        throw new TransitServiceError(
          'No data received for transit calendar',
          'NO_DATA'
        );
      }

      return response.data.data;
    } catch (error) {
      if (error instanceof TransitServiceError) throw error;

      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new TransitServiceError(
        `Failed to get transit calendar: ${message}`,
        'GET_CALENDAR_FAILED'
      );
    }
  },

  /**
   * Get transit forecast
   * @throws TransitServiceError on failure
   */
  async getTransitForecast(
    duration: 'week' | 'month' | 'quarter' | 'year' = 'month'
  ): Promise<TransitForecastResponse> {
    try {
      const response = await api.get<{ data: TransitForecastResponse }>(
        '/transits/forecast',
        {
          params: { duration },
          timeout: FORECAST_TIMEOUT,
        }
      );

      if (!response.data?.data) {
        throw new TransitServiceError(
          'No data received for transit forecast',
          'NO_DATA'
        );
      }

      return response.data.data;
    } catch (error) {
      if (error instanceof TransitServiceError) throw error;

      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new TransitServiceError(
        `Failed to get transit forecast: ${message}`,
        'GET_FORECAST_FAILED'
      );
    }
  },

  /**
   * Get transit details
   * @throws TransitServiceError on failure
   */
  async getTransitDetails(id: string): Promise<Transit> {
    try {
      const response = await api.get<{ data: Transit }>(
        `/transits/${id}`,
        { timeout: TRANSIT_TIMEOUT }
      );

      if (!response.data?.data) {
        throw new TransitServiceError(
          'No data received for transit details',
          'NO_DATA'
        );
      }

      return response.data.data;
    } catch (error) {
      if (error instanceof TransitServiceError) throw error;

      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new TransitServiceError(
        `Failed to get transit details: ${message}`,
        'GET_DETAILS_FAILED'
      );
    }
  },
};
