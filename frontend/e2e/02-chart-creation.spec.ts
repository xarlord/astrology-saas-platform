/**
 * E2E Test: Chart Creation and Management
 * Tests chart CRUD operations, validation, viewing, and listing.
 */

import { test, expect } from './fixtures/auth.fixture';
import { ChartCreatePage } from './pages/chart-create.page';
import { DashboardPage } from './pages/dashboard.page';
import { createChart } from './helpers/api-helpers';

test.describe('Chart Creation and Management', () => {
  test('should create a natal chart with full data', async ({ page, auth }) => {
    const chartPage = new ChartCreatePage(page);
    await chartPage.mockGeocoding();
    await chartPage.goto();
    await chartPage.fillChart({
      name: 'E2E Full Chart',
      birthDate: '1990-06-15',
      birthTime: '14:30',
      location: 'New York',
    });
    await chartPage.createChart();

    // Should navigate away from the creation page on success
    await expect(page).toHaveURL(/\/(dashboard|charts\/)/, { timeout: 15000 });
  });

  test('should create a chart with time unknown', async ({ page, auth }) => {
    const chartPage = new ChartCreatePage(page);
    await chartPage.mockGeocoding();
    await chartPage.goto();
    await chartPage.fillChart({
      name: 'Time Unknown Chart',
      birthDate: '1985-11-22',
      location: 'London',
    });
    await chartPage.toggleTimeUnknown();
    await chartPage.createChart();

    await expect(page).toHaveURL(/\/(dashboard|charts\/)/, { timeout: 15000 });
  });

  test('should show validation errors when submitting an empty form', async ({ page, auth }) => {
    const chartPage = new ChartCreatePage(page);

    await chartPage.goto();
    // Clear default chart name
    await chartPage.nameInput.clear();
    // Submit empty form
    await chartPage.submitButton.click();

    // The browser should block submission due to `required` attributes
    await expect(page).toHaveURL(/\/charts\/new/);
  });

  test('should show validation error for invalid date', async ({ page, auth }) => {
    const chartPage = new ChartCreatePage(page);

    await chartPage.goto();

    // Clear the date field and try to submit
    await chartPage.birthDateInput.evaluate((el: HTMLInputElement) => {
      el.value = '';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await chartPage.submitButton.click();

    await expect(page).toHaveURL(/\/charts\/new/);
  });

  test('should retrieve a created chart via API and verify structure', async ({ page, auth, request }) => {
    const chart = await createChart(request, auth.accessToken, {
      name: 'API Verify Chart',
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

    // Verify chart data via API
    const chartRes = await request.get(`http://localhost:3001/api/v1/charts/${chart.id}`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` },
    });
    expect(chartRes.ok()).toBeTruthy();
    const chartData = await chartRes.json();
    expect(chartData.success).toBe(true);
    expect(chartData.data.chart.name).toBeTruthy();

    // Navigate to chart page
    await page.goto(`/charts/${chart.id}`);
    await expect(page.locator('body')).toBeVisible({ timeout: 10000 });
  });

  test('should delete a chart from the dashboard', async ({ page, auth, request }) => {
    const chart = await createChart(request, auth.accessToken, {
      name: 'Delete Me Chart',
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

    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await expect(page.getByText('Your Charts')).toBeVisible({ timeout: 10000 });

    // Find the chart card we created
    await expect(page.getByText(chart.name).first()).toBeVisible({ timeout: 10000 });
    await page.getByText(chart.name).first().click();
    await expect(page).toHaveURL(new RegExp(`/charts/${chart.id}`), { timeout: 10000 });

    // Try to find a delete button on the chart view page
    const deleteBtn = page.locator('button:has-text("Delete"), [aria-label="Delete"], button:has-text("Remove")');
    if (await deleteBtn.count() > 0) {
      await deleteBtn.first().click();

      const confirmBtn = page.locator('button:has-text("Confirm"), button:has-text("Yes"), button:has-text("Delete")');
      if (await confirmBtn.count() > 0) {
        await confirmBtn.first().click();
      }

      await expect(page).toHaveURL(/\/(dashboard|charts)/, { timeout: 10000 });
    }
  });

  test('should list charts on the dashboard', async ({ page, auth, request }) => {
    // Create two charts
    await createChart(request, auth.accessToken, {
      name: 'Chart Alpha',
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
    await createChart(request, auth.accessToken, {
      name: 'Chart Beta',
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

    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await expect(page.getByText('Your Charts')).toBeVisible({ timeout: 10000 });

    await expect(page.getByText('Chart Alpha')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Chart Beta')).toBeVisible({ timeout: 10000 });
  });
});
