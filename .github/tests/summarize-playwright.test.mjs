import assert from 'node:assert/strict';
import test from 'node:test';

import {
  summarizePlaywrightReport,
  renderMarkdownSummary,
} from '../scripts/summarize-playwright.mjs';

const report = {
  suites: [
    {
      specs: [
        {
          tests: [
            { results: [{ status: 'passed' }] },
            { results: [{ status: 'failed' }, { status: 'passed' }] },
            { results: [{ status: 'failed' }] },
          ],
        },
      ],
      suites: [
        {
          specs: [
            {
              tests: [
                { results: [{ status: 'skipped' }] },
                { results: [{ status: 'timedOut' }] },
                { results: [{ status: 'interrupted' }] },
              ],
            },
          ],
        },
      ],
    },
  ],
};

test('summarizes final Playwright attempts recursively without misleading zeros', () => {
  assert.deepEqual(summarizePlaywrightReport(report), {
    passed: 2,
    failed: 1,
    skipped: 1,
    timedOut: 1,
    interrupted: 1,
    flaky: 1,
    total: 6,
  });
});

test('renders operator context and retained artifact name', () => {
  const markdown = renderMarkdownSummary(
    'Console Error Audit',
    'https://staging.example.test',
    'nightly-remote-console-42-1',
    summarizePlaywrightReport(report),
  );

  assert.match(markdown, /Console Error Audit/);
  assert.match(markdown, /https:\/\/staging\.example\.test/);
  assert.match(markdown, /2 passed/);
  assert.match(markdown, /1 timed out/);
  assert.match(markdown, /nightly-remote-console-42-1/);
});

test('rejects malformed reports instead of reporting a false zero-result success', () => {
  assert.throws(() => summarizePlaywrightReport({}), /suites/);
});
