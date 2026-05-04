# Daily Cosmic Briefing — UI Design Specification

**Date:** 2026-04-04
**Author:** UX Designer 2
**Issue:** [CHI-71](/CHI/issues/CHI-71)
**Backend:** [CHI-68](/CHI/issues/CHI-68)
**Reference:** [CHI-63](/CHI/issues/CHI-63), [CHI-66](/CHI/issues/CHI-66)

---

## 1. Overview

The Daily Cosmic Briefing is a personalized morning digest screen that opens after login. It gives users a quick, scannable summary of the day's cosmic weather — what's active, what to watch for, and where their energy is best directed.

**Design principles:**
- **Mobile-first** — most users check their briefing on their phone, in bed, before coffee
- **Glanceable** — the entire briefing should be understood in under 10 seconds
- **Progressive** — basic info visible immediately; details available on tap
- **Consistent** — reuses existing components and cosmic dark theme

---

## 2. Screen Layout — Mobile (375px viewport)

```
┌─────────────────────────────────┐
│  [☰]  ✨ AstroVerse      [👤]  │  ← AppLayout TopNav
├─────────────────────────────────┤
│                                 │
│  April 4, 2026                  │  ← Date: text-slate-400, text-sm
│  Your Cosmic Briefing           │  ← Title: text-white, text-2xl, font-bold
│                                 │
│  ┌───────────────────────────┐  │
│  │  ✨                       │  │  ← Daily Theme Card
│  │  "Embrace transformation  │  │     glass-card, p-5
│  │   — Mercury trine Pluto   │  │     text-white, text-lg italic
│  │   invites deep honesty"   │  │     AI-generated daily theme
│  └───────────────────────────┘  │
│                                 │
│  ┌──────────┐  ┌──────────────┐│
│  │   🌕     │  │    78        ││  ← Moon + Energy row
│  │  Full    │  │   Cosmic     ││     flex flex-row gap-4
│  │  Moon    │  │   Energy     ││     MoonPhaseCard size="sm"
│  │  ♏ Sco   │  │              ││     EnergyMeter size="md"
│  └──────────┘  └──────────────┘│
│                                 │
│  Priority Areas                 │  ← text-slate-400, text-xs, uppercase
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐  │
│  │ 💕 │ │ 💼 │ │ 🧘 │ │ 📚 │  │  ← Horizontal scroll
│  │Love│ │Work│ │Hlth│ │Grow│  │     flex overflow-x-auto gap-3
│  │ 82 │ │ 65 │ │ 74 │ │ 58 │  │     Score: colored ring/number
│  └────┘ └────┘ └────┘ └────┘  │
│                                 │
│  Today's Transits               │  ← text-slate-400, text-xs, uppercase
│  ┌───────────────────────────┐  │
│  │ ★ Mercury △ Pluto        │  │  ← TransitTimelineCard
│  │   Deep conversations &... │  │     type="favorable"
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │ ⚠ Mars □ Saturn          │  │  ← TransitTimelineCard
│  │   Frustration possible... │  │     type="challenging"
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │ ★ Venus △ Jupiter        │  │  ← TransitTimelineCard
│  │   Abundance in relation.. │  │     type="favorable"
│  └───────────────────────────┘  │
│                                 │
│  Key Positions                  │  ← text-slate-400, text-xs, uppercase
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐│
│  │☉ │ │☽ │ │☿ │ │♀ │ │♂ ││  ← PlanetaryPositionCard
│  │Ari│ │Sco│ │Psc│ │Pcs│ │Cap││     size="sm", showHouse={false}
│  └───┘ └───┘ └───┘ └───┘ └───┘│     horizontal scroll
│                                 │
│  ┌───────────────────────────┐  │
│  │  View Full Transit Report │  │  ← Secondary CTA
│  │                    →      │  │     bg-white/5, text-primary
│  └───────────────────────────┘  │
│                                 │
├─────────────────────────────────┤
│  🏠  ⭐  🔄  📚  👤          │  ← MobileBottomNav
└─────────────────────────────────┘
```

---

## 3. Screen Layout — Desktop (1280px viewport)

```
┌────────┬──────────────────────────────────────────────────────┐
│        │ [☰] ✨ AstroVerse     [Charts] [Transits] [Learn] [+ New] [👤]│
│        ├──────────────────────────────────────────────────────┤
│Sidebar │                                                      │
│        │  April 4, 2026                                       │
│ [+New] │  Your Cosmic Briefing                                │
│ [Home] │                                                      │
│        │  ┌─────────────────────────────────────────────────┐│
│ Calendar│  │  ✨ "Embrace transformation — Mercury trine   ││
│ Synastry│  │     Pluto invites deep honesty"                ││
│ Transits│  └─────────────────────────────────────────────────┘│
│        │                                                      │
│ Returns│  ┌──────────────┐  ┌────────────────────────────────┐│
│        │  │    🌕        │  │  Priority Areas                ││
│ Learn  │  │  Full Moon   │  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ││
│        │  │  ♏ Scorpio   │  │  │Love│ │Work│ │Hlth│ │Grow│ ││
│        │  └──────────────┘  │  │ 82 │ │ 65 │ │ 74 │ │ 58 │ ││
│        │                    │  └────┘ └────┘ └────┘ └────┘ ││
│        │  ┌──────────────┐  │                                ││
│ ⭐Upgr │  │     78       │  │  Key Positions                 ││
│        │  │  Cosmic      │  │  ☉ Ari ☽ Sco ☿ Psc ♀ Pcs ♂ Cap││
│        │  │  Energy      │  └────────────────────────────────┘│
│        │  └──────────────┘                                    │
│        │                                                      │
│        │  Today's Transits                                    │
│        │  ┌────────────────────────────────────────────────┐ │
│        │  │ ★ Mercury △ Pluto — Deep conversations &...   │ │
│        │  ├────────────────────────────────────────────────┤ │
│        │  │ ⚠ Mars □ Saturn — Frustration possible...     │ │
│        │  ├────────────────────────────────────────────────┤ │
│        │  │ ★ Venus △ Jupiter — Abundance in relation...  │ │
│        │  ├────────────────────────────────────────────────┤ │
│        │  │ ℹ Sun ○ Uranus — Unexpected shifts possible   │ │
│        │  └────────────────────────────────────────────────┘ │
│        │                                                      │
│        │  [View Full Transit Report →]                       │
└────────┴──────────────────────────────────────────────────────┘
```

---

## 4. Component Specifications

### 4.1 Daily Theme Card

**Purpose:** AI-generated daily theme/affirmation — the emotional anchor of the briefing.

```
┌───────────────────────────────────────────┐
│  ✨                                       │
│                                           │
│  "Embrace transformation —               │
│   Mercury trine Pluto invites             │
│   deep honesty today."                    │
│                                           │
│  ── Mercury △ Pluto                      │  ← Source transit, text-slate-500
└───────────────────────────────────────────┘
```

**Props (new component: `DailyThemeCard`):**

```tsx
interface DailyThemeCardProps {
  theme: string;           // AI-generated theme text
  sourceTransit?: string;  // e.g., "Mercury trine Pluto"
  icon?: string;           // Default: "auto_awesome"
  className?: string;
}
```

**Styling:**
- Container: `bg-gradient-to-br from-primary/10 via-[#141627]/70 to-purple-900/20 backdrop-blur-md border border-primary/20 rounded-2xl p-5`
- Icon: `text-primary`, 24px
- Theme text: `text-white text-lg font-medium italic leading-relaxed`
- Source: `text-slate-500 text-xs mt-3`
- Animation: `motion.div` with fade-in + scale from 0.98

---

### 4.2 Priority Areas Row

**Purpose:** Show at-a-glance life-area scores based on transit activity.

```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│    💕    │  │    💼    │  │    🧘    │  │    📚    │
│   Love   │  │  Career  │  │  Health  │  │  Growth  │
│    82    │  │    65    │  │    74    │  │    58    │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
```

**Props (new component: `PriorityAreaCard`):**

```tsx
interface PriorityAreaCardProps {
  label: string;            // "Love", "Career", etc.
  icon: string;             // Material Symbol name
  score: number;            // 0-100
  trend?: 'up' | 'down' | 'stable';  // optional trend arrow
  onClick?: () => void;
}
```

**Styling:**
- Container: `bg-[#141627]/70 backdrop-blur-md border border-white/10 rounded-xl p-4 min-w-[90px] flex flex-col items-center`
- Icon: `material-symbols-outlined text-[24px] text-slate-300`
- Label: `text-xs text-slate-400 mt-1`
- Score: `text-xl font-bold text-white`
- Score color logic:
  - `>= 75`: `text-emerald-400`
  - `>= 50`: `text-amber-400`
  - `< 50`: `text-red-400`
- Trend arrow: `trending_up`/`trending_down`/`trending_flat`, color matches score
- Touch target: `min-h-[100px]`, `min-w-[90px]`
- Active state: `active:scale-95`

**Row layout:** `flex gap-3 overflow-x-auto pb-2 scrollbar-hide`

**Data source:** Backend derives scores from transit-planet-house overlays:
- Love → 5th/7th house transits + Venus aspects
- Career → 10th/6th house transits + Saturn/Jupiter aspects
- Health → 6th house transits + Mars aspects
- Growth → 9th house transits + Jupiter aspects

---

### 4.3 Moon + Energy Hero Row

**Layout:** `flex flex-row items-center gap-4`

| Component | Size | Width |
|-----------|------|-------|
| MoonPhaseCard | `sm` | ~128px |
| EnergyMeter | `md` | ~128px |

**Between them (desktop):** A vertical divider `w-px h-20 bg-white/10`

**MoonPhaseCard props:**
```tsx
<MoonPhaseCard
  phase={briefing.moonPhase}
  illumination={briefing.moonIllumination}
  sign={briefing.moonSign}
  size="sm"
  showAnimation={true}
/>
```

**EnergyMeter props:**
```tsx
<EnergyMeter
  value={briefing.overallEnergy}
  size="md"
  label="Cosmic Energy"
  showValue={true}
/>
```

---

### 4.4 Transit Feed Section

**Reuse:** `TransitTimelineCard` (direct reuse, no modifications needed)

**Layout:** Vertical stack, `flex flex-col gap-2`

```tsx
{briefing.transits.map(transit => (
  <TransitTimelineCard
    key={transit.id}
    time={transit.time}
    title={transit.title}
    description={transit.description}
    type={transit.type}
    icon={transit.icon}
    tags={transit.tags}
  />
))}
```

**Limit:** Show max 4 transits on the briefing screen. "View All" links to `/transits`.

---

### 4.5 Key Positions Row

**Reuse:** `PlanetaryPositionCard` with `size="sm"`, `showHouse={false}`, `showRetrograde={true}`

**Layout:** Horizontal scroll, `flex gap-3 overflow-x-auto pb-2`

```tsx
{briefing.keyPositions.map(planet => (
  <PlanetaryPositionCard
    key={planet.name}
    planet={planet}
    size="sm"
    showHouse={false}
    showRetrograde={true}
  />
))}
```

**Planets shown:** Sun, Moon, Mercury, Venus, Mars (5 personal planets — fast-moving, most relevant daily).

---

## 5. Push Notification Card

**Purpose:** What the user sees in the OS notification before opening the app.

### 5.1 Default Notification

```
┌──────────────────────────────────────────┐
│ ✨ AstroVerse                     now    │
│                                          │
│ Your Cosmic Briefing is ready            │  ← Title
│ Full Moon in Scorpio — embrace           │  ← Body: moon phase + theme
│ transformation today.                    │
│                                          │
│ ┌──────┐  ┌──────────┐                  │
│ │ Open │  │ Dismiss   │                  │  ← Action buttons
│ └──────┘  └──────────┘                  │
└──────────────────────────────────────────┘
```

**Notification payload:**

```json
{
  "title": "Your Cosmic Briefing is ready",
  "body": "{moonPhase} in {moonSign} — {dailyThemeTruncated}",
  "icon": "/icons/moon-{phase}.png",
  "badge": "/icons/badge-72x72.png",
  "actions": [
    { "action": "open", "title": "Open Briefing" },
    { "action": "dismiss", "title": "Dismiss" }
  ],
  "data": {
    "type": "daily-briefing",
    "route": "/briefing"
  }
}
```

### 5.2 High-Impact Transit Alert (urgent variant)

```
┌──────────────────────────────────────────┐
│ ⚠️ AstroVerse                    8:00 AM │
│                                          │
│ Mars squares Saturn today                │  ← Title: specific transit
│ Expect frustration in career matters.    │  ← Body: impact description
│ Patience pays off.                       │
└──────────────────────────────────────────┘
```

**Triggered when:** A transit has `type: 'challenging'` AND `impact: 'high'`.

**Notification payload:**

```json
{
  "title": "{transitTitle} today",
  "body": "{transitImpact} — {briefAdvice}",
  "icon": "/icons/warning.png",
  "tag": "transit-alert-{date}",
  "data": {
    "type": "transit-alert",
    "transitId": "...",
    "route": "/transits"
  }
}
```

---

## 6. States

### 6.1 Loading State (Skeleton)

```
┌─────────────────────────────────┐
│  ████████                       │  ← Date skeleton
│  ██████████████                 │  ← Title skeleton
│                                 │
│  ┌───────────────────────────┐  │
│  │  ███████████████████████  │  │  ← Theme card skeleton
│  │  ███████████████          │  │     animate-pulse
│  └───────────────────────────┘  │
│                                 │
│  ┌──────────┐  ┌──────────────┐│
│  │  ██████  │  │  ████████    ││  ← Moon + Energy skeleton
│  │  ██████  │  │  ████████    ││     shimmer effect
│  └──────────┘  └──────────────┘│
│                                 │
│  ██████████████                 │  ← Section label skeleton
│  ┌───────────────────────────┐  │
│  │  ███████████████████████  │  │  ← Transit skeleton
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │  ███████████████████████  │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

**Implementation:** Use existing `SkeletonScreen` component or create `BriefingSkeleton` with `animate-shimmer` CSS class.

**Skeleton items:**
1. Date bar (60% width)
2. Title bar (80% width)
3. Theme card (full width, 2 text lines)
4. Moon circle (128px) + Energy circle (128px)
5. Priority area pills (4x, staggered widths)
6. Section header (40% width)
7. Transit cards (3x, full width)

### 6.2 Error State

```
┌─────────────────────────────────┐
│                                 │
│         ⚠️                      │
│                                 │
│   Unable to load briefing       │  ← text-white, text-lg
│                                 │
│   The cosmos is temporarily     │  ← text-slate-400, text-sm
│   out of reach. We'll keep      │
│   trying.                       │
│                                 │
│   [🔄 Try Again]               │  ← bg-primary, retry action
│                                 │
│   View yesterday's briefing →   │  ← text-slate-500, optional
│                                 │
└─────────────────────────────────┘
```

**Implementation:** Use `EmptyStates.Error` with custom messaging. Add `onAction={retry}` and `secondaryActionText="View Yesterday's Briefing"`.

### 6.3 No Natal Chart (Guest/Incomplete User)

```
┌─────────────────────────────────┐
│                                 │
│         ✨                      │
│                                 │
│   Your Cosmic Briefing          │  ← text-white, text-xl
│   Awaits                        │
│                                 │
│   Create your natal chart to    │  ← text-slate-400, text-sm
│   unlock personalized daily     │
│   cosmic insights.              │
│                                 │
│   [✨ Create My Chart →]        │  ← bg-primary CTA
│                                 │
│   In the meantime, here's       │  ← text-slate-500, text-xs
│   today's general forecast:     │
│                                 │
│   ┌───────────────────────────┐│
│   │  General Moon Phase       ││  ← Collapsed MoonPhaseCard
│   │  Full Moon in Scorpio     ││     with generic data
│   └───────────────────────────┘│
│                                 │
└─────────────────────────────────┘
```

**Implementation:** Check `user.hasChart`. If false, show `EmptyStates.NoCharts` variant with briefing-specific copy, plus a generic (non-personalized) moon phase card below.

### 6.4 Empty Transit Day

When there are no significant transits:

```
┌─────────────────────────────────┐
│  Today's Transits               │
│                                 │
│         🌙                      │
│  The cosmos is quiet today      │  ← text-slate-300, text-sm
│                                 │
│  No major planetary aspects     │  ← text-slate-400, text-xs
│  are active. A good day for     │
│  reflection and rest.           │
│                                 │
└─────────────────────────────────┘
```

**Implementation:** Use `EmptyStates.NoTransits` component.

---

## 7. Design Tokens — Briefing Color Palette

These extend the existing cosmic dark theme with briefing-specific accents:

### Priority Area Colors

| Area | Icon | Background | Text Color | Score Color |
|------|------|-----------|------------|-------------|
| Love | `favorite` | `bg-pink-500/10` | `text-pink-400` | Score-based |
| Career | `work` | `bg-amber-500/10` | `text-amber-400` | Score-based |
| Health | `self_improvement` | `bg-emerald-500/10` | `text-emerald-400` | Score-based |
| Growth | `school` | `bg-blue-500/10` | `text-blue-400` | Score-based |

### Score Color Logic (shared across Priority Areas + EnergyMeter)

| Score Range | Color | Tailwind Class |
|-------------|-------|----------------|
| 75-100 | Emerald green | `text-emerald-400` |
| 50-74 | Amber/gold | `text-amber-400` |
| 25-49 | Orange | `text-orange-400` |
| 0-24 | Red | `text-red-400` |

### Transit Type Colors (existing, from TransitTimelineCard)

| Type | Background | Border | Icon |
|------|-----------|--------|------|
| Favorable | `bg-emerald-500/10` | `border-emerald-500/20` | `check_circle` |
| Challenging | `bg-red-500/10` | `border-red-500/20` | `warning` |
| Neutral | `bg-blue-500/10` | `border-blue-500/20` | `info` |
| Major | `bg-amber-500/10` | `border-amber-500/20` | `star` |

---

## 8. Component Breakdown & Reuse Map

### Existing Components — Direct Reuse

| Component | File | Usage | Modifications |
|-----------|------|-------|--------------|
| `MoonPhaseCard` | `components/astrology/MoonPhaseCard.tsx` | Moon phase hero | None — use `size="sm"` |
| `EnergyMeter` | `components/astrology/EnergyMeter.tsx` | Overall cosmic energy gauge | None — use `size="md"`, `label="Cosmic Energy"` |
| `TransitTimelineCard` | `components/astrology/TransitTimelineCard.tsx` | Transit feed (3-4 items) | None — direct reuse |
| `PlanetaryPositionCard` | `components/astrology/PlanetaryPositionCard.tsx` | Key positions row | None — use `size="sm"`, `showHouse={false}` |
| `EmptyStates.NoTransits` | `components/EmptyState.tsx` | Empty transit day | None |
| `EmptyStates.NoCharts` | `components/EmptyState.tsx` | No natal chart state | None — custom copy |
| `LoadingSpinner` | `components/ui/LoadingSpinner.tsx` | Initial load | None |
| `AppLayout` | `components/AppLayout.tsx` | Page shell (nav, sidebar) | None |

### New Components — Must Build

| Component | Purpose | Complexity |
|-----------|---------|-----------|
| `DailyThemeCard` | AI-generated daily theme/affirmation | Low — card with text + gradient bg |
| `PriorityAreaCard` | Single life-area score tile | Low — icon + label + score |
| `PriorityAreasRow` | Horizontal scroll container for PriorityAreaCards | Low — flex scroll wrapper |
| `BriefingSkeleton` | Loading skeleton for full briefing | Medium — 7 skeleton sections |
| `DailyBriefingPage` | Page component composing all sections | Medium — layout + data fetching |

### No New Design Tokens Needed

The briefing uses exclusively existing tokens from the cosmic dark theme. The priority area accent colors (pink, amber, emerald, blue) are standard Tailwind palette colors already used elsewhere in the app.

---

## 9. Route & Navigation

### Route

```
/briefing → DailyBriefingPage
```

Also accessible as `/dashboard` when the user has the "Show briefing on login" preference enabled (default: true for new users).

### Entry Points

1. **Post-login redirect:** If `user.preferences.showBriefingOnLogin !== false` AND user hasn't seen today's briefing, redirect to `/briefing`
2. **Dashboard card:** Add a "Daily Briefing" card in the DashboardPage quick actions grid
3. **Push notification:** "Open" action → deep link to `/briefing`
4. **Sidebar nav:** Add "Daily Briefing" item in the Quick Actions section (icon: `today`)

### Briefing Dismissal

After viewing the briefing, the user can:
- Scroll to bottom and tap "Go to Dashboard" → `/dashboard`
- Tap any transit → `/transits` (filtered)
- Tap any priority area → `/transits` (filtered by area)
- Swipe back / browser back → `/dashboard`

---

## 10. API Data Shape (Frontend Contract)

The briefing page expects this data shape from the backend:

```typescript
interface DailyBriefing {
  date: string;                    // "2026-04-04"

  // Daily Theme
  dailyTheme: {
    text: string;                  // AI-generated theme
    sourceTransit?: string;        // "Mercury trine Pluto"
  };

  // Moon
  moon: {
    phase: MoonPhase;              // "full", "waning-gibbous", etc.
    illumination: number;          // 0-100
    sign: string;                  // "Scorpio"
    degree: number;
  };

  // Overall Energy
  overallEnergy: number;           // 0-100

  // Priority Areas
  priorityAreas: Array<{
    key: string;                   // "love", "career", "health", "growth"
    label: string;                 // "Love", "Career", etc.
    score: number;                 // 0-100
    trend: 'up' | 'down' | 'stable';
    topTransit?: string;           // Brief description
  }>;

  // Transits
  transits: Array<{
    id: string;
    time: string;                  // "8:00 AM"
    title: string;                 // "Mercury trine Pluto"
    description: string;           // "Deep conversations and transformative thinking..."
    type: 'favorable' | 'challenging' | 'neutral' | 'major';
    icon: 'check_circle' | 'warning' | 'info' | 'star';
    impact: 'low' | 'moderate' | 'high';
    tags: string[];                // ["mercury", "pluto", "trine"]
  }>;

  // Key Planetary Positions
  keyPositions: Array<{
    name: string;                  // "Sun"
    symbol: string;                // "☉"
    sign: string;                  // "Aries"
    degree: number;
    minute: number;
    retrograde?: boolean;
    element?: 'fire' | 'earth' | 'air' | 'water';
  }>;
}
```

**API endpoint:** `GET /api/v1/briefing/today`

**Cache:** Frontend should cache for 4 hours (staleTime in React Query). The briefing data changes once per day.

---

## 11. Accessibility

- All sections wrapped in `<section aria-label="...">` (Moon Phase, Energy, Priority Areas, Transits, Planetary Positions)
- `DailyThemeCard`: `role="note"`, quote styled with CSS (not literal `<blockquote>` to avoid semantics issues)
- `PriorityAreaCard`: scores announced as "Love: 82 out of 100" via `aria-label`
- Transits: Each `TransitTimelineCard` already has `aria-label` support
- Skip-link (from AppLayout) skips directly to main content
- Color is never the sole indicator — scores include numeric values + trend arrows

---

## 12. Animation Specification

**Entrance animation** — Staggered Framer Motion, matching DashboardPage pattern:

| Section | Initial | Delay |
|---------|---------|-------|
| Date + Title | `opacity: 0, y: 20` | 0ms |
| Daily Theme Card | `opacity: 0, y: 20` | 100ms |
| Moon + Energy Row | `opacity: 0, y: 20` | 200ms |
| Priority Areas | `opacity: 0, y: 20` | 300ms |
| Transits Header | `opacity: 0, y: 20` | 400ms |
| Transit Cards | `opacity: 0, y: 20` | 450ms + 50ms per card |
| Key Positions | `opacity: 0, y: 20` | 600ms |
| CTA Link | `opacity: 0, y: 20` | 700ms |

All use `transition={{ duration: 0.5, ease: "easeOut" }}`.

**Interaction animations:**
- Priority area card tap: `scale: 0.95`
- Transit card hover: `translateX: 4px` (existing behavior)
- Theme card: Subtle `animate-pulse-glow` on the border (3s loop)

---

## 13. Implementation Checklist

### Phase 1: Core Page (Frontend Engineer — ~4 hours)

- [ ] Create `DailyBriefingPage.tsx` in `src/pages/`
- [ ] Create `DailyThemeCard.tsx` component
- [ ] Create `PriorityAreaCard.tsx` component
- [ ] Add `/briefing` route to `App.tsx`
- [ ] Wire up React Query for `GET /api/v1/briefing/today`
- [ ] Compose page using existing MoonPhaseCard, EnergyMeter, TransitTimelineCard, PlanetaryPositionCard

### Phase 2: States & Polish (~2 hours)

- [ ] Create `BriefingSkeleton.tsx` loading state
- [ ] Add error state using EmptyStates.Error
- [ ] Add no-natal-chart state
- [ ] Add empty transit day state
- [ ] Add staggered entrance animations

### Phase 3: Navigation Integration (~1 hour)

- [ ] Add "Daily Briefing" to sidebar Quick Actions (icon: `today`)
- [ ] Add "Daily Briefing" to mobile bottom nav (replace or add as 6th item — TBD by CEO)
- [ ] Add post-login redirect logic (if preference enabled)
- [ ] Add briefing card to DashboardPage quick actions grid

### Phase 4: Notification Design Handoff (~30 min)

- [ ] Share notification payload spec with Backend Engineer
- [ ] Design notification icon set (moon phase variants)
- [ ] Test notification rendering on iOS/Android
