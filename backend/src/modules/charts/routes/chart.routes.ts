/**
 * Chart Routes
 */

import { Router, RequestHandler } from 'express';
import { authenticate, AuthenticatedRequest } from '../../../middleware/auth';
import { asyncHandler } from '../../../middleware/errorHandler';
import { enforceChartLimit } from '../../../middleware/planEnforcement';
import { chartCreationRateLimiter } from '../../../middleware/rateLimiter';
import * as ChartController from '../controllers/chart.controller';

const router = Router();

// All chart routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/charts
 * @desc    Create a new chart
 * @access  Private
 */
/**
 * @openapi
 * /api/v1/charts:
 *   post:
 *     tags: [Charts]
 *     summary: Create a new chart
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201:
 *         description: Chart created
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Plan limit reached
 */
router.post('/', chartCreationRateLimiter, enforceChartLimit as RequestHandler, asyncHandler(async (req, res) => {
  await ChartController.createChart(req as AuthenticatedRequest, res);
}) as RequestHandler);

/**
 * @route   GET /api/charts
 * @desc    Get all user's charts
 * @access  Private
 */
/**
 * @openapi
 * /api/v1/charts:
 *   get:
 *     tags: [Charts]
 *     summary: Get all user's charts
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: List of charts
 *       401:
 *         description: Unauthorized
 */
router.get('/', asyncHandler(async (req, res) => {
  await ChartController.getUserCharts(req as AuthenticatedRequest, res);
}));

/**
 * @route   GET /api/charts/:id
 * @desc    Get specific chart
 * @access  Private
 */
/**
 * @openapi
 * /api/v1/charts/{id}:
 *   get:
 *     tags: [Charts]
 *     summary: Get specific chart
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Chart details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Chart not found
 */
router.get('/:id', asyncHandler(async (req, res) => {
  await ChartController.getChart(req as AuthenticatedRequest, res);
}));

/**
 * @route   PUT /api/charts/:id
 * @desc    Update chart
 * @access  Private
 */
/**
 * @openapi
 * /api/v1/charts/{id}:
 *   put:
 *     tags: [Charts]
 *     summary: Update chart
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Chart updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Chart not found
 */
router.put('/:id', asyncHandler(async (req, res) => {
  await ChartController.updateChart(req as AuthenticatedRequest, res);
}));

/**
 * @route   DELETE /api/charts/:id
 * @desc    Delete chart
 * @access  Private
 */
/**
 * @openapi
 * /api/v1/charts/{id}:
 *   delete:
 *     tags: [Charts]
 *     summary: Delete chart
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Chart deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Chart not found
 */
router.delete('/:id', asyncHandler(async (req, res) => {
  await ChartController.deleteChart(req as AuthenticatedRequest, res);
}));

/**
 * @route   POST /api/charts/:id/calculate
 * @desc    Calculate chart (if not cached)
 * @access  Private
 */
/**
 * @openapi
 * /api/v1/charts/{id}/calculate:
 *   post:
 *     tags: [Charts]
 *     summary: Calculate chart
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Chart calculated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Chart not found
 */
router.post('/:id/calculate', asyncHandler(async (req, res) => {
  await ChartController.calculateChart(req as AuthenticatedRequest, res);
}));

export { router };
