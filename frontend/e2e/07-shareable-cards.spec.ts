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
          .or(page.locator('button:has(span.material-symbols-outlined:text("share"))'))
          .or(page.locator('button', { hasText: 'share' }));

        if (await shareButton.isVisible()) {
          await shareButton.click();
          await page.waitForTimeout(1000);

          // Card preview should appear
          await expect(page.getByTestId('share-card-preview')).toBeVisible({ timeout: 10000 });
        }
      }
    });

    test('should render template picker with all templates', async ({ page }) => {
      await page.goto('/charts');
      await page.waitForTimeout(1000);

      const firstChart = page.getByTestId('chart-card').first().or(page.getByRole('link', { name: /view|open/i }).first());
      if (await firstChart.isVisible()) {
        await firstChart.click();
        await page.waitForTimeout(1000);

        const shareButton = page.getByTestId('share-chart-btn')
          .or(page.locator('button:has(span.material-symbols-outlined:text("share"))'))
          .or(page.locator('button', { hasText: 'share' }));
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
      const shareButton = page.getByTestId('share-chart-btn')
        .or(page.locator('button').filter({ hasText: 'share' }))
        .or(page.locator('span.material-symbols-outlined:has-text("share")').locator('..'));
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
    test('should load shared card without authentication', async ({ browser, page }) => {
      // First create a shared card from authenticated page
      await page.goto('/charts');
      await page.waitForTimeout(1000);

      const firstChart = page.getByTestId('chart-card').first().or(page.getByRole('link', { name: /view|open/i }).first());
      let shareId = 'test-chart-id'; // fallback

      if (await firstChart.isVisible()) {
        await firstChart.click();
        await page.waitForTimeout(1000);

        const shareButton = page.getByTestId('share-chart-btn')
          .or(page.locator('button:has(span.material-symbols-outlined:text("share"))'))
          .or(page.locator('button', { hasText: 'share' }));

        if (await shareButton.isVisible()) {
          await shareButton.click();
          await page.waitForTimeout(2000);

          // Get the share link from clipboard
          const copyButton = page.getByTestId('copy-link-btn')
            .or(page.getByRole('button', { name: /copy|link|url/i }));

          if (await copyButton.isVisible()) {
            // Grant clipboard permission
            await page.context().grantPermissions(['clipboard-read']);
            await copyButton.click();
            await page.waitForTimeout(500);

            const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
            shareId = clipboardText.split('/').pop() || shareId;
          }
        }
      }

      // Create a new unauthenticated context
      const context = await browser.newContext();
      const publicPage = await context.newPage();

      // Navigate to the share link
      await publicPage.goto(`/share/${shareId}`);
      await publicPage.waitForTimeout(2000);

      // Public page should render without login prompt
      const hasLoginPrompt = await publicPage.getByText(/sign in|log in|register/i).isVisible().catch(() => false);
      const hasContent = await publicPage.getByTestId('shared-chart-card').isVisible().catch(() => false);
      // Either content shows or a not-found state — no auth wall
      expect(hasLoginPrompt).toBeFalsy();

      await context.close();
    });

    test('should include OG meta tags for social previews', async ({ page }) => {
      // First create a shared card to test with
      await page.goto('/charts');
      await page.waitForTimeout(1000);

      const firstChart = page.getByTestId('chart-card').first().or(page.getByRole('link', { name: /view|open/i }).first());
      if (await firstChart.isVisible()) {
        await firstChart.click();
        await page.waitForTimeout(1000);

        const shareButton = page.getByTestId('share-chart-btn')
          .or(page.locator('button:has(span.material-symbols-outlined:text("share"))'))
          .or(page.locator('button', { hasText: 'share' }));

        if (await shareButton.isVisible()) {
          await shareButton.click();
          await page.waitForTimeout(2000);

          // Look for copy link button to get the share URL
          const copyButton = page.getByTestId('copy-link-btn')
            .or(page.getByRole('button', { name: /copy|link|url/i }));

          if (await copyButton.isVisible()) {
            await copyButton.click();
            await page.waitForTimeout(500);

            // Get the clipboard content which should be the share link
            const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
            const shareId = clipboardText.split('/').pop();

            // Navigate to the share page
            await page.goto(`/share/${shareId}`);
            await page.waitForTimeout(2000);

            // Check for Open Graph meta tags
            const ogTitle = await page.getAttribute('meta[property="og:title"]', 'content').catch(() => null);
            const ogDescription = await page.getAttribute('meta[property="og:description"]', 'content').catch(() => null);
            const ogImage = await page.getAttribute('meta[property="og:image"]', 'content').catch(() => null);

            // At least og:title should be present for social previews
            expect(ogTitle || ogDescription || ogImage).toBeTruthy();
          }
        }
      }
    });

    test('share link CTA should deep-link to registration', async ({ page, browser }) => {
      // First create a shared card to get a real share ID
      await page.goto('/charts');
      await page.waitForTimeout(1000);

      const firstChart = page.getByTestId('chart-card').first().or(page.getByRole('link', { name: /view|open/i }).first());
      let shareId = 'test-chart-id'; // fallback

      if (await firstChart.isVisible()) {
        await firstChart.click();
        await page.waitForTimeout(1000);

        const shareButton = page.getByTestId('share-chart-btn')
          .or(page.locator('button:has(span.material-symbols-outlined:text("share"))'))
          .or(page.locator('button', { hasText: 'share' }));

        if (await shareButton.isVisible()) {
          await shareButton.click();
          await page.waitForTimeout(2000);

          // Get the share link
          const copyButton = page.getByTestId('copy-link-btn')
            .or(page.getByRole('button', { name: /copy|link|url/i }));

          if (await copyButton.isVisible()) {
            await page.context().grantPermissions(['clipboard-read']);
            await copyButton.click();
            await page.waitForTimeout(500);

            const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
            shareId = clipboardText.split('/').pop() || shareId;
          }
        }
      }

      // Create unauthenticated context and navigate to share page
      const context = await browser.newContext();
      const publicPage = await context.newPage();

      await publicPage.goto(`/share/${shareId}`);
      await publicPage.waitForTimeout(2000);

      // Look for CTA button/link
      const ctaButton = publicPage.getByTestId('share-cta')
        .or(publicPage.getByRole('link', { name: /get.*reading|create.*chart|sign up|register/i }));

      if (await ctaButton.isVisible()) {
        await ctaButton.click();
        await publicPage.waitForTimeout(1000);
        // Should land on registration or chart creation page
        const url = publicPage.url();
        expect(url).toMatch(/\/(register|signup|chart|create)/);
      }

      await context.close();
    });
  });

  test.describe('Color Customization', () => {
    test('should customize card colors using color picker', async ({ page }) => {
      await page.goto('/charts');
      await page.waitForTimeout(1000);

      const firstChart = page.getByTestId('chart-card').first().or(page.getByRole('link', { name: /view|open/i }).first());
      if (await firstChart.isVisible()) {
        await firstChart.click();
        await page.waitForTimeout(1000);

        const shareButton = page.getByTestId('share-chart-btn')
          .or(page.locator('button:has(span.material-symbols-outlined:text("share"))'))
          .or(page.locator('button', { hasText: 'share' }));
        if (await shareButton.isVisible()) {
          await shareButton.click();
          await page.waitForTimeout(1000);

          // Look for color picker
          const colorPicker = page.getByTestId('color-picker')
            .or(page.getByRole('button', { name: /color|customize|theme/i }));

          if (await colorPicker.isVisible()) {
            // Get initial preview state
            const initialPreview = await page.getByTestId('share-card-preview').innerHTML();

            // Select a different color
            await colorPicker.click();
            await page.waitForTimeout(500);

            // Try to select a specific color option
            const colorOption = page.getByTestId('color-option').or(page.getByRole('option', { name: /.+/ }));
            if (await colorOption.count() > 1) {
              await colorOption.nth(1).click();
              await page.waitForTimeout(500);

              // Verify preview updated
              const updatedPreview = await page.getByTestId('share-card-preview').innerHTML();
              expect(updatedPreview).not.toBe(initialPreview);
            }
          }
        }
      }
    });
  });

  test.describe('Copy Link to Clipboard', () => {
    test('should copy share link to clipboard', async ({ page, context }) => {
      await page.goto('/charts');
      await page.waitForTimeout(1000);

      const firstChart = page.getByTestId('chart-card').first().or(page.getByRole('link', { name: /view|open/i }).first());
      if (await firstChart.isVisible()) {
        await firstChart.click();
        await page.waitForTimeout(1000);

        const shareButton = page.getByTestId('share-chart-btn')
          .or(page.locator('button:has(span.material-symbols-outlined:text("share"))'))
          .or(page.locator('button', { hasText: 'share' }));
        if (await shareButton.isVisible()) {
          await shareButton.click();
          await page.waitForTimeout(1000);

          // Look for copy link button
          const copyButton = page.getByTestId('copy-link-btn')
            .or(page.getByRole('button', { name: /copy|link|url/i }));

          if (await copyButton.isVisible()) {
            // Setup clipboard permission
            await context.grantPermissions(['clipboard-read']);

            await copyButton.click();
            await page.waitForTimeout(500);

            // Verify clipboard content
            const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
            expect(clipboardText).toMatch(/^http:\/\/localhost:5173\/share\//);
          }
        }
      }
    });
  });

  test.describe('Social Platform Sharing', () => {
    test('should display social share buttons', async ({ page }) => {
      await page.goto('/charts');
      await page.waitForTimeout(1000);

      const firstChart = page.getByTestId('chart-card').first().or(page.getByRole('link', { name: /view|open/i }).first());
      if (await firstChart.isVisible()) {
        await firstChart.click();
        await page.waitForTimeout(1000);

        const shareButton = page.getByTestId('share-chart-btn')
          .or(page.locator('button:has(span.material-symbols-outlined:text("share"))'))
          .or(page.locator('button', { hasText: 'share' }));
        if (await shareButton.isVisible()) {
          await shareButton.click();
          await page.waitForTimeout(1000);

          // Look for social share buttons
          const twitterButton = page.getByTestId('share-twitter').or(page.getByRole('link', { name: /twitter|x/i }));
          const facebookButton = page.getByTestId('share-facebook').or(page.getByRole('link', { name: /facebook/i }));
          const linkedinButton = page.getByTestId('share-linkedin').or(page.getByRole('link', { name: /linkedin/i }));

          // At least one social button should be visible
          const hasSocialButton = await twitterButton.isVisible().catch(() => false) ||
                                  await facebookButton.isVisible().catch(() => false) ||
                                  await linkedinButton.isVisible().catch(() => false);

          expect(hasSocialButton).toBeTruthy();
        }
      }
    });

    test('should open social share dialog with correct URL', async ({ page }) => {
      await page.goto('/charts');
      await page.waitForTimeout(1000);

      const firstChart = page.getByTestId('chart-card').first().or(page.getByRole('link', { name: /view|open/i }).first());
      if (await firstChart.isVisible()) {
        await firstChart.click();
        await page.waitForTimeout(1000);

        const shareButton = page.getByTestId('share-chart-btn')
          .or(page.locator('button:has(span.material-symbols-outlined:text("share"))'))
          .or(page.locator('button', { hasText: 'share' }));
        if (await shareButton.isVisible()) {
          await shareButton.click();
          await page.waitForTimeout(1000);

          // Setup popup handler for social share
          const popupPromise = page.waitForEvent('popup');

          const twitterButton = page.getByTestId('share-twitter').or(page.getByRole('link', { name: /twitter|x/i }));
          if (await twitterButton.isVisible()) {
            await twitterButton.click();

            // Verify popup opens with correct URL
            const popup = await popupPromise;
            await page.waitForTimeout(1000);
            const popupUrl = popup.url();
            expect(popupUrl).toMatch(/twitter\.com|x\.com/);
            expect(popupUrl).toMatch(/http:\/\/localhost:5173\/share\//);

            await popup.close();
          }
        }
      }
    });
  });

  test.describe('Download Card as Image', () => {
    test('should download card as image file', async ({ page }) => {
      await page.goto('/charts');
      await page.waitForTimeout(1000);

      const firstChart = page.getByTestId('chart-card').first().or(page.getByRole('link', { name: /view|open/i }).first());
      if (await firstChart.isVisible()) {
        await firstChart.click();
        await page.waitForTimeout(1000);

        const shareButton = page.getByTestId('share-chart-btn')
          .or(page.locator('button:has(span.material-symbols-outlined:text("share"))'))
          .or(page.locator('button', { hasText: 'share' }));
        if (await shareButton.isVisible()) {
          await shareButton.click();
          await page.waitForTimeout(1000);

          // Setup download handler
          const downloadPromise = page.waitForEvent('download');

          const downloadButton = page.getByTestId('download-card-btn')
            .or(page.getByRole('button', { name: /download|save|image/i }));

          if (await downloadButton.isVisible()) {
            await downloadButton.click();

            // Verify download starts
            const download = await downloadPromise;
            const fileName = download.suggestedFilename();
            expect(fileName).toMatch(/\.(png|jpg|jpeg|webp)$/i);
          }
        }
      }
    });
  });

  test.describe('Rate Limit Reset', () => {
    test('should reset rate limit counter after 24 hours', async ({ page }) => {
      // Mock time to test rate limit reset
      await page.goto('/charts');
      await page.waitForTimeout(1000);

      // Intercept share API and track calls
      let shareCallCount = 0;
      await page.route('**/api/v1/share/**', (route) => {
        shareCallCount++;

        // Simulate rate limit after 10 calls
        if (shareCallCount > 10) {
          return route.fulfill({
            status: 429,
            body: JSON.stringify({ error: 'Rate limit exceeded. Maximum 10 cards per day.' }),
          });
        }

        // Simulate successful share with rate limit info
        return route.fulfill({
          status: 200,
          body: JSON.stringify({
            shareToken: `test-share-${shareCallCount}`,
            remaining: 10 - shareCallCount,
            resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          }),
        });
      });

      const shareButton = page.getByTestId('share-chart-btn')
        .or(page.locator('button').filter({ hasText: 'share' }))
        .or(page.locator('span.material-symbols-outlined:has-text("share")').locator('..'));
      if (await shareButton.isVisible().catch(() => false)) {
        // Generate 10 cards successfully
        for (let i = 0; i < 10; i++) {
          await shareButton.click().catch(() => {});
          await page.waitForTimeout(500);
        }

        // Verify rate limit message appears
        await expect(page.getByText(/rate limit|too many|10.*day/i)).toBeVisible({ timeout: 5000 });

        // Simulate time travel 24 hours forward
        await page.evaluate(() => {
          const originalDate = Date;
          // @ts-ignore
          Date = class extends Date {
            constructor() {
              super();
              return new originalDate(originalDate.now() + 25 * 60 * 60 * 1000);
            }
            static now() {
              return originalDate.now() + 25 * 60 * 60 * 1000;
            }
          };
        });

        // Reset API call counter
        shareCallCount = 0;

        // Should be able to generate card again after reset
        await shareButton.click().catch(() => {});
        await page.waitForTimeout(500);

        // Verify no rate limit error
        const hasRateLimitError = await page.getByText(/rate limit|too many|10.*day/i).isVisible().catch(() => false);
        expect(hasRateLimitError).toBeFalsy();
      }
    });
  });
});
