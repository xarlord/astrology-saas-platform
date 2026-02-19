/**
 * Chart Page Object Model
 * Encapsulates chart creation and management interactions
 */

import { Page, Locator, expect } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';
import { testCharts } from '../fixtures/test-data';

export class ChartPage {
  readonly page: Page;
  readonly helpers: TestHelpers;

  // Page locators
  readonly chartNameInput: Locator;
  readonly birthDateInput: Locator;
  readonly birthTimeInput: Locator;
  readonly birthPlaceInput: Locator;
  readonly timeUnknownCheckbox: Locator;
  readonly houseSystemSelect: Locator;
  readonly zodiacTypeSelect: Locator;
  readonly createChartButton: Locator;
  readonly saveChartButton: Locator;
  readonly deleteChartButton: Locator;
  readonly editChartButton: Locator;
  readonly recalculateButton: Locator;
  readonly chartCards: Locator;
  readonly chartWheel: Locator;
  readonly planetSymbols: Locator;
  readonly houseCusps: Locator;
  readonly analysisTab: Locator;
  readonly planetsTab: Locator;
  readonly housesTab: Locator;
  readonly aspectsTab: Locator;
  readonly overviewTab: Locator;
  readonly searchInput: Locator;
  readonly pagination: Locator;

  constructor(page: Page) {
    this.page = page;
    this.helpers = new TestHelpers(page);

    // Initialize locators
    this.chartNameInput = page.locator('[name="name"]');
    this.birthDateInput = page.locator('[name="birth_date"], input[type="date"]');
    this.birthTimeInput = page.locator('[name="birth_time"], input[type="time"]');
    this.birthPlaceInput = page.locator('[name="birth_place"], [name="location"]');
    this.timeUnknownCheckbox = page.locator('[name="time_unknown"], #timeUnknown');
    this.houseSystemSelect = page.locator('[name="house_system"]');
    this.zodiacTypeSelect = page.locator('[name="zodiac_type"]');
    this.createChartButton = page.locator('button:has-text("Generate"), button:has-text("Create"), button:has-text("Calculate")');
    this.saveChartButton = page.locator('button:has-text("Save"), button:has-text("Update")');
    this.deleteChartButton = page.locator('button:has-text("Delete"), [aria-label="Delete"]');
    this.editChartButton = page.locator('button:has-text("Edit"), [aria-label="Edit"]');
    this.recalculateButton = page.locator('button:has-text("Recalculate"), [aria-label="Recalculate"]');
    this.chartCards = page.locator('.chart-card, [data-testid="chart-item"]');
    this.chartWheel = page.locator('svg, .chart-wheel');
    this.planetSymbols = page.locator('.planet-symbol, [data-planet]');
    this.houseCusps = page.locator('.house-cusp, [data-house]');
    this.analysisTab = page.locator('[role="tab"]:has-text("Analysis"), button:has-text("Analysis")');
    this.planetsTab = page.locator('[role="tab"]:has-text("Planets"), button:has-text("Planets")');
    this.housesTab = page.locator('[role="tab"]:has-text("Houses"), button:has-text("Houses")');
    this.aspectsTab = page.locator('[role="tab"]:has-text("Aspects"), button:has-text("Aspects")');
    this.overviewTab = page.locator('[role="tab"]:has-text("Overview"), button:has-text("Overview")');
    this.searchInput = page.locator('[name="search"], [placeholder*="search" i]');
    this.pagination = page.locator('.pagination, [data-testid="pagination"]');
  }

  /**
   * Navigate to chart creation page
   */
  async gotoChartCreation(): Promise<void> {
    await this.page.goto('/charts/create');
    await this.helpers.waitForLoading();
  }

  /**
   * Navigate to charts list
   */
  async gotoChartsList(): Promise<void> {
    await this.page.goto('/charts');
    await this.helpers.waitForLoading();
  }

  /**
   * Fill chart creation form
   */
  async fillChartForm(chartData: any): Promise<void> {
    await this.chartNameInput.fill(chartData.name);
    await this.birthDateInput.fill(chartData.birth_date);

    if (chartData.time_unknown && await this.timeUnknownCheckbox.count() > 0) {
      await this.timeUnknownCheckbox.check();
    } else if (chartData.birth_time) {
      await this.birthTimeInput.fill(chartData.birth_time);
    }

    if (chartData.birth_place) {
      await this.birthPlaceInput.fill(chartData.birth_place);
      // Wait for geocoding autocomplete
      await this.page.waitForTimeout(500);
      const autocomplete = this.page.locator('.autocomplete-suggestion, [role="option"]').first();
      if (await autocomplete.isVisible()) {
        await autocomplete.click();
      }
    }

    if (chartData.house_system && await this.houseSystemSelect.count() > 0) {
      await this.houseSystemSelect.selectOption(chartData.house_system);
    }

    if (chartData.zodiac_type && await this.zodiacTypeSelect.count() > 0) {
      await this.zodiacTypeSelect.selectOption(chartData.zodiac_type);
    }
  }

  /**
   * Create chart
   */
  async createChart(chartData: any): Promise<void> {
    await this.gotoChartCreation();
    await this.fillChartForm(chartData);
    await this.createChartButton.click();
    await this.helpers.waitForLoading();
  }

  /**
   * Click on chart by index
   */
  async clickChart(index: number = 0): Promise<void> {
    await this.chartCards.nth(index).click();
    await this.helpers.waitForLoading();
  }

  /**
   * Delete chart by index
   */
  async deleteChart(index: number = 0, confirm: boolean = true): Promise<void> {
    await this.helpers.hover('.chart-card, [data-testid="chart-item"]');
    await this.deleteChartButton.nth(index).click();

    if (confirm) {
      const confirmButton = this.page.locator('button:has-text("Confirm"), button:has-text("Yes"), button:has-text("Delete")');
      await confirmButton.click();
    }

    await this.helpers.waitForLoading();
  }

  /**
   * Edit chart
   */
  async editChart(index: number = 0, newName: string): Promise<void> {
    await this.clickChart(index);
    await this.editChartButton.click();
    await this.chartNameInput.fill(newName);
    await this.saveChartButton.click();
    await this.helpers.waitForLoading();
  }

  /**
   * Recalculate chart with different options
   */
  async recalculateChart(
    houseSystem: string,
    zodiacType: string
  ): Promise<void> {
    await this.recalculateButton.click();

    if (await this.houseSystemSelect.count() > 0) {
      await this.houseSystemSelect.selectOption(houseSystem);
    }

    if (await this.zodiacTypeSelect.count() > 0) {
      await this.zodiacTypeSelect.selectOption(zodiacType);
    }

    await this.createChartButton.click();
    await this.helpers.waitForLoading();
  }

  /**
   * Switch to analysis tab
   */
  async switchToAnalysisTab(): Promise<void> {
    if (await this.analysisTab.count() > 0) {
      await this.analysisTab.first().click();
      await this.helpers.waitForLoading();
    }
  }

  /**
   * Switch to planets tab
   */
  async switchToPlanetsTab(): Promise<void> {
    if (await this.planetsTab.count() > 0) {
      await this.planetsTab.first().click();
      await this.helpers.waitForLoading();
    }
  }

  /**
   * Switch to houses tab
   */
  async switchToHousesTab(): Promise<void> {
    if (await this.housesTab.count() > 0) {
      await this.housesTab.first().click();
      await this.helpers.waitForLoading();
    }
  }

  /**
   * Switch to aspects tab
   */
  async switchToAspectsTab(): Promise<void> {
    if (await this.aspectsTab.count() > 0) {
      await this.aspectsTab.first().click();
      await this.helpers.waitForLoading();
    }
  }

  /**
   * Search charts
   */
  async searchCharts(query: string): Promise<void> {
    if (await this.searchInput.count() > 0) {
      await this.searchInput.first().fill(query);
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Get chart count
   */
  async getChartCount(): Promise<number> {
    return await this.chartCards.count();
  }

  /**
   * Verify chart wheel is visible
   */
  async verifyChartWheelVisible(): Promise<void> {
    await expect(this.chartWheel).toBeVisible();
  }

  /**
   * Verify planet symbols are displayed
   */
  async verifyPlanetSymbols(count: number = 10): Promise<void> {
    await expect(this.planetSymbols).toHaveCount(count);
  }

  /**
   * Verify house cusps are displayed
   */
  async verifyHouseCusps(): Promise<void> {
    await expect(this.houseCusps.first()).toBeVisible();
  }

  /**
   * Verify chart details
   */
  async verifyChartDetails(expectedName: string): Promise<void> {
    await expect(this.page.locator(`text=${expectedName}`)).toBeVisible();
  }

  /**
   * Verify on chart creation page
   */
  async verifyOnChartCreationPage(): Promise<void> {
    await this.helpers.verifyUrl(/.*create/);
  }

  /**
   * Verify on charts list page
   */
  async verifyOnChartsListPage(): Promise<void> {
    await this.helpers.verifyUrl(/.*charts/);
  }
}
