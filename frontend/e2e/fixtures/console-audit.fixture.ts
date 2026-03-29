/**
 * Console Audit Fixture for Playwright E2E Tests
 *
 * Captures browser console messages (errors, warnings) and uncaught exceptions.
 * Provides assertions to fail tests when unexpected console output is detected.
 *
 * Usage:
 *   import { test, expect } from './fixtures/console-audit.fixture';
 *
 *   test('page has no console errors', async ({ page, consoleAudit }) => {
 *     await page.goto('/dashboard');
 *     await page.waitForLoadState('networkidle');
 *     consoleAudit.assertNoErrors();
 *   });
 */

import { test as base, expect } from '@playwright/test';
import {
  type CapturedConsoleMessage,
  filterAllowedMessages,
  formatConsoleReport,
  DEFAULT_ALLOWED_PATTERNS,
} from '../helpers/console-helpers';

export interface ConsoleAuditOptions {
  /** Regex patterns for messages that should be ignored. */
  allowedPatterns: RegExp[];
  /** Which console types to capture. Defaults to ['error', 'warning']. */
  captureTypes: ('error' | 'warning')[];
}

interface ConsoleAuditFixture {
  /** Collected console messages (after filtering). */
  consoleMessages: CapturedConsoleMessage[];
  /** Assert no console errors exist. Throws with a detailed report. */
  assertNoConsoleErrors: () => void;
  /** Assert no console warnings exist. Throws with a detailed report. */
  assertNoConsoleWarnings: () => void;
  /** Assert no console errors OR warnings. */
  assertCleanConsole: () => void;
}

const DEFAULT_OPTIONS: ConsoleAuditOptions = {
  allowedPatterns: DEFAULT_ALLOWED_PATTERNS,
  captureTypes: ['error', 'warning'],
};

/**
 * Factory function to create a console-audit fixture extending any base test.
 * This allows composition with other fixtures (e.g., auth).
 */
export function createConsoleAuditFixture(
  baseTest: typeof base,
  options?: Partial<ConsoleAuditOptions>,
) {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return baseTest.extend<ConsoleAuditFixture>({
    consoleMessages: async ({ page }, use) => {
      const rawMessages: CapturedConsoleMessage[] = [];

      // Capture console messages
      page.on('console', (msg) => {
        const type = msg.type() as CapturedConsoleMessage['type'];
        if (opts.captureTypes.includes(type as 'error' | 'warning')) {
          const location = msg.location();
          rawMessages.push({
            type,
            text: msg.text(),
            location: {
              url: location.url,
              lineNumber: location.lineNumber,
              columnNumber: location.columnNumber,
            },
            pageUrl: page.url(),
            timestamp: Date.now(),
          });
        }
      });

      // Capture uncaught page errors (these don't always appear as console.error)
      page.on('pageerror', (error) => {
        rawMessages.push({
          type: 'error',
          text: error.message,
          location: { url: page.url() },
          pageUrl: page.url(),
          timestamp: Date.now(),
        });
      });

      // Filter out allowed patterns
      const filtered = filterAllowedMessages(rawMessages, opts.allowedPatterns);
      await use(filtered);
    },

    assertNoConsoleErrors: async ({ consoleMessages }, use) => {
      await use(() => {
        const errors = consoleMessages.filter((m) => m.type === 'error');
        if (errors.length > 0) {
          const report = formatConsoleReport(errors);
          throw new Error(`Found ${errors.length} console error(s):\n${report}`);
        }
      });
    },

    assertNoConsoleWarnings: async ({ consoleMessages }, use) => {
      await use(() => {
        const warnings = consoleMessages.filter((m) => m.type === 'warning');
        if (warnings.length > 0) {
          const report = formatConsoleReport(warnings);
          throw new Error(`Found ${warnings.length} console warning(s):\n${report}`);
        }
      });
    },

    assertCleanConsole: async ({ consoleMessages }, use) => {
      await use(() => {
        if (consoleMessages.length > 0) {
          const report = formatConsoleReport(consoleMessages);
          throw new Error(
            `Found ${consoleMessages.length} console issue(s) (errors + warnings):\n${report}`,
          );
        }
      });
    },
  });
}

// Default export: standalone fixture extending Playwright's base test
export const test = createConsoleAuditFixture(base);
export { expect };
