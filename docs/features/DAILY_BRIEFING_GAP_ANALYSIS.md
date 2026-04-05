# Daily Briefing — Spec vs Implementation Gap Analysis

**Date:** 2026-04-05
**Designer:** UX Designer 2
**Design Spec:** `docs/features/DAILY_COSMIC_BRIEFING_DESIGN_SPEC.md`
**Implementation:** `frontend/src/pages/DailyBriefingPage.tsx`

---

## Gap Summary

| Severity | Count | Description |
|----------|-------|-------------|
| HIGH | 2 | Missing key sections, wrong icon library |
| MEDIUM | 3 | Missing components, no component reuse |
| LOW | 4 | Missing states (need backend API first) |

---

## HIGH Gaps

### H1. Priority Areas Row — Missing

**Spec:** Section 4.2 — Horizontal scroll of 4 score tiles (Love, Career, Health, Growth) with color-coded scores and trend arrows. This is the primary "glanceability" feature.

**Implementation:** Not present. No PriorityAreaCard or PriorityAreasRow component exists.

**Impact:** Users can't see at-a-glance which life areas are highlighted today. This is the core UX differentiator of the briefing vs just a transit list.

**Fix:** Create `PriorityAreaCard` component per spec and render 4 tiles between Daily Theme and Transits sections.

### H2. lucide-react Icons — 9 instances

**Already tracked** in ICON_MIGRATION_SPEC. All icons (ArrowLeft, ArrowRight, Sparkles, Sun, Moon, Star, TrendingUp, Bell, Activity) should be Material Symbols Outlined.

---

## MEDIUM Gaps

### M1. Moon Phase — Custom Icon Instead of MoonPhaseCard Component

**Spec:** Reuses existing `MoonPhaseCard` component with `size="sm"`, showing animated moon phase visualization, illumination arc, and sign badge.

**Implementation:** Uses lucide `<Moon>` icon as a static 40px icon with text below. No moon phase visualization.

**Fix:** Import and render `<MoonPhaseCard phase={moonPhase.phase} illumination={moonPhase.illumination} sign={moonPhase.sign} size="sm" />`.

### M2. Daily Theme Card — No Gradient/Glass Effect

**Spec:** `DailyThemeCard` with `bg-gradient-to-br from-primary/10 via-[#141627]/70 to-purple-900/20 backdrop-blur-md border border-primary/20 rounded-2xl`. Animated border glow. Source transit below theme text.

**Implementation:** Plain `bg-[#141627]/70 backdrop-blur-md` card — no gradient, no primary accent border, no glow animation. Source transit shown as `text-primary` text.

**Fix:** Add gradient background + primary border per spec. Add subtle `animate-pulse-glow` on border.

### M3. Transit Cards — Custom Instead of TransitTimelineCard

**Spec:** Reuses existing `TransitTimelineCard` component with time, title, description, type, icon, tags.

**Implementation:** Custom card layout with Star icon + ArrowRight planet→sign display. Missing: time stamps, tags, aspect symbols.

**Fix:** Import and render `<TransitTimelineCard>` per spec. Falls back to custom layout only if TransitTimelineCard doesn't support the needed props.

---

## LOW Gaps (Backend-Dependent)

These require the `GET /api/v1/briefing/today` API endpoint before they can be implemented:

### L1. Loading Skeleton State

**Spec:** BriefingSkeleton with 7 shimmer sections (date, title, theme, moon+energy, priority areas, section header, transits).

**Implementation:** Uses hardcoded mock data — no loading state.

### L2. Error State

**Spec:** Error message with "Try Again" button and "View Yesterday's Briefing" secondary link.

**Implementation:** None.

### L3. No Natal Chart State

**Spec:** "Create My Chart" CTA for users without a natal chart, with generic moon phase below.

**Implementation:** None.

### L4. Empty Transit Day State

**Spec:** "The cosmos is quiet today" empty message.

**Implementation:** None.

---

## Additional Observations

### O1. Notification Toggles — Custom vs Reusable

The implementation builds custom toggle switches (lines 331-346) instead of using the existing `Toggle` component from `components/ui/Toggle.tsx`. While functional, this duplicates component logic.

### O2. Route Not Integrated

The spec calls for `/briefing` route and sidebar nav entry with `today` icon. The page exists but the route and nav integration aren't complete.

### O3. Energy Bars — Custom Instead of EnergyMeter

The implementation uses custom animated bars instead of the spec's `EnergyMeter` component. The custom bars are visually effective but don't reuse the component library.

---

## Implementation Priority

1. **H1 (Priority Areas)** — Create PriorityAreaCard + row. Highest UX impact.
2. **H2 (Icons)** — Fixed as part of broader icon migration.
3. **M1 (MoonPhaseCard)** — Swap lucide Moon for MoonPhaseCard component.
4. **M2 (Daily Theme gradient)** — Add gradient + primary border.
5. **M3 (TransitTimelineCard)** — Swap custom cards for existing component.
6. **L1-L4** — Implement when backend API is ready.

---

## Score: 3/5 Design Fidelity

The implementation captures the overall concept and layout structure well (moon, theme, transits, energy, notifications). The cosmic dark theme is correctly applied. However, it's missing the key Priority Areas feature and doesn't reuse the existing component library (MoonPhaseCard, TransitTimelineCard, EnergyMeter). The icon library regression prevents full design system compliance.
