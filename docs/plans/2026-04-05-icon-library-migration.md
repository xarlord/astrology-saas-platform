# Icon Library Migration Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove `@heroicons/react` and `lucide-react` dependencies by migrating all 128 icon instances across 20 files to Material Symbols Outlined (already loaded via Google Fonts).

**Architecture:** Mechanical replacement of React icon components with `<span className="material-symbols-outlined" style={{ fontSize: 'Npx' }}>icon_name</span>`. Every file is independent — all tasks within a phase are parallelizable. Final task uninstalls both packages.

**Tech Stack:** React 18, TypeScript, Material Symbols Outlined (Google Fonts), Tailwind 3

---

## Replacement Pattern

Every icon follows this pattern:

**Heroicons** (`className="w-N h-N [extra]"`) → `<span className="material-symbols-outlined [extra]" style={{ fontSize: 'Npx' }}>name</span>`

**Lucide** (`size={N} className="[extra]"`) → `<span className="material-symbols-outlined [extra]" style={{ fontSize: 'Npx' }}>name</span>`

**Size mapping:**
- `w-4 h-4` or `size={16}` → `fontSize: '16px'`
- `w-5 h-5` or `size={20}` → `fontSize: '20px'`
- `w-6 h-6` or `size={24}` → `fontSize: '24px'`
- Other sizes map directly: `size={N}` → `fontSize: 'Npx'`

**Important:** Remove SVG-specific props like `strokeWidth`. Material Symbols are font-based, not SVG.

---

## Icon Name Mapping

### Heroicons → Material Symbols

| Heroicon | Material Symbol |
|----------|----------------|
| Bars3Icon | menu |
| XMarkIcon | close |
| HomeIcon | home |
| StarIcon | star |
| ClockIcon | schedule |
| TableCellsIcon | table |
| MoonIcon | dark_mode |
| ArrowUturnLeftIcon | undo |
| Cog6ToothIcon | settings |
| PlusIcon | add |
| CalendarIcon | calendar_today |
| ChartBarIcon | bar_chart |
| UserIcon | person |
| ExclamationCircleIcon | error |
| EyeIcon | visibility |
| EyeSlashIcon | visibility_off |
| ChevronLeftIcon | chevron_left |
| ChevronRightIcon | chevron_right |
| SunIcon | light_mode |
| CameraIcon | photo_camera |
| PencilIcon | edit |
| TrashIcon | delete |
| SparklesIcon | auto_awesome |
| CheckIcon | check |

### Lucide → Material Symbols

| Lucide | Material Symbol |
|--------|----------------|
| Sparkles | auto_awesome |
| Info | info |
| Calendar | calendar_today |
| Settings | settings |
| Share2 | share |
| ArrowLeft | arrow_back |
| ArrowRight | arrow_forward |
| ChevronLeft | chevron_left |
| ChevronRight | chevron_right |
| Sun | light_mode |
| Moon | dark_mode |
| Circle | circle |
| Star | star |
| TrendingUp | trending_up |
| AlertTriangle | warning |
| Gift | card_giftcard |
| Lightbulb | lightbulb |
| Download | download |
| MapPin | location_on |
| Globe | public |
| Search | search |
| Copy | content_copy |
| Eye | visibility |
| EyeOff | visibility_off |
| Lock | lock |
| Trash2 | delete |
| Clock | schedule |
| BarChart2 | bar_chart |
| Bell | notifications |
| Mail | mail |
| Smartphone | smartphone |
| Check | check |
| X | close |
| Loader2 | progress_activity |
| ZoomIn | zoom_in |
| ZoomOut | zoom_out |
| FileDown | file_download |
| CheckCircle | check_circle |
| AlertCircle | error |
| Link | link |

---

## Phase 1: Heroicons (Tasks 1-5)

All tasks are independent and parallelizable.

### Task 1: BirthDataForm.tsx

**Depends on:** No dependencies (parallelizable)

**Files:**
- Modify: `frontend/src/components/BirthDataForm.tsx`

**Step 1: Remove heroicons import**

Remove: `import { ExclamationCircleIcon } from '@heroicons/react/24/outline';`

**Step 2: Replace all 5 ExclamationCircleIcon instances**

Line 14 (ErrorMessage component):
```tsx
// Before:
<ExclamationCircleIcon className="error-icon" aria-hidden="true" />
// After:
<span className="material-symbols-outlined error-icon" style={{ fontSize: '20px' }} aria-hidden="true">error</span>
```

Lines 274, 304, 361, 425 (field error indicators — all identical):
```tsx
// Before:
<ExclamationCircleIcon className="w-5 h-5 text-red-500" aria-hidden="true" />
// After:
<span className="material-symbols-outlined text-red-500" style={{ fontSize: '20px' }} aria-hidden="true">error</span>
```

**Step 3: Verify**

Run: `cd frontend && npx tsc --noEmit`
Run: `cd frontend && npx vitest run src/components/__tests__/BirthDataForm.test.tsx 2>&1 | tail -5`
Expected: All pass

**Step 4: Commit**

```bash
git add frontend/src/components/BirthDataForm.tsx
git commit -m "refactor: migrate BirthDataForm icons from heroicons to Material Symbols"
```

---

### Task 2: AuthenticationForms.tsx

**Depends on:** No dependencies (parallelizable)

**Files:**
- Modify: `frontend/src/components/AuthenticationForms.tsx`

**Step 1: Remove heroicons import**

Remove: `import { EyeIcon, EyeSlashIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';`

**Step 2: Replace icons**

Line 14 (ErrorMessage component):
```tsx
// Before:
<ExclamationCircleIcon className="error-icon" aria-hidden="true" />
// After:
<span className="material-symbols-outlined error-icon" style={{ fontSize: '20px' }} aria-hidden="true">error</span>
```

Lines 155, 201, 481, 519, 558, 613 (field error — all identical):
```tsx
// Before:
<ExclamationCircleIcon className="w-5 h-5 text-red-500" aria-hidden="true" />
// After:
<span className="material-symbols-outlined text-red-500" style={{ fontSize: '20px' }} aria-hidden="true">error</span>
```

Lines 211, 568, 624 (password visible — show "hide" icon):
```tsx
// Before:
<EyeSlashIcon className="w-5 h-5" />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '20px' }}>visibility_off</span>
```

Lines 213, 570, 626 (password hidden — show "show" icon):
```tsx
// Before:
<EyeIcon className="w-5 h-5" />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '20px' }}>visibility</span>
```

**Step 3: Verify**

Run: `cd frontend && npx tsc --noEmit`
Run: `cd frontend && npx vitest run src/components/__tests__/AuthenticationForms.test.tsx 2>&1 | tail -5`
Expected: All pass

**Step 4: Commit**

```bash
git add frontend/src/components/AuthenticationForms.tsx
git commit -m "refactor: migrate AuthenticationForms icons from heroicons to Material Symbols"
```

---

### Task 3: TransitDashboard.tsx

**Depends on:** No dependencies (parallelizable)

**Files:**
- Modify: `frontend/src/components/TransitDashboard.tsx`

**Step 1: Remove heroicons import**

Remove: `import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';`

**Step 2: Replace icons used in data objects (viewModes array)**

The `viewModes` array at lines 126-129 stores icon references. Replace with inline functions:

```tsx
// Before:
{ id: 'today', label: 'Today', icon: SunIcon },
{ id: 'week', label: 'This Week', icon: CalendarIcon },
{ id: 'calendar', label: 'This Month', icon: CalendarIcon },
{ id: 'highlights', label: 'Highlights', icon: MoonIcon },

// After:
{ id: 'today', label: 'Today', icon: () => <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>light_mode</span> },
{ id: 'week', label: 'This Week', icon: () => <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>calendar_today</span> },
{ id: 'calendar', label: 'This Month', icon: () => <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>calendar_today</span> },
{ id: 'highlights', label: 'Highlights', icon: () => <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>dark_mode</span> },
```

**Note:** The rendering at line ~151 uses `<Icon className="w-4 h-4" />`. Since we switched to arrow functions that render spans directly, the className prop from the render site is ignored. This is fine — the fontSize is set in the factory.

**Step 3: Replace inline icons**

Line 169:
```tsx
// Before:
<ChevronLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
// After:
<span className="material-symbols-outlined text-gray-600 dark:text-gray-400" style={{ fontSize: '20px' }}>chevron_left</span>
```

Line 187:
```tsx
// Before:
<ChevronRightIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
// After:
<span className="material-symbols-outlined text-gray-600 dark:text-gray-400" style={{ fontSize: '20px' }}>chevron_right</span>
```

**Step 4: Verify**

Run: `cd frontend && npx tsc --noEmit`
Expected: PASS

**Step 5: Commit**

```bash
git add frontend/src/components/TransitDashboard.tsx
git commit -m "refactor: migrate TransitDashboard icons from heroicons to Material Symbols"
```

---

### Task 4: UserProfile.tsx

**Depends on:** No dependencies (parallelizable)

**Files:**
- Modify: `frontend/src/components/UserProfile.tsx`

**Step 1: Remove heroicons import**

Remove: `import { CameraIcon, PencilIcon, TrashIcon, PlusIcon, StarIcon, SparklesIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';`

**Step 2: Replace icons**

Line 277:
```tsx
// Before:
<CameraIcon className="w-4 h-4 text-indigo-600" />
// After:
<span className="material-symbols-outlined text-indigo-600" style={{ fontSize: '16px' }}>photo_camera</span>
```

Line 352:
```tsx
// Before:
<XMarkIcon className="w-5 h-5" />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
```

Line 363:
```tsx
// Before:
<PencilIcon className="w-5 h-5" />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '20px' }}>edit</span>
```

Line 474:
```tsx
// Before:
<StarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
// After:
<span className="material-symbols-outlined text-gray-400 mx-auto mb-4" style={{ fontSize: '64px' }}>star</span>
```

Line 480:
```tsx
// Before:
<PlusIcon className="w-5 h-5 inline mr-2" />
// After:
<span className="material-symbols-outlined inline mr-2" style={{ fontSize: '20px' }}>add</span>
```

Line 494:
```tsx
// Before:
<PlusIcon className="w-5 h-5" />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add</span>
```

Line 569:
```tsx
// Before:
<PencilIcon className="w-4 h-4" />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span>
```

Line 576:
```tsx
// Before:
<TrashIcon className="w-4 h-4" />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
```

Line 793:
```tsx
// Before:
<SparklesIcon className="w-8 h-8 text-indigo-500" />
// After:
<span className="material-symbols-outlined text-indigo-500" style={{ fontSize: '32px' }}>auto_awesome</span>
```

Line 854:
```tsx
// Before:
<CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
// After:
<span className="material-symbols-outlined text-green-500 flex-shrink-0 mt-0.5" style={{ fontSize: '20px' }}>check</span>
```

**Step 3: Verify**

Run: `cd frontend && npx tsc --noEmit`
Run: `cd frontend && npx vitest run src/components/__tests__/UserProfile.test.tsx 2>&1 | tail -5`
Expected: All pass

**Step 4: Commit**

```bash
git add frontend/src/components/UserProfile.tsx
git commit -m "refactor: migrate UserProfile icons from heroicons to Material Symbols"
```

---

### Task 5: AppLayout.tsx

**Depends on:** No dependencies (parallelizable)

**Files:**
- Modify: `frontend/src/components/AppLayout.tsx`

This is the most complex heroicons file — 13 icons, 16+ occurrences, and data-driven nav items.

**Step 1: Remove heroicons import**

Remove the entire import block:
```tsx
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  StarIcon,
  ClockIcon,
  TableCellsIcon,
  MoonIcon,
  ArrowUturnLeftIcon,
  Cog6ToothIcon,
  PlusIcon,
  CalendarIcon,
  ChartBarIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
```

**Step 2: Replace nav item data (lines ~565-568)**

The nav items store icon component references. Replace with factory functions:

```tsx
// Before:
{ name: 'home', label: 'Home', href: '/', icon: HomeIcon },
{ name: 'charts', label: 'Charts', href: '/charts', icon: StarIcon },
{ name: 'transits', label: 'Transits', href: '/transits', icon: MoonIcon },
{ name: 'learn', label: 'Learn', href: '/learn', icon: ChartBarIcon },

// After:
{ name: 'home', label: 'Home', href: '/', icon: () => <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>home</span> },
{ name: 'charts', label: 'Charts', href: '/charts', icon: () => <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>star</span> },
{ name: 'transits', label: 'Transits', href: '/transits', icon: () => <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>dark_mode</span> },
{ name: 'learn', label: 'Learn', href: '/learn', icon: () => <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>bar_chart</span> },
```

**Step 3: Update nav item rendering (line ~359)**

The rendering passes `strokeWidth` and `className="w-6 h-6"` — both SVG-specific. Update:

```tsx
// Before:
<item.icon className={`w-6 h-6 ${active ? 'text-white' : 'text-slate-400'}`} strokeWidth={active ? 2.5 : 2} />

// After:
<item.icon />
```

Since the icon factories already include fontSize, and the nav icons don't need color variants (they're rendered in a context where parent color applies), this is sufficient. If the original had active/inactive color differences, the parent `className` on the link handles it.

**Step 4: Replace inline header icons**

Line 88:
```tsx
// Before:
<Bars3Icon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
// After:
<span className="material-symbols-outlined text-gray-600 dark:text-gray-300" style={{ fontSize: '24px' }}>menu</span>
```

Line 140:
```tsx
// Before:
<UserIcon className="w-5 h-5" />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '20px' }}>person</span>
```

Line 147:
```tsx
// Before:
<Cog6ToothIcon className="w-5 h-5" />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '20px' }}>settings</span>
```

Line 155:
```tsx
// Before:
<ArrowUturnLeftIcon className="w-5 h-5" />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '20px' }}>undo</span>
```

Line 191:
```tsx
// Before:
<XMarkIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
// After:
<span className="material-symbols-outlined text-gray-600 dark:text-gray-300" style={{ fontSize: '24px' }}>close</span>
```

Line 207:
```tsx
// Before:
<PlusIcon className="w-5 h-5" />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add</span>
```

Line 214:
```tsx
// Before:
<CalendarIcon className="w-5 h-5" />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '20px' }}>calendar_today</span>
```

Line 229:
```tsx
// Before:
<StarIcon className="w-5 h-5" />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '20px' }}>star</span>
```

Line 246:
```tsx
// Before:
<ClockIcon className="w-5 h-5" />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '20px' }}>schedule</span>
```

Line 262:
```tsx
// Before:
<TableCellsIcon className="w-5 h-5" />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '20px' }}>table</span>
```

Line 269:
```tsx
// Before:
<MoonIcon className="w-5 h-5" />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '20px' }}>dark_mode</span>
```

Line 276:
```tsx
// Before:
<ArrowUturnLeftIcon className="w-5 h-5" />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '20px' }}>undo</span>
```

**Step 5: Verify**

Run: `cd frontend && npx tsc --noEmit`
Run: `cd frontend && npx vitest run src/components/__tests__/AppLayout.test.tsx src/components/__tests__/AppLayout.mobile.test.tsx 2>&1 | tail -5`
Expected: All pass

**Step 6: Commit**

```bash
git add frontend/src/components/AppLayout.tsx
git commit -m "refactor: migrate AppLayout icons from heroicons to Material Symbols"
```

---

## Phase 2: Lucide — Simple Files (Tasks 6-7)

All tasks are independent and parallelizable.

### Task 6: CalendarView.tsx, PushNotificationPermission.tsx, AIInterpretationToggle.tsx

**Depends on:** No dependencies (parallelizable)

**Files:**
- Modify: `frontend/src/components/CalendarView.tsx`
- Modify: `frontend/src/components/PushNotificationPermission.tsx`
- Modify: `frontend/src/components/AIInterpretationToggle.tsx`

**Step 1: CalendarView.tsx**

Remove: `import { ChevronLeft, ChevronRight } from 'lucide-react';`

Line 170:
```tsx
// Before:
<ChevronLeft size={20} />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chevron_left</span>
```

Line 179:
```tsx
// Before:
<ChevronRight size={20} />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chevron_right</span>
```

**Step 2: PushNotificationPermission.tsx**

Remove: `import { Bell, X } from 'lucide-react';`

Line 55:
```tsx
// Before:
<X size={18} />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
```

Line 60:
```tsx
// Before:
<Bell size={32} />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '32px' }}>notifications</span>
```

**Step 3: AIInterpretationToggle.tsx**

Remove: `import { Sparkles, Info } from 'lucide-react';`

Line 55:
```tsx
// Before:
<Sparkles className="animate-pulse" size={18} />
// After:
<span className="material-symbols-outlined animate-pulse" style={{ fontSize: '18px' }}>auto_awesome</span>
```

Line 64:
```tsx
// Before:
<Info size={16} />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '16px' }}>info</span>
```

**Step 4: Verify**

Run: `cd frontend && npx tsc --noEmit`
Run: `cd frontend && npx vitest run src/components/__tests__/CalendarView.test.tsx 2>&1 | tail -5`
Expected: All pass

**Step 5: Commit**

```bash
git add frontend/src/components/CalendarView.tsx frontend/src/components/PushNotificationPermission.tsx frontend/src/components/AIInterpretationToggle.tsx
git commit -m "refactor: migrate CalendarView, PushNotificationPermission, AIInterpretationToggle icons to Material Symbols"
```

---

### Task 7: AIInterpretationDisplay.tsx, SolarReturnsPage.tsx

**Depends on:** No dependencies (parallelizable)

**Files:**
- Modify: `frontend/src/components/AIInterpretationDisplay.tsx`
- Modify: `frontend/src/pages/SolarReturnsPage.tsx`

**Step 1: AIInterpretationDisplay.tsx**

Remove: `import { Sparkles, AlertCircle } from 'lucide-react';`

Line 73:
```tsx
// Before:
<Sparkles size={16} />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '16px' }}>auto_awesome</span>
```

Line 99:
```tsx
// Before:
<AlertCircle size={14} className="shrink-0 mt-0.5" />
// After:
<span className="material-symbols-outlined shrink-0 mt-0.5" style={{ fontSize: '14px' }}>error</span>
```

**Step 2: SolarReturnsPage.tsx**

Remove: `import { Calendar, Settings, Share2, ArrowLeft } from 'lucide-react';`

Line 113:
```tsx
// Before:
<ArrowLeft size={18} />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
```

Lines 130-131 (tab icons — Calendar appears twice):
```tsx
// Before:
<Calendar size={18} />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '18px' }}>calendar_today</span>
```

Line 132:
```tsx
// Before:
<Settings size={18} />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '18px' }}>settings</span>
```

Line 133:
```tsx
// Before:
<Share2 size={18} />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '18px' }}>share</span>
```

**Step 3: Verify**

Run: `cd frontend && npx tsc --noEmit`
Expected: PASS

**Step 4: Commit**

```bash
git add frontend/src/components/AIInterpretationDisplay.tsx frontend/src/pages/SolarReturnsPage.tsx
git commit -m "refactor: migrate AIInterpretationDisplay and SolarReturnsPage icons to Material Symbols"
```

---

## Phase 3: Lucide — Medium Files (Tasks 8-12)

All tasks are independent and parallelizable.

### Task 8: SolarReturnChart.tsx

**Depends on:** No dependencies (parallelizable)

**Files:**
- Modify: `frontend/src/components/SolarReturnChart.tsx`

**Step 1: Remove lucide import**

Remove: `import { Loader2, ZoomIn, ZoomOut, Download } from 'lucide-react';`

**Step 2: Replace icons**

Line 380:
```tsx
// Before:
<ZoomOut size={18} />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '18px' }}>zoom_out</span>
```

Line 385:
```tsx
// Before:
<ZoomIn size={18} />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '18px' }}>zoom_in</span>
```

Line 388:
```tsx
// Before:
<Download size={18} />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
```

Line 396:
```tsx
// Before:
<Loader2 size={32} className="animate-spin text-indigo-500" />
// After:
<span className="material-symbols-outlined animate-spin text-indigo-500" style={{ fontSize: '32px' }}>progress_activity</span>
```

**Step 3: Verify and commit**

Run: `cd frontend && npx tsc --noEmit`
```bash
git add frontend/src/components/SolarReturnChart.tsx
git commit -m "refactor: migrate SolarReturnChart icons from lucide to Material Symbols"
```

---

### Task 9: RelocationCalculator.tsx

**Depends on:** No dependencies (parallelizable)

**Files:**
- Modify: `frontend/src/components/RelocationCalculator.tsx`

**Step 1: Remove lucide import**

Remove: `import { MapPin, Globe, Search, ArrowRight, Info } from 'lucide-react';`

**Step 2: Replace icons**

Line 164:
```tsx
// Before:
<Globe size={32} />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '32px' }}>public</span>
```

Line 174:
```tsx
// Before:
<Info size={20} className="text-emerald-700 shrink-0 mt-0.5" />
// After:
<span className="material-symbols-outlined text-emerald-700 shrink-0 mt-0.5" style={{ fontSize: '20px' }}>info</span>
```

Line 186:
```tsx
// Before:
<Search size={20} className="text-gray-400 shrink-0" />
// After:
<span className="material-symbols-outlined text-gray-400 shrink-0" style={{ fontSize: '20px' }}>search</span>
```

Line 225:
```tsx
// Before:
<MapPin size={20} className="text-indigo-500 shrink-0" />
// After:
<span className="material-symbols-outlined text-indigo-500 shrink-0" style={{ fontSize: '20px' }}>location_on</span>
```

Line 260:
```tsx
// Before:
<ArrowRight size={32} />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '32px' }}>arrow_forward</span>
```

Line 292:
```tsx
// Before:
<ArrowRight size={16} />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
```

**Step 3: Verify and commit**

Run: `cd frontend && npx tsc --noEmit`
```bash
git add frontend/src/components/RelocationCalculator.tsx
git commit -m "refactor: migrate RelocationCalculator icons from lucide to Material Symbols"
```

---

### Task 10: DailyWeatherModal.tsx

**Depends on:** No dependencies (parallelizable)

**Files:**
- Modify: `frontend/src/components/DailyWeatherModal.tsx`

**Step 1: Remove lucide import**

Remove: `import { X, Moon, Star, Sparkles } from 'lucide-react';`

**Step 2: Replace icons**

Line 102:
```tsx
// Before:
<X size={24} />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '24px' }}>close</span>
```

Line 122:
```tsx
// Before:
<Moon size={20} />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '20px' }}>dark_mode</span>
```

Line 146:
```tsx
// Before:
<Star size={20} />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '20px' }}>star</span>
```

Line 161:
```tsx
// Before:
<Sparkles size={20} />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '20px' }}>auto_awesome</span>
```

**Step 3: Verify and commit**

Run: `cd frontend && npx tsc --noEmit`
Run: `cd frontend && npx vitest run src/components/__tests__/DailyWeatherModal.test.tsx 2>&1 | tail -5`
Expected: All pass
```bash
git add frontend/src/components/DailyWeatherModal.tsx
git commit -m "refactor: migrate DailyWeatherModal icons from lucide to Material Symbols"
```

---

### Task 11: CalendarExport.tsx

**Depends on:** No dependencies (parallelizable)

**Files:**
- Modify: `frontend/src/components/CalendarExport.tsx`

**Step 1: Remove lucide import**

Remove: `import { Download, Calendar, FileDown, CheckCircle, AlertCircle } from 'lucide-react';`

**Step 2: Replace icons**

Line 119:
```tsx
// Before:
<FileDown size={24} />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '24px' }}>file_download</span>
```

Line 198:
```tsx
// Before:
<AlertCircle size={14} className="shrink-0 mt-0.5" />
// After:
<span className="material-symbols-outlined shrink-0 mt-0.5" style={{ fontSize: '14px' }}>error</span>
```

Line 206:
```tsx
// Before:
<CheckCircle size={20} />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '20px' }}>check_circle</span>
```

Line 213:
```tsx
// Before:
<AlertCircle size={20} />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '20px' }}>error</span>
```

Line 229:
```tsx
// Before:
<Download size={18} />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
```

Line 239:
```tsx
// Before:
<Calendar size={16} />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '16px' }}>calendar_today</span>
```

**Step 3: Verify and commit**

Run: `cd frontend && npx tsc --noEmit`
```bash
git add frontend/src/components/CalendarExport.tsx
git commit -m "refactor: migrate CalendarExport icons from lucide to Material Symbols"
```

---

### Task 12: SolarReturnDashboard.tsx

**Depends on:** No dependencies (parallelizable)

**Files:**
- Modify: `frontend/src/components/SolarReturnDashboard.tsx`

**Step 1: Remove lucide import**

Remove: `import { Calendar, MapPin, Gift, TrendingUp } from 'lucide-react';`

**Step 2: Replace icons**

Line 204:
```tsx
// Before:
<Calendar size={18} />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '18px' }}>calendar_today</span>
```

Line 225:
```tsx
// Before:
<MapPin size={14} />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '14px' }}>location_on</span>
```

Line 233:
```tsx
// Before:
<Calendar size={16} />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '16px' }}>calendar_today</span>
```

Line 243:
```tsx
// Before:
<MapPin size={16} />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '16px' }}>location_on</span>
```

Line 277:
```tsx
// Before:
<TrendingUp size={16} />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '16px' }}>trending_up</span>
```

Line 281:
```tsx
// Before:
<Gift size={16} />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '16px' }}>card_giftcard</span>
```

Line 289:
```tsx
// Before:
<Calendar size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
// After:
<span className="material-symbols-outlined mx-auto text-gray-300 dark:text-gray-600 mb-4" style={{ fontSize: '48px' }}>calendar_today</span>
```

**Step 3: Verify and commit**

Run: `cd frontend && npx tsc --noEmit`
```bash
git add frontend/src/components/SolarReturnDashboard.tsx
git commit -m "refactor: migrate SolarReturnDashboard icons from lucide to Material Symbols"
```

---

## Phase 4: Lucide — Complex Files (Tasks 13-17)

All tasks are independent and parallelizable.

### Task 13: TransitCalendar.tsx

**Depends on:** No dependencies (parallelizable)

**Files:**
- Modify: `frontend/src/components/TransitCalendar.tsx`

This file uses icon aliases (Circle aliased as MercuryIcon, VenusIcon, MarsIcon) in a PLANET_CONFIG data object, rendered dynamically.

**Step 1: Remove lucide import**

Remove the entire block:
```tsx
import {
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Circle,
  Info,
} from 'lucide-react';
```

Also remove the alias lines:
```tsx
const MercuryIcon = Circle;
const VenusIcon = Circle;
const MarsIcon = Circle;
```

**Step 2: Replace PLANET_CONFIG entries (lines ~80-85)**

The config stores icon components with colors. Replace with Material Symbol factories:

```tsx
// Before (example):
sun: { icon: Sun, color: '#f59e0b' },
moon: { icon: Moon, color: '#94a3b8' },
mercury: { icon: MercuryIcon, color: '#6b7280' },
venus: { icon: VenusIcon, color: '#ec4899' },
mars: { icon: MarsIcon, color: '#ef4444' },

// After:
sun: { icon: () => <span className="material-symbols-outlined" style={{ fontSize: '12px', color: '#f59e0b' }}>light_mode</span>, color: '#f59e0b' },
moon: { icon: () => <span className="material-symbols-outlined" style={{ fontSize: '12px', color: '#94a3b8' }}>dark_mode</span>, color: '#94a3b8' },
mercury: { icon: () => <span className="material-symbols-outlined" style={{ fontSize: '12px', color: '#6b7280' }}>circle</span>, color: '#6b7280' },
venus: { icon: () => <span className="material-symbols-outlined" style={{ fontSize: '12px', color: '#ec4899' }}>circle</span>, color: '#ec4899' },
mars: { icon: () => <span className="material-symbols-outlined" style={{ fontSize: '12px', color: '#ef4444' }}>circle</span>, color: '#ef4444' },
```

**Note:** The rendering sites at lines ~375-378 and ~468-471 use `<IconComponent className="..." style={{ color: config.color }} />`. Since we moved color into the factory, update the rendering to just `<IconComponent />`:

```tsx
// Before:
<IconComponent className="w-3 h-3 flex-shrink-0" style={{ color: config.color }} />
// After:
<IconComponent />

// Before (larger version):
<IconComponent className="w-5 h-5" style={{ color: config.color }} />
// After:
<IconComponent />
```

**Step 3: Replace inline icons**

Line 235:
```tsx
// Before:
<ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
// After:
<span className="material-symbols-outlined text-gray-600 dark:text-gray-400" style={{ fontSize: '20px' }}>chevron_left</span>
```

Line 245:
```tsx
// Before:
<ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
// After:
<span className="material-symbols-outlined text-gray-600 dark:text-gray-400" style={{ fontSize: '20px' }}>chevron_right</span>
```

Line 488:
```tsx
// Before:
<Info className="w-4 h-4 text-gray-400" />
// After:
<span className="material-symbols-outlined text-gray-400" style={{ fontSize: '16px' }}>info</span>
```

**Step 4: Verify and commit**

Run: `cd frontend && npx tsc --noEmit`
```bash
git add frontend/src/components/TransitCalendar.tsx
git commit -m "refactor: migrate TransitCalendar icons from lucide to Material Symbols"
```

---

### Task 14: ShareManagement.tsx

**Depends on:** No dependencies (parallelizable)

**Files:**
- Modify: `frontend/src/components/ShareManagement.tsx`

**Step 1: Remove lucide import**

Remove: `import { Copy, Eye, EyeOff, Lock, Trash2, Share2, Clock, BarChart2 } from 'lucide-react';`

**Step 2: Replace icons**

Line 110:
```tsx
// Before:
<Share2 className="w-6 h-6 text-indigo-500" aria-hidden="true" />
// After:
<span className="material-symbols-outlined text-indigo-500" style={{ fontSize: '24px' }} aria-hidden="true">share</span>
```

Line 121:
```tsx
// Before:
<Share2 size={16} aria-hidden="true" />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '16px' }} aria-hidden="true">share</span>
```

Line 141:
```tsx
// Before:
<Lock size={12} aria-hidden="true" />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '12px' }} aria-hidden="true">lock</span>
```

Line 151:
```tsx
// Before:
<BarChart2 size={12} aria-hidden="true" />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '12px' }} aria-hidden="true">bar_chart</span>
```

Line 156:
```tsx
// Before:
<Clock size={12} aria-hidden="true" />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '12px' }} aria-hidden="true">schedule</span>
```

Line 175:
```tsx
// Before:
<Copy size={14} aria-hidden="true" />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '14px' }} aria-hidden="true">content_copy</span>
```

Line 186:
```tsx
// Before:
<Trash2 size={14} aria-hidden="true" />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '14px' }} aria-hidden="true">delete</span>
```

Line 196:
```tsx
// Before:
<Share2 size={32} className="opacity-30 mb-4" aria-hidden="true" />
// After:
<span className="material-symbols-outlined opacity-30 mb-4" style={{ fontSize: '32px' }} aria-hidden="true">share</span>
```

Line 235 (conditional — password visible):
```tsx
// Before:
<EyeOff size={16} />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '16px' }}>visibility_off</span>
```

Line 235 (conditional — password hidden):
```tsx
// Before:
<Eye size={16} />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '16px' }}>visibility</span>
```

**Step 3: Verify and commit**

Run: `cd frontend && npx tsc --noEmit`
```bash
git add frontend/src/components/ShareManagement.tsx
git commit -m "refactor: migrate ShareManagement icons from lucide to Material Symbols"
```

---

### Task 15: SolarReturnInterpretation.tsx

**Depends on:** No dependencies (parallelizable)

**Files:**
- Modify: `frontend/src/components/SolarReturnInterpretation.tsx`

**Step 1: Remove lucide import**

Remove: `import { Star, Calendar, TrendingUp, AlertTriangle, Gift, Lightbulb, Download, Share2 } from 'lucide-react';`

**Step 2: Replace icons**

Line 107:
```tsx
// Before:
<Calendar size={16} />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '16px' }}>calendar_today</span>
```

Line 120:
```tsx
// Before:
<Download size={18} />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
```

Line 126:
```tsx
// Before:
<Share2 size={18} />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '18px' }}>share</span>
```

Lines 136, 196:
```tsx
// Before:
<Star className="text-amber-500" size={24} />
// After:
<span className="material-symbols-outlined text-amber-500" style={{ fontSize: '24px' }}>star</span>
```

Line 227:
```tsx
// Before:
<AlertTriangle className="text-amber-500" size={24} />
// After:
<span className="material-symbols-outlined text-amber-500" style={{ fontSize: '24px' }}>warning</span>
```

Line 239:
```tsx
// Before:
<Lightbulb size={16} className="shrink-0 mt-0.5" />
// After:
<span className="material-symbols-outlined shrink-0 mt-0.5" style={{ fontSize: '16px' }}>lightbulb</span>
```

Line 252:
```tsx
// Before:
<TrendingUp className="text-green-500" size={24} />
// After:
<span className="material-symbols-outlined text-green-500" style={{ fontSize: '24px' }}>trending_up</span>
```

Line 260:
```tsx
// Before:
<Gift size={20} className="text-green-500" />
// After:
<span className="material-symbols-outlined text-green-500" style={{ fontSize: '20px' }}>card_giftcard</span>
```

Line 277:
```tsx
// Before:
<Lightbulb className="text-indigo-500" size={24} />
// After:
<span className="material-symbols-outlined text-indigo-500" style={{ fontSize: '24px' }}>lightbulb</span>
```

**Step 3: Verify and commit**

Run: `cd frontend && npx tsc --noEmit`
```bash
git add frontend/src/components/SolarReturnInterpretation.tsx
git commit -m "refactor: migrate SolarReturnInterpretation icons from lucide to Material Symbols"
```

---

### Task 16: ReminderSettings.tsx

**Depends on:** No dependencies (parallelizable)

**Files:**
- Modify: `frontend/src/components/ReminderSettings.tsx`

**Step 1: Remove lucide import**

Remove: `import { Bell, Mail, Smartphone, Check, Info } from 'lucide-react';`

**Step 2: Replace icons**

Line 102:
```tsx
// Before:
<Bell size={24} />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '24px' }}>notifications</span>
```

Line 152:
```tsx
// Before:
<Mail size={20} />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '20px' }}>mail</span>
```

Line 167:
```tsx
// Before:
<Smartphone size={20} />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '20px' }}>smartphone</span>
```

Line 190:
```tsx
// Before:
<Check size={16} className="text-emerald-500 shrink-0" />
// After:
<span className="material-symbols-outlined text-emerald-500 shrink-0" style={{ fontSize: '16px' }}>check</span>
```

Line 196:
```tsx
// Before:
<Info size={14} className="shrink-0 mt-0.5" />
// After:
<span className="material-symbols-outlined shrink-0 mt-0.5" style={{ fontSize: '14px' }}>info</span>
```

Line 222:
```tsx
// Before:
<Check size={20} />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '20px' }}>check</span>
```

**Step 3: Verify and commit**

Run: `cd frontend && npx tsc --noEmit`
Run: `cd frontend && npx vitest run src/components/__tests__/ReminderSettings.test.tsx 2>&1 | tail -5`
Expected: All pass
```bash
git add frontend/src/components/ReminderSettings.tsx
git commit -m "refactor: migrate ReminderSettings icons from lucide to Material Symbols"
```

---

### Task 17: BirthdaySharing.tsx

**Depends on:** No dependencies (parallelizable)

**Files:**
- Modify: `frontend/src/components/BirthdaySharing.tsx`

**Step 1: Remove lucide import**

Remove: `import { Gift, Mail, Link, Copy, Check, Share2, Calendar, Lock } from 'lucide-react';`

**Step 2: Replace icons**

Line 125:
```tsx
// Before:
<Gift size={24} className="text-purple-600" />
// After:
<span className="material-symbols-outlined text-purple-600" style={{ fontSize: '24px' }}>card_giftcard</span>
```

Line 163:
```tsx
// Before:
<Lock size={14} />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '14px' }}>lock</span>
```

Line 174:
```tsx
// Before:
<Gift size={32} className="text-purple-600" />
// After:
<span className="material-symbols-outlined text-purple-600" style={{ fontSize: '32px' }}>card_giftcard</span>
```

Line 190:
```tsx
// Before:
<Check size={20} className="text-green-600 flex-shrink-0" />
// After:
<span className="material-symbols-outlined text-green-600 flex-shrink-0" style={{ fontSize: '20px' }}>check</span>
```

Line 227:
```tsx
// Before:
<Link size={18} />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '18px' }}>link</span>
```

Line 238:
```tsx
// Before:
<Mail size={18} />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '18px' }}>mail</span>
```

Line 312:
```tsx
// Before:
<Share2 size={18} />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '18px' }}>share</span>
```

Line 331 (conditional — copied state):
```tsx
// Before:
<Check size={18} className="text-green-600" />
// After:
<span className="material-symbols-outlined text-green-600" style={{ fontSize: '18px' }}>check</span>
```

Line 331 (conditional — default state):
```tsx
// Before:
<Copy size={18} />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '18px' }}>content_copy</span>
```

Line 337:
```tsx
// Before:
<Calendar size={14} />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '14px' }}>calendar_today</span>
```

Line 338:
```tsx
// Before:
<Lock size={14} />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '14px' }}>lock</span>
```

Line 403:
```tsx
// Before:
<Mail size={18} />
// After:
<span className="material-symbols-outlined" style={{ fontSize: '18px' }}>mail</span>
```

**Step 3: Verify and commit**

Run: `cd frontend && npx tsc --noEmit`
```bash
git add frontend/src/components/BirthdaySharing.tsx
git commit -m "refactor: migrate BirthdaySharing icons from lucide to Material Symbols"
```

---

## Phase 5: Cleanup (Task 18)

### Task 18: Remove icon library packages

**Depends on:** Tasks 1-17 (all icon migrations must be complete)

**Files:**
- Modify: `frontend/package.json` (via npm uninstall)
- Modify: `frontend/package-lock.json` (via npm uninstall)

**Step 1: Verify zero remaining imports**

Run: `cd frontend && grep -r "from '@heroicons/react" src/ || echo "No heroicons imports remain"`
Run: `cd frontend && grep -r "from 'lucide-react" src/ || echo "No lucide imports remain"`
Expected: Both print "No ... imports remain"

**Step 2: Uninstall packages**

```bash
cd frontend && npm uninstall @heroicons/react lucide-react
```

**Step 3: Verify build**

Run: `cd frontend && npx tsc --noEmit`
Run: `cd frontend && npx vite build 2>&1 | tail -5`
Expected: Build succeeds

**Step 4: Verify tests**

Run: `cd frontend && npx vitest run 2>&1 | tail -10`
Expected: Same pass/fail count as before (any pre-existing failures remain, no new failures)

**Step 5: Commit**

```bash
git add frontend/package.json frontend/package-lock.json
git commit -m "chore: remove @heroicons/react and lucide-react dependencies"
```

---

## Error Handling

1. **Type check fails after a task:** The icon was likely misspelled or a prop was left behind. Check for any remaining SVG-specific props (`strokeWidth`, `viewBox`, etc.) and verify the Material Symbol name is correct.

2. **Test fails after a task:** Tests in this codebase don't assert on icon component names (verified via grep). If a test fails, it's likely a pre-existing issue or an unrelated regression.

3. **Build fails at Task 18:** A file was missed. Run the grep from Step 1 again to find remaining imports.

## Verification Checklist (run after all tasks)

- [ ] `grep -r "@heroicons/react" frontend/src/` returns nothing
- [ ] `grep -r "lucide-react" frontend/src/` returns nothing
- [ ] `cd frontend && npx tsc --noEmit` passes
- [ ] `cd frontend && npx vite build` succeeds
- [ ] No new test failures introduced
- [ ] `@heroicons/react` and `lucide-react` removed from `frontend/package.json`
