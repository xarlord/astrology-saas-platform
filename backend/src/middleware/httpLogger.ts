/**
 * HTTP Request Logging Middleware
 * Comprehensive HTTP request/response logging
 */

import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger, securityLogger, performanceLogger } from '../utils/logger';

/**
 * Extended Request interface with logging metadata
 */
export interface LoggedRequest extends Request {
  id: string;
  startTime: number;
  userId?: string;
}

/**
 * HTTP Request Logger Middleware
 * Logs all HTTP requests with comprehensive metadata
 */
export const httpLogger = (req: LoggedRequest, res: Response, next: NextFunction): void => {
  // Generate unique request ID
  req.id = (req.headers['x-request-id'] as string) || uuidv4();

  // Add request ID to response headers
  res.setHeader('X-Request-ID', req.id);

  // Record start time
  req.startTime = Date.now();

  // Extract user ID if authenticated
  if ((req as any).user?.id) {
    req.userId = (req as any).user.id;
  }

  // Log incoming request
  logger.http('Incoming request', {
    requestId: req.id,
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    ...(req.userId && { userId: req.userId }),
  });

  // Security logging for sensitive endpoints
  if (req.path.includes('/auth') || req.path.includes('/users') || req.path.includes('/admin')) {
    securityLogger.info('Sensitive access attempt', {
      requestId: req.id,
      method: req.method,
      path: req.path,
      ...(req.userId && { userId: req.userId }),
      ip: req.ip,
    });
  }

  // Capture response
  const originalJson = res.json;
  res.json = function (body) {
    // Log response
    const responseTime = Date.now() - req.startTime;

    logger.http('Request completed', {
      requestId: req.id,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      ...(req.userId && { userId: req.userId }),
    });

    // Performance logging for slow requests
    if (responseTime > 1000) {
      performanceLogger.warn('Slow request detected', {
        requestId: req.id,
        method: req.method,
        path: req.path,
        responseTime: `${responseTime}ms`,
        ...(req.userId && { userId: req.userId }),
      });
    }

    return originalJson.call(this, body);
  };

  next();
};

/**
 * Request Timing Middleware
 * Adds timing information to requests
 */
export const requestTimer = (req: LoggedRequest, res: Response, next: NextFunction): void => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;

    // Add performance header
    res.setHeader('X-Response-Time', `${duration}ms`);

    // Log slow requests (> 1 second)
    if (duration > 1000) {
      logger.warn('Slow request', {
        requestId: req.id,
        method: req.method,
        path: req.path,
        duration: `${duration}ms`,
      });
    }
  });

  next();
};

/**
 * Error Logging Middleware
 * Logs errors with full context
 */
export const errorLogger = (err: Error, req: LoggedRequest, res: Response, next: NextFunction): void => {
  logger.error('Request error', {
    requestId: req.id,
    method: req.method,
    path: req.path,
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
    },
    ...(req.userId && { userId: req.userId }),
  });

  next(err);
};

/**
 * Security Event Logger
 * Logs security-relevant events
 */
export const logSecurityEvent = (
  eventType: 'auth_success' | 'auth_failure' | 'access_denied' | 'suspicious_activity',
  req: LoggedRequest,
  details?: Record<string, unknown>
): void => {
  securityLogger.info('Security event', {
    eventType,
    requestId: req.id,
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    ...(req.userId && { userId: req.userId }),
    ...(details && { details }),
  });
};

/**
 * Authentication Event Logger
 */
export const logAuthEvent = (
  action: 'login' | 'logout' | 'register' | 'password_change' | 'token_refresh',
  userId: string,
  success: boolean,
  details?: Record<string, unknown>
): void => {
  const level = success ? 'info' : 'warn';

  securityLogger[level]('Authentication event', {
    action,
    userId,
    success,
    ...(details && { details }),
  });
};
