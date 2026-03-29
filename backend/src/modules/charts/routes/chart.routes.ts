/**
 * Chart Routes
 */

import { Router } from 'express';
import { authenticate, AuthenticatedRequest } from '../../../middleware/auth';
import { asyncHandler } from '../../../middleware/errorHandler';
import * as ChartController from '../controllers/chart.controller';

const router = Router();

// All chart routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/charts
 * @desc    Create a new chart
 * @access  Private
 */
router.post('/', asyncHandler(async (req, res) => {
  await ChartController.createChart(req as AuthenticatedRequest, res);
}));

/**
 * @route   GET /api/charts
 * @desc    Get all user's charts
 * @access  Private
 */
router.get('/', asyncHandler(async (req, res) => {
  await ChartController.getUserCharts(req as AuthenticatedRequest, res);
}));

/**
 * @route   GET /api/charts/:id
 * @desc    Get specific chart
 * @access  Private
 */
router.get('/:id', asyncHandler(async (req, res) => {
  await ChartController.getChart(req as AuthenticatedRequest, res);
}));

/**
 * @route   PUT /api/charts/:id
 * @desc    Update chart
 * @access  Private
 */
router.put('/:id', asyncHandler(async (req, res) => {
  await ChartController.updateChart(req as AuthenticatedRequest, res);
}));

/**
 * @route   DELETE /api/charts/:id
 * @desc    Delete chart
 * @access  Private
 */
router.delete('/:id', asyncHandler(async (req, res) => {
  await ChartController.deleteChart(req as AuthenticatedRequest, res);
}));

/**
 * @route   POST /api/charts/:id/calculate
 * @desc    Calculate chart (if not cached)
 * @access  Private
 */
router.post('/:id/calculate', asyncHandler(async (req, res) => {
  await ChartController.calculateChart(req as AuthenticatedRequest, res);
}));

export { router };
