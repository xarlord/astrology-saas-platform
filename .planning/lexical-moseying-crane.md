# QA Remediation Plan: Warnings, Mocks, Skipped Tests & Missing Packages

## Context
Full QA pass achieved 0 errors but left 344 warnings, 9 skipped tests, hand-written type declarations for missing packages, and a mocked astronomy-engine. This plan resolves all 5 user requests: eliminate warnings, install real packages, fix skipped tests, resolve luxon issues, and replace the astronomy-engine mock with the real npm package.

---

## Phase 1: Install Real Packages & Remove Stubs

**Goal**: Install all missing npm packages and delete hand-written type declarations.

1. Install in `backend/`:
   - `npm install astronomy-engine luxon puppeteer`
   - `npm install -D @types/luxon @types/puppeteer`
2. Run `npm install` in `frontend/` (luxon + @types/luxon already in package.json)
3. Delete hand-written type declarations:
   - `backend/src/types/astronomy-engine.d.ts`
   - `backend/src/types/luxon.d.ts`
   - `backend/src/types/puppeteer.d.ts`
4. Verify: `cd backend && npx tsc --noEmit` passes with real packages

**Files**: `backend/package.json`, `frontend/package.json`, 3 `.d.ts` files to delete

---

## Phase 2: Replace Astronomy-Engine Mock with Real Package

**Goal**: Remove the manual mock so tests use real astronomical calculations.

1. Delete `backend/src/__mocks__/astronomy-engine.ts`
2. Update `backend/src/__tests__/services/astronomyEngine.service.test.ts`:
   - Replace `positions.get('Sun')!` non-null assertions with proper Map handling (6 instances)
   - Adjust test expectations to match real astronomical data (positions will differ from mock values)
   - The service code in `astronomyEngine.service.ts` uses `astronomy.Body.Sun` etc. — works with real package's numeric enum
3. Verify: `cd backend && npx jest --testPathPattern=astronomyEngine` passes with real calculations
4. Run `cd backend && npx jest --testPathPattern=lunarReturn` to confirm lunar return tests still pass

**Files**: `backend/src/__mocks__/astronomy-engine.ts` (delete), `backend/src/__tests__/services/astronomyEngine.service.test.ts`

---

## Phase 3: Fix 330 `no-explicit-any` Warnings

**Goal**: Replace every `any` type with proper TypeScript types across 71 files.

**Strategy**: Process files by warning count (highest first). Group by module for consistency.

### High-impact files (>10 warnings each):
| File | Count | Approach |
|------|-------|----------|
| `modules/analysis/controllers/analysis.controller.ts` | 29 | Define `CalculatedPlanetData`, `CalculatedHouseData` interfaces |
| `__tests__/models/user.model.test.ts` | 18 | Type mock objects and test data |
| `__tests__/controllers/synastry.controller.test.ts` | 15 | Type mock request/response objects |
| `modules/ai/services/aiInterpretation.service.ts` | 14 | Define `InterpretationResult`, `AIResponse` interfaces |
| `modules/ai/services/openai.service.ts` | 13 | Type cache, error handling, response parsing |
| `modules/charts/controllers/chart.controller.ts` | 13 | Type chart calculation results |
| `__tests__/models/chart.model.test.ts` | 15 | Type mock data |
| `modules/synastry/controllers/synastry.controller.ts` | 15 | Type synastry calculation inputs/outputs |

### Remaining files (1-9 warnings each):
- `modules/users/controllers/user.controller.ts` — type req.body/user params
- `modules/auth/controllers/auth.controller.ts` — type refresh token flow
- `middleware/csrf.ts` — type CSRF token response
- `modules/calendar/controllers/calendar.controller.ts` — type calendar event data
- `modules/shared/services/chartSharing.service.ts` — type share data
- `modules/shared/services/pdfGeneration.service.ts` — type Puppeteer page ops
- `modules/lunar/services/lunarReturn.service.ts` — type forecast data
- `modules/charts/services/chart.service.ts` — type chart data
- `modules/shared/services/natalChart.service.ts` — type natal chart calculations
- Test files (~40 files) — type mock objects, jest.fn() args, test data

### Reusable patterns:
- `catch (error: any)` → `catch (error: unknown)` with `error instanceof Error` guard
- `(req as any).user` → use `AuthenticatedRequest` from `middleware/auth.ts`
- `Record<string, unknown>` for generic objects
- Define inline interfaces for API response shapes

**Files**: ~71 files across `backend/src/`

---

## Phase 4: Fix 15 `no-non-null-assertion` Warnings

**Goal**: Replace `!` non-null assertions with proper null checks.

Files to fix:
1. `backend/src/__tests__/services/astronomyEngine.service.test.ts` — 6 instances of `positions.get('X')!`
   - Fix: `const pos = positions.get('Sun'); expect(pos).toBeDefined(); if (!pos) return;`
2. `backend/src/__tests__/services/natalChart.service.test.ts` — use `.toBeDefined()` + guard
3. `backend/src/__tests__/services/synastry.service.test.ts` — same pattern
4. `backend/src/modules/shared/services/pdfGeneration.service.ts` — null check browser/page

**Files**: 4 files

---

## Phase 5: Fix Skipped Tests

**Goal**: Enable all 9 skipped tests and make them pass.

1. **7 OpenAI tests** in `backend/src/__tests__/ai/openai.service.test.ts`:
   - Change `it.skip(` → `it(` on all 7 tests
   - Verify existing mocks at lines 36-53 are sufficient
2. **1 TTL cache test** in `backend/src/__tests__/ai/aiCache.service.test.ts`:
   - Remove `afterEach` cleanup (redundant; `beforeEach` already truncates)
   - This prevents premature table cleanup before TTL check completes
3. **1 debug suite** in `backend/src/__tests__/ai/openai.debug.test.ts`:
   - Delete the entire file (debug utility, not needed for production tests)

**Files**: `openai.service.test.ts`, `aiCache.service.test.ts`, `openai.debug.test.ts` (delete)

---

## Phase 6: Fix Frontend Luxon & Eslint-Disable Issues

**Goal**: Remove all eslint-disable comments and use proper types.

1. `frontend/src/services/timezone.service.ts`:
   - Remove 5 file-level `eslint-disable` comments for `no-unsafe-*` rules
   - Replace `Info.listZones()` (removed in Luxon 3.x) with `Intl.supportedValuesOf?.('timeZone')`
   - Add proper type annotations now that `@types/luxon` is installed
2. `frontend/src/pages/AnalysisPage.tsx`:
   - Remove 3 file-level `eslint-disable` comments for `no-unsafe-*` rules
   - Add proper types for analysis data mapping (lines 100-125)

**Files**: `frontend/src/services/timezone.service.ts`, `frontend/src/pages/AnalysisPage.tsx`

---

## Phase 7: Full QA Verification

**Goal**: Confirm 0 errors, 0 warnings, 0 skipped tests.

1. `cd backend && npx eslint src --ext .ts` — expect 0 warnings, 0 errors
2. `cd backend && npx tsc --noEmit` — expect 0 errors
3. `cd backend && npx jest --coverage` — expect all tests pass, 0 skipped
4. `cd frontend && npx eslint . --ext ts,tsx` — expect 0 warnings
5. `cd frontend && npx tsc --noEmit` — expect 0 errors
6. `cd frontend && npx vitest run` — expect all tests pass

---

## Execution Order

Phases 1-2 are sequential (must install packages before removing mock).
Phase 3 (any warnings) is the largest — can be split into batches per module.
Phases 4-6 can run in any order after Phase 1.
Phase 7 runs last.

**Estimated scope**: ~75 files modified, 5 files deleted, 4 packages installed
