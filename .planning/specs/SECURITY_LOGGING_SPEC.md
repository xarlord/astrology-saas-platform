# Security Event Logging System - Detailed Specification

## Overview

**ID:** SEC-LOG-001
**Priority:** P1 (High)
**Category:** Security Infrastructure
**Estimated Effort:** 4 hours

## Problem Statement

The application currently lacks comprehensive security event logging. Without proper logging:
- Failed login attempts are not tracked
- Token refresh events are not recorded
- Suspicious activities cannot be detected
- Security incidents cannot be investigated
- Compliance requirements may not be met

## Requirements

### Functional Requirements

#### FR-1: Login Event Logging
- Log all login attempts (successful and failed)
- Capture: timestamp, email, IP address, user agent, success/failure reason
- Track consecutive failed attempts per IP/email

#### FR-2: Token Event Logging
- Log all token refresh operations
- Log token revocation events
- Log CSRF token generation (rate limited)

#### FR-3: Authentication State Changes
- Log password changes
- Log email changes
- Log account lockouts
- Log session terminations

#### FR-4: Admin Security Events
- Log privilege escalations
- Log role changes
- Log sensitive data access

### Non-Functional Requirements

#### NFR-1: Performance
- Logging must not add >50ms latency to requests
- Async logging to prevent blocking

#### NFR-2: Storage
- Logs retained for 90 days minimum
- Automatic cleanup of old logs

#### NFR-3: Queryability
- Support filtering by event type, user, date range
- Support aggregation for dashboards

## Data Model

### Security Event Schema

```typescript
interface SecurityEvent {
  id: string;                    // UUID
  event_type: SecurityEventType;
  user_id?: string;              // Null for anonymous events
  email?: string;                // For login attempts
  ip_address: string;
  user_agent?: string;
  metadata: Record<string, any>; // Event-specific data
  success: boolean;
  failure_reason?: string;
  created_at: Date;
}

enum SecurityEventType {
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
```

### Database Migration

```sql
CREATE TABLE security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  email VARCHAR(255),
  ip_address INET NOT NULL,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  success BOOLEAN NOT NULL DEFAULT true,
  failure_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_security_events_type ON security_events(event_type);
CREATE INDEX idx_security_events_user ON security_events(user_id);
CREATE INDEX idx_security_events_ip ON security_events(ip_address);
CREATE INDEX idx_security_events_created ON security_events(created_at);
CREATE INDEX idx_security_events_email ON security_events(email);

-- For aggregation queries
CREATE INDEX idx_security_events_type_created ON security_events(event_type, created_at);
```

## API Design

### Internal Service API

```typescript
interface SecurityLoggingService {
  // Log events
  logLoginAttempt(email: string, success: boolean, reason?: string): Promise<void>;
  logTokenRefresh(userId: string, success: boolean): Promise<void>;
  logPasswordChange(userId: string): Promise<void>;
  logSuspiciousActivity(type: string, details: Record<string, any>): Promise<void>;

  // Query events
  getEventsByUser(userId: string, limit?: number): Promise<SecurityEvent[]>;
  getEventsByIP(ipAddress: string, limit?: number): Promise<SecurityEvent[]>;
  getFailedLoginAttempts(email: string, since: Date): Promise<number>;

  // Analytics
  getEventCountsByType(since: Date): Promise<Record<string, number>>;
  getRecentFailedLogins(limit?: number): Promise<SecurityEvent[]>;
}
```

### Admin API Endpoints

```
GET  /api/v1/admin/security/events
  - Query params: type, user_id, ip, from, to, limit, offset
  - Returns: paginated list of security events

GET  /api/v1/admin/security/stats
  - Returns: aggregated security statistics

GET  /api/v1/admin/security/failed-logins
  - Returns: recent failed login attempts
```

## Integration Points

### 1. Auth Controller Integration

```typescript
// In login()
await securityLoggingService.logLoginAttempt(email, !!user, failureReason);

// In logout()
await securityLoggingService.logLogout(userId);

// In refreshToken()
await securityLoggingService.logTokenRefresh(userId, true);
```

### 2. Middleware Integration

```typescript
// Rate limiter middleware
if (rateLimitExceeded) {
  await securityLoggingService.logRateLimitExceeded(req.ip, endpoint);
}
```

## Test Plan

### Unit Tests

| Test ID | Description | Expected Result |
|---------|-------------|-----------------|
| UT-1 | Log successful login | Event created with success=true |
| UT-2 | Log failed login | Event created with success=false, failure_reason |
| UT-3 | Query events by user | Returns only events for that user |
| UT-4 | Count failed logins | Returns correct count within time window |
| UT-5 | Query events by IP | Returns events from that IP |

### Integration Tests

| Test ID | Description | Expected Result |
|---------|-------------|-----------------|
| IT-1 | Login creates event | Database contains login event |
| IT-2 | Token refresh logged | Refresh operation logged |
| IT-3 | Rate limit logged | Rate limit breach logged |
| IT-4 | Admin API returns events | Admin can query security events |

### Coverage Targets

- Service: 95% line coverage
- Integration: 90% scenario coverage

## Success Criteria

1. All login attempts are logged
2. All token refreshes are logged
3. Failed login queries work correctly
4. No performance degradation >50ms
5. 95%+ test coverage on new code
6. All tests passing

## Dependencies

- Existing audit_log table (may consolidate)
- PostgreSQL database
- Express Request object for IP/user agent extraction

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Performance impact | Medium | Use async logging, batch inserts |
| Storage growth | Low | Implement 90-day retention policy |
| Sensitive data exposure | High | Hash emails in logs, restrict admin access |

## Implementation Order

1. Create database migration
2. Implement SecurityEvent model
3. Implement SecurityLoggingService
4. Integrate with auth controller
5. Add admin API endpoints
6. Write unit tests
7. Write integration tests
8. Verify coverage targets
