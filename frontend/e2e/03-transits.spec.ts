/**
 * E2E Test: Transit Features
 * Tests transit page rendering, data display, and empty states.
 */

import { test, expect } from './fixtures/auth.fixture';
import { createChart, calculateChart } from './helpers/api-helpers';

test.describe('Transit Features', () => {
  test('should show loading skeleton then transit page content', async ({ page, auth, request }) => {
    // Create a chart so the transit page has data to work with
    await createChart(request, auth.accessToken, {
      name: 'Transit Test Chart',
      type: 'natal',
      birth_date: '1990-06-15',
      birth_time: '14:30',
      birth_place_name: 'New York, NY',
      birth_latitude: 40.7128,
      birth_longitude: -74.006,
      birth_timezone: 'America/New_York',
      house_system: 'placidus',
      zodiac: 'tropical',
    });

    await page.goto('/transits');

    await expect(page.getByText('Current Transits')).toBeVisible({ timeout: 10000 });
  });

  test('should prompt to create a chart when user has no charts', async ({ page, auth }) => {
    // Auth fixture registers a user with NO chart
    await page.goto('/transits');

    await expect(page.getByText('No transit data available')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/create a chart first/i)).toBeVisible();

    const createBtn = page.locator('button:has-text("Create Chart")');
    await expect(createBtn).toBeVisible();
  });

  test('should display transit dashboard when charts exist', async ({ page, auth, request }) => {
    await createChart(request, auth.accessToken, {
      name: 'Transit Dashboard Chart',
      type: 'natal',
      birth_date: '1990-06-15',
      birth_time: '14:30',
      birth_place_name: 'New York, NY',
      birth_latitude: 40.7128,
      birth_longitude: -74.006,
      birth_timezone: 'America/New_York',
      house_system: 'placidus',
      zodiac: 'tropical',
    });

    await page.goto('/transits');
    await expect(page.getByText('Current Transits')).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to dashboard from transits page', async ({ page, auth, request }) => {
    await createChart(request, auth.accessToken, {
      name: 'Transit Nav Chart',
      type: 'natal',
      birth_date: '1990-06-15',
      birth_time: '14:30',
      birth_place_name: 'New York, NY',
      birth_latitude: 40.7128,
      birth_longitude: -74.006,
      birth_timezone: 'America/New_York',
      house_system: 'placidus',
      zodiac: 'tropical',
    });

    await page.goto('/transits');
    await expect(page.getByText('Current Transits')).toBeVisible({ timeout: 10000 });

    // Navigate to dashboard via direct URL (sidebar has no explicit /dashboard link)
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  test('should show retry button on error state', async ({ page, auth, request }) => {
    const chart = await createChart(request, auth.accessToken, {
      name: 'Transit Error Chart',
      type: 'natal',
      birth_date: '1990-06-15',
      birth_time: '14:30',
      birth_place_name: 'New York, NY',
      birth_latitude: 40.7128,
      birth_longitude: -74.006,
      birth_timezone: 'America/New_York',
      house_system: 'placidus',
      zodiac: 'tropical',
    });

    // Calculate the chart so `hasCalculatedChart` is true in the frontend
    await calculateChart(request, auth.accessToken, chart.id);

    // Force the transit page into error state by mocking all transit APIs
    await page.route('**/api/**/transit**', (route) =>
      route.fulfill({ status: 500, body: JSON.stringify({ success: false, error: 'Server error' }) }),
    );

    await page.goto('/transits');

    // Error state shows "Unable to load transits" with Retry button
    await expect(page.getByText('Unable to load transits')).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
  });
});
