/**
 * Admin Authorization Middleware
 * Checks if the authenticated user has admin privileges based on email whitelist.
 */

import { Response, NextFunction, RequestHandler } from 'express';
import { AuthenticatedRequest, authenticate } from './auth';
import { AppError } from '../utils/appError';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

/**
 * Admin check — must be used after authenticate middleware.
 */
const adminCheck = (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
  if (!ADMIN_EMAILS.includes(req.user.email.toLowerCase())) {
    next(new AppError('Admin access required', 403));
    return;
  }
  next();
};

/**
 * Composed middleware: authenticate + admin check.
 * Use on routes that require admin access.
 */
export const requireAdmin: RequestHandler[] = [authenticate, adminCheck as unknown as RequestHandler];
