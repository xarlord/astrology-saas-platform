/**
 * CHI-49: Accessibility Pre-Audit
 *
 * Runs axe-core WCAG 2.1 AA scans on all completed AstroVerse pages.
 * Captures violations with severity, WCAG criterion, selector, and suggested fix.
 * Output is formatted as actionable input for CHI-44 (Frontend Engineer).
 *
 * Run: BASE_URL=http://localhost:5173 npx playwright test accessibility-audit.spec.ts --project=chromium --reporter=list --workers=1
 */

import { test, expect } from '@playwright/test';
import type { APIRequestContext, Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import * as fs from 'fs';
import * as path from 'path';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BASE = process.env.BASE_URL || 'http://localhost:5173';
const API_REL = '/api/v1'; // relative — routed via Vite proxy

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AuditFinding {
  page: string;
  url: string;
  ruleId: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  helpUrl: string;
  wcagTags: string[];
  suggestedFix: string;
  nodes: {
    html: string;
    target: string[];
    failureSummary: string;
  }[];
}

// ---------------------------------------------------------------------------
// Suggested fix lookup (common axe-core rules)
// ---------------------------------------------------------------------------

const FIX_SUGGESTIONS: Record<string, string> = {
  'color-contrast':
    'Increase foreground/background contrast to at least 4.5:1 for normal text or 3:1 for large text.',
  'image-alt': 'Add descriptive alt text to images, or alt="" for decorative ones.',
  'label': 'Associate each form control with a <label for="id"> or aria-label/aria-labelledby.',
  'button-name': 'Ensure buttons have discernible text (visible text, aria-label, or aria-labelledby).',
  'link-name': 'Ensure links have descriptive text (visible text, aria-label, or title).',
  'heading-order': 'Use heading levels in sequential order without skipping (h1→h2→h3).',
  'page-has-heading-one': 'Add an <h1> element as the primary page heading.',
  'region': 'Wrap content in landmark regions (nav, main, aside, section with aria-label).',
  'landmark-one-main': 'Add a <main> or role="main" landmark to the page.',
  'html-has-lang': 'Add a lang attribute to the <html> element (e.g., lang="en").',
  'html-lang-valid': 'Use a valid BCP 47 language code for the lang attribute.',
  'document-title': 'Add a meaningful <title> element inside <head>.',
  'list': 'Use proper list markup (<ul>/<ol>) for list content, not CSS styling alone.',
  'listitem': 'Wrap <li> elements inside <ul> or <ol> parent elements.',
  'meta-viewport': 'Avoid user-scalable=no or maximum-scale < 5 in the viewport meta tag.',
  bypass: 'Add a skip navigation link as the first focusable element on the page.',
  'aria-allowed-attr': 'Ensure ARIA attributes match the element\'s role.',
  'aria-hidden-focus': 'Do not apply aria-hidden="true" to focusable elements.',
  'aria-required-children': 'Add required child elements for the ARIA role (e.g., option inside listbox).',
  'aria-required-parent': 'Wrap the element in its required ARIA parent (e.g., option inside listbox).',
  'aria-roles': 'Use valid ARIA role values.',
  'aria-valid-attr-value': 'Use valid values for ARIA attributes.',
  'aria-valid-attr': 'Use correctly spelled ARIA attribute names.',
  'duplicate-id': 'Ensure all id attributes on the page are unique.',
  'empty-heading': 'Add text content to headings or mark them as decorative with aria-hidden.',
  'form-field-multiple-labels': 'Use only one label per form field, or use aria-labelledby to combine.',
  'select-name': 'Give <select> elements an accessible name via <label>, aria-label, or aria-labelledby.',
  'frame-title': 'Add a title attribute to <iframe> and <frame> elements.',
};

function getSuggestedFix(ruleId: string): string {
  return FIX_SUGGESTIONS[ruleId] || 'Review the help URL for remediation guidance.';
}

// ---------------------------------------------------------------------------
// Global collector (serial mode ensures single worker)
// ---------------------------------------------------------------------------

const allFindings: AuditFinding[] = [];

// Serial mode so all findings accumulate in one worker process
test.describe.configure({ mode: 'serial' });

// ---------------------------------------------------------------------------
// Shared auth state
// ---------------------------------------------------------------------------

let accessToken = '';
let refreshToken = '';
let chartId = '';

// ---------------------------------------------------------------------------
// Setup — register user + create chart using Playwright request context
// ---------------------------------------------------------------------------

test.describe('Accessibility Audit', () => {
  test('Setup — register test user and create chart', async ({ request }) => {
    // Fetch CSRF token (sets cookie in request context automatically)
    const csrfRes = await request.get(API_REL + '/csrf-token');
    const csrfBody = await csrfRes.json();
    const csrfToken = csrfBody?.data?.token ?? '';
    if (!csrfToken) throw new Error('CSRF token fetch failed');

    // Register
    const email = `a11y-audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@astroverse.com`;
    const regRes = await request.post(API_REL + '/auth/register', {
      data: {
        name: 'A11y Audit User',
        email,
        password: 'AuditPass!2026',
      },
      headers: { 'X-CSRF-Token': csrfToken },
    });
    if (regRes.status() !== 201) {
      const body = await regRes.json().catch(() => ({}));
      throw new Error(`Register failed (${regRes.status()}): ${JSON.stringify(body)}`);
    }
    const regData = await regRes.json();
    accessToken = regData.data?.accessToken;
    refreshToken = regData.data?.refreshToken;
    expect(accessToken).toBeTruthy();

    // Create a chart for the chart-detail page
    const chartRes = await request.post(API_REL + '/charts', {
      data: {
        name: 'A11y Audit Chart',
        birthDate: '1990-06-15',
        birthTime: '14:30',
        birthLocation: 'New York, NY, USA',
        latitude: 40.7128,
        longitude: -74.006,
        chartType: 'natal',
        houseSystem: 'placidus',
        zodiacType: 'tropical',
      },
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (chartRes.ok()) {
      const chartData = await chartRes.json();
      chartId =
        chartData.data?.chart?._id ||
        chartData.data?._id ||
        chartData.data?.id ||
        '';
    }
    console.log(`Setup complete — chartId: ${chartId || '(none)'}`);
  });

  // -----------------------------------------------------------------------
  // Public pages
  // -----------------------------------------------------------------------

  test('Landing page (/)', async ({ page }) => {
    await scanPage(page, 'Landing', '/');
  });

  test('Login page (/login)', async ({ page }) => {
    await scanPage(page, 'Login', '/login');
  });

  test('Registration page (/register)', async ({ page }) => {
    await scanPage(page, 'Register', '/register');
  });

  test('Forgot password page (/forgot-password)', async ({ page }) => {
    await scanPage(page, 'Forgot Password', '/forgot-password');
  });

  // -----------------------------------------------------------------------
  // Authenticated pages
  // -----------------------------------------------------------------------

  test('Dashboard (/dashboard)', async ({ page }) => {
    await gotoWithAuth(page, '/dashboard');
    await scanPage(page, 'Dashboard', '/dashboard');
  });

  test('Chart creation wizard (/charts/create)', async ({ page }) => {
    await gotoWithAuth(page, '/charts/create');
    await scanPage(page, 'Chart Creation', '/charts/create');
  });

  test('Chart detail (/charts/:id)', async ({ page }) => {
    if (!chartId) {
      console.log('[Chart Detail] Skipped — no chart ID');
      return;
    }
    await gotoWithAuth(page, `/charts/${chartId}`);
    await scanPage(page, 'Chart Detail', `/charts/${chartId}`);
  });

  test('Settings (/settings)', async ({ page }) => {
    await gotoWithAuth(page, '/settings');
    await scanPage(page, 'Settings', '/settings');
  });

  // -----------------------------------------------------------------------
  // Color contrast — dedicated scan (also checks authenticated pages)
  // -----------------------------------------------------------------------

  test('Color contrast — public pages', async ({ page }) => {
    const publicPaths = [
      { name: 'Landing', path: '/' },
      { name: 'Login', path: '/login' },
      { name: 'Register', path: '/register' },
      { name: 'Forgot Password', path: '/forgot-password' },
    ];
    for (const p of publicPaths) {
      await page.goto(`${BASE}${p.path}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(2000);
      const results = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
      for (const v of results.violations) {
        allFindings.push({
          page: `${p.name} (contrast)`,
          url: `${BASE}${p.path}`,
          ruleId: v.id,
          impact: (v.impact || 'serious') as AuditFinding['impact'],
          description: v.description,
          helpUrl: v.helpUrl,
          wcagTags: v.tags.filter((t) => t.startsWith('wcag')),
          suggestedFix: getSuggestedFix(v.id),
          nodes: v.nodes.map((n) => ({
            html: n.html,
            target: n.target as string[],
            failureSummary: n.failureSummary || '',
          })),
        });
      }
      console.log(
        `[${p.name} contrast] ${results.violations.length} violations, ${results.violations.reduce((s, v) => s + v.nodes.length, 0)} elements`,
      );
    }
  });

  test('Color contrast — Dashboard (auth)', async ({ page }) => {
    await gotoWithAuth(page, '/dashboard');
    await page.waitForTimeout(2000);
    const results = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
    for (const v of results.violations) {
      allFindings.push({
        page: 'Dashboard (contrast)',
        url: `${BASE}/dashboard`,
        ruleId: v.id,
        impact: (v.impact || 'serious') as AuditFinding['impact'],
        description: v.description,
        helpUrl: v.helpUrl,
        wcagTags: v.tags.filter((t) => t.startsWith('wcag')),
        suggestedFix: getSuggestedFix(v.id),
        nodes: v.nodes.map((n) => ({
          html: n.html,
          target: n.target as string[],
          failureSummary: n.failureSummary || '',
        })),
      });
    }
    console.log(
      `[Dashboard contrast] ${results.violations.length} violations, ${results.violations.reduce((s, v) => s + v.nodes.length, 0)} elements`,
    );
  });

  // -----------------------------------------------------------------------
  // Report generation
  // -----------------------------------------------------------------------

  test('Generate audit report', async ({}, testInfo) => {
    // Write JSON report to e2e-reports/
    const reportDir = path.join(testInfo.project.testDir, '..', 'e2e-reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    // Deduplicate by page + ruleId
    const seen = new Set<string>();
    const deduped = allFindings.filter((f) => {
      const key = `${f.page}::${f.ruleId}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Group by severity
    const byImpact: Record<string, AuditFinding[]> = {};
    for (const f of deduped) {
      byImpact[f.impact] ??= [];
      byImpact[f.impact].push(f);
    }

    const report = {
      timestamp: new Date().toISOString(),
      wcagLevel: '2.1 AA',
      totalPages: new Set(deduped.map((f) => f.page)).size,
      totalFindings: deduped.length,
      bySeverity: {
        critical: (byImpact.critical || []).length,
        serious: (byImpact.serious || []).length,
        moderate: (byImpact.moderate || []).length,
        minor: (byImpact.minor || []).length,
      },
      findings: deduped,
    };

    // Write JSON
    const jsonPath = path.join(reportDir, 'accessibility-audit.json');
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
    console.log(`\nJSON report written to: ${jsonPath}`);

    // Write Markdown report
    const mdPath = path.join(reportDir, 'accessibility-audit.md');
    const md = buildMarkdownReport(report);
    fs.writeFileSync(mdPath, md);
    console.log(`Markdown report written to: ${mdPath}`);

    // Console summary
    console.log('\n' + '='.repeat(72));
    console.log('ACCESSIBILITY AUDIT REPORT — WCAG 2.1 AA');
    console.log('='.repeat(72));
    console.log(`Total findings: ${report.totalFindings} across ${report.totalPages} page(s)`);
    console.log(
      `  Critical: ${report.bySeverity.critical} | Serious: ${report.bySeverity.serious} | Moderate: ${report.bySeverity.moderate} | Minor: ${report.bySeverity.minor}`,
    );
    console.log('='.repeat(72) + '\n');
  });
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Inject auth state into localStorage so ProtectedRoute lets us through */
async function injectAuth(page: Page): Promise<void> {
  await page.evaluate(
    ({ at, rt }) => {
      localStorage.setItem('accessToken', at);
      localStorage.setItem('refreshToken', rt);
      localStorage.setItem(
        'auth-storage',
        JSON.stringify({
          state: {
            user: { email: 'audit@test.com' },
            isAuthenticated: true,
            isLoading: false,
          },
          version: 0,
        }),
      );
    },
    { at: accessToken, rt: refreshToken },
  );
}

/** Navigate to domain, inject auth, then navigate to target path */
async function gotoWithAuth(page: Page, path: string): Promise<void> {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await injectAuth(page);
  await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(2000);
}

/** Scan a page with axe-core, capture all violations (no assertions) */
async function scanPage(
  page: Page,
  pageName: string,
  path: string,
): Promise<void> {
  const url = `${BASE}${path}`;

  let builder = new AxeBuilder({ page }).withTags([
    'wcag2a',
    'wcag2aa',
    'wcag21a',
    'wcag21aa',
    'best-practice',
  ]);

  const results = await builder.analyze();

  for (const v of results.violations) {
    const impact = (v.impact || 'moderate') as AuditFinding['impact'];
    allFindings.push({
      page: pageName,
      url,
      ruleId: v.id,
      impact,
      description: v.description,
      helpUrl: v.helpUrl,
      wcagTags: v.tags.filter((t) => t.startsWith('wcag')),
      suggestedFix: getSuggestedFix(v.id),
      nodes: v.nodes.map((n) => ({
        html: n.html,
        target: n.target as string[],
        failureSummary: n.failureSummary || '',
      })),
    });
  }

  const count = results.violations.length;
  const nodeCount = results.violations.reduce((sum, v) => sum + v.nodes.length, 0);
  console.log(`[${pageName}] ${count} violations (${nodeCount} elements affected)`);
}

/** Build a human-readable Markdown report */
function buildMarkdownReport(report: {
  timestamp: string;
  totalPages: number;
  totalFindings: number;
  bySeverity: Record<string, number>;
  findings: AuditFinding[];
}): string {
  const lines: string[] = [
    '# Accessibility Audit Report',
    '',
    `**Date:** ${report.timestamp}`,
    `**WCAG Level:** 2.1 AA`,
    `**Pages scanned:** ${report.totalPages}`,
    `**Total findings:** ${report.totalFindings}`,
    '',
    '## Summary',
    '',
    '| Severity | Count |',
    '|----------|-------|',
    `| Critical | ${report.bySeverity.critical || 0} |`,
    `| Serious | ${report.bySeverity.serious || 0} |`,
    `| Moderate | ${report.bySeverity.moderate || 0} |`,
    `| Minor | ${report.bySeverity.minor || 0} |`,
    '',
  ];

  for (const severity of ['critical', 'serious', 'moderate', 'minor']) {
    const findings = report.findings.filter((f) => f.impact === severity);
    if (findings.length === 0) continue;

    lines.push(`## ${severity.charAt(0).toUpperCase() + severity.slice(1)} Violations (${findings.length})`);
    lines.push('');

    for (const f of findings) {
      lines.push(`### [${f.page}] ${f.ruleId}`);
      lines.push('');
      lines.push(`- **WCAG:** ${f.wcagTags.join(', ') || 'best-practice'}`);
      lines.push(`- **Description:** ${f.description}`);
      lines.push(`- **Suggested fix:** ${f.suggestedFix}`);
      lines.push(`- **Help:** ${f.helpUrl}`);
      lines.push(`- **Elements affected:** ${f.nodes.length}`);
      lines.push('');
      lines.push('**Affected elements:**');
      lines.push('');
      for (const node of f.nodes.slice(0, 5)) {
        lines.push(`- \`${node.target.join(', ')}\``);
        lines.push(`  \`\`\`html`);
        lines.push(`  ${node.html.slice(0, 200)}`);
        lines.push(`  \`\`\``);
      }
      if (f.nodes.length > 5) {
        lines.push(`- ... and ${f.nodes.length - 5} more`);
      }
      lines.push('');
    }
  }

  lines.push('---');
  lines.push('*Generated by CHI-49 accessibility pre-audit. Feed findings into [CHI-44](/CHI/issues/CHI-44) for remediation.*');

  return lines.join('\n');
}
