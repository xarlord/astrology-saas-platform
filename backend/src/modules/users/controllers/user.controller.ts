/**
 * User Controller
 */

import { Response } from 'express';
import { AuthenticatedRequest } from '../../../middleware/auth';
import { AppError } from '../../../utils/appError';
import { UserModel } from '../models';
import { sanitizeUser } from '../../../utils/helpers';
import { DEFAULT_EMAIL_PREFS, EmailPreferences } from '../../../services/email.service';

/**
 * Get current user
 */
export async function getCurrentUser(req: AuthenticatedRequest, res: Response): Promise<void> {
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
 * Update current user
 */
export async function updateCurrentUser(req: AuthenticatedRequest, res: Response): Promise<void> {
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
 * Get user's charts
 */
export async function getUserCharts(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user.id;
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
export async function getUserPreferences(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user.id;

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
export async function updateUserPreferences(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user.id;
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
export async function deleteAccount(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user.id;

  // Soft delete user
  await UserModel.softDelete(userId);

  res.status(200).json({
    success: true,
    message: 'Account deleted successfully',
  });
}

/**
 * Get email notification preferences
 */
export async function getEmailPreferences(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user.id;

  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const emailPrefs: EmailPreferences =
    (user.preferences?.emailNotifications as EmailPreferences) ?? { ...DEFAULT_EMAIL_PREFS };

  res.status(200).json({
    success: true,
    data: { emailNotifications: emailPrefs },
  });
}

/**
 * Update email notification preferences
 */
export async function updateEmailPreferences(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user.id;
  const { marketing, transactional } = req.body;

  const emailPrefs: EmailPreferences = {
    marketing: typeof marketing === 'boolean' ? marketing : DEFAULT_EMAIL_PREFS.marketing,
    transactional: typeof transactional === 'boolean' ? transactional : DEFAULT_EMAIL_PREFS.transactional,
  };

  const user = await UserModel.updatePreferences(userId, {
    emailNotifications: emailPrefs,
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    success: true,
    data: { emailNotifications: emailPrefs },
  });
}
