/**
 * Authentication Controller
 */

import { Request, Response } from 'express';
import { AppError } from '../../../utils/appError';
import db from '../../../db';
import UserModel from '../../users/models/user.model';
import { generateToken, generateRefreshToken, AuthenticatedRequest } from '../../../middleware/auth';
import { hashPassword, comparePassword, sanitizeUser } from '../../../utils/helpers';
import * as RefreshTokenModel from '../models/refreshToken.model';
import * as PasswordResetService from '../services/passwordReset.service';
import { sendWelcomeEmail } from '../../../services/email.service';

/**
 * Register new user
 */
export async function register(req: Request, res: Response): Promise<void> {
  const { name, email, password } = req.body;

  // Check if user already exists
  const existingUser = await UserModel.findByEmail(email);
  if (existingUser) {
    throw new AppError('User with this email already exists', 409);
  }

  // Hash password
  const password_hash = await hashPassword(password);

  // Create user
  const user = await UserModel.create({
    name,
    email,
    password_hash,
  });

  // Generate tokens
  const tokenPayload = { id: user.id, email: user.email };
  const accessToken = generateToken(tokenPayload);
  const refreshTokenValue = generateRefreshToken(tokenPayload);

  // Store refresh token in database
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  await RefreshTokenModel.createRefreshToken({
    user_id: user.id,
    token: refreshTokenValue,
    expires_at: expiresAt,
    user_agent: req.get('user-agent'),
    ip_address: req.ip,
  });

  // Send welcome email (non-blocking)
  sendWelcomeEmail(user.email, user.name);

  res.status(201).json({
    success: true,
    data: {
      user: sanitizeUser(user as unknown as Record<string, unknown>),
      accessToken,
      refreshToken: refreshTokenValue,
    },
  });
}

/**
 * Login user
 */
export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  // Find user by email
  const user = await UserModel.findByEmail(email);
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  // Check password
  const isPasswordValid = await comparePassword(password, user.password_hash);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  // Generate tokens
  const tokenPayload = { id: user.id, email: user.email };
  const accessToken = generateToken(tokenPayload);
  const refreshTokenValue = generateRefreshToken(tokenPayload);

  // Store refresh token in database
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  await RefreshTokenModel.createRefreshToken({
    user_id: user.id,
    token: refreshTokenValue,
    expires_at: expiresAt,
    user_agent: req.get('user-agent'),
    ip_address: req.ip,
  });

  res.status(200).json({
    success: true,
    data: {
      user: sanitizeUser(user as unknown as Record<string, unknown>),
      accessToken,
      refreshToken: refreshTokenValue,
    },
  });
}

/**
 * Get current user profile
 */
export async function getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Unauthorized', 401);
  const userId = req.user.id;

  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    success: true,
    data: { user: sanitizeUser(user as unknown as Record<string, unknown>) },
  });
}

/**
 * Update user profile
 */
export async function updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Unauthorized', 401);
  const userId = req.user.id;
  const { name, avatar_url, timezone } = req.body;

  const user = await UserModel.update(userId, {
    name,
    avatar_url,
    timezone,
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    success: true,
    data: { user: sanitizeUser(user as unknown as Record<string, unknown>) },
  });
}

/**
 * Update user preferences
 */
export async function updatePreferences(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) throw new AppError('Unauthorized', 401);
  const userId = req.user.id;
  const preferences = req.body;

  const user = await UserModel.updatePreferences(userId, preferences);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    success: true,
    data: { user: sanitizeUser(user as unknown as Record<string, unknown>) },
  });
}

/**
 * Logout user
 * Revokes the refresh token to prevent further use
 */
export async function logout(req: Request, res: Response): Promise<void> {
  // Get refresh token from request body or header
  const refreshToken = req.body.refreshToken || req.get('X-Refresh-Token');

  if (refreshToken) {
    // Revoke the refresh token in database
    await RefreshTokenModel.revokeRefreshToken(refreshToken);
  }

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
}

/**
 * Refresh access token
 * Verifies the refresh token from database and generates new access token
 * Implements token rotation by issuing a new refresh token
 */
export async function refreshToken(req: Request, res: Response): Promise<void> {
  const { refreshToken: oldRefreshToken } = req.body;

  if (!oldRefreshToken) {
    throw new AppError('Refresh token is required', 400);
  }

  // Verify refresh token from database
  const tokenRecord = await RefreshTokenModel.findRefreshToken(oldRefreshToken);

  if (!tokenRecord) {
    throw new AppError('Invalid refresh token', 401);
  }

  // Check if token is revoked
  if (tokenRecord.revoked) {
    throw new AppError('Refresh token has been revoked', 401);
  }

  // Check if token is expired
  if (new Date() > tokenRecord.expires_at) {
    throw new AppError('Refresh token has expired', 401);
  }

  // Get user
  const user = await UserModel.findById(tokenRecord.user_id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Generate new tokens
  const tokenPayload = { id: user.id, email: user.email };
  const newAccessToken = generateToken(tokenPayload);
  const newRefreshToken = generateRefreshToken(tokenPayload);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  // Token rotation in a transaction: revoke old + create new atomically.
  // Prevents race condition where two concurrent refresh requests could both succeed.
  await db.transaction(async (trx) => {
    // Revoke old token first
    const revoked = await trx('refresh_tokens')
      .where({ token: oldRefreshToken })
      .update({ revoked: true, revoked_at: new Date() });

    if (revoked === 0) {
      throw new AppError('Refresh token has been revoked', 401);
    }

    // Create new refresh token
    await trx('refresh_tokens').insert({
      user_id: user.id,
      token: newRefreshToken,
      expires_at: expiresAt,
      user_agent: req.get('user-agent') || null,
      ip_address: req.ip || null,
    });
  });

  res.status(200).json({
    success: true,
    data: {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    },
  });
}

/**
 * Forgot password — request a reset link
 * Always returns success to prevent email enumeration
 */
export async function forgotPassword(req: Request, res: Response): Promise<void> {
  const { email } = req.body;

  await PasswordResetService.requestPasswordReset(email);

  res.status(200).json({
    success: true,
    message: 'If an account with that email exists, a reset link has been sent.',
  });
}

/**
 * Reset password using a valid token
 */
export async function resetPassword(req: Request, res: Response): Promise<void> {
  const { token, password } = req.body;

  await PasswordResetService.resetPassword(token, password);

  res.status(200).json({
    success: true,
    message: 'Password has been reset successfully.',
  });
}
