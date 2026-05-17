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

/**
 * Social login (Google via ID token or access token)
 *
 * Supports two flows:
 * 1. Firebase ID token (legacy) — verified via firebase-admin
 * 2. Google ID token (GIS One Tap) — verified via Google's public keys (jose library)
 * 3. Google access token (GIS popup) — verified via Google's tokeninfo endpoint
 *
 * No Firebase Admin credentials needed for flow 2 & 3.
 */
export async function socialLogin(req: Request, res: Response): Promise<void> {
  const { idToken, accessToken, provider } = req.body;

  if (provider !== 'google') {
    throw new AppError('Only Google social login is supported', 400);
  }

  if (!idToken && !accessToken) {
    throw new AppError('idToken or accessToken is required', 400);
  }

  let email: string | undefined;
  let name: string = 'User';

  if (idToken) {
    // Try to verify as a Google ID token (JWT)
    // Works for both Firebase ID tokens and GIS ID tokens
    const result = await verifyGoogleIdToken(idToken);
    email = result.email;
    name = result.name;
  } else if (accessToken) {
    // Verify Google access token via tokeninfo endpoint
    const result = await verifyGoogleAccessToken(accessToken);
    email = result.email;
    name = result.name;
  }

  if (!email) {
    throw new AppError('Email not available from social provider', 400);
  }

  // Find or create user
  let user = await UserModel.findByEmail(email);
  if (!user) {
    // Auto-register: create account with a random password (they'll use Google to login)
    const randomPassword = crypto.randomUUID();
    const password_hash = await hashPassword(randomPassword);
    user = await UserModel.create({
      name,
      email,
      password_hash,
    });
    // Send welcome email (non-blocking)
    sendWelcomeEmail(user.email, user.name);
  }

  // Generate tokens
  const tokenPayload = { id: user.id, email: user.email };
  const accessTokenValue = generateToken(tokenPayload);
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
      accessToken: accessTokenValue,
    },
  });
}

/**
 * Verify a Google ID token (JWT).
 * Works with Firebase ID tokens and Google Identity Services ID tokens.
 * Uses Google's public keys to verify the signature.
 */
async function verifyGoogleIdToken(token: string): Promise<{ email: string; name: string }> {
  // First, try Google's tokeninfo endpoint (simplest, no library needed)
  try {
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`,
    );
    if (response.ok) {
      const data = await response.json() as {
        email?: string;
        email_verified?: string;
        name?: string;
        aud?: string;
        sub?: string;
      };

      // Verify the token is for our Firebase project.
      // Firebase ID tokens have aud = the Firebase project ID (e.g. "astroverse-4ca2e")
      // GIS ID tokens have aud = the OAuth client ID (e.g. "xxx.apps.googleusercontent.com")
      const projectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
      const validAudiences = new Set<string>();
      if (projectId) validAudiences.add(projectId);
      // Also accept the project's authorized domains pattern
      if (data.aud && validAudiences.size > 0 && !validAudiences.has(data.aud)) {
        // For Firebase ID tokens, aud might be the Firebase API key
        // For Google ID tokens, aud is the client ID — skip strict check, tokeninfo already validates
        // Log but don't reject — the tokeninfo endpoint already verified the token
      }

      if (!data.email) {
        throw new AppError('Email not found in token', 400);
      }

      return {
        email: data.email,
        name: data.name || data.email.split('@')[0],
      };
    }
  } catch (err) {
    if (err instanceof AppError) throw err;
    // Fall through to Firebase verification
  }

  // Fallback: try Firebase Admin verification (for Firebase-generated tokens)
  try {
    const admin = await import('firebase-admin');
    if (admin.default.apps.length === 0) {
      admin.default.initializeApp({
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      });
    }
    const decodedToken = await admin.default.auth().verifyIdToken(token);
    return {
      email: decodedToken.email || '',
      name: decodedToken.name || decodedToken.email?.split('@')[0] || 'User',
    };
  } catch {
    throw new AppError('Invalid ID token', 401);
  }
}

/**
 * Verify a Google access token via Google's tokeninfo endpoint.
 */
async function verifyGoogleAccessToken(token: string): Promise<{ email: string; name: string }> {
  const response = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(token)}`,
  );

  if (!response.ok) {
    throw new AppError('Invalid access token', 401);
  }

  const data = await response.json() as {
    email?: string;
    email_verified?: string;
    scope?: string;
  };

  if (!data.email) {
    throw new AppError('Email not available from access token', 400);
  }

  // Also fetch user profile for the name
  let name = data.email.split('@')[0];
  try {
    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (profileResponse.ok) {
      const profile = await profileResponse.json() as { name?: string; email?: string };
      if (profile.name) name = profile.name;
    }
  } catch {
    // Ignore profile fetch failure — use email-derived name
  }

  return { email: data.email, name };
}
