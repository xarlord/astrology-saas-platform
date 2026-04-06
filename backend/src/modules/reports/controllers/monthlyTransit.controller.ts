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
  res: Response
): Promise<void> {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return;
  }

  // Verify user has premium tier
  const user = await UserModel.findById(userId);
  if (!user) {
    res.status(404).json({ success: false, error: 'User not found' });
    return;
  }

  if (user.plan !== 'premium') {
    res.status(403).json({
      success: false,
      error: 'Monthly transit reports require a Premium subscription. Upgrade to access this feature.',
    });
    return;
  }

  try {
    // Get month from request body or use current month
    const { month } = req.body;

    // Validate month format if provided
    if (month && !/^\d{4}-\d{2}$/.test(month)) {
      res.status(400).json({
        success: false,
        error: 'Invalid month format. Use YYYY-MM.',
      });
      return;
    }

    // Generate monthly transit report
    const report = await generateMonthlyTransitReport(userId, month);

    res.json({
      success: true,
      data: report,
    });
  } catch (err) {
    const message = (err as Error).message;

    if (message.includes('No natal chart found')) {
      res.status(404).json({
        success: false,
        error: 'No natal chart found. Please create a natal chart first to generate monthly transit reports.',
      });
      return;
    }

    if (message.includes('Invalid month format')) {
      res.status(400).json({
        success: false,
        error: message,
      });
      return;
    }

    // Log unexpected errors and return 500
    console.error('Error generating monthly transit report:', err);
    res.status(500).json({
      success: false,
      error: 'An error occurred while generating the monthly transit report. Please try again later.',
    });
  }
}

/**
 * GET /api/v1/reports/monthly/current
 * Get the current month's transit report (convenience endpoint)
 */
export async function getCurrentMonthlyReport(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return;
  }

  // Verify user has premium tier
  const user = await UserModel.findById(userId);
  if (!user) {
    res.status(404).json({ success: false, error: 'User not found' });
    return;
  }

  if (user.plan !== 'premium') {
    res.status(403).json({
      success: false,
      error: 'Monthly transit reports require a Premium subscription. Upgrade to access this feature.',
    });
    return;
  }

  try {
    // Generate current month's report
    const report = await generateMonthlyTransitReport(userId);

    res.json({
      success: true,
      data: report,
    });
  } catch (err) {
    const message = (err as Error).message;

    if (message.includes('No natal chart found')) {
      res.status(404).json({
        success: false,
        error: 'No natal chart found. Please create a natal chart first to generate monthly transit reports.',
      });
      return;
    }

    console.error('Error generating monthly transit report:', err);
    res.status(500).json({
      success: false,
      error: 'An error occurred while generating the monthly transit report. Please try again later.',
    });
  }
}
