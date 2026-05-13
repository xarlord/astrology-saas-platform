import { test, expect } from '@playwright/test';

test.describe('Google Auth Flow - Full Console Capture', () => {
  test('capture all console errors during login page load', async ({ page }) => {
    const consoleMessages: { type: string; text: string }[] = [];
    const networkErrors: { url: string; status: number }[] = [];

    page.on('console', (msg) => {
      consoleMessages.push({ type: msg.type(), text: msg.text() });
    });

    page.on('response', (response) => {
      if (response.status() >= 400) {
        networkErrors.push({ url: response.url(), status: response.status() });
      }
    });

    page.on('requestfailed', (request) => {
      consoleMessages.push({
        type: 'error',
        text: `REQUEST FAILED: ${request.url()} - ${request.failure()?.errorText}`,
      });
    });

    await page.goto('https://astroverse.fly.dev/login', { waitUntil: 'networkidle' });

    // Wait for page to fully settle
    await page.waitForTimeout(3000);

    console.log('\n=== CONSOLE MESSAGES ===');
    for (const msg of consoleMessages) {
      console.log(`[${msg.type.toUpperCase()}] ${msg.text}`);
    }

    console.log('\n=== NETWORK ERRORS (4xx/5xx) ===');
    for (const err of networkErrors) {
      console.log(`[${err.status}] ${err.url}`);
    }

    // Check that the Google button exists
    const googleBtn = page.locator('button:has-text("Google"), button:has-text("google"), [data-testid="google-login"]').first();
    const btnExists = await googleBtn.isVisible().catch(() => false);
    console.log(`\nGoogle button visible: ${btnExists}`);

    // Check CSP headers
    const response = await page.goto('https://astroverse.fly.dev/login');
    const csp = response?.headers()['content-security-policy'] || 'NONE';
    console.log(`\n=== CSP HEADER ===\n${csp}`);

    // Check Firebase config in the page
    const firebaseConfig = await page.evaluate(() => {
      // Try to find Firebase config from window or script tags
      const scripts = Array.from(document.querySelectorAll('script'));
      const scriptSrcs = scripts.map(s => s.src || '(inline)').filter(s => s !== '(inline)');
      return { scriptSources: scriptSrcs };
    });
    console.log(`\n=== SCRIPT SOURCES ===`);
    for (const src of firebaseConfig.scriptSources) {
      console.log(`  ${src}`);
    }

    // Take screenshot of login page
    await page.screenshot({ path: '/tmp/login-page.png', fullPage: true });
    console.log('\nScreenshot saved to /tmp/login-page.png');

    // Verify no critical errors on page load
    const jsErrors = consoleMessages.filter(m => m.type === 'error');
    console.log(`\n=== SUMMARY: ${jsErrors.length} JS errors, ${networkErrors.length} network errors ===`);

    if (jsErrors.length > 0) {
      console.log('\n=== ALL JS ERRORS ===');
      for (const err of jsErrors) {
        console.log(`  ERROR: ${err.text}`);
      }
    }
  });

  test('click Google button and capture redirect flow', async ({ page, context }) => {
    const consoleMessages: { type: string; text: string }[] = [];
    const networkErrors: { url: string; status: number }[] = [];

    page.on('console', (msg) => {
      consoleMessages.push({ type: msg.type(), text: msg.text() });
    });

    page.on('response', (response) => {
      if (response.status() >= 400) {
        networkErrors.push({ url: response.url(), status: response.status() });
      }
    });

    page.on('requestfailed', (request) => {
      consoleMessages.push({
        type: 'error',
        text: `REQUEST FAILED: ${request.url()} - ${request.failure()?.errorText}`,
      });
    });

    await page.goto('https://astroverse.fly.dev/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Find and click the Google button
    const googleBtn = page.locator('button').filter({ hasText: /google/i }).first();
    const btnExists = await googleBtn.isVisible().catch(() => false);

    if (!btnExists) {
      console.log('Google button NOT found. Checking all buttons:');
      const allBtns = await page.locator('button').allTextContents();
      console.log('Buttons:', allBtns);
      await page.screenshot({ path: '/tmp/no-google-btn.png', fullPage: true });
      return;
    }

    console.log('Clicking Google button...');
    await googleBtn.click();

    // Wait for navigation or error
    await page.waitForTimeout(5000);

    const currentUrl = page.url();
    console.log(`\nCurrent URL after click: ${currentUrl}`);

    // Take screenshot after click
    await page.screenshot({ path: '/tmp/after-google-click.png', fullPage: true });

    console.log('\n=== CONSOLE AFTER CLICK ===');
    for (const msg of consoleMessages) {
      if (msg.type === 'error' || msg.type === 'warning') {
        console.log(`[${msg.type.toUpperCase()}] ${msg.text}`);
      }
    }

    console.log('\n=== NETWORK ERRORS AFTER CLICK ===');
    for (const err of networkErrors) {
      console.log(`[${err.status}] ${err.url}`);
    }

    const jsErrors = consoleMessages.filter(m => m.type === 'error');
    console.log(`\n=== SUMMARY: ${jsErrors.length} JS errors, ${networkErrors.length} network errors ===`);
  });
});
