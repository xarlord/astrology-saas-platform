/**
 * Authentication Routes
 */

import { Router } from 'express';
import { authenticate, AuthenticatedRequest } from '../../../middleware/auth';
import { asyncHandler } from '../../../middleware/errorHandler';
import { validateBody } from '../../../utils/validators';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../../../utils/validators';
import { authRateLimiter, passwordResetRateLimiter } from '../../../middleware/rateLimiter';
import * as AuthController from '../controllers/auth.controller';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', authRateLimiter, validateBody(registerSchema), asyncHandler(async (req, res) => {
  await AuthController.register(req, res);
}));

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', authRateLimiter, validateBody(loginSchema), asyncHandler(async (req, res) => {
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
  await AuthController.getProfile(req as AuthenticatedRequest, res);
}));

/**
 * @route   PUT /api/auth/me
 * @desc    Update current user profile
 * @access  Private
 */
router.put('/me', authenticate, asyncHandler(async (req, res) => {
  await AuthController.updateProfile(req as AuthenticatedRequest, res);
}));

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', authRateLimiter, asyncHandler(async (req, res) => {
  await AuthController.refreshToken(req, res);
}));

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post('/forgot-password', passwordResetRateLimiter, validateBody(forgotPasswordSchema), asyncHandler(async (req, res) => {
  await AuthController.forgotPassword(req, res);
}));

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post('/reset-password', validateBody(resetPasswordSchema), asyncHandler(async (req, res) => {
  await AuthController.resetPassword(req, res);
}));

export { router };
