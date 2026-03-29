/**
 * Playwright BDD Configuration
 *
 * @description Configuration for Playwright-native BDD tests
 * Run with: npx playwright test --config=tests/bdd/playwright.bdd.config.ts
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './scenarios',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: [
    ['html', { outputFolder: 'reports/bdd/playwright-bdd-report', open: 'never' }],
    ['json', { outputFile: 'reports/bdd/playwright-bdd-report.json' }],
    ['junit', { outputFile: 'reports/bdd/junit.xml' }],
    ['list'],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },
  projects: [
    {
      name: 'bdd-chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'bdd-firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'bdd-webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'bdd-mobile',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'bdd-tablet',
      use: { ...devices['iPad Pro'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
