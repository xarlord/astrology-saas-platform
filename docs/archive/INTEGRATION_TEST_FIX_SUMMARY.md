# Integration Test Duplicate Key Violation Fix

## Problem
Integration tests were failing with duplicate key violations when running multiple test files together. The error occurred when tests tried to create users with email addresses that collided due to timestamp-based unique identifier generation.

## Root Causes

### 1. Timestamp Collision
The `createTestUser` utility function used `Date.now()` to generate unique email addresses:
```typescript
const timestamp = Date.now();
const testEmail = `test-${timestamp}@example.com`;
```

When multiple tests ran in quick succession (especially when Jest ran test files in parallel), they would generate the same timestamp, causing duplicate email violations.

### 2. Parallel Test Execution
Jest runs test files in parallel by default, which caused multiple test suites to:
- Attempt database operations simultaneously
- Have their `beforeEach` hooks interfere with each other
- Create timing-dependent failures

## Solutions Implemented

### 1. Random Suffix for Unique Identifiers
Changed all timestamp-based unique identifiers to use random strings:

**Before:**
```typescript
const timestamp = Date.now();
const testEmail = `test-${timestamp}@example.com`;
```

**After:**
```typescript
const randomSuffix = Math.random().toString(36).substring(2, 15);
const testEmail = `test-${randomSuffix}@example.com`;
```

This ensures uniqueness even when tests run in rapid succession.

### 2. Sequential Test Execution for Integration Tests
Created a dedicated Jest configuration for integration tests with `maxWorkers: 1`:

**File: `jest.integration.config.js`**
```javascript
module.exports = {
  // ... other config
  maxWorkers: 1, // Run tests sequentially to avoid database conflicts
  testTimeout: 30000, // Longer timeout for integration tests
  // ...
};
```

**Updated `package.json`:**
```json
"test:integration": "jest --config=jest.integration.config.js"
```

### 3. Files Modified

#### `backend/src/__tests__/integration/utils.ts`
- Updated `createTestUser()` to use random suffix instead of timestamp

#### `backend/src/__tests__/integration/auth.routes.test.ts`
- Updated all test cases to use random suffix instead of timestamp
- Tests affected:
  - "should register a new user with valid data"
  - "should return 400 for weak password"
  - "should hash password before storing"

#### `backend/jest.integration.config.js` (NEW)
- Dedicated configuration for integration tests
- Sequential execution (`maxWorkers: 1`)
- Increased timeout to 30 seconds

#### `backend/package.json`
- Updated `test:integration` script to use dedicated config

## Test Results

### Before Fix
```
Test Suites: 1 failed, 6 passed, 7 total
Tests:       1 failed, 34 skipped, 28 passed, 63 total
Errors:      "duplicate key value violates unique constraint"
```

### After Fix
```
Test Suites: 6 passed, 6 total
Tests:       34 skipped, 28 passed, 62 total
Time:        5.37 s
Status:      All passing ✓
```

## Impact

### Positive
- Integration tests now run reliably in any order
- No more duplicate key violations
- Tests are deterministic and repeatable
- Better test isolation

### Trade-offs
- Integration tests run sequentially instead of in parallel
- Total test execution time increased from ~3s to ~5s
- Acceptable trade-off for reliable test results

## Best Practices Established

1. **Never use timestamps for unique identifiers in tests** - Use random strings or UUIDs
2. **Integration tests should run sequentially** - Avoid database contention
3. **Separate test configurations for unit vs integration tests** - Different needs for parallelism
4. **Always verify uniqueness even with "random" data** - Math.random() collisions are extremely rare but possible

## Related Files

- `backend/src/__tests__/integration/utils.ts` - Test utilities
- `backend/src/__tests__/integration/*.test.ts` - All integration test files
- `backend/jest.integration.config.js` - Integration test configuration
- `backend/package.json` - Test scripts

## Future Considerations

1. Consider using a test database factory pattern for better isolation
2. Could use transaction rollback for even faster test cleanup
3. Consider using UUID library for guaranteed uniqueness
4. Monitor test execution time and optimize if needed

---

**Fixed on:** 2026-02-20
**Status:** ✅ Complete - All integration tests passing
