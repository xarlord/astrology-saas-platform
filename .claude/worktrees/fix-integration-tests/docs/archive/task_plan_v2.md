# Task Plan: Expansion Features Implementation
<!--
  WHAT: Implementation roadmap for expansion features
  WHY: Build out high-impact features to increase engagement, retention, and revenue
  WHEN: Created 2026-02-05 - Phase 1 implementation
-->

## Goal
Implement 3 high-impact expansion features in priority order:
1. **Astrological Calendar & Event Reminders**
2. **Lunar Return & Monthly Forecasts**
3. **Synastry/Compatibility Calculator**

## Current Phase
Phase 1: Astrological Calendar Implementation

## Phases

### Phase 1: Astrological Calendar & Event Reminders
**Priority:** P1 (High Impact, Low Effort)
**Timeline:** 2-3 weeks
**Status:** pending

#### Backend Development
- [ ] Create calendar calculation service
  - [ ] Global astrological events (eclipses, solstices, equinoxes)
  - [ ] Planet retrograde periods (Mercury, Venus, Mars, Jupiter, Saturn)
  - [ ] Moon phases (new, waxing, full, waning)
  - [ ] Lunar node transits
  - [ ] Seasonal ingresses (Sun changes signs)

- [ ] Personalized event calculation
  - [ ] Major transits to user's natal planets (conjunction, opposition, square)
  - [ ] Transit intensity scoring algorithm
  - [ ] House transit tracking (current sign through each house)
  - [ ] Significant aspect orbs (conjunction: 10°, opposition: 8°, trine: 8°, square: 8°)

- [ ] Calendar API endpoints
  - [ ] `GET /api/calendar/month` - Monthly calendar view
  - [ ] `GET /api/calendar/day` - Daily astrological weather
  - [ ] `GET /api/calendar/events` - List personalized events
  - [ ] `POST /api/calendar/reminders` - Set custom reminders
  - [ ] `GET /api/calendar/export` - Export to iCal/Google Calendar

- [ ] Notification service
  - [ ] Email notification templates
  - [ ] Push notification system (Firebase Cloud Messaging)
  - [ ] Notification preferences (opt-in/opt-out by event type)
  - [ ] Timezone-aware scheduling

#### Database Schema
- [ ] Create `astrological_events` table
  ```sql
  - id, event_type, event_name, start_date, end_date
  - affected_planets, aspect_type, intensity
  - description, advice, is_global
  ```

- [ ] Create `user_reminders` table
  ```sql
  - id, user_id, event_id, reminder_type (email/push)
  - reminder_advance_hours, is_active
  ```

- [ ] Create `user_calendar_views` table
  ```sql
  - id, user_id, view_date, viewed_events
  - track calendar engagement
  ```

#### Frontend Development
- [ ] Calendar view component
  - [ ] Month grid view with event badges
  - [ ] Day detail modal (tap day for details)
  - [ ] Event filtering (retrogrades, transits, moon phases)
  - [ ] Intensity color coding (green/yellow/red)

- [ ] Daily "Astrological Weather" component
  - [ ] Single sentence summary ("Today is favorable for X")
  - [ ] Moon phase display
  - [ ] Major aspects in effect
  - [ ] Lucky/unlucky activities

- [ ] Reminder settings UI
  - [ ] Notification preference toggles
  - [ ] Advance time selector (1 day, 3 days, 1 week before)
  - [ ] Event type selection

- [ ] Calendar export functionality
  - [ ] Generate iCal (.ics) file
  - [ ] Google Calendar deep link
  - [ ] Outlook calendar integration

#### Content & Interpretations
- [ ] Global event interpretations
  - [ ] Mercury retrograde interpretations (4x/year)
  - [ ] Eclipse interpretations (lunar/solar)
  - [ ] Seasonal ingress interpretations (equinoxes/solstices)
  - [ ] Planet retrograde general meanings

- [ ] Moon phase meanings
  - [ ] New moon intentions
  - [ ] Waxing phase growth
  - [ ] Full moon culmination
  - [ ] Waning phase release

#### Testing
- [ ] Unit tests for calendar calculations
- [ ] Integration tests for API endpoints
- [ ] Notification delivery tests
- [ ] Timezone handling tests
- [ ] Export format validation

#### Documentation
- [ ] API documentation update
- [ ] User guide for calendar features
- [ ] Notification settings help text

**Files to create/modify:**
- `backend/src/services/calendar.service.ts`
- `backend/src/controllers/calendar.controller.ts`
- `backend/src/routes/calendar.routes.ts`
- `backend/src/data/astrologicalEvents.ts`
- `backend/migrations/YYYYMMDD_create_astrological_events.ts`
- `backend/migrations/YYYYMMDD_create_user_reminders.ts`
- `backend/src/services/notification.service.ts`
- `frontend/src/services/calendar.service.ts`
- `frontend/src/components/CalendarView.tsx`
- `frontend/src/components/DailyWeather.tsx`
- `frontend/src/components/ReminderSettings.tsx`
- `frontend/src/pages/CalendarPage.tsx`

---

### Phase 2: Lunar Return & Monthly Forecasts
**Priority:** P1 (High Impact, Low Effort)
**Timeline:** 2-3 weeks
**Status:** pending
**Dependencies:** Phase 1 complete (uses notification system)

#### Backend Development
- [ ] Lunar return calculation service
  - [ ] Calculate exact Moon return to natal position
  - [ ] Lunar return chart generation
  - [ ] Monthly theme identification
  - [ ] Key dates in lunar month (new/full moons, aspects)

- [ ] Lunar return interpretation service
  - [ ] House placement of lunar return Moon
  - [ ] Aspects to lunar return Moon
  - [ ] Lunar return Moon phase
  - [ ] Monthly focus areas by house
  - [ ] Emotional landscape prediction

- [ ] Lunar return API endpoints
  - [ ] `GET /api/lunar-return/current` - Current lunar month
  - [ ] `GET /api/lunar-return/next` - Next lunar return date
  - [ ] `GET /api/lunar-return/history` - Past lunar returns
  - [ ] `POST /api/lunar-return/analyze` - Full monthly forecast

#### Database Schema
- [ ] Create `lunar_returns` table
  ```sql
  - id, user_id, return_date, chart_data
  - theme_summary, key_dates
  - emotional_theme, action_advice
  ```

#### Frontend Development
- [ ] Lunar return dashboard
  - [ ] Current lunar month countdown
  - [ ] Monthly theme card
  - [ ] Important dates timeline
  - [ ] Emotional landscape visual

- [ ] Lunar return report view
  - [ ] Interpretation sections (identity, emotions, relationships, career)
  - [ ] Actionable monthly rituals
  - [ ] Journal prompts for the month
  - [ ] Key aspect breakdown

- [ ] Historical lunar return timeline
  - [ ] Past months review
  - [ ] Pattern recognition ("Every Leo lunar month, you feel X")
  - [ ] Personal insights database

#### Content & Interpretations
- [ ] Lunar return Moon in 12 houses interpretations
- [ ] Lunar return Moon phase meanings
- [ ] Monthly ritual templates (new moon intentions, full moon release)
- [ ] Journal prompts by lunar house placement

#### Testing
- [ ] Lunar return calculation accuracy tests
- [ ] Interpretation generation tests
- [ ] Notification timing tests

**Files to create/modify:**
- `backend/src/services/lunarReturn.service.ts`
- `backend/src/controllers/lunarReturn.controller.ts`
- `backend/src/routes/lunarReturn.routes.ts`
- `backend/migrations/YYYYMMDD_create_lunar_returns.ts`
- `backend/src/data/lunarReturnInterpretations.ts`
- `frontend/src/services/lunarReturn.service.ts`
- `frontend/src/components/LunarReturnDashboard.tsx`
- `frontend/src/components/LunarReturnReport.tsx`
- `frontend/src/pages/LunarReturnPage.tsx`

---

### Phase 3: Synastry/Compatibility Calculator
**Priority:** P1 (High Impact, Medium Effort)
**Timeline:** 3-4 weeks
**Status:** pending
**Dependencies:** Swiss Ephemeris service, Chart service

#### Backend Development
- [ ] Synastry calculation service
  - [ ] Two-chart overlay calculation
  - [ ] Synastry aspect detection (Person A planets → Person B planets)
  - [ ] House overlay analysis (Person A planets → Person B houses)
  - [ ] Composite chart calculation (midpoint method)

- [ ] Compatibility scoring algorithm
  - [ ] Weighted aspect scores (trine = +2, square = -1, etc.)
  - [ ] House overlay scores
  - [ ] Element balance (fire, earth, air, water)
  - [ ] Modal balance (cardinal, fixed, mutable)
  - [ ] Overall compatibility score (0-100)

- [ ] Synastry interpretation service
  - [ ] Synastry aspect interpretations (Planet A + Planet B = dynamic)
  - [ ] House overlay meanings
  - [ ] Composite chart interpretations
  - [ ] Relationship strength/challenge identification
  - [ ] Advice by relationship type (romantic, friendship, business)

- [ ] Synastry API endpoints
  - [ ] `POST /api/synastry/analyze` - Compare two charts
  - [ ] `GET /api/synastry/:id` - Get saved synastry report
  - [ ] `GET /api/synastry/composite/:id` - Composite chart
  - [ ] `DELETE /api/synastry/:id` - Delete synastry report

#### Database Schema
- [ ] Create `synastry_reports` table
  ```sql
  - id, user_id, chart_1_id, chart_2_id
  - relationship_type, compatibility_score
  - report_data, created_at
  ```

- [ ] Update charts table with synastry metadata
  ```sql
  - Add flags: is_synastry_partner, share_permission
  ```

#### Frontend Development
- [ ] Synastry input form
  - [ ] Partner birth data entry
  - [ ] Relationship type selector
  - [ ] Chart selection from user's saved charts
  - [ ] Anonymous chart option (privacy)

- [ ] Compatibility results view
  - [ ] Overall compatibility score gauge
  - [ ] Strength/challenge cards
  - [ ] Synastry aspects table
  - [ ] House overlay grid
  - [ ] Composite chart wheel visualization

- [ ] Synastry detail breakdown
  - [ ] Romantic compatibility section
  - [ ] Communication style (Mercury synastry)
  - [ ] Emotional connection (Moon synastry)
  - [ ] Values & priorities (Venus synastry)
  - [ ] Action & drive (Mars synastry)
  - [ ] Long-term potential (Saturn synastry)

- [ ] Share features
  - [ ] Generate shareable link (anonymized)
  - [ ] PDF export
  - [ ] Social media image generation

#### Content & Interpretations
- [ ] Planet-to-planet synastry interpretations (10×10 = 100 combinations)
  - [ ] Sun-Sun, Sun-Moon, Sun-Venus, etc.
- [ ] House overlay interpretations (planets in 12 houses)
- [ ] Composite chart interpretations
- [ ] Relationship type specific advice
  - [ ] Romantic focus
  - [ ] Friendship focus
  - [ ] Business partnership focus

#### Testing
- [ ] Synastry calculation accuracy tests
- [ ] Composite chart calculation tests
- [ ] Scoring algorithm validation tests
- [ ] Privacy/anonymization tests

#### Documentation
- [ ] Synastry calculation methodology
- [ ] Privacy policy update (data sharing)
- [ ] User guide for compatibility readings

**Files to create/modify:**
- `backend/src/services/synastry.service.ts`
- `backend/src/controllers/synastry.controller.ts`
- `backend/src/routes/synastry.routes.ts`
- `backend/migrations/YYYYMMDD_create_synastry_reports.ts`
- `backend/src/data/synastryInterpretations.ts`
- `frontend/src/services/synastry.service.ts`
- `frontend/src/components/SynastryForm.tsx`
- `frontend/src/components/CompatibilityResults.tsx`
- `frontend/src/components/CompositeChartWheel.tsx`
- `frontend/src/pages/SynastryPage.tsx`

---

## Key Questions
1. **Monetization:** Should these be premium-only or freemium (basic free, advanced paid)?
2. **Notification Provider:** Use Firebase Cloud Messaging or AWS SNS?
3. **Calendar Export:** Support only iCal or also Google Calendar API direct integration?
4. **Synastry Privacy:** Allow anonymous chart sharing or require explicit consent?

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| Implementation Order | Calendar → Lunar Returns → Synastry (build habits first) |
| Freemium Model | Basic features free, advanced interpretations paid |
| Notification Provider | Firebase (better mobile support, free tier generous) |
| Privacy Model | Opt-in sharing with anonymization option |

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
|       | 1       |            |

## Notes
- Each phase builds on previous work
- Notification system (Phase 1) used by Phase 2
- Chart service enhancements benefit Phase 3
- Consider hiring professional astrologers for interpretation quality review
- A/B test scoring algorithms before public launch
- Plan for scale (calendar calculations can be CPU-intensive)

## 5-Question Reboot Check
| Question | Answer |
|----------|--------|
| Where am I? | Phase 1: Astrological Calendar Implementation (planning stage) |
| Where am I going? | Build 3 high-impact features to increase engagement and revenue |
| What's the goal? | Expand Astrology SaaS with calendar, lunar returns, and synastry |
| What have I learned? | See findings.md - includes feature prioritization and revenue potential |
| What have I done? | Created expansion plan and detailed task plan for 3 features |
