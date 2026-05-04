# Plan: UI Review Fix — All 40 Issues

## Context

The UI review (`docs/ui-reviews/2026-05-03-full-review.md`) found 40 issues across 10 screens and 18 shared components (overall score 6.7/10). The app has a crashing React duplicate bundle, a non-functional mobile menu, auth pages with no error handling, and systemic design token misuse. This plan fixes all 40 issues in 4 phases organized into 11 PRs.

---

## PR 1: Fix Duplicate React Crash [C1]

**File:** `frontend/vite.config.ts`

Add `dedupe: ['react', 'react-dom']` to the existing `resolve` object (line 67). Currently only has `alias`.

**Verify:** Start dev server, confirm no `Invalid hook call` errors in console.

---

## PR 2: HomePage Mobile Menu + Star Rating [C2, H5]

**File:** `frontend/src/pages/HomePage.tsx`

1. Add `const [mobileMenuOpen, setMobileMenuOpen] = useState(false)` to `HomePage()`
2. Wire the hamburger button (line 47) with `onClick={() => setMobileMenuOpen(true)}`
3. Add a mobile slide-out menu panel after `</nav>` — follow `AppLayout.tsx` sidebar overlay pattern (lines 23-29) for the overlay, and slide animation (line 209) for the panel. Panel contains: anchor links (#features, #testimonials, #pricing) + Sign In (/login) + Get Started (/register) + close button. `z-50`.
4. Add `<span className="sr-only">5 out of 5 stars</span>` to the star rating container (lines 238-240).

**Verify:** Mobile viewport — hamburger opens/closes menu, links navigate. Screen reader announces star rating.

---

## PR 3: ForgotPassword API Integration [C4]

**File:** `frontend/src/pages/ForgotPasswordPage.tsx`

1. Import `api` from `../services/api` and `getErrorMessage` from `../utils/errorHandling`
2. Add `isSubmitting` and `apiError` state variables
3. Replace `setSubmitted(true)` (line 11) with `await api.post('/v1/auth/forgot-password', { email })` then `setSubmitted(true)`, wrapped in try/catch
4. Add error display with `role="alert"` above the form
5. Disable submit button while `isSubmitting`

**Verify:** Submit with valid email → success state. Submit with network error → error message. Button disabled during submit.

---

## PR 4: Auth Form Unification [C5, C3, H8, H1, H2]

This is the largest PR. Touches the entire auth flow.

### Step 1: Create `frontend/src/components/AuthLayout.tsx`

A split-screen layout wrapper extracted from LoginPage/RegisterPage common patterns:

```
Props: { children, leftPanel?: ReactNode, variant?: 'login' | 'register' }
```

Renders:
- Skip link
- `<div className="min-h-screen flex flex-col lg:flex-row">`
- Left panel: `hidden lg:flex lg:w-5/12` with the cosmic artwork/gradient content
- Right panel: `<main id="main-content">` with `children`
- On mobile: single column (fixes H2 — consistent mobile layout)
- Mobile logo shown below `lg` breakpoint

### Step 2: Refactor `LoginPage.tsx`

Replace entire inline form with:
```tsx
<AuthLayout leftPanel={<LoginArtwork />}>
  <LoginForm onSuccess={() => navigate('/dashboard')} />
</AuthLayout>
```

This brings in proper error handling (C3), `aria-invalid`, `aria-describedby`, `role="alert"`, SVG spinner — all from the shared `AuthenticationForms.tsx` LoginForm. Fixes H8 (password toggle — shared form already has a working one).

### Step 3: Refactor `RegisterPage.tsx`

Replace entire inline form with:
```tsx
<AuthLayout leftPanel={<RegisterArtwork />} variant="register">
  <RegisterForm onSuccess={() => navigate('/dashboard')} />
</AuthLayout>
```

Fixes H8 (password toggles on both fields — shared RegisterForm already has them).

### Step 4: Fix `AuthenticationForms.tsx` bugs

- Remove the ghost toggle button on LoginForm email field (lines 159-166) — it's `pointer-events-none` dead code
- LoginForm divider `bg-cosmic-page` (line 276) should match RegisterForm `bg-cosmic-card-solid` (line 695) — standardize on `bg-cosmic-card-solid` since the form is inside the right panel now
- RegisterForm submit hover uses `scale` (line 658) while LoginForm uses `translate-y` (line 239) — standardize to `hover:-translate-y-0.5 active:translate-y-0`

### Step 5: Update `ForgotPasswordPage.tsx` styling

- Change card `rounded-lg` → `rounded-xl` (M4)
- Change card `p-6` → `p-8` (L2)
- Change input `bg-white/15 border border-cosmic-border` → `ring-1 ring-inset ring-white/10 bg-cosmic-card-solid rounded-xl` (M5, H1)
- Change submit button `bg-primary py-2.5 rounded-lg` → `bg-cosmic-gradient py-3.5 rounded-xl` (H1)

### Critical files:
- `frontend/src/components/AuthLayout.tsx` — **NEW**
- `frontend/src/pages/LoginPage.tsx` — full rewrite to thin wrapper
- `frontend/src/pages/RegisterPage.tsx` — full rewrite to thin wrapper
- `frontend/src/components/AuthenticationForms.tsx` — bug fixes + minor style alignment

**Verify:** Login success/failure, register success/failure, forgot-password submit, mobile layouts for all three, desktop split-screen layout, password toggles work, error messages display, loading spinners show.

---

## PR 5: Dashboard Loading States + Transit Accessibility [H3, H4]

**File:** `frontend/src/pages/DashboardPage.tsx`

1. Destructure `isFetching` from `useTodayTransits()` (line 77). Add `const transitsLoading = isFetching && !todayTransits`
2. Energy meter section (lines 134-161): When `transitsLoading`, render `<SkeletonLoader variant="card" />` instead
3. Planetary positions (lines 189-220): When `transitsLoading`, render `<SkeletonLoader variant="card" />` grid
4. Upcoming transits (lines 222-265): When `transitsLoading`, render `<SkeletonLoader variant="list" count={3} />`
5. Transit items (lines 245-263): Add `role="button"`, `tabIndex={0}`, `onKeyDown` for Enter/Space, `aria-label` to each `<div>`
6. Planet position cards (lines 200-219): Same keyboard accessibility additions

**Verify:** Slow network → skeletons appear then data. Tab through transits → focus ring visible, Enter triggers action.

---

## PR 6: CSS Batch — Focus, Errors, Scrollbar, Selects [H6, H7, L3, L4, L5, L6, L7]

**File:** `frontend/src/index.css`

1. **H6:** Remove `outline: none` from `.input:focus` (line 247). The global `*:focus-visible` rule handles it.
2. **L3:** Delete manual `.sr-only` / `.not-sr-only` (lines 104-125). Tailwind provides these.
3. **L4:** Replace scrollbar hardcoded hex with CSS vars:
   - `#0B0D17` → `var(--color-bg-page)`
   - `#2f2645` → `var(--color-border)`
   - `#6b3de1` → `var(--color-accent)`
4. **L5:** `.btn-secondary:hover` (line 230): replace `rgba(255, 255, 255, 0.10)` with `var(--color-bg-active)`
5. **L6:** Add to `@layer base`: `option { background-color: var(--color-bg-card-solid); color: var(--color-text-primary); }`

**File:** `frontend/src/pages/SolarReturnsPage.tsx`

6. **H7:** Add `role="alert"` to error banner div (line 181). Add `aria-label="Dismiss error"` to close button (line 183).

**File:** `frontend/src/components/ProtectedRoute.tsx`

7. **L7:** Change `border-primary-600` → `border-primary` (line 19).

**Verify:** Tab to inputs — focus ring visible. Scrollbar uses theme colors. Select dropdowns dark. Error banners announced by screen readers.

---

## PR 7: Logic Fixes [M10, M11, M12]

**File:** `frontend/tailwind.config.js`

1. **M10:** Add centralized z-index scale to `theme.extend`:
   ```js
   zIndex: { overlay: 40, sidebar: 50, topnav: 30, modal: 60, toast: 70, 'sw-banner': 80, 'skip-link': 100 }
   ```

**File:** `frontend/src/components/AppLayout.tsx`

2. Replace z-index values: `z-30` → `z-topnav`, `z-40` → `z-overlay` (overlay + bottom nav), `z-50` → `z-sidebar`

**File:** `frontend/src/components/ServiceWorkerUpdateBanner.tsx`

3. Replace `z-[9999]` → `z-sw-banner`

**File:** `frontend/src/pages/ForecastPage.tsx`

4. **M11:** Import `useQueryClient`. Replace `window.location.reload()` (line 124) with `queryClient.invalidateQueries({ queryKey: ['transits'] })` and `queryClient.invalidateQueries({ queryKey: ['charts'] })`.

**File:** `frontend/src/pages/SynastryPage.tsx`

5. **M12:** Change `charts.length === 0` (line 60) to `charts.length < 2`. Update empty state messaging to distinguish 0 charts vs 1 chart.

**Verify:** Z-index layering correct (sidebar above bottom nav, modals above sidebar, SW banner above all). Forecast retry refreshes data without page reload. Synastry shows "need another chart" with 1 chart.

---

## PR 8: Visual Consistency — Colors, Radius, Inputs, Cards [M1, M4, M5, M6]

### M1: Hardcoded color replacement (40+ instances)

Search-replace across all `.tsx` files in `pages/` and `components/`:

| Find | Replace | Files |
|------|---------|-------|
| `border-white/15` | `border-cosmic-border-subtle` | ChartViewPage, AnalysisPage, SolarReturnsPage, AppLayout |
| `bg-white/15` (on card-like containers) | `bg-cosmic-hover` | UsageMeter, various inline styles |
| `text-slate-200` (body/secondary text) | `text-[var(--color-text-body)]` | DashboardPage, ChartViewPage, SolarReturnsPage, ForecastPage, AppLayout, SkeletonLoader |
| `#10B981` / `#EF4444` / `#F59E0B` (status colors) | `text-emerald-500` / `text-red-500` / `text-amber-500` or Tailwind classes | DailyWeatherModal, CalendarView, ElementMeter, UsageMeter, EmptyState |
| `#A78BFA` | `lavender` token or `secondary-300` | HomePage SVG, LoginPage SVG |
| `#FFD700` etc. (planet colors) | `planet.sun` etc. tokens | HomePage SVG |

### M4: Border radius standardization

Convention: `rounded-lg` for inputs, `rounded-xl` for cards, `rounded-2xl` for panels.

- BirthDataForm inputs: `rounded-md` → `rounded-lg`
- ForgotPasswordPage card: already fixed in PR 4

### M5: Unified input style

Standardize on the ring-based pattern from AuthenticationForms.

- BirthDataForm inputs: `border border-cosmic-border rounded-md bg-white/15` → `ring-1 ring-inset ring-white/10 rounded-lg bg-cosmic-card-solid`

### M6: Unified card style

Replace manual `bg-cosmic-card backdrop-blur-md rounded-xl border border-cosmic-border` with `glass-card` utility class in:
- BirthDataForm sections
- ErrorBoundary
- AIInterpretationDisplay

**Verify:** Visual QA on all affected pages — no regressions.

---

## PR 9: Inline Styles + Icon Docs [M7, M2]

### M7: Replace inline font-size styles (30+ instances)

Search for `style={{ fontSize:` across all `.tsx` files. Replace with Tailwind classes:

| Inline | Tailwind |
|--------|----------|
| `fontSize: '48px'` | `text-5xl` |
| `fontSize: '24px'` | `text-2xl` |
| `fontSize: '20px'` | `text-xl` |
| `fontSize: '18px'` | `text-lg` |
| `fontSize: '16px'` | `text-base` |
| `fontSize: '14px'` | `text-sm` |

Main files affected: `EmptyState.tsx`, `AppLayout.tsx`, `SettingsPage.tsx`, `SolarReturnsPage.tsx`, `AIInterpretationToggle.tsx`.

### M2: Update icon convention docs

**File:** `frontend/.claude/rules/frontend.md`

Change line "Icons: heroicons + lucide-react" to:
"Icons: Material Symbols Outlined (via Google Fonts CDN). Use `<span className="material-symbols-outlined">icon_name</span>` pattern. Prefer Tailwind text-size classes over inline styles."

**Verify:** No `style={{ fontSize:` remaining in source (except SVG text elements). Icon docs updated.

---

## PR 10: Minor Fixes Batch [M9, M13, M14, L1, L2, L8, L9]

### M9: Dashboard spacing
`DashboardPage.tsx` line 101: `mb-10` → `mb-8`

### M13: Heading hierarchy
- `ChartViewPage.tsx`: Change `<h3>` (lines 183, 207) → `<h2>`
- `SynastryPage.tsx` wrapper: Add `<h1 className="text-3xl font-bold gradient-text mb-8">Synastry Compatibility</h1>`
- `AnalysisPage.tsx`: Add `<h2 className="sr-only">Personality Analysis</h2>` or visible section heading

### M14: ErrorBoundary verification
After C1 fix, verify ErrorBoundary catches errors. Add `role="alert"` to error container in `ErrorBoundary.tsx` (line 30).

### L1: Close as "by design" — section headings appropriately differentiated from page headings.

### L2: Card padding
- `HomePage.tsx` pricing cards (line 295): `p-8` → `p-6` for consistency
- `DashboardPage.tsx` moon card (line 116): `p-2 pr-5` → `p-4`

### L8: Footer social links
`AppLayout.tsx` lines 580-592: Change `<span>` → `<a href="#" aria-label="Twitter">` and `<a href="#" aria-label="GitHub">`

### L9: Notification dot
`AppLayout.tsx` line 131: Add `aria-hidden="true"` to the dot span (it's decorative). Update parent button `aria-label` to `"Notifications"` (without count since we don't have real data).

**Verify:** Heading outline correct (h1 → h2 → h3). Spacing matches across pages. Social links are keyboard-focusable.

---

## PR 11: Component Polish [L10, L11, L12, L13]

### L10: ShimmerButton states
**File:** `frontend/src/components/effects/ShimmerButton.tsx`
Add: `hover:bg-primary/90 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all`

### L11: AIInterpretationToggle glassmorphism
**File:** `frontend/src/components/AIInterpretationToggle.tsx` line 52
Change `bg-primary` → `bg-gradient-to-r from-primary/20 to-cosmic-blue/20 backdrop-blur-md border border-primary/20`

### L12: UsageMeter button cleanup
**File:** `frontend/src/components/UsageMeter.tsx` lines 135, 151
Simplify extreme responsive overrides to: `className="text-sm text-lavender hover:text-white underline hover:opacity-80 transition-opacity"`

### L13: CalendarView focus-visible
**File:** `frontend/src/components/CalendarView.tsx`
Add `focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-1` to day cells and nav buttons.

**Verify:** ShimmerButton responds to hover/focus. AI toggle matches glassmorphism style. UsageMeter clean on all sizes. Calendar cells show focus ring.

---

## Verification Summary

After all PRs:
1. `cd frontend && npm run dev` — no console errors
2. Visual check all 10 screens at desktop (1280px), tablet (768px), mobile (375px)
3. Keyboard tab through: Home nav, Login form, Register form, Dashboard transit items, Calendar days, all buttons
4. Screen reader test: error messages announced, star ratings described, heading hierarchy correct
5. `cd frontend && npx tsc --noEmit` — no type errors
6. `cd frontend && npx vitest run` — existing tests pass
7. `cd frontend && npx playwright test` — E2E tests pass
