# Testing Guide: 100% Coverage with E2E Tests
<!--
  WHAT: Complete guide for running and writing tests to achieve 100% code coverage
  GOAL: Backend + Frontend + E2E tests = 100% coverage
-->

## Overview

This project maintains 100% code coverage across:
- **Backend**: Unit tests + Integration tests + Performance tests
- **Frontend**: Unit tests + Integration tests (Vitest + React Testing Library)
- **E2E**: End-to-end user journey tests (Playwright)

---

## Quick Start

### Install Test Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Install Playwright browsers (one-time setup)
npx playwright install
```

### Run All Tests

```bash
# Backend tests
cd backend
npm test                           # Run all backend tests
npm run test:coverage             # With coverage report

# Frontend tests
cd frontend
npm test                           # Run all frontend tests
npm run test:coverage             # With coverage report
npm run test:ui                   # UI mode for debugging

# E2E tests
cd frontend
npm run test:e2e                  # Run E2E tests headless
npm run test:e2e:ui              # Run with UI
npm run test:e2e:headed          # Run in headed mode
```

---

## Backend Testing

### Test Structure

```
backend/src/__tests__/
├── setup.ts                      # Global test setup
├── utils.ts                      # Test utilities and fixtures
├── auth.utils.ts                 # Auth mock utilities
├── services/                     # Unit tests for services
│   └── swissEphemeris.service.test.ts
├── integration/                  # Integration tests for routes
│   ├── auth.routes.test.ts
│   ├── chart.routes.test.ts
│   ├── analysis.routes.test.ts
│   ├── user.routes.test.ts
│   └── integration.test.setup.ts
└── performance/                  # Performance benchmarks
    ├── calculation.performance.test.ts
    ├── api.performance.test.ts
    └── database.performance.test.ts
```

### Coverage Requirements

**Current Coverage:**
- Statements: ~60%
- Branches: ~55%
- Functions: ~65%
- Lines: ~60%

**Target Coverage: 100%**

### Missing Backend Tests

**Priority 1: Critical Files**
```bash
# Run tests for specific files
npm test -- middleware/auth.test.ts
npm test -- middleware/errorHandler.test.ts
npm.test -- config/database.test.ts
```

**Priority 2: Controllers**
```bash
npm test -- controllers/chart.controller.test.ts
npm test -- controllers/auth.controller.test.ts
```

**Priority 3: Models & Services**
```bash
npm test -- models/user.model.test.ts
npm.test -- services/interpretation.service.test.ts
```

### Writing Backend Tests

```typescript
// Example: Unit test for middleware
import { authenticateToken } from '../middleware/auth';
import { Request, Response, NextFunction } from 'express';

describe('Authentication Middleware', () => {
  it('should call next() with valid token', async () => {
    const req = { headers: { authorization: 'Bearer valid-token' } } as Request;
    const res = {} as Response;
    const next = jest.fn() as NextFunction;

    await authenticateToken(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
  });

  it('should return 401 without token', async () => {
    const req = { headers: {} } as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    const next = jest.fn() as NextFunction;

    await authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
```

---

## Frontend Testing

### Test Structure

```
frontend/src/__tests__/
├── setup.ts                      # Test setup with RTL + MSW
├── test-utils.tsx                # Custom render functions
├── components/                   # Component tests
│   ├── BirthDataForm.test.tsx
│   ├── ChartWheel.test.tsx
│   └── ...
└── pages/                        # Page component tests
    ├── LoginPage.test.tsx
    ├── ChartCreatePage.test.tsx
    └── ...
```

### Coverage Requirements

**Current Coverage: 0%**

**Target Coverage: 100%**

### Frontend Test Files to Create

**Priority 1: Core Components**
```typescript
// src/__tests__/components/ProtectedRoute.test.tsx
// src/__tests__/components/AppLayout.test.tsx
// src/__tests__/components/BirthDataForm.test.tsx
// src/__tests__/components/ChartWheel.test.tsx
```

**Priority 2: Page Components**
```typescript
// src/__tests__/pages/LoginPage.test.tsx
// src/__tests__/pages/RegisterPage.test.tsx
// src/__tests__/pages/ChartCreatePage.test.tsx
// src/__tests__/pages/TransitPage.test.tsx
```

**Priority 3: Supporting Components**
```typescript
// src/__tests__/components/PersonalityAnalysis.test.tsx
// src/__tests__/components/UserProfile.test.tsx
// ...
```

### Writing Frontend Tests

```tsx
// Example: Component test
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BirthDataForm } from '@components/BirthDataForm';

describe('BirthDataForm', () => {
  it('should submit form with valid data', async () => {
    const mockSubmit = vi.fn();
    render(<BirthDataForm onSubmit={mockSubmit} />);

    await userEvent.type(screen.getByLabelText(/name/i), 'Test Chart');
    await userEvent.type(screen.getByLabelText(/birth date/i), '1990-01-15');
    await userEvent.type(screen.getByLabelText(/birth place/i), 'New York, NY');

    await userEvent.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        name: 'Test Chart',
        birth_date: '1990-01-15',
        birth_place: 'New York, NY',
        // ... other fields
      });
    });
  });

  it('should show validation errors for empty fields', async () => {
    render(<BirthDataForm onSubmit={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: /create/i }));

    await expect(screen.getByText(/name is required/i)).toBeVisible();
    await expect(screen.getByText(/birth date is required/i)).toBeVisible();
  });
});
```

---

## E2E Testing with Playwright

### Test Structure

```
frontend/e2e/
├── 01-authentication.spec.ts    # Auth flow tests
├── 02-chart-creation.spec.ts     # Chart management tests
├── 03-transits.spec.ts           # Transit dashboard tests
├── 04-profile.spec.ts            # User profile tests
├── 05-responsive.spec.ts         # Mobile/responsive tests
└── 06-accessibility.spec.ts      # a11y tests
```

### E2E Test Scenarios

**Implemented:**
- ✅ Authentication flow (register, login, logout)
- ✅ Chart creation and management
- ✅ Transit dashboard and calendar

**To Implement:**
- [ ] Profile management
- [ ] Responsive design
- [ ] Accessibility
- [ ] Performance
- [ ] Error handling

### Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npx playwright test 01-authentication.spec.ts

# Run with UI (interactive mode)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Run on specific browser
npx playwright test --project=chromium
npx playwright test --project=webkit
npx playwright test --project="Mobile Chrome"

# Run with debug
npx playwright test --debug

# Generate HTML report
npx playwright show-report
```

### Writing E2E Tests

```typescript
import { test, expect } from '@playwright/test';

test('user journey: create chart and view analysis', async ({ page }) => {
  // Navigate to site
  await page.goto('/');

  // Login
  await page.click('text=Login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  // Wait for dashboard
  await expect(page).toHaveURL(/.*dashboard/);

  // Create chart
  await page.click('text=Create Chart');
  await page.fill('[name="name"]', 'My Chart');
  await page.fill('[name="birth_date"]', '1990-01-15');
  // ... fill more fields
  await page.click('button[type="submit"]');

  // Verify chart created
  await expect(page.locator('text=My Chart')).toBeVisible();

  // View analysis
  await page.click('text=Analysis');
  await expect(page.locator('.personality-analysis')).toBeVisible();
});
```

---

## Coverage Reports

### Generate Coverage Reports

```bash
# Backend coverage
cd backend
npm run test:coverage
open coverage/index.html

# Frontend coverage
cd frontend
npm run test:coverage
open coverage/index.html
```

### Coverage Thresholds

**Backend (jest.config.js):**
```javascript
coverageThreshold: {
  global: {
    branches: 100,
    functions: 100,
    lines: 100,
    statements: 100,
  },
}
```

**Frontend (vitest.config.ts):**
```typescript
thresholds: {
  lines: 100,
  functions: 100,
  branches: 100,
  statements: 100,
}
```

### Viewing Coverage

- **HTML Report**: `coverage/index.html` - Interactive browser report
- **Terminal**: Shows percentage per file
- **CI/CD**: Upload to Codecov or Coveralls

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - name: Install dependencies
        run: cd backend && npm ci
      - name: Run tests
        run: cd backend && npm run test:coverage
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - name: Install dependencies
        run: cd frontend && npm ci
      - name: Install Playwright
        run: cd frontend && npx playwright install --with-deps
      - name: Run unit tests
        run: cd frontend && npm run test:coverage
      - name: Run E2E tests
        run: cd frontend && npm run test:e2e
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## Testing Best Practices

### Backend Tests

1. **Test Layers Separately**
   - Unit tests: Test functions/classes in isolation
   - Integration tests: Test API endpoints with real DB
   - Keep them separate

2. **Use Descriptive Test Names**
   ```typescript
   it('should return 401 when token is expired')
   it('should create chart with valid data')
   ```

3. **Test Edge Cases**
   ```typescript
   it('should handle time unknown flag')
   it('should validate extreme latitudes')
   it('should handle leap years')
   ```

4. **Mock External Dependencies**
   - Swiss Ephemeris: Use test fixtures
   - External APIs: Use MSW or Nock
   - File system: Use fs mock

### Frontend Tests

1. **Test User Behavior, Not Implementation**
   ```tsx
   // Good
   await userEvent.click(screen.getByRole('button', { name: /submit/i }))

   // Bad
   await fireEvent.click(submitButton)
   ```

2. **Use data-testid Sparingly**
   ```tsx
   // Good
   screen.getByRole('button', { name: /create chart/i })

   // Only when necessary
   screen.getByTestId('chart-create-submit')
   ```

3. **Test Accessibility**
   ```tsx
   // All interactive elements should be accessible
   await userEvent.tab()
   expect(screen.getByRole('button', { name: /submit/i })).toHaveFocus()
   ```

4. **Wait for Async Operations**
   ```tsx
   await waitFor(() => {
     expect(screen.getByText('Success')).toBeVisible()
   })
   ```

### E2E Tests

1. **Use Page Objects Pattern**
   ```typescript
   class LoginPage {
     constructor(page) { this.page = page; }
     async login(email, password) {
       await this.page.fill('[name="email"]', email);
       await this.page.fill('[name="password"]', password);
       await this.page.click('button[type="submit"]');
     }
   }
   ```

2. **Use Data Attributes**
   ```tsx
   <button data-testid="submit-button">Submit</button>
   ```

3. **Avoid Hard-coded Waits**
   ```typescript
   // Bad
   await page.waitForTimeout(5000);

   // Good
   await page.waitForSelector('text=Success');
   ```

4. **Test Real User Scenarios**
   - Not just clicking buttons
   - Test complete workflows
   - Include error cases

---

## Troubleshooting

### Backend Tests

**Issue**: Tests timeout
- **Solution**: Increase `testTimeout` in jest.config.js

**Issue**: Database connection errors
- **Solution**: Ensure test database is running, check DB_POOL_MIN

**Issue**: Migration errors
- **Solution**: Run `npm run db:migrate` before tests

### Frontend Tests

**Issue**: "Cannot find module" errors
- **Solution**: Check path aliases in vitest.config.ts

**Issue**: Test hangs indefinitely
- **Solution**: Use fake timers: `useFakeTimers: true`

**Issue**: MSW not working
- **Solution**: Ensure workers are registered in setup.ts

### E2E Tests

**Issue**: Tests fail in CI but pass locally
- **Solution**: Check viewport sizes, use `waitForSelector` with longer timeout

**Issue**: Flaky tests
- **Solution**: Use `waitFor` instead of hardcoded waits, add retries

**Issue**: Slow tests
- **Solution**: Use `fullyParallel: true` in playwright.config.ts

---

## Checklist: 100% Coverage

### Backend
- [ ] All 22 missing files have tests
- [ ] All tests pass
- [ ] Coverage report shows 100%
- [ ] No excluded files (except types/configs)

### Frontend
- [ ] All 20+ components have tests
- [ ] All pages have tests
- [ ] All services/hooks have tests
- [ ] Coverage report shows 100%

### E2E
- [ ] 10+ user scenarios covered
- [ ] All critical paths tested
- [ ] Mobile responsive tested
- [ ] Accessibility tested
- [ ] Cross-browser tested

---

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [MSW Documentation](https://mswjs.io/)
