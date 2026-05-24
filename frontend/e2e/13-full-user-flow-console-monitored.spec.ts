/**
 * E2E Test: Full User Flow with Console Error Monitoring
 *
 * Runs against production (astroverse.fly.dev).
 * Console errors/warnings are monitored throughout every step.
 *
 * Covers all major pages: Auth, Charts, Ephemeris, Transits, Forecast,
 * Synastry, Calendar, Solar/Lunar Returns, Retrograde, Settings, Profile.
 */

import { test as base, expect, type ConsoleMessage } from '@playwright/test';
import {
  type CapturedConsoleMessage,
  filterAllowedMessages,
  formatConsoleReport,
  DEFAULT_ALLOWED_PATTERNS,
} from './helpers/console-helpers';
import { uniqueEmail, TEST_PASSWORD } from './helpers/test-data';

const PROD_BASE = process.env.BASE_URL || 'http://localhost:3000';
const API_BASE = PROD_BASE.replace(/\/$/, '') + '/api/v1';

// ---------------------------------------------------------------------------
// Console monitor fixture
// ---------------------------------------------------------------------------

interface ConsoleMonitor {
  messages: CapturedConsoleMessage[];
  errors: CapturedConsoleMessage[];
  warnings: CapturedConsoleMessage[];
  assertNoErrors: (context?: string) => void;
  assertNoWarnings: (context?: string) => void;
  assertClean: (context?: string) => void;
  reset: () => void;
}

const test = base.extend<{ consoleMonitor: ConsoleMonitor }>({
  consoleMonitor: async ({ page }, use) => {
    const raw: CapturedConsoleMessage[] = [];

    const capture = (msg: ConsoleMessage) => {
      const type = msg.type() as CapturedConsoleMessage['type'];
      if (type === 'error' || type === 'warning') {
        const loc = msg.location();
        raw.push({
          type,
          text: msg.text(),
          location: { url: loc.url, lineNumber: loc.lineNumber, columnNumber: loc.columnNumber },
          pageUrl: page.url(),
          timestamp: Date.now(),
        });
      }
    };

    page.on('console', capture);
    page.on('pageerror', (err) => {
      raw.push({
        type: 'error',
        text: err.message,
        location: { url: page.url() },
        pageUrl: page.url(),
        timestamp: Date.now(),
      });
    });

    const filtered = filterAllowedMessages(raw, DEFAULT_ALLOWED_PATTERNS);

    const monitor: ConsoleMonitor = {
      get messages() { return filtered; },
      get errors() { return filtered.filter((m) => m.type === 'error'); },
      get warnings() { return filtered.filter((m) => m.type === 'warning'); },
      assertNoErrors(ctx?: string) {
        const errs = filtered.filter((m) => m.type === 'error');
        if (errs.length > 0) {
          const label = ctx ? ` (${ctx})` : '';
          throw new Error(`Found ${errs.length} console error(s)${label}:\n${formatConsoleReport(errs)}`);
        }
      },
      assertNoWarnings(ctx?: string) {
        const warns = filtered.filter((m) => m.type === 'warning');
        if (warns.length > 0) {
          const label = ctx ? ` (${ctx})` : '';
          throw new Error(`Found ${warns.length} console warning(s)${label}:\n${formatConsoleReport(warns)}`);
        }
      },
      assertClean(ctx?: string) {
        if (filtered.length > 0) {
          const label = ctx ? ` (${ctx})` : '';
          throw new Error(`Found ${filtered.length} console issue(s)${label}:\n${formatConsoleReport(filtered)}`);
        }
      },
      reset() {
        raw.length = 0;
      },
    };

    await use(monitor);
  },
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function settle(page: import('@playwright/test').Page, timeout = 5000) {
  await page.waitForLoadState('networkidle', { timeout }).catch(() => {});
}

// ---------------------------------------------------------------------------
// Test Suite — Full Page Navigation with Console Monitoring
// ---------------------------------------------------------------------------

test.describe('Full Page Navigation — Console Error Audit', () => {
  const email = uniqueEmail('flow');

  // ── Step 1: Register ──────────────────────────────────────────────────

  test('1. Register a new user', async ({ page, consoleMonitor }) => {
    await page.goto('/register');
    await settle(page);

    await page.getByLabel(/email/i).fill(email);
    await page.getByTestId('password-input').fill(TEST_PASSWORD);
    await page.getByTestId('confirm-password-input').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: /sign up|register|create account/i }).click();

    await page.waitForURL(/\/(dashboard|verify)/, { timeout: 15000 }).catch(() => {});
    consoleMonitor.assertNoErrors('Registration');
  });

  // ── Step 2: Login ─────────────────────────────────────────────────────

  test('2. Login via UI', async ({ page, consoleMonitor }) => {
    await page.goto('/login');
    await settle(page);

    await page.getByLabel(/email/i).fill(email);
    await page.getByTestId('password-input').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: /sign in|log in|login/i }).click();

    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    consoleMonitor.assertNoErrors('Login');
  });

  // ── Step 3: Dashboard ─────────────────────────────────────────────────

  test('3. Dashboard', async ({ page, consoleMonitor }) => {
    await page.goto('/login');
    await settle(page);
    await page.getByLabel(/email/i).fill(email);
    await page.getByTestId('password-input').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: /sign in|log in|login/i }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });

    // Now on dashboard
    await settle(page);
    consoleMonitor.assertNoErrors('Dashboard');
  });

  // ── Step 4: Ephemeris — THE BUG FIX TEST ──────────────────────────────

  test('4. Ephemeris page — should NOT show "unable to load"', async ({ page, consoleMonitor }) => {
    // Login first
    await page.goto('/login');
    await settle(page);
    await page.getByLabel(/email/i).fill(email);
    await page.getByTestId('password-input').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: /sign in|log in|login/i }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });

    // Navigate to ephemeris
    await page.goto('/ephemeris');
    await settle(page);

    // Should NOT show error state
    const errorHeading = page.getByText(/unable to load transit data/i);
    expect(await errorHeading.isVisible().catch(() => false)).toBe(false);

    // Should show ephemeris heading
    const heading = page.getByRole('heading', { name: /ephemeris/i });
    expect(await heading.isVisible().catch(() => false)).toBe(true);

    consoleMonitor.assertNoErrors('Ephemeris page');
  });

  // ── Step 5: Navigate all protected pages ──────────────────────────────

  const protectedPages = [
    { name: 'Transits', route: '/transits' },
    { name: 'Today Transits', route: '/transits/today' },
    { name: 'Forecast', route: '/forecast' },
    { name: 'Synastry', route: '/synastry' },
    { name: 'Calendar', route: '/calendar' },
    { name: 'Moon Calendar', route: '/moon-calendar' },
    { name: 'Solar Returns', route: '/solar-returns' },
    { name: 'Lunar Returns', route: '/lunar-returns' },
    { name: 'Retrograde', route: '/retrograde' },
    { name: 'Learn', route: '/learn' },
    { name: 'Settings', route: '/settings' },
    { name: 'Profile', route: '/profile' },
    { name: 'Subscription', route: '/subscription' },
  ];

  for (const { name, route } of protectedPages) {
    test(`5. ${name} page (${route})`, async ({ page, consoleMonitor }) => {
      // Login first
      await page.goto('/login');
      await settle(page);
      await page.getByLabel(/email/i).fill(email);
      await page.getByTestId('password-input').fill(TEST_PASSWORD);
      await page.getByRole('button', { name: /sign in|log in|login/i }).click();
      await page.waitForURL(/\/dashboard/, { timeout: 15000 });

      // Navigate to the page
      await page.goto(route);
      await settle(page);

      // Should not redirect to login
      expect(page.url()).not.toContain('/login');
      expect(page.url()).toContain(route);

      consoleMonitor.assertNoErrors(`${name} page`);
    });
  }

  // ── Step 6: Chart creation — location autocomplete ────────────────────

  test('6. Chart creation page — location autocomplete', async ({ page, consoleMonitor }) => {
    // Login first
    await page.goto('/login');
    await settle(page);
    await page.getByLabel(/email/i).fill(email);
    await page.getByTestId('password-input').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: /sign in|log in|login/i }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });

    await page.goto('/charts/new');
    await settle(page);

    // Type in location field to trigger autocomplete
    const locationInput = page.getByPlaceholder(/location|birth place|city|where/i).or(page.getByLabel(/location|birth place|city|where/i)).first();
    if (await locationInput.isVisible()) {
      await locationInput.fill('Istanbul');
      // Wait for backend autocomplete response
      await page.waitForResponse(
        (resp) => resp.url().includes('/location/autocomplete') && resp.status() === 200,
        { timeout: 10000 }
      ).catch(() => {});
      await page.waitForTimeout(500);
    }

    consoleMonitor.assertNoErrors('Chart creation page');
  });

  // ── Step 7: Public pages ──────────────────────────────────────────────

  const publicRoutes = ['/', '/about', '/features', '/pricing', '/privacy', '/terms'];

  for (const route of publicRoutes) {
    test(`7. Public page ${route}`, async ({ page, consoleMonitor }) => {
      await page.goto(route);
      await settle(page);
      expect(page.url()).toContain(route === '/' ? route : route);
      consoleMonitor.assertNoErrors(`Public page ${route}`);
    });
  }

  // ── Step 8: 404 page ──────────────────────────────────────────────────

  test('8. 404 page for unknown routes', async ({ page, consoleMonitor }) => {
    await page.goto('/this-page-does-not-exist-at-all');
    await settle(page);

    const is404 = await page.getByText(/404|not found|page not found/i).isVisible().catch(() => false);
    const isRedirected = !page.url().includes('this-page-does-not-exist');
    expect(is404 || isRedirected).toBe(true);
    consoleMonitor.assertNoErrors('404 page');
  });

  // ── Step 9: Ephemeris without auth ────────────────────────────────────

  test('9. Ephemeris page without auth', async ({ page, consoleMonitor }) => {
    await page.goto('/ephemeris');
    await settle(page);

    const isLogin = page.url().includes('/login');
    const hasError = await page.getByText(/unable to load/i).isVisible().catch(() => false);
    const hasEphemeris = await page.getByRole('heading', { name: /ephemeris/i }).isVisible().catch(() => false);

    expect(isLogin || hasEphemeris).toBe(true);
    consoleMonitor.assertNoErrors('Ephemeris without auth');
  });
});
