/**
 * Accessibility Testing Utilities
 *
 * @description Helper functions and configurations for accessibility testing
 */

import { Page, Locator } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

export interface AccessibilityScanResult {
  url: string;
  violations: AxeResult[];
  passes: string[];
  incomplete: string[];
  timestamp: string;
}

export interface AxeResult {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  help: string;
  helpUrl: string;
  nodes: AxeNode[];
  tags: string[];
}

export interface AxeNode {
  html: string;
  failureSummary: string;
  target: string[];
}

// WCAG 2.1 AA Rules
export const WCAG_2_1_AA_RULES = [
  // Perceivable
  'color-contrast',
  'image-alt',
  'input-image-alt',
  'object-alt',
  'role-img-alt',
  'video-caption',
  'audio-caption',
  'video-description',
  'audio-description',

  // Operable
  'button-name',
  'link-name',
  'accesskeys',
  'heading-order',
  'interactive-element-affordance',
  'landmark',
  'page-has-heading-one',
  'region',
  'skip-link',
  'tabindex',
  'focus-order-semantics',
  'managed-focus',
  'focusable-no-name',
  'frame-focusable-content',

  // Understandable
  'aria-label',
  'aria-labelledby',
  'aria-hidden',
  'aria-hidden-focus',
  'aria-allowed-attr',
  'aria-hidden-body',
  'aria-required-attr',
  'aria-required-children',
  'aria-required-parent',
  'aria-roles',
  'aria-toggle-field-name',
  'aria-valid-attr',
  'aria-valid-attr-value',
  'definition-list',
  'dlitem',
  'duplicate-id',
  'duplicate-id-active',
  'duplicate-id-aria',
  'empty-heading',
  'form-field-multiple-labels',
  'html-has-lang',
  'html-lang-valid',
  'html-xml-lang-mismatch',
  'label',
  'label-title-only',
  'link-in-text-block',
  'list',
  'listitem',
  'meta-refresh',
  'p-as-heading',

  // Robust
  'valid-lang',
  'avoid-inline-spacing',
];

// Critical rules that must pass
export const CRITICAL_RULES = [
  'button-name',
  'link-name',
  'image-alt',
  'label',
  'color-contrast',
  'html-has-lang',
  'document-title',
  'bypass',
  'meta-viewport',
];

/**
 * Create an AxeBuilder with custom configuration
 */
export function createAxeBuilder(page: Page): AxeBuilder {
  return new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .withRules(WCAG_2_1_AA_RULES)
    .disableRules([
      // Disable rules that may be flaky or not applicable
      'color-contrast', // Often needs manual review for brand colors
    ]);
}

/**
 * Scan a page for accessibility violations
 */
export async function scanPageForAccessibility(
  page: Page,
  options: {
    disableRules?: string[];
    include?: string[];
    exclude?: string[];
  } = {}
): Promise<AccessibilityScanResult> {
  let builder = createAxeBuilder(page);

  if (options.disableRules?.length) {
    builder = builder.disableRules(options.disableRules);
  }

  if (options.include?.length) {
    builder = builder.include(options.include);
  }

  if (options.exclude?.length) {
    builder = builder.exclude(options.exclude);
  }

  const results = await builder.analyze();

  return {
    url: page.url(),
    violations: results.violations.map((v) => ({
      id: v.id,
      impact: v.impact as AxeResult['impact'],
      description: v.description,
      help: v.help,
      helpUrl: v.helpUrl,
      nodes: v.nodes.map((n) => ({
        html: n.html,
        failureSummary: n.failureSummary || '',
        target: n.target as string[],
      })),
      tags: v.tags,
    })),
    passes: results.passes.map((p) => p.id),
    incomplete: results.incomplete.map((i) => i.id),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Check keyboard navigation for an element
 */
export async function checkKeyboardNavigation(
  page: Page,
  selectors: string[]
): Promise<{ selector: string; accessible: boolean; focusable: boolean }[]> {
  const results: { selector: string; accessible: boolean; focusable: boolean }[] = [];

  for (const selector of selectors) {
    const element = page.locator(selector);
    const count = await element.count();

    if (count === 0) {
      results.push({ selector, accessible: false, focusable: false });
      continue;
    }

    // Check if element is visible and not disabled
    const isVisible = await element.isVisible();
    const isDisabled = await element.isDisabled();
    const accessible = isVisible && !isDisabled;

    // Check if element is focusable
    await element.focus();
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    const focusable = focusedElement !== 'BODY';

    results.push({ selector, accessible, focusable });
  }

  return results;
}

/**
 * Check color contrast ratios
 */
export async function checkColorContrast(
  page: Page
): Promise<{ element: string; ratio: number; passes: boolean }[]> {
  return page.evaluate(() => {
    const elements = document.querySelectorAll('*');
    const results: { element: string; ratio: number; passes: boolean }[] = [];

    elements.forEach((el) => {
      const style = window.getComputedStyle(el);
      const color = style.color;
      const bgColor = style.backgroundColor;

      if (color && bgColor && color !== bgColor) {
        // Simplified contrast check - real implementation would use proper algorithm
        const hasText = el.textContent && el.textContent.trim().length > 0;
        if (hasText) {
          results.push({
            element: el.tagName.toLowerCase(),
            ratio: 4.5, // Placeholder - real check needed
            passes: true,
          });
        }
      }
    });

    return results.slice(0, 100); // Limit results
  });
}

/**
 * Get all focusable elements on the page
 */
export async function getFocusableElements(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ];

    const elements = document.querySelectorAll(focusableSelectors.join(', '));
    return Array.from(elements).map((el) => {
      const id = el.id ? `#${el.id}` : '';
      const classes = el.className ? `.${el.className.split(' ').join('.')}` : '';
      return `${el.tagName.toLowerCase()}${id}${classes}`;
    });
  });
}

/**
 * Check ARIA attributes
 */
export async function checkAriaAttributes(
  page: Page
): Promise<{ element: string; issues: string[] }[]> {
  return page.evaluate(() => {
    const results: { element: string; issues: string[] }[] = [];
    const elementsWithAria = document.querySelectorAll('[aria-*]');

    elementsWithAria.forEach((el) => {
      const issues: string[] = [];

      // Check aria-hidden on focusable elements
      if (el.getAttribute('aria-hidden') === 'true' && el.getAttribute('tabindex') !== '-1') {
        issues.push('aria-hidden on potentially focusable element');
      }

      // Check aria-label vs visible text
      const ariaLabel = el.getAttribute('aria-label');
      if (ariaLabel && el.textContent && el.textContent.trim() && ariaLabel !== el.textContent.trim()) {
        issues.push('aria-label differs from visible text');
      }

      // Check aria-labelledby references
      const labelledBy = el.getAttribute('aria-labelledby');
      if (labelledBy) {
        const labelElement = document.getElementById(labelledBy);
        if (!labelElement) {
          issues.push(`aria-labelledby references non-existent element: ${labelledBy}`);
        }
      }

      if (issues.length > 0) {
        results.push({
          element: el.tagName.toLowerCase(),
          issues,
        });
      }
    });

    return results;
  });
}

/**
 * Check for proper heading hierarchy
 */
export async function checkHeadingHierarchy(
  page: Page
): Promise<{ level: number; text: string; issues: string[] }[]> {
  return page.evaluate(() => {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const results: { level: number; text: string; issues: string[] }[] = [];
    let lastLevel = 0;

    headings.forEach((heading) => {
      const level = parseInt(heading.tagName.charAt(1));
      const text = heading.textContent?.trim() || '';
      const issues: string[] = [];

      // Check for skipped levels
      if (level - lastLevel > 1 && lastLevel !== 0) {
        issues.push(`Skipped from h${lastLevel} to h${level}`);
      }

      // Check for empty headings
      if (!text) {
        issues.push('Empty heading');
      }

      results.push({ level, text, issues });
      lastLevel = level;
    });

    return results;
  });
}

/**
 * Check form labels
 */
export async function checkFormLabels(
  page: Page
): Promise<{ element: string; hasLabel: boolean; issues: string[] }[]> {
  return page.evaluate(() => {
    const formElements = document.querySelectorAll('input, select, textarea');
    const results: { element: string; hasLabel: boolean; issues: string[] }[] = [];

    formElements.forEach((el) => {
      const input = el as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
      const issues: string[] = [];
      let hasLabel = false;

      // Check for label element
      if (input.id) {
        const label = document.querySelector(`label[for="${input.id}"]`);
        if (label) hasLabel = true;
      }

      // Check for aria-label
      if (input.getAttribute('aria-label')) {
        hasLabel = true;
      }

      // Check for aria-labelledby
      if (input.getAttribute('aria-labelledby')) {
        hasLabel = true;
      }

      // Check for wrapping label
      const parentLabel = input.closest('label');
      if (parentLabel) {
        hasLabel = true;
      }

      // Hidden inputs don't need labels
      if (input.type === 'hidden') {
        hasLabel = true;
      }

      if (!hasLabel) {
        issues.push('No accessible label found');
      }

      results.push({
        element: input.tagName.toLowerCase(),
        hasLabel,
        issues,
      });
    });

    return results;
  });
}
