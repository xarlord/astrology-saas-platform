# AstroVerse Recovery Plan — Production Readiness

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Bring AstroVerse to production readiness by fixing remaining weak points identified in the 2026-03-29 architecture audit (40 findings, 6 CRITICAL).

**Architecture:** 4-phase approach: (1) unlock core calculation engine, (2) wire stub pages to existing components + APIs, (3) mount disabled backend routes, (4) clean up dead code and inconsistencies.

**Tech Stack:** Express 4 + TypeScript, React 18 + Vite 5 + Tailwind 3, Knex + PostgreSQL, Zustand + React Query

---

## Context

The architecture audit (docs/ARCHITECTURE.md) identified 40 weak points. Since the audit, **7 critical items have already been fixed** via recent commits:

- W3 CSRF wiring — `server.ts` now applies `csrfMiddleware` globally (commit `1730a98`)
- W4 Auth rate limiter — applied to all 3 auth endpoints (commit `1730a98`)
- W7 Non-null assertions — all `req.user!` replaced (0 remaining) (commit `bf2367e`)
- W8 Token storage — centralized in `utils/tokenStorage.ts`, api.ts reads from it (commit `73fdaed`)
- W11 AppLayout migration — all 6 stub pages now import AppLayout (commits `42c77c3`, `4fafec1`, `7b78970`)
- W12 Password validation — special character requirement added (commit `cebb804`)
- W13 `<a>` → `<Link>` — fixed in AuthenticationForms (commit `46c2e58`)

**This plan addresses the 33 remaining items.** It is organized by dependency order — earlier phases unblock later ones.

---

## Phase 1: Wire Real Calculation Engine (W1)

> **Why first:** Everything depends on real data. All chart/transit/synastry endpoints currently return mock data from `swissEphemeris.service.ts`. The real engine (`astronomyEngine.service.ts` + `natalChart.service.ts`) exists but is unused.

### Task 1: Export real engine from shared module barrel

**Depends on:** None (parallelizable with Task 2)

**Files:**
- Modify: `backend/src/modules/shared/index.ts` (currently only exports swissEphemeris)

**Step 1:** Update the shared barrel to export the real engine services:

```typescript
// backend/src/modules/shared/index.ts
export { swissEphemeris } from './services/swissEphemeris.service';
export { AstronomyEngineService } from './services/astronomyEngine.service';
export { NatalChartService } from './services/natalChart.service';
export { HouseCalculationService } from './services/houseCalculation.service';
export { timezoneService } from './services/timezone.service';
```

**Step 2:** Run `cd backend && npx tsc --noEmit` to verify no type errors.

**Step 3:** Commit: `refactor: export real calculation engine from shared module barrel`

---

### Task 2: Wire NatalChartService into chart controller

**Depends on:** Task 1

**Files:**
- Modify: `backend/src/modules/charts/controllers/chart.controller.ts`
- Test: `backend/src/__tests__/controllers/chart.controller.test.ts`

**Step 1: Write failing test** — Verify that `calculateChart` endpoint returns realistic planet positions (longitude 0-360, valid sign names) rather than mock data. Add a test that asserts `data.planets[0].longitude` is within 0-360 and `data.planets[0].sign` is a real zodiac sign.

**Step 2: Run test** — `cd backend && npx jest --testPathPattern=chart.controller` — expect FAIL (mock data uses pseudo-random values).

**Step 3: Replace swissEphemeris import** in `chart.controller.ts`:

```typescript
// BEFORE
import { swissEphemeris } from '../../shared';

// AFTER
import { NatalChartService } from '../../shared';
const natalChartService = new NatalChartService();
```

Update the `calculateChart` function to call `natalChartService.calculateNatalChart(birthData)` instead of `swissEphemeris.calculateNatalChart(...)`.

**Step 4: Run test** — expect PASS.

**Step 5: Commit:** `feat: wire real calculation engine into chart controller`

---

### Task 3: Wire NatalChartService into transit controller

**Depends on:** Task 1

**Files:**
- Modify: `backend/src/modules/transits/controllers/transit.controller.ts`

**Step 1: Replace swissEphemeris import** with real engine. Transits require computing current planetary positions and comparing to natal positions, so use `AstronomyEngineService` for current positions + `NatalChartService` for natal reference.

**Step 2: Run tests** — `cd backend && npx jest --testPathPattern=transit` — verify all pass.

**Step 3: Commit:** `feat: wire real calculation engine into transit controller`

---

### Task 4: Wire real engine into lunar, solar, and synastry controllers

**Depends on:** Task 1

**Files:**
- Modify: `backend/src/modules/lunar/controllers/lunarReturn.controller.ts`
- Modify: `backend/src/modules/solar/controllers/solarReturn.controller.ts`
- Modify: `backend/src/modules/synastry/controllers/synastry.controller.ts`

**Step 1:** For each controller, replace `swissEphemeris` import with the appropriate real service. Run `cd backend && npx tsc --noEmit` after each change.

**Step 2:** Run full backend test suite: `cd backend && npx jest`

**Step 3:** Commit: `feat: wire real calculation engine into lunar, solar, synastry controllers`

---

## Phase 2: Connect Stub Pages to Real APIs (W2)

> **Why now:** With real data flowing (Phase 1), the stub pages need to actually fetch and display it.

### Task 5: Replace ChartCreatePage stub with BirthDataForm

**Depends on:** Task 2 (chart creation must use real engine)

**Files:**
- Modify: `frontend/src/pages/ChartCreatePage.tsx` (currently stub, imports AppLayout but form is static)
- Reference: `frontend/src/components/BirthDataForm.tsx` (existing full form with geocoding)

**Step 1:** Replace the static HTML form in ChartCreatePage with the existing `BirthDataForm` component. The `BirthDataForm` already handles geocoding, house system selection, and timezone detection.

**Step 2:** Wire the form's `onSubmit` to call `chartsStore.createChart()` or the `useCreateChart()` React Query mutation hook.

**Step 3:** Add success navigation to `/charts/${newChartId}` after creation.

**Step 4:** Run `cd frontend && npx vitest run --reporter=verbose` to verify no regressions.

**Step 5:** Commit: `feat: connect ChartCreatePage to BirthDataForm and chart creation API`

---

### Task 6: Replace ChartViewPage stub with real chart fetch

**Depends on:** Task 2 (chart data must be real)

**Files:**
- Modify: `frontend/src/pages/ChartViewPage.tsx` (currently always shows "not found")

**Step 1:** Remove the `setTimeout` + `setChartData(null)` mock. Replace with:

```typescript
const { chartId } = useParams();
const { data: chartData, isLoading, error } = useChart(chartId);
```

Where `useChart` comes from `chartsStore.fetchChart(chartId)`.

**Step 2:** Pass the real `chartData` to `ChartWheel` component (already imported in the dead code path).

**Step 3:** Add an "Analysis" link to `/analysis/${chartId}`.

**Step 4:** Run `cd frontend && npx vitest run`

**Step 5:** Commit: `feat: connect ChartViewPage to real chart API and ChartWheel`

---

### Task 7: Connect AnalysisPage to real API

**Depends on:** Task 6

**Files:**
- Modify: `frontend/src/pages/AnalysisPage.tsx` (currently hardcoded placeholder data)

**Step 1:** Remove the hardcoded planet/house/aspect data. Replace with the existing React Query hooks:

```typescript
const { chartId } = useParams();
const { data: analysisData, isLoading } = useChartAnalysis(chartId);
```

**Step 2:** Map the API response shape to the `PersonalityAnalysis` component's expected props. The `useChartAnalysis` hook already exists in `frontend/src/hooks/index.ts`.

**Step 3:** Run `cd frontend && npx vitest run`

**Step 4:** Commit: `feat: connect AnalysisPage to real personality analysis API`

---

### Task 8: Connect TransitPage to TransitDashboard

**Depends on:** Task 3

**Files:**
- Modify: `frontend/src/pages/TransitPage.tsx` (currently always shows "no data")

**Step 1:** Remove the `setTimeout` + `setTransitData(null)` mock. Replace with:

```typescript
const { data: transitData, isLoading } = useTodayTransits();
```

**Step 2:** Pass real data to the existing `TransitDashboard` component (already exists in components/ but unused by this page).

**Step 3:** Run `cd frontend && npx vitest run`

**Step 4:** Commit: `feat: connect TransitPage to real transit API and TransitDashboard`

---

### Task 9: Connect ProfilePage to UserProfile component

**Depends on:** None (parallelizable)

**Files:**
- Modify: `frontend/src/pages/ProfilePage.tsx` (currently placeholder text)

**Step 1:** Remove the `setTimeout` + `setProfileData(null)` mock. Replace with the existing `UserProfile` component which already handles profile display, preferences, and subscription tiers.

**Step 2:** Run `cd frontend && npx vitest run`

**Step 3:** Commit: `feat: connect ProfilePage to UserProfile component and real API`

---

## Phase 3: Mount Disabled Routes + Missing Migrations (W5, W6)

### Task 10: Mount AI routes in v1 router

**Depends on:** None (parallelizable)

**Files:**
- Modify: `backend/src/api/v1/index.ts` (add AI route mounting)

**Step 1:** Import and mount AI routes:

```typescript
import { aiRoutes } from '../../modules/ai';

// ... existing mounts ...
router.use('/ai', aiRoutes);
```

**Step 2:** Run `cd backend && npx tsc --noEmit` to verify compilation.

**Step 3:** Run `cd backend && npx jest --testPathPattern=integration`

**Step 4:** Commit: `feat: mount AI interpretation routes in v1 API router`

---

### Task 11: Mount notification routes in v1 router

**Depends on:** None (parallelizable with Task 10)

**Files:**
- Modify: `backend/src/api/v1/index.ts` (add notification route mounting)

**Step 1:** Import and mount notification routes:

```typescript
import { pushNotificationRoutes } from '../../modules/notifications';

// ... existing mounts ...
router.use('/notifications', pushNotificationRoutes);
```

**Step 2:** Run `cd backend && npx tsc --noEmit`

**Step 3:** Commit: `feat: mount push notification routes in v1 API router`

---

### Task 12: Create shared_charts migration

**Depends on:** None (parallelizable)

**Files:**
- Create: `backend/migrations/YYYYMMDDHHMMSS_create_shared_charts.ts`

**Step 1:** Create migration for the `shared_charts` table referenced by `chartSharing.service.ts`:

```typescript
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('shared_charts', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.integer('chart_id').notNullable().references('id').inTable('charts').onDelete('CASCADE');
    table.uuid('share_token').notNullable().unique();
    table.string('password_hash').nullable();
    table.timestamp('expires_at').nullable();
    table.integer('max_views').nullable();
    table.integer('view_count').defaultTo(0);
    table.timestamps(true, true);
  });
}
```

**Step 2:** Run `cd backend && npx knex migrate:latest --knexfile knexfile.ts` (requires DB)

**Step 3:** Commit: `feat: add shared_charts migration for chart sharing`

---

## Phase 4: Consistency & Cleanup (W9, W10, W13, W17-W40)

### Task 13: Unify error handling in calendar controller

**Depends on:** None

**Files:**
- Modify: `backend/src/modules/calendar/controllers/calendar.controller.ts`

**Step 1:** Replace all `res.status(500).json(...)` manual error responses with `throw new AppError(...)` or typed subclasses. Wrap each handler with `asyncHandler`.

**Step 2:** Run `cd backend && npx jest --testPathPattern=calendar`

**Step 3:** Commit: `refactor: unify calendar controller error handling with asyncHandler pattern`

---

### Task 14: Replace `<a href>` with `<Link>` in AppLayout

**Depends on:** None

**Files:**
- Modify: `frontend/src/components/AppLayout.tsx` (16 `<a href>` tags to replace)

**Step 1:** Add `Link` to the `react-router-dom` import (currently only imports `useLocation`).

**Step 2:** Replace all internal navigation `<a href="/path">` with `<Link to="/path">`. Keep external links (social, etc.) as `<a>` with `target="_blank"`.

**Step 3:** Run `cd frontend && npx vitest run`

**Step 4:** Commit: `fix: replace <a> tags with <Link> in AppLayout for SPA navigation`

---

### Task 15: Fix dual knex config defaults

**Depends on:** None

**Files:**
- Modify: `backend/src/config/index.ts` (database section)
- Modify: `backend/knexfile.ts` (development section)

**Step 1:** Align both configs to use the same default port (5434) and database name (`astrology_saas`). Both should read from `DATABASE_URL` env var first, falling back to individual vars.

**Step 2:** Run `cd backend && npx tsc --noEmit`

**Step 3:** Commit: `fix: align knex config defaults between CLI and runtime`

---

### Task 16: Remove dead code and unused dependencies

**Depends on:** None

**Files:**
- Modify: `backend/src/api/v1/middleware/version.ts` (delete — dead code)
- Modify: `backend/src/modules/index.ts` (uncomment all module exports)
- Modify: `frontend/package.json` (remove unused deps: `d3`, `recharts`, `date-fns` if confirmed unused)
- Modify: `frontend/src/utils/lazyLoad.ts` (remove if unused, or wire into route imports)

**Step 1:** Delete `backend/src/api/v1/middleware/version.ts` — it is never imported.

**Step 2:** In `backend/src/modules/index.ts`, uncomment the commented-out module exports.

**Step 3:** Verify `d3`, `recharts`, `date-fns` usage with grep. If unused, remove from `frontend/package.json`.

**Step 4:** Run `cd backend && npx tsc --noEmit && cd ../frontend && npx tsc --noEmit`

**Step 5:** Commit: `chore: remove dead code, unused dependencies, and unused version middleware`

---

### Task 17: Unify AppError import paths

**Depends on:** None

**Files:**
- Modify: `backend/src/middleware/errorHandler.ts` (stop re-exporting AppError)
- Modify: `backend/src/middleware/auth.ts` (import from utils instead)
- Modify: `backend/src/modules/users/controllers/user.controller.ts` (import from utils instead)
- Grep all controllers for `from '.*errorHandler'` and change to `from '.*utils/appError'`

**Step 1:** Add deprecation re-export in `errorHandler.ts`:

```typescript
/** @deprecated Import AppError from utils/appError instead */
export { AppError } from '../utils/appError';
```

**Step 2:** Update all imports to point to `utils/appError` directly.

**Step 3:** Run `cd backend && npx jest`

**Step 4:** Commit: `refactor: unify AppError imports to single source (utils/appError)`

---

### Task 18: Add React error boundary

**Depends on:** None

**Files:**
- Create: `frontend/src/components/ErrorBoundary.tsx`
- Modify: `frontend/src/App.tsx` (wrap routes with ErrorBoundary)

**Step 1:** Create a simple error boundary component:

```tsx
import React from 'react';

interface Props { children: React.ReactNode }
interface State { hasError: boolean; error: Error | null }

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Something went wrong</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">{this.state.error?.message}</p>
            <button onClick={() => window.location.reload()} className="mt-4 btn-primary">Reload page</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
```

**Step 2:** Wrap `<Routes>` in App.tsx with `<ErrorBoundary>`.

**Step 3:** Run `cd frontend && npx vitest run`

**Step 4:** Commit: `feat: add React error boundary for graceful crash recovery`

---

### Task 19: Fix remaining 1 non-null assertion in transit controller

**Depends on:** None

**Files:**
- Modify: `backend/src/modules/transits/controllers/transit.controller.ts`

**Step 1:** Replace the single remaining `req.user!.id` with the `AuthenticatedRequest` pattern (same approach as commit `bf2367e`).

**Step 2:** Run `cd backend && npx jest --testPathPattern=transit`

**Step 3:** Commit: `fix: replace last non-null assertion in transit controller`

---

### Task 20: Create .dockerignore files

**Depends on:** None

**Files:**
- Create: `.dockerignore` (root)
- Create: `backend/.dockerignore`
- Create: `frontend/.dockerignore`

**Step 1:** Create root `.dockerignore`:

```
node_modules
dist
.git
.env*
*.md
docs/
.claude/
.planning/
```

**Step 2:** Create backend/frontend specific `.dockerignore` files excluding their respective build artifacts.

**Step 3:** Commit: `chore: add .dockerignore files for Docker build optimization`

---

## Task Dependency Graph

```
Phase 1 (Calculation Engine):
  Task 1 (barrel export) ──► Task 2 (chart controller)
                        ──► Task 3 (transit controller)
                        ──► Task 4 (lunar/solar/synastry controllers)

Phase 2 (Stub Pages):
  Task 2 ──────────────────► Task 5 (ChartCreatePage)
  Task 2 ──────────────────► Task 6 (ChartViewPage)
  Task 6 ──────────────────► Task 7 (AnalysisPage)
  Task 3 ──────────────────► Task 8 (TransitPage)
  (independent) ───────────► Task 9 (ProfilePage)

Phase 3 (Mount Routes):
  Task 10 (AI routes) ──── independent
  Task 11 (notifications) ─ independent
  Task 12 (migration) ──── independent

Phase 4 (Cleanup):
  Tasks 13-20 ──────────── all independent
```

## Parallelization Strategy

Tasks that can run simultaneously:
- **Batch A:** Tasks 1, 10, 11, 12, 9, 14, 15, 16, 17, 18, 19, 20 (all independent)
- **Batch B:** Tasks 2, 3, 4 (after Task 1)
- **Batch C:** Tasks 5, 6, 8 (after their Phase 1 dependency)
- **Batch D:** Task 7 (after Task 6)
- **Task 13** can run anytime

## Verification

After all tasks are complete:

1. **Backend tests:** `cd backend && npx jest` — all pass
2. **Frontend tests:** `cd frontend && npx vitest run` — all pass
3. **Type check:** `cd backend && npx tsc --noEmit && cd ../frontend && npx tsc --noEmit` — no errors
4. **Lint:** `npm run lint` — clean
5. **Manual smoke test:** Start dev environment (`npm run dev`), navigate to:
   - `/charts/new` → create a real chart → verify real planet positions
   - `/charts/:id` → view chart with ChartWheel
   - `/analysis/:id` → see real analysis data
   - `/transits` → see real transit data
   - `/profile` → see user profile with preferences
6. **E2E:** `cd frontend && npx playwright test` — all pass
7. **API check:** `curl http://localhost:3001/api/v1/ai/status` → returns 200 (previously 404)

## Files Modified (Summary)

| File | Tasks |
|------|-------|
| `backend/src/modules/shared/index.ts` | 1 |
| `backend/src/modules/charts/controllers/chart.controller.ts` | 2 |
| `backend/src/modules/transits/controllers/transit.controller.ts` | 3, 19 |
| `backend/src/modules/lunar/controllers/lunarReturn.controller.ts` | 4 |
| `backend/src/modules/solar/controllers/solarReturn.controller.ts` | 4 |
| `backend/src/modules/synastry/controllers/synastry.controller.ts` | 4 |
| `frontend/src/pages/ChartCreatePage.tsx` | 5 |
| `frontend/src/pages/ChartViewPage.tsx` | 6 |
| `frontend/src/pages/AnalysisPage.tsx` | 7 |
| `frontend/src/pages/TransitPage.tsx` | 8 |
| `frontend/src/pages/ProfilePage.tsx` | 9 |
| `backend/src/api/v1/index.ts` | 10, 11 |
| `backend/migrations/*_create_shared_charts.ts` | 12 |
| `backend/src/modules/calendar/controllers/calendar.controller.ts` | 13 |
| `frontend/src/components/AppLayout.tsx` | 14 |
| `backend/src/config/index.ts`, `backend/knexfile.ts` | 15 |
| Various dead code files | 16 |
| `backend/src/middleware/errorHandler.ts`, auth.ts, controllers | 17 |
| `frontend/src/components/ErrorBoundary.tsx`, `frontend/src/App.tsx` | 18 |
| `.dockerignore` files | 20 |
