import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Test Configuration
 * Testing extended user scenarios with 100% user journey coverage
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }],
    ['list'],
  ],

  use: {
    // Base URL for tests - can be overridden via environment
    baseURL: process.env.BASE_URL || 'http://localhost:3000',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',

    // Action timeout
    actionTimeout: 10000,

    // Navigation timeout
    navigationTimeout: 30000,
  },

  projects: [
    // Setup project: runs auth.setup.ts to create authenticated state
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
      timeout: 60000,
    },

    // Console audit (public routes) — runs first, Chromium only
    {
      name: 'console-audit',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /00-console-audit\.spec\.ts/,
    },

    // Console audit (authenticated routes) — uses pre-seeded auth state
    {
      name: 'console-audit-authenticated',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/user.json',
      },
      testMatch: /00-console-audit\.spec\.ts/,
    },

    // Authenticated project: uses pre-saved auth state for tests that require login
    {
      name: 'authenticated-chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/user.json',
      },
      dependencies: ['setup'],
      testMatch: /.*\.spec\.ts/,
      // Only run in authenticated-chromium when explicitly selected,
      // otherwise falls through to unauthenticated browsers below
    },

    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] },
    },

    /* Test against tablet viewports */
    {
      name: 'Tablet',
      use: { ...devices['iPad Pro'] },
    },
  ],

  // Timeout for setup tests (bcrypt hashing can be slow)
  timeout: 30000,

  // Run your local dev server before starting the tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120000,
  },
});
