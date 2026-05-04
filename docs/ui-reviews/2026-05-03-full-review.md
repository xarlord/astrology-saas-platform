# UI/UX Review Report

**Date:** 2026-05-03
**Reviewer:** Claude Code UI Review System
**Scope:** 10 screens (Home, Login, Register, ForgotPassword, Dashboard, Profile, Settings, Charts, SolarReturns, Feature pages) + 18 shared components
**Screenshots:** `ui-review-*.png` in project root

---

## Summary

| Screen | Visual | Usability | Design System | Responsive | Accessibility | Overall |
|--------|--------|-----------|---------------|------------|---------------|---------|
| Home | 8/10 | 6/10 | 7/10 | 6/10 | 7/10 | 6.8/10 |
| Login | 8/10 | 6/10 | 6/10 | 7/10 | 6/10 | 6.6/10 |
| Register | 8/10 | 7/10 | 6/10 | 6/10 | 7/10 | 6.8/10 |
| ForgotPassword | 6/10 | 5/10 | 5/10 | 7/10 | 6/10 | 5.8/10 |
| Dashboard | 8/10 | 7/10 | 6/10 | 7/10 | 6/10 | 6.8/10 |
| Profile | 7/10 | 8/10 | 7/10 | 8/10 | 7/10 | 7.4/10 |
| Settings | 7/10 | 7/10 | 6/10 | 7/10 | 8/10 | 7.0/10 |
| Charts | 7/10 | 7/10 | 6/10 | 7/10 | 6/10 | 6.6/10 |
| SolarReturns | 7/10 | 7/10 | 6/10 | 6/10 | 7/10 | 6.6/10 |
| Feature Pages | 7/10 | 7/10 | 6/10 | 6/10 | 6/10 | 6.4/10 |

**Overall Score: 6.7/10**

---

## Critical Issues (Must Fix Before Release)

### C1. App Crash: Duplicate React Instances
- **Category:** Usability / Functional
- **Problem:** Console shows `Invalid hook call` + `Cannot read properties of null (reading 'useRef')` — classic sign of multiple React copies
- **Impact:** App may crash on initial load for some users. Pages render but React state is broken
- **Location:** `chunk-BWCKZHXF.js` vs `chunk-LAYFUMMI.js` — two React bundles loaded
- **Fix:** Check `package.json` for duplicate `react` dependencies. Run `npm ls react` to find duplicates. Add `resolve: { dedupe: ['react', 'react-dom'] }` to `vite.config.ts`

### C2. Non-Functional Mobile Menu (HomePage)
- **Category:** Usability
- **Location:** `HomePage.tsx` lines 45-50
- **Problem:** Mobile hamburger button has `aria-label="Open navigation menu"` but NO `onClick` handler and NO mobile navigation menu is rendered. Users on mobile cannot navigate
- **Impact:** Mobile users on the landing page have no way to access login/register through navigation
- **Fix:** Add a mobile drawer/dropdown menu component with navigation links

### C3. Login Page Has No Error Handling
- **Category:** Usability
- **Location:** `LoginPage.tsx` lines 94-102
- **Problem:** The `login()` call uses `.then()` with no `.catch()`. Failed logins produce no visible feedback — the error is silently swallowed
- **Impact:** Users cannot tell why login fails (wrong password, network error, etc.)
- **Fix:** Add `.catch()` handler with error state display. The `AuthenticationForms.tsx` LoginForm already has proper error handling — consider using it

### C4. ForgotPassword Page Has No API Call
- **Category:** Usability
- **Location:** `ForgotPasswordPage.tsx` lines 9-12
- **Problem:** `handleSubmit` just flips `submitted = true` synchronously. No API call, no loading state, no error handling. The form pretends to send a reset email but does nothing
- **Impact:** Users think they'll receive a reset email but nothing happens
- **Fix:** Wire up to the actual password reset API endpoint

### C5. Duplicate Form Implementations
- **Category:** Design System / Architecture
- **Location:** `LoginPage.tsx` + `RegisterPage.tsx` (inline forms) vs `AuthenticationForms.tsx` (shared components)
- **Problem:** Two completely independent implementations of login/register forms exist. The shared `AuthenticationForms.tsx` has proper accessibility (`aria-invalid`, `aria-describedby`, `role="alert"`) and loading spinners. The page-level inline forms lack all of these
- **Impact:** Maintaining two code paths for the same feature leads to divergent UX and bugs
- **Fix:** Refactor LoginPage and RegisterPage to use the shared `AuthenticationForms.tsx` components

---

## High Priority Issues

### H1. Inconsistent Auth Form Styling Across Pages
- **Category:** Visual Design
- **Problem:** Login, Register, and ForgotPassword each style their forms differently:

| Aspect | Login | Register | ForgotPassword |
|--------|-------|----------|----------------|
| Input background | `bg-cosmic-card-solid` | `bg-cosmic-page/50` | `bg-white/15` |
| Input border | `ring-1 ring-inset ring-white/10` | `border border-cosmic-border` | `border border-cosmic-border` |
| Input padding | `py-3.5 pl-11 pr-4` | `py-3 pl-11 pr-4` | `py-2 px-4` |
| Panel radius | `rounded-2xl` | `rounded-2xl` | `rounded-lg` |
| Form spacing | `space-y-6` | `space-y-5` | `space-y-4` |
| Submit button | gradient, `py-3.5`, `rounded-xl` | gradient, `py-3.5`, `rounded-xl` | solid, `py-2.5`, `rounded-lg` |
| Error display | None | `text-red-400 text-xs` | None |

- **Fix:** Create shared form input/button components with consistent tokens

### H2. Login vs Register Mobile Layout Mismatch
- **Category:** Responsive
- **Location:** `LoginPage.tsx` line 15 vs `RegisterPage.tsx` line 76
- **Problem:** Login uses `flex-row` (side-by-side, left panel hidden on mobile). Register uses `flex-col lg:flex-row` (stacks vertically on mobile). Same user flow, completely different mobile experiences
- **Fix:** Use the same responsive layout strategy for both pages

### H3. Missing Loading States on Dashboard
- **Category:** Usability
- **Location:** `DashboardPage.tsx`
- **Problem:** No loading skeletons for: transit data, energy meter, planet positions, upcoming transits. `energyScore` is hardcoded to `72`. "Upcoming Transits" section uses hardcoded mock data
- **Impact:** Users see stale/placeholder data instead of loading indicators
- **Fix:** Add `isLoading` checks from React Query hooks and render `SkeletonLoader` components

### H4. Dashboard Transit Items Not Keyboard Accessible
- **Category:** Accessibility
- **Location:** `DashboardPage.tsx` lines 246-263
- **Problem:** Clickable transit items are `<div>` with `cursor-pointer` but lack `role="button"`, `tabIndex`, and keyboard event handlers. Chart cards (lines 292-296) correctly implement these — inconsistent
- **Fix:** Add `role="button"`, `tabIndex={0}`, `onKeyDown` to all clickable divs

### H5. Star Ratings Invisible to Screen Readers
- **Category:** Accessibility
- **Location:** `HomePage.tsx` lines 238-240
- **Problem:** Star icons have `aria-hidden="true"` but no text alternative. Screen readers skip the rating entirely
- **Fix:** Add `aria-label="5 out of 5 stars"` on the parent element

### H6. `.input:focus` Overrides Focus-Visible Outline
- **Category:** Accessibility
- **Location:** `index.css` line 247
- **Problem:** `.input:focus` sets `outline: none`, which overrides the global `*:focus-visible` rule. Inputs lose their visible focus indicator
- **Fix:** Change `.input:focus` to `.input:focus-visible` or add `outline: 2px solid var(--color-accent)` back

### H7. Missing `role="alert"` on Error Banners
- **Category:** Accessibility
- **Location:** `SolarReturnsPage.tsx` line 181
- **Problem:** Error alert div has no `role="alert"` or `aria-live`. Screen readers won't announce errors. The success alert (line 188) correctly uses `role="status" aria-live="polite"` — inconsistent
- **Fix:** Add `role="alert" aria-live="assertive"` to error containers

### H8. Password Visibility Toggle Inconsistency
- **Category:** Usability
- **Problem:** Login has no show/hide toggle. Register has toggle on password only (not confirm). `AuthenticationForms.tsx` LoginForm has a non-functional toggle (`pointer-events-none`)
- **Fix:** Add working toggles to all password fields consistently

---

## Medium Priority Issues

### M1. Hardcoded Colors Instead of Design Tokens (Systemic)
**40+ instances across all pages.** Most common patterns:

- `text-slate-200` instead of `--color-text-secondary` (20+ occurrences)
- `border-white/15` instead of `border-cosmic-border-subtle` (8 occurrences)
- `bg-white/15` instead of `bg-cosmic-hover` (12 occurrences)
- Status colors `#10B981`, `#F59E0B`, `#EF4444` hardcoded in 6+ components
- SVG hardcoded hex colors (`#A78BFA`, `#FFD700`, etc.) in HomePage hero

### M2. Icon Library Convention Mismatch
- **Convention:** `heroicons + lucide-react` (per `frontend.md`)
- **Reality:** All icons use `material-symbols-outlined` with inline `style={{ fontSize: '...' }}`
- **Scale:** 166+ instances across 23 files
- **Recommendation:** Update `frontend.md` to reflect actual usage, OR migrate icons

### M3. Icon Size Inconsistency
Icon sizes range from 10px to 48px with no sizing scale:
- `text-[10px]` — Dashboard tags
- `text-sm` (14px) — Various small icons
- `text-base` (16px) — Dashboard header icon
- `text-lg` (18px) — Various
- `text-xl` (20px) — Transit icons
- `text-2xl` (24px) — Feature icons, logo
- `style={{ fontSize: '48px' }}` — EmptyState presets

**Fix:** Define an icon sizing scale in the design system (sm/md/lg/xl)

### M4. Border Radius Inconsistency
No clear hierarchy; these values are used interchangeably for similar elements:
- `rounded` (4px) — PublicPageLayout logo
- `rounded-md` (6px) — BirthDataForm inputs
- `rounded-lg` (8px) — Buttons, sidebar items
- `rounded-xl` (12px) — Cards, form sections, most buttons
- `rounded-2xl` (16px) — Auth form panels, skeleton loaders
- `rounded-full` — Nav pills, badges

**Fix:** Document when to use each radius: `rounded-lg` for inputs, `rounded-xl` for cards, `rounded-2xl` for panels

### M5. Two Different Input Component Styles
- **AuthenticationForms:** `ring-1 ring-inset ring-white/10` + `rounded-xl` + `bg-cosmic-card-solid`
- **BirthDataForm:** `border border-cosmic-border` + `rounded-md` + `bg-white/15`

**Fix:** Create a shared `TextInput` component with one canonical style

### M6. Two Different Card/Glass Styles
- **Via utility classes:** `glass-panel rounded-2xl`
- **Via manual composition:** `bg-cosmic-card backdrop-blur-md rounded-xl border border-cosmic-border`

**Fix:** Always use `glass-panel` or `glass-card` utility classes

### M7. Inline Font Size Styles (30+ instances)
`style={{ fontSize: '18px' }}`, `style={{ fontSize: '20px' }}`, etc. appear throughout. These:
- Override user font-size preferences
- Can't be overridden by Tailwind responsive utilities
- Should use Tailwind classes (`text-lg`, `text-xl`)

### M8. Inconsistent Hero Heading Weight
- **HomePage:** `font-black` (900)
- **DashboardPage:** `font-bold` (700)
- **All other pages:** `font-bold` (700)

### M9. Inconsistent Page Header Bottom Margin
- **DashboardPage:** `mb-10`
- **All other pages:** `mb-8`

### M10. Z-Index Layer Conflicts
No centralized z-index management:
- `z-30` — TopNav
- `z-40` — Mobile overlay + Mobile bottom nav (**conflict: same level**)
- `z-50` — Sidebar
- `z-[1000]` — Modals
- `z-[9999]` — ServiceWorkerUpdateBanner

**Fix:** Define z-index layers in `tailwind.config.js` as design tokens

### M11. ForecastPage Retry Uses `window.location.reload()`
- **Location:** `ForecastPage.tsx` line 124
- **Problem:** Full page reload instead of React Query invalidation. Disrupts screen reader context and user state
- **Fix:** Use `queryClient.invalidateQueries()` instead

### M12. SynastryPage Empty State Logic Error
- **Location:** `SynastryPage.tsx` line 60
- **Problem:** Checks `charts.length === 0` but synastry requires 2+ charts. Should be `charts.length < 2`

### M13. Heading Hierarchy Violations
- **ChartViewPage:** Uses `<h3>` where `<h2>` is expected (skips h2)
- **SynastryPage:** No `<h1>` at page wrapper level
- **AnalysisPage:** No `<h2>` between `<h1>` and content

### M14. No Error Boundary at App Level
- **Location:** `App.tsx`
- **Problem:** `ErrorBoundary.tsx` exists but is not wrapping the app. The console errors show `<BrowserRouter>` crashing with no recovery
- **Fix:** Wrap `<Routes>` in `<ErrorBoundary>`

---

## Low Priority Issues (Backlog)

### L1. Inconsistent Section Heading Weight
- DashboardPage uses `font-bold`, SettingsPage uses `font-semibold` for equivalent headings

### L2. Card Padding Inconsistency
- Most cards: `p-6`
- HomePage pricing cards: `p-8`
- DashboardPage moon card: `p-2 pr-5`

### L3. `.sr-only` Duplication
- `index.css` lines 104-125 manually implement `.sr-only` / `.not-sr-only` — Tailwind already provides these utilities

### L4. Custom Scrollbar Hardcoded Colors
- `index.css` lines 204-217 use hardcoded hex instead of design tokens

### L5. `.btn-secondary:hover` Hardcoded
- `index.css` line 230: `rgba(255, 255, 255, 0.10)` instead of `--color-bg-active`

### L6. Select Elements No Dark Theme
- `BirthDataForm.tsx`: `<select>` `<option>` elements have no dark styling — native dropdown renders light

### L7. ProtectedRoute Loading Spinner Wrong Color
- Uses `primary-600` (`#4f46e5` — indigo) instead of `primary` DEFAULT (`#6b3de1` — brand purple)

### L8. Social Links Not Interactive
- `AppLayout.tsx` footer: Twitter/GitHub `<span>` elements styled as links but not clickable

### L9. Notification Dot Not Accessible
- `AppLayout.tsx` line 131: Red dot `<span>` has no accessible text for screen readers

### L10. ShimmerButton Missing States
- No hover, focus, active, or disabled states

### L11. AIInterpretationToggle Solid Background
- Uses solid `bg-primary` instead of glassmorphism convention

### L12. UsageMeter Button Fighting Itself
- Extreme responsive overrides indicate the button is fighting between mobile/desktop patterns

### L13. CalendarView Day Cells Missing Focus Outline
- Day cells and nav buttons have no `focus-visible` styling

---

## Screenshots Reference

| File | Description |
|------|-------------|
| `ui-review-home.png` | Home page, desktop full page |
| `ui-review-home-viewport.png` | Home page, desktop viewport |
| `ui-review-home-mobile.png` | Home page, iPhone X (375x812) |
| `ui-review-login.png` | Login page, desktop full page |
| `ui-review-login-mobile.png` | Login page, mobile full page |
| `ui-review-register.png` | Register page, desktop full page |
| `ui-review-dashboard.png` | Dashboard, desktop full page |
| `ui-review-dashboard-mobile.png` | Dashboard, mobile full page |
| `ui-review-dashboard-tablet.png` | Dashboard, iPad (768x1024) |
| `ui-review-profile.png` | Profile page, desktop full page |
| `ui-review-settings.png` | Settings page, desktop full page |
| `ui-review-charts.png` | Charts page, desktop full page |
| `ui-review-solar-returns.png` | Solar Returns, desktop full page |

---

## Recommended Fix Priority

### Sprint 1 (Critical — Fix Now)
1. C1: Fix duplicate React instances (app crash)
2. C2: Implement mobile navigation menu on HomePage
3. C3: Add error handling to LoginPage
4. C4: Wire ForgotPassword to actual API
5. C5: Refactor to use shared AuthenticationForms components

### Sprint 2 (High — Before Release)
6. H1: Standardize auth form styling
7. H2: Align Login/Register mobile layouts
8. H3: Add loading states to Dashboard
9. H4: Make transit items keyboard accessible
10. H5-H7: Fix accessibility gaps (star ratings, input focus, error alerts)
11. H8: Fix password toggle consistency

### Sprint 3 (Medium — Next Sprint)
12. M1-M7: Design system tokenization sweep
13. M8-M9: Fix spacing/weight inconsistencies
14. M10: Centralize z-index layers
15. M11-M14: Fix logic errors and hierarchy

### Sprint 4 (Low — Backlog)
16. L1-L13: Polish items
