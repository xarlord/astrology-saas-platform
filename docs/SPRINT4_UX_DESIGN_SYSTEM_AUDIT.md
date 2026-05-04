# Sprint 4: Design System Consistency Audit

**Date:** 2026-04-04
**Auditor:** UX Designer 2
**Scope:** All pages created after Sprint 3 audit resolution
**Status:** OPEN

---

## Executive Summary

The Sprint 3 UX audit resolved all 10 original findings and established a consistent cosmic dark theme across the core pages. However, **11 new pages** added during the "Add All Missing Pages" initiative were built using generic Tailwind utility classes instead of the AstroVerse design system tokens. This creates a jarring visual split — users see a cosmic astrology app on core pages but a generic SaaS dashboard on new pages.

**Severity:** HIGH — design system fragmentation directly impacts brand perception and user trust.

---

## Audit Findings

### C1: Cosmic Theme Not Applied to New Pages [CRITICAL]

**Pages affected:** SettingsPage, SubscriptionPage, EphemerisPage, LearnPage, RetrogradePage, StaticPage, MoonCalendarPage, TodayTransitsPage

**Issue:** All new pages use standard Tailwind dark mode classes instead of AstroVerse cosmic tokens.

| Element | Design System Token | New Pages Use |
|---------|-------------------|---------------|
| Card background | `bg-[#141627]/70 backdrop-blur-md` | `bg-white dark:bg-gray-800` |
| Card border | `border-[#2f2645]` | `border-gray-200 dark:border-gray-700` |
| Page background | `bg-[#0B0D17]` | `bg-gray-50 dark:bg-gray-900` |
| Primary text | `text-white` (on dark bg) | `text-gray-900 dark:text-white` |
| Secondary text | `text-slate-300` | `text-gray-600 dark:text-gray-400` |
| Primary button | `bg-primary` (#6b3de1) | `bg-indigo-600` |
| Hover state | `hover:bg-white/5` | `hover:bg-gray-50 dark:hover:bg-gray-700` |
| Divider | `border-white/[0.08]` | `border-gray-200 dark:border-gray-700` |

**Fix:** Replace all generic Tailwind classes with cosmic theme tokens per the design system.

---

### C2: Icon Library Fragmentation [CRITICAL]

**Issue:** Three different icon libraries are in use across the frontend.

| Page/Component | Icon Library | Design System Spec |
|---------------|-------------|-------------------|
| SettingsPage | `@heroicons/react` | Material Symbols Outlined |
| LearnPage | `@heroicons/react` | Material Symbols Outlined |
| EphemerisPage | `lucide-react` | Material Symbols Outlined |
| SubscriptionPage | `lucide-react` | Material Symbols Outlined |
| UsageMeter | `lucide-react` | Material Symbols Outlined |
| AppLayout | Material Symbols Outlined | Material Symbols Outlined |
| DashboardPage | Emoji (➕📅📍) | Material Symbols Outlined |
| EmptyState | Emoji (⚠️🌙🌌) | Material Symbols Outlined |

**Fix:** Migrate all new pages to `material-symbols-outlined` at sizes `[18px]` buttons, `[20px]` sidebar, `[22px]` mobile nav.

---

### H1: Button Color Inconsistency [HIGH]

**Pages affected:** SettingsPage, SubscriptionPage, StaticPage

**Issue:** Primary action buttons use `bg-indigo-600` (#4f46e5) instead of the brand primary `bg-primary` (#6b3de1). This creates two different purple shades across the app.

**Occurrences:**
- `SettingsPage.tsx:209` — Save Settings button
- `SubscriptionPage.tsx:107` — Pro tier CTA button
- `StaticPage.tsx:25` — "Go Home" button
- `StaticPage.tsx:63` — Back to Home link uses `text-indigo-600`

**Fix:** Replace all `bg-indigo-600` with `bg-primary`, all `hover:bg-indigo-700` with `hover:bg-primary-dark` (or `hover:bg-primary/90`).

---

### H2: Link Color Fails Contrast on Dark Backgrounds [HIGH]

**Pages affected:** StaticPage, SettingsPage

**Issue:** Links use `text-indigo-600 dark:text-indigo-400` which fails WCAG contrast on dark backgrounds. The design system specifies `text-violet-300` for links on dark backgrounds.

**Fix:** Replace link colors with `text-violet-300 hover:text-violet-200` per design tokens.

---

### H3: Card Component Inconsistency [HIGH]

**Issue:** New pages define card styles inline with `bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm` instead of using the `.card` class established in the design system.

**Pages affected:** LearnPage (ExpandableCard), SettingsPage (SettingsSection), EphemerisPage (TransitTable), SubscriptionPage (PricingTierCard)

**Fix:** Either:
- (a) Use the `.card` class from the design system, or
- (b) Create cosmic-themed card variants that match the design tokens

---

### M1: ExpandableCard Not Part of Design System [MEDIUM]

**Issue:** LearnPage defines a local `ExpandableCard` component that should be promoted to the design system for reuse. Currently it uses generic styling.

**Fix:** Create a shared `ExpandableCard` component in `components/` with cosmic theme tokens.

---

### M2: SettingsSection Not Part of Design System [MEDIUM]

**Issue:** SettingsPage defines a local `SettingsSection` component that should be promoted to the design system for reuse.

**Fix:** Create a shared `SettingsSection` component in `components/` with cosmic theme tokens.

---

### M3: ToggleSwitch Not Part of Design System [MEDIUM]

**Issue:** SettingsPage defines a local `ToggleSwitch` component that should be promoted to the design system for reuse.

**Fix:** Create a shared `ToggleSwitch` component in `components/` with cosmic theme tokens.

---

### M4: Emoji Usage Instead of Icons [MEDIUM]

**Issue:** Several pages and components use emoji characters for icons instead of the design system's Material Symbols Outlined icon font.

**Occurrences:**
- `DashboardPage.tsx:77` — ➕ (add chart)
- `DashboardPage.tsx:53` — 📅 (date), 📍 (location)
- `EmptyState` component — ⚠️, 🌙, 🌌 (various empty states)
- `TodayTransitsPage` — same EmptyState emoji usage

**Fix:** Replace with Material Symbols Outlined equivalents:
- ➕ → `add_circle` icon
- 📅 → `calendar_today` icon
- 📍 → `location_on` icon
- ⚠️ → `warning` icon
- 🌙 → `dark_mode` icon
- 🌌 → `nights_stay` icon

---

### DS1: PricingTierCard Color Mismatch [MINOR]

**Issue:** SubscriptionPage pricing cards use `border-indigo-500` for "popular" tier and `border-green-500` for "current" tier. The design system uses `bg-primary` as the primary accent.

**Fix:** Use `border-primary` for "popular" tier highlight.

---

### DS2: SubscriptionPage Tier Logic Bug [MINOR]

**Issue:** `SubscriptionPage.tsx:190` has dead logic:
```typescript
const currentTier = (charts.length > 0 ? 'free' : 'free') as Tier;
```
Both branches return `'free'`, so the user is always shown as "Free" tier regardless of actual subscription.

**Fix:** Fetch tier from user profile/API instead of deriving from chart count.

---

## Summary Table

| ID | Severity | Component | Issue |
|----|----------|-----------|-------|
| C1 | CRITICAL | 8 pages | Cosmic theme tokens not applied |
| C2 | CRITICAL | 6 pages | Icon library fragmentation |
| H1 | HIGH | 3 pages | Button color: indigo vs primary |
| H2 | HIGH | 2 pages | Link contrast fails WCAG on dark bg |
| H3 | HIGH | 4 pages | Card styling inconsistent |
| M1 | MEDIUM | LearnPage | ExpandableCard not shared |
| M2 | MEDIUM | SettingsPage | SettingsSection not shared |
| M3 | MEDIUM | SettingsPage | ToggleSwitch not shared |
| M4 | MEDIUM | 3 pages | Emoji instead of icons |
| DS1 | MINOR | SubscriptionPage | Popular tier border color |
| DS2 | MINOR | SubscriptionPage | Tier logic always returns 'free' |

**Total: 11 findings** (2 CRITICAL, 3 HIGH, 4 MEDIUM, 2 MINOR)

---

## Design System Reference

### Cosmic Dark Theme Tokens (Quick Reference)

```
Backgrounds:
  Page:        bg-[#0B0D17]
  Card/Panel:  bg-[#141627]/70 backdrop-blur-md
  Hover:       hover:bg-white/5
  Active:      bg-white/10

Borders:
  Standard:    border-[#2f2645]
  Subtle:      border-white/10

Text:
  Primary:     text-white
  Secondary:   text-slate-300
  Body:        text-slate-400
  Links:       text-violet-300

Accent:
  Primary:     bg-primary (#6b3de1)
  Glow:        shadow-primary/25

Icons:
  Library:     material-symbols-outlined
  Sizes:       [20px] sidebar, [18px] buttons, [22px] mobile nav
```

---

## Recommended Fix Order

1. **C1** — Apply cosmic tokens to all new pages (highest visual impact)
2. **C2** — Migrate icon libraries to Material Symbols Outlined
3. **H1** — Fix button colors to use `bg-primary`
4. **H2** — Fix link colors to use `text-violet-300`
5. **H3** — Standardize card components
6. **M1-M3** — Promote local components to shared design system
7. **M4** — Replace emoji with proper icons
8. **DS1-DS2** — Minor fixes
