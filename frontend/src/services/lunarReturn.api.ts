/**
 * Lunar Return API Service
 * Handles all API calls for lunar return features
 */

import api from './api';

import type {
  NatalMoon,
  MoonPosition,
  LunarAspect,
  LunarReturnChart,
  KeyDate,
  MonthlyPrediction,
  MonthlyRitual,
  LunarMonthForecast,
} from '../types/lunar-return.types';

export type {
  NatalMoon,
  MoonPosition,
  LunarAspect,
  LunarReturnChart,
  KeyDate,
  MonthlyPrediction,
  MonthlyRitual,
  LunarMonthForecast,
};

interface LunarReturnHistoryResponse {
  returns: SavedLunarReturn[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface CustomLunarReturnResponse {
  chart: LunarReturnChart;
  returnDate: Date;
  theme: string;
  intensity: number;
  emotionalTheme: string;
  actionAdvice: string[];
  keyDates: KeyDate[];
  predictions: MonthlyPrediction[];
  rituals: MonthlyRitual[];
  journalPrompts: string[];
}

export interface SavedLunarReturn {
  id: string;
  returnDate: Date;
  theme: string;
  intensity: number;
  emotionalTheme: string;
  actionAdvice: string[];
  keyDates: KeyDate[];
  predictions: MonthlyPrediction[];
  rituals: MonthlyRitual[];
  journalPrompts: string[];
  createdAt: Date;
  // UI helper properties for timeline display
  status?: 'past' | 'current' | 'future';
  sign?: string;
  date?: Date;
}

/**
 * Get next lunar return date
 */
export async function getNextLunarReturn(): Promise<{
  nextReturn: Date;
  natalMoon: NatalMoon;
}> {
  const response = await api.get<{ data: { nextReturn: Date; natalMoon: NatalMoon } }>(
    '/lunar-return/next',
  );
  return response.data.data;
}

/**
 * Get current lunar return info
 */
export async function getCurrentLunarReturn(): Promise<{
  returnDate: Date;
  daysUntil: number;
}> {
  const response = await api.get<{ data: { returnDate: Date; daysUntil: number } }>(
    '/lunar-return/current',
  );
  return response.data.data;
}

/**
 * Calculate lunar return chart for specific date
 */
export async function calculateLunarReturnChart(returnDate: Date): Promise<LunarReturnChart> {
  const response = await api.post<{ data: LunarReturnChart }>('/lunar-return/chart', {
    returnDate,
  });
  return response.data.data;
}

/**
 * Get monthly lunar forecast
 */
export async function getLunarMonthForecast(returnDate?: Date): Promise<LunarMonthForecast> {
  const response = await api.post<{ data: LunarMonthForecast }>('/lunar-return/forecast', {
    returnDate: returnDate ?? null,
  });
  const responseData = response.data as { data: LunarMonthForecast };
  return responseData.data;
}

/**
 * Get lunar return history
 */
export async function getLunarReturnHistory(
  page = 1,
  limit = 10,
): Promise<{
  returns: SavedLunarReturn[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> {
  const response = await api.get<{
    data: {
      returns: SavedLunarReturn[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    };
  }>('/lunar-return/history', {
    params: { page, limit },
  });
  const responseData = response.data as { data: LunarReturnHistoryResponse };
  return responseData.data;
}

/**
 * Delete a saved lunar return
 */
export async function deleteLunarReturn(id: string): Promise<void> {
  await api.delete(`/lunar-return/${id}`);
}

/**
 * Calculate custom lunar return
 */
export async function calculateCustomLunarReturn(
  returnDate: Date,
  includeForecast = true,
): Promise<{
  chart: LunarReturnChart;
  returnDate: Date;
  forecast?: LunarMonthForecast;
}> {
  const response = await api.post<{
    data: { chart: LunarReturnChart; returnDate: Date; forecast?: LunarMonthForecast };
  }>('/lunar-return/calculate', {
    returnDate,
    includeForecast,
  });
  const responseData = response.data as { data: CustomLunarReturnResponse };
  return responseData.data;
}

export default {
  getNextLunarReturn,
  getCurrentLunarReturn,
  calculateLunarReturnChart,
  getLunarMonthForecast,
  getLunarReturnHistory,
  deleteLunarReturn,
  calculateCustomLunarReturn,
};
