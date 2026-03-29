/**
 * Authentication Page Object Model
 * Encapsulates authentication page interactions
 */

import { Page, Locator, expect } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';
import { testUsers } from '../fixtures/test-data';

export class AuthenticationPage {
  readonly page: Page;
  readonly helpers: TestHelpers;

  // Page locators
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly nameInput: Locator;
  readonly loginButton: Locator;
  readonly registerButton: Locator;
  readonly logoutButton: Locator;
  readonly forgotPasswordLink: Locator;
  readonly rememberMeCheckbox: Locator;
  readonly agreeToTermsCheckbox: Locator;
  readonly passwordVisibilityToggle: Locator;
  readonly socialAuthButtons: Locator;
  readonly errorMessage: Locator;
  readonly successMessage: Locator;
  readonly validationErrors: Locator;

  constructor(page: Page) {
    this.page = page;
    this.helpers = new TestHelpers(page);

    // Initialize locators
    this.emailInput = page.locator('[name="email"], input[type="email"]');
    this.passwordInput = page.locator('[name="password"], input[type="password"]');
    this.confirmPasswordInput = page.locator('[name="confirmPassword"]');
    this.nameInput = page.locator('[name="name"]');
    this.loginButton = page.locator('button[type="submit"]:has-text("Sign In"), button:has-text("Login")');
    this.registerButton = page.locator('button[type="submit"]:has-text("Sign Up"), button:has-text("Register")');
    this.logoutButton = page.locator('button:has-text("Logout"), [aria-label="Logout"]');
    this.forgotPasswordLink = page.locator('a:has-text("Forgot"), a:has-text("reset")');
    this.rememberMeCheckbox = page.locator('[name="remember"]');
    this.agreeToTermsCheckbox = page.locator('[name="agreeToTerms"], [name="terms"]');
    this.passwordVisibilityToggle = page.locator('button[aria-label*="password"], button:has-text("eye")');
    this.socialAuthButtons = page.locator('button:has-text("Google"), button:has-text("Apple"), [aria-label*="Google"], [aria-label*="Apple"]');
    this.errorMessage = page.locator('.error, .error-message, [role="alert"]');
    this.successMessage = page.locator('.success, .success-message');
    this.validationErrors = page.locator('.error, .validation-error');
  }

  /**
   * Navigate to login page
   */
  async gotoLoginPage(): Promise<void> {
    await this.page.goto('/login');
    await this.helpers.waitForLoading();
  }

  /**
   * Navigate to register page
   */
  async gotoRegisterPage(): Promise<void> {
    await this.page.goto('/register');
    await this.helpers.waitForLoading();
  }

  /**
   * Navigate to password reset page
   */
  async gotoPasswordResetPage(): Promise<void> {
    await this.gotoLoginPage();
    await this.forgotPasswordLink.click();
  }

  /**
   * Fill login form
   */
  async fillLoginForm(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  /**
   * Fill registration form
   */
  async fillRegistrationForm(
    name: string,
    email: string,
    password: string,
    confirmPassword?: string
  ): Promise<void> {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    if (confirmPassword && await this.confirmPasswordInput.count() > 0) {
      await this.confirmPasswordInput.fill(confirmPassword);
    }
  }

  /**
   * Submit login form
   */
  async submitLogin(): Promise<void> {
    await this.loginButton.click();
  }

  /**
   * Submit registration form
   */
  async submitRegistration(): Promise<void> {
    await this.registerButton.click();
  }

  /**
   * Perform complete login
   */
  async login(email: string, password: string): Promise<void> {
    await this.gotoLoginPage();
    await this.fillLoginForm(email, password);
    await this.submitLogin();
  }

  /**
   * Perform complete registration
   */
  async register(
    name: string,
    email: string,
    password: string,
    confirmPassword?: string,
    agreeToTerms: boolean = true
  ): Promise<void> {
    await this.gotoRegisterPage();
    await this.fillRegistrationForm(name, email, password, confirmPassword);
    if (agreeToTerms && await this.agreeToTermsCheckbox.count() > 0) {
      await this.agreeToTermsCheckbox.check();
    }
    await this.submitRegistration();
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    await this.logoutButton.click();
    // Confirm logout if confirmation dialog appears
    const confirmButton = this.page.locator('button:has-text("Confirm"), button:has-text("Yes")');
    if (await confirmButton.count() > 0) {
      await confirmButton.click();
    }
  }

  /**
   * Toggle remember me
   */
  async toggleRememberMe(): Promise<void> {
    if (await this.rememberMeCheckbox.count() > 0) {
      await this.rememberMeCheckbox.check();
    }
  }

  /**
   * Toggle password visibility
   */
  async togglePasswordVisibility(): Promise<void> {
    await this.passwordVisibilityToggle.first().click();
  }

  /**
   * Verify password field type
   */
  async verifyPasswordType(type: 'password' | 'text'): Promise<void> {
    await expect(this.passwordInput).toHaveAttribute('type', type);
  }

  /**
   * Verify error message is displayed
   */
  async verifyErrorMessage(message: string | RegExp): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(message);
  }

  /**
   * Verify validation errors
   */
  async verifyValidationErrors(count: number): Promise<void> {
    await expect(this.validationErrors).toHaveCount(count);
  }

  /**
   * Verify user is logged in
   */
  async verifyLoggedIn(): Promise<void> {
    await expect(this.logoutButton).toBeVisible();
  }

  /**
   * Verify user is logged out
   */
  async verifyLoggedOut(): Promise<void> {
    await expect(this.page.locator('text=Login, text=Get Started').first()).toBeVisible();
  }

  /**
   * Verify we're on login page
   */
  async verifyOnLoginPage(): Promise<void> {
    await this.helpers.verifyUrl(/.*login/);
  }

  /**
   * Verify we're on register page
   */
  async verifyOnRegisterPage(): Promise<void> {
    await this.helpers.verifyUrl(/.*register/);
  }

  /**
   * Verify we're on password reset page
   */
  async verifyOnPasswordResetPage(): Promise<void> {
    await this.helpers.verifyUrl(/.*reset/);
  }

  /**
   * Get current URL
   */
  getCurrentUrl(): string {
    return this.page.url();
  }
}
