# AstroVerse Wiki

> Technical reference for the AstroVerse astrology SaaS platform.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Monorepo Structure](#3-monorepo-structure)
4. [Backend Architecture](#4-backend-architecture)
5. [Frontend Architecture](#5-frontend-architecture)
6. [Design Decisions](#6-design-decisions)
7. [API Reference](#7-api-reference)
8. [Database Schema](#8-database-schema)
9. [Auth & Security](#9-auth--security)
10. [State Management](#10-state-management)
11. [Testing](#11-testing)
12. [CI/CD](#12-cicd)
13. [Known Gotchas](#13-known-gotchas)
14. [Quick Commands](#14-quick-commands)

---

## 1. Project Overview

Astrology SaaS platform. Features: natal chart generation, personality analysis, transit forecasting, synastry/compatibility, solar/lunar returns, astrological calendar, PWA support.

**Data flow:**
```
Browser (React SPA) → Vite dev proxy → Express API (:3001) → PostgreSQL (:5434)
                                         ↕
                                    Redis (prod only)
```

---

## 2. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Backend runtime | Node.js + Express | Express 4 |
| Backend language | TypeScript (ES2022/NodeNext) | TS 5 |
| Database | PostgreSQL via Knex | PG 15, Knex query builder |
| Frontend framework | React + Vite | React 18, Vite 5 |
| CSS | Tailwind | v3 |
| State | Zustand + React Query | — |
| Charts/viz | D3 + Recharts | — |
| Ephemeral calc | astronomy-engine | Real npm package |
| AI | OpenAI API | GPT-4 |
| Auth | JWT + CSRF (csrf-csrf) | HS256 tokens |
| Testing | Jest (backend), Vitest (frontend), Playwright (E2E) | — |
| PWA | vite-plugin-pwa (Workbox) | injectManifest strategy |

---

## 3. Monorepo Structure

```
AstroVerse-UI-Overhaul/
├── packages/            # Shared: shared-types, shared-utils, shared-constants
├── backend/             # Express API (port 3001)
│   ├── src/
│   │   ├── api/v1/, v2/           # Versioned route definitions
│   │   ├── middleware/             # auth, csrf, errorHandler, rateLimiter, requestLogger
│   │   ├── modules/{domain}/      # Feature modules (11 domains)
│   │   │   ├── controllers/       # Standalone exported functions
│   │   │   ├── models/            # Domain DB models (Knex)
│   │   │   ├── routes/            # export { router as XRoutes }
│   │   │   └── services/          # Business logic
│   │   ├── shared/services/       # Cross-cutting: swissEphemeris, natalChart, astronomyEngine
│   │   └── __tests__/             # Unit tests by type
│   └── migrations/                # Knex migrations (19 files)
├── frontend/            # React SPA (port 3000 dev, 5173 alt)
│   └── src/
│       ├── components/            # React components (barrel index.ts per dir)
│       ├── pages/                 # Route-level page components (24 pages)
│       ├── hooks/                 # Custom React hooks
│       ├── services/              # Axios API client services
│       ├── store/                 # Zustand stores (auth, charts)
│       ├── types/                 # Centralized type definitions
│       ├── utils/                 # Utilities (errorHandling, etc.)
│       └── data/                  # Static data (staticPages, etc.)
├── .github/workflows/   # CI/CD
└── docs/                # Plans, specs, archive
```

**Workspace config:** npm workspaces in root `package.json`.

---

## 4. Backend Architecture

### Module Pattern

11 domain modules under `backend/src/modules/`:

| Module | Purpose | Key Models |
|--------|---------|------------|
| `auth` | Registration, login, JWT refresh | refresh_tokens |
| `users` | Profile CRUD, preferences | users |
| `charts` | Chart CRUD, calculation, sharing | charts, shared_charts |
| `analysis` | Personality, aspects, houses analysis | — (uses charts) |
| `transits` | Today, forecast, calendar | transit_readings |
| `calendar` | Events, reminders | calendar_events, user_reminders |
| `synastry` | Compatibility, reports | synastry_reports |
| `solar` | Solar return calculations | solar_returns, solar_return_settings |
| `lunar` | Lunar return forecasts | lunar_returns, monthly_forecasts |
| `ai` | AI interpretations, caching, usage | ai_cache, ai_usage |
| `notifications` | Push notifications | push_subscriptions |

**Shared module:** `shared/services/` — swissEphemeris, natalChart, astronomyEngine, chartSharing, pdfGeneration, securityLogging
**Shared routes:** `shared/routes/` — timezone, location

### Controller Convention

```typescript
// Standalone async functions, NOT class methods
export async function createChart(req: Request, res: Response): Promise<void> {
  // throw AppError on error → caught by global errorHandler
  // Response: res.status(201).json({ success: true, data: {...} })
}
```

### Import Rules

| Import from | Rule |
|-------------|------|
| Controllers | Direct: `modules/{domain}/controllers/file` |
| Services | Direct: `modules/{domain}/services/file` or `shared/services/file` |
| Models | Barrel: `models/index.ts` re-exports from modules |
| Frontend API | Always via `import api from '../services/api'` — never raw axios |

---

## 5. Frontend Architecture

### Routing (React Router v6)

Defined in `frontend/src/App.tsx`. 36 routes total:

| Category | Routes | Pattern |
|----------|--------|---------|
| Public | `/`, `/login`, `/register` | No AppLayout |
| Protected | 22 feature pages | `<AppLayout>` + `<ProtectedRoute>` wrapper |
| Redirects | `/charts` → `/dashboard`, `/charts/natal` → `/charts/new`, `/compatibility` → `/synastry` | `<Navigate>` |
| Static | 11 footer pages (`/about`, `/privacy`, etc.) | `<StaticPage pageKey="...">` |
| 404 | `*` catch-all | Inline "Page not found" |

### Layout Structure

`AppLayout.tsx` (570 lines) provides:
- **Sidebar**: Navigation groups (Quick Actions, My Charts, Tools)
- **TopNav**: User menu with dropdown
- **MobileBottomNav**: 4-item bottom nav
- **Footer**: Links to static pages

### Component Patterns

| Pattern | Example | Description |
|---------|---------|-------------|
| Simple wrapper | `CalendarPage`, `MoonCalendarPage` | `<AppLayout>` + heading + component |
| Data-fetching | `TransitPage`, `TodayTransitsPage` | `<AppLayout>` + React Query hooks + loading/error/empty states |
| Chart check | `SynastryPage` | Load charts first, show empty state if none |
| Multi-view | `SolarReturnsPage`, `LunarReturnsPage` | ViewMode state machine with tab navigation |

### Key Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `TransitDashboard` | `components/TransitDashboard.tsx` | 4 view modes: today, week, calendar, highlights |
| `TransitCalendar` | `components/TransitCalendar.tsx` | Calendar with retrograde indicators |
| `AstrologicalCalendar` | `components/AstrologicalCalendar.tsx` | Monthly calendar with moon phases |
| `SynastryCalculator` | `components/SynastryCalculator.tsx` | Chart selection + tabbed results |
| `ChartWheel` | `components/ChartWheel.tsx` | D3 natal chart visualization |
| `UsageMeter` | `components/UsageMeter.tsx` | Tier-based usage bar |

---

## 6. Design Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Monorepo via npm workspaces | Single repo, shared packages | Code sharing without publishing; unified CI |
| Standalone controller functions | Not class methods | Simpler testing, no `this` binding issues, direct import |
| Zustand over Redux | Lightweight, minimal boilerplate | Only 2 stores needed (auth, charts); Redux overhead not justified |
| React Query for server state | Separate from Zustand | Caching, refetching, loading states built-in; Zustand for client state only |
| CSRF via csrf-csrf (double) | Cookie + header validation | Prevents CSRF without server-side sessions; strict sameSite cookies |
| JWT + refresh token pattern | Short-lived access (1h) + long-lived refresh (7d) | Balance security and UX; refresh tokens stored in DB for revocation |
| Knex over ORM (Prisma/TypeORM) | Query builder, not full ORM | Full SQL control, migration flexibility, no abstraction leak |
| astronomy-engine (real) + Swiss Ephemeris (mock) | Real calc in prod, mock in tests | Accurate planetary positions; .se1 data files not needed for tests |
| AppError hierarchy | `AppError` → `AuthenticationError`, etc. | Structured error responses via global errorHandler middleware |
| Barrel files (index.ts) | Every directory re-exports public API | Clean imports; BUT controllers/services import direct (no proxy) |
| Tailwind CSS | Utility-first | Rapid prototyping, dark mode support via `dark:` prefix |
| PWA with injectManifest | Custom service worker | Full control over caching strategy; disabled in dev |
| Rate limiters (specialized) | Separate limiters per domain | Auth, PDF, share, chart, password-reset each have own limits |
| Port 5434 for PostgreSQL | Not default 5432 | Avoid conflict with local PG installations |
| Soft deletes | `deleted_at` column on users, charts | Data recovery; audit trail |

---

## 7. API Reference

**Base URL:** `/api/v1/` (also `/api/` as default fallback)
**Auth:** Bearer token in `Authorization` header for authenticated routes.
**CSRF:** `X-CSRF-Token` header + `x-csrf-token` cookie for mutation requests.

### Public Endpoints (16)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/health` | Server health |
| GET | `/api/v1/csrf-token` | Get CSRF token + cookie |
| GET | `/api/v1/health` | App health |
| GET | `/api/v1/health/db` | Database connectivity |
| POST | `/api/v1/auth/register` | Register (rate-limited) |
| POST | `/api/v1/auth/login` | Login (rate-limited) |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| GET | `/api/v1/share/:token` | View shared chart (public) |
| GET | `/api/v1/timezone/search` | Search timezones |
| GET | `/api/v1/timezone/common` | Common timezones |
| GET | `/api/v1/timezone/detect` | Detect from lat/lng |
| POST | `/api/v1/timezone/convert` | Convert time |
| GET | `/api/v1/timezone/:tz` | Timezone info |
| GET | `/api/v1/timezone/:tz/dst` | DST info |
| GET | `/api/v1/location/autocomplete` | Place search |
| GET | `/api/v1/location/details/:id` | Place details |
| GET | `/api/v1/ai/status` | AI service status |
| GET | `/api/v1/notifications/vapid-key` | Push public key |

### Authenticated Endpoints (55)

**Auth:** `POST /logout`, `GET/PUT /me`, `POST /forgot-password` (501), `POST /reset-password` (501)

**Users:** `GET/PUT/DELETE /users/me`, `GET /users/me/charts`, `GET/PUT /users/me/preferences`

**Charts:** `POST/GET /charts`, `GET/PUT/DELETE /charts/:id`, `POST /charts/:id/calculate`

**Share:** `GET /share/:token/stats` (owner only)

**Analysis:** `GET /analysis/:chartId[/aspects|/patterns|/planets|/houses]`

**Transits:** `POST /transits/calculate`, `GET /transits/today|/calendar|/forecast|/:id`

**Calendar:** `GET /calendar/month/:year/:month`, `POST/DELETE /calendar/events[/:id]`

**Lunar Returns:** `GET /lunar-return/next|/history`, `POST /lunar-return/chart|/forecast|/calculate`, `DELETE /lunar-return/:id`

**Synastry:** `POST /synastry/compare|/compatibility`, `GET/PATCH/DELETE /synastry/reports[/:id]`

**Solar Returns:** `POST /solar-returns/calculate|/:id/recalculate`, `GET /solar-returns/year/:year|/history|/stats|/years/available|/:id`, `DELETE /solar-returns/:id`

**AI:** `POST /ai/natal|/transit|/compatibility|/lunar-return|/solar-return|/cache/clear`, `GET /ai/usage[/stats|/history|/daily|/range|/limit|/pricing]`, `POST /ai/usage/estimate`

**Notifications:** `POST/DELETE /notifications/subscribe[/:id]`, `GET /notifications/subscriptions`, `POST /notifications/test`

**Response format:** `{ success: true, data: {...} }` or `{ success: false, error: "..." }`

---

## 8. Database Schema

**Connection:** PostgreSQL 15, `localhost:5434`, database `astrology_saas`
**Migrations:** `backend/migrations/` (19 files)
**Pool:** min 2, max 10 connections

### Entity-Relationship Summary

```
users ─┬── refresh_tokens (1:N, CASCADE)
       ├── charts (1:N, CASCADE) ──┬── transit_readings (1:N, CASCADE)
       │                           ├── solar_returns (1:N, CASCADE)
       │                           ├── lunar_returns (1:N, CASCADE)
       │                           ├── synastry_reports (1:N, via chart1/chart2)
       │                           └── shared_charts (1:N, CASCADE)
       ├── audit_log (1:N, SET NULL)
       ├── solar_return_settings (1:1, UNIQUE)
       ├── push_subscriptions (1:N, CASCADE)
       ├── ai_usage (1:N, CASCADE)
       ├── calendar_events (1:N, CASCADE)
       ├── user_reminders (1:N, CASCADE)
       ├── user_calendar_views (1:N, CASCADE)
       ├── lunar_returns (1:N, CASCADE) ── monthly_forecasts (1:N)
       ├── monthly_forecasts (1:N, CASCADE)
       ├── synastry_reports (1:N, CASCADE)
       └── shared_charts (1:N as creator, CASCADE)
```

### Tables (18)

| Table | Primary Purpose | Key Columns |
|-------|----------------|-------------|
| `users` | User accounts | email (unique), plan enum(free/premium/professional), soft delete |
| `refresh_tokens` | JWT refresh | token (unique), expires_at, revoked, FK→users |
| `charts` | Birth charts | birth_date/time/place, house_system enum, calculated_data jsonb, soft delete |
| `interpretations` | Cached text | type+key (unique), data jsonb |
| `transit_readings` | Transit data | user_id+chart_id, start/end date, transit_data jsonb |
| `audit_log` | Security audit | action, entity_type/id, ip, success, failure_reason |
| `user_calendar_views` | Calendar state | user_id+view_date, viewed_events jsonb |
| `solar_returns` | Solar returns | user_id+year+chart_id (unique), calculated_data jsonb |
| `solar_return_settings` | Solar prefs | user_id (unique 1:1), house_system, orb_type |
| `push_subscriptions` | Push notifs | endpoint (unique), keys jsonb {p256dh, auth} |
| `ai_cache` | AI response cache | cache_key (unique), data jsonb, expires_at |
| `ai_usage` | AI billing | type enum, tokens_used, cost |
| `calendar_events` | Astronomical events | event_type enum (15 types), event_date |
| `user_reminders` | Notification prefs | reminder_type enum, advance_notice_hours |
| `lunar_returns` | Lunar returns | return_date, moon_position/aspects/house jsonb |
| `monthly_forecasts` | Monthly forecasts | themes/opportunities/challenges jsonb, FK→lunar_returns |
| `synastry_reports` | Compatibility | overall_score, category_scores/synastry_aspects jsonb, share_id |
| `shared_charts` | Chart sharing | share_token (unique), password_hash, expires_at, access_count |

**All PKs:** UUID with `gen_random_uuid()` default.
**Soft deletes:** `users` and `charts` have `deleted_at` column.
**Timestamps:** All tables have `created_at`; most have `updated_at`.

---

## 9. Auth & Security

### JWT Flow

```
1. POST /auth/login → { accessToken, refreshToken }
2. Store: accessToken in tokenStorage (memory), refreshToken in httpOnly cookie
3. Request: Authorization: Bearer <accessToken>
4. Expired: POST /auth/refresh → new accessToken
5. Logout: POST /auth/logout → revoke refresh token in DB
```

**Token lifetimes:** Access 1h, Refresh 7d
**Algorithm:** HS256
**Secret:** `JWT_SECRET` env var (fallback: `dev-secret-do-not-use-in-production`)

### CSRF Protection

- **Library:** `csrf-csrf` (double CSRF pattern)
- **Cookie:** `x-csrf-token` (httpOnly, sameSite: strict)
- **Header:** `X-CSRF-Token` must match cookie value
- **Skipped:** GET, HEAD, OPTIONS methods
- **Test env:** Auto-skipped unless `TEST_CSRF` env var set
- **Flow:** Client calls `GET /csrf-token` → sets cookie + returns token → client sends token in header for mutations

### Middleware Stack (order matters)

```
helmet → cors → body-parser → cookieParser → csrfMiddleware → rateLimit → requestLogger → routes
```

### Rate Limiters

| Limiter | Window | Max | Applied to |
|---------|--------|-----|------------|
| Global | 15 min | 100 | All `/api/` routes (skips auth endpoints) |
| Auth | 15 min | 5 | `/auth/register`, `/auth/login`, `/auth/refresh` |
| PDF | — | — | PDF generation endpoints |
| Share | — | — | Chart sharing endpoints |
| Chart | — | — | Chart creation endpoints |
| Password reset | — | — | Password reset attempts |

### Error Handling

```typescript
// AppError hierarchy
class AppError extends Error { statusCode, isOperational }
class AuthenticationError extends AppError { statusCode: 401 }
class AuthorizationError extends AppError { statusCode: 403 }
class ValidationError extends AppError { statusCode: 400 }
class NotFoundError extends AppError { statusCode: 404 }
```

Global `errorHandler` middleware catches all AppError instances and formats response.

---

## 10. State Management

### Backend (Stateless)

Express is stateless. All state in PostgreSQL. Knex query builder for DB access.

### Frontend

**Zustand stores** (client state):

| Store | File | State |
|-------|------|-------|
| `useAuthStore` | `store/authStore.ts` | user, isAuthenticated, login/logout/register, persist middleware |
| `useChartsStore` | `store/chartsStore.ts` | charts, currentChart, pagination, CRUD operations |

**React Query** (server state):

| Hook | File | Cache key | Purpose |
|------|------|-----------|---------|
| `useTodayTransits` | `hooks/index.ts` | `['transits', 'today']` | Today's transits (refetch hourly) |
| `useTransitForecast` | `hooks/index.ts` | `['transits', 'forecast', duration]` | Week/month/quarter/year forecast |
| `useTransitCalendar` | `hooks/index.ts` | `['transits', 'calendar', month, year]` | Monthly transit calendar |
| `useChartAnalysis` | `hooks/index.ts` | `['analysis', chartId]` | Personality analysis |
| `useAspectsAnalysis` | `hooks/index.ts` | `['aspects', chartId]` | Aspect analysis |
| `useHousesAnalysis` | `hooks/index.ts` | `['houses', chartId]` | Houses analysis |
| `useCreateChart` | `hooks/index.ts` | Mutation (invalidates `['charts']`) | Create chart |
| `useCalculateChart` | `hooks/index.ts` | Mutation (invalidates chart+analysis) | Calculate chart |

**React Query defaults:** `refetchOnWindowFocus: false`, `retry: 1`, `staleTime: 5 min`

---

## 11. Testing

### Backend (Jest)

| Pattern | Detail |
|---------|--------|
| Framework | Jest + ts-jest, coverage threshold 70% |
| Setup | `backend/src/__tests__/setup.ts` — mocks console.*, Winston, sets test env |
| Test types | Unit (`controllers/`, `middleware/`, `services/`), Integration (`integration/`), Live (`live/`), Performance (`performance/`) |
| DB | Uses real PG on :5434 for integration tests |
| Ephemeris | Always mocked (Swiss Ephemeris requires .se1 files) |
| Auth | CSRF skipped in test env |
| Excluded from default run | `live/` (needs running server), `performance/` |
| Custom matchers | `toBeValidDate`, `toBeWithinRange`, `toBePlanetPosition` |
| Path alias | `@tests/*` → `src/__tests__/*` |

**Stats:** 37 suites, 663 tests

### Frontend (Vitest)

| Pattern | Detail |
|---------|--------|
| Framework | Vitest + jsdom |
| Component tests | Testing Library (`@testing-library/react`) |
| Mocking | `vi.mock()` for services, `vi.fn()` for callbacks |
| Router | MemoryRouter wrapper for route-dependent components |

**Stats:** 29 suites, 677 tests

### E2E (Playwright)

Config in `frontend/playwright.config.*`. Run via `npx playwright test`.

---

## 12. CI/CD

**Platform:** GitHub Actions
**Config:** `.github/workflows/ci.yml`

**Pipeline steps:**
1. Install from monorepo root (`npm ci`)
2. Build shared packages
3. Lint all workspaces
4. Type check backend + frontend (`tsc --noEmit`)
5. Run backend tests (Jest)
6. Run frontend tests (Vitest)

**Branch strategy:** `master` is main, feature branches merge via PR.

---

## 13. Known Gotchas

| Gotcha | Detail |
|--------|--------|
| CSRF is global | Applied in `server.ts` — individual routes don't add it |
| Config reads env at import time | Set env vars BEFORE importing config; dotenv loaded in `config/index.ts` |
| Controllers take (req, res) only | No `next` parameter — throw AppError, caught by global handler |
| Docker PG on port 5434 | Not default 5432 — avoid conflict with local installs |
| `require.main === module` guard | Prevents server start when imported by tests |
| Swiss Ephemeris mocked in tests | Real ephemeris needs .se1 data files |
| No `console.log` in backend | Use `logger` from `utils/logger` |
| No `require()` in backend | Use `import` per ES2022/NodeNext |
| Token storage | Use `tokenStorage` utility — never raw `localStorage` for auth tokens |
| Frontend navigation | Use `<Link>` or `useNavigate()` — never raw `<a href>` |
| Shared packages rebuild | Must rebuild after changes: `cd packages/shared-types && npm run build` |
| `asyncHandler` inconsistency | Used in auth, charts, users, analysis, transits; NOT in calendar, synastry, lunar, solar, notifications |
| Live tests excluded | `__tests__/live/` excluded from default Jest run |
| Not implemented endpoints | `auth/forgot-password`, `auth/reset-password`, `lunar-return/current` return 501 |

---

## 14. Quick Commands

```bash
# Development
npm run dev                              # Start backend + frontend
cd backend && npm run dev                # Backend only (port 3001)
cd frontend && npm run dev               # Frontend only (port 3000)

# Testing
cd backend && npx jest                   # All backend tests
cd backend && npx jest --testPathPattern=pattern  # Specific suite
cd frontend && npx vitest run            # All frontend tests
cd frontend && npx playwright test       # E2E tests

# Database (from backend/)
npx knex migrate:latest                  # Run migrations
npx knex migrate:rollback                # Rollback last batch
npx knex seed:run                        # Run seeders
npm run db:reset                         # Rollback + migrate + seed

# Quality
npm run build                            # Build both workspaces
npm run lint                             # Lint all workspaces
cd backend && npx tsc --noEmit           # Type check backend
cd frontend && npx tsc --noEmit          # Type check frontend
```

---

## Cross-Reference Index

| Topic | File |
|-------|------|
| Project conventions | `CLAUDE.md` |
| Architecture audit | `docs/ARCHITECTURE.md` |
| Code review remediation | `docs/plans/2026-03-29-code-review-remediation.md` |
| AI feature design | `docs/plans/2026-02-16-ai-interpretations.md` |
| Calendar feature | `docs/plans/2026-02-16-calendar-feature.md` |
| PWA enhancement | `docs/plans/2026-02-16-pwa-enhancement.md` |
| Synastry feature | `docs/plans/2026-02-16-synastry-compatibility.md` |
| Lunar return feature | `docs/plans/2026-02-16-lunar-return.md` |
| Server entry | `backend/src/server.ts` |
| API router | `backend/src/api/v1/index.ts` |
| Auth middleware | `backend/src/middleware/auth.ts` |
| CSRF middleware | `backend/src/middleware/csrf.ts` |
| Error handler | `backend/src/middleware/errorHandler.ts` |
| Rate limiters | `backend/src/middleware/rateLimiter.ts` |
| DB config | `backend/src/config/database.ts` |
| App config | `backend/src/config/index.ts` |
| Frontend routes | `frontend/src/App.tsx` |
| Layout/navigation | `frontend/src/components/AppLayout.tsx` |
| API client | `frontend/src/services/api.ts` |
| Auth store | `frontend/src/store/authStore.ts` |
| Charts store | `frontend/src/store/chartsStore.ts` |
| React Query hooks | `frontend/src/hooks/index.ts` |
| Vite config | `frontend/vite.config.ts` |
| CI pipeline | `.github/workflows/ci.yml` |
