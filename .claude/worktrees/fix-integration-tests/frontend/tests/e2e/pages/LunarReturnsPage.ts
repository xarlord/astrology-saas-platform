/**
 * Lunar Returns Page Object Model
 * Encapsulates lunar returns feature interactions
 */

import { Page, Locator, expect } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';

export class LunarReturnsPageObject {
  readonly page: Page;
  readonly helpers: TestHelpers;

  // Page locators
  readonly dashboardView: Locator;
  readonly chartView: Locator;
  readonly forecastView: Locator;
  readonly historyView: Locator;
  readonly nextLunarReturnCard: Locator;
  readonly calculateButton: Locator;
  readonly selectChartDropdown: Locator;
  readonly viewForecastButton: Locator;
  readonly viewHistoryButton: Locator;
  readonly viewChartButton: Locator;
  readonly moonPositionInfo: Locator;
  readonly moonPhaseInfo: Locator;
  readonly housePlacementInfo: Locator;
  readonly aspectsList: Locator;
  readonly themeDescription: Locator;
  readonly intensityIndicator: Locator;
  readonly forecastText: Locator;
  readonly historyList: Locator;
  readonly saveReportButton: Locator;
  readonly downloadReportButton: Locator;
  readonly shareButton: Locator;
  readonly backToDashboardButton: Locator;
  readonly monthlyForecast: Locator;
  readonly keyThemes: Locator;
  readonly recommendations: Locator;

  constructor(page: Page) {
    this.page = page;
    this.helpers = new TestHelpers(page);

    // Initialize locators
    this.dashboardView = page.locator('[data-view="dashboard"], .lunar-dashboard');
    this.chartView = page.locator('[data-view="chart"], .lunar-chart-view');
    this.forecastView = page.locator('[data-view="forecast"], .lunar-forecast-view');
    this.historyView = page.locator('[data-view="history"], .lunar-history-view');
    this.nextLunarReturnCard = page.locator('.next-lunar-return, [data-testid="next-lunar-return"]');
    this.calculateButton = page.locator('button:has-text("Calculate"), button:has-text("Generate")');
    this.selectChartDropdown = page.locator('[name="chart"], [data-testid="chart-select"]');
    this.viewForecastButton = page.locator('button:has-text("Forecast"), button:has-text("Monthly")');
    this.viewHistoryButton = page.locator('button:has-text("History"), button:has-text("Past")');
    this.viewChartButton = page.locator('button:has-text("Chart"), button:has-text("View Chart")');
    this.moonPositionInfo = page.locator('.moon-position, [data-testid="moon-position"]');
    this.moonPhaseInfo = page.locator('.moon-phase, [data-testid="moon-phase"]');
    this.housePlacementInfo = page.locator('.house-placement, [data-testid="house-placement"]');
    this.aspectsList = page.locator('.aspects-list, [data-testid="aspects"]');
    this.themeDescription = page.locator('.theme, [data-testid="theme"]');
    this.intensityIndicator = page.locator('.intensity, [data-testid="intensity"]');
    this.forecastText = page.locator('.forecast-text, [data-testid="forecast"]');
    this.historyList = page.locator('.history-list, [data-testid="history-list"]');
    this.saveReportButton = page.locator('button:has-text("Save"), button:has-text("Save Report")');
    this.downloadReportButton = page.locator('button:has-text("Download"), button:has-text("Export")');
    this.shareButton = page.locator('button:has-text("Share")');
    this.backToDashboardButton = page.locator('button:has-text("Back"), button:has-text("←")');
    this.monthlyForecast = page.locator('.monthly-forecast, [data-testid="monthly-forecast"]');
    this.keyThemes = page.locator('.key-themes, [data-testid="key-themes"]');
    this.recommendations = page.locator('.recommendations, [data-testid="recommendations"]');
  }

  /**
   * Navigate to lunar returns page
   */
  async goto(): Promise<void> {
    await this.page.goto('/lunar-returns');
    await this.helpers.waitForLoading();
  }

  /**
   * Select chart for lunar return calculation
   */
  async selectChart(chartId: string): Promise<void> {
    if (await this.selectChartDropdown.count() > 0) {
      await this.selectChartDropdown.selectOption(chartId);
    }
  }

  /**
   * Calculate next lunar return
   */
  async calculateNextLunarReturn(): Promise<void> {
    await this.calculateButton.click();
    await this.helpers.waitForLoading();
  }

  /**
   * View next lunar return details
   */
  async viewNextLunarReturn(): Promise<void> {
    await this.nextLunarReturnCard.click();
    await this.helpers.waitForLoading();
  }

  /**
   * View monthly forecast
   */
  async viewMonthlyForecast(): Promise<void> {
    await this.viewForecastButton.click();
    await this.helpers.waitForLoading();
  }

  /**
   * View history
   */
  async viewHistory(): Promise<void> {
    await this.viewHistoryButton.click();
    await this.helpers.waitForLoading();
  }

  /**
   * View chart details
   */
  async viewChart(): Promise<void> {
    await this.viewChartButton.click();
    await this.helpers.waitForLoading();
  }

  /**
   * Go back to dashboard
   */
  async backToDashboard(): Promise<void> {
    await this.backToDashboardButton.click();
    await this.helpers.waitForLoading();
  }

  /**
   * Save lunar return report
   */
  async saveReport(reportName: string): Promise<void> {
    await this.saveReportButton.click();

    const nameInput = this.page.locator('[name="reportName"], input[placeholder*="name" i]');
    if (await nameInput.count() > 0) {
      await nameInput.fill(reportName);
    }

    const confirmButton = this.page.locator('button:has-text("Confirm"), button:has-text("Save")');
    await confirmButton.click();
    await this.helpers.waitForLoading();
  }

  /**
   * Download report
   */
  async downloadReport(format: 'pdf' | 'json' = 'pdf'): Promise<void> {
    await this.downloadReportButton.click();

    const formatOption = this.page.locator(`[data-format="${format}"], label:has-text("${format.toUpperCase()}")`);
    if (await formatOption.count() > 0) {
      await formatOption.click();
    }

    await this.helpers.waitForLoading();
  }

  /**
   * Share report
   */
  async shareReport(): Promise<void> {
    await this.shareButton.click();
    await this.helpers.waitForLoading();
  }

  /**
   * Verify moon position is displayed
   */
  async verifyMoonPositionDisplayed(): Promise<void> {
    await expect(this.moonPositionInfo).toBeVisible();
  }

  /**
   * Verify moon phase is displayed
   */
  async verifyMoonPhaseDisplayed(): Promise<void> {
    await expect(this.moonPhaseInfo).toBeVisible();
  }

  /**
   * Verify house placement is displayed
   */
  async verifyHousePlacementDisplayed(): Promise<void> {
    await expect(this.housePlacementInfo).toBeVisible();
  }

  /**
   * Verify aspects are displayed
   */
  async verifyAspectsDisplayed(): Promise<void> {
    await expect(this.aspectsList.first()).toBeVisible();
  }

  /**
   * Verify theme description is displayed
   */
  async verifyThemeDisplayed(): Promise<void> {
    await expect(this.themeDescription).toBeVisible();
  }

  /**
   * Verify intensity indicator is displayed
   */
  async verifyIntensityDisplayed(): Promise<void> {
    await expect(this.intensityIndicator).toBeVisible();
  }

  /**
   * Verify forecast text is displayed
   */
  async verifyForecastDisplayed(): Promise<void> {
    await expect(this.forecastText).toBeVisible();
  }

  /**
   * Verify key themes are displayed
   */
  async verifyKeyThemesDisplayed(): Promise<void> {
    await expect(this.keyThemes.first()).toBeVisible();
  }

  /**
   * Verify recommendations are displayed
   */
  async verifyRecommendationsDisplayed(): Promise<void> {
    await expect(this.recommendations.first()).toBeVisible();
  }

  /**
   * Verify history list is displayed
   */
  async verifyHistoryDisplayed(): Promise<void> {
    await expect(this.historyList).toBeVisible();
  }

  /**
   * Verify on dashboard view
   */
  async verifyOnDashboard(): Promise<void> {
    await expect(this.dashboardView).toBeVisible();
  }

  /**
   * Verify on chart view
   */
  async verifyOnChartView(): Promise<void> {
    await expect(this.chartView).toBeVisible();
  }

  /**
   * Verify on forecast view
   */
  async verifyOnForecastView(): Promise<void> {
    await expect(this.forecastView).toBeVisible();
  }

  /**
   * Verify on history view
   */
  async verifyOnHistoryView(): Promise<void> {
    await expect(this.historyView).toBeVisible();
  }

  /**
   * Get moon position text
   */
  async getMoonPosition(): Promise<string> {
    return await this.moonPositionInfo.textContent() || '';
  }

  /**
   * Get theme text
   */
  async getTheme(): Promise<string> {
    return await this.themeDescription.textContent() || '';
  }

  /**
   * Get history item count
   */
  async getHistoryItemCount(): Promise<number> {
    const historyItems = this.historyList.locator('.history-item, [data-testid="history-item"]');
    return await historyItems.count();
  }
}
