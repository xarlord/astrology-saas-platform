/**
 * Lunar Return API Service
 * Handles all API calls for lunar return features
 */

import api from './api';

export interface NatalMoon {
  sign: string;
  degree: number;
  minute: number;
  second: number;
}

export interface MoonPosition {
  sign: string;
  degree: number;
  minute: number;
  second: number;
}

export interface LunarAspect {
  planets: [string, string];
  type: 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile';
  orb: number;
  applying: boolean;
  interpretation: string;
}

export interface LunarReturnChart {
  returnDate: Date;
  moonPosition: MoonPosition;
  moonPhase: string;
  housePlacement: number;
  aspects: LunarAspect[];
  theme: string;
  intensity: number;
}

export interface KeyDate {
  date: Date;
  type: 'new-moon' | 'full-moon' | 'eclipse' | 'aspect-exact';
  description: string;
  significance: string;
}

export interface MonthlyPrediction {
  category: 'relationships' | 'career' | 'finances' | 'health' | 'creativity' | 'spirituality';
  prediction: string;
  likelihood: number;
  advice: string[];
}

export interface MonthlyRitual {
  phase: 'new-moon' | 'full-moon' | 'quarter-moon';
  title: string;
  description: string;
  materials?: string[];
  steps: string[];
}

export interface LunarMonthForecast {
  userId: string;
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
}

/**
 * Get next lunar return date
 */
export async function getNextLunarReturn(): Promise<{
  nextReturn: Date;
  natalMoon: NatalMoon;
}> {
  const response = await api.get('/lunar-return/next');
  return response.data.data;
}

/**
 * Get current lunar return info
 */
export async function getCurrentLunarReturn(): Promise<{
  returnDate: Date;
  daysUntil: number;
}> {
  const response = await api.get('/lunar-return/current');
  return response.data.data;
}

/**
 * Calculate lunar return chart for specific date
 */
export async function calculateLunarReturnChart(returnDate: Date): Promise<LunarReturnChart> {
  const response = await api.post('/lunar-return/chart', { returnDate });
  return response.data.data;
}

/**
 * Get monthly lunar forecast
 */
export async function getLunarMonthForecast(returnDate?: Date): Promise<LunarMonthForecast> {
  const response = await api.post('/lunar-return/forecast', {
    returnDate: returnDate || null,
  });
  return response.data.data;
}

/**
 * Get lunar return history
 */
export async function getLunarReturnHistory(
  page = 1,
  limit = 10
): Promise<{
  returns: SavedLunarReturn[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> {
  const response = await api.get('/lunar-return/history', {
    params: { page, limit },
  });
  return response.data.data;
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
): Promise<{
  chart: LunarReturnChart;
  returnDate: Date;
  forecast?: LunarMonthForecast;
}> {
  const response = await api.post('/lunar-return/calculate', {
    returnDate,
    includeForecast,
  });
  return response.data.data;
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
