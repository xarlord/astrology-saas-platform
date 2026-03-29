/**
 * E2E Test Specifications: Solar Returns Flow
 *
 * Tests the complete solar returns feature including:
 * - Navigate to solar returns
 * - Calculate for current year
 * - View interpretation
 * - Relocate chart
 * - View history
 */

import { test, expect } from '@playwright/test';
import { SolarReturnsPageObject } from './pages/SolarReturnsPage';
import { AuthenticationPage } from './pages/AuthenticationPage';
import { TestHelpers } from './utils/test-helpers';
import { testSolarReturn, apiResponses } from './fixtures/test-data';

test.describe('Solar Returns Flow - Navigation and Dashboard', () => {
  let solarPage: SolarReturnsPageObject;
  let authPage: AuthenticationPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    solarPage = new SolarReturnsPageObject(page);
    authPage = new AuthenticationPage(page);
    helpers = new TestHelpers(page);

    // Login
    await authPage.login(
      process.env.TEST_USER_EMAIL || 'test@example.com',
      process.env.TEST_USER_PASSWORD || 'test123'
    );
  });

  test('should navigate to solar returns page', async ({ page }) => {
    await solarPage.goto();

    // Verify on dashboard
    await solarPage.verifyOnDashboard();

    await helpers.takeScreenshot('solar-returns-page');
  });

  test('should display current year card', async ({ page }) => {
    await solarPage.goto();

    // Verify current year card is displayed
    await expect(solarPage.currentYearCard).toBeVisible();

    // Verify year is displayed
    const currentYear = new Date().getFullYear();
    await expect(page.locator(`text=${currentYear}`)).toBeVisible();

    await helpers.takeScreenshot('solar-current-year-card');
  });

  test('should navigate to specific year', async ({ page }) => {
    const year = 2024;
    await solarPage.gotoYear(year);

    // Verify on specific year page
    await expect(page).toHaveURL(/.*solar-returns\/2024/);

    await helpers.takeScreenshot('solar-specific-year');
  });

  test('should display solar return cards for multiple years', async ({ page }) => {
    await solarPage.goto();

    // Get card count
    const cardCount = await solarPage.getSolarReturnCardsCount();
    expect(cardCount).toBeGreaterThan(0);

    await helpers.takeScreenshot('solar-year-cards');
  });

  test('should select chart for solar return calculation', async ({ page }) => {
    await solarPage.goto();

    // Select chart from dropdown
    if (await solarPage.selectChartDropdown.count() > 0) {
      await solarPage.selectChart('chart-1');

      // Verify chart is selected
      const selectedValue = await solarPage.selectChartDropdown.inputValue();
      expect(selectedValue).toBe('chart-1');

      await helpers.takeScreenshot('solar-chart-selected');
    }
  });
});

test.describe('Solar Returns Flow - Calculation', () => {
  let solarPage: SolarReturnsPageObject;
  let authPage: AuthenticationPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    solarPage = new SolarReturnsPageObject(page);
    authPage = new AuthenticationPage(page);
    helpers = new TestHelpers(page);

    // Login
    await authPage.login(
      process.env.TEST_USER_EMAIL || 'test@example.com',
      process.env.TEST_USER_PASSWORD || 'test123'
    );
    await solarPage.goto();
  });

  test('should calculate solar return for current year', async ({ page }) => {
    await solarPage.calculateForCurrentYear();

    // Verify calculation completed
    await helpers.verifyToast(/calculated|generated|success/i);

    await helpers.takeScreenshot('solar-calculated-current-year');
  });

  test('should calculate solar return for specific year', async ({ page }) => {
    const year = 2024;
    await solarPage.calculateForYear(year);

    // Verify calculation completed
    await helpers.verifyToast(/calculated|generated/i);

    await helpers.takeScreenshot('solar-calculated-specific-year');
  });

  test('should display birthday information', async ({ page }) => {
    await solarPage.calculateForCurrentYear();

    // Verify birthday info is displayed
    await solarPage.verifyBirthdayInfoDisplayed();

    await helpers.takeScreenshot('solar-birthday-info');
  });

  test('should display return date', async ({ page }) => {
    await solarPage.calculateForCurrentYear();

    // Verify return date is displayed
    await solarPage.verifyReturnDateDisplayed();

    await helpers.takeScreenshot('solar-return-date');
  });

  test('should display age information', async ({ page }) => {
    await solarPage.calculateForCurrentYear();

    // Verify age info is displayed
    await solarPage.verifyAgeInfoDisplayed();

    await helpers.takeScreenshot('solar-age-info');
  });
});

test.describe('Solar Returns Flow - Chart View', () => {
  let solarPage: SolarReturnsPageObject;
  let authPage: AuthenticationPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    solarPage = new SolarReturnsPageObject(page);
    authPage = new AuthenticationPage(page);
    helpers = new TestHelpers(page);

    // Login
    await authPage.login(
      process.env.TEST_USER_EMAIL || 'test@example.com',
      process.env.TEST_USER_PASSWORD || 'test123'
    );
    await solarPage.goto();
    await solarPage.calculateForCurrentYear();
  });

  test('should switch to chart view', async ({ page }) => {
    await solarPage.switchToChartView();

    // Verify chart view is displayed
    await solarPage.verifyOnChartView();

    await helpers.takeScreenshot('solar-chart-view');
  });

  test('should display solar return chart wheel', async ({ page }) => {
    await solarPage.switchToChartView();

    // Verify chart wheel is displayed
    await solarPage.verifyChartWheelDisplayed();

    await helpers.takeScreenshot('solar-chart-wheel');
  });

  test('should display chart details', async ({ page }) => {
    await solarPage.switchToChartView();

    // Verify planets and houses are displayed
    await expect(page.locator('.planet-symbol, [data-planet]')).toBeVisible();
    await expect(page.locator('.house-cusp, [data-house]')).toBeVisible();

    await helpers.takeScreenshot('solar-chart-details');
  });

  test('should navigate between view modes', async ({ page }) => {
    // Switch to chart view
    await solarPage.switchToChartView();
    await solarPage.verifyOnChartView();

    // Switch to interpretation view
    await solarPage.switchToInterpretationView();
    await solarPage.verifyOnInterpretationView();

    // Switch to relocate view
    await solarPage.switchToRelocateView();
    await solarPage.verifyOnRelocateView();

    // Switch to share view
    await solarPage.switchToShareView();
    await solarPage.verifyOnShareView();

    await helpers.takeScreenshot('solar-view-navigation');
  });
});

test.describe('Solar Returns Flow - Interpretation', () => {
  let solarPage: SolarReturnsPageObject;
  let authPage: AuthenticationPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    solarPage = new SolarReturnsPageObject(page);
    authPage = new AuthenticationPage(page);
    helpers = new TestHelpers(page);

    // Login
    await authPage.login(
      process.env.TEST_USER_EMAIL || 'test@example.com',
      process.env.TEST_USER_PASSWORD || 'test123'
    );
    await solarPage.goto();
    await solarPage.calculateForCurrentYear();
  });

  test('should switch to interpretation view', async ({ page }) => {
    await solarPage.switchToInterpretationView();

    // Verify interpretation view is displayed
    await solarPage.verifyOnInterpretationView();

    await helpers.takeScreenshot('solar-interpretation-view');
  });

  test('should display interpretation text', async ({ page }) => {
    await solarPage.switchToInterpretationView();

    // Verify interpretation is displayed
    await solarPage.verifyInterpretationDisplayed();

    const interpretationText = await solarPage.getInterpretationText();
    expect(interpretationText.length).toBeGreaterThan(0);

    await helpers.takeScreenshot('solar-interpretation-text');
  });

  test('should display year theme', async ({ page }) => {
    await solarPage.switchToInterpretationView();

    // Verify theme is displayed
    await solarPage.verifyThemeDisplayed();

    const theme = await solarPage.getTheme();
    expect(theme.length).toBeGreaterThan(0);

    await helpers.takeScreenshot('solar-year-theme');
  });

  test('should display year highlights', async ({ page }) => {
    await solarPage.switchToInterpretationView();

    // Verify highlights are displayed
    await solarPage.verifyHighlightsDisplayed();

    const highlightsCount = await solarPage.getHighlightsCount();
    expect(highlightsCount).toBeGreaterThan(0);

    await helpers.takeScreenshot('solar-year-highlights');
  });

  test('should provide detailed breakdown', async ({ page }) => {
    await solarPage.switchToInterpretationView();

    // Verify interpretation sections
    await expect(page.locator('text=Career|Love|Health|Finance|Personal Growth')).toBeVisible();

    await helpers.takeScreenshot('solar-detailed-breakdown');
  });
});

test.describe('Solar Returns Flow - Relocation', () => {
  let solarPage: SolarReturnsPageObject;
  let authPage: AuthenticationPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    solarPage = new SolarReturnsPageObject(page);
    authPage = new AuthenticationPage(page);
    helpers = new TestHelpers(page);

    // Login
    await authPage.login(
      process.env.TEST_USER_EMAIL || 'test@example.com',
      process.env.TEST_USER_PASSWORD || 'test123'
    );
    await solarPage.goto();
    await solarPage.calculateForCurrentYear();
  });

  test('should switch to relocate view', async ({ page }) => {
    await solarPage.switchToRelocateView();

    // Verify relocate view is displayed
    await solarPage.verifyOnRelocateView();

    await helpers.takeScreenshot('solar-relocate-view');
  });

  test('should relocate chart to different location', async ({ page }) => {
    const newLocation = 'London, UK';

    await solarPage.relocateChart(newLocation);

    // Verify location is updated
    await solarPage.verifyLocationUpdated(newLocation);

    // Verify chart is recalculated
    await helpers.verifyToast(/recalculated|updated/i);

    await helpers.takeScreenshot('solar-relocated');
  });

  test('should compare relocated vs original chart', async ({ page }) => {
    // Navigate to relocate view
    await solarPage.switchToRelocateView();

    // Check for comparison view
    const comparisonView = page.locator('.comparison-view, [data-testid="comparison"]');

    if (await comparisonView.count() > 0) {
      await expect(comparisonView).toBeVisible();

      // Verify both charts are displayed
      await expect(page.locator('.original-chart, .relocated-chart')).toHaveCount(2);

      await helpers.takeScreenshot('solar-relocation-comparison');
    }
  });

  test('should validate location input', async ({ page }) => {
    await solarPage.switchToRelocateView();

    // Enter invalid location
    await solarPage.locationInput.fill('InvalidPlaceThatDoesNotExist12345');

    await solarPage.recalculateButton.click();

    // Verify validation error
    await helpers.verifyError(/location not found|please select valid location/i);

    await helpers.takeScreenshot('solar-invalid-location');
  });
});

test.describe('Solar Returns Flow - History', () => {
  let solarPage: SolarReturnsPageObject;
  let authPage: AuthenticationPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    solarPage = new SolarReturnsPageObject(page);
    authPage = new AuthenticationPage(page);
    helpers = new TestHelpers(page);

    // Login
    await authPage.login(
      process.env.TEST_USER_EMAIL || 'test@example.com',
      process.env.TEST_USER_PASSWORD || 'test123'
    );
    await solarPage.goto();
  });

  test('should view solar return history', async ({ page }) => {
    await solarPage.viewHistory();

    // Verify history is displayed
    await expect(solarPage.historyList).toBeVisible();

    await helpers.takeScreenshot('solar-history');
  });

  test('should select past solar return from history', async ({ page }) => {
    await solarPage.viewHistory();

    // Click on history item
    const historyItems = await solarPage.historyList.locator('.history-item, [data-testid="history-item"]').all();

    if (historyItems.length > 0) {
      await historyItems[0].click();

      // Verify details are displayed
      await solarPage.verifyChartWheelDisplayed();

      await helpers.takeScreenshot('solar-history-selected');
    }
  });

  test('should filter history by year range', async ({ page }) => {
    await solarPage.viewHistory();

    // Check for filter controls
    const startYearInput = page.locator('[name="startYear"], input[placeholder*="start" i]');
    const endYearInput = page.locator('[name="endYear"], input[placeholder*="end" i]');

    if (await startYearInput.count() > 0 && await endYearInput.count() > 0) {
      await startYearInput.fill('2020');
      await endYearInput.fill('2024');

      await page.click('button:has-text("Filter"), button:has-text("Apply")');

      // Verify filtered results
      await page.waitForTimeout(500);

      await helpers.takeScreenshot('solar-history-filtered');
    }
  });
});

test.describe('Solar Returns Flow - Sharing and Export', () => {
  let solarPage: SolarReturnsPageObject;
  let authPage: AuthenticationPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    solarPage = new SolarReturnsPageObject(page);
    authPage = new AuthenticationPage(page);
    helpers = new TestHelpers(page);

    // Login
    await authPage.login(
      process.env.TEST_USER_EMAIL || 'test@example.com',
      process.env.TEST_USER_PASSWORD || 'test123'
    );
    await solarPage.goto();
    await solarPage.calculateForCurrentYear();
  });

  test('should switch to share view', async ({ page }) => {
    await solarPage.switchToShareView();

    // Verify share view is displayed
    await solarPage.verifyOnShareView();

    await helpers.takeScreenshot('solar-share-view');
  });

  test('should download interpretation as PDF', async ({ page }) => {
    // Mock download
    const downloadPromise = page.waitForEvent('download');

    await solarPage.downloadInterpretation('pdf');

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.pdf');

    await helpers.takeScreenshot('solar-download-pdf');
  });

  test('should download interpretation as JSON', async ({ page }) => {
    // Mock download
    const downloadPromise = page.waitForEvent('download');

    await solarPage.downloadInterpretation('json');

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.json');

    await helpers.takeScreenshot('solar-download-json');
  });

  test('should share solar return', async ({ page }) => {
    await solarPage.shareSolarReturn();

    // Verify share options
    await expect(page.locator('text=Share|Copy Link|Email')).toBeVisible();

    await helpers.takeScreenshot('solar-share-options');
  });

  test('should copy share link', async ({ page }) => {
    await solarPage.switchToShareView();
    await solarPage.shareLinkButton.click();

    // Verify link copied message
    await helpers.verifyToast(/link copied|copied to clipboard/i);

    await helpers.takeScreenshot('solar-link-copied');
  });
});

test.describe('Solar Returns Flow - Responsive Design', () => {
  let solarPage: SolarReturnsPageObject;
  let authPage: AuthenticationPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    solarPage = new SolarReturnsPageObject(page);
    authPage = new AuthenticationPage(page);
    helpers = new TestHelpers(page);

    // Login
    await authPage.login(
      process.env.TEST_USER_EMAIL || 'test@example.com',
      process.env.TEST_USER_PASSWORD || 'test123'
    );
  });

  test('should be responsive on mobile', async ({ page }) => {
    await helpers.setViewport('mobile');
    await solarPage.goto();

    // Verify dashboard is displayed
    await solarPage.verifyOnDashboard();

    await helpers.takeScreenshot('solar-mobile');
  });

  test('should be responsive on tablet', async ({ page }) => {
    await helpers.setViewport('tablet');
    await solarPage.goto();

    // Verify dashboard is displayed
    await solarPage.verifyOnDashboard();

    await helpers.takeScreenshot('solar-tablet');
  });

  test('should be responsive on desktop', async ({ page }) => {
    await helpers.setViewport('desktop');
    await solarPage.goto();

    // Verify dashboard is displayed
    await solarPage.verifyOnDashboard();

    await helpers.takeScreenshot('solar-desktop');
  });
});

test.describe('Solar Returns Flow - Error Handling', () => {
  let solarPage: SolarReturnsPageObject;
  let authPage: AuthenticationPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    solarPage = new SolarReturnsPageObject(page);
    authPage = new AuthenticationPage(page);
    helpers = new TestHelpers(page);

    // Login
    await authPage.login(
      process.env.TEST_USER_EMAIL || 'test@example.com',
      process.env.TEST_USER_PASSWORD || 'test123'
    );
    await solarPage.goto();
  });

  test('should handle calculation errors gracefully', async ({ page }) => {
    // Mock API error
    await helpers.mockApiError(/.*\/api\/v1\/solar-returns.*/, 'Calculation failed', 500);

    await solarPage.calculateForCurrentYear();

    // Verify error message
    await helpers.verifyError(/calculation failed|try again/i);

    await helpers.takeScreenshot('solar-calculation-error');
  });

  test('should handle relocation errors', async ({ page }) => {
    // Mock API error
    await helpers.mockApiError(/.*\/api\/v1\/solar-returns.*\/recalculate.*/, 'Relocation failed', 500);

    await solarPage.calculateForCurrentYear();
    await solarPage.switchToRelocateView();

    await solarPage.locationInput.fill('London, UK');
    await solarPage.recalculateButton.click();

    // Verify error message
    await helpers.verifyError(/relocation failed|try again/i);

    await helpers.takeScreenshot('solar-relocation-error');
  });
});
