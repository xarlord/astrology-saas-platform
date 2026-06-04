/**
 * Monthly Transit Report Controller
 * API endpoints for monthly transit reports
 *
 * CHI-123: Backend API endpoint for monthly transit reports
 */

import { Response } from 'express';
import { AuthenticatedRequest } from '../../../middleware/auth';
import { generateMonthlyTransitReport } from '../services/monthlyTransit.service';
import UserModel from '../../users/models/user.model';
import { UnauthorizedError, NotFoundError, ForbiddenError, BadRequestError } from '../../../utils/appError';

/**
 * Verify that the authenticated user has a premium subscription.
 * Throws appropriate errors if user is missing, not found, or not premium.
 */
async function requirePremiumUser(req: AuthenticatedRequest): Promise<void> {
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError('Authentication required');
  }

  const user = await UserModel.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  if (user.plan !== 'premium') {
    throw new ForbiddenError(
      'Monthly transit reports require a Premium subscription. Upgrade to access this feature.',
    );
  }
}

/**
 * POST /api/v1/reports/monthly
 * Generate a monthly transit report for the authenticated user
 *
 * Request body:
 * - month: string (optional) - Month in YYYY-MM format, defaults to current month
 *
 * Requires premium tier subscription
 */
export async function getMonthlyTransitReport(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  await requirePremiumUser(req);

  const userId = req.user?.id;
  if (!userId) {
    throw new BadRequestError('User authentication required');
  }
  const { month } = req.body;

  // Validate month format if provided
  if (month && !/^\d{4}-\d{2}$/.test(month)) {
    throw new BadRequestError('Invalid month format. Use YYYY-MM.');
  }

  // Generate monthly transit report
  const report = await generateMonthlyTransitReport(userId, month);

  res.json({
    success: true,
    data: report,
  });
}

/**
 * GET /api/v1/reports/monthly/current
 * Get the current month's transit report (convenience endpoint)
 */
export async function getCurrentMonthlyReport(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  await requirePremiumUser(req);

  const userId = req.user?.id;
  if (!userId) {
    throw new BadRequestError('User authentication required');
  }

  // Generate current month's report
  const report = await generateMonthlyTransitReport(userId);

  res.json({
    success: true,
    data: report,
  });
}
