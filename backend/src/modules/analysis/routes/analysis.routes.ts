/**
 * Analysis Routes
 */

import { Router } from 'express';
import { authenticate, AuthenticatedRequest } from '../../../middleware/auth';
import { asyncHandler } from '../../../middleware/errorHandler';
import * as AnalysisController from '../controllers/analysis.controller';

const router = Router();

// All analysis routes require authentication
router.use(authenticate);

/**
 * @openapi
 * /api/v1/analysis/{chartId}:
 *   get:
 *     tags: [Analysis]
 *     summary: Get personality analysis
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: chartId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Personality analysis
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Chart not found
 */
/**
 * @route   GET /api/analysis/:chartId
 * @desc    Get personality analysis for a chart
 * @access  Private
 */
router.get('/:chartId', asyncHandler(async (req, res) => {
  await AnalysisController.getPersonalityAnalysis(req as AuthenticatedRequest, res);
}));

/**
 * @openapi
 * /api/v1/analysis/{chartId}/aspects:
 *   get:
 *     tags: [Analysis]
 *     summary: Get aspect analysis
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: chartId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Aspect analysis
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Chart not found
 */
/**
 * @route   GET /api/analysis/:chartId/aspects
 * @desc    Get aspect analysis for a chart
 * @access  Private
 */
router.get('/:chartId/aspects', asyncHandler(async (req, res) => {
  await AnalysisController.getAspectAnalysis(req as AuthenticatedRequest, res);
}));

/**
 * @openapi
 * /api/v1/analysis/{chartId}/patterns:
 *   get:
 *     tags: [Analysis]
 *     summary: Get aspect patterns
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: chartId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Aspect patterns
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Chart not found
 */
/**
 * @route   GET /api/analysis/:chartId/patterns
 * @desc    Get aspect patterns for a chart
 * @access  Private
 */
router.get('/:chartId/patterns', asyncHandler(async (req, res) => {
  await AnalysisController.getAspectPatterns(req as AuthenticatedRequest, res);
}));

/**
 * @openapi
 * /api/v1/analysis/{chartId}/planets:
 *   get:
 *     tags: [Analysis]
 *     summary: Get planetary positions
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: chartId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Planetary positions analysis
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Chart not found
 */
/**
 * @route   GET /api/analysis/:chartId/planets
 * @desc    Get planetary positions analysis
 * @access  Private
 */
router.get('/:chartId/planets', asyncHandler(async (req, res) => {
  await AnalysisController.getPlanetsInSigns(req as AuthenticatedRequest, res);
}));

/**
 * @openapi
 * /api/v1/analysis/{chartId}/houses:
 *   get:
 *     tags: [Analysis]
 *     summary: Get houses analysis
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: chartId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Houses analysis
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Chart not found
 */
/**
 * @route   GET /api/analysis/:chartId/houses
 * @desc    Get houses analysis
 * @access  Private
 */
router.get('/:chartId/houses', asyncHandler(async (req, res) => {
  await AnalysisController.getHousesAnalysis(req as AuthenticatedRequest, res);
}));

export { router };
