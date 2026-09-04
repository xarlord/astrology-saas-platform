import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { parse } from 'yaml';

const workflowPath = new URL('../workflows/e2e-nightly.yml', import.meta.url);
const configPath = new URL('../../frontend/playwright.config.ts', import.meta.url);
const source = readFileSync(workflowPath, 'utf8');
const workflow = parse(source);
const configSource = readFileSync(configPath, 'utf8');

const expectedPhases = ['critical', 'console', 'accessibility'];

function assertPhaseMatrix(job, targetKind) {
  assert.equal(job.strategy['fail-fast'], false);
  assert.deepEqual(
    job.strategy.matrix.include.map(({ phase }) => phase),
    expectedPhases,
  );
  assert.equal(job['timeout-minutes'], 25);

  const runStep = job.steps.find(({ name }) => name === 'Run bounded Playwright phase');
  assert.ok(runStep, `${targetKind} job must run a bounded Playwright phase`);
  assert.match(runStep.run, /timeout --signal=INT --kill-after=30s 20m/);
  assert.match(runStep.run, /--project=chromium/);
  assert.doesNotMatch(runStep.run, /--reporter=(?![^\n]*list)/);

  const uploadStep = job.steps.find(({ uses }) => uses === 'actions/upload-artifact@v4');
  assert.ok(uploadStep, `${targetKind} job must retain evidence`);
  assert.match(uploadStep.with.name, /matrix\.phase/);
  assert.match(uploadStep.with.name, /github\.run_attempt/);

  const summaryStep = job.steps.find(({ name }) => name === 'Summarize phase');
  assert.ok(summaryStep, `${targetKind} job must summarize its result`);
  assert.match(summaryStep.run, /summarize-playwright\.mjs/);
  assert.match(summaryStep.run, /\$BASE_URL/);
  assert.match(summaryStep.run, /nightly-\$\{TARGET_KIND\}-\$\{\{ matrix\.phase \}\}/);
}

test('nightly phases are isolated, bounded, observable, and aggregated fail closed', () => {
  const localJob = workflow.jobs['local-e2e'];
  const remoteJob = workflow.jobs['remote-e2e'];
  assert.ok(localJob);
  assert.ok(remoteJob);
  assertPhaseMatrix(localJob, 'local');
  assertPhaseMatrix(remoteJob, 'remote');

  assert.ok(localJob.services?.postgres, 'local job must provision PostgreSQL');
  assert.equal(remoteJob.services, undefined, 'remote job must not provision local services');
  assert.match(remoteJob.if, /inputs\.base_url != ''/);
  assert.equal(remoteJob.env.BASE_URL, '${{ inputs.base_url }}');
  assert.equal(remoteJob.env.PLAYWRIGHT_SKIP_WEBSERVER, '1');

  const gate = workflow.jobs['nightly-e2e-gate'];
  assert.deepEqual(gate.needs, ['local-e2e', 'remote-e2e']);
  assert.equal(gate.if, '${{ always() }}');
  assert.match(gate.steps[0].run, /exit 1/);
});

test('remote target is not shadowed and Playwright can suppress local servers', () => {
  assert.equal(workflow.jobs['local-e2e'].env.BASE_URL, 'http://localhost:3000');
  assert.equal(workflow.jobs['remote-e2e'].env.BASE_URL, '${{ inputs.base_url }}');
  for (const step of workflow.jobs['remote-e2e'].steps) {
    assert.notEqual(step.env?.BASE_URL, 'http://localhost:3000');
  }
  assert.match(configSource, /PLAYWRIGHT_SKIP_WEBSERVER/);
  assert.match(configSource, /webServer:\s*shouldStartLocalServers\s*\?/);
});

test('Playwright config has one authoritative top-level timeout', () => {
  assert.equal(configSource.match(/^  timeout: 30000,$/gm)?.length, 1);
});
