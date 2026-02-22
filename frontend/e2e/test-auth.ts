/**
 * Test Authentication Utility
 *
 * Provides helper functions for E2E tests to authenticate users.
 * Handles both login and registration to ensure tests have valid users.
 */

import { Page, expect } from '@playwright/test';

// Test user credentials - unique per test to avoid conflicts
const getTestUserCredentials = () => ({
  name: 'E2E Test User',
  email: `e2e-test-${Math.random().toString(36).substring(7)}@example.com`,
  password: 'Test123!@',
});

/**
 * Authenticate a test user.
 * Tries to login first, then registers if login fails.
 *
 * @param page - Playwright Page object
 * @returns Promise<void>
 */
export async function authenticateTestUser(page: Page): Promise<void> {
  const credentials = getTestUserCredentials();

  // Try to login first
  await page.goto('/login');

  // Wait for login form
  const emailInput = page.locator('[data-testid="email-input"]');
  if (await emailInput.count() > 0) {
    await emailInput.fill(credentials.email);
    await page.fill('[data-testid="password-input"]', credentials.password);
    await page.click('[data-testid="submit-button"]');

    // Wait for navigation - check if URL changed
    await page.waitForURL(
      (url) => !url.pathname.includes('/login'),
      { timeout: 10000 }
    ).catch(() => {
      // Login might have failed, will try registration
    });

    // Check if login succeeded (we're not on login page anymore)
    const currentUrl = page.url();
    if (!currentUrl.includes('/login')) {
      // Login successful!
      console.log('✓ Test user logged in successfully');
      return;
    }
  }

  // Login failed or form not available, register new user
  console.log('⚠ Login failed, registering new test user...');
  await registerTestUser(page, credentials);
}

/**
 * Register a new test user.
 *
 * @param page - Playwright Page object
 * @param credentials - User credentials (optional, will generate if not provided)
 * @returns Promise<void>
 */
export async function registerTestUser(
  page: Page,
  credentials?: { name: string; email: string; password: string }
): Promise<void> {
  const user = credentials || getTestUserCredentials();

  await page.goto('/register');

  // Wait for registration form - try multiple possible selectors
  const nameInput = page.locator('[data-testid="name-input"], #name, input[name="name"]').first();
  await nameInput.waitFor({ state: 'visible', timeout: 10000 });

  // Fill registration form
  await nameInput.fill(user.name);

  const emailInput = page.locator('[data-testid="register-email-input"], #email, input[name="email"]').first();
  await emailInput.fill(user.email);

  const passwordInput = page.locator('[data-testid="register-password-input"], #password, input[name="password"]').first();
  await passwordInput.fill(user.password);

  const confirmPasswordInput = page.locator('[data-testid="confirm-password-input"], #confirmPassword, input[name="confirmPassword"]').first();
  await confirmPasswordInput.fill(user.password);

  // Check for terms checkbox if it exists
  const termsCheckbox = page.locator('[data-testid="terms-checkbox"], #terms').first();
  if (await termsCheckbox.count() > 0) {
    await termsCheckbox.check();
  }

  // Submit form
  await page.click('[data-testid="register-submit-button"], button[type="submit"]');

  // Wait for navigation - wait for URL to change away from /register
  const navigated = await page.waitForURL(
    (url) => !url.pathname.includes('/register'),
    { timeout: 15000 }
  ).then(() => true)
  .catch(() => {
    // If navigation doesn't happen, check for errors
    console.log('⚠ Navigation timeout - still on /register');
    return false;
  });

  // Verify we're not on registration page anymore
  const currentUrl = page.url();
  if (currentUrl.includes('/register') || !navigated) {
    console.log('⚠ Still on registration page after submit');

    // Check for errors
    const errorElement = page.locator('text=/error|failed|invalid|already exists/i').first();
    if (await errorElement.count() > 0) {
      const errorText = await errorElement.textContent();
      console.log('⚠ Registration error:', errorText);

      // If user already exists, that's OK - try login instead
      if (errorText?.includes('already exists')) {
        console.log('✓ User already exists, logging in instead...');
        await page.goto('/login');

        const loginEmail = page.locator('[data-testid="email-input"], input[name="email"]').first();
        await loginEmail.fill(user.email);

        const loginPassword = page.locator('[data-testid="password-input"], input[name="password"]').first();
        await loginPassword.fill(user.password);

        await page.click('[data-testid="submit-button"], button[type="submit"]');

        // Wait for navigation
        await page.waitForURL(
          (url) => !url.pathname.includes('/login'),
          { timeout: 10000 }
        ).catch(() => {
          console.log('⚠ Login navigation timeout');
        });
      }
    }
  }

  // Verify we're authenticated (on dashboard or similar)
  const finalUrl = page.url();
  if (!finalUrl.includes('/dashboard') && !finalUrl.includes('/login')) {
    console.log('⚠ Final URL:', finalUrl);
  }

  console.log('✓ Registration/login completed for:', user.email);
}

/**
 * Logout current user.
 *
 * @param page - Playwright Page object
 * @returns Promise<void>
 */
export async function logoutTestUser(page: Page): Promise<void> {
  // Try to find and click logout button
  const userMenu = page.locator('.relative.group').first();

  if (await userMenu.isVisible()) {
    await userMenu.hover();
    await page.waitForTimeout(500);

    const logoutButton = page.getByTestId('logout-button');
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await page.waitForTimeout(2000);
      console.log('✓ User logged out successfully');
      return;
    }
  }

  // Alternative: navigate to login directly
  await page.goto('/login');
  await page.waitForTimeout(1000);
  console.log('✓ Navigated to login page');
}

/**
 * Check if user is authenticated.
 *
 * @param page - Playwright Page object
 * @returns Promise<boolean> - True if authenticated
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  const currentUrl = page.url();

  // If we're on login or register page, we're not authenticated
  if (currentUrl.includes('/login') || currentUrl.includes('/register')) {
    return false;
  }

  // Try to access a protected route
  // If we get redirected to login, we're not authenticated
  await page.goto('/dashboard');
  await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

  const dashboardUrl = page.url();
  return !dashboardUrl.includes('/login');
}

/**
 * Setup authenticated state for a test.
 * Combines authentication check and login/registration.
 *
 * @param page - Playwright Page object
 * @returns Promise<boolean> - True if authenticated, false otherwise
 */
export async function setupAuthenticatedTest(page: Page): Promise<boolean> {
  // Check if already authenticated by trying to access dashboard
  try {
    await page.goto('/dashboard');

    // Wait a bit for navigation to complete
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

    const dashboardUrl = page.url();
    if (!dashboardUrl.includes('/login') && !dashboardUrl.includes('/register')) {
      console.log('✓ Already authenticated');
      return true;
    }
  } catch {
    // Continue to authentication
  }

  // Not authenticated, perform login/registration
  try {
    await authenticateTestUser(page);

    // Verify authentication worked - wait for page to settle
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
    const currentUrl = page.url();

    if (currentUrl.includes('/login') || currentUrl.includes('/register')) {
      console.log('⚠ Authentication failed - API might not be available');
      return false;
    }

    return true;
  } catch (error) {
    console.log('⚠ Authentication error:', error);
    return false;
  }
}

/**
 * Create a consistent test user for multiple test runs.
 * Uses a fixed email so the same user can be reused across tests.
 *
 * @param testId - Unique identifier for the test (e.g., 'test-1')
 * @returns Test user credentials
 */
export function getConsistentTestUser(testId: string) {
  return {
    name: `E2E Test User ${testId}`,
    email: `e2e-${testId}@example.com`,
    password: 'Test123!@',
  };
}
