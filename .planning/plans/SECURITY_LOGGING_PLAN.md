# Security Event Logging - Implementation Plan

## Overview

**Spec Reference:** [SECURITY_LOGGING_SPEC.md](./SECURITY_LOGGING_SPEC.md)
**Implementation Order:** Database → Model → Service → Integration → API → Tests

## Task Breakdown

### Task 1: Database Migration (15 min)

**File:** `backend/src/migrations/YYYYMMDDHHMMSS_create_security_events.ts`

```typescript
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('security_events', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('event_type', 50).notNullable();
    table.uuid('user_id').references('id').inTable('users').onDelete('SET NULL');
    table.string('email', 255);
    table.specificType('ip_address', 'inet').notNullable();
    table.text('user_agent');
    table.jsonb('metadata').defaultTo('{}');
    table.boolean('success').notNullable().defaultTo(true);
    table.text('failure_reason');
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    // Indexes
    table.index('event_type');
    table.index('user_id');
    table.index('ip_address');
    table.index('created_at');
    table.index('email');
    table.index(['event_type', 'created_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('security_events');
}
```

**Acceptance Criteria:**
- [ ] Migration runs successfully
- [ ] Table created with correct schema
- [ ] Indexes created
- [ ] Rollback works correctly

---

### Task 2: Security Event Model (20 min)

**File:** `backend/src/modules/shared/models/securityEvent.model.ts`

**Key Functions:**
```typescript
export const SecurityEventModel = {
  create(event: CreateSecurityEventInput): Promise<SecurityEvent>,
  findById(id: string): Promise<SecurityEvent | null>,
  findByUserId(userId: string, options?: QueryOptions): Promise<SecurityEvent[]>,
  findByEmail(email: string, options?: QueryOptions): Promise<SecurityEvent[]>,
  findByIP(ipAddress: string, options?: QueryOptions): Promise<SecurityEvent[]>,
  countFailedLogins(email: string, since: Date): Promise<number>,
  getEventCounts(since: Date): Promise<Record<string, number>>,
  deleteOlderThan(days: number): Promise<number>,
};
```

**Acceptance Criteria:**
- [ ] All CRUD operations work
- [ ] Query functions return correct results
- [ ] Count functions accurate

---

### Task 3: Security Logging Service (30 min)

**File:** `backend/src/modules/shared/services/securityLogging.service.ts`

**Key Methods:**
```typescript
class SecurityLoggingService {
  // Core logging methods
  async logLoginAttempt(email: string, success: boolean, metadata?: LogMetadata): Promise<void>;
  async logLogout(userId: string, metadata?: LogMetadata): Promise<void>;
  async logTokenRefresh(userId: string, success: boolean, metadata?: LogMetadata): Promise<void>;
  async logTokenRevocation(userId: string, metadata?: LogMetadata): Promise<void>;
  async logPasswordChange(userId: string, metadata?: LogMetadata): Promise<void>;
  async logCSRFValidationFailed(ipAddress: string, metadata?: LogMetadata): Promise<void>;
  async logRateLimitExceeded(ipAddress: string, endpoint: string): Promise<void>;
  async logSuspiciousActivity(type: string, details: Record<string, any>): Promise<void>;

  // Query methods
  async getFailedLoginAttempts(email: string, hours?: number): Promise<number>;
  async getRecentEvents(options: QueryOptions): Promise<SecurityEvent[]>;
  async getSecurityStats(since: Date): Promise<SecurityStats>;
}
```

**Acceptance Criteria:**
- [ ] All log methods create database records
- [ ] Query methods return correct data
- [ ] Async logging doesn't block requests

---

### Task 4: Auth Controller Integration (20 min)

**File:** `backend/src/modules/auth/controllers/auth.controller.ts`

**Changes:**
1. Import SecurityLoggingService
2. Add logging to `login()` - success and failure
3. Add logging to `logout()`
4. Add logging to `refreshToken()` - success and failure

**Example Integration:**
```typescript
// In login()
try {
  // ... existing auth logic
  await securityLoggingService.logLoginAttempt(email, true, { userId: user.id });
  // ... return success
} catch (error) {
  await securityLoggingService.logLoginAttempt(email, false, { reason: error.message });
  throw error;
}
```

**Acceptance Criteria:**
- [ ] Login success logged
- [ ] Login failure logged with reason
- [ ] Logout logged
- [ ] Token refresh logged

---

### Task 5: Admin API Endpoints (25 min)

**File:** `backend/src/modules/admin/routes/security.routes.ts`

**Endpoints:**
```typescript
// GET /api/v1/admin/security/events
router.get('/events', requireAdmin, async (req, res) => {
  const { type, user_id, ip, from, to, limit = 50, offset = 0 } = req.query;
  // Query and return events
});

// GET /api/v1/admin/security/stats
router.get('/stats', requireAdmin, async (req, res) => {
  const { since } = req.query;
  // Return aggregated statistics
});

// GET /api/v1/admin/security/failed-logins
router.get('/failed-logins', requireAdmin, async (req, res) => {
  // Return recent failed login attempts
});
```

**Acceptance Criteria:**
- [ ] Admin can query events with filters
- [ ] Stats endpoint returns aggregations
- [ ] Failed logins endpoint works

---

### Task 6: Unit Tests (30 min)

**File:** `backend/src/__tests__/modules/shared/services/securityLogging.test.ts`

**Test Cases:**
```typescript
describe('SecurityLoggingService', () => {
  describe('logLoginAttempt', () => {
    it('should log successful login');
    it('should log failed login with reason');
    it('should capture IP and user agent');
  });

  describe('getFailedLoginAttempts', () => {
    it('should count failed attempts within time window');
    it('should return 0 for no failed attempts');
    it('should exclude successful logins');
  });

  describe('getSecurityStats', () => {
    it('should aggregate event counts by type');
    it('should only include events after since date');
  });
});
```

**Coverage Target:** 95%+

---

### Task 7: Integration Tests (25 min)

**File:** `backend/src/__tests__/integration/securityLogging.test.ts`

**Test Cases:**
```typescript
describe('Security Logging Integration', () => {
  it('should log login attempt on /auth/login');
  it('should log logout on /auth/logout');
  it('should log token refresh on /auth/refresh');
  it('should query events via admin API');
  it('should return security stats');
});
```

**Coverage Target:** 90%+ scenarios

---

## Implementation Sequence

```
┌─────────────────────────────────────────────────────────────────┐
│  Phase 1: Database & Model (35 min)                             │
│  ┌─────────────┐    ┌──────────────────────────────────────┐   │
│  │ Migration   │ →  │ SecurityEvent Model                   │   │
│  └─────────────┘    └──────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Phase 2: Service Layer (30 min)                                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ SecurityLoggingService                                    │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Phase 3: Integration (45 min)                                  │
│  ┌───────────────────┐    ┌────────────────────────────────┐   │
│  │ Auth Controller   │    │ Admin API Routes               │   │
│  │ Integration       │    │                                │   │
│  └───────────────────┘    └────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Phase 4: Testing (55 min)                                      │
│  ┌─────────────────┐    ┌───────────────────────────────────┐  │
│  │ Unit Tests      │ →  │ Integration Tests                  │  │
│  │ (95% coverage)  │    │ (90% scenario coverage)            │  │
│  └─────────────────┘    └───────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Total Estimated Time: ~3 hours

## Verification Checklist

After implementation:
- [ ] All migrations run successfully
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Coverage targets met (95% unit, 90% integration)
- [ ] Manual testing of login/logout shows events in DB
- [ ] Admin API returns expected data
- [ ] No performance regression on auth endpoints
