/**
 * Cucumber Hooks
 *
 * @description Lifecycle hooks for BDD tests
 */

import { Before, After, BeforeAll, AfterAll, Status, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium, Browser, BrowserContext, Page, APIRequestContext } from 'playwright';
import { ICustomWorld } from './world';
import { testDatabase } from '../support/database';

setDefaultTimeout(60000);

let browser: Browser;

BeforeAll(async () => {
  browser = await chromium.launch({
    headless: !!process.env.CI,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  // Initialize test database connection
  await testDatabase.initialize();
});

AfterAll(async () => {
  await browser.close();

  // Cleanup test database
  await testDatabase.cleanup();
  await testDatabase.close();
});

Before({ tags: '@ignore' }, async function () {
  return 'skipped';
});

Before({ tags: '@slow' }, async function (this: ICustomWorld) {
  setDefaultTimeout(120000);
});

Before({ tags: '@mobile' }, async function (this: ICustomWorld) {
  this.context = await browser.newContext({
    viewport: { width: 375, height: 667 },
    isMobile: true,
    hasTouch: true,
  });
  this.page = await this.context.newPage();
});

Before({ tags: '@tablet' }, async function (this: ICustomWorld) {
  this.context = await browser.newContext({
    viewport: { width: 768, height: 1024 },
    isMobile: false,
    hasTouch: true,
  });
  this.page = await this.context.newPage();
});

Before({ tags: '@desktop' }, async function (this: ICustomWorld) {
  this.context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });
  this.page = await this.context.newPage();
});

Before({ tags: '@authenticated' }, async function (this: ICustomWorld) {
  this.context = await browser.newContext();
  this.page = await this.context.newPage();

  // Create test user in real database
  const user = await testDatabase.createTestUser({
    email: `test-${Date.now()}@example.com`,
    password: 'TestPassword123!',
    name: 'Test User',
  });

  this.testUser = {
    email: user.email,
    password: 'TestPassword123!',
    name: user.name,
    id: user.id,
    token: user.token,
  };

  // Set authentication cookies/storage
  await this.page.context().addCookies([
    {
      name: 'authToken',
      value: user.token,
      domain: 'localhost',
      path: '/',
    },
  ]);
});

Before({ tags: '@admin' }, async function (this: ICustomWorld) {
  this.context = await browser.newContext();
  this.page = await this.context.newPage();

  // Create admin user in real database
  const admin = await testDatabase.createTestUser({
    email: `admin-${Date.now()}@example.com`,
    password: 'AdminPassword123!',
    name: 'Admin User',
    role: 'admin',
  });

  this.testUser = {
    email: admin.email,
    password: 'AdminPassword123!',
    name: admin.name,
    id: admin.id,
    token: admin.token,
  };

  await this.page.context().addCookies([
    {
      name: 'authToken',
      value: admin.token,
      domain: 'localhost',
      path: '/',
    },
  ]);
});

Before(async function (this: ICustomWorld) {
  if (!this.page) {
    this.context = await browser.newContext();
    this.page = await this.context.newPage();
  }

  // Create API request context
  this.request = await this.context.request;
});

After(async function (this: ICustomWorld, scenario) {
  if (scenario.result?.status === Status.FAILED) {
    const screenshot = await this.page?.screenshot({ fullPage: true });
    if (screenshot) {
      this.attach(screenshot, 'image/png');
    }

    const tracePath = `traces/${scenario.pickle.name.replace(/\s+/g, '-')}.zip`;
    await this.page?.context().tracing.stop({ path: tracePath });
  }

  // Cleanup test data for this scenario
  if (this.testUser?.id) {
    await testDatabase.cleanupUserData(this.testUser.id);
  }

  await this.page?.close();
  await this.context?.close();
});

Before({ tags: '@database' }, async function (this: ICustomWorld) {
  await testDatabase.beginTransaction();
});

After({ tags: '@database' }, async function (this: ICustomWorld) {
  await testDatabase.rollbackTransaction();
});
