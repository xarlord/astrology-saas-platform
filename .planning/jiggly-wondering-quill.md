# Plan: Frontend Gap Closure — Style, Font, and Accessibility Fixes

## Context

A comprehensive audit of all 22 page files, AppLayout, and 40+ components found **30 distinct issues** across three domains: visual theme inconsistency, broken accessibility, and code duplication. The CSS design token system and Tailwind cosmic theme are already in place (`index.css` has `:root` custom properties, `tailwind.config.js` has `cosmic.*` color tokens). The problem is **underutilization** — pages and components hardcode hex values instead of using tokens, legacy CSS classes use light-theme defaults, and accessibility patterns are incomplete.

**What prompted this:** The E2E full user journey test exposed pages that render bare-bones or with broken navigation (forgot-password → 404). Visual inspection revealed Home/Login/Register pages still use light-theme styling. Accessibility audit found 130+ icon instances without `aria-hidden`, 18 pages missing `<h1>`, universal `outline: none` killing all focus indicators, and keyboard-inaccessible interactive elements.

**Peer review:** Two specialist agents (architecture + accessibility) reviewed this plan. Their findings are integrated: AuthenticationForms.tsx duplication resolved as a decision task, aria-hidden changed from bulk replace to audit-based approach, 4 critical accessibility gaps added (outline:none removal, ShareManagement focus trap, theme selector ARIA, StaticPage auth boundary), scope corrected (gray→slate is 44 files not 10, h2→h1 is 18 pages not 16), and BirthdaySharing/LunarReturnDashboard split into separate full-rewrite tasks.

## Current State (Verified)

- **Fonts**: Space Grotesk (sans/body) + Cormorant Garamond (display/serif) via Google Fonts. Configured in `tailwind.config.js` lines 102-105.
- **CSS tokens**: `index.css` lines 6-48 define `--color-bg-page`, `--color-bg-card`, `--color-border`, etc.
- **Tailwind tokens**: `tailwind.config.js` lines 11-19 define `cosmic.page`, `cosmic.card`, `cosmic.border`, etc.
- **Material Symbols**: Loaded in `index.html`, used across the app.
- **AppLayout**: Provides `<main>`, skip-nav, sidebar, top nav, footer. Used by 19/22 pages.
- **AuthenticationForms.tsx** (747 lines): Full-featured login/register forms with dark theme, ARIA, validation. Already exists but LoginPage/RegisterPage use separate simpler forms with light theme instead.

---

## Phase 1: Theme Foundation (7 tasks)

Fix the shared CSS classes and create missing layout wrappers so all subsequent page work builds on correct foundations.

### Task 1: Rewrite CSS component classes for cosmic dark theme

**File:** [index.css](frontend/src/index.css) lines 134-148

Replace light-theme defaults:
- `.btn-primary` (line 134): `bg-primary-600 → bg-primary`, remove `hover:bg-primary-700`
- `.btn-secondary` (line 138): `bg-gray-200 text-gray-800 → bg-white/5 text-slate-300 border border-[var(--color-border)] hover:bg-white/10`
- `.card` (line 142): `bg-white dark:bg-gray-800 shadow-md → bg-[var(--color-bg-card)] backdrop-blur-md border border-[var(--color-border)]`
- `.input` (line 146): `border-gray-300 dark:border-gray-600 → border-[var(--color-border)] bg-white/5 text-white focus:border-primary focus:ring-primary`

Also fix focus-visible colors (lines 67-82) from `#3b82f6` to `var(--color-accent)` for brand consistency.

### Task 2: Remove universal `outline: none` — CRITICAL accessibility fix

**File:** [index.css](frontend/src/index.css) lines 85-87

**Problem:** `* { outline: none; }` removes ALL default focus indicators, violating WCAG 2.4.7 (Focus Visible). This is the single most impactful accessibility issue.

**Fix:**
- Remove the `* { outline: none; }` rule entirely
- Ensure `@layer base` focus-visible styles (lines 67-82) provide adequate replacement indicators with `var(--color-accent)` ring
- Verify keyboard tab navigation shows visible focus rings on all interactive elements

### Task 3: Create `PublicPageLayout` component

**File:** Create [PublicPageLayout.tsx](frontend/src/components/PublicPageLayout.tsx)

Home, Login, Register, ForgotPassword, and NotFound don't use AppLayout (sidebar inappropriate for public pages). They need their own wrapper providing:
- Skip-to-content link (reuse `.skip-link` from index.css)
- `<main id="main-content" tabIndex={-1}>` landmark
- Dark background (`bg-[var(--color-bg-page)]`)
- Minimal cosmic footer
- Optional prop for whether to show auth links in footer (e.g. ForgotPassword shouldn't show "Forgot Password?" link)

### Task 4: Add missing barrel exports

**File:** [components/index.ts](frontend/src/components/index.ts)

Add exports for: `AstrologicalCalendar`, `TransitCalendar`, `SynastryPage`, `UsageMeter`, `ErrorBoundary`, `PublicPageLayout`.

### Task 5: Fix AppLayout dead code and missing nav links

**File:** [AppLayout.tsx](frontend/src/components/AppLayout.tsx)

- Remove unused `const { logout: _logout } = useAuth()` at line 10
- Add `/calendar` link to sidebar Tools section (between Calendar-related items)
- Add `/lunar-returns` link to sidebar Tools section
- Footer lines 517, 523: `<a href="#">` → replace with `<span>` for social icons (dead links, no real social profiles)

### Task 6: Add skip-to-content and `<main>` to standalone pages

**Files:** [HomePage.tsx](frontend/src/pages/HomePage.tsx), [LoginPage.tsx](frontend/src/pages/LoginPage.tsx), [RegisterPage.tsx](frontend/src/pages/RegisterPage.tsx)

These three pages render outside AppLayout and lack `<main>` landmark and skip-nav. Wrapping them in `<PublicPageLayout>` (Task 3) fixes this.

### Task 7: Fix static page icons and auth boundary

**Files:** [staticPages.ts](frontend/src/data/staticPages.ts), [StaticPage.tsx](frontend/src/pages/StaticPage.tsx)

Two issues:
1. **Dead icon field**: The `icon` field references lucide names (`Sparkles`, `LayoutGrid`, etc.) but lucide-react is not installed. Replace with Material Symbol names: `auto_awesome`, `grid_view`, `credit_card`, `code`, `menu_book`, `help`, `work`, `mail`, `shield`, `description`, `cookie`. Render the icon in StaticPage.tsx header using `<span className="material-symbols-outlined">`.
2. **Auth boundary**: StaticPage uses AppLayout (which requires auth). Static pages like /about and /features should be publicly accessible. Either:
   - (a) Wrap StaticPage in PublicPageLayout instead of AppLayout, OR
   - (b) Add a prop to AppLayout for public pages that hides sidebar/auth elements

Option (a) is simpler — static pages don't need the sidebar. This also requires moving the static page routes in App.tsx from the protected section to the public section.

---

## Phase 2: Broken Routes & Structure (3 tasks)

### Task 8: Create ForgotPasswordPage

**Files:** Create [ForgotPasswordPage.tsx](frontend/src/pages/ForgotPasswordPage.tsx), edit [App.tsx](frontend/src/App.tsx)

- Simple form: email input + submit button + "Back to login" link
- Uses `PublicPageLayout`
- On submit: show "Check your email" confirmation (backend endpoint may not exist yet — just show success message)
- Add `<Route path="/forgot-password">` to App.tsx public routes (around line 58)
- Fix LoginPage.tsx line 94: `<a href="/forgot-password">` → `<Link to="/forgot-password">`

### Task 9: Replace 404 catch-all with proper NotFoundPage

**Files:** Create or update [NotFoundPage.tsx](frontend/src/pages/NotFoundPage.tsx), edit [App.tsx](frontend/src/App.tsx) line 233

Replace bare inline `<div>Page not found</div>` with a component that:
- Uses `PublicPageLayout`
- Has `<h1>Page Not Found</h1>`
- Shows a Link back to home
- No `text-gray-500`

### Task 10: Fix broken links across pages

**Files:** [LoginPage.tsx](frontend/src/pages/LoginPage.tsx), [HomePage.tsx](frontend/src/pages/HomePage.tsx)

- `HomePage.tsx` lines 18, 21: `<a href="/register">` / `<a href="/login">` → `<Link to="...">`

---

## Phase 3: Accessibility — Critical WCAG Fixes (8 tasks)

### Task 11: Fix heading hierarchy — `<h2>` → `<h1>` on 18 pages

All pages inside AppLayout start with `<h2>`. Change the main page heading to `<h1>` in:

| File | Line |
|------|------|
| [DashboardPage.tsx](frontend/src/pages/DashboardPage.tsx) | 27 |
| [ChartCreatePage.tsx](frontend/src/pages/ChartCreatePage.tsx) | 21 |
| [ChartViewPage.tsx](frontend/src/pages/ChartViewPage.tsx) | 63 |
| [AnalysisPage.tsx](frontend/src/pages/AnalysisPage.tsx) | 85 |
| [TransitPage.tsx](frontend/src/pages/TransitPage.tsx) | 179 |
| [TodayTransitsPage.tsx](frontend/src/pages/TodayTransitsPage.tsx) | 142 |
| [ForecastPage.tsx](frontend/src/pages/ForecastPage.tsx) | 180 |
| [ProfilePage.tsx](frontend/src/pages/ProfilePage.tsx) | 17 |
| [SolarReturnsPage.tsx](frontend/src/pages/SolarReturnsPage.tsx) | 158 |
| [CalendarPage.tsx](frontend/src/pages/CalendarPage.tsx) | 14 |
| [MoonCalendarPage.tsx](frontend/src/pages/MoonCalendarPage.tsx) | 16 |
| [LunarReturnsPage.tsx](frontend/src/pages/LunarReturnsPage.tsx) | 92 |
| [RetrogradePage.tsx](frontend/src/pages/RetrogradePage.tsx) | 94 |
| [EphemerisPage.tsx](frontend/src/pages/EphemerisPage.tsx) | 150 |
| [LearnPage.tsx](frontend/src/pages/LearnPage.tsx) | 123 |
| [SettingsPage.tsx](frontend/src/pages/SettingsPage.tsx) | 125 |
| [SubscriptionPage.tsx](frontend/src/pages/SubscriptionPage.tsx) | 193 |
| [SynastryPage.tsx](frontend/src/pages/SynastryPage.tsx) | wrapper heading |

Keep the same styling classes (`text-3xl font-bold`), only change the tag.

### Task 12: Audit and add `aria-hidden` / `aria-label` to Material Symbol icons

**Scope:** ~130+ icon instances across 32+ files

**Approach: Manual audit, NOT bulk find-and-replace.** Bulk replacement is risky because:
- Icons that are the sole content of a button need `aria-label` on the button, not `aria-hidden` on the icon
- Some icons convey meaningful status (error, warning, success) and should have accessible text
- Decorative icons adjacent to visible text labels should get `aria-hidden="true"`

**Process:**
1. `grep -r "material-symbols-outlined" frontend/src/ --include="*.tsx" | grep -v "aria-hidden" | grep -v "aria-label"` — get full list
2. For each instance, classify:
   - **Decorative** (icon + visible text label): add `aria-hidden="true"` to the `<span>`
   - **Functional** (icon is sole button content): add `aria-label` to parent `<button>` + `aria-hidden="true"` to icon
   - **Status** (icon conveys meaning): add `role="img"` + `aria-label` to the `<span>`
3. Verify count drops to zero after fixes

### Task 13: Make all `<div onClick>` elements keyboard accessible

**Files:**
- [DashboardPage.tsx](frontend/src/pages/DashboardPage.tsx) lines 43, 80 — chart cards and "Create New Chart" card
- Any other `<div onClick>` found via `grep -r "onClick" frontend/src/ --include="*.tsx" | grep "<div"`

For each clickable `<div>`:
- Add `role="button"`, `tabIndex={0}`, `onKeyDown` handler for Enter/Space
- Add descriptive `aria-label`
- Consider converting to `<button>` or `<Link>` where semantically appropriate

### Task 14: Make AppLayout user dropdown keyboard accessible

**File:** [AppLayout.tsx](frontend/src/components/AppLayout.tsx) line 120

The dropdown is CSS `group-hover` only. Convert to React state:
- `aria-expanded`, `aria-haspopup="menu"` on trigger button
- `role="menu"` on dropdown, `role="menuitem"` on items
- Escape to close, ArrowDown/Enter to open
- Reuse `useFocusTrap` hook from [useFocusTrap.ts](frontend/src/hooks/useFocusTrap.ts)

### Task 15: Add ARIA tab roles to 3 tab implementations

**Files:**
- [SolarReturnsPage.tsx](frontend/src/pages/SolarReturnsPage.tsx) `renderViewModeTabs` (lines 126-152)
- [LunarReturnsPage.tsx](frontend/src/pages/LunarReturnsPage.tsx) `renderViewModeTabs` (lines 60-86)
- [UserProfile.tsx](frontend/src/components/UserProfile.tsx) tab navigation (lines 192-213)

Add: `role="tablist"` on wrapper, `role="tab"` + `aria-selected` + `aria-controls` on each button, `role="tabpanel"` + `aria-labelledby` on panels. Add arrow key navigation.

### Task 16: Add ARIA roles to UserProfile theme selector

**File:** [UserProfile.tsx](frontend/src/components/UserProfile.tsx) lines 686-703

Theme selector buttons lack radiogroup pattern. Add:
- `role="radiogroup"` + `aria-label="Theme"` on wrapper
- `role="radio"` + `aria-checked` on each theme button
- Arrow key navigation between options

### Task 17: Fix form accessibility — labels, contrast, alert() calls

**Files:**
- [UserProfile.tsx](frontend/src/components/UserProfile.tsx) lines 372-423: Add `htmlFor`/`id` matching on 4 label/input pairs
- [UserProfile.tsx](frontend/src/components/UserProfile.tsx) line 171: Replace `window.confirm()` with accessible confirmation dialog
- [RegisterPage.tsx](frontend/src/pages/RegisterPage.tsx) line 23: Replace `alert('Passwords do not match')` with inline error message + `aria-live="polite"`
- [SolarReturnsPage.tsx](frontend/src/pages/SolarReturnsPage.tsx) line 245: Replace `alert('Solar return shared successfully!')` with inline toast + `role="status"`
- Fix low-contrast text: `text-slate-500` → `text-slate-400` in UserProfile, SolarReturnsPage, DashboardPage, TransitDashboard, PersonalityAnalysis (6+ files)

### Task 18: Add focus trapping to ShareManagement modal

**File:** [ShareManagement.tsx](frontend/src/components/ShareManagement.tsx)

The modal has `role="dialog"` and `aria-modal="true"` but NO focus trapping or Escape handler — keyboard users can tab out of the modal into the page behind it.

**Fix:**
- Use `useFocusTrap` hook from [useFocusTrap.ts](frontend/src/hooks/useFocusTrap.ts)
- Add `onKeyDown` handler for Escape to close
- Set initial focus to first focusable element on open
- Restore focus to trigger element on close

---

## Phase 4: Home / Login / Register — Auth Form Decision (2 tasks)

These three pages need full dark-theme conversion. A peer review blocker: `AuthenticationForms.tsx` (747 lines) already has dark-themed login/register forms with full ARIA, validation, and proper styling. LoginPage.tsx (120 lines) and RegisterPage.tsx (142 lines) are simpler duplicate forms with light theme.

### Task 19: Resolve AuthenticationForms vs standalone form duplication

**Decision:** Replace LoginPage.tsx and RegisterPage.tsx with thin wrappers around AuthenticationForms.tsx, rather than restyling the standalone forms.

**Rationale:**
- AuthenticationForms already has: dark theme, ARIA attributes, validation, error handling
- The standalone forms duplicate this logic with light theme and missing ARIA
- Maintaining two implementations means bugs get fixed in one but not the other

**Implementation:**
- Expose `LoginForm` and `RegisterForm` named exports from AuthenticationForms.tsx (they may already exist or need extraction)
- [LoginPage.tsx](frontend/src/pages/LoginPage.tsx): Replace entire content with PublicPageLayout wrapper + `<LoginForm />`
- [RegisterPage.tsx](frontend/src/pages/RegisterPage.tsx): Replace entire content with PublicPageLayout wrapper + `<RegisterForm />`
- Fix the password mismatch `alert()` in the process (AuthenticationForms may handle this properly already — verify)
- If AuthenticationForms doesn't have password confirmation flow, add it there

### Task 20: Overhaul HomePage

**File:** [HomePage.tsx](frontend/src/pages/HomePage.tsx)

- Wrap in `<PublicPageLayout>`
- Replace `<a href>` with `<Link to>` (lines 18, 21)
- Replace light gradient header with cosmic dark hero
- Replace `text-primary-600` → `text-white`, `text-primary-100` → `text-slate-300`
- Feature cards: emoji → Material Symbols, plain card → glassmorphic cosmic card
- Remove standalone footer (PublicPageLayout provides one)

---

## Phase 5: Color Consistency (4 tasks)

### Task 21: Replace `text-gray-*` with `text-slate-*` across 44 files

Tailwind's `gray` has blue undertones that differ from `slate`, creating subtle inconsistency. Peer review found this affects **44 files**, not 10+.

**Map:** `text-gray-300` → `text-slate-400`, `text-gray-400` → `text-slate-400`, `text-gray-500` → `text-slate-500`, `text-gray-600` → `text-slate-400`, `text-gray-700` → `text-slate-300`, `bg-gray-200` → `bg-white/10`, `border-gray-300` → `border-cosmic-border`

**Special attention — files with `text-gray-800` or `bg-gray-100` (light-theme patterns that look broken on dark background):** BirthdaySharing, LunarReturnDashboard, ShareManagement, ReminderSettings.

### Task 22: Replace hardcoded hex values with Tailwind tokens (batch 1 — pages)

~193 hardcoded hex values across pages. Replace with cosmic tokens:
- `bg-[#0B0D17]` → `bg-cosmic-page`
- `bg-[#141627]/70` → `bg-cosmic-card`
- `bg-[#141627]` → `bg-cosmic-card-solid`
- `border-[#2f2645]` → `border-cosmic-border`
- `text-[#6b3de1]` → `text-primary`
- `bg-primary-600` → `bg-primary`

Skip: D3 chart visualization colors, planet-specific colors in ChartWheel.

### Task 23: Replace hardcoded hex values (batch 2 — components)

Same replacement pattern applied to all `.tsx` files in `components/`.

### Task 24: Full dark-theme rewrite of BirthdaySharing

**File:** [BirthdaySharing.tsx](frontend/src/components/BirthdaySharing.tsx)

This component is entirely light-themed (`bg-white`, `text-gray-800`, `border-gray-300`) — not just color tweaks, needs full dark theme conversion:
- All `bg-white` → `bg-cosmic-card` with backdrop-blur
- All `text-gray-800` → `text-white`, `text-gray-600` → `text-slate-400`
- All `border-gray-300` → `border-cosmic-border`
- Button styles → cosmic primary button pattern
- Verify the sharing preview still renders correctly after theme change

### Task 25: Full dark-theme rewrite of LunarReturnDashboard

**File:** [LunarReturnDashboard.tsx](frontend/src/components/LunarReturnDashboard.tsx)

Same situation as BirthdaySharing — entirely light-themed. Full conversion needed:
- Same pattern as Task 24
- Pay special attention to any charts/visualizations — ensure they remain readable on dark background
- Check contrast ratios for all text colors after conversion

---

## Phase 6: Code Deduplication (3 tasks)

### Task 26: Extract shared transit helpers

**New file:** [transitHelpers.ts](frontend/src/utils/transitHelpers.ts)

Three functions copy-pasted across TransitPage, TodayTransitsPage, ForecastPage:
- `mapReadingToTransit()` — identical in all 3
- `deriveHighlights()` — identical in all 3
- `buildCalendarDays()` — identical in TransitPage and ForecastPage
- `buildSingleCalendarDay()` — TodayTransitsPage variant

Extract all four to `utils/transitHelpers.ts`, update imports in all three pages.

### Task 27: Deduplicate CalendarPage and MoonCalendarPage

[CalendarPage.tsx](frontend/src/pages/CalendarPage.tsx) and [MoonCalendarPage.tsx](frontend/src/pages/MoonCalendarPage.tsx) are 95% identical — both wrap `AstrologicalCalendar` with a heading.

Create a shared `CalendarPageShell` component accepting `title` and `description` props. Both pages use it. Keep both routes for URL semantics.

### Task 28: Disambiguate TransitPage heading

[TransitPage.tsx](frontend/src/pages/TransitPage.tsx) line 179 says "Transit Forecast" — same as ForecastPage line 180. Rename TransitPage heading to "Current Transits" to differentiate.

---

## Execution Order

```
Phase 1 (Foundation)     ─── Tasks 1-7   ── ~2 hrs
Phase 2 (Routes)         ─── Tasks 8-10  ── ~1 hr     (can parallel with Phase 1)
Phase 3 (Accessibility)  ─── Tasks 11-18 ── ~3 hrs    (start after Phase 1)
Phase 4 (Auth Forms)     ─── Tasks 19-20 ── ~1.5 hrs  (depends on Phase 1)
Phase 5 (Color Cleanup)  ─── Tasks 21-25 ── ~3 hrs    (after Phase 1)
Phase 6 (Dedup)          ─── Tasks 26-28 ── ~45 min   (independent)
                                              Total: ~11.5 hrs
```

## Verification (End-to-End)

1. `cd frontend && npx tsc --noEmit` — zero errors
2. `cd frontend && npx vitest run` — all pass
3. `cd frontend && npx playwright test` — E2E full journey passes
4. `grep -r "text-gray-" frontend/src/ --include="*.tsx"` — zero hits
5. `grep -r "text-primary-600" frontend/src/ --include="*.tsx"` — zero hits
6. `grep -r "outline: none" frontend/src/index.css` — zero hits (universal outline removed)
7. `grep -r "material-symbols-outlined" frontend/src/ --include="*.tsx" | grep -v "aria-hidden" | grep -v "aria-label"` — near zero
8. Navigate to `/forgot-password` — renders with form
9. Navigate to `/nonexistent` — renders NotFoundPage with navigation
10. Navigate to `/about` — renders without requiring auth (public)
11. Keyboard-only: Tab through DashboardPage — chart cards focusable and activatable
12. Keyboard-only: Tab into ShareManagement modal — focus trapped, Escape closes
13. Screen reader: all pages have `<h1>`, skip-to-content works
14. Lighthouse Accessibility score > 90

## Critical Files Summary

| File | Tasks | Purpose |
|------|-------|---------|
| [index.css](frontend/src/index.css) | 1, 2 | CSS dark-theme fix + remove outline:none |
| [AppLayout.tsx](frontend/src/components/AppLayout.tsx) | 5, 14 | Dead code, nav links, dropdown a11y |
| [App.tsx](frontend/src/App.tsx) | 7, 8, 9 | Static pages public, forgot-password route, fix 404 |
| [PublicPageLayout.tsx](frontend/src/components/PublicPageLayout.tsx) | 3 | New — public page wrapper |
| [NotFoundPage.tsx](frontend/src/pages/NotFoundPage.tsx) | 9 | New — proper 404 |
| [ForgotPasswordPage.tsx](frontend/src/pages/ForgotPasswordPage.tsx) | 8 | New — forgot password form |
| [HomePage.tsx](frontend/src/pages/HomePage.tsx) | 6, 10, 20 | Full cosmic overhaul |
| [LoginPage.tsx](frontend/src/pages/LoginPage.tsx) | 6, 19 | Replace with AuthenticationForms wrapper |
| [RegisterPage.tsx](frontend/src/pages/RegisterPage.tsx) | 6, 19 | Replace with AuthenticationForms wrapper |
| [AuthenticationForms.tsx](frontend/src/components/AuthenticationForms.tsx) | 19 | Extract/clean up for reuse |
| [DashboardPage.tsx](frontend/src/pages/DashboardPage.tsx) | 11, 13 | h1 fix, keyboard a11y |
| [components/index.ts](frontend/src/components/index.ts) | 4 | Missing barrel exports |
| [staticPages.ts](frontend/src/data/staticPages.ts) | 7 | Icon field fix + auth boundary |
| [StaticPage.tsx](frontend/src/pages/StaticPage.tsx) | 7 | Switch to PublicPageLayout |
| [UserProfile.tsx](frontend/src/components/UserProfile.tsx) | 15, 16, 17 | Tab ARIA, theme radio, label fixes |
| [ShareManagement.tsx](frontend/src/components/ShareManagement.tsx) | 18 | Focus trap for modal |
| [BirthdaySharing.tsx](frontend/src/components/BirthdaySharing.tsx) | 24 | Full dark-theme rewrite |
| [LunarReturnDashboard.tsx](frontend/src/components/LunarReturnDashboard.tsx) | 25 | Full dark-theme rewrite |
| 18 page files | 11 | h2 → h1 change |
| 32 component/page files | 12 | aria-hidden audit |
| 44 files | 21 | gray → slate replacement |
