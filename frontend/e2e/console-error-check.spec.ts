import { test, expect } from '@playwright/test';

/**
 * Comprehensive Console Error Check for All Pages
 *
 * This test navigates to every route in the application and captures
 * all console errors, warnings, and issues.
 */

test.describe('Console Error Audit', () => {

  // Test credentials
  const testUser = {
    email: 'test@example.com',
    password: 'Test123!'
  };

  // Store errors globally
  const allErrors: { route: string; errors: string[]; warnings: string[] }[] = [];

  test.beforeEach(async ({ page, context }) => {
    // Clear any existing service workers
    await context.clearCookies();

    // Listen for console messages
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();

      // Filter out known/expected errors and warnings
      if (text.includes('Service worker registration failed') ||
          text.includes('Service Worker') ||
          text.includes('MIME type')) {
        return; // Skip these known errors
      }

      if (type === 'error') {
        console.error(`❌ [${page.url()}] ${text}`);
      } else if (type === 'warning') {
        console.warn(`⚠️  [${page.url()}] ${text}`);
      }
    });
  });

  /**
   * Helper function to capture console messages
   */
  async function captureConsoleErrors(page: any, routeName: string) {
    const errors: string[] = [];
    const warnings: string[] = [];

    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();

      if (type === 'error') {
        // Filter out known/expected errors
        if (!text.includes('Service worker registration failed') &&
            !text.includes('Service Worker') &&
            !text.includes('MIME type')) {
          errors.push(text);
        }
      } else if (type === 'warning') {
        // Filter out common expected warnings
        if (!text.includes('DevTools') &&
            !text.includes('React Router') &&
            !text.includes('Service Worker')) {
          warnings.push(text);
        }
      }
    });

    await page.waitForLoadState('networkidle');

    const result = {
      route: routeName,
      errors,
      warnings
    };

    if (errors.length > 0 || warnings.length > 0) {
      allErrors.push(result);
    }

    return result;
  }

  /**
   * Helper to login
   */
  async function login(page: any) {
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', testUser.email);
    await page.fill('[data-testid="password-input"]', testUser.password);
    await page.click('[data-testid="submit-button"]');
    await page.waitForURL(/.*dashboard/, { timeout: 10000 });
  }

  /**
   * Test 1: Public Pages (No authentication required)
   */
  test('HomePage - Console Check', async ({ page }) => {
    await page.goto('/');
    const result = await captureConsoleErrors(page, 'HomePage (/)');

    console.log(`\n📄 HomePage: ${result.errors.length} errors, ${result.warnings.length} warnings`);

    // Take screenshot
    await page.screenshot({ path: 'test-results/home-page.png' });

    // Verify page loaded
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('LoginPage - Console Check', async ({ page }) => {
    await page.goto('/login');
    const result = await captureConsoleErrors(page, 'LoginPage (/login)');

    console.log(`\n📄 LoginPage: ${result.errors.length} errors, ${result.warnings.length} warnings`);

    await page.screenshot({ path: 'test-results/login-page.png' });
    await expect(page.getByText('Sign In').or(page.getByText('Login'))).toBeVisible();
  });

  test('RegisterPage - Console Check', async ({ page }) => {
    await page.goto('/register');
    const result = await captureConsoleErrors(page, 'RegisterPage (/register)');

    console.log(`\n📄 RegisterPage: ${result.errors.length} errors, ${result.warnings.length} warnings`);

    await page.screenshot({ path: 'test-results/register-page.png' });
    await expect(page.getByText('Create Account').or(page.getByText('Register'))).toBeVisible();
  });

  /**
   * Test 2: Protected Pages (Require authentication)
   */

  test('DashboardPage - Console Check', async ({ page }) => {
    await login(page);
    const result = await captureConsoleErrors(page, 'DashboardPage (/dashboard)');

    console.log(`\n📄 DashboardPage: ${result.errors.length} errors, ${result.warnings.length} warnings`);

    await page.screenshot({ path: 'test-results/dashboard.png' });
    await expect(page.getByText('Dashboard').or(page.getByTestId('chart-list'))).toBeVisible({ timeout: 5000 });
  });

  test('ChartCreatePage - Console Check', async ({ page }) => {
    await login(page);
    await page.goto('/charts/new');
    const result = await captureConsoleErrors(page, 'ChartCreatePage (/charts/new)');

    console.log(`\n📄 ChartCreatePage: ${result.errors.length} errors, ${result.warnings.length} warnings`);

    await page.screenshot({ path: 'test-results/chart-create.png' });
    await expect(page.getByText('Create').or(page.getByTestId('chart-name-input'))).toBeVisible({ timeout: 5000 });
  });

  test('ChartViewPage - Console Check', async ({ page }) => {
    await login(page);

    // Navigate to an existing chart (we know there's at least one)
    await page.goto('/dashboard');
    await page.waitForSelector('[data-testid="chart-card"]', { timeout: 5000 });

    // Click first chart
    await page.click('[data-testid="chart-card"]');

    const result = await captureConsoleErrors(page, 'ChartViewPage (/charts/:id)');

    console.log(`\n📄 ChartViewPage: ${result.errors.length} errors, ${result.warnings.length} warnings`);

    await page.screenshot({ path: 'test-results/chart-view.png' });
  });

  test('AnalysisPage - Console Check', async ({ page }) => {
    await login(page);

    // Navigate to an existing chart first
    await page.goto('/dashboard');
    await page.waitForSelector('[data-testid="chart-card"]', { timeout: 5000 });
    await page.click('[data-testid="chart-card"]');

    // Then go to analysis
    await page.getByText('Analysis').click();
    await page.waitForURL(/.*analysis/);

    const result = await captureConsoleErrors(page, 'AnalysisPage (/analysis/:chartId)');

    console.log(`\n📄 AnalysisPage: ${result.errors.length} errors, ${result.warnings.length} warnings`);

    await page.screenshot({ path: 'test-results/analysis.png' });
  });

  test('TransitPage - Console Check', async ({ page }) => {
    await login(page);
    await page.goto('/transits');
    const result = await captureConsoleErrors(page, 'TransitPage (/transits)');

    console.log(`\n📄 TransitPage: ${result.errors.length} errors, ${result.warnings.length} warnings`);

    await page.screenshot({ path: 'test-results/transits.png' });
    await expect(page.getByText('Transit').or(page.getByTestId('transit-list'))).toBeVisible({ timeout: 5000 });
  });

  test('ProfilePage - Console Check', async ({ page }) => {
    await login(page);
    await page.goto('/profile');
    const result = await captureConsoleErrors(page, 'ProfilePage (/profile)');

    console.log(`\n📄 ProfilePage: ${result.errors.length} errors, ${result.warnings.length} warnings`);

    await page.screenshot({ path: 'test-results/profile.png' });
    await expect(page.getByText('Profile').or(page.getByTestId('profile-form'))).toBeVisible({ timeout: 5000 });
  });

  test('SynastryPage - Console Check', async ({ page }) => {
    await login(page);
    await page.goto('/synastry');
    const result = await captureConsoleErrors(page, 'SynastryPage (/synastry)');

    console.log(`\n📄 SynastryPage: ${result.errors.length} errors, ${result.warnings.length} warnings`);

    await page.screenshot({ path: 'test-results/synastry.png' });
    await expect(page.getByText('Synastry').or(page.getByTestId('synastry-form'))).toBeVisible({ timeout: 5000 });
  });

  test('SolarReturnsPage - Console Check', async ({ page }) => {
    await login(page);
    await page.goto('/solar-returns');
    const result = await captureConsoleErrors(page, 'SolarReturnsPage (/solar-returns)');

    console.log(`\n📄 SolarReturnsPage: ${result.errors.length} errors, ${result.warnings.length} warnings`);

    await page.screenshot({ path: 'test-results/solar-returns.png' });
    await expect(page.getByText('Solar').or(page.getByTestId('solar-return-list'))).toBeVisible({ timeout: 5000 });
  });

  test('CalendarPage - Console Check', async ({ page }) => {
    await login(page);
    await page.goto('/calendar');
    const result = await captureConsoleErrors(page, 'CalendarPage (/calendar)');

    console.log(`\n📄 CalendarPage: ${result.errors.length} errors, ${result.warnings.length} warnings`);

    await page.screenshot({ path: 'test-results/calendar.png' });
    await expect(page.getByText('Calendar').or(page.getByTestId('astrological-calendar'))).toBeVisible({ timeout: 5000 });
  });

  test('LunarReturnsPage - Console Check', async ({ page }) => {
    await login(page);
    await page.goto('/lunar-returns');
    const result = await captureConsoleErrors(page, 'LunarReturnsPage (/lunar-returns)');

    console.log(`\n📄 LunarReturnsPage: ${result.errors.length} errors, ${result.warnings.length} warnings`);

    await page.screenshot({ path: 'test-results/lunar-returns.png' });
    await expect(page.getByText('Lunar').or(page.getByTestId('lunar-return-list'))).toBeVisible({ timeout: 5000 });
  });

  /**
   * Summary Test - Report all findings
   */
  test('Error Summary', async ({}) => {
    console.log('\n\n========================================');
    console.log('📊 CONSOLE ERROR AUDIT SUMMARY');
    console.log('========================================\n');

    if (allErrors.length === 0) {
      console.log('✅ No console errors or warnings found!');
    } else {
      console.log(`Found issues on ${allErrors.length} page(s):\n`);

      allErrors.forEach(({ route, errors, warnings }) => {
        console.log(`📄 ${route}`);
        console.log(`   Errors: ${errors.length}`);
        console.log(`   Warnings: ${warnings.length}`);

        if (errors.length > 0) {
          console.log('\n   ❌ Errors:');
          errors.forEach(err => console.log(`      - ${err}`));
        }

        if (warnings.length > 0) {
          console.log('\n   ⚠️  Warnings:');
          warnings.forEach(warn => console.log(`      - ${warn}`));
        }

        console.log('');
      });
    }

    console.log('========================================\n');

    // This test will always pass, it's just for reporting
    expect(true).toBe(true);
  });
});
