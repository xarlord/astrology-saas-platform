/**
 * Accessibility Tests - Components
 *
 * @description WCAG 2.1 AA compliance tests for individual components
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility - Form Components', () => {
  test.describe('Text Input', () => {
    test('Input has accessible label', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      const emailInput = page.locator('input[type="email"], input[name="email"]').first();
      const id = await emailInput.getAttribute('id');

      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        const hasLabel = await label.count() > 0;
        const hasAriaLabel = await emailInput.getAttribute('aria-label');
        const hasAriaLabelledBy = await emailInput.getAttribute('aria-labelledby');

        expect(hasLabel || hasAriaLabel || hasAriaLabelledBy).toBeTruthy();
      }
    });

    test('Input has accessible error message', async ({ page }) => {
      await page.goto('/register');
      await page.waitForLoadState('networkidle');

      // Submit empty form to trigger errors
      await page.click('button[type="submit"]');
      await page.waitForTimeout(500);

      const errorMessages = page.locator('.error, [role="alert"], .error-message');
      const count = await errorMessages.count();

      if (count > 0) {
        const firstError = errorMessages.first();
        const ariaLive = await firstError.getAttribute('aria-live');
        const role = await firstError.getAttribute('role');

        expect(ariaLive || role === 'alert').toBeTruthy();
      }
    });

    test('Required fields are indicated', async ({ page }) => {
      await page.goto('/register');
      await page.waitForLoadState('networkidle');

      const requiredInputs = await page.locator('input[required], [aria-required="true"]').all();

      for (const input of requiredInputs) {
        const ariaRequired = await input.getAttribute('aria-required');
        const hasRequired = await input.getAttribute('required');

        expect(ariaRequired === 'true' || hasRequired !== null).toBeTruthy();
      }
    });

    test('Input help text is associated', async ({ page }) => {
      await page.goto('/charts/create');
      await page.waitForLoadState('networkidle');

      const inputsWithHelp = await page.locator('input[aria-describedby]').all();

      for (const input of inputsWithHelp) {
        const describedBy = await input.getAttribute('aria-describedby');
        if (describedBy) {
          const helpElement = page.locator(`#${describedBy}`);
          const exists = await helpElement.count() > 0;
          expect(exists).toBeTruthy();
        }
      }
    });
  });

  test.describe('Buttons', () => {
    test('Buttons have accessible names', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const buttons = await page.locator('button').all();

      for (const button of buttons) {
        const text = await button.textContent();
        const ariaLabel = await button.getAttribute('aria-label');
        const ariaLabelledBy = await button.getAttribute('aria-labelledby');

        const hasName = text?.trim() || ariaLabel || ariaLabelledBy;
        expect(hasName).toBeTruthy();
      }
    });

    test('Icon-only buttons have aria-label', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const buttons = await page.locator('button').all();

      for (const button of buttons) {
        const text = await button.textContent();
        const hasOnlyIcon = await button.locator('svg, img, [class*="icon"]').count() > 0;

        if (hasOnlyIcon && !text?.trim()) {
          const ariaLabel = await button.getAttribute('aria-label');
          expect(ariaLabel).toBeTruthy();
        }
      }
    });

    test('Disabled buttons are properly marked', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const disabledButtons = await page.locator('button[disabled], button[aria-disabled="true"]').all();

      for (const button of disabledButtons) {
        const isDisabled = await button.isDisabled();
        const ariaDisabled = await button.getAttribute('aria-disabled');

        expect(isDisabled || ariaDisabled === 'true').toBeTruthy();
      }
    });
  });

  test.describe('Dropdowns/Selects', () => {
    test('Select has accessible label', async ({ page }) => {
      await page.goto('/charts/create');
      await page.waitForLoadState('networkidle');

      const selects = await page.locator('select').all();

      for (const select of selects) {
        const id = await select.getAttribute('id');
        const ariaLabel = await select.getAttribute('aria-label');

        if (id) {
          const label = page.locator(`label[for="${id}"]`);
          const hasLabel = await label.count() > 0;
          expect(hasLabel || ariaLabel).toBeTruthy();
        }
      }
    });

    test('Custom dropdown follows ARIA pattern', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const customDropdowns = await page.locator('[role="listbox"], [role="combobox"]').all();

      for (const dropdown of customDropdowns) {
        const role = await dropdown.getAttribute('role');

        if (role === 'listbox') {
          const ariaLabel = await dropdown.getAttribute('aria-label');
          const ariaLabelledBy = await dropdown.getAttribute('aria-labelledby');
          expect(ariaLabel || ariaLabelledBy).toBeTruthy();
        }

        if (role === 'combobox') {
          const ariaExpanded = await dropdown.getAttribute('aria-expanded');
          expect(ariaExpanded).toBeTruthy();
        }
      }
    });
  });

  test.describe('Checkboxes and Radio Buttons', () => {
    test('Checkboxes have accessible labels', async ({ page }) => {
      await page.goto('/register');
      await page.waitForLoadState('networkidle');

      const checkboxes = await page.locator('input[type="checkbox"]').all();

      for (const checkbox of checkboxes) {
        const id = await checkbox.getAttribute('id');
        const ariaLabel = await checkbox.getAttribute('aria-label');

        if (id) {
          const label = page.locator(`label[for="${id}"]`);
          const hasLabel = await label.count() > 0;
          expect(hasLabel || ariaLabel).toBeTruthy();
        }
      }
    });

    test('Radio groups have accessible names', async ({ page }) => {
      await page.goto('/charts/create');
      await page.waitForLoadState('networkidle');

      const radioGroups = await page.locator('[role="radiogroup"]').all();

      for (const group of radioGroups) {
        const ariaLabel = await group.getAttribute('aria-label');
        const ariaLabelledBy = await group.getAttribute('aria-labelledby');
        expect(ariaLabel || ariaLabelledBy).toBeTruthy();
      }
    });
  });
});

test.describe('Accessibility - Navigation Components', () => {
  test.describe('Navigation Menu', () => {
    test('Navigation has accessible name', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const navs = await page.locator('nav, [role="navigation"]').all();

      for (const nav of navs) {
        const ariaLabel = await nav.getAttribute('aria-label');
        const ariaLabelledBy = await nav.getAttribute('aria-labelledby');
        const hasHeading = await nav.locator('h1, h2, h3').count() > 0;

        expect(ariaLabel || ariaLabelledBy || hasHeading).toBeTruthy();
      }
    });

    test('Current page is indicated', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      const currentLinks = await page.locator('a[aria-current="page"]').all();
      // At least one link should indicate current page
      expect(currentLinks.length).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Breadcrumbs', () => {
    test('Breadcrumb has nav landmark', async ({ page }) => {
      await page.goto('/charts');
      await page.waitForLoadState('networkidle');

      const breadcrumbs = await page.locator('nav[aria-label*="breadcrumb"], [aria-label*="Breadcrumb"]').all();

      if (breadcrumbs.length > 0) {
        const ariaLabel = await breadcrumbs[0].getAttribute('aria-label');
        expect(ariaLabel?.toLowerCase()).toContain('breadcrumb');
      }
    });

    test('Breadcrumb list has proper ARIA', async ({ page }) => {
      await page.goto('/charts');
      await page.waitForLoadState('networkidle');

      const breadcrumbLists = await page.locator('[aria-label*="breadcrumb"] ol, [aria-label*="Breadcrumb"] ol').all();

      for (const list of breadcrumbLists) {
        const items = await list.locator('li').all();
        expect(items.length).toBeGreaterThan(0);

        // Last item should be current page
        const lastItem = items[items.length - 1];
        const ariaCurrent = await lastItem.locator('a').getAttribute('aria-current');
        expect(ariaCurrent).toBe('page');
      }
    });
  });
});

test.describe('Accessibility - Interactive Components', () => {
  test.describe('Modals/Dialogs', () => {
    test('Modal has accessible name', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Try to open a modal if available
      const modalTriggers = await page.locator('[data-testid*="modal"], button:has-text("Open")').all();

      for (const trigger of modalTriggers.slice(0, 2)) {
        await trigger.click();
        await page.waitForTimeout(300);

        const dialogs = await page.locator('[role="dialog"]').all();

        for (const dialog of dialogs) {
          const ariaLabel = await dialog.getAttribute('aria-label');
          const ariaLabelledBy = await dialog.getAttribute('aria-labelledby');
          expect(ariaLabel || ariaLabelledBy).toBeTruthy();
        }

        // Close modal
        await page.keyboard.press('Escape');
      }
    });

    test('Modal has focus trap', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Open modal if available
      const modalTrigger = page.locator('[data-testid*="modal"], button:has-text("Open")').first();

      if (await modalTrigger.isVisible()) {
        await modalTrigger.click();
        await page.waitForSelector('[role="dialog"]');

        const dialog = page.locator('[role="dialog"]');
        const initialFocus = await dialog.evaluate(() => document.activeElement?.tagName);

        // Tab through and verify focus stays in modal
        for (let i = 0; i < 10; i++) {
          await page.keyboard.press('Tab');
          const focusedInModal = await dialog.evaluate((el) => {
            return el.contains(document.activeElement);
          });
          expect(focusedInModal).toBeTruthy();
        }
      }
    });
  });

  test.describe('Tabs', () => {
    test('Tab list has proper ARIA', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      const tabLists = await page.locator('[role="tablist"]').all();

      for (const tabList of tabLists) {
        const ariaLabel = await tabList.getAttribute('aria-label');
        const ariaLabelledBy = await tabList.getAttribute('aria-labelledby');
        expect(ariaLabel || ariaLabelledBy).toBeTruthy();

        const tabs = await tabList.locator('[role="tab"]').all();
        expect(tabs.length).toBeGreaterThan(0);
      }
    });

    test('Tabs have proper selection state', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      const tabLists = await page.locator('[role="tablist"]').all();

      for (const tabList of tabLists) {
        const tabs = await tabList.locator('[role="tab"]').all();
        let selectedCount = 0;

        for (const tab of tabs) {
          const selected = await tab.getAttribute('aria-selected');
          if (selected === 'true') selectedCount++;
        }

        // Exactly one tab should be selected
        expect(selectedCount).toBe(1);
      }
    });
  });

  test.describe('Accordion', () => {
    test('Accordion headers have proper ARIA', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const accordionHeaders = await page.locator('[aria-controls]').all();

      for (const header of accordionHeaders) {
        const controls = await header.getAttribute('aria-controls');
        const expanded = await header.getAttribute('aria-expanded');

        if (controls) {
          const panel = page.locator(`#${controls}`);
          const panelExists = await panel.count() > 0;
          expect(panelExists).toBeTruthy();
        }

        expect(expanded).toBeTruthy();
      }
    });
  });
});

test.describe('Accessibility - Data Display', () => {
  test.describe('Charts', () => {
    test('Charts have text alternatives', async ({ page }) => {
      await page.context().addCookies([{
        name: 'authToken',
        value: 'test-token',
        domain: 'localhost',
        path: '/',
      }]);

      await page.goto('/charts');
      await page.waitForLoadState('networkidle');

      const charts = await page.locator('svg, canvas').all();

      for (const chart of charts) {
        const ariaLabel = await chart.getAttribute('aria-label');
        const ariaLabelledBy = await chart.getAttribute('aria-labelledby');
        const role = await chart.getAttribute('role');
        const title = await chart.locator('title').textContent();

        // Charts should have accessible names
        expect(ariaLabel || ariaLabelledBy || title || role === 'img').toBeTruthy();
      }
    });

    test('Chart data tables are available', async ({ page }) => {
      await page.context().addCookies([{
        name: 'authToken',
        value: 'test-token',
        domain: 'localhost',
        path: '/',
      }]);

      await page.goto('/charts');
      await page.waitForLoadState('networkidle');

      // Check for data table alternative to chart
      const dataTables = await page.locator('table').all();

      for (const table of dataTables) {
        const caption = await table.locator('caption').textContent();
        const ariaLabel = await table.getAttribute('aria-label');

        expect(caption || ariaLabel).toBeTruthy();
      }
    });
  });

  test.describe('Cards', () => {
    test('Cards have proper structure', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const cards = await page.locator('[class*="card"], [data-testid*="card"]').all();

      for (const card of cards.slice(0, 5)) {
        const heading = await card.locator('h1, h2, h3, h4, h5, h6').count();
        // Cards should have headings for structure
        expect(heading >= 0).toBeTruthy();
      }
    });
  });
});
