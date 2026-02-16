/**
 * Transit Routes
 */

import { Router } from 'express';
import { authenticate } from '../../../middleware/auth';
import { asyncHandler } from '../../../middleware/errorHandler';
import { validateBody } from '../../../utils/validators';
import { calculateTransitsSchema } from '../../../utils/validators';
import * as TransitController from '../controllers/transit.controller';

const router = Router();

// All transit routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/transits/calculate
 * @desc    Calculate transits for date range
 * @access  Private
 */
router.post('/calculate', validateBody(calculateTransitsSchema), asyncHandler(async (req, res) => {
  await TransitController.calculateTransits(req, res);
}));

/**
 * @route   GET /api/transits/today
 * @desc    Get today's transits
 * @access  Private
 */
router.get('/today', asyncHandler(async (req, res) => {
  await TransitController.getTodayTransits(req, res);
}));

/**
 * @route   GET /api/transits/calendar
 * @desc    Get transit calendar data
 * @access  Private
 */
router.get('/calendar', asyncHandler(async (req, res) => {
  await TransitController.getTransitCalendar(req, res);
}));

/**
 * @route   GET /api/transits/forecast
 * @desc    Get transit forecast for duration
 * @access  Private
 */
router.get('/forecast', asyncHandler(async (req, res) => {
  await TransitController.getTransitForecast(req, res);
}));

/**
 * @route   GET /api/transits/:id
 * @desc    Get specific transit details
 * @access  Private
 */
router.get('/:id', asyncHandler(async (req, res) => {
  await TransitController.getTransitDetails(req, res);
}));

export const router = Router();;
