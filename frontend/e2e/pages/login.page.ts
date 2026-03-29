/**
 * Login Page Object
 * Encapsulates selectors and actions for the login page.
 */

import { type Page, type Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly signUpLink: Locator;
  readonly forgotPasswordLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('[data-testid="email-input"], input[name="email"], input[type="email"]');
    this.passwordInput = page.locator('[data-testid="password-input"], input[name="password"], input[type="password"]');
    this.submitButton = page.locator('[data-testid="login-submit"], button[type="submit"]');
    this.errorMessage = page.locator('[data-testid="error-message"], .error-message, [role="alert"]');
    this.signUpLink = page.locator('a[href="/register"], a:has-text("Sign Up"), a:has-text("sign up")');
    this.forgotPasswordLink = page.locator('a:has-text("Forgot"), a:has-text("forgot"), a:has-text("Reset")');
  }

  /**
   * Navigate to the login page.
   */
  async goto(): Promise<void> {
    await this.page.goto('/login');
    // Wait for the form to be ready
    await this.emailInput.waitFor({ state: 'visible' });
  }

  /**
   * Fill in credentials and submit the login form.
   */
  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  /**
   * Perform login and wait for navigation to dashboard.
   */
  async loginAndWaitForDashboard(email: string, password: string): Promise<void> {
    await this.login(email, password);
    await this.page.waitForURL(/.*dashboard/, { timeout: 15000 });
  }

  /**
   * Assert that the error message is visible with expected text.
   */
  async expectError(text?: string | RegExp): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
    if (text) {
      await expect(this.errorMessage).toContainText(text);
    }
  }

  /**
   * Assert that we are on the login page.
   */
  async expectOnPage(): Promise<void> {
    await expect(this.page).toHaveURL(/.*login/);
    await expect(this.emailInput).toBeVisible();
  }
}
