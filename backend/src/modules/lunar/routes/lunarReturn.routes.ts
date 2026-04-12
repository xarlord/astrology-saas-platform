/**
 * Lunar Return Routes
 * API endpoints for lunar return calculations and forecasts
 */

import { Router } from 'express';
import * as lunarReturnController from '../controllers/lunarReturn.controller';
import { authenticate } from '../../../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/lunar-return/next
 * @desc    Get next lunar return date
 * @access  Private
 */
/**
 * @openapi
 * /api/v1/lunar-return/next:
 *   get:
 *     tags: [Lunar Return]
 *     summary: Get next lunar return date
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Next lunar return data
 *       401:
 *         description: Unauthorized
 */
router.get('/next', lunarReturnController.getNextLunarReturn);

/**
 * @route   GET /api/lunar-return/current
 * @desc    Get current lunar return with days until
 * @access  Private
 */
/**
 * @openapi
 * /api/v1/lunar-return/current:
 *   get:
 *     tags: [Lunar Return]
 *     summary: Get current lunar return with days until next
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Current lunar return data
 *       401:
 *         description: Unauthorized
 */
router.get('/current', lunarReturnController.getCurrentLunarReturn);

/**
 * @route   POST /api/lunar-return/chart
 * @desc    Calculate lunar return chart for specific date
 * @access  Private
 * @body    { returnDate: string }
 */
/**
 * @openapi
 * /api/v1/lunar-return/chart:
 *   post:
 *     tags: [Lunar Return]
 *     summary: Calculate lunar return chart for a specific date
 *     security: [{ bearerAuth: [] }]
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
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Lunar return chart data
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 */
router.post('/chart', lunarReturnController.getLunarReturnChart);

/**
 * @route   POST /api/lunar-return/forecast
 * @desc    Get monthly lunar forecast
 * @access  Private
 * @body    { returnDate?: string }
 */
/**
 * @openapi
 * /api/v1/lunar-return/forecast:
 *   post:
 *     tags: [Lunar Return]
 *     summary: Get monthly lunar forecast
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               returnDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Monthly lunar forecast data
 *       401:
 *         description: Unauthorized
 */
router.post('/forecast', lunarReturnController.getLunarMonthForecast);

/**
 * @route   GET /api/lunar-return/history
 * @desc    Get saved lunar returns history
 * @access  Private
 * @query   page, limit
 */
/**
 * @openapi
 * /api/v1/lunar-return/history:
 *   get:
 *     tags: [Lunar Return]
 *     summary: Get saved lunar returns history
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Paginated list of saved lunar returns
 *       401:
 *         description: Unauthorized
 */
router.get('/history', lunarReturnController.getLunarReturnHistory);

/**
 * @route   DELETE /api/lunar-return/:id
 * @desc    Delete a saved lunar return
 * @access  Private
 */
/**
 * @openapi
 * /api/v1/lunar-return/{id}:
 *   delete:
 *     tags: [Lunar Return]
 *     summary: Delete a saved lunar return
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
 *         description: Lunar return deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Lunar return not found
 */
router.delete('/:id', lunarReturnController.deleteLunarReturn);

/**
 * @route   POST /api/lunar-return/calculate
 * @desc    Calculate custom lunar return for any date
 * @access  Private
 * @body    { returnDate: string, includeForecast?: boolean }
 */
/**
 * @openapi
 * /api/v1/lunar-return/calculate:
 *   post:
 *     tags: [Lunar Return]
 *     summary: Calculate custom lunar return for any date
 *     security: [{ bearerAuth: [] }]
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
 *                 format: date-time
 *               includeForecast:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       200:
 *         description: Custom lunar return calculation result
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 */
router.post('/calculate', lunarReturnController.calculateCustomLunarReturn);

export { router as LunarReturnRoutes };
