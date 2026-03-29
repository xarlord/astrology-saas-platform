# AstroVerse Architecture & UI Definition

> Auto-generated codebase audit — 2026-03-29

---

## 1. System Overview

AstroVerse is an astrology SaaS platform providing natal charts, personality analysis, forecasting, synastry, and PWA capabilities. It is a **monorepo** managed via npm workspaces.

```
AstroVerse-UI-Overhaul/
├── packages/          # Shared packages (shared-types, shared-utils, shared-constants)
├── backend/           # Express 4 + TypeScript API (port 3001)
├── frontend/          # React 18 + Vite 5 SPA (port 5173)
├── tests/             # Standalone BDD/Cucumber test package
├── nginx/             # Production reverse-proxy config
├── scripts/           # Deployment and utility scripts
└── docs/              # Planning, specs, archive
```

### Data Flow

```
[Browser/SPA] ──► [Nginx (prod)] ──► [Express API :3001]
       │                                    │
       │   React 18 + Vite 5               │   TypeScript 5
       │   Tailwind 3 + Zustand            │   Knex + PostgreSQL 15
       │   React Query + D3                │   JWT Auth + CSRF
       │                                    │
       └── [Service Worker / PWA]           └── [Redis (prod)] ──► [PostgreSQL :5434]
```

---

## 2. Backend Architecture

### 2.1 Module Structure

11 domain modules under `backend/src/modules/`, plus a `shared/` module for cross-cutting services.

| Module | Controller | Service | Routes | Model | Status |
|--------|-----------|---------|--------|-------|--------|
| **auth** | `auth.controller.ts` | — | `auth.routes.ts` | `refreshToken.model.ts` | Wired |
| **users** | `user.controller.ts` | — | `user.routes.ts` | `user.model.ts` | Wired |
| **charts** | `chart.controller.ts` | — | `chart.routes.ts`, `share.routes.ts` | `chart.model.ts` | Wired |
| **analysis** | `analysis.controller.ts` | `interpretation.service.ts` | `analysis.routes.ts` | — (re-exports) | Wired |
| **transits** | `transit.controller.ts` | — | `transit.routes.ts` | — | Wired |
| **calendar** | `calendar.controller.ts` | `calendar.service.ts`, `globalEvents.service.ts` | `calendar.routes.ts` | `calendar.model.ts`, `calendarEvent.model.ts` | Wired |
| **lunar** | `lunarReturn.controller.ts` | `lunarReturn.service.ts` | `lunarReturn.routes.ts` | `lunarReturn.model.ts` | Wired |
| **synastry** | `synastry.controller.ts` | `synastry.service.ts` | `synastry.routes.ts` | `synastry.model.ts` | Wired |
| **solar** | `solarReturn.controller.ts` | `solarReturn.service.ts` | `solarReturn.routes.ts` | `solarReturn.model.ts` | Wired |
| **ai** | `ai.controller.ts`, `aiUsage.controller.ts` | `openai.service.ts`, `aiCache.service.ts`, `aiInterpretation.service.ts` | `ai.routes.ts` | `aiCache.model.ts`, `aiUsage.model.ts` | **NOT MOUNTED** |
| **notifications** | `pushNotification.controller.ts` | `pushNotification.service.ts` | `pushNotification.routes.ts` | `pushSubscription.model.ts` | **NOT MOUNTED** |
| **shared** | — | 8 services (see §2.3) | `timezone.routes.ts`, `location.routes.ts` | — | Partially wired |

### 2.2 API Routing

```
/api
├── v1/                          # backend/src/api/v1/index.ts
│   ├── /auth                    # JWT auth (login, register, refresh, me)
│   ├── /users                   # User CRUD
│   ├── /charts                  # Chart CRUD + calculate
│   ├── /share                   # Public chart sharing (UUID tokens)
│   ├── /analysis                # Personality analysis
│   ├── /transits                # Transit calculations
│   ├── /calendar                # Astrological calendar
│   ├── /lunar-return            # Lunar return charts
│   ├── /synastry                # Compatibility reports
│   ├── /solar-returns           # Solar return charts
│   ├── /timezone                # Timezone utilities
│   ├── /location                # Location autocomplete
│   ├── /health                  # Health check
│   └── /csrf-token              # CSRF token generation
├── v2/                          # Empty stub
└── /*                           # Alias to v1
```

### 2.3 Shared Services

| Service | File | Purpose | Used By |
|---------|------|---------|---------|
| **SwissEphemeris** | `shared/services/swissEphemeris.service.ts` | **Mock** planetary positions (deterministic pseudo-random) | Charts, Transits, Solar, Synastry, Lunar controllers |
| **AstronomyEngine** | `shared/services/astronomyEngine.service.ts` | **Real** calculations via `astronomy-engine` npm | **UNUSED** by any controller |
| **NatalChart** | `shared/services/natalChart.service.ts` | Real chart computation combining AstronomyEngine + houses | **UNUSED** by any controller |
| **HouseCalculation** | `shared/services/houseCalculation.service.ts` | Placidus/Koch/Equal/WholeSign house cusps | NatalChartService |
| **Timezone** | `shared/services/timezone.service.ts` | Luxon-based timezone handling | Solar, Calendar |
| **TransitCache** | `shared/services/transitCache.service.ts` | In-memory TTL cache (24h default) | — (noted: replace with Redis) |
| **ChartSharing** | `shared/services/chartSharing.service.ts` | UUID + optional password sharing | Share routes |
| **PDFGeneration** | `shared/services/pdfGeneration.service.ts` | Puppeteer PDF generation | — (no route wired) |
| **SecurityLogging** | `shared/services/securityLogging.service.ts` | Audit log writer | Auth middleware |

### 2.4 Middleware Stack

```
Request → requestLogger → rateLimiter (defined, NOT applied) → csrf (defined, NOT applied)
        → authenticate (per-route) → controller → errorHandler → response
```

| Middleware | Applied? | Notes |
|-----------|----------|-------|
| `requestLogger` | Yes | Winston-based request/response logging |
| `rateLimiter` | **No** | 5 specialized limiters defined, none wired to routes |
| `csrf` | **No** | Double-submit cookie pattern, never applied as middleware |
| `authenticate` | Per-route | JWT verification, `optionalAuthenticate` variant available |
| `errorHandler` | Yes | Global catch-all, formats AppError subclasses |
| `notFoundHandler` | Yes | 404 JSON for unmatched routes |

### 2.5 Database

- **18 migrations** covering all core tables
- **Pattern inconsistency**: Class-singleton models (User, Chart) vs standalone functions (RefreshToken) vs inline Knex (Synastry, Lunar)
- **Missing migration**: `shared_charts` table (referenced by `chartSharing.service.ts` but has no migration)
- **Dual config**: `knexfile.ts` (CLI) defaults to port 5434/db `astrology_saas`; `config/database.ts` (runtime) defaults to port 5432/db `astrology_db`

### 2.6 Error Handling

Three coexisting patterns:

| Pattern | Used By | Mechanism |
|---------|---------|-----------|
| **A: throw + asyncHandler** | Auth, Users, Charts, Transits, Analysis, Synastry, Solar | `throw new AppError()` caught by `asyncHandler` wrapper → global `errorHandler` |
| **B: try/catch + next** | Calendar, Lunar | Manual try/catch passing to `next(error)` |
| **C: try/catch + manual response** | Calendar (partial) | `res.status(500).json(...)` — **bypasses global handler** |

---

## 3. Frontend Architecture

### 3.1 Component Map (35+ components)

#### Core Layout & Navigation
| Component | Purpose | Used By |
|-----------|---------|---------|
| `AppLayout` | Sidebar + top nav + mobile bottom nav + footer | SynastryPage wrapper only |
| `ProtectedRoute` | Auth guard, redirects to `/login` | All protected routes in App.tsx |

#### Authentication
| Component | Purpose | Actually Used? |
|-----------|---------|---------------|
| `AuthenticationForms` | Full login/register with validation, social auth, WCAG compliance | **No** — pages use their own simple forms |
| `LoginForm` / `RegisterForm` | Sub-exports of AuthenticationForms | **No** |

#### Chart & Analysis
| Component | Purpose | Wired to API? |
|-----------|---------|--------------|
| `ChartWheel` | SVG natal chart with zodiac ring, planets, aspects, house lines | Used but never rendered (ChartViewPage is a stub) |
| `PersonalityAnalysis` | Tabbed analysis with accordion sections | Used but AnalysisPage uses hardcoded data |
| `BirthDataForm` | Multi-section birth data with geocoding | Not used by ChartCreatePage (stub) |
| `UsageMeter` | Chart storage usage display | Yes |

#### Symbols & Visual
| Component | Purpose |
|-----------|---------|
| `PlanetSymbol` | Planet glyph renderer with color coding |
| `AspectSymbol` | Aspect glyph renderer |
| `ZodiacBadge` | Zodiac sign badge with element colors |
| `ElementMeter` | Fire/Earth/Air/Water distribution bars |

#### Feature Dashboards
| Component | Purpose | Wired? |
|-----------|---------|--------|
| `TransitDashboard` | Multi-view transit display | Exists but TransitPage is a stub |
| `SolarReturnDashboard` | Solar return year listing | Yes |
| `LunarReturnDashboard` | Lunar return dashboard | Yes |
| `SynastryCalculator` | Chart comparison form | Yes |
| `AstrologicalCalendar` | Main calendar component | Yes |

#### PWA & AI
| Component | Purpose |
|-----------|---------|
| `ServiceWorkerUpdateBanner` | Update/offline banner |
| `PushNotificationPermission` | Push opt-in prompt |
| `AIInterpretationToggle` | AI enhancement toggle |
| `AIInterpretationDisplay` | AI interpretation renderer |

#### Loading & Empty States
| Component | Purpose |
|-----------|---------|
| `SkeletonLoader` | 5 variants: card, list, text, calendar, chart |
| `EmptyState` | 8 presets: NoCharts, NoTransits, Error, etc. |

### 3.2 Page-Route Mapping (14 routes)

| Route | Page | Status |
|-------|------|--------|
| `/` | `HomePage` | Static landing page — works |
| `/login` | `LoginPage` | **Simple form** (not using `AuthenticationForms`) |
| `/register` | `RegisterPage` | **Simple form** (not using `AuthenticationForms`) |
| `/dashboard` | `DashboardPage` | Chart list with loading/empty states — works |
| `/charts/new` | `ChartCreatePage` | **STUB** — plain HTML, no BirthDataForm integration |
| `/charts/:id` | `ChartViewPage` | **STUB** — always shows "not found" |
| `/analysis/:chartId` | `AnalysisPage` | **HARDCODED DATA** — not connected to API |
| `/transits` | `TransitPage` | **STUB** — always shows "no data" |
| `/profile` | `ProfilePage` | **STUB** — shows placeholder text |
| `/synastry` | `SynastryPage` | Fully wired — works |
| `/solar-returns` | `SolarReturnsPage` | Fully wired — works |
| `/solar-returns/:year` | `SolarReturnsPage` | Fully wired — works |
| `/calendar` | `CalendarPage` | Thin wrapper — works |
| `/lunar-returns` | `LunarReturnsPage` | Fully wired — works |
| `*` | Inline 404 | Unstyled plain div |

### 3.3 State Management

```
┌─────────────────────────────────────────┐
│            Zustand Stores               │
├──────────────────┬──────────────────────┤
│   authStore      │   chartsStore        │
│   (persisted)    │   (not persisted)    │
│                  │                      │
│ • user           │ • charts[]           │
│ • accessToken    │ • currentChart       │
│ • refreshToken   │ • isLoading          │
│ • isAuthenticated│ • error              │
│                  │ • pagination         │
│ Actions:         │ Actions:             │
│ • login/register │ • fetchCharts        │
│ • logout         │ • createChart        │
│ • updateProfile  │ • calculateChart     │
│ • updatePrefs    │ • deleteChart        │
└──────────────────┴──────────────────────┘

┌─────────────────────────────────────────┐
│         React Query Cache               │
│   (staleTime: 5min, retry: 1)          │
│                                         │
│ Keys: ['analysis', id], ['transits'],   │
│       ['calendar', y, m], ['charts']    │
│                                         │
│ Hooks: useChartAnalysis, useTodayTransits│
│        useTransitCalendar, useCreateChart│
│        useCalendarEvents, useAI...      │
└─────────────────────────────────────────┘
```

### 3.4 API Services

| Service | Endpoints | File |
|---------|-----------|------|
| **auth** | register, login, logout, me, preferences, refresh | `auth.service.ts` |
| **chart** | CRUD + calculate | `chart.service.ts` |
| **analysis** | personality, aspects, patterns, planets, houses | `analysis.service.ts` |
| **transit** | calculate, today, calendar, forecast | `transit.service.ts` |
| **ai** | natal, transit, compatibility, status, usage | `ai.service.ts` |
| **calendar** | month, events CRUD, export, reminders | `calendar.service.ts` |
| **synastry** | compare, compatibility, reports CRUD | `synastry.api.ts` |
| **lunarReturn** | next, current, chart, forecast, history, calculate | `lunarReturn.api.ts` |
| **location** | autocomplete, details | `location.service.ts` |
| **timezone** | search, detect, convert | `timezone.service.ts` |
| **pushNotification** | VAPID key, subscribe, subscriptions, test | `pushNotification.service.ts` |

### 3.5 Design System

**Colors**: Primary (indigo), Secondary (purple), Accent (amber), Zodiac elements (fire/earth/air/water)
**Fonts**: Inter (sans), Playfair Display (display)
**Icons**: `@heroicons/react` + `lucide-react`
**CSS approach**: Tailwind 3 with `@layer components` for `.btn-primary`, `.card`, `.input`, etc.
**Dark mode**: `class` strategy via `dark:` prefix

---

## 4. Infrastructure

### 4.1 CI/CD Pipeline

```
Push/PR ──► ci.yml (9 jobs)
  ├── backend-test (lint + type + unit + coverage)
  ├── frontend-test (lint + type + unit + coverage)
  ├── live-tests (Postgres service + real API tests)
  ├── e2e-tests (Playwright: chromium + firefox + webkit)
  ├── visual-tests (path-filtered, PR comments)
  ├── bdd-tests (Cucumber + Playwright)
  ├── accessibility-tests (WCAG 2.1 AA)
  ├── integration-tests (Postgres + Redis)
  └── build (artifact, master only)
```

### 4.2 Docker

| Compose File | Services | Purpose |
|-------------|----------|---------|
| `dev.yml` | Postgres + pgAdmin | Local development DB |
| `staging.yml` | Postgres + Backend + Frontend | Staging deployment |
| `prod.yml` | Postgres + Redis + Backend x2 + Frontend + Nginx | Production with load balancing |

### 4.3 PWA

- **Strategy**: `injectManifest` with custom `sw.ts` (Workbox)
- **Caching**: API (NetworkFirst 24h), Images (CacheFirst 24h), Static (StaleWhileRevalidate)
- **Push**: VAPID-based, handled in service worker
- **Background sync**: Stub only (`sync-charts` tag logs but does nothing)

---

## 5. Weak Points — Prioritized

### CRITICAL (blocks production)

| # | Issue | Area | Impact | Status |
|---|-------|------|--------|--------|
| W1 | **Real calculation engine unused** — all charts use mock SwissEphemeris | Backend | Users get fake astrological data | OPEN |
| W2 | **5 core pages are stubs** — ChartCreate, ChartView, Analysis, Transits, Profile | Frontend | 36% of routes non-functional | OPEN |
| W3 | **CSRF middleware never applied** — defined but not wired | Security | Cross-site request vulnerability | ~~FIXED~~ `1730a98` |
| W4 | **Rate limiters never applied** — 5 specialized limiters sit unused | Security | No brute-force protection | ~~FIXED~~ `1730a98` |
| W5 | **AI and Notification routes not mounted** — fully implemented, inaccessible | Backend | Features dead on arrival | OPEN |
| W6 | **Missing `shared_charts` migration** — service references non-existent table | Backend | Chart sharing will fail in production | OPEN |

### HIGH (security / data integrity)

| # | Issue | Area | Impact | Status |
|---|-------|------|--------|--------|
| W7 | **38 non-null assertions** (`req.user!.id`) across 8 controllers | Backend | Runtime TypeError on auth failure | ~~FIXED~~ `bf2367e` (1 remaining) |
| W8 | **Dual token storage** — Zustand persist + raw localStorage can diverge | Frontend | Auth state desync | ~~FIXED~~ `73fdaed` |
| W9 | **Three error-handling patterns** — inconsistent across controllers | Backend | Errors may bypass global handler |
| W10 | **Three data-access patterns** — class-singleton, standalone functions, inline Knex | Backend | Maintenance burden, inconsistency |
| W11 | **Duplicate auth forms** — `AuthenticationForms` (full) vs page-level (simple) | Frontend | WCAG-compliant forms unused | OPEN |
| W12 | **Inconsistent layout wrapping** — only Synastry uses AppLayout | Frontend | Navigation/sidebar only on 1 page | ~~FIXED~~ `42c77c3` |
| W13 | **Raw `<a>` tags in AppLayout** — full page reloads instead of `<Link>` | Frontend | SPA navigation broken in sidebar | OPEN (16 remaining) |
| W14 | **No React error boundary** — render crashes take down entire app | Frontend | No graceful error recovery |
| W15 | **No CD pipeline** — manual Railway deployment only | Infra | No automated deployments |
| W16 | **No security scanning** — no npm audit, Snyk, or Dependabot | Infra | Vulnerable dependencies undetected |

### MEDIUM (quality / maintainability)

| # | Issue | Area | Impact |
|---|-------|------|--------|
| W17 | **Dual knex configs** with divergent defaults (port, db name) | Backend | Migrations target different DB than app |
| W18 | **Module barrel mostly commented out** — only 6 of 11 modules exported | Backend | Must use full paths for 5 modules |
| W19 | **Version middleware dead code** — never imported or used | Backend | Unnecessary code |
| W20 | **Duplicate import paths for AppError** — from middleware vs utils | Backend | Confusing, can cause type mismatches |
| W21 | **Dead dependencies** — D3, recharts, date-fns unused | Frontend | Larger bundle, maintenance noise |
| W22 | **Lazy loading defined but unused** — `lazyLoadWithRetry` exists but all imports are eager | Frontend | No code splitting benefit |
| W23 | **No theme toggle implementation** — UI exists but doesn't apply `dark` class | Frontend | Dark mode non-functional |
| W24 | **Dead footer/sidebar links** — /features, /pricing, /api, /learn, /blog | Frontend | 404 errors on navigation |
| W25 | **Social auth buttons** — Google/Apple buttons have no onClick handlers | Frontend | Non-functional buttons |
| W26 | **TransitDetailModal** — no focus trap, no aria-modal, no keyboard dismiss | Frontend | Accessibility violation |
| W27 | **AppLayout user dropdown** — CSS-only hover, not keyboard accessible | Frontend | Keyboard users locked out |
| W28 | **Two overlapping E2E test directories** — unclear which is canonical | Testing | Test maintenance confusion |
| W29 | **CI references configs that don't exist** — visual/BDD/accessibility test configs missing | Testing | CI jobs may fail |
| W30 | **Docker Node 18 vs package.json Node 20** — version mismatch | Infra | Potential runtime incompatibility |

### LOW (cleanup / polish)

| # | Issue | Area |
|---|-------|------|
| W31 | No `.dockerignore` files | Infra |
| W32 | No root Prettier config | Config |
| W33 | Naming inconsistency (`@mooncalender` vs `@astrology-saas`) | Config |
| W34 | Placeholder author/repo in root package.json | Config |
| W35 | PWA background sync is a stub | PWA |
| W36 | PWA icons may not exist on disk | PWA |
| W37 | Shared packages lack build pipeline (imported as raw TS) | Build |
| W38 | No bundle size tracking or budget | Build |
| W39 | CSP allows `unsafe-inline` + `unsafe-eval` | Security |
| W40 | Dev compose healthcheck credentials mismatch | Docker |

---

## 6. Feature Completion Matrix

| Feature | Backend API | Backend Wired | Frontend Service | Frontend Page | Working E2E |
|---------|:-----------:|:-------------:|:----------------:|:-------------:|:-----------:|
| Auth (login/register) | ✅ | ✅ | ✅ | ⚠️ Simple form | ✅ |
| Chart CRUD | ✅ | ✅ | ✅ | ❌ Stub pages | ✅ |
| Chart Calculation | ⚠️ Mock only | ✅ | ✅ | ❌ | — |
| Personality Analysis | ✅ | ✅ | ✅ | ❌ Hardcoded | — |
| Transits | ✅ | ✅ | ✅ | ❌ Stub | — |
| Calendar | ✅ | ✅ | ✅ | ✅ | — |
| Synastry | ✅ | ✅ | ✅ | ✅ | ✅ |
| Solar Returns | ✅ | ✅ | ✅ | ✅ | — |
| Lunar Returns | ✅ | ✅ | ✅ | ✅ | — |
| AI Interpretation | ✅ | ❌ Not mounted | ✅ | — | — |
| Push Notifications | ✅ | ❌ Not mounted | ✅ | — | — |
| Chart Sharing | ✅ | ✅ | ❌ No migration | — | — |
| PDF Generation | ✅ | ❌ Not wired | — | — | — |
| User Profile | ✅ | ✅ | ✅ | ❌ Stub | — |
| PWA | — | — | ✅ | ✅ | ✅ |

Legend: ✅ Working | ⚠️ Partial | ❌ Not working | — Not applicable

---

## 7. Recommended Priority Order

### Phase 1: Foundation (unblock core flow)
1. Wire real calculation engine (`AstronomyEngineService` + `NatalChartService`) to chart/transit controllers
2. Connect stub pages to real components (ChartCreate → BirthDataForm, ChartView → ChartWheel, etc.)
3. Apply CSRF middleware to all mutating routes
4. Apply rate limiters to auth/chart/share routes

### Phase 2: Security hardening
5. Replace all `req.user!.id` with proper null checks
6. Unify error handling pattern (Pattern A everywhere)
7. Add React error boundary
8. Fix dual token storage

### Phase 3: Feature completion
9. Mount AI and notification routes
10. Create `shared_charts` migration
11. Wire AnalysisPage to real API
12. Implement theme toggle
13. Connect social auth handlers

### Phase 4: Quality & cleanup
14. Unify data-access pattern
15. Remove dead code/dependencies
16. Fix AppLayout navigation (`<Link>` instead of `<a>`)
17. Standardize all pages to use AppLayout
18. Consolidate E2E test directories
19. Add missing CI configs
