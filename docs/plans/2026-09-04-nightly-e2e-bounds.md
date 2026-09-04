# Sol plan: bounded nightly E2E execution (#552, #553)

## Goal
Restore the nightly live-scenario workflow as an observable, independently bounded release signal without weakening any existing CI, security, accessibility, E2E, visual, branch-protection, or human-release gate.

## Verified causes
1. The critical command selects five specs but no Playwright project. The shared config expands the selection from 31 Chromium tests to 218 tests across authenticated Chromium, desktop Chromium/Firefox/WebKit, two mobile projects, and tablet, while CI is restricted to one worker and two retries.
2. Critical, console, and accessibility phases share one 30-minute job. Two consecutive scheduled runs spent about 28m45s in critical execution, were cancelled at the job limit, and skipped both later audits.
3. The CLI overrides the configured list reporter with only HTML/JSON reporters, removing live per-test diagnostics from the Actions log.
4. Every phase shadows the documented `base_url` workflow input with `http://localhost:3000`, so remote dispatches silently test localhost. The default Playwright config would also start local servers during a remote run unless explicitly disabled.

## Implementation
1. Add a Node test that parses the workflow and asserts three matrix phases, fail-fast isolation, explicit Chromium selection, a command-level timeout shorter than the job timeout, list reporting, unique artifacts, conditional local/remote execution, effective-target summaries, and disabled Playwright local web servers for remote targets.
2. Run the new test against current master and record RED before production changes.
3. Refactor the nightly workflow into two mutually exclusive three-phase matrices:
   - local scheduled/default dispatch: PostgreSQL plus local backend/frontend setup;
   - explicit remote dispatch: no local service provisioning and the requested URL passed unchanged.
4. Bound every Playwright command with GNU `timeout` and retain a larger job timeout so test timeouts become ordinary failures and artifact/summary steps still run.
5. Select `--project=chromium` deliberately for this nightly suite. Cross-browser/mobile coverage remains in the existing protected CI E2E/BDD/visual gates.
6. Preserve configured list, JSON, and HTML reporters; use phase-specific result directories and artifact names.
7. Add a final fail-closed aggregate gate and one conditional Slack failure notification.
8. Make the shared Playwright config omit local `webServer` processes only when the workflow explicitly sets `PLAYWRIGHT_SKIP_WEBSERVER=1`.
9. Run the workflow contract test to GREEN, actionlint, Playwright `--list` checks for each phase, lint, backend Jest, root build, and diff checks.
10. Push the feature branch, open one PR mapping both issues, verify every required PR-head check, manually dispatch the nightly workflow on the PR head, and merge only through protected native auto-merge/normal review after terminal evidence.

## Acceptance and rollback
- All three phases independently execute and produce terminal success/failure conclusions and artifacts.
- No phase can consume another phase's budget.
- Default runs exercise the integrated local stack; explicit remote runs use the exact requested target without local app servers.
- Existing release/security gates remain required; no skip, retry inflation, threshold reduction, admin merge, or error suppression is introduced.
- This is workflow/config-only scope: no routed UI changes, screenshots, or Terra visual review are required.
- Rollback is a normal revert of the remediation commit/PR; never bypass branch protection or push directly to master.
