/**
 * Console Helpers for E2E Console Audit Tests
 *
 * Provides utilities for filtering, formatting, and reporting
 * browser console messages captured during Playwright tests.
 */

export interface CapturedConsoleMessage {
  type: 'error' | 'warning' | 'log' | 'info';
  text: string;
  location: {
    url: string;
    lineNumber?: number;
    columnNumber?: number;
  };
  pageUrl: string;
  timestamp: number;
}

/** Default patterns for messages that are known-benign and should be filtered out. */
export const DEFAULT_ALLOWED_PATTERNS: RegExp[] = [
  // Vite HMR in dev mode
  /^\[HMR\]/,
  // Intentional SW registration log from App.tsx
  /^Service Worker registered:/,
  // Intentional online/offline status logs
  /^App is (online|offline)/,
  // React DevTools (dev mode only)
  /^Download the React DevTools/,
  // Vite dev server overlay
  /^vite-plugin-sw/,
];

/**
 * Filter out messages matching any allowlist pattern.
 */
export function filterAllowedMessages(
  messages: CapturedConsoleMessage[],
  allowedPatterns: RegExp[] = DEFAULT_ALLOWED_PATTERNS,
): CapturedConsoleMessage[] {
  return messages.filter((msg) => !allowedPatterns.some((pattern) => pattern.test(msg.text)));
}

/**
 * Extract a human-readable source location from a Playwright console message location.
 * Strips Vite's `/@fs/` prefix to show a relative project path.
 */
export function extractSourceLocation(location: {
  url: string;
  lineNumber?: number;
  columnNumber?: number;
}): string {
  let url = location.url;

  // Strip Vite's internal prefix
  if (url.includes('/@fs/')) {
    url = url.split('/@fs/')[1] || url;
  }

  // Strip query strings
  url = url.split('?')[0];

  // Shorten to relative path if possible
  const srcIdx = url.indexOf('/src/');
  if (srcIdx !== -1) {
    url = url.slice(srcIdx + 1);
  }

  const line = location.lineNumber ? `:${location.lineNumber}` : '';
  const col = location.columnNumber ? `:${location.columnNumber}` : '';
  return `${url}${line}${col}`;
}

/**
 * Format a human-readable report of console messages.
 * Groups by type (error, warning) and includes source locations.
 */
export function formatConsoleReport(messages: CapturedConsoleMessage[]): string {
  if (messages.length === 0) {
    return 'No console errors or warnings found.';
  }

  const errors = messages.filter((m) => m.type === 'error');
  const warnings = messages.filter((m) => m.type === 'warning');

  const lines: string[] = [];

  if (errors.length > 0) {
    lines.push(`\n=== CONSOLE ERRORS (${errors.length}) ===`);
    for (const msg of errors) {
      const source = extractSourceLocation(msg.location);
      lines.push(`  [ERROR] ${msg.text}`);
      lines.push(`          Source: ${source}`);
      lines.push(`          Page: ${msg.pageUrl}`);
    }
  }

  if (warnings.length > 0) {
    lines.push(`\n=== CONSOLE WARNINGS (${warnings.length}) ===`);
    for (const msg of warnings) {
      const source = extractSourceLocation(msg.location);
      lines.push(`  [WARN] ${msg.text}`);
      lines.push(`         Source: ${source}`);
      lines.push(`         Page: ${msg.pageUrl}`);
    }
  }

  return lines.join('\n');
}
