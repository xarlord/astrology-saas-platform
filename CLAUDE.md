# AstroVerse UI Overhaul

Astrology SaaS platform — natal charts, personality analysis, forecasting, PWA. Monorepo via npm workspaces.

## Tech Stack
- Backend: Express 4 + TypeScript 5 (ES2022/NodeNext) + Knex + PostgreSQL 15
- Frontend: React 18 + Vite 5 + Tailwind 3 + Zustand + React Query + D3
- Shared packages: @astrology-saas/shared-types, shared-utils, shared-constants
- Testing: Jest (backend), Vitest (frontend), Playwright (E2E)

## Commands

### Development
- `npm run dev` — start both backend + frontend concurrently
- `cd backend && npm run dev` — backend only (tsx watch, port 3001)
- `cd frontend && npm run dev` — frontend only (vite, port 5173)

### Testing
- `cd backend && npx jest` — all backend tests
- `cd backend && npx jest --testPathPattern=pattern` — specific suite
- `cd frontend && npx vitest run` — all frontend tests
- `cd frontend && npx playwright test` — E2E tests
- `cd frontend && npx playwright test --headed` — E2E with browser

### Database (from backend/)
- `npx knex migrate:latest` — run migrations
- `npx knex migrate:rollback` — rollback last batch
- `npx knex seed:run` — run seeders
- `npm run db:reset` — rollback + migrate + seed

### Build & Quality
- `npm run build` — build both workspaces
- `npm run lint` — lint all workspaces
- `cd backend && npx tsc --noEmit` — type check backend
- `cd frontend && npx tsc --noEmit` — type check frontend

## Architecture
```
backend/src/
  api/v1/, v2/           # Versioned route definitions
  middleware/             # auth, csrf, errorHandler, rateLimiter, requestLogger
  modules/{domain}/      # Feature modules: auth, charts, users, calendar, etc.
    controllers/         # Standalone exported functions: (req, res) => void
    models/              # Domain-specific DB models
    routes/              # Domain route definitions: export { router as XRoutes }
    services/            # Domain-specific business logic
  shared/services/       # Cross-cutting: swissEphemeris, natalChart, astronomyEngine
  __tests__/             # Unit tests by type: controllers/, middleware/, services/
frontend/src/
  components/            # React components (barrel index.ts per directory)
  pages/                 # Route-level page components
  hooks/                 # Custom React hooks
  services/              # API client services (axios-based, import api from shared client)
  store/                 # Zustand state management
  types/                 # Centralized type definitions (chart, synastry, lunar, calendar)
  utils/                 # Shared utilities (errorHandling, etc.)
```

## Import Conventions
- **Controllers**: Import directly from `modules/{domain}/controllers/` — NO proxy barrel layer
- **Services**: Import directly from `modules/{domain}/services/` or `modules/shared/services/` — NO proxy barrel layer
- **Models**: Barrel at `models/index.ts` re-exports from modules (convenience only)
- **Frontend types**: Import from `types/` for shared types; keep component-specific props co-located
- **Frontend API**: Always use `import api from '../services/api'` — never raw `axios`

## Code Conventions
- Controllers: standalone `export async function(req: Request, res: Response)`, NOT class methods
- Route exports: `export { router as XRoutes }` — named exports only, no default exports
- Barrel files: every directory has index.ts re-exporting public API
- Error handling: throw AppError in controllers, caught by global errorHandler
- Response format: `{ success: true, data: {...} }` or `{ success: false, error: "..." }`
- Path aliases: `@/*` maps to `src/*` in both backend and frontend
- Frontend extra aliases: @components, @pages, @services, @hooks, @stores, @utils

## Known Gotchas
- CSRF middleware applied globally in server.ts — individual routes do not apply it
- Rate limiter skips auth endpoints (/csrf-token, /auth/login, /auth/register, etc.)
- CSRF is auto-skipped in test env unless TEST_CSRF env var is set
- All authenticated controllers use `AuthenticatedRequest` type from `middleware/auth.ts`
- Frontend navigation uses `<Link>` or `useNavigate()` — never raw `<a href>`
- Token storage managed through `tokenStorage` utility — never access localStorage directly for auth tokens
- Backend test setup globally mocks console.* and Winston logger
- Config module reads env at import time — set env vars before importing (dotenv loaded in config/index.ts)
- Swiss Ephemeris is mocked in tests (real ephemeris requires .se1 data files)
- Backend uses `require.main === module` guard to prevent server start in tests
- Docker PostgreSQL runs on port 5434 (not default 5432)
- Controllers take (req, res) only — no next parameter
- Context auto-compacts at 80% (set in .claude/settings.json)
- Live tests (`src/__tests__/live/`) excluded from default Jest run (require running server)
- Shared packages must be rebuilt before backend/frontend after changes: `cd packages/shared-types && npm run build`
- MCP servers (Playwright, context7) configured in .mcp.json — use `/mcp` to check status
- No `console.log` in backend production code — use `logger` from `utils/logger`
- No `require()` in backend source — use `import` per ES2022/NodeNext
- Rate limiters from `middleware/rateLimiter.ts` applied to their respective routes

## CI/CD Pipeline

### Workflows
- **ci.yml** — Main pipeline: backend-test, frontend-test, live-tests, e2e-tests, visual-tests, bdd-tests, accessibility-tests, integration-tests, verify-build
- **mutation.yml** — Mutation testing (Stryker) for backend and frontend
- **visual-tests.yml** — Standalone visual regression with Playwright screenshot comparison
- **deploy.yml** — Production deployment

### What Works (PASS)
- **backend-test**: lint + typecheck + 1375 Jest tests + coverage upload — PASS
- **frontend-test**: lint + typecheck + 4493 Vitest tests + coverage upload — PASS
- **mutation-backend/frontend/summary**: Stryker mutation testing — PASS
- **CI infrastructure**: npm ci, cache paths, knex migration, backend server startup, Playwright install, build — ALL PASS

### What Needs Work (FAIL — not infrastructure)
- **live-tests**: 114/123 pass. 9 assertion failures — pre-existing test bugs (wrong expected HTTP status codes). Infrastructure (DB, server, migration) works fine.
- **integration-tests**: "No tests found" — `npx playwright test --grep @integration` finds zero tests tagged with `@integration`. Need to either add the tag to existing tests or create integration-tagged tests.
- **bdd-tests**: 59 Playwright BDD failures across 5 browser configs (chromium, firefox, webkit, mobile, tablet). Failures include: validation error checks, error page checks, calendar event visibility. These are real functional test failures, not infrastructure.
- **accessibility-tests**: Real WCAG 2.1 AA violations in the UI (color contrast, ARIA labels, keyboard nav). Not infrastructure.
- **visual-tests**: 165 failures — no baseline snapshots exist in repo + `ReferenceError: __dirname is not defined` in ESM context. Need to: (1) generate initial baseline snapshots, (2) fix `__dirname` usage in visual test config.
- **e2e-tests**: SKIPPED because it depends on live-tests (which fails).
- **verify-build**: SKIPPED — only runs on master/main branch.

### CI Infrastructure Notes (Gotchas)
- **npm workspace monorepo**: Only root `package-lock.json` exists. All CI jobs must use `cache-dependency-path: package-lock.json` (NOT `frontend/package-lock.json`). Jobs with `defaults: run: working-directory: frontend` must override `npm ci` with `working-directory: .` to install from root.
- **TypeScript knexfile**: `npx knex migrate:latest` fails because knex can't load `.ts` files. Use `npx tsx ../node_modules/knex/bin/cli.js migrate:latest` (tsx is a dev dependency; knex is hoisted to root `node_modules/`).
- **Env var naming**: The knexfile reads `DATABASE_*` (not `DB_*`). CI env vars must use `DATABASE_PASSWORD`, `DATABASE_HOST`, etc.
- **Missing optional deps**: `cookie-parser`, `ioredis`, `bullmq`, `stripe`, `replicate`, `resend`, `swagger-jsdoc` are declared in backend's package.json. They may not have type declarations available in CI — services gracefully handle connection/import failures at runtime.
- **Shared package.json format**: Write tool can inject line-number artifacts (e.g., `5  "types"` instead of `  "types"`). Always verify JSON is valid after editing with Write tool — `npm ci` will fail with EJSONPARSE on malformed JSON.
- **Shared packages build**: `@astrology-saas/shared-types` and `shared-utils` have no-op build scripts (`echo 'No build step needed'`). They're consumed as raw `.ts`. Don't remove these scripts or `npm run build --workspaces` fails.
- **Jest test:live script**: Must include `--testPathIgnorePatterns=[]` to override the default ignore patterns that exclude `live/` and `*.live.test.ts`.
- **Live test fixtures**: `birth_time` must use `HH:MM` format (not `HH:MM:SS`) — the API validates this with regex.
- **Jest virtual mocks**: `setup.ts` uses `{ virtual: true }` for modules not installed in CI test env (ioredis, bullmq, replicate, stripe, resend, swagger-jsdoc). Without this, Jest can't resolve them.
- **Mock hoisting**: `jest.mock()` factory functions are hoisted above `const` declarations. Never reference module-level variables inside mock factories — use `_mockInstance` pattern or define variables inside the factory.
- **Coverage thresholds**: Adjusted to match actual coverage (branches: 58%, functions: 65%, lines: 73%, statements: 72%). Don't raise without verifying coverage first.
- **Solar return controller**: Exports a class instance (`export default new SolarReturnController()`), not standalone functions. Tests must import the default and destructure methods.
- **ESLint strict mode**: `--report-unused-disable-directives --max-warnings 0` means unused `/* eslint-disable */` blocks cause CI failure. Only disable specific rules where needed.
- **Integration test backend**: integration-tests job now starts the backend server before running Playwright. Required env vars: `DATABASE_*`, `REDIS_URL`, `JWT_SECRET`, `RATE_LIMIT_MAX_REQUESTS`.

## Code Review Remediation
- Plan: `docs/plans/2026-03-29-code-review-remediation.md` — 45 findings (8 CRITICAL, 19 IMPORTANT, 18 MINOR)
- Status: Sprints 1-3 COMPLETE — 43/45 resolved, 2 remaining (M1: index keys cosmetic, M3: AbortController low risk)
- Sprint 1 (CRITICAL): All 8 items resolved — CSRF wiring, auth rate limiter, refresh token transaction, AuthenticatedRequest type, `<Link>` migration, token storage, interceptor safety, password validation
- Sprint 2 (IMPORTANT): All 19 items resolved — isGenerating fix, duplicate imports, require→import, console→logger, share stats auth, setTimeout removal, eslint cleanup
- Sprint 3 (MINOR): 16/18 resolved — dotenv dedup, timezone Intl API, dead code clean
- Remaining: M1 (array index keys in 60+ list renders), M3 (no AbortController — React Query handles internally)

## Slash Commands
- `/run-tests` — run backend tests
- `/run-e2e` — run Playwright E2E tests
- `/run-frontend-tests` — run Vitest frontend tests
- `/qa-full` — comprehensive QA (lint + type check + test)
- `/fix-tests` — diagnose and fix failing tests
- `/dev` — start development environment
- `/db-migrate` — database management
- `/refactor-audit [domain]` — audit a code domain for refactoring issues
- `/refactor-execute [report]` — execute refactoring from an audit report
