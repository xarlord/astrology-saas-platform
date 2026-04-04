# Sprint 3: UX Audit Report

**Date:** 2026-04-04
**Auditor:** UX Designer Agent
**Scope:** US-3.1 (Onboarding), US-3.2 (Accessibility & Responsive), Layout Consistency
**Reference:** stitch-UI mockups, WCAG 2.1 AA, Sprint Plan US-3.1/US-3.2

---

## Executive Summary

The AstroVerse frontend is **~85% complete** with a strong design system foundation (Tailwind tokens, CSS variables, TypeScript constants, 30 Stitch mockups, 65+ components). However, several critical UX gaps prevent the product from meeting its Sprint 3 acceptance criteria:

- **2 critical issues** (broken route, unused layout shell)
- **4 high-priority issues** (brand inconsistency, color contrast, no page titles, weak empty states)
- **3 medium-priority issues** (no progressive onboarding, no skip-link on dashboard, chart wheel mobile unverified)

**Overall UX Score: 7.2/10** (down from 7.8 due to discovered integration gaps)

---

## Critical Issues (P0 — Must Fix Before Launch)

### C1. WelcomeModal Routes to Non-Existent Page

**File:** `frontend/src/components/WelcomeModal.tsx:185`
**Impact:** New users who lack a chart click "Add Birth Data" → navigate to `/onboarding/birth-data` → **404 page**
**Acceptance Criteria Failed:** US-3.1 "Registration to first chart under 3 clicks/taps"

**Current behavior:**
```
navigate('/onboarding/birth-data')  // Route does not exist in App.tsx
```

**Fix:**
```tsx
// Change line 185 in WelcomeModal.tsx
navigate('/charts/create');
```

**Verification:** Click "Add Birth Data" → should navigate to Chart Creation Wizard at `/charts/create`

---

### C2. AppLayout Component Built But Never Used

**File:** `frontend/src/components/AppLayout.tsx` (594 lines)
**Impact:** All authenticated pages render without:
- Sidebar navigation
- Skip-to-content link
- Mobile bottom navigation
- Consistent header with user menu

**Root cause:** `App.tsx` renders pages directly inside `<ProtectedRoute>` without wrapping in `<AppLayout>`:
```tsx
// Current (App.tsx:67-73)
<Route path="/dashboard" element={
  <ProtectedRoute><DashboardPage /></ProtectedRoute>
} />

// Expected
<Route path="/dashboard" element={
  <ProtectedRoute><AppLayout><DashboardPage /></AppLayout></ProtectedRoute>
} />
```

**Blockers before adopting AppLayout:**
1. AppLayout uses brand name "AstroSaaS" (line 103, 195) — should be "AstroVerse"
2. AppLayout uses `@heroicons/react` while all other pages use Material Symbols — **icon library mismatch**
3. AppLayout uses gray/white Tailwind theme while DashboardPage and all Stitch mockups use the cosmic dark theme (`bg-[#0B0D17]`, `glass-*` classes)
4. AppLayout's top nav links to `/features`, `/pricing`, `/api`, `/blog`, `/about`, `/careers`, `/contact`, `/privacy`, `/terms`, `/cookies` — **none of these routes exist**
5. DashboardPage has its own header — would need to be removed if wrapped in AppLayout

**Recommended approach:**

**Option A (Recommended): Adopt AppLayout as the auth shell**
- Restyle AppLayout to cosmic dark theme
- Replace Heroicons with Material Symbols
- Fix brand name and nav links
- Remove DashboardPage's custom header
- Wrap all protected routes in AppLayout

**Option B: Keep DashboardPage's custom header, add sidebar separately**
- Less refactoring but creates two navigation systems to maintain
- Not recommended — doubles maintenance burden

**Decision needed from:** CEO + Frontend Engineer

---

## High-Priority Issues (P1)

### H1. Color Contrast Failures

**Source:** `frontend/e2e-reports/accessibility-audit.json`
**WCAG Violation:** WCAG 2.1 AA 1.4.3 (Contrast)

| Element | Location | Foreground | Background | Ratio | Required |
|---------|----------|------------|------------|-------|----------|
| Pricing "/forever", "/mo" text | LandingPage pricing cards | `#64748b` (slate-500) | `#111422` | 3.84:1 | 4.5:1 |
| "Sign In" link | ForgotPasswordPage | `#6b3de1` (primary) | `#151725` | 2.86:1 | 4.5:1 |

**Fix:**
- Pricing period text: Change `text-slate-500` → `text-slate-400` (contrast ~5.3:1)
- Primary link on dark bg: Change `text-primary` → `text-primary-light` or add `hover:text-white` with a lighter default (use `text-violet-300` for ~6.5:1 ratio)

---

### H2. No Per-Page Document Titles

**Impact:** All pages show "AstroVerse - Astrology SaaS Platform" regardless of route
**WCAG:** 2.4.2 Page Titled (best practice)
**Fix:** Add `react-helmet-async` and set `<title>` per page:

| Route | Document Title |
|-------|---------------|
| `/` | `AstroVerse — Discover Your Cosmic Blueprint` |
| `/login` | `Sign In — AstroVerse` |
| `/register` | `Create Account — AstroVerse` |
| `/forgot-password` | `Reset Password — AstroVerse` |
| `/dashboard` | `Dashboard — AstroVerse` |
| `/charts/create` | `Create Chart — AstroVerse` |
| `/charts/:id` | `{chartName} — AstroVerse` |
| `/transits` | `Transit Forecast — AstroVerse` |
| `/synastry` | `Synastry & Compatibility — AstroVerse` |
| `/calendar` | `Astrological Calendar — AstroVerse` |
| `/learning` | `Learning Center — AstroVerse` |
| `/subscription` | `Subscription Plans — AstroVerse` |

---

### H3. Brand Name Inconsistency

**Locations:**
- `AppLayout.tsx:103` — "AstroSaaS"
- `AppLayout.tsx:195` — "AstroSaaS"
- `AppLayout.tsx:558` — "AstroSaaS"
- All other pages — "AstroVerse"

**Fix:** Replace all "AstroSaaS" references with "AstroVerse"

---

### H4. Dashboard Empty State Lacks Engagement

**File:** `DashboardPage.tsx:508-519`
**Current:**
```
<p className="text-slate-400 mb-4">No charts yet</p>
<Button variant="primary" onClick={handleCreateChart}>Create Your First Chart</Button>
```

**Acceptance Criteria:** US-3.1 "Empty dashboard state shows CTAs (not blank page)"

**Issues:**
- No visual icon/illustration to break the text monotony
- No secondary CTA (e.g., "Learn about natal charts")
- Doesn't use the existing `EmptyState` component with `EmptyStates.NoCharts`

**Recommended spec:** Replace with `EmptyStates.NoCharts` factory component, which includes:
- Zodiac-themed icon
- "No Charts Yet" title
- "Create your first natal chart to unlock personalized cosmic insights" description
- Primary CTA: "Create Your First Chart" → `/charts/create`
- Secondary CTA: "Learn About Charts" → `/learning`

---

## Medium-Priority Issues (P2)

### M1. No Progressive Onboarding Flow

**Acceptance Criteria:** US-3.1 "Welcome modal guides new users after registration"

**Current flow:**
1. User registers → redirected to `/dashboard`
2. WelcomeModal shows (if not dismissed)
3. User must discover "New Chart" button in header or empty state
4. No guidance between registration and first chart creation

**Recommended onboarding flow:**

```
Register → Dashboard (WelcomeModal) → Chart Creation Wizard → Chart Detail View
   ↓            ↓                          ↓                      ↓
   1 click     2 click                   3 clicks              Value!
```

**WelcomeModal improvements needed:**
1. Fix broken `/onboarding/birth-data` → `/charts/create` (C1)
2. Add progress indicator: "Step 1 of 2 — Create Your Chart"
3. Auto-redirect to `/charts/create` after dismiss if user has no charts
4. Show different welcome content based on chart count:
   - 0 charts: "Let's create your first chart!" (primary CTA)
   - 1+ charts: Current behavior (chart preview)

---

### M2. DashboardPage Has No Skip-Link or Semantic Landmarks

**File:** `DashboardPage.tsx`
**WCAG:** 2.4.1 Bypass Blocks, 1.3.1 Info and Relationships

**Issues:**
- No skip-to-content link
- `<header>` used but no `role="banner"`
- `<main>` tag present but no `id` for skip-link targeting
- No `role="navigation"` on the header nav

**Fix:** Add semantic HTML and skip-link to DashboardPage header, or adopt AppLayout which already has these.

---

### M3. Chart Creation Wizard — UX Gaps

**File:** `ChartCreationWizardPage.tsx`
**Acceptance Criteria:** US-3.1 "Chart creation wizard handles timezone and location smoothly"

**Issues found:**
1. **No timezone auto-detection**: Birth location field is plain text, no geocoding or timezone lookup
2. **No timezone display**: User enters a time but the timezone is ambiguous
3. **No location autocomplete**: Free-text input for birth location — prone to errors
4. **"Time unknown" UX**: Checkbox exists but doesn't clearly explain that noon default will be used
5. **Live preview panel**: Shows spinning SVG placeholder, not a real chart preview

**Recommendations:**
- Add timezone auto-detect from browser Intl API
- Add a note under the time input: "Times entered in your local timezone (UTC{offset})"
- Consider geocoding API integration for location (post-MVP)
- Enhance "Time unknown" tooltip with: "If you don't know your birth time, we'll use 12:00 PM as default. This may affect house cusp accuracy."

---

## Layout Architecture Analysis

### Current State: Fragmented

| Page | Has Own Header | Has Sidebar | Has Mobile Nav | Has Skip Link |
|------|---------------|-------------|----------------|---------------|
| LandingPage | Yes | No | No | No |
| DashboardPage | Yes | No | No | No |
| ChartCreationWizard | No | No | No | No |
| All other auth pages | No | No | No | No |
| AppLayout (unused) | Yes | Yes | Yes | Yes |

### Target State: Unified

```
Public pages (/, /login, /register, /forgot-password, /subscription):
  → Render standalone (no AppLayout)

All authenticated pages:
  → Wrapped in AppLayout (sidebar + top nav + mobile bottom nav + skip link)
  → DashboardPage removes its custom header
```

### AppLayout Refactor Requirements

1. **Theme**: Change from gray/white to cosmic dark
   - `bg-white dark:bg-gray-800` → `bg-[#0B0D17]`
   - `border-gray-200 dark:border-gray-700` → `border-[#2f2645]`
   - `text-gray-900 dark:text-white` → `text-white`

2. **Icons**: Replace `@heroicons/react` with Material Symbols Outlined
   - All 12 Heroicon usages → Material Symbols equivalents

3. **Brand**: "AstroSaaS" → "AstroVerse"

4. **Navigation links**:
   - Remove dead links (`/features`, `/pricing`, `/api`, `/blog`, `/about`, `/careers`, `/contact`, `/privacy`, `/terms`, `/cookies`)
   - Keep functional links only (`/dashboard`, `/charts`, `/transits`, `/synastry`, `/calendar`, `/solar-returns`, `/lunar-returns`, `/learning`, `/settings`, `/profile`, `/subscription`)

5. **Top nav center links**:
   - "Charts" → `/charts`
   - "Forecast" → `/transits` (currently links to non-existent `/forecast`)
   - "Learn" → `/learning` (currently links to non-existent `/learn`)

---

## Acceptance Criteria Status

### US-3.1: Onboarding Flow Optimization

| Criterion | Status | Notes |
|-----------|--------|-------|
| Landing page clearly communicates value prop | PASS | Hero + features + pricing — well designed |
| Registration to first chart under 3 clicks | **PARTIAL** | Route fixed (C1 DONE), but WelcomeModal CTA still says "Explore My Dashboard" for new users (M1) |
| Welcome modal guides new users | **PARTIAL** | Route fixed, but no progress indicator, CTA not action-oriented for new users (M1) |
| Empty dashboard state shows CTAs | **PARTIAL** | Has "Create Your First Chart" button but weak UX (H4) — see SPRINT3_REMAINING_UX_SPEC.md |
| Chart creation wizard handles timezone/location | **FAIL** | No timezone detection, no location autocomplete (M3) — see SPRINT3_REMAINING_UX_SPEC.md |

### US-3.2: Accessibility & Responsive Design Audit

| Criterion | Status | Notes |
|-----------|--------|-------|
| WCAG 2.1 AA on core pages | **PARTIAL** | Contrast fixed (H1 DONE), but missing landmarks on dashboard (M2) and page titles (H2) |
| Chart wheel mobile rendering | **UNTESTED** | Needs manual verification |
| Navigation accessible on mobile | **PASS** | AppLayout adopted with mobile bottom nav + 44px touch targets (C2 DONE) |
| Form inputs have labels/ARIA/errors | **PARTIAL** | Most forms have labels, some missing ARIA |
| Keyboard navigation for chart wizard | **PASS** | Cmd+Enter shortcut, Tab navigation works |

---

## Recommended Fix Priority Order

| # | Issue | Effort | Impact | Dependencies |
|---|-------|--------|--------|-------------|
| 1 | Fix WelcomeModal broken route (C1) | 5 min | Critical | None |
| 2 | Fix color contrast failures (H1) | 15 min | High | None |
| 3 | Add per-page document titles (H2) | 1 hr | High | npm install react-helmet-async |
| 4 | Fix brand name "AstroSaaS" → "AstroVerse" (H3) | 10 min | Medium | None |
| 5 | Improve dashboard empty state (H4) | 30 min | Medium | None |
| 6 | Adopt AppLayout for auth pages (C2) | 4-6 hr | Critical | Theme refactor, icon migration |
| 7 | Add progressive onboarding (M1) | 2 hr | Medium | C1 fix first |
| 8 | Add semantic landmarks to DashboardPage (M2) | 30 min | Medium | May be resolved by C2 |
| 9 | Improve chart wizard timezone UX (M3) | 2 hr | Medium | None |

---

## Quick Wins (Can Fix Immediately)

These require no architectural decisions and can be fixed by the Frontend Engineer immediately:

1. ~~**WelcomeModal.tsx:185** — Change `/onboarding/birth-data` → `/charts/create`~~ **DONE**
2. ~~**LandingPage pricing** — Change `text-slate-500` → `text-slate-400` for period labels~~ **DONE**
3. ~~**ForgotPasswordPage** — Change `text-primary` → `text-violet-300` for "Sign In" link~~ **DONE**
4. ~~**AppLayout.tsx** — Replace all "AstroSaaS" with "AstroVerse"~~ **DONE**
5. ~~**AppLayout.tsx** — Fix nav links (`/forecast` → `/transits`, `/learn` → `/learning`)~~ **DONE**

> **Updated 2026-04-04 by UX Designer 2:** All quick wins resolved. See `SPRINT3_REMAINING_UX_SPEC.md` for remaining items (H2, H4, M1, M2, M3, DS1).
