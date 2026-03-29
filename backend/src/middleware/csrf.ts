/**
 * CSRF Protection Middleware
 *
 * Implements Cross-Site Request Forgery protection using csrf-csrf package.
 * This protects against unauthorized commands from a trusted user.
 */

import { Request, Response, NextFunction } from 'express';
import { doubleCsrf } from 'csrf-csrf';
import { logger } from '../utils/logger';

// Generate a session identifier from the request
const getSessionIdentifier = (req: Request): string => {
  // Use user ID if authenticated, otherwise use IP + User-Agent
  const userId = (req as { user?: { id?: string } }).user?.id;
  if (userId) {
    return `user:${userId}`;
  }

  // Fallback to IP-based identifier
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || '';
  return `session:${ip}:${userAgent.slice(0, 50)}`;
};

// CSRF Configuration using csrf-csrf
const {
  generateCsrfToken,
  validateRequest,
  doubleCsrfProtection,
} = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET || 'csrf-secret-change-in-production-min-32-chars',
  getSessionIdentifier,
  cookieName: 'x-csrf-token',
  cookieOptions: {
    sameSite: 'strict',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  },
  size: 64,
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
  errorConfig: {
    statusCode: 403,
    message: 'Invalid CSRF token',
    code: 'CSRF_TOKEN_INVALID',
  },
});

/**
 * Endpoint handler to get CSRF token
 * Call this from the frontend to get a fresh token
 */
export const getCsrfToken = (req: Request, res: Response): void => {
  try {
    const token = generateCsrfToken(req, res);
    res.json({
      success: true,
      data: {
        token,
      },
    });
  } catch (error) {
    logger.error('Error generating CSRF token:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate CSRF token',
    });
  }
};

/**
 * Export the standard CSRF protection middleware
 */
export { doubleCsrfProtection as csrfProtection };

/**
 * Custom CSRF middleware with better logging
 */
export const csrfMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Skip CSRF in test environment (unless explicitly testing CSRF)
  if (process.env.NODE_ENV === 'test' && !process.env.TEST_CSRF) {
    next();
    return;
  }

  // Skip for ignored methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    next();
    return;
  }

  try {
    const isValid = validateRequest(req);
    if (!isValid) {
      logger.warn('CSRF token validation failed:', {
        path: req.path,
        method: req.method,
        ip: req.ip,
      });

      res.status(403).json({
        success: false,
        error: 'Invalid CSRF token',
        code: 'CSRF_TOKEN_INVALID',
      });
      return;
    }
    next();
  } catch (error) {
    logger.error('CSRF validation error:', error);
    res.status(403).json({
      success: false,
      error: 'CSRF validation failed',
      code: 'CSRF_VALIDATION_ERROR',
    });
  }
};

/**
 * Attach CSRF token to request for use in views
 */
export const attachCsrfToken = (req: Request, res: Response, next: NextFunction): void => {
  // Add csrfToken method to request for use in views
  req.csrfToken = () => generateCsrfToken(req, res);
  next();
};

export default {
  csrfProtection: doubleCsrfProtection,
  csrfMiddleware,
  getCsrfToken,
  attachCsrfToken,
  generateCsrfToken,
};
