import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for running E2E tests against production (Fly.io)
 *
 * Usage:
 *   BASE_URL=https://astroverse.fly.dev npx playwright test --config=playwright.config.prod.ts
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: /13-full-user-flow-console-monitored\.spec\.ts$/,
  fullyParallel: false,
  retries: 1,
  workers: 1,
  timeout: 60000,
  expect: {
    timeout: 15000,
  },
  reporter: [
    ['list'],
    ['json', { outputFile: 'test-results-prod.json' }],
  ],

  use: {
    baseURL: process.env.BASE_URL || 'https://astroverse.fly.dev',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
