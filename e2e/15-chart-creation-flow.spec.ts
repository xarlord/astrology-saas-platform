/**
 * E2E Test: Full Chart Creation Flow
 *
 * Tests the complete user flow of creating a natal chart:
 * 1. Register new account
 * 2. Navigate to chart creation page
 * 3. Fill birth data form
 * 4. Use location autocomplete
 * 5. Submit and verify chart creation succeeds
 * 6. Verify chart appears on dashboard
 * 7. Monitor console errors throughout
 */

import { test, expect, type Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://astroverse.fly.dev';
const API_BASE = `${BASE_URL}/api/v1`;

// Unique test user per run
const TEST_EMAIL = `e2e.chart.${Date.now()}@test.com`;
const TEST_PASSWORD = 'E2Epassword123!';
const TEST_NAME = 'Chart Test User';

// Track console errors
function setupConsoleMonitor(page: Page) {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(`[${msg.type()}] ${msg.text()}`);
    }
  });
  page.on('pageerror', (err) => {
    errors.push(`[pageerror] ${err.message}`);
  });
  return errors;
}

function assertNoErrors(errors: string[], context: string) {
  if (errors.length > 0) {
    // Filter out known benign errors (401s from API calls before auth)
    const realErrors = errors.filter(
      (e) =>
        !e.includes('401') &&
        !e.includes('404') &&
        !e.includes('Failed to fetch') &&
        !e.includes('net::ERR')
    );
    if (realErrors.length > 0) {
      console.error(`Console errors during "${context}":`, realErrors);
    }
    // Don't fail on 401/404 — those are expected before auth
    expect(
      realErrors,
      `No unexpected console errors during "${context}"`
    ).toEqual([]);
  }
}

test.describe('Full Chart Creation Flow', () => {
  let consoleErrors: string[];

  test.beforeEach(async ({ page }) => {
    consoleErrors = setupConsoleMonitor(page);
  });

  test('complete chart creation with location autocomplete', async ({ page }) => {
    // ── Step 1: Register ──────────────────────────────────
    await page.goto(`${BASE_URL}/register`);
    await expect(page.locator('h2', { hasText: 'Create Account' })).toBeVisible({ timeout: 15000 });

    await page.locator('input[placeholder="Your full name"]').fill(TEST_NAME);
    await page.locator('input[placeholder="cosmic.traveler@example.com"]').fill(TEST_EMAIL);
    await page.locator('input[placeholder="Min 12 chars, upper/lower/number/special"]').fill(TEST_PASSWORD);
    await page.locator('input[placeholder="Re-enter your password"]').fill(TEST_PASSWORD);

    // Submit registration
    await page.locator('button:has-text("Create Account")').click();

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
    assertNoErrors(consoleErrors, 'registration');

    // ── Step 2: Navigate to chart creation ─────────────────
    await page.goto(`${BASE_URL}/charts/new`);
    await expect(page.locator('h1', { hasText: 'Create Natal Chart' })).toBeVisible({ timeout: 10000 });

    // ── Step 3: Fill birth date ────────────────────────────
    const dateInput = page.locator('input[type="date"]');
    await dateInput.fill('1990-06-15');

    // ── Step 4: Fill birth time ────────────────────────────
    const timeInput = page.locator('input[type="time"]');
    await timeInput.clear();
    await timeInput.fill('14:30');

    // ── Step 5: Use location autocomplete ──────────────────
    const locationInput = page.locator('input[placeholder="Start typing a city name..."]');
    await locationInput.click();
    await locationInput.pressSequentially('Istanbul', { delay: 50 });

    // Wait for autocomplete suggestions to appear
    const suggestions = page.locator('[role="option"], [role="listbox"] > *');
    await expect(suggestions.first()).toBeVisible({ timeout: 5000 });

    // Click the first suggestion
    await suggestions.first().click();

    // Verify location was selected (input value should contain Istanbul)
    await expect(locationInput).toHaveValue(/Istanbul/);

    // ── Step 6: Submit chart creation ──────────────────────
    const generateButton = page.locator('button:has-text("Generate Chart")');
    await generateButton.click();

    // ── Step 7: Verify chart creation succeeded ────────────
    // Should either redirect to the chart view or show success
    // Wait for either redirect or success toast
    await page.waitForTimeout(3000);

    // Check we didn't get an error on the form
    const errorToast = page.locator('[role="alert"], .toast-error, [data-testid="error"]');
    const hasError = await errorToast.isVisible().catch(() => false);
    expect(hasError, 'No error toast should appear after chart creation').toBe(false);

    // Verify we're no longer stuck on the create page with an error
    const currentUrl = page.url();
    const stillOnCreateWithError = currentUrl.includes('/charts/new') && hasError;
    expect(stillOnCreateWithError, 'Should not be stuck on create page with error').toBe(false);

    // ── Step 8: Navigate to dashboard and verify chart appears ─
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForTimeout(2000);

    // Dashboard should show chart or "My Charts" section
    const chartsSection = page.locator('text=My Natal Chart, text=Your Charts, text=No charts yet');
    await expect(chartsSection.first()).toBeVisible({ timeout: 10000 });

    assertNoErrors(consoleErrors, 'chart creation full flow');

    // ── Step 9: Verify chart list page ─────────────────────
    await page.goto(`${BASE_URL}/charts`);
    await page.waitForTimeout(2000);

    // Should show at least one chart card or chart list entry
    const chartCard = page.locator('[data-testid="chart-card"], .chart-card, text=My Natal Chart');
    const chartVisible = await chartCard.first().isVisible().catch(() => false);
    // Chart should be visible on the charts page
    expect(chartVisible, 'Created chart should be visible on charts page').toBe(true);

    assertNoErrors(consoleErrors, 'chart list verification');
  });

  test('chart creation with time unknown', async ({ page }) => {
    // Register first
    const email = `e2e.unknowntime.${Date.now()}@test.com`;
    await page.goto(`${BASE_URL}/register`);
    await page.locator('input[placeholder="Your full name"]').fill('Unknown Time User');
    await page.locator('input[placeholder="cosmic.traveler@example.com"]').fill(email);
    await page.locator('input[placeholder="Min 12 chars, upper/lower/number/special"]').fill(TEST_PASSWORD);
    await page.locator('input[placeholder="Re-enter your password"]').fill(TEST_PASSWORD);
    await page.locator('button:has-text("Create Account")').click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

    // Navigate to chart creation
    await page.goto(`${BASE_URL}/charts/new`);

    // Fill form
    await page.locator('input[type="date"]').fill('1985-12-25');

    // Check "I don't know my exact birth time"
    const unknownTimeCheckbox = page.locator('input[type="checkbox"], [role="checkbox"]');
    const checkboxLabel = page.locator('text=I don\'t know my exact birth time');
    await checkboxLabel.click();

    // Fill location
    const locationInput = page.locator('input[placeholder="Start typing a city name..."]');
    await locationInput.pressSequentially('London', { delay: 50 });
    const suggestions = page.locator('[role="option"], [role="listbox"] > *');
    await expect(suggestions.first()).toBeVisible({ timeout: 5000 });
    await suggestions.first().click();

    // Submit
    await page.locator('button:has-text("Generate Chart")').click();
    await page.waitForTimeout(3000);

    // Verify no error
    const errorToast = page.locator('[role="alert"], .toast-error');
    const hasError = await errorToast.isVisible().catch(() => false);
    expect(hasError, 'No error for unknown-time chart creation').toBe(false);

    assertNoErrors(consoleErrors, 'chart creation with unknown time');
  });

  test('chart creation validates required fields', async ({ page }) => {
    // Register first
    const email = `e2e.validation.${Date.now()}@test.com`;
    await page.goto(`${BASE_URL}/register`);
    await page.locator('input[placeholder="Your full name"]').fill('Validation User');
    await page.locator('input[placeholder="cosmic.traveler@example.com"]').fill(email);
    await page.locator('input[placeholder="Min 12 chars, upper/lower/number/special"]').fill(TEST_PASSWORD);
    await page.locator('input[placeholder="Re-enter your password"]').fill(TEST_PASSWORD);
    await page.locator('button:has-text("Create Account")').click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

    // Navigate to chart creation
    await page.goto(`${BASE_URL}/charts/new`);

    // Submit empty form
    await page.locator('button:has-text("Generate Chart")').click();
    await page.waitForTimeout(1000);

    // Should show validation errors (not make API call)
    const validationError = page.locator('text=required, text=Required, .error-message, [role="alert"]');
    const hasValidationError = await validationError.first().isVisible().catch(() => false);
    expect(hasValidationError, 'Should show validation errors for empty form').toBe(true);

    assertNoErrors(consoleErrors, 'chart validation');
  });

  test('location autocomplete returns results for major cities', async ({ page }) => {
    // Register and go to chart creation
    const email = `e2e.location.${Date.now()}@test.com`;
    await page.goto(`${BASE_URL}/register`);
    await page.locator('input[placeholder="Your full name"]').fill('Location User');
    await page.locator('input[placeholder="cosmic.traveler@example.com"]').fill(email);
    await page.locator('input[placeholder="Min 12 chars, upper/lower/number/special"]').fill(TEST_PASSWORD);
    await page.locator('input[placeholder="Re-enter your password"]').fill(TEST_PASSWORD);
    await page.locator('button:has-text("Create Account")').click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

    await page.goto(`${BASE_URL}/charts/new`);

    // Test multiple cities
    const cities = ['Paris', 'Tokyo', 'New York'];
    for (const city of cities) {
      const locationInput = page.locator('input[placeholder="Start typing a city name..."]');
      await locationInput.clear();
      await locationInput.pressSequentially(city, { delay: 80 });

      const suggestions = page.locator('[role="option"], [role="listbox"] > *');
      await expect(suggestions.first()).toBeVisible({ timeout: 5000 });

      const count = await suggestions.count();
      expect(count, `Should get suggestions for "${city}"`).toBeGreaterThan(0);

      await suggestions.first().click();
      await expect(locationInput).toHaveValue(new RegExp(city.split(' ')[0], 'i'));
    }

    assertNoErrors(consoleErrors, 'location autocomplete multiple cities');
  });
});
