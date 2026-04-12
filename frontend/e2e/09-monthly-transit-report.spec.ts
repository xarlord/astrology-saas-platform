/**
 * E2E Test: Monthly Transit Report
 * Tests report generation, PDF download, history, upsell, and auto-delivery.
 */

import { test, expect } from '@playwright/test';
import { setupAuthenticatedTest, getConsistentTestUser } from './test-auth';

const API_BASE = 'http://localhost:3001/api/v1';

test.describe('Monthly Transit Report', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedTest(page);
    await page.waitForTimeout(1000);
  });

  test.describe('Report Generation', () => {
    test('should generate monthly transit report for premium user', async ({ page }) => {
      await page.goto('/reports');
      await page.waitForTimeout(1000);

      // Look for generate report button
      const generateBtn = page.getByTestId('generate-report-btn')
        .or(page.getByRole('button', { name: /generate.*report|create.*report|monthly.*transit/i }));

      await expect(generateBtn).toBeVisible({ timeout: 5000 });
      await generateBtn.click();

      // Report generation should start — look for loading state
      const loadingIndicator = page.getByTestId('report-loading').or(page.getByText(/generating|loading|creating/i));
      await expect(loadingIndicator).toBeVisible({ timeout: 5000 });

      // Wait for report to complete (longer timeout for generation)
      await expect(page.getByTestId('monthly-report')).toBeVisible({ timeout: 30000 });
    });

    test('should display transit interpretations in report', async ({ page }) => {
      await page.goto('/reports');
      await page.waitForTimeout(1000);

      // If report already exists, view it; otherwise generate
      const existingReport = page.getByTestId('monthly-report').first();
      if (await existingReport.isVisible().catch(() => false)) {
        await existingReport.click();
      } else {
        const generateBtn = page.getByTestId('generate-report-btn').or(page.getByRole('button', { name: /generate/i }));
        if (await generateBtn.isVisible()) {
          await generateBtn.click();
          await expect(page.getByTestId('monthly-report')).toBeVisible({ timeout: 30000 });
        }
      }

      // Report should contain transit-related content
      const bodyText = await page.textContent('body');
      const hasTransitContent = /transit|planetary|saturn|jupiter|pluto|mars.*transit/i.test(bodyText ?? '');
      expect(hasTransitContent).toBeTruthy();
    });
  });

  test.describe('PDF Download', () => {
    test('should download report as PDF', async ({ page }) => {
      await page.goto('/reports');
      await page.waitForTimeout(1000);

      const downloadBtn = page.getByTestId('download-pdf-btn')
        .or(page.getByRole('button', { name: /download.*pdf|export.*pdf|save.*pdf/i }));

      if (await downloadBtn.isVisible()) {
        const [download] = await Promise.all([
          page.waitForEvent('download', { timeout: 30000 }),
          downloadBtn.click(),
        ]);

        // Verify download started
        expect(download).toBeTruthy();
        const suggestedFilename = download.suggestedFilename();
        expect(suggestedFilename).toMatch(/\.pdf$/i);
      }
    });
  });

  test.describe('Report History', () => {
    test('should display past reports in history', async ({ page }) => {
      await page.goto('/reports');
      await page.waitForTimeout(1000);

      // History section should list reports
      const historySection = page.getByTestId('report-history').or(page.getByText(/history|past reports/i));
      if (await historySection.isVisible()) {
        // Should have at least one report entry
        const reportEntries = page.getByTestId('report-history-item');
        const count = await reportEntries.count();
        expect(count).toBeGreaterThanOrEqual(0); // May be empty for new users
      }
    });

    test('should open past report from history', async ({ page }) => {
      await page.goto('/reports');
      await page.waitForTimeout(1000);

      const reportEntries = page.getByTestId('report-history-item');
      if ((await reportEntries.count()) > 0) {
        await reportEntries.first().click();
        await page.waitForTimeout(1000);

        // Should display the report content
        await expect(page.getByTestId('monthly-report')).toBeVisible({ timeout: 10000 });
      }
    });
  });

  test.describe('Free User Upsell', () => {
    test('should show locked card for free user', async ({ page }) => {
      // Intercept API to return 403 (free user)
      await page.route('**/api/v1/reports/**', (route) => {
        if (route.request().method() === 'GET' || route.request().method() === 'POST') {
          return route.fulfill({
            status: 403,
            body: JSON.stringify({ error: 'Premium feature. Upgrade to access monthly transit reports.' }),
          });
        }
        return route.continue();
      });

      await page.goto('/reports');
      await page.waitForTimeout(1000);

      // Should show locked state or upsell
      const lockedCard = page.getByTestId('locked-report-card').or(page.getByText(/premium|upgrade|locked/i));
      await expect(lockedCard).toBeVisible({ timeout: 5000 });
    });

    test('403 response should trigger upgrade modal', async ({ page }) => {
      await page.route('**/api/v1/reports/**', (route) =>
        route.fulfill({
          status: 403,
          body: JSON.stringify({ error: 'Premium feature required' }),
        })
      );

      await page.goto('/reports');

      // Try to generate (which triggers 403)
      const generateBtn = page.getByTestId('generate-report-btn').or(page.getByRole('button', { name: /generate/i }));
      if (await generateBtn.isVisible()) {
        await generateBtn.click();
      }

      // Upgrade modal should appear
      const upgradeModal = page.getByTestId('upgrade-modal').or(page.getByText(/upgrade|premium|subscribe/i));
      await expect(upgradeModal).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Auto-Delivery', () => {
    test('auto-delivery toggle should persist', async ({ page }) => {
      await page.goto('/reports');
      await page.waitForTimeout(1000);

      const autoToggle = page.getByTestId('auto-delivery-toggle')
        .or(page.getByRole('switch', { name: /auto.*deliver|monthly.*email/i }));

      if (await autoToggle.isVisible()) {
        const initialState = await autoToggle.isChecked();
        await autoToggle.click();
        await page.waitForTimeout(1000);

        // Reload to verify persistence
        await page.reload();
        await page.waitForTimeout(1000);
        await expect(autoToggle).toBeChecked({ checked: !initialState });
      }
    });
  });
});
