# Chart Card Components — Design Audit

**Date:** 2026-04-05
**Designer:** UX Designer 2
**Scope:** 5 new social media chart card components + ShareableChartCard

---

## Audit Summary

| Status | Count |
|--------|-------|
| CRITICAL — Invisible text (broken CSS classes) | 3 findings (17 instances) |
| HIGH — Wrong icon library | 6 findings |
| MEDIUM — Code duplication (DRY) | 6 findings |
| LOW — Token notation inconsistency | 5 findings |

---

## CRITICAL: Undefined Tailwind Classes

These classes are referenced in JSX but **not defined** in `tailwind.config.*`. Tailwind silently ignores unknown classes, causing text to default to black — **invisible on dark backgrounds**.

### C1. `text-secondary-gray` (13 instances)

**Files affected:**
- `chart/TwitterCard.tsx` — 2 uses
- `chart/PinterestCard.tsx` — 3 uses
- `chart/TikTokCard.tsx` — 5 uses
- `chart/ShareableChartCard.tsx` — 1 use
- `chart/LinkedInCard.tsx` — 1 use

**Fix:** Replace all `text-secondary-gray` with `text-slate-400` (cosmic theme muted text token).

### C2. `text-gold-accent` (4 instances)

**Files affected:**
- `chart/InstagramStoryCard.tsx` — 1 use
- `chart/LinkedInCard.tsx` — 1 use
- `chart/TikTokCard.tsx` — 1 use

**Fix:** Replace all `text-gold-accent` with `text-amber-400` (warm gold accent for quotes).

### C3. `text-muted` (1 instance)

**Files affected:**
- `chart/ShareableChartCard.tsx` — 1 use (line 71)

**Fix:** Replace with `text-slate-500` or `text-white/30`.

---

## HIGH: Icon Library

### H1. lucide-react `Sparkles` import (6 files)

All chart cards import `{ Sparkles } from 'lucide-react'` instead of using Material Symbols.

**Fix:** Replace `<Sparkles className="w-X h-Y" />` with `<span className="material-symbols-outlined text-[Npx]">auto_awesome</span>` per ICON_MIGRATION_SPEC.

**Files:** TwitterCard, InstagramStoryCard, LinkedInCard, PinterestCard, TikTokCard, ShareableChartCard

---

## MEDIUM: Code Duplication

### M1. Duplicated type definitions

`ChartPosition` and `ChartData` interfaces are defined identically in all 5 new card files (Twitter, Instagram, LinkedIn, Pinterest, TikTok).

**Fix:** Extract to `types/chart-cards.types.ts` or reuse existing types from `ShareableChartCard.tsx`.

### M2. Duplicated `ZODIAC_SYMBOLS` map

Identical 12-entry zodiac symbol map duplicated 5 times.

**Fix:** Extract to `utils/astrology/zodiacSymbols.ts`.

### M3. Duplicated `PLANET_COLORS` map

Planet color map duplicated 5 times with minor variations (some include more planets).

**Fix:** Extract to a shared constants file with the superset of all planet colors.

### M4. Duplicated `ELEMENT_COLORS` map

Element-to-color map duplicated 5 times.

**Fix:** Extract alongside `PLANET_COLORS`.

### M5. Duplicated `getElementColor()` helper

Function duplicated 5 times, some with `_` prefix (unused).

**Fix:** Extract to `utils/astrology/elements.ts`.

### M6. Duplicated `getZodiacSymbol()` helper

Same function duplicated 5 times.

**Fix:** Extract to `utils/astrology/zodiacSymbols.ts`.

---

## LOW: Token Notation Inconsistency

### L1. `bg-[rgb(11,13,23)]` vs `bg-[#0B0D17]`

All 5 new cards use `bg-[rgb(11,13,23)]` while the rest of the codebase uses `bg-[#0B0D17]`. Functionally equivalent but inconsistent.

**Fix:** Standardize to `bg-[#0B0D17]` (hex notation) per the cosmic design system spec.

**Files:** TwitterCard, InstagramStoryCard, LinkedInCard, PinterestCard, TikTokCard

### L2. `bg-white/8` (TwitterCard)

Tailwind doesn't support `/8` opacity — valid values are `/0`, `/5`, `/10`, `/20`, etc.

**Fix:** Change to `bg-white/10` or `bg-white/5`.

**File:** `chart/TwitterCard.tsx` line 174

---

## Fix Priority

1. **C1-C3 (CRITICAL):** Fix immediately — invisible text means cards export with missing content
2. **H1 (HIGH):** Fix during next icon migration pass
3. **M1-M6 (MEDIUM):** Refactor when integrating into ShareableChartCard template system
4. **L1-L2 (LOW):** Fix during next cosmic theme compliance pass

---

## Quick Fix Reference

Search-replace map for critical fixes:

| Find | Replace |
|------|---------|
| `text-secondary-gray` | `text-slate-400` |
| `text-gold-accent` | `text-amber-400` |
| `text-muted` | `text-slate-500` |
| `bg-[rgb(11,13,23)]` | `bg-[#0B0D17]` |
| `bg-white/8` | `bg-white/10` |
