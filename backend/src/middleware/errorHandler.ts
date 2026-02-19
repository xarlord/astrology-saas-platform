/**
 * Enhanced Global Error Handler Middleware
 */

import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { AppError } from '../utils/appError';

// Re-export AppError for convenience
export { AppError } from '../utils/appError';

interface ErrorWithStatusCode extends Error {
  statusCode?: number;
  isOperational?: boolean;
  details?: unknown;
  errorCode?: string;
}

export const errorHandler = (
  err: ErrorWithStatusCode,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Check if error is an AppError
  const isAppError = err instanceof AppError;
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational ?? false;

  // Determine error type for logging
  const errorType = isAppError ? err.constructor.name : 'UnknownError';

  // Log error with context
  logger.error('Error occurred:', {
    errorType,
    message: err.message,
    statusCode,
    errorCode: (err as AppError).errorCode,
    path: req.path,
    method: req.method,
    query: req.query,
    params: req.params,
    isOperational,
    stack: err.stack,
    userId: (req as any).user?.id, // Add user context if available
  });

  // Prepare error response
  const errorResponse: {
    success: false;
    error: {
      message: string;
      statusCode: number;
      errorCode?: string;
      timestamp?: string;
      details?: unknown;
    };
  } = {
    success: false,
    error: {
      message: err.message || 'Internal Server Error',
      statusCode,
      ...(isAppError && {
        errorCode: (err as AppError).errorCode,
        timestamp: (err as AppError).timestamp.toISOString()
      })
    },
  };

  // Include stack trace and details in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.details = {
      stack: err.stack,
      ...(err.details && typeof err.details === 'object' ? { originalDetails: err.details } : {}),
      isOperational,
      errorType
    };
  }

  // Include details for operational errors in production (safe data only)
  if (isOperational && err.details && typeof err.details === 'object') {
    errorResponse.error.details = {
      ...err.details as object
    };
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
};

/**
 * Async Handler Wrapper
 * Wraps async route handlers to catch errors
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await fn(req, res, next);
    } catch (err) {
      // Enhance error with request context
      if (!(err instanceof AppError)) {
        err.message = `Error in ${req.method} ${req.path}: ${err.message}`;
      }
      next(err);
    }
  };
};

/**
 * 404 Not Found Handler
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.method} ${req.path} not found`,
      statusCode: 404,
      availableRoutes: [
        'GET /health',
        'POST /api/v1/auth/register',
        'POST /api/v1/auth/login',
        'GET /api/v1/charts',
        'POST /api/v1/charts',
        'GET /api/v1/calendar',
        // Add more as needed
      ]
    }
  });
};

/**
 * Validation Error Handler
 * Creates a validation error from Joi or other validation schemas
 */
export const createValidationError = (message: string, details?: unknown): AppError => {
  const error = new AppError(message, 422, true, 'VALIDATION_ERROR', details);
  return error;
};

/**
 * Unauthorized Error Handler
 * Creates an unauthorized error
 */
export const createUnauthorizedError = (message?: string): AppError => {
  return new AppError(message || 'Authentication required', 401, true, 'UNAUTHORIZED');
};

/**
 * Forbidden Error Handler
 * Creates a forbidden error
 */
export const createForbiddenError = (message?: string): AppError => {
  return new AppError(message || 'Access forbidden', 403, true, 'FORBIDDEN');
};

/**
 * Not Found Error Handler
 * Creates a not found error
 */
export const createNotFoundError = (resource?: string): AppError => {
  return new AppError(
    resource ? `${resource} not found` : 'Resource not found',
    404,
    true,
    'NOT_FOUND'
  );
};

/**
 * Conflict Error Handler
 * Creates a conflict error
 */
export const createConflictError = (message: string): AppError => {
  return new AppError(message, 409, true, 'CONFLICT');
};
