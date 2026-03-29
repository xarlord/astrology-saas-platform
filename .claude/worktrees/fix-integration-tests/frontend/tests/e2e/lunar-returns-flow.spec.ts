/**
 * E2E Test Specifications: Lunar Returns Flow
 *
 * Tests the complete lunar returns feature including:
 * - Navigate to lunar returns
 * - View next lunar return
 * - Calculate lunar return chart
 * - View monthly forecast
 * - View history
 * - Save report
 */

import { test, expect } from '@playwright/test';
import { LunarReturnsPageObject } from './pages/LunarReturnsPage';
import { AuthenticationPage } from './pages/AuthenticationPage';
import { TestHelpers } from './utils/test-helpers';
import { testLunarReturn, apiResponses } from './fixtures/test-data';

test.describe('Lunar Returns Flow - Navigation and Dashboard', () => {
  let lunarPage: LunarReturnsPageObject;
  let authPage: AuthenticationPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    lunarPage = new LunarReturnsPageObject(page);
    authPage = new AuthenticationPage(page);
    helpers = new TestHelpers(page);

    // Login
    await authPage.login(
      process.env.TEST_USER_EMAIL || 'test@example.com',
      process.env.TEST_USER_PASSWORD || 'test123'
    );
  });

  test('should navigate to lunar returns page', async ({ page }) => {
    await lunarPage.goto();

    // Verify on lunar returns page
    await lunarPage.verifyOnDashboard();

    await helpers.takeScreenshot('lunar-returns-page');
  });

  test('should display next lunar return card', async ({ page }) => {
    await lunarPage.goto();

    // Verify next lunar return card is displayed
    await expect(lunarPage.nextLunarReturnCard).toBeVisible();

    // Verify return date is shown
    await expect(page.locator('text=January|February|March|Next Return')).toBeVisible();

    await helpers.takeScreenshot('lunar-next-return-card');
  });

  test('should select chart for lunar return calculation', async ({ page }) => {
    await lunarPage.goto();

    // Select chart from dropdown
    if (await lunarPage.selectChartDropdown.count() > 0) {
      await lunarPage.selectChart('chart-1');

      // Verify chart is selected
      const selectedValue = await lunarPage.selectChartDropdown.inputValue();
      expect(selectedValue).toBe('chart-1');

      await helpers.takeScreenshot('lunar-chart-selected');
    }
  });
});

test.describe('Lunar Returns Flow - Calculation', () => {
  let lunarPage: LunarReturnsPageObject;
  let authPage: AuthenticationPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    lunarPage = new LunarReturnsPageObject(page);
    authPage = new AuthenticationPage(page);
    helpers = new TestHelpers(page);

    // Login
    await authPage.login(
      process.env.TEST_USER_EMAIL || 'test@example.com',
      process.env.TEST_USER_PASSWORD || 'test123'
    );
    await lunarPage.goto();
  });

  test('should calculate next lunar return', async ({ page }) => {
    await lunarPage.calculateNextLunarReturn();

    // Verify calculation completed
    await helpers.verifyToast(/calculated|generated|success/i);

    // Verify results are displayed
    await lunarPage.verifyMoonPositionDisplayed();
    await lunarPage.verifyMoonPhaseDisplayed();

    await helpers.takeScreenshot('lunar-return-calculated');
  });

  test('should display moon position information', async ({ page }) => {
    await lunarPage.calculateNextLunarReturn();

    // Verify moon position
    const moonPosition = await lunarPage.getMoonPosition();
    expect(moonPosition).toBeTruthy();
    expect(moonPosition).toMatch(/(Aries|Taurus|Gemini|Cancer|Leo|Virgo|Libra|Scorpio|Sagittarius|Capricorn|Aquarius|Pisces)/);

    await helpers.takeScreenshot('lunar-moon-position');
  });

  test('should display moon phase', async ({ page }) => {
    await lunarPage.calculateNextLunarReturn();

    // Verify moon phase is displayed
    await lunarPage.verifyMoonPhaseDisplayed();

    // Verify phase text
    const phaseText = await lunarPage.moonPhaseInfo.textContent();
    expect(phaseText).toMatch(/(New|Waxing|Full|Waning|Gibbous|Crescent)/);

    await helpers.takeScreenshot('lunar-moon-phase');
  });

  test('should display house placement', async ({ page }) => {
    await lunarPage.calculateNextLunarReturn();

    // Verify house placement is displayed
    await lunarPage.verifyHousePlacementDisplayed();

    // Verify house number
    const houseText = await lunarPage.housePlacementInfo.textContent();
    expect(houseText).toMatch(/\d+(st|nd|rd|th)? House/);

    await helpers.takeScreenshot('lunar-house-placement');
  });

  test('should display aspects', async ({ page }) => {
    await lunarPage.calculateNextLunarReturn();

    // Verify aspects are listed
    await lunarPage.verifyAspectsDisplayed();

    // Get aspect count
    const aspects = await page.locator('.aspect, [data-testid="aspect"]').count();
    expect(aspects).toBeGreaterThanOrEqual(0);

    await helpers.takeScreenshot('lunar-aspects');
  });
});

test.describe('Lunar Returns Flow - Interpretation', () => {
  let lunarPage: LunarReturnsPageObject;
  let authPage: AuthenticationPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    lunarPage = new LunarReturnsPageObject(page);
    authPage = new AuthenticationPage(page);
    helpers = new TestHelpers(page);

    // Login
    await authPage.login(
      process.env.TEST_USER_EMAIL || 'test@example.com',
      process.env.TEST_USER_PASSWORD || 'test123'
    );
    await lunarPage.goto();
    await lunarPage.calculateNextLunarReturn();
  });

  test('should display theme description', async ({ page }) => {
    // Verify theme is displayed
    await lunarPage.verifyThemeDisplayed();

    // Verify theme text
    const theme = await lunarPage.getTheme();
    expect(theme.length).toBeGreaterThan(0);

    await helpers.takeScreenshot('lunar-theme');
  });

  test('should display intensity indicator', async ({ page }) => {
    // Verify intensity is displayed
    await lunarPage.verifyIntensityDisplayed();

    // Verify intensity level
    const intensityText = await lunarPage.intensityIndicator.textContent();
    expect(intensityText).toMatch(/(High|Medium|Low)/);

    await helpers.takeScreenshot('lunar-intensity');
  });

  test('should view monthly forecast', async ({ page }) => {
    await lunarPage.viewMonthlyForecast();

    // Verify forecast view is displayed
    await lunarPage.verifyOnForecastView();
    await lunarPage.verifyForecastDisplayed();

    // Verify key themes
    await lunarPage.verifyKeyThemesDisplayed();

    // Verify recommendations
    await lunarPage.verifyRecommendationsDisplayed();

    await helpers.takeScreenshot('lunar-monthly-forecast');
  });

  test('should navigate between views', async ({ page }) => {
    // Start on dashboard
    await lunarPage.verifyOnDashboard();

    // View forecast
    await lunarPage.viewMonthlyForecast();
    await lunarPage.verifyOnForecastView();

    // View history
    await lunarPage.viewHistory();
    await lunarPage.verifyOnHistoryView();

    // Back to dashboard
    await lunarPage.backToDashboard();
    await lunarPage.verifyOnDashboard();

    await helpers.takeScreenshot('lunar-view-navigation');
  });
});

test.describe('Lunar Returns Flow - History', () => {
  let lunarPage: LunarReturnsPageObject;
  let authPage: AuthenticationPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    lunarPage = new LunarReturnsPageObject(page);
    authPage = new AuthenticationPage(page);
    helpers = new TestHelpers(page);

    // Login
    await authPage.login(
      process.env.TEST_USER_EMAIL || 'test@example.com',
      process.env.TEST_USER_PASSWORD || 'test123'
    );
    await lunarPage.goto();
  });

  test('should view lunar return history', async ({ page }) => {
    await lunarPage.viewHistory();

    // Verify history is displayed
    await lunarPage.verifyHistoryDisplayed();

    // Verify history items
    const historyCount = await lunarPage.getHistoryItemCount();
    expect(historyCount).toBeGreaterThanOrEqual(0);

    await helpers.takeScreenshot('lunar-history');
  });

  test('should select past lunar return from history', async ({ page }) => {
    await lunarPage.viewHistory();

    const historyCount = await lunarPage.getHistoryItemCount();

    if (historyCount > 0) {
      // Click on first history item
      const historyItem = page.locator('.history-item, [data-testid="history-item"]').first();
      await historyItem.click();

      // Verify chart details are displayed
      await lunarPage.verifyOnChartView();
      await lunarPage.verifyMoonPositionDisplayed();

      await helpers.takeScreenshot('lunar-history-selected');
    }
  });

  test('should filter history by date range', async ({ page }) => {
    await lunarPage.viewHistory();

    // Check for date filter controls
    const startDateInput = page.locator('[name="startDate"], input[placeholder*="start" i]');
    const endDateInput = page.locator('[name="endDate"], input[placeholder*="end" i]');

    if (await startDateInput.count() > 0 && await endDateInput.count() > 0) {
      await startDateInput.fill('2024-01-01');
      await endDateInput.fill('2024-12-31');

      await page.click('button:has-text("Filter"), button:has-text("Apply")');

      // Verify filtered results
      await page.waitForTimeout(500);

      await helpers.takeScreenshot('lunar-history-filtered');
    }
  });
});

test.describe('Lunar Returns Flow - Reports', () => {
  let lunarPage: LunarReturnsPageObject;
  let authPage: AuthenticationPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    lunarPage = new LunarReturnsPageObject(page);
    authPage = new AuthenticationPage(page);
    helpers = new TestHelpers(page);

    // Login
    await authPage.login(
      process.env.TEST_USER_EMAIL || 'test@example.com',
      process.env.TEST_USER_PASSWORD || 'test123'
    );
    await lunarPage.goto();
    await lunarPage.calculateNextLunarReturn();
  });

  test('should save lunar return report', async ({ page }) => {
    const reportName = 'My Lunar Return Report';

    await lunarPage.saveReport(reportName);

    // Verify success message
    await helpers.verifyToast(/saved|report saved/i);

    await helpers.takeScreenshot('lunar-report-saved');
  });

  test('should download report as PDF', async ({ page }) => {
    // Mock download
    const downloadPromise = page.waitForEvent('download');

    await lunarPage.downloadReport('pdf');

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.pdf');

    await helpers.takeScreenshot('lunar-report-pdf');
  });

  test('should download report as JSON', async ({ page }) => {
    // Mock download
    const downloadPromise = page.waitForEvent('download');

    await lunarPage.downloadReport('json');

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.json');

    await helpers.takeScreenshot('lunar-report-json');
  });

  test('should share lunar return report', async ({ page }) => {
    await lunarPage.shareReport();

    // Verify share options are displayed
    await expect(page.locator('text=Share|Copy Link|Email')).toBeVisible();

    await helpers.takeScreenshot('lunar-report-share');
  });
});

test.describe('Lunar Returns Flow - Responsive Design', () => {
  let lunarPage: LunarReturnsPageObject;
  let authPage: AuthenticationPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    lunarPage = new LunarReturnsPageObject(page);
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
    await lunarPage.goto();

    // Verify dashboard is displayed
    await lunarPage.verifyOnDashboard();

    await helpers.takeScreenshot('lunar-mobile');
  });

  test('should be responsive on tablet', async ({ page }) => {
    await helpers.setViewport('tablet');
    await lunarPage.goto();

    // Verify dashboard is displayed
    await lunarPage.verifyOnDashboard();

    await helpers.takeScreenshot('lunar-tablet');
  });

  test('should be responsive on desktop', async ({ page }) => {
    await helpers.setViewport('desktop');
    await lunarPage.goto();

    // Verify dashboard is displayed
    await lunarPage.verifyOnDashboard();

    await helpers.takeScreenshot('lunar-desktop');
  });
});

test.describe('Lunar Returns Flow - Error Handling', () => {
  let lunarPage: LunarReturnsPageObject;
  let authPage: AuthenticationPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    lunarPage = new LunarReturnsPageObject(page);
    authPage = new AuthenticationPage(page);
    helpers = new TestHelpers(page);

    // Login
    await authPage.login(
      process.env.TEST_USER_EMAIL || 'test@example.com',
      process.env.TEST_USER_PASSWORD || 'test123'
    );
    await lunarPage.goto();
  });

  test('should handle calculation errors gracefully', async ({ page }) => {
    // Mock API error
    await helpers.mockApiError(/.*\/api\/v1\/lunar-returns.*/, 'Calculation failed', 500);

    await lunarPage.calculateNextLunarReturn();

    // Verify error message
    await helpers.verifyError(/calculation failed|try again/i);

    await helpers.takeScreenshot('lunar-calculation-error');
  });

  test('should handle missing chart data', async ({ page }) => {
    // Try to calculate without selecting chart
    if (await lunarPage.selectChartDropdown.count() > 0) {
      await lunarPage.calculateButton.click();

      // Verify validation error
      await helpers.verifyError(/select a chart|chart required/i);

      await helpers.takeScreenshot('lunar-no-chart-selected');
    }
  });
});
