/**
 * Global Error Handler Middleware
 */

import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  details?: unknown;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Default to 500 server error
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational || false;

  // Log error
  logger.error('Error occurred:', {
    message: err.message,
    statusCode,
    path: req.path,
    method: req.method,
    isOperational,
    stack: err.stack,
  });

  // Prepare error response
  const errorResponse: {
    success: false;
    error: {
      message: string;
      statusCode: number;
      details?: unknown;
    };
  } = {
    success: false,
    error: {
      message: err.message || 'Internal Server Error',
      statusCode,
    },
  };

  // Include details in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.details = {
      stack: err.stack,
      originalError: err.details,
    };
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
};

export class AppError extends Error implements AppError {
  statusCode: number;
  isOperational: boolean;
  details?: unknown;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    // Maintains proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
