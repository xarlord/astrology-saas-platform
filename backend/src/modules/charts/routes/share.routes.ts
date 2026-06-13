/**
 * Public Share Routes
 * Access shared charts without authentication
 */

import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../../middleware/errorHandler';
import { authenticate, AuthenticatedRequest } from '../../../middleware/auth';
import { AppError } from '../../../utils/appError';
import { validateParams } from '../../../utils/validators';
import { chartSharingService } from '../../shared/services/chartSharing.service';
import { ChartModel } from '../models';
import { NatalChartService } from '../../shared/services/natalChart.service';
import type { HouseSystem } from '../../shared/services/houseCalculation.service';

const natalChartService = new NatalChartService();

const router = Router();

const shareTokenSchema = z.object({
  token: z.string().min(1).max(256),
});

/**
 * @route   POST /api/share/:token
 * @desc    Access shared chart by token with password in body (preferred over GET for password-protected shares)
 * @access  Public
 *
 * @openapi
 * /api/share/{token}:
 *   post:
 *     tags: [Sharing]
 *     summary: Access a shared chart by token (password in body)
 *     security: []
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Shared chart data
 *       401:
 *         description: Password required
 *       404:
 *         description: Share link not found
 */
router.post('/:token', validateParams(shareTokenSchema), asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body ?? {};

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
        }) as unknown as Record<string, unknown>;
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
  const chart = result.chart;
  if (!chart) {
    res.status(404).json({ success: false, error: 'Chart data not available' });
    return;
  }
  res.status(200).json({
    success: true,
    data: {
      chart: {
        name: chart.name,
        type: chart.type,
        birth_date: chart.birth_date,
        birth_time: chart.birth_time,
        birth_place_name: chart.birth_place_name,
        calculated_data: chart.calculated_data,
      },
    },
  });
}));

/**
 * @route   GET /api/share/:token
 * @desc    Access shared chart by token (no password — use POST for password-protected shares)
 * @access  Public (password-protected shares must use POST)
 *
 * @openapi
 * /api/share/{token}:
 *   get:
 *     tags: [Sharing]
 *     summary: Access a shared chart by token
 *     security: []
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Shared chart data (public shares only)
 *       401:
 *         description: Password required — use POST with password in body
 *       404:
 *         description: Share link not found
 */
router.get('/:token', validateParams(shareTokenSchema), asyncHandler(async (req, res) => {
  const { token } = req.params;

  // Validate token format
  if (!chartSharingService.isValidTokenFormat(token)) {
    res.status(400).json({
      success: false,
      error: 'Invalid share link format',
    });
    return;
  }

  // Access the shared chart (no password from query string — security: #340)
  const result = await chartSharingService.accessSharedChart(
    token,
    undefined,
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
        }) as unknown as Record<string, unknown>;
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
  const chart = result.chart;
  if (!chart) {
    res.status(404).json({ success: false, error: 'Chart data not available' });
    return;
  }
  res.status(200).json({
    success: true,
    data: {
      chart: {
        name: chart.name,
        type: chart.type,
        birth_date: chart.birth_date,
        birth_time: chart.birth_time,
        birth_place_name: chart.birth_place_name,
        calculated_data: chart.calculated_data,
      },
    },
  });
}));

/**
 * @route   GET /api/share/:token/stats
 * @desc    Get share link statistics
 * @access  Private (requires authentication — only share owner should view stats)
 *
 * @openapi
 * /api/share/{token}/stats:
 *   get:
 *     tags: [Sharing]
 *     summary: Get share link view statistics
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Share statistics
 *       403:
 *         description: Not the share owner
 *       404:
 *         description: Share link not found
 */
router.get('/:token/stats', validateParams(shareTokenSchema), authenticate, asyncHandler(async (req: AuthenticatedRequest, res) => {
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

/**
 * @route   DELETE /api/share/:token
 * @desc    Revoke (delete) a share link — only the share creator can revoke
 * @access  Private (requires authentication)
 *
 * @openapi
 * /api/share/{token}:
 *   delete:
 *     tags: [Sharing]
 *     summary: Revoke a share link
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Share link revoked
 *       404:
 *         description: Share link not found
 */
router.delete('/:token', validateParams(shareTokenSchema), authenticate, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { token } = req.params;

  const revoked = await chartSharingService.revokeShareLink(token, req.user.id);

  if (!revoked) {
    throw new AppError('Share link not found or you do not have permission to revoke it', 404);
  }

  res.status(200).json({
    success: true,
    data: { revoked: true },
  });
}));

export { router };
