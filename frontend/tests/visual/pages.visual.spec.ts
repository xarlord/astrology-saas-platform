/**
 * Visual Regression Tests - Key Pages
 *
 * @description Visual tests for main application pages using full-page screenshots
 * Run with: npx playwright test --config=tests/visual/playwright.visual.config.ts
 */

import { test, expect } from '@playwright/test';

// Dynamic content that changes between runs (masked in screenshots)
const DYNAMIC_SELECTORS = [
  '[data-testid="timestamp"]',
  '[data-testid="live-date"]',
  '.notification-badge',
  '.loading-spinner',
];

test.describe('Visual Regression - Pages', () => {
  test.describe.configure({ mode: 'parallel' });

  test.beforeEach(async ({ page }) => {
    // Disable animations for consistent screenshots
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `,
    });
  });

  test.describe('Home Page', () => {
    test('home page - full page', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('home-page.png', {
        fullPage: true,
        mask: DYNAMIC_SELECTORS.map(s => page.locator(s)),
        maskColor: '#ff00ff',
      });
    });
  });

  test.describe('Authentication Pages', () => {
    test('login page', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('login-page.png', {
        fullPage: true,
      });
    });

    test('register page', async ({ page }) => {
      await page.goto('/register');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('register-page.png', {
        fullPage: true,
      });
    });
  });

  test.describe('Dashboard Page', () => {
    test('dashboard page', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('dashboard-page.png', {
        fullPage: true,
        mask: DYNAMIC_SELECTORS.map(s => page.locator(s)),
        maskColor: '#ff00ff',
      });
    });
  });

  test.describe('Chart Pages', () => {
    test('chart create page', async ({ page }) => {
      await page.goto('/charts/create');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('chart-create-page.png', {
        fullPage: true,
      });
    });
  });

  test.describe('Calendar Page', () => {
    test('calendar page', async ({ page }) => {
      await page.goto('/calendar');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('calendar-page.png', {
        fullPage: true,
        mask: DYNAMIC_SELECTORS.map(s => page.locator(s)),
        maskColor: '#ff00ff',
      });
    });
  });

  test.describe('Synastry Page', () => {
    test('synastry page', async ({ page }) => {
      await page.goto('/synastry');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('synastry-page.png', {
        fullPage: true,
      });
    });
  });

  test.describe('Transit Page', () => {
    test('transit page', async ({ page }) => {
      await page.goto('/transits');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('transit-page.png', {
        fullPage: true,
        mask: DYNAMIC_SELECTORS.map(s => page.locator(s)),
        maskColor: '#ff00ff',
      });
    });
  });

  test.describe('Lunar Returns Page', () => {
    test('lunar returns page', async ({ page }) => {
      await page.goto('/lunar');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('lunar-returns-page.png', {
        fullPage: true,
        mask: DYNAMIC_SELECTORS.map(s => page.locator(s)),
        maskColor: '#ff00ff',
      });
    });
  });

  test.describe('Solar Returns Page', () => {
    test('solar returns page', async ({ page }) => {
      await page.goto('/solar');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('solar-returns-page.png', {
        fullPage: true,
        mask: DYNAMIC_SELECTORS.map(s => page.locator(s)),
        maskColor: '#ff00ff',
      });
    });
  });

  test.describe('Profile Page', () => {
    test('profile page', async ({ page }) => {
      await page.goto('/profile');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('profile-page.png', {
        fullPage: true,
        mask: DYNAMIC_SELECTORS.map(s => page.locator(s)),
        maskColor: '#ff00ff',
      });
    });
  });
});
