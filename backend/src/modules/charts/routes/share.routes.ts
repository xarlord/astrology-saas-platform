/**
 * Public Share Routes
 * Access shared charts without authentication
 */

import { Router } from 'express';
import { asyncHandler } from '../../../middleware/errorHandler';
import { authenticate, AuthenticatedRequest } from '../../../middleware/auth';
import { AppError } from '../../../utils/appError';
import { chartSharingService } from '../../shared/services/chartSharing.service';
import { ChartModel } from '../models';
import { NatalChartService } from '../../shared/services/natalChart.service';
import type { HouseSystem } from '../../shared/services/houseCalculation.service';

const natalChartService = new NatalChartService();

const router = Router();

/**
 * @route   GET /api/share/:token
 * @desc    Access shared chart by token
 * @access  Public (with optional password check)
 */
router.get('/:token', asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.query;

  // Validate token format
  if (!chartSharingService.isValidTokenFormat(token)) {
    res.status(400).json({
      success: false,
      error: 'Invalid share link format',
    });
    return;
  }

  // Access the shared chart
  const result = await chartSharingService.accessSharedChart(
    token,
    password as string,
    async (chartId: string) => {
      // Get chart from database
      const chart = await ChartModel.findById(chartId);
      if (!chart) {
        return null;
      }

      // Calculate if needed using real calculation engine
      if (!chart.calculated_data) {
        return natalChartService.calculateNatalChart({
          birthDate: new Date(chart.birth_date),
          birthTime: chart.birth_time,
          latitude: chart.birth_latitude,
          longitude: chart.birth_longitude,
          houseSystem: (chart.house_system || 'Placidus') as HouseSystem,
        });
      }

      return chart.calculated_data;
    }
  );

  if (!result.success) {
    res.status(result.error === 'Password required' ? 401 : 404).json({
      success: false,
      error: result.error,
    });
    return;
  }

  // Return chart data (without sensitive info)
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
