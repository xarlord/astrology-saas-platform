/**
 * User Controller
 */

import { Request, Response } from 'express';
import { AppError } from '../../middleware/errorHandler';
import { UserModel } from '../models';
import { sanitizeUser } from '../../utils/helpers';

/**
 * Get current user
 */
export async function getCurrentUser(req: Request, res: Response): Promise<void> {
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
 * Update current user
 */
export async function updateCurrentUser(req: Request, res: Response): Promise<void> {
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
 * Get user's charts
 */
export async function getUserCharts(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  const charts = await UserModel.getCharts(userId, limit, offset);

  res.status(200).json({
    success: true,
    data: { charts },
  });
}

/**
 * Get user preferences
 */
export async function getUserPreferences(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;

  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    success: true,
    data: { preferences: user.preferences },
  });
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const preferences = req.body;

  const user = await UserModel.updatePreferences(userId, preferences);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    success: true,
    data: { preferences: user.preferences },
  });
}

/**
 * Delete user account
 */
export async function deleteAccount(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;

  // Soft delete user
  await UserModel.softDelete(userId);

  res.status(200).json({
    success: true,
    message: 'Account deleted successfully',
  });
}
