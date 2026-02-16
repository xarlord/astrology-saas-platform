/**
 * Solar Return Routes
 * API endpoints for solar return calculations
 */

import { Router } from 'express';
import solarReturnController from '../controllers/solarReturn.controller';
import { authenticate } from '../../../middleware/auth';
import { asyncHandler } from '../../../middleware/errorHandler';
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
router.post(
  '/calculate',
  validateBody(calculateSchema),
  asyncHandler(async (req, res) => {
    await solarReturnController.calculateSolarReturn(req, res);
  })
);

/**
 * @route   GET /api/v1/solar-returns/year/:year
 * @desc    Get solar return for a specific year
 * @access  Private
 */
router.get(
  '/year/:year',
  asyncHandler(async (req, res) => {
    await solarReturnController.getSolarReturnByYear(req, res);
  })
);

/**
 * @route   GET /api/v1/solar-returns/:id
 * @desc    Get solar return by ID
 * @access  Private
 */
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    await solarReturnController.getSolarReturnById(req, res);
  })
);

/**
 * @route   GET /api/v1/solar-returns/history
 * @desc    Get user's solar return history
 * @access  Private
 */
router.get(
  '/history',
  asyncHandler(async (req, res) => {
    await solarReturnController.getSolarReturnHistory(req, res);
  })
);

/**
 * @route   POST /api/v1/solar-returns/:id/recalculate
 * @desc    Recalculate solar return with new location
 * @access  Private
 */
router.post(
  '/:id/recalculate',
  validateBody(recalculateSchema),
  asyncHandler(async (req, res) => {
    await solarReturnController.recalculateSolarReturn(req, res);
  })
);

/**
 * @route   GET /api/v1/solar-returns/stats
 * @desc    Get solar return statistics
 * @access  Private
 */
router.get(
  '/stats',
  asyncHandler(async (req, res) => {
    await solarReturnController.getSolarReturnStats(req, res);
  })
);

/**
 * @route   GET /api/v1/solar-returns/years/available
 * @desc    Get available years for solar returns
 * @access  Private
 */
router.get(
  '/years/available',
  asyncHandler(async (req, res) => {
    await solarReturnController.getAvailableYears(req, res);
  })
);

/**
 * @route   DELETE /api/v1/solar-returns/:id
 * @desc    Delete solar return
 * @access  Private
 */
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await solarReturnController.deleteSolarReturn(req, res);
  })
);

export { router as solarReturnRoutes };
