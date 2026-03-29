/**
 * Accessibility Test Configuration
 *
 * @description Playwright configuration for accessibility testing
 * Run with: npx playwright test --config=tests/accessibility/playwright.accessibility.config.ts
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 4,
  reporter: [
    ['html', { outputFolder: 'reports/accessibility', open: 'never' }],
    ['json', { outputFile: 'reports/accessibility/results.json' }],
    ['list'],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'a11y-desktop',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'a11y-mobile',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
