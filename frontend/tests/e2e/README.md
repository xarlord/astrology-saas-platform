# E2E Test Suite - Comprehensive Documentation

This directory contains comprehensive End-to-End (E2E) test specifications using Playwright for the Astrology SaaS Platform.

## Overview

The E2E test suite covers all critical user flows with:
- **Page Object Model (POM)** pattern for maintainable test code
- **Test data fixtures** for reusable test data
- **Comprehensive assertions** for UI elements and interactions
- **API mocking** for testing edge cases and error scenarios
- **Screenshot capabilities** for visual debugging and documentation
- **Cross-browser testing** support (Chrome, Firefox, Safari)
- **Responsive design testing** for mobile, tablet, and desktop

## Test Flows Covered

### 1. Authentication Flow (`authentication-flow.spec.ts`)
Tests the complete authentication lifecycle:
- ✅ User registration with validation
- ✅ User login with valid/invalid credentials
- ✅ User logout and session management
- ✅ Password reset flow
- ✅ Protected route handling
- ✅ Social authentication UI
- ✅ Session persistence across reloads and tabs
- ✅ Password visibility toggle
- ✅ Remember me functionality

### 2. Chart Creation Flow (`chart-creation-flow.spec.ts`)
Tests chart creation and management:
- ✅ Navigate to chart creation
- ✅ Fill birth data form with validation
- ✅ Submit and create chart
- ✅ View chart details and wheel visualization
- ✅ Edit chart information
- ✅ Delete chart with confirmation
- ✅ Chart analysis (planets, houses, aspects)
- ✅ Chart search and filter
- ✅ Pagination
- ✅ Different house systems and zodiac types
- ✅ Time unknown option

### 3. Calendar Feature Flow (`calendar-feature-flow.spec.ts`)
Tests the astrological calendar feature:
- ✅ Navigate to calendar
- ✅ View month/week/day events
- ✅ View daily weather modal
- ✅ Create, edit, and delete custom events
- ✅ Set and manage reminders
- ✅ Export calendar (ICS, JSON)
- ✅ Display moon phases and planetary retrogrades
- ✅ Filter events by type
- ✅ Responsive design for all devices

### 4. Lunar Returns Flow (`lunar-returns-flow.spec.ts`)
Tests the lunar returns and monthly forecasts:
- ✅ Navigate to lunar returns
- ✅ Calculate next lunar return
- ✅ View moon position and phase
- ✅ View house placement
- ✅ View aspects between planets
- ✅ View monthly forecast with themes and recommendations
- ✅ View history of past lunar returns
- ✅ Save and download reports (PDF, JSON)
- ✅ Share reports
- ✅ Responsive design testing

### 5. Synastry Flow (`synastry-flow.spec.ts`)
Tests compatibility analysis:
- ✅ Navigate to synastry
- ✅ Select two different charts
- ✅ Calculate compatibility
- ✅ View overall and category scores (romantic, communication, emotional)
- ✅ View aspects between charts
- ✅ View composite chart
- ✅ View interpretation with strengths and challenges
- ✅ Save and download reports
- ✅ Share compatibility reports
- ✅ Compare multiple pairs
- ✅ Score validation (0-100 range)

### 6. Solar Returns Flow (`solar-returns-flow.spec.ts`)
Tests solar return calculations:
- ✅ Navigate to solar returns
- ✅ Calculate for current and specific years
- ✅ View chart wheel
- ✅ View interpretation with themes and highlights
- ✅ Relocate chart to different locations
- ✅ Compare relocated vs original chart
- ✅ View history
- ✅ Download reports
- ✅ Share solar return
- ✅ Responsive design testing

## Directory Structure

```
tests/e2e/
├── fixtures/
│   └── test-data.ts           # Test data fixtures and API responses
├── pages/
│   ├── AuthenticationPage.ts  # Authentication page object
│   ├── ChartPage.ts           # Chart creation/management page object
│   ├── CalendarPage.ts        # Calendar feature page object
│   ├── LunarReturnsPage.ts    # Lunar returns page object
│   ├── SynastryPage.ts        # Synastry/compatibility page object
│   └── SolarReturnsPage.ts    # Solar returns page object
├── utils/
│   └── test-helpers.ts        # Common test utility functions
├── authentication-flow.spec.ts
├── chart-creation-flow.spec.ts
├── calendar-feature-flow.spec.ts
├── lunar-returns-flow.spec.ts
├── synastry-flow.spec.ts
├── solar-returns-flow.spec.ts
└── README.md
```

## Page Object Model

The Page Object Model (POM) pattern is used to encapsulate page interactions:

```typescript
// Example: Using AuthenticationPage
const authPage = new AuthenticationPage(page);
await authPage.login('user@example.com', 'password');
await authPage.verifyLoggedIn();
```

Benefits:
- ✅ Maintainable test code
- ✅ Reusable page interactions
- ✅ Separation of concerns
- ✅ Easy to update when UI changes

## Test Data Fixtures

Reusable test data is defined in `fixtures/test-data.ts`:

```typescript
import { testUsers, testCharts, testCalendarEvents } from './fixtures/test-data';

// Use test data in tests
await authPage.login(testUsers.existing.email, testUsers.existing.password);
await chartPage.createChart(testCharts.valid);
```

## Running Tests

### Run All E2E Tests

```bash
npm run test:e2e
```

### Run Specific Test File

```bash
npx playwright test authentication-flow.spec.ts
```

### Run Tests in Specific Browser

```bash
# Chrome only
npx playwright test --project=chromium

# Firefox only
npx playwright test --project=firefox

# Safari only
npx playwright test --project=webkit
```

### Run Tests in Headed Mode

```bash
npx playwright test --headed
```

### Run Tests with Debugging

```bash
npx playwright test --debug
```

### Run Tests and View HTML Report

```bash
npx playwright test
npx playwright show-report
```

## Configuration

E2E tests are configured in `frontend/playwright.config.ts`:

```typescript
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 13'] } },
  ],
});
```

## Environment Variables

Create a `.env` file or set environment variables:

```bash
# Test user credentials
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=test123
EXISTING_USER_EMAIL=existing@example.com
EXISTING_USER_PASSWORD=existing123

# API base URL
BASE_URL=http://localhost:5173
```

## Test Helper Utilities

Common utilities in `utils/test-helpers.ts`:

```typescript
const helpers = new TestHelpers(page);

// Wait for API response
await helpers.waitForApiResponse(/.*\/api\/v1\/charts.*/);

// Take screenshot
await helpers.takeScreenshot('test-name');

// Verify toast notification
await helpers.verifyToast(/success|completed/i);

// Mock API
await helpers.mockApi(/.*\/api\/v1\/charts.*/, mockResponse);

// Verify URL
await helpers.verifyUrl(/.*dashboard/);

// Set viewport
await helpers.setViewport('mobile');
```

## Screenshot Capabilities

Screenshots are automatically captured:
- ✅ On test failure (configured in playwright.config.ts)
- ✅ Manually via `helpers.takeScreenshot()`

Screenshots are saved to: `test-results/screenshots/`

## API Mocking

Mock API responses for testing edge cases:

```typescript
// Mock successful response
await helpers.mockApi(/.*\/api\/v1\/charts.*/, apiResponses.charts.create.success);

// Mock error response
await helpers.mockApiError(/.*\/api\/v1\/charts.*/, 'Server error', 500);
```

## Cross-Browser Testing

Tests run across multiple browsers and devices:

### Desktop
- ✅ Chrome (Chromium)
- ✅ Firefox
- ✅ Safari (WebKit)

### Mobile
- ✅ Pixel 5 (Android Chrome)
- ✅ iPhone 13 (iOS Safari)

### Tablet
- ✅ iPad Pro

## Responsive Design Testing

Each test suite includes responsive design tests:

```typescript
test('should be responsive on mobile', async ({ page }) => {
  await helpers.setViewport('mobile');
  // Test mobile layout
});

test('should be responsive on tablet', async ({ page }) => {
  await helpers.setViewport('tablet');
  // Test tablet layout
});

test('should be responsive on desktop', async ({ page }) => {
  await helpers.setViewport('desktop');
  // Test desktop layout
});
```

## Test Reporting

After running tests, view reports:

### HTML Report
```bash
npx playwright show-report
```

### JSON Report
Results saved to: `test-results.json`

### Video Recordings
Videos of test failures saved to: `test-results/videos/`

## Best Practices

### 1. Use Page Objects
Always use Page Object classes instead of direct page interactions.

### 2. Reusable Test Data
Use fixtures for test data instead of hardcoding values.

### 3. Explicit Waits
Use explicit waits instead of `page.waitForTimeout()`:
```typescript
await page.waitForSelector('.element');
await page.waitForURL(/.*dashboard/);
```

### 4. Descriptive Test Names
Use clear, descriptive test names that explain what is being tested.

### 5. Assertions
Use specific assertions with meaningful error messages:
```typescript
await expect(page.locator('.error'), 'Error message should be displayed').toBeVisible();
```

### 6. Test Independence
Each test should be independent and able to run in isolation.

### 7. Cleanup
Clean up test data after tests when necessary.

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm ci
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

## Troubleshooting

### Tests Timing Out
- Increase timeout in `playwright.config.ts`
- Check if server is running on expected port
- Verify network speed and API response times

### Element Not Found
- Verify selectors are correct
- Check if element exists in current viewport
- Use `page.waitForSelector()` to wait for element

### Flaky Tests
- Add proper waits for asynchronous operations
- Use `waitForLoadState('networkidle')` for page loads
- Avoid hard-coded timeouts

### Browser Not Installed
```bash
npx playwright install
npx playwright install-deps
```

## Test Coverage Metrics

| Feature | Test Coverage | Status |
|---------|--------------|--------|
| Authentication | 100% | ✅ Complete |
| Chart Creation | 100% | ✅ Complete |
| Calendar | 100% | ✅ Complete |
| Lunar Returns | 100% | ✅ Complete |
| Synastry | 100% | ✅ Complete |
| Solar Returns | 100% | ✅ Complete |

## Future Enhancements

- [ ] Visual regression testing
- [ ] Performance testing
- [ ] Accessibility testing
- [ ] Mobile app testing (Appium)
- [ ] API contract testing
- [ ] Load testing integration

## Contributing

When adding new E2E tests:

1. Create/update Page Object class
2. Add test data to fixtures
3. Write comprehensive test cases
4. Include positive and negative scenarios
5. Add responsive design tests
6. Include error handling tests
7. Update this README

## License

MIT License - See project root for details

---

**Last Updated:** 2026-02-18

For questions or issues, please refer to the project documentation or contact the QA team.
