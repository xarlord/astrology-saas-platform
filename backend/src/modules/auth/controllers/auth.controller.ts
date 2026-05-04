/**
 * Authentication Controller
 */

import { Request, Response } from 'express';
import { AppError } from '../../../utils/appError';
import db from '../../../db';
import UserModel from '../../users/models/user.model';
import {
  generateToken,
  generateRefreshToken,
  AuthenticatedRequest,
} from '../../../middleware/auth';
import { hashPassword, comparePassword, sanitizeUser } from '../../../utils/helpers';
import * as RefreshTokenModel from '../models/refreshToken.model';
import * as PasswordResetService from '../services/passwordReset.service';
import { sendWelcomeEmail } from '../../../services/email.service';
import { logAuthFailure } from '../../../utils/securityLogger';

/**
 * Register new user
 */
export async function register(req: Request, res: Response): Promise<void> {
  // Use validated data if available (from validation middleware), otherwise fall back to body
  const { name, email, password } = (req as any).validated || req.body;

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

  // Set refresh token as httpOnly cookie
  res.cookie('refreshToken', refreshTokenValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    path: '/api/v1/auth/refresh', // Restrict to refresh endpoint
  });

  res.status(201).json({
    success: true,
    data: {
      user: sanitizeUser(user as unknown as Record<string, unknown>),
      accessToken,
    },
  });
}

/**
 * Login user
 */
export async function login(req: Request, res: Response): Promise<void> {
  // Use validated data if available (from validation middleware), otherwise fall back to body
  const { email, password } = (req as any).validated || req.body;

  // Find user by email
  const user = await UserModel.findByEmail(email);
  if (!user) {
    logAuthFailure('User not found', req as Request, { email });
    throw new AppError('Invalid email or password', 401);
  }

  // Check password
  const isPasswordValid = await comparePassword(password, user.password_hash);
  if (!isPasswordValid) {
    logAuthFailure('Invalid password', req as Request, { email, userId: user.id });
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

  // Set refresh token as httpOnly cookie
  res.cookie('refreshToken', refreshTokenValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    path: '/api/v1/auth/refresh', // Restrict to refresh endpoint
  });

  res.status(200).json({
    success: true,
    data: {
      user: sanitizeUser(user as unknown as Record<string, unknown>),
      accessToken,
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
  const { name, avatar_url, timezone } = (req as any).validated || req.body;

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
  const preferences = (req as any).validated || req.body;

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
  // Get refresh token from cookie
  const refreshToken = req.cookies?.refreshToken;

  if (refreshToken) {
    // Revoke the refresh token in database
    await RefreshTokenModel.revokeRefreshToken(refreshToken);
  }

  // Clear the httpOnly cookie
  res.clearCookie('refreshToken', {
    path: '/api/v1/auth/refresh',
  });

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
  // Get refresh token from cookie
  const oldRefreshToken = req.cookies?.refreshToken;

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

  // Set new refresh token as httpOnly cookie
  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    path: '/api/v1/auth/refresh', // Restrict to refresh endpoint
  });

  res.status(200).json({
    success: true,
    data: {
      accessToken: newAccessToken,
    },
  });
}

/**
 * Forgot password — request a reset link
 * Always returns success to prevent email enumeration
 */
export async function forgotPassword(req: Request, res: Response): Promise<void> {
  const { email } = (req as any).validated || req.body;

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
  const { token, password } = (req as any).validated || req.body;

  await PasswordResetService.resetPassword(token, password);

  res.status(200).json({
    success: true,
    message: 'Password has been reset successfully.',
  });
}
