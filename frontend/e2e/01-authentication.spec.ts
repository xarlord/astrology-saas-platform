/**
 * E2E Test: Authentication Flow
 * Tests complete user registration, login, and logout journey
 */

import { test, expect } from '@playwright/test';

// Test data
const testUser = {
  email: `e2e-test-${Date.now()}@example.com`,
  password: 'E2ETest123!',
  name: 'E2E Test User',
};

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
  });

  test('should register new user and redirect to dashboard', async ({ page }) => {
    // Click "Get Started" button
    await page.click('text=Get Started');

    // Should be on register page
    await expect(page).toHaveURL(/.*register/);

    // Fill registration form
    await page.fill('[name="name"]', testUser.name);
    await page.fill('[name="email"]', testUser.email);
    await page.fill('[name="password"]', testUser.password);
    await page.fill('[name="confirmPassword"]', testUser.password);

    // Accept terms
    await page.check('[name="agreeToTerms"]');

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to dashboard after successful registration
    await expect(page).toHaveURL(/.*dashboard/);

    // Should see welcome message or dashboard elements
    await expect(page.locator('h1, h2')).toContainText(/welcome|dashboard|my charts/i);

    // Verify user is logged in (check for logout button or user menu)
    await expect(page.locator('button:has-text("Logout"), [aria-label="User menu"]').first()).toBeVisible();
  });

  test('should login existing user', async ({ page }) => {
    // Navigate to login page
    await page.click('text=Login');

    // Should be on login page
    await expect(page).toHaveURL(/.*login/);

    // Fill login form
    await page.fill('[name="email"]', testUser.email);
    await page.fill('[name="password"]', testUser.password);

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/);

    // Should see dashboard elements
    await expect(page.locator('h1, h2')).toContainText(/dashboard|my charts/i);
  });

  test('should show validation errors for invalid registration data', async ({ page }) => {
    await page.click('text=Get Started');
    await expect(page).toHaveURL(/.*register/);

    // Try to submit empty form
    await page.click('button[type="submit"]');

    // Should show validation errors
    await expect(page.locator('text=required|please enter|invalid')).toHaveCount(3);

    // Test invalid email
    await page.fill('[name="email"]', 'invalid-email');
    await page.fill('[name="password"]', testUser.password);
    await page.fill('[name="confirmPassword"]', testUser.password);
    await page.fill('[name="name"]', testUser.name);

    await page.click('button[type="submit"]');
    await expect(page.locator('text=valid email|invalid email')).toBeVisible();

    // Test weak password
    await page.fill('[name="email"]', testUser.email);
    await page.fill('[name="password"]', 'weak');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=8 characters|at least|password must')).toBeVisible();
  });

  test('should show error for wrong credentials', async ({ page }) => {
    await page.click('text=Login');

    await page.fill('[name="email"]', testUser.email);
    await page.fill('[name="password"]', 'WrongPassword123!');

    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('text=invalid|incorrect|not found')).toBeVisible();

    // Should stay on login page
    await expect(page).toHaveURL(/.*login/);
  });

  test('should logout user successfully', async ({ page }) => {
    // First login
    await page.goto('/login');
    await page.fill('[name="email"]', testUser.email);
    await page.fill('[name="password"]', testUser.password);
    await page.click('button[type="submit"]');

    // Wait for dashboard to load
    await expect(page).toHaveURL(/.*dashboard/);

    // Click user menu or logout button
    await page.click('[aria-label="User menu"], button:has-text("Logout")');

    // If menu opens, click logout
    const logoutButton = page.locator('button:has-text("Logout")').first();
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
    }

    // Should redirect to home or login page
    await expect(page).toHaveURL(/(\/$|\/login)/);

    // Should see login/register buttons
    await expect(page.locator('text=Login, text=Get Started').first()).toBeVisible();
  });

  test('should persist login across page reloads', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[name="email"]', testUser.email);
    await page.fill('[name="password"]', testUser.password);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*dashboard/);

    // Reload page
    await page.reload();

    // Should still be on dashboard (user still logged in)
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('[aria-label="User menu"], button:has-text("Logout")')).toBeVisible();
  });

  test('should support social auth buttons (UI only)', async ({ page }) => {
    await page.goto('/register');

    // Check if social auth buttons are present
    const googleButton = page.locator('button:has-text("Google"), [aria-label*="Google"]');
    const appleButton = page.locator('button:has-text("Apple"), [aria-label*="Apple"]');

    // At least one should be present (depending on configuration)
    const socialAuthPresent = await googleButton.count() > 0 || await appleButton.count() > 0;
    expect(socialAuthPresent).toBeTruthy();
  });

  test('should redirect to login when accessing protected route', async ({ page }) => {
    // Try to access dashboard without logging in
    await page.goto('/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL(/.*login/);
  });

  test('should allow password visibility toggle', async ({ page }) => {
    await page.goto('/login');

    const passwordInput = page.locator('[name="password"]');
    const toggleButton = page.locator('button[aria-label*="password"], button:has-text("eye")');

    // Initially password should be hidden
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Click toggle
    await toggleButton.first().click();

    // Password should now be visible
    await expect(passwordInput).toHaveAttribute('type', 'text');

    // Click toggle again
    await toggleButton.first().click();

    // Password should be hidden again
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });
});

test.describe('Password Reset Flow', () => {
  test('should navigate to reset password page', async ({ page }) => {
    await page.goto('/login');

    // Click "Forgot password" link
    const forgotLink = page.locator('a:has-text("forgot"), a:has-text("reset")');
    if (await forgotLink.count() > 0) {
      await forgotLink.first().click();

      // Should be on reset password page
      await expect(page).toHaveURL(/.*reset/);

      // Should have email input
      await expect(page.locator('[name="email"], input[type="email"]')).toBeVisible();
    }
  });
});
