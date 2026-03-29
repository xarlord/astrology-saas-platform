/**
 * Console Audit E2E Spec
 *
 * Navigates every route in the app and asserts zero browser console errors
 * and warnings. Numbered 00- to run first in CI for fast feedback.
 *
 * Uses console-audit fixture with storageState for authenticated routes.
 * The storageState file (e2e/.auth/user.json) is pre-seeded manually or by setup.
 */

import { createConsoleAuditFixture } from './fixtures/console-audit.fixture';
import { test as base, expect } from '@playwright/test';

// Allowlist patterns for messages that are expected when backend is unavailable
const API_DOWN_PATTERNS: RegExp[] = [
  // Network errors from failed API calls when backend is down
  /Failed to fetch/,
  /Network Error/,
  /Request failed with status code/,
  /ERR_CONNECTION_REFUSED/,
  /net::ERR_CONNECTION_REFUSED/,
  // React Query retry errors
  /Error:.*Request failed/,
  // Axios timeout/connection errors
  /timeout of.*exceeded/,
  /ECONNREFUSED/,
];

// Public test (no auth state)
const publicTest = createConsoleAuditFixture(base, {
  allowedPatterns: API_DOWN_PATTERNS,
});

// Authenticated test (with storageState from e2e/.auth/user.json)
const authTest = createConsoleAuditFixture(base, {
  allowedPatterns: API_DOWN_PATTERNS,
});

// Allow 2 seconds after networkidle for late console messages (lazy imports, SW)
const SETTLE_MS = 2000;

// ─── Public Routes ──────────────────────────────────────────────────────────

publicTest.describe('Console Audit — Public Routes', () => {
  publicTest('Home / has no console errors', async ({ page, assertCleanConsole }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(SETTLE_MS);
    assertCleanConsole();
  });

  publicTest('Login /login has no console errors', async ({ page, assertCleanConsole }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(SETTLE_MS);
    assertCleanConsole();
  });

  publicTest('Register /register has no console errors', async ({ page, assertCleanConsole }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(SETTLE_MS);
    assertCleanConsole();
  });
});

// ─── Protected Routes ───────────────────────────────────────────────────────

authTest.describe('Console Audit — Protected Routes', () => {
  authTest('Dashboard /dashboard has no console errors', async ({ page, assertCleanConsole }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(SETTLE_MS);
    assertCleanConsole();
  });

  authTest('Chart Create /charts/new has no console errors', async ({ page, assertCleanConsole }) => {
    await page.goto('/charts/new');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(SETTLE_MS);
    assertCleanConsole();
  });

  authTest('Transits /transits has no console errors', async ({ page, assertCleanConsole }) => {
    await page.goto('/transits');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(SETTLE_MS);
    assertCleanConsole();
  });

  authTest('Profile /profile has no console errors', async ({ page, assertCleanConsole }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(SETTLE_MS);
    assertCleanConsole();
  });

  authTest('Synastry /synastry has no console errors', async ({ page, assertCleanConsole }) => {
    await page.goto('/synastry');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(SETTLE_MS);
    assertCleanConsole();
  });

  authTest('Solar Returns /solar-returns has no console errors', async ({ page, assertCleanConsole }) => {
    await page.goto('/solar-returns');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(SETTLE_MS);
    assertCleanConsole();
  });

  authTest('Calendar /calendar has no console errors', async ({ page, assertCleanConsole }) => {
    await page.goto('/calendar');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(SETTLE_MS);
    assertCleanConsole();
  });

  authTest('Lunar Returns /lunar-returns has no console errors', async ({ page, assertCleanConsole }) => {
    await page.goto('/lunar-returns');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(SETTLE_MS);
    assertCleanConsole();
  });
});
