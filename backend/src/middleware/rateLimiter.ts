/**
 * Rate Limiting Middleware
 * Provides specialized rate limiters for different endpoint types
 */

import rateLimit from 'express-rate-limit';

/**
 * PDF Generation Rate Limiter
 * Limits PDF downloads to prevent abuse
 * - 10 requests per 15 minutes per IP
 */
export const pdfRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV !== 'production' ? 100 : 10,
  message: {
    success: false,
    error: 'Too many PDF requests. Please try again later.',
    code: 'RATE_LIMIT_PDF',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Use IP + user ID for rate limiting if authenticated
  keyGenerator: (req) => {
    const userId = req.user?.id;
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    return userId ? `${ip}:${userId}` : ip;
  },
});

/**
 * Share Access Rate Limiter
 * Limits access to shared charts
 * - 20 requests per minute per IP
 */
export const shareRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: process.env.NODE_ENV !== 'production' ? 100 : 20,
  message: {
    success: false,
    error: 'Too many requests to shared charts. Please try again later.',
    code: 'RATE_LIMIT_SHARE',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Auth Rate Limiter
 * Stricter limits for authentication endpoints
 * - 5 requests per 15 minutes per IP
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV !== 'production' ? 500 : 5,
  message: {
    success: false,
    error: 'Too many authentication attempts. Please try again later.',
    code: 'RATE_LIMIT_AUTH',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Only count failed attempts
});

/**
 * Chart Creation Rate Limiter
 * Limits chart creation to prevent spam
 * - 20 charts per hour per user
 */
export const chartCreationRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: process.env.NODE_ENV !== 'production' ? 200 : 20,
  message: {
    success: false,
    error: 'Chart creation limit reached. Please try again later.',
    code: 'RATE_LIMIT_CHART',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use user ID for authenticated users
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User must be authenticated');
    }
    return `chart:${userId}`;
  },
});

/**
 * Password Reset Rate Limiter
 * Very strict limits for password reset
 * - 3 requests per hour per IP
 */
export const passwordResetRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: process.env.NODE_ENV !== 'production' ? 50 : 3,
  message: {
    success: false,
    error: 'Too many password reset requests. Please check your email or try again later.',
    code: 'RATE_LIMIT_PASSWORD_RESET',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export default {
  pdf: pdfRateLimiter,
  share: shareRateLimiter,
  auth: authRateLimiter,
  chartCreation: chartCreationRateLimiter,
  passwordReset: passwordResetRateLimiter,
};
