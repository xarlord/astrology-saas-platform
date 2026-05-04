# Sprint 3: Remaining UX Design Specification

**Date:** 2026-04-04
**Author:** UX Designer 2
**Scope:** Items from Sprint 3 UX Audit not yet implemented
**Priority Order:** By impact on US-3.1 / US-3.2 acceptance criteria

---

## Status Tracker

| ID | Issue | Source | Status |
|----|-------|--------|--------|
| C1 | WelcomeModal broken route | UX Audit | DONE |
| C2 | AppLayout adoption | UX Audit | DONE |
| H1 | Color contrast failures | UX Audit | DONE |
| H2 | Per-page document titles | UX Audit | DONE |
| H3 | Brand name inconsistency | UX Audit | DONE |
| H4 | Dashboard empty state | UX Audit | DONE |
| M1 | Progressive onboarding | UX Audit | DONE |
| M2 | Dashboard semantic landmarks | UX Audit | DONE |
| M3 | Chart wizard timezone/location | UX Audit | DONE |
| DS1 | EmptyState theme mismatch | New finding | DONE |

---

## 1. EmptyState Component Theme Fix (DS1)

**Priority:** High — blocks H4 (Dashboard empty state can't use EmptyState until it matches the cosmic theme)

### Problem

The `EmptyState` component uses the old gray/white theme:
- Background: `bg-gray-50 dark:bg-gray-800` (should be cosmic glass)
- Border: `border-gray-200 dark:border-gray-700` (should be cosmic border)
- Title: `text-gray-900 dark:text-gray-50` (should be `text-white`)
- Description: `text-gray-500 dark:text-gray-400` (should be `text-slate-400`)
- Button: `bg-indigo-600` (should be `bg-primary`)
- Secondary button: `bg-white text-gray-700` (should match cosmic theme)

### Specification

**File:** `frontend/src/components/EmptyState.tsx`

**Updated styling tokens:**

| Element | Current | New |
|---------|---------|-----|
| Container bg | `bg-gray-50 dark:bg-gray-800` | `bg-[#141627]/50 backdrop-blur-md` |
| Container border | `border-2 border-dashed border-gray-200 dark:border-gray-700` | `border border-[#2f2645]` |
| Title text | `text-gray-900 dark:text-gray-50` | `text-white` |
| Description text | `text-gray-500 dark:text-gray-400` | `text-slate-400` |
| Primary button bg | `bg-indigo-600 hover:bg-indigo-700` | `bg-primary hover:bg-primary/90` |
| Primary button shadow | `shadow-indigo` | `shadow-lg shadow-primary/25` |
| Secondary button bg | `bg-white dark:bg-gray-700` | `bg-white/10 text-slate-300` |
| Secondary button border | `border-gray-300 dark:border-gray-600` | `border-[#2f2645]` |

**No structural or API changes** — only CSS class updates. All existing props and `EmptyStates.*` factory functions remain identical.

---

## 2. Dashboard Empty State (H4)

**Priority:** High — US-3.1 acceptance: "Empty dashboard state shows CTAs (not blank page)"

### Current Behavior

```
"  No charts yet  "   ← text-slate-400, no icon
[Create Your First Chart]  ← Button, full-width
```

Minimal, no visual interest, no secondary action.

### Target Behavior

Replace the inline empty state with `EmptyStates.NoCharts` (after DS1 theme fix):

```tsx
<EmptyStates.NoCharts
  size="medium"
  description="Create your first natal chart to unlock personalized cosmic insights and discover your unique astrological blueprint."
  secondaryActionText="Learn About Charts"
  onSecondaryAction={() => navigate('/learning')}
  onAction={handleCreateChart}
/>
```

### Visual Layout

```
┌──────────────────────────────────┐
│                                  │
│              ✨                  │  ← 64px emoji (medium size)
│                                  │
│         No Charts Yet            │  ← text-white, font-bold, text-xl
│                                  │
│   Create your first natal chart  │  ← text-slate-400, text-sm
│   to unlock personalized cosmic  │
│   insights and discover your     │
│   unique astrological blueprint  │
│                                  │
│   [✨ Create Your First Chart]   │  ← bg-primary, full shadow
│                                  │
│   [Learn About Charts]           │  ← bg-white/10, secondary style
│                                  │
└──────────────────────────────────┘
```

### Location in DashboardPage

Replace lines 442-453 (the `recentCharts.length === 0` block inside the "Your Charts" card):

```tsx
// REMOVE:
<p className="text-slate-400 mb-4">No charts yet</p>
<Button variant="primary" onClick={handleCreateChart} ...>
  Create Your First Chart
</Button>

// REPLACE WITH:
<EmptyStates.NoCharts
  size="small"
  description="Create your first natal chart to unlock personalized cosmic insights."
  secondaryActionText="Learn About Charts"
  onSecondaryAction={() => navigate('/learning')}
  onAction={handleCreateChart}
/>
```

Use `size="small"` here since it's inside a card panel, not a full page.

---

## 3. Dashboard Semantic Landmarks (M2)

**Priority:** Medium — WCAG 2.1 AA: 2.4.1 Bypass Blocks, 1.3.1 Info and Relationships

### Current Structure

```tsx
<>                            ← Fragment, no wrapper semantics
  <main className="...">     ← No id for skip-link targeting
    <motion.header>           ← Welcome/greeting, not a landmark
    <div className="grid">    ← No landmark regions
      <div>                   ← Left column (cosmic weather)
      <div>                   ← Right column (charts & actions)
    </div>
  </main>
</>
```

### Target Structure

```tsx
<>                            ← Fragment is fine (AppLayout provides outer shell)
  <main                      ← AppLayout already adds <main id="main-content">
    <section aria-label="Welcome and daily insights">
      {/* motion.header content stays here */}
    </section>

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-8">
        <section aria-label="Energy levels">
          {/* EnergyMeter grid */}
        </section>

        <section aria-label="Planetary positions">
          {/* Planet cards grid */}
        </section>

        <section aria-label="Major transit highlight">
          {/* Highlight card */}
        </section>

        <section aria-label="Upcoming transits">
          {/* TransitTimelineCard list */}
        </section>
      </div>

      <div className="lg:col-span-4">
        <section aria-label="Your charts">
          {/* Charts list or empty state */}
        </section>

        <section aria-label="Quick actions">
          {/* Action grid */}
        </section>
      </div>
    </div>
  </main>
</>
```

### Specification

Wrap each visual content block in `<section aria-label="...">` using the labels above. No visual changes — sections are semantic-only. The `<motion.header>` remains but gets wrapped in a section.

**Note:** The `<main>` wrapper and skip-link are handled by AppLayout, so DashboardPage should NOT render its own `<main>` tag. Replace `<main>` with a `<div>` or remove it since AppLayout provides `<main id="main-content">`.

---

## 4. WelcomeModal Progressive Onboarding (M1)

**Priority:** Medium — US-3.1: "Registration to first chart under 3 clicks/taps"

### Current Behavior

1. User registers → Dashboard
2. WelcomeModal shows
3. New-user CTA says "Explore My Dashboard" → closes modal (stays on Dashboard)
4. User must find "New Chart" button independently

### Issues

- CTA does not advance the onboarding flow
- No progress indication that chart creation is the next step
- After dismiss, user is left on Dashboard with no clear next action

### Target Behavior

**For users with 0 charts:**

```
┌───────────────────────────────────────────┐
│                                       [✕] │
│                                           │
│            ✨ auto_awesome                │
│      Welcome to AstroVerse!               │
│                                           │
│  Your personalized cosmic dashboard       │
│  awaits. Let's create your first chart.   │
│                                           │
│  ┌─────────────────────────────────────┐  │
│  │  🌙  (placeholder illustration)     │  │
│  │                                     │  │
│  │  Complete your birth data to        │  │
│  │  unlock your cosmic blueprint       │  │
│  └─────────────────────────────────────┘  │
│                                           │
│  Your dashboard includes:                 │
│  [⚡ Energy] [🪐 Transits]               │
│  [💞 Compat] [📅 Forecasts]              │
│                                           │
│  [✨ Create My First Chart            →]  │  ← NAVIGATES to /charts/create
│                                           │
│  Step 1 of 2 — Create Your Chart         │  ← NEW: progress hint
└───────────────────────────────────────────┘
```

### Changes Required

**4a. Change CTA for new users:**

```tsx
// Current (line ~187):
<Button onClick={handleDismiss}>
  Explore My Dashboard
</Button>

// Target:
<Button onClick={() => { handleDismiss(); navigate('/charts/create'); }}>
  Create My First Chart
</Button>
```

For returning users (hasChart === true), keep the current "Explore My Dashboard" behavior.

**4b. Add progress hint for new users:**

Below the primary CTA button, when `hasChart === false`:

```tsx
<p className="text-xs text-slate-500 mt-3 text-center">
  Step 1 of 2 — Create Your Chart
</p>
```

**4c. Auto-redirect after dismiss (optional enhancement):**

If the user dismisses the modal via the X button or backdrop click AND has 0 charts, set a short timeout to redirect:

```tsx
const handleDismiss = () => {
  onClose();
  if (!hasChart) {
    // Redirect to chart creation after a brief moment
    setTimeout(() => navigate('/charts/create'), 300);
  }
};
```

Only do this on the first visit. If the user has dismissed the modal before, don't auto-redirect.

---

## 5. Per-Page Document Titles (H2)

**Priority:** Medium — WCAG 2.4.2 Page Titled

### Implementation Approach

**Install:** `npm install react-helmet-async`

**Setup:** Add `<HelmetProvider>` to `App.tsx` (inside `<QueryClientProvider>`, wrapping `<ErrorBoundary>`).

**Per-page titles:**

| Route | Document Title | Helmet Usage |
|-------|---------------|--------------|
| `/` | `AstroVerse — Discover Your Cosmic Blueprint` | `<title>AstroVerse — Discover Your Cosmic Blueprint</title>` |
| `/login` | `Sign In — AstroVerse` | `<title>Sign In — AstroVerse</title>` |
| `/register` | `Create Account — AstroVerse` | `<title>Create Account — AstroVerse</title>` |
| `/forgot-password` | `Reset Password — AstroVerse` | `<title>Reset Password — AstroVerse</title>` |
| `/dashboard` | `Dashboard — AstroVerse` | `<title>Dashboard — AstroVerse</title>` |
| `/charts` | `Saved Charts — AstroVerse` | `<title>Saved Charts — AstroVerse</title>` |
| `/charts/create` | `Create Chart — AstroVerse` | `<title>Create Chart — AstroVerse</title>` |
| `/charts/:id` | `{chartName} — AstroVerse` | Dynamic: `<title>{chart?.name ?? 'Chart'} — AstroVerse</title>` |
| `/analysis/:chartId` | `Analysis — AstroVerse` | `<title>Analysis — AstroVerse</title>` |
| `/reports/natal/:chartId` | `Natal Report — AstroVerse` | `<title>Natal Report — AstroVerse</title>` |
| `/reports/solar-return/:id` | `Solar Return Report — AstroVerse` | `<title>Solar Return Report — AstroVerse</title>` |
| `/calendar` | `Astrological Calendar — AstroVerse` | `<title>Astrological Calendar — AstroVerse</title>` |
| `/synastry` | `Synastry & Compatibility — AstroVerse` | `<title>Synastry & Compatibility — AstroVerse</title>` |
| `/transits` | `Transit Forecast — AstroVerse` | `<title>Transit Forecast — AstroVerse</title>` |
| `/solar-returns` | `Solar Returns — AstroVerse` | `<title>Solar Returns — AstroVerse</title>` |
| `/lunar-returns` | `Lunar Returns — AstroVerse` | `<title>Lunar Returns — AstroVerse</title>` |
| `/learning` | `Learning Center — AstroVerse` | `<title>Learning Center — AstroVerse</title>` |
| `/learning/courses/:id` | `{courseName} — AstroVerse` | Dynamic: `<title>{course?.title ?? 'Course'} — AstroVerse</title>` |
| `/profile` | `Profile — AstroVerse` | `<title>Profile — AstroVerse</title>` |
| `/settings` | `Settings — AstroVerse` | `<title>Settings — AstroVerse</title>` |
| `/subscription` | `Subscription Plans — AstroVerse` | `<title>Subscription Plans — AstroVerse</title>` |
| `*` (404) | `Page Not Found — AstroVerse` | `<title>Page Not Found — AstroVerse</title>` |

### Pattern for Each Page

```tsx
import { Helmet } from 'react-helmet-async';

function SomePage() {
  return (
    <>
      <Helmet>
        <title>Page Name — AstroVerse</title>
      </Helmet>
      {/* page content */}
    </>
  );
}
```

### For Dynamic Pages

```tsx
function ChartDetailPage() {
  const { id } = useParams();
  const { data: chart } = useChart(id);

  return (
    <>
      <Helmet>
        <title>{chart?.name ?? 'Chart'} — AstroVerse</title>
      </Helmet>
      {/* page content */}
    </>
  );
}
```

---

## 6. Chart Creation Wizard — Timezone & Location UX (M3)

**Priority:** Medium — US-3.1: "Chart creation wizard handles timezone and location smoothly"

### Current Issues

1. Timezone is hardcoded to `'UTC'` — ignores user's actual timezone
2. No timezone indicator anywhere in the UI
3. Birth location is free-text — latitude/longitude stay at `0, 0`
4. Live preview is purely decorative (spinning SVG, no real data)

### 6a. Timezone Auto-Detection

**Add timezone detection on component mount:**

```tsx
// In ChartCreationWizardPage, add to initial state or useEffect:
const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
// e.g., "America/New_York", "Europe/London", "Asia/Tokyo"
```

**Set as default in birthData state:**

```tsx
const [birthData, setBirthData] = useState({
  // ... existing fields
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
});
```

**Remove hardcoded `'UTC'` from `handleSubmit`.**

### 6b. Timezone Display

Add a helper line below the time input:

```
┌─────────────────────────────────────────┐
│ Time of Birth                           │
│ ┌─────────────────────────────────────┐ │
│ │ 10:30 AM                     [🕐]   │ │
│ └─────────────────────────────────────┘ │
│ Times entered in your local timezone    │  ← NEW: helper text
│ (America/New_York, UTC-5)              │  ← NEW: detected tz
│                                         │
│ ☑ I don't know my birth time           │
│ Will use noon as default time           │
└─────────────────────────────────────────┘
```

**Implementation:**

```tsx
<p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5">
  <span className="material-symbols-outlined text-[14px]">schedule</span>
  Times entered in your local timezone ({detectedTimezone})
</p>
```

### 6c. Enhanced "Time Unknown" Explanation

**Current:** `helperText="Will use noon as default time"`

**Improved:**

```
┌─────────────────────────────────────────┐
│ ☑ I don't know my birth time            │
│                                         │
│ ℹ️ If you don't know your birth time,   │  ← Info box
│ we'll use 12:00 PM as a default. This   │
│ may affect house cusp accuracy and      │
│ your Rising sign placement.             │
└─────────────────────────────────────────┘
```

Keep the existing "Why is birth time important?" info card (it already provides good context). The enhancement is making the inline text more descriptive:

```tsx
helperText="We'll use 12:00 PM as default. This may affect house and Rising sign accuracy."
```

### 6d. Location Input — Label Improvement

Since geocoding API integration is post-MVP, improve the label and placeholder:

```
┌─────────────────────────────────────────┐
│ Birth Location                    [📍]  │
│ ┌─────────────────────────────────────┐ │
│ │ Enter city, state/province, country │ │
│ └─────────────────────────────────────┘ │
│ Include country for best accuracy       │  ← NEW: helper text
└─────────────────────────────────────────┘
```

**Implementation:**

```tsx
<label className="...">
  <span className="material-symbols-outlined">location_on</span>
  Birth Location
</label>
<input
  type="text"
  placeholder="Enter city, state/province, country"
  // ...existing props
/>
<p className="text-xs text-slate-500 mt-1.5">
  Include country for best accuracy
</p>
```

### 6e. Live Preview Panel — Honest Labeling

Since the preview doesn't show real data, the label should be honest:

**Current:** "Calculating..." badge + "Entering data will update the chart preview in real-time."

**Fix:** Change to a "Preview" label without the "Calculating..." animation, and update the tip text:

```tsx
// Remove the "Calculating..." badge when no calculation is happening
// Update the bottom tip to:
<p className="text-xs text-slate-500 text-center mt-4">
  Your natal chart will be generated after submitting all details.
</p>
```

This avoids misleading users into thinking live calculations are happening.

---

## Implementation Priority Order

| # | Item | Effort | Impact | Dependencies |
|---|------|--------|--------|-------------|
| 1 | DS1: EmptyState theme fix | 15 min | High — unblocks H4 | None |
| 2 | H4: Dashboard empty state | 10 min | High | DS1 first |
| 3 | M2: Dashboard semantic landmarks | 20 min | Medium | None |
| 4 | H2: Per-page document titles | 1.5 hr | Medium | `npm install react-helmet-async` |
| 5 | M1: WelcomeModal CTA + progress | 30 min | Medium | None |
| 6 | M3a: Timezone auto-detect | 30 min | Medium | None |
| 6 | M3b: Timezone display | 15 min | Low | M3a |
| 6 | M3c: Time unknown enhancement | 10 min | Low | None |
| 6 | M3d: Location label improvement | 10 min | Low | None |
| 6 | M3e: Preview panel honest label | 10 min | Low | None |

**Total estimated effort:** ~3.5 hours
