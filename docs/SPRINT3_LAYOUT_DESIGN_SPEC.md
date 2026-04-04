# Sprint 3: Layout & Navigation Design Specification

**Date:** 2026-04-04
**Author:** UX Designer Agent
**Scope:** Unified auth layout, navigation, and onboarding flow

---

## 1. Layout Architecture

### 1.1 Route Layout Map

```
PUBLIC LAYOUT (no shell)
├── / (LandingPage)           — Full marketing page, own navbar
├── /login                    — Standalone auth page
├── /register                 — Standalone auth page
├── /forgot-password          — Standalone auth page
└── /subscription             — Standalone pricing page

AUTH LAYOUT (AppLayout shell)
├── /dashboard                — Main dashboard
├── /charts                   — Saved charts gallery
├── /charts/create            — Chart creation wizard
├── /charts/:id               — Chart detail view
├── /analysis/:chartId        — Analysis page
├── /reports/natal/:chartId   — Detailed natal report
├── /reports/solar-return/:id — Solar return annual report
├── /calendar                 — Astrological calendar
├── /synastry                 — Synastry & compatibility
├── /transits                 — Transit forecasts
├── /solar-returns            — Solar returns
├── /lunar-returns            — Lunar returns
├── /learning                 — Learning center
├── /learning/courses/:id     — Course detail
├── /profile                  — User profile
└── /settings                 — Profile settings
```

### 1.2 AppLayout Component Tree

```
<AppLayout>
  <SkipLink />                    ← "Skip to main content"
  <MobileSidebarOverlay />        ← Backdrop on mobile when sidebar open
  <Sidebar />                     ← 256px left, slides in on mobile
  <div className="lg:pl-64">
    <TopNav />                    ← Sticky header bar
    <main id="main-content">      ← Skip-link target
      {children}                  ← Page content
    </main>
  </div>
  <MobileBottomNav />             ← Fixed bottom, mobile only
</AppLayout>
```

---

## 2. Component Specifications

### 2.1 TopNav (Header Bar)

**Height:** 64px
**Position:** Sticky top-0, z-40
**Background:** `bg-[#141627]/70 backdrop-blur-md`
**Border:** `border-b border-[#2f2645]`

```
┌─────────────────────────────────────────────────────────────┐
│ [☰] [✨ AstroVerse]        [Charts] [Transits] [Learn]  [+ New Chart] [👤▼] │
└─────────────────────────────────────────────────────────────┘
```

**Left section:**
- Hamburger button (mobile only): `lg:hidden`, `aria-label="Open main menu"`
- Logo: `auto_awesome` icon + "AstroVerse" text, links to `/dashboard`

**Center section (desktop only):**
- NavLink components with active state
- Charts → `/charts`
- Transits → `/transits`
- Learn → `/learning`
- Active state: `text-primary` + bottom border indicator

**Right section:**
- "New Chart" button: `variant="primary"`, navigates to `/charts/create`
- Notification bell: with red dot indicator
- User avatar: 40px circle with gradient, dropdown on hover/click
  - Profile → `/profile`
  - Settings → `/settings`
  - Divider
  - Logout

### 2.2 Sidebar

**Width:** 256px (desktop), full slide-in (mobile)
**Background:** `bg-[#0B0D17] border-r border-[#2f2645]`
**Position:** Fixed left, z-50

```
┌──────────────────────┐
│ [✨] AstroVerse   [✕] │  ← Header (mobile has close button)
├──────────────────────┤
│ QUICK ACTIONS        │
│ [+ New Chart]        │  ← Primary CTA button
│ [🏠] Dashboard       │
├──────────────────────┤
│ FEATURES             │
│ [📅] Calendar        │
│ [💛] Synastry        │
│ [🔄] Transits        │
├──────────────────────┤
│ RETURNS              │
│ [☀️] Solar Returns   │
│ [🌙] Lunar Returns   │
├──────────────────────┤
│ 📚 Learning Center   │
├──────────────────────┤
│                      │
│ ┌──────────────────┐ │
│ │ ⭐ Upgrade to     │ │  ← Free users: upgrade card
│ │ Premium           │ │  ← Paid users: plan status
│ │ [Upgrade Now]     │ │
│ └──────────────────┘ │
└──────────────────────┘
```

**Design tokens:**
- Section headers: `text-xs font-semibold text-slate-500 uppercase tracking-wider`
- Nav items: `text-sm text-slate-300 hover:text-white hover:bg-white/5 px-3 py-2.5 rounded-lg`
- Active nav item: `text-white bg-white/10 border-l-2 border-primary`
- Icons: Material Symbols Outlined, 20px, `text-slate-400`
- Active icon: `text-primary`

### 2.3 MobileBottomNav

**Height:** 56px + safe-area-inset-bottom
**Position:** Fixed bottom, z-40
**Background:** `bg-[#141627] border-t border-[#2f2645]`

```
┌────────┬────────┬────────┬────────┬────────┐
│  Home  │ Charts │Transits│ Learn  │Profile │
│  🏠    │   ⭐    │  🔄    │  📚    │  👤    │
└────────┴────────┴────────┴────────┴────────┘
```

**Items:**
1. Home → `/dashboard` (icon: `home`)
2. Charts → `/charts` (icon: `star`)
3. Transits → `/transits` (icon: `sync`)
4. Learn → `/learning` (icon: `school`)
5. Profile → `/profile` (avatar circle)

**Active state:**
- Top indicator bar: 48px wide, 2px tall, `bg-primary`, centered
- Icon background: `bg-primary/20`
- Text: `text-primary`

**Touch targets:** 44px minimum (enforced via `min-w-[44px] min-h-[44px]`)

---

## 3. DashboardPage Refactor

When wrapped in AppLayout, DashboardPage must:

1. **Remove its custom header** (lines 227-280 of DashboardPage.tsx)
2. **Remove the logout handler** (handled by AppLayout)
3. **Keep all main content** (welcome section, energy meters, planetary positions, transit cards, charts list, quick actions)
4. **Wrap content in semantic structure:**
   - `<section aria-label="Welcome">` for the welcome header
   - `<section aria-label="Energy levels">` for energy meters
   - `<section aria-label="Planetary positions">` for planet cards
   - `<section aria-label="Transits">` for transit timeline
   - `<section aria-label="Your charts">` for charts list
   - `<section aria-label="Quick actions">` for action grid

### 3.1 Dashboard Empty State Design

When user has 0 charts, replace the "Your Charts" section content:

```
┌────────────────────────────┐
│      Your Charts           │
├────────────────────────────┤
│                            │
│         ✨                 │  ← Zodiac wheel icon (64px)
│                            │
│    No Charts Yet           │  ← Title: text-white, font-bold
│                            │
│  Create your first natal   │  ← Description: text-slate-400
│  chart to unlock your      │
│  cosmic blueprint           │
│                            │
│  [✨ Create Your First Chart] │  ← Primary CTA button
│                            │
│  Learn About Charts →      │  ← Secondary text link → /learning
│                            │
└────────────────────────────┘
```

---

## 4. Onboarding Flow Specification

### 4.1 User Journey: New User

```
Step 1: Landing Page (/)
  → "Get Started" CTA → /register

Step 2: Register (/register)
  → Form: name, email, password
  → Submit → redirect to /dashboard

Step 3: Welcome Modal (auto-shows on first dashboard visit)
  → "Welcome to AstroVerse!"
  → "Let's create your first chart to unlock your cosmic blueprint"
  → Primary CTA: "Create My First Chart" → /charts/create
  → No secondary "Add Birth Data" link (removed broken route)

Step 4: Chart Creation Wizard (/charts/create)
  → 3-step wizard: Birth Details → Location → Options
  → Progress bar shows "Step 1 of 3"
  → Auto-detect timezone from browser
  → Submit → redirect to /charts/:id

Step 5: Chart Detail View (/charts/:id)
  → Show full chart wheel + AI interpretation CTA
  → Welcome tooltip: "Your cosmic blueprint is ready! ✨"
```

### 4.2 WelcomeModal Specification

**Trigger:** Show on first `/dashboard` visit after registration
**Dismiss condition:** `localStorage.getItem('astroscope_onboarding_done') === 'true'`
**Auto-dismiss:** If user navigates away from dashboard, auto-dismiss (don't re-show)

**Two states:**

**State A — No charts (new user):**
```
┌───────────────────────────────────────┐
│                                   [✕] │
│                                       │
│            ✨ auto_awesome             │
│      Welcome to AstroVerse!           │
│                                       │
│  Your personalized cosmic dashboard   │
│  awaits. Let's create your first      │
│  chart to get started.                │
│                                       │
│  ┌─────────────────────────────────┐  │
│  │ 🌙  (illustration circle)       │  │
│  │                                 │  │
│  │ Complete your birth data to     │  │
│  │ unlock your cosmic blueprint    │  │
│  └─────────────────────────────────┘  │
│                                       │
│  Your dashboard includes:             │
│  ┌──────────┐ ┌──────────┐           │
│  │ ⚡ Energy │ │ 🪐 Transit│           │
│  │ readings  │ │ alerts   │           │
│  └──────────┘ └──────────┘           │
│  ┌──────────┐ ┌──────────┐           │
│  │ 💞 Compat│ │ 📅 Monthly│           │
│  │ insights  │ │ forecasts│           │
│  └──────────┘ └──────────┘           │
│                                       │
│  [✨ Create My First Chart        →]  │  ← Primary CTA
│                                       │
│  Step 1 of 2 — Create Your Chart     │  ← Progress hint
└───────────────────────────────────────┘
```

**State B — Has charts (returning user):**
```
┌───────────────────────────────────────┐
│                                   [✕] │
│            ✨ Welcome back!            │
│      Here's your cosmic blueprint     │
│                                       │
│  ┌─────────────────────────────────┐  │
│  │ ♾️ (chart icon)                  │  │
│  │ [Sun: Pisces] [Moon: Taurus]    │  │
│  │ [Rising: Scorpio]               │  │
│  └─────────────────────────────────┘  │
│                                       │
│  [Explore My Dashboard            →]  │  ← CTA
└───────────────────────────────────────┘
```

**Key changes from current WelcomeModal:**
1. Remove `/onboarding/birth-data` route → `/charts/create`
2. Add "Step 1 of 2" progress hint for new users
3. Make "Create My First Chart" the primary action (more prominent than current "Add Birth Data")
4. Change CTA text to be action-oriented: "Create My First Chart" not "Explore My Dashboard"

---

## 5. Color Contrast Fixes

### 5.1 LandingPage Pricing Cards

**Current:** `<span class="text-slate-500 ml-2">/forever</span>`
**Fix:** `<span class="text-slate-400 ml-2">/forever</span>`

**Ratio improvement:** 3.84:1 → ~5.3:1 (passes AA)

### 5.2 ForgotPasswordPage Link

**Current:** `<a class="text-primary hover:text-primary-light ...">Sign In</a>`
**Fix:** `<a class="text-violet-300 hover:text-violet-200 ...">Sign In</a>`

**Ratio improvement:** 2.86:1 → ~6.5:1 (passes AA)

### 5.3 General Rule

On dark backgrounds (`bg-[#0B0D17]`, `bg-[#141627]`, `bg-[#1e2136]`):
- Minimum text color: `text-slate-400` (#94a3b8) for body text
- `text-slate-500` (#64748b) is ONLY acceptable for decorative/non-essential text
- `text-primary` (#6b3de1) must NOT be used for text on dark backgrounds — use `text-violet-300` or `text-violet-200` instead

---

## 6. Implementation Checklist

### Quick Fixes (Frontend Engineer — <1 hour)

- [ ] Fix WelcomeModal route: `/onboarding/birth-data` → `/charts/create`
- [ ] Fix pricing text contrast: `text-slate-500` → `text-slate-400`
- [ ] Fix forgot-password link contrast: `text-primary` → `text-violet-300`
- [ ] Fix brand name: "AstroSaaS" → "AstroVerse" in AppLayout.tsx
- [ ] Fix nav links in AppLayout: `/forecast` → `/transits`, `/learn` → `/learning`
- [ ] Remove dead footer links from AppLayout or add route placeholders

### Medium Fixes (2-4 hours)

- [ ] Add `react-helmet-async` and per-page `<title>` tags
- [ ] Replace dashboard empty state with `EmptyStates.NoCharts` component
- [ ] Add "Step 1 of 2" to WelcomeModal for new users
- [ ] Add semantic `<section>` landmarks to DashboardPage
- [ ] Enhance "Time unknown" tooltip in Chart Creation Wizard

### Large Refactor (4-6 hours — requires CEO approval)

- [ ] Restyle AppLayout to cosmic dark theme
- [ ] Replace Heroicons with Material Symbols in AppLayout
- [ ] Remove DashboardPage custom header
- [ ] Wrap all protected routes in `<AppLayout>` in App.tsx
- [ ] Add timezone auto-detect to Chart Creation Wizard
- [ ] Verify chart wheel renders on 320px-768px viewports
