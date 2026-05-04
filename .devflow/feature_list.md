# AstroVerse Feature List

## Complete Feature Inventory from 18 UI Designs

---

## Category 1: Authentication & Onboarding

### F-001 Landing Page
- Hero section with animated zodiac wheel
- Feature showcase (Natal Charts, Personality Insights, Transit Forecasts)
- Testimonials carousel
- Pricing tiers (Free, Pro $9.99/mo, Enterprise $29.99/mo)
- Newsletter subscription
- Social proof (user count, ratings)

### F-002 User Registration
- Multi-step registration flow
- Email/password registration
- Social login (Google, Apple)
- Password strength indicator
- Terms acceptance
- Email verification

### F-003 User Login
- Email/password login
- Remember me functionality
- Forgot password flow
- Social login (Google, Apple)
- Session persistence

### F-004 Password Recovery
- Email-based password reset
- Reset link expiration
- New password creation

---

## Category 2: Dashboard & Overview

### F-005 Dashboard
- Personalized greeting with cosmic overview
- Daily insights badge
- Moon phase display
- Cosmic energy gauge (circular progress)
- Major transit featured card
- Current planetary positions grid
- Upcoming transits list
- Saved charts quick access
- Quick actions grid (Calendar, Synastry, Lunar/Solar Returns)
- Notification center

### F-006 Notification System
- Notification bell with badge count
- Major transit alerts
- Moon phase notifications
- Retrograde warnings
- Custom reminder settings

---

## Category 3: Chart Management

### F-007 Chart Creation Wizard
- 3-step wizard (Personal, Birth Data, Settings)
- Chart name input
- Date picker (calendar widget)
- Time picker with AM/PM toggle
- Unknown time checkbox
- Location search with autocomplete
- Map preview with coordinates
- Real-time chart preview
- Gender selection
- House system selection
- Zodiac type selection

### F-008 Saved Charts Gallery
- Grid/list view toggle
- Search functionality
- Sort options (Date, A-Z, Sign)
- Folder organization (Personal, Clients, Relationships, Favorites)
- Storage usage indicator
- Chart cards with quick info (Sun/Moon/Rising)
- Quick actions (View, Edit, Share, Delete)
- Create new chart placeholder

### F-009 Natal Chart Detail
- Interactive chart wheel with hover tooltips
- Planetary positions table
- House cusps display
- Aspect visualization
- Tab navigation (Summary, Planets, Houses, Aspects)
- Big Three display (Sun, Moon, Rising)
- Major aspects list
- Edit, Download, Share actions
- View transits button

### F-010 Detailed Natal Report
- Premium report generation
- Big Three detailed interpretations
- Elemental balance visualization
- Chart strength analysis
- Planet-by-planet breakdown
- Aspect grid matrix
- PDF download
- Print order option
- Share functionality

---

## Category 4: Forecasting & Transits

### F-011 Transit Forecast
- Date range toggle (Today, Week, Month)
- Daily energy meter (circular gauge)
- Moon phase display
- Timeline feed with event cards
- Aspect type badges (Trine, Square, Conjunction)
- Category tags (Career, Love, Communication)
- Orb degree display
- Duration bars with peak indicators
- Mini transit calendar
- Planetary positions panel
- Personalized insights

### F-012 Lunar Returns
- Current cycle display
- Time remaining countdown
- Cycle progress bar
- Moon phase and illumination
- Intensity score
- Key aspects
- Forecast themes (Emotional, Creative, Family)
- Life areas impact grid
- Past returns timeline
- Recommended rituals
- Journal prompts

### F-013 Solar Returns
- Annual forecast display
- Year selector tabs
- Days countdown
- Chart wheel visualization
- Dominant themes with percentages
- Quarterly energy forecast
- House activation ring
- Key dates table
- Compare years functionality
- Download annual report
- Set reminder

### F-014 Solar Return Annual Report
- Yearly theme overview
- Chart comparison (Natal vs Solar Return)
- Key placements grid
- 12-month timeline
- Power date indicators
- Accordion interpretations (Career, Love, Health)
- PDF download
- Calendar integration
- Book consultation CTA

---

## Category 5: Compatibility & Relationships

### F-015 Synastry Compatibility
- Person 1 & Person 2 selectors
- Chart picker modal
- Compare button with animation
- Overall compatibility score (circular gauge)
- Category breakdown:
  - Romance & Passion
  - Communication
  - Core Values
  - Emotional Safety
  - Growth Potential
- Composite mini chart
- Key aspects list
- Generate full report
- Share functionality
- Favorite/save

---

## Category 6: Calendar & Events

### F-016 Astrological Calendar
- Month/Week/List view toggle
- Today button
- Month navigation
- Moon phase icons per day
- Event badges (color-coded):
  - New Moon (silver)
  - Full Moon (gold)
  - Mercury Retrograde (red)
  - Eclipse (amber)
  - Ingress (blue)
  - Aspects (purple)
- Detail panel for selected date
- Add to calendar button
- Share button
- Event legend
- Upcoming events timeline
- Add personal event

---

## Category 7: Learning & Education

### F-017 Learning Center
- Featured course hero
- Progress tracking
- Resume learning button
- Learning paths (horizontal scroll)
- Knowledge base categories:
  - Planets
  - Zodiac Signs
  - Houses
  - Aspects
- Latest lessons sidebar
- Lesson thumbnails
- Bookmark functionality
- Community forum link
- Course/lesson search

---

## Category 8: User Profile & Settings

### F-018 Profile Settings
- Profile photo upload (drag & drop)
- Animated gradient border on avatar
- PRO badge display
- Zodiac badges (Sun, Moon, Rising)
- Tab navigation:
  - Personal Info
  - Birth Data
  - Subscription
  - Notifications
  - Privacy
- Form fields: Name, Display Name, Email, Bio
- Email verification badge
- Character counter for bio
- Toggle switches for notifications
- Subscription management
- Plan features display
- Billing date

---

## Category 9: Error & Edge Cases

### F-019 404 Page
- Animated space background
- Floating astronaut illustration
- "Lost in the Cosmos" message
- Return home button
- Go to dashboard button
- Brand footer

---

## Feature Priority Matrix

| Priority | Features | Complexity |
|----------|----------|------------|
| **P0 (Critical)** | F-002, F-003, F-005, F-007, F-008, F-009 | High |
| **P1 (High)** | F-011, F-012, F-013, F-015, F-016 | High |
| **P2 (Medium)** | F-001, F-006, F-010, F-014, F-017 | Medium |
| **P3 (Low)** | F-004, F-018, F-019 | Low |

---

## Feature Dependencies

```
F-002, F-003 (Auth) ──► F-005 (Dashboard)
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
F-007 (Create)       F-011 (Transits)    F-015 (Synastry)
        │                   │
        ▼                   ▼
F-008 (Gallery)      F-012 (Lunar)
        │                   │
        ▼                   ▼
F-009 (Detail)       F-013 (Solar)
        │                   │
        ▼                   ▼
F-010 (Report)       F-014 (Annual)
```

---

## API Endpoints Summary

| Category | Endpoints Required |
|----------|-------------------|
| Auth | 8 endpoints |
| User/Profile | 6 endpoints |
| Charts | 12 endpoints |
| Transits | 6 endpoints |
| Lunar/Solar Returns | 10 endpoints |
| Synastry | 5 endpoints |
| Calendar | 6 endpoints |
| Learning | 4 endpoints |
| **Total** | **57 endpoints** |
