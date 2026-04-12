/**
 * Briefing Controller
 * API endpoints for daily cosmic briefing retrieval
 *
 * CHI-68: In-app briefing page accessible from dashboard
 */

import { Response } from 'express';
import { AuthenticatedRequest } from '../../../middleware/auth';
import { getLatestBriefing, generateBriefing, formatBriefingContent } from '../services/dailyBriefing.service';

/**
 * GET /api/v1/briefing
 * Get the latest daily briefing for the authenticated user.
 * If no briefing exists for today, generates one on-the-fly.
 */
export async function getBriefing(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return;
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
      res.status(404).json({
        success: false,
        error: 'No natal chart found. Please create a natal chart first to receive daily briefings.',
      });
      return;
    }
    throw err;
  }
}

/**
 * GET /api/v1/briefing/:date
 * Get a briefing for a specific date (history lookup)
 */
export async function getBriefingByDate(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user?.id;
  const { date } = req.params;

  if (!userId) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return;
  }

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    res.status(400).json({ success: false, error: 'Invalid date format. Use YYYY-MM-DD.' });
    return;
  }

  const briefing = await getLatestBriefing(userId);

  if (!briefing || briefing.date !== date) {
    res.status(404).json({ success: false, error: `No briefing found for ${date}` });
    return;
  }

  const content = formatBriefingContent(briefing);
  res.json({
    success: true,
    data: {
      briefing,
      content,
    },
  });
}
