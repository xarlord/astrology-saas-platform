/**
 * Rate Limiting Middleware
 * Provides specialized rate limiters for different endpoint types
 */

import rateLimit from 'express-rate-limit';
import { UnauthorizedError } from '../utils/appError';

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
/**
 * Auth Rate Limiter — Failed Attempts Only
 * Tracks only failed login attempts (5 per 15 min)
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
 * Auth Total Request Limiter — All Auth Requests
 * Caps total auth requests per IP (50 per 15 min) to prevent credential stuffing
 * even with high-quality password lists.
 */
export const authTotalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV !== 'production' ? 500 : 50,
  message: {
    success: false,
    error: 'Too many authentication requests. Please try again later.',
    code: 'RATE_LIMIT_AUTH_TOTAL',
  },
  standardHeaders: true,
  legacyHeaders: false,
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
      throw new UnauthorizedError('User must be authenticated');
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

/**
 * Webhook Rate Limiter
 * Dedicated rate limiter for Stripe webhook endpoint
 * - 100 requests per minute per IP (Stripe sends retries)
 * - Must be applied directly to the webhook route
 */
export const webhookRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: process.env.NODE_ENV !== 'production' ? 500 : 100,
  message: {
    success: false,
    error: 'Too many webhook requests. Please try again later.',
    code: 'RATE_LIMIT_WEBHOOK',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Public API Rate Limiter
 * For public endpoints that don't require auth but need abuse protection
 * - 100 requests per 15 minutes per IP
 */
export const publicApiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV !== 'production' ? 500 : 100,
  message: {
    success: false,
    error: 'Too many requests. Please try again later.',
    code: 'RATE_LIMIT_PUBLIC_API',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Calendar Operations Rate Limiter
 * Limits calendar event operations to prevent abuse
 * - 100 requests per 15 minutes per user
 */
export const calendarRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV !== 'production' ? 500 : 100,
  message: {
    success: false,
    error: 'Too many calendar operations. Please try again later.',
    code: 'RATE_LIMIT_CALENDAR',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const userId = req.user?.id;
    if (!userId) {
      const ip = req.ip || req.connection.remoteAddress || 'unknown';
      return ip;
    }
    return `calendar:${userId}`;
  },
});

/**
 * Monthly Report Rate Limiter
 * Limits monthly transit report generation (premium feature)
 * - 10 reports per month per user
 */
export const monthlyReportRateLimiter = rateLimit({
  windowMs: 30 * 24 * 60 * 60 * 1000, // 30 days (1 month)
  max: process.env.NODE_ENV !== 'production' ? 100 : 10,
  message: {
    success: false,
    error: 'Monthly report limit reached. You can generate up to 10 reports per month.',
    code: 'RATE_LIMIT_MONTHLY_REPORT',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const userId = req.user?.id;
    if (!userId) {
      const ip = req.ip || req.connection.remoteAddress || 'unknown';
      return ip;
    }
    return `monthly_report:${userId}`;
  },
});

export default {
  pdf: pdfRateLimiter,
  share: shareRateLimiter,
  auth: authRateLimiter,
  chartCreation: chartCreationRateLimiter,
  passwordReset: passwordResetRateLimiter,
  webhook: webhookRateLimiter,
  publicApi: publicApiRateLimiter,
  calendar: calendarRateLimiter,
  monthlyReport: monthlyReportRateLimiter,
};
