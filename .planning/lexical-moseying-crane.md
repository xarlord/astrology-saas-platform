# Plan: Add All Missing Pages

## Context
Navigation links in `AppLayout.tsx` point to 20+ URLs that have no corresponding routes in `App.tsx`, showing "Page not found". The user wants every navigation link to resolve to a real page. This plan creates all missing page components and wires up all routes.

---

## Dead-End Links Inventory

### Sidebar (AppLayout.tsx)
| Line | URL | Status |
|------|-----|--------|
| 211 | `/transits/today` | No route |
| 227 | `/charts/natal` | No route (should redirect to `/charts/new`) |
| 234 | `/compatibility` | No route (SynastryPage exists at `/synastry`) |
| 259 | `/ephemeris` | No route |
| 266 | `/moon-calendar` | No route |
| 273 | `/retrograde` | No route |
| 293 | `/subscription` | No route |

### TopNav (AppLayout.tsx)
| Line | URL | Status |
|------|-----|--------|
| 144 | `/settings` | No route |

### navItems / mobileNavItems (lines 558-569)
| URL | Status |
|-----|--------|
| `/charts` | No route (DashboardPage has chart grid at `/dashboard`) |
| `/forecast` | No route |
| `/learn` | No route |

### Footer (lines 442-518)
| URLs | Status |
|------|--------|
| `/features`, `/pricing`, `/api`, `/blog`, `/support` | No routes |
| `/about`, `/careers`, `/contact` | No routes |
| `/privacy`, `/terms`, `/cookies` | No routes |

---

## Phase 1: Redirects & Aliases (3 routes, no new pages)

**Goal**: Fix links that should point to existing pages.

1. Add to `App.tsx`:
   - `<Route path="/charts" element={<Navigate to="/dashboard" replace />} />`
   - `<Route path="/charts/natal" element={<Navigate to="/charts/new" replace />} />`
   - `<Route path="/compatibility" element={<Navigate to="/synastry" replace />} />`
2. Import `Navigate` from `react-router-dom`

**Files**: `frontend/src/App.tsx`

---

## Phase 2: Feature Pages — Reuse Existing Components (5 pages)

**Goal**: Create thin page wrappers around existing components that already have full functionality.

### 2a. `/transits/today` — TodayTransitsPage
- Wraps `TransitDashboard` component with `viewMode="today"`
- Uses `useTodayTransits` hook (from `services/transit.service.ts`)
- Pattern: `<AppLayout>` + React Query loading states

### 2b. `/forecast` — ForecastPage
- Wraps `TransitDashboard` component with `viewMode="highlights"`
- Uses `useTransitForecast` hook
- Pattern: same as TodayTransitsPage

### 2c. `/moon-calendar` — MoonCalendarPage
- Wraps `AstrologicalCalendar` component
- Uses `useCalendarEvents` hook
- Pattern: simple wrapper like CalendarPage

### 2d. `/retrograde` — RetrogradePage
- Wraps `TransitCalendar` component with `showRetrogrades={true}`
- Uses `useTransitCalendar` hook
- Shows retrograde-focused view with planet filters

### 2e. `/learn` — LearnPage
- Static educational content about astrology basics
- Sections: Planets, Signs, Houses, Aspects
- Uses `AppLayout` wrapper
- Content sourced from `backend/src/data/interpretations.ts` patterns

**Files to create**: 5 new files in `frontend/src/pages/`
**Files to modify**: `frontend/src/App.tsx` (add routes + imports)

---

## Phase 3: Feature Pages — New Content (3 pages)

### 3a. `/ephemeris` — EphemerisPage
- Shows current planetary positions table
- Uses `useTodayTransits` for real-time positions
- Table columns: Planet, Sign, Degree, House, Retrograde status
- Optional: simple chart visualization

### 3b. `/settings` — SettingsPage
- Uses `AppLayout` wrapper
- Sections: Profile settings, Notification preferences, Display preferences (dark mode)
- Reuses existing `UserProfile` component patterns
- Saves to user profile via existing API

### 3c. `/subscription` — SubscriptionPage
- Uses `AppLayout` wrapper
- Shows current plan, usage stats, upgrade options
- Reuses `UsageMeter` component
- Static pricing tiers for now

**Files to create**: 3 new files in `frontend/src/pages/`
**Files to modify**: `frontend/src/App.tsx`

---

## Phase 4: Static Footer Pages (1 reusable component + routes)

**Goal**: Create a generic `StaticPage` component and wire up all footer links.

Create `frontend/src/pages/StaticPage.tsx`:
- Accepts a `pageKey` prop
- Maps to title + markdown content from a `content/` data file
- Uses `AppLayout` wrapper
- Responsive layout with proper heading hierarchy

Create `frontend/src/data/staticPages.ts`:
- Content map for each footer page key
- Pages: `features`, `pricing`, `api`, `blog`, `support`, `about`, `careers`, `contact`, `privacy`, `terms`, `cookies`

Routes in `App.tsx`:
```
<Route path="/about" element={<StaticPage pageKey="about" />} />
<Route path="/features" element={<StaticPage pageKey="features" />} />
... (11 routes total)
```

**Files to create**: `frontend/src/pages/StaticPage.tsx`, `frontend/src/data/staticPages.ts`
**Files to modify**: `frontend/src/App.tsx`

---

## Phase 5: Wire Up All Routes in App.tsx

Final `App.tsx` route list (all new routes marked with NEW/REDIRECT):

```
/                          → HomePage
/login                     → LoginPage
/register                  → RegisterPage
/dashboard                 → DashboardPage (protected)
/charts                    → REDIRECT to /dashboard (NEW)
/charts/new                → ChartCreatePage (protected)
/charts/natal              → REDIRECT to /charts/new (NEW)
/charts/:id                → ChartViewPage (protected)
/analysis/:chartId         → AnalysisPage (protected)
/transits                  → TransitPage (protected)
/transits/today            → TodayTransitsPage (protected) (NEW)
/forecast                  → ForecastPage (protected) (NEW)
/compatibility             → REDIRECT to /synastry (NEW)
/synastry                  → SynastryPageWrapper (protected)
/moon-calendar             → MoonCalendarPage (protected) (NEW)
/retrograde                → RetrogradePage (protected) (NEW)
/ephemeris                 → EphemerisPage (protected) (NEW)
/learn                     → LearnPage (protected) (NEW)
/settings                  → SettingsPage (protected) (NEW)
/subscription              → SubscriptionPage (protected) (NEW)
/profile                   → ProfilePage (protected)
/solar-returns             → SolarReturnsPage (protected)
/solar-returns/:year       → SolarReturnsPage (protected)
/calendar                  → CalendarPage (protected)
/lunar-returns             → LunarReturnsPage (protected)
/about                     → StaticPage (NEW)
/features                  → StaticPage (NEW)
/pricing                   → StaticPage (NEW)
/api                       → StaticPage (NEW)
/blog                      → StaticPage (NEW)
/support                   → StaticPage (NEW)
/careers                   → StaticPage (NEW)
/contact                   → StaticPage (NEW)
/privacy                   → StaticPage (NEW)
/terms                     → StaticPage (NEW)
/cookies                   → StaticPage (NEW)
*                          → 404
```

---

## Phase 6: Verify

1. `cd frontend && npx tsc --noEmit` — type check passes
2. `cd frontend && npx eslint src --ext ts,tsx` — no new warnings
3. `cd frontend && npx vitest run` — all existing tests pass
4. Manual: click every link in sidebar, nav, mobile nav, footer — all resolve to pages
5. Verify redirects: `/charts` → `/dashboard`, `/charts/natal` → `/charts/new`, `/compatibility` → `/synastry`

---

## Execution Order

1. Phase 1 (redirects) — 5 min, just App.tsx changes
2. Phase 2 (5 reuse pages) — can be parallelized (independent page files)
3. Phase 3 (3 new pages) — can be parallelized
4. Phase 4 (static pages) — independent
5. Phase 5 (final App.tsx wiring) — depends on 1-4
6. Phase 6 (verify) — depends on all

**Total scope**: 11 new page files, 1 data file, 1 modified App.tsx
