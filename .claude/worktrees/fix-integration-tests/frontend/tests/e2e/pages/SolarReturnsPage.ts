/**
 * Solar Returns Page Object Model
 * Encapsulates solar returns feature interactions
 */

import { Page, Locator, expect } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';

export class SolarReturnsPageObject {
  readonly page: Page;
  readonly helpers: TestHelpers;

  // Page locators
  readonly dashboardView: Locator;
  readonly chartView: Locator;
  readonly interpretationView: Locator;
  readonly relocateView: Locator;
  readonly shareView: Locator;
  readonly yearSelector: Locator;
  readonly calculateButton: Locator;
  readonly selectChartDropdown: Locator;
  readonly solarReturnCards: Locator;
  readonly currentYearCard: Locator;
  readonly chartViewButton: Locator;
  readonly interpretationViewButton: Locator;
  readonly relocateViewButton: Locator;
  readonly shareViewButton: Locator;
  readonly backToDashboardButton: Locator;
  readonly chartWheel: Locator;
  readonly interpretationText: Locator;
  readonly themeDescription: Locator;
  readonly highlightsList: Locator;
  readonly locationInput: Locator;
  readonly recalculateButton: Locator;
  readonly relocateButton: Locator;
  readonly shareLinkButton: Locator;
  readonly shareEmailButton: Locator;
  readonly downloadButton: Locator;
  readonly historyList: Locator;
  readonly viewHistoryButton: Locator;
  readonly birthdayInfo: Locator;
  readonly returnDateInfo: Locator;
  readonly ageInfo: Locator;
  readonly viewModeTabs: Locator;

  constructor(page: Page) {
    this.page = page;
    this.helpers = new TestHelpers(page);

    // Initialize locators
    this.dashboardView = page.locator('[data-view="dashboard"], .solar-dashboard');
    this.chartView = page.locator('[data-view="chart"], .solar-chart-view');
    this.interpretationView = page.locator('[data-view="interpretation"], .solar-interpretation-view');
    this.relocateView = page.locator('[data-view="relocate"], .solar-relocate-view');
    this.shareView = page.locator('[data-view="share"], .solar-share-view');
    this.yearSelector = page.locator('[name="year"], [data-testid="year-selector"]');
    this.calculateButton = page.locator('button:has-text("Calculate"), button:has-text("Generate")');
    this.selectChartDropdown = page.locator('[name="chart"], [data-testid="chart-select"]');
    this.solarReturnCards = page.locator('.solar-return-card, [data-testid="solar-return-card"]');
    this.currentYearCard = page.locator('.current-year, [data-testid="current-year"]');
    this.chartViewButton = page.locator('button:has-text("Chart"), [aria-label="Chart"]');
    this.interpretationViewButton = page.locator('button:has-text("Interpretation"), [aria-label="Interpretation"]');
    this.relocateViewButton = page.locator('button:has-text("Relocate"), [aria-label="Relocate"]');
    this.shareViewButton = page.locator('button:has-text("Share"), [aria-label="Share"]');
    this.backToDashboardButton = page.locator('button:has-text("Back"), button:has-text("Dashboard")');
    this.chartWheel = page.locator('.chart-wheel, svg');
    this.interpretationText = page.locator('.interpretation-text, [data-testid="interpretation"]');
    this.themeDescription = page.locator('.theme, [data-testid="theme"]');
    this.highlightsList = page.locator('.highlights, [data-testid="highlights"]');
    this.locationInput = page.locator('[name="location"], input[placeholder*="location" i]');
    this.recalculateButton = page.locator('button:has-text("Recalculate"), button:has-text("Calculate")');
    this.relocateButton = page.locator('button:has-text("Relocate")');
    this.shareLinkButton = page.locator('button:has-text("Copy Link"), button:has-text("Share Link")');
    this.shareEmailButton = page.locator('button:has-text("Email"), button:has-text("Send Email")');
    this.downloadButton = page.locator('button:has-text("Download"), button:has-text("Export")');
    this.historyList = page.locator('.history-list, [data-testid="history-list"]');
    this.viewHistoryButton = page.locator('button:has-text("History"), button:has-text("Past Returns")');
    this.birthdayInfo = page.locator('.birthday-info, [data-testid="birthday"]');
    this.returnDateInfo = page.locator('.return-date, [data-testid="return-date"]');
    this.ageInfo = page.locator('.age-info, [data-testid="age"]');
    this.viewModeTabs = page.locator('.view-mode-tabs, [data-testid="view-tabs"]');
  }

  /**
   * Navigate to solar returns page
   */
  async goto(): Promise<void> {
    await this.page.goto('/solar-returns');
    await this.helpers.waitForLoading();
  }

  /**
   * Navigate to specific year
   */
  async gotoYear(year: number): Promise<void> {
    await this.page.goto(`/solar-returns/${year}`);
    await this.helpers.waitForLoading();
  }

  /**
   * Select chart for solar return calculation
   */
  async selectChart(chartId: string): Promise<void> {
    if (await this.selectChartDropdown.count() > 0) {
      await this.selectChartDropdown.selectOption(chartId);
    }
  }

  /**
   * Select year
   */
  async selectYear(year: number): Promise<void> {
    if (await this.yearSelector.count() > 0) {
      await this.yearSelector.selectOption(year.toString());
    } else {
      await this.gotoYear(year);
    }
  }

  /**
   * Calculate solar return for current year
   */
  async calculateForCurrentYear(): Promise<void> {
    const currentYear = new Date().getFullYear();
    await this.selectYear(currentYear);
    await this.calculateButton.click();
    await this.helpers.waitForLoading();
  }

  /**
   * Calculate solar return for specific year
   */
  async calculateForYear(year: number): Promise<void> {
    await this.selectYear(year);
    await this.calculateButton.click();
    await this.helpers.waitForLoading();
  }

  /**
   * Switch to chart view
   */
  async switchToChartView(): Promise<void> {
    await this.chartViewButton.click();
    await this.helpers.waitForLoading();
  }

  /**
   * Switch to interpretation view
   */
  async switchToInterpretationView(): Promise<void> {
    await this.interpretationViewButton.click();
    await this.helpers.waitForLoading();
  }

  /**
   * Switch to relocate view
   */
  async switchToRelocateView(): Promise<void> {
    await this.relocateViewButton.click();
    await this.helpers.waitForLoading();
  }

  /**
   * Switch to share view
   */
  async switchToShareView(): Promise<void> {
    await this.shareViewButton.click();
    await this.helpers.waitForLoading();
  }

  /**
   * Relocate chart
   */
  async relocateChart(location: string): Promise<void> {
    await this.switchToRelocateView();
    await this.locationInput.fill(location);
    await this.page.waitForTimeout(500); // Wait for autocomplete

    const autocomplete = this.page.locator('.autocomplete-suggestion, [role="option"]').first();
    if (await autocomplete.isVisible()) {
      await autocomplete.click();
    }

    await this.recalculateButton.click();
    await this.helpers.waitForLoading();
  }

  /**
   * Download interpretation
   */
  async downloadInterpretation(format: 'pdf' | 'json' = 'pdf'): Promise<void> {
    await this.switchToInterpretationView();
    await this.downloadButton.click();

    const formatOption = this.page.locator(`[data-format="${format}"], label:has-text("${format.toUpperCase()}")`);
    if (await formatOption.count() > 0) {
      await formatOption.click();
    }

    await this.helpers.waitForLoading();
  }

  /**
   * Share solar return
   */
  async shareSolarReturn(): Promise<void> {
    await this.switchToShareView();
    await this.shareLinkButton.click();
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
   * Go back to dashboard
   */
  async backToDashboard(): Promise<void> {
    await this.backToDashboardButton.click();
    await this.helpers.waitForLoading();
  }

  /**
   * Verify chart wheel is displayed
   */
  async verifyChartWheelDisplayed(): Promise<void> {
    await expect(this.chartWheel).toBeVisible();
  }

  /**
   * Verify interpretation is displayed
   */
  async verifyInterpretationDisplayed(): Promise<void> {
    await expect(this.interpretationText).toBeVisible();
  }

  /**
   * Verify theme is displayed
   */
  async verifyThemeDisplayed(): Promise<void> {
    await expect(this.themeDescription).toBeVisible();
  }

  /**
   * Verify highlights are displayed
   */
  async verifyHighlightsDisplayed(): Promise<void> {
    await expect(this.highlightsList.first()).toBeVisible();
  }

  /**
   * Verify birthday info is displayed
   */
  async verifyBirthdayInfoDisplayed(): Promise<void> {
    await expect(this.birthdayInfo).toBeVisible();
  }

  /**
   * Verify return date is displayed
   */
  async verifyReturnDateDisplayed(): Promise<void> {
    await expect(this.returnDateInfo).toBeVisible();
  }

  /**
   * Verify age info is displayed
   */
  async verifyAgeInfoDisplayed(): Promise<void> {
    await expect(this.ageInfo).toBeVisible();
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
   * Verify on interpretation view
   */
  async verifyOnInterpretationView(): Promise<void> {
    await expect(this.interpretationView).toBeVisible();
  }

  /**
   * Verify on relocate view
   */
  async verifyOnRelocateView(): Promise<void> {
    await expect(this.relocateView).toBeVisible();
  }

  /**
   * Verify on share view
   */
  async verifyOnShareView(): Promise<void> {
    await expect(this.shareView).toBeVisible();
  }

  /**
   * Get theme text
   */
  async getTheme(): Promise<string> {
    return await this.themeDescription.textContent() || '';
  }

  /**
   * Get highlights count
   */
  async getHighlightsCount(): Promise<number> {
    const highlights = this.highlightsList.locator('.highlight-item, li');
    return await highlights.count();
  }

  /**
   * Get interpretation text
   */
  async getInterpretationText(): Promise<string> {
    return await this.interpretationText.textContent() || '';
  }

  /**
   * Get solar return cards count
   */
  async getSolarReturnCardsCount(): Promise<number> {
    return await this.solarReturnCards.count();
  }

  /**
   * Click on solar return card by index
   */
  async clickSolarReturnCard(index: number = 0): Promise<void> {
    await this.solarReturnCards.nth(index).click();
    await this.helpers.waitForLoading();
  }

  /**
   * Verify on solar returns page
   */
  async verifyOnSolarReturnsPage(): Promise<void> {
    await this.helpers.verifyUrl(/.*solar-returns/);
  }

  /**
   * Get current year from page
   */
  async getCurrentYear(): Promise<number> {
    const yearText = await this.page.locator('.current-year, .year').textContent();
    const year = parseInt(yearText?.match(/\d{4}/)?.[0] || '0');
    return year;
  }

  /**
   * Verify location is updated after relocation
   */
  async verifyLocationUpdated(location: string): Promise<void> {
    const locationInfo = this.page.locator('.location-info, [data-testid="location"]');
    await expect(locationInfo).toContainText(location);
  }
}
