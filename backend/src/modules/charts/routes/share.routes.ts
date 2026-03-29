/**
 * Public Share Routes
 * Access shared charts without authentication
 */

import { Router } from 'express';
import { asyncHandler } from '../../../middleware/errorHandler';
import { authenticate } from '../../../middleware/auth';
import { chartSharingService } from '../../shared/services/chartSharing.service';
import { ChartModel } from '../models';
import { swissEphemeris } from '../../shared';

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

      // Calculate if needed
      if (!chart.calculated_data) {
        return swissEphemeris.calculateNatalChart({
          birthDate: new Date(chart.birth_date),
          birthTime: chart.birth_time,
          latitude: chart.birth_latitude,
          longitude: chart.birth_longitude,
          houseSystem: chart.house_system,
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
router.get('/:token/stats', authenticate, asyncHandler(async (req, res) => {
  const { token } = req.params;

  const stats = await chartSharingService.getShareStats(token);

  if (!stats) {
    res.status(404).json({
      success: false,
      error: 'Share link not found',
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: { stats },
  });
}));

export { router };
