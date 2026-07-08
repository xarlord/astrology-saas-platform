/**
 * Lunar Return Routes
 * API endpoints for lunar return calculations and forecasts
 */

import { Router } from 'express';
import { z } from 'zod';
import * as lunarReturnController from '../controllers/lunarReturn.controller';
import { authenticate } from '../../../middleware/auth';
import { astroComputationRateLimiter } from '../../../middleware/rateLimiter';
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
 *
 * @openapi
 * /api/lunar-return/next:
 *   get:
 *     tags: [Lunar Returns]
 *     summary: Get next lunar return date
 *     responses:
 *       200:
 *         description: Next lunar return data
 */
router.get('/next', lunarReturnController.getNextLunarReturn);

/**
 * @route   GET /api/lunar-return/current
 * @desc    Get current lunar return with days until
 * @access  Private
 *
 * @openapi
 * /api/lunar-return/current:
 *   get:
 *     tags: [Lunar Returns]
 *     summary: Get current lunar return with days until next
 *     responses:
 *       200:
 *         description: Current lunar return data
 */
router.get('/current', lunarReturnController.getCurrentLunarReturn);

/**
 * @route   POST /api/lunar-return/chart
 * @desc    Calculate lunar return chart for specific date
 * @access  Private
 * @body    { returnDate: string }
 *
 * @openapi
 * /api/lunar-return/chart:
 *   post:
 *     tags: [Lunar Returns]
 *     summary: Calculate lunar return chart for a specific date
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [returnDate]
 *             properties:
 *               returnDate:
 *                 type: string
 *     responses:
 *       200:
 *         description: Lunar return chart data
 */
router.post(
  '/chart',
  astroComputationRateLimiter,
  validateBody(lunarReturnChartSchema),
  lunarReturnController.getLunarReturnChart,
);

/**
 * @route   POST /api/lunar-return/forecast
 * @desc    Get monthly lunar forecast
 * @access  Private
 * @body    { returnDate?: string }
 *
 * @openapi
 * /api/lunar-return/forecast:
 *   post:
 *     tags: [Lunar Returns]
 *     summary: Get monthly lunar forecast
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               returnDate:
 *                 type: string
 *     responses:
 *       200:
 *         description: Monthly lunar forecast
 */
router.post(
  '/forecast',
  astroComputationRateLimiter,
  validateBody(lunarForecastSchema),
  lunarReturnController.getLunarMonthForecast,
);

/**
 * @route   GET /api/lunar-return/history
 * @desc    Get saved lunar returns history
 * @access  Private
 * @query   page, limit
 *
 * @openapi
 * /api/lunar-return/history:
 *   get:
 *     tags: [Lunar Returns]
 *     summary: Get saved lunar returns history
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Paginated lunar return history
 */
router.get('/history', validateQuery(paginationSchema), lunarReturnController.getLunarReturnHistory);

/**
 * @route   DELETE /api/lunar-return/:id
 * @desc    Delete a saved lunar return
 * @access  Private
 *
 * @openapi
 * /api/lunar-return/{id}:
 *   delete:
 *     tags: [Lunar Returns]
 *     summary: Delete a saved lunar return
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Lunar return deleted
 *       404:
 *         description: Lunar return not found
 */
router.delete('/:id', validateParams(uuidParamSchema), lunarReturnController.deleteLunarReturn);

/**
 * @route   POST /api/lunar-return/calculate
 * @desc    Calculate custom lunar return for any date
 * @access  Private
 * @body    { returnDate: string, includeForecast?: boolean }
 *
 * @openapi
 * /api/lunar-return/calculate:
 *   post:
 *     tags: [Lunar Returns]
 *     summary: Calculate custom lunar return for any date
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [returnDate]
 *             properties:
 *               returnDate:
 *                 type: string
 *               includeForecast:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Custom lunar return calculation
 */
router.post(
  '/calculate',
  astroComputationRateLimiter,
  validateBody(lunarCalculateSchema),
  lunarReturnController.calculateCustomLunarReturn,
);

export { router };
