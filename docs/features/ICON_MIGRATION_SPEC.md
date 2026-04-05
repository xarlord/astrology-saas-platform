# Icon Library Migration Spec — Sprint 5 Tech Debt

**Date:** 2026-04-04
**Designer:** UX Designer 2
**Source:** Sprint 4 remaining tech debt (C2 partial fix)
**Goal:** Replace all `@heroicons/react` and `lucide-react` usage with Material Symbols Outlined

---

## Why

The AstroVerse design system specifies **Material Symbols Outlined** as the sole icon library. Currently:
- `@heroicons/react` is used in **5 files** (18 icon instances)
- `lucide-react` is used in **31 files** (120+ icon instances)

This fragmentation causes:
1. Inconsistent icon styles (heroicons is outline-only, lucide has its own stroke weight)
2. Larger bundle size (3 icon libraries loaded)
3. Confusing DX — engineers don't know which library to use for new components

---

## Icon Replacement Map

### Heroicons → Material Symbols Outlined

| Heroicon | Material Symbol | Size Guideline |
|----------|----------------|----------------|
| `CheckIcon` | `check` | text-[18px] buttons, text-[20px] standalone |
| `StarIcon` | `star` | text-[16px] inline |
| `SparklesIcon` | `auto_awesome` | text-[14px] badges, text-[18px] buttons |
| `ArrowLeftIcon` | `arrow_back` | text-[18px] navigation |
| `PlusIcon` | `add` | text-[20px] actions |
| `XMarkIcon` | `close` | text-[18px] modals, text-[20px] buttons |
| `ExclamationCircleIcon` | `error` | text-[20px] alerts |
| `EyeIcon` | `visibility` | text-[20px] toggles |
| `EyeSlashIcon` | `visibility_off` | text-[20px] toggles |
| `ChevronLeftIcon` | `chevron_left` | text-[20px] navigation |
| `ChevronRightIcon` | `chevron_right` | text-[20px] navigation |
| `CalendarIcon` | `calendar_month` | text-[20px] labels |
| `SunIcon` | `light_mode` | text-[20px] planet display |
| `MoonIcon` | `dark_mode` | text-[20px] planet display |

### Lucide → Material Symbols Outlined

| Lucide | Material Symbol | Size Guideline |
|--------|----------------|----------------|
| `Sparkles` | `auto_awesome` | text-[18px] |
| `Info` | `info` | text-[18px] |
| `AlertCircle` | `error` | text-[20px] |
| `Gift` | `card_giftcard` | text-[18px] |
| `Mail` | `mail` | text-[18px] |
| `Link` | `link` | text-[18px] |
| `Copy` | `content_copy` | text-[18px] |
| `Check` | `check` | text-[16px] |
| `Share2` | `share` | text-[18px] |
| `Calendar` | `calendar_month` | text-[18px] |
| `Lock` | `lock` | text-[18px] |
| `Download` | `download` | text-[18px] |
| `FileDown` | `file_download` | text-[18px] |
| `CheckCircle` | `check_circle` | text-[18px] |
| `ChevronLeft` | `chevron_left` | text-[20px] |
| `ChevronRight` | `chevron_right` | text-[20px] |
| `AlertTriangle` | `warning` | text-[20px] |
| `Crown` | `workspace_premium` | text-[20px] |
| `BarChart3` | `bar_chart` | text-[20px] |
| `Home` | `home` | text-[20px] |
| `RefreshCw` | `refresh` | text-[18px] |
| `Loader2` | `progress_activity` | text-[20px] (keep animate-spin) |
| `ZoomIn` | `zoom_in` | text-[20px] |
| `ZoomOut` | `zoom_out` | text-[20px] |
| `Bell` | `notifications` | text-[20px] |
| `Smartphone` | `smartphone` | text-[20px] |
| `X` | `close` | text-[18px] |
| `Moon` | `dark_mode` | text-[20px] |
| `Star` | `star` | text-[18px] |
| `MapPin` | `location_on` | text-[18px] |
| `Globe` | `public` | text-[20px] |
| `Search` | `search` | text-[20px] |
| `ArrowRight` | `arrow_forward` | text-[18px] |
| `ArrowLeft` | `arrow_back` | text-[18px] |
| `Settings` | `settings` | text-[20px] |
| `Eye` | `visibility` | text-[20px] |
| `EyeOff` | `visibility_off` | text-[20px] |
| `Trash2` | `delete` | text-[18px] |
| `Clock` | `schedule` | text-[18px] |
| `BarChart2` | `bar_chart` | text-[20px] |
| `TrendingUp` | `trending_up` | text-[18px] |
| `Lightbulb` | `lightbulb` | text-[18px] |
| `Circle` | `circle` | text-[20px] |
| `Sun` | `light_mode` | text-[20px] |
| `ChevronDown` | `expand_more` | text-[20px] |
| `ChevronUp` | `expand_less` | text-[20px] |
| `MessageSquare` | `chat_bubble` | text-[18px] |
| `QrCode` | `qr_code_2` | text-[20px] |
| `FileText` | `description` | text-[18px] |
| `XCircle` | `cancel` | text-[20px] |
| `Activity` | `monitor_heart` | text-[18px] |
| `Brain` | `psychology` | text-[20px] |
| `Pentagon` | `change_history` | text-[20px] (closest fill match) |
| `PlayCircle` | `play_circle` | text-[20px] |
| `Quote` | `format_quote` | text-[18px] |
| `Printer` | `print` | text-[18px] |
| `LayoutDashboard` | `dashboard` | text-[20px] |
| `GraduationCap` | `school` | text-[20px] |
| `Heart` | `favorite` | text-[20px] |
| `LogOut` | `logout` | text-[20px] |
| `User` | `person` | text-[20px] |
| `Menu` | `menu` | text-[20px] |
| `Plus` | `add` | text-[20px] |

---

## File-by-File Migration Guide

### Heroicons Files (5)

#### 1. `pages/SubscriptionPage.tsx`
```
Remove: import { CheckIcon, StarIcon, SparklesIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
```
| Usage | Current | Replace With |
|-------|---------|-------------|
| Back button | `<ArrowLeftIcon className="w-4 h-4" />` | `<span className="material-symbols-outlined text-[18px]">arrow_back</span>` |
| Current plan badge | `<StarIcon className="w-4 h-4" />` | `<span className="material-symbols-outlined text-[16px]">star</span>` |
| Popular badge | `<SparklesIcon className="w-3 h-3" />` | `<span className="material-symbols-outlined text-[14px]">auto_awesome</span>` |
| Feature checkmarks | `<CheckIcon className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />` | `<span className="material-symbols-outlined text-[18px] text-emerald-400">check_circle</span>` |

#### 2. `components/UserProfile.tsx`
```
Remove: import { PlusIcon, StarIcon, SparklesIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
```
| Usage | Current | Replace With |
|-------|---------|-------------|
| Add button | `<PlusIcon className="w-5 h-5" />` | `<span className="material-symbols-outlined text-[20px]">add</span>` |
| Favorite star | `<StarIcon className="w-5 h-5" />` | `<span className="material-symbols-outlined text-[20px]">star</span>` |
| Sparkles | `<SparklesIcon className="w-5 h-5" />` | `<span className="material-symbols-outlined text-[20px]">auto_awesome</span>` |
| Check mark | `<CheckIcon className="w-5 h-5" />` | `<span className="material-symbols-outlined text-[20px]">check</span>` |
| Close | `<XMarkIcon className="w-5 h-5" />` | `<span className="material-symbols-outlined text-[20px]">close</span>` |

#### 3. `components/BirthDataForm.tsx`
```
Remove: import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
```
| Usage | Current | Replace With |
|-------|---------|-------------|
| Validation error | `<ExclamationCircleIcon className="w-5 h-5 text-red-500" />` | `<span className="material-symbols-outlined text-[20px] text-red-400">error</span>` |

#### 4. `components/AuthenticationForms.tsx`
```
Remove: import { EyeIcon, EyeSlashIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
```
| Usage | Current | Replace With |
|-------|---------|-------------|
| Show password | `<EyeIcon className="w-5 h-5" />` | `<span className="material-symbols-outlined text-[20px]">visibility</span>` |
| Hide password | `<EyeSlashIcon className="w-5 h-5" />` | `<span className="material-symbols-outlined text-[20px]">visibility_off</span>` |
| Error icon | `<ExclamationCircleIcon className="w-5 h-5 text-red-500" />` | `<span className="material-symbols-outlined text-[20px] text-red-400">error</span>` |

#### 5. `components/TransitDashboard.tsx`
```
Remove: import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';
```
| Usage | Current | Replace With |
|-------|---------|-------------|
| Nav prev | `<ChevronLeftIcon className="w-5 h-5" />` | `<span className="material-symbols-outlined text-[20px]">chevron_left</span>` |
| Nav next | `<ChevronRightIcon className="w-5 h-5" />` | `<span className="material-symbols-outlined text-[20px]">chevron_right</span>` |
| Calendar | `<CalendarIcon className="w-5 h-5" />` | `<span className="material-symbols-outlined text-[20px]">calendar_month</span>` |
| Sun planet | `<SunIcon className="w-5 h-5" />` | `<span className="material-symbols-outlined text-[20px]">light_mode</span>` |
| Moon planet | `<MoonIcon className="w-5 h-5" />` | `<span className="material-symbols-outlined text-[20px]">dark_mode</span>` |

---

### Lucide Files (21)

#### 6. `components/AIInterpretationToggle.tsx`
Remove: `{ Sparkles, Info }` → `auto_awesome`, `info`

#### 7. `components/AIInterpretationDisplay.tsx`
Remove: `{ Sparkles, AlertCircle }` → `auto_awesome`, `error`

#### 8. `pages/SolarReturnsPage.tsx`
Remove: `{ Calendar, Settings, Share2, ArrowLeft }` → `calendar_month`, `settings`, `share`, `arrow_back`

#### 9. `components/BirthdaySharing.tsx`
Remove: `{ Gift, Mail, Link, Copy, Check, Share2, Calendar, Lock }` → `card_giftcard`, `mail`, `link`, `content_copy`, `check`, `share`, `calendar_month`, `lock`

#### 10. `components/CalendarExport.tsx`
Remove: `{ Download, Calendar, FileDown, CheckCircle, AlertCircle }` → `download`, `calendar_month`, `file_download`, `check_circle`, `error`

#### 11. `components/CalendarView.tsx`
Remove: `{ ChevronLeft, ChevronRight }` → `chevron_left`, `chevron_right`

#### 12. `components/UsageMeter.tsx`
Remove: `{ AlertTriangle, Crown, BarChart3 }` → `warning`, `workspace_premium`, `bar_chart`

#### 13. `components/ErrorFallback.tsx`
Remove: `{ AlertCircle, Home, RefreshCw }` → `error`, `home`, `refresh`

#### 14. `components/SolarReturnChart.tsx`
Remove: `{ Loader2, ZoomIn, ZoomOut, Download }` → `progress_activity` (keep spin), `zoom_in`, `zoom_out`, `download`

#### 15. `components/ReminderSettings.tsx`
Remove: `{ Bell, Mail, Smartphone, Check, Info }` → `notifications`, `mail`, `smartphone`, `check`, `info`

#### 16. `components/DailyWeatherModal.tsx`
Remove: `{ X, Moon, Star, Sparkles }` → `close`, `dark_mode`, `star`, `auto_awesome`

#### 17. `components/RelocationCalculator.tsx`
Remove: `{ MapPin, Globe, Search, ArrowRight, Info }` → `location_on`, `public`, `search`, `arrow_forward`, `info`

#### 18. `components/PushNotificationPermission.tsx`
Remove: `{ Bell, X }` → `notifications`, `close`

#### 19. `components/TransitCalendar.tsx`
Remove: `{ ChevronRight, Sun, Moon, Circle, Info }` → `chevron_right`, `light_mode`, `dark_mode`, `circle`, `info`

#### 20. `components/SolarReturnDashboard.tsx`
Remove: `{ Calendar, MapPin, Gift, TrendingUp }` → `calendar_month`, `location_on`, `card_giftcard`, `trending_up`

#### 21. `components/SolarReturnInterpretation.tsx`
Remove: `{ Star, Calendar, TrendingUp, AlertTriangle, Gift, Lightbulb, Download, Share2 }` → `star`, `calendar_month`, `trending_up`, `warning`, `card_giftcard`, `lightbulb`, `download`, `share`

#### 22. `components/ShareManagement.tsx`
Remove: `{ Copy, Eye, EyeOff, Lock, Trash2, Share2, Clock, BarChart2 }` → `content_copy`, `visibility`, `visibility_off`, `lock`, `delete`, `share`, `schedule`, `bar_chart`

#### 23. `components/report/PDFReportGenerator.tsx`
Remove: `{ CheckCircle, XCircle, AlertCircle, FileText, ChevronDown }` → `check_circle`, `cancel`, `error`, `description`, `expand_more`

#### 24. `components/ui/ConfirmModal.tsx`
Remove: `{ AlertTriangle, X, Trash2 }` → `warning`, `close`, `delete`

#### 25. `components/ui/ShareModal.tsx`
Remove: `{ Settings, ChevronDown, ChevronUp, Clock, X, Mail, MessageSquare, Share2, QrCode }` → `settings`, `expand_more`, `expand_less`, `schedule`, `close`, `mail`, `chat_bubble`, `share`, `qr_code_2`

#### 26. `components/ui/VideoModal.tsx`
Remove: `{ Settings, ChevronDown, ChevronUp, Clock, X }` → `settings`, `expand_more`, `expand_less`, `schedule`, `close`

#### 27. `pages/DailyBriefingPage.tsx` ⚠️ NEW — regression
Remove: `{ ArrowLeft, ArrowRight, Sparkles, Sun, Moon, Star, TrendingUp, Bell, Activity }` → `arrow_back`, `arrow_forward`, `auto_awesome`, `light_mode`, `dark_mode`, `star`, `trending_up`, `notifications`, `monitor_heart`

> **Note:** This page was created after the Sprint 4 audit. Uses correct cosmic theme tokens (`bg-[#141627]/70 backdrop-blur-md`) but imports lucide-react instead of Material Symbols.

#### 28. `pages/LoginPageNew.tsx`
Remove: `{ Sparkles, AlertCircle, Mail, Eye, EyeOff, Lock, RefreshCw, ArrowRight }` → `auto_awesome`, `error`, `mail`, `visibility`, `visibility_off`, `lock`, `refresh`, `arrow_forward`

#### 29. `pages/LandingPage.tsx`
Remove: `{ CheckCircle, Sparkles, Menu, X, Star, ArrowLeft, ArrowRight, Brain, Calendar, Check, Clock, Pentagon, PlayCircle, Quote, Sun }` → `check_circle`, `auto_awesome`, `menu`, `close`, `star`, `arrow_back`, `arrow_forward`, `psychology`, `calendar_month`, `check`, `schedule`, `change_history`, `play_circle`, `format_quote`, `light_mode`

#### 30. `components/AppLayout.tsx` ⚠️ HIGH IMPACT — sidebar/nav shell
Remove: `{ Sparkles, Plus, Bell, ChevronDown, User, Settings, LogOut, X, LayoutDashboard, Calendar, Heart, RefreshCw, GraduationCap, Sun, Moon, Star, Home, Menu }` → `auto_awesome`, `add`, `notifications`, `expand_more`, `person`, `settings`, `logout`, `close`, `dashboard`, `calendar_month`, `favorite`, `refresh`, `school`, `light_mode`, `dark_mode`, `star`, `home`, `menu`

> **Note:** AppLayout is the authenticated shell — every page uses it. Migrate carefully and verify visually across all pages.

#### 31. `components/chart/PinterestCard.tsx`
Remove: `{ Sparkles }` → `auto_awesome`

#### 32. `components/chart/LinkedInCard.tsx`
Remove: `{ Sparkles }` → `auto_awesome`

#### 33. `components/chart/InstagramStoryCard.tsx`
Remove: `{ Sparkles }` → `auto_awesome`

#### 34. `components/chart/TikTokCard.tsx`
Remove: `{ Sparkles }` → `auto_awesome`

#### 35. `components/report/MonthlyTransitReportView.tsx`
Remove: `{ ArrowLeft, Download, Printer, Share2 }` → `arrow_back`, `download`, `print`, `share`

---

## Size Convention

Lucide uses `className="w-X h-Y"` sizing. Material Symbols uses `text-[Npx]` sizing.

| Lucide `w/h` | Material Symbols `text-` |
|---------------|-------------------------|
| `w-3 h-3` | `text-[12px]` |
| `w-4 h-4` | `text-[16px]` |
| `w-5 h-5` | `text-[20px]` |
| `w-6 h-6` | `text-[24px]` |
| `w-8 h-8` | `text-[32px]` |

Design system standard sizes:
- Sidebar icons: `text-[20px]`
- Button icons: `text-[18px]`
- Mobile nav icons: `text-[22px]`
- Inline icons: `text-[16px]`
- Status/alert icons: `text-[20px]`

---

## Replacement Pattern

### Before (Lucide example)
```tsx
import { Download, Share2 } from 'lucide-react';

<button>
  <Download className="w-4 h-4" />
  Download
</button>
```

### After (Material Symbols)
```tsx
// No import needed — Material Symbols loaded via Google Fonts in index.html

<button>
  <span className="material-symbols-outlined text-[18px]">download</span>
  Download
</button>
```

---

## Loader2 Special Case

Lucide's `Loader2` is commonly used as a spinner with `className="animate-spin"`. Replace with:
```tsx
// Before
<Loader2 className="w-5 h-5 animate-spin" />

// After
<span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
```

---

## Implementation Checklist

### Phase 1: Remove heroicons (5 files)
- [ ] `pages/SubscriptionPage.tsx`
- [ ] `components/UserProfile.tsx`
- [ ] `components/BirthDataForm.tsx`
- [ ] `components/AuthenticationForms.tsx`
- [ ] `components/TransitDashboard.tsx`
- [ ] Remove `@heroicons/react` from `package.json`

### Phase 2: Migrate lucide (31 files)
- [ ] `components/AIInterpretationToggle.tsx`
- [ ] `components/AIInterpretationDisplay.tsx`
- [ ] `pages/SolarReturnsPage.tsx`
- [ ] `components/BirthdaySharing.tsx`
- [ ] `components/CalendarExport.tsx`
- [ ] `components/CalendarView.tsx`
- [ ] `components/UsageMeter.tsx`
- [ ] `components/ErrorFallback.tsx`
- [ ] `components/SolarReturnChart.tsx`
- [ ] `components/ReminderSettings.tsx`
- [ ] `components/DailyWeatherModal.tsx`
- [ ] `components/RelocationCalculator.tsx`
- [ ] `components/PushNotificationPermission.tsx`
- [ ] `components/TransitCalendar.tsx`
- [ ] `components/SolarReturnDashboard.tsx`
- [ ] `components/SolarReturnInterpretation.tsx`
- [ ] `components/ShareManagement.tsx`
- [ ] `components/report/PDFReportGenerator.tsx`
- [ ] `components/ui/ConfirmModal.tsx`
- [ ] `components/ui/ShareModal.tsx`
- [ ] `components/ui/VideoModal.tsx`
- [ ] `pages/DailyBriefingPage.tsx`
- [ ] `pages/LoginPageNew.tsx`
- [ ] `pages/LandingPage.tsx`
- [ ] `components/AppLayout.tsx`
- [ ] `components/chart/PinterestCard.tsx`
- [ ] `components/chart/LinkedInCard.tsx`
- [ ] `components/chart/InstagramStoryCard.tsx`
- [ ] `components/chart/TikTokCard.tsx`
- [ ] `components/report/MonthlyTransitReportView.tsx`
- [ ] Remove `lucide-react` from `package.json`

### Phase 3: Cleanup
- [ ] `npm uninstall @heroicons/react lucide-react`
- [ ] Verify build passes with `npm run build`
- [ ] Visual QA: spot-check each modified component
- [ ] Update any test snapshots that reference old icon components

---

## Estimated Bundle Savings

- `@heroicons/react/24/outline`: ~45KB (tree-shaken to ~8KB with current usage)
- `lucide-react`: ~180KB (tree-shaken to ~25KB with current usage)
- Material Symbols Outlined: loaded via Google Fonts CDN (cached, 0KB from bundle)

**Net bundle reduction: ~33KB** of JS replaced with a font already loaded by the design system.
