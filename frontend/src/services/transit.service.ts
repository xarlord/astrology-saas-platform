/**
 * Transit Service
 */

import api from './api';

export interface TransitReading {
  date: string;
  transits?: {
    transitPlanet: string;
    natalPlanet: string;
    aspect: string;
    orb: number;
  }[];
  majorAspects?: {
    planet1: string;
    planet2: string;
    type: string;
    orb: number;
    applying?: boolean;
  }[];
  housePositions?: Record<string, number>;
  moonPhase?: {
    phase: string;
    degrees: number;
    illumination: number;
  };
  transitPlanets?: Record<string, {
    longitude: number;
    latitude?: number;
    speed: number;
    retrograde: boolean;
    sign: string;
    degree: number;
  }>;
}

interface TransitsResponse {
  data: TransitReading;
}

interface TodayTransitsResponse {
  data: TransitReading;
}

interface TransitCalendarResponse {
  data: {
    month: number;
    year: number;
    calendarData: Array<{
      date: string;
      day: number;
      aspects: Array<{ planet1: string; planet2: string; type: string; orb: number; applying?: boolean }>;
      moonPhase?: { phase: string; degrees: number; illumination: number };
      retrogrades?: string[];
    }>;
  };
}

interface TransitForecastResponse {
  data: {
    chart: { id: string; name: string };
    duration: string;
    startDate: string;
    endDate: string;
    groupedByType: Record<string, Array<{ type: string; date: string; planet1: string; planet2: string; orb: number; applying?: boolean; intensity: number }>>;
    forecast: Array<{ type: string; date: string; planet1: string; planet2: string; orb: number; applying?: boolean; intensity: number }>;
  };
}

interface TransitDetailsResponse {
  data: TransitReading;
}

export interface NormalizedTransit {
  transitPlanet: string;
  natalPlanet: string;
  aspect: string;
  orb: number;
}

export function normalizeTransits(reading: TransitReading | null | undefined): NormalizedTransit[] {
  if (!reading) return [];
  if (reading.transits && Array.isArray(reading.transits)) return reading.transits;
  if (reading.majorAspects && Array.isArray(reading.majorAspects)) {
    return reading.majorAspects.map((a) => ({
      transitPlanet: a.planet1,
      natalPlanet: a.planet2,
      aspect: a.type,
      orb: a.orb,
    }));
  }
  return [];
}

function normalizeReading(reading: TransitReading): TransitReading {
  return {
    ...reading,
    transits: normalizeTransits(reading),
  };
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
    return normalizeReading(data.data);
  },

  /**
   * Get today's transits
   */
  async getTodayTransits(): Promise<TransitReading> {
    const { data } = await api.get<TodayTransitsResponse>('/transits/today');
    return normalizeReading(data.data);
  },

  /**
   * Get transit calendar
   */
  async getTransitCalendar(month: number, year: number): Promise<TransitReading[]> {
    const { data } = await api.get<TransitCalendarResponse>('/transits/calendar', {
      params: { month, year },
    });
    return data.data.calendarData.map((day) =>
      normalizeReading({
        date: day.date,
        majorAspects: day.aspects,
        moonPhase: day.moonPhase,
      })
    );
  },

  /**
   * Get transit forecast
   */
  async getTransitForecast(duration: 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<TransitReading[]> {
    const { data } = await api.get<TransitForecastResponse>('/transits/forecast', {
      params: { duration },
    });
    return data.data.forecast.map((aspect) => ({
      date: aspect.date,
      transits: [{
        transitPlanet: aspect.planet1,
        natalPlanet: aspect.planet2,
        aspect: aspect.type,
        orb: aspect.orb,
      }],
    }));
  },

  /**
   * Get transit details
   */
  async getTransitDetails(id: string): Promise<TransitReading> {
    const { data } = await api.get<TransitDetailsResponse>(`/transits/${id}`);
    return normalizeReading(data.data);
  },
};
