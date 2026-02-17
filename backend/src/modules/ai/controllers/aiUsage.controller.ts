/**
 * AI Usage Controller
 * Handles HTTP requests for AI usage statistics and tracking
 */

import { asyncHandler } from '../../../middleware/errorHandler';
import aiUsageService from '../services/aiUsage.service';
import { Request, Response } from 'express';
import logger from '../../../utils/logger';

// Extend Express Request type to include user
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

/**
 * Get user's AI usage statistics
 */
export const getUserStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;

  const stats = await aiUsageService.getUserStats(userId);

  res.json({
    success: true,
    data: stats,
  });
});

/**
 * Get user's AI usage history
 */
export const getUsageHistory = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const { limit } = req.query;

  const history = await aiUsageService.getUsageHistory(userId, Number(limit) || 50);

  res.json({
    success: true,
    data: history,
  });
});

/**
 * Get daily usage statistics
 */
export const getDailyUsage = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const { days } = req.query;

  const dailyUsage = await aiUsageService.getDailyUsage(userId, Number(days) || 30);

  res.json({
    success: true,
    data: dailyUsage,
  });
});

/**
 * Get usage by date range
 */
export const getUsageByDateRange = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    res.status(400).json({
      success: false,
      error: 'startDate and endDate are required',
    });
    return;
  }

  const usage = await aiUsageService.getUsageByDateRange(
    userId,
    new Date(startDate as string),
    new Date(endDate as string)
  );

  res.json({
    success: true,
    data: usage,
  });
});

/**
 * Estimate cost for a request
 */
export const estimateCost = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { inputTokens, outputTokens } = req.body;

  if (typeof inputTokens !== 'number' || typeof outputTokens !== 'number') {
    res.status(400).json({
      success: false,
      error: 'inputTokens and outputTokens must be numbers',
    });
    return;
  }

  const cost = aiUsageService.estimateCost(inputTokens, outputTokens);

  res.json({
    success: true,
    data: {
      estimatedCost: cost,
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
    },
  });
});

/**
 * Get current pricing information
 */
export const getPricing = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const pricing = aiUsageService.getPricing();

  res.json({
    success: true,
    data: pricing,
  });
});

/**
 * Check if user is within usage limits
 */
export const checkUsageLimit = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const { limit } = req.query;

  if (!limit) {
    res.status(400).json({
      success: false,
      error: 'Limit is required',
    });
    return;
  }

  const withinLimit = await aiUsageService.checkLimit(userId, Number(limit));

  res.json({
    success: true,
    data: {
      withinLimit,
      limit: Number(limit),
    },
  });
});
