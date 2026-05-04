# Sprint 4: Cosmic Theme Application Spec

**Date:** 2026-04-04
**Author:** UX Designer 2
**Resolves:** C1, C2, H1, H2, H3, M4 from SPRINT4_UX_DESIGN_SYSTEM_AUDIT.md
**Depends on:** Existing cosmic theme tokens in AppLayout and core components

---

## Overview

This spec provides exact class replacements for bringing 8 new pages into the AstroVerse cosmic dark theme. Every change is a 1:1 class swap — no structural or logic changes needed.

---

## Token Mapping Table

### Background Tokens

| Generic Class | Replace With |
|--------------|-------------|
| `bg-white dark:bg-gray-800` | `bg-[#141627]/70 backdrop-blur-md` |
| `bg-gray-50 dark:bg-gray-900` | `bg-[#0B0D17]` |
| `bg-gray-50 dark:bg-gray-750` | `bg-white/5` |
| `hover:bg-gray-50 dark:hover:bg-gray-700/50` | `hover:bg-white/5` |
| `hover:bg-gray-50 dark:hover:bg-gray-700` | `hover:bg-white/5` |
| `hover:bg-gray-50 dark:hover:bg-gray-600` | `hover:bg-white/5` |
| `bg-white/5 dark:bg-black/20` | `bg-white/5` (already close) |
| `bg-gray-100 dark:bg-gray-700` | `bg-white/10` |
| `bg-green-50 dark:bg-green-900/20` | `bg-green-500/10` |
| `bg-indigo-100 dark:bg-indigo-900/30` | `bg-primary/10` |

### Border Tokens

| Generic Class | Replace With |
|--------------|-------------|
| `border-gray-200 dark:border-gray-700` | `border-[#2f2645]` |
| `border-gray-300 dark:border-gray-600` | `border-[#2f2645]` |
| `border-gray-100 dark:border-gray-700` | `border-white/[0.08]` |
| `border-b border-gray-200 dark:border-gray-700` | `border-b border-white/[0.08]` |
| `divide-y divide-gray-100 dark:divide-gray-700` | `divide-y divide-white/[0.06]` |
| `border-t border-gray-100 dark:border-gray-700` | `border-t border-white/[0.08]` |

### Text Tokens

| Generic Class | Replace With |
|--------------|-------------|
| `text-gray-900 dark:text-white` | `text-white` |
| `text-gray-700 dark:text-gray-300` | `text-slate-300` |
| `text-gray-600 dark:text-gray-400` | `text-slate-400` |
| `text-gray-500 dark:text-gray-400` | `text-slate-400` |
| `text-gray-400 dark:text-gray-500` | `text-slate-500` |
| `text-gray-300 dark:text-gray-600` | `text-slate-500` |
| `text-indigo-600 dark:text-indigo-400` | `text-violet-300` |
| `text-indigo-600 dark:text-white` | `text-primary` |
| `hover:text-indigo-700 dark:hover:text-indigo-300` | `hover:text-violet-200` |
| `text-gray-300 dark:text-gray-600` (dash placeholder) | `text-white/20` |

### Button Tokens

| Generic Class | Replace With |
|--------------|-------------|
| `bg-indigo-600` | `bg-primary` |
| `hover:bg-indigo-700` | `hover:bg-primary/90` |
| `focus-visible:outline-indigo-600` | `focus-visible:outline-primary` |
| `focus-visible:ring-indigo-500` | `focus-visible:ring-primary` |
| `border-indigo-500 dark:border-indigo-400` | `border-primary` |
| `shadow-lg` on card with popular badge | `shadow-primary/25` |

### Shadow Tokens

| Generic Class | Replace With |
|--------------|-------------|
| `shadow-sm` | `shadow-none` (cosmic theme uses borders, not shadows) |
| `shadow-lg` | `shadow-none` |
| `hover:shadow-lg` | `hover:border-primary/50` |

---

## Icon Migration Map

### Heroicons → Material Symbols Outlined

| Heroicon Component | Material Symbol |
|-------------------|----------------|
| `UserIcon` | `person` |
| `SunIcon` | `light_mode` |
| `BellIcon` | `notifications` |
| `ArrowRightIcon` | `arrow_forward` |
| `BookOpenIcon` | `menu_book` |
| `SparklesIcon` | `auto_awesome` |
| `ChevronDownIcon` | `expand_more` |
| `ChevronUpIcon` | `expand_less` |
| `CheckIcon` | `check` |

### Lucide → Material Symbols Outlined

| Lucide Component | Material Symbol |
|-----------------|----------------|
| `RefreshCw` | `refresh` |
| `Globe` | `public` |
| `Crown` | `workspace_premium` |
| `Star` | `star` |
| `Zap` | `bolt` |
| `AlertTriangle` | `warning` |
| `BarChart3` | `bar_chart` |

### Emoji → Material Symbols Outlined

| Emoji | Material Symbol |
|-------|----------------|
| ➕ | `add_circle` |
| 📅 | `calendar_today` |
| 📍 | `location_on` |
| ⚠️ | `warning` |
| 🌙 | `dark_mode` |
| 🌌 | `nights_stay` |

### Material Symbol Usage Pattern

```tsx
// Correct usage:
<span className="material-symbols-outlined" style={{ fontSize: '18px' }} aria-hidden="true">
  icon_name
</span>

// With button:
<button className="flex items-center gap-2 ...">
  <span className="material-symbols-outlined" style={{ fontSize: '18px' }} aria-hidden="true">
    refresh
  </span>
  Refresh
</button>
```

---

## Page-by-Page Changes

### 1. SettingsPage.tsx

**Icon changes:**
- `UserIcon` → `<span className="material-symbols-outlined" style={{ fontSize: '20px' }}>person</span>`
- `SunIcon` → `<span className="material-symbols-outlined" style={{ fontSize: '20px' }}>light_mode</span>`
- `BellIcon` → `<span className="material-symbols-outlined" style={{ fontSize: '20px' }}>notifications</span>`
- `ArrowRightIcon` → `<span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>`

**Theme changes on SettingsSection wrapper:**
- `bg-white dark:bg-gray-800` → `bg-[#141627]/70 backdrop-blur-md`
- `border border-gray-200 dark:border-gray-700` → `border border-[#2f2645]`
- `border-b border-gray-200 dark:border-gray-700` → `border-b border-white/[0.08]`
- `bg-gray-100 dark:bg-gray-700 rounded-lg` → `bg-white/10 rounded-lg`
- `divide-y divide-gray-100 dark:divide-gray-700` → `divide-y divide-white/[0.06]`

**Button:**
- `bg-indigo-600` → `bg-primary`
- `hover:bg-indigo-700` → `hover:bg-primary/90`
- `focus-visible:outline-indigo-600` → `focus-visible:outline-primary`

**Link:**
- `text-indigo-600 dark:text-indigo-400` → `text-violet-300`
- `hover:text-indigo-700 dark:hover:text-indigo-300` → `hover:text-violet-200`

---

### 2. SubscriptionPage.tsx

**Icon changes:**
- `CheckIcon` → `<span className="material-symbols-outlined" style={{ fontSize: '20px' }}>check</span>`
- `Crown` → `<span className="material-symbols-outlined" style={{ fontSize: '20px' }}>workspace_premium</span>`
- `Star` → `<span className="material-symbols-outlined" style={{ fontSize: '20px' }}>star</span>`
- `Zap` → `<span className="material-symbols-outlined" style={{ fontSize: '20px' }}>bolt</span>`

**Theme changes on PricingTierCard:**
- `bg-white dark:bg-gray-800` → `bg-[#141627]/70 backdrop-blur-md`
- `border-gray-200 dark:border-gray-700` → `border-[#2f2645]`
- `border-indigo-500 dark:border-indigo-400` → `border-primary`
- `border-green-500 dark:border-green-400` → `border-green-500/50`
- `bg-indigo-600` (popular badge) → `bg-primary`
- `bg-indigo-600` (CTA button) → `bg-primary`
- `hover:bg-indigo-700` → `hover:bg-primary/90`
- `bg-white dark:bg-gray-700` (secondary CTA) → `bg-white/5`
- `border border-gray-300 dark:border-gray-600` → `border border-[#2f2645]`
- `hover:bg-gray-50 dark:hover:bg-gray-600` → `hover:bg-white/10`
- `text-gray-700 dark:text-gray-200` → `text-white`

**Feature comparison table:**
- `bg-white dark:bg-gray-800` → `bg-[#141627]/70 backdrop-blur-md`
- `border border-gray-200 dark:border-gray-700` → `border border-[#2f2645]`
- `bg-gray-50 dark:bg-gray-750` → `bg-white/5`
- `border-b border-gray-200 dark:border-gray-700` → `border-b border-white/[0.08]`
- `divide-y divide-gray-100 dark:divide-gray-700` → `divide-y divide-white/[0.06]`
- `hover:bg-gray-50 dark:hover:bg-gray-700/50` → `hover:bg-white/5`
- `text-indigo-600 dark:text-indigo-400` → `text-primary`
- `text-amber-600 dark:text-amber-400` → `text-amber-400`

---

### 3. EphemerisPage.tsx

**Icon changes:**
- `RefreshCw` → `refresh`
- `Globe` → `public`

**Theme changes on TransitTable cards:**
- `bg-white dark:bg-gray-800` → `bg-[#141627]/70 backdrop-blur-md`
- `border border-gray-200 dark:border-gray-700` → `border border-[#2f2645]`
- `bg-gray-50 dark:bg-gray-750` → `bg-white/5`
- `border-b border-gray-200 dark:border-gray-700` → `border-b border-white/[0.08]`
- `divide-y divide-gray-100 dark:divide-gray-700` → `divide-y divide-white/[0.06]`
- `hover:bg-gray-50 dark:hover:bg-gray-700/50` → `hover:bg-white/5`
- `bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600` (refresh button) → `bg-white/5 border border-[#2f2645]`
- `hover:bg-gray-50 dark:hover:bg-gray-700` → `hover:bg-white/10`
- `bg-indigo-100 dark:bg-indigo-900/30` → `bg-primary/10`

---

### 4. LearnPage.tsx

**Icon changes:**
- `BookOpenIcon` → `menu_book`
- `SparklesIcon` → `auto_awesome`
- `ChevronDownIcon` → `expand_more`
- `ChevronUpIcon` → `expand_less`

**Theme changes on ExpandableCard:**
- `bg-white dark:bg-gray-800` → `bg-[#141627]/70 backdrop-blur-md`
- `border border-gray-200 dark:border-gray-700` → `border border-[#2f2645]`
- `shadow-sm` → remove (cosmic theme uses borders)
- `hover:bg-gray-50 dark:hover:bg-gray-750` → `hover:bg-white/5`
- `border-t border-gray-100 dark:border-gray-700` → `border-t border-white/[0.08]`

---

### 5. StaticPage.tsx

**Theme changes:**
- "Go Home" button: `bg-indigo-600` → `bg-primary`, `hover:bg-indigo-700` → `hover:bg-primary/90`
- Back to Home link: `text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300` → `text-violet-300 hover:text-violet-200`
- Divider: `bg-gray-200 dark:bg-gray-700` → `bg-white/[0.08]`
- Footer border: `border-gray-200 dark:border-gray-700` → `border-white/[0.08]`

---

### 6. DashboardPage.tsx

**Emoji → Icon changes:**
- Line 77: `➕` → `<span className="material-symbols-outlined" style={{ fontSize: '28px' }}>add_circle</span>`
- Line 53: `📅` → remove emoji, use `<span className="material-symbols-outlined" style={{ fontSize: '16px' }}>calendar_today</span>`
- Line 53: `📍` → remove emoji, use `<span className="material-symbols-outlined" style={{ fontSize: '16px' }}>location_on</span>`

---

### 7. TodayTransitsPage / RetrogradePage

**EmptyState emoji → icons:**
These pages pass emoji strings to the `EmptyState` component. The `EmptyState` component itself should be updated to support Material Symbols as an alternative to emoji.

**Proposed EmptyState API change:**
```tsx
interface EmptyStateProps {
  // Either icon (emoji string) or iconSymbol (material symbol name)
  icon?: string;
  iconSymbol?: string;  // NEW: material-symbols-outlined name
  title: string;
  description?: string;
  // ...rest
}
```

---

### 8. UsageMeter.tsx

**Icon changes:**
- `Crown` → `workspace_premium`
- `BarChart3` → `bar_chart`
- `AlertTriangle` → `warning`

**Minor theme adjustments:**
- `border-white/10` is already close to the design system
- `text-white/70` → `text-slate-300` for better consistency
- `text-white/50` → `text-slate-400`
- `text-white/[0.08]` border → `border-white/[0.08]` (already correct)

---

## Testing Checklist

After all changes are applied:

- [ ] All pages render correctly in dark mode
- [ ] No leftover `bg-white`, `bg-gray-800`, `border-gray-200`, `border-gray-700` on new pages
- [ ] All icons render as Material Symbols Outlined
- [ ] No emoji characters remain in production components (except in user-generated content)
- [ ] All buttons use `bg-primary` not `bg-indigo-600`
- [ ] All links use `text-violet-300` not `text-indigo-400`
- [ ] Color contrast passes WCAG AA on all text elements
- [ ] No visual regressions on existing pages (AppLayout, Dashboard, ChartCreate, etc.)
- [ ] Mobile layout works correctly on all updated pages
- [ ] Toggle switch still functional in Settings
- [ ] Expandable cards still functional in Learn page
- [ ] Pricing cards still correctly show tier comparison
