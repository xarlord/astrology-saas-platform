/**
 * Lunar Return Controller
 * Handles API endpoints for lunar return calculations and forecasts
 */

import { Response } from 'express';
import { AuthenticatedRequest } from '../../../middleware/auth';
import { asyncHandler } from '../../../middleware/errorHandler';
import {
  UnauthorizedError,
  NotFoundError,
  BadRequestError,
} from '../../../utils/appError';
import {
  calculateNextLunarReturn,
  calculateLunarReturnChart,
  generateLunarMonthForecast,
  getCurrentLunarReturn as getServiceCurrentLunarReturn,
} from '../services/lunarReturn.service';
import { NatalChart } from '../models/lunarReturn.model';
import knex from '../../../config/database';

interface MoonPosition {
  sign: string;
  degree: number;
  minute: number;
  second: number;
}

function getNatalMoonFromCalculatedData(calculatedData: Record<string, unknown> | null): MoonPosition {
  const fallback: MoonPosition = { sign: 'aries', degree: 0, minute: 0, second: 0 };
  if (!calculatedData) return fallback;

  const planets = calculatedData.planets as Record<string, Record<string, unknown>> | undefined;
  if (!planets) return fallback;

  const moon = planets.moon ?? planets.Moon;
  if (!moon) return fallback;

  return {
    sign: (moon.sign as string) || 'aries',
    degree: (moon.degree as number) || 0,
    minute: (moon.minute as number) || 0,
    second: (moon.second as number) || 0,
  };
}

async function getUserNatalChart(userId: string): Promise<NatalChart | null> {
  const chart = await knex('charts')
    .where({ user_id: userId, type: 'natal' })
    .whereNull('deleted_at')
    .whereNotNull('calculated_data')
    .first();

  if (!chart) return null;

  return {
    id: chart.id,
    userId: chart.user_id,
    moon: getNatalMoonFromCalculatedData(chart.calculated_data as Record<string, unknown> | null),
  };
}

/**
 * Get next lunar return date
 * GET /lunar-return/next
 */
export const getNextLunarReturn = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedError('User authentication required');
    }

    const natalChart = await getUserNatalChart(userId);

    if (!natalChart) {
      throw new NotFoundError('Natal chart not found. Please create a birth chart first.');
    }

    const nextReturn = calculateNextLunarReturn(natalChart.moon);

    res.json({
      success: true,
      data: {
        nextReturn,
        natalMoon: natalChart.moon,
      },
    });
  },
);

/**
 * Get current lunar return information
 * GET /lunar-return/current
 */
export const getCurrentLunarReturn = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedError('User authentication required');
    }

    const result = await getServiceCurrentLunarReturn(userId);

    res.json({
      success: true,
      data: result,
    });
  },
);

/**
 * Get lunar return chart
 * POST /lunar-return/chart
 */
export const getLunarReturnChart = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedError('User authentication required');
    }

    const { returnDate } = req.body;

    if (!returnDate) {
      throw new BadRequestError('returnDate is required');
    }

    const date = new Date(returnDate);
    if (isNaN(date.getTime())) {
      throw new BadRequestError('Invalid date format');
    }

    const natalChart = await getUserNatalChart(userId);

    if (!natalChart) {
      throw new NotFoundError('Natal chart not found. Please create a birth chart first.');
    }

    const chart = calculateLunarReturnChart(natalChart, date);

    res.json({
      success: true,
      data: chart,
    });
  },
);

/**
 * Get monthly forecast
 * POST /lunar-return/forecast
 */
export const getLunarMonthForecast = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedError('User authentication required');
    }

    const { returnDate } = req.body;

    let forecastDate = returnDate ? new Date(returnDate) : undefined;

    if (forecastDate && isNaN(forecastDate.getTime())) {
      throw new BadRequestError('Invalid date format');
    }

    const natalChart = await getUserNatalChart(userId);

    if (!natalChart) {
      throw new NotFoundError('Natal chart not found. Please create a birth chart first.');
    }

    if (!forecastDate) {
      forecastDate = calculateNextLunarReturn(natalChart.moon);
    }

    const forecast = generateLunarMonthForecast(userId, natalChart, forecastDate);

    const existingForecast = await knex('lunar_returns')
      .where({
        user_id: userId,
        return_date: forecastDate.toISOString(),
      })
      .first();

    if (!existingForecast) {
      await knex('lunar_returns').insert({
        user_id: userId,
        natal_chart_id: natalChart.id,
        return_date: forecastDate.toISOString(),
        forecast_start_date: forecastDate.toISOString(),
        forecast_end_date: new Date(forecastDate.getTime() + 28 * 24 * 60 * 60 * 1000).toISOString(),
        forecast_data: JSON.stringify({
          theme: forecast.theme,
          intensity: forecast.intensity,
          emotionalTheme: forecast.emotionalTheme,
          actionAdvice: forecast.actionAdvice,
          keyDates: forecast.keyDates,
          predictions: forecast.predictions,
          rituals: forecast.rituals,
          journalPrompts: forecast.journalPrompts,
        }),
      });
    }

    res.json({
      success: true,
      data: forecast,
    });
  },
);

/**
 * Get saved lunar returns
 * GET /lunar-return/history
 */
export const getLunarReturnHistory = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedError('User authentication required');
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const returns = await knex('lunar_returns')
      .where({ user_id: userId })
      .orderBy('return_date', 'desc')
      .limit(limit)
      .offset(offset);

    const total = await knex('lunar_returns').where({ user_id: userId }).count('* as count').first();

    res.json({
      success: true,
      data: {
        returns: returns.map((lr: Record<string, unknown>) => {
          const forecastData = typeof lr.forecast_data === 'string'
            ? JSON.parse(lr.forecast_data)
            : (lr.forecast_data as Record<string, unknown>) ?? {};
          return {
            id: lr.id,
            returnDate: lr.return_date,
            theme: forecastData.theme,
            intensity: forecastData.intensity,
            emotionalTheme: forecastData.emotionalTheme,
            actionAdvice: forecastData.actionAdvice ?? [],
            keyDates: forecastData.keyDates ?? [],
            predictions: forecastData.predictions ?? [],
            rituals: forecastData.rituals ?? [],
            journalPrompts: forecastData.journalPrompts ?? [],
            createdAt: lr.created_at,
          };
        }),
        pagination: {
          page,
          limit,
          total: (total as Record<string, unknown>).count as number,
          totalPages: Math.ceil(((total as Record<string, unknown>).count as number) / limit),
        },
      },
    });
  },
);

/**
 * Delete a lunar return
 * DELETE /lunar-return/:id
 */
export const deleteLunarReturn = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      throw new UnauthorizedError('User authentication required');
    }

    const lunarReturn = await knex('lunar_returns').where({ id, user_id: userId }).first();

    if (!lunarReturn) {
      throw new NotFoundError('Lunar return not found');
    }

    await knex('lunar_returns').where({ id, user_id: userId }).del();

    res.json({
      success: true,
      message: 'Lunar return deleted successfully',
    });
  },
);

/**
 * Calculate custom lunar return for any date
 * POST /lunar-return/calculate
 */
export const calculateCustomLunarReturn = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedError('User authentication required');
    }

    const { returnDate, includeForecast = true } = req.body;

    if (!returnDate) {
      throw new BadRequestError('returnDate is required');
    }

    const date = new Date(returnDate);
    if (isNaN(date.getTime())) {
      throw new BadRequestError('Invalid date format');
    }

    const natalChart = await getUserNatalChart(userId);

    if (!natalChart) {
      throw new NotFoundError('Natal chart not found. Please create a birth chart first.');
    }

    const chart = calculateLunarReturnChart(natalChart, date);

    const result: Record<string, unknown> = {
      chart,
      returnDate: date,
    };

    if (includeForecast) {
      const forecast = generateLunarMonthForecast(userId, natalChart, date);
      result.forecast = forecast;
    }

    res.json({
      success: true,
      data: result,
    });
  },
);

export default {
  getNextLunarReturn,
  getCurrentLunarReturn,
  getLunarReturnChart,
  getLunarMonthForecast,
  getLunarReturnHistory,
  deleteLunarReturn,
  calculateCustomLunarReturn,
};
