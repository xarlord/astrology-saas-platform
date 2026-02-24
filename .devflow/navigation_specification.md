# Navigation Specification Document

## Overview
This document defines the navigation architecture for all 18 UI pages in AstroVerse, ensuring users can navigate seamlessly between all features.

---

## Global Navigation Structure

### Primary Navigation Bar (Authenticated Users)
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🔮 AstroVerse │ Dashboard │ Charts │ Calendar │ Transits │ Learn │ 🔔 👤   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Secondary Navigation (Context-Sensitive)
Each page has context-sensitive navigation based on user state and current feature.

---

## Page Navigation Matrix

| Page ID | Page Name | Primary Nav Item | Secondary Nav | Back Nav | Related Pages |
|---------|-----------|------------------|---------------|----------|---------------|
| 01 | Landing Page | None (Public) | Features, Pricing, Testimonials | N/A | Login, Register |
| 02 | Login Page | None (Public) | Forgot Password, Social Login | Landing | Dashboard, Register |
| 03 | Registration Page | None (Public) | Terms, Privacy, Social | Landing | Dashboard, Login |
| 04 | Dashboard | Dashboard | Quick Actions | N/A | Charts, Calendar, Transits |
| 05 | Calendar Page | Calendar | View Toggle, Month Nav | Dashboard | Dashboard, Transits |
| 06 | Synastry Compatibility | Synastry | Person Selectors | Dashboard | Charts, Dashboard |
| 07 | Profile Settings | Profile | Tabs (Personal, Birth, Sub, Notif, Privacy) | Dashboard | Dashboard |
| 08 | Transit Forecast | Transits | Date Range Toggle | Dashboard | Calendar, Dashboard |
| 09 | Lunar Returns | Lunar Returns | Past Cycles, Share | Dashboard | Solar Returns, Transits |
| 10 | Natal Chart Detail | Charts | Tabs, Actions | Charts Gallery | Dashboard, Reports |
| 11 | Chart Creation Wizard | Charts | Step Indicator | Charts Gallery | Dashboard, Chart Detail |
| 12 | Solar Returns | Solar Returns | Year Selector | Dashboard | Lunar Returns, Transits |
| 13 | 404 Page | None | Home, Dashboard | Browser | Dashboard, Home |
| 14 | Detailed Natal Report | Reports | Tabs, Download | Chart Detail | Chart Detail, Dashboard |
| 15 | Saved Charts Gallery | Charts | Folders, Search, Sort | Dashboard | Chart Detail, Create |
| 16 | Learning Center | Learn | Categories, Paths | Dashboard | Course Detail |
| 17 | Solar Return Annual Report | Solar Returns | Actions, Compare | Solar Returns | Solar Returns, Dashboard |
| 18 | New Chart Creation Flow | Charts | Step Wizard | Charts Gallery | Chart Detail, Dashboard |

---

## Detailed Navigation Per Page

### 01 - Landing Page
**Navigation Type:** Public (No auth required)

```
Navigation Bar:
├── Logo (→ Home/Top)
├── Features (→ #features section)
├── Testimonials (→ #testimonials section)
├── Pricing (→ #pricing section)
├── [Sign In] button → Login Page (02)
└── [Get Started] button → Registration Page (03)

Footer Navigation:
├── Product Links
│   ├── Features
│   ├── Pricing
│   └── API
├── Company Links
│   ├── About
│   ├── Blog
│   └── Careers
└── Social Links (External)
```

---

### 02 - Login Page
**Navigation Type:** Public (No auth required)

```
Page Navigation:
├── Logo (→ Landing Page 01)
├── [Forgot Password?] link → Forgot Password Page
├── [Sign up for free] link → Registration Page (03)
├── [Google] button → OAuth Flow
├── [Apple] button → OAuth Flow
└── Form Submit → Dashboard (04) on success
```

---

### 03 - Registration Page
**Navigation Type:** Public (No auth required)

```
Page Navigation:
├── Logo (→ Landing Page 01)
├── [Help?] link → Help/FAQ
├── [Terms of Service] link → Terms Page
├── [Privacy Policy] link → Privacy Page
├── [Sign in] link → Login Page (02)
├── [Google] button → OAuth Flow
├── [Apple] button → OAuth Flow
└── Form Submit → Dashboard (04) on success
```

---

### 04 - Dashboard
**Navigation Type:** Authenticated

```
Global Navigation:
├── Logo (→ Dashboard 04)
├── [Dashboard] pill (active)
├── [Charts] pill → Saved Charts Gallery (15)
├── [Transits] pill → Transit Forecast (08)
├── [Calendar] pill → Calendar Page (05)
├── [Synastry] pill → Synastry Compatibility (06)
├── 🔔 Notification Bell
├── [+ New Chart] button → Chart Creation (11 or 18)
└── 👤 Profile Avatar → Profile Settings (07)

Page Navigation:
├── Quick Actions Grid:
│   ├── [Calendar] → Calendar Page (05)
│   ├── [Synastry] → Synastry Compatibility (06)
│   ├── [Lunar Returns] → Lunar Returns (09)
│   └── [Solar Returns] → Solar Returns (12)
├── [View All Transits] → Transit Forecast (08)
├── [View Ephemeris] → Ephemeris Page
├── Chart Cards:
│   ├── [View] → Chart Detail (10)
│   └── [Edit] → Chart Edit
└── [Create New Chart] → Chart Creation (11)
```

---

### 05 - Calendar Page
**Navigation Type:** Authenticated

```
Global Navigation:
├── Logo (→ Dashboard 04)
├── [Dashboard] pill → Dashboard (04)
├── [Calendar] pill (active)
├── [Horoscopes] pill → Horoscopes
├── [Tarot] pill → Tarot
├── [Reports] pill → Reports
├── 🔔 Notification Bell
└── 👤 Profile Avatar → Profile Settings (07)

Page Navigation:
├── [Today] button → Jump to today
├── [<] [>] Month navigation
├── View Toggle: [Month] [Week] [List]
├── Event Legend (Info display)
├── [Add to Calendar] button
├── [Share] button
├── [Add Personal Event] button
└── [View All Events] link
```

---

### 06 - Synastry Compatibility
**Navigation Type:** Authenticated

```
Global Navigation:
├── Logo (→ Dashboard 04)
├── [Horoscope] link
├── [Birth Chart] link → Saved Charts (15)
├── [Synastry] link (active)
├── [Transits] link → Transit Forecast (08)
├── [Learn] link → Learning Center (16)
├── [Upgrade Pro] button
└── 👤 Profile Avatar → Profile Settings (07)

Page Navigation:
├── Person 1 Selector → Chart Picker Modal
│   └── [Edit] → Select different chart
├── Person 2 Selector → Chart Picker Modal
│   └── [Edit] → Select different chart
├── [Compare] button → Generate comparison
├── [View Details] → Composite Chart View
├── [Generate Full Report] → Detailed Report
├── [Share] button → Share results
└── [Favorite] button → Save to favorites
```

---

### 07 - Profile Settings
**Navigation Type:** Authenticated

```
Global Navigation:
├── Logo (→ Dashboard 04)
├── [Dashboard] link → Dashboard (04)
├── 🔍 Search Bar
├── 🔔 Notification Bell
└── 👤 Profile Avatar (active)

Page Navigation (Tab-based):
├── Tab: [Personal Info] (active)
├── Tab: [Birth Data] → Birth data form
├── Tab: [Subscription] → Subscription management
├── Tab: [Notifications] → Notification preferences
├── Tab: [Privacy] → Privacy settings
├── [Edit Profile] button
├── [Manage Subscription] button
└── [Save Changes] button
```

---

### 08 - Transit Forecast
**Navigation Type:** Authenticated

```
Global Navigation:
├── Logo (→ Dashboard 04)
├── [Dashboard] link → Dashboard (04)
├── [Transit Forecast] link (active)
├── [Natal Chart] link → Saved Charts (15)
├── [Synastry] link → Synastry (06)
├── [Upgrade] button
└── 👤 Profile Avatar → Profile Settings (07)

Page Navigation:
├── Date Range Toggle: [Today] [This Week] [This Month]
├── Calendar Navigation: [<] [>]
├── [View Full Report] button → Detailed Report
├── Event Cards → Click for details
└── [View Ephemeris] link
```

---

### 09 - Lunar Returns
**Navigation Type:** Authenticated

```
Global Navigation:
├── Logo (→ Dashboard 04)
├── [Dashboard] link → Dashboard (04)
├── [Lunar Returns] link (active)
├── [Transits] link → Transit Forecast (08)
├── [Community] link → Community
├── 🔔 Notification Bell
└── 👤 Profile Avatar → Profile Settings (07)

Page Navigation:
├── [Past Cycles] button → History modal
├── [Share Chart] button → Share options
├── [View Ritual Guide] button → Rituals page
├── Past Returns Timeline → Click to view
├── [Solar Returns] link → Solar Returns (12)
└── Journal Prompts → Save entries
```

---

### 10 - Natal Chart Detail
**Navigation Type:** Authenticated

```
Global Navigation:
├── Logo (→ Dashboard 04)
├── [Dashboard] link → Dashboard (04)
├── [Charts] link → Saved Charts (15)
├── [Transits] link → Transit Forecast (08)
├── [Horoscopes] link → Horoscopes
├── 🔔 Notification Bell
└── 👤 Profile Avatar → Profile Settings (07)

Page Navigation:
├── Breadcrumb: Dashboard > Charts > [Chart Name]
├── [Edit] button → Chart Edit
├── [Download PDF] button → Download
├── [Share] button → Share options
├── [View Transits] button → Transit Forecast (08)
├── Tab Navigation:
│   ├── [Personality Analysis] (active)
│   ├── [House Interpretations]
│   ├── [Aspects Detail]
│   └── [Download Report] → Detailed Report (14)
├── Planetary Table → Click for details
├── Aspect List → Click for interpretation
└── Big Three Cards → Click for details
```

---

### 11 - Chart Creation Wizard
**Navigation Type:** Authenticated

```
Global Navigation:
├── Logo (→ Dashboard 04)
├── [Help] button → Help/FAQ
└── 👤 Profile section

Page Navigation:
├── Step Indicator:
│   ├── Step 1: Birth Details (clickable if completed)
│   ├── Step 2: Location (clickable if Step 1 done)
│   └── Step 3: Options (clickable if Step 2 done)
├── [Cancel] button → Saved Charts (15) or Dashboard (04)
├── [Back] button → Previous step
├── [Next: Location] button → Next step
└── Final [Generate Chart] → Chart Detail (10)
```

---

### 12 - Solar Returns
**Navigation Type:** Authenticated

```
Global Navigation:
├── Logo (→ Dashboard 04)
├── [Dashboard] link → Dashboard (04)
├── [Solar Returns] link (active)
├── [Transits] link → Transit Forecast (08)
├── [Synastry] link → Synastry (06)
├── 🔔 Notification Bell
└── 👤 Profile Avatar → Profile Settings (07)

Page Navigation:
├── Year Tabs: [2024] [2025] [2026 active] [2027]
├── [Set Reminder] button
├── [Compare Years] button → Comparison view
├── [Download Report] button → Annual Report (17)
├── [View All 12 Dates] link
├── [Lunar Returns] link → Lunar Returns (09)
└── Theme Cards → Click for details
```

---

### 13 - 404 Page
**Navigation Type:** Universal (Any state)

```
Page Navigation:
├── [Return Home] button → Landing Page (01)
└── [Go to Dashboard] button → Dashboard (04)
```

---

### 14 - Detailed Natal Report
**Navigation Type:** Authenticated

```
Global Navigation:
├── Logo (→ Dashboard 04)
├── [Dashboard] link → Dashboard (04)
├── [Natal Reports] link (active)
├── [Compatibility] link → Synastry (06)
├── [Transits] link → Transit Forecast (08)
├── 🔔 Notification Bell
└── 👤 Profile Avatar → Profile Settings (07)

Page Navigation:
├── Tab Navigation:
│   ├── [Summary] (active)
│   ├── [Planets]
│   ├── [Houses]
│   └── [Aspects]
├── [Download PDF Report] button
├── [Order Printed Chart] button
├── [Share Report] button
├── [Learn More] link → Synastry Guide (06)
└── [← Back to Chart] → Chart Detail (10)
```

---

### 15 - Saved Charts Gallery
**Navigation Type:** Authenticated

```
Global Navigation:
├── Logo (→ Dashboard 04)
├── [Dashboard] link → Dashboard (04)
├── [Charts] link (active)
├── [Transits] link → Transit Forecast (08)
├── 🔔 Notification Bell
└── 👤 Profile Avatar → Profile Settings (07)

Page Navigation:
├── Sidebar:
│   ├── [All Charts] filter
│   ├── [Personal] filter
│   ├── [Clients] filter
│   ├── [Relationships] filter
│   └── [Favorites] filter
├── [+ Add New Chart] button → Chart Creation (11/18)
├── Search Input
├── Sort Dropdown: [Date Added] [A-Z] [Sign]
├── View Toggle: [Grid] [List]
├── Chart Cards:
│   ├── [View] → Chart Detail (10)
│   ├── [Edit] → Chart Edit
│   ├── [Share] → Share modal
│   └── [Delete] → Confirm deletion
└── [Create New Chart] placeholder card → Chart Creation (11)
```

---

### 16 - Learning Center
**Navigation Type:** Authenticated

```
Global Navigation:
├── Logo (→ Dashboard 04)
├── 🔍 Search Bar (global)
├── [Dashboard] link → Dashboard (04)
├── [Learn] link (active)
├── 🔔 Notification Bell
└── 👤 Profile Avatar → Profile Settings (07)

Page Navigation:
├── [Resume Learning] button → Continue course
├── [View Syllabus] button → Course outline
├── Learning Path Cards → Click to start/continue
├── Knowledge Base Cards:
│   └── [Browse X more] → Category page
├── Latest Lessons → Click to view
├── [View All Lessons] button
├── [Enter Student Forum] button → Community
└── Footer Links:
    ├── Resources → Help docs
    └── Company → About
```

---

### 17 - Solar Return Annual Report
**Navigation Type:** Authenticated

```
Global Navigation:
├── Logo (→ Dashboard 04)
├── [Dashboard] link → Dashboard (04)
├── [Solar Returns] link → Solar Returns (12)
├── 🔔 Notification Bell
└── 👤 Profile Avatar → Profile Settings (07)

Page Navigation:
├── [View Archive] button → Previous years
├── [Download PDF] button
├── [Read Full Executive Summary] link
├── Timeline Nodes → Click for details
├── Accordion Sections → Expand/collapse
├── [Compare with Previous Year] link
├── [Add Power Dates to Calendar] button
├── [Book Consultation] button
└── [← Back to Solar Returns] → Solar Returns (12)
```

---

### 18 - New Chart Creation Flow
**Navigation Type:** Authenticated

```
Global Navigation:
├── Logo (→ Dashboard 04)
├── [Help] button → Help/FAQ
└── 👤 Profile Avatar → Profile Settings (07)

Page Navigation:
├── Progress Stepper:
│   ├── Step 1: Personal (clickable if allowed)
│   ├── Step 2: Birth Data (clickable if Step 1 done)
│   └── Step 3: Settings (clickable if Step 2 done)
├── [Cancel] button → Saved Charts (15)
├── [Back] button → Previous step
├── [Generate Chart] button → Chart Detail (10)
└── Keyboard: Ctrl/Cmd + Enter → Submit
```

---

## Navigation Implementation Rules

### 1. Authentication Guard
```
Public Pages (No auth): 01, 02, 03, 13
Protected Pages (Auth required): 04-12, 14-18
```

### 2. Breadcrumb Pattern
```
Level 1: Dashboard
Level 2: Section (Charts, Calendar, etc.)
Level 3: Detail/Action Page

Example: Dashboard > Charts > Sarah's Birth Chart
```

### 3. Back Navigation
- Use browser history when possible
- Provide explicit "Back" buttons in wizards
- Dashboard is always accessible via logo click

### 4. Mobile Navigation
- Collapse to hamburger menu below 768px
- Bottom navigation bar for key actions
- Swipe gestures for wizards/steppers

### 5. Navigation State Preservation
- Return to previous scroll position
- Preserve form data on navigation away
- Remember view preferences (grid/list, etc.)

---

## Route Structure

```typescript
// Public Routes
/                           → Landing Page (01)
/login                      → Login Page (02)
/register                   → Registration Page (03)
/forgot-password            → Forgot Password

// Protected Routes
/dashboard                  → Dashboard (04)
/calendar                   → Calendar Page (05)
/calendar/:year/:month      → Calendar (specific month)
/synastry                   → Synastry Compatibility (06)
/synastry/:id               → Synastry Report
/profile                    → Profile Settings (07)
/settings                   → Alias for Profile (07)
/transits                   → Transit Forecast (08)
/lunar-returns              → Lunar Returns (09)
/lunar-returns/:id          → Lunar Return Detail
/charts                     → Saved Charts Gallery (15)
/charts/new                 → Chart Creation (18)
/charts/create              → Chart Wizard (11)
/charts/:id                 → Chart Detail (10)
/solar-returns              → Solar Returns (12)
/solar-returns/:year        → Solar Returns (specific year)
/solar-returns/:id/report   → Annual Report (17)
/reports/natal/:chartId     → Detailed Natal Report (14)
/learning                   → Learning Center (16)
/learning/courses/:id       → Course Detail

// Error Routes
/404                        → 404 Page (13)
*                           → Catch-all → 404 Page (13)
```

---

## Quick Reference: Navigation Flow

```
Landing (01)
    ├── Login (02) ─────────────┐
    └── Register (03) ───────────┤
                                ▼
                           Dashboard (04)
    ┌────────────────────────────┼────────────────────────────────┐
    │                            │                                │
    ▼                            ▼                                ▼
Charts (15)               Calendar (05)                    Transits (08)
    │                            │                                │
    ├── Chart Detail (10)        └── Events                      └── Daily/Weekly
    │       │
    │       ├── Detailed Report (14)
    │       └── Transit Forecast (08)
    │
    └── Create Chart (11/18)
            │
            └── Chart Detail (10)

Synastry (06) ──────────────────────────────────────────────────────────
    │
    ├── Select Person 1
    ├── Select Person 2
    └── View Results

Lunar Returns (09) ◄─────────────┐
    │                            │
Solar Returns (12) ──────────────┘
    │
    └── Annual Report (17)

Learning Center (16)
    │
    ├── Courses
    └── Lessons

Profile Settings (07)
```
