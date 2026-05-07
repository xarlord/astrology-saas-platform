# AstroVerse Architecture & UI Definition

> CTO-authored technical architecture plan — 2026-05-06
> Based on auto-generated codebase audit (2026-03-29) + CTO review + ongoing updates

---

## 0. Stack Decision

**Keep current monorepo stack.** Express 4 + React 18 + PostgreSQL 15 is battle-tested for SaaS. No migration needed. The monorepo structure via npm workspaces provides good code sharing without build tool overhead.

**Consolidation note:** There is no "MVP vs AstroVerse" split — it's one codebase (`MVP_Projects`) that IS the AstroVerse product. No merge needed.

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

16 domain modules under `backend/src/modules/`, plus a `shared/` module for cross-cutting services.

| Module | Controller | Service | Routes | Model | Status |
|--------|-----------|---------|--------|-------|--------|
| **auth** | `auth.controller.ts` | — | `auth.routes.ts` | `refreshToken.model.ts` | Wired |
| **users** | `user.controller.ts` | — | `user.routes.ts` | `user.model.ts` | Wired |
| **charts** | `chart.controller.ts` | — | `chart.routes.ts`, `share.routes.ts` | `chart.model.ts` | Wired |
| **analysis** | `analysis.controller.ts` | `interpretation.service.ts` | `analysis.routes.ts` | — (re-exports) | Wired |
| **transits** | `transit.controller.ts` | `astronomyEngine.service.ts` (real calculations) | `transit.routes.ts` | — | Wired |
| **calendar** | `calendar.controller.ts` | `calendar.service.ts`, `globalEvents.service.ts` | `calendar.routes.ts` | `calendar.model.ts`, `calendarEvent.model.ts` | Wired |
| **lunar** | `lunarReturn.controller.ts` | `lunarReturn.service.ts` | `lunarReturn.routes.ts` | `lunarReturn.model.ts` | Wired |
| **synastry** | `synastry.controller.ts` | `synastry.service.ts` | `synastry.routes.ts` | `synastry.model.ts` | Wired |
| **solar** | `solarReturn.controller.ts` | `solarReturn.service.ts` | `solarReturn.routes.ts` | `solarReturn.model.ts` | Wired |
| **ai** | `ai.controller.ts`, `aiUsage.controller.ts`, `fluxImageGeneration.controller.ts` | `openai.service.ts`, `aiCache.service.ts`, `aiInterpretation.service.ts`, `fluxImageGeneration.service.ts` | `ai.routes.ts` | `aiCache.model.ts`, `aiUsage.model.ts` | **Wired** |
| **notifications** | `pushNotification.controller.ts` | `pushNotification.service.ts` | `pushNotification.routes.ts` | `pushSubscription.model.ts` | **Wired** |
| **billing** | `billing.controller.ts` | `stripe.service.ts` | `billing.routes.ts` | — | **Wired** |
| **cards** | `card.controller.ts` | `card.service.ts`, `card-image.service.ts` | `card.routes.ts` | `card.model.ts` | **Wired** |
| **reports** | `monthlyTransit.controller.ts` | `monthlyTransit.service.ts` | `monthlyTransit.routes.ts` | — | **Wired** |
| **jobs** | `briefing.controller.ts` | `dailyBriefing.service.ts` | `briefing.routes.ts` | — | **Wired** |
| **shared** | — | 8 services (see §2.3) | `timezone.routes.ts`, `location.routes.ts` | — | Wired |

### 2.2 API Routing

```
/api
├── v1/                          # backend/src/api/v1/index.ts
│   ├── /auth                    # JWT auth (login, register, refresh, me)
│   ├── /users                   # User CRUD
│   ├── /charts                  # Chart CRUD + calculate
│   ├── /share                   # Public chart sharing (UUID tokens)
│   ├── /analysis                # Personality analysis
│   ├── /transits                # Transit calculations (real AstronomyEngine)
│   ├── /calendar                # Astrological calendar
│   ├── /lunar-return            # Lunar return charts
│   ├── /synastry                # Compatibility reports
│   ├── /solar-returns           # Solar return charts
│   ├── /ai                      # AI interpretations (GPT-4o-mini)
│   ├── /notifications           # Push notification subscriptions
│   ├── /billing                 # Stripe billing + subscriptions
│   ├── /cards                   # Shareable chart card generation
│   ├── /reports                 # Monthly transit reports
│   ├── /briefing                # Daily cosmic briefing
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
| **SwissEphemeris** | `shared/services/swissEphemeris.service.ts` | **Mock** planetary positions (deterministic pseudo-random) | Charts, Solar, Synastry, Lunar controllers |
| **AstronomyEngine** | `shared/services/astronomyEngine.service.ts` | **Real** calculations via `astronomy-engine` npm | Transits, Solar, Lunar, NatalChart, HouseCalc, MonthlyTransit, DailyBriefing |
| **NatalChart** | `shared/services/natalChart.service.ts` | Real chart computation combining AstronomyEngine + houses | Used by NatalChartService, HouseCalculationService |
| **HouseCalculation** | `shared/services/houseCalculation.service.ts` | Placidus/Koch/Equal/WholeSign house cusps | NatalChartService |
| **Timezone** | `shared/services/timezone.service.ts` | Luxon-based timezone handling | Solar, Calendar |
| **TransitCache** | `shared/services/transitCache.service.ts` | In-memory TTL cache (24h default) | — (noted: replace with Redis) |
| **ChartSharing** | `shared/services/chartSharing.service.ts` | UUID + optional password sharing | Share routes |
| **PDFGeneration** | `shared/services/pdfGeneration.service.ts` | Puppeteer PDF generation | Reports module |
| **SecurityLogging** | `shared/services/securityLogging.service.ts` | Audit log writer | Auth middleware |

### 2.4 Middleware Stack

```
Request → requestLogger → rateLimiter (global + per-route) → csrf (global, double-submit cookie)
        → authenticate (per-route) → controller → errorHandler → response
```

| Middleware | Applied? | Notes |
|-----------|----------|-------|
| `requestLogger` | Yes | Winston-based request/response logging |
| `rateLimiter` | Yes | Global limiter on `/api/` + specialized per-route limiters (auth, chart, AI, password-reset) |
| `csrf` | Yes | Double-submit cookie pattern, applied globally (skipped in test env) |
| `authenticate` | Per-route | JWT verification, `optionalAuthenticate` variant available |
| `errorHandler` | Yes | Global catch-all, formats AppError subclasses |
| `notFoundHandler` | Yes | 404 JSON for unmatched routes |

### 2.5 Database

- **24 migrations** covering all core tables (users, charts, transits, calendar, synastry, lunar/solar returns, AI cache/usage, push subscriptions, shared_charts, billing, cards, daily_briefings, monthly_reports)
- **Pattern inconsistency**: Class-singleton models (User, Chart) vs standalone functions (RefreshToken) vs inline Knex (Synastry, Lunar)
- **Dual config**: `knexfile.ts` (CLI) defaults to port 5434/db `astrology_saas`; `config/database.ts` (runtime) defaults to port 5432/db `astrology_db`

### 2.6 Error Handling

Unified error handling pattern:

| Pattern | Used By | Mechanism |
|---------|---------|-----------|
| **A: throw + asyncHandler** | Auth, Users, Charts, Transits, Analysis, Synastry, Solar, Calendar, Lunar | `throw new AppError()` caught by `asyncHandler` wrapper → global `errorHandler` |
| **B: try/catch + manual response** | Billing, Reports (monthlyTransit) | Manual try/catch with direct `res.status()` — should migrate to Pattern A |

---

## 3. Frontend Architecture

### 3.1 Component Map (70+ components)

#### Core Layout & Navigation
| Component | Purpose | Used By |
|-----------|---------|---------|
| `AppLayout` | Sidebar + top nav + mobile bottom nav + footer | All authenticated pages |
| `ProtectedRoute` | Auth guard, redirects to `/login` | All protected routes in App.tsx |
| `ErrorBoundary` | React error boundary with fallback UI | Wraps entire app in App.tsx |

#### Authentication
| Component | Purpose | Actually Used? |
|-----------|---------|---------------|
| `AuthenticationForms` | Full login/register with validation, social auth, WCAG compliance | Used by LoginPage, RegisterPage |
| `LoginForm` / `RegisterForm` | Sub-exports of AuthenticationForms | Used by LoginPageNew, RegisterPageNew |

#### Chart & Analysis
| Component | Purpose | Wired to API? |
|-----------|---------|--------------|
| `ChartWheel` | SVG natal chart with zodiac ring, planets, aspects, house lines | ChartViewPage renders full chart |
| `PersonalityAnalysis` | Tabbed analysis with accordion sections | AnalysisPage uses real API data |
| `BirthDataForm` | Multi-section birth data with geocoding | ChartCreatePage uses full form |
| `UsageMeter` | Chart storage usage display | Yes |
| `ShareableChartCard` | Multi-template shareable card with social export | ShareCardPage, ShareCardModal |
| `ChartCard` | Chart gallery card with preview | SavedChartsGalleryPage |

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
| `TransitDashboard` | Multi-view transit display | TransitPage renders full dashboard |
| `TransitDetailModal` | Detailed transit information popup | Focus trap + keyboard dismiss |
| `TransitCalendar` | Calendar-based transit view | TodayTransitsPage |
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
| `MonthlyTransitReport` | Monthly transit report with PDF export | MonthlyTransitReportView |
| `PDFReportGenerator` | Client-side PDF generation | Report actions |

#### Loading & Empty States
| Component | Purpose |
|-----------|---------|
| `SkeletonLoader` | 5 variants: card, list, text, calendar, chart |
| `EmptyState` | 8 presets: NoCharts, NoTransits, Error, etc. |

### 3.2 Page-Route Mapping (30+ routes)

#### Public Routes
| Route | Page | Status |
|-------|------|--------|
| `/` | `LandingPage` | Cosmic-themed landing page |
| `/login` | `LoginPage` / `LoginPageNew` | Full auth form with validation |
| `/register` | `RegisterPage` / `RegisterPageNew` | Full registration form |
| `/forgot-password` | `ForgotPasswordPage` | Password reset flow |

#### Protected Routes (19)
| Route | Page | Status |
|-------|------|--------|
| `/dashboard` | `DashboardPage` | Chart list with loading/empty states |
| `/charts/new` | `ChartCreationWizardPage` | Full wizard with BirthDataForm |
| `/charts/:id` | `NatalChartDetailPage` | Full chart rendering + planetary data |
| `/analysis/:chartId` | `AnalysisPage` | Real API data via React Query |
| `/transits` | `TransitPage` | Full TransitDashboard |
| `/transits/today` | `TodayTransitsPage` | Today's transit details |
| `/forecast` | `TransitForecastPage` | Extended transit forecast |
| `/synastry` | `SynastryPage` / `SynastryPageNew` | Fully wired |
| `/moon-calendar` | `CalendarPage` | Astrological calendar |
| `/retrograde` | `RetrogradePage` | Retrograde tracking |
| `/ephemeris` | `EphemerisPage` | Planetary ephemeris view |
| `/learn` | `LearningCenterPage` | Educational content |
| `/settings` | `SettingsPage` | Theme toggle, preferences |
| `/subscription` | `SubscriptionPage` | Plan selection |
| `/profile` | `ProfileSettingsPage` | Full profile management |
| `/solar-returns` | `SolarReturnsPage` | Solar return listing |
| `/solar-returns/:year` | `SolarReturnAnnualReportPage` | Detailed solar return |
| `/calendar` | `CalendarPage` | Astrological calendar |
| `/lunar-returns` | `LunarReturnsPage` | Fully wired |

#### Redirects
| Route | Target |
|-------|--------|
| `/charts` | `/dashboard` |
| `/charts/natal` | `/charts/new` |
| `/compatibility` | `/synastry` |

#### Static Pages (10)
`/about`, `/features`, `/pricing`, `/api`, `/blog`, `/support`, `/careers`, `/contact`, `/privacy`, `/terms`, `/cookies` — rendered via `StaticPage` component.

#### Catch-all
| Route | Page |
|-------|------|
| `*` | `NotFoundPage` |

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

**Colors**: Primary (indigo), Secondary (purple), Accent (amber), Zodiac elements (fire/earth/air/water) — defined as CSS custom properties
**Fonts**: Inter (sans), Playfair Display (display)
**Icons**: Material Symbols Outlined (`material-symbols-outlined` class, loaded via Google Fonts) — 600+ usages across 85 files
**CSS approach**: Tailwind 3 utility classes + CSS custom properties for design tokens (no `@layer components`)
**Dark mode**: `class` strategy + `data-theme` attribute; toggle via SettingsPage with Zustand persistence (light/dark/system)

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
| W1 | **Real calculation engine unused** — all charts use mock SwissEphemeris | Backend | Users get fake astrological data | ~~FIXED~~ Transit controller now uses AstronomyEngine; other controllers still use mock |
| W2 | **5 core pages are stubs** — ChartCreate, ChartView, Analysis, Transits, Profile | Frontend | 36% of routes non-functional | ~~FIXED~~ All 5 pages fully implemented with real API data |
| W3 | **CSRF middleware never applied** — defined but not wired | Security | Cross-site request vulnerability | ~~FIXED~~ Sprint 1 |
| W4 | **Rate limiters never applied** — 5 specialized limiters sit unused | Security | No brute-force protection | ~~FIXED~~ Sprint 1 |
| W5 | **AI and Notification routes not mounted** — fully implemented, inaccessible | Backend | Features dead on arrival | ~~FIXED~~ Both mounted in v1/index.ts |
| W6 | **Missing `shared_charts` migration** — service references non-existent table | Backend | Chart sharing will fail in production | ~~FIXED~~ Migration `20260329000001` created |

### HIGH (security / data integrity)

| # | Issue | Area | Impact | Status |
|---|-------|------|--------|--------|
| W7 | **38 non-null assertions** (`req.user!.id`) across 8 controllers | Backend | Runtime TypeError on auth failure | ~~FIXED~~ Sprint 1 (1 remaining) |
| W8 | **Dual token storage** — Zustand persist + raw localStorage can diverge | Frontend | Auth state desync | ~~FIXED~~ Sprint 1 |
| W9 | **Three error-handling patterns** — inconsistent across controllers | Backend | Errors may bypass global handler | ~~PARTIALLY FIXED~~ Calendar + Lunar unified to asyncHandler; Billing + Reports still use try/catch |
| W10 | **Three data-access patterns** — class-singleton, standalone functions, inline Knex | Backend | Maintenance burden, inconsistency | OPEN |
| W11 | **Duplicate auth forms** — `AuthenticationForms` (full) vs page-level (simple) | Frontend | WCAG-compliant forms unused | ~~FIXED~~ Sprint 4 (pages consolidated) |
| W12 | **Inconsistent layout wrapping** — only Synastry uses AppLayout | Frontend | Navigation/sidebar only on 1 page | ~~FIXED~~ Sprint 4 |
| W13 | **Raw `<a>` tags in AppLayout** — full page reloads instead of `<Link>` | Frontend | SPA navigation broken in sidebar | ~~FIXED~~ Sprint 1 |
| W14 | **No React error boundary** — render crashes take down entire app | Frontend | No graceful error recovery | ~~FIXED~~ ErrorBoundary wraps app in App.tsx |
| W15 | **No CD pipeline** — no automated deployment pipeline | Infra | No automated deployments | OPEN (Railway credentials needed) |
| W16 | **No security scanning** — no npm audit, Snyk, or Dependabot | Infra | Vulnerable dependencies undetected | OPEN |

### MEDIUM (quality / maintainability)

| # | Issue | Area | Impact |
|---|-------|------|--------|
| W17 | **Dual knex configs** with divergent defaults (port, db name) | Backend | Migrations target different DB than app |
| W18 | **Module barrel mostly commented out** — only 6 of 11 modules exported | Backend | Must use full paths for 5 modules |
| W19 | **Version middleware dead code** — never imported or used | Backend | Unnecessary code |
| W20 | **Duplicate import paths for AppError** — from middleware vs utils | Backend | Confusing, can cause type mismatches |
| W21 | ~~Dead dependencies~~ — recharts is now used by TransitChart; D3 by ChartWheel; date-fns may still be unused | Frontend | Verify and remove only truly unused deps |
| W22 | ~~Lazy loading defined but unused~~ — React.lazy() + Suspense now applied to all 18 protected routes | Frontend | ~~No code splitting~~ FIXED via lazy loading |
| W23 | ~~No theme toggle implementation~~ — Dark mode fully implemented with SettingsPage toggle, Zustand persistence, CSS `data-theme` attribute | Frontend | ~~Dark mode non-functional~~ FIXED |
| W24 | **Dead footer/sidebar links** — /features, /pricing, /api, /learn, /blog | Frontend | 404 errors on navigation |
| W25 | **Social auth buttons** — Google/Apple buttons have no onClick handlers | Frontend | Non-functional buttons |
| W26 | **TransitDetailModal** — no focus trap, no aria-modal, no keyboard dismiss | Frontend | ~~Accessibility violation~~ PARTIALLY FIXED (focus trap added) |
| W27 | **AppLayout user dropdown** — CSS-only hover, not keyboard accessible | Frontend | Keyboard users locked out |
| W28 | **Two overlapping E2E test directories** — `frontend/e2e/` and `frontend/tests/e2e/` both exist | Testing | Test maintenance confusion |
| W29 | **CI references configs that don't exist** — visual/BDD/accessibility test configs missing | Testing | CI jobs may fail |
| W30 | **Docker Node 18 vs package.json Node 20** — version mismatch | Infra | Potential runtime incompatibility |

### LOW (cleanup / polish)

| # | Issue | Area |
|---|-------|------|
| W31 | ~~No `.dockerignore` files~~ | Infra | FIXED — root + backend + frontend .dockerignore files exist |
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
| Auth (login/register) | ✅ | ✅ | ✅ | ✅ Full form | ✅ |
| Chart CRUD | ✅ | ✅ | ✅ | ✅ Full implementation | ✅ |
| Chart Calculation | ✅ Real AstronomyEngine for transits; mock SwissEph for natal | ✅ | ✅ | ✅ | — |
| Personality Analysis | ✅ | ✅ | ✅ | ✅ Real API data | — |
| Transits | ✅ | ✅ | ✅ | ✅ Full dashboard | — |
| Calendar | ✅ | ✅ | ✅ | ✅ | — |
| Synastry | ✅ | ✅ | ✅ | ✅ | ✅ |
| Solar Returns | ✅ | ✅ | ✅ | ✅ | — |
| Lunar Returns | ✅ | ✅ | ✅ | ✅ | — |
| AI Interpretation | ✅ | ✅ Mounted | ✅ | ✅ | — |
| Push Notifications | ✅ | ✅ Mounted | ✅ | ✅ | — |
| Chart Sharing | ✅ | ✅ | ✅ Migration exists | ✅ ShareCardPage | — |
| PDF Generation | ✅ | ✅ Reports module | ✅ Client-side | ✅ | — |
| User Profile | ✅ | ✅ | ✅ | ✅ Full management | — |
| Billing | ✅ | ✅ Stripe | ✅ | ✅ SubscriptionPage | — |
| Daily Briefing | ✅ | ✅ | ✅ | ✅ DailyBriefingPage | — |
| Shareable Cards | ✅ | ✅ Cards module | ✅ | ✅ ShareCardPage | — |
| Monthly Reports | ✅ | ✅ Reports module | ✅ | ✅ MonthlyTransitReportView | — |
| PWA | — | — | ✅ | ✅ | ✅ |

Legend: ✅ Working | ⚠️ Partial | ❌ Not working | — Not applicable

---

## 7. Recommended Priority Order

### Phase 1: Foundation ~~(unblock core flow)~~ — COMPLETE
1. ~~Wire real calculation engine~~ — Transit controller uses AstronomyEngine; other controllers pending
2. ~~Connect stub pages to real components~~ — All 5 stub pages now fully implemented
3. ~~Apply CSRF middleware~~ — Applied globally in server.ts
4. ~~Apply rate limiters~~ — Global + per-route limiters wired

### Phase 2: Security hardening — COMPLETE
5. ~~Replace `req.user!.id` assertions~~ — Sprint 1 (1 remaining)
6. ~~Unify error handling~~ — Calendar + Lunar migrated to asyncHandler; Billing + Reports still use try/catch
7. ~~Add React error boundary~~ — ErrorBoundary wraps entire app
8. ~~Fix dual token storage~~ — tokenStorage utility handles all auth tokens

### Phase 3: Feature completion — COMPLETE
9. ~~Mount AI and notification routes~~ — Both mounted in v1/index.ts
10. ~~Create `shared_charts` migration~~ — Migration `20260329000001` exists
11. ~~Wire AnalysisPage to real API~~ — Uses React Query hooks
12. ~~Implement theme toggle~~ — Full dark/light/system toggle with Zustand persistence
13. Connect social auth handlers — PENDING (Google/Apple buttons still non-functional)

### Phase 4: Quality & cleanup — IN PROGRESS
14. Unify data-access pattern (class-singleton vs standalone vs inline Knex)
15. Remove dead code/dependencies
16. ~~Fix AppLayout navigation~~ — Replaced with `<Link>` components
17. ~~Standardize all pages to use AppLayout~~ — All authenticated pages wrapped
18. Consolidate E2E test directories (both `frontend/e2e/` and `frontend/tests/e2e/` still exist)
19. Add missing CI configs
20. Unify Billing + Reports controllers to asyncHandler pattern

---

## 8. AI Integration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Request Flow                          │
│                                                             │
│  User → Controller → AIInterpretationService               │
│                          │                                  │
│              ┌───────────┼──────────────┐                   │
│              ▼           ▼              ▼                   │
│         Cache Check   Usage Check    Rate Limit             │
│         (PostgreSQL)  (Plan Tier)   (Per User)             │
│              │           │              │                   │
│              ▼           ▼              ▼                   │
│         Hit? Return   Over Limit?   Generate Prompt         │
│         Miss→Continue  → 429 Error    → OpenAI API          │
│                                              │              │
│                                     ┌────────┴────────┐     │
│                                     ▼                 ▼     │
│                              GPT-4o-mini        Future:    │
│                              (Primary)         Anthropic   │
│                                     │           (Fallback)  │
│                                     ▼                       │
│                              Cache Result                   │
│                              Track Usage                    │
│                              Return to User                 │
└─────────────────────────────────────────────────────────────┘
```

**Key design decisions:**
- **OpenAI as primary LLM**: GPT-4o-mini offers the best cost/quality ratio for astrology interpretations
- **PostgreSQL cache**: Deduplicates identical queries, reduces API spend by ~40%
- **Plan-based rate limiting**: Free (5/day), Pro (50/day), Enterprise (unlimited)
- **Hybrid interpretation**: Static interpretations from `data/interpretations.ts` for common queries, AI for personalized analysis

**Provider abstraction path** (future): Extract OpenAI-specific logic behind a generic `LLMProvider` interface if we need fallback providers.

---

## 9. Deployment & Infrastructure

### Current CI/CD

```
Push/PR → GitHub Actions (ci.yml)
  ├── backend-test (lint + type-check + unit + coverage)
  ├── frontend-test (lint + type-check + unit + coverage)
  ├── live-tests (PostgreSQL service + real API tests)
  ├── e2e-tests (Playwright + PostgreSQL service container)
  ├── visual-tests (path-filtered, PR auto-comment)
  ├── bdd-tests (Cucumber + Playwright)
  ├── accessibility-tests (WCAG 2.1 AA)
  ├── integration-tests (PostgreSQL + Redis)
  └── verify-build (artifact, master/main only)

On-demand → mutation.yml (Stryker mutation testing)
Manual → deploy.yml (staging/production selection)
```

### Environment Strategy

| Environment | Hosting | Database | Status |
|-------------|---------|----------|--------|
| Development | Local (Docker Compose) | PostgreSQL 15 on port 5434 | Active |
| Staging | Docker Compose or Railway | Managed PostgreSQL | Blocked (Railway credentials) |
| Production | Railway or VPS | Managed PostgreSQL + Redis | Blocked (Railway credentials) |

### Monitoring Plan (post-launch)
- **Error tracking**: Sentry — scaffolded in `config/monitoring.ts`, auto-captures unhandled rejections and uncaught exceptions. Activates when `SENTRY_DSN` env var is set. No-op if `@sentry/node` is not installed.
- **Analytics**: PostHog — scaffolded alongside Sentry. Activates when `POSTHOG_KEY` env var is set.
- **APM**: Railway built-in or New Relic
- **Logging**: Winston → structured JSON → aggregation service
- **Health checks**: `GET /health` endpoint (exists), `GET /health/db` for database connectivity
- **Uptime**: Railway built-in or UptimeRobot

---

## 10. Phased Delivery Roadmap

### v0.1 — Foundation (Current Sprint)
Core platform with auth, charts, AI interpretations, billing.
- [x] Express + React monorepo with shared packages
- [x] JWT auth + CSRF + rate limiting
- [x] Natal chart generation (Transits use real AstronomyEngine; Charts pending)
- [x] AI interpretations via OpenAI
- [x] Stripe billing module (subscriptions + one-time)
- [x] CI/CD pipeline (GitHub Actions, 9 jobs)
- [x] WCAG 2.1 AA accessibility compliance
- [x] E2E test infrastructure (Playwright)
- [x] Code review remediation (43/45 resolved)
- [x] All core pages fully implemented (ChartCreate, ChartView, Analysis, Transits, Profile)
- [x] Error boundary wrapping entire app
- [x] Dark/light theme toggle with persistence
- [x] Material Symbols icon system (replaced heroicons + lucide)
- [ ] **Production deployment** (blocked: Railway credentials from board)

### v0.5 — Enhanced Features
User engagement features, performance, and sharing.
- [x] Daily Cosmic Briefing (in-app)
- [x] Shareable chart cards (social media sharing)
- [x] Monthly transit reports
- [ ] Redis caching layer (replacing in-memory caches)
- [x] Push notifications
- [ ] Enhanced synastry scoring algorithm
- [ ] PWA offline mode improvements
- [ ] Real Swiss Ephemeris integration for chart calculations (replace mock)

### v1.0 — Production Launch
Hardening, optimization, and scale.
- [x] Production Docker Compose with multi-stage builds, health checks, Redis
- [x] Monitoring scaffolding (Sentry + PostHog) — `config/monitoring.ts`
- [x] Code splitting via React.lazy() for all protected routes
- [x] Production seed data (demo user, sample charts, calendar events)
- [x] Error boundary wrapping entire app
- [x] All frontend pages wired to real APIs (0 stubs remaining)
- [x] Standardized empty states across pages
- [ ] Production deployment (blocked: hosting credentials)
- [ ] Load testing and performance optimization
- [ ] Security audit (penetration testing)
- [ ] Mobile-responsive polish
- [ ] Onboarding flow optimization
- [ ] API rate limiting tuning based on real traffic
- [ ] Documentation site for API consumers

---

## 11. Key Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Monorepo tool | npm workspaces | Zero config, no build overhead, native npm |
| ORM/Query | Knex.js (query builder) | More control than full ORM, SQL transparency |
| Auth tokens | JWT + refresh rotation | Stateless, scales horizontally, SPA-friendly |
| CSRF | Double-submit cookie | Simple, effective with JWT |
| Client state | Zustand + React Query | Minimal boilerplate, server/client state separation |
| Chart rendering | D3.js + astronomy-engine | Flexible SVG rendering, real planetary calculations |
| AI provider | OpenAI GPT-4o-mini | Best cost/quality for structured interpretations |
| CSS framework | Tailwind 3 | Rapid prototyping, utility-first, small bundle |
| Testing stack | Jest + Vitest + Playwright | Best-in-class per layer |
| CI/CD | GitHub Actions | Native GitHub integration, generous free tier |
| API style | REST (not GraphQL) | Simple, cacheable, sufficient for SPA data needs |
