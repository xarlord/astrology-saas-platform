import { appendFileSync, readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const RESULT_KEYS = ['passed', 'failed', 'skipped', 'timedOut', 'interrupted'];

function visitSuites(suites, visitTest) {
  for (const suite of suites) {
    for (const spec of suite.specs ?? []) {
      for (const test of spec.tests ?? []) {
        visitTest(test);
      }
    }
    visitSuites(suite.suites ?? [], visitTest);
  }
}

export function summarizePlaywrightReport(report) {
  if (!report || !Array.isArray(report.suites)) {
    throw new Error('Invalid Playwright JSON report: suites array is required');
  }

  const summary = {
    passed: 0,
    failed: 0,
    skipped: 0,
    timedOut: 0,
    interrupted: 0,
    flaky: 0,
    total: 0,
  };

  visitSuites(report.suites, (test) => {
    const results = Array.isArray(test.results) ? test.results : [];
    const finalStatus = results.at(-1)?.status ?? (test.status === 'skipped' ? 'skipped' : 'interrupted');
    const key = RESULT_KEYS.includes(finalStatus) ? finalStatus : 'interrupted';

    summary[key] += 1;
    summary.total += 1;

    if (
      finalStatus === 'passed' &&
      results.slice(0, -1).some((result) => !['passed', 'skipped'].includes(result.status))
    ) {
      summary.flaky += 1;
    }
  });

  if (summary.total === 0) {
    throw new Error('Invalid Playwright JSON report: no test results found');
  }

  return summary;
}

function markdownSafe(value) {
  return String(value).replace(/[\r\n]+/g, ' ').replace(/`/g, "'");
}

export function renderMarkdownSummary(label, target, artifact, summary) {
  return [
    `## ${markdownSafe(label)}`,
    `- Effective target: \`${markdownSafe(target)}\``,
    '- Playwright project: `chromium`',
    '- Command budget: 20 minutes (job budget: 25 minutes)',
    `- Results: ${summary.passed} passed, ${summary.failed} failed, ${summary.skipped} skipped, ${summary.timedOut} timed out, ${summary.interrupted} interrupted, ${summary.flaky} flaky (${summary.total} total)`,
    `- Retained evidence artifact: \`${markdownSafe(artifact)}\``,
    '',
  ].join('\n');
}

function main() {
  const [reportPath, label, target, artifact] = process.argv.slice(2);
  if (!reportPath || !label || !target || !artifact) {
    throw new Error('Usage: summarize-playwright.mjs <report.json> <label> <target> <artifact>');
  }

  const report = JSON.parse(readFileSync(reportPath, 'utf8'));
  const markdown = renderMarkdownSummary(
    label,
    target,
    artifact,
    summarizePlaywrightReport(report),
  );

  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown);
  } else {
    process.stdout.write(markdown);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
