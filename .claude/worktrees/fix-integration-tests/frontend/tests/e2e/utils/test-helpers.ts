/**
 * Test Helper Utilities
 * Common utility functions for E2E tests
 */

import { Page, Locator } from '@playwright/test';

export class TestHelpers {
  constructor(private page: Page) {}

  /**
   * Wait for API response to complete
   */
  async waitForApiResponse(urlPattern: string | RegExp): Promise<any> {
    return await this.page.waitForResponse(
      (response) =>
        response.url().match(urlPattern) && response.status() === 200
    );
  }

  /**
   * Fill form with data
   */
  async fillForm(formData: Record<string, string>): Promise<void> {
    for (const [field, value] of Object.entries(formData)) {
      const locator = this.page.locator(`[name="${field}"]`);
      if (await locator.count() > 0) {
        await locator.fill(value);
      }
    }
  }

  /**
   * Select option from dropdown
   */
  async selectOption(
    selector: string,
    value: string
  ): Promise<void> {
    await this.page.selectOption(selector, value);
  }

  /**
   * Take screenshot with automatic naming
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({
      path: `test-results/screenshots/${name}.png`,
      fullPage: true,
    });
  }

  /**
   * Verify element is visible
   */
  async verifyVisible(selector: string): Promise<boolean> {
    const locator = this.page.locator(selector);
    await locator.waitFor({ state: 'visible', timeout: 5000 });
    return await locator.isVisible();
  }

  /**
   * Verify element contains text
   */
  async verifyText(
    selector: string,
    text: string | RegExp
  ): Promise<void> {
    const locator = this.page.locator(selector);
    await expect(locator).toContainText(text);
  }

  /**
   * Click button with text
   */
  async clickButton(text: string): Promise<void> {
    await this.page.click(`button:has-text("${text}")`);
  }

  /**
   * Wait for loading to complete
   */
  async waitForLoading(): Promise<void> {
    await this.page.waitForSelector(
      '.loading, .spinner, [data-testid="loading"]',
      { state: 'hidden', timeout: 10000 }
    );
  }

  /**
   * Verify URL contains path
   */
  async verifyUrl(path: string | RegExp): Promise<void> {
    await this.page.waitForURL(path);
  }

  /**
   * Mock API response
   */
  async mockApi(
    urlPattern: string,
    response: any,
    status: number = 200
  ): Promise<void> {
    await this.page.route(urlPattern, (route) => {
      route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(response),
      });
    });
  }

  /**
   * Mock API error
   */
  async mockApiError(
    urlPattern: string,
    error: string,
    status: number = 500
  ): Promise<void> {
    await this.page.route(urlPattern, (route) => {
      route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify({ error }),
      });
    });
  }

  /**
   * Verify toast/notification message
   */
  async verifyToast(message: string | RegExp): Promise<void> {
    const toast = this.page.locator(
      '.toast, .notification, [role="alert"], [data-testid="toast"]'
    );
    await expect(toast).toBeVisible();
    await expect(toast).toContainText(message);
  }

  /**
   * Verify error message
   */
  async verifyError(message: string | RegExp): Promise<void> {
    const error = this.page.locator(
      '.error, .error-message, [data-testid="error"]'
    );
    await expect(error).toBeVisible();
    await expect(error).toContainText(message);
  }

  /**
   * Clear local storage and session storage
   */
  async clearStorage(): Promise<void> {
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }

  /**
   * Set item in local storage
   */
  async setLocalStorage(key: string, value: any): Promise<void> {
    await this.page.evaluate(
      ([k, v]) => {
        localStorage.setItem(k, JSON.stringify(v));
      },
      [key, value]
    );
  }

  /**
   * Get item from local storage
   */
  async getLocalStorage(key: string): Promise<any> {
    return await this.page.evaluate((k) => {
      const value = localStorage.getItem(k);
      return value ? JSON.parse(value) : null;
    }, key);
  }

  /**
   * Set viewport size for different devices
   */
  async setViewport(device: 'mobile' | 'tablet' | 'desktop'): Promise<void> {
    const sizes = {
      mobile: { width: 375, height: 667 },
      tablet: { width: 768, height: 1024 },
      desktop: { width: 1920, height: 1080 },
    };
    await this.page.setViewportSize(sizes[device]);
  }

  /**
   * Hover over element
   */
  async hover(selector: string): Promise<void> {
    await this.page.hover(selector);
  }

  /**
   * Verify element count
   */
  async verifyCount(selector: string, count: number): Promise<void> {
    const locator = this.page.locator(selector);
    await expect(locator).toHaveCount(count);
  }

  /**
   * Wait for element to be enabled
   */
  async waitForEnabled(selector: string): Promise<void> {
    const locator = this.page.locator(selector);
    await locator.waitFor({ state: 'attached' });
    await expect(locator).toBeEnabled();
  }

  /**
   * Verify element is disabled
   */
  async verifyDisabled(selector: string): Promise<void> {
    const locator = this.page.locator(selector);
    await expect(locator).toBeDisabled();
  }

  /**
   * Type text with delay
   */
  async typeWithDelay(
    selector: string,
    text: string,
    delay: number = 50
  ): Promise<void> {
    const locator = this.page.locator(selector);
    await locator.click();
    for (const char of text) {
      await locator.type(char, { delay });
    }
  }

  /**
   * Upload file
   */
  async uploadFile(selector: string, filePath: string): Promise<void> {
    const locator = this.page.locator(selector);
    await locator.setInputFiles(filePath);
  }

  /**
   * Download file and verify
   */
  async downloadFile(
    trigger: () => Promise<void>
  ): Promise<string> {
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      trigger(),
    ]);
    return await download.path();
  }

  /**
   * Verify accessibility attributes
   */
  async verifyAriaLabel(
    selector: string,
    label: string
  ): Promise<void> {
    const locator = this.page.locator(selector);
    await expect(locator).toHaveAttribute('aria-label', label);
  }

  /**
   * Verify element is focused
   */
  async verifyFocused(selector: string): Promise<void> {
    const locator = this.page.locator(selector);
    await expect(locator).toBeFocused();
  }

  /**
   * Get element text content
   */
  async getText(selector: string): Promise<string> {
    const locator = this.page.locator(selector);
    return (await locator.textContent()) || '';
  }

  /**
   * Get element count
   */
  async getCount(selector: string): Promise<number> {
    return await this.page.locator(selector).count();
  }

  /**
   * Scroll to element
   */
  async scrollToElement(selector: string): Promise<void> {
    await this.page.locator(selector).scrollIntoViewIfNeeded();
  }

  /**
   * Verify element is in viewport
   */
  async isInViewport(selector: string): Promise<boolean> {
    const locator = this.page.locator(selector);
    return await locator.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= window.innerHeight &&
        rect.right <= window.innerWidth
      );
    });
  }

  /**
   * Press keyboard key
   */
  async pressKey(key: string): Promise<void> {
    await this.page.keyboard.press(key);
  }

  /**
   * Reload page and wait for network idle
   */
  async reloadAndWait(): Promise<void> {
    await this.page.reload({ waitUntil: 'networkidle' });
  }
}
