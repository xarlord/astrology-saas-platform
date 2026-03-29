/**
 * Debug Registration Test
 */

import { test, expect } from '@playwright/test';

test.describe('Debug Registration', () => {
  test('should see registration page', async ({ page }) => {
    await page.goto('/register');
    await page.waitForTimeout(2000);

    // Check if we're on registration page
    await expect(page).toHaveURL(/.*register/);

    // Take screenshot
    await page.screenshot({ path: 'debug-register-page.png' });

    console.log('Page URL:', page.url());
    console.log('Page title:', await page.title());
  });

  test('should enable submit button when form is valid', async ({ page }) => {
    await page.goto('/register');
    await page.waitForTimeout(1000);

    // Fill form
    await page.fill('[data-testid="name-input"]', 'Test User');
    await page.fill('[data-testid="register-email-input"]', 'test@example.com');
    await page.fill('[data-testid="register-password-input"]', 'Test123!');
    await page.fill('[data-testid="confirm-password-input"]', 'Test123!');
    await page.waitForTimeout(500);

    // Check button state before terms
    const buttonBefore = page.locator('[data-testid="register-submit-button"]');
    console.log('Button disabled before terms:', await buttonBefore.isDisabled());

    // Check terms
    await page.check('[data-testid="terms-checkbox"]');
    await page.waitForTimeout(500);

    // Check button state after terms
    const buttonAfter = page.locator('[data-testid="register-submit-button"]');
    console.log('Button disabled after terms:', await buttonAfter.isDisabled());

    // Take screenshot
    await page.screenshot({ path: 'debug-register-filled.png' });
  });

  test('should actually register', async ({ page }) => {
    await page.goto('/register');
    await page.waitForTimeout(1000);

    const userEmail = `debug-test-${Date.now()}@example.com`;

    // Fill form
    await page.fill('[data-testid="name-input"]', 'Debug User');
    await page.fill('[data-testid="register-email-input"]', userEmail);
    await page.fill('[data-testid="register-password-input"]', 'Test123!');
    await page.fill('[data-testid="confirm-password-input"]', 'Test123!');
    await page.waitForTimeout(500);

    // Check terms
    await page.check('[data-testid="terms-checkbox"]');
    await page.waitForTimeout(1000);

    // Submit
    await page.click('[data-testid="register-submit-button"]');

    // Wait for navigation
    await page.waitForTimeout(5000);

    console.log('URL after submit:', page.url());
    console.log('Is on dashboard:', page.url().includes('/dashboard'));
    console.log('Still on register:', page.url().includes('/register'));

    // Take screenshot
    await page.screenshot({ path: 'debug-after-submit.png' });

    // Check for any errors on the page
    const errors = page.locator('text=/error|failed|invalid/i');
    const errorCount = await errors.count();
    console.log('Error count:', errorCount);

    if (errorCount > 0) {
      const errorText = await errors.first().textContent();
      console.log('Error text:', errorText);
    }

    // Check localStorage for tokens
    const accessToken = await page.evaluate(() => localStorage.getItem('accessToken'));
    const refreshToken = await page.evaluate(() => localStorage.getItem('refreshToken'));
    console.log('Access token exists:', !!accessToken);
    console.log('Refresh token exists:', !!refreshToken);

    if (accessToken) {
      console.log('✓ Registration successful!');
    } else {
      console.log('✗ Registration failed - no access token');
    }
  });
});
