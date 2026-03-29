# Test Specification Document
## AstroVerse - UI Overhaul Testing Plan

**Version:** 1.0
**Date:** 2026-02-24
**Status:** Draft

---

## 1. Testing Overview

### 1.1 Testing Strategy
This document defines the comprehensive testing approach for all 18 UI pages of the AstroVerse platform. Testing will be performed at multiple levels:
- **Unit Tests** - Component-level testing with Jest/React Testing Library
- **Integration Tests** - API integration and data flow testing
- **E2E Tests** - Full user flow testing with Playwright
- **Accessibility Tests** - WCAG 2.1 AA compliance testing
- **Visual Regression Tests** - UI consistency testing

### 1.2 Testing Tools
| Tool | Purpose | Coverage Target |
|------|---------|-----------------|
| Jest + RTL | Unit/Integration | 80% |
| Playwright | E2E | 100% flows |
| axe-core | Accessibility | WCAG 2.1 AA |
| Percy/Chromatic | Visual Regression | All pages |
| Lighthouse | Performance | Score > 90 |

---

## 2. Test Coverage by Page

### 2.1 Landing Page (01-landing-page.html)

#### Unit Tests
```typescript
describe('LandingPage', () => {
  it('renders hero section with animated zodiac wheel');
  it('displays feature showcase cards');
  it('shows testimonials carousel');
  it('renders pricing tiers correctly');
  it('validates newsletter subscription form');
  it('displays social proof statistics');
  it('navigates to registration on CTA click');
});
```

#### E2E Tests
```typescript
describe('Landing Page E2E', () => {
  it('page loads within 3 seconds');
  it('zodiac wheel animation plays smoothly');
  it('testimonials carousel auto-advances');
  it('pricing toggle switches monthly/yearly');
  it('newsletter form submits successfully');
  it('all navigation links work');
  it('responsive at 320px, 768px, 1024px, 1440px');
});
```

#### Accessibility Tests
```typescript
describe('Landing Page A11y', () => {
  it('has no axe violations');
  it('all images have alt text');
  it('color contrast meets 4.5:1 ratio');
  it('keyboard navigation works');
  it('focus indicators are visible');
});
```

---

### 2.2 Login Page (02-login-page.html)

#### Unit Tests
```typescript
describe('LoginPage', () => {
  it('renders email and password inputs');
  it('validates email format');
  it('shows password strength indicator');
  it('disables submit with invalid inputs');
  it('shows error message on failed login');
  it('redirects to dashboard on success');
  it('toggles password visibility');
  it('handles remember me checkbox');
});
```

#### E2E Tests
```typescript
describe('Login E2E', () => {
  it('successful login redirects to dashboard');
  it('invalid credentials show error message');
  it('Google OAuth button initiates OAuth flow');
  it('Apple OAuth button initiates OAuth flow');
  it('forgot password link navigates correctly');
  it('session persists with remember me');
  it('rate limiting works after 5 failures');
});
```

#### Integration Tests
```typescript
describe('Login API Integration', () => {
  it('POST /auth/login returns JWT token');
  it('token stored in localStorage/cookies');
  it('auth header set for subsequent requests');
  it('refresh token flow works');
});
```

---

### 2.3 Registration Page (03-registration-page.html)

#### Unit Tests
```typescript
describe('RegistrationPage', () => {
  it('renders multi-step form');
  it('validates step 1: email and password');
  it('validates step 2: name and display name');
  it('validates step 3: terms acceptance');
  it('shows progress indicator');
  it('allows navigation between steps');
  it('submits complete form');
  it('shows password requirements');
});
```

#### E2E Tests
```typescript
describe('Registration E2E', () => {
  it('completes full registration flow');
  it('shows validation errors per step');
  it('social registration works');
  it('email verification sent');
  it('duplicate email shows appropriate error');
  it('redirects to dashboard after verification');
});
```

---

### 2.4 Dashboard (04-dashboard.html)

#### Unit Tests
```typescript
describe('Dashboard', () => {
  it('renders personalized greeting');
  it('displays daily insights badge');
  it('shows moon phase correctly');
  it('renders cosmic energy gauge');
  it('displays major transit card');
  it('shows planetary positions grid');
  it('renders upcoming transits list');
  it('displays saved charts quick access');
  it('shows quick actions grid');
  it('notification center displays alerts');
});
```

#### E2E Tests
```typescript
describe('Dashboard E2E', () => {
  it('loads all dashboard widgets');
  it('cosmic energy gauge animates');
  it('clicking transit card opens details');
  it('quick actions navigate correctly');
  it('saved charts link to detail page');
  it('notification bell shows count');
  it('real-time updates work (WebSocket)');
});
```

#### Integration Tests
```typescript
describe('Dashboard API Integration', () => {
  it('GET /dashboard/summary returns all data');
  it('GET /transits/today returns daily transits');
  it('GET /moon-phase returns current phase');
  it('GET /charts returns user charts');
  it('handles API errors gracefully');
});
```

---

### 2.5 Calendar Page (05-calendar-page.html)

#### Unit Tests
```typescript
describe('CalendarPage', () => {
  it('renders monthly calendar view');
  it('renders weekly view toggle');
  it('renders list view toggle');
  it('displays moon phase icons');
  it('shows event badges with correct colors');
  it('navigates between months');
  it('today button returns to current date');
  it('detail panel shows selected date events');
  it('renders event legend');
  it('shows upcoming events timeline');
});
```

#### E2E Tests
```typescript
describe('Calendar E2E', () => {
  it('month navigation works correctly');
  it('clicking date opens detail panel');
  it('event badges display correctly');
  it('add to calendar button works');
  it('view toggle switches views');
  it('event filtering works');
  it('month offset is correct (1-12)');
});
```

#### Integration Tests
```typescript
describe('Calendar API Integration', () => {
  it('GET /calendar/month/:year/:month returns events');
  it('GET /calendar/week/:year/:week returns events');
  it('month parameter validation (1-12)');
  it('events include moon phases');
  it('events include planetary aspects');
});
```

---

### 2.6 Synastry Compatibility (06-synastry-compatibility.html)

#### Unit Tests
```typescript
describe('SynastryPage', () => {
  it('renders Person 1 and Person 2 selectors');
  it('chart picker modal opens');
  it('compare button triggers analysis');
  it('displays overall compatibility score');
  it('shows category breakdown');
  it('renders composite mini chart');
  it('displays key aspects list');
  it('generate report button works');
  it('share functionality available');
  it('save favorite functionality');
});
```

#### E2E Tests
```typescript
describe('Synastry E2E', () => {
  it('selects charts from saved list');
  it('compare button triggers calculation');
  it('compatibility score displays correctly');
  it('category scores match design');
  it('key aspects populate correctly');
  it('generate full report works');
  it('share modal opens');
  it('API returns valid synastry data');
});
```

#### Integration Tests
```typescript
describe('Synastry API Integration', () => {
  it('POST /synastry/compare returns analysis');
  it('compatibility score calculation correct');
  it('category breakdown accurate');
  it('key aspects returned');
  it('composite chart generated');
  it('error handling for missing charts');
});
```

---

### 2.7 Profile Settings (07-profile-settings.html)

#### Unit Tests
```typescript
describe('ProfileSettings', () => {
  it('renders profile photo upload');
  it('shows animated gradient border on avatar');
  it('displays PRO badge');
  it('shows zodiac badges');
  it('renders tab navigation');
  it('personal info form validates');
  it('birth data form saves');
  it('notification toggles work');
  it('subscription management displays');
  it('character counter for bio');
});
```

#### E2E Tests
```typescript
describe('Profile Settings E2E', () => {
  it('profile photo upload works');
  it('personal info saves successfully');
  it('birth data updates');
  it('notification preferences save');
  it('subscription upgrade flow works');
  it('account deletion confirmation works');
  it('changes persist after page reload');
});
```

---

### 2.8 Transit Forecast (08-transit-forecast.html)

#### Unit Tests
```typescript
describe('TransitForecast', () => {
  it('renders date range toggle');
  it('displays daily energy meter');
  it('shows moon phase');
  it('renders timeline feed');
  it('displays aspect type badges');
  it('shows category tags');
  it('displays orb degree');
  it('renders duration bars');
  it('mini calendar displays');
  it('planetary positions panel shows');
});
```

#### E2E Tests
```typescript
describe('Transit Forecast E2E', () => {
  it('today/week/month toggle works');
  it('energy meter animates');
  it('timeline cards expand');
  it('category filtering works');
  it('mini calendar navigation');
  it('planetary positions accurate');
  it('public access works without auth');
});
```

---

### 2.9 Lunar Returns (09-lunar-returns.html)

#### Unit Tests
```typescript
describe('LunarReturns', () => {
  it('renders current cycle display');
  it('shows time remaining countdown');
  it('displays cycle progress bar');
  it('shows moon phase and illumination');
  it('displays intensity score');
  it('renders key aspects');
  it('shows forecast themes');
  it('displays life areas grid');
  it('renders past returns timeline');
  it('shows recommended rituals');
});
```

#### E2E Tests
```typescript
describe('Lunar Returns E2E', () => {
  it('loads lunar return data');
  it('countdown updates in real-time');
  it('key aspects display correctly');
  it('past returns populate');
  it('API integration works');
  it('journal prompts display');
});
```

---

### 2.10 Natal Chart Detail (10-natal-chart-detail.html)

#### Unit Tests
```typescript
describe('NatalChartDetail', () => {
  it('renders interactive chart wheel');
  it('displays planetary positions table');
  it('shows house cusps');
  it('renders aspect visualization');
  it('tab navigation works');
  it('displays Big Three');
  it('shows major aspects list');
  it('edit/download/share actions');
  it('view transits button works');
  it('hover tooltips on chart');
});
```

#### E2E Tests
```typescript
describe('Natal Chart Detail E2E', () => {
  it('chart wheel renders correctly');
  it('hover shows planet tooltips');
  it('tabs switch content');
  it('download PDF works');
  it('share link generates');
  it('view transits navigates');
  it('edit saves changes');
});
```

---

### 2.11 Chart Creation Wizard (11-chart-creation-wizard.html)

#### Unit Tests
```typescript
describe('ChartCreationWizard', () => {
  it('renders 3-step wizard');
  it('validates step 1: personal info');
  it('validates step 2: birth data');
  it('validates step 3: settings');
  it('date picker works');
  it('time picker with AM/PM toggle');
  it('unknown time checkbox');
  it('location autocomplete works');
  it('map preview shows coordinates');
  it('real-time chart preview');
  it('house system selection');
  it('zodiac type selection');
});
```

#### E2E Tests
```typescript
describe('Chart Creation E2E', () => {
  it('completes full wizard flow');
  it('location search returns results');
  it('chart preview updates in real-time');
  it('saves chart successfully');
  it('navigates between steps');
  it('unknown time handling');
  it('redirects to chart detail on save');
});
```

---

### 2.12 Solar Returns (12-solar-returns.html)

#### Unit Tests
```typescript
describe('SolarReturns', () => {
  it('renders annual forecast display');
  it('shows year selector tabs');
  it('displays days countdown');
  it('renders chart wheel');
  it('shows dominant themes');
  it('displays quarterly forecast');
  it('renders house activation ring');
  it('shows key dates table');
  it('compare years functionality');
  it('download annual report');
});
```

#### E2E Tests
```typescript
describe('Solar Returns E2E', () => {
  it('loads solar return data');
  it('year tabs switch content');
  it('countdown accurate');
  it('chart wheel displays');
  it('themes match calculations');
  it('API integration works');
  it('set reminder works');
});
```

---

### 2.13 404 Page (13-404-page.html)

#### Unit Tests
```typescript
describe('NotFoundPage', () => {
  it('renders animated space background');
  it('shows floating astronaut');
  it('displays error message');
  it('return home button works');
  it('go to dashboard button works');
  it('shows brand footer');
});
```

#### E2E Tests
```typescript
describe('404 Page E2E', () => {
  it('displays on invalid route');
  it('animations play smoothly');
  it('navigation buttons work');
  it('responsive design');
});
```

---

### 2.14 Detailed Natal Report (14-detailed-natal-report.html)

#### Unit Tests
```typescript
describe('DetailedNatalReport', () => {
  it('renders premium report container');
  it('displays Big Three interpretations');
  it('shows elemental balance visualization');
  it('renders chart strength analysis');
  it('planet-by-planet breakdown');
  it('aspect grid matrix');
  it('PDF download button');
  it('print order option');
  it('share functionality');
});
```

#### E2E Tests
```typescript
describe('Detailed Natal Report E2E', () => {
  it('generates full report');
  it('PDF download works');
  it('print functionality');
  it('share link generates');
  it('premium gate works');
});
```

---

### 2.15 Saved Charts Gallery (15-saved-charts-gallery.html)

#### Unit Tests
```typescript
describe('SavedChartsGallery', () => {
  it('renders grid/list view toggle');
  it('displays search functionality');
  it('shows sort options');
  it('renders folder organization');
  it('displays storage usage indicator');
  it('shows chart cards with info');
  it('quick actions work');
  it('create new chart placeholder');
});
```

#### E2E Tests
```typescript
describe('Saved Charts Gallery E2E', () => {
  it('loads user charts');
  it('search filters results');
  it('sort changes order');
  it('grid/list toggle works');
  it('chart card actions work');
  it('folder navigation');
  it('storage indicator accurate');
});
```

---

### 2.16 Learning Center (16-learning-center.html)

#### Unit Tests
```typescript
describe('LearningCenter', () => {
  it('renders featured course hero');
  it('displays progress tracking');
  it('shows resume learning button');
  it('renders learning paths');
  it('displays knowledge base categories');
  it('shows latest lessons sidebar');
  it('lesson thumbnails display');
  it('bookmark functionality');
  it('search functionality');
});
```

#### E2E Tests
```typescript
describe('Learning Center E2E', () => {
  it('course cards navigate');
  it('progress persists');
  it('categories filter content');
  it('bookmark saves');
  it('search returns results');
  it('community forum link works');
});
```

---

### 2.17 Solar Return Annual Report (17-solar-return-annual-report.html)

#### Unit Tests
```typescript
describe('SolarReturnAnnualReport', () => {
  it('renders yearly theme overview');
  it('shows chart comparison');
  it('displays key placements grid');
  it('renders 12-month timeline');
  it('shows power date indicators');
  it('accordion interpretations');
  it('PDF download');
  it('calendar integration');
});
```

#### E2E Tests
```typescript
describe('Solar Annual Report E2E', () => {
  it('generates annual report');
  it('chart comparison displays');
  it('timeline navigation');
  it('accordion expand/collapse');
  it('PDF download works');
  it('calendar integration');
});
```

---

### 2.18 New Chart Creation Flow (18-new-chart-creation-flow.html)

#### Unit Tests
```typescript
describe('ChartCreationFlow', () => {
  it('renders streamlined creation flow');
  it('validates all inputs');
  it('shows progress indicator');
  it('handles errors gracefully');
  it('saves draft');
  it('submits successfully');
});
```

---

## 3. API Endpoint Testing

### 3.1 Authentication Endpoints
| Endpoint | Method | Tests |
|----------|--------|-------|
| `/auth/register` | POST | Valid registration, duplicate email, validation errors |
| `/auth/login` | POST | Valid login, invalid credentials, rate limiting |
| `/auth/logout` | POST | Token invalidation |
| `/auth/refresh` | POST | Token refresh, expired token |
| `/auth/forgot-password` | POST | Email sent, invalid email |
| `/auth/reset-password` | POST | Valid reset, expired token |
| `/auth/google` | GET | OAuth flow initiation |
| `/auth/apple` | GET | OAuth flow initiation |

### 3.2 Chart Endpoints
| Endpoint | Method | Tests |
|----------|--------|-------|
| `/charts` | GET | List user charts, pagination, filtering |
| `/charts` | POST | Create chart, validation, calculation |
| `/charts/:id` | GET | Get chart details, not found, unauthorized |
| `/charts/:id` | PUT | Update chart, validation |
| `/charts/:id` | DELETE | Delete chart, not found |
| `/charts/:id/export` | GET | PDF export, format options |

### 3.3 Transit Endpoints
| Endpoint | Method | Tests |
|----------|--------|-------|
| `/transits/today` | GET | Daily transits, public access |
| `/transits/week` | GET | Weekly transits |
| `/transits/month` | GET | Monthly transits |
| `/transits/natal/:chartId` | GET | Transit-to-natal aspects |

### 3.4 Lunar/Solar Endpoints
| Endpoint | Method | Tests |
|----------|--------|-------|
| `/lunar-returns/next` | GET | Next lunar return |
| `/lunar-returns/history` | GET | Historical returns |
| `/solar-returns/current` | GET | Current solar return |
| `/solar-returns/history` | GET | Historical returns |

### 3.5 Synastry Endpoints
| Endpoint | Method | Tests |
|----------|--------|-------|
| `/synastry/compare` | POST | Compare two charts |
| `/synastry/report/:id` | GET | Get saved report |

### 3.6 Calendar Endpoints
| Endpoint | Method | Tests |
|----------|--------|-------|
| `/calendar/month/:year/:month` | GET | Month events, month validation (1-12) |
| `/calendar/week/:year/:week` | GET | Week events |
| `/calendar/events` | GET | All events with filters |

---

## 4. Performance Testing

### 4.1 Load Time Requirements
| Page | Target LCP | Target FID | Target CLS |
|------|-----------|-----------|-----------|
| Landing | < 2.0s | < 50ms | < 0.05 |
| Dashboard | < 2.5s | < 100ms | < 0.1 |
| Chart Detail | < 2.0s | < 50ms | < 0.05 |
| Calendar | < 2.5s | < 100ms | < 0.1 |

### 4.2 API Response Time Requirements
| Endpoint Category | Target (p95) |
|-------------------|--------------|
| Auth | < 200ms |
| Charts (read) | < 300ms |
| Charts (write) | < 500ms |
| Transits | < 300ms |
| Calendar | < 300ms |

---

## 5. Accessibility Testing

### 5.1 WCAG 2.1 AA Requirements
- [ ] All images have meaningful alt text
- [ ] Color contrast ratio ≥ 4.5:1 (3:1 for large text)
- [ ] Focus indicators visible
- [ ] Keyboard navigation complete
- [ ] Screen reader compatible
- [ ] No keyboard traps
- [ ] Form labels associated
- [ ] Error messages announced
- [ ] Skip navigation links
- [ ] Consistent navigation

### 5.2 Testing Tools
```bash
# Run axe accessibility tests
npm run test:a11y

# Lighthouse accessibility audit
npm run lighthouse:a11y
```

---

## 6. Visual Regression Testing

### 6.1 Pages for Visual Testing
All 18 pages require visual regression snapshots at:
- Desktop (1440px)
- Tablet (768px)
- Mobile (375px)

### 6.2 Snapshot Schedule
- Baseline: After initial implementation
- Comparison: After each PR
- Review: Manual review for approved changes

---

## 7. Test Execution Plan

### 7.1 CI/CD Pipeline
```yaml
test:
  - unit-tests
  - integration-tests
  - accessibility-tests

e2e:
  - critical-paths
  - all-flows

performance:
  - lighthouse-audit
  - load-testing
```

### 7.2 Test Commands
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Accessibility tests
npm run test:a11y

# All tests
npm run test:all

# Coverage report
npm run test:coverage
```

---

## 8. Bug Severity Levels

### Critical (P0)
- Application crash
- Data loss
- Security vulnerability
- Auth failure

### High (P1)
- Feature not working
- Incorrect data display
- API errors

### Medium (P2)
- UI inconsistency
- Minor functionality issue
- Performance degradation

### Low (P3)
- Cosmetic issues
- Minor UX improvements
- Documentation updates

---

## 9. Test Data Management

### 9.1 Test Users
```typescript
const testUsers = {
  free: { email: 'free@test.com', tier: 'free' },
  pro: { email: 'pro@test.com', tier: 'pro' },
  admin: { email: 'admin@test.com', tier: 'admin' }
};
```

### 9.2 Test Charts
```typescript
const testCharts = [
  { name: 'Test Chart 1', date: '1990-01-15', location: 'New York' },
  { name: 'Test Chart 2', date: '1985-06-20', location: 'London' }
];
```

---

## 10. Sign-off Criteria

### 10.1 Phase Completion
- [ ] All unit tests passing (80% coverage)
- [ ] All E2E tests passing
- [ ] No critical/high bugs open
- [ ] Accessibility audit passed
- [ ] Performance targets met
- [ ] Visual regression approved

### 10.2 Release Readiness
- [ ] All test phases complete
- [ ] Regression testing passed
- [ ] Security scan passed
- [ ] Documentation updated
- [ ] Stakeholder approval
