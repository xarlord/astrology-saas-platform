/**
 * Transit Routes
 */

import { Router } from 'express';
import { authenticate, optionalAuthenticate, AuthenticatedRequest } from '../../../middleware/auth';
import { asyncHandler } from '../../../middleware/errorHandler';
import { validateBody } from '../../../utils/validators';
import { calculateTransitsSchema } from '../../../utils/validators';
import * as TransitController from '../controllers/transit.controller';

const router = Router();

/**
 * @route   GET /api/transits/today
 * @desc    Get today's transits (public data, optional auth for personalized data)
 * @access  Public (with optional auth)
 */
/**
 * @openapi
 * /api/v1/transits/today:
 *   get:
 *     tags: [Transits]
 *     summary: Get today's transits
 *     description: Returns current planetary transits. Unauthenticated requests receive general transit data; authenticated requests receive personalized insights.
 *     security: []
 *     responses:
 *       200:
 *         description: Today's transit data
 *       500:
 *         description: Server error
 */
router.get(
  '/today',
  optionalAuthenticate,
  asyncHandler(async (req, res) => {
    await TransitController.getTodayTransits(req as AuthenticatedRequest, res);
  }),
);

// All other transit routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/transits/calculate
 * @desc    Calculate transits for date range
 * @access  Private
 */
/**
 * @openapi
 * /api/v1/transits/calculate:
 *   post:
 *     tags: [Transits]
 *     summary: Calculate transits for a date range
 *     description: Calculate planetary transits for a specified date range. Requires a validated request body with start/end dates.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [startDate, endDate]
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Calculated transit data
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post(
  '/calculate',
  validateBody(calculateTransitsSchema),
  asyncHandler(async (req, res) => {
    await TransitController.calculateTransits(req as AuthenticatedRequest, res);
  }),
);

/**
 * @route   GET /api/transits/calendar
 * @desc    Get transit calendar data
 * @access  Private
 */
/**
 * @openapi
 * /api/v1/transits/calendar:
 *   get:
 *     tags: [Transits]
 *     summary: Get transit calendar data
 *     description: Returns calendar-formatted transit events for the authenticated user.
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Transit calendar data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get(
  '/calendar',
  asyncHandler(async (req, res) => {
    await TransitController.getTransitCalendar(req as AuthenticatedRequest, res);
  }),
);

/**
 * @route   GET /api/transits/forecast
 * @desc    Get transit forecast for duration
 * @access  Private
 */
/**
 * @openapi
 * /api/v1/transits/forecast:
 *   get:
 *     tags: [Transits]
 *     summary: Get transit forecast
 *     description: Returns a personalized transit forecast based on the user's natal chart and upcoming planetary movements.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: duration
 *         schema:
 *           type: string
 *           enum: [week, month, quarter]
 *         description: Forecast time range
 *     responses:
 *       200:
 *         description: Transit forecast data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get(
  '/forecast',
  asyncHandler(async (req, res) => {
    await TransitController.getTransitForecast(req as AuthenticatedRequest, res);
  }),
);

/**
 * @route   GET /api/transits/:id
 * @desc    Get specific transit details
 * @access  Private
 */
/**
 * @openapi
 * /api/v1/transits/{id}:
 *   get:
 *     tags: [Transits]
 *     summary: Get specific transit details
 *     description: Retrieve detailed information about a specific transit by its ID.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Transit ID
 *     responses:
 *       200:
 *         description: Transit details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Transit not found
 *       500:
 *         description: Server error
 */
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    await TransitController.getTransitDetails(req as AuthenticatedRequest, res);
  }),
);

export { router };
