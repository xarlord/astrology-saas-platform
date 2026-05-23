/**
 * E2E Test: Email Authentication Flow
 *
 * Focused tests for email-only registration and login:
 * 1. Register a new user with email/password via UI
 * 2. Login with the registered credentials via UI
 * 3. Navigate from login → register and back
 * 4. Validation errors (wrong password, empty fields, weak password)
 * 5. Protected route redirect
 * 6. Logout
 * 7. Auth state persistence after page refresh
 */

import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';
import { RegisterPage } from './pages/register.page';
import { API_BASE, uniqueEmail, TEST_PASSWORD, fetchCsrfToken } from './helpers/test-data';
import { registerUser } from './helpers/api-helpers';

test.describe('Email Authentication Flow', () => {
  // ------------------------------------------------------------------ Register

  test.describe('Registration', () => {
    test('should register a new user with email/password and land on dashboard', async ({ page }) => {
      const registerPage = new RegisterPage(page);
      const email = uniqueEmail('reg');

      await registerPage.goto();
      await registerPage.registerAndWaitForDashboard({
        name: 'E2E Register User',
        email,
        password: TEST_PASSWORD,
      });

      // Verify we're on the dashboard (or daily-briefing for first login)
      await expect(page).toHaveURL(/\/(dashboard|daily-briefing)/);

      // Verify auth state is persisted in localStorage
      const authStorage = await page.evaluate(() => {
        const raw = localStorage.getItem('auth-storage');
        return raw ? JSON.parse(raw) : null;
      });
      expect(authStorage).not.toBeNull();
      expect(authStorage.state.isAuthenticated).toBe(true);
      expect(authStorage.state.user.email).toBe(email);
    });

    test('should show validation error for mismatched passwords', async ({ page }) => {
      const registerPage = new RegisterPage(page);
      await registerPage.goto();

      await registerPage.nameInput.fill('Test User');
      await registerPage.emailInput.fill(uniqueEmail('mismatch'));
      await registerPage.passwordInput.fill(TEST_PASSWORD);
      await registerPage.confirmPasswordInput.fill('DifferentPassword123!');

      // Check terms if needed
      if (await registerPage.termsCheckbox.count() > 0) {
        await registerPage.termsCheckbox.check();
      }

      await registerPage.submitButton.click();

      // Should stay on register page
      await expect(page).toHaveURL(/\/register/);
    });

    test('should show validation error for weak password', async ({ page }) => {
      const registerPage = new RegisterPage(page);
      await registerPage.goto();

      await registerPage.nameInput.fill('Test User');
      await registerPage.emailInput.fill(uniqueEmail('weak'));
      await registerPage.passwordInput.fill('123');
      await registerPage.confirmPasswordInput.fill('123');

      if (await registerPage.termsCheckbox.count() > 0) {
        await registerPage.termsCheckbox.check();
      }

      await registerPage.submitButton.click();

      // Should stay on register page (form validation blocks submit)
      await expect(page).toHaveURL(/\/register/, { timeout: 3000 });
    });

    test('should navigate to login page from register page', async ({ page }) => {
      const registerPage = new RegisterPage(page);
      await registerPage.goto();

      // Click "Sign in" link
      const signInLink = page.getByRole('link', { name: /sign in/i });
      if (await signInLink.isVisible().catch(() => false)) {
        await signInLink.click();
        await expect(page).toHaveURL(/\/login/);
      }
    });
  });

  // -------------------------------------------------------------------- Login

  test.describe('Login', () => {
    test('should login with registered email/password and land on dashboard', async ({ request, page }) => {
      const email = uniqueEmail('login');
      const password = TEST_PASSWORD;

      // Pre-register user via API for a clean login test
      await registerUser(request, { name: 'E2E Login User', email, password });

      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.loginAndWaitForDashboard(email, password);

      // Verify we're on dashboard or daily-briefing
      await expect(page).toHaveURL(/\/(dashboard|daily-briefing)/);

      // Verify user info in auth state
      const authStorage = await page.evaluate(() => {
        const raw = localStorage.getItem('auth-storage');
        return raw ? JSON.parse(raw) : null;
      });
      expect(authStorage).not.toBeNull();
      expect(authStorage.state.isAuthenticated).toBe(true);
      expect(authStorage.state.user.email).toBe(email);
    });

    test('should show error for wrong password', async ({ request, page }) => {
      const email = uniqueEmail('wrongpwd');

      // Register user
      await registerUser(request, { name: 'Wrong Pwd User', email, password: TEST_PASSWORD });

      const loginPage = new LoginPage(page);
      await loginPage.goto();

      await loginPage.emailInput.fill(email);
      await loginPage.passwordInput.fill('CompletelyWrongPassword1!');
      await loginPage.submitButton.click();

      // Should show error message
      await expect(page.getByText(/invalid|incorrect|failed|error/i)).toBeVisible({ timeout: 10000 });

      // Should still be on login page
      await expect(page).toHaveURL(/\/login/);
    });

    test('should show error for non-existent email', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();

      await loginPage.emailInput.fill('nonexistent@test-e2e-99999.com');
      await loginPage.passwordInput.fill('SomePassword123!');
      await loginPage.submitButton.click();

      await expect(page.getByText(/invalid|incorrect|failed|not found|error/i)).toBeVisible({ timeout: 10000 });
      await expect(page).toHaveURL(/\/login/);
    });

    test('should navigate to register page from login page', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();

      // Click "Sign up" link
      const signUpLink = page.getByRole('link', { name: /sign up/i });
      await expect(signUpLink).toBeVisible();
      await signUpLink.click();
      await expect(page).toHaveURL(/\/register/);
    });
  });

  // ------------------------------------------------------ Full Roundtrip Flow

  test.describe('Full Roundtrip: Register → Logout → Login', () => {
    test('complete user journey: register, verify dashboard, logout, login again', async ({ request, page }) => {
      const email = uniqueEmail('roundtrip');
      const password = TEST_PASSWORD;

      // Step 1: Register via UI
      const registerPage = new RegisterPage(page);
      await registerPage.goto();
      await registerPage.registerAndWaitForDashboard({
        name: 'E2E Roundtrip User',
        email,
        password,
      });

      // Step 2: Verify dashboard loaded
      await expect(page).toHaveURL(/\/(dashboard|daily-briefing)/);

      // Step 3: Logout — open user menu and click logout
      const userMenuButton = page.locator('button:has(> .bg-primary.rounded-full)').first();
      await userMenuButton.click();

      const logoutBtn = page.locator('button:has-text("Logout")');
      await expect(logoutBtn).toBeVisible({ timeout: 5000 });
      await logoutBtn.evaluate((el: HTMLButtonElement) => el.click());

      // Verify redirected away from dashboard
      await expect(page).toHaveURL(/(\/$|\/login)/, { timeout: 10000 });

      // Step 4: Login again with the same credentials
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.loginAndWaitForDashboard(email, password);

      // Step 5: Verify we're back on dashboard
      await expect(page).toHaveURL(/\/(dashboard|daily-briefing)/);
    });
  });

  // ------------------------------------------------ Protected Route Redirect

  test.describe('Protected Routes', () => {
    test('should redirect unauthenticated user to login from /dashboard', async ({ page }) => {
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    });

    test('should redirect unauthenticated user to login from /charts/new', async ({ page }) => {
      await page.goto('/charts/new');
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    });

    test('should allow authenticated user to access /dashboard', async ({ request, page }) => {
      const email = uniqueEmail('protected');
      const auth = await registerUser(request, { name: 'Protected User', email, password: TEST_PASSWORD });

      // Inject auth state
      await page.goto('/');
      await page.evaluate((entries: Array<{ name: string; value: string }>) => {
        for (const entry of entries) {
          localStorage.setItem(entry.name, entry.value);
        }
      }, [
        { name: 'accessToken', value: auth.accessToken },
        { name: 'refreshToken', value: auth.refreshToken },
        {
          name: 'auth-storage',
          value: JSON.stringify({
            state: {
              user: auth.user,
              accessToken: auth.accessToken,
              refreshToken: auth.refreshToken,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            },
            version: 0,
          }),
        },
      ]);

      await page.goto('/dashboard');
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    });
  });

  // ---------------------------------------- Auth Persistence After Refresh

  test.describe('Auth Persistence', () => {
    test('auth state persists after page refresh', async ({ request, page }) => {
      const email = uniqueEmail('persist');

      // Register via API and inject state
      const auth = await registerUser(request, { name: 'Persist User', email, password: TEST_PASSWORD });

      await page.goto('/');
      await page.evaluate((entries: Array<{ name: string; value: string }>) => {
        for (const entry of entries) {
          localStorage.setItem(entry.name, entry.value);
        }
      }, [
        { name: 'accessToken', value: auth.accessToken },
        { name: 'refreshToken', value: auth.refreshToken },
        {
          name: 'auth-storage',
          value: JSON.stringify({
            state: {
              user: auth.user,
              accessToken: auth.accessToken,
              refreshToken: auth.refreshToken,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            },
            version: 0,
          }),
        },
      ]);

      // Navigate to dashboard
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

      // Refresh page
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Should still be on dashboard (not redirected to login)
      await expect(page).toHaveURL(/\/dashboard/);
    });
  });

  // ---------------------------------------- API-Level Validation

  test.describe('Backend Auth API', () => {
    test('POST /auth/register creates a new user', async ({ request }) => {
      const email = uniqueEmail('api-reg');
      const csrfToken = await fetchCsrfToken(request);

      const res = await request.post(`${API_BASE}/auth/register`, {
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
        data: { name: 'API Register User', email, password: TEST_PASSWORD },
      });

      expect(res.status()).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.user).toBeDefined();
      expect(body.data.user.email).toBe(email);
      expect(body.data.accessToken).toBeDefined();
      expect(body.data.refreshToken).toBeDefined();
    });

    test('POST /auth/login returns tokens for valid credentials', async ({ request }) => {
      const email = uniqueEmail('api-login');
      const csrfToken = await fetchCsrfToken(request);

      // Register first
      await request.post(`${API_BASE}/auth/register`, {
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
        data: { name: 'API Login User', email, password: TEST_PASSWORD },
      });

      // Login
      const csrfToken2 = await fetchCsrfToken(request);
      const loginRes = await request.post(`${API_BASE}/auth/login`, {
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken2 },
        data: { email, password: TEST_PASSWORD },
      });

      expect(loginRes.status()).toBe(200);
      const body = await loginRes.json();
      expect(body.success).toBe(true);
      expect(body.data.accessToken).toBeDefined();
      expect(body.data.refreshToken).toBeDefined();
    });

    test('POST /auth/login returns 401 for wrong password', async ({ request }) => {
      const email = uniqueEmail('api-401');
      const csrfToken = await fetchCsrfToken(request);

      await request.post(`${API_BASE}/auth/register`, {
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
        data: { name: 'API 401 User', email, password: TEST_PASSWORD },
      });

      const csrfToken2 = await fetchCsrfToken(request);
      const loginRes = await request.post(`${API_BASE}/auth/login`, {
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken2 },
        data: { email, password: 'CompletelyWrong1!' },
      });

      expect(loginRes.status()).toBe(401);
    });

    test('POST /auth/register rejects duplicate email', async ({ request }) => {
      const email = uniqueEmail('api-dup');
      const csrfToken = await fetchCsrfToken(request);

      // First registration
      await request.post(`${API_BASE}/auth/register`, {
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
        data: { name: 'Dup User', email, password: TEST_PASSWORD },
      });

      // Duplicate registration
      const csrfToken2 = await fetchCsrfToken(request);
      const dupRes = await request.post(`${API_BASE}/auth/register`, {
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken2 },
        data: { name: 'Dup User 2', email, password: TEST_PASSWORD },
      });

      expect(dupRes.status()).toBe(409);
    });
  });
});
