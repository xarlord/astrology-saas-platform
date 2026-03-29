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
