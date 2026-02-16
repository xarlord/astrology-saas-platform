/**
 * Authentication Controller
 */

import { Request, Response } from 'express';
import { AppError } from '../middleware/errorHandler';
import { UserModel } from '../models';
import { generateToken, generateRefreshToken } from '../middleware/auth';
import { hashPassword, comparePassword, isValidEmail, validatePassword, generateToken as randomToken, sanitizeUser } from '../utils/helpers';
import { asyncHandler } from '../middleware/errorHandler';

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
  const tokenPayload = { userId: user.id, email: user.email };
  const accessToken = generateToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  res.status(201).json({
    success: true,
    data: {
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
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
  const tokenPayload = { userId: user.id, email: user.email };
  const accessToken = generateToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  res.status(200).json({
    success: true,
    data: {
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
    },
  });
}

/**
 * Get current user profile
 */
export async function getProfile(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;

  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    success: true,
    data: { user: sanitizeUser(user) },
  });
}

/**
 * Update user profile
 */
export async function updateProfile(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
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
    data: { user: sanitizeUser(user) },
  });
}

/**
 * Update user preferences
 */
export async function updatePreferences(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const preferences = req.body;

  const user = await UserModel.updatePreferences(userId, preferences);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    success: true,
    data: { user: sanitizeUser(user) },
  });
}

/**
 * Logout user
 * Note: In a production app, you would invalidate the refresh token
 */
export async function logout(req: Request, res: Response): Promise<void> {
  // TODO: Invalidate refresh token in database
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
}

/**
 * Refresh access token
 */
export async function refreshToken(req: Request, res: Response): Promise<void> {
  // TODO: Verify refresh token from database
  // For now, just generate a new access token
  const userId = req.user!.id;
  const email = req.user!.email;

  const tokenPayload = { userId, email };
  const accessToken = generateToken(tokenPayload);

  res.status(200).json({
    success: true,
    data: { accessToken },
  });
}
