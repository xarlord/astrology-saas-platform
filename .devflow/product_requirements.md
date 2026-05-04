# Product Requirements Document (PRD)
## AstroVerse - Astrology SaaS Platform

**Version:** 2.0
**Date:** 2026-02-24
**Status:** Draft

---

## 1. Executive Summary

### 1.1 Product Vision
AstroVerse is a premium astrology SaaS platform that provides personalized natal chart calculations, transit forecasts, compatibility analysis, and educational content. The platform combines accurate astronomical calculations with intuitive UI to deliver actionable astrological insights.

### 1.2 Target Users
- **Primary:** Astrology enthusiasts (ages 25-45)
- **Secondary:** Professional astrologers
- **Tertiary:** Casual users curious about astrology

### 1.3 Success Metrics
- User retention > 40% (30-day)
- Chart creation completion rate > 80%
- Premium conversion rate > 5%
- NPS score > 50

---

## 2. Functional Requirements

### 2.1 Authentication & User Management

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| AUTH-001 | Users can register with email/password | P0 | ✅ |
| AUTH-002 | Users can register via Google OAuth | P0 | ✅ |
| AUTH-003 | Users can register via Apple OAuth | P1 | ✅ |
| AUTH-004 | Users can login with email/password | P0 | ✅ |
| AUTH-005 | Users can login via social providers | P0 | ✅ |
| AUTH-006 | Users can reset password via email | P1 | ✅ |
| AUTH-007 | Session persistence with "Remember Me" | P1 | ✅ |
| AUTH-008 | Email verification required | P2 | Pending |
| AUTH-009 | Two-factor authentication | P3 | Pending |

### 2.2 Chart Management

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| CHART-001 | Create natal chart with birth data | P0 | ✅ |
| CHART-002 | Multi-step chart creation wizard | P0 | ✅ |
| CHART-003 | Location search with autocomplete | P0 | ✅ |
| CHART-004 | Unknown birth time handling | P1 | ✅ |
| CHART-005 | House system selection (Placidus, Koch, Whole Sign, etc.) | P1 | ✅ |
| CHART-006 | Zodiac type selection (Tropical, Sidereal) | P1 | ✅ |
| CHART-007 | Save unlimited charts (Pro) | P1 | ✅ |
| CHART-008 | Organize charts with folders/tags | P2 | Partial |
| CHART-009 | Chart search and filter | P1 | ✅ |
| CHART-010 | Edit saved charts | P1 | ✅ |
| CHART-011 | Delete charts | P1 | ✅ |
| CHART-012 | Share charts via link | P2 | Partial |
| CHART-013 | Export chart as PDF | P2 | ✅ |
| CHART-014 | Print quality chart images | P3 | Pending |

### 2.3 Chart Display & Interpretation

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| DISP-001 | Interactive chart wheel with hover tooltips | P0 | ✅ |
| DISP-002 | Planetary positions table | P0 | ✅ |
| DISP-003 | House cusps display | P0 | ✅ |
| DISP-004 | Aspect lines visualization | P0 | ✅ |
| DISP-005 | Element/Modality balance | P1 | ✅ |
| DISP-006 | Big Three summary (Sun, Moon, Rising) | P0 | ✅ |
| DISP-007 | Planet-in-house interpretations | P1 | ✅ |
| DISP-008 | Aspect interpretations | P1 | ✅ |
| DISP-009 | Tabbed view (Summary, Planets, Houses, Aspects) | P1 | ✅ |
| DISP-010 | Chart strength scoring | P2 | Partial |

### 2.4 Transit Forecasting

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| TRANS-001 | Daily transit overview | P0 | ✅ |
| TRANS-002 | Weekly transit forecast | P0 | ✅ |
| TRANS-003 | Monthly transit forecast | P1 | ✅ |
| TRANS-004 | Transit-to-natal aspect calculations | P0 | ✅ |
| TRANS-005 | Planetary position display | P0 | ✅ |
| TRANS-006 | Moon phase tracking | P0 | ✅ |
| TRANS-007 | Energy score calculation | P1 | ✅ |
| TRANS-008 | Category-tagged events (Career, Love, etc.) | P1 | ✅ |
| TRANS-009 | Orb degree display | P1 | ✅ |
| TRANS-010 | Personalized insights | P2 | Partial |
| TRANS-011 | Transit calendar integration | P2 | Partial |
| TRANS-012 | Transit notifications | P2 | Partial |

### 2.5 Lunar Returns

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| LUNAR-001 | Current lunar return calculation | P0 | ✅ |
| LUNAR-002 | Time until next lunar return | P0 | ✅ |
| LUNAR-003 | Lunar return chart generation | P0 | ✅ |
| LUNAR-004 | Moon phase and illumination | P0 | ✅ |
| LUNAR-005 | Cycle progress tracking | P1 | ✅ |
| LUNAR-006 | Key aspects for lunar return | P1 | ✅ |
| LUNAR-007 | Forecast themes | P1 | ✅ |
| LUNAR-008 | Life area impact predictions | P2 | Partial |
| LUNAR-009 | Past returns timeline | P1 | ✅ |
| LUNAR-010 | Recommended rituals | P2 | Partial |
| LUNAR-011 | Journal prompts | P2 | Partial |

### 2.6 Solar Returns

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| SOLAR-001 | Annual solar return calculation | P0 | ✅ |
| SOLAR-002 | Year-over-year comparison | P1 | Partial |
| SOLAR-003 | Solar return chart generation | P0 | ✅ |
| SOLAR-004 | Annual themes display | P1 | ✅ |
| SOLAR-005 | Quarterly energy forecast | P1 | ✅ |
| SOLAR-006 | House activation analysis | P1 | ✅ |
| SOLAR-007 | Key dates table | P1 | ✅ |
| SOLAR-008 | Power date indicators | P2 | ✅ |
| SOLAR-009 | Download annual report | P2 | Partial |
| SOLAR-010 | Birthday reminders | P2 | Partial |

### 2.7 Synastry & Compatibility

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| SYN-001 | Select two charts for comparison | P0 | ✅ |
| SYN-002 | Overall compatibility score | P0 | ✅ |
| SYN-003 | Category breakdown (Romance, Communication, etc.) | P0 | ✅ |
| SYN-004 | Composite chart generation | P1 | ✅ |
| SYN-005 | Key aspects analysis | P0 | ✅ |
| SYN-006 | Harmony/Tension indicators | P1 | ✅ |
| SYN-007 | Generate full compatibility report | P2 | Partial |
| SYN-008 | Share compatibility results | P2 | Partial |
| SYN-009 | Save favorite comparisons | P2 | Partial |

### 2.8 Calendar & Events

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| CAL-001 | Monthly calendar view | P0 | ✅ |
| CAL-002 | Weekly calendar view | P1 | Partial |
| CAL-003 | List view | P1 | Partial |
| CAL-004 | Moon phases on calendar | P0 | ✅ |
| CAL-005 | Astrological event badges | P0 | ✅ |
| CAL-006 | Event detail panel | P1 | ✅ |
| CAL-007 | Add to external calendar | P2 | Partial |
| CAL-008 | Personal event creation | P2 | Partial |
| CAL-009 | Event reminders | P2 | Partial |
| CAL-010 | Upcoming events timeline | P1 | ✅ |

### 2.9 Learning Center

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| LEARN-001 | Course catalog | P1 | ✅ |
| LEARN-002 | Learning path tracking | P2 | Partial |
| LEARN-003 | Knowledge base categories | P1 | ✅ |
| LEARN-004 | Article/lesson display | P1 | ✅ |
| LEARN-005 | Video content support | P2 | Partial |
| LEARN-006 | Progress tracking | P2 | Partial |
| LEARN-007 | Bookmark lessons | P2 | Partial |
| LEARN-008 | Community forum link | P3 | Partial |

### 2.10 User Profile & Settings

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| PROF-001 | Edit profile information | P0 | ✅ |
| PROF-002 | Profile photo upload | P1 | ✅ |
| PROF-003 | Birth data editing | P1 | ✅ |
| PROF-004 | Notification preferences | P1 | ✅ |
| PROF-005 | Privacy settings | P2 | Partial |
| PROF-006 | Subscription management | P1 | ✅ |
| PROF-007 | Account deletion | P2 | Partial |
| PROF-008 | Data export | P2 | Pending |

---

## 3. Non-Functional Requirements

### 3.1 Performance

| ID | Requirement | Target |
|----|-------------|--------|
| PERF-001 | Page load time | < 3 seconds |
| PERF-002 | Chart calculation time | < 2 seconds |
| PERF-003 | API response time | < 500ms (p95) |
| PERF-004 | Time to Interactive | < 5 seconds |
| PERF-005 | Core Web Vitals - LCP | < 2.5s |
| PERF-006 | Core Web Vitals - FID | < 100ms |
| PERF-007 | Core Web Vitals - CLS | < 0.1 |

### 3.2 Availability

| ID | Requirement | Target |
|----|-------------|--------|
| AVAIL-001 | Uptime SLA | 99.9% |
| AVAIL-002 | Error rate | < 0.1% |
| AVAIL-003 | Graceful degradation | Yes |

### 3.3 Security

| ID | Requirement | Target |
|----|-------------|--------|
| SEC-001 | HTTPS everywhere | Required |
| SEC-002 | Password hashing | bcrypt/argon2 |
| SEC-003 | JWT token expiration | 7 days (refresh) |
| SEC-004 | Rate limiting | 100 req/15min |
| SEC-005 | Input validation | All endpoints |
| SEC-006 | XSS prevention | CSP headers |
| SEC-007 | CSRF protection | Required |
| SEC-008 | SQL injection prevention | Parameterized queries |

### 3.4 Accessibility

| ID | Requirement | Target |
|----|-------------|--------|
| A11Y-001 | WCAG compliance | 2.1 AA |
| A11Y-002 | Screen reader support | Full |
| A11Y-003 | Keyboard navigation | Full |
| A11Y-004 | Color contrast ratio | 4.5:1 minimum |
| A11Y-005 | Focus indicators | Visible |
| A11Y-006 | Alt text for images | All images |

### 3.5 Compatibility

| ID | Requirement | Target |
|----|-------------|--------|
| COMP-001 | Browser support | Chrome, Firefox, Safari, Edge (latest 2 versions) |
| COMP-002 | Mobile support | iOS 14+, Android 10+ |
| COMP-003 | Responsive breakpoints | 320px, 768px, 1024px, 1440px |
| COMP-004 | PWA support | Yes |

---

## 4. Data Requirements

### 4.1 User Data

```
User {
  id: UUID
  email: string (unique)
  password_hash: string
  name: string
  display_name: string?
  avatar_url: string?
  bio: string?
  birth_date: date?
  birth_time: time?
  birth_location: string?
  birth_latitude: float?
  birth_longitude: float?
  timezone: string?
  email_verified: boolean
  created_at: timestamp
  updated_at: timestamp
}
```

### 4.2 Chart Data

```
Chart {
  id: UUID
  user_id: UUID (FK)
  name: string
  type: enum (natal, solar_return, lunar_return, synastry)
  birth_date: date
  birth_time: time?
  birth_location: string
  birth_latitude: float
  birth_longitude: float
  timezone: string
  house_system: string
  zodiac_type: string
  calculated_data: JSON
  tags: string[]
  notes: string?
  is_favorite: boolean
  created_at: timestamp
  updated_at: timestamp
}
```

### 4.3 Storage Requirements

| Data Type | Est. Size per Record | Est. Records/User | Total Est. |
|-----------|---------------------|-------------------|------------|
| User | 2 KB | 1 | 2 KB |
| Chart | 50 KB | 10-100 | 500 KB - 5 MB |
| Events | 1 KB | 1000/year | 1 MB/year |
| Learning Progress | 5 KB | 1 | 5 KB |

---

## 5. Integration Requirements

### 5.1 External Services

| Service | Purpose | Priority |
|---------|---------|----------|
| Swiss Ephemeris | Astronomical calculations | P0 |
| Geocoding API | Location search | P0 |
| Email Service | Transactional emails | P1 |
| Payment Provider | Subscription billing | P1 |
| Analytics | Usage tracking | P2 |
| Error Tracking | Bug monitoring | P1 |

### 5.2 API Integrations

| Integration | Purpose | Priority |
|-------------|---------|----------|
| Google OAuth | Social login | P0 |
| Apple OAuth | Social login | P1 |
| Google Calendar | Calendar export | P2 |
| Apple Calendar | Calendar export | P2 |

---

## 6. Constraints

### 6.1 Technical Constraints
- Node.js backend with Express
- React frontend with TypeScript
- PostgreSQL database
- Must work without Swiss Ephemeris native module (fallback to mock)

### 6.2 Business Constraints
- Freemium model with Pro tier
- Chart storage limits for free users
- Premium features: detailed reports, unlimited charts, advanced forecasts

### 6.3 Regulatory Constraints
- GDPR compliance for EU users
- CCPA compliance for California users
- Privacy policy required
- Terms of service required

---

## 7. Release Phases

### Phase 1: MVP (Complete)
- Authentication
- Chart creation and display
- Basic transit forecasts
- Dashboard

### Phase 2: Core Features (In Progress)
- Lunar returns
- Solar returns
- Synastry
- Calendar view
- Learning center

### Phase 3: Premium Features
- Detailed reports
- PDF exports
- Advanced forecasts
- Priority support

### Phase 4: Scale
- Mobile app
- API for third-party
- White-label options
