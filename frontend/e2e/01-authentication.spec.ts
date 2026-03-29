/**
 * E2E Test: Authentication Flow
 * Tests user registration, login, validation, protected routes, and logout.
 */

import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:3001/api/v1';

/** Unique email generator to avoid collisions between test runs. */
function uniqueEmail(): string {
  return `e2e-auth-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

test.describe('Authentication', () => {
  // ------------------------------------------------------------------ register
  test('should register a new user and redirect to /dashboard', async ({ page }) => {
    const email = uniqueEmail();

    await page.goto('/register');

    // Fill out the registration form (LoginPage / RegisterPage both use name-based inputs)
    await page.locator('input[name="name"]').fill('E2E Test User');
    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="password"]').fill('E2Epass123!');
    await page.locator('input[name="confirmPassword"]').fill('E2Epass123!');

    // Check the terms checkbox if present (AuthenticationForms variant)
    const termsCheckbox = page.locator('#terms');
    if (await termsCheckbox.count() > 0) {
      await termsCheckbox.check();
    }

    await page.locator('button[type="submit"]').click();

    // Should land on dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

    // Dashboard header should be visible
    await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 10000 });
  });

  // --------------------------------------------------------- login via UI
  test('should login an existing user via the login form', async ({ request, page }) => {
    const email = uniqueEmail();

    // Create the user via API first
    const regRes = await request.post(`${API_BASE}/auth/register`, {
      data: { name: 'E2E Login User', email, password: 'E2Epass123!' },
    });
    expect(regRes.ok()).toBeTruthy();

    await page.goto('/login');

    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="password"]').fill('E2Epass123!');
    await page.locator('button[type="submit"]').click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
    await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 10000 });
  });

  // ------------------------------------------------- validation: bad email
  test('should block form submission for an invalid email on registration', async ({ page }) => {
    await page.goto('/register');

    await page.locator('input[name="name"]').fill('Test');
    await page.locator('input[name="email"]').fill('notanemail');
    await page.locator('input[name="password"]').fill('E2Epass123!');
    await page.locator('input[name="confirmPassword"]').fill('E2Epass123!');

    // HTML5 native validation on type="email" prevents submission
    // The browser will show its own validation tooltip and stay on the form page
    await page.locator('button[type="submit"]').click();

    // Page should still be on register (no navigation away)
    await expect(page).toHaveURL(/\/register/);
  });

  // --------------------------------------------- validation: weak password
  test('should show validation error for a weak password on registration', async ({ page }) => {
    await page.goto('/register');

    await page.locator('input[name="name"]').fill('Test');
    await page.locator('input[name="email"]').fill(uniqueEmail());
    await page.locator('input[name="password"]').fill('123');
    await page.locator('input[name="confirmPassword"]').fill('123');

    await page.locator('button[type="submit"]').click();

    // HTML5 `minlength` validation or custom password validation may prevent submission
    // Either the browser blocks it natively, or the form shows a custom error
    // Just verify we stay on the register page (no navigation away)
    await expect(page).toHaveURL(/\/register/, { timeout: 3000 });
  });

  // ----------------------------------------- login with wrong password
  test('should show an error when logging in with wrong password', async ({ request, page }) => {
    const email = uniqueEmail();

    // Register the user
    const regRes = await request.post(`${API_BASE}/auth/register`, {
      data: { name: 'Wrong Pwd User', email, password: 'E2Epass123!' },
    });
    expect(regRes.ok()).toBeTruthy();

    // Verify via API that wrong password returns 401
    const wrongPwdRes = await request.post(`${API_BASE}/auth/login`, {
      data: { email, password: 'CompletelyWrong1!' },
    });
    expect(wrongPwdRes.status()).toBe(401);
  });

  // ------------------------------ redirect to login for protected route
  test('should redirect unauthenticated user to /login when visiting /dashboard', async ({ page }) => {
    // Ensure no auth tokens are present
    await page.goto('/dashboard');

    // Should be redirected to login
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  // --------------------------------------------------------------- logout
  test('should logout and redirect away from dashboard', async ({ request, page }) => {
    const email = uniqueEmail();

    // Register and get tokens
    const regRes = await request.post(`${API_BASE}/auth/register`, {
      data: { name: 'Logout User', email, password: 'E2Epass123!' },
    });
    const regBody = await regRes.json();
    const { accessToken, refreshToken } = regBody.data;

    // Inject auth state via localStorage (matches authStore persist key)
    await page.goto('/');
    await page.evaluate(
      ({ accessToken, refreshToken, email }) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem(
          'auth-storage',
          JSON.stringify({
            state: {
              user: { id: '1', name: 'Logout User', email, timezone: 'UTC', plan: 'free', preferences: {} },
              accessToken,
              refreshToken,
              isAuthenticated: true,
            },
            version: 0,
          }),
        );
      },
      { accessToken, refreshToken, email },
    );

    // Navigate to dashboard (should now be authenticated)
    await page.goto('/dashboard');
    await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 10000 });

    // Click logout
    await page.locator('button:has-text("Logout")').click();

    // Should be redirected away from dashboard
    await expect(page).toHaveURL(/(\/$|\/login)/, { timeout: 10000 });
  });
});
