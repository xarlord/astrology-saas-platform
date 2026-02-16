/**
 * Chart Controller
 */

import { Request, Response } from 'express';
import { AppError } from '../../middleware/errorHandler';
import { ChartModel } from '../models';
import { swissEphemeris } from '../services';

/**
 * Create new chart
 */
export async function createChart(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;

  const {
    name,
    type = 'natal',
    birth_date,
    birth_time,
    birth_time_unknown = false,
    birth_place_name,
    birth_latitude,
    birth_longitude,
    birth_timezone,
    house_system = 'placidus',
    zodiac = 'tropical',
    sidereal_mode,
  } = req.body;

  // Validate required fields
  if (!name || !birth_date || !birth_place_name || birth_latitude === undefined || birth_longitude === undefined || !birth_timezone) {
    throw new AppError('Missing required fields', 400);
  }

  // Create chart
  const chart = await ChartModel.create({
    user_id: userId,
    name,
    type,
    birth_date: new Date(birth_date),
    birth_time: birth_time || '12:00:00',
    birth_time_unknown,
    birth_place_name,
    birth_latitude,
    birth_longitude,
    birth_timezone,
    house_system,
    zodiac,
    sidereal_mode,
  });

  res.status(201).json({
    success: true,
    data: { chart },
  });
}

/**
 * Get all user's charts
 */
export async function getUserCharts(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  const charts = await ChartModel.findByUserId(userId, limit, offset);
  const count = await ChartModel.countByUserId(userId);

  res.status(200).json({
    success: true,
    data: {
      charts,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit),
      },
    },
  });
}

/**
 * Get specific chart
 */
export async function getChart(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { id } = req.params;

  const chart = await ChartModel.findByIdAndUserId(id, userId);

  if (!chart) {
    throw new AppError('Chart not found', 404);
  }

  res.status(200).json({
    success: true,
    data: { chart },
  });
}

/**
 * Update chart
 */
export async function updateChart(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { id } = req.params;

  const { name, house_system, zodiac, sidereal_mode } = req.body;

  const chart = await ChartModel.update(id, userId, {
    name,
    house_system,
    zodiac,
    sidereal_mode,
  });

  if (!chart) {
    throw new AppError('Chart not found', 404);
  }

  res.status(200).json({
    success: true,
    data: { chart },
  });
}

/**
 * Delete chart
 */
export async function deleteChart(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { id } = req.params;

  const deleted = await ChartModel.softDelete(id, userId);

  if (!deleted) {
    throw new AppError('Chart not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Chart deleted successfully',
  });
}

/**
 * Calculate chart
 */
export async function calculateChart(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { id } = req.params;

  const chart = await ChartModel.findByIdAndUserId(id, userId);

  if (!chart) {
    throw new AppError('Chart not found', 404);
  }

  // If already calculated, return cached data
  if (chart.calculated_data) {
    res.status(200).json({
      success: true,
      data: { chart },
    });
    return;
  }

  // Calculate natal chart
  const calculatedData = swissEphemeris.calculateNatalChart({
    birthDate: new Date(chart.birth_date),
    birthTime: chart.birth_time,
    latitude: chart.birth_latitude,
    longitude: chart.birth_longitude,
    houseSystem: chart.house_system,
  });

  // Update chart with calculated data
  const updatedChart = await ChartModel.updateCalculatedData(id, userId, calculatedData);

  res.status(200).json({
    success: true,
    data: { chart: updatedChart },
  });
}
