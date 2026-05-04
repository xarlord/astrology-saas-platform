/**
 * Lunar Return Controller
 * Handles API endpoints for lunar return calculations and forecasts
 */

import { Request, Response, NextFunction } from 'express';
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
export async function getNextLunarReturn(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as { user?: { id: string } }).user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
      return;
    }

    const natalChart = await getUserNatalChart(userId);

    if (!natalChart) {
      res.status(404).json({
        success: false,
        error: 'Natal chart not found. Please create a birth chart first.',
      });
      return;
    }

    const nextReturn = calculateNextLunarReturn(natalChart.moon);

    res.json({
      success: true,
      data: {
        nextReturn,
        natalMoon: natalChart.moon,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get current lunar return information
 * GET /lunar-return/current
 */
export async function getCurrentLunarReturn(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as { user?: { id: string } }).user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
      return;
    }

    const result = await getServiceCurrentLunarReturn(userId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get lunar return chart
 * POST /lunar-return/chart
 */
export async function getLunarReturnChart(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as { user?: { id: string } }).user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
      return;
    }

    const { returnDate } = req.body;

    if (!returnDate) {
      res.status(400).json({
        success: false,
        error: 'returnDate is required',
      });
      return;
    }

    const date = new Date(returnDate);
    if (isNaN(date.getTime())) {
      res.status(400).json({
        success: false,
        error: 'Invalid date format',
      });
      return;
    }

    const natalChart = await getUserNatalChart(userId);

    if (!natalChart) {
      res.status(404).json({
        success: false,
        error: 'Natal chart not found. Please create a birth chart first.',
      });
      return;
    }

    const chart = calculateLunarReturnChart(natalChart, date);

    res.json({
      success: true,
      data: chart,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get monthly forecast
 * POST /lunar-return/forecast
 */
export async function getLunarMonthForecast(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as { user?: { id: string } }).user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
      return;
    }

    const { returnDate } = req.body;

    let forecastDate = returnDate ? new Date(returnDate) : undefined;

    if (forecastDate && isNaN(forecastDate.getTime())) {
      res.status(400).json({
        success: false,
        error: 'Invalid date format',
      });
      return;
    }

    const natalChart = await getUserNatalChart(userId);

    if (!natalChart) {
      res.status(404).json({
        success: false,
        error: 'Natal chart not found. Please create a birth chart first.',
      });
      return;
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
  } catch (error) {
    next(error);
  }
}

/**
 * Get saved lunar returns
 * GET /lunar-return/history
 */
export async function getLunarReturnHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as { user?: { id: string } }).user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
      return;
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
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a lunar return
 * DELETE /lunar-return/:id
 */
export async function deleteLunarReturn(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as { user?: { id: string } }).user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
      return;
    }

    const lunarReturn = await knex('lunar_returns').where({ id, user_id: userId }).first();

    if (!lunarReturn) {
      res.status(404).json({
        success: false,
        error: 'Lunar return not found',
      });
      return;
    }

    await knex('lunar_returns').where({ id, user_id: userId }).del();

    res.json({
      success: true,
      message: 'Lunar return deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Calculate custom lunar return for any date
 * POST /lunar-return/calculate
 */
export async function calculateCustomLunarReturn(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as { user?: { id: string } }).user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
      return;
    }

    const { returnDate, includeForecast = true } = req.body;

    if (!returnDate) {
      res.status(400).json({
        success: false,
        error: 'returnDate is required',
      });
      return;
    }

    const date = new Date(returnDate);
    if (isNaN(date.getTime())) {
      res.status(400).json({
        success: false,
        error: 'Invalid date format',
      });
      return;
    }

    const natalChart = await getUserNatalChart(userId);

    if (!natalChart) {
      res.status(404).json({
        success: false,
        error: 'Natal chart not found. Please create a birth chart first.',
      });
      return;
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
  } catch (error) {
    next(error);
  }
}

export default {
  getNextLunarReturn,
  getCurrentLunarReturn,
  getLunarReturnChart,
  getLunarMonthForecast,
  getLunarReturnHistory,
  deleteLunarReturn,
  calculateCustomLunarReturn,
};
