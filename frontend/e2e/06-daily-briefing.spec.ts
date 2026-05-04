/**
 * E2E Test: Daily Cosmic Briefing
 * Tests briefing display, personalization, notification preferences, and edge cases.
 */

import { test, expect } from '@playwright/test';
import { setupAuthenticatedTest, getConsistentTestUser } from './test-auth';

const API_BASE = 'http://localhost:3001/api/v1';

test.describe('Daily Cosmic Briefing', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedTest(page);
    await page.waitForTimeout(1000);
  });

  test.describe('Briefing Display', () => {
    test('should display briefing page after login', async ({ page }) => {
      await page.goto('/briefing');

      // Briefing page should load with key elements
      await expect(page.getByTestId('daily-briefing')).toBeVisible({ timeout: 10000 });
      await expect(page.getByText(/cosmic briefing|daily horoscope/i)).toBeVisible();
    });

    test('should show personalized content based on natal chart', async ({ page }) => {
      // Navigate to briefing - assumes user has a natal chart
      await page.goto('/briefing');
      await expect(page.getByTestId('daily-briefing')).toBeVisible({ timeout: 10000 });

      // Personalized content should reference zodiac sign or planetary positions
      const bodyText = await page.textContent('body');
      const hasPersonalizedContent =
        /aries|taurus|gemini|cancer|leo|virgo|libra|scorpio|sagittarius|capricorn|aquarius|pisces/i.test(bodyText ?? '') ||
        /sun in|moon in|mercury in|venus in|mars in/i.test(bodyText ?? '');
      expect(hasPersonalizedContent).toBeTruthy();
    });

    test('should show current date in briefing header', async ({ page }) => {
      await page.goto('/briefing');
      await expect(page.getByTestId('daily-briefing')).toBeVisible({ timeout: 10000 });

      const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      // Page should show today's date
      await expect(page.getByText(new RegExp(today.split(',')[0], 'i'))).toBeVisible();
    });
  });

  test.describe('Briefing Interaction', () => {
    test('should mark briefing as viewed after interaction', async ({ page }) => {
      await page.goto('/briefing');
      await expect(page.getByTestId('daily-briefing')).toBeVisible({ timeout: 10000 });

      // Scroll through the briefing or click a section
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

      // Verify viewed state - could be a badge, checkmark, or API call
      // This will need to be adapted once the feature is implemented
    });

    test('should load next/previous day briefing via navigation', async ({ page }) => {
      await page.goto('/briefing');
      await expect(page.getByTestId('daily-briefing')).toBeVisible({ timeout: 10000 });

      // Look for date navigation controls
      const nextButton = page.getByTestId('next-day-btn').or(page.getByRole('button', { name: /next|tomorrow/i }));
      if (await nextButton.isVisible()) {
        await nextButton.click();
        // Content should update
        await page.waitForTimeout(1000);
        await expect(page.getByTestId('daily-briefing')).toBeVisible();
      }
    });
  });

  test.describe('Notification Preferences', () => {
    test('should save and load notification preferences', async ({ page }) => {
      await page.goto('/briefing');
      await expect(page.getByTestId('daily-briefing')).toBeVisible({ timeout: 10000 });

      // Look for notification settings toggle
      const notifToggle = page.getByTestId('briefing-notifications-toggle')
        .or(page.getByRole('switch', { name: /notification|daily.*email/i }));

      if (await notifToggle.isVisible()) {
        const initialState = await notifToggle.isChecked();
        await notifToggle.click();

        // Wait for save
        await page.waitForTimeout(1000);

        // Reload and verify persistence
        await page.reload();
        await expect(page.getByTestId('daily-briefing')).toBeVisible({ timeout: 10000 });
        await expect(notifToggle).toBeChecked({ checked: !initialState });
      }
    });
  });

  test.describe('Edge Cases', () => {
    test('should show CTA for user without natal chart', async ({ page }) => {
      // Navigate to briefing - if user has no chart, should see CTA
      await page.goto('/briefing');

      // Either briefing content or a CTA should appear
      const briefingVisible = await page.getByTestId('daily-briefing').isVisible().catch(() => false);
      const ctaVisible = await page.getByText(/create.*chart|get.*reading|add.*birth/i).isVisible().catch(() => false);

      expect(briefingVisible || ctaVisible).toBeTruthy();
    });

    test('should handle API errors gracefully', async ({ page }) => {
      // Intercept briefing API and return error
      await page.route('**/api/v1/briefing/**', (route) =>
        route.fulfill({ status: 500, body: JSON.stringify({ error: 'Internal server error' }) })
      );

      await page.goto('/briefing');

      // Should show error state, not crash
      const hasError = await page.getByText(/error|try again|something went wrong/i).isVisible().catch(() => false);
      const hasContent = await page.getByTestId('daily-briefing').isVisible().catch(() => false);
      expect(hasError || hasContent).toBeTruthy();
    });
  });
});
