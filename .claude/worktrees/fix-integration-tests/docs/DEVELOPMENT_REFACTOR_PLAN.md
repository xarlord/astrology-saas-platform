# MoonCalender - Development & Refactor Plan

**Project:** MoonCalender Astrology SaaS Platform
**Date:** 2026-02-16
**Version:** 2.0
**Status:** Active Development

---

## 📊 Project Status Summary

### ✅ Completed Features (Phase 1)

#### Core MVP (Original)
- ✅ Natal chart generation with Swiss Ephemeris
- ✅ Personality analysis engine (120 planetary interpretations)
- ✅ Transit forecasting system
- ✅ User authentication (JWT, refresh tokens)
- ✅ Profile management
- ✅ PWA-ready frontend with React + TypeScript
- ✅ PostgreSQL database with migrations
- ✅ 90+ automated tests passing
- ✅ Docker containerization

#### Phase 1 Expansion Features (Quick Wins)
- ✅ **Astrological Calendar** (100% Complete)
  - Global events (retrogrades, eclipses, moon phases, ingresses)
  - Personalized transits
  - Daily astrological weather
  - Reminder settings (email/push)
  - iCal export
  - 27 files, 4,600+ lines, 90 tests passing

- ✅ **Lunar Returns** (100% Complete)
  - Lunar return calculations
  - Monthly forecasts
  - Journal prompts
  - Lunar return charts
  - Dashboard UI
  - 15+ files, 2,500+ lines

- ✅ **Synastry/Compatibility** (100% Complete)
  - Two-chart comparison
  - Compatibility scoring
  - Composite charts
  - Aspect analysis
  - Relationship insights
  - 15+ files, 2,500+ lines

---

## 🎯 Development Roadmap

### Phase 2: Premium Features (Recommended Next Steps)

**Timeline:** 2-3 months
**Priority:** High - Revenue-driving features
**Status:** 📋 Planning Phase

#### 2.1 Solar Return & Birthday Charts
**Priority:** P2 (Medium Effort, High Value)
**Estimated Time:** 2-3 weeks

**Features:**
- Solar return chart calculation (exact Sun return)
- Birthday-to-birthday themes
- Lucky days/dates analysis
- Major challenges and opportunities
- Relocation options (calculate for different locations)
- Birthday reading sharing (gift feature)
- Historical solar return analysis

**Technical Requirements:**
- Swiss Ephemeris: Find when transiting Sun returns to natal Sun position
- Calculation: Solar return chart wheel
- Interpretations: 12 house meanings × 10 planets = 120 interpretations
- Relocation: Timezone and coordinate adjustments

**Database Schema:**
```sql
CREATE TABLE solar_returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  chart_id UUID REFERENCES charts(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  return_date TIMESTAMP WITH TIME ZONE NOT NULL,
  return_location JSONB, -- {name, latitude, longitude, timezone}
  calculated_data JSONB NOT NULL, -- Chart data
  interpretation JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**API Endpoints:**
```
POST   /api/solar-returns/calculate
GET    /api/solar-returns/year/:year
GET    /api/solar-returns/:id
POST   /api/solar-returns/:id/recalculate (relocation)
GET    /api/solar-returns/history
```

**Frontend Components:**
- `SolarReturnDashboard.tsx` - List of solar returns by year
- `SolarReturnChart.tsx` - Chart visualization
- `SolarReturnInterpretation.tsx` - Birthday year themes
- `RelocationCalculator.tsx` - Calculate for different locations
- `BirthdaySharing.tsx` - Gift feature for sharing readings

**Content Requirements:**
- Solar return Sun in 12 houses (120 interpretations)
- Solar return Moon phases
- Lucky days calculation algorithm
- Birthday themes generator

**Success Metrics:**
- Annual recurring engagement
- 20% increase in premium subscriptions
- 15% sharing/gift rate

---

#### 2.2 Mobile-First PWA Enhancement
**Priority:** P2 (Medium Effort, High User Experience Impact)
**Estimated Time:** 2-3 weeks

**Current State:**
- ✅ Basic PWA configuration (manifest.json, service worker)
- ✅ Responsive design (mobile breakpoints)
- ⚠️ Offline mode not implemented
- ⚠️ Push notifications not implemented
- ⚠️ App installation prompts not optimized

**Enhancements Needed:**

**A. Offline Mode (1 week)**
```typescript
// Service Worker Enhancements
- Cache strategy: Network First for API, Cache First for assets
- Offline queue for chart calculations
- Sync when back online
- Offline indicator UI
- Cached charts viewing
```

**Implementation:**
```typescript
// Service worker cache strategies
const CACHE_STRATEGIES = {
  static: 'CacheFirst', // Assets, CSS, JS
  api: 'NetworkFirst',  // API calls
  charts: 'CacheFirst', // Viewed charts
  offline: 'CacheOnly'  // Offline page
};
```

**B. Push Notifications (1 week)**
```typescript
// Firebase Cloud Messaging Setup
- Firebase project configuration
- Web push notification setup
- Notification permission flow
- Background sync for astrological events
- Notification scheduling (retrogrades, lunar returns)
```

**Components:**
- `NotificationPermission.tsx` - Request push permissions
- `NotificationSettings.tsx` - Manage preferences
- `NotificationCenter.tsx` - View notification history

**C. Native-like Features (1 week)**
```typescript
// PWA Enhancements
- Install prompt (custom, not browser default)
- Home screen icon setup
- Splash screen
- App shortcuts (quick access to calendar, today's transits)
- Touch gestures (swipe between dates)
- Biometric authentication (WebAuthn)
```

**Technical Implementation:**
```typescript
// Install prompt
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent default banner
  e.preventDefault();
  // Show custom install button
  showInstallPrompt();
});

// App shortcuts
navigator.serviceWorker.register('/sw.js').then(() => {
  navigator.shortcuts?.add([
    { name: 'Today', url: '/calendar/today' },
    { name: 'My Charts', url: '/charts' }
  ]);
});
```

**Success Metrics:**
- 60%+ install rate on mobile
- 40%+ daily active users (push notifications)
- 3-5x increase in mobile engagement

---

#### 2.3 AI-Powered Interpretation Engine
**Priority:** P2 (High Effort, High Differentiation)
**Estimated Time:** 4-6 weeks

**Objective:** Use LLMs to generate personalized, context-aware interpretations

**Architecture:**
```
User Chart → Template Engine → AI Prompt → LLM → Interpretation
                                      ↓
                              Cache & Rate Limit
```

**Implementation Options:**

**Option A: OpenAI API (Recommended)**
```typescript
// Cost: $0.50 per 1K tokens
// Quality: High (GPT-4)
const generateInterpretation = async (chartData: Chart) => {
  const prompt = `
    You are an expert astrologer. Generate a personalized reading for:
    - Sun in ${chartData.planets.sun.sign}
    - Moon in ${chartData.planets.moon.sign}
    - Rising in ${chartData.ascendant}
    - Key aspects: ${chartData.majorAspects}

    Provide:
    1. Core identity (2-3 sentences)
    2. Emotional nature (2-3 sentences)
    3. Strengths (3 bullet points)
    4. Challenges (3 bullet points)
    5. Monthly focus (2-3 sentences)
  `;

  return await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 500
  });
};
```

**Option B: Local LLM (Ollama + Llama 3)**
```typescript
// Cost: Free (self-hosted)
// Quality: Good (Llama 3 70B)
// Privacy: 100% data stays on server
const generateInterpretation = async (chartData: Chart) => {
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    body: JSON.stringify({
      model: 'llama3:70b',
      prompt: generatePrompt(chartData),
      stream: false
    })
  });
  return response.json();
};
```

**Hybrid Approach (Recommended):**
```typescript
// Tier 1: Template-based (Free tier users)
const templateInterpretation = (chart: Chart) => {
  return lookupInterpretations(chart);
};

// Tier 2: AI-generated (Premium/Pro users)
const aiInterpretation = async (chart: Chart) => {
  // Check cache first
  const cached = await cache.get(`ai:${chart.id}`);
  if (cached) return cached;

  // Generate with AI
  const interpretation = await openai.generate(chart);

  // Cache for 30 days
  await cache.set(`ai:${chart.id}`, interpretation, 2592000);

  return interpretation;
};
```

**Features:**
- ✅ Context-aware synthesis (Sun × Moon × aspects)
- ✅ Natural language explanations
- ✅ Conversational interface ("Why do I feel X?")
- ✅ User feedback loop (thumbs up/down)
- ✅ Quality monitoring

**API Endpoints:**
```
POST   /api/ai/interpretation/generate
POST   /api/ai/interpretation/feedback
GET    /api/ai/interpretation/:id/variants
POST   /api/ai/chat (conversational)
```

**Pricing Strategy:**
- Free: Template-based interpretations
- Premium ($9.99/mo): 10 AI readings/month
- Pro ($29.99/mo): Unlimited AI readings + chat

**Success Metrics:**
- 40% upgrade rate from Free to Premium
- 4.5/5 satisfaction rating
- < 500ms average generation time
- < $0.10 per reading cost

---

### Phase 3: Scale & Ecosystem (Future)

**Timeline:** 6+ months
**Priority:** P3 (Long-term growth)

#### 3.1 Progressions & Secondary Progressions
**Estimated Time:** 3-4 weeks
- Secondary progression calculations
- Progressed Moon phase tracking
- Timeline view of evolution
- Integration with transit interpretations

#### 3.2 Community Features
**Estimated Time:** 6-8 weeks
- User profiles with chart badges
- Discussion forums
- Chart sharing (anonymized)
- "Chart of the Day"
- Karma/reputation system

#### 3.3 Learning Academy
**Estimated Time:** 8-10 weeks
- Structured astrology courses
- Interactive exercises
- Progress tracking
- Quizzes and badges
- Certification

#### 3.4 Marketplace for Professional Readings
**Estimated Time:** 10-12 weeks
- Professional astrologer profiles
- Booking system
- Video/text consultations
- Rating system
- Commission handling

---

## 🔄 Refactoring Priorities

### Immediate Refactoring Needs (Week 1-2)

#### 1. Code Organization
```
Current: Flat structure in controllers/services/routes
Target: Feature-based modules

backend/src/
├── modules/
│   ├── auth/           # Authentication module
│   ├── charts/         # Chart management
│   ├── calendar/       # Calendar features
│   ├── lunar/          # Lunar returns
│   ├── synastry/       # Compatibility
│   ├── transits/       # Transit forecasting
│   └── ai/             # AI interpretations (new)
├── shared/             # Shared utilities
└── config/             # Configuration
```

#### 2. Type Safety
```typescript
// Create shared types package
packages/
├── shared-types/       # TypeScript interfaces
├── shared-utils/       # Utility functions
└── shared-constants/   # Constants (NEW)
```

#### 3. Error Handling
```typescript
// Standardize error responses
class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
  }
}

// Central error handler
app.use((err: Error, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message
    });
  }
  // Log and respond
});
```

#### 4. API Versioning
```
Current: /api/calendar
Target: /api/v1/calendar, /api/v2/calendar

// Allows breaking changes without affecting existing clients
app.use('/api/v1', v1Routes);
app.use('/api/v2', v2Routes);
```

---

## 📋 Implementation Plan

### Sprint 1 (Week 1-2): Solar Returns
**Backend:**
- [ ] Create solar_returns migration
- [ ] Implement solar return calculation service
- [ ] Create solar return controller
- [ ] Add API routes
- [ ] Write interpretation content (120 entries)

**Frontend:**
- [ ] SolarReturnDashboard component
- [ ] SolarReturnChart component
- [ ] SolarReturnInterpretation component
- [ ] RelocationCalculator component
- [ ] BirthdaySharing component
- [ ] Unit & integration tests

**Testing:**
- [ ] Backend service tests (20+ tests)
- [ ] API endpoint tests (10+ tests)
- [ ] Frontend component tests (15+ tests)

---

### Sprint 2 (Week 3-4): PWA Enhancement
**Backend:**
- [ ] Set up Firebase Cloud Messaging
- [ ] Create notification service
- [ ] Add notification scheduler (cron jobs)
- [ ] Implement background sync endpoints

**Frontend:**
- [ ] Enhance service worker with offline support
- [ ] Create notification permission flow
- [ ] Add install prompt UI
- [ ] Implement app shortcuts
- [ ] Add offline indicator
- [ ] Biometric authentication (WebAuthn)

**Testing:**
- [ ] Offline mode tests
- [ ] Push notification tests
- [ ] Install flow tests
- [ ] Cross-browser testing (Chrome, Safari, Firefox)

---

### Sprint 3-4 (Week 5-8): AI Interpretations
**Backend:**
- [ ] Set up OpenAI API account
- [ ] Create AI service architecture
- [ ] Implement prompt engineering
- [ ] Add caching layer (Redis)
- [ ] Create rate limiting middleware
- [ ] Implement feedback loop
- [ ] Add cost monitoring

**Frontend:**
- [ ] AI interpretation display component
- [ ] Feedback UI (thumbs up/down)
- [ ] Chat interface (conversational)
- [ ] Loading states and skeletons
- [ ] Error handling and retries

**Testing:**
- [ ] AI generation tests
- [ ] Caching tests
- [ ] Rate limiting tests
- [ ] Cost analysis tests
- [ ] User feedback A/B testing

---

## 🎯 Success Metrics

### Phase 2 Goals
- **User Engagement:** 40% increase in DAU
- **Premium Conversion:** 20% upgrade rate
- **Revenue:** 30% increase in MRR
- **User Satisfaction:** 4.5/5 average rating
- **Performance:** < 500ms API response time (p95)
- **Mobile Install Rate:** 60%+ on mobile devices

---

## 🛠️ Technical Debt Tracker

### High Priority
- [ ] Implement API versioning
- [ ] Add comprehensive logging (Winston + Loki)
- [ ] Set up monitoring (Prometheus + Grafana)
- [ ] Add rate limiting per user
- [ ] Implement request caching (Redis)

### Medium Priority
- [ ] Refactor to feature-based modules
- [ ] Add GraphQL API (alternative to REST)
- [ ] Implement WebSocket for real-time updates
- [ ] Add database query optimization
- [ ] Create admin dashboard

### Low Priority
- [ ] Migrate to TypeScript 5.0+
- [ ] Upgrade to Node.js 20 LTS
- [ ] Implement microservices architecture
- [ ] Add internationalization (i18n)
- [ ] Create mobile native apps (React Native)

---

## 📚 Documentation Needs

- [ ] API documentation (OpenAPI/Swagger)
- [ ] Component storybook (Storybook)
- [ ] Architecture decision records (ADR)
- [ ] Onboarding guide for new developers
- [ ] User documentation (help center)

---

## 🚀 Deployment Strategy

### Environments
- **Development:** Local with Docker Compose
- **Staging:** Railway/Render (automatic deploys from develop)
- **Production:** Railway/Render (manual deploys from main)

### CI/CD Pipeline
```yaml
# GitHub Actions workflow
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    - Run unit tests
    - Run integration tests
    - Generate coverage report

  build:
    - Build Docker images
    - Push to registry

  deploy-staging:
    - Deploy to Railway (develop branch)

  deploy-production:
    - Deploy to Railway (main branch, manual approval)
```

---

## 📞 Contact & Support

**Project Lead:** MoonCalender Dev Team
**Repository:** git init (local)
**Documentation:** See README.md and docs/ folder

**Next Steps:**
1. Review and approve this plan
2. Set up project management tool (Linear, Jira, or GitHub Projects)
3. Assign developers to sprints
4. Begin Sprint 1 (Solar Returns)

---

**Last Updated:** 2026-02-16
**Version:** 2.0
**Status:** Ready for Implementation
