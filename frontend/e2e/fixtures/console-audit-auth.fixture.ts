/**
 * Console Audit + Auth Fixture for Playwright E2E Tests
 *
 * Composes the console-audit fixture with auth for testing protected routes.
 * Provides both console message capture and pre-authenticated browser context.
 *
 * Usage:
 *   import { test, expect } from './fixtures/console-audit-auth.fixture';
 *
 *   test('protected route has no console errors', async ({ page, consoleMessages, assertCleanConsole }) => {
 *     await page.goto('/dashboard');
 *     await page.waitForLoadState('networkidle');
 *     assertCleanConsole();
 *   });
 */

import { test as authTest } from './auth.fixture';
import { createConsoleAuditFixture } from './console-audit.fixture';

export const test = createConsoleAuditFixture(authTest);
export { expect } from '@playwright/test';
