/**
 * User Routes
 */

import { Router } from 'express';
import { authenticate, AuthenticatedRequest } from '../../../middleware/auth';
import { asyncHandler } from '../../../middleware/errorHandler';
import * as UserController from '../controllers/user.controller';

const router = Router();

// All user routes require authentication
router.use(authenticate);

/**
 * @openapi
 * /api/v1/users/me:
 *   get:
 *     tags: [Users]
 *     summary: Get current user profile
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: User profile
 *       401:
 *         description: Unauthorized
 */
/**
 * @route   GET /api/users/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', asyncHandler(async (req, res) => {
  await UserController.getCurrentUser(req as AuthenticatedRequest, res);
}));

/**
 * @openapi
 * /api/v1/users/me:
 *   put:
 *     tags: [Users]
 *     summary: Update current user profile
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Updated user profile
 *       401:
 *         description: Unauthorized
 */
/**
 * @route   PUT /api/users/me
 * @desc    Update current user profile
 * @access  Private
 */
router.put('/me', asyncHandler(async (req, res) => {
  await UserController.updateCurrentUser(req as AuthenticatedRequest, res);
}));

/**
 * @openapi
 * /api/v1/users/me/charts:
 *   get:
 *     tags: [Users]
 *     summary: Get user's charts
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: List of user charts
 *       401:
 *         description: Unauthorized
 */
/**
 * @route   GET /api/users/me/charts
 * @desc    Get all charts for current user
 * @access  Private
 */
router.get('/me/charts', asyncHandler(async (req, res) => {
  await UserController.getUserCharts(req as AuthenticatedRequest, res);
}));

/**
 * @openapi
 * /api/v1/users/me/preferences:
 *   get:
 *     tags: [Users]
 *     summary: Get user preferences
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: User preferences
 *       401:
 *         description: Unauthorized
 */
/**
 * @route   GET /api/users/me/preferences
 * @desc    Get user preferences
 * @access  Private
 */
router.get('/me/preferences', asyncHandler(async (req, res) => {
  await UserController.getUserPreferences(req as AuthenticatedRequest, res);
}));

/**
 * @openapi
 * /api/v1/users/me/preferences:
 *   put:
 *     tags: [Users]
 *     summary: Update preferences
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Updated preferences
 *       401:
 *         description: Unauthorized
 */
/**
 * @route   PUT /api/users/me/preferences
 * @desc    Update user preferences
 * @access  Private
 */
router.put('/me/preferences', asyncHandler(async (req, res) => {
  await UserController.updateUserPreferences(req as AuthenticatedRequest, res);
}));

/**
 * @openapi
 * /api/v1/users/me/email-preferences:
 *   get:
 *     tags: [Users]
 *     summary: Get email preferences
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Email notification preferences
 *       401:
 *         description: Unauthorized
 */
/**
 * @route   GET /api/users/me/email-preferences
 * @desc    Get email notification preferences
 * @access  Private
 */
router.get('/me/email-preferences', asyncHandler(async (req, res) => {
  await UserController.getEmailPreferences(req as AuthenticatedRequest, res);
}));

/**
 * @openapi
 * /api/v1/users/me/email-preferences:
 *   put:
 *     tags: [Users]
 *     summary: Update email preferences
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Updated email preferences
 *       401:
 *         description: Unauthorized
 */
/**
 * @route   PUT /api/users/me/email-preferences
 * @desc    Update email notification preferences
 * @access  Private
 */
router.put('/me/email-preferences', asyncHandler(async (req, res) => {
  await UserController.updateEmailPreferences(req as AuthenticatedRequest, res);
}));

/**
 * @openapi
 * /api/v1/users/me:
 *   delete:
 *     tags: [Users]
 *     summary: Delete account
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Account deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
/**
 * @route   DELETE /api/users/me
 * @desc    Delete user account
 * @access  Private
 */
router.delete('/me', asyncHandler(async (req, res) => {
  await UserController.deleteAccount(req as AuthenticatedRequest, res);
}));

export { router };
