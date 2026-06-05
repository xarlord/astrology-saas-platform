/**
 * Monthly Transit Report Routes
 * API routes for monthly transit reports
 *
 * CHI-123: Backend API endpoint for monthly transit reports
 */

import { Router, RequestHandler } from 'express';
import { z } from 'zod';
import { authenticate, AuthenticatedRequest } from '../../../middleware/auth';
import { asyncHandler } from '../../../middleware/errorHandler';
import { validateBody } from '../../../utils/validators';
import {
  getMonthlyTransitReport,
  getCurrentMonthlyReport,
} from '../controllers/monthlyTransit.controller';

const router = Router();

const monthlyReportSchema = z.object({
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format')
    .optional(),
});

// All monthly transit report routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/v1/reports/monthly
 * @desc    Generate a monthly transit report for a specific month
 * @access  Private (Premium only)
 * @body    { month?: string } - Optional month in YYYY-MM format
 *
 * @openapi
 * /api/v1/reports/monthly:
 *   post:
 *     tags: [Reports]
 *     summary: Generate a monthly transit report
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               month:
 *                 type: string
 *                 pattern: '^\d{4}-\d{2}$'
 *                 description: Month in YYYY-MM format
 *     responses:
 *       200:
 *         description: Monthly transit report
 *       402:
 *         description: Premium subscription required
 */
router.post(
  '/',
  validateBody(monthlyReportSchema),
  asyncHandler(async (req, res) => {
    await getMonthlyTransitReport(req as AuthenticatedRequest, res);
  }) as RequestHandler,
);

/**
 * @route   GET /api/v1/reports/monthly/current
 * @desc    Get the current month's transit report
 * @access  Private (Premium only)
 *
 * @openapi
 * /api/v1/reports/monthly/current:
 *   get:
 *     tags: [Reports]
 *     summary: Get the current month's transit report
 *     responses:
 *       200:
 *         description: Current monthly transit report
 *       402:
 *         description: Premium subscription required
 *       404:
 *         description: No report found for current month
 */
router.get(
  '/current',
  asyncHandler(async (req, res) => {
    await getCurrentMonthlyReport(req as AuthenticatedRequest, res);
  }) as RequestHandler,
);

export { router as monthlyTransitRoutes };
