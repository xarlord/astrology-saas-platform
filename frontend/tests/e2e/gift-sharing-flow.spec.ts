/**
 * E2E Test Specifications: Birthday Gift Sharing
 *
 * @requirement REQ-SR-005
 * @test-case E2E-GIFT-*
 * @coverage full
 *
 * Tests gift purchase and claiming flow
 */

import { test, expect } from '@playwright/test';
import { AuthenticationPage } from './pages/AuthenticationPage';
import { TestHelpers } from './utils/test-helpers';

test.describe('Gift Sharing - Purchase Flow', () => {
  let authPage: AuthenticationPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthenticationPage(page);
    helpers = new TestHelpers(page);

    await authPage.login(
      process.env.TEST_USER_EMAIL || 'test@example.com',
      process.env.TEST_USER_PASSWORD || 'test123'
    );
  });

  test('E2E-GIFT-001: should display gift option on solar returns page', async ({ page }) => {
    await page.goto('/solar-returns');
    await expect(page.locator('button:has-text("Gift"), a:has-text("Gift")')).toBeVisible();
  });

  test('E2E-GIFT-002: should open gift purchase modal', async ({ page }) => {
    await page.goto('/solar-returns');
    await page.click('button:has-text("Gift")');
    await expect(page.locator('.modal, [role="dialog"]')).toBeVisible();
    await expect(page.locator('text=Recipient')).toBeVisible();
  });

  test('E2E-GIFT-003: should enter recipient information', async ({ page }) => {
    await page.goto('/solar-returns');
    await page.click('button:has-text("Gift")');

    await page.fill('[name="recipientName"]', 'Jane Smith');
    await page.fill('[name="recipientEmail"]', 'jane@example.com');
    await page.fill('[name="birthDate"]', '1990-05-15');
    await page.fill('[name="birthTime"]', '14:30');
    await page.fill('[name="birthPlace"]', 'New York, NY');

    await helpers.takeScreenshot('gift-recipient-info');
  });

  test('E2E-GIFT-004: should add personal message', async ({ page }) => {
    await page.goto('/solar-returns');
    await page.click('button:has-text("Gift")');

    await page.fill('[name="personalMessage"]', 'Happy Birthday! Enjoy your reading!');

    await helpers.takeScreenshot('gift-message');
  });

  test('E2E-GIFT-005: should select delivery date', async ({ page }) => {
    await page.goto('/solar-returns');
    await page.click('button:has-text("Gift")');

    await page.fill('[name="deliveryDate"]', '2026-05-15');

    await helpers.takeScreenshot('gift-delivery-date');
  });
});

test.describe('Gift Sharing - Claim Flow', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
  });

  test('E2E-GIFT-006: should display gift claim page', async ({ page }) => {
    await page.goto('/gift/claim/SUN2026-TESTCODE');
    await expect(page.locator('text=Gift, text=Claim')).toBeVisible();
  });

  test('E2E-GIFT-007: should show sender info on claim page', async ({ page }) => {
    await page.goto('/gift/claim/SUN2026-TESTCODE');
    await expect(page.locator('text=John')).toBeVisible();
    await expect(page.locator('.personal-message')).toBeVisible();
  });

  test('E2E-GIFT-008: should claim gift as new user', async ({ page }) => {
    await page.goto('/gift/claim/SUN2026-TESTCODE');

    await page.fill('[name="email"]', 'jane@example.com');
    await page.fill('[name="password"]', 'NewUser123!');
    await page.click('button:has-text("Claim")');

    await helpers.verifyToast(/claimed|success/i);
  });

  test('E2E-GIFT-009: should claim gift as existing user', async ({ page }) => {
    await page.goto('/gift/claim/SUN2026-TESTCODE');

    await page.fill('[name="email"]', 'existing@example.com');
    await page.fill('[name="password"]', 'Existing123!');
    await page.click('button:has-text("Claim")');

    await helpers.verifyToast(/claimed|success/i);
  });

  test('E2E-GIFT-010: should show error for expired gift', async ({ page }) => {
    await page.goto('/gift/claim/SUN2026-EXPIRED');
    await expect(page.locator('text=expired|no longer valid')).toBeVisible();
  });

  test('E2E-GIFT-011: should show error for invalid code', async ({ page }) => {
    await page.goto('/gift/claim/INVALID');
    await expect(page.locator('text=not found|invalid')).toBeVisible();
  });
});

test.describe('Gift Sharing - My Gifts', () => {
  let authPage: AuthenticationPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthenticationPage(page);
    helpers = new TestHelpers(page);

    await authPage.login(
      process.env.TEST_USER_EMAIL || 'test@example.com',
      process.env.TEST_USER_PASSWORD || 'test123'
    );
  });

  test('E2E-GIFT-012: should view sent gifts', async ({ page }) => {
    await page.goto('/account/gifts');
    await expect(page.locator('.gift-list, [data-testid="gifts"]')).toBeVisible();
  });

  test('E2E-GIFT-013: should resend gift email', async ({ page }) => {
    await page.goto('/account/gifts');

    const resendButton = page.locator('button:has-text("Resend")').first();
    if (await resendButton.count() > 0) {
      await resendButton.click();
      await helpers.verifyToast(/sent|resent/i);
    }
  });

  test('E2E-GIFT-014: should view gift status', async ({ page }) => {
    await page.goto('/account/gifts');
    await expect(page.locator('text=Delivered|Pending|Claimed')).toBeVisible();
  });
});
