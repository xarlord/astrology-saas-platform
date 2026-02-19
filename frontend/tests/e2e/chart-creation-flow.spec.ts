/**
 * E2E Test Specifications: Chart Creation Flow
 *
 * Tests the complete chart creation and management lifecycle including:
 * - Navigate to chart creation
 * - Fill birth data form
 * - Submit and create chart
 * - View chart details
 * - Edit chart
 * - Delete chart
 * - Chart visualization
 * - Chart analysis
 */

import { test, expect } from '@playwright/test';
import { ChartPage } from './pages/ChartPage';
import { AuthenticationPage } from './pages/AuthenticationPage';
import { TestHelpers } from './utils/test-helpers';
import { testCharts, apiResponses } from './fixtures/test-data';

test.describe('Chart Creation Flow - Basic Creation', () => {
  let chartPage: ChartPage;
  let authPage: AuthenticationPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    chartPage = new ChartPage(page);
    authPage = new AuthenticationPage(page);
    helpers = new TestHelpers(page);

    // Login before each test
    await authPage.login(
      process.env.TEST_USER_EMAIL || 'test@example.com',
      process.env.TEST_USER_PASSWORD || 'test123'
    );
    await helpers.waitForLoading();
  });

  test('should navigate to chart creation page', async ({ page }) => {
    await chartPage.gotoChartCreation();

    // Verify on chart creation page
    await chartPage.verifyOnChartCreationPage();

    // Verify form fields are present
    await expect(chartPage.chartNameInput).toBeVisible();
    await expect(chartPage.birthDateInput).toBeVisible();
    await expect(chartPage.birthTimeInput).toBeVisible();
    await expect(chartPage.birthPlaceInput).toBeVisible();

    await helpers.takeScreenshot('chart-creation-page');
  });

  test('should create chart with valid data', async ({ page }) => {
    await chartPage.createChart(testCharts.valid);

    // Verify success message
    await helpers.verifyToast(/chart created|success|generated/i);

    // Verify redirect to chart view or dashboard
    await expect(page).toHaveURL(/.*chart.*view|.*dashboard/);

    // Verify chart is created
    await chartPage.verifyChartDetails(testCharts.valid.name);

    await helpers.takeScreenshot('chart-created-successfully');
  });

  test('should validate required chart fields', async ({ page }) => {
    await chartPage.gotoChartCreation();

    // Submit empty form
    await chartPage.createChartButton.click();

    // Verify validation errors
    await helpers.verifyError(/required|please enter/i);

    // Count validation errors
    const validationErrors = await page.locator('.error, .validation-error').count();
    expect(validationErrors).toBeGreaterThanOrEqual(3);

    await helpers.takeScreenshot('chart-validation-errors');
  });

  test('should validate birth date format', async ({ page }) => {
    await chartPage.gotoChartCreation();
    await chartPage.fillChartForm({
      name: testCharts.valid.name,
      birth_date: testCharts.invalid.birth_date,
    });

    await chartPage.createChartButton.click();

    // Verify date validation error
    await helpers.verifyError(/valid date|invalid date/i);

    await helpers.takeScreenshot('chart-invalid-date');
  });

  test('should validate birth place', async ({ page }) => {
    await chartPage.gotoChartCreation();
    await chartPage.fillChartForm({
      name: testCharts.valid.name,
      birth_date: testCharts.valid.birth_date,
      birth_place: testCharts.invalid.birth_place,
    });

    await chartPage.createChartButton.click();

    // Verify place validation error
    await helpers.verifyError(/not found|please select|location/i);

    await helpers.takeScreenshot('chart-invalid-place');
  });

  test('should handle time unknown option', async ({ page }) => {
    await chartPage.gotoChartCreation();
    await chartPage.fillChartForm(testCharts.timeUnknown);

    // Verify time input is disabled when time unknown is checked
    if (await chartPage.timeUnknownCheckbox.count() > 0) {
      await expect(chartPage.birthTimeInput).toBeDisabled();
    }

    // Submit form
    await chartPage.createChartButton.click();

    // Verify chart is created
    await helpers.verifyToast(/chart created/i);

    await helpers.takeScreenshot('chart-time-unknown');
  });

  test('should select different house systems', async ({ page }) => {
    await chartPage.gotoChartCreation();

    // Test different house systems
    const houseSystems = ['placidus', 'koch', 'porphyry', 'whole_sign'];

    for (const system of houseSystems) {
      if (await chartPage.houseSystemSelect.count() > 0) {
        await chartPage.houseSystemSelect.selectOption(system);
        const selectedValue = await chartPage.houseSystemSelect.inputValue();
        expect(selectedValue).toBe(system);
      }
    }

    await helpers.takeScreenshot('chart-house-systems');
  });

  test('should select different zodiac types', async ({ page }) => {
    await chartPage.gotoChartCreation();

    // Test different zodiac types
    const zodiacTypes = ['tropical', 'sidereal', 'sidereal_lahiri'];

    for (const type of zodiacTypes) {
      if (await chartPage.zodiacTypeSelect.count() > 0) {
        await chartPage.zodiacTypeSelect.selectOption(type);
        const selectedValue = await chartPage.zodiacTypeSelect.inputValue();
        expect(selectedValue).toContain(type.split('_')[0]);
      }
    }

    await helpers.takeScreenshot('chart-zodiac-types');
  });
});

test.describe('Chart Creation Flow - Chart Viewing', () => {
  let chartPage: ChartPage;
  let authPage: AuthenticationPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    chartPage = new ChartPage(page);
    authPage = new AuthenticationPage(page);
    helpers = new TestHelpers(page);

    // Login and navigate to charts
    await authPage.login(
      process.env.TEST_USER_EMAIL || 'test@example.com',
      process.env.TEST_USER_PASSWORD || 'test123'
    );
    await chartPage.gotoChartsList();
  });

  test('should display chart list', async ({ page }) => {
    // Verify charts are displayed
    const chartCount = await chartPage.getChartCount();
    expect(chartCount).toBeGreaterThan(0);

    // Take screenshot
    await helpers.takeScreenshot('chart-list');
  });

  test('should view chart details', async ({ page }) => {
    // Click on first chart
    await chartPage.clickChart(0);

    // Verify chart wheel is displayed
    await chartPage.verifyChartWheelVisible();

    // Verify planet symbols
    await chartPage.verifyPlanetSymbols(10);

    // Verify house cusps
    await chartPage.verifyHouseCusps();

    await helpers.takeScreenshot('chart-details-view');
  });

  test('should display personality analysis', async ({ page }) => {
    // Click on chart
    await chartPage.clickChart(0);

    // Switch to analysis tab
    await chartPage.switchToAnalysisTab();

    // Verify analysis is displayed
    await expect(page.locator('text=Sun|Moon|Ascendant|Rising')).toBeVisible();

    await helpers.takeScreenshot('chart-personality-analysis');
  });

  test('should switch between analysis tabs', async ({ page }) => {
    await chartPage.clickChart(0);
    await chartPage.switchToAnalysisTab();

    // Test all tabs
    const tabs = [
      { tab: 'overview', selector: 'Overview' },
      { tab: 'planets', selector: 'Planets' },
      { tab: 'houses', selector: 'Houses' },
      { tab: 'aspects', selector: 'Aspects' },
    ];

    for (const { tab, selector } of tabs) {
      const tabButton = page.locator(`[role="tab"]:has-text("${selector}"), button:has-text("${selector}")`);
      if (await tabButton.count() > 0) {
        await tabButton.click();
        await page.waitForTimeout(500);

        // Verify content is displayed
        await expect(page.locator(`.tab-content, [data-tab="${tab}"]`)).toBeVisible();
      }
    }

    await helpers.takeScreenshot('chart-analysis-tabs');
  });

  test('should display planets in signs', async ({ page }) => {
    await chartPage.clickChart(0);
    await chartPage.switchToPlanetsTab();

    // Verify planets are listed
    const planetSigns = page.locator('.planet-sign, [data-planet-sign]');
    await expect(planetSigns.first()).toBeVisible();

    // Count planets (should be at least 10 main planets)
    const planetCount = await planetSigns.count();
    expect(planetCount).toBeGreaterThanOrEqual(10);

    await helpers.takeScreenshot('chart-planets-in-signs');
  });

  test('should display houses', async ({ page }) => {
    await chartPage.clickChart(0);
    await chartPage.switchToHousesTab();

    // Verify houses are displayed
    await expect(page.locator('.house-info, [data-house]')).toBeVisible();

    await helpers.takeScreenshot('chart-houses');
  });

  test('should display aspects', async ({ page }) => {
    await chartPage.clickChart(0);
    await chartPage.switchToAspectsTab();

    // Verify aspects are listed
    const aspects = page.locator('.aspect, [data-aspect]');
    await expect(aspects.first()).toBeVisible();

    await helpers.takeScreenshot('chart-aspects');
  });
});

test.describe('Chart Creation Flow - Chart Editing', () => {
  let chartPage: ChartPage;
  let authPage: AuthenticationPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    chartPage = new ChartPage(page);
    authPage = new AuthenticationPage(page);
    helpers = new TestHelpers(page);

    // Login
    await authPage.login(
      process.env.TEST_USER_EMAIL || 'test@example.com',
      process.env.TEST_USER_PASSWORD || 'test123'
    );
    await chartPage.gotoChartsList();
  });

  test('should edit chart name', async ({ page }) => {
    const newName = 'Updated Chart Name';

    await chartPage.editChart(0, newName);

    // Verify success message
    await helpers.verifyToast(/updated|saved/i);

    // Verify updated name is displayed
    await expect(page.locator(`text=${newName}`)).toBeVisible();

    await helpers.takeScreenshot('chart-edited');
  });

  test('should recalculate chart with different house system', async ({ page }) => {
    await chartPage.clickChart(0);

    // Recalculate with different options
    await chartPage.recalculateChart('whole_sign', 'sidereal');

    // Verify success message
    await helpers.verifyToast(/recalculated|updated/i);

    // Verify updated chart is displayed
    await expect(page.locator('text=Whole Sign|Sidereal')).toBeVisible();

    await helpers.takeScreenshot('chart-recalculated');
  });

  test('should validate edited chart data', async ({ page }) => {
    await chartPage.clickChart(0);
    await chartPage.editChartButton.click();

    // Try to clear required field
    await chartPage.chartNameInput.fill('');
    await chartPage.saveChartButton.click();

    // Verify validation error
    await helpers.verifyError(/required|name is required/i);

    await helpers.takeScreenshot('chart-edit-validation');
  });
});

test.describe('Chart Creation Flow - Chart Deletion', () => {
  let chartPage: ChartPage;
  let authPage: AuthenticationPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    chartPage = new ChartPage(page);
    authPage = new AuthenticationPage(page);
    helpers = new TestHelpers(page);

    // Login
    await authPage.login(
      process.env.TEST_USER_EMAIL || 'test@example.com',
      process.env.TEST_USER_PASSWORD || 'test123'
    );
    await chartPage.gotoChartsList();
  });

  test('should delete chart with confirmation', async ({ page }) => {
    // Get initial chart count
    const initialCount = await chartPage.getChartCount();

    // Delete first chart
    await chartPage.deleteChart(0, true);

    // Verify success message
    await helpers.verifyToast(/deleted|removed/i);

    // Verify chart count decreased
    await page.reload();
    const newCount = await chartPage.getChartCount();
    expect(newCount).toBeLessThan(initialCount);

    await helpers.takeScreenshot('chart-deleted');
  });

  test('should cancel chart deletion', async ({ page }) => {
    const initialCount = await chartPage.getChartCount();

    // Attempt deletion but cancel
    await chartPage.deleteChart(0, false);

    // Verify chart count hasn't changed
    await page.reload();
    const newCount = await chartPage.getChartCount();
    expect(newCount).toBe(initialCount);

    await helpers.takeScreenshot('chart-deletion-cancelled');
  });
});

test.describe('Chart Creation Flow - Chart Search and Filter', () => {
  let chartPage: ChartPage;
  let authPage: AuthenticationPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    chartPage = new ChartPage(page);
    authPage = new AuthenticationPage(page);
    helpers = new TestHelpers(page);

    // Login
    await authPage.login(
      process.env.TEST_USER_EMAIL || 'test@example.com',
      process.env.TEST_USER_PASSWORD || 'test123'
    );
    await chartPage.gotoChartsList();
  });

  test('should search charts by name', async ({ page }) => {
    // Search for a chart
    await chartPage.searchCharts('Test');

    // Verify filtered results
    const chartCards = await chartPage.chartCards.all();
    for (const card of chartCards) {
      const text = await card.textContent();
      expect(text?.toLowerCase()).toContain('test');
    }

    await helpers.takeScreenshot('chart-search-results');
  });

  test('should display pagination', async ({ page }) => {
    // Check if pagination is present
    if (await chartPage.pagination.count() > 0) {
      // Verify page information
      await expect(chartPage.pagination).toContainText(/Page|of|Showing/i);

      // Test next button if enabled
      const nextButton = chartPage.pagination.locator('button:has-text("Next"), a:has-text("Next")');
      if (await nextButton.isEnabled()) {
        const firstChartName = await chartPage.chartCards.first().textContent();

        await nextButton.click();
        await page.waitForTimeout(500);

        const newFirstChartName = await chartPage.chartCards.first().textContent();
        expect(firstChartName).not.toBe(newFirstChartName);
      }

      await helpers.takeScreenshot('chart-pagination');
    }
  });
});

test.describe('Chart Creation Flow - Responsive Design', () => {
  let chartPage: ChartPage;
  let authPage: AuthenticationPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    chartPage = new ChartPage(page);
    authPage = new AuthenticationPage(page);
    helpers = new TestHelpers(page);

    // Login
    await authPage.login(
      process.env.TEST_USER_EMAIL || 'test@example.com',
      process.env.TEST_USER_PASSWORD || 'test123'
    );
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await helpers.setViewport('mobile');
    await chartPage.gotoChartsList();

    // Verify cards stack vertically
    const chartCards = await chartPage.chartCards.all();
    if (chartCards.length >= 2) {
      const firstCard = await chartCards[0].boundingBox();
      const secondCard = await chartCards[1].boundingBox();

      expect(secondCard!.y).toBeGreaterThan(firstCard!.y);
    }

    await helpers.takeScreenshot('chart-list-mobile');
  });

  test('should be responsive on tablet', async ({ page }) => {
    // Set tablet viewport
    await helpers.setViewport('tablet');
    await chartPage.gotoChartsList();

    // Verify content is visible
    await expect(chartPage.chartCards.first()).toBeVisible();

    await helpers.takeScreenshot('chart-list-tablet');
  });

  test('should be responsive on desktop', async ({ page }) => {
    // Set desktop viewport
    await helpers.setViewport('desktop');
    await chartPage.gotoChartsList();

    // Verify content is visible
    await expect(chartPage.chartCards.first()).toBeVisible();

    await helpers.takeScreenshot('chart-list-desktop');
  });
});

test.describe('Chart Creation Flow - API Integration', () => {
  let chartPage: ChartPage;
  let authPage: AuthenticationPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    chartPage = new ChartPage(page);
    authPage = new AuthenticationPage(page);
    helpers = new TestHelpers(page);

    // Login
    await authPage.login(
      process.env.TEST_USER_EMAIL || 'test@example.com',
      process.env.TEST_USER_PASSWORD || 'test123'
    );
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error
    await helpers.mockApiError(/.*\/api\/v1\/charts.*/, 'Server error', 500);

    await chartPage.gotoChartCreation();
    await chartPage.fillChartForm(testCharts.valid);
    await chartPage.createChartButton.click();

    // Verify error message
    await helpers.verifyError(/server error|try again/i);

    await helpers.takeScreenshot('chart-api-error');
  });

  test('should handle network timeout', async ({ page }) => {
    // Mock slow API
    await page.route(/.*\/api\/v1\/charts.*/, (route) => {
      setTimeout(() => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(apiResponses.charts.create.success),
        });
      }, 15000);
    });

    await chartPage.gotoChartCreation();
    await chartPage.fillChartForm(testCharts.valid);
    await chartPage.createChartButton.click();

    // Verify loading indicator
    await expect(page.locator('.loading, .spinner')).toBeVisible();

    await helpers.takeScreenshot('chart-api-timeout');
  });
});
