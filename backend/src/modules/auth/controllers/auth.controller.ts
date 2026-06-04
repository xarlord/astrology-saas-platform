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
import { hashPassword, comparePassword, sanitizeUser, validatePassword } from '../../../utils/helpers';
import * as RefreshTokenModel from '../models/refreshToken.model';
import * as PasswordResetService from '../services/passwordReset.service';
import { sendWelcomeEmail } from '../../../services/email.service';
import { logAuthFailure } from '../../../utils/securityLogger';
import logger from '../../../utils/logger';

/**
 * Register new user
 */
export async function register(req: Request, res: Response): Promise<void> {
  const { name, email, password } = (req as any).validated || req.body;

  const existingUser = await UserModel.findByEmail(email);
  if (existingUser) {
    throw new AppError('User with this email already exists', 409);
  }

  const password_hash = await hashPassword(password);

  const user = await UserModel.create({
    name,
    email,
    password_hash,
  });

  const tokenPayload = { id: user.id, email: user.email };
  const accessToken = generateToken(tokenPayload);
  const refreshTokenValue = generateRefreshToken(tokenPayload);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await RefreshTokenModel.createRefreshToken({
    user_id: user.id,
    token: refreshTokenValue,
    expires_at: expiresAt,
    user_agent: req.get('user-agent'),
    ip_address: req.ip,
  });

  sendWelcomeEmail(user.email, user.name);

  res.cookie('refreshToken', refreshTokenValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/v1/auth/refresh',
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
  const { email, password } = (req as any).validated || req.body;

  const user = await UserModel.findByEmail(email);
  if (!user) {
    logAuthFailure('User not found', req as Request, { email });
    throw new AppError('Invalid email or password', 401);
  }

  // Check if account is locked (#226)
  if (UserModel.isAccountLocked(user)) {
    logAuthFailure('Account locked', req as Request, { email, userId: user.id });
    throw new AppError(
      'Account is temporarily locked due to too many failed login attempts. Please try again later.',
      423,
    );
  }

  const isPasswordValid = await comparePassword(password, user.password_hash);
  if (!isPasswordValid) {
    logAuthFailure('Invalid password', req as Request, { email, userId: user.id });

    // Increment failed attempts and potentially lock (#226)
    const updatedUser = await UserModel.incrementFailedLoginAttempts(user.id);
    const attempts = updatedUser?.failed_login_attempts || 1;

    if (attempts >= 5) {
      throw new AppError(
        'Account locked due to too many failed login attempts. Please try again in 30 minutes.',
        423,
      );
    }

    throw new AppError(
      'Invalid email or password.',
      401,
    );
  }

  // Reset failed login attempts on successful login (#226)
  await UserModel.resetLoginAttempts(user.id);

  const tokenPayload = { id: user.id, email: user.email };
  const accessToken = generateToken(tokenPayload);
  const refreshTokenValue = generateRefreshToken(tokenPayload);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await RefreshTokenModel.createRefreshToken({
    user_id: user.id,
    token: refreshTokenValue,
    expires_at: expiresAt,
    user_agent: req.get('user-agent'),
    ip_address: req.ip,
  });

  res.cookie('refreshToken', refreshTokenValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/v1/auth/refresh',
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
 */
export async function logout(req: Request, res: Response): Promise<void> {
  const refreshToken = req.cookies?.refreshToken;

  if (refreshToken) {
    await RefreshTokenModel.revokeRefreshToken(refreshToken);
  }

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
 */
export async function refreshToken(req: Request, res: Response): Promise<void> {
  const oldRefreshToken = req.cookies?.refreshToken;

  if (!oldRefreshToken) {
    throw new AppError('Refresh token is required', 400);
  }

  const tokenRecord = await RefreshTokenModel.findRefreshToken(oldRefreshToken);

  if (!tokenRecord) {
    throw new AppError('Invalid refresh token', 401);
  }

  if (tokenRecord.revoked) {
    // Reuse detection: an already-revoked token was presented.
    // This indicates token theft — revoke ALL tokens for this user.
    logger.warn('Refresh token reuse detected — possible token theft', {
      userId: tokenRecord.user_id,
      tokenId: tokenRecord.id,
    });
    await db('refresh_tokens')
      .where({ user_id: tokenRecord.user_id })
      .update({ revoked: true, revoked_at: new Date() });
    throw new AppError('Refresh token has been revoked', 401);
  }

  if (new Date() > tokenRecord.expires_at) {
    throw new AppError('Refresh token has expired', 401);
  }

  const user = await UserModel.findById(tokenRecord.user_id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const tokenPayload = { id: user.id, email: user.email };
  const newAccessToken = generateToken(tokenPayload);
  const newRefreshToken = generateRefreshToken(tokenPayload);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await db.transaction(async (trx) => {
    const revoked = await trx('refresh_tokens')
      .where({ token: oldRefreshToken })
      .update({ revoked: true, revoked_at: new Date() });

    if (revoked === 0) {
      throw new AppError('Refresh token has been revoked', 401);
    }

    await trx('refresh_tokens').insert({
      user_id: user.id,
      token: newRefreshToken,
      expires_at: expiresAt,
      user_agent: req.get('user-agent') || null,
      ip_address: req.ip || null,
    });
  });

  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/v1/auth/refresh',
  });

  res.status(200).json({
    success: true,
    data: {
      accessToken: newAccessToken,
    },
  });
}

/**
 * Forgot password
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
 * Reset password
 */
export async function resetPassword(req: Request, res: Response): Promise<void> {
  const { token, password } = (req as any).validated || req.body;

  // Validate password strength before resetting
  const validation = validatePassword(password);
  if (!validation.valid) {
    res.status(400).json({
      success: false,
      error: 'Password does not meet requirements',
      details: validation.errors,
    });
    return;
  }

  await PasswordResetService.resetPassword(token, password);

  res.status(200).json({
    success: true,
    message: 'Password has been reset successfully.',
  });
}
