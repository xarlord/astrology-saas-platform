/**
 * AI Controller
 * Handles AI-powered interpretation requests
 */

import { Request, Response } from 'express';
import { AppError } from '../../../utils/appError';
import aiInterpretationService from '../services/aiInterpretation.service';
import openaiService from '../services/openai.service';
import logger from '../../../utils/logger';

// Extend Express Request type to include user
interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    email: string;
  };
}

/**
 * Generate AI-powered natal chart interpretation
 * POST /api/v1/ai/natal
 */
export async function generateNatal(req: AuthenticatedRequest, res: Response): Promise<void> {
  const chartData = req.body;

  // Validate input
  if (!chartData || !chartData.planets || chartData.planets.length === 0) {
    throw new AppError('Chart data must include at least one planet position', 400);
  }

  logger.info('Generating AI natal interpretation', { userId: req.user?.userId });

  const interpretation = await aiInterpretationService.generateNatal(chartData);

  res.json({
    success: true,
    data: interpretation,
  });
}

/**
 * Generate AI-powered transit forecast
 * POST /api/v1/ai/transit
 */
export async function generateTransit(req: AuthenticatedRequest, res: Response): Promise<void> {
  const transitData = req.body;

  // Validate input
  if (!transitData || !transitData.currentTransits || transitData.currentTransits.length === 0) {
    throw new AppError('Transit data must include at least one transit event', 400);
  }

  logger.info('Generating AI transit forecast', { userId: req.user?.userId });

  const forecast = await aiInterpretationService.generateTransit(transitData);

  res.json({
    success: true,
    data: forecast,
  });
}

/**
 * Generate AI-powered compatibility analysis
 * POST /api/v1/ai/compatibility
 */
export async function generateCompatibility(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { chartA, chartB } = req.body;

  // Validate input
  if (!chartA || !chartB) {
    throw new AppError('Both chartA and chartB are required for compatibility analysis', 400);
  }

  if (!chartA.planets || chartA.planets.length === 0) {
    throw new AppError('chartA must include at least one planet position', 400);
  }

  if (!chartB.planets || chartB.planets.length === 0) {
    throw new AppError('chartB must include at least one planet position', 400);
  }

  logger.info('Generating AI compatibility analysis', { userId: req.user?.userId });

  const analysis = await aiInterpretationService.generateCompatibility({ chartA, chartB });

  res.json({
    success: true,
    data: analysis,
  });
}

/**
 * Generate AI-powered lunar return interpretation
 * POST /api/v1/ai/lunar-return
 */
export async function generateLunarReturn(req: AuthenticatedRequest, res: Response): Promise<void> {
  const chartData = req.body;

  // Validate input
  if (!chartData || !chartData.planets || chartData.planets.length === 0) {
    throw new AppError('Chart data must include at least one planet position', 400);
  }

  logger.info('Generating AI lunar return interpretation', { userId: req.user?.userId });

  const interpretation = await aiInterpretationService.generateLunarReturn(chartData);

  res.json({
    success: true,
    data: interpretation,
  });
}

/**
 * Generate AI-powered solar return interpretation
 * POST /api/v1/ai/solar-return
 */
export async function generateSolarReturn(req: AuthenticatedRequest, res: Response): Promise<void> {
  const chartData = req.body;

  // Validate input
  if (!chartData || !chartData.planets || chartData.planets.length === 0) {
    throw new AppError('Chart data must include at least one planet position', 400);
  }

  logger.info('Generating AI solar return interpretation', { userId: req.user?.userId });

  const interpretation = await aiInterpretationService.generateSolarReturn(chartData);

  res.json({
    success: true,
    data: interpretation,
  });
}

/**
 * Check AI service status
 * GET /api/v1/ai/status
 */
export async function checkStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
  const configured = openaiService.isConfigured();
  const configStatus = openaiService.getConfigStatus();

  res.json({
    success: true,
    data: {
      available: configured,
      service: configured ? 'openai' : null,
      ...configStatus,
    },
  });
}

/**
 * Get AI usage statistics
 * GET /api/v1/ai/usage
 */
export async function getUsageStats(req: AuthenticatedRequest, res: Response): Promise<void> {
  const stats = await openaiService.getUsageStats();

  res.json({
    success: true,
    data: stats,
  });
}

/**
 * Clear AI interpretation cache
 * POST /api/v1/ai/cache/clear
 */
export async function clearCache(req: AuthenticatedRequest, res: Response): Promise<void> {
  await aiInterpretationService.clearCache();

  logger.info('AI interpretation cache cleared', { userId: req.user?.userId });

  res.json({
    success: true,
    message: 'Cache cleared successfully',
  });
}
