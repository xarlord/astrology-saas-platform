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
import { NatalChart, LunarReturnChart, LunarMonthForecast } from '../models/lunarReturn.model';
import { db } from '../db';

/**
 * Get next lunar return date
 * GET /lunar-return/next
 */
export async function getNextLunarReturn(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    // Get user's natal chart from database
    const userCharts = await db('charts')
      .where({ userId, isBirthChart: true })
      .first();

    if (!userCharts) {
      return res.status(404).json({
        success: false,
        error: 'Natal chart not found. Please create a birth chart first.',
      });
    }

    const natalChart: NatalChart = {
      id: userCharts.id,
      userId: userCharts.userId,
      moon: {
        sign: userCharts.moonSign || 'aries',
        degree: userCharts.moonDegree || 0,
        minute: userCharts.moonMinute || 0,
        second: userCharts.moonSecond || 0,
      },
    };

    // Calculate next lunar return
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
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
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
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const { returnDate } = req.body;

    if (!returnDate) {
      return res.status(400).json({
        success: false,
        error: 'returnDate is required',
      });
    }

    // Validate date format
    const date = new Date(returnDate);
    if (isNaN(date.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format',
      });
    }

    // Get user's natal chart from database
    const userCharts = await db('charts')
      .where({ userId, isBirthChart: true })
      .first();

    if (!userCharts) {
      return res.status(404).json({
        success: false,
        error: 'Natal chart not found. Please create a birth chart first.',
      });
    }

    const natalChart: NatalChart = {
      id: userCharts.id,
      userId: userCharts.userId,
      moon: {
        sign: userCharts.moonSign || 'aries',
        degree: userCharts.moonDegree || 0,
        minute: userCharts.moonMinute || 0,
        second: userCharts.moonSecond || 0,
      },
    };

    // Calculate lunar return chart
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
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const { returnDate } = req.body;

    // Use provided date or calculate next lunar return
    let forecastDate = returnDate ? new Date(returnDate) : undefined;

    if (forecastDate && isNaN(forecastDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format',
      });
    }

    // Get user's natal chart from database
    const userCharts = await db('charts')
      .where({ userId, isBirthChart: true })
      .first();

    if (!userCharts) {
      return res.status(404).json({
        success: false,
        error: 'Natal chart not found. Please create a birth chart first.',
      });
    }

    const natalChart: NatalChart = {
      id: userCharts.id,
      userId: userCharts.userId,
      moon: {
        sign: userCharts.moonSign || 'aries',
        degree: userCharts.moonDegree || 0,
        minute: userCharts.moonMinute || 0,
        second: userCharts.moonSecond || 0,
      },
    };

    // Calculate return date if not provided
    if (!forecastDate) {
      forecastDate = calculateNextLunarReturn(natalChart.moon);
    }

    // Generate forecast
    const forecast = generateLunarMonthForecast(userId, natalChart, forecastDate);

    // Save forecast to database (optional)
    const existingForecast = await db('lunar_returns')
      .where({
        userId,
        returnDate: forecastDate.toISOString(),
      })
      .first();

    if (!existingForecast) {
      await db('lunar_returns').insert({
        userId,
        returnDate: forecastDate.toISOString(),
        chartData: JSON.stringify({
          moonPosition: forecast.theme, // Simplified for storage
          theme: forecast.theme,
          intensity: forecast.intensity,
        }),
        theme: forecast.theme,
        intensity: forecast.intensity,
        emotionalTheme: forecast.emotionalTheme,
        actionAdvice: JSON.stringify(forecast.actionAdvice),
        keyDates: JSON.stringify(forecast.keyDates),
        predictions: JSON.stringify(forecast.predictions),
        rituals: JSON.stringify(forecast.rituals),
        journalPrompts: JSON.stringify(forecast.journalPrompts),
        createdAt: new Date().toISOString(),
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
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const returns = await db('lunar_returns')
      .where({ userId })
      .orderBy('returnDate', 'desc')
      .limit(limit)
      .offset(offset);

    const total = await db('lunar_returns')
      .where({ userId })
      .count('* as count')
      .first();

    res.json({
      success: true,
      data: {
        returns: returns.map((lr: any) => ({
          id: lr.id,
          returnDate: lr.returnDate,
          theme: lr.theme,
          intensity: lr.intensity,
          emotionalTheme: lr.emotionalTheme,
          actionAdvice: JSON.parse(lr.actionAdvice || '[]'),
          keyDates: JSON.parse(lr.keyDates || '[]'),
          predictions: JSON.parse(lr.predictions || '[]'),
          rituals: JSON.parse(lr.rituals || '[]'),
          journalPrompts: JSON.parse(lr.journalPrompts || '[]'),
          createdAt: lr.createdAt,
        })),
        pagination: {
          page,
          limit,
          total: (total as any).count,
          totalPages: Math.ceil((total as any).count / limit),
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
    const userId = (req as any).user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    // Check if lunar return exists and belongs to user
    const lunarReturn = await db('lunar_returns')
      .where({ id, userId })
      .first();

    if (!lunarReturn) {
      return res.status(404).json({
        success: false,
        error: 'Lunar return not found',
      });
    }

    await db('lunar_returns')
      .where({ id, userId })
      .del();

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
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const { returnDate, includeForecast = true } = req.body;

    if (!returnDate) {
      return res.status(400).json({
        success: false,
        error: 'returnDate is required',
      });
    }

    const date = new Date(returnDate);
    if (isNaN(date.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format',
      });
    }

    // Get user's natal chart from database
    const userCharts = await db('charts')
      .where({ userId, isBirthChart: true })
      .first();

    if (!userCharts) {
      return res.status(404).json({
        success: false,
        error: 'Natal chart not found. Please create a birth chart first.',
      });
    }

    const natalChart: NatalChart = {
      id: userCharts.id,
      userId: userCharts.userId,
      moon: {
        sign: userCharts.moonSign || 'aries',
        degree: userCharts.moonDegree || 0,
        minute: userCharts.moonMinute || 0,
        second: userCharts.moonSecond || 0,
      },
    };

    // Calculate lunar return chart
    const chart = calculateLunarReturnChart(natalChart, date);

    let result: any = {
      chart,
      returnDate: date,
    };

    // Optionally include forecast
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
