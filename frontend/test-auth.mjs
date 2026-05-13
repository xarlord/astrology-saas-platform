import { chromium } from 'playwright';

const TARGET = 'https://astroverse.fly.dev/register';

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();

  const logs = [];
  const errors = [];
  const networkErrors = [];

  page.on('console', msg => {
    logs.push({ type: msg.type(), text: msg.text() });
    if (msg.type() === 'error' || msg.type() === 'warning') {
      console.log(`[CONSOLE ${msg.type().toUpperCase()}] ${msg.text()}`);
    }
  });

  page.on('pageerror', err => {
    errors.push({ name: err.name, message: err.message });
    console.log(`[PAGE ERROR] ${err.name}: ${err.message}`);
  });

  page.on('requestfailed', request => {
    networkErrors.push({ url: request.url(), failure: request.failure()?.errorText });
    console.log(`[NETWORK ERROR] ${request.url()} - ${request.failure()?.errorText}`);
  });

  page.on('response', response => {
    if (response.status() >= 400) {
      console.log(`[HTTP ${response.status()}] ${response.url()}`);
    }
  });

  page.on('framenavigated', frame => {
    console.log(`[NAV] ${frame.url().substring(0, 100)}`);
  });

  console.log('\n=== Step 1: Load register page ===');
  await page.goto(TARGET, { waitUntil: 'networkidle' });

  // Check Firebase config
  const bundleUrl = await page.evaluate(() => document.querySelector('script[src*="index"]')?.src);
  console.log('Bundle:', bundleUrl);

  const config = await page.evaluate(async (url) => {
    const r = await fetch(url);
    const t = await r.text();
    const c = {};
    for (const k of ['apiKey', 'authDomain', 'projectId']) {
      const m = t.match(new RegExp(k + ':"([^"]*)"'));
      c[k] = m?.[1] || 'NOT FOUND';
    }
    return c;
  }, bundleUrl);
  console.log('Firebase config:', JSON.stringify(config));

  // Check CSP
  console.log('\n=== Step 2: Click Google button ===');
  await page.locator('button[aria-label="Continue with Google"]').click();
  await page.waitForTimeout(5000);

  console.log(`URL after click: ${page.url().substring(0, 100)}`);

  console.log('\n=== Summary ===');
  console.log(`Console logs: ${logs.length}, Errors: ${errors.length}, Network errors: ${networkErrors.length}`);

  const errorLogs = logs.filter(l => l.type === 'error');
  if (errorLogs.length) {
    console.log('\n--- Console Errors ---');
    errorLogs.forEach(l => console.log(`  ${l.text.substring(0, 200)}`));
  }
  if (networkErrors.length) {
    console.log('\n--- Network Errors ---');
    networkErrors.forEach(e => console.log(`  ${e.url.substring(0, 80)} - ${e.failure}`));
  }

  // Check if we reached Google sign-in
  const reachedGoogle = page.url().includes('accounts.google.com');
  console.log(`\nReached Google sign-in: ${reachedGoogle}`);

  await page.screenshot({ path: '/tmp/google-auth-test2.png', fullPage: true });
  console.log('Screenshot: /tmp/google-auth-test2.png');

  await browser.close();
})().catch(err => { console.error('FAIL:', err); process.exit(1); });
