/**
 * Auth Fixture for Playwright E2E Tests
 *
 * Provides a pre-authenticated browser context by:
 * 1. Registering a test user via the API
 * 2. Injecting auth tokens into localStorage
 * 3. Seeding a test chart
 *
 * Usage:
 *   import { test, expect } from './fixtures/auth.fixture';
 *
 *   test('my authenticated test', async ({ page, auth, testChart }) => {
 *     await page.goto('/dashboard');
 *     // Already logged in!
 *   });
 */

import { test as base, type BrowserContext, type APIRequestContext } from '@playwright/test';
import {
  registerAndLogin,
  createChart,
  calculateChart,
  cleanupUser,
  defaultChartData,
  type AuthResponse,
  type Chart,
} from '../helpers/api-helpers';

// --- Types ---

interface AuthFixture {
  /** Auth tokens and user info for the registered test user */
  auth: AuthResponse;
  /** A pre-seeded test chart */
  testChart: Chart;
}

// --- Storage State Helpers ---

/**
 * Build the Zustand auth-storage value that the frontend expects.
 * The frontend uses `persist` middleware with key 'auth-storage'.
 */
function buildZustandAuthStorage(auth: AuthResponse): string {
  return JSON.stringify({
    state: {
      user: auth.user,
      accessToken: auth.accessToken,
      refreshToken: auth.refreshToken,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    },
    version: 0,
  });
}

/**
 * Build localStorage entries that the frontend expects.
 *
 * The frontend stores auth data in two places:
 *   1. Directly in localStorage keys 'accessToken' and 'refreshToken'
 *      (read by the axios interceptor in api.ts)
 *   2. In Zustand's persisted state under 'auth-storage' key
 *      (read by authStore.ts via zustand/middleware/persist)
 */
function buildAuthLocalStorage(auth: AuthResponse): Array<{ name: string; value: string }> {
  return [
    { name: 'accessToken', value: auth.accessToken },
    { name: 'refreshToken', value: auth.refreshToken },
    { name: 'auth-storage', value: buildZustandAuthStorage(auth) },
  ];
}

/**
 * Inject auth state into a Playwright browser context by navigating to the app
 * and setting localStorage values that the frontend reads on startup.
 */
export async function injectAuthState(context: BrowserContext, auth: AuthResponse): Promise<void> {
  const page = await context.newPage();

  // Navigate to the app origin so localStorage is scoped correctly
  const baseUrl = process.env.BASE_URL ?? 'http://localhost:3000';
  await page.goto(baseUrl);

  // Set localStorage items that the frontend expects
  await page.evaluate((entries: Array<{ name: string; value: string }>) => {
    for (const entry of entries) {
      localStorage.setItem(entry.name, entry.value);
    }
  }, buildAuthLocalStorage(auth));

  await page.close();
}

// --- Standalone Setup Function ---

/**
 * Set up authentication by registering a user and seeding data.
 * Returns the auth response and created chart.
 *
 * Can be used in beforeAll/hooks or global setup.
 */
export async function setupAuth(request: APIRequestContext): Promise<{
  auth: AuthResponse;
  chart: Chart;
}> {
  const auth = await registerAndLogin(request);
  const chart = await createChart(request, auth.accessToken, defaultChartData('auth-setup'));
  return { auth, chart };
}

// --- Playwright Test Fixture ---

/**
 * Extended test fixture that automatically provides authentication.
 *
 * The `auth` fixture registers a new test user, injects auth tokens into the
 * browser's localStorage, and exposes the auth data for assertions.
 *
 * The `testChart` fixture depends on `auth` and seeds a test chart via the API.
 *
 * Usage:
 *   import { test, expect } from './fixtures/auth.fixture';
 *
 *   test('my authenticated test', async ({ page, auth, testChart }) => {
 *     await page.goto('/dashboard');
 *     // Already logged in!
 *   });
 */
export const test = base.extend<AuthFixture>({
  auth: async ({ context, request }, use) => {
    // Register a new unique test user via API
    const auth = await registerAndLogin(request);

    // Inject auth tokens into the browser context's localStorage
    await injectAuthState(context, auth);

    // Provide auth data to the test
    await use(auth);

    // Cleanup after test: delete user's charts
    try {
      await cleanupUser(request, auth.accessToken);
    } catch {
      // Best-effort cleanup - don't fail tests on cleanup errors
    }
  },

  testChart: async ({ auth, request }, use) => {
    // Seed a test chart using the authenticated user's token
    const chart = await createChart(request, auth.accessToken, defaultChartData('fixture'));
    // Calculate the chart so it has calculated_data for transit/analysis features
    await calculateChart(request, auth.accessToken, chart.id);

    // Provide chart to the test
    await use(chart);
  },
});

// Re-export expect for convenience
export { expect } from '@playwright/test';

// --- Storage State File Helper ---

/**
 * Build a Playwright storageState object for the given auth response.
 * Used by auth.setup.ts to write the .auth/user.json file.
 */
export function buildStorageState(auth: AuthResponse): {
  cookies: Array<unknown>;
  origins: Array<{
    origin: string;
    localStorage: Array<{ name: string; value: string }>;
  }>;
} {
  return {
    cookies: [],
    origins: [
      {
        origin: process.env.BASE_URL ?? 'http://localhost:3000',
        localStorage: buildAuthLocalStorage(auth),
      },
    ],
  };
}
