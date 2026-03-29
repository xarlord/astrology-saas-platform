/**
 * Playwright Visual Regression Test Configuration
 *
 * @description Configuration for visual regression testing using Playwright's
 * built-in screenshot comparison capabilities
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['html', { outputFolder: 'visual-report' }],
    ['json', { outputFile: 'visual-results.json' }],
    ['list'],
  ],

  // Screenshot comparison settings
  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 100,
      maxDiffPixelRatio: 0.01, // 1% difference allowed
      animations: 'disabled', // Disable animations for consistent screenshots
    },
  },

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'on',
    video: 'off', // Disable video for visual tests
    actionTimeout: 10000,
    navigationTimeout: 30000,
    // Consistent viewport for visual tests
    viewport: { width: 1280, height: 720 },
  },

  projects: [
    // Visual tests run on Chromium for consistency
    {
      name: 'visual-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'visual-tablet',
      use: {
        ...devices['iPad Pro'],
      },
    },
    {
      name: 'visual-mobile',
      use: {
        ...devices['Pixel 5'],
      },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true, // Reuse existing server
    timeout: 120000,
  },
});
