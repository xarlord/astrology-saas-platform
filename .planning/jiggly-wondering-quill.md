# Plan: E2E Console Audit — Catch & Fix All Browser Errors

## Context

Edge Tools is reporting 35+ accessibility/console errors and warnings across the frontend. Currently, NO e2e tests capture browser console output. We need a Playwright test structure that:
1. Navigates every route in the app
2. Captures all browser console errors, warnings, and unhandled exceptions
3. Reports each error with its source file and line number
4. Can be rerun after fixes until zero errors remain

## Files to Create

### 1. `frontend/e2e/fixtures/console-audit.fixture.ts` — Reusable fixture

Extends Playwright's base `test` with a `consoleMessages` collector. Uses factory pattern for composability with existing auth fixture.

**Key design:**
- `page.on('console')` captures all console messages (error, warning, log, info)
- `page.on('pageerror')` captures uncaught JS exceptions
- Configurable allowlist of regex patterns for known benign messages (e.g., `[HMR]`, `Service Worker registered:`)
- `assertNoConsoleErrors()` — fails test with detailed report if errors found
- `assertNoConsoleWarnings()` — same for warnings
- `afterEach` hook auto-asserts zero errors per test
- Each message stores: type, text, source URL, line number, page URL, timestamp

**Allowlist (known benign):**
- `/^\[HMR\]/` — Vite hot reload
- `/^Service Worker registered:/` — intentional log from App.tsx:44
- `/^App is (online|offline)/` — from serviceWorkerRegistration.ts

### 2. `frontend/e2e/helpers/console-helpers.ts` — Formatting utilities

- `formatConsoleReport(messages)` — human-readable error report with file:line references
- `filterAllowedMessages(messages, patterns)` — remove allowlisted messages
- `extractSourceLocation(location)` — parse Vite's `/@fs/` prefix to get relative project path

### 3. `frontend/e2e/00-console-audit.spec.ts` — The audit spec

Numbered `00-` to run first. Covers all 14 routes from `App.tsx`:

**Public routes (unauthenticated):**
| Path | Name |
|------|------|
| `/` | Home |
| `/login` | Login |
| `/register` | Register |

**Protected routes (authenticated via composed fixture):**
| Path | Name |
|------|------|
| `/dashboard` | Dashboard |
| `/charts/new` | Chart Create |
| `/transits` | Transit |
| `/profile` | Profile |
| `/synastry` | Synastry |
| `/solar-returns` | Solar Returns |
| `/calendar` | Calendar |
| `/lunar-returns` | Lunar Returns |

**Test structure:**
```
describe('Console Audit')
  describe('Public Routes')
    test('Home /') → navigate, wait networkidle + 2s, auto-assert
    test('Login /login') → same
    test('Register /register') → same
  describe('Protected Routes')
    test('Dashboard /dashboard') → with auth, navigate, wait, auto-assert
    test('Chart Create /charts/new') → same
    ... (one test per route)
  describe('Dynamic Interactions')
    test('Location search errors') → fill location input, simulate Nominatim failure
```

Each route gets its own test so failures are reported per-route.

### 4. `frontend/e2e/fixtures/console-audit-auth.fixture.ts` — Composed fixture

Composes console-audit fixture with auth fixture for protected route tests.

### 5. Modify `frontend/playwright.config.ts`

Add 2 new projects (Chromium only):
```typescript
{
  name: 'console-audit',
  use: { ...devices['Desktop Chrome'] },
  testMatch: /00-console-audit\.spec\.ts/,
},
{
  name: 'console-audit-authenticated',
  use: {
    ...devices['Desktop Chrome'],
    storageState: 'e2e/.auth/user.json',
  },
  dependencies: ['setup'],
  testMatch: /00-console-audit\.spec\.ts/,
},
```

## Execution Strategy

### Phase 1: Build the fixture + audit spec (files 1-5 above)
### Phase 2: Run audit, capture results
```bash
cd frontend && npx playwright test --project=console-audit,console-audit-authenticated
```
### Phase 3: Fix each error found, rerun until clean
### Phase 4: Verify — zero console errors on all routes

## Expected Error Sources (from code review)

| Source | Issue | Expected Fix |
|--------|-------|-------------|
| `App.tsx:41-49` | Duplicate SW registration (useEffect + ServiceWorkerUpdateBanner both register) | Remove useEffect block |
| `location.service.ts` | Unvalidated Nominatim fetch without try-catch | Add error handling |
| `lazyLoad.ts:15` | Caught import errors logged as console.error | Allowlist or fix dynamic imports |
| `SolarReturnsPage.tsx` | `as any` casts can produce runtime type errors | Define proper interfaces |
| Multiple services | Bare `console.error` calls in catch blocks | Route through error utility |

## Verification

1. `cd frontend && npx playwright test --project=console-audit` — all public routes pass
2. `cd frontend && npx playwright test --project=console-audit-authenticated` — all protected routes pass
3. Both projects report zero console errors and zero console warnings
4. HTML report shows green across all tests
