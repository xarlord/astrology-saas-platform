# Technical Specification: Astrological Calendar & Event Reminders

**Version:** 1.0
**Status:** Ready for Development
**Priority:** P1 (High Impact, Low Effort)
**Timeline:** 2-3 weeks

---

## 1. Feature Overview

### 1.1 Objective
Create a personalized astrological calendar that displays important astrological events and major transits to the user's natal chart, with notification reminders.

### 1.2 User Stories
- **As a user**, I want to see astrological events in a calendar view so I can plan my month
- **As a user**, I want daily astrological weather summaries so I understand today's energy
- **As a user**, I want reminders for important transits so I can prepare for them
- **As a user**, I want to export my astrological calendar to Google Calendar so I can view it alongside my regular events

### 1.3 Success Criteria
- Calendar loads in < 2 seconds
- Notifications sent 24 hours before event
- Export generates valid iCal file
- Daily engagement increases by 40%

---

## 2. Backend Architecture

### 2.1 Calendar Service (`calendar.service.ts`)

```typescript
interface CalendarService {
  // Global Events
  getGlobalEvents(startDate: Date, endDate: Date): Promise<AstrologicalEvent[]>;
  getRetrogradePeriods(planet: Planet, year: number): Promise<RetrogradePeriod[]>;
  getEclipses(year: number): Promise<Eclipse[]>;
  getMoonPhases(month: number, year: number): Promise<MoonPhase[]>;
  getSeasonalIngresses(year: number): Promise<SeasonalIngress[]>;

  // Personalized Events
  getPersonalTransits(userId: string, startDate: Date, endDate: Date): Promise<TransitEvent[]>;
  calculateTransitIntensity(transit: TransitEvent): number; // 1-10 score

  // Calendar Integration
  generateICal(events: AstrologicalEvent[]): string;
  getGoogleCalendarAuthUrl(userId: string): string;
}

interface AstrologicalEvent {
  id: string;
  eventType: 'retrograde' | 'eclipse' | 'moon-phase' | 'ingress' | 'transit';
  eventName: string;
  startDate: Date;
  endDate?: Date;
  intensity: number; // 1-10
  affectedPlanets: Planet[];
  description: string;
  advice: string;
  isGlobal: boolean;
}

interface TransitEvent extends AstrologicalEvent {
  natalPlanet: Planet;
  natalHouse: number;
  transitingPlanet: Planet;
  aspectType: AspectType;
  orb: number;
  applying: boolean;
}
```

### 2.2 API Endpoints

#### `GET /api/calendar/month`
**Description:** Get calendar events for a month

**Query Parameters:**
- `month` (required): 1-12
- `year` (required): 4-digit year
- `timezone` (optional): IANA timezone (default: user's timezone)

**Response:**
```json
{
  "month": 2,
  "year": 2026,
  "events": [
    {
      "id": "evt_123",
      "date": "2026-02-15",
      "eventType": "retrograde",
      "eventName": "Mercury Retrograde",
      "intensity": 7,
      "description": "Communication may be challenging...",
      "advice": "Back up your data, avoid signing contracts",
      "color": "#FF6600"
    }
  ],
  "dailyWeather": {
    "2026-02-15": {
      "summary": "Favorable for creative work, challenging for communications",
      "moonPhase": "waxing-gibbous",
      "majorAspects": ["Sun conjunct Mercury"],
      "luckyActivities": ["creative work", "meditation"],
      "challengingActivities": ["important conversations", "travel"]
    }
  }
}
```

#### `GET /api/calendar/day/:date`
**Description:** Get detailed astrological weather for a specific day

**Response:**
```json
{
  "date": "2026-02-15",
  "moonPhase": {
    "phase": "waxing-gibbous",
    "illumination": 78,
    "sign": "Taurus",
    "degree": 15.5
  },
  "globalEvents": [...],
  "personalTransits": [...],
  "summary": "Today's energy favors...",
  "rating": 7, // 1-10
  "color": "#10B981" // green (favorable), yellow (neutral), red (challenging)
}
```

#### `POST /api/calendar/reminders`
**Description:** Set up event reminders

**Request Body:**
```json
{
  "eventType": "all" | "major-transits" | "retrogrades" | "eclipses",
  "advanceHours": [24, 72, 168], // Notify 1 day, 3 days, 1 week before
  "deliveryMethod": ["email", "push"],
  "isActive": true
}
```

#### `GET /api/calendar/export`
**Description:** Export calendar as iCal file

**Query Parameters:**
- `startDate` (required): ISO date string
- `endDate` (required): ISO date string
- `includePersonal` (optional): boolean

**Response:** `text/calendar` iCal file

---

## 3. Database Schema

### 3.1 `astrological_events` Table
```sql
CREATE TABLE astrological_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL, -- 'retrograde', 'eclipse', 'moon-phase', etc.
  event_name VARCHAR(255) NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  intensity INTEGER CHECK (intensity BETWEEN 1 AND 10),
  affected_planets JSONB, -- ['mercury', 'venus']
  aspect_type VARCHAR(50), -- 'conjunction', 'opposition', etc.
  description TEXT,
  advice TEXT,
  is_global BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_events_date_range ON astrological_events (start_date, end_date);
CREATE INDEX idx_events_type ON astrological_events (event_type);
CREATE INDEX idx_events_global ON astrological_events (is_global);
```

### 3.2 `user_reminders` Table
```sql
CREATE TABLE user_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL, -- 'all', 'major-transits', etc.
  reminder_type VARCHAR(20) NOT NULL, -- 'email', 'push'
  reminder_advance_hours INTEGER[] NOT NULL, -- [24, 72, 168]
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_reminders_user ON user_reminders (user_id);
CREATE INDEX idx_reminders_active ON user_reminders (is_active);
```

### 3.3 `user_calendar_views` Table
```sql
CREATE TABLE user_calendar_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  view_date DATE NOT NULL,
  viewed_events JSONB, -- Track which events were viewed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_views_user_date ON user_calendar_views (user_id, view_date);
```

---

## 4. Frontend Components

### 4.1 CalendarView Component
**File:** `frontend/src/components/CalendarView.tsx`

```typescript
interface CalendarViewProps {
  month: number;
  year: number;
  onDateSelect: (date: Date) => void;
}

interface CalendarViewProps {
  month: number;
  year: number;
  onDateSelect: (date: Date) => void;
}

// Features:
// - Month grid view (7 columns x 5-6 rows)
// - Event badges on dates (colored dots)
// - Intensity color coding (green/yellow/red)
// - Month navigation (prev/next)
// - Today highlight
// - Event filtering toggle
```

### 4.2 DailyWeather Component
**File:** `frontend/src/components/DailyWeather.tsx`

```typescript
interface DailyWeatherProps {
  date: Date;
  weather: DailyWeather;
}

// Features:
// - Moon phase icon and illumination %
// - One-sentence summary
// - Lucky/unlucky activities
// - Major aspects in effect
// - Color-coded rating (1-10)
```

### 4.3 ReminderSettings Component
**File:** `frontend/src/components/ReminderSettings.tsx`

```typescript
interface ReminderSettingsProps {
  onSave: (settings: ReminderSettings) => void;
}

// Features:
// - Event type checkboxes
// - Advance time selector (1 day, 3 days, 1 week)
// - Delivery method toggles (email/push)
// - Test notification button
// - Global on/off switch
```

### 4.4 CalendarExport Component
**File:** `frontend/src/components/CalendarExport.tsx`

```typescript
interface CalendarExportProps {
  startDate: Date;
  endDate: Date;
}

// Features:
// - Date range picker
// - Include personal events toggle
// - Export to iCal button (download .ics file)
// - Export to Google Calendar button (deep link)
// - Copy iCal link button
```

---

## 5. Content & Interpretations

### 5.1 Global Event Interpretations

**File:** `backend/src/data/astrologicalEvents.ts`

```typescript
const MERCURY_RETROGRADE = {
  keywords: ["communication delays", "technology glitches", "misunderstandings"],
  description: "Mercury appears to move backward in the sky, often bringing communication challenges and technology mishaps.",
  advice: [
    "Back up all important data",
    "Avoid signing contracts or making major purchases",
    "Double-check travel arrangements",
    "Review and revise existing plans",
    "Practice patience in communications"
  ],
  challenges: [
    "Miscommunications",
    "Travel delays",
    "Technology failures",
    "Lost items"
  ],
  opportunities: [
    "Revisiting old projects",
    "Reconnecting with people from the past",
    "Deep thinking and reflection",
    "Editing and refining work"
  ]
};

// Similar objects for:
// - VENUS_RETROGRADE (every 18 months)
// - MARS_RETROGRADE (every 26 months)
// - JUPITER_RETROGRADE (annual, ~4 months)
// - SATURN_RETROGRADE (annual, ~4.5 months)
// - ECLIPSES (solar and lunar)
// - SEASONAL_INGRESS (solstices and equinoxes)
```

### 5.2 Moon Phase Meanings

```typescript
const MOON_PHASES = {
  new: {
    intention: "Set new intentions and plant seeds",
    energy: "Inner, reflective, new beginnings",
    advice: "Start new projects, set goals, visualize desires"
  },
  waxing_crescent: {
    intention: "Nurture your intentions",
    energy: "Growing, expanding, committed",
    advice: "Take action on goals, stay focused"
  },
  first_quarter: {
    intention: "Face challenges and overcome obstacles",
    energy: "Active, decisive, action-oriented",
    advice: "Make decisions, push through resistance"
  },
  waxing_gibbous: {
    intention: "Refine and adjust your approach",
    energy: "Analytical, preparing, refining",
    advice: "Fine-tune plans, stay flexible"
  },
  full: {
    intention: "Celebrate and release",
    energy: "Culminating, illuminating, emotional",
    advice: "Release what no longer serves, celebrate achievements"
  },
  waning_gibbous: {
    intention: "Share and distribute",
    energy: "Sharing, teaching, grateful",
    advice: "Share wisdom, express gratitude"
  },
  last_quarter: {
    intention: "Reflect and release",
    energy: "Reflective, releasing, letting go",
    advice: "Release attachments, forgive, clear space"
  },
  waning_crescent: {
    intention: "Rest and restore",
    energy: "Resting, surrendering, emptying",
    advice: "Rest, meditate, clear mind for next cycle"
  }
};
```

### 5.3 Transit Intensity Scoring

```typescript
function calculateTransitIntensity(transit: TransitEvent): number {
  let score = 5; // Base score

  // Aspect weight
  const aspectWeights = {
    conjunction: 4,
    opposition: 3,
    square: 2,
    trine: 1,
    sextile: 0
  };
  score += aspectWeights[transit.aspectType];

  // Planet importance
  const planetWeights = {
    sun: 3,
    moon: 3,
    mercury: 1,
    venus: 1,
    mars: 2,
    jupiter: 2,
    saturn: 3,
    uranus: 2,
    neptune: 1,
    pluto: 2
  };
  score += planetWeights[transit.transitingPlanet];

  // Orb tightness (closer = more intense)
  if (transit.orb < 1) score += 2;
  else if (transit.orb < 2) score += 1;
  else if (transit.orb > 5) score -= 1;

  // Applying vs separating (applying = more intense)
  if (transit.applying) score += 1;

  // Clamp to 1-10
  return Math.max(1, Math.min(10, score));
}
```

---

## 6. Notification System

### 6.1 Email Templates

**File:** `backend/src/templates/calendar-email.html`

```html
<!-- Subject: Upcoming Astrological Event: {eventName} -->

<div class="email-container">
  <h2>🌟 {eventName} approaching</h2>

  <p>Hi {userName},</p>

  <p>You have an important astrological event coming up:</p>

  <div class="event-card">
    <h3>{eventName}</h3>
    <p><strong>Date:</strong> {eventDate}</p>
    <p><strong>Intensity:</strong> {intensity}/10</p>
    <p><strong>Description:</strong> {description}</p>
  </div>

  <div class="advice-section">
    <h4>💡 Advice</h4>
    <ul>
      {adviceItems.map(item => <li>{item}</li>)}
    </ul>
  </div>

  <p>View your full calendar <a href="{calendarUrl}">here</a>.</p>

  <p>Best,<br>AstroSaaS Team</p>
</div>
```

### 6.2 Push Notification Format

```typescript
interface PushNotification {
  title: string;
  body: string;
  icon: string;
  click_action: string;
  data: {
    eventId: string;
    eventType: string;
    date: string;
  };
}

// Example:
{
  title: "Mercury Retrograde in 3 days",
  body: "Communication may be challenging starting Feb 15. Back up your data!",
  icon: "/icons/mercury-retrograde.png",
  click_action: "/calendar?date=2026-02-15",
  data: {
    eventId: "evt_123",
    eventType: "retrograde",
    date: "2026-02-15"
  }
}
```

---

## 7. Testing Strategy

### 7.1 Unit Tests
- [ ] Calendar calculation tests (retrograde periods, eclipses, moon phases)
- [ ] Transit intensity scoring tests
- [ ] iCal generation format validation
- [ ] Notification scheduling tests

### 7.2 Integration Tests
- [ ] API endpoint tests (month, day, reminders, export)
- [ ] Database query tests
- [ ] Email delivery tests
- [ ] Push notification tests

### 7.3 E2E Tests
- [ ] Calendar view loading
- [ ] Event detail modal opening
- [ ] Reminder setting flow
- [ ] Calendar export flow

### 7.4 Performance Tests
- [ ] Calendar page load time < 2 seconds
- [ ] API response time < 500ms (p95)
- [ ] Notification delivery < 5 seconds
- [ ] Export generation < 1 second

---

## 8. Implementation Checklist

### Week 1: Backend Foundation
- [ ] Create calendar service with event calculations
- [ ] Create database migrations
- [ ] Implement API endpoints
- [ ] Write interpretation content
- [ ] Unit tests for calendar service

### Week 2: Frontend Development
- [ ] Build CalendarView component
- [ ] Build DailyWeather component
- [ ] Build ReminderSettings component
- [ ] Build CalendarExport component
- [ ] Integrate with API

### Week 3: Notifications & Polish
- [ ] Set up email service (SendGrid/Mailgun)
- [ ] Set up push notifications (Firebase)
- [ ] Create email templates
- [ ] E2E testing
- [ ] Performance optimization
- [ ] Bug fixes and refinement

---

## 9. Success Metrics

### Technical Metrics
- API response time: < 500ms (p95)
- Calendar page load: < 2 seconds
- Notification delivery rate: > 98%
- Export success rate: > 99%

### User Engagement Metrics
- DAU increase: +40%
- Calendar page views per user: +10/month
- Reminder opt-in rate: > 60%
- Export usage: > 20% of users

### Business Metrics
- Premium conversion: +15%
- User retention (30-day): +20%
- Feature satisfaction: > 4.5/5

---

**Ready for development! All specifications complete.** ✅
