/**
 * Password Confirmation Middleware
 * Requires the user to re-enter their password for sensitive operations.
 * Issue #240.
 */

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';
import { AppError } from '../utils/appError';
import UserModel from '../modules/users/models/user.model';
import { comparePassword } from '../utils/helpers';

/**
 * Middleware that requires password re-entry.
 * Expects `current_password` in the request body.
 * Must be used after `authenticate` middleware.
 *
 * Uses return type assertion to work around Express RequestHandler typing
 * (AuthenticatedRequest.user is required, but Express Request.user is optional).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const requirePasswordConfirmation: any = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { current_password } = req.body;

    if (!current_password) {
      throw new AppError('Current password is required for this action', 400);
    }

    const user = await UserModel.findById(req.user.id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isValid = await comparePassword(current_password, user.password_hash);
    if (!isValid) {
      throw new AppError('Current password is incorrect', 401);
    }

    next();
  } catch (err) {
    next(err);
  }
};
