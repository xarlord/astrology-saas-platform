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

    // Get user's natal chart from database
    const userCharts = await knex('charts').where({ userId, isBirthChart: true }).first();

    if (!userCharts) {
      throw new NotFoundError('Natal chart not found. Please create a birth chart first.');
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

    // Validate date format
    const date = new Date(returnDate);
    if (isNaN(date.getTime())) {
      throw new BadRequestError('Invalid date format');
    }

    // Get user's natal chart from database
    const userCharts = await knex('charts').where({ userId, isBirthChart: true }).first();

    if (!userCharts) {
      throw new NotFoundError('Natal chart not found. Please create a birth chart first.');
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

    // Use provided date or calculate next lunar return
    let forecastDate = returnDate ? new Date(returnDate) : undefined;

    if (forecastDate && isNaN(forecastDate.getTime())) {
      throw new BadRequestError('Invalid date format');
    }

    // Get user's natal chart from database
    const userCharts = await knex('charts').where({ userId, isBirthChart: true }).first();

    if (!userCharts) {
      throw new NotFoundError('Natal chart not found. Please create a birth chart first.');
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
    const existingForecast = await knex('lunar_returns')
      .where({
        userId,
        returnDate: forecastDate.toISOString(),
      })
      .first();

    if (!existingForecast) {
      await knex('lunar_returns').insert({
        userId,
        returnDate: forecastDate.toISOString(),
        chartData: JSON.stringify({
          moonPosition: forecast.theme,
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
      .where({ userId })
      .orderBy('returnDate', 'desc')
      .limit(limit)
      .offset(offset);

    const total = await knex('lunar_returns').where({ userId }).count('* as count').first();

    res.json({
      success: true,
      data: {
        returns: returns.map((lr: Record<string, unknown>) => ({
          id: lr.id,
          returnDate: lr.returnDate,
          theme: lr.theme,
          intensity: lr.intensity,
          emotionalTheme: lr.emotionalTheme,
          actionAdvice: JSON.parse((lr.actionAdvice as string) || '[]'),
          keyDates: JSON.parse((lr.keyDates as string) || '[]'),
          predictions: JSON.parse((lr.predictions as string) || '[]'),
          rituals: JSON.parse((lr.rituals as string) || '[]'),
          journalPrompts: JSON.parse((lr.journalPrompts as string) || '[]'),
          createdAt: lr.createdAt,
        })),
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

    // Check if lunar return exists and belongs to user
    const lunarReturn = await knex('lunar_returns').where({ id, userId }).first();

    if (!lunarReturn) {
      throw new NotFoundError('Lunar return not found');
    }

    await knex('lunar_returns').where({ id, userId }).del();

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

    // Get user's natal chart from database
    const userCharts = await knex('charts').where({ userId, isBirthChart: true }).first();

    if (!userCharts) {
      throw new NotFoundError('Natal chart not found. Please create a birth chart first.');
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

    const result: Record<string, unknown> = {
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
