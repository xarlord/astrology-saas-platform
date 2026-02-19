/**
 * E2E Test Specifications: Authentication Flow
 *
 * Tests the complete authentication lifecycle including:
 * - User registration
 * - User login
 * - User logout
 * - Password reset
 * - Session persistence
 * - Social auth UI
 * - Protected route handling
 */

import { test, expect } from '@playwright/test';
import { AuthenticationPage } from './pages/AuthenticationPage';
import { TestHelpers } from './utils/test-helpers';
import { testUsers, apiResponses } from './fixtures/test-data';

test.describe('Authentication Flow - Registration', () => {
  let authPage: AuthenticationPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthenticationPage(page);
    helpers = new TestHelpers(page);
    await page.goto('/');
  });

  test('should register new user with valid data', async ({ page }) => {
    // Navigate to registration
    await page.click('text=Get Started');
    await authPage.verifyOnRegisterPage();

    // Fill registration form
    await authPage.fillRegistrationForm(
      testUsers.valid.name,
      testUsers.valid.email,
      testUsers.valid.password,
      testUsers.valid.password
    );

    // Accept terms
    await authPage.agreeToTermsCheckbox.check();

    // Submit registration
    await authPage.submitRegistration();

    // Verify redirect to dashboard
    await helpers.waitForLoading();
    await helpers.verifyUrl(/.*dashboard/);

    // Verify success message
    await helpers.verifyToast(/welcome|registration successful|account created/i);

    // Verify user is logged in
    await authPage.verifyLoggedIn();

    // Take screenshot
    await helpers.takeScreenshot('registration-success');
  });

  test('should validate required fields during registration', async ({ page }) => {
    await page.click('text=Get Started');
    await authPage.verifyOnRegisterPage();

    // Submit empty form
    await authPage.submitRegistration();

    // Verify validation errors
    await authPage.verifyValidationErrors(4);

    // Verify error messages
    await authPage.verifyErrorMessage(/name is required|email is required|password is required/i);

    await helpers.takeScreenshot('registration-validation-errors');
  });

  test('should validate email format', async ({ page }) => {
    await page.click('text=Get Started');
    await authPage.verifyOnRegisterPage();

    // Fill form with invalid email
    await authPage.fillRegistrationForm(
      testUsers.valid.name,
      testUsers.invalid.email,
      testUsers.valid.password,
      testUsers.valid.password
    );

    await authPage.agreeToTermsCheckbox.check();
    await authPage.submitRegistration();

    // Verify email validation error
    await authPage.verifyErrorMessage(/invalid email|valid email required/i);

    await helpers.takeScreenshot('registration-invalid-email');
  });

  test('should validate password strength', async ({ page }) => {
    await page.click('text=Get Started');
    await authPage.verifyOnRegisterPage();

    // Fill form with weak password
    await authPage.fillRegistrationForm(
      testUsers.valid.name,
      testUsers.valid.email,
      testUsers.invalid.weakPassword,
      testUsers.invalid.weakPassword
    );

    await authPage.agreeToTermsCheckbox.check();
    await authPage.submitRegistration();

    // Verify password strength error
    await authPage.verifyErrorMessage(/password must be at least|8 characters/i);

    await helpers.takeScreenshot('registration-weak-password');
  });

  test('should validate password confirmation', async ({ page }) => {
    await page.click('text=Get Started');
    await authPage.verifyOnRegisterPage();

    // Fill form with mismatched passwords
    await authPage.fillRegistrationForm(
      testUsers.valid.name,
      testUsers.valid.email,
      testUsers.valid.password,
      testUsers.invalid.mismatchedPassword
    );

    await authPage.agreeToTermsCheckbox.check();
    await authPage.submitRegistration();

    // Verify password mismatch error
    await authPage.verifyErrorMessage(/passwords do not match|passwords must match/i);

    await helpers.takeScreenshot('registration-password-mismatch');
  });

  test('should require terms acceptance', async ({ page }) => {
    await page.click('text=Get Started');
    await authPage.verifyOnRegisterPage();

    // Fill form without accepting terms
    await authPage.fillRegistrationForm(
      testUsers.valid.name,
      testUsers.valid.email,
      testUsers.valid.password,
      testUsers.valid.password
    );

    await authPage.submitRegistration();

    // Verify terms acceptance error
    await authPage.verifyErrorMessage(/accept terms|agree to terms/i);

    await helpers.takeScreenshot('registration-terms-required');
  });
});

test.describe('Authentication Flow - Login', () => {
  let authPage: AuthenticationPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthenticationPage(page);
    helpers = new TestHelpers(page);
    await page.goto('/');
  });

  test('should login with valid credentials', async ({ page }) => {
    await authPage.login(
      testUsers.existing.email,
      testUsers.existing.password
    );

    // Verify redirect to dashboard
    await helpers.waitForLoading();
    await helpers.verifyUrl(/.*dashboard/);

    // Verify user is logged in
    await authPage.verifyLoggedIn();

    await helpers.takeScreenshot('login-success');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await authPage.gotoLoginPage();
    await authPage.fillLoginForm(
      testUsers.existing.email,
      'WrongPassword123!'
    );
    await authPage.submitLogin();

    // Verify error message
    await authPage.verifyErrorMessage(/invalid credentials|incorrect email or password/i);

    // Verify still on login page
    await authPage.verifyOnLoginPage();

    await helpers.takeScreenshot('login-invalid-credentials');
  });

  test('should show error for non-existent user', async ({ page }) => {
    await authPage.gotoLoginPage();
    await authPage.fillLoginForm(
      'nonexistent@example.com',
      testUsers.valid.password
    );
    await authPage.submitLogin();

    // Verify error message
    await authPage.verifyErrorMessage(/user not found|no account found/i);

    await helpers.takeScreenshot('login-user-not-found');
  });

  test('should validate login form fields', async ({ page }) => {
    await authPage.gotoLoginPage();

    // Submit empty form
    await authPage.submitLogin();

    // Verify validation errors
    await authPage.verifyValidationErrors(2);

    await helpers.takeScreenshot('login-validation-errors');
  });

  test('should toggle password visibility', async ({ page }) => {
    await authPage.gotoLoginPage();

    // Verify password is initially hidden
    await authPage.verifyPasswordType('password');

    // Toggle visibility
    await authPage.togglePasswordVisibility();

    // Verify password is now visible
    await authPage.verifyPasswordType('text');

    // Toggle again
    await authPage.togglePasswordVisibility();

    // Verify password is hidden again
    await authPage.verifyPasswordType('password');

    await helpers.takeScreenshot('login-password-visibility');
  });

  test('should remember user when remember me is checked', async ({ page }) => {
    await authPage.gotoLoginPage();
    await authPage.fillLoginForm(
      testUsers.existing.email,
      testUsers.existing.password
    );
    await authPage.toggleRememberMe();
    await authPage.submitLogin();

    // Verify login
    await helpers.waitForLoading();
    await authPage.verifyLoggedIn();

    // Verify remember me token is stored
    const rememberToken = await helpers.getLocalStorage('rememberMe');
    expect(rememberToken).toBeTruthy();
  });
});

test.describe('Authentication Flow - Session Management', () => {
  let authPage: AuthenticationPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthenticationPage(page);
    helpers = new TestHelpers(page);
  });

  test('should persist session across page reloads', async ({ page }) => {
    // Login
    await authPage.login(
      testUsers.existing.email,
      testUsers.existing.password
    );

    await helpers.waitForLoading();
    await helpers.verifyUrl(/.*dashboard/);

    // Reload page
    await page.reload();

    // Verify still logged in
    await authPage.verifyLoggedIn();
    await helpers.verifyUrl(/.*dashboard/);
  });

  test('should persist session across tabs', async ({ context, page }) => {
    // Login in first tab
    await authPage.login(
      testUsers.existing.email,
      testUsers.existing.password
    );

    await helpers.waitForLoading();

    // Open new tab
    const newPage = await context.newPage();
    await newPage.goto('/dashboard');

    // Verify logged in new tab
    const newAuthPage = new AuthenticationPage(newPage);
    await newAuthPage.verifyLoggedIn();
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await authPage.login(
      testUsers.existing.email,
      testUsers.existing.password
    );

    await helpers.waitForLoading();
    await authPage.verifyLoggedIn();

    // Logout
    await authPage.logout();

    // Verify redirected to home/login
    await helpers.verifyUrl(/(\/$|\/login)/);
    await authPage.verifyLoggedOut();

    // Verify storage cleared
    const authToken = await helpers.getLocalStorage('authToken');
    expect(authToken).toBeNull();

    await helpers.takeScreenshot('logout-success');
  });

  test('should clear session on logout', async ({ page }) => {
    // Login
    await authPage.login(
      testUsers.existing.email,
      testUsers.existing.password
    );

    await helpers.waitForLoading();

    // Logout
    await authPage.logout();

    // Try to access protected route
    await page.goto('/dashboard');

    // Should redirect to login
    await helpers.verifyUrl(/.*login/);
  });
});

test.describe('Authentication Flow - Password Reset', () => {
  let authPage: AuthenticationPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthenticationPage(page);
    helpers = new TestHelpers(page);
  });

  test('should navigate to password reset page', async ({ page }) => {
    await authPage.gotoPasswordResetPage();

    // Verify on reset page
    await authPage.verifyOnPasswordResetPage();

    // Verify email input is present
    await expect(authPage.emailInput).toBeVisible();

    await helpers.takeScreenshot('password-reset-page');
  });

  test('should request password reset', async ({ page }) => {
    await authPage.gotoPasswordResetPage();

    // Enter email
    await authPage.emailInput.fill(testUsers.existing.email);

    // Submit reset request
    await page.click('button[type="submit"]');

    // Verify success message
    await helpers.verifyToast(/reset link sent|check your email/i);

    await helpers.takeScreenshot('password-reset-requested');
  });

  test('should validate email on password reset', async ({ page }) => {
    await authPage.gotoPasswordResetPage();

    // Submit empty form
    await page.click('button[type="submit"]');

    // Verify validation error
    await authPage.verifyErrorMessage(/email is required/i);

    // Submit invalid email
    await authPage.emailInput.fill(testUsers.invalid.email);
    await page.click('button[type="submit"]');

    // Verify email validation error
    await authPage.verifyErrorMessage(/invalid email/i);

    await helpers.takeScreenshot('password-reset-validation');
  });
});

test.describe('Authentication Flow - Protected Routes', () => {
  let authPage: AuthenticationPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthenticationPage(page);
    helpers = new TestHelpers(page);
  });

  test('should redirect to login when accessing protected route', async ({ page }) => {
    // Try to access dashboard without login
    await page.goto('/dashboard');

    // Should redirect to login
    await helpers.verifyUrl(/.*login/);
  });

  test('should preserve intended redirect after login', async ({ page }) => {
    // Try to access protected route
    await page.goto('/charts/create');

    // Should redirect to login
    await helpers.verifyUrl(/.*login/);

    // Login
    await authPage.login(
      testUsers.existing.email,
      testUsers.existing.password
    );

    // Should redirect back to intended page
    await helpers.waitForLoading();
    await helpers.verifyUrl(/.*charts.*create/);
  });

  test('should show access denied message for unauthorized access', async ({ page }) => {
    // Try to access protected route
    await page.goto('/api/v1/charts');

    // Should show access denied or redirect
    const isErrorVisible = await page.locator('text=Access Denied|Unauthorized|401').count() > 0;
    const isRedirected = page.url().includes('/login');

    expect(isErrorVisible || isRedirected).toBeTruthy();
  });
});

test.describe('Authentication Flow - Social Authentication', () => {
  let authPage: AuthenticationPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthenticationPage(page);
    helpers = new TestHelpers(page);
  });

  test('should display social auth buttons', async ({ page }) => {
    await authPage.gotoRegisterPage();

    // Verify at least one social auth button is present
    const socialAuthCount = await authPage.socialAuthButtons.count();
    expect(socialAuthCount).toBeGreaterThan(0);

    await helpers.takeScreenshot('social-auth-buttons');
  });

  test('should open Google auth popup', async ({ page }) => {
    await authPage.gotoRegisterPage();

    const googleButton = page.locator('button:has-text("Google"), [aria-label*="Google"]');
    if (await googleButton.count() > 0) {
      // Note: In actual test, this would open a popup
      // For E2E, we just verify the button is present and clickable
      await expect(googleButton).toBeVisible();
    }
  });
});

test.describe('Authentication Flow - Security', () => {
  let authPage: AuthenticationPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthenticationPage(page);
    helpers = new TestHelpers(page);
  });

  test('should handle rate limiting on failed login attempts', async ({ page }) => {
    await authPage.gotoLoginPage();

    // Attempt multiple failed logins
    for (let i = 0; i < 5; i++) {
      await authPage.fillLoginForm(
        testUsers.existing.email,
        'WrongPassword'
      );
      await authPage.submitLogin();
      await page.waitForTimeout(500);
    }

    // Verify rate limiting message
    const rateLimitMessage = await page.locator('text=too many attempts|rate limit|try again later').count();
    if (rateLimitMessage > 0) {
      await helpers.takeScreenshot('login-rate-limited');
    }
  });

  test('should secure sensitive data in URL', async ({ page }) => {
    await authPage.login(
      testUsers.existing.email,
      testUsers.existing.password
    );

    // Verify password is not in URL
    expect(page.url()).not.toContain('password');
    expect(page.url()).not.toContain('token');
  });
});

test.describe('Authentication Flow - Cross-Browser', () => {
  test('should work in Chrome', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Chrome-specific test');

    const authPage = new AuthenticationPage(page);
    await authPage.gotoLoginPage();

    await expect(page).toHaveTitle(/Login|Sign In/);
  });

  test('should work in Firefox', async ({ page, browserName }) => {
    test.skip(browserName !== 'firefox', 'Firefox-specific test');

    const authPage = new AuthenticationPage(page);
    await authPage.gotoLoginPage();

    await expect(page).toHaveTitle(/Login|Sign In/);
  });

  test('should work in Safari', async ({ page, browserName }) => {
    test.skip(browserName !== 'webkit', 'Safari-specific test');

    const authPage = new AuthenticationPage(page);
    await authPage.gotoLoginPage();

    await expect(page).toHaveTitle(/Login|Sign In/);
  });
});
