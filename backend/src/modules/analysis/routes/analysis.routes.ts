/**
 * Analysis Routes
 */

import { Router } from 'express';
import { authenticate } from '../../../middleware/auth';
import { asyncHandler } from '../../../middleware/errorHandler';
import * as AnalysisController from '../controllers/analysis.controller';

const router = Router();

// All analysis routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/analysis/:chartId
 * @desc    Get personality analysis for a chart
 * @access  Private
 */
router.get('/:chartId', asyncHandler(async (req, res) => {
  await AnalysisController.getPersonalityAnalysis(req, res);
}));

/**
 * @route   GET /api/analysis/:chartId/aspects
 * @desc    Get aspect analysis for a chart
 * @access  Private
 */
router.get('/:chartId/aspects', asyncHandler(async (req, res) => {
  await AnalysisController.getAspectAnalysis(req, res);
}));

/**
 * @route   GET /api/analysis/:chartId/patterns
 * @desc    Get aspect patterns for a chart
 * @access  Private
 */
router.get('/:chartId/patterns', asyncHandler(async (req, res) => {
  await AnalysisController.getAspectPatterns(req, res);
}));

/**
 * @route   GET /api/analysis/:chartId/planets
 * @desc    Get planetary positions analysis
 * @access  Private
 */
router.get('/:chartId/planets', asyncHandler(async (req, res) => {
  await AnalysisController.getPlanetsInSigns(req, res);
}));

/**
 * @route   GET /api/analysis/:chartId/houses
 * @desc    Get houses analysis
 * @access  Private
 */
router.get('/:chartId/houses', asyncHandler(async (req, res) => {
  await AnalysisController.getHousesAnalysis(req, res);
}));

export { router };
