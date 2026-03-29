/**
 * Security Logging Service
 * Comprehensive security event logging for authentication and security events
 *
 * @requirement SEC-LOG-001
 */

import db from '../../../config/database';

// Security event types
export enum SecurityEventType {
  // Authentication
  LOGIN_ATTEMPT = 'login_attempt',
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILED = 'login_failed',
  LOGOUT = 'logout',

  // Token Management
  TOKEN_REFRESH = 'token_refresh',
  TOKEN_REFRESH_FAILED = 'token_refresh_failed',
  TOKEN_REVOKED = 'token_revoked',

  // Account Management
  PASSWORD_CHANGED = 'password_changed',
  EMAIL_CHANGED = 'email_changed',
  ACCOUNT_LOCKED = 'account_locked',
  ACCOUNT_UNLOCKED = 'account_unlocked',

  // CSRF
  CSRF_TOKEN_GENERATED = 'csrf_token_generated',
  CSRF_VALIDATION_FAILED = 'csrf_validation_failed',

  // Suspicious Activity
  SUSPICIOUS_LOGIN_PATTERN = 'suspicious_login_pattern',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  BRUTE_FORCE_DETECTED = 'brute_force_detected',
}

export interface SecurityEvent {
  id: string;
  action: SecurityEventType | string;
  user_id: string | null;
  email: string | null;
  ip_address: string | null;
  user_agent: string | null;
  entity_type: string | null;
  entity_id: string | null;
  details: Record<string, any> | null;
  success: boolean;
  failure_reason: string | null;
  created_at: Date;
}

export interface LogEventInput {
  action: SecurityEventType | string;
  userId?: string;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
  success?: boolean;
  failureReason?: string;
  details?: Record<string, any>;
  entityType?: string;
  entityId?: string;
}

export interface SecurityStats {
  totalEvents: number;
  failedLogins: number;
  successfulLogins: number;
  tokenRefreshes: number;
  rateLimitBreaches: number;
  suspiciousActivities: number;
}

/**
 * Log a security event
 */
export async function logSecurityEvent(input: LogEventInput): Promise<SecurityEvent> {
  const [event] = await db<SecurityEvent>('audit_log')
    .insert({
      action: input.action,
      user_id: input.userId || null,
      email: input.email || null,
      ip_address: input.ipAddress || null,
      user_agent: input.userAgent || null,
      success: input.success !== false,
      failure_reason: input.failureReason || null,
      details: input.details || null,
      entity_type: input.entityType || null,
      entity_id: input.entityId || null,
    })
    .returning('*');

  return event;
}

/**
 * Log login attempt
 */
export async function logLoginAttempt(
  email: string,
  success: boolean,
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    userId?: string;
    failureReason?: string;
  } = {}
): Promise<SecurityEvent> {
  return logSecurityEvent({
    action: success ? SecurityEventType.LOGIN_SUCCESS : SecurityEventType.LOGIN_FAILED,
    email,
    success,
    userId: metadata.userId,
    ipAddress: metadata.ipAddress,
    userAgent: metadata.userAgent,
    failureReason: metadata.failureReason,
  });
}

/**
 * Log logout event
 */
export async function logLogout(
  userId: string,
  metadata: {
    ipAddress?: string;
    userAgent?: string;
  } = {}
): Promise<SecurityEvent> {
  return logSecurityEvent({
    action: SecurityEventType.LOGOUT,
    userId,
    ipAddress: metadata.ipAddress,
    userAgent: metadata.userAgent,
  });
}

/**
 * Log logout event (alias for logLogout for compatibility)
 */
export async function logLogoutEvent(userId: string, metadata: { ipAddress?: string; userAgent?: string } = {}): Promise<SecurityEvent> {
  return logLogout(userId, metadata);
}

/**
 * Log token refresh event
 */
export async function logTokenRefresh(
  userId: string,
  success: boolean,
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    failureReason?: string;
  } = {}
): Promise<SecurityEvent> {
  return logSecurityEvent({
    action: success ? SecurityEventType.TOKEN_REFRESH : SecurityEventType.TOKEN_REFRESH_FAILED,
    userId,
    success,
    ipAddress: metadata.ipAddress,
    userAgent: metadata.userAgent,
    failureReason: metadata.failureReason,
  });
}

/**
 * Log token revocation
 */
export async function logTokenRevocation(
  userId: string,
  metadata: {
    ipAddress?: string;
    reason?: string;
  } = {}
): Promise<SecurityEvent> {
  return logSecurityEvent({
    action: SecurityEventType.TOKEN_REVOKED,
    userId,
    ipAddress: metadata.ipAddress,
    details: metadata.reason ? { reason: metadata.reason } : undefined,
  });
}

/**
 * Log password change
 */
export async function logPasswordChange(
  userId: string,
  metadata: {
    ipAddress?: string;
    userAgent?: string;
  } = {}
): Promise<SecurityEvent> {
  return logSecurityEvent({
    action: SecurityEventType.PASSWORD_CHANGED,
    userId,
    ipAddress: metadata.ipAddress,
    userAgent: metadata.userAgent,
  });
}

/**
 * Log CSRF validation failure
 */
export async function logCSRFValidationFailed(
  ipAddress: string,
  metadata: {
    userAgent?: string;
    endpoint?: string;
  } = {}
): Promise<SecurityEvent> {
  return logSecurityEvent({
    action: SecurityEventType.CSRF_VALIDATION_FAILED,
    ipAddress,
    userAgent: metadata.userAgent,
    success: false,
    failureReason: 'Invalid or missing CSRF token',
    details: metadata.endpoint ? { endpoint: metadata.endpoint } : undefined,
  });
}

/**
 * Log rate limit exceeded
 */
export async function logRateLimitExceeded(
  ipAddress: string,
  endpoint: string,
  metadata: {
    userAgent?: string;
    userId?: string;
  } = {}
): Promise<SecurityEvent> {
  return logSecurityEvent({
    action: SecurityEventType.RATE_LIMIT_EXCEEDED,
    ipAddress,
    userId: metadata.userId,
    userAgent: metadata.userAgent,
    success: false,
    failureReason: `Rate limit exceeded for ${endpoint}`,
    details: { endpoint },
  });
}

/**
 * Log suspicious activity
 */
export async function logSuspiciousActivity(
  type: string,
  details: Record<string, any>,
  metadata: {
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
  } = {}
): Promise<SecurityEvent> {
  return logSecurityEvent({
    action: type,
    userId: metadata.userId,
    ipAddress: metadata.ipAddress,
    userAgent: metadata.userAgent,
    success: false,
    details,
  });
}

/**
 * Get failed login attempts count for an email
 */
export async function getFailedLoginCount(
  email: string,
  since: Date = new Date(Date.now() - 15 * 60 * 1000) // Default: 15 minutes
): Promise<number> {
  const result = await db('audit_log')
    .where('email', email)
    .where('action', SecurityEventType.LOGIN_FAILED)
    .where('created_at', '>=', since)
    .count('* as count')
    .first();

  return Number(result?.count || 0);
}

/**
 * Get failed login attempts for an IP address
 */
export async function getFailedLoginCountByIP(
  ipAddress: string,
  since: Date = new Date(Date.now() - 15 * 60 * 1000)
): Promise<number> {
  const result = await db('audit_log')
    .where('ip_address', ipAddress)
    .whereIn('action', [SecurityEventType.LOGIN_FAILED, SecurityEventType.LOGIN_ATTEMPT])
    .where('success', false)
    .where('created_at', '>=', since)
    .count('* as count')
    .first();

  return Number(result?.count || 0);
}

/**
 * Get security events for a user
 */
export async function getEventsByUser(
  userId: string,
  options: {
    limit?: number;
    offset?: number;
    actionTypes?: string[];
  } = {}
): Promise<SecurityEvent[]> {
  const { limit = 50, offset = 0, actionTypes } = options;

  let query = db<SecurityEvent>('audit_log')
    .where('user_id', userId)
    .orderBy('created_at', 'desc')
    .limit(limit)
    .offset(offset);

  if (actionTypes && actionTypes.length > 0) {
    query = query.whereIn('action', actionTypes);
  }

  return query;
}

/**
 * Get recent security events (admin)
 */
export async function getRecentEvents(
  options: {
    limit?: number;
    offset?: number;
    actionTypes?: string[];
    userId?: string;
    ipAddress?: string;
    email?: string;
    from?: Date;
    to?: Date;
  } = {}
): Promise<SecurityEvent[]> {
  const {
    limit = 50,
    offset = 0,
    actionTypes,
    userId,
    ipAddress,
    email,
    from,
    to,
  } = options;

  let query = db<SecurityEvent>('audit_log')
    .orderBy('created_at', 'desc')
    .limit(limit)
    .offset(offset);

  if (actionTypes && actionTypes.length > 0) {
    query = query.whereIn('action', actionTypes);
  }

  if (userId) {
    query = query.where('user_id', userId);
  }

  if (ipAddress) {
    query = query.where('ip_address', ipAddress);
  }

  if (email) {
    query = query.where('email', email);
  }

  if (from) {
    query = query.where('created_at', '>=', from);
  }

  if (to) {
    query = query.where('created_at', '<=', to);
  }

  return query;
}

/**
 * Get security statistics
 */
export async function getSecurityStats(since: Date = new Date(Date.now() - 24 * 60 * 60 * 1000)): Promise<SecurityStats> {
  const events = await db('audit_log')
    .where('created_at', '>=', since)
    .select('action', 'success');

  const stats: SecurityStats = {
    totalEvents: events.length,
    failedLogins: 0,
    successfulLogins: 0,
    tokenRefreshes: 0,
    rateLimitBreaches: 0,
    suspiciousActivities: 0,
  };

  for (const event of events) {
    switch (event.action) {
      case SecurityEventType.LOGIN_FAILED:
        stats.failedLogins++;
        break;
      case SecurityEventType.LOGIN_SUCCESS:
        stats.successfulLogins++;
        break;
      case SecurityEventType.TOKEN_REFRESH:
        stats.tokenRefreshes++;
        break;
      case SecurityEventType.RATE_LIMIT_EXCEEDED:
        stats.rateLimitBreaches++;
        break;
      case SecurityEventType.SUSPICIOUS_LOGIN_PATTERN:
      case SecurityEventType.BRUTE_FORCE_DETECTED:
        stats.suspiciousActivities++;
        break;
    }
  }

  return stats;
}

/**
 * Get event counts by type
 */
export async function getEventCountsByType(
  since: Date = new Date(Date.now() - 24 * 60 * 60 * 1000)
): Promise<Record<string, number>> {
  const results = await db('audit_log')
    .where('created_at', '>=', since)
    .select('action')
    .count('* as count')
    .groupBy('action');

  const counts: Record<string, number> = {};
  for (const row of results) {
    counts[row.action] = Number(row.count);
  }

  return counts;
}

/**
 * Clean up old security events
 */
export async function cleanupOldEvents(daysOld: number = 90): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  return db('audit_log')
    .where('created_at', '<', cutoffDate)
    .delete();
}

// Export service object for convenience
export const SecurityLoggingService = {
  logSecurityEvent,
  logLoginAttempt,
  logLogout,
  logTokenRefresh,
  logTokenRevocation,
  logPasswordChange,
  logCSRFValidationFailed,
  logRateLimitExceeded,
  logSuspiciousActivity,
  getFailedLoginCount,
  getFailedLoginCountByIP,
  getEventsByUser,
  getRecentEvents,
  getSecurityStats,
  getEventCountsByType,
  cleanupOldEvents,
};

export default SecurityLoggingService;
