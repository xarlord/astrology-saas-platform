/**
 * Enhanced Winston Logger Configuration
 * Comprehensive logging system with multiple transports and formats
 */

import winston from 'winston';
import winstonDailyRotateFile from 'winston-daily-rotate-file';
import config from '../config';
import path from 'path';

const { combine, timestamp, printf, colorize, errors, json, metadata } = winston.format;

// Define custom log levels
const customLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Custom log format for development
const devFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
  let msg = `${timestamp as string} [${level}]: ${message}`;

  // Add metadata if present
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }

  // Add stack trace for errors
  if (stack) {
    msg += `\n${stack}`;
  }

  return msg;
});

// Custom log format with request context
const contextFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
  const { requestId, userId, method, path, ...rest } = metadata as any;

  let msg = `${timestamp as string} [${level}]`;

  // Add request context if available
  if (requestId) msg += ` [${requestId}]`;
  if (userId) msg += ` [user:${userId}]`;
  if (method && path) msg += ` [${method} ${path}]`;

  msg += `: ${message}`;

  // Add remaining metadata if present
  if (Object.keys(rest).length > 0) {
    msg += ` ${JSON.stringify(rest)}`;
  }

  // Add stack trace for errors
  if (stack) {
    msg += `\n${stack}`;
  }

  return msg;
});

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');

// Create logger instance
const logger = winston.createLogger({
  levels: customLevels,
  level: config.logging.level || 'info',
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    metadata({ fillExcept: ['message', 'level', 'timestamp', 'stack'] })
  ),
  defaultMeta: {
    service: 'mooncalender-api',
    environment: config.nodeEnv || 'development',
  },
  transports: [
    // Console transport (always present)
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        contextFormat
      ),
    }),

    // Daily rotating file for all logs
    new winstonDailyRotateFile({
      dirname: logsDir,
      filename: 'combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d', // Keep logs for 14 days
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        contextFormat
      ),
    }),

    // Daily rotating file for errors
    new winstonDailyRotateFile({
      dirname: logsDir,
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '30d', // Keep error logs for 30 days
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        contextFormat
      ),
    }),

    // Daily rotating file for HTTP requests
    new winstonDailyRotateFile({
      dirname: logsDir,
      filename: 'http-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'http',
      maxSize: '20m',
      maxFiles: '7d', // Keep HTTP logs for 7 days
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        contextFormat
      ),
    }),

    // JSON format for production (useful for log aggregation)
    ...(config.nodeEnv === 'production' ? [
      new winstonDailyRotateFile({
        dirname: logsDir,
        filename: 'json-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '30d',
        format: combine(
          timestamp(),
          errors({ stack: true }),
          json()
        ),
      })
    ] : []),
  ],

  // Handle exceptions and rejections
  exceptionHandlers: [
    new winston.transports.File({
      dirname: logsDir,
      filename: 'exceptions.log',
    }),
    new winstonDailyRotateFile({
      dirname: logsDir,
      filename: 'exceptions-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
    }),
  ],

  rejectionHandlers: [
    new winston.transports.File({
      dirname: logsDir,
      filename: 'rejections.log',
    }),
    new winstonDailyRotateFile({
      dirname: logsDir,
      filename: 'rejections-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
    }),
  ],
});

/**
 * Create a child logger with additional context
 */
export const createChildLogger = (context: Record<string, unknown>) => {
  return logger.child(context);
};

/**
 * Log HTTP requests
 */
export const logHttpRequest = (req: any, res: any, responseTime: number) => {
  const { method, originalUrl, statusCode } = req;
  const userId = req.user?.id;
  const requestId = req.id;

  logger.http('HTTP Request', {
    method,
    url: originalUrl,
    statusCode,
    responseTime: `${responseTime}ms`,
    ...(userId && { userId }),
    ...(requestId && { requestId }),
    userAgent: req.get('user-agent'),
    ip: req.ip,
  });
};

/**
 * Stream for Morgan HTTP logger
 */
export const winstonStream = {
  write: (message: string) => {
    const parsed = JSON.parse(message);
    logger.http('HTTP', parsed);
  },
};

/**
 * Request context middleware
 */
export const addRequestContext = (req: any, res: any, next: any) => {
  // Add request ID if not present
  if (!req.id) {
    req.id = Math.random().toString(36).substring(2, 15);
  }

  // Add start time for response time calculation
  req.startTime = Date.now();

  // Add response listener
  res.on('finish', () => {
    const responseTime = Date.now() - req.startTime;

    // Log request completion
    logger.http('Request completed', {
      requestId: req.id,
      method: req.method,
      path: req.path,
      query: req.query,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      ...(req.user && { userId: req.user.id }),
      ip: req.ip,
    });
  });

  next();
};

/**
 * Query logging service
 */
export const queryLogger = winston.createLogger({
  levels: customLevels,
  level: 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    json()
  ),
  defaultMeta: { service: 'mooncalender-database' },
  transports: [
    new winstonDailyRotateFile({
      dirname: logsDir,
      filename: 'query-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '7d',
    }),
    ...(config.nodeEnv !== 'production' ? [
      new winston.transports.Console({
        format: combine(
          colorize(),
          printf(({ message, timestamp, level }) => {
            return `${timestamp} [${level}]: ${message}`;
          })
        ),
      })
    ] : []),
  ],
});

/**
 * Security logger for authentication and authorization events
 */
export const securityLogger = winston.createLogger({
  levels: customLevels,
  level: 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    json()
  ),
  defaultMeta: { service: 'mooncalender-security' },
  transports: [
    new winstonDailyRotateFile({
      dirname: logsDir,
      filename: 'security-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '90d', // Keep security logs for 90 days
    }),
    new winston.transports.Console({
      format: combine(
        colorize(),
        printf(({ message, timestamp, level }) => {
          return `${timestamp} [SECURITY ${level}]: ${message}`;
        })
      ),
    }),
  ],
});

/**
 * Performance logger for metrics
 */
export const performanceLogger = winston.createLogger({
  levels: customLevels,
  level: 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    json()
  ),
  defaultMeta: { service: 'mooncalender-performance' },
  transports: [
    new winstonDailyRotateFile({
      dirname: logsDir,
      filename: 'performance-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
    }),
  ],
});

export default logger;
export { logger };
export { createChildLogger, logHttpRequest, winstonStream, addRequestContext };
export { queryLogger, securityLogger, performanceLogger };
