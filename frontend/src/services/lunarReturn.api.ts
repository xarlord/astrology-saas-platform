/**
 * Lunar Return API Service
 * Handles all API calls for lunar return features
 */

import api from './api';

import type { NatalMoon, MoonPosition, LunarAspect, LunarReturnChart, KeyDate, MonthlyPrediction, MonthlyRitual, LunarMonthForecast, SavedLunarReturn } from '../types/lunar-return.types';

export type { NatalMoon, MoonPosition, LunarAspect, LunarReturnChart, KeyDate, MonthlyPrediction, MonthlyRitual, LunarMonthForecast, SavedLunarReturn };

interface NextLunarReturnResponse {
  nextReturn: Date;
  natalMoon: NatalMoon;
}

interface CurrentLunarReturnResponse {
  returnDate: Date;
  daysUntil: number;
}

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
  forecast?: LunarMonthForecast;
}

/**
 * Get next lunar return date
 */
export async function getNextLunarReturn(): Promise<NextLunarReturnResponse> {
  const response = await api.get('/lunar-return/next');
  const responseData = response.data as { data: NextLunarReturnResponse };
  return responseData.data;
}

/**
 * Get current lunar return info
 */
export async function getCurrentLunarReturn(): Promise<CurrentLunarReturnResponse> {
  const response = await api.get('/lunar-return/current');
  const responseData = response.data as { data: CurrentLunarReturnResponse };
  return responseData.data;
}

/**
 * Calculate lunar return chart for specific date
 */
export async function calculateLunarReturnChart(returnDate: Date): Promise<LunarReturnChart> {
  const response = await api.post('/lunar-return/chart', { returnDate });
  const responseData = response.data as { data: LunarReturnChart };
  return responseData.data;
}

/**
 * Get monthly lunar forecast
 */
export async function getLunarMonthForecast(returnDate?: Date): Promise<LunarMonthForecast> {
  const response = await api.post('/lunar-return/forecast', {
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
  limit = 10
): Promise<LunarReturnHistoryResponse> {
  const response = await api.get('/lunar-return/history', {
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
  includeForecast = true
): Promise<CustomLunarReturnResponse> {
  const response = await api.post('/lunar-return/calculate', {
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
