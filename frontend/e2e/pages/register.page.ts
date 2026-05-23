/**
 * Register Page Object
 * Encapsulates selectors and actions for the registration page.
 */

import { type Page, type Locator, expect } from '@playwright/test';

export class RegisterPage {
  readonly page: Page;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly termsCheckbox: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly signInLink: Locator;

  constructor(page: Page) {
    this.page = page;
    // LoginPageNew uses data-testid="name-input"
    // RegisterPageNew uses data-testid="name-input", "register-email-input", "register-password-input", "confirm-password-input", "terms-checkbox", "register-submit-button"
    this.nameInput = page.locator('[data-testid="name-input"], input[name="name"], input#fullname');
    this.emailInput = page.locator('[data-testid="register-email-input"], input[name="email"], input#email');
    this.passwordInput = page.locator('[data-testid="register-password-input"], input[name="password"], input#password');
    this.confirmPasswordInput = page.locator('[data-testid="confirm-password-input"], input[name="confirmPassword"], input#confirm-password');
    this.termsCheckbox = page.locator('[data-testid="terms-checkbox"], input#terms');
    this.submitButton = page.locator('[data-testid="register-submit-button"], button[type="submit"]');
    this.errorMessage = page.locator('[data-testid="error-message"], [role="alert"]');
    this.signInLink = page.locator('a[href="/login"], a:has-text("Sign in")');
  }

  /**
   * Navigate to the register page.
   */
  async goto(): Promise<void> {
    await this.page.goto('/register');
    await this.nameInput.waitFor({ state: 'visible' });
  }

  /**
   * Fill in the registration form and submit.
   */
  async register(data: { name: string; email: string; password: string }): Promise<void> {
    await this.nameInput.fill(data.name);
    await this.emailInput.fill(data.email);
    await this.passwordInput.fill(data.password);
    await this.confirmPasswordInput.fill(data.password);

    // Check terms checkbox if present
    if (await this.termsCheckbox.count() > 0) {
      await this.termsCheckbox.check();
    }

    await this.submitButton.click();
  }

  /**
   * Fill and submit the form, then wait for navigation to dashboard.
   */
  async registerAndWaitForDashboard(data: { name: string; email: string; password: string }): Promise<void> {
    await this.register(data);
    await this.page.waitForURL(/\/(dashboard|daily-briefing)/, { timeout: 20000 });
  }

  /**
   * Assert that an error message is visible.
   */
  async expectError(text?: string | RegExp): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
    if (text) {
      await expect(this.errorMessage).toContainText(text);
    }
  }

  /**
   * Assert that we are on the register page.
   */
  async expectOnPage(): Promise<void> {
    await expect(this.page).toHaveURL(/.*register/);
    await expect(this.nameInput).toBeVisible();
  }
}
