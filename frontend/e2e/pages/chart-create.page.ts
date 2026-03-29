/**
 * Chart Create Page Object
 * Encapsulates selectors and actions for the chart creation form.
 */

import { type Page, type Locator, expect } from '@playwright/test';

export class ChartCreatePage {
  readonly page: Page;
  readonly nameInput: Locator;
  readonly birthDateInput: Locator;
  readonly birthTimeInput: Locator;
  readonly locationInput: Locator;
  readonly houseSystemSelect: Locator;
  readonly zodiacTypeSelect: Locator;
  readonly timeUnknownCheckbox: Locator;
  readonly submitButton: Locator;
  readonly autocompleteOptions: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.locator('[data-testid="chart-name"], input[name="name"]');
    this.birthDateInput = page.locator('[data-testid="birth-date"], input[name="birth_date"], input[type="date"]');
    this.birthTimeInput = page.locator('[data-testid="birth-time"], input[name="birth_time"], input[type="time"]');
    this.locationInput = page.locator('[data-testid="birth-location"], input[name="birth_place"], input[name="birth_place_name"]');
    this.houseSystemSelect = page.locator('[data-testid="house-system"], select[name="house_system"]');
    this.zodiacTypeSelect = page.locator('[data-testid="zodiac-type"], select[name="zodiac_type"], select[name="zodiac"]');
    this.timeUnknownCheckbox = page.locator('[data-testid="time-unknown"], [name="time_unknown"], #timeUnknown');
    this.submitButton = page.locator('[data-testid="chart-submit"], button[type="submit"]');
    this.autocompleteOptions = page.locator('.autocomplete-suggestion, [role="option"], .location-suggestion');
  }

  /**
   * Navigate to the chart creation page.
   */
  async goto(): Promise<void> {
    await this.page.goto('/charts/new');
    // Wait for the form to be ready
    await this.nameInput.waitFor({ state: 'visible' });
  }

  /**
   * Fill in the chart creation form with the provided data.
   */
  async fillChart(data: {
    name: string;
    birthDate: string;
    birthTime: string;
    location?: string;
    houseSystem?: string;
    zodiacType?: string;
  }): Promise<void> {
    await this.nameInput.fill(data.name);
    await this.birthDateInput.fill(data.birthDate);
    await this.birthTimeInput.fill(data.birthTime);

    if (data.location) {
      await this.locationInput.fill(data.location);
      // Wait for geocoding autocomplete
      await this.autocompleteOptions.first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {
        // Autocomplete may not appear in all environments
      });
      if (await this.autocompleteOptions.first().isVisible()) {
        await this.autocompleteOptions.first().click();
      }
    }

    if (data.houseSystem) {
      await this.houseSystemSelect.selectOption(data.houseSystem);
    }

    if (data.zodiacType) {
      await this.zodiacTypeSelect.selectOption(data.zodiacType);
    }
  }

  /**
   * Fill and submit the chart creation form.
   */
  async createChart(data: {
    name: string;
    birthDate: string;
    birthTime: string;
    location?: string;
    houseSystem?: string;
    zodiacType?: string;
  }): Promise<void> {
    await this.fillChart(data);
    await this.submitButton.click();
  }

  /**
   * Toggle the "time unknown" checkbox.
   */
  async toggleTimeUnknown(): Promise<void> {
    await this.timeUnknownCheckbox.click();
  }

  /**
   * Assert that the time input is disabled (when time unknown is checked).
   */
  async expectTimeInputDisabled(): Promise<void> {
    await expect(this.birthTimeInput).toBeDisabled();
  }

  /**
   * Assert that validation errors are visible.
   */
  async expectValidationErrors(count?: number): Promise<void> {
    const errors = this.page.locator('[data-testid="error-message"], .error-message, [role="alert"], .field-error');
    if (count) {
      await expect(errors).toHaveCount(count);
    } else {
      await expect(errors.first()).toBeVisible();
    }
  }

  /**
   * Assert that we are on the chart creation page.
   */
  async expectOnPage(): Promise<void> {
    await expect(this.page).toHaveURL(/.*chart.*(?:new|create)/);
    await expect(this.nameInput).toBeVisible();
  }
}
