# Architecture Specification
## AstroVerse - Astrology SaaS Platform

**Version:** 2.0
**Date:** 2026-02-24

---

## 1. System Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    React Single Page Application                     │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐      │   │
│  │  │  Pages  │ │Components│ │  Hooks  │ │  Store  │ │Services │      │   │
│  │  │   18    │ │   50+   │ │   15+   │ │ Zustand │ │   API   │      │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ HTTPS/REST
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API LAYER                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      Express.js REST API                             │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐              │   │
│  │  │   Auth   │ │  Charts  │ │ Transits │ │ Calendar │              │   │
│  │  │   /auth  │ │ /charts  │ │/transits │ │/calendar │              │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘              │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐              │   │
│  │  │  Lunar   │ │  Solar   │ │ Synastry │ │ Learning │              │   │
│  │  │  /lunar  │ │  /solar  │ │/synastry │ │ /learn   │              │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
                    ▼                 ▼                 ▼
┌───────────────────────┐ ┌─────────────────┐ ┌─────────────────────┐
│    DATA LAYER          │ │  SERVICE LAYER  │ │  EXTERNAL SERVICES  │
│  ┌─────────────────┐   │ │ ┌─────────────┐ │ │ ┌─────────────────┐ │
│  │   PostgreSQL    │   │ │ │  Swiss      │ │ │ │  Geocoding API  │ │
│  │   Database      │   │ │ │  Ephemeris  │ │ │ │  (Location)     │ │
│  │                 │   │ │ │  Service    │ │ │ └─────────────────┘ │
│  │  - users        │   │ │ └─────────────┘ │ │ ┌─────────────────┐ │
│  │  - charts       │   │ │ ┌─────────────┐ │ │ │  Email Service  │ │
│  │  - events       │   │ │ │  Chart      │ │ │ │  (SendGrid)     │ │
│  │  - synastry     │   │ │ │  Calculator │ │ │ └─────────────────┘ │
│  │  - lunar_returns│   │ │ └─────────────┘ │ │ ┌─────────────────┐ │
│  │  - solar_returns│   │ │ ┌─────────────┐ │ │ │  OAuth Provider │ │
│  └─────────────────┘   │ │ │  Transit    │ │ │ │  (Google/Apple) │ │
│                        │ │ │  Calculator │ │ │ └─────────────────┘ │
│                        │ │ └─────────────┘ │ └─────────────────────┘
└───────────────────────┘ └─────────────────┘
```

---

## 2. Frontend Architecture

### 2.1 Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | React | 18.x |
| Language | TypeScript | 5.x |
| Build Tool | Vite | 5.x |
| Routing | React Router | 6.x |
| State Management | Zustand | 4.x |
| Data Fetching | TanStack Query | 5.x |
| Styling | TailwindCSS | 3.x |
| UI Components | Custom + Radix UI | - |
| Icons | Material Symbols | - |
| Charts | Custom SVG | - |
| Testing | Vitest + Playwright | - |

### 2.2 Directory Structure

```
frontend/
├── src/
│   ├── pages/                 # 18 page components
│   │   ├── LandingPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── CalendarPage.tsx
│   │   ├── SynastryPage.tsx
│   │   ├── ProfileSettingsPage.tsx
│   │   ├── TransitForecastPage.tsx
│   │   ├── LunarReturnsPage.tsx
│   │   ├── NatalChartDetailPage.tsx
│   │   ├── ChartCreationWizardPage.tsx
│   │   ├── SolarReturnsPage.tsx
│   │   ├── NotFoundPage.tsx
│   │   ├── DetailedNatalReportPage.tsx
│   │   ├── SavedChartsGalleryPage.tsx
│   │   ├── LearningCenterPage.tsx
│   │   ├── SolarReturnAnnualReportPage.tsx
│   │   └── ChartCreatePage.tsx
│   │
│   ├── components/            # Reusable components
│   │   ├── ui/               # Base UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Toggle.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   │
│   │   ├── form/             # Form components
│   │   │   ├── DatePicker.tsx
│   │   │   ├── TimePicker.tsx
│   │   │   └── LocationPicker.tsx
│   │   │
│   │   ├── chart/            # Chart components
│   │   │   ├── ChartWheel.tsx
│   │   │   ├── PlanetMarker.tsx
│   │   │   ├── AspectLines.tsx
│   │   │   └── HouseRing.tsx
│   │   │
│   │   ├── astrology/        # Astrology-specific
│   │   │   ├── ZodiacBadge.tsx
│   │   │   ├── MoonPhase.tsx
│   │   │   ├── PlanetIcon.tsx
│   │   │   └── AspectBadge.tsx
│   │   │
│   │   ├── transit/          # Transit components
│   │   │   ├── TransitCard.tsx
│   │   │   ├── TimelineFeed.tsx
│   │   │   └── EnergyGauge.tsx
│   │   │
│   │   ├── synastry/         # Synastry components
│   │   │   ├── PersonSelector.tsx
│   │   │   └── CompatibilityGauge.tsx
│   │   │
│   │   └── layout/           # Layout components
│   │       ├── AppLayout.tsx
│   │       ├── Navbar.tsx
│   │       └── Sidebar.tsx
│   │
│   ├── hooks/                # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useCharts.ts
│   │   ├── useCalendar.ts
│   │   ├── useTransits.ts
│   │   ├── useLunarReturns.ts
│   │   ├── useSolarReturns.ts
│   │   └── useSynastry.ts
│   │
│   ├── stores/               # Zustand stores
│   │   ├── authStore.ts
│   │   ├── chartStore.ts
│   │   ├── calendarStore.ts
│   │   └── uiStore.ts
│   │
│   ├── services/             # API services
│   │   ├── api.ts            # Axios instance
│   │   ├── auth.service.ts
│   │   ├── chart.service.ts
│   │   ├── transit.service.ts
│   │   ├── calendar.service.ts
│   │   ├── lunarReturn.api.ts
│   │   ├── synastry.api.ts
│   │   └── learning.service.ts
│   │
│   ├── utils/                # Utilities
│   │   ├── constants.ts
│   │   ├── errorHandler.ts
│   │   └── apiTransformers.ts
│   │
│   └── types/                # TypeScript types
│       └── api.types.ts
│
├── e2e/                      # E2E tests
├── public/                   # Static assets
└── index.html
```

### 2.3 Component Hierarchy

```
App
├── ErrorBoundary
├── QueryClientProvider
└── Routes
    ├── PublicRoute
    │   ├── LandingPage
    │   ├── LoginPage
    │   └── RegisterPage
    │
    └── ProtectedRoute
        ├── AppLayout
        │   ├── Navbar
        │   │   ├── Logo
        │   │   ├── NavLinks
        │   │   ├── NotificationBell
        │   │   └── ProfileAvatar
        │   │
        │   ├── DashboardPage
        │   │   ├── WelcomeSection
        │   │   ├── EnergyGauge
        │   │   ├── TransitCard
        │   │   ├── ChartsList
        │   │   └── QuickActions
        │   │
        │   ├── CalendarPage
        │   │   ├── CalendarControls
        │   │   ├── CalendarGrid
        │   │   ├── EventDetailPanel
        │   │   └── UpcomingEvents
        │   │
        │   ├── ChartCreationWizardPage
        │   │   ├── StepIndicator
        │   │   ├── FormCard
        │   │   │   ├── DatePicker
        │   │   │   ├── TimePicker
        │   │   │   └── LocationPicker
        │   │   └── ChartPreview
        │   │
        │   └── [Other Pages...]
        │
        └── NotFoundPage
```

### 2.4 State Management Strategy

```typescript
// Global State (Zustand)
interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => void;
}

// Server State (TanStack Query)
const useCharts = () => useQuery({
  queryKey: ['charts'],
  queryFn: () => chartService.getCharts(),
});

// Local State (useState)
const [selectedDate, setSelectedDate] = useState<Date>(new Date());
```

---

## 3. Backend Architecture

### 3.1 Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Runtime | Node.js | 20.x |
| Framework | Express.js | 4.x |
| Language | TypeScript | 5.x |
| Database | PostgreSQL | 15.x |
| ORM | Knex.js | 3.x |
| Authentication | JWT + bcrypt | - |
| Validation | Joi/Zod | - |
| Logging | Winston/Pino | - |
| Testing | Jest | - |

### 3.2 Directory Structure

```
backend/
├── src/
│   ├── server.ts             # Entry point
│   ├── app.ts                # Express app setup
│   │
│   ├── api/                  # API routes
│   │   ├── index.ts
│   │   └── v1/
│   │       ├── index.ts      # Route aggregator
│   │       └── routes/       # Versioned routes
│   │
│   ├── modules/              # Feature modules
│   │   ├── auth/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── models/
│   │   │   └── routes/
│   │   │
│   │   ├── charts/
│   │   ├── transits/
│   │   ├── calendar/
│   │   ├── lunar/
│   │   ├── solar/
│   │   ├── synastry/
│   │   └── shared/
│   │       └── services/
│   │           └── swissEphemeris.service.ts
│   │
│   ├── middleware/           # Express middleware
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   ├── rateLimiter.ts
│   │   └── validator.ts
│   │
│   ├── config/               # Configuration
│   │   ├── database.ts
│   │   ├── jwt.ts
│   │   └── environment.ts
│   │
│   ├── migrations/           # Database migrations
│   │
│   └── __tests__/            # Tests
│
└── package.json
```

### 3.3 Module Structure

Each feature module follows this structure:

```
module/
├── controllers/      # Request handlers
│   └── *.controller.ts
├── services/         # Business logic
│   └── *.service.ts
├── models/           # Data models
│   └── *.model.ts
├── routes/           # Route definitions
│   └── *.routes.ts
├── validators/       # Input validation
│   └── *.validator.ts
└── index.ts          # Module exports
```

### 3.4 API Route Structure

```
/api/v1
├── /auth
│   ├── POST /register
│   ├── POST /login
│   ├── POST /logout
│   ├── POST /refresh-token
│   └── POST /forgot-password
│
├── /users
│   ├── GET /me
│   ├── PUT /me
│   └── POST /me/avatar
│
├── /charts
│   ├── GET /
│   ├── POST /
│   ├── GET /:id
│   ├── PUT /:id
│   ├── DELETE /:id
│   └── GET /:id/report
│
├── /transits
│   ├── GET /today
│   ├── GET /weekly
│   ├── GET /monthly
│   └── POST /calculate
│
├── /calendar
│   ├── GET /month/:year/:month
│   ├── POST /events
│   └── DELETE /events/:id
│
├── /lunar-return
│   ├── GET /next
│   ├── GET /current
│   ├── POST /chart
│   ├── POST /forecast
│   └── GET /history
│
├── /solar-returns
│   ├── GET /year/:year
│   ├── GET /history
│   ├── POST /calculate
│   └── GET /:id/report
│
├── /synastry
│   ├── POST /compare
│   ├── POST /compatibility
│   ├── GET /reports
│   └── GET /reports/:id
│
└── /learning
    ├── GET /courses
    ├── GET /courses/:id
    └── GET /lessons
```

---

## 4. Database Schema

### 4.1 Entity Relationship Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    users    │────<│   charts    │────<│  synastry   │
│             │     │             │     │  _charts    │
│ id          │     │ id          │     │             │
│ email       │     │ user_id     │     │ chart1_id   │
│ password    │     │ name        │     │ chart2_id   │
│ name        │     │ birth_date  │     │ score       │
│ created_at  │     │ birth_time  │     └─────────────┘
└─────────────┘     │ location    │
      │             │ calculated  │
      │             └─────────────┘
      │                   │
      │             ┌─────┴─────┐
      │             │           │
      ▼             ▼           ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│lunar_returns│ │solar_returns│ │cal_events   │
│             │ │             │ │             │
│ id          │ │ id          │ │ id          │
│ user_id     │ │ user_id     │ │ user_id     │
│ chart_id    │ │ chart_id    │ │ event_type  │
│ return_date │ │ year        │ │ event_date  │
│ theme       │ │ return_date │ │ event_data  │
│ intensity   │ │ theme       │ └─────────────┘
│ chart_data  │ │ chart_data  │
└─────────────┘ └─────────────┘
```

### 4.2 Table Definitions

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  display_name VARCHAR(50),
  avatar_url TEXT,
  bio TEXT,
  birth_date DATE,
  birth_time TIME,
  birth_location VARCHAR(255),
  birth_latitude DECIMAL(10, 8),
  birth_longitude DECIMAL(11, 8),
  timezone VARCHAR(50),
  email_verified BOOLEAN DEFAULT false,
  subscription_tier VARCHAR(20) DEFAULT 'free',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Charts table
CREATE TABLE charts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) DEFAULT 'natal',
  birth_date DATE NOT NULL,
  birth_time TIME,
  birth_location VARCHAR(255),
  birth_latitude DECIMAL(10, 8),
  birth_longitude DECIMAL(11, 8),
  timezone VARCHAR(50),
  house_system VARCHAR(20) DEFAULT 'placidus',
  zodiac_type VARCHAR(20) DEFAULT 'tropical',
  calculated_data JSONB,
  tags TEXT[],
  notes TEXT,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Solar Returns table
CREATE TABLE solar_returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  chart_id UUID REFERENCES charts(id),
  year INTEGER NOT NULL,
  return_date TIMESTAMP NOT NULL,
  return_location VARCHAR(255),
  return_latitude DECIMAL(10, 8),
  return_longitude DECIMAL(11, 8),
  chart_data JSONB,
  themes JSONB,
  key_dates JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lunar Returns table
CREATE TABLE lunar_returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  chart_id UUID REFERENCES charts(id),
  return_date TIMESTAMP NOT NULL,
  theme VARCHAR(100),
  intensity INTEGER,
  emotional_theme TEXT,
  chart_data JSONB,
  action_advice JSONB,
  key_dates JSONB,
  predictions JSONB,
  rituals JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Synastry Charts table
CREATE TABLE synastry_charts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  chart1_id UUID REFERENCES charts(id),
  chart2_id UUID REFERENCES charts(id),
  compatibility_score INTEGER,
  synastry_aspects JSONB,
  relationship_theme TEXT,
  strengths JSONB,
  challenges JSONB,
  advice TEXT,
  is_favorite BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Calendar Events table
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  event_date DATE NOT NULL,
  end_date DATE,
  event_data JSONB,
  interpretation TEXT,
  is_personal BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 5. Service Layer

### 5.1 Swiss Ephemeris Service

```typescript
class SwissEphemerisService {
  // Core calculations
  calculateNatalChart(birthData: BirthData): NatalChart;
  calculateTransits(params: TransitParams): TransitData;
  calculateSynastry(chart1: Chart, chart2: Chart): SynastryData;
  calculateLunarReturn(natalMoon: MoonPosition, date: Date): LunarReturnData;
  calculateSolarReturn(params: SolarReturnParams): SolarReturnData;

  // Helper methods
  dateToJulianDay(date: Date): number;
  degreeToSign(degree: number): string;
  calculateAspects(planets: Planet[]): Aspect[];
  getDailyTransits(date: Date): TransitPlanets;
}
```

### 5.2 Chart Calculator Service

```typescript
class ChartCalculatorService {
  calculateHouseCusps(ascendant: number, latitude: number, system: string): number[];
  assignPlanetsToHouses(planets: Planet[], houses: number[]): Map<Planet, number>;
  calculatePlanetaryPositions(julianDay: number): Planet[];
  calculateAspects(planets: Planet[], orb: number): Aspect[];
  getElementBalance(planets: Planet[]): ElementBalance;
  getModalityBalance(planets: Planet[]): ModalityBalance;
}
```

---

## 6. Security Architecture

### 6.1 Authentication Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │────>│  API     │────>│ Database │
│          │     │  Server  │     │          │
└──────────┘     └──────────┘     └──────────┘
     │                │
     │ 1. Login       │ 2. Verify credentials
     │   (email/pw)   │
     │                │
     │                │ 3. Generate JWT
     │<───────────────│
     │ 4. Return JWT  │
     │                │
     │ 5. API Request │
     │   + Bearer JWT │
     │───────────────>│
     │                │ 6. Validate JWT
     │                │ 7. Process request
     │<───────────────│
     │ 8. Response    │
```

### 6.2 JWT Token Structure

```typescript
interface JWTPayload {
  userId: string;
  email: string;
  subscriptionTier: 'free' | 'pro' | 'enterprise';
  iat: number;
  exp: number;
}
```

### 6.3 Middleware Pipeline

```typescript
// Request processing pipeline
app.use(cors());
app.use(helmet());
app.use(rateLimiter);
app.use(express.json());
app.use('/api', apiRouter);
app.use(errorHandler);
```

---

## 7. Deployment Architecture

### 7.1 Development Environment

```
┌─────────────────────────────────────────────┐
│           Local Development                  │
│  ┌─────────────┐  ┌─────────────────────┐   │
│  │   Frontend  │  │      Backend        │   │
│  │  localhost  │  │    localhost        │   │
│  │    :3000    │  │      :3001          │   │
│  └─────────────┘  └─────────────────────┘   │
│                          │                    │
│                    ┌─────┴─────┐              │
│                    │PostgreSQL │              │
│                    │  :5434    │              │
│                    └───────────┘              │
└─────────────────────────────────────────────┘
```

### 7.2 Production Environment

```
┌─────────────────────────────────────────────────────────────┐
│                    Production (Docker Compose)                      │
│                                                              │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐   │
│  │   CDN       │────>│  Frontend   │────>│  Backend    │   │
│  │  (Static)   │     │  (Vite)     │     │  (Node.js)  │   │
│  └─────────────┘     └─────────────┘     └─────────────┘   │
│                                                 │            │
│                                           ┌─────┴─────┐      │
│                                           │PostgreSQL │      │
│                                           │ (Managed) │      │
│                                           └───────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. Performance Optimization

### 8.1 Frontend Optimizations

- Code splitting by route (lazy loading)
- Image optimization (WebP, lazy loading)
- Service Worker for caching
- Bundle size monitoring
- Tree shaking

### 8.2 Backend Optimizations

- Connection pooling
- Query optimization
- Response caching
- Rate limiting
- Compression middleware

---

## 9. Monitoring & Logging

### 9.1 Logging Structure

```typescript
interface LogEntry {
  timestamp: string;
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  service: string;
  environment: string;
  metadata?: Record<string, unknown>;
}
```

### 9.2 Health Checks

```
GET /health
{
  "status": "healthy",
  "database": "connected",
  "uptime": 123456,
  "version": "2.0.0"
}
```
