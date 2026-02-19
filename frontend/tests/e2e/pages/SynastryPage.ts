/**
 * Synastry Page Object Model
 * Encapsulates synastry/compatibility feature interactions
 */

import { Page, Locator, expect } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';

export class SynastryPageObject {
  readonly page: Page;
  readonly helpers: TestHelpers;

  // Page locators
  readonly chart1Select: Locator;
  readonly chart2Select: Locator;
  readonly calculateButton: Locator;
  readonly overallScore: Locator;
  readonly romanticScore: Locator;
  readonly communicationScore: Locator;
  readonly emotionalScore: Locator;
  readonly aspectsList: Locator;
  readonly compositeChartButton: Locator;
  readonly compositeChartView: Locator;
  readonly interpretationSection: Locator;
  readonly summarySection: Locator;
  readonly strengthsList: Locator;
  readonly challengesList: Locator;
  readonly saveReportButton: Locator;
  readonly downloadReportButton: Locator;
  readonly shareButton: Locator;
  readonly compareAnotherButton: Locator;
  readonly aspectDetails: Locator;
  readonly scoreBreakdown: Locator;
  readonly compatibilityChart: Locator;

  constructor(page: Page) {
    this.page = page;
    this.helpers = new TestHelpers(page);

    // Initialize locators
    this.chart1Select = page.locator('[name="chart1"], [data-testid="chart1-select"]');
    this.chart2Select = page.locator('[name="chart2"], [data-testid="chart2-select"]');
    this.calculateButton = page.locator('button:has-text("Calculate"), button:has-text("Analyze")');
    this.overallScore = page.locator('.overall-score, [data-testid="overall-score"]');
    this.romanticScore = page.locator('.romantic-score, [data-testid="romantic-score"]');
    this.communicationScore = page.locator('.communication-score, [data-testid="communication-score"]');
    this.emotionalScore = page.locator('.emotional-score, [data-testid="emotional-score"]');
    this.aspectsList = page.locator('.aspects-list, [data-testid="aspects-list"]');
    this.compositeChartButton = page.locator('button:has-text("Composite"), button:has-text("Composite Chart")');
    this.compositeChartView = page.locator('.composite-chart, [data-testid="composite-chart"]');
    this.interpretationSection = page.locator('.interpretation, [data-testid="interpretation"]');
    this.summarySection = page.locator('.summary, [data-testid="summary"]');
    this.strengthsList = page.locator('.strengths, [data-testid="strengths"]');
    this.challengesList = page.locator('.challenges, [data-testid="challenges"]');
    this.saveReportButton = page.locator('button:has-text("Save"), button:has-text("Save Report")');
    this.downloadReportButton = page.locator('button:has-text("Download"), button:has-text("Export")');
    this.shareButton = page.locator('button:has-text("Share")');
    this.compareAnotherButton = page.locator('button:has-text("Compare Another"), button:has-text("New Comparison")');
    this.aspectDetails = page.locator('.aspect-details, [data-testid="aspect-details"]');
    this.scoreBreakdown = page.locator('.score-breakdown, [data-testid="score-breakdown"]');
    this.compatibilityChart = page.locator('.compatibility-chart, [data-testid="compatibility-chart"]');
  }

  /**
   * Navigate to synastry page
   */
  async goto(): Promise<void> {
    await this.page.goto('/synastry');
    await this.helpers.waitForLoading();
  }

  /**
   * Select first chart
   */
  async selectChart1(chartId: string): Promise<void> {
    await this.chart1Select.selectOption(chartId);
  }

  /**
   * Select second chart
   */
  async selectChart2(chartId: string): Promise<void> {
    await this.chart2Select.selectOption(chartId);
  }

  /**
   * Calculate compatibility
   */
  async calculateCompatibility(): Promise<void> {
    await this.calculateButton.click();
    await this.helpers.waitForLoading();
  }

  /**
   * Calculate compatibility with specific charts
   */
  async calculateCompatibilityWithCharts(chart1Id: string, chart2Id: string): Promise<void> {
    await this.selectChart1(chart1Id);
    await this.selectChart2(chart2Id);
    await this.calculateCompatibility();
  }

  /**
   * View composite chart
   */
  async viewCompositeChart(): Promise<void> {
    await this.compositeChartButton.click();
    await this.helpers.waitForLoading();
  }

  /**
   * Save compatibility report
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
   * Compare another pair
   */
  async compareAnother(): Promise<void> {
    await this.compareAnotherButton.click();
    await this.helpers.waitForLoading();
  }

  /**
   * Get overall score
   */
  async getOverallScore(): Promise<number> {
    const scoreText = await this.overallScore.textContent() || '0';
    const score = parseInt(scoreText.match(/\d+/)?.[0] || '0');
    return score;
  }

  /**
   * Get romantic score
   */
  async getRomanticScore(): Promise<number> {
    const scoreText = await this.romanticScore.textContent() || '0';
    const score = parseInt(scoreText.match(/\d+/)?.[0] || '0');
    return score;
  }

  /**
   * Get communication score
   */
  async getCommunicationScore(): Promise<number> {
    const scoreText = await this.communicationScore.textContent() || '0';
    const score = parseInt(scoreText.match(/\d+/)?.[0] || '0');
    return score;
  }

  /**
   * Get emotional score
   */
  async getEmotionalScore(): Promise<number> {
    const scoreText = await this.emotionalScore.textContent() || '0';
    const score = parseInt(scoreText.match(/\d+/)?.[0] || '0');
    return score;
  }

  /**
   * Verify scores are displayed
   */
  async verifyScoresDisplayed(): Promise<void> {
    await expect(this.overallScore).toBeVisible();
    await expect(this.romanticScore).toBeVisible();
    await expect(this.communicationScore).toBeVisible();
    await expect(this.emotionalScore).toBeVisible();
  }

  /**
   * Verify aspects are displayed
   */
  async verifyAspectsDisplayed(): Promise<void> {
    await expect(this.aspectsList.first()).toBeVisible();
  }

  /**
   * Verify interpretation is displayed
   */
  async verifyInterpretationDisplayed(): Promise<void> {
    await expect(this.interpretationSection).toBeVisible();
  }

  /**
   * Verify summary is displayed
   */
  async verifySummaryDisplayed(): Promise<void> {
    await expect(this.summarySection).toBeVisible();
  }

  /**
   * Verify strengths are displayed
   */
  async verifyStrengthsDisplayed(): Promise<void> {
    await expect(this.strengthsList.first()).toBeVisible();
  }

  /**
   * Verify challenges are displayed
   */
  async verifyChallengesDisplayed(): Promise<void> {
    await expect(this.challengesList.first()).toBeVisible();
  }

  /**
   * Verify composite chart is displayed
   */
  async verifyCompositeChartDisplayed(): Promise<void> {
    await expect(this.compositeChartView).toBeVisible();
  }

  /**
   * Verify compatibility chart is displayed
   */
  async verifyCompatibilityChartDisplayed(): Promise<void> {
    await expect(this.compatibilityChart).toBeVisible();
  }

  /**
   * Get aspect count
   */
  async getAspectCount(): Promise<number> {
    const aspects = this.aspectsList.locator('.aspect, [data-testid="aspect"]');
    return await aspects.count();
  }

  /**
   * Click on aspect for details
   */
  async clickAspect(index: number = 0): Promise<void> {
    const aspects = this.aspectsList.locator('.aspect, [data-testid="aspect"]');
    await aspects.nth(index).click();
  }

  /**
   * Verify aspect details are displayed
   */
  async verifyAspectDetailsDisplayed(): Promise<void> {
    await expect(this.aspectDetails).toBeVisible();
  }

  /**
   * Verify score is within valid range
   */
  async verifyScoreInRange(score: number, min: number = 0, max: number = 100): Promise<void> {
    expect(score).toBeGreaterThanOrEqual(min);
    expect(score).toBeLessThanOrEqual(max);
  }

  /**
   * Verify all scores are within valid range
   */
  async verifyAllScoresInRange(): Promise<void> {
    const overall = await this.getOverallScore();
    const romantic = await this.getRomanticScore();
    const communication = await this.getCommunicationScore();
    const emotional = await this.getEmotionalScore();

    await this.verifyScoreInRange(overall);
    await this.verifyScoreInRange(romantic);
    await this.verifyScoreInRange(communication);
    await this.verifyScoreInRange(emotional);
  }

  /**
   * Get strengths count
   */
  async getStrengthsCount(): Promise<number> {
    const strengths = this.strengthsList.locator('.strength-item, li');
    return await strengths.count();
  }

  /**
   * Get challenges count
   */
  async getChallengesCount(): Promise<number> {
    const challenges = this.challengesList.locator('.challenge-item, li');
    return await challenges.count();
  }

  /**
   * Verify on synastry page
   */
  async verifyOnSynastryPage(): Promise<void> {
    await this.helpers.verifyUrl(/.*synastry/);
  }
}
