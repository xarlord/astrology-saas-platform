/**
 * User Routes
 */

import { Router } from 'express';
import { authenticate } from '../../../middleware/auth';
import { asyncHandler } from '../../../middleware/errorHandler';
import * as UserController from '../controllers/user.controller';

const router = Router();

// All user routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/users/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', asyncHandler(async (req, res) => {
  await UserController.getCurrentUser(req, res);
}));

/**
 * @route   PUT /api/users/me
 * @desc    Update current user profile
 * @access  Private
 */
router.put('/me', asyncHandler(async (req, res) => {
  await UserController.updateCurrentUser(req, res);
}));

/**
 * @route   GET /api/users/me/charts
 * @desc    Get all charts for current user
 * @access  Private
 */
router.get('/me/charts', asyncHandler(async (req, res) => {
  await UserController.getUserCharts(req, res);
}));

/**
 * @route   GET /api/users/me/preferences
 * @desc    Get user preferences
 * @access  Private
 */
router.get('/me/preferences', asyncHandler(async (req, res) => {
  await UserController.getUserPreferences(req, res);
}));

/**
 * @route   PUT /api/users/me/preferences
 * @desc    Update user preferences
 * @access  Private
 */
router.put('/me/preferences', asyncHandler(async (req, res) => {
  await UserController.updateUserPreferences(req, res);
}));

/**
 * @route   DELETE /api/users/me
 * @desc    Delete user account
 * @access  Private
 */
router.delete('/me', asyncHandler(async (req, res) => {
  await UserController.deleteAccount(req, res);
}));

export { router };
