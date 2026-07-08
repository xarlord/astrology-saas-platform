/**
 * Solar Return Routes
 * API endpoints for solar return calculations
 */

import { Router } from 'express';
import {
  calculateSolarReturn,
  getSolarReturnByYear,
  getSolarReturnHistory,
  getSolarReturnStats,
  getAvailableYears,
  getSolarReturnById,
  recalculateSolarReturn,
  deleteSolarReturn,
} from '../controllers/solarReturn.controller';
import { authenticate } from '../../../middleware/auth';
import { astroComputationRateLimiter } from '../../../middleware/rateLimiter';
import { validateBody, validateParams, validateQuery, uuidParamSchema, solarHistoryQuerySchema } from '../../../utils/validators';
import { z } from 'zod';

const router = Router();

const locationSchema = z.object({
  name: z.string().min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  timezone: z.string().min(1),
  country: z.string().optional(),
  region: z.string().optional(),
});

// Validation schemas
const calculateSchema = z.object({
  natalChartId: z.string().uuid(),
  year: z.number().int().min(1900).max(2100),
  location: locationSchema.optional(),
  houseSystem: z
    .enum(['placidus', 'koch', 'porphyry', 'whole', 'equal', 'topocentric'])
    .optional(),
  zodiacType: z.enum(['tropical', 'sidereal']).optional(),
});

const recalculateSchema = z.object({
  location: locationSchema,
  houseSystem: z
    .enum(['placidus', 'koch', 'porphyry', 'whole', 'equal', 'topocentric'])
    .optional(),
  zodiacType: z.enum(['tropical', 'sidereal']).optional(),
});

// Apply authentication to all routes
router.use(authenticate);

/**
 * @route   POST /api/v1/solar-returns/calculate
 * @desc    Calculate solar return for a given year
 * @access  Private
 *
 * @openapi
 * /api/v1/solar-returns/calculate:
 *   post:
 *     tags: [Solar Returns]
 *     summary: Calculate solar return for a given year
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [natalChartId, year]
 *             properties:
 *               natalChartId:
 *                 type: string
 *                 format: uuid
 *               year:
 *                 type: integer
 *                 minimum: 1900
 *                 maximum: 2100
 *               location:
 *                 type: object
 *                 properties:
 *                   name: { type: string }
 *                   latitude: { type: number }
 *                   longitude: { type: number }
 *                   timezone: { type: string }
 *               houseSystem:
 *                 type: string
 *                 enum: [placidus, koch, porphyry, whole, equal, topocentric]
 *               zodiacType:
 *                 type: string
 *                 enum: [tropical, sidereal]
 *     responses:
 *       200:
 *         description: Solar return chart data
 *       400:
 *         description: Validation error
 */
router.post(
  '/calculate',
  astroComputationRateLimiter,
  validateBody(calculateSchema),
  calculateSolarReturn
);

/**
 * @route   GET /api/v1/solar-returns/year/:year
 * @desc    Get solar return for a specific year
 * @access  Private
 *
 * @openapi
 * /api/v1/solar-returns/year/{year}:
 *   get:
 *     tags: [Solar Returns]
 *     summary: Get solar return for a specific year
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Solar return data for the year
 *       404:
 *         description: Solar return not found
 */
router.get(
  '/year/:year',
  validateParams(z.object({ year: z.coerce.number().int().min(1900).max(2100) })),
  getSolarReturnByYear
);

/**
 * @route   GET /api/v1/solar-returns/history
 * @desc    Get user's solar return history
 * @access  Private
 *
 * @openapi
 * /api/v1/solar-returns/history:
 *   get:
 *     tags: [Solar Returns]
 *     summary: Get user's solar return history
 *     responses:
 *       200:
 *         description: List of saved solar returns
 */
router.get(
  '/history',
  validateQuery(solarHistoryQuerySchema),
  getSolarReturnHistory
);

/**
 * @route   GET /api/v1/solar-returns/stats
 * @desc    Get solar return statistics
 * @access  Private
 *
 * @openapi
 * /api/v1/solar-returns/stats:
 *   get:
 *     tags: [Solar Returns]
 *     summary: Get solar return statistics
 *     responses:
 *       200:
 *         description: Solar return usage statistics
 */
router.get(
  '/stats',
  getSolarReturnStats
);

/**
 * @route   GET /api/v1/solar-returns/years/available
 * @desc    Get available years for solar returns
 * @access  Private
 *
 * @openapi
 * /api/v1/solar-returns/years/available:
 *   get:
 *     tags: [Solar Returns]
 *     summary: Get available years for solar returns
 *     responses:
 *       200:
 *         description: List of available years
 */
router.get(
  '/years/available',
  getAvailableYears
);

/**
 * @route   GET /api/v1/solar-returns/:id
 * @desc    Get solar return by ID
 * @access  Private
 *
 * @openapi
 * /api/v1/solar-returns/{id}:
 *   get:
 *     tags: [Solar Returns]
 *     summary: Get solar return by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Solar return data
 *       404:
 *         description: Solar return not found
 */
router.get(
  '/:id',
  validateParams(uuidParamSchema),
  getSolarReturnById
);

/**
 * @route   POST /api/v1/solar-returns/:id/recalculate
 * @desc    Recalculate solar return with new location
 * @access  Private
 *
 * @openapi
 * /api/v1/solar-returns/{id}/recalculate:
 *   post:
 *     tags: [Solar Returns]
 *     summary: Recalculate solar return with new location
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [location]
 *             properties:
 *               location:
 *                 type: object
 *                 required: [name, latitude, longitude, timezone]
 *                 properties:
 *                   name: { type: string }
 *                   latitude: { type: number }
 *                   longitude: { type: number }
 *                   timezone: { type: string }
 *               houseSystem:
 *                 type: string
 *                 enum: [placidus, koch, porphyry, whole, equal, topocentric]
 *               zodiacType:
 *                 type: string
 *                 enum: [tropical, sidereal]
 *     responses:
 *       200:
 *         description: Recalculated solar return
 *       404:
 *         description: Solar return not found
 */
router.post(
  '/:id/recalculate',
  astroComputationRateLimiter,
  validateBody(recalculateSchema),
  recalculateSolarReturn
);

/**
 * @route   DELETE /api/v1/solar-returns/:id
 * @desc    Delete solar return
 * @access  Private
 *
 * @openapi
 * /api/v1/solar-returns/{id}:
 *   delete:
 *     tags: [Solar Returns]
 *     summary: Delete a solar return
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Solar return deleted
 *       404:
 *         description: Solar return not found
 */
router.delete(
  '/:id',
  validateParams(uuidParamSchema),
  deleteSolarReturn
);

export { router as solarReturnRoutes };
