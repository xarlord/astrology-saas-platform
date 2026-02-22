# Integration Tests - Ready to Run Once Database is Available

**Status:** Tests are written and ready, just need database connectivity
**Last Updated:** 2026-02-19

---

## Overview

This document lists all integration and API tests that are ready to run but currently blocked by lack of database connectivity. Once PostgreSQL is available (see QUICKSTART_DATABASE_SETUP.md), these tests can be executed immediately.

---

## Test Inventory

### 1. Authentication Routes Integration Tests

**File:** `backend/src/__tests__/integration/auth.routes.test.ts`

**Tests Covered:**
- User Registration
  - Valid registration data
  - Duplicate email handling
  - Password validation
  - Email validation

- User Login
  - Valid credentials
  - Invalid credentials
  - Missing fields
  - JWT token generation

- Token Refresh
  - Valid refresh token
  - Expired refresh token
  - Invalid refresh token

- User Profile
  - Get user profile
  - Update user profile
  - Delete user account

- Logout
  - Token invalidation
  - Session cleanup

**Endpoint Coverage:**
```
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
GET  /api/v1/auth/profile
PUT  /api/v1/auth/profile
DELETE /api/v1/auth/account
POST /api/v1/auth/logout
```

---

### 2. Calendar Routes Integration Tests

**File:** `backend/src/__tests__/integration/calendar.routes.test.ts`

**Tests Covered:**
- Get Month Events
  - Valid month/year
  - Invalid month (0, 13)
  - Invalid year (past, future)
  - Events pagination

- Create Custom Event
  - Valid event data
  - Missing required fields
  - Invalid event type
  - Date validation

- Update Event
  - Update own events
  - Update others' events (should fail)

- Delete Event
  - Delete own events
  - Delete others' events (should fail)

- Get Global Events
  - New moons, full moons
  - Mercury retrograde periods
  - Eclipses
  - Seasonal changes

**Endpoint Coverage:**
```
GET    /api/v1/calendar/month/:year/:month
POST   /api/v1/calendar/events
GET    /api/v1/calendar/events/:id
PUT    /api/v1/calendar/events/:id
DELETE /api/v1/calendar/events/:id
GET    /api/v1/calendar/global/:year/:month
```

---

### 3. Chart Routes Integration Tests

**File:** `backend/src/__tests__/integration/chart.routes.test.ts`

**Tests Covered:**
- Create Birth Chart
  - Complete birth data
  - Time-unknown births
  - Location validation
  - Coordinate validation

- Get User Charts
  - List all user charts
  - Get specific chart
  - Chart not found

- Update Chart
  - Update birth data
  - Change default chart
  - Chart metadata updates

- Delete Chart
  - Soft delete
  - Hard delete (admin)
  - Cascade deletions

- Calculate Chart
  - Natal chart calculation
  - Progressed chart
  - Composite chart
  - Draconic chart

**Endpoint Coverage:**
```
POST   /api/v1/charts
GET    /api/v1/charts
GET    /api/v1/charts/:id
PUT    /api/v1/charts/:id
DELETE /api/v1/charts/:id
POST   /api/v1/charts/:id/calculate
```

---

### 4. Lunar Return Routes Integration Tests

**File:** `backend/src/__tests__/integration/lunarReturn.routes.test.ts`

**Tests Covered:**
- Get Next Lunar Return
  - Calculate next return date
  - Return natal moon info
  - Handle no natal chart error

- Get Current Lunar Return
  - Return countdown (daysUntil)
  - Current return date
  - Validation: 0 < daysUntil < 30

- Calculate Lunar Return Chart
  - Valid return date
  - Calculate moon position
  - Determine moon phase
  - House placement
  - Find aspects
  - Generate theme and intensity

- Get Monthly Forecast
  - Forecast for specific date
  - Auto-calculate next return
  - Generate predictions
  - Create action advice
  - Identify key dates
  - Generate rituals
  - Create journal prompts

- Get History
  - Pagination support
  - Order by returnDate DESC
  - Filter by date range

- Delete Lunar Return
  - Delete own returns
  - Prevent deleting others' returns

- Calculate Custom Return
  - With forecast
  - Without forecast
  - Custom date calculation

**Endpoint Coverage:**
```
GET    /api/v1/lunar-return/next
GET    /api/v1/lunar-return/current
POST   /api/v1/lunar-return/chart
POST   /api/v1/lunar-return/forecast
GET    /api/v1/lunar-return/history
DELETE /api/v1/lunar-return/:id
POST   /api/v1/lunar-return/calculate
```

**Test Count:** ~40 test cases

---

### 5. User Routes Integration Tests

**File:** `backend/src/__tests__/integration/user.routes.test.ts`

**Tests Covered:**
- Get User Profile
  - Get own profile
  - Get other user's public profile
  - Profile not found

- Update User Settings
  - Update preferences
  - Change subscription tier
  - Update notification settings

- Manage Charts
  - Set default chart
  - Delete charts
  - Chart count limits by tier

- Account Deletion
  - Soft delete (data retention)
  - Hard delete (GDPR request)
  - Admin-only hard delete

**Endpoint Coverage:**
```
GET  /api/v1/users/me
GET  /api/v1/users/:id
PUT  /api/v1/users/me
PUT  /api/v1/users/me/settings
DELETE /api/v1/users/me
```

---

### 6. Analysis Routes Integration Tests

**File:** `backend/src/__tests__/integration/analysis.routes.test.ts`

**Tests Covered:**
- Generate Personality Analysis
  - Complete natal chart analysis
  - Big three focus (Sun, Moon, Rising)
  - Aspect patterns
  - Element and mode balance

- Generate Transit Analysis
  - Current transits
  - Upcoming transits
  - Transit interpretation
  - Date range filtering

- Get Cached Analysis
  - Retrieve from cache
  - Cache miss (generate new)
  - Cache invalidation

- Composite Analysis
  - Synastry composite chart
  - Davison relationship chart
  - Combined forecast

**Endpoint Coverage:**
```
POST /api/v1/analysis/personality
POST /api/v1/analysis/transits
GET  /api/v1/analysis/:chartId/personality
GET  /api/v1/analysis/:chartId/transits
POST /api/v1/analysis/composite
```

---

### 7. AI Integration Tests

**File:** `backend/src/__tests__/ai/integration.test.ts`

**Tests Covered:**
- AI Interpretation Generation
  - Chart interpretation
  - Transit interpretation
  - Synastry interpretation

- AI Caching
  - Cache HIT scenarios
  - Cache MISS scenarios
  - Cache invalidation

- Token Usage Tracking
  - Track tokens consumed
  - Calculate costs
  - Rate limiting by tier

- Error Handling
  - OpenAI API failures
  - Timeout handling
  - Fallback responses

**Endpoint Coverage:**
```
POST /api/v1/ai/interpret
POST /api/v1/ai/interpret/transit
GET  /api/v1/ai/cache/:id
DELETE /api/v1/ai/cache/:id
GET  /api/v1/ai/usage
```

---

## Test Database Requirements

### Required Test Data

**Users:**
```sql
-- Premium user
INSERT INTO users (id, email, password, full_name, subscription_tier)
VALUES ('11111111-1111-1111-1111-111111111111', 'test1@example.com', '$2b$10$...', 'Test User 1', 'premium');

-- Free user
INSERT INTO users (id, email, password, full_name, subscription_tier)
VALUES ('22222222-2222-2222-2222-222222222222', 'test2@example.com', '$2b$10$...', 'Test User 2', 'free');
```

**Charts:**
```sql
-- Natal chart for user 1
INSERT INTO charts (id, user_id, name, birth_date, birth_time, birth_place, latitude, longitude, timezone)
VALUES ('chart1-uuid', '11111111-1111-1111-1111-111111111111', 'Natal Chart', '1990-01-01', '12:00:00', 'New York, NY', 40.7128, -74.0060, 'America/New_York');
```

**Calendar Events:**
```sql
-- Global event (new moon)
INSERT INTO calendar_events (event_type, event_date, event_data, interpretation)
VALUES ('new_moon', '2026-02-17 12:34:56', '{"sign": "aquarius", "degree": 29}', 'New Moon in Aquarius');
```

### Test Database Schema

All tables should be created via migrations:
```bash
cd backend
npm run db:migrate
```

Required tables:
- users
- refresh_tokens
- charts
- calendar_events
- lunar_returns
- monthly_forecasts
- synastry_reports
- solar_returns
- ai_cache
- ai_usage
- interpretations
- transit_readings

---

## Running the Tests

### Prerequisites
1. PostgreSQL is running (Docker or local)
2. Migrations have been run
3. Test data is seeded (optional, tests can create their own data)
4. Backend dependencies installed: `npm install`

### Execute All Integration Tests
```bash
cd backend
npm test -- --testPathPattern=integration
```

### Execute Specific Test Suite
```bash
# Auth tests only
npm test -- auth.routes.test.ts

# Lunar return tests only
npm test -- lunarReturn.routes.test.ts

# Calendar tests only
npm test -- calendar.routes.test.ts
```

### Execute with Verbose Output
```bash
npm test -- --testPathPattern=integration --verbose
```

### Execute with Coverage
```bash
npm test -- --testPathPattern=integration --coverage
```

---

## Expected Test Results

### Total Integration Tests
- Approximately **150-200 test cases** across 7 test files
- Estimated execution time: **2-5 minutes** (with database)

### Expected Pass Rate
- Initial run: **70-80%** pass rate
- After fixes: **95%+** pass rate

### Common Failure Points
1. Database connection issues
2. Missing foreign key constraints
3. Invalid test data
4. API endpoint changes not reflected in tests
5. Authentication token handling

---

## Test Data Cleanup

Each test should clean up after itself. The test suite uses:

```typescript
beforeEach(async () => {
  // Clean all tables before each test
  await cleanAllTables();
});

afterAll(async () => {
  // Close database connection
  await db.destroy();
});
```

**Tables cleaned before each test:**
- refresh_tokens
- chart_analysis_cache
- charts
- users
- calendar_events
- lunar_returns
- monthly_forecasts
- synastry_reports
- ai_cache
- ai_usage

---

## Performance Benchmarks

Once tests are running, track:

### Response Times
- Calendar month query: < 100ms
- Lunar return calculation: < 200ms
- Chart calculation: < 500ms
- AI interpretation: < 3000ms

### Database Queries
- Queries per test: Minimize to < 10 per endpoint
- N+1 query problems: Check for excessive queries
- Index usage: Ensure EXPLAIN ANALYZE shows index scans

### Test Execution Time
- Target: < 5 seconds per test file
- Total suite: < 5 minutes for all integration tests

---

## Continuous Integration

### GitHub Actions Example
```yaml
name: Integration Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_PASSWORD: astrology123
          POSTGRES_DB: astrology_saas_test
        ports:
          - 5434:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      - name: Install dependencies
        run: cd backend && npm ci
      - name: Run migrations
        run: cd backend && npm run db:migrate
        env:
          DATABASE_URL: postgresql://postgres:astrology123@localhost:5434/astrology_saas_test
      - name: Run integration tests
        run: cd backend && npm test -- --testPathPattern=integration
```

---

## Next Steps After Tests Pass

1. **Review Test Coverage**
   ```bash
   npm run test:coverage
   ```
   Open `coverage/lcov-report/index.html` in browser

2. **Fix Any Failing Tests**
   - Review error messages
   - Update test code or implementation
   - Re-run until all pass

3. **Manual API Testing**
   - Use Postman collection or curl commands
   - Follow `RUNTIME_TESTING_PLAN.md` scenarios

4. **Performance Testing**
   ```bash
   npm test -- --testPathPattern=performance
   ```

5. **Security Testing**
   - SQL injection attempts
   - XSS testing
   - Authentication bypass attempts

6. **Deploy to Staging**
   - Run full test suite on staging environment
   - Verify production-like configuration

---

## Troubleshooting

### Issue: Tests fail with "database connection refused"

**Solution:**
```bash
# Check PostgreSQL is running
docker ps  # or check Windows Services

# Check database exists
psql -U postgres -l

# Check .env has correct credentials
cat backend/.env | grep DATABASE
```

### Issue: Tests pass but data persists

**Solution:** Ensure cleanAllTables() is called in beforeEach()

### Issue: Tests timeout

**Solution:** Increase timeout in jest.config.js:
```javascript
testTimeout: 30000, // 30 seconds
```

### Issue: "foreign key constraint violation"

**Solution:** Ensure tables are created in correct order in migrations, or disable FK checks for tests:
```sql
SET session_replication_role = 'replica';
-- run tests
SET session_replication_role = 'origin';
```

---

## Summary

**Integration Tests Ready to Run:** 7 test files
**Total Test Cases:** ~150-200
**Estimated Execution Time:** 2-5 minutes
**Current Blocker:** Database not available
**Resolution:** See `QUICKSTART_DATABASE_SETUP.md`

Once database is available, all these tests can run immediately with:
```bash
npm test -- --testPathPattern=integration
```
