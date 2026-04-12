# Synastry Comparison Types — UX Design Spec

**Date:** 2026-04-05
**Designer:** UX Designer 2
**Feature Spec:** FEATURE_SPEC_SYNASTRY_COMPARISON_TYPES.md
**Priority:** P2

---

## 1. UX Surfaces Overview

| Surface | Location | Purpose |
|---------|----------|---------|
| ComparisonTypeSelector | SynastryPageNew / SynastryCalculator | Pick romantic, business, or friendship mode |
| Type-specific results header | SynastryCalculator results | Shows type badge + themed interpretation |
| Type badge in report history | SynastryPage reports list | Indicates saved report's comparison type |

### Entry Points

1. **SynastryPageNew** → Type selector appears before PersonSelector
2. **SynastryCalculator** → Type selector at top of calculator form
3. **Saved reports list** → Type badge on each report card

---

## 2. ComparisonTypeSelector Component

### 2.1 Placement

Insert above the PersonSelector in both SynastryPageNew and SynastryCalculator:

```
┌─────────────────────────────────────────────────────────┐
│  Synastry Comparison                                    │
│  Select the type of relationship you want to explore    │
│                                                         │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    │
│  │              │ │              │ │              │    │
│  │  [favorite]  │ │   [work]     │ │   [group]    │    │
│  │              │ │              │ │              │    │
│  │  Romantic    │ │  Business    │ │  Friendship  │    │
│  │              │ │              │ │              │    │
│  │  Love,       │ │  Career &    │ │  Platonic    │    │
│  │  attraction  │ │  partnership │ │  bonds       │    │
│  │  & intimacy  │ │  dynamics    │ │  & shared    │    │
│  │              │ │              │ │  values      │    │
│  │              │ │              │ │              │    │
│  └──────────────┘ └──────────────┘ └──────────────┘    │
│       *selected          muted             muted        │
│                                                         │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  PersonSelector (existing) continues below...           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Card States

**Selected card:**
```
border-2 border-primary
bg-primary/10
ring-2 ring-primary/20
shadow-[0_0_20px_rgba(107,61,225,0.15)]
```

**Unselected card:**
```
border border-white/10
bg-white/5
hover:bg-white/10 hover:border-white/20
```

**Disabled card** (no second chart selected yet):
```
opacity-50 cursor-not-allowed
```

### 2.3 Type Brand Accents

Each type has a subtle accent color used in the results view:

| Type | Icon | Accent Color | Accent Token |
|------|------|-------------|--------------|
| Romantic | `favorite` | Rose | `text-rose-400 bg-rose-500/10` |
| Business | `work` | Amber | `text-amber-400 bg-amber-500/10` |
| Friendship | `group` | Teal | `text-teal-400 bg-teal-500/10` |

The accent color is used for:
- Type badge in results header and report history
- CompatibilityGauge ring color (optional override)
- Category score bars in results

### 2.4 Component Props

```tsx
interface ComparisonTypeSelectorProps {
  value: ComparisonType;
  onChange: (type: ComparisonType) => void;
  disabled?: boolean;
  layout?: 'horizontal' | 'vertical';  // horizontal default, vertical on mobile
}

type ComparisonType = 'romantic' | 'business' | 'friendship';
```

---

## 3. Results View — Type-Specific Adaptations

### 3.1 Results Header

After calculation, show a type badge above the CompatibilityGauge:

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  [favorite]  Romantic Compatibility                     │
│  ──────────────────────────────────                     │
│                                                         │
│         ┌─────────────┐                                 │
│         │             │                                 │
│         │  Score 78   │   CompatibilityGauge            │
│         │             │   (existing component)          │
│         └─────────────┘                                 │
│                                                         │
│  Emotional Connection    ████████████░░  82%            │
│  Physical Attraction     ██████████░░░░  71%            │
│  Communication           █████████████░  88%            │
│  Long-term Stability     █████████░░░░░  65%            │
│  Growth Potential        ████████░░░░░░  58%            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

Type badge styling:
```tsx
// Romantic
<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
  bg-rose-500/10 text-rose-400 text-xs font-bold uppercase tracking-wider
  border border-rose-500/20">
  <span className="material-symbols-outlined text-[14px]">favorite</span>
  Romantic
</span>
```

### 3.2 Category Labels Per Type

The CompatibilityGauge categories change based on type:

| Category | Romantic Label | Business Label | Friendship Label |
|----------|---------------|----------------|------------------|
| `emotional` | Emotional Connection | Working Chemistry | Emotional Support |
| `communication` | Communication | Communication | Easy Conversation |
| `intellectual` | Mental Alignment | Strategic Alignment | Shared Interests |
| `values` | Love Languages | Business Values | Shared Values |
| `spiritual` | Soul Connection | Vision Alignment | Spiritual Growth |

### 3.3 Interpretation Sections

The existing tab structure (overview / aspects / composite / scores) remains.
The "Overview" tab interpretation adapts per type:

**Romantic — Strengths/Challenges:**
```
Strengths:
• Deep emotional understanding through Moon-Moon trine
• Strong physical chemistry indicated by Venus-Mars conjunction
• Communication flows naturally with Mercury-Jupiter sextile

Challenges:
• Different love languages — partner needs more verbal affection
• Saturn square Moon may create emotional distance at times
```

**Business — Strengths/Challenges:**
```
Strengths:
• Complementary decision-making styles — Mercury-Saturn trine
• Strong strategic alignment through Jupiter-Sun aspects
• Reliable follow-through from both partners

Challenges:
• Different risk tolerances — Mars-Saturn square
• Communication style mismatch under pressure
```

**Friendship — Strengths/Challenges:**
```
Strengths:
• Natural conversation flow — Mercury trine Mercury
• Shared sense of humor and adventure — Jupiter-Venus sextile
• Mutual emotional support — Moon-Jupiter trine

Challenges:
• Different social preferences — Venus square Uranus
• May drift apart without shared activities
```

---

## 4. Report History — Type Indicators

### 4.1 Report Card Badge

In the saved reports list (SynastryPage history view), each report card shows a type badge:

```
┌────────────────────────────────────────────────────────┐
│  [favorite] Romantic    ★      Apr 3, 2026             │
│  ──────────────────────────────────────────────────    │
│  Sarah M. ↔ John D.                     Score: 78     │
│  "Strong emotional connection with growth..."          │
│                                                        │
│  [visibility]  [delete]                                │
└────────────────────────────────────────────────────────┘
```

```
┌────────────────────────────────────────────────────────┐
│  [work] Business        ★      Apr 1, 2026            │
│  ──────────────────────────────────────────────────    │
│  Alex K. ↔ Morgan T.                   Score: 85     │
│  "Excellent strategic alignment and..."               │
│                                                        │
│  [visibility]  [delete]                                │
└────────────────────────────────────────────────────────┘
```

Badge uses the type accent color:
```tsx
// Map type to badge style
const typeBadgeStyles = {
  romantic: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  business: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  friendship: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
};

const typeIcons = {
  romantic: 'favorite',
  business: 'work',
  friendship: 'group',
};
```

### 4.2 Filter by Type

Add filter chips above the reports list:

```
┌────────────────────────────────────────────────────────┐
│  Reports                          [All] [♥] [💼] [👥]  │
│  ──────────────────────────────────────────────────    │
│  All | Romantic | Business | Friendship                │
│                                                        │
│  (report cards below)                                  │
└────────────────────────────────────────────────────────┘
```

Filter chips use standard pill-button pattern:
- Active: `bg-primary/20 text-primary border-primary/30`
- Inactive: `bg-white/5 text-slate-400 border-white/10 hover:bg-white/10`

---

## 5. Integration Points

### 5.1 SynastryPageNew.tsx

Insert ComparisonTypeSelector between the page header and PersonSelector:

```tsx
// In SynastryPageNew, add state:
const [comparisonType, setComparisonType] = useState<ComparisonType>('romantic');

// In render, before PersonSelector:
<ComparisonTypeSelector
  value={comparisonType}
  onChange={setComparisonType}
/>

<PersonSelector
  charts={charts}
  chart1Id={chart1Id}
  chart2Id={chart2Id}
  onChart1Change={setChart1Id}
  onChart2Change={setChart2Id}
  onSwap={handleSwap}
/>
```

Pass `comparisonType` to the API call in `handleCompare`:
```tsx
const results = await compareCharts(chart1Id, chart2Id, {
  comparisonType,
  // ...existing options
});
```

### 5.2 SynastryCalculator.tsx

Add `defaultComparisonType` prop and render ComparisonTypeSelector above the chart dropdowns:

```tsx
interface SynastryCalculatorProps {
  charts: Chart[];
  onReportSave?: (report: SynastryChart) => void;
  defaultComparisonType?: ComparisonType;  // NEW
}
```

### 5.3 synastry.api.ts

Update `compareCharts` to accept `comparisonType`:
```tsx
export async function compareCharts(
  chart1Id: string,
  chart2Id: string,
  options?: { comparisonType?: ComparisonType; ... }
): Promise<SynastryChart>
```

### 5.4 synastry.types.ts

Add `comparisonType` to `SynastryReport`:
```tsx
interface SynastryReport extends SynastryChart {
  isFavorite: boolean;
  notes: string;
  createdAt: string;
  comparisonType: 'romantic' | 'business' | 'friendship';  // NEW
}
```

---

## 6. Design Token Reference

Uses the same cosmic dark theme as all pages:

| Element | Token |
|---------|-------|
| Type selector card (selected) | `border-2 border-primary bg-primary/10 ring-2 ring-primary/20` |
| Type selector card (unselected) | `border border-white/10 bg-white/5 hover:bg-white/10` |
| Type badge — Romantic | `bg-rose-500/10 text-rose-400 border border-rose-500/20` |
| Type badge — Business | `bg-amber-500/10 text-amber-400 border border-amber-500/20` |
| Type badge — Friendship | `bg-teal-500/10 text-teal-400 border border-teal-500/20` |
| Score bar | `bg-primary/80 rounded-full` |
| Score bar track | `bg-white/5 rounded-full` |
| Filter chip (active) | `bg-primary/20 text-primary border border-primary/30` |
| Filter chip (inactive) | `bg-white/5 text-slate-400 border border-white/10` |

---

## 7. Component Dependencies

| Existing Component | Reuse / Modify |
|--------------------|----------------|
| `components/synastry/PersonSelector.tsx` | No changes — sits below ComparisonTypeSelector |
| `components/astrology/CompatibilityGauge.tsx` | Pass `categories` with type-specific labels |
| `components/SynastryCalculator.tsx` | Add type selector above chart dropdowns |
| `pages/SynastryPageNew.tsx` | Add type state + selector |
| `components/SynastryPage.tsx` | Update report list to show type badges + filter |
| `types/synastry.types.ts` | Add `comparisonType` field to `SynastryReport` |
| `services/synastry.api.ts` | Pass `comparisonType` in API request |

---

## 8. Accessibility Notes

- Type selector cards use `role="radiogroup"` with `role="radio"` + `aria-checked`
- Each card has `aria-label` describing the type (e.g., "Romantic compatibility comparison")
- Keyboard navigation: Arrow keys cycle through types, Enter/Space selects
- Type badges include icon + text (not color-only)
- Filter chips use `role="tab"` with `role="tablist"` pattern
- Score bars include `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="100"`

---

## 9. Mobile Adaptations

### ComparisonTypeSelector
- Cards stack vertically on mobile (layout="vertical")
- Each card becomes a horizontal strip: icon + title + description in a row
- Reduced padding for compact viewport

```
┌─────────────────────────────┐
│ [favorite]  Romantic     ✓  │  ← selected
│ Love, attraction & intimacy │
├─────────────────────────────┤
│ [work]      Business        │
│ Career & partnership        │
├─────────────────────────────┤
│ [group]     Friendship      │
│ Platonic bonds & values     │
└─────────────────────────────┘
```

### Results
- Category score bars stack vertically (already default)
- Type badge moves inline with score in gauge header

### Report History
- Filter chips scroll horizontally on mobile
- Report cards show type badge in top-right corner

---

## 10. States Summary

| State | UI |
|-------|----|
| No type selected | Default to "romantic", all cards visible |
| Type selected | Highlighted card, others muted |
| Calculating | Type selector disabled, loading spinner |
| Results loaded | Type badge + type-specific categories shown |
| Report saved | Report card shows type badge + filter by type |
| Switching type | Clear results, re-enable calculate button |

---

## 11. Animation

- **Card selection**: `transition-all duration-200` — border/bg/ring change smoothly
- **Type badge entrance**: `motion.span` with `initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}}`
- **Score bar fill**: Uses existing CompatibilityGauge animation (framer-motion)
- **Filter chip toggle**: `transition-colors duration-150`

---

## 12. Implementation Notes for Frontend Engineer

1. **New file**: Create `components/synastry/ComparisonTypeSelector.tsx` — standalone component with no external dependencies beyond Material Symbols.

2. **Default value**: Default to `'romantic'` to match existing behavior. Existing saved reports without a type should display as "Romantic" for backwards compatibility.

3. **Backwards compatibility**: Add `comparisonType` to `SynastryReport` type as optional with default `'romantic'`. Old reports from before this feature will render with the romantic badge.

4. **API change**: The `compareCharts` API call needs a `comparisonType` param. If the backend doesn't support it yet, frontend should still send it — backend can ignore unknown fields during development.

5. **CompatibilityGauge**: The existing component already accepts `categories` prop — just pass type-specific category labels. No component changes needed.

6. **Report history filter**: Add a simple `useState<'all' | ComparisonType>` filter to the SynastryPage reports list. Filter the existing `reports` array in `useMemo`.
