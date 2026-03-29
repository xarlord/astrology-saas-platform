/**
 * Visual Test Utilities
 *
 * @description Common selectors and helpers for visual regression tests
 */

import { Page } from '@playwright/test';

// Dynamic selectors that may change between renders (e.g., timestamps, loading states)
// These will be masked out in screenshots to reduce false positives
export const DYNAMIC_SELECTORS = [
  // Loading spinners and skeletons
  '.loading-spinner',
  '.skeleton-loader',
  '[data-testid="loading"]',
  '.animate-pulse',

  // Timestamps that change
  '.timestamp',
  '[data-testid="timestamp"]',
  'time',

  // User-specific content
  '.user-avatar',
  '.user-name',
  '[data-testid="user-name"]',

  // Notification badges
  '.notification-badge',
  '.toast',
  '[role="alert"]',

  // Dynamic data values
  '.chart-date',
  '.current-date',
  '[data-testid="date"]',
];

/**
 * Helper to mask dynamic content in screenshots
 */
export async function maskDynamicContent(page: Page, selectors: string[]) {
  for (const selector of selectors) {
    const elements = await page.$$(selector);
    for (const el of elements) {
      await el.evaluate((node: HTMLElement) => {
        node.style.backgroundColor = '#ff00ff';
        node.style.color = '#ff00ff';
      });
    }
  }
}

/**
 * Helper to wait for stable visual state
 */
export async function waitForVisualStability(page: Page) {
  // Wait for any loading states to complete
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');

  // Wait for any animations to complete
  await page.waitForTimeout(500);
}

/**
 * Helper to generate consistent test data
 */
export async function setupTestChart(page: Page) {
  // Fill in birth data form with consistent test values
  const testDate = '1990-01-15';
  const testTime = '12:00';
  const testLocation = 'New York, NY';

  const dateInput = page.locator('input[type="date"]').first();
  const timeInput = page.locator('input[type="time"]').first();
  const locationInput = page.locator('input[placeholder*="location" i]').or(page.locator('input[name="location"]')).first();

  if (dateInput) await dateInput.fill(testDate);
  if (timeInput) await timeInput.fill(testTime);
  if (locationInput) await locationInput.fill(testLocation);
}
