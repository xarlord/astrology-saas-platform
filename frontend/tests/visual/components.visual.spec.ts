/**
 * Visual Regression Tests - Component States
 *
 * @description Visual tests for component states and interactions
 * Run with: npx playwright test --config=tests/visual/playwright.visual.config.ts
 */

import { test, expect } from '@playwright/test';

const DYNAMIC_SELECTORS = [
  '.loading-spinner',
  '.animate-pulse',
  '.timestamp',
  '.notification-badge',
];

test.describe('Visual Regression - Component States', () => {
  test.describe.configure({ mode: 'parallel' });

  test.beforeEach(async ({ page }) => {
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          transition-duration: 0s !important;
        }
      `,
    });
  });

  test.describe('Login Form States', () => {
    test('login form - empty', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('login-form-empty.png', {
        fullPage: true,
      });
    });

    test('login form - filled', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      const emailInput = page.locator('input[type="email"], input[name="email"]').first();
      const passwordInput = page.locator('input[type="password"], input[name="password"]').first();

      if (await emailInput.count() > 0) {
        await emailInput.fill('test@example.com');
      }
      if (await passwordInput.count() > 0) {
        await passwordInput.fill('password123');
      }

      await expect(page).toHaveScreenshot('login-form-filled.png', {
        fullPage: true,
      });
    });
  });

  test.describe('Register Form States', () => {
    test('register form - empty', async ({ page }) => {
      await page.goto('/register');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('register-form-empty.png', {
        fullPage: true,
      });
    });

    test('register form - partially filled', async ({ page }) => {
      await page.goto('/register');
      await page.waitForLoadState('networkidle');

      const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]').first();
      const emailInput = page.locator('input[type="email"], input[name="email"]').first();

      if (await nameInput.count() > 0) {
        await nameInput.fill('Test User');
      }
      if (await emailInput.count() > 0) {
        await emailInput.fill('test@example.com');
      }

      await expect(page).toHaveScreenshot('register-form-partial.png', {
        fullPage: true,
      });
    });
  });

  test.describe('Chart Creation States', () => {
    test('chart form - empty', async ({ page }) => {
      await page.goto('/charts/create');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('chart-form-empty.png', {
        fullPage: true,
      });
    });

    test('chart form - with date', async ({ page }) => {
      await page.goto('/charts/create');
      await page.waitForLoadState('networkidle');

      const dateInput = page.locator('input[type="date"]').first();
      if (await dateInput.count() > 0) {
        await dateInput.fill('1990-06-15');
        await page.waitForTimeout(300);
      }

      await expect(page).toHaveScreenshot('chart-form-with-date.png', {
        fullPage: true,
      });
    });
  });

  test.describe('Mobile Viewport Tests', () => {
    test.skip(({ browserName }) => browserName !== 'chromium', 'Mobile tests only on Chromium');

    test('login page - mobile layout', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('login-mobile-layout.png', {
        fullPage: true,
      });
    });

    test('dashboard - mobile layout', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot('dashboard-mobile-layout.png', {
        fullPage: true,
        mask: DYNAMIC_SELECTORS.map(s => page.locator(s)),
        maskColor: '#ff00ff',
      });
    });
  });
});
