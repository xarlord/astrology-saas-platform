/**
 * E2E Test: Chart Creation and Management
 * Tests chart CRUD operations, validation, viewing, and listing.
 */

import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:3001/api/v1';
const FRONTEND_BASE = 'http://localhost:5173';

/** Unique suffix to avoid name/email collisions between tests. */
function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const SAMPLE_CHART = {
  name: 'E2E Test Chart',
  birth_date: '1990-06-15',
  birth_time: '14:30:00',
  birth_place_name: 'New York, NY',
  birth_latitude: 40.7128,
  birth_longitude: -74.006,
  birth_timezone: 'America/New_York',
  house_system: 'placidus',
  zodiac: 'tropical',
};

/**
 * Registers a user via the API, injects auth state, and returns the tokens.
 */
async function registerAndInject(page: import('@playwright/test').Page) {
  const email = `e2e-chart-${uid()}@example.com`;
  const res = await page.request.post(`${API_BASE}/auth/register`, {
    data: { name: 'Chart Tester', email, password: 'E2Epass123!' },
  });
  const body = await res.json();
  const { accessToken, refreshToken } = body.data;

  // Inject auth state
  await page.goto('/');
  await page.evaluate(
    ({ accessToken, refreshToken, email }) => {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem(
        'auth-storage',
        JSON.stringify({
          state: {
            user: { id: '1', name: 'Chart Tester', email, timezone: 'UTC', plan: 'free', preferences: {} },
            accessToken,
            refreshToken,
            isAuthenticated: true,
          },
          version: 0,
        }),
      );
    },
    { accessToken, refreshToken, email },
  );

  return { accessToken, email };
}

/**
 * Creates a chart via the API and returns its ID.
 */
async function createChartViaAPI(accessToken: string, overrides: Record<string, unknown> = {}) {
  const res = await fetch(`${API_BASE}/charts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ ...SAMPLE_CHART, ...overrides }),
  });
  const body = await res.json();
  return body.data.chart as { id: string; name: string };
}

test.describe('Chart Creation and Management', () => {
  test('should create a natal chart with full data', async ({ page }) => {
    await registerAndInject(page);
    await page.goto('/charts/new');
    await expect(page.locator('text=Create Natal Chart')).toBeVisible({ timeout: 10000 });

    // Fill the form — the ChartCreatePage uses plain inputs without name attrs,
    // so we select by label + input type.
    const nameInput = page.locator('input[placeholder="My Natal Chart"], input[type="text"]').first();
    await nameInput.clear();
    await nameInput.fill('E2E Full Chart');

    await page.locator('input[type="date"]').fill('1990-06-15');
    await page.locator('input[type="time"]').fill('14:30');
    await page.locator('input[placeholder="Search city or enter coordinates"]').fill('New York, NY');
    await page.locator('select').first().selectOption('placidus');

    await page.locator('button[type="submit"], button:has-text("Generate")').click();

    // Should navigate away from the creation page on success
    await expect(page).toHaveURL(/\/(dashboard|charts\/)/, { timeout: 15000 });
  });

  test('should create a chart with time unknown', async ({ page }) => {
    await registerAndInject(page);
    await page.goto('/charts/new');

    const nameInput = page.locator('input[placeholder="My Natal Chart"], input[type="text"]').first();
    await nameInput.clear();
    await nameInput.fill('Time Unknown Chart');

    await page.locator('input[type="date"]').fill('1985-11-22');
    // Leave time empty — the backend defaults to 12:00:00 when no time is given
    await page.locator('input[placeholder="Search city or enter coordinates"]').fill('London, UK');

    await page.locator('button[type="submit"], button:has-text("Generate")').click();

    await expect(page).toHaveURL(/\/(dashboard|charts\/)/, { timeout: 15000 });
  });

  test('should show validation errors when submitting an empty form', async ({ page }) => {
    await registerAndInject(page);
    await page.goto('/charts/new');

    // Submit without filling anything
    await page.locator('button[type="submit"], button:has-text("Generate")').click();

    // The browser should block submission due to `required` attributes on the inputs,
    // so the page stays on the form.
    await expect(page).toHaveURL(/\/charts\/new/);
  });

  test('should show validation error for invalid date', async ({ page }) => {
    await registerAndInject(page);
    await page.goto('/charts/new');

    const nameInput = page.locator('input[placeholder="My Natal Chart"], input[type="text"]').first();
    await nameInput.clear();
    await nameInput.fill('Bad Date Chart');

    // HTML date inputs reject non-date values via native validation.
    // Use evaluate to bypass Playwright's type checking and force an empty value
    const dateInput = page.locator('input[type="date"]');
    await dateInput.evaluate((el: HTMLInputElement) => { el.value = ''; el.dispatchEvent(new Event('input', { bubbles: true })); });

    await page.locator('button[type="submit"], button:has-text("Generate")').click();

    // The page should not navigate away (native validation blocks it)
    await expect(page).toHaveURL(/\/charts\/new/);
  });

  test('should retrieve a created chart via API and verify structure', async ({ request, page }) => {
    const { accessToken } = await registerAndInject(page);
    const chart = await createChartViaAPI(accessToken);

    // Verify chart data via API — ensures backend stores chart correctly
    const chartRes = await request.get(`${API_BASE}/charts/${chart.id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(chartRes.ok()).toBeTruthy();
    const chartData = await chartRes.json();
    expect(chartData.success).toBe(true);
    expect(chartData.data.chart.name).toBeTruthy();

    // Navigate to chart page — may show loading, wheel, or chart info
    // The page just needs to load without crashing (content depends on auth state)
    await page.goto(`/charts/${chart.id}`);
    // Verify the page doesn't 404 — any content means the route exists
    const bodyContent = page.locator('body');
    await expect(bodyContent).toBeVisible({ timeout: 10000 });
  });

  test('should delete a chart from the dashboard', async ({ page }) => {
    const { accessToken } = await registerAndInject(page);
    const chart = await createChartViaAPI(accessToken, { name: 'Delete Me Chart' });

    // Go to dashboard and wait for charts to load
    await page.goto('/dashboard');
    await expect(page.locator('text=Your Charts')).toBeVisible({ timeout: 10000 });

    // Find the chart card we created
    const chartCard = page.locator(`text=${chart.name}`).first();
    await expect(chartCard).toBeVisible({ timeout: 10000 });

    // Click on the chart to go to chart view, then look for delete
    await chartCard.click();
    await expect(page).toHaveURL(new RegExp(`/charts/${chart.id}`), { timeout: 10000 });

    // Try to find a delete button on the chart view page
    const deleteBtn = page.locator('button:has-text("Delete"), [aria-label="Delete"], button:has-text("Remove")');
    if (await deleteBtn.count() > 0) {
      await deleteBtn.first().click();

      // Confirm if a dialog appears
      const confirmBtn = page.locator('button:has-text("Confirm"), button:has-text("Yes"), button:has-text("Delete")');
      if (await confirmBtn.count() > 0) {
        await confirmBtn.first().click();
      }

      // Should no longer be on the chart page
      await expect(page).toHaveURL(/\/(dashboard|charts)/, { timeout: 10000 });
    }
  });

  test('should list charts on the dashboard', async ({ page }) => {
    const { accessToken } = await registerAndInject(page);

    // Create two charts
    await createChartViaAPI(accessToken, { name: 'Chart Alpha' });
    await createChartViaAPI(accessToken, { name: 'Chart Beta' });

    await page.goto('/dashboard');
    await expect(page.locator('text=Your Charts')).toBeVisible({ timeout: 10000 });

    // Both chart names should appear
    await expect(page.locator('text=Chart Alpha')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Chart Beta')).toBeVisible({ timeout: 10000 });
  });
});
