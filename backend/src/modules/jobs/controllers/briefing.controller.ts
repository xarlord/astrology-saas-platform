/**
 * Briefing Controller
 * API endpoints for daily cosmic briefing retrieval
 *
 * CHI-68: In-app briefing page accessible from dashboard
 */

import { Response } from 'express';
import { AuthenticatedRequest } from '../../../middleware/auth';
import { asyncHandler } from '../../../middleware/errorHandler';
import { AppError } from '../../../utils/appError';
import {
  getLatestBriefing,
  getBriefingByDate as fetchBriefingByDate,
  generateBriefing,
  formatBriefingContent,
} from '../services/dailyBriefing.service';

/**
 * GET /api/v1/briefing
 * Get the latest daily briefing for the authenticated user.
 * If no briefing exists for today, generates one on-the-fly.
 */
export const getBriefing = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('Authentication required', 401);
    }

    // Try to fetch today's briefing from DB first
    const briefing = await getLatestBriefing(userId);

    if (briefing) {
      const content = formatBriefingContent(briefing);
      res.json({
        success: true,
        data: {
          briefing,
          content,
        },
      });
      return;
    }

    // No briefing found — generate one on-the-fly
    try {
      const newBriefing = await generateBriefing(userId);
      const content = formatBriefingContent(newBriefing);

      res.json({
        success: true,
        data: {
          briefing: newBriefing,
          content,
        },
      });
    } catch (err) {
      const message = (err as Error).message;
      if (message.includes('No natal chart found')) {
        throw new AppError(
          'No natal chart found. Please create a natal chart first to receive daily briefings.',
          404,
        );
      }
      throw err;
    }
  },
);

/**
 * GET /api/v1/briefing/:date
 * Get a briefing for a specific date (history lookup)
 */
export const getBriefingByDate = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const { date } = req.params;

    if (!userId) {
      throw new AppError('Authentication required', 401);
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new AppError('Invalid date format. Use YYYY-MM-DD.', 400);
    }

    const briefing = await fetchBriefingByDate(userId, date);

    if (!briefing) {
      throw new AppError(`No briefing found for ${date}`, 404);
    }

    const content = formatBriefingContent(briefing);
    res.json({
      success: true,
      data: {
        briefing,
        content,
      },
    });
  },
);
