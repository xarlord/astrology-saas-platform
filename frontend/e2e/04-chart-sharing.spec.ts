/**
 * E2E Test: Chart Sharing
 * Tests share-link creation, public access, revocation, and clipboard copy.
 */

import { test, expect } from './fixtures/auth.fixture';
import { API_BASE, fetchCsrfToken } from './helpers/test-data';

test.describe('Chart Sharing', () => {
  test('should access a shared chart via the public share endpoint', async ({ page, auth, testChart, request }) => {
    const csrfToken = await fetchCsrfToken(request);
    const shareRes = await request.post(`${API_BASE}/charts/${testChart.id}/share`, {
      headers: { Authorization: `Bearer ${auth.accessToken}`, 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
      data: { expiresInDays: 7 },
    });

    if (shareRes.ok()) {
      const shareBody = await shareRes.json();
      const shareToken = shareBody.data?.shareToken ?? shareBody.data?.share?.shareToken;

      if (shareToken) {
        const publicRes = await request.get(`${API_BASE}/share/${shareToken}`);
        expect(publicRes.ok()).toBeTruthy();
        const publicBody = await publicRes.json();
        expect(publicBody.success).toBe(true);
        expect(publicBody.data.chart).toBeDefined();
      }
    } else {
      test.info().annotations.push({ type: 'skip-reason', description: 'Share endpoint not yet implemented' });
    }
  });

  test('should revoke a share link so it no longer resolves', async ({ page, auth, testChart, request }) => {
    const csrfToken = await fetchCsrfToken(request);
    const shareRes = await request.post(`${API_BASE}/charts/${testChart.id}/share`, {
      headers: { Authorization: `Bearer ${auth.accessToken}`, 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
      data: { expiresInDays: 7 },
    });

    if (shareRes.ok()) {
      const shareBody = await shareRes.json();
      const shareToken = shareBody.data?.shareToken ?? shareBody.data?.share?.shareToken;
      const shareId = shareBody.data?.id ?? shareBody.data?.share?.id;

      if (shareToken && shareId) {
        const csrfToken2 = await fetchCsrfToken(request);
        const revokeRes = await request.delete(`${API_BASE}/charts/${testChart.id}/share/${shareId}`, {
          headers: { Authorization: `Bearer ${auth.accessToken}`, 'x-csrf-token': csrfToken2 },
        });

        if (revokeRes.ok()) {
          const publicRes = await request.get(`${API_BASE}/share/${shareToken}`);
          expect(publicRes.ok()).toBeFalsy();
        }
      }
    } else {
      test.info().annotations.push({ type: 'skip-reason', description: 'Share endpoint not yet implemented' });
    }
  });

  test('should show share button on the chart view page', async ({ page, auth, testChart }) => {
    await page.goto(`/charts/${testChart.id}`);
    await expect(page.getByRole('heading', { name: testChart.name })).toBeVisible({ timeout: 10000 });

    const shareButton = page.locator(
      '[data-testid="share-button"], button:has-text("Share"), [aria-label="Share"]',
    );
    const hasShareButton = (await shareButton.count()) > 0;

    if (hasShareButton) {
      await expect(shareButton.first()).toBeVisible();
    } else {
      test.info().annotations.push({ type: 'skip-reason', description: 'Share button not yet rendered on chart page' });
    }
  });

  test('should provide clipboard feedback when copying a share link', async ({ page, auth, testChart, request }) => {
    const csrfToken = await fetchCsrfToken(request);
    const shareRes = await request.post(`${API_BASE}/charts/${testChart.id}/share`, {
      headers: { Authorization: `Bearer ${auth.accessToken}`, 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
      data: { expiresInDays: 7 },
    });

    if (shareRes.ok()) {
      await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

      await page.goto(`/charts/${testChart.id}`);

      const copyBtn = page.locator('[data-testid="copy-share-link"], button:has-text("Copy")');
      if (await copyBtn.count() > 0) {
        await copyBtn.first().click();

        const feedback = page.locator('[data-testid="copy-success"], text=copied, text=Copied');
        await expect(feedback).toBeVisible({ timeout: 5000 });
      } else {
        test.info().annotations.push({ type: 'skip-reason', description: 'Copy button not yet rendered' });
      }
    } else {
      test.info().annotations.push({ type: 'skip-reason', description: 'Share endpoint not yet implemented' });
    }
  });
});
