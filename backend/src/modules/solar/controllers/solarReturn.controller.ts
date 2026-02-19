/**
 * Solar Return Controller
 * Handles HTTP requests for solar return calculations
 */

import { Request, Response } from 'express';
import solarReturnService from '../services/solarReturn.service';
import solarReturnModel from '../models/solarReturn.model';
import { generateSolarReturnInterpretation } from '../../../data/solarReturnInterpretations';
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  ConflictError,
} from '../../../utils/appError';
import { asyncHandler } from '../../../middleware/errorHandler';
import { SolarReturnCalculationParams } from '../models/types';

export class SolarReturnController {
  /**
   * Calculate solar return for a given year
   * POST /api/v1/solar-returns/calculate
   */
  calculateSolarReturn = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw new UnauthorizedError('User authentication required');
    }

    const { natalChartId, year, location, houseSystem, zodiacType } = req.body;

    // Validate required fields
    if (!natalChartId || !year) {
      throw new BadRequestError('natalChartId and year are required');
    }

    // Validate year
    const currentYear = new Date().getFullYear();
    if (year < currentYear - 1 || year > currentYear + 2) {
      throw new BadRequestError('Year must be within reasonable range');
    }

    // Check if solar return already exists for this year
    const existing = await solarReturnModel.findByUserAndYear(userId, year);
    if (existing) {
      throw new ConflictError(`Solar return for ${year} already exists. Use recalculate to update.`);
    }

    // Calculate solar return
    const params: SolarReturnCalculationParams = {
      natalChartId,
      year,
      location,
      houseSystem: houseSystem || 'placidus',
      zodiacType: zodiacType || 'tropical',
    };

    const { returnDate, chartData } = await solarReturnService.calculateSolarReturn(params);

    // Generate interpretation
    const interpretation = generateSolarReturnInterpretation(chartData, year);

    // Calculate lucky days
    const luckyDays = solarReturnService.calculateLuckyDays(chartData, year);

    // Generate yearly themes
    const themes = solarReturnService.generateYearlyThemes(chartData);

    // Save to database
    const solarReturn = await solarReturnModel.create({
      userId,
      chartId: natalChartId,
      year,
      returnDate,
      returnLocation: location || {
        name: 'Default',
        latitude: 0,
        longitude: 0,
        timezone: 'UTC',
      },
      calculatedData: chartData,
      interpretation: {
        ...interpretation,
        luckyDays,
        themes,
      },
      isRelocated: !!location,
    });

    res.status(201).json({
      success: true,
      data: solarReturn,
    });
  });

  /**
   * Get solar return for a specific year
   * GET /api/v1/solar-returns/year/:year
   */
  getSolarReturnByYear = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw new UnauthorizedError('User authentication required');
    }

    const { year } = req.params;
    const yearNum = parseInt(year);

    if (isNaN(yearNum)) {
      throw new BadRequestError('Invalid year parameter');
    }

    const solarReturn = await solarReturnModel.findByUserAndYear(userId, yearNum);

    if (!solarReturn) {
      throw new NotFoundError(`Solar return for ${yearNum} not found`);
    }

    res.status(200).json({
      success: true,
      data: solarReturn,
    });
  });

  /**
   * Get solar return by ID
   * GET /api/v1/solar-returns/:id
   */
  getSolarReturnById = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw new UnauthorizedError('User authentication required');
    }

    const { id } = req.params;

    const solarReturn = await solarReturnModel.findById(id);

    if (!solarReturn) {
      throw new NotFoundError('Solar return not found');
    }

    // Check ownership
    if (solarReturn.userId !== userId) {
      throw new UnauthorizedError('Access denied');
    }

    res.status(200).json({
      success: true,
      data: solarReturn,
    });
  });

  /**
   * Get user's solar return history
   * GET /api/v1/solar-returns/history
   */
  getSolarReturnHistory = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw new UnauthorizedError('User authentication required');
    }

    const { limit, includeRelocated } = req.query;

    let solarReturns;

    if (includeRelocated === 'true') {
      solarReturns = await solarReturnModel.findByUserId(userId);
    } else {
      solarReturns = await solarReturnModel.findRecent(userId, limit ? parseInt(limit as string) : 10);
    }

    res.status(200).json({
      success: true,
      data: solarReturns,
      count: solarReturns.length,
    });
  });

  /**
   * Recalculate solar return with new location
   * POST /api/v1/solar-returns/:id/recalculate
   */
  recalculateSolarReturn = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw new UnauthorizedError('User authentication required');
    }

    const { id } = req.params;
    const { location, houseSystem, zodiacType } = req.body;

    if (!location) {
      throw new BadRequestError('location is required for recalculation');
    }

    // Get existing solar return
    const existing = await solarReturnModel.findById(id);
    if (!existing) {
      throw new NotFoundError('Solar return not found');
    }

    // Check ownership
    if (existing.userId !== userId) {
      throw new UnauthorizedError('Access denied');
    }

    // Recalculate with new location
    const params: SolarReturnCalculationParams = {
      natalChartId: existing.chartId,
      year: existing.year,
      location,
      houseSystem: houseSystem || 'placidus',
      zodiacType: zodiacType || 'tropical',
    };

    const { returnDate, chartData } = await solarReturnService.calculateSolarReturn(params);

    // Generate new interpretation
    const interpretation = generateSolarReturnInterpretation(chartData, existing.year);

    // Calculate lucky days
    const luckyDays = solarReturnService.calculateLuckyDays(chartData, existing.year);

    // Generate yearly themes
    const themes = solarReturnService.generateYearlyThemes(chartData);

    // Update solar return
    const updated = await solarReturnModel.update(id, {
      returnDate,
      returnLocation: location,
      calculatedData: chartData,
      interpretation: {
        ...interpretation,
        luckyDays,
        themes,
      },
      isRelocated: true,
    });

    res.status(200).json({
      success: true,
      data: updated,
      message: 'Solar return recalculated with new location',
    });
  });

  /**
   * Get solar return statistics
   * GET /api/v1/solar-returns/stats
   */
  getSolarReturnStats = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw new UnauthorizedError('User authentication required');
    }

    const stats = await solarReturnModel.getStats(userId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  });

  /**
   * Delete solar return
   * DELETE /api/v1/solar-returns/:id
   */
  deleteSolarReturn = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw new UnauthorizedError('User authentication required');
    }

    const { id } = req.params;

    // Check ownership first
    const existing = await solarReturnModel.findById(id);
    if (!existing) {
      throw new NotFoundError('Solar return not found');
    }

    if (existing.userId !== userId) {
      throw new UnauthorizedError('Access denied');
    }

    // Delete
    await solarReturnModel.delete(id);

    res.status(200).json({
      success: true,
      message: 'Solar return deleted successfully',
    });
  });

  /**
   * Get available years for solar returns
   * GET /api/v1/solar-returns/years/available
   */
  getAvailableYears = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw new UnauthorizedError('User authentication required');
    }

    const solarReturns = await solarReturnModel.findByUserId(userId);
    const availableYears = solarReturns.map(sr => sr.year).sort((a, b) => b - a);

    res.status(200).json({
      success: true,
      data: availableYears,
    });
  });
}

export default new SolarReturnController();
