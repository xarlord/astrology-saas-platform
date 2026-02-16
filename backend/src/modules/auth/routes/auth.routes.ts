/**
 * Authentication Routes
 */

import { Router } from 'express';
import { authenticate } from '../../../middleware/auth';
import { asyncHandler } from '../../../middleware/errorHandler';
import { validateBody } from '../../../utils/validators';
import { registerSchema, loginSchema } from '../../../utils/validators';
import * as AuthController from '../controllers/auth.controller';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', validateBody(registerSchema), asyncHandler(async (req, res) => {
  await AuthController.register(req, res);
}));

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', validateBody(loginSchema), asyncHandler(async (req, res) => {
  await AuthController.login(req, res);
}));

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', authenticate, asyncHandler(async (req, res) => {
  await AuthController.logout(req, res);
}));

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticate, asyncHandler(async (req, res) => {
  await AuthController.getProfile(req, res);
}));

/**
 * @route   PUT /api/auth/me
 * @desc    Update current user profile
 * @access  Private
 */
router.put('/me', authenticate, asyncHandler(async (req, res) => {
  await AuthController.updateProfile(req, res);
}));

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', authenticate, asyncHandler(async (req, res) => {
  await AuthController.refreshToken(req, res);
}));

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post('/forgot-password', asyncHandler(async (req, res) => {
  // TODO: Implement forgot password flow
  res.status(501).json({
    success: false,
    error: {
      message: 'Password reset not implemented yet',
      statusCode: 501,
    },
  });
}));

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post('/reset-password', asyncHandler(async (req, res) => {
  // TODO: Implement reset password flow
  res.status(501).json({
    success: false,
    error: {
      message: 'Password reset not implemented yet',
      statusCode: 501,
    },
  });
}));

export const router = Router();;
