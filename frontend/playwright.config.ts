import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Test Configuration
 * Testing extended user scenarios with 100% user journey coverage
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: /.*\.spec\.ts$/,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 30000,
  expect: {
    timeout: 10000,
  },
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

  // In CI: only run chromium + authenticated-chromium to keep runtime manageable.
  // Cross-browser, mobile, and tablet are covered by BDD/visual/accessibility jobs.
  projects: process.env.CI
    ? [
        {
          name: 'setup',
          testMatch: /.*\.setup\.ts/,
          timeout: 60000,
        },
        {
          name: 'console-audit',
          use: { ...devices['Desktop Chrome'] },
          testMatch: /00-console-audit\.spec\.ts/,
        },
        {
          name: 'console-audit-authenticated',
          use: {
            ...devices['Desktop Chrome'],
            storageState: 'e2e/.auth/user.json',
          },
          testMatch: /00-console-audit\.spec\.ts/,
        },
        {
          name: 'authenticated-chromium',
          use: {
            ...devices['Desktop Chrome'],
            storageState: 'e2e/.auth/user.json',
          },
          dependencies: ['setup'],
          testMatch: /.*\.spec\.ts/,
        },
        {
          name: 'chromium',
          use: { ...devices['Desktop Chrome'] },
        },
      ]
    : [
        // Local dev: full matrix
        {
          name: 'setup',
          testMatch: /.*\.setup\.ts/,
          timeout: 60000,
        },
        {
          name: 'console-audit',
          use: { ...devices['Desktop Chrome'] },
          testMatch: /00-console-audit\.spec\.ts/,
        },
        {
          name: 'console-audit-authenticated',
          use: {
            ...devices['Desktop Chrome'],
            storageState: 'e2e/.auth/user.json',
          },
          testMatch: /00-console-audit\.spec\.ts/,
        },
        {
          name: 'authenticated-chromium',
          use: {
            ...devices['Desktop Chrome'],
            storageState: 'e2e/.auth/user.json',
          },
          dependencies: ['setup'],
          testMatch: /.*\.spec\.ts/,
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
        {
          name: 'Mobile Chrome',
          use: {
            ...devices['Pixel 5'],
            actionTimeout: 20000,
            navigationTimeout: 40000,
          },
        },
        {
          name: 'Mobile Safari',
          use: {
            ...devices['iPhone 13'],
            actionTimeout: 20000,
            navigationTimeout: 40000,
          },
        },
        {
          name: 'Tablet',
          use: {
            ...devices['iPad Pro'],
            actionTimeout: 15000,
            navigationTimeout: 35000,
          },
        },
      ],

  // Run local dev servers before starting the tests
  webServer: [
    {
      command: 'cd ../backend && npm run start:e2e',
      url: 'http://localhost:3001/health',
      reuseExistingServer: true,
      timeout: 120000,
    },
    {
      command: 'npm run dev',
      url: 'http://localhost:3000',
      reuseExistingServer: true,
      timeout: 120000,
    },
  ],
});
