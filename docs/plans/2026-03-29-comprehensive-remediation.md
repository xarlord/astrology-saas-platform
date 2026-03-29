# Comprehensive Remediation Plan: Code Review + UI Overhaul

**Date:** 2026-03-29
**Scope:** 45 code review findings + 22 UI overhaul gaps = 67 total items
**Branch:** `feature/ui-overhaul`
**Status:** PLANNED — awaiting approval

---

## Execution Strategy

**Batch size:** 3 tasks per batch (per executing-plans skill)
**Commit:** After each task
**Verification:** Run full test suite after each batch
**Order:** Security first, then architecture, then UX polish

---

## Phase 1: Security & Correctness (CRITICAL)

### Task 1: Wire CSRF middleware globally
- **Problem:** CSRF middleware exists but is never applied to routes. All mutating endpoints unprotected.
- **Files:** `backend/src/server.ts`
- **Steps:**
  1. Import `{ csrfMiddleware }` from `'./middleware/csrf'`
  2. Add `csrfMiddleware` after `cookieParser()` in middleware stack
  3. CSRF already skips safe methods (GET/HEAD/OPTIONS) and test env
- **Verification:** `cd backend && npx jest` passes. Manual: POST without CSRF token returns 403.

### Task 2: Apply auth rate limiter to auth routes
- **Problem:** `authRateLimiter` defined but never used on login/register/refresh.
- **Files:** `backend/src/modules/auth/routes/auth.routes.ts`
- **Steps:**
  1. Import `authRateLimiter` from `'../../middleware/rateLimiter'` (adjust relative path)
  2. Apply to `/login`, `/register`, `/refresh` routes as middleware
- **Verification:** `cd backend && npx jest` passes.

### Task 3: Fix refresh token race condition
- **Problem:** New token created before old one revoked (no transaction). Route requires valid JWT (prevents refresh when expired).
- **Files:** `backend/src/modules/auth/controllers/auth.controller.ts`
- **Steps:**
  1. Import `db` from `'../../../db'`
  2. Wrap token rotation in `db.transaction(async (trx) => { ... })`
  3. Revoke old token first, then create new one
  4. In `auth.routes.ts`: create a separate `/refresh` route variant that does NOT require `authenticate` middleware — use a `refreshTokenAuth` middleware that validates only the refresh token body
- **Verification:** `cd backend && npx jest` passes.

### Task 4: Replace non-null assertions with AuthenticatedRequest type
- **Problem:** 38 occurrences of `req.user!.id` across 8 controllers — runtime crash if auth middleware missing.
- **Files:** `backend/src/middleware/auth.ts` + 8 controller files
- **Steps:**
  1. In `auth.ts`, define and export:
     ```ts
     export interface AuthenticatedRequest extends Request {
       user: { id: string; email: string };
     }
     ```
  2. In each controller, change `(req: Request, res: Response)` to `(req: AuthenticatedRequest, res: Response)` for authenticated handlers
  3. Remove all `!` non-null assertions on `req.user`
  4. Add a runtime guard `if (!req.user) throw new AppError(401, 'Unauthorized')` as safety net
- **Files to update:**
  - `backend/src/modules/analysis/controllers/analysis.controller.ts`
  - `backend/src/modules/calendar/controllers/calendar.controller.ts`
  - `backend/src/modules/auth/controllers/auth.controller.ts`
  - `backend/src/modules/charts/controllers/chart.controller.ts`
  - `backend/src/modules/transits/controllers/transit.controller.ts`
  - `backend/src/modules/users/controllers/user.controller.ts`
  - `backend/src/modules/notifications/controllers/pushNotification.controller.ts`
  - `backend/src/modules/ai/controllers/aiUsage.controller.ts`
- **Verification:** `cd backend && npx tsc --noEmit && npx jest` — 0 errors, 100% pass.

### Task 5: Replace raw `<a>` with React Router `<Link>`
- **Problem:** 4 `<a href>` tags in AuthenticationForms cause full page reloads.
- **Files:** `frontend/src/components/AuthenticationForms.tsx`
- **Steps:**
  1. Import `Link` from `'react-router-dom'`
  2. Replace `<a href="/forgot-password">` → `<Link to="/forgot-password">`
  3. Replace `<a href="/register">` → `<Link to="/register">`
  4. Replace `<a href="/login">` → `<Link to="/login">`
  5. Replace `<a href="/terms">` and `<a href="/privacy">` → `<Link to="/terms">` and `<Link to="/privacy">`
- **Verification:** `cd frontend && npx tsc --noEmit && npx vitest run` — 0 errors, 100% pass.

### Task 6: Consolidate JWT token storage
- **Problem:** Tokens stored in both Zustand persist AND direct localStorage — sync risk.
- **Files:** `frontend/src/store/authStore.ts`, `frontend/src/services/api.ts`, new `frontend/src/utils/tokenStorage.ts`
- **Steps:**
  1. Create `utils/tokenStorage.ts`:
     ```ts
     const TOKEN_KEYS = { access: 'accessToken', refresh: 'refreshToken' } as const;
     export const tokenStorage = {
       getAccessToken: () => localStorage.getItem(TOKEN_KEYS.access),
       getRefreshToken: () => localStorage.getItem(TOKEN_KEYS.refresh),
       setTokens: (access: string, refresh: string) => { ... },
       clearTokens: () => { ... },
     };
     ```
  2. Update `authStore.ts` to use `tokenStorage` instead of direct `localStorage` calls
  3. Update `api.ts` interceptor to use `tokenStorage.getAccessToken()` / `getRefreshToken()`
- **Verification:** `cd frontend && npx tsc --noEmit && npx vitest run` — 0 errors, 100% pass.

### Task 7: Fix API interceptor type safety
- **Problem:** Response interceptor uses unsafe type casts on error responses.
- **Files:** `frontend/src/services/api.ts`
- **Steps:**
  1. Import `axios` type guards: `axios.isAxiosError(error)`
  2. Replace unsafe casts with proper type narrowing
  3. Type the refresh response properly
- **Verification:** `cd frontend && npx tsc --noEmit` — 0 errors.

### Task 8: Strengthen password validation
- **Problem:** No special character requirement in password schema.
- **Files:** `backend/src/utils/validators.ts`
- **Steps:**
  1. Add `.pattern(new RegExp('(?=.*[!@#$%^&*()_+\\-=\\[\\]{};:\'"\\\\|,.<>\\/?])'))` to password schema
  2. Update error message to mention special character requirement
- **Verification:** `cd backend && npx jest --testPathPattern=validators` passes.

---

## Phase 2: Page Layout Migration to AppLayout

### Task 9: Migrate DashboardPage to AppLayout
- **Problem:** Page uses inline header/nav instead of shared AppLayout.
- **Files:** `frontend/src/pages/DashboardPage.tsx`
- **Steps:**
  1. Import `AppLayout` from `'../components/AppLayout'`
  2. Remove inline `<header>` and `<nav>`
  3. Wrap page content in `<AppLayout>`
  4. Move "New Chart", "Today's Transits" actions into AppLayout's nav slot or a page-level action bar
  5. Add error handling UI (missing)
- **Verification:** Page renders correctly, mobile nav works, `npx vitest run` passes.

### Task 10: Migrate ProfilePage to AppLayout
- **Files:** `frontend/src/pages/ProfilePage.tsx`
- **Steps:** Same pattern as Task 9 — remove inline header, wrap in AppLayout.

### Task 11: Migrate ChartViewPage to AppLayout
- **Files:** `frontend/src/pages/ChartViewPage.tsx`
- **Steps:** Same pattern.

### Task 12: Migrate AnalysisPage to AppLayout
- **Files:** `frontend/src/pages/AnalysisPage.tsx`
- **Steps:** Same pattern.

### Task 13: Migrate TransitPage to AppLayout
- **Files:** `frontend/src/pages/TransitPage.tsx`
- **Steps:** Same pattern.

### Task 14: Migrate ChartCreatePage to AppLayout
- **Files:** `frontend/src/pages/ChartCreatePage.tsx`
- **Steps:** Same pattern. Also add loading/error states (currently missing).

### Task 15: Migrate CalendarPage — CSS to Tailwind + AppLayout
- **Problem:** Uses standalone `CalendarPage.css`, no AppLayout.
- **Files:** `frontend/src/pages/CalendarPage.tsx`, delete `frontend/src/pages/CalendarPage.css`
- **Steps:**
  1. Convert all CSS classes to Tailwind utilities
  2. Remove `import './CalendarPage.css'`
  3. Wrap in AppLayout
  4. Add loading/empty/error states
- **Verification:** Visual parity with old design. Tests pass.

### Task 16: Migrate LunarReturnsPage — CSS to Tailwind + AppLayout
- **Files:** `frontend/src/pages/LunarReturnsPage.tsx`, delete `frontend/src/pages/LunarReturnsPage.css`
- **Steps:** Same pattern as Task 15.

### Task 17: Migrate SolarReturnsPage — CSS to Tailwind + AppLayout
- **Files:** `frontend/src/pages/SolarReturnsPage.tsx`, delete `frontend/src/pages/SolarReturnsPage.css`
- **Steps:** Same pattern as Task 15.

### Task 18: Migrate HomePage to AppLayout (optional)
- **Note:** HomePage is a marketing/landing page — may intentionally have its own layout. Only migrate if it makes sense for the app shell (sidebar, nav). If the landing page should be standalone, skip this task.
- **Decision:** Keep HomePage standalone with its own hero header (intentional for marketing).

---

## Phase 3: CSS-to-Tailwind Migration (Components)

### Task 19: Migrate SkeletonLoader.css to Tailwind
- **Files:** `frontend/src/components/SkeletonLoader.tsx`, delete `SkeletonLoader.css`
- **Note:** Animation keyframes may need to stay in `index.css` `@layer utilities` block.

### Task 20: Migrate EmptyState.css to Tailwind
- **Files:** `frontend/src/components/EmptyState.tsx`, delete `EmptyState.css`

### Task 21: Migrate TransitCalendar.css to Tailwind
- **Files:** `frontend/src/components/TransitCalendar.tsx`, delete `TransitCalendar.css`

### Task 22: Migrate ShareManagement.css to Tailwind
- **Files:** `frontend/src/components/ShareManagement.tsx`, delete `ShareManagement.css`

### Task 23: Migrate UsageMeter.css to Tailwind
- **Files:** `frontend/src/components/UsageMeter.tsx`, delete `UsageMeter.css`

### Task 24: Migrate AIInterpretationDisplay.css + AIInterpretationToggle.css
- **Files:** Both component files + delete both CSS files

### Task 25: Migrate BirthdaySharing.css
- **Files:** `frontend/src/components/BirthdaySharing.tsx`, delete `BirthdaySharing.css`

### Task 26: Migrate LunarReturn.css
- **Files:** `frontend/src/components/LunarReturnDashboard.tsx`, `LunarForecastView.tsx`, `LunarHistoryView.tsx`, delete `LunarReturn.css`

### Task 27: Migrate PushNotificationPermission.css
- **Files:** `frontend/src/components/PushNotificationPermission.tsx`, delete CSS

### Task 28: Migrate RelocationCalculator.css
- **Files:** `frontend/src/components/RelocationCalculator.tsx`, delete CSS

### Task 29: Migrate SynastryCalculator.css + SynastryPage.css
- **Files:** Both component files + delete both CSS files

### Task 30: Migrate SolarReturn*.css (3 files)
- **Files:** `SolarReturnChart.tsx`, `SolarReturnDashboard.tsx`, `SolarReturnInterpretation.tsx`, delete 3 CSS files

### Task 31: Migrate AstrologicalCalendar.css
- **Files:** `frontend/src/components/AstrologicalCalendar.tsx`, delete CSS

### Task 32: Clean up `frontend/src/styles/` directory
- **Problem:** 13 orphaned CSS files in `styles/` may be duplicates of component-level CSS.
- **Steps:** Check each file. If the component already has its own CSS import, remove the styles/ duplicate. If styles/ is the only source, migrate to Tailwind.

---

## Phase 4: Accessibility Gaps

### Task 33: Add ARIA to SynastryCalculator
- **Problem:** Zero ARIA attributes.
- **Steps:** Add `role`, `aria-label`, `aria-required` on form fields, `aria-live` regions for results.

### Task 34: Add ARIA to RelocationCalculator
- **Steps:** Same pattern as Task 33.

### Task 35: Add ARIA to SolarReturnDashboard + SolarReturnChart
- **Steps:** Add `aria-label` on sections, `aria-live` for loading states, `role="img"` on chart.

### Task 36: Add ARIA to BirthdaySharing
- **Steps:** Add form ARIA, `aria-live` for sharing status.

### Task 37: Add ARIA to AIInterpretationDisplay + AIInterpretationToggle
- **Steps:** `aria-live="polite"` for interpretation content, `aria-busy` during generation.

### Task 38: Enforce 44px touch targets on all interactive elements
- **Problem:** Most buttons use `py-2` (~36px). WCAG requires 44px minimum.
- **Steps:** Audit all buttons/links in components and pages. Change `py-2` to `py-2.5 min-h-[44px]` or `py-3`. Add `min-w-[44px] min-h-[44px]` to icon-only buttons.

---

## Phase 5: Backend Code Quality (IMPORTANT findings)

### Task 39: Replace console.log with logger in backend services
- **Files:** `backend/src/modules/shared/services/transitCache.service.ts` (6 instances), `chartSharing.service.ts` (1 instance)
- **Steps:** Import `logger` from `'../../../utils/logger'`. Replace `console.log/warn/error` with `logger.info/warn/error`.

### Task 40: Convert require() to import
- **Files:** `backend/src/middleware/auth.ts` (line 103: `const crypto = require('crypto')`)
- **Steps:** Replace with `import crypto from 'crypto'` at top of file.

### Task 41: Remove duplicate HouseCusp import
- **Files:** `backend/src/modules/solar/services/solarReturn.service.ts`
- **Steps:** Remove the duplicate `HouseCusp as HouseCuspType` import.

### Task 42: Add authentication to share stats endpoint
- **Files:** `backend/src/modules/charts/routes/share.routes.ts`
- **Steps:** Add `authenticate` middleware to `GET /:token/stats` route, or at minimum add rate limiting.

### Task 43: Fix isGenerating to cover all mutations
- **Files:** `frontend/src/hooks/useAIInterpretation.ts`
- **Steps:** Change `isGenerating: natalMutation.isPending` to `isGenerating: natalMutation.isPending || transitMutation.isPending || compatibilityMutation.isPending`.

### Task 44: Replace setTimeout hacks with React batching
- **Files:** `frontend/src/components/AuthenticationForms.tsx`
- **Steps:** Replace `setTimeout(fn, 0)` in blur handlers with `queueMicrotask()` or restructure to avoid timing dependency.

### Task 45: Fix eslint-disable directives — convert to targeted
- **Problem:** 173 file-level blanket suppressions hide real issues.
- **Approach:** Batch by component. For each file:
  1. Remove file-level `/* eslint-disable */`
  2. Add `// eslint-disable-next-line <specific-rule>` on offending lines
  3. Where possible, fix the underlying issue instead of suppressing
- **Priority files:** `BirthDataForm.tsx`, `BirthdaySharing.tsx` (suppress `prefer-nullish-coalescing` — fix by converting `||` to `??`)

---

## Phase 6: Minor Polish

### Task 46: Fix zodiac sign casing inconsistency
- **Problem:** Mixed `'Aries'` / `'aries'` makes comparisons fragile.
- **Steps:** Define canonical format (lowercase) in shared constant. Update all consumers.

### Task 47: Remove unused CSS files from styles/ directory
- **Prerequisite:** After Task 32 confirms which are orphans.

### Task 48: Remove dead validation branches
- **Files:** Joi schemas with unreachable alternatives.

### Task 49: Clean up dotenv duplication
- **Files:** Multiple entry points load dotenv independently.
- **Steps:** Load once at top of `server.ts`, remove redundant calls.

### Task 50: Add missing AbortController support
- **Files:** Frontend hooks with long-running queries.
- **Steps:** React Query handles cancellation — verify `queryClient.cancelQueries` is configured.

---

## Documentation Updates (After Each Phase)

After **Phase 1**:
- Update `CLAUDE.md` Known Gotchas: CSRF applied globally, AuthenticatedRequest type, tokenStorage utility
- Update `progress.md` with session entry

After **Phase 2**:
- Update `CLAUDE.md`: All pages use AppLayout (except HomePage, LoginPage, RegisterPage)
- Remove page-level CSS references from architecture docs

After **Phase 3**:
- Update `CLAUDE.md`: All components use Tailwind exclusively (animations in index.css @layer)
- Delete `frontend/src/styles/` if empty

After **Phase 4**:
- Update accessibility score in context-checkpoint.md
- Update CLAUDE.md: WCAG compliance target met

---

## Verification Protocol

After **each batch of 3 tasks**:
1. `cd backend && npx tsc --noEmit` — 0 errors
2. `cd frontend && npx tsc --noEmit` — 0 errors
3. `cd backend && npx jest` — 100% pass (671 tests)
4. `cd frontend && npx vitest run` — 100% pass (677 tests)
5. `npm run lint` — 0 errors
6. Visual check in browser for layout changes

---

## Task Summary

| Phase | Tasks | Items | Est. Lines Changed |
|-------|-------|-------|---------------------|
| Phase 1: Security | 1-8 | 8 CRITICAL | ~200 |
| Phase 2: Page Layout | 9-17 | 9 pages to migrate | ~500 |
| Phase 3: CSS Migration | 19-32 | 17 CSS files | ~800 |
| Phase 4: Accessibility | 33-38 | 6 components + touch targets | ~300 |
| Phase 5: Code Quality | 39-45 | 7 IMPORTANT items | ~150 |
| Phase 6: Minor Polish | 46-50 | 5 MINOR items | ~100 |
| **Total** | **50 tasks** | | **~2050 lines** |

## Recommended Execution Order

Start with Phase 1 (security) — these are non-negotiable. Then Phase 2 (pages) and Phase 3 (CSS) can be parallelized since they're independent. Phase 4 (accessibility) depends on Phase 3 completing. Phase 5 and 6 can be interleaved.
