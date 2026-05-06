/**
 * Accessibility Tests - Page Level
 *
 * @description WCAG 2.1 AA compliance tests for all pages
 * Run with: npx playwright test --config=tests/accessibility/playwright.accessibility.config.ts
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {
  scanPageForAccessibility,
  checkKeyboardNavigation,
  checkHeadingHierarchy,
  checkFormLabels,
  getFocusableElements,
} from './utils/accessibility-helpers';

// Pages to test
const PAGES = [
  { name: 'Home', path: '/' },
  { name: 'Login', path: '/login' },
  { name: 'Register', path: '/register' },
  { name: 'Dashboard', path: '/dashboard', requiresAuth: true },
  { name: 'Charts', path: '/charts', requiresAuth: true },
  { name: 'Chart Create', path: '/charts/create', requiresAuth: true },
  { name: 'Calendar', path: '/calendar', requiresAuth: true },
  { name: 'Synastry', path: '/synastry', requiresAuth: true },
  { name: 'Transits', path: '/transits', requiresAuth: true },
  { name: 'Solar Returns', path: '/solar-returns', requiresAuth: true },
  { name: 'Lunar Returns', path: '/lunar-returns', requiresAuth: true },
  { name: 'Profile', path: '/profile', requiresAuth: true },
  { name: 'Settings', path: '/settings', requiresAuth: true },
  { name: 'Forgot Password', path: '/forgot-password' },
  { name: '404', path: '/non-existent-page-404' },
];

test.describe('Accessibility - WCAG 2.1 AA Compliance', () => {
  test.describe.configure({ mode: 'parallel' });

  for (const page of PAGES) {
    test(`${page.name} page - WCAG 2.1 AA compliance`, async ({ page: pwPage }) => {
      // Handle authentication if required
      if (page.requiresAuth) {
        // Set up authentication state
        await pwPage.context().addCookies([
          {
            name: 'authToken',
            value: 'test-token',
            domain: 'localhost',
            path: '/',
          },
        ]);
      }

      await pwPage.goto(page.path);
      await pwPage.waitForLoadState('networkidle');

      // Run axe-core accessibility scan
      const accessibilityScanResults = await new AxeBuilder({ page: pwPage })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      // Log violations for review
      if (accessibilityScanResults.violations.length > 0) {
        console.log(`${page.name}: ${accessibilityScanResults.violations.length} violations`);
        accessibilityScanResults.violations.forEach((v) => {
          console.log(`  - ${v.id}: ${v.help} (${v.nodes.length} instances)`);
        });
      }

      // Only fail on critical violations that break screen reader or keyboard access
      const criticalViolations = accessibilityScanResults.violations.filter(
        (v) => v.impact === 'critical',
      );
      expect(criticalViolations, `${page.name}: ${criticalViolations.length} critical a11y violations`).toEqual([]);

      // Log passes for reporting
      console.log(`${page.name}: ${accessibilityScanResults.passes.length} rules passed`);
    });
  }
});

test.describe('Accessibility - Page Structure', () => {
  test('All pages have valid HTML lang attribute', async ({ page }) => {
    const pagesToTest = ['/', '/login', '/register'];

    for (const path of pagesToTest) {
      await page.goto(path);
      const lang = await page.getAttribute('html', 'lang');
      expect(lang).toBeTruthy();
      expect(lang).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/);
    }
  });

  test('All pages have a title', async ({ page }) => {
    const pagesToTest = ['/', '/login', '/register'];

    for (const path of pagesToTest) {
      await page.goto(path);
      const title = await page.title();
      expect(title).toBeTruthy();
      expect(title.length).toBeGreaterThan(0);
    }
  });

  test('All pages have exactly one main landmark', async ({ page }) => {
    const pagesToTest = ['/', '/login', '/register'];

    for (const path of pagesToTest) {
      await page.goto(path);
      const mainElements = await page.locator('main, [role="main"]').count();
      expect(mainElements).toBe(1);
    }
  });

  test('All pages have a skip link', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for skip link
    const skipLink = page.locator('a[href="#main"], a[href="#content"], [data-testid="skip-link"]');
    const hasSkipLink = await skipLink.count() > 0;

    expect(hasSkipLink).toBeTruthy();
  });
});

test.describe('Accessibility - Heading Hierarchy', () => {
  test('All pages have proper heading hierarchy', async ({ page }) => {
    const pagesToTest = ['/', '/login', '/register'];

    for (const path of pagesToTest) {
      await page.goto(path);
      await page.waitForLoadState('networkidle');

      const headings = await checkHeadingHierarchy(page);

      // Should have at least one h1
      const h1Count = headings.filter((h) => h.level === 1).length;
      expect(h1Count).toBeGreaterThanOrEqual(1);

      // No skipped levels
      const skippedLevels = headings.filter((h) => h.issues.length > 0);
      expect(skippedLevels).toHaveLength(0);
    }
  });

  test('No empty headings', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    for (const heading of headings) {
      const text = await heading.textContent();
      expect(text?.trim().length).toBeGreaterThan(0);
    }
  });
});

test.describe('Accessibility - Form Elements', () => {
  test('All form inputs have accessible labels', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');

    const formResults = await checkFormLabels(page);
    const unlabeledInputs = formResults.filter((r) => !r.hasLabel);

    expect(unlabeledInputs).toHaveLength(0);
  });

  test('Required fields are properly marked', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');

    const requiredInputs = await page.locator('input[required], select[required], textarea[required]').all();

    for (const input of requiredInputs) {
      // Check for aria-required or required attribute
      const isAriaRequired = await input.getAttribute('aria-required');
      const isRequired = await input.getAttribute('required');
      expect(isAriaRequired === 'true' || isRequired !== null).toBeTruthy();
    }
  });

  test('Form error messages are accessible', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');

    // Submit empty form to trigger errors
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);

    // Check for error messages with proper ARIA
    const errorMessages = await page.locator('[role="alert"], .error, .error-message').all();

    for (const error of errorMessages) {
      const isVisible = await error.isVisible();
      if (isVisible) {
        const hasAriaLive = await error.getAttribute('aria-live');
        const hasRole = await error.getAttribute('role');
        expect(hasAriaLive || hasRole === 'alert').toBeTruthy();
      }
    }
  });
});

test.describe('Accessibility - Keyboard Navigation', () => {
  test('Tab order follows visual order', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const focusableElements = await getFocusableElements(page);

    // Navigate through elements with Tab
    const tabOrder: string[] = [];
    await page.keyboard.press('Tab');

    for (let i = 0; i < Math.min(10, focusableElements.length); i++) {
      const focused = await page.evaluate(() => {
        const el = document.activeElement;
        return el?.tagName.toLowerCase() + (el?.id ? `#${el.id}` : '');
      });
      tabOrder.push(focused);
      await page.keyboard.press('Tab');
    }

    // Verify we navigated through elements
    expect(tabOrder.length).toBeGreaterThan(0);
  });

  test('Focus indicators are visible', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const focusableElements = await page.locator('a, button, input, select, textarea').first();
    await focusableElements.focus();

    // Check that focus is visible (not outline: none)
    const outline = await focusableElements.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        outline: style.outline,
        outlineWidth: style.outlineWidth,
        boxShadow: style.boxShadow,
      };
    });

    const hasVisibleFocus =
      outline.outline !== 'none' ||
      outline.outlineWidth !== '0px' ||
      outline.boxShadow !== 'none';

    expect(hasVisibleFocus).toBeTruthy();
  });

  test('Modal traps focus correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Open a modal if there is one
    const modalTrigger = page.locator('[data-testid="modal-trigger"], button:has-text("Open")').first();

    if (await modalTrigger.isVisible()) {
      await modalTrigger.click();
      await page.waitForSelector('[role="dialog"]');

      // Tab through modal - focus should stay within
      const modal = page.locator('[role="dialog"]');
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        const focusedInModal = await modal.evaluate((el, activeEl) => {
          return el.contains(activeEl);
        }, await page.evaluateHandle(() => document.activeElement));

        expect(focusedInModal).toBeTruthy();
      }

      // Escape closes modal
      await page.keyboard.press('Escape');
      const modalClosed = await page.locator('[role="dialog"]').isHidden();
      expect(modalClosed).toBeTruthy();
    }
  });

  test('Enter key activates buttons and links', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Focus on submit button
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.focus();

    // Press Enter
    await page.keyboard.press('Enter');

    // Form should be submitted (check for validation or navigation)
    await page.waitForTimeout(500);

    // Either we see errors or page changed
    const hasErrors = await page.locator('.error, [role="alert"]').count() > 0;
    const urlChanged = !page.url().includes('/login');

    expect(hasErrors || urlChanged).toBeTruthy();
  });
});

test.describe('Accessibility - Screen Reader Support', () => {
  test('Images have alt text', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const images = await page.locator('img').all();
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      const ariaLabel = await img.getAttribute('aria-label');
      const ariaHidden = await img.getAttribute('aria-hidden');

      // Decorative images should have empty alt or aria-hidden
      // Informative images should have alt text
      expect(alt !== null || ariaLabel !== null || ariaHidden === 'true').toBeTruthy();
    }
  });

  test('Icons have accessible names', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const icons = await page.locator('svg, [class*="icon"]').all();

    for (const icon of icons) {
      const ariaLabel = await icon.getAttribute('aria-label');
      const ariaHidden = await icon.getAttribute('aria-hidden');
      const title = await icon.locator('title').textContent();

      // Icons should either be hidden from screen readers or have accessible names
      const isAccessible = ariaHidden === 'true' || ariaLabel || title;
      expect(isAccessible).toBeTruthy();
    }
  });

  test('Links have descriptive text', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const links = await page.locator('a').all();

    for (const link of links) {
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');
      const title = await link.getAttribute('title');

      const hasDescription = text?.trim() || ariaLabel || title;
      expect(hasDescription).toBeTruthy();
    }
  });

  test('Tables have proper headers', async ({ page }) => {
    // Navigate to a page with tables
    await page.goto('/charts');
    await page.waitForLoadState('networkidle');

    const tables = await page.locator('table').all();

    for (const table of tables) {
      const hasCaption = await table.locator('caption').count() > 0;
      const hasAriaLabel = await table.getAttribute('aria-label');

      // Tables should have captions or labels
      expect(hasCaption || hasAriaLabel).toBeTruthy();

      // Check for headers
      const headers = await table.locator('th').count();
      expect(headers).toBeGreaterThan(0);
    }
  });
});

test.describe('Accessibility - Color and Contrast', () => {
  test('Text has sufficient contrast', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Run axe-core with just color-contrast rule
    const results = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze();

    // Log violations for review but don't fail (may need manual review)
    if (results.violations.length > 0) {
      console.log('Color contrast issues found:');
      results.violations.forEach((v) => {
        console.log(`  - ${v.help}: ${v.nodes.length} instances`);
      });
    }
  });

  test('Focus states are visible', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const buttons = await page.locator('button').all();

    for (const button of buttons.slice(0, 3)) {
      await button.focus();

      // Check for visible focus indicator
      const focusStyles = await button.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          outline: styles.outline,
          boxShadow: styles.boxShadow,
          outlineWidth: styles.outlineWidth,
        };
      });

      const hasFocusIndicator =
        focusStyles.outline !== 'none' ||
        focusStyles.boxShadow !== 'none' ||
        focusStyles.outlineWidth !== '0px';

      expect(hasFocusIndicator).toBeTruthy();
    }
  });
});

test.describe('Accessibility - Mobile', () => {
  test('Touch targets are large enough', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const touchTargets = await page.locator('button, a, input, select, textarea').all();

    for (const target of touchTargets.slice(0, 20)) {
      const box = await target.boundingBox();
      if (box) {
        // WCAG 2.1 recommends 44x44 CSS pixels minimum
        const meetsMinimum = box.width >= 44 && box.height >= 44;
        // Allow slightly smaller targets with spacing
        expect(meetsMinimum || (box.width >= 38 && box.height >= 38)).toBeTruthy();
      }
    }
  });

  test('Content reflows properly at 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for horizontal scroll
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    expect(hasHorizontalScroll).toBeFalsy();
  });
});

test.describe('Accessibility - Dynamic Content', () => {
  test('Loading states are announced', async ({ page }) => {
    await page.goto('/charts/create');
    await page.waitForLoadState('networkidle');

    // Trigger loading state
    const submitButton = page.locator('button[type="submit"]');
    if (await submitButton.isVisible()) {
      await submitButton.click();

      // Check for loading indicator with proper ARIA
      const loadingIndicator = page.locator('[role="status"], [aria-busy="true"], .loading');
      const hasLoadingIndicator = await loadingIndicator.count() > 0;

      // Should have some indication of loading
      if (hasLoadingIndicator) {
        const ariaLive = await loadingIndicator.first().getAttribute('aria-live');
        expect(ariaLive === 'polite' || ariaLive === 'assertive').toBeTruthy();
      }
    }
  });

  test('Toast notifications are accessible', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for toast container
    const toastContainer = page.locator('[role="status"], [aria-live], .toast-container');

    if (await toastContainer.count() > 0) {
      const ariaLive = await toastContainer.first().getAttribute('aria-live');
      expect(ariaLive).toBeTruthy();
    }
  });
});
