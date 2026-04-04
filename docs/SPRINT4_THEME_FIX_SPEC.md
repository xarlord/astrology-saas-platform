# Sprint 4: Theme Fix Specification

**Date:** 2026-04-04
**Author:** UX Designer 2
**Companion to:** `docs/SPRINT4_UX_DESIGN_SYSTEM_AUDIT.md`
**Target:** Frontend Engineer implementation guide

---

## Design Token Reference

| Token | Value | Usage |
|-------|-------|-------|
| `bg-primary` | `#6b3de1` | Primary buttons, accents, active states |
| `bg-[#0B0D17]` | Page background | Deepest background layer |
| `bg-[#141627]/70` | Card background | Cards, panels with backdrop blur |
| `bg-white/5` | Hover state | `hover:bg-white/5` |
| `bg-white/10` | Active state | Interactive elements |
| `border-white/10` | Standard border | Cards, dividers |
| `border-[#2f2645]` | Emphasized border | Accent borders |
| `text-white` | Primary text | Headings, emphasis |
| `text-slate-300` | Secondary text | Labels, descriptions |
| `text-slate-400` | Body text | Paragraph text (min WCAG AA) |
| `text-slate-500` | Muted text | Decorative only, timestamps |
| `text-violet-300` | Links on dark bg | WCAG AA compliant link color |
| `text-primary` | Accent text | Highlights, active labels |

---

## Fix 1: SubscriptionPage — Full Retheme

### 1a. Remove heroicons dependency

**Remove import:**
```diff
- import { CheckIcon, StarIcon, SparklesIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
```

**Replace each heroicon with Material Symbols Outlined:**

| Heroicon Component | Location | Replacement |
|-------------------|----------|-------------|
| `ArrowLeftIcon className="w-4 h-4"` | Back button | `<span className="material-symbols-outlined text-[18px]">arrow_back</span>` |
| `StarIcon className="w-4 h-4"` | Current plan badge | `<span className="material-symbols-outlined text-[16px]">star</span>` |
| `SparklesIcon className="w-3 h-3"` | "Most Popular" badge | `<span className="material-symbols-outlined text-[14px]">auto_awesome</span>` |
| `CheckIcon className="w-4 h-4 mt-0.5 text-green-500"` | Feature list items | `<span className="material-symbols-outlined text-[18px] text-emerald-400">check_circle</span>` |

### 1b. Retheme page shell

**Back link (line ~158):**
```diff
- className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-6 transition-colors"
+ className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white mb-6 transition-colors"
```

**Page heading (line ~166):**
```diff
- <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
+ <h1 className="text-3xl font-bold text-white mb-3">
```

**Subtitle (line ~169):**
```diff
- <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
+ <p className="text-slate-400 max-w-xl mx-auto">
```

### 1c. Retheme status banners

**Success banner (line ~178):**
```diff
- className={`mb-6 px-4 py-3 rounded-lg border text-sm ${
-   statusMessage.type === 'success'
-     ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
-     : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
- }`}
+ className={`mb-6 px-4 py-3 rounded-lg border text-sm ${
+   statusMessage.type === 'success'
+     ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
+     : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
+ }`}
```

**Error banner (line ~190):**
```diff
- className="mb-6 px-4 py-3 rounded-lg border bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm"
+ className="mb-6 px-4 py-3 rounded-lg border bg-red-500/10 border-red-500/30 text-red-400 text-sm"
```

### 1d. Retheme current plan badge

**"Current plan" badge (line ~198):**
```diff
- <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 text-sm font-medium">
+ <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
```

**Manage link (line ~204):**
```diff
- className="ml-3 text-sm text-indigo-600 dark:text-indigo-400 hover:underline disabled:opacity-50"
+ className="ml-3 text-sm text-violet-300 hover:text-violet-200 hover:underline disabled:opacity-50"
```

### 1e. Retheme plan cards

**Card container (line ~221):**
```diff
- className={`relative rounded-2xl border p-6 flex flex-col transition-shadow hover:shadow-lg ${
-   plan.highlighted
-     ? 'border-indigo-500 dark:border-indigo-400 ring-2 ring-indigo-500/20'
-     : 'border-gray-200 dark:border-gray-700'
- } ${isCurrent ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : 'bg-white dark:bg-gray-800'}`}
+ className={`relative rounded-2xl border p-6 flex flex-col transition-all hover:shadow-lg ${
+   plan.highlighted
+     ? 'border-primary ring-2 ring-primary/20'
+     : 'border-white/10'
+ } ${isCurrent ? 'bg-primary/5' : 'bg-[#141627]/70 backdrop-blur-md'}`}
```

**"Most Popular" badge (line ~228):**
```diff
- <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-600 text-white text-xs font-semibold rounded-full flex items-center gap-1">
+ <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full flex items-center gap-1 shadow-[0_0_12px_rgba(107,61,225,0.4)]">
```

**Plan name (line ~235):**
```diff
- <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{plan.name}</h3>
+ <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
```

**Price display (lines ~241-244):**
```diff
- <span className="text-3xl font-bold text-gray-900 dark:text-white">$15</span>
- <span className="text-gray-500 dark:text-gray-400 text-sm">/month</span>
+ <span className="text-3xl font-bold text-white">$15</span>
+ <span className="text-slate-400 text-sm">/month</span>
```

**Chart count subtitle (line ~250):**
```diff
- <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
+ <p className="mt-1 text-sm text-slate-400">
```

**Feature list items (line ~257):**
```diff
- <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
+ <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
```

**CTA button (line ~268):**
```diff
  className={`w-full py-2.5 px-4 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
    isCurrent
-     ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-default'
+     ? 'bg-white/5 text-slate-500 cursor-default'
      : plan.highlighted
-       ? 'bg-indigo-600 text-white hover:bg-indigo-700'
-       : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
+       ? 'bg-primary text-white hover:bg-primary/90 shadow-[0_0_15px_rgba(107,61,225,0.3)]'
+       : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
  }`}
```

**Footer text (line ~289):**
```diff
- <p className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400">
+ <p className="mt-8 text-center text-xs text-slate-500">
```

---

## Fix 2: SolarReturnsPage — Full Retheme

### 2a. Remove lucide-react dependency

**Remove import:**
```diff
- import { Calendar, Settings, Share2, ArrowLeft } from 'lucide-react';
```

**Replace each lucide icon with Material Symbols Outlined:**

| Lucide Component | Location | Replacement |
|-----------------|----------|-------------|
| `ArrowLeft size={18}` | Breadcrumb back | `<span className="material-symbols-outlined text-[18px]">arrow_back</span>` |
| `Calendar size={18}` | Chart tab | `<span className="material-symbols-outlined text-[18px]">calendar_month</span>` |
| `Calendar size={18}` | Interpretation tab | `<span className="material-symbols-outlined text-[18px]">psychology</span>` |
| `Settings size={18}` | Relocate tab | `<span className="material-symbols-outlined text-[18px]">tune</span>` |
| `Share2 size={18}` | Share tab | `<span className="material-symbols-outlined text-[18px]">share</span>` |

### 2b. Retheme breadcrumb

**Back button (line ~111):**
```diff
- className="flex items-center gap-1 text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
+ className="flex items-center gap-1 text-violet-300 hover:text-violet-200 transition-colors"
```

**Separator (line ~119):**
```diff
- <span className="text-gray-400">/</span>
+ <span className="text-slate-500">/</span>
```

**Current segment (line ~120):**
```diff
- <span className="text-gray-700 dark:text-gray-300">Solar Return {selectedYear}</span>
+ <span className="text-slate-300">Solar Return {selectedYear}</span>
```

### 2c. Retheme view mode tabs

**Tab bar container (line ~138):**
```diff
- <div className="flex gap-2.5 mb-5 border-b-2 border-gray-200 dark:border-gray-700 pb-2.5">
+ <div className="flex gap-2.5 mb-5 border-b border-white/10 pb-2.5">
```

**Tab button (line ~143):**
```diff
  className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all ${
    viewMode === tab.mode
-     ? 'bg-indigo-600 text-white'
-     : 'bg-transparent text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
+     ? 'bg-primary text-white'
+     : 'bg-transparent text-slate-400 hover:bg-white/5 hover:text-white'
  }`}
```

### 2d. Retheme page header

**Title (line ~161):**
```diff
- <h2 className="text-3xl font-bold mb-2">Solar Returns</h2>
+ <h2 className="text-3xl font-bold text-white mb-2">Solar Returns</h2>
```

**Subtitle (line ~162):**
```diff
- <p className="text-gray-600 dark:text-gray-400">Your birthday year forecasts and themes</p>
+ <p className="text-slate-400">Your birthday year forecasts and themes</p>
```

### 2e. Retheme error banner

**Error state (line ~168):**
```diff
- <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg text-sm flex items-center justify-between">
-   {error}
-   <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 ml-2">✕</button>
+ <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-sm flex items-center justify-between">
+   {error}
+   <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300 ml-2">
+     <span className="material-symbols-outlined text-[18px]">close</span>
+   </button>
  </div>
```

### 2f. Retheme loading spinner

**Loading state (line ~196):**
```diff
- <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
- <p className="text-gray-500">Loading...</p>
+ <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
+ <p className="text-slate-400">Loading...</p>
```

---

## Fix 3: Emoji-to-Icon Migration

### 3a. DashboardPage.tsx — Welcome text (line ~246)

```diff
- <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
-   Welcome back, {user?.name ?? 'Stargazer'} ✨
- </h2>
+ <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
+   Welcome back, {user?.name ?? 'Stargazer'}
+ </h2>
```

Remove the `✨` emoji. The cosmic theme already communicates the brand — no decorative emoji needed in headings.

### 3b. DailyBriefingPage.tsx — Moon phase icon

Replace the emoji moon with a Material Symbol or SVG:

```diff
  const MOCK_MOON_PHASE: MoonPhaseData = {
-   icon: '🌙',
+   icon: 'dark_mode',  // Material Symbols Outlined icon name
    phase: 'Waxing Gibbous',
    ...
  };
```

Then in the template (line ~209):
```diff
- <span className="text-3xl leading-none" role="img" aria-label="Moon">
-   {moonPhase.icon}
- </span>
+ <span className="material-symbols-outlined text-4xl text-yellow-100" aria-hidden="true">
+   {moonPhase.icon}
+ </span>
```

### 3c. DailyBriefingPage.tsx — Transit emojis

Replace the emoji field with Material Symbol icon names:

```diff
  const MOCK_TRANSITS: TransitCardData[] = [
    {
      planet: 'Venus',
      sign: 'Pisces',
      description: 'Heightened romance and creativity...',
      badge: 'favorable',
-     emoji: '⭐',
+     emoji: 'star',
    },
    {
      planet: 'Mars',
      sign: 'Gemini',
      description: 'Mental energy peaks today...',
      badge: 'major',
-     emoji: '⚡',
+     emoji: 'bolt',
    },
    {
      planet: 'Neptune',
      sign: 'Pisces',
      description: 'Dreamy intuition...',
      badge: 'challenging',
-     emoji: '🌊',
+     emoji: 'water',
    },
  ];
```

Update the template (line ~283):
```diff
- <span className="text-lg leading-none">{transit.emoji}</span>
+ <span className="material-symbols-outlined text-[20px] text-slate-300">{transit.emoji}</span>
```

### 3d. ProfileSettingsPage.tsx — "Pro Plan ✨" heading

```diff
- <h3 className="text-2xl font-bold text-white">Pro Plan ✨</h3>
+ <h3 className="text-2xl font-bold text-white flex items-center gap-2">
+   Pro Plan
+   <span className="material-symbols-outlined text-gold text-[20px]">auto_awesome</span>
+ </h3>
```

---

## Fix 4: Data Inconsistencies (DS1 + DS2)

### DS1: Pricing mismatch

Coordinate with backend to ensure the plans endpoint returns consistent pricing. The FALLBACK_PLANS in SubscriptionPage should match the ProfileSettingsPage display. Use backend as source of truth.

Options:
1. Update FALLBACK_PLANS Pro price to match backend ($12/mo or $9.99/mo)
2. Remove the static subscription display in ProfileSettingsPage and link to SubscriptionPage instead

### DS2: Tier mapping

```diff
  const rawTier = user?.plan ?? 'free';
- const currentTier: string = rawTier === 'basic' ? 'pro' : rawTier;
+ const TIER_MAP: Record<string, string> = { free: 'free', basic: 'pro', pro: 'pro', premium: 'premium' };
+ const currentTier = TIER_MAP[rawTier] ?? 'free';
```

---

## Implementation Checklist

- [ ] SubscriptionPage: Remove `@heroicons/react` import, replace all icon components
- [ ] SubscriptionPage: Retheme all color classes per section 1b–1e
- [ ] SolarReturnsPage: Remove `lucide-react` import, replace all icon components
- [ ] SolarReturnsPage: Retheme all color classes per section 2b–2f
- [ ] DashboardPage: Remove `✨` emoji from welcome heading
- [ ] DailyBriefingPage: Replace moon emoji with Material Symbol
- [ ] DailyBriefingPage: Replace transit emojis with Material Symbols
- [ ] ProfileSettingsPage: Replace `✨` with Material Symbol icon
- [ ] Verify all pages visually match cosmic theme after changes
- [ ] Run `npm run build` to confirm no import/compilation errors
- [ ] Manual accessibility check: verify contrast ratios on changed elements
