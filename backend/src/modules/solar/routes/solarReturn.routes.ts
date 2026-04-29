/**
 * Solar Return Routes
 * API endpoints for solar return calculations
 */

import { Router } from 'express';
import {
  calculateSolarReturn,
  getSolarReturnByYear,
  getSolarReturnById,
  getSolarReturnHistory,
  recalculateSolarReturn,
  getSolarReturnStats,
  getAvailableYears,
  deleteSolarReturn,
} from '../controllers/solarReturn.controller';
import { authenticate } from '../../../middleware/auth';
import { validateBody } from '../../../utils/validators';
import Joi from 'joi';

const router = Router();

// Validation schemas
const calculateSchema = Joi.object({
  natalChartId: Joi.string().uuid().required(),
  year: Joi.number().integer().min(1900).max(2100).required(),
  location: Joi.object({
    name: Joi.string().required(),
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
    timezone: Joi.string().required(),
    country: Joi.string(),
    region: Joi.string(),
  }),
  houseSystem: Joi.string().valid('placidus', 'koch', 'porphyry', 'whole', 'equal', 'topocentric'),
  zodiacType: Joi.string().valid('tropical', 'sidereal'),
});

const recalculateSchema = Joi.object({
  location: Joi.object({
    name: Joi.string().required(),
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
    timezone: Joi.string().required(),
    country: Joi.string(),
    region: Joi.string(),
  }).required(),
  houseSystem: Joi.string().valid('placidus', 'koch', 'porphyry', 'whole', 'equal', 'topocentric'),
  zodiacType: Joi.string().valid('tropical', 'sidereal'),
});

// Apply authentication to all routes
router.use(authenticate);

/**
 * @route   POST /api/v1/solar-returns/calculate
 * @desc    Calculate solar return for a given year
 * @access  Private
 */
/**
 * @openapi
 * /api/v1/solar-returns/calculate:
 *   post:
 *     tags: [Solar Returns]
 *     summary: Calculate solar return for a given year
 *     security: [{ bearerAuth: [] }]
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
 *                   name:
 *                     type: string
 *                   latitude:
 *                     type: number
 *                   longitude:
 *                     type: number
 *                   timezone:
 *                     type: string
 *                   country:
 *                     type: string
 *                   region:
 *                     type: string
 *               houseSystem:
 *                 type: string
 *                 enum: [placidus, koch, porphyry, whole, equal, topocentric]
 *               zodiacType:
 *                 type: string
 *                 enum: [tropical, sidereal]
 *     responses:
 *       200:
 *         description: Solar return calculation result
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 */
router.post('/calculate', validateBody(calculateSchema), calculateSolarReturn);

/**
 * @route   GET /api/v1/solar-returns/year/:year
 * @desc    Get solar return for a specific year
 * @access  Private
 */
/**
 * @openapi
 * /api/v1/solar-returns/year/{year}:
 *   get:
 *     tags: [Solar Returns]
 *     summary: Get solar return for a specific year
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1900
 *           maximum: 2100
 *     responses:
 *       200:
 *         description: Solar return data for the specified year
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Solar return not found for the given year
 */
router.get('/year/:year', getSolarReturnByYear);

/**
 * @route   GET /api/v1/solar-returns/:id
 * @desc    Get solar return by ID
 * @access  Private
 */
/**
 * @openapi
 * /api/v1/solar-returns/{id}:
 *   get:
 *     tags: [Solar Returns]
 *     summary: Get solar return by ID
 *     security: [{ bearerAuth: [] }]
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
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Solar return not found
 */
router.get('/:id', getSolarReturnById);

/**
 * @route   GET /api/v1/solar-returns/history
 * @desc    Get user's solar return history
 * @access  Private
 */
/**
 * @openapi
 * /api/v1/solar-returns/history:
 *   get:
 *     tags: [Solar Returns]
 *     summary: Get user's solar return history
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: List of user's solar return records
 *       401:
 *         description: Unauthorized
 */
router.get('/history', getSolarReturnHistory);

/**
 * @route   POST /api/v1/solar-returns/:id/recalculate
 * @desc    Recalculate solar return with new location
 * @access  Private
 */
/**
 * @openapi
 * /api/v1/solar-returns/{id}/recalculate:
 *   post:
 *     tags: [Solar Returns]
 *     summary: Recalculate solar return with new location
 *     security: [{ bearerAuth: [] }]
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
 *                   name:
 *                     type: string
 *                   latitude:
 *                     type: number
 *                   longitude:
 *                     type: number
 *                   timezone:
 *                     type: string
 *                   country:
 *                     type: string
 *                   region:
 *                     type: string
 *               houseSystem:
 *                 type: string
 *                 enum: [placidus, koch, porphyry, whole, equal, topocentric]
 *               zodiacType:
 *                 type: string
 *                 enum: [tropical, sidereal]
 *     responses:
 *       200:
 *         description: Recalculated solar return data
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Solar return not found
 */
router.post('/:id/recalculate', validateBody(recalculateSchema), recalculateSolarReturn);

/**
 * @route   GET /api/v1/solar-returns/stats
 * @desc    Get solar return statistics
 * @access  Private
 */
/**
 * @openapi
 * /api/v1/solar-returns/stats:
 *   get:
 *     tags: [Solar Returns]
 *     summary: Get solar return statistics
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Solar return statistics
 *       401:
 *         description: Unauthorized
 */
router.get('/stats', getSolarReturnStats);

/**
 * @route   GET /api/v1/solar-returns/years/available
 * @desc    Get available years for solar returns
 * @access  Private
 */
/**
 * @openapi
 * /api/v1/solar-returns/years/available:
 *   get:
 *     tags: [Solar Returns]
 *     summary: Get available years for solar returns
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: List of available years
 *       401:
 *         description: Unauthorized
 */
router.get('/years/available', getAvailableYears);

/**
 * @route   DELETE /api/v1/solar-returns/:id
 * @desc    Delete solar return
 * @access  Private
 */
/**
 * @openapi
 * /api/v1/solar-returns/{id}:
 *   delete:
 *     tags: [Solar Returns]
 *     summary: Delete a solar return
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Solar return deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Solar return not found
 */
router.delete('/:id', deleteSolarReturn);

export { router as SolarReturnRoutes };
