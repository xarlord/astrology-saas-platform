/**
 * E2E Test: Authentication Flow
 * Tests user registration, login, validation, protected routes, and logout.
 */

import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';
import { API_BASE, uniqueEmail, TEST_PASSWORD, fetchCsrfToken } from './helpers/test-data';
import { registerAndLogin } from './helpers/api-helpers';
import { injectAuthState } from './fixtures/auth.fixture';

test.describe('Authentication', () => {
  // ------------------------------------------------------------------ register
  test('should register a new user and redirect to /dashboard', async ({ page }) => {
    const email = uniqueEmail('auth-reg');

    await page.goto('/register');

    await page.locator('input[name="name"]').fill('E2E Test User');
    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="password"]').fill(TEST_PASSWORD);
    await page.locator('input[name="confirmPassword"]').fill(TEST_PASSWORD);

    // Check the terms checkbox if present
    const termsCheckbox = page.locator('#terms');
    if (await termsCheckbox.count() > 0) {
      await termsCheckbox.check();
    }

    await page.locator('button[type="submit"]').click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
    await expect(page.getByText('Your Charts')).toBeVisible({ timeout: 10000 });
  });

  // --------------------------------------------------------- login via UI
  test('should login an existing user via the login form', async ({ request, page }) => {
    const email = uniqueEmail('auth-login');

    const csrfToken = await fetchCsrfToken(request);
    const regRes = await request.post(`${API_BASE}/auth/register`, {
      headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
      data: { name: 'E2E Login User', email, password: TEST_PASSWORD },
    });
    expect(regRes.ok()).toBeTruthy();

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(email, TEST_PASSWORD);

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
    await expect(page.getByText('Your Charts')).toBeVisible({ timeout: 10000 });
  });

  // ------------------------------------------------- validation: bad email
  test('should block form submission for an invalid email on registration', async ({ page }) => {
    await page.goto('/register');

    await page.locator('input[name="name"]').fill('Test');
    await page.locator('input[name="email"]').fill('notanemail');
    await page.locator('input[name="password"]').fill(TEST_PASSWORD);
    await page.locator('input[name="confirmPassword"]').fill(TEST_PASSWORD);

    await page.locator('button[type="submit"]').click();

    // HTML5 native validation on type="email" prevents submission
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

    await expect(page).toHaveURL(/\/register/, { timeout: 3000 });
  });

  // ----------------------------------------- login with wrong password
  test('should show an error when logging in with wrong password', async ({ request }) => {
    const email = uniqueEmail('auth-wrongpwd');

    const csrfToken = await fetchCsrfToken(request);
    const regRes = await request.post(`${API_BASE}/auth/register`, {
      headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
      data: { name: 'Wrong Pwd User', email, password: TEST_PASSWORD },
    });
    expect(regRes.ok()).toBeTruthy();

    // Verify via API that wrong password returns 401
    const csrfToken2 = await fetchCsrfToken(request);
    const wrongPwdRes = await request.post(`${API_BASE}/auth/login`, {
      headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken2 },
      data: { email, password: 'CompletelyWrong1!' },
    });
    expect(wrongPwdRes.status()).toBe(401);
  });

  // ------------------------------ redirect to login for protected route
  test('should redirect unauthenticated user to /login when visiting /dashboard', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  // --------------------------------------------------------------- logout
  test('should logout and redirect away from dashboard', async ({ request, page }) => {
    // Register and get tokens via shared helper
    const auth = await registerAndLogin(request, { password: TEST_PASSWORD });

    // Inject auth state into browser
    await injectAuthState(page.context(), auth);
    await page.goto('/dashboard');
    await expect(page.getByText('Your Charts')).toBeVisible({ timeout: 10000 });

    // Open user menu dropdown then click logout
    const userMenuButton = page.locator('button:has(> .bg-primary.rounded-full)').first();
    await userMenuButton.click();

    // Use JS click to bypass element interception issues in the dropdown overlay
    const logoutBtn = page.locator('button:has-text("Logout")');
    await expect(logoutBtn).toBeVisible({ timeout: 5000 });
    await logoutBtn.evaluate((el: HTMLButtonElement) => el.click());

    // Should be redirected away from dashboard
    await expect(page).toHaveURL(/(\/$|\/login)/, { timeout: 10000 });
  });
});
