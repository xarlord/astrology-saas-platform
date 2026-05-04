/**
 * Chart Create Page Object
 * Encapsulates selectors and actions for the chart creation form (BirthDataForm).
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
  readonly siderealModeSelect: Locator;
  readonly timeUnknownCheckbox: Locator;
  readonly submitButton: Locator;
  readonly autocompleteOptions: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.locator('#chartName');
    this.birthDateInput = page.locator('#birthDate');
    this.birthTimeInput = page.locator('#birthTime');
    this.locationInput = page.locator('#birthPlace');
    this.houseSystemSelect = page.locator('#houseSystem');
    this.zodiacTypeSelect = page.locator('#zodiac');
    this.siderealModeSelect = page.locator('#siderealMode');
    this.timeUnknownCheckbox = page.locator('#timeUnknown');
    this.submitButton = page.locator('button[type="submit"]');
    this.autocompleteOptions = page.locator('.absolute.z-10 button');
  }

  /**
   * Navigate to the chart creation page.
   */
  async goto(): Promise<void> {
    await this.page.goto('/charts/new');
    await this.nameInput.waitFor({ state: 'visible' });
  }

  /**
   * Fill in the chart creation form with the provided data.
   */
  async fillChart(data?: {
    name?: string;
    birthDate?: string;
    birthTime?: string;
    location?: string;
    houseSystem?: string;
    zodiacType?: string;
  }): Promise<void> {
    if (!data) return;
    if (data.name !== undefined) {
      await this.nameInput.clear();
      await this.nameInput.fill(data.name);
    }
    if (data.birthDate !== undefined) {
      await this.birthDateInput.fill(data.birthDate);
    }
    if (data.birthTime !== undefined) {
      await this.birthTimeInput.fill(data.birthTime);
    }

    if (data.location) {
      await this.locationInput.clear();
      await this.locationInput.fill(data.location);

      // Wait for debounce (500ms) + Nominatim API response
      await this.autocompleteOptions.first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});

      if (await this.autocompleteOptions.first().isVisible().catch(() => false)) {
        await this.autocompleteOptions.first().click();
      }
    }

    if (data.houseSystem) {
      await this.houseSystemSelect.selectOption({ value: data.houseSystem });
    }

    if (data.zodiacType) {
      await this.zodiacTypeSelect.selectOption({ value: data.zodiacType });
    }
  }

  /**
   * Mock the Nominatim geocoding API to return predictable results.
   * Call this BEFORE navigating to the chart creation page.
   */
  async mockGeocoding(): Promise<void> {
    await this.page.route('**/nominatim.openstreetmap.org/**', (route) => {
      const url = new URL(route.request().url());
      const q = url.searchParams.get('q') || '';
      const limit = parseInt(url.searchParams.get('limit') || '5', 10);

      const suggestions = [
        { display_name: `${q}, NY, USA`, lat: '40.7128', lon: '-74.006' },
        { display_name: `${q}, NY, USA (2)`, lat: '40.7128', lon: '-74.006' },
      ].slice(0, limit);

      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(suggestions),
      });
    });
  }

  /**
   * Fill and submit the chart creation form.
   */
  async createChart(data?: {
    name?: string;
    birthDate?: string;
    birthTime?: string;
    location?: string;
    houseSystem?: string;
    zodiacType?: string;
  }): Promise<void> {
    if (data) {
      await this.fillChart(data);
    }
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
    const errors = this.page.locator('.error-message, [role="alert"]');
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
    await expect(this.page).toHaveURL(/.*charts\/new/);
    await expect(this.nameInput).toBeVisible();
  }
}
