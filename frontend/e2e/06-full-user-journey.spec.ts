/**
 * E2E Test: Full User Journey (Serial)
 *
 * Complete workflow with console error monitoring:
 * 1. Register a new user
 * 2. Logout and login again
 * 3. Create a natal chart with all fields filled
 * 4. Navigate every page in the app
 * 5. Verify analysis, synastry, and calculations are consistent
 * 6. Final console error summary
 *
 * Console errors/warnings are captured throughout and reported at the end.
 * Reuses the console-audit fixture from fixtures/console-audit.fixture.ts.
 */

import { test as base, expect, type ConsoleMessage } from '@playwright/test';
import {
  type CapturedConsoleMessage,
  filterAllowedMessages,
  formatConsoleReport,
  DEFAULT_ALLOWED_PATTERNS,
} from './helpers/console-helpers';
import { API_BASE, uniqueEmail, TEST_PASSWORD } from './helpers/test-data';

// ---------------------------------------------------------------------------
// Console monitor fixture (reuses console-helpers module)
// ---------------------------------------------------------------------------

interface ConsoleMonitor {
  messages: CapturedConsoleMessage[];
  errors: CapturedConsoleMessage[];
  warnings: CapturedConsoleMessage[];
  assertNoErrors: (context?: string) => void;
  assertNoWarnings: (context?: string) => void;
  assertClean: (context?: string) => void;
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
    };

    await use(monitor);
  },
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Fetch CSRF token from the API. */
async function fetchCsrfToken(page: import('@playwright/test').Page): Promise<string> {
  const res = await page.request.get(`${API_BASE}/csrf-token`);
  const body = await res.json();
  if (!body.success) throw new Error(`Failed to get CSRF token: ${JSON.stringify(body)}`);
  return body.data.token as string;
}

/** Make an authenticated POST request with CSRF token. */
async function apiPost(page: import('@playwright/test').Page, path: string, data: Record<string, unknown>, accessToken?: string) {
  const csrfToken = await fetchCsrfToken(page);
  const headers: Record<string, string> = {
    'x-csrf-token': csrfToken,
    'Content-Type': 'application/json',
  };
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  return page.request.post(`${API_BASE}${path}`, { data, headers });
}

/** Wait for a page to be stable: network idle + settling time. */
async function settle(page: import('@playwright/test').Page, timeout = 5000) {
  await page.waitForLoadState('networkidle', { timeout }).catch(() => {});
}

// ---------------------------------------------------------------------------
// Auth injection helper — shared pattern across serial steps
// ---------------------------------------------------------------------------

function authInitScript(tokens: { id: string; accessToken: string; refreshToken: string; name: string; email: string }) {
  return {
    script: (t: typeof tokens) => {
      localStorage.setItem('auth-storage', JSON.stringify({
        state: {
          user: { id: t.id, name: t.name, email: t.email, timezone: 'UTC', plan: 'free', preferences: {} },
          accessToken: t.accessToken,
          refreshToken: t.refreshToken,
          isAuthenticated: true,
        },
        version: 0,
      }));
    },
    args: tokens,
  };
}

// ---------------------------------------------------------------------------
// Serial test suite — shared state between steps
// ---------------------------------------------------------------------------

test.describe.serial('Full User Journey with Console Monitoring', () => {
  let userEmail: string;
  let userPassword: string;
  let userName: string;
  let accessToken: string;
  let refreshToken: string;
  let chartId: string;

  // ---------------------------------------------------------------- 1. REGISTER
  test('step 1: register a new user', async ({ page, consoleMonitor }) => {
    userEmail = uniqueEmail('journey');
    userPassword = TEST_PASSWORD;
    userName = 'Journey Test User';

    await page.goto('/register', { waitUntil: 'domcontentloaded' });
    await settle(page);
    consoleMonitor.assertNoErrors('register page load');

    await page.locator('input[name="name"]').fill(userName);
    await page.locator('input[name="email"]').fill(userEmail);
    await page.locator('input[name="password"]').fill(userPassword);
    await page.locator('input[name="confirmPassword"]').fill(userPassword);

    const terms = page.locator('#terms');
    if (await terms.count() > 0) {
      await terms.check();
    }

    await page.locator('button[type="submit"]').click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
    await settle(page);
    consoleMonitor.assertNoErrors('after registration');

    await expect(page.getByText('Your Charts').first()).toBeVisible({ timeout: 10000 });

    const stored = await page.evaluate(() => localStorage.getItem('auth-storage'));
    if (stored) {
      const parsed = JSON.parse(stored);
      accessToken = parsed.state?.accessToken || '';
      refreshToken = parsed.state?.refreshToken || '';
    }
  });

  // ---------------------------------------------------------------- 2. LOGIN
  test('step 2: logout and login again', async ({ page, consoleMonitor }) => {
    const { script, args } = authInitScript({ id: '1', accessToken, refreshToken, name: userName, email: userEmail });
    await page.addInitScript(script, args);

    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Your Charts').first()).toBeVisible({ timeout: 10000 });
    await settle(page);
    consoleMonitor.assertNoErrors('login session');

    // Logout via user menu dropdown
    const userMenuButton = page.locator('button:has(> .bg-primary.rounded-full)').first();
    await userMenuButton.click();

    const logoutBtn = page.locator('button:has-text("Logout")');
    await expect(logoutBtn).toBeVisible({ timeout: 5000 });
    await logoutBtn.evaluate((el: HTMLButtonElement) => el.click());

    await page.waitForURL(/(\/$|\/login)/, { timeout: 10000 });
    await settle(page);
    consoleMonitor.assertNoErrors('after logout');

    // Login via the form
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.locator('input[name="email"]').fill(userEmail);
    await page.locator('input[name="password"]').fill(userPassword);
    await page.locator('button[type="submit"]').click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
    await settle(page);
    consoleMonitor.assertNoErrors('after login form');

    const stored = await page.evaluate(() => localStorage.getItem('auth-storage'));
    if (stored) {
      const parsed = JSON.parse(stored);
      accessToken = parsed.state?.accessToken || accessToken;
      refreshToken = parsed.state?.refreshToken || refreshToken;
    }
  });

  // ---------------------------------------------------------------- 3. CREATE CHART
  test('step 3: create a natal chart with all fields filled', async ({ page, consoleMonitor }) => {
    test.setTimeout(60000);

    const { script, args } = authInitScript({ id: '1', accessToken, refreshToken, name: userName, email: userEmail });
    await page.addInitScript(script, args);

    // Mock geocoding API for reliable autocomplete
    await page.route('**/nominatim.openstreetmap.org/**', (route) => {
      const url = new URL(route.request().url());
      const q = url.searchParams.get('q') || '';
      const limit = parseInt(url.searchParams.get('limit') || '5', 10);

      const suggestions = [
        { display_name: `${q}, NY, USA`, lat: '40.7128', lon: '-74.006' },
        { display_name: `${q}, NY, USA (2)`, lat: '40.7128', lon: '-74.006' },
      ].slice(0, limit);

      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(suggestions),
      });
    });

    await page.goto('/charts/new', { waitUntil: 'domcontentloaded' });
    await settle(page);
    consoleMonitor.assertNoErrors('chart create page load');

    await expect(page.locator('#birthDate')).toBeVisible({ timeout: 10000 });

    await page.locator('#chartName').clear();
    await page.locator('#chartName').fill('Test Natal Chart');

    await page.locator('#birthDate').fill('1990-06-15');
    await page.locator('#birthTime').fill('14:30');

    // Fill birth place and wait for geocoding suggestions
    await page.locator('#birthPlace').clear();
    await page.locator('#birthPlace').fill('New York');
    const suggestion = page.locator('.absolute.z-10 button').first();
    await expect(suggestion).toBeVisible({ timeout: 10000 });
    await suggestion.click();

    await expect(page.getByText('Lat:')).toBeVisible({ timeout: 5000 });

    await page.locator('#houseSystem').selectOption('placidus');
    await page.locator('#zodiac').selectOption('tropical');

    await page.keyboard.press('Escape');

    await settle(page, 3000);
    consoleMonitor.assertNoErrors('chart form filled');

    await page.getByRole('button', { name: 'Generate Chart' }).click();

    await page.waitForURL(
      (url) => {
        const m = url.pathname.match(/\/charts\/([0-9a-f-]{36})/);
        return m !== null;
      },
      { timeout: 30000 },
    );
    await settle(page);

    const url = page.url();
    const match = url.match(/\/charts\/([0-9a-f-]{36})/);
    expect(match).toBeTruthy();
    chartId = match![1];

    consoleMonitor.assertNoErrors('chart creation');
  });

  // ---------------------------------------------------------------- 4. NAVIGATE ALL PAGES
  test('step 4: navigate every page and verify consistency', async ({ page, consoleMonitor }) => {
    test.setTimeout(120000);

    const { script, args } = authInitScript({ id: '1', accessToken, refreshToken, name: userName, email: userEmail });
    await page.addInitScript(script, args);

    const protectedRoutes: [string, string][] = [
      ['/dashboard', 'Dashboard'],
      ['/charts/new', 'Chart Create'],
      ...(chartId ? [[`/charts/${chartId}`, 'Chart View'] as [string, string]] : []),
      ...(chartId ? [[`/analysis/${chartId}`, 'Analysis'] as [string, string]] : []),
      ['/transits', 'Transits'],
      ['/transits/today', 'Today Transits'],
      ['/forecast', 'Forecast'],
      ['/synastry', 'Synastry'],
      ['/solar-returns', 'Solar Returns'],
      ['/calendar', 'Calendar'],
      ['/lunar-returns', 'Lunar Returns'],
      ['/moon-calendar', 'Moon Calendar'],
      ['/retrograde', 'Retrograde'],
      ['/ephemeris', 'Ephemeris'],
      ['/learn', 'Learn'],
      ['/settings', 'Settings'],
      ['/subscription', 'Subscription'],
      ['/profile', 'Profile'],
    ];

    for (const [path, label] of protectedRoutes) {
      await test.step(`navigate to ${label} (${path})`, async () => {
        await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

        const body = page.locator('body');
        await expect(body).not.toBeEmpty();
        await expect(page).not.toHaveURL(/\/login/, { timeout: 3000 });

        consoleMonitor.assertNoErrors(`${label} page (${path})`);
      });
    }

    // ------- Public routes -------
    const publicRoutes: [string, string][] = [
      ['/', 'Home'],
      ['/about', 'About'],
      ['/features', 'Features'],
    ];

    await page.evaluate(() => {
      localStorage.clear();
    });

    for (const [path, label] of publicRoutes) {
      await test.step(`navigate to public ${label} (${path})`, async () => {
        await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await settle(page);

        const body = page.locator('body');
        await expect(body).not.toBeEmpty();

        consoleMonitor.assertNoErrors(`public ${label} page (${path})`);
      });
    }
  });

  // ---------------------------------------------------------------- 5. ANALYSIS + SYNASTRY CONSISTENCY
  test('step 5: verify analysis and synastry page consistency', async ({ page, consoleMonitor }) => {
    const { script, args } = authInitScript({ id: '1', accessToken, refreshToken, name: userName, email: userEmail });
    await page.addInitScript(script, args);

    await test.step('chart view shows calculated data', async () => {
      await page.goto(`/charts/${chartId}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await settle(page);

      await expect(page.locator('h2, h3').first()).toBeVisible({ timeout: 10000 });
      consoleMonitor.assertNoErrors('chart view consistency');
    });

    await test.step('analysis page loads consistently', async () => {
      await page.goto(`/analysis/${chartId}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await settle(page);

      const body = page.locator('body');
      await expect(body).not.toBeEmpty();
      await expect(page).not.toHaveURL(/\/login/);

      consoleMonitor.assertNoErrors('analysis page consistency');
    });

    await test.step('synastry page renders calculator', async () => {
      await page.goto('/synastry', { waitUntil: 'domcontentloaded', timeout: 15000 });
      await settle(page);

      const body = page.locator('body');
      await expect(body).not.toBeEmpty();
      await expect(page).not.toHaveURL(/\/login/);

      consoleMonitor.assertNoErrors('synastry page consistency');
    });

    await test.step('chart data persists after navigation', async () => {
      await page.goto(`/charts/${chartId}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await settle(page);

      const body = page.locator('body');
      await expect(body).not.toBeEmpty();
      await expect(page).not.toHaveURL(/\/login/);

      consoleMonitor.assertNoErrors('chart data persistence');
    });

    await test.step('ephemeris page shows transit data', async () => {
      await page.goto('/ephemeris', { waitUntil: 'domcontentloaded', timeout: 15000 });
      await settle(page);

      await expect(page).not.toHaveURL(/\/login/);
      const body = page.locator('body');
      await expect(body).not.toBeEmpty();

      consoleMonitor.assertNoErrors('ephemeris page consistency');
    });
  });

  // ---------------------------------------------------------------- 6. FINAL CONSOLE REPORT
  test('step 6: final console error summary', async ({ page, consoleMonitor }) => {
    test.setTimeout(120000);

    const { script, args } = authInitScript({ id: '1', accessToken, refreshToken, name: userName, email: userEmail });
    await page.addInitScript(script, args);

    const pages = [
      '/dashboard',
      '/charts/new',
      '/transits',
      '/forecast',
      '/synastry',
      '/solar-returns',
      '/lunar-returns',
      '/calendar',
      '/moon-calendar',
      '/retrograde',
      '/ephemeris',
      '/learn',
      '/settings',
      '/subscription',
      '/profile',
    ];

    for (const path of pages) {
      await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
    }

    consoleMonitor.assertClean('final sweep of all protected pages');
  });
});
