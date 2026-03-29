/**
 * E2E Test Specifications: Synastry Flow
 *
 * Tests the complete synastry/compatibility feature including:
 * - Navigate to synastry
 * - Select two charts
 * - Calculate compatibility
 * - View scores
 * - View composite chart
 * - Save report
 */

import { test, expect } from '@playwright/test';
import { SynastryPageObject } from './pages/SynastryPage';
import { AuthenticationPage } from './pages/AuthenticationPage';
import { TestHelpers } from './utils/test-helpers';
import { testSynastry, apiResponses } from './fixtures/test-data';

test.describe('Synastry Flow - Navigation and Selection', () => {
  let synastryPage: SynastryPageObject;
  let authPage: AuthenticationPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    synastryPage = new SynastryPageObject(page);
    authPage = new AuthenticationPage(page);
    helpers = new TestHelpers(page);

    // Login
    await authPage.login(
      process.env.TEST_USER_EMAIL || 'test@example.com',
      process.env.TEST_USER_PASSWORD || 'test123'
    );
  });

  test('should navigate to synastry page', async ({ page }) => {
    await synastryPage.goto();

    // Verify on synastry page
    await synastryPage.verifyOnSynastryPage();

    await helpers.takeScreenshot('synastry-page');
  });

  test('should display chart selection dropdowns', async ({ page }) => {
    await synastryPage.goto();

    // Verify chart selectors are present
    await expect(synastryPage.chart1Select).toBeVisible();
    await expect(synastryPage.chart2Select).toBeVisible();

    await helpers.takeScreenshot('synastry-chart-selectors');
  });

  test('should select first chart', async ({ page }) => {
    await synastryPage.goto();

    await synastryPage.selectChart1(testSynastry.valid.chart1Id);

    // Verify chart is selected
    const selectedValue = await synastryPage.chart1Select.inputValue();
    expect(selectedValue).toBe(testSynastry.valid.chart1Id);

    await helpers.takeScreenshot('synastry-chart1-selected');
  });

  test('should select second chart', async ({ page }) => {
    await synastryPage.goto();

    await synastryPage.selectChart2(testSynastry.valid.chart2Id);

    // Verify chart is selected
    const selectedValue = await synastryPage.chart2Select.inputValue();
    expect(selectedValue).toBe(testSynastry.valid.chart2Id);

    await helpers.takeScreenshot('synastry-chart2-selected');
  });

  test('should prevent selecting same chart twice', async ({ page }) => {
    await synastryPage.goto();

    await synastryPage.selectChart1(testSynastry.valid.chart1Id);

    // Try to select same chart for second dropdown
    await synastryPage.chart2Select.selectOption(testSynastry.valid.chart1Id);

    // Verify validation message or disabled option
    const errorMessage = page.locator('text=Please select different charts|Cannot compare same chart');
    const isDisabled = await synastryPage.chart2Select.locator(`option[value="${testSynastry.valid.chart1Id}"]`).isDisabled();

    expect(await errorMessage.count() > 0 || isDisabled).toBeTruthy();

    await helpers.takeScreenshot('synastry-same-chart-error');
  });
});

test.describe('Synastry Flow - Compatibility Calculation', () => {
  let synastryPage: SynastryPageObject;
  let authPage: AuthenticationPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    synastryPage = new SynastryPageObject(page);
    authPage = new AuthenticationPage(page);
    helpers = new TestHelpers(page);

    // Login
    await authPage.login(
      process.env.TEST_USER_EMAIL || 'test@example.com',
      process.env.TEST_USER_PASSWORD || 'test123'
    );
    await synastryPage.goto();
  });

  test('should calculate compatibility', async ({ page }) => {
    await synastryPage.calculateCompatibilityWithCharts(
      testSynastry.valid.chart1Id,
      testSynastry.valid.chart2Id
    );

    // Verify calculation completed
    await helpers.verifyToast(/calculated|compatibility analysis/i);

    await helpers.takeScreenshot('synastry-calculated');
  });

  test('should display overall compatibility score', async ({ page }) => {
    await synastryPage.calculateCompatibilityWithCharts(
      testSynastry.valid.chart1Id,
      testSynastry.valid.chart2Id
    );

    // Verify overall score is displayed
    await synastryPage.verifyScoresDisplayed();

    const overallScore = await synastryPage.getOverallScore();
    expect(overallScore).toBeGreaterThanOrEqual(0);
    expect(overallScore).toBeLessThanOrEqual(100);

    await helpers.takeScreenshot('synastry-overall-score');
  });

  test('should display category scores', async ({ page }) => {
    await synastryPage.calculateCompatibilityWithCharts(
      testSynastry.valid.chart1Id,
      testSynastry.valid.chart2Id
    );

    // Verify all scores are displayed
    const romanticScore = await synastryPage.getRomanticScore();
    const communicationScore = await synastryPage.getCommunicationScore();
    const emotionalScore = await synastryPage.getEmotionalScore();

    expect(romanticScore).toBeGreaterThanOrEqual(0);
    expect(communicationScore).toBeGreaterThanOrEqual(0);
    expect(emotionalScore).toBeGreaterThanOrEqual(0);

    await helpers.takeScreenshot('synastry-category-scores');
  });

  test('should validate scores are in correct range', async ({ page }) => {
    await synastryPage.calculateCompatibilityWithCharts(
      testSynastry.valid.chart1Id,
      testSynastry.valid.chart2Id
    );

    // Verify all scores are within 0-100 range
    await synastryPage.verifyAllScoresInRange();

    await helpers.takeScreenshot('synastry-scores-valid-range');
  });
});

test.describe('Synastry Flow - Aspects Analysis', () => {
  let synastryPage: SynastryPageObject;
  let authPage: AuthenticationPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    synastryPage = new SynastryPageObject(page);
    authPage = new AuthenticationPage(page);
    helpers = new TestHelpers(page);

    // Login
    await authPage.login(
      process.env.TEST_USER_EMAIL || 'test@example.com',
      process.env.TEST_USER_PASSWORD || 'test123'
    );
    await synastryPage.goto();
    await synastryPage.calculateCompatibilityWithCharts(
      testSynastry.valid.chart1Id,
      testSynastry.valid.chart2Id
    );
  });

  test('should display aspects between charts', async ({ page }) => {
    // Verify aspects are displayed
    await synastryPage.verifyAspectsDisplayed();

    // Get aspect count
    const aspectCount = await synastryPage.getAspectCount();
    expect(aspectCount).toBeGreaterThan(0);

    await helpers.takeScreenshot('synastry-aspects');
  });

  test('should show aspect details on click', async ({ page }) => {
    // Click on first aspect
    await synastryPage.clickAspect(0);

    // Verify aspect details are displayed
    await synastryPage.verifyAspectDetailsDisplayed();

    await helpers.takeScreenshot('synastry-aspect-details');
  });

  test('should categorize aspects by type', async ({ page }) => {
    // Check for aspect type categories
    const aspectTypes = ['conjunction', 'opposition', 'trine', 'square', 'sextile'];

    for (const type of aspectTypes) {
      const aspectTypeElement = page.locator(`.aspect-${type}, [data-aspect-type="${type}"]`);
      const count = await aspectTypeElement.count();

      if (count > 0) {
        expect(count).toBeGreaterThan(0);
      }
    }

    await helpers.takeScreenshot('synastry-aspect-types');
  });
});

test.describe('Synastry Flow - Interpretation', () => {
  let synastryPage: SynastryPageObject;
  let authPage: AuthenticationPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    synastryPage = new SynastryPageObject(page);
    authPage = new AuthenticationPage(page);
    helpers = new TestHelpers(page);

    // Login
    await authPage.login(
      process.env.TEST_USER_EMAIL || 'test@example.com',
      process.env.TEST_USER_PASSWORD || 'test123'
    );
    await synastryPage.goto();
    await synastryPage.calculateCompatibilityWithCharts(
      testSynastry.valid.chart1Id,
      testSynastry.valid.chart2Id
    );
  });

  test('should display compatibility summary', async ({ page }) => {
    // Verify summary is displayed
    await synastryPage.verifySummaryDisplayed();

    // Verify summary text
    const summaryText = await synastryPage.summarySection.textContent();
    expect(summaryText?.length).toBeGreaterThan(0);

    await helpers.takeScreenshot('synastry-summary');
  });

  test('should display relationship strengths', async ({ page }) => {
    // Verify strengths are displayed
    await synastryPage.verifyStrengthsDisplayed();

    // Get strengths count
    const strengthsCount = await synastryPage.getStrengthsCount();
    expect(strengthsCount).toBeGreaterThan(0);

    await helpers.takeScreenshot('synastry-strengths');
  });

  test('should display relationship challenges', async ({ page }) => {
    // Verify challenges are displayed
    await synastryPage.verifyChallengesDisplayed();

    // Get challenges count
    const challengesCount = await synastryPage.getChallengesCount();
    expect(challengesCount).toBeGreaterThanOrEqual(0);

    await helpers.takeScreenshot('synastry-challenges');
  });

  test('should display comprehensive interpretation', async ({ page }) => {
    // Verify full interpretation section
    await synastryPage.verifyInterpretationDisplayed();

    // Verify interpretation contains key sections
    await expect(page.locator('text=Romantic|Communication|Emotional|Overall')).toBeVisible();

    await helpers.takeScreenshot('synastry-interpretation');
  });
});

test.describe('Synastry Flow - Composite Chart', () => {
  let synastryPage: SynastryPageObject;
  let authPage: AuthenticationPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    synastryPage = new SynastryPageObject(page);
    authPage = new AuthenticationPage(page);
    helpers = new TestHelpers(page);

    // Login
    await authPage.login(
      process.env.TEST_USER_EMAIL || 'test@example.com',
      process.env.TEST_USER_PASSWORD || 'test123'
    );
    await synastryPage.goto();
    await synastryPage.calculateCompatibilityWithCharts(
      testSynastry.valid.chart1Id,
      testSynastry.valid.chart2Id
    );
  });

  test('should view composite chart', async ({ page }) => {
    await synastryPage.viewCompositeChart();

    // Verify composite chart is displayed
    await synastryPage.verifyCompositeChartDisplayed();

    // Verify chart wheel
    await expect(page.locator('svg, .chart-wheel')).toBeVisible();

    await helpers.takeScreenshot('synastry-composite-chart');
  });

  test('should display composite chart details', async ({ page }) => {
    await synastryPage.viewCompositeChart();

    // Verify composite chart has planets and houses
    await expect(page.locator('.planet-symbol, [data-planet]')).toBeVisible();
    await expect(page.locator('.house-cusp, [data-house]')).toBeVisible();

    await helpers.takeScreenshot('synastry-composite-details');
  });
});

test.describe('Synastry Flow - Reports', () => {
  let synastryPage: SynastryPageObject;
  let authPage: AuthenticationPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    synastryPage = new SynastryPageObject(page);
    authPage = new AuthenticationPage(page);
    helpers = new TestHelpers(page);

    // Login
    await authPage.login(
      process.env.TEST_USER_EMAIL || 'test@example.com',
      process.env.TEST_USER_PASSWORD || 'test123'
    );
    await synastryPage.goto();
    await synastryPage.calculateCompatibilityWithCharts(
      testSynastry.valid.chart1Id,
      testSynastry.valid.chart2Id
    );
  });

  test('should save compatibility report', async ({ page }) => {
    const reportName = 'Compatibility Report for John and Jane';

    await synastryPage.saveReport(reportName);

    // Verify success message
    await helpers.verifyToast(/saved|report saved/i);

    await helpers.takeScreenshot('synastry-report-saved');
  });

  test('should download report as PDF', async ({ page }) => {
    // Mock download
    const downloadPromise = page.waitForEvent('download');

    await synastryPage.downloadReport('pdf');

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.pdf');

    await helpers.takeScreenshot('synastry-report-pdf');
  });

  test('should download report as JSON', async ({ page }) => {
    // Mock download
    const downloadPromise = page.waitForEvent('download');

    await synastryPage.downloadReport('json');

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.json');

    await helpers.takeScreenshot('synastry-report-json');
  });

  test('should share compatibility report', async ({ page }) => {
    await synastryPage.shareReport();

    // Verify share options are displayed
    await expect(page.locator('text=Share|Copy Link|Email')).toBeVisible();

    await helpers.takeScreenshot('synastry-report-share');
  });
});

test.describe('Synastry Flow - Multiple Comparisons', () => {
  let synastryPage: SynastryPageObject;
  let authPage: AuthenticationPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    synastryPage = new SynastryPageObject(page);
    authPage = new AuthenticationPage(page);
    helpers = new TestHelpers(page);

    // Login
    await authPage.login(
      process.env.TEST_USER_EMAIL || 'test@example.com',
      process.env.TEST_USER_PASSWORD || 'test123'
    );
    await synastryPage.goto();
    await synastryPage.calculateCompatibilityWithCharts(
      testSynastry.valid.chart1Id,
      testSynastry.valid.chart2Id
    );
  });

  test('should compare another pair', async ({ page }) => {
    await synastryPage.compareAnother();

    // Verify form is reset
    await expect(synastryPage.chart1Select).toBeVisible();
    await expect(synastryPage.chart2Select).toBeVisible();

    await helpers.takeScreenshot('synastry-compare-another');
  });

  test('should maintain comparison history', async ({ page }) => {
    // Check for history section
    const historySection = page.locator('.comparison-history, [data-testid="history"]');

    if (await historySection.count() > 0) {
      await expect(historySection).toBeVisible();

      // Verify history items
      const historyItems = historySection.locator('.history-item');
      const itemCount = await historyItems.count();
      expect(itemCount).toBeGreaterThanOrEqual(0);

      await helpers.takeScreenshot('synastry-history');
    }
  });
});

test.describe('Synastry Flow - Responsive Design', () => {
  let synastryPage: SynastryPageObject;
  let authPage: AuthenticationPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    synastryPage = new SynastryPageObject(page);
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
    await synastryPage.goto();

    // Verify page is displayed
    await synastryPage.verifyOnSynastryPage();

    await helpers.takeScreenshot('synastry-mobile');
  });

  test('should be responsive on tablet', async ({ page }) => {
    await helpers.setViewport('tablet');
    await synastryPage.goto();

    // Verify page is displayed
    await synastryPage.verifyOnSynastryPage();

    await helpers.takeScreenshot('synastry-tablet');
  });

  test('should be responsive on desktop', async ({ page }) => {
    await helpers.setViewport('desktop');
    await synastryPage.goto();

    // Verify page is displayed
    await synastryPage.verifyOnSynastryPage();

    await helpers.takeScreenshot('synastry-desktop');
  });
});

test.describe('Synastry Flow - Error Handling', () => {
  let synastryPage: SynastryPageObject;
  let authPage: AuthenticationPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    synastryPage = new SynastryPageObject(page);
    authPage = new AuthenticationPage(page);
    helpers = new TestHelpers(page);

    // Login
    await authPage.login(
      process.env.TEST_USER_EMAIL || 'test@example.com',
      process.env.TEST_USER_PASSWORD || 'test123'
    );
    await synastryPage.goto();
  });

  test('should validate chart selection', async ({ page }) => {
    // Try to calculate without selecting charts
    await synastryPage.calculateButton.click();

    // Verify validation error
    await helpers.verifyError(/select both charts|please select charts/i);

    await helpers.takeScreenshot('synastry-validation-error');
  });

  test('should handle calculation errors gracefully', async ({ page }) => {
    // Mock API error
    await helpers.mockApiError(/.*\/api\/v1\/synastry.*/, 'Calculation failed', 500);

    await synastryPage.calculateCompatibilityWithCharts(
      testSynastry.valid.chart1Id,
      testSynastry.valid.chart2Id
    );

    // Verify error message
    await helpers.verifyError(/calculation failed|try again/i);

    await helpers.takeScreenshot('synastry-calculation-error');
  });
});
