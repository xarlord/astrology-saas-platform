/**
 * Dashboard Page Object
 * Encapsulates selectors and actions for the main dashboard page.
 */

import { type Page, type Locator, expect } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly chartList: Locator;
  readonly chartCards: Locator;
  readonly newChartButton: Locator;
  readonly welcomeMessage: Locator;
  readonly userMenu: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.chartList = page.locator('[data-testid="chart-list"]');
    this.chartCards = page.locator('[data-testid="chart-card"], .chart-card, [data-testid^="chart-card-"]');
    this.newChartButton = page.locator(
      '[data-testid="new-chart-button"], a[href="/charts/new"], a[href="/charts/create"], button:has-text("New Chart"), a:has-text("New Chart")',
    );
    this.welcomeMessage = page.locator('h1, h2');
    this.userMenu = page.locator('[aria-label="User menu"], button:has-text("Logout")');
    this.logoutButton = page.locator('button:has-text("Logout"), button:has-text("Log out")');
  }

  /**
   * Navigate to the dashboard page.
   */
  async goto(): Promise<void> {
    await this.page.goto('/dashboard');
  }

  /**
   * Get the number of visible chart cards.
   */
  async getChartCount(): Promise<number> {
    return this.chartCards.count();
  }

  /**
   * Click the "New Chart" button.
   */
  async clickNewChart(): Promise<void> {
    await this.newChartButton.first().click();
  }

  /**
   * Click on a specific chart card by index.
   */
  async clickChart(index: number): Promise<void> {
    await this.chartCards.nth(index).click();
  }

  /**
   * Click on a chart card by name.
   */
  async clickChartByName(name: string): Promise<void> {
    const card = this.chartCards.locator(`text="${name}"`).first();
    await card.click();
  }

  /**
   * Open the user menu dropdown.
   */
  async openUserMenu(): Promise<void> {
    await this.userMenu.first().click();
  }

  /**
   * Log out via the user menu.
   */
  async logout(): Promise<void> {
    await this.openUserMenu();
    const logoutBtn = this.logoutButton.first();
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click();
    }
  }

  /**
   * Assert that we are on the dashboard page.
   */
  async expectOnPage(): Promise<void> {
    await expect(this.page).toHaveURL(/.*dashboard/);
  }

  /**
   * Assert that a specific chart is visible in the list.
   */
  async expectChartVisible(name: string): Promise<void> {
    await expect(this.chartCards.locator(`text="${name}"`).first()).toBeVisible();
  }
}
