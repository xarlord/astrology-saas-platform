/**
 * Public Share Routes
 * Access shared charts without authentication
 */

import { Router } from 'express';
import { asyncHandler } from '../../../middleware/errorHandler';
import { authenticate, AuthenticatedRequest } from '../../../middleware/auth';
import { AppError } from '../../../utils/appError';
import { shareRateLimiter } from '../../../middleware/rateLimiter';
import { chartSharingService } from '../../shared/services/chartSharing.service';
import { ChartModel } from '../models';
import { NatalChartService } from '../../shared/services/natalChart.service';
import type { HouseSystem } from '../../shared/services/houseCalculation.service';

const natalChartService = new NatalChartService();

const router = Router();

// Apply share rate limiter to all share routes
router.use(shareRateLimiter);

/**
 * @route   GET /api/share/:token
 * @desc    Access shared chart by token (public links only — no password via query string)
 * @access  Public
 */
/**
 * @openapi
 * /api/v1/share/{token}:
 *   get:
 *     tags: [Share]
 *     summary: Access shared chart by token
 *     security: []
 *     responses:
 *       200:
 *         description: Shared chart data
 *       400:
 *         description: Invalid share link format
 *       401:
 *         description: Password required
 *       404:
 *         description: Share link or chart not found
 */
router.get('/:token', asyncHandler(async (req, res) => {
  const { token } = req.params;

  // Validate token format
  if (!chartSharingService.isValidTokenFormat(token)) {
    res.status(400).json({
      success: false,
      error: 'Invalid share link format',
    });
    return;
  }

  // Access the shared chart (no password accepted via GET — use POST for password-protected shares)
  const result = await chartSharingService.accessSharedChart(
    token,
    undefined,
    async (chartId: string) => {
      const chart = await ChartModel.findById(chartId);
      if (!chart) return {};

      if (!chart.calculated_data) {
        return natalChartService.calculateNatalChart({
          birthDate: new Date(chart.birth_date),
          birthTime: chart.birth_time,
          latitude: chart.birth_latitude,
          longitude: chart.birth_longitude,
          houseSystem: (chart.house_system || 'Placidus') as HouseSystem,
        }) as unknown as Record<string, unknown>;
      }

      return chart.calculated_data as Record<string, unknown>;
    }
  );

  if (!result.success) {
    res.status(result.error === 'Password required' ? 401 : 404).json({
      success: false,
      error: result.error,
    });
    return;
  }

  if (!result.chart) {
    res.status(404).json({
      success: false,
      error: 'Chart data not found',
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: {
      chart: {
        name: result.chart.name,
        type: result.chart.type,
        birth_date: result.chart.birth_date,
        birth_time: result.chart.birth_time,
        birth_place_name: result.chart.birth_place_name,
        calculated_data: result.chart.calculated_data,
      },
    },
  });
}));

/**
 * @route   POST /api/share/:token
 * @desc    Access password-protected shared chart (password in request body)
 * @access  Public
 */
router.post('/:token', asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!chartSharingService.isValidTokenFormat(token)) {
    res.status(400).json({
      success: false,
      error: 'Invalid share link format',
    });
    return;
  }

  const result = await chartSharingService.accessSharedChart(
    token,
    password,
    async (chartId: string) => {
      const chart = await ChartModel.findById(chartId);
      if (!chart) return {};

      if (!chart.calculated_data) {
        return natalChartService.calculateNatalChart({
          birthDate: new Date(chart.birth_date),
          birthTime: chart.birth_time,
          latitude: chart.birth_latitude,
          longitude: chart.birth_longitude,
          houseSystem: (chart.house_system || 'Placidus') as HouseSystem,
        }) as unknown as Record<string, unknown>;
      }

      return chart.calculated_data as Record<string, unknown>;
    }
  );

  if (!result.success) {
    res.status(result.error === 'Password required' ? 401 : 404).json({
      success: false,
      error: result.error,
    });
    return;
  }

  if (!result.chart) {
    res.status(404).json({
      success: false,
      error: 'Chart data not found',
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: {
      chart: {
        name: result.chart.name,
        type: result.chart.type,
        birth_date: result.chart.birth_date,
        birth_time: result.chart.birth_time,
        birth_place_name: result.chart.birth_place_name,
        calculated_data: result.chart.calculated_data,
      },
    },
  });
}));

/**
 * @route   GET /api/share/:token/stats
 * @desc    Get share link statistics
 * @access  Private (requires authentication — only share owner should view stats)
 */
/**
 * @openapi
 * /api/v1/share/{token}/stats:
 *   get:
 *     tags: [Share]
 *     summary: Get share link statistics
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Share statistics
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not the share owner
 *       404:
 *         description: Share link not found
 */
router.get('/:token/stats', authenticate, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { token } = req.params;

  const share = await chartSharingService.getShareByToken(token);

  if (!share) {
    throw new AppError('Share link not found', 404);
  }

  // Verify ownership: only the share creator can view stats
  if (share.createdBy !== req.user.id) {
    throw new AppError('You can only view stats for shares you created', 403);
  }

  const stats = await chartSharingService.getShareStats(token);

  if (!stats) {
    throw new AppError('Share link not found', 404);
  }

  res.status(200).json({
    success: true,
    data: { stats },
  });
}));

export { router };
