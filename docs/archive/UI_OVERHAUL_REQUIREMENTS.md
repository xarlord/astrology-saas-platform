# UI Overhaul Requirements Document
**Project:** AstroVerse - Astrology SaaS Platform
**Date:** 2026-02-21
**Version:** 2.0

---

## Executive Summary

This document defines the requirements for a comprehensive UI and function overhaul based on 18 detailed UI design specifications found in `./stitch-UI/desktop/`. The overhaul will transform the current frontend into a premium, feature-rich astrology platform.

### Current State
- Backend: ✅ Complete and functional
- Frontend: Basic implementation with 14 routes
- Production Readiness: 9.0/10 - Ready for deployment

### Target State
- Premium UI/UX matching detailed design specifications
- Enhanced features based on button/function definitions
- Improved user journey and engagement

---

## Design System Analysis

### Color Palette
```css
--primary: #6b3de1           /* Purple - Main branding */
--primary-dark: #5a32c0       /* Darker purple */
--cosmic-blue: #2563EB        /* Blue - Secondary */
--accent-gold: #F5A623          /* Gold - Highlights */
--background-dark: #0B0D17    /* Deep Navy */
--surface-dark: #151725        /* Card backgrounds */
--glass-bg: rgba(255,255,255,0.05) /* Glass effect */
```

### Typography
- **Display Font:** Space Grotesk (headings, display text)
- **Body Font:** Noto Sans / Lexend (body text, reading)
- **Special:** Epilogue (marketing copy)

### Visual Language
- **Glassmorphism:** Frosted glass panels with backdrop blur
- **Cosmic Theme:** Stars, nebulae, celestial imagery
- **Gradient Accents:** Purple-to-blue gradients
- **Micro-interactions:** Hover scales, glow effects, smooth transitions

---

## Comprehensive Feature Requirements by Page

### 1. Landing Page (01-landing-page.html)

#### Existing Features
- Hero section with CTA buttons
- Features showcase (3 cards)
- Social proof/testimonials
- Pricing tiers (Seeker, Mystic, Oracle)
- Footer with navigation

#### New Requirements from UI Design
- Animated zodiac wheel visualization
- Floating "Current Transit" cards
- User avatars showing social proof (50,000+ users)
- Star rating display (4.9/5 average)
- Social login options in pricing section

#### Button Functions
| Button | Function |
|--------|----------|
| "Get Started Free" | Navigate to registration |
| "Watch Demo" | Open video modal |
| "Start Free" | Create account (free tier) |
| "Get Pro Access" | Upgrade to Mystic tier |
| "Contact Sales" | Contact form for Oracle tier |

---

### 2. Login Page (02-login-page.html)

#### Existing Features
- Email/password form
- Social login (Google, Apple)

#### New Requirements from UI Design
- Split-screen layout with cosmic artwork (left)
- Animated zodiac wheel background
- "Daily Insight" quote section
- Remember me checkbox
- Forgot password link

#### Button Functions
| Button | Function |
|--------|----------|
| "Sign In" | Authenticate user |
| "Forgot password?" | Password reset flow |
| "Sign up for free" | Navigate to registration |
| "Continue with Google" | OAuth Google flow |
| "Continue with Apple" | OAuth Apple flow |

---

### 3. Registration Page (03-registration-page.html)

#### Existing Features
- Registration form

#### New Requirements from UI Design
- Step indicator (Step 1 of 2)
- Password strength meter (4 bars, real-time validation)
- Full name, email, password, confirm password fields
- Terms of service checkbox
- Social registration options

#### Button Functions
| Button | Function |
|--------|----------|
| "Create Account" | Submit registration form |
| "Sign in" | Navigate to login page |

---

### 4. Dashboard (04-dashboard.html)

#### Existing Features
- Welcome section
- Charts list

#### New Requirements from UI Design
- Daily cosmic overview with personalized quote
- **Energy Meter:** Circular gauge (0-100) showing daily vitality score
- **Today's Highlights:** Major transit cards with event badges
- **Planetary Positions Grid:** 4 planets with zodiac signs and degrees
- **Upcoming Transits:** Timeline view with date, icon, title, and impact tags
- **Your Charts:** Chart cards with "Big Three" badges (Sun, Moon, Rising)
- **Quick Actions Grid:** Calendar, Synastry, Lunar Returns, Solar Returns

#### Button Functions
| Button | Function |
|--------|----------|
| "New Chart" | Open chart creation wizard |
| "Calendar" | Navigate to calendar page |
| "Synastry" | Navigate to compatibility page |
| "Lunar Returns" | Navigate to lunar returns |
| "Solar Returns" | Navigate to solar returns |
| "View Ephemeris" | Open detailed ephemeris |
| "View All Transits" | Navigate to transit forecast |
| "View Forecast" | Open transit forecast details |
| "Read Forecast" | Read detailed forecast |
| "View Details" | View detailed aspect information |

---

### 5. Calendar Page (05-calendar-page.html)

#### Existing Features
- Basic calendar view

#### New Requirements from UI Design
- **View Toggle:** Month/Week/List view
- **Calendar Grid:** 7-column layout with date cells
- **Event Badges:** Color-coded events in each cell
- **Event Legend:** 6 event types (New Moon, Full Moon, Retrograde, Eclipse, Ingress, Aspect)
- **Bottom Detail Panel:** Selected date information with event list
- **Add to Calendar** button
- **Share** button
- **Upcoming Events Sidebar:** List with reminder buttons

#### Event Types & Colors
| Event Type | Color | Icon |
|------------|-------|------|
| New Moon | Silver (#C0C0C0) | circle |
| Full Moon | Gold (#F5A623) | circle |
| Retrograde | Mercury Red (#FF6B6B) | warning |
| Eclipse | Orange (#F59E0B) | solar/lunar |
| Ingress | Blue (#4D96FF) | movement |
| Aspect | Purple (#6b3de1) | aspect |

#### Button Functions
| Button | Function |
|--------|----------|
| "Today" | Jump to today's date |
| Month/Week/List view | Switch calendar view |
| "View All" | View all upcoming events |
| "Add to Calendar" | Add personal event |
| "Share" | Share event link |
| "Reminder" | Set event reminder |

---

### 6. Synastry/Compatibility (06-synastry-compatibility.html)

#### Existing Features
- Basic synastry

#### New Requirements from UI Design
- **"The Altar":** Two-person comparison interface with cosmic beam background
- **Compare Button:** Central action button to generate comparison
- **Circular Compatibility Gauge:** 0-100 score with label
- **Breakdown Metrics:** 5 categories with progress bars:
  - Romance & Passion (82%)
  - Communication (75%)
  - Core Values (70%)
  - Emotional Safety (85%)
  - Growth Potential (78%)
- **Composite Chart:** Mini chart visualization
- **Key Aspects List:** Planet-planet aspects with tags (Harmony/Tension/Flow)
- **Generate Full Report** button (premium)

#### Button Functions
| Button | Function |
|--------|----------|
| "Compare" / "compare_arrows" | Generate synastry report |
| "Generate Full Report" | Unlock detailed compatibility report |
| "Share" | Share synastry results |
| "star" | Save to favorites |
| "View Details" | View composite chart details |

---

### 7. Profile Settings (07-profile-settings.html)

#### Existing Features
- Basic profile

#### New Requirements from UI Design
- **Hero Profile Card:** Avatar, name, email, PRO badge
- **Zodiac Badges:** Sun, Moon, Rising sign display
- **Navigation Tabs:** Personal Info, Birth Data, Subscription, Notifications, Privacy
- **Notification Preferences:** Toggle switches for:
  - Major Transits
  - Moon Phases
  - Retrograde Warnings
- **Subscription Card:** Current plan, features, billing date, manage button
- **Birth Data Preview:** Mini chart wheel with location
- **Profile Photo Upload:** Drag-and-drop zone

#### Button Functions
| Button | Function |
|--------|----------|
| "Edit Profile" | Edit basic information |
| "Save Changes" | Save profile updates |
| "Manage Subscription" | Open subscription management |
| "View Details" | View composite chart details |

---

### 8. Transit Forecast (08-transit-forecast.html)

#### Existing Features
- Basic transit view

#### New Requirements from UI Design
- **Date Range Toggle:** Today/This Week/This Month
- **Hero Cards:**
  - Energy Meter (circular gauge, 0-100)
  - Moon Phase card with illumination percentage
- **Timeline Feed:** Vertical timeline with:
  - Time stamps
  - Aspect icons
  - Event titles
  - Impact tags (Career/Expansion/Communication/Love/Creativity)
  - Duration bars showing transit intensity over time
- **Mini Transit Calendar:** Month view with intensity-colored cells
- **Planetary Positions Sidebar:** Sun, Moon, Mercury, Venus with degrees and houses
- **Personalized Insights Card:** Bullet points with recommendations
- **View Full Report** button

#### Button Functions
| Button | Function |
|--------|----------|
| "Today/This Week/This Month" | Change date range |
| "View Full Report" | Open detailed transit report |

---

### 9. Lunar Returns (09-lunar-returns.html)

#### Existing Features
- Basic lunar return

#### New Requirements from UI Design
- **Hero Card:**
  - Cycle progress countdown (days, hours, minutes)
  - Progress bar (0-100%)
  - Phase badges (Moon sign, illumination, waxing phase)
- **Chart Analysis Module:** Intensity score, mini chart wheel, key placement
- **Forecast Themes Cards:** 3 cards (Emotional Renewal, Creative Surge, Family Focus)
- **Life Areas Impact:** 6 areas with status dots (green/yellow/gray)
- **History Timeline:** Horizontal timeline with past/present/future returns
- **Recommended Rituals:** Salt Bath Cleansing, Dream Journaling
- **Reflection Prompts:** Journal input fields

#### Button Functions
| Button | Function |
|--------|----------|
| "Past Cycles" | View historical lunar returns |
| "Share Chart" | Share lunar return chart |
| "View Ritual Guide" | Open ritual instructions |
| "View All History" | View complete history |

---

### 10. Natal Chart Detail (10-natal-chart-detail.html)

#### Existing Features
- Chart view

#### New Requirements from UI Design
- **Left Sidebar:** Planetary positions table (Planet, Sign/Position, House)
- **Center Stage:** Interactive SVG chart wheel with:
  - Zodiac ring with element colors
  - House divisions
  - Aspect lines (trines, squares, sextiles)
  - Planet markers with tooltips
- **Bottom Tab Navigation:** Personality Analysis, House Interpretations, Aspects Detail, Download Report
- **Right Sidebar:**
  - "The Big Three" cards (Sun, Moon, Rising)
  - Major Aspects list with harmony indicators
- **Breadcrumb Navigation**
- **Action Buttons:** Edit, Download PDF, Share, View Transits

#### Button Functions
| Button | Function |
|--------|----------|
| "Edit Chart" | Edit birth data |
| "Download PDF" | Generate PDF report |
| "Share" | Share chart link |
| "View Transits" | Navigate to transit forecast |
| "View All" | View all aspects |

---

### 11. Chart Creation Wizard (11-chart-creation-wizard.html)

#### Existing Features
- Basic chart creation

#### New Requirements from UI Design
- **Step Progress Indicator:** 3 steps (Birth Details → Location → Settings)
- **Step 1 - Birth Details:**
  - Chart name input
  - Date of birth picker
  - Time of birth picker
  - Unknown time checkbox
  - Gender selection (Male/Female/Other) - Optional
- **Right Sidebar:** Live preview chart wheel that updates in real-time
- **Info Banner:** Explains birth time importance
- **Keyboard Shortcut:** Enter to continue

#### Button Functions
| Button | Function |
|--------|----------|
| "Cancel" | Abort creation |
| "Next: Location" | Proceed to step 2 |
| "help" | Open help modal |

---

### 12. Solar Returns (12-solar-returns.html)

#### Existing Features
- Solar return calculation

#### New Requirements from UI Design
- **Hero Card:**
  - Active cycle date range
  - Countdown to solar return
  - Year selector buttons (2024-2027)
  - Set Reminder button
- **Chart & Themes:**
  - Chart wheel visualization
  - Dominant Themes (Career Peak, Inner Growth, Relationship Focus)
- **Quarterly Energy Forecast:** 4 quarters with energy levels
- **House Activation Ring:** Visual ring chart showing house emphasis
- **Key Dates Table:** Date, Event, Impact (HIGH/POS/MED)

#### Button Functions
| Button | Function |
|--------|----------|
| "Compare Years" | Compare multiple solar returns |
| "Download Report" | Generate PDF report |
| "Set Reminder" | Set birthday reminder |
| "View All 12 Dates" | Expand dates table |

---

### 13. Saved Charts Gallery (15-saved-charts.html)

#### Existing Features
- Charts list

#### New Requirements from UI Design
- **Sidebar Navigation:**
  - Folders: All Charts, Personal, Clients, Relationships, Favorites
  - Storage usage indicator (75/100 charts)
- **Actions Bar:**
  - Search input
  - Sort dropdown (Date Added, A-Z, Sign)
  - Grid/List view toggle
- **Gallery Grid:** Chart cards with:
  - Icon (Sun/Moon/Star)
  - Chart name
  - Date and location
  - "Big Three" badges
  - Tags (Self, Default, Family, Friends)
  - Action buttons (View, Edit, Share, Delete) on hover
- **Add New Chart** button
- **Empty State Card:** Create new chart call-to-action

#### Button Functions
| Button | Function |
|--------|----------|
| "Add New Chart" | Start chart creation wizard |
| Folder navigation | Filter by folder |
| Sort options | Change sort order |
| Grid/List toggle | Change view mode |
| View/Edit/Share/Delete | Chart card actions |

---

### 14. Learning Center (16-learning-center.html)

#### Existing Features
- None (NEW FEATURE)

#### New Requirements from UI Design
- **Hero Card:** Current course with progress bar, Resume/View Syllabus buttons
- **Learning Paths:** Horizontal scrollable cards with 4 paths:
  - Astrology 101: The Basics (In Progress)
  - Intermediate: Aspects & Transits (Locked)
  - Advanced: Synastry & Electional (Locked)
  - The Professional Astrologer (Locked)
- **Knowledge Base Grid:** 4 categories
  - Planets (12 topics)
  - Zodiac Signs (8 topics)
  - Houses (10 topics)
  - Aspects (15 topics)
- **Latest Lessons Sidebar:** Lesson cards with thumbnails, duration, category
- **Community CTA:** Join student forum
- **Search bar** with placeholder

#### Button Functions
| Button | Function |
|--------|----------|
| "Resume Learning" | Continue current course |
| "View Syllabus" | View course curriculum |
| "Browse more" | Expand topic list |
| "View All Lessons" | View lesson library |
| "Enter Student Forum" | Open community forum |

---

### 15. New Chart Creation Flow (18-new-chart-creation-flow.html)

#### Existing Features
- Basic chart creation

#### New Requirements from UI Design
- **Enhanced Wizard:**
  - 3-step progress indicator (Personal → Birth Data → Settings)
- **Step 1 - Personal:** Name input
- **Step 2 - Birth Data:**
  - Custom date picker calendar grid
  - Time picker with AM/PM toggle
  - Unknown time checkbox
  - Location search with map preview
  - Latitude/longitude display
- **Live Preview Panel:** Real-time chart wheel updates
  - Sun sign, Moon sign, Ascendant display
  - Chart wheel with animated zodiac ring
- **Navigation:** Back/Generate Chart buttons

#### Button Functions
| Button | Function |
|--------|----------|
| "Back to Personal Details" | Return to step 1 |
| "Generate Chart" | Calculate and save chart |
| AM/PM toggle | Switch time format |
| Unknown time | Use noon time |

---

### 13. 404 Error Page (13-404-page.html)

#### New Requirements from UI Design
- **Split Layout:**
  - Left: Floating astronaut illustration with broken zodiac wheel
  - Right: Error message and navigation
- **Visual Effects:**
  - Twinkling star animations (custom CSS)
  - Floating astronaut animation (float, drift)
  - Nebula gradient backgrounds
  - Pulsing glow effects
- **Content:**
  - Large "404" text with gradient fill
  - "Lost in the Cosmos" heading
  - Humorous error message about Mercury retrograde
  - Current Mercury status indicator (Direct/Retrograde)
- **Navigation Buttons:**
  - "Return Home" - Primary CTA with rocket icon
  - "Go to Dashboard" - Secondary action
- **Footer:**
  - Brand mark
  - Mercury status indicator with pulsing dot

#### Button Functions
| Button | Function |
|--------|----------|
| "Return Home" | Navigate to landing page |
| "Go to Dashboard" | Navigate to user dashboard |

---

### 14. Detailed Natal Report (14-detailed-natal-report.html)

#### New Requirements from UI Design
- **Report Header:**
  - Premium badge indicator
  - User name, birth date, time, location
  - Navigation tabs (Summary, Planets, Houses, Aspects)
- **Big Three Hero Section:**
  - 3 cards: Sun, Moon, Rising
  - Icon, sign name, element badges
  - Interpretation text for each
- **Elemental Balance:**
  - 4 progress bars (Fire, Earth, Air, Water)
  - Percentage display for each element
- **Chart Strength Overview:**
  - Visual summary card
- **Personal Planets Section:**
  - Planet cards (Venus, Mars, etc.)
  - House position, hashtags/keywords
  - Detailed interpretation text
- **Aspect Grid Matrix:**
  - Table showing planet aspects
  - Color-coded aspect symbols
  - Legend (Conjunction, Square, Trine, Sextile)
- **Floating Sidebar:**
  - Premium action buttons (Download PDF, Order Printed, Share)
  - Current transit card
  - Upsell card for Synastry Guide
- **Footer:** Standard footer with links

#### Button Functions
| Button | Function |
|--------|----------|
| Tab navigation | Switch report sections |
| "Download PDF Report" | Generate and download PDF |
| "Order Printed Chart" | Redirect to print order flow |
| "Share Report" | Open share modal |
| "Learn More" (upsell) | Navigate to Synastry Guide |

---

### 17. Solar Return Annual Report (17-solar-return-annual-report.html)

#### New Requirements from UI Design
- **Header Section:**
  - Annual Forecast badge with sun icon
  - Report title (e.g., "Solar Return Report 2024")
  - Action buttons: View Archive, Download PDF
- **Yearly Theme Hero:**
  - Large sun orb image with sun icon overlay
  - Year theme title (e.g., "The Year of Personal Expansion")
  - Detailed forecast text (2 paragraphs)
  - "Read Full Executive Summary" link
- **Chart Comparison:**
  - Side-by-side: Natal Birth Chart vs. Solar Return Chart
  - Central badge: Solar Return Ascendant sign
  - Chart wheel visuals for each
- **Key Placements Grid:**
  - 3 cards: Solar House, Yearly Ruler, Crucial Aspect
  - Icon, title, interpretation for each
- **Annual Timeline:**
  - Horizontal scrollable 12-month view
  - Power dates (marked with star icon)
  - Challenge dates (marked with moon icon)
  - Regular month markers
- **Detailed Interpretations:**
  - Accordion sections (Career, Love, Health)
  - Expandable content areas
- **Final Actions Bar:**
  - "Compare with Previous Year"
  - "Add Power Dates to Calendar"
  - "Book Consultation for This Report" (primary CTA)

#### Button Functions
| Button | Function |
|--------|----------|
| "View Archive" | View previous solar return reports |
| "Download PDF" | Generate and download PDF report |
| Accordion headers | Expand/collapse interpretation sections |
| "Compare with Previous Year" | Side-by-side year comparison |
| "Add Power Dates to Calendar" | Export dates to .ics file |
| "Book Consultation" | Redirect to consultation booking |

---

## Component Library Requirements

### New Components to Create

| Component | Description | Props |
|-----------|-------------|-------|
| `EnergyMeter` | Circular gauge 0-100 with gradient fill | `value`, `label`, `size` |
| `MoonPhaseCard` | Moon phase with illumination % | `phase`, `illumination`, `sign` |
| `PlanetaryPositionCard` | Planet with sign, degree, house | `planet`, `sign`, `degree`, `house`, `isRetrograde` |
| `TransitTimelineCard` | Transit event with time, icon, tags | `time`, `title`, `impact`, `tags` |
| `CalendarCell` | Date cell with events, hover state | `date`, `events`, `isToday`, `isCurrentMonth` |
| `ZodiacBadge` | Zodiac sign badge with icon | `sign`, `label`, `variant` |
| `CompatibilityGauge` | Circular compatibility score | `score`, `size`, `showLabel` |
| `ChartPreview` | Mini chart wheel with planets | `chartData`, `animate` |
| `StepIndicator` | Wizard step progress | `steps`, `currentStep`, `completed` |
| `GlassCard` | Glassmorphic panel with blur | `children`, `className`, `hover` |
| `EventBadge` | Color-coded event type | `type`, `label` |
| `ProgressStepper` | Horizontal/vertical step wizard | `steps`, `current`, `onChange` |
| `LiveSearch` | Search with results dropdown | `onSearch`, `placeholder`, `results` |

---

## State Management Requirements

### New Zustand Stores

| Store | Purpose | Key State |
|-------|---------|----------|
| `calendarStore` | Calendar state | `viewMode`, `selectedDate`, `events`, `filters` |
| `transitStore` | Transit forecasts | `dateRange`, `transits`, `energyLevel` |
| `synastryStore` | Compatibility data | `person1`, `person2`, `score`, `aspects` |
| `learningStore` | Learning progress | `courses`, `progress`, `completedLessons` |
| `uiStore` | UI preferences | `theme`, `sidebarOpen`, `viewMode`, `density` |

---

## API Requirements

### New API Endpoints Needed

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/calendar/events` | GET | Get calendar events for month |
| `/api/synastry/compare` | POST | Compare two charts, get score |
| `/api/lunar-returns` | GET | Get lunar return forecasts |
| `/api/solar-returns` | GET | Get solar return data |
| `/api/learning/courses` | GET | Get course list |
| `/api/learning/progress` | GET | Get user progress |
| `/api/reports/generate` | POST | Generate PDF report |
| `/api/user/storage` | GET | Get storage usage |

---

## Database Schema Updates

### New Tables Required

```sql
-- Calendar events
CREATE TABLE calendar_events (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    event_date DATE NOT NULL,
    event_type VARCHAR(50) NOT NULL, -- 'new_moon', 'full_moon', etc.
    title VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Synastry reports (cache for performance)
CREATE TABLE synastry_reports (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    person1_chart_id UUID NOT NULL,
    person2_chart_id UUID NOT NULL,
    compatibility_score INTEGER NOT NULL,
    breakdown JSONB, -- {romance: 82, communication: 75, ...}
    aspects JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Learning progress
CREATE TABLE learning_progress (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    course_id VARCHAR(255) NOT NULL,
    progress INTEGER DEFAULT 0,
    completed_lessons TEXT[], -- array of lesson IDs
    last_accessed TIMESTAMP DEFAULT NOW()
);

-- User reminders
CREATE TABLE user_reminders (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    event_date DATE NOT NULL,
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Technical Requirements

### Performance Requirements

1. **Chart Rendering:** SVG charts must render in < 500ms
2. **Calendar Loading:** Month view must load in < 300ms
3. **Search:** Live search results < 200ms
4. **Animations:** 60fps for smooth transitions

### Accessibility Requirements

1. **WCAG 2.1 AA Compliance:**
   - All buttons have aria-labels
   - Keyboard navigation works for all features
   - Color contrast ratio ≥ 4.5:1
   - Focus indicators visible
2. **Screen Reader Support:**
   - Chart wheel accessible via table/keyboard
   - Event lists properly announced
   - Form errors clearly described

### Responsive Requirements

1. **Breakpoints:**
   - Mobile: < 768px
   - Tablet: 768px - 1024px
   - Desktop: > 1024px
2. **Mobile Adaptations:**
   - Sidebars become drawers
   - Multi-column layouts stack vertically
   - Touch targets ≥ 44x44px

---

## Migration Strategy

### Phase 1: Core Components (Week 1-2)
- Create new design system (tokens, variables)
- Build component library (15+ components)
- Update existing pages with new styling
- Test responsive behavior

### Phase 2: Feature Implementation (Week 3-4)
- Implement calendar with events
- Add synastry comparison
- Build transit timeline
- Create solar/lunar return pages
- Add learning center

### Phase 3: Advanced Features (Week 5-6)
- Chart creation wizard
- Live preview system
- Saved charts gallery
- PDF generation
- Reminder system

### Phase 4: QA & Polish (Week 7-8)
- QA agent review (as requested)
- Bug fixes and refinements
- Performance optimization
- Documentation updates

---

## Success Criteria

- [ ] All 18 UI pages implemented according to designs
- [ ] All buttons have defined functions
- [ ] Component library with 100% coverage
- [ ] Mobile responsive on all pages
- [ ] Accessibility compliance achieved
- [ ] Performance benchmarks met
- [ ] QA approval received
- [ ] User acceptance testing passed

---

## Open Questions for QA Review

1. **State Management:** Should we use React Query for server state or expand Zustand?
2. **Chart Rendering:** Should we use D3.js, Recharts, or custom SVG for charts?
3. **PDF Generation:** Should we use jsPDF, Puppeteer, or server-side PDF generation?
4. **Animation Library:** Framer Motion for transitions or CSS animations only?
5. **Form Validation:** React Hook Form, Formik, or custom validation?
6. **Date Picker:** Should we use react-day-picker, @mui/x-date-pickers, or custom?
7. **Location Search:** Should we integrate Google Places API or build custom?
8. **Real-time Updates:** WebSockets for live chart preview or optimistic UI?

---

## Document Control

| Version | Date | Changes | Author |
|--------|------|---------|--------|
| 1.0 | 2026-02-21 | Initial requirements from UI analysis | System |

---

*This document will be updated as QA review proceeds and implementation progresses.*
