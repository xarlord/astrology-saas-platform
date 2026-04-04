# Sprint 4: UX Design System Audit

**Date:** 2026-04-04
**Auditor:** UX Designer 2
**Scope:** All new pages added after Sprint 3 audit resolution
**Status:** MOSTLY RESOLVED — 1 minor remaining item

---

## Executive Summary

After Sprint 3 resolved all 10 UX audit items, new pages were added that bypass the AstroVerse cosmic design system. Two pages (SubscriptionPage, SolarReturnsPage) use entirely generic Tailwind patterns with wrong icon libraries. Three otherwise-compliant pages use emoji where Material Symbols icons should appear. The fix scope is concentrated: **2 pages need full retheme, 3 pages need emoji-to-icon swaps**.

---

## Pages Audited

| Page | File | Verdict |
|------|------|---------|
| SubscriptionPage | `pages/SubscriptionPage.tsx` | **FAIL — full retheme needed** |
| SolarReturnsPage | `pages/SolarReturnsPage.tsx` | **FAIL — full retheme needed** |
| ProfileSettingsPage | `pages/ProfileSettingsPage.tsx` | PASS (1 emoji issue) |
| LearningCenterPage | `pages/LearningCenterPage.tsx` | PASS |
| LunarReturnsPage | `pages/LunarReturnsPage.tsx` | PASS |
| DailyBriefingPage | `pages/DailyBriefingPage.tsx` | PASS (3 emoji issues) |
| DashboardPage | `pages/DashboardPage.tsx` | PASS (1 emoji issue) |
| CourseDetailPage | `pages/CourseDetailPage.tsx` | Not audited (defer to implementation) |
| SolarReturnAnnualReportPage | `pages/SolarReturnAnnualReportPage.tsx` | Not audited (defer to implementation) |

---

## Findings

### C1 — CRITICAL: SubscriptionPage — complete design system bypass

**File:** `pages/SubscriptionPage.tsx`

The SubscriptionPage was built as a generic SaaS pricing page with no cosmic theme applied.

**Issues:**
1. **Icon library:** Imports `@heroicons/react/24/outline` (CheckIcon, StarIcon, SparklesIcon, ArrowLeftIcon) instead of Material Symbols Outlined
2. **Color tokens:** Uses generic `text-gray-900 dark:text-white`, `text-gray-600 dark:text-gray-400`, `bg-white dark:bg-gray-800` — no cosmic dark theme
3. **Card backgrounds:** `bg-white dark:bg-gray-800` + `border-gray-200 dark:border-gray-700` instead of `bg-[#141627]/70 backdrop-blur-md border border-white/10`
4. **Button colors:** `bg-indigo-600 hover:bg-indigo-700` for highlighted tier CTA instead of `bg-primary`
5. **Ring/border accents:** `border-indigo-500 ring-indigo-500/20` instead of `border-primary ring-primary/20`
6. **Back link:** `text-gray-500 dark:text-gray-400` with heroicon ArrowLeftIcon
7. **Status banners:** Generic `bg-green-50 dark:bg-green-900/20` etc. — no cosmic styling
8. **No cosmic page structure:** Missing the dark gradient background, no ambient glow effects

**Impact:** Page feels completely disconnected from the rest of the app. Users coming from the cosmic-themed dashboard will experience a jarring visual break.

---

### C2 — CRITICAL: SolarReturnsPage — icon library fragmentation + generic theming

**File:** `pages/SolarReturnsPage.tsx`

The SolarReturnsPage uses the wrong icon library and generic gray/indigo color scheme.

**Issues:**
1. **Icon library:** Imports `lucide-react` (Calendar, Settings, Share2, ArrowLeft) instead of Material Symbols Outlined
2. **Color tokens:** Uses `text-indigo-600`, `text-gray-500`, `text-gray-700 dark:text-gray-300` — no cosmic dark palette
3. **Active tab button:** `bg-indigo-600 text-white` instead of `bg-primary text-white`
4. **Breadcrumbs:** `text-indigo-600 hover:text-indigo-500 dark:text-indigo-400` — indigo on dark fails WCAG AA for small text
5. **Spinner:** `border-indigo-600` instead of `border-primary`
6. **Tab bar border:** `border-gray-200 dark:border-gray-700` instead of `border-white/10`
7. **Error banner:** Generic `bg-red-100 dark:bg-red-900` styling
8. **Page header:** `text-gray-600 dark:text-gray-400` subtitle — should be `text-slate-400`
9. **No cosmic card styling:** Content is rendered by sub-components but the page shell uses generic gray

**Impact:** Visual inconsistency with every other page. Wrong icons create UX confusion (lucide Calendar icon vs Material calendar_month).

---

### H1 — HIGH: Button CTA colors use indigo instead of primary

**Files:** SubscriptionPage, SolarReturnsPage

Both pages use `bg-indigo-600` for primary action buttons and active states:
- SubscriptionPage highlighted tier: `bg-indigo-600 text-white hover:bg-indigo-700`
- SolarReturnsPage active tab: `bg-indigo-600 text-white`
- SolarReturnsPage spinner: `border-indigo-600 border-t-transparent`

**Should be:** `bg-primary` (maps to `#6b3de1` via Tailwind config)

---

### H2 — HIGH: Breadcrumb/link colors fail WCAG contrast on dark backgrounds

**File:** SolarReturnsPage.tsx

Breadcrumb uses `text-indigo-600 hover:text-indigo-500 dark:text-indigo-400`:
- Indigo-400 (#818cf8) on dark bg has ~3.8:1 contrast — fails WCAG AA for normal text (requires 4.5:1)
- Design system specifies `text-violet-300` for links on dark backgrounds

**Should be:** `text-violet-300 hover:text-violet-200` for WCAG AA compliance

---

### H3 — HIGH: Card styling inconsistent with design system

**Files:** SubscriptionPage, SolarReturnsPage

SubscriptionPage cards: `bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl`
SolarReturnsPage tab bar: `border-gray-200 dark:border-gray-700`
SolarReturnsPage error: `bg-red-100 dark:bg-red-900 border-red-200 dark:border-red-800`

**Should be:**
- Card: `bg-[#141627]/70 backdrop-blur-md border border-white/10 rounded-2xl`
- Error: `bg-red-500/10 border border-red-500/30 rounded-lg text-red-400`

---

### M1 — MEDIUM: Emoji used instead of Material Symbols icons

**Files:** DashboardPage.tsx, DailyBriefingPage.tsx, ProfileSettingsPage.tsx

| Location | Current | Should be |
|----------|---------|-----------|
| DashboardPage welcome: `Welcome back, {name} ✨` | `✨` emoji | Remove emoji, or use `<span className="material-symbols-outlined">auto_awesome</span>` |
| DailyBriefingPage moon phase: `icon: '🌙'` | `🌙` emoji | Use SVG moon phase or `dark_mode` icon |
| DailyBriefingPage transit: `emoji: '⭐'` | `⭐` emoji | `star` Material icon |
| DailyBriefingPage transit: `emoji: '⚡'` | `⚡` emoji | `bolt` Material icon |
| DailyBriefingPage transit: `emoji: '🌊'` | `🌊` emoji | `water` Material icon |
| ProfileSettingsPage: `Pro Plan ✨` | `✨` emoji | Remove or use `auto_awesome` icon |

**Impact:** Emoji render differently across OS/browsers, breaking visual consistency. Some emoji fail accessibility (screen readers announce literal emoji descriptions).

---

### M2 — MEDIUM: SubscriptionPage pricing accent inconsistent

**File:** SubscriptionPage.tsx

The "Most Popular" badge and highlighted tier border use indigo:
- Badge: `bg-indigo-600`
- Border: `border-indigo-500 ring-indigo-500/20`
- "Current plan" badge: `bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300`

**Should use primary token:** `bg-primary`, `border-primary ring-primary/20`

---

### M3 — MEDIUM: Error/loading state styling inconsistency

**Files:** SubscriptionPage.tsx, SolarReturnsPage.tsx

Both pages use generic Tailwind error styling patterns:
```
bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300
```

The rest of the app uses the cosmic pattern established in LunarReturnsPage:
```
bg-red-500/10 border border-red-500/30 rounded-lg text-red-400
```

---

### DS1 — MINOR: Subscription pricing data inconsistency

**Files:** SubscriptionPage.tsx, ProfileSettingsPage.tsx

- SubscriptionPage FALLBACK_PLANS: Pro at $9.99/month
- ProfileSettingsPage subscription tab: Shows "Pro Plan" at "$12/mo"

These should show the same price. Backend plans endpoint should be the source of truth.

---

### DS2 — MINOR: Current tier mapping fragility

**File:** SubscriptionPage.tsx

```tsx
const rawTier = user?.plan ?? 'free';
const currentTier: string = rawTier === 'basic' ? 'pro' : rawTier;
```

Hard-coded `'basic' → 'pro'` mapping is fragile. If backend changes plan naming, this silently breaks.

---

## Severity Summary

| Severity | Count | Pages Affected |
|----------|-------|----------------|
| CRITICAL | 2 | SubscriptionPage, SolarReturnsPage |
| HIGH | 3 | SubscriptionPage, SolarReturnsPage |
| MEDIUM | 3 | DashboardPage, DailyBriefingPage, ProfileSettingsPage, SubscriptionPage |
| MINOR | 2 | SubscriptionPage, ProfileSettingsPage |

---

## Priority Fix Order

1. **C1 + C2 + H1 + H2 + H3 + M2 + M3** — Full retheme of SubscriptionPage and SolarReturnsPage (single PR, all related)
2. **M1** — Emoji-to-icon migration across DashboardPage, DailyBriefingPage, ProfileSettingsPage (small PR)
3. **DS1 + DS2** — Data fixes (coordinate with backend team)

---

## Deferred Page Audit (2026-04-04)

The following pages were deferred from the initial audit. Reviewed after Sprint 4 fixes were applied:

### CourseDetailPage.tsx — PASS (minor)

Cards at 3 locations use `bg-[#141627]` (fully opaque) instead of `bg-[#141627]/70 backdrop-blur-md`. Hex color is correct; opacity and blur are missing. Low priority — visual difference is subtle.

### SolarReturnAnnualReportPage.tsx — FAIL (minor)

9 card containers use `bg-white/5 backdrop-blur-sm` instead of `bg-[#141627]/70 backdrop-blur-md`:
- Lines 165, 224, 253, 282, 297, 312, 335, 351, 385

All other tokens (icons, text colors, buttons, brand) are correct. The fix is a single find-replace across the file.

---

## Feature Spec UX Readiness Assessment (2026-04-04)

All 4 feature specs in `docs/features/` score **2/5 UX readiness** — backend-first specs with no visual guidance.

**Priority order for UX design work:**
1. **Birthday Gift Sharing** — Most UI surfaces (4-step wizard, claim page, email), highest business impact
2. **Biometric Auth** — Security-sensitive login flow, platform-specific behavior
3. **Google Calendar Export** — OAuth UX, export panel with multiple controls
4. **Synastry Comparison Types** — Smallest scope, extends existing component

---

## Reference

- Design tokens: `docs/design/DESIGN_SPECIFICATIONS.md`
- Sprint 3 audit (all resolved): `docs/SPRINT3_UX_AUDIT_REPORT.md`
- Sprint 3 layout spec: `docs/SPRINT3_LAYOUT_DESIGN_SPEC.md`
- Theme fix spec (companion doc): `docs/SPRINT4_THEME_FIX_SPEC.md`
