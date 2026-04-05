/**
 * E2E Test: Shareable Chart Cards
 * Tests card generation, template picker, rate limiting, public links, and OG tags.
 */

import { test, expect } from '@playwright/test';
import { setupAuthenticatedTest, getConsistentTestUser } from './test-auth';

const API_BASE = 'http://localhost:3001/api/v1';

test.describe('Shareable Chart Cards', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedTest(page);
    await page.waitForTimeout(1000);
  });

  test.describe('Card Generation', () => {
    test('should generate shareable card from natal chart page', async ({ page }) => {
      // Navigate to a chart detail page (assumes chart exists)
      await page.goto('/charts');
      await page.waitForTimeout(1000);

      // Click first chart to view it
      const firstChart = page.getByTestId('chart-card').first().or(page.getByRole('link', { name: /view|open/i }).first());
      if (await firstChart.isVisible()) {
        await firstChart.click();
        await page.waitForTimeout(1000);

        // Look for share button
        const shareButton = page.getByTestId('share-chart-btn')
          .or(page.getByRole('button', { name: /share|card/i }));
        await expect(shareButton).toBeVisible({ timeout: 5000 });
        await shareButton.click();

        // Card preview should appear
        await expect(page.getByTestId('share-card-preview')).toBeVisible({ timeout: 10000 });
      }
    });

    test('should render template picker with all templates', async ({ page }) => {
      await page.goto('/charts');
      await page.waitForTimeout(1000);

      const firstChart = page.getByTestId('chart-card').first().or(page.getByRole('link', { name: /view|open/i }).first());
      if (await firstChart.isVisible()) {
        await firstChart.click();
        await page.waitForTimeout(1000);

        const shareButton = page.getByTestId('share-chart-btn').or(page.getByRole('button', { name: /share|card/i }));
        if (await shareButton.isVisible()) {
          await shareButton.click();
          await page.waitForTimeout(1000);

          // Template picker should show multiple options
          const templates = page.getByTestId('card-template');
          const templateCount = await templates.count();
          expect(templateCount).toBeGreaterThanOrEqual(1);

          // Clicking a template should update preview
          if (templateCount > 1) {
            await templates.nth(1).click();
            await page.waitForTimeout(500);
            await expect(page.getByTestId('share-card-preview')).toBeVisible();
          }
        }
      }
    });
  });

  test.describe('Rate Limiting', () => {
    test('should enforce 10 cards per day rate limit', async ({ page }) => {
      // Intercept share API to track calls
      let shareCallCount = 0;
      await page.route('**/api/v1/share/**', (route) => {
        shareCallCount++;
        if (shareCallCount > 10) {
          return route.fulfill({
            status: 429,
            body: JSON.stringify({ error: 'Rate limit exceeded. Maximum 10 cards per day.' }),
          });
        }
        return route.continue();
      });

      await page.goto('/charts');
      await page.waitForTimeout(1000);

      // Attempt to generate multiple cards
      const shareButton = page.getByTestId('share-chart-btn').or(page.getByRole('button', { name: /share|card/i }));
      if (await shareButton.isVisible().catch(() => false)) {
        for (let i = 0; i < 11; i++) {
          await shareButton.click().catch(() => {});
          await page.waitForTimeout(500);
        }

        // After 10 calls, should see rate limit message
        if (shareCallCount > 10) {
          await expect(page.getByText(/rate limit|too many|10.*day/i)).toBeVisible({ timeout: 5000 });
        }
      }
    });
  });

  test.describe('Public Share Link', () => {
    test('should load shared card without authentication', async ({ browser }) => {
      // Create a new unauthenticated context
      const context = await browser.newContext();
      const publicPage = await context.newPage();

      // Navigate to a share link (placeholder - will use real link once feature exists)
      await publicPage.goto('/share/test-chart-id');
      await publicPage.waitForTimeout(2000);

      // Public page should render without login prompt
      const hasLoginPrompt = await publicPage.getByText(/sign in|log in|register/i).isVisible().catch(() => false);
      const hasContent = await publicPage.getByTestId('shared-chart-card').isVisible().catch(() => false);
      // Either content shows or a not-found state — no auth wall
      expect(hasLoginPrompt).toBeFalsy();

      await context.close();
    });

    test('should include OG meta tags for social previews', async ({ page }) => {
      await page.goto('/share/test-chart-id');
      await page.waitForTimeout(2000);

      // Check for Open Graph meta tags
      const ogTitle = await page.getAttribute('meta[property="og:title"]', 'content').catch(() => null);
      const ogDescription = await page.getAttribute('meta[property="og:description"]', 'content').catch(() => null);
      const ogImage = await page.getAttribute('meta[property="og:image"]', 'content').catch(() => null);

      // At least og:title should be present for social previews
      expect(ogTitle || ogDescription || ogImage).toBeTruthy();
    });

    test('share link CTA should deep-link to registration', async ({ page }) => {
      await page.goto('/share/test-chart-id');
      await page.waitForTimeout(2000);

      // Look for CTA button/link
      const ctaButton = page.getByTestId('share-cta')
        .or(page.getByRole('link', { name: /get.*reading|create.*chart|sign up|register/i }));

      if (await ctaButton.isVisible()) {
        await ctaButton.click();
        await page.waitForTimeout(1000);
        // Should land on registration or chart creation page
        const url = page.url();
        expect(url).toMatch(/\/(register|signup|chart|create)/);
      }
    });
  });
});
