/**
 * Centralized Security Event Logger
 * Tracks authentication failures, CSRF violations, rate limit exceeds, and unauthorized access attempts
 */

import { Request } from 'express';
import logger from './logger';

/**
 * Security event types
 */
export enum SecurityEventType {
  AUTH_FAILURE = 'auth_failure',
  AUTH_SUCCESS = 'auth_success',
  CSRF_FAILURE = 'csrf_failure',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  FORBIDDEN_ACCESS = 'forbidden_access',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  VALIDATION_FAILURE = 'validation_failure',
}

/**
 * Security event metadata
 */
export interface SecurityEventMetadata {
  timestamp: string;
  type: SecurityEventType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  path?: string;
  method?: string;
  details: Record<string, unknown>;
}

/**
 * Log a security event
 *
 * @param type - Type of security event
 * @param details - Additional event details
 * @param req - Optional Express request for context
 */
export function logSecurityEvent(
  type: SecurityEventType,
  details: Record<string, unknown>,
  req?: Request,
): void {
  const metadata: SecurityEventMetadata = {
    timestamp: new Date().toISOString(),
    type,
    severity: getSeverityForType(type),
    details,
  };

  // Extract context from request if available
  if (req) {
    metadata.ipAddress = req.ip || req.socket.remoteAddress;
    metadata.userAgent = typeof req.get === 'function' ? req.get('user-agent') : undefined;
    metadata.path = req.path;
    metadata.method = req.method;

    // Extract user ID if authenticated
    const user = (req as { user?: { id?: string } }).user;
    if (user?.id) {
      metadata.userId = user.id;
    }
  }

  // Log with appropriate level
  const logMessage = `[SECURITY] ${type.toUpperCase()}: ${JSON.stringify(details)}`;

  switch (metadata.severity) {
    case 'critical':
    case 'high':
      logger.error(logMessage, { securityEvent: metadata });
      break;
    case 'medium':
      logger.warn(logMessage, { securityEvent: metadata });
      break;
    case 'low':
    default:
      logger.info(logMessage, { securityEvent: metadata });
      break;
  }

  // In production, send to SIEM or external monitoring
  if (process.env.NODE_ENV === 'production') {
    sendToSIEM(metadata);
  }
}

/**
 * Helper function to log authentication failures
 */
export function logAuthFailure(
  reason: string,
  req: Request,
  additionalDetails?: Record<string, unknown>,
): void {
  logSecurityEvent(
    SecurityEventType.AUTH_FAILURE,
    {
      reason,
      ...additionalDetails,
    },
    req,
  );
}

/**
 * Helper function to log CSRF violations
 */
export function logCSRFViolation(req: Request): void {
  logSecurityEvent(
    SecurityEventType.CSRF_FAILURE,
    {
      reason: 'CSRF token validation failed',
    },
    req,
  );
}

/**
 * Helper function to log rate limit violations
 */
export function logRateLimitExceeded(
  limitName: string,
  req: Request,
  additionalDetails?: Record<string, unknown>,
): void {
  logSecurityEvent(
    SecurityEventType.RATE_LIMIT_EXCEEDED,
    {
      limitName,
      ...additionalDetails,
    },
    req,
  );
}

/**
 * Helper function to log unauthorized access attempts
 */
export function logUnauthorizedAccess(
  reason: string,
  req: Request,
  additionalDetails?: Record<string, unknown>,
): void {
  logSecurityEvent(
    SecurityEventType.UNAUTHORIZED_ACCESS,
    {
      reason,
      ...additionalDetails,
    },
    req,
  );
}

/**
 * Helper function to log suspicious activity
 */
export function logSuspiciousActivity(
  description: string,
  req: Request,
  severity: 'low' | 'medium' | 'high' = 'medium',
): void {
  const metadata: SecurityEventMetadata = {
    timestamp: new Date().toISOString(),
    type: SecurityEventType.SUSPICIOUS_ACTIVITY,
    severity,
    details: { description },
    ipAddress: req.ip || req.socket.remoteAddress,
    userAgent: typeof req.get === 'function' ? req.get('user-agent') : undefined,
    path: req.path,
    method: req.method,
  };

  const user = (req as { user?: { id?: string } }).user;
  if (user?.id) {
    metadata.userId = user.id;
  }

  const logMessage = `[SECURITY] SUSPICIOUS: ${description}`;

  if (severity === 'high') {
    logger.error(logMessage, { securityEvent: metadata });
  } else if (severity === 'medium') {
    logger.warn(logMessage, { securityEvent: metadata });
  } else {
    logger.info(logMessage, { securityEvent: metadata });
  }

  if (process.env.NODE_ENV === 'production') {
    sendToSIEM(metadata);
  }
}

/**
 * Get severity level for security event type
 */
function getSeverityForType(type: SecurityEventType): 'low' | 'medium' | 'high' | 'critical' {
  switch (type) {
    case SecurityEventType.AUTH_FAILURE:
    case SecurityEventType.RATE_LIMIT_EXCEEDED:
      return 'medium';
    case SecurityEventType.CSRF_FAILURE:
    case SecurityEventType.UNAUTHORIZED_ACCESS:
      return 'high';
    case SecurityEventType.FORBIDDEN_ACCESS:
      return 'medium';
    case SecurityEventType.VALIDATION_FAILURE:
      return 'low';
    case SecurityEventType.AUTH_SUCCESS:
      return 'low';
    case SecurityEventType.SUSPICIOUS_ACTIVITY:
      return 'high';
    default:
      return 'low';
  }
}

/**
 * Send security event to SIEM or external monitoring
 * Placeholder for production SIEM integration
 */
function sendToSIEM(metadata: SecurityEventMetadata): void {
  // TODO: Integrate with SIEM (Datadog, Sentry, Splunk, etc.)
  // Examples:
  // - Datadog: ddSecurityEvent(metadata)
  // - Sentry: Sentry.captureMessage('[SECURITY]', { extra: metadata })
  // - Splunk HTTP Event Collector: sendToSplunk(metadata)

  // For now, log to console in production for visibility
  if (process.env.NODE_ENV === 'production') {
    console.log('[SIEM]', JSON.stringify(metadata));
  }
}

export default {
  logSecurityEvent,
  logAuthFailure,
  logCSRFViolation,
  logRateLimitExceeded,
  logUnauthorizedAccess,
  logSuspiciousActivity,
};
