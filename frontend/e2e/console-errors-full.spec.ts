import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

// Store all console errors
const consoleErrors: string[] = [];

test.beforeEach(async ({ page }) => {
  // Capture console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Filter out known/expected errors
      if (!text.includes('Service worker registration failed') &&
          !text.includes('Service Worker') &&
          !text.includes('MIME type') &&
          !text.includes('[React Router] Deprecated') &&
          !text.includes('Downloading the React DevTools')) {
        consoleErrors.push(`[${new Date().toISOString()}] ${text}`);
      }
    }
  });
  
  // Capture page errors
  page.on('pageerror', error => {
    consoleErrors.push(`[PAGE ERROR] ${error.message}`);
  });
});

test.describe('Console Error Check - All Pages', () => {
  test('Landing page', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('Login page', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Try filling login form
    await page.fill('input[type="email"]', 'test@test.com').catch(() => {});
    await page.fill('input[type="password"]', 'testpassword').catch(() => {});
  });

  test('Register page', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Try filling register form
    await page.fill('input[name="name"]', 'Test User').catch(() => {});
    await page.fill('input[type="email"]', 'test@test.com').catch(() => {});
    await page.fill('input[type="password"]', 'testpassword123').catch(() => {});
  });

  test('Dashboard page (protected)', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('Charts page', async ({ page }) => {
    await page.goto(`${BASE_URL}/charts`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('Create chart page', async ({ page }) => {
    await page.goto(`${BASE_URL}/charts/create`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Try interacting with form elements
    await page.click('button:has-text("Create")').catch(() => {});
  });

  test('Calendar page', async ({ page }) => {
    await page.goto(`${BASE_URL}/calendar`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Extra time for calendar API calls
  });

  test('Transits page', async ({ page }) => {
    await page.goto(`${BASE_URL}/transits`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
  });

  test('Solar Returns page', async ({ page }) => {
    await page.goto(`${BASE_URL}/solar-returns`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('Lunar Returns page', async ({ page }) => {
    await page.goto(`${BASE_URL}/lunar-returns`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('Synastry page', async ({ page }) => {
    await page.goto(`${BASE_URL}/synastry`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('Learning Center page', async ({ page }) => {
    await page.goto(`${BASE_URL}/learning`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('Profile Settings page (protected)', async ({ page }) => {
    await page.goto(`${BASE_URL}/settings`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });
});

test.afterAll(() => {
  if (consoleErrors.length > 0) {
    console.log('\n\n===== CONSOLE ERRORS FOUND =====');
    consoleErrors.forEach(err => console.log(err));
    console.log('================================\n');
  } else {
    console.log('\n✅ No console errors found!\n');
  }
});
