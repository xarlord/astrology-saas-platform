/**
 * Lunar Return Routes
 * API endpoints for lunar return calculations and forecasts
 */

import { Router } from 'express';
import { z } from 'zod';
import * as lunarReturnController from '../controllers/lunarReturn.controller';
import { authenticate } from '../../../middleware/auth';
import {
  validateBody,
  validateQuery,
  validateParams,
  paginationSchema,
  uuidParamSchema,
} from '../../../utils/validators';

const router = Router();

// All routes require authentication
router.use(authenticate);

const lunarReturnChartSchema = z.object({
  returnDate: z.string().min(1),
});

const lunarForecastSchema = z.object({
  returnDate: z.string().min(1).optional(),
});

const lunarCalculateSchema = z.object({
  returnDate: z.string().min(1),
  includeForecast: z.boolean().optional(),
});

/**
 * @route   GET /api/lunar-return/next
 * @desc    Get next lunar return date
 * @access  Private
 */
router.get('/next', lunarReturnController.getNextLunarReturn);

/**
 * @route   GET /api/lunar-return/current
 * @desc    Get current lunar return with days until
 * @access  Private
 */
router.get('/current', lunarReturnController.getCurrentLunarReturn);

/**
 * @route   POST /api/lunar-return/chart
 * @desc    Calculate lunar return chart for specific date
 * @access  Private
 * @body    { returnDate: string }
 */
router.post(
  '/chart',
  validateBody(lunarReturnChartSchema),
  lunarReturnController.getLunarReturnChart,
);

/**
 * @route   POST /api/lunar-return/forecast
 * @desc    Get monthly lunar forecast
 * @access  Private
 * @body    { returnDate?: string }
 */
router.post(
  '/forecast',
  validateBody(lunarForecastSchema),
  lunarReturnController.getLunarMonthForecast,
);

/**
 * @route   GET /api/lunar-return/history
 * @desc    Get saved lunar returns history
 * @access  Private
 * @query   page, limit
 */
router.get('/history', validateQuery(paginationSchema), lunarReturnController.getLunarReturnHistory);

/**
 * @route   DELETE /api/lunar-return/:id
 * @desc    Delete a saved lunar return
 * @access  Private
 */
router.delete('/:id', validateParams(uuidParamSchema), lunarReturnController.deleteLunarReturn);

/**
 * @route   POST /api/lunar-return/calculate
 * @desc    Calculate custom lunar return for any date
 * @access  Private
 * @body    { returnDate: string, includeForecast?: boolean }
 */
router.post(
  '/calculate',
  validateBody(lunarCalculateSchema),
  lunarReturnController.calculateCustomLunarReturn,
);

export { router };
