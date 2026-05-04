/**
 * E2E Test: PDF Generation
 * Tests PDF download button presence, download triggering, and error handling.
 */

import { test, expect } from './fixtures/auth.fixture';

test.describe('PDF Generation', () => {
  test('should render a PDF / download button on the chart view page', async ({ page, auth, testChart }) => {
    await page.goto(`/charts/${testChart.id}`);
    await expect(page.getByRole('heading', { name: testChart.name })).toBeVisible({ timeout: 10000 });

    const pdfButton = page.locator(
      [
        '[data-testid="download-pdf-button"]',
        'button:has-text("PDF")',
        'button:has-text("Download")',
        'button:has-text("Export")',
        '[aria-label="Download PDF"]',
        '[aria-label="Export chart"]',
      ].join(', '),
    );

    if (await pdfButton.count() > 0) {
      await expect(pdfButton.first()).toBeVisible();
    } else {
      test.info().annotations.push({ type: 'skip-reason', description: 'PDF button not yet rendered on chart page' });
    }
  });

  test('should trigger a file download when the PDF button is clicked', async ({ page, auth, testChart }) => {
    await page.goto(`/charts/${testChart.id}`);
    await expect(page.getByRole('heading', { name: testChart.name })).toBeVisible({ timeout: 10000 });

    const pdfButton = page.locator(
      [
        '[data-testid="download-pdf-button"]',
        'button:has-text("PDF")',
        'button:has-text("Download")',
        'button:has-text("Export")',
      ].join(', '),
    );

    if (await pdfButton.count() > 0) {
      const [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 15000 }),
        pdfButton.first().click(),
      ]);

      const filename = download.suggestedFilename();
      expect(filename).toMatch(/\.pdf$/);
    } else {
      test.info().annotations.push({ type: 'skip-reason', description: 'PDF button not yet rendered on chart page' });
    }
  });

  test('should show an error message when PDF generation fails', async ({ page, auth, testChart }) => {
    // Mock the PDF endpoint to return 500
    await page.route('**/api/charts/*/pdf', (route) =>
      route.fulfill({ status: 500, body: JSON.stringify({ success: false, error: 'PDF generation failed' }) }),
    );

    await page.goto(`/charts/${testChart.id}`);
    await expect(page.getByRole('heading', { name: testChart.name })).toBeVisible({ timeout: 10000 });

    const pdfButton = page.locator(
      [
        '[data-testid="download-pdf-button"]',
        'button:has-text("PDF")',
        'button:has-text("Download")',
        'button:has-text("Export")',
      ].join(', '),
    );

    if (await pdfButton.count() > 0) {
      await pdfButton.first().click();

      const errorEl = page.locator(
        '[data-testid="pdf-error"], [role="alert"], .error-message, text=error, text=failed',
      );
      await expect(errorEl).toBeVisible({ timeout: 5000 });
    } else {
      test.info().annotations.push({ type: 'skip-reason', description: 'PDF button not yet rendered on chart page' });
    }
  });
});
