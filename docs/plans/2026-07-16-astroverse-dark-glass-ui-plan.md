# AstroVerse Dark Glass UI Overhaul — Implementation Plan

> **For Hermes:** Execute this plan task-by-task with Luna xhigh. Use Sol xhigh for independent specification and code-quality review before each PR is considered mergeable.

**Goal:** Migrate AstroVerse to a consistent premium dark glass design system without changing product behavior.

**Architecture:** Establish semantic CSS/Tailwind/runtime tokens first, normalize shared UI primitives second, then migrate bounded route families through small PRs. Treat browser, accessibility, performance, visual regression, AGY, and human review as release gates.

**Tech Stack:** React 18, Vite 5, TypeScript, Tailwind 3, Vitest, Playwright, AGY.

---

## PR sequence and gate policy

The overhaul uses exactly eight implementation PRs. Every PR runs the complete applicable quality suite; a focused suite is an early feedback step, never a substitute for required CI. The eight PRs are:

1. Audit, token foundation, and deterministic visual harness.
2. Shared glass UI primitives.
3. Application shell and Issue #514 integration.
4. Authentication, onboarding, and account surfaces.
5. Chart creation and chart-results experience.
6. Transits, forecasts, synastry, and interpretation pages.
7. Secondary, informational, and exceptional routes.
8. Visual-regression convergence and cleanup for Issue #516.

Existing `Card`, `Modal`, and related primitives remain compatibility aliases during migration. A primitive may be replaced only after all consumers are migrated, tests are transferred, and the old export is removed in a dedicated cleanup commit.

## Phase 1 — Foundation PR

### Task 1: Build route and surface audit matrix

**Files:** Create `docs/superpowers/audits/astroverse-ui-route-audit.md`; inspect `frontend/src/App.tsx`, `frontend/src/pages/`, `frontend/src/components/`.

Record every route, shared component, overlay, PWA state, share/export/PDF surface, and exceptional state. For each, record:

- Route or surface path and owning component.
- Public, authenticated, demo, loading, empty, partial-data, error, permission, modal, drawer, and export states.
- Desktop, tablet, narrow-mobile, short-viewport, zoom, and reduced-motion behavior.
- Shared shells used: header, navigation, footer, sidebars, breadcrumbs, page containers.
- Forms, dialogs, drawers, menus, tables, charts, tooltips, tabs, cards, toasts, share cards, and generated documents.
- Existing screenshot, unit, accessibility, and Playwright coverage.
- Hard-coded visual values, duplicate patterns, accessibility risks, performance risks, and migration disposition.

Maintain a route-and-surface matrix so every routed page and shared/non-route surface has an auditable status, owner PR, and explicit migrated/retained/replaced disposition.

### Task 2: Define semantic token contract

**Files:** Modify `frontend/src/index.css`, `frontend/tailwind.config.js`, `frontend/src/utils/design-tokens.ts`; test in `frontend/src/utils/__tests__/design-tokens.test.ts`.

Add canvas, surface, border, text, accent, feedback, elevation, radius, blur, spacing, focus, and motion tokens. Map Tailwind and runtime chart consumers to the same semantic names. Keep raw palette values out of routed pages.

**TDD:** Add token existence and mapping tests first; verify they fail; implement; rerun.

### Task 3: Add reduced-motion and focus defaults

**Files:** Modify `frontend/src/index.css`; test with a small browser/accessibility fixture.

Ensure focus-visible rings are consistent and non-essential transitions are disabled under `prefers-reduced-motion: reduce`.

### Task 4: Stabilize visual-test determinism

**Files:** Inspect/fix `frontend/playwright.config.*`, visual test fixtures, and `frontend/src/__tests__/visual/` or equivalent.

Control fonts, clock, animation state, data fixtures, loading completion, and ESM path handling. Classify Issue #516 failures without regenerating all snapshots blindly.

### Task 5: Open and review foundation PR

Run frontend typecheck, lint, build, Vitest, and affected Playwright checks. Run AGY against representative existing pages. Ask Sol xhigh to review token architecture, scope, accessibility, and visual consistency.

---

## Phase 2 — Shared primitives PR

### Task 6: Normalize surface and layout primitives

**Files:** `frontend/src/components/ui/`, new shared files as needed, corresponding tests.

Implement `Surface`, `GlassCard`, `GlassModal`, `PageContainer`, `PageHeader`, `Section`, and `Divider` with explicit variants and semantic tokens.

### Task 7: Normalize interaction primitives

Implement/test buttons, icon buttons, inputs, selects, fields, tabs, badges, dialogs, drawers, menus, tooltips, and toasts. Cover focus, keyboard, disabled, loading, error, selected, responsive, and reduced-motion states.

### Task 8: Normalize loading and data-state primitives

Implement/test skeleton, loading, empty, error, retry, and partial-data states. Ensure asynchronous status is announced appropriately.

### Task 9: Review primitives with Sol xhigh

Run component tests, accessibility tests, browser fixture tests, and AGY visual review. Resolve all high-severity findings before opening the PR. AGY is the visual/usability reviewer; Sol xhigh independently reviews architecture, specification compliance, code quality, and test adequacy as a separate gate.

---

## Phase 3 — Application shell and Issue #514 PR

### Task 10: Migrate global shell

**Files:** `frontend/src/components/AppLayout.tsx`, `PublicPageLayout.tsx`, `AuthLayout.tsx`, navigation/footer components, `frontend/src/App.tsx`.

Adopt shared surfaces, page widths, semantic landmarks, focus behavior, safe-area spacing, and a single z-index contract.

### Task 11: Resolve PWA banner behavior

**Files:** `frontend/src/components/ServiceWorkerUpdateBanner.tsx`, related tests.

Verify mobile bottom-sheet behavior, constrained desktop card behavior, navigation stacking, and no content/control obstruction.

### Task 12: Browser-test shell states

Test desktop, tablet, 390px, and 320px; open/close navigation; PWA banner; modal/drawer stacking; keyboard traversal; reduced motion; and header landmarks.

### Task 13: Sol xhigh review and PR

Run full affected gates and independent AGY review. Open the PR referencing #514 and #536 only after checks pass locally.

---

## Phase 4 — Route-family migrations

For each route family, repeat this exact TDD sequence:

1. Add/extend characterization tests for existing behavior and states.
2. Add failing visual/accessibility assertions for the intended shared patterns.
3. Migrate one page/component group to shared primitives.
4. Run focused Vitest and Playwright checks.
5. Run responsive browser verification.
6. Run AGY review.
7. Request Sol xhigh specification/code-quality review.
8. Open a focused PR with no unrelated refactor.

Families:

- Authentication/onboarding/account.
- Chart creation/results.
- Transits/forecasts/synastry/interpretation.
- Dashboard, learn, blog, saved charts, subscription, legal, and exceptional routes.

Each family must cover loading, empty, error, partial-data, populated, modal, and mobile states where applicable.

---

## Phase 5 — Visual regression convergence

### Task 14: Classify every Issue #516 mismatch

Record route, viewport, state, cause, owning PR, and disposition: genuine regression, intended approved redesign, deterministic test issue, or implementation bug.

### Task 15: Fix implementation and determinism causes

Do not change thresholds, add blanket masks, skip tests, or use `continue-on-error`. Fix the source or fixture that causes each mismatch.

### Task 16: Review intentional snapshots individually

Update only snapshots that represent an approved design change and document why each changed.

### Task 17: Final convergence review

Run full visual suite, accessibility suite, frontend tests, build, performance comparison, AGY review, and human desktop/mobile review. Close #516 only after all mismatches have documented resolution.

---

## Final verification checklist

- [ ] Full route audit has no unmigrated route or shared surface.
- [ ] Semantic token contract is the only page-level visual contract.
- [ ] Shared primitives have behavior/accessibility tests.
- [ ] Existing functionality and API behavior are unchanged.
- [ ] Desktop/tablet/mobile browser flows pass.
- [ ] Keyboard, focus, landmarks, headings, announcements, and contrast pass with zero new serious/critical automated violations and zero unresolved manual critical/high findings.
- [ ] Reduced-motion mode passes.
- [ ] Visual regression passes without weakened gates.
- [ ] No unexpected console or network errors.
- [ ] Performance stays within agreed budgets: no more than 5% regression in LCP/CLS/interaction baseline, no more than 10% increase in route JS/CSS without Sol-approved rationale, and no new long tasks over 200ms in representative flows.
- [ ] AGY visual review is complete and separate from Sol xhigh architecture/code review.
- [ ] No unresolved high-severity AGY or Sol finding.
- [ ] Human visual review passes.
