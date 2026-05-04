# Cosmic Theme Application — New Pages Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Bring 8 new pages and 3 shared components into the AstroVerse cosmic dark design system, eliminating visual inconsistency between core pages and recently added pages.

**Architecture:** Direct 1:1 CSS class swaps per the design token mapping. No structural or logic changes. Shared components (EmptyState, SkeletonLoader) are fixed first since pages depend on them. Icon migrations replace heroicons/lucide/emoji with Material Symbols Outlined.

**Tech Stack:** React 18 + Tailwind 3, Material Symbols Outlined icon font

---

## Context

The Sprint 3 UX audit resolved all 10 findings and established a cosmic dark theme on core pages. After that, 8 new pages were added (Settings, Subscription, Ephemeris, Learn, Retrograde, Static, MoonCalendar, TodayTransits) using generic Tailwind classes instead of design system tokens. The shared EmptyState and SkeletonLoader components also use generic styling.

**Audit doc:** `docs/SPRINT4_UX_DESIGN_SYSTEM_AUDIT.md`
**Design token spec:** `docs/SPRINT4_THEME_FIX_SPEC.md`

---

## Design Token Quick Reference

```
Backgrounds:  bg-[#0B0D17] (page), bg-[#141627]/70 backdrop-blur-md (card)
Borders:      border-[#2f2645] (standard), border-white/[0.08] (subtle)
Dividers:     divide-white/[0.06]
Hover:        hover:bg-white/5
Text:         text-white (primary), text-slate-300 (secondary), text-slate-400 (body)
Links:        text-violet-300 hover:text-violet-200
Buttons:      bg-primary (#6b3de1), hover:bg-primary/90
Shadows:      shadow-none (cosmic theme uses borders)
Icons:        material-symbols-outlined, [18px] buttons, [20px] default
```

---

## Task Dependency Graph

```
Phase 1 (Shared Components):
  Task 1 (EmptyState) ─── no deps
  Task 2 (SkeletonLoader) ─ no deps

Phase 2 (Page Header Fixes — quick wins):
  Tasks 3-6 ──────────── no deps, parallelizable with Phase 1

Phase 3 (Full Page Theme + Icon Migration):
  Task 7 (DashboardPage) ─── depends on Task 1 (EmptyState)
  Task 8 (SettingsPage) ──── no deps (local components)
  Task 9 (SubscriptionPage) ─ depends on Task 1 (UsageMeter icon)
  Task 10 (EphemerisPage) ─── no deps
  Task 11 (LearnPage) ─────── no deps
  Task 12 (StaticPage) ────── no deps

Phase 4 (Cleanup):
  Task 13 (Remove unused icon imports) ── depends on Tasks 8-11
```

---

## Phase 1: Shared Components

### Task 1: Apply Cosmic Theme to EmptyState Component

**Depends on:** No dependencies (parallelizable)

**Files:**
- Modify: `frontend/src/components/EmptyState.tsx`

**Step 1: Update EmptyState container to cosmic theme**

Replace line 94 (the container div className):

```tsx
// BEFORE:
className={`flex items-center justify-center text-center bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 ${containerSizeClasses[size]} ${className}`}

// AFTER:
className={`flex items-center justify-center text-center bg-[#141627]/70 backdrop-blur-md rounded-lg border border-[#2f2645] ${containerSizeClasses[size]} ${className}`}
```

**Step 2: Update title text color**

Replace line 109 title className:

```tsx
// BEFORE:
className={`${titleSizeClasses[size]} font-bold text-gray-900 dark:text-gray-50 mb-3 leading-snug`}

// AFTER:
className={`${titleSizeClasses[size]} font-bold text-white mb-3 leading-snug`}
```

**Step 3: Update description text color**

Replace line 115 description className:

```tsx
// BEFORE:
className={`${descriptionSizeClasses[size]} text-gray-500 dark:text-gray-400 leading-relaxed`}

// AFTER:
className={`${descriptionSizeClasses[size]} text-slate-400 leading-relaxed`}
```

**Step 4: Update primary action button to use design system primary color**

Replace line 126 primary button className:

```tsx
// BEFORE:
className="px-5 py-2.5 rounded-md text-sm font-medium cursor-pointer transition-all duration-200 border-none whitespace-nowrap bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-px hover:shadow-[0_4px_6px_-1px_rgba(79,70,229,0.2)] active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-400"

// AFTER:
className="px-5 py-2.5 rounded-md text-sm font-medium cursor-pointer transition-all duration-200 border-none whitespace-nowrap bg-primary text-white hover:bg-primary/90 hover:-translate-y-px hover:shadow-[0_4px_6px_-1px_rgba(107,61,225,0.2)] active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
```

**Step 5: Update secondary action button to cosmic theme**

Replace line 134 secondary button className:

```tsx
// BEFORE:
className="px-5 py-2.5 rounded-md text-sm font-medium cursor-pointer transition-all duration-200 whitespace-nowrap bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-gray-700 dark:text-gray-50 dark:border-gray-600 dark:hover:bg-gray-600 dark:hover:border-gray-500 dark:focus-visible:outline-indigo-400"

// AFTER:
className="px-5 py-2.5 rounded-md text-sm font-medium cursor-pointer transition-all duration-200 whitespace-nowrap bg-white/5 text-white border border-[#2f2645] hover:bg-white/10 hover:border-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
```

**Step 6: Replace preset state emojis with Material Symbols**

Replace the emoji strings in each preset with Material Symbol JSX. Update the icon type check at line 101 to handle the new React nodes (it already accepts `React.ReactNode`).

Update preset icons:

```tsx
NoCharts: icon={<span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#f59e0b' }}>auto_awesome</span>}
NoTransits: icon={<span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#8b5cf6' }}>dark_mode</span>}
NoCalendarEvents: icon={<span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#6366f1' }}>calendar_month</span>}
NoSearchResults: icon={<span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#94a3b8' }}>search</span>}
Error: icon={<span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#ef4444' }}>warning</span>}
NetworkError: icon={<span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#ef4444' }}>wifi_off</span>}
NotFound: icon={<span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#94a3b8' }}>help</span>}
NoAnalyses: icon={<span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#6366f1' }}>analytics</span>}
NoReminders: icon={<span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#f59e0b' }}>notifications</span>}
```

Since these are now React nodes (not strings), the container needs a minor adjustment for size. The `emojiSizeClasses` won't apply since they target string emojis. The fontSize is set inline, so size variants still work. The `leading-none block` wrapper at line 102 only applies to strings, so React nodes render correctly as-is.

**Step 7: Verify and commit**

```bash
cd frontend && npx tsc --noEmit
cd frontend && npx vitest run
git add frontend/src/components/EmptyState.tsx
git commit -m "style: apply cosmic theme to EmptyState component and replace emoji with Material Symbols"
```

---

### Task 2: Apply Cosmic Theme to SkeletonLoader Component

**Depends on:** No dependencies (parallelizable)

**Files:**
- Modify: `frontend/src/components/SkeletonLoader.tsx`

**Step 1: Update SkeletonCard (line 50)**

```tsx
// BEFORE:
className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"

// AFTER:
className="bg-[#141627]/70 backdrop-blur-md rounded-lg p-6 border border-[#2f2645]"
```

Also update the inner skeleton bars and the border-t divider:

```tsx
// All bg-gray-200 dark:bg-gray-700 → bg-white/10 (skeleton pulse bars)
// border-t border-gray-200 dark:border-gray-700 → border-t border-white/[0.08]
```

**Step 2: Update SkeletonList (line 70)**

```tsx
// BEFORE:
className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-3 border border-gray-200 dark:border-gray-700"

// AFTER:
className="bg-[#141627]/70 backdrop-blur-md rounded-lg p-4 mb-3 border border-[#2f2645]"
```

All `bg-gray-200 dark:bg-gray-700` → `bg-white/10`.

**Step 3: Update SkeletonCalendar (line 94)**

```tsx
// BEFORE:
className="bg-white dark:bg-gray-800 rounded-lg p-6"

// AFTER:
className="bg-[#141627]/70 backdrop-blur-md rounded-lg p-6 border border-[#2f2645]"
```

All `bg-gray-200 dark:bg-gray-700` → `bg-white/10`.
`text-gray-500 dark:text-gray-400` → `text-slate-400`.

**Step 4: Update SkeletonChart (lines 115-128)**

```tsx
// BEFORE:
className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg ..."
// AFTER:
className="aspect-square bg-white/5 rounded-lg ..."

// BEFORE: inner circles
className="bg-gray-200 dark:bg-gray-600 animate-pulse rounded-full ..."
// AFTER:
className="bg-white/10 animate-pulse rounded-full ..."

// BEFORE:
className="border-b border-gray-200 dark:border-gray-700"
// AFTER:
className="border-b border-white/[0.06]"
```

**Step 5: Verify and commit**

```bash
cd frontend && npx tsc --noEmit
cd frontend && npx vitest run
git add frontend/src/components/SkeletonLoader.tsx
git commit -m "style: apply cosmic theme to SkeletonLoader component"
```

---

## Phase 2: Page Header Fixes (Quick Wins)

### Task 3: Fix Page Header Subtitle Colors on Transit Pages

**Depends on:** No dependencies (parallelizable)

**Files:**
- Modify: `frontend/src/pages/TodayTransitsPage.tsx`
- Modify: `frontend/src/pages/RetrogradePage.tsx`
- Modify: `frontend/src/pages/MoonCalendarPage.tsx`

**Step 1: Replace subtitle text color on all three pages**

On each page, find the subtitle `<p>` tag under the `<h2>` page header:

```tsx
// BEFORE (on all three pages):
className="text-gray-600 dark:text-gray-400"

// AFTER:
className="text-slate-400"
```

**Step 2: Update EmptyState emoji calls to use Material Symbols**

In `TodayTransitsPage.tsx`, replace the two EmptyState usages:

```tsx
// Error state (line ~152):
// BEFORE:
<EmptyState icon="⚠️" title="Unable to load transits" ...>
// AFTER:
<EmptyState icon={<span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#ef4444' }}>warning</span>} title="Unable to load transits" ...>

// No charts state (line ~158):
// BEFORE:
<EmptyState icon="🌙" title="No transit data available" ...>
// AFTER:
<EmptyState icon={<span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#8b5cf6' }}>dark_mode</span>} title="No transit data available" ...>
```

In `RetrogradePage.tsx`, replace the two EmptyState usages:

```tsx
// Error state (line ~103):
// BEFORE:
<EmptyState icon="⚠️" ...>
// AFTER:
<EmptyState icon={<span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#ef4444' }}>warning</span>} ...>

// No charts state (line ~110):
// BEFORE:
<EmptyState icon="🌙" ...>
// AFTER:
<EmptyState icon={<span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#8b5cf6' }}>dark_mode</span>} ...>
```

**Step 3: Verify and commit**

```bash
cd frontend && npx tsc --noEmit
cd frontend && npx vitest run
git add frontend/src/pages/TodayTransitsPage.tsx frontend/src/pages/RetrogradePage.tsx frontend/src/pages/MoonCalendarPage.tsx
git commit -m "style: fix subtitle colors and EmptyState icons on transit pages"
```

---

### Task 4: Fix DashboardPage Emoji Icons

**Depends on:** No dependencies (parallelizable)

**Files:**
- Modify: `frontend/src/pages/DashboardPage.tsx`

**Step 1: Replace emoji in chart cards**

Replace the chart card info section (line 52-55):

```tsx
// BEFORE:
<div className="text-sm text-gray-600 dark:text-gray-400">
  <p>📅 {new Date(chart.birth_date).toLocaleDateString()}</p>
  <p>📍 {chart.birth_place_name}</p>
</div>

// AFTER:
<div className="text-sm text-slate-400 space-y-1">
  <p className="flex items-center gap-1.5">
    <span className="material-symbols-outlined" style={{ fontSize: '16px' }} aria-hidden="true">calendar_today</span>
    {new Date(chart.birth_date).toLocaleDateString()}
  </p>
  <p className="flex items-center gap-1.5">
    <span className="material-symbols-outlined" style={{ fontSize: '16px' }} aria-hidden="true">location_on</span>
    {chart.birth_place_name}
  </p>
</div>
```

**Step 2: Replace add-card emoji (line 77)**

```tsx
// BEFORE:
<div className="text-4xl mb-2">➕</div>
<p className="font-medium text-gray-600 dark:text-gray-400">Create New Chart</p>

// AFTER:
<div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-2">
  <span className="material-symbols-outlined text-primary" style={{ fontSize: '24px' }} aria-hidden="true">add</span>
</div>
<p className="font-medium text-slate-300">Create New Chart</p>
```

**Step 3: Fix card and dashed-border classes (lines 44, 74)**

```tsx
// Chart card (line 44):
// BEFORE:
className="card hover:shadow-lg transition-shadow cursor-pointer"
// AFTER:
className="bg-[#141627]/70 backdrop-blur-md rounded-xl border border-[#2f2645] hover:border-primary/30 transition-colors cursor-pointer"

// Add chart card (line 74):
// BEFORE:
className="card hover:shadow-lg transition-shadow cursor-pointer border-2 border-dashed border-gray-300 dark:border-gray-600 ..."
// AFTER:
className="bg-transparent rounded-xl hover:bg-white/5 transition-colors cursor-pointer border-2 border-dashed border-[#2f2645] ..."
```

**Step 4: Verify and commit**

```bash
cd frontend && npx tsc --noEmit
cd frontend && npx vitest run
git add frontend/src/pages/DashboardPage.tsx
git commit -m "style: replace emoji with Material Symbols and apply cosmic theme on DashboardPage"
```

---

## Phase 3: Full Page Theme + Icon Migration

### Task 5: Apply Cosmic Theme + Icon Migration to SettingsPage

**Depends on:** No dependencies

**Files:**
- Modify: `frontend/src/pages/SettingsPage.tsx`

**Step 1: Remove heroicons imports, add Material Symbols pattern**

Replace imports at top of file:

```tsx
// REMOVE these lines:
import {
  UserIcon,
  SunIcon,
  BellIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

// ADD nothing — use inline Material Symbols instead
```

**Step 2: Replace icon JSX in SettingsSection calls**

```tsx
// Profile section icon (line 140):
// BEFORE:
icon={<UserIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
// AFTER:
icon={<span className="material-symbols-outlined" style={{ fontSize: '20px' }}>person</span>}

// Display section icon (line 174):
// BEFORE:
icon={<SunIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
// AFTER:
icon={<span className="material-symbols-outlined" style={{ fontSize: '20px' }}>light_mode</span>}

// Notifications section icon (line 186):
// BEFORE:
icon={<BellIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
// AFTER:
icon={<span className="material-symbols-outlined" style={{ fontSize: '20px' }}>notifications</span>}

// Arrow link (line 164-168):
// BEFORE:
<button onClick={() => navigate('/profile')} className="flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 cursor-pointer">
  Go to Profile
  <ArrowRightIcon className="w-4 h-4" />
</button>
// AFTER:
<button onClick={() => navigate('/profile')} className="flex items-center gap-1 text-sm text-violet-300 hover:text-violet-200 cursor-pointer">
  Go to Profile
  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
</button>
```

**Step 3: Apply cosmic theme to SettingsSection wrapper**

In the `SettingsSection` function (lines 60-74):

```tsx
// BEFORE (line 62):
className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
// AFTER:
className="bg-[#141627]/70 backdrop-blur-md rounded-xl border border-[#2f2645]"

// BEFORE (line 63):
className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3"
// AFTER:
className="px-6 py-4 border-b border-white/[0.08] flex items-center gap-3"

// BEFORE (line 64):
className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg"
// AFTER:
className="p-1.5 bg-white/10 rounded-lg"

// BEFORE (line 69):
className="px-6 py-2 divide-y divide-gray-100 dark:divide-gray-700"
// AFTER:
className="px-6 py-2 divide-y divide-white/[0.06]"
```

**Step 4: Apply cosmic theme to text colors and Save button**

```tsx
// Section title (line 67):
// BEFORE: text-gray-900 dark:text-white
// AFTER: text-white

// Toggle label (line 27):
// BEFORE: text-gray-900 dark:text-white
// AFTER: text-white

// Toggle description (line 30):
// BEFORE: text-gray-500 dark:text-gray-400
// AFTER: text-slate-400

// Profile field labels (lines 147, 153):
// BEFORE: text-gray-500 dark:text-gray-400
// AFTER: text-slate-400

// Profile field values (lines 149, 155):
// BEFORE: text-gray-900 dark:text-white
// AFTER: text-white

// "Edit profile" label (line 161):
// BEFORE: text-gray-900 dark:text-white
// AFTER: text-white

// Page subtitle (line 131):
// BEFORE: text-gray-600 dark:text-gray-400
// AFTER: text-slate-400

// Save button (line 209):
// BEFORE: bg-indigo-600 ... hover:bg-indigo-700 ... focus-visible:outline-indigo-600
// AFTER: bg-primary ... hover:bg-primary/90 ... focus-visible:outline-primary

// Page header (line 130):
// BEFORE: text-gray-900 dark:text-white
// AFTER: text-white
```

**Step 5: Verify and commit**

```bash
cd frontend && npx tsc --noEmit
cd frontend && npx vitest run
git add frontend/src/pages/SettingsPage.tsx
git commit -m "style: apply cosmic theme and migrate heroicons to Material Symbols on SettingsPage"
```

---

### Task 6: Apply Cosmic Theme + Icon Migration to SubscriptionPage

**Depends on:** No dependencies

**Files:**
- Modify: `frontend/src/pages/SubscriptionPage.tsx`

**Step 1: Remove lucide and heroicons imports**

```tsx
// REMOVE:
import { CheckIcon } from '@heroicons/react/24/outline';
import { Crown, Star, Zap } from 'lucide-react';

// No replacement imports needed — use inline Material Symbols
```

**Step 2: Replace PricingTierCard icon prop values in TIERS array (lines 136-173)**

```tsx
// Free tier:
// BEFORE: icon: <Star className="w-5 h-5" />,
// AFTER: icon: <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>star</span>,

// Pro tier:
// BEFORE: icon: <Crown className="w-5 h-5" />,
// AFTER: icon: <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>workspace_premium</span>,

// Premium tier:
// BEFORE: icon: <Zap className="w-5 h-5" />,
// AFTER: icon: <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>bolt</span>,
```

**Step 3: Replace CheckIcon in feature lists**

In `PricingTierCard` (line 89):

```tsx
// BEFORE:
<CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
// AFTER:
<span className="material-symbols-outlined text-green-500 flex-shrink-0 mt-0.5" style={{ fontSize: '20px' }} aria-hidden="true">check</span>
```

In feature comparison table (line 291):

```tsx
// BEFORE:
<CheckIcon className="w-5 h-5 text-green-500 mx-auto" aria-label="Included" />
// AFTER:
<span className="material-symbols-outlined text-green-500" style={{ fontSize: '20px' }} aria-label="Included">check</span>
```

**Step 4: Apply cosmic theme to PricingTierCard (lines 44-121)**

```tsx
// Card wrapper (line 44):
// BEFORE: bg-white dark:bg-gray-800 ... border-gray-200 dark:border-gray-700
// AFTER: bg-[#141627]/70 backdrop-blur-md ... border-[#2f2645]

// Popular badge border (line 47):
// BEFORE: border-indigo-500 dark:border-indigo-400 shadow-lg
// AFTER: border-primary shadow-primary/25

// Current plan badge border (line 49):
// BEFORE: border-green-500 dark:border-green-400
// AFTER: border-green-500/50

// Popular badge bg (line 54):
// BEFORE: bg-indigo-600
// AFTER: bg-primary

// Tier name text (line 76):
// BEFORE: text-gray-900 dark:text-white
// AFTER: text-white

// Price text (line 80):
// BEFORE: text-gray-900 dark:text-white
// AFTER: text-white

// Period text (line 81):
// BEFORE: text-gray-500 dark:text-gray-400
// AFTER: text-slate-400

// Feature text (line 93):
// BEFORE: text-gray-700 dark:text-gray-300
// AFTER: text-slate-300

// CTA button - popular (line 107):
// BEFORE: bg-indigo-600 text-white hover:bg-indigo-700 ... focus-visible:outline-indigo-600
// AFTER: bg-primary text-white hover:bg-primary/90 ... focus-visible:outline-primary

// CTA button - secondary (line 108):
// BEFORE: bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600
// AFTER: bg-white/5 text-white border border-[#2f2645] hover:bg-white/10

// Current plan indicator (line 99):
// BEFORE: text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800
// AFTER: text-green-400 bg-green-500/10 border border-green-500/20
```

**Step 5: Apply cosmic theme to feature comparison table (lines 249-307)**

```tsx
// Table wrapper (line 249):
// BEFORE: bg-white dark:bg-gray-800 ... border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden
// AFTER: bg-[#141627]/70 backdrop-blur-md ... border border-[#2f2645] overflow-hidden

// Header row (line 253):
// BEFORE: border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750
// AFTER: border-b border-white/[0.08] bg-white/5

// Header feature text (line 254):
// BEFORE: text-gray-900 dark:text-white
// AFTER: text-white

// Header Free tier (line 257):
// BEFORE: text-gray-500 dark:text-gray-400
// AFTER: text-slate-400

// Header Pro tier (line 259):
// BEFORE: text-indigo-600 dark:text-indigo-400
// AFTER: text-primary

// Row body (line 268):
// BEFORE: divide-y divide-gray-100 dark:divide-gray-700
// AFTER: divide-y divide-white/[0.06]

// Row hover (line 281):
// BEFORE: hover:bg-gray-50 dark:hover:bg-gray-700/50
// AFTER: hover:bg-white/5

// Row feature text (line 283):
// BEFORE: text-gray-700 dark:text-gray-300 font-medium
// AFTER: text-slate-300 font-medium

// Row value text (line 296):
// BEFORE: text-gray-600 dark:text-gray-400
// AFTER: text-slate-400

// Dash placeholder (line 293):
// BEFORE: text-gray-300 dark:text-gray-600
// AFTER: text-white/20
```

**Step 6: Apply cosmic theme to page header**

```tsx
// Page title (line 199):
// BEFORE: text-gray-900 dark:text-white
// AFTER: text-white

// Page subtitle (line 201):
// BEFORE: text-gray-600 dark:text-gray-400
// AFTER: text-slate-400

// "Current Usage" subtitle (line 206):
// BEFORE: text-gray-900 dark:text-white
// AFTER: text-white

// "Choose Your Plan" subtitle (line 223):
// BEFORE: text-gray-900 dark:text-white
// AFTER: text-white

// "Feature Comparison" subtitle (line 247):
// BEFORE: text-gray-900 dark:text-white
// AFTER: text-white
```

**Step 7: Verify and commit**

```bash
cd frontend && npx tsc --noEmit
cd frontend && npx vitest run
git add frontend/src/pages/SubscriptionPage.tsx
git commit -m "style: apply cosmic theme and migrate icons to Material Symbols on SubscriptionPage"
```

---

### Task 7: Apply Cosmic Theme + Icon Migration to EphemerisPage

**Depends on:** No dependencies

**Files:**
- Modify: `frontend/src/pages/EphemerisPage.tsx`

**Step 1: Remove lucide imports**

```tsx
// REMOVE:
import { RefreshCw, Globe } from 'lucide-react';
// No replacement — use inline Material Symbols
```

**Step 2: Replace icon usage**

```tsx
// Page header icon (line 146):
// BEFORE:
<div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
  <Globe className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
</div>
// AFTER:
<div className="p-2.5 bg-primary/10 rounded-xl">
  <span className="material-symbols-outlined text-primary" style={{ fontSize: '22px' }}>public</span>
</div>

// Refresh button icon (line 159):
// BEFORE:
<RefreshCw className="w-4 h-4" />
// AFTER:
<span className="material-symbols-outlined" style={{ fontSize: '18px' }}>refresh</span>
```

**Step 3: Apply cosmic theme to TransitTable card components**

In `TransitTable` (lines 72-125), update each card:

```tsx
// Planet group card (line 75):
// BEFORE: bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden
// AFTER: bg-[#141627]/70 backdrop-blur-md rounded-xl border border-[#2f2645] overflow-hidden

// Planet header (line 79):
// BEFORE: bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700
// AFTER: bg-white/5 border-b border-white/[0.08]

// Planet name (line 85):
// BEFORE: text-gray-900 dark:text-white
// AFTER: text-white

// Active transits count (line 87):
// BEFORE: text-gray-500 dark:text-gray-400
// AFTER: text-slate-400

// Transit rows divider (line 94):
// BEFORE: divide-y divide-gray-100 dark:divide-gray-700
// AFTER: divide-y divide-white/[0.06]

// Transit row hover (line 98):
// BEFORE: hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors
// AFTER: hover:bg-white/5 transition-colors

// Planet name in row (line 101):
// BEFORE: text-gray-900 dark:text-white
// AFTER: text-white

// Arrow separator (line 104):
// BEFORE: text-gray-400 dark:text-gray-500
// AFTER: text-slate-500

// Orb text (line 114):
// BEFORE: text-gray-500 dark:text-gray-400
// AFTER: text-slate-400
```

**Step 4: Apply cosmic theme to refresh button and page header**

```tsx
// Refresh button (lines 155-162):
// BEFORE: bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700
// AFTER: bg-white/5 border border-[#2f2645] hover:bg-white/10
// Text: text-gray-700 dark:text-gray-300 → text-slate-300

// Page title (line 149):
// BEFORE: text-gray-900 dark:text-white
// AFTER: text-white

// Page subtitle (line 150):
// BEFORE: text-gray-600 dark:text-gray-400
// AFTER: text-slate-400

// Last updated text (line 168):
// BEFORE: text-gray-500 dark:text-gray-400
// AFTER: text-slate-400
```

**Step 5: Fix EmptyState emoji calls**

```tsx
// Error state (line 182):
// BEFORE: icon="⚠️"
// AFTER: icon={<span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#ef4444' }}>warning</span>}

// Empty data state (line 190):
// BEFORE: icon="🌌"
// AFTER: icon={<span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#8b5cf6' }}>nights_stay</span>}
```

**Step 6: Verify and commit**

```bash
cd frontend && npx tsc --noEmit
cd frontend && npx vitest run
git add frontend/src/pages/EphemerisPage.tsx
git commit -m "style: apply cosmic theme and migrate lucide icons to Material Symbols on EphemerisPage"
```

---

### Task 8: Apply Cosmic Theme + Icon Migration to LearnPage

**Depends on:** No dependencies

**Files:**
- Modify: `frontend/src/pages/LearnPage.tsx`

**Step 1: Remove heroicons imports**

```tsx
// REMOVE:
import { BookOpenIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
```

**Step 2: Replace icon usage in page header**

```tsx
// Page header icon (lines 121-123):
// BEFORE:
<div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
  <BookOpenIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
</div>
// AFTER:
<div className="p-2.5 bg-primary/10 rounded-xl">
  <span className="material-symbols-outlined text-primary" style={{ fontSize: '22px' }}>menu_book</span>
</div>
```

**Step 3: Replace section header SparklesIcon**

Replace each section header (planets, signs, houses, aspects):

```tsx
// BEFORE:
<SparklesIcon className="w-5 h-5 text-amber-500" />
// AFTER (planets):
<span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#f59e0b' }}>auto_awesome</span>

// BEFORE:
<SparklesIcon className="w-5 h-5 text-rose-500" />
// AFTER (signs):
<span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#f43f5e' }}>auto_awesome</span>

// BEFORE:
<SparklesIcon className="w-5 h-5 text-emerald-500" />
// AFTER (houses):
<span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#10b981' }}>auto_awesome</span>

// BEFORE:
<SparklesIcon className="w-5 h-5 text-blue-500" />
// AFTER (aspects):
<span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#3b82f6' }}>auto_awesome</span>
```

**Step 4: Replace chevron icons in ExpandableCard**

```tsx
// BEFORE (line 41):
<ChevronUpIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
// AFTER:
<span className="material-symbols-outlined text-slate-400 flex-shrink-0" style={{ fontSize: '20px' }}>expand_less</span>

// BEFORE (line 43):
<ChevronDownIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
// AFTER:
<span className="material-symbols-outlined text-slate-400 flex-shrink-0" style={{ fontSize: '20px' }}>expand_more</span>
```

**Step 5: Apply cosmic theme to ExpandableCard**

```tsx
// Card wrapper (line 22):
// BEFORE: bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden
// AFTER: bg-[#141627]/70 backdrop-blur-md rounded-xl border border-[#2f2645] overflow-hidden

// Button hover (line 24):
// BEFORE: hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors
// AFTER: hover:bg-white/5 transition-colors

// Title text (line 34):
// BEFORE: text-gray-900 dark:text-white
// AFTER: text-white

// Subtitle text (line 36):
// BEFORE: text-gray-500 dark:text-gray-400
// AFTER: text-slate-400

// Content border (line 48):
// BEFORE: border-t border-gray-100 dark:border-gray-700
// AFTER: border-t border-white/[0.08]

// Content text (lines 149, 185, 209, 248):
// BEFORE: text-gray-600 dark:text-gray-300
// AFTER: text-slate-300
```

**Step 6: Apply cosmic theme to page header text**

```tsx
// Page title (line 125):
// BEFORE: text-gray-900 dark:text-white
// AFTER: text-white

// Page subtitle (line 126):
// BEFORE: text-gray-600 dark:text-gray-400
// AFTER: text-slate-400

// Section titles (lines 137, 159, 196, 221):
// BEFORE: text-gray-900 dark:text-white
// AFTER: text-white

// Section subtitles (lines 139, 161, 198, 223):
// BEFORE: text-gray-500 dark:text-gray-400
// AFTER: text-slate-400
```

**Step 7: Fix aspect nature badge colors for dark bg**

```tsx
// Nature badges (lines 236-242):
// BEFORE: bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400
// AFTER: bg-green-500/10 text-green-400

// BEFORE: bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400
// AFTER: bg-red-500/10 text-red-400

// BEFORE: bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400
// AFTER: bg-amber-500/10 text-amber-400

// Element badges (lines 176-179) - same pattern:
// Replace all `bg-{color}-100 text-{color}-700 dark:bg-{color}-900/30 dark:text-{color}-400`
// With: `bg-{color}-500/10 text-{color}-400`
```

**Step 8: Verify and commit**

```bash
cd frontend && npx tsc --noEmit
cd frontend && npx vitest run
git add frontend/src/pages/LearnPage.tsx
git commit -m "style: apply cosmic theme and migrate heroicons to Material Symbols on LearnPage"
```

---

### Task 9: Apply Cosmic Theme to StaticPage

**Depends on:** No dependencies

**Files:**
- Modify: `frontend/src/pages/StaticPage.tsx`

**Step 1: Fix "Go Home" button colors**

```tsx
// Line 25-26:
// BEFORE: bg-indigo-600 ... hover:bg-indigo-700 ... focus:ring-indigo-500
// AFTER: bg-primary ... hover:bg-primary/90 ... focus:ring-primary
```

**Step 2: Fix "Back to Home" link colors**

```tsx
// Line 63:
// BEFORE: text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300
// AFTER: text-violet-300 hover:text-violet-200
```

**Step 3: Fix divider and border colors**

```tsx
// Line 44 divider:
// BEFORE: bg-gray-200 dark:bg-gray-700
// AFTER: bg-white/[0.08]

// Line 60 footer border:
// BEFORE: border-t border-gray-200 dark:border-gray-700
// AFTER: border-t border-white/[0.08]
```

**Step 4: Fix text colors**

```tsx
// Page title (line 38):
// BEFORE: text-gray-900 dark:text-gray-100
// AFTER: text-white

// Description (line 41):
// BEFORE: text-gray-600 dark:text-gray-400
// AFTER: text-slate-400

// Section heading (line 49):
// BEFORE: text-gray-900 dark:text-gray-100
// AFTER: text-white

// Section content (line 52):
// BEFORE: text-gray-700 dark:text-gray-300
// AFTER: text-slate-300
```

**Step 5: Verify and commit**

```bash
cd frontend && npx tsc --noEmit
cd frontend && npx vitest run
git add frontend/src/pages/StaticPage.tsx
git commit -m "style: apply cosmic theme and fix button/link colors on StaticPage"
```

---

### Task 10: Migrate UsageMeter Icons

**Depends on:** No dependencies

**Files:**
- Modify: `frontend/src/components/UsageMeter.tsx`

**Step 1: Remove lucide import**

```tsx
// REMOVE:
import { AlertTriangle, Crown, BarChart3 } from 'lucide-react';
```

**Step 2: Replace icon JSX**

```tsx
// Tier crown icon (line 93-96):
// BEFORE:
<Crown size={16} style={{ color: tierConfig.color }} aria-hidden="true" />
// AFTER:
<span className="material-symbols-outlined" style={{ fontSize: '16px', color: tierConfig.color }} aria-hidden="true">workspace_premium</span>

// Usage bar chart icon (line 103):
// BEFORE:
<BarChart3 size={14} aria-hidden="true" />
// AFTER:
<span className="material-symbols-outlined" style={{ fontSize: '14px' }} aria-hidden="true">bar_chart</span>

// Warning alert icons (lines 135, 151):
// BEFORE:
<AlertTriangle size={14} aria-hidden="true" />
// AFTER:
<span className="material-symbols-outlined" style={{ fontSize: '14px' }} aria-hidden="true">warning</span>
```

**Step 3: Fix text colors**

```tsx
// Usage count text (line 102):
// BEFORE: text-white/70
// AFTER: text-slate-300

// Plan features label (line 169):
// BEFORE: text-white/50
// AFTER: text-slate-400

// Feature list items (line 170):
// BEFORE: text-white/70
// AFTER: text-slate-300
```

**Step 4: Verify and commit**

```bash
cd frontend && npx tsc --noEmit
cd frontend && npx vitest run
git add frontend/src/components/UsageMeter.tsx
git commit -m "style: migrate lucide icons to Material Symbols and fix text colors on UsageMeter"
```

---

## Phase 4: Cleanup

### Task 11: Remove Unused Icon Package Imports

**Depends on:** Tasks 5, 6, 7, 8, 10 (all icon migrations complete)

**Files:**
- Modify: `frontend/package.json` (if heroicons/lucide are no longer imported anywhere)

**Step 1: Verify no remaining heroicons imports**

```bash
cd frontend && grep -r "@heroicons/react" src/ --include="*.tsx" --include="*.ts"
```

If the only remaining import is in `AppLayout.tsx` (which is outside this plan's scope), do NOT remove the package. Just note it as remaining tech debt.

**Step 2: Verify no remaining lucide-react imports**

```bash
cd frontend && grep -r "lucide-react" src/ --include="*.tsx" --include="*.ts"
```

If only AppLayout or other files outside this plan still use lucide, do NOT remove the package.

**Step 3: Commit (only if packages are fully unused)**

Only run this if BOTH packages have zero imports:

```bash
cd frontend && npm uninstall @heroicons/react lucide-react
git add frontend/package.json frontend/package-lock.json
git commit -m "chore: remove unused heroicons and lucide icon packages"
```

If packages still have imports, skip this commit and add a comment in the plan tracking.

---

## Verification

After all tasks are complete:

1. **Type check:** `cd frontend && npx tsc --noEmit` — no errors
2. **Unit tests:** `cd frontend && npx vitest run` — all pass
3. **Visual check (manual):** Start dev server `cd frontend && npm run dev`, navigate to:
   - `/dashboard` — cards use cosmic bg, Material Symbol icons, no emoji
   - `/settings` — cosmic cards, Material Symbol icons, primary buttons
   - `/subscription` — cosmic pricing cards, primary accents, Material Symbols
   - `/ephemeris` — cosmic transit cards, Material Symbol icons
   - `/learn` — cosmic expandable cards, Material Symbol icons
   - `/about` (or any static page) — cosmic text colors, primary buttons, violet links
   - `/transits/today` — cosmic EmptyState, Material Symbol icons
   - `/retrograde` — cosmic EmptyState, Material Symbol icons
4. **No regressions on existing pages:** Check `/charts/new`, `/charts/:id`, `/analysis/:id`

---

## Files Modified (Summary)

| File | Task(s) | Changes |
|------|---------|---------|
| `frontend/src/components/EmptyState.tsx` | 1 | Cosmic theme, Material Symbol presets, button colors |
| `frontend/src/components/SkeletonLoader.tsx` | 2 | Cosmic theme on all skeleton variants |
| `frontend/src/components/UsageMeter.tsx` | 10 | Lucide → Material Symbols, text colors |
| `frontend/src/pages/DashboardPage.tsx` | 4 | Emoji → Material Symbols, card cosmic theme |
| `frontend/src/pages/TodayTransitsPage.tsx` | 3 | Subtitle color, EmptyState icons |
| `frontend/src/pages/RetrogradePage.tsx` | 3 | Subtitle color, EmptyState icons |
| `frontend/src/pages/MoonCalendarPage.tsx` | 3 | Subtitle color |
| `frontend/src/pages/SettingsPage.tsx` | 5 | Full cosmic theme, heroicons → Material Symbols |
| `frontend/src/pages/SubscriptionPage.tsx` | 6 | Full cosmic theme, lucide → Material Symbols |
| `frontend/src/pages/EphemerisPage.tsx` | 7 | Full cosmic theme, lucide → Material Symbols |
| `frontend/src/pages/LearnPage.tsx` | 8 | Full cosmic theme, heroicons → Material Symbols |
| `frontend/src/pages/StaticPage.tsx` | 9 | Cosmic theme, button/link colors |
| `frontend/package.json` | 11 | Remove unused icon packages (if applicable) |
