# Google Calendar Export — UX Design Spec

**Date:** 2026-04-05
**Designer:** UX Designer 2
**Feature Spec:** FEATURE_SPEC_GOOGLE_CALENDAR_EXPORT.md
**Priority:** P1

---

## 1. UX Surfaces Overview

Three UI surfaces needed:

| Surface | Location | Purpose |
|---------|----------|---------|
| Calendar Integration Settings | ProfileSettingsPage → new "Calendar" tab | Connect/disconnect Google, sync settings |
| Export to Google Modal | CalendarPage → triggered from calendar toolbar | Select events, target calendar, export |
| Connection Status Banner | CalendarPage → inline below toolbar | Shows sync status, last synced time |

### Entry Points

1. **CalendarPage** → "Export" dropdown button → "Send to Google Calendar" option
2. **ProfileSettingsPage** → "Calendar" tab in settings navigation
3. **CalendarPage** → Sync status banner (when connected)

---

## 2. Calendar Integration Settings (ProfileSettingsPage Tab)

### 2.1 Tab Configuration

Add a 5th tab to ProfileSettingsPage tabs array:

```tsx
{ id: 'calendar', label: 'Calendar', icon: 'calendar_month' }
```

Order: Personal Info → Account → Subscription → Appearance → **Calendar**

### 2.2 Connected State — Google Account Card

When Google Calendar is connected, show:

```
┌─────────────────────────────────────────────────────────┐
│  [calendar_month]  Calendar Integration                 │
│─────────────────────────────────────────────────────────│
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Google Calendar                        Connected │  │
│  │                                                   │  │
│  │  [Google G logo]  user@gmail.com                  │  │
│  │                                                   │  │
│  │  Syncing to: "AstroVerse Events" calendar         │  │
│  │  Last synced: 2 minutes ago                       │  │
│  │                                                   │  │
│  │  [settings]          [Disconnect]                 │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  Sync Settings                                          │
│  ─────────────                                          │
│                                                         │
│  [Toggle] Auto-sync events                             │
│           Automatically export new events to Google    │
│                                                         │
│  [Toggle] Sync personal transits                       │
│           Include natal chart-based transit events     │
│                                                         │
│  [Toggle] Sync retrograde alerts                       │
│           Mercury, Venus, Mars retrograde periods      │
│                                                         │
│  [Toggle] Sync moon phases                             │
│           New moons, full moons, eclipses              │
│                                                         │
│  Sync frequency                                         │
│  ┌─────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ Real-   │ │  Hourly      │ │  Daily       │        │
│  │ time    │ │  (selected)  │ │              │        │
│  └─────────┘ └──────────────┘ └──────────────┘        │
│                                                         │
│  Event Defaults                                         │
│  ──────────────                                         │
│                                                         │
│  Reminder:    [15 minutes ▾]                           │
│  Color:       [Cosmic Purple ▾]                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 2.3 Disconnected State — Connection Card

When Google Calendar is not connected:

```
┌─────────────────────────────────────────────────────────┐
│  [calendar_month]  Calendar Integration                 │
│─────────────────────────────────────────────────────────│
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │                                                   │  │
│  │        [calendar_month icon, 48px]                │  │
│  │        muted, with ambient glow bg                │  │
│  │                                                   │  │
│  │     Connect Google Calendar                       │  │
│  │     Sync your astrological events directly to     │  │
│  │     your Google Calendar for seamless planning.   │  │
│  │                                                   │  │
│  │     Benefits:                                     │  │
│  │     ✓ Auto-sync transit events                    │  │
│  │     ✓ Moon phase & retrograde reminders           │  │
│  │     ✓ Custom event colors                         │  │
│  │                                                   │  │
│  │     [Connect Google Calendar]                     │  │
│  │      (bg-white text-black button with G logo)     │  │
│  │                                                   │  │
│  │  [info] Your data is encrypted. We only request   │  │
│  │  calendar write permissions.                      │  │
│  │                                                   │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ────────────── or ──────────────                       │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │  [file_download]  Export as iCal                  │  │
│  │  Download a .ics file to import into any calendar │  │
│  │  app manually.                                    │  │
│  │                                    [Export iCal]  │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 2.4 Disconnect Confirmation

Modal dialog when user clicks "Disconnect":

```
┌──────────────────────────────────────────────────┐
│                                                  │
│  [link_off]                                      │
│  Disconnect Google Calendar?                     │
│                                                  │
│  This will:                                      │
│  • Stop syncing new events                       │
│  • Keep previously exported events in Google     │
│  • Require re-authorization to reconnect         │
│                                                  │
│  [Cancel]                    [Disconnect]        │
│                               (danger variant)   │
└──────────────────────────────────────────────────┘
```

Uses the existing `ConfirmModal` component pattern.

---

## 3. Export to Google Modal (CalendarPage)

### 3.1 Trigger

From the CalendarPage toolbar, an "Export" button that opens a dropdown:

```
┌──────────────────────────────────────────┐
│  [file_download]  Export        [▾]      │
│──────────────────────────────────────────│
│  [download]      Download .ics file      │
│  [send]          Send to Google Calendar │  ← only when connected
│  [share]         Share calendar link     │
└──────────────────────────────────────────┘
```

### 3.2 Export Modal Layout

When "Send to Google Calendar" is clicked:

```
┌─────────────────────────────────────────────────────────┐
│  [send]  Export to Google Calendar              [close] │
│─────────────────────────────────────────────────────────│
│                                                         │
│  Step 1 of 2: Select Events                             │
│  ─────────────────────────────                          │
│                                                         │
│  Date Range                                             │
│  ┌──────────┐ ┌──────────────┐ ┌────────────┐          │
│  │ This     │ │ This Quarter │ │ Custom     │          │
│  │ Month *  │ │              │ │            │          │
│  └──────────┘ └──────────────┘ └────────────┘          │
│  * = selected                                           │
│                                                         │
│  Custom range (only when Custom selected):              │
│  [From: 2026-04-01]  [To: 2026-04-30]                  │
│                                                         │
│  Event Types                                            │
│  ────────────                                           │
│  [✓] Moon phases (New Moon, Full Moon, Eclipses)       │
│  [✓] Retrograde periods                                 │
│  [✓] Major transits (Saturn, Jupiter, Pluto)           │
│  [✓] Personal transits (based on your natal chart)     │
│  [ ] Minor aspects                                      │
│                                                         │
│  12 events selected                                     │
│                                                         │
│                              [Cancel]  [Continue →]     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

Step 2:

```
┌─────────────────────────────────────────────────────────┐
│  [send]  Export to Google Calendar              [close] │
│─────────────────────────────────────────────────────────│
│                                                         │
│  Step 2 of 2: Configure                                 │
│  ─────────────────────                                  │
│                                                         │
│  Target Calendar                                        │
│  ┌─────────────────────────────────────────────────┐    │
│  │  [calendar_month]  AstroVerse Events      [▾]  │    │
│  └─────────────────────────────────────────────────┘    │
│  Dropdown lists user's Google Calendars                 │
│                                                         │
│  Event Color                                            │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐             │
│  │ ●   │ │ ●   │ │ ●   │ │ ●   │ │ ●   │             │
│  │Cos- │ │Moon │ │Nep- │ │Solar│ │Cus- │             │
│  │mic  │ │Blue │ │tune │ │Gold │ │tom  │             │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘             │
│  Cosmic Purple = selected (matches bg-primary)          │
│                                                         │
│  Options                                                │
│  [✓] Add reminder 15 minutes before each event         │
│  [✓] Include event description with astro details      │
│  [ ] Mark as "busy" (free by default)                  │
│                                                         │
│  ─────────────────────────────────────                  │
│  Summary: 12 events → "AstroVerse Events" calendar     │
│                                                         │
│                    [← Back]  [Export 12 Events]         │
│                               (primary button)          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 3.3 Export Progress States

**Exporting:**
```
┌───────────────────────────────────────────────────┐
│                                                   │
│        [animate-spin progress_activity]           │
│                                                   │
│        Exporting 12 events...                     │
│        8 of 12 complete                           │
│                                                   │
│        ████████████░░░░  67%                      │
│                                                   │
└───────────────────────────────────────────────────┘
```

**Success:**
```
┌───────────────────────────────────────────────────┐
│                                                   │
│  [check_circle]  12 events exported!              │
│                                                   │
│  Events have been added to your "AstroVerse       │
│  Events" Google Calendar.                         │
│                                                   │
│  [Open Google Calendar]  [Close]                  │
│                                                   │
│  [Toggle] Set up auto-sync to keep updated       │
│                                                   │
└───────────────────────────────────────────────────┘
```

**Error:**
```
┌───────────────────────────────────────────────────┐
│                                                   │
│  [error]  Export failed                           │
│                                                   │
│  Google Calendar returned an authentication       │
│  error. Your connection may have expired.         │
│                                                   │
│  [Reconnect Google Calendar]  [Cancel]            │
│                                                   │
└───────────────────────────────────────────────────┘
```

---

## 4. Sync Status Banner (CalendarPage)

When Google Calendar is connected, show a subtle banner below the calendar toolbar:

```
┌─────────────────────────────────────────────────────────┐
│  [sync]  Synced with Google Calendar  •  2 min ago     │
│                                                          │
│  Auto-sync enabled. Events update hourly.  [Settings]   │
└─────────────────────────────────────────────────────────┘

Background: bg-primary/5 border border-primary/20
Text: text-slate-300
Link: text-primary hover:underline
```

When sync is stale or errored:
```
┌─────────────────────────────────────────────────────────┐
│  [sync_problem]  Sync issue  •  Last synced 3h ago     │
│                                                          │
│  Could not reach Google Calendar.  [Retry]  [Settings]  │
└─────────────────────────────────────────────────────────┘

Background: bg-amber-500/10 border border-amber-500/20
Text: text-amber-300
```

---

## 5. OAuth Redirect States

### 5.1 Connecting State (shown during OAuth redirect)

When user clicks "Connect Google Calendar", before redirect:

```
┌───────────────────────────────────────────────────┐
│                                                   │
│     [animate-spin progress_activity]              │
│                                                   │
│     Redirecting to Google...                      │
│                                                   │
│     You'll be asked to grant calendar             │
│     permissions to AstroVerse.                    │
│                                                   │
└───────────────────────────────────────────────────┘
```

### 5.2 OAuth Callback State (after redirect back)

**Success callback** (`?status=connected`):
Replace the connecting state with a success banner in ProfileSettingsPage:

```
┌─────────────────────────────────────────────────────────┐
│  [check_circle]  Google Calendar connected!             │
│  Your astrological events will sync to "Primary"        │
│  calendar. Configure sync settings below.               │
└─────────────────────────────────────────────────────────┘

Background: bg-emerald-500/10 border border-emerald-500/20
Text: text-emerald-300
Auto-dismiss after 8 seconds
```

**Error callback** (`?status=error&message=...`):
```
┌─────────────────────────────────────────────────────────┐
│  [error]  Connection failed                             │
│  Google authorization was denied or expired.            │
│  Please try again.                                      │
│                                          [Try Again]    │
└─────────────────────────────────────────────────────────┘

Background: bg-red-500/10 border border-red-500/20
Text: text-red-300
```

**User denied callback** (`?status=denied`):
```
┌─────────────────────────────────────────────────────────┐
│  [lock]  Permission denied                              │
│  AstroVerse needs calendar write access to export       │
│  events. You can connect anytime from settings.         │
│                                          [Dismiss]      │
└─────────────────────────────────────────────────────────┘

Background: bg-amber-500/10 border border-amber-500/20
Text: text-amber-300
```

---

## 6. Event Color Palette

Color options for Google Calendar events:

| Name | Value | Usage |
|------|-------|-------|
| Cosmic Purple | `#6b3de1` (bg-primary) | Default, matches brand |
| Moon Blue | `#38bdf8` (sky-400) | Moon phase events |
| Neptune Teal | `#2dd4bf` (teal-400) | Water sign transits |
| Solar Gold | `#fbbf24` (amber-400) | Sun sign / solar events |
| Custom | User picks from Google's palette | Advanced option |

---

## 7. Design Token Reference

All surfaces use the cosmic dark theme:

| Element | Token |
|---------|-------|
| Card container | `bg-[#141627]/70 backdrop-blur-md rounded-2xl border border-white/10` |
| Page background | `bg-[#0B0D17]` |
| Heading text | `text-white font-bold` |
| Body text | `text-slate-300` |
| Muted text | `text-slate-400` |
| Primary button | `bg-primary hover:bg-primary/90 text-white` |
| Secondary button | `bg-white/5 hover:bg-white/10 text-white border border-white/10` |
| Danger button | `bg-red-500/20 hover:bg-red-500/30 text-red-400` |
| Success banner | `bg-emerald-500/10 border border-emerald-500/20 text-emerald-300` |
| Error banner | `bg-red-500/10 border border-red-500/20 text-red-300` |
| Warning banner | `bg-amber-500/10 border border-amber-500/20 text-amber-300` |
| Toggle active | `bg-primary` |
| Toggle inactive | `bg-slate-600` |
| Select/dropdown | `bg-white/5 border border-white/10 text-white` |
| Divider | `border-t border-white/5` |
| Google button | `bg-white hover:bg-gray-100 text-black font-medium` |
| Input field | `bg-white/5 border border-white/10 text-white focus:border-primary` |
| Progress bar track | `bg-white/5` |
| Progress bar fill | `bg-primary shadow-[0_0_10px_rgba(107,61,225,0.5)]` |

---

## 8. Component Dependencies

| Existing Component | Reuse For |
|--------------------|-----------|
| `components/ui/Button` | All buttons (primary, secondary, danger variants) |
| `components/ui/Toggle` | All toggle switches in sync settings |
| `components/ui/ConfirmModal` | Disconnect confirmation |
| `components/CalendarExport.tsx` | Refactor to extract iCal export logic, update to cosmic theme + Material Symbols |
| `pages/ProfileSettingsPage.tsx` | Add "Calendar" tab with integration settings |

---

## 9. Accessibility Notes

- All toggles use `role="switch"` with `aria-checked`
- Status banners use `role="status"` with `aria-live="polite"`
- Error banners use `role="alert"` with `aria-live="assertive"`
- Export progress uses `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- Google Connect button has `aria-label="Connect Google Calendar"`
- Modal follows focus trap pattern from existing `ConfirmModal`
- Color palette selection includes text labels, not color-only indicators
- OAuth redirect states handled via URL params with accessible announcements

---

## 10. Mobile Adaptations

### Calendar Settings (ProfileSettingsPage)
- Full-width cards, no column layout
- Sync frequency selector stacks vertically on small screens
- Toggle helper text collapses below toggle on narrow viewports

### Export Modal
- Full-screen on mobile (not centered overlay)
- Bottom-sheet style with drag handle
- Step indicator persists at top
- Event type checkboxes in 2-column grid on mobile
- "Export N Events" button fixed at bottom

### Sync Banner
- Single line on mobile, truncates last synced time
- "Settings" link moves to same line as sync status

---

## 11. States Summary

| State | UI |
|-------|----|
| Not connected | Connection card with Google button + iCal fallback |
| Connecting (OAuth) | Loading spinner + "Redirecting to Google..." |
| Connected (initial) | Success banner + sync settings card |
| Connected (idle) | Status card showing account + sync settings |
| Exporting | Progress modal with event count |
| Export success | Success modal with Google Calendar link |
| Export error (auth) | Error modal with reconnect button |
| Export error (API) | Error modal with retry button |
| Sync stale | Warning banner on CalendarPage |
| Disconnecting | ConfirmModal → success state |
| Disconnected | Returns to "Not connected" state |

---

## 12. Implementation Notes for Frontend Engineer

1. **CalendarExport.tsx refactor**: The existing component uses generic light theme and lucide-react. Needs full retheme to cosmic dark + Material Symbols during this feature's implementation.

2. **ProfileSettingsPage tab**: Add `calendar` tab type. Render the integration card in the left column (2-col span). Right column shows the existing Notifications and Birth Data cards.

3. **Google OAuth button**: Use a white-background button (standard Google brand pattern) even in the dark theme. This is a recognized exception — users expect the Google login button to look like Google's design.

4. **Calendar service**: Add `googleCalendarService` methods to `services/calendar.service.ts` for `connect()`, `disconnect()`, `getCalendars()`, `exportEvents()`, `getSyncStatus()`.

5. **URL params**: Handle `?cal_status=connected|error|denied` on ProfileSettingsPage mount (same pattern as SubscriptionPage's `?status=success|cancel`).

6. **Polling**: When auto-sync is enabled, poll `/api/calendar/google/sync-status` every hour (matching the sync frequency setting).
