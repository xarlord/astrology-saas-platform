import { defineConfig } from '@playwright/test';

/**
 * Integration Test Configuration
 * Tests backend API endpoints via Playwright request context
 * Does not require a running frontend — only the backend server
 */
export default defineConfig({
  testDir: '.',
  testMatch: /.*\.spec\.ts$/,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 30000,
  reporter: [
    ['html', { outputFolder: '../../reports/integration' }],
    ['list'],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3001',
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
    },
  },
});
