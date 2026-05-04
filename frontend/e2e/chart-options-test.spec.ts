/**
 * Chart Creation Options Test
 * Tests all house systems, zodiac types, and sidereal calculation modes
 */
import { test, expect } from './fixtures/auth.fixture';

test.describe('Chart Creation - All Options', () => {
  const HOUSE_SYSTEMS = ['placidus', 'koch', 'porphyry', 'whole', 'equal', 'topocentric'];
  const ZODIAC_TYPES = ['tropical', 'sidereal'];
  const SIDEREAL_MODES = ['lahiri', 'fagan-bradley', 'raman', 'fassbender'];

  // Mock geocoding for all tests in this suite
  test.beforeEach(async ({ page }) => {
    await page.route('**/nominatim.openstreetmap.org/**', (route) => {
      const url = new URL(route.request().url());
      const q = url.searchParams.get('q') || '';
      const limit = parseInt(url.searchParams.get('limit') || '5', 10);

      const suggestions = [
        { display_name: `${q}, UK`, lat: '51.5074', lon: '-0.1278' },
        { display_name: `${q}, UK (2)`, lat: '51.5074', lon: '-0.1278' },
      ].slice(0, limit);

      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(suggestions),
      });
    });
  });

  test('should create chart with Placidus + Tropical', async ({ page, auth }) => {
    await page.goto('/charts/new');
    await fillChartForm(page, {
      chartName: 'Test Placidus Tropical',
      houseSystem: 'Placidus',
      zodiac: 'Tropical',
    });
    await submitAndVerify(page, 'Test Placidus Tropical');
  });

  test('should create chart with Koch + Tropical', async ({ page, auth }) => {
    await page.goto('/charts/new');
    await fillChartForm(page, {
      chartName: 'Test Koch Tropical',
      houseSystem: 'Koch',
      zodiac: 'Tropical',
    });
    await submitAndVerify(page, 'Test Koch Tropical');
  });

  test('should create chart with Porphyry + Tropical', async ({ page, auth }) => {
    await page.goto('/charts/new');
    await fillChartForm(page, {
      chartName: 'Test Porphyry Tropical',
      houseSystem: 'Porphyry',
      zodiac: 'Tropical',
    });
    await submitAndVerify(page, 'Test Porphyry Tropical');
  });

  test('should create chart with Whole Sign + Tropical', async ({ page, auth }) => {
    await page.goto('/charts/new');
    await fillChartForm(page, {
      chartName: 'Test Whole Tropical',
      houseSystem: 'Whole Sign',
      zodiac: 'Tropical',
    });
    await submitAndVerify(page, 'Test Whole Tropical');
  });

  test('should create chart with Equal + Tropical', async ({ page, auth }) => {
    await page.goto('/charts/new');
    await fillChartForm(page, {
      chartName: 'Test Equal Tropical',
      houseSystem: 'Equal',
      zodiac: 'Tropical',
    });
    await submitAndVerify(page, 'Test Equal Tropical');
  });

  test('should create chart with Topocentric + Tropical', async ({ page, auth }) => {
    await page.goto('/charts/new');
    await fillChartForm(page, {
      chartName: 'Test Topocentric Tropical',
      houseSystem: 'Topocentric',
      zodiac: 'Tropical',
    });
    await submitAndVerify(page, 'Test Topocentric Tropical');
  });

  test('should create chart with Placidus + Sidereal Lahiri', async ({ page, auth }) => {
    await page.goto('/charts/new');
    await fillChartForm(page, {
      chartName: 'Test Placidus Sidereal Lahiri',
      houseSystem: 'Placidus',
      zodiac: 'Sidereal',
      siderealMode: 'Lahiri',
    });
    await submitAndVerify(page, 'Test Placidus Sidereal Lahiri');
  });

  test('should create chart with Placidus + Sidereal Fagan-Bradley', async ({ page, auth }) => {
    await page.goto('/charts/new');
    await fillChartForm(page, {
      chartName: 'Test Sidereal Fagan-Bradley',
      houseSystem: 'Placidus',
      zodiac: 'Sidereal',
      siderealMode: 'Fagan-Bradley',
    });
    await submitAndVerify(page, 'Test Sidereal Fagan-Bradley');
  });

  test('should create chart with Placidus + Sidereal Raman', async ({ page, auth }) => {
    await page.goto('/charts/new');
    await fillChartForm(page, {
      chartName: 'Test Sidereal Raman',
      houseSystem: 'Placidus',
      zodiac: 'Sidereal',
      siderealMode: 'Raman',
    });
    await submitAndVerify(page, 'Test Sidereal Raman');
  });

  test('should create chart with Placidus + Sidereal Fassbender', async ({ page, auth }) => {
    await page.goto('/charts/new');
    await fillChartForm(page, {
      chartName: 'Test Sidereal Fassbender',
      houseSystem: 'Placidus',
      zodiac: 'Sidereal',
      siderealMode: 'Fassbender',
    });
    await submitAndVerify(page, 'Test Sidereal Fassbender');
  });

  test('should create chart with Whole Sign + Sidereal Lahiri', async ({ page, auth }) => {
    await page.goto('/charts/new');
    await fillChartForm(page, {
      chartName: 'Test Whole Sidereal Lahiri',
      houseSystem: 'Whole Sign',
      zodiac: 'Sidereal',
      siderealMode: 'Lahiri',
    });
    await submitAndVerify(page, 'Test Whole Sidereal Lahiri');
  });
});

interface ChartFormOptions {
  chartName: string;
  houseSystem: string;
  zodiac: string;
  siderealMode?: string;
}

function houseSystemToValue(label: string): string {
  const map: Record<string, string> = {
    'Placidus': 'placidus',
    'Koch': 'koch',
    'Porphyry': 'porphyry',
    'Whole Sign': 'whole',
    'Equal': 'equal',
    'Topocentric': 'topocentric',
  };
  return map[label] ?? label.toLowerCase();
}

function siderealModeToValue(label: string): string {
  const map: Record<string, string> = {
    'Lahiri': 'lahiri',
    'Fagan-Bradley': 'fagan-bradley',
    'Raman': 'raman',
    'Fassbender': 'fassbender',
  };
  return map[label] ?? label.toLowerCase();
}

async function fillChartForm(page: import('@playwright/test').Page, options: ChartFormOptions) {
  await page.locator('#birthDate').fill('1990-06-15');
  await page.locator('#birthTime').fill('14:30');

  // Fill birth place — wait for geocoding suggestions (mocked)
  const placeInput = page.locator('#birthPlace');
  await placeInput.fill('London');

  const suggestions = page.locator('.absolute.z-10 button');
  await suggestions.first().waitFor({ state: 'visible', timeout: 10000 });
  await suggestions.first().click();

  await page.locator('#chartName').clear();
  await page.locator('#chartName').fill(options.chartName);

  await page.locator('#houseSystem').selectOption({ value: houseSystemToValue(options.houseSystem) });
  await page.locator('#zodiac').selectOption({ value: options.zodiac.toLowerCase() });

  if (options.zodiac === 'Sidereal' && options.siderealMode) {
    // Wait for sidereal mode dropdown to appear
    await expect(page.locator('#siderealMode')).toBeVisible({ timeout: 3000 });
    await page.locator('#siderealMode').selectOption({ value: siderealModeToValue(options.siderealMode) });
  }
}

async function submitAndVerify(page: import('@playwright/test').Page, chartName: string) {
  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  await page.locator('button[type="submit"]').click();

  // Wait for navigation to chart view
  try {
    await page.waitForURL(/\/charts\/[\w-]+/, { timeout: 15000 });
  } catch {
    const errorEl = page.locator('[role="alert"]');
    if (await errorEl.count() > 0) {
      const errorText = await errorEl.first().textContent();
      throw new Error(`Form submission error: ${errorText}`);
    }
    throw new Error('Did not navigate to chart view after submission');
  }

  expect(page.url()).toMatch(/\/charts\/[\w-]+/);

  // Wait for chart to render
  await expect(page.locator('svg, [data-testid="chart-wheel"], .planet-positions, table').first()).toBeVisible({ timeout: 10000 });

  // Check for console errors
  const criticalErrors = consoleErrors.filter(
    (e) => !e.includes('React Router Future Flag') && !e.includes('Download the React DevTools'),
  );
  if (criticalErrors.length > 0) {
    console.log(`Console errors for "${chartName}":`, criticalErrors);
  }
}
