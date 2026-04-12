/**
 * Monthly Transit Report Routes
 * API routes for monthly transit reports
 *
 * CHI-123: Backend API endpoint for monthly transit reports
 */

import { Router, RequestHandler } from 'express';
import { authenticate, AuthenticatedRequest } from '../../../middleware/auth';
import { asyncHandler } from '../../../middleware/errorHandler';
import { getMonthlyTransitReport, getCurrentMonthlyReport } from '../controllers/monthlyTransit.controller';

const router = Router();

// All monthly transit report routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/v1/reports/monthly
 * @desc    Generate a monthly transit report for a specific month
 * @access  Private (Premium only)
 * @body    { month?: string } - Optional month in YYYY-MM format
 */
router.post('/',
  asyncHandler(async (req, res) => {
    await getMonthlyTransitReport(req as AuthenticatedRequest, res);
  }) as RequestHandler
);

/**
 * @route   GET /api/v1/reports/monthly/current
 * @desc    Get the current month's transit report
 * @access  Private (Premium only)
 */
router.get('/current',
  asyncHandler(async (req, res) => {
    await getCurrentMonthlyReport(req as AuthenticatedRequest, res);
  }) as RequestHandler
);

export { router as monthlyTransitRoutes };
