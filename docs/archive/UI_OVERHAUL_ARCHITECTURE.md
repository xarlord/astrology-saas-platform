# UI Overhaul Architecture Document
**Project:** AstroVerse - Astrology SaaS Platform
**Date:** 2026-02-21
**Version:** 2.0
**Status:** Implementation Ready

---

## Executive Summary

This document defines the complete system architecture for the comprehensive UI and function overhaul of the AstroVerse platform. The overhaul transforms the current basic implementation into a premium, feature-rich astrology platform with 18 pages, 29+ reusable components, and advanced features.

### Scope
- **18 New/Updated UI Pages** - Complete redesign with premium glassmorphism aesthetic
- **29 Reusable Components** - Comprehensive component library
- **10 Zustand Stores** - Client-side state management
- **50+ API Endpoints** - Complete backend integration
- **4 New Database Tables** - Extended data model
- **8-Week Implementation** - Phased rollout strategy

---

## Table of Contents

1. [Technology Stack](#technology-stack)
2. [System Architecture](#system-architecture)
3. [Frontend Architecture](#frontend-architecture)
4. [Backend Architecture](#backend-architecture)
5. [Data Architecture](#data-architecture)
6. [Component Architecture](#component-architecture)
7. [State Management Architecture](#state-management-architecture)
8. [API Architecture](#api-architecture)
9. [Security Architecture](#security-architecture)
10. [Performance Architecture](#performance-architecture)
11. [Accessibility Architecture](#accessibility-architecture)
12. [Deployment Architecture](#deployment-architecture)

---

## Technology Stack

### Frontend Stack

```yaml
Core Framework: React 18.3+
Language: TypeScript 5.3+
Build Tool: Vite 5.0+
Styling: Tailwind CSS 3.4+
State Management: Zustand 4.5+
Routing: React Router DOM 6.22+
Forms: React Hook Form 7.51+
Validation: Zod 3.22+
HTTP Client: Axios 1.6+
Animations: Framer Motion 11.0+
Charts: Custom SVG + D3.js 7.9+
PDF Generation: jsPDF 2.5+
Date Handling: date-fns 3.3+
Icons: Material Symbols Outlined
Fonts: Google Fonts (Space Grotesk, Epilogue, Noto Sans)
Testing: Vitest + React Testing Library + Playwright
```

### Backend Stack

```yaml
Runtime: Node.js 20 LTS
Framework: Express 4.19+
Language: TypeScript 5.3+
Database: PostgreSQL 16+
ORM: pg (native driver)
Auth: JWT + bcryptjs
Validation: Joi 17.12+
Astrology: Swiss Ephemeris (via C bindings)
API: REST
Testing: Jest + Supertest
Monitoring: Winston (logging)
```

### Infrastructure Stack

```yaml
Hosting: Railway (recommended) or AWS
Database: Managed PostgreSQL
CDN: Cloudflare (assets)
File Storage: AWS S3 or Railway Volumes
CI/CD: GitHub Actions
Error Tracking: Sentry (optional)
Analytics: PostHog or Plausible (optional)
```

---

## System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                            │
├─────────────────────────────────────────────────────────────────┤
│  React SPA (TypeScript) + Tailwind CSS + Framer Motion         │
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  UI Pages   │  │ Components  │  │  State      │             │
│  │   (18)      │  │    (29)     │  │  Stores     │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                          │
├─────────────────────────────────────────────────────────────────┤
│  REST API (Express) + JWT Auth + Rate Limiting                 │
│                                                                   │
│  ┌──────────────────────────────────────────────────────┐      │
│  │  API Routes (50+ endpoints)                          │      │
│  │  • Auth      • Charts    • Calendar   • Synastry     │      │
│  │  • Transits  • Reports   • Learning   • Settings     │      │
│  └──────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Business Logic Layer                       │
├─────────────────────────────────────────────────────────────────┤
│  Services + Controllers + Middleware                           │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Services   │  │ Controllers  │  │  Middleware  │         │
│  │              │  │              │  │              │         │
│  │ • Astrology  │  │ • Request    │  │ • Auth       │         │
│  │ • Chart      │  │   handling   │  │ • Validation │         │
│  │ • Transit    │  │ • Response   │  │ • Error      │         │
│  │ • Report     │  │   formatting │  │   handling   │         │
│  │ • Learning   │  │              │  │ • Rate limit │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Data Layer                               │
├─────────────────────────────────────────────────────────────────┤
│  PostgreSQL Database + Swiss Ephemeris (ephemeris data)        │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Tables     │  │   Indexes    │  │  Relations   │         │
│  │              │  │              │  │              │         │
│  │ • users      │  │ • UUID PKs   │  │ • FKs        │         │
│  │ • charts     │  │ • Lookups    │  │ • Joins      │         │
│  │ • transits   │  │ • Full-text  │  │ • Cascades   │         │
│  │ • reports    │  │              │  │              │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

### Request Flow Diagram

```
User Action
    │
    ▼
React Component Event Handler
    │
    ▼
Zustand Store Action (if state update needed)
    │
    ▼
API Service Call (Axios)
    │
    ▼
Express Middleware (Auth → Validation → Rate Limit)
    │
    ▼
Controller (Request Processing)
    │
    ▼
Service Layer (Business Logic + Swiss Ephemeris)
    │
    ▼
Database Query (PostgreSQL)
    │
    ▼
Response Processing (Controller → Middleware → JSON)
    │
    ▼
Frontend State Update + UI Re-render
```

---

## Frontend Architecture

### Directory Structure

```
frontend/
├── public/
│   ├── fonts/              # Custom font files
│   ├── images/             # Static images
│   └── icons/              # Icon assets
├── src/
│   ├── main.tsx           # App entry point
│   ├── App.tsx            # Root component + routing
│   ├── vite-env.d.ts      # Vite declarations
│   │
│   ├── pages/             # 18 Page components
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
│   │   └── NewChartCreationFlowPage.tsx
│   │
│   ├── components/        # 29 Reusable components
│   │   ├── ui/           # Base UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Checkbox.tsx
│   │   │   ├── Toggle.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── SkeletonScreen.tsx
│   │   │   └── Badge.tsx
│   │   │
│   │   ├── astrology/    # Astrology-specific components
│   │   │   ├── EnergyMeter.tsx
│   │   │   ├── MoonPhaseCard.tsx
│   │   │   ├── PlanetaryPositionCard.tsx
│   │   │   ├── TransitTimelineCard.tsx
│   │   │   ├── CalendarCell.tsx
│   │   │   ├── ZodiacBadge.tsx
│   │   │   ├── CompatibilityGauge.tsx
│   │   │   ├── ChartWheel.tsx
│   │   │   ├── AspectGrid.tsx
│   │   │   ├── ElementalBalance.tsx
│   │   │   └── ProgressBar.tsx
│   │   │
│   │   ├── navigation/   # Navigation components
│   │   │   ├── StepIndicator.tsx
│   │   │   ├── ProgressStepper.tsx
│   │   │   ├── TabNavigation.tsx
│   │   │   ├── Breadcrumbs.tsx
│   │   │   └── Sidebar.tsx
│   │   │
│   │   ├── feedback/     # User feedback components
│   │   │   ├── Accordion.tsx
│   │   │   ├── Alert.tsx
│   │   │   ├── Callout.tsx
│   │   │   └── EmptyState.tsx
│   │   │
│   │   └── layout/       # Layout components
│   │       ├── GlassCard.tsx
│   │       ├── PageHeader.tsx
│   │       ├── FloatingSidebar.tsx
│   │       └── AppLayout.tsx
│   │
│   ├── stores/           # 10 Zustand stores
│   │   ├── authStore.ts
│   │   ├── chartStore.ts
│   │   ├── calendarStore.ts
│   │   ├── transitStore.ts
│   │   ├── synastryStore.ts
│   │   ├── learningStore.ts
│   │   ├── uiStore.ts
│   │   ├── notificationStore.ts
│   │   ├── reportStore.ts
│   │   └── locationStore.ts
│   │
│   ├── services/         # API services
│   │   ├── api.ts        # Axios instance + interceptors
│   │   ├── auth.service.ts
│   │   ├── chart.service.ts
│   │   ├── calendar.service.ts
│   │   ├── synastry.service.ts
│   │   ├── transit.service.ts
│   │   ├── report.service.ts
│   │   ├── learning.service.ts
│   │   ├── user.service.ts
│   │   └── location.service.ts
│   │
│   ├── hooks/            # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useCharts.ts
│   │   ├── useCalendar.ts
│   │   ├── useTransits.ts
│   │   ├── useSynastry.ts
│   │   ├── useLearning.ts
│   │   ├── useReports.ts
│   │   ├── useLocalStorage.ts
│   │   ├── useDebounce.ts
│   │   └── useKeyboardShortcuts.ts
│   │
│   ├── utils/            # Utility functions
│   │   ├── validators.ts    # Zod schemas
│   │   ├── formatters.ts    # Date, number, string formatters
│   │   ├── calculators.ts   # Astrology calculations
│   │   ├── constants.ts     # App constants
│   │   └── helpers.ts       # General helpers
│   │
│   ├── types/            # TypeScript types
│   │   ├── auth.types.ts
│   │   ├── chart.types.ts
│   │   ├── calendar.types.ts
│   │   ├── synastry.types.ts
│   │   ├── transit.types.ts
│   │   ├── report.types.ts
│   │   ├── learning.types.ts
│   │   ├── ui.types.ts
│   │   └── api.types.ts
│   │
│   └── assets/           # Static assets
│       ├── styles/
│       │   └── globals.css      # Global CSS + Tailwind
│       └── animations/
│           └── framer-motion.ts  # Animation variants
│
├── tests/                # Test files
│   ├── unit/             # Unit tests
│   ├── integration/      # Integration tests
│   └── e2e/              # E2E tests (Playwright)
│
├── tailwind.config.js    # Tailwind configuration
├── vite.config.ts        # Vite configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies
```

### Component Architecture

#### Component Hierarchy Pattern

```
Page Component (Smart Component)
├── Layout Components
│   ├── AppLayout
│   ├── PageHeader
│   └── Sidebar
├── Container Components
│   ├── GlassCard
│   └── FloatingPanel
├── Feature Components
│   ├── Astrology Components
│   └── Form Components
└── UI Components
    └── Base Controls (Button, Input, etc.)
```

#### Component Design Principles

1. **Single Responsibility** - Each component has one clear purpose
2. **Composition over Inheritance** - Components compose together
3. **Props Interface** - Strong TypeScript typing for all props
4. **Controlled Components** - Form inputs controlled by React state
5. **Unidirectional Data Flow** - Props down, events up
6. **Memoization** - React.memo for expensive components
7. **Code Splitting** - React.lazy for route-based splitting

### Styling Architecture

#### Design Tokens (CSS Variables)

```css
:root {
  /* Colors */
  --color-primary: #6b3de1;
  --color-primary-dark: #5a32c0;
  --color-cosmic-blue: #2563EB;
  --color-accent-gold: #F5A623;
  --color-background-dark: #0B0D17;
  --color-surface-dark: #151725;
  --color-glass-bg: rgba(255, 255, 255, 0.05);

  /* Typography */
  --font-display: 'Space Grotesk', sans-serif;
  --font-body: 'Noto Sans', sans-serif;
  --font-special: 'Epilogue', sans-serif;

  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;

  /* Effects */
  --backdrop-blur: 12px;
  --border-radius: 0.5rem;
  --border-radius-lg: 1rem;
  --transition-fast: 150ms ease;
  --transition-normal: 300ms ease;
}
```

#### Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#6b3de1',
        'cosmic-blue': '#2563EB',
        'accent-gold': '#F5A623',
        'background-dark': '#0B0D17',
        'surface-dark': '#151725',
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body: ['Noto Sans', 'sans-serif'],
        special: ['Epilogue', 'sans-serif'],
      },
      borderRadius: {
        'DEFAULT': '0.5rem',
        'lg': '1rem',
        'xl': '1.5rem',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'drift': 'drift 10s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'spin-slow': 'spin 60s linear infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
};
```

---

## Backend Architecture

### Directory Structure

```
backend/
├── src/
│   ├── server.ts          # Express app entry point
│   │
│   ├── config/            # Configuration
│   │   ├── index.ts
│   │   ├── database.ts
│   │   └── jwt.ts
│   │
│   ├── routes/            # API routes (50+ endpoints)
│   │   ├── index.ts
│   │   ├── auth.routes.ts
│   │   ├── chart.routes.ts
│   │   ├── calendar.routes.ts
│   │   ├── synastry.routes.ts
│   │   ├── transit.routes.ts
│   │   ├── report.routes.ts
││   │   ├── learning.routes.ts
│   │   ├── user.routes.ts
│   │   └── health.routes.ts
│   │
│   ├── controllers/       # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── chart.controller.ts
│   │   ├── calendar.controller.ts
│   │   ├── synastry.controller.ts
│   │   ├── transit.controller.ts
│   │   ├── report.controller.ts
│   │   ├── learning.controller.ts
│   │   └── user.controller.ts
│   │
│   ├── services/          # Business logic
│   │   ├── swissEphemeris.service.ts
│   │   ├── chart.service.ts
│   │   ├── transit.service.ts
│   │   ├── synastry.service.ts
│   │   ├── interpretation.service.ts
│   │   ├── report.service.ts
│   │   ├── pdf.service.ts
│   │   └── notification.service.ts
│   │
│   ├── middleware/        # Express middleware
│   │   ├── auth.ts
│   │   ├── validation.ts
│   │   ├── errorHandler.ts
│   │   ├── rateLimiter.ts
│   │   └── requestLogger.ts
│   │
│   ├── models/            # Data models
│   │   ├── user.model.ts
│   │   ├── chart.model.ts
│   │   ├── calendarEvent.model.ts
│   │   ├── synastryReport.model.ts
│   │   ├── learningProgress.model.ts
│   │   └── userReminder.model.ts
│   │
│   ├── validators/        # Joi validation schemas
│   │   ├── auth.validators.ts
│   │   ├── chart.validators.ts
│   │   ├── calendar.validators.ts
│   │   └── user.validators.ts
│   │
│   ├── utils/             # Utility functions
│   │   ├── logger.ts
│   │   ├── helpers.ts
│   │   └── constants.ts
│   │
│   └── types/             # TypeScript types
│       ├── express.ts
│       ├── chart.types.ts
│       └── api.types.ts
│
├── tests/                 # Test files
│   ├── unit/              # Unit tests
│   ├── integration/       # Integration tests
│   └── performance/       # Performance tests
│
├── package.json
└── tsconfig.json
```

### API Architecture

#### API Endpoint Organization

```
/api/v1/
├── /auth
│   ├── POST   /register
│   ├── POST   /login
│   ├── POST   /logout
│   ├── POST   /refresh
│   ├── POST   /forgot-password
│   └── POST   /reset-password
│
├── /charts
│   ├── GET    /               (List user's charts)
│   ├── POST   /               (Create new chart)
│   ├── GET    /:id            (Get chart by ID)
│   ├── PUT    /:id            (Update chart)
│   ├── DELETE /:id            (Delete chart)
│   ├── POST   /:id/favorite   (Toggle favorite)
│   ├── GET    /:id/planets    (Get planetary positions)
│   ├── GET    /:id/aspects    (Get aspect grid)
│   ├── GET    /:id/houses     (Get house cusps)
│   ├── GET    /:id/elemental-balance
│   └── POST   /compare        (Synastry comparison)
│
├── /calendar
│   ├── GET    /events         (Get events for date range)
│   ├── POST   /events         (Create custom event)
│   ├── GET    /lunar-phases   (Get moon phases)
│   ├── GET    /moon-sign      (Current moon sign)
│   └── GET    /transits       (Daily transits)
│
├── /synastry
│   ├── POST   /compare        (Compare two charts)
│   ├── GET    /reports/:id    (Get saved report)
│   └── DELETE /reports/:id    (Delete report)
│
├── /transits
│   ├── GET    /natal/:chartId (Natal transits)
│   ├── GET    /current        (Current transits)
│   ├── GET    /forecast       (Forecast date range)
│   └── GET    /aspects        (Major transit aspects)
│
├── /solar-returns
│   ├── GET    /:chartId/:year
│   └── GET    /report/:id
│
├── /lunar-returns
│   ├── GET    /:chartId
│   └── GET    /report/:id
│
├── /reports
│   ├── POST   /generate       (Generate PDF report)
│   ├── GET    /:id            (Get report status)
│   ├── GET    /:id/download   (Download PDF)
│   └── POST   /order-printed   (Order printed chart)
│
├── /learning
│   ├── GET    /courses        (Get all courses)
│   ├── GET    /courses/:id    (Get course details)
│   ├── GET    /progress       (Get user progress)
│   ├── POST   /progress/:id   (Update lesson progress)
│   └── GET    /lessons        (Get lesson list)
│
├── /user
│   ├── GET    /profile
│   ├── PUT    /profile
│   ├── PUT    /settings
│   ├── GET    /storage        (Storage usage)
│   ├── POST   /avatar         (Upload avatar)
│   └── DELETE /account
│
└── /health
    └── GET    /               (Health check)
```

#### Response Format Standard

```typescript
// Success Response
interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

// Error Response
interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}
```

---

## Data Architecture

### Database Schema

```sql
-- Existing Tables (with additions)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    avatar_url TEXT,
    subscription_tier VARCHAR(50) DEFAULT 'free',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE charts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    birth_date DATE NOT NULL,
    birth_time TIME,
    birth_location_lat DECIMAL(10, 8),
    birth_location_lng DECIMAL(11, 8),
    birth_location_name VARCHAR(255),
    is_time_unknown BOOLEAN DEFAULT FALSE,
    chart_data JSONB NOT NULL, -- Full chart calculation
    tags TEXT[],
    is_favorite BOOLEAN DEFAULT FALSE,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- New Tables for UI Overhaul
CREATE TABLE calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_date DATE NOT NULL,
    event_type VARCHAR(50) NOT NULL, -- 'new_moon', 'full_moon', 'eclipse', 'retrograde'
    title VARCHAR(255),
    description TEXT,
    related_planet VARCHAR(50),
    significance_score INTEGER DEFAULT 50,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE synastry_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    person1_chart_id UUID NOT NULL REFERENCES charts(id),
    person2_chart_id UUID NOT NULL REFERENCES charts(id),
    compatibility_score INTEGER NOT NULL,
    breakdown JSONB, -- {romance: 82, communication: 75, trust: 90, ...}
    aspects JSONB,
    interpretation TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE learning_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id VARCHAR(255) NOT NULL,
    lesson_id VARCHAR(255),
    progress INTEGER DEFAULT 0, -- 0-100
    completed_lessons TEXT[],
    last_accessed TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

CREATE TABLE user_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- 'full_moon', 'birthday', 'solar_return'
    event_date DATE NOT NULL,
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    notification_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE generated_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    chart_id UUID REFERENCES charts(id),
    report_type VARCHAR(50) NOT NULL, -- 'natal', 'solar_return', 'lunar_return', 'synastry'
    file_path TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'failed'
    generated_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX idx_charts_user_id ON charts(user_id);
CREATE INDEX idx_charts_birth_date ON charts(birth_date);
CREATE INDEX idx_calendar_events_user_date ON calendar_events(user_id, event_date);
CREATE INDEX idx_synastry_reports_user_id ON synastry_reports(user_id);
CREATE INDEX idx_learning_progress_user_id ON learning_progress(user_id);
CREATE INDEX idx_user_reminders_user_active ON user_reminders(user_id, is_active);
```

### Data Flow Diagram

```
User Input (Birth Data)
        │
        ▼
Validation (Zod Schema)
        │
        ▼
Chart Calculation (Swiss Ephemeris)
        │
        ▼
JSON Storage (PostgreSQL JSONB)
        │
        ▼
Query & Retrieval
        │
        ▼
Frontend Display (React Components)
```

---

## State Management Architecture

### Zustand Store Structure

```typescript
// stores/authStore.ts
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

// stores/chartStore.ts
interface ChartState {
  charts: Chart[];
  currentChart: Chart | null;
  isLoading: boolean;
  error: string | null;
  loadCharts: () => Promise<void>;
  createChart: (data: CreateChartInput) => Promise<Chart>;
  updateChart: (id: string, data: Partial<Chart>) => Promise<void>;
  deleteChart: (id: string) => Promise<void>;
  setCurrentChart: (chart: Chart) => void;
}

// stores/calendarStore.ts
interface CalendarState {
  viewMode: 'month' | 'week' | 'day';
  selectedDate: Date;
  events: CalendarEvent[];
  filters: EventFilters;
  setViewMode: (mode: CalendarViewMode) => void;
  setSelectedDate: (date: Date) => void;
  loadEvents: (startDate: Date, endDate: Date) => Promise<void>;
  setFilters: (filters: Partial<EventFilters>) => void;
}

// stores/transitStore.ts
interface TransitState {
  dateRange: DateRange;
  transits: TransitEvent[];
  energyLevel: number;
  loadTransits: (chartId: string, range: DateRange) => Promise<void>;
  setDateRange: (range: DateRange) => void;
}

// stores/synastryStore.ts
interface SynastryState {
  person1: Chart | null;
  person2: Chart | null;
  score: number | null;
  breakdown: CompatibilityBreakdown | null;
  aspects: Aspect[] | null;
  isLoading: boolean;
  compare: (chart1Id: string, chart2Id: string) => Promise<void>;
  setPersons: (p1: Chart, p2: Chart) => void;
}

// stores/learningStore.ts
interface LearningState {
  courses: Course[];
  currentCourse: Course | null;
  progress: ProgressMap;
  loadCourses: () => Promise<void>;
  loadProgress: () => Promise<void>;
  updateLessonProgress: (courseId: string, lessonId: string) => Promise<void>;
  setCurrentCourse: (course: Course) => void;
}

// stores/uiStore.ts
interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  viewMode: 'grid' | 'list';
  density: 'compact' | 'comfortable' | 'spacious';
  toggleTheme: () => void;
  setSidebarOpen: (open: boolean) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setDensity: (density: UIDensity) => void;
}

// stores/notificationStore.ts
interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loadNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: Notification) => void;
}

// stores/reportStore.ts
interface ReportState {
  reports: GeneratedReport[];
  currentReport: GeneratedReport | null;
  isGenerating: boolean;
  generateReport: (type: ReportType, chartId: string) => Promise<void>;
  downloadReport: (id: string) => Promise<void>;
  loadReports: () => Promise<void>;
}

// stores/locationStore.ts
interface LocationState {
  savedLocations: Location[];
  recentSearches: Location[];
  addSavedLocation: (location: Location) => void;
  removeSavedLocation: (id: string) => void;
  addRecentSearch: (location: Location) => void;
}

// stores/settingsStore.ts
interface SettingsState {
  settings: UserSettings;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
}
```

---

## Security Architecture

### Authentication Flow

```
1. User submits login credentials
       ↓
2. Frontend validates (Zod)
       ↓
3. POST /api/v1/auth/login
       ↓
4. Backend validates (Joi)
       ↓
5. Hash comparison (bcrypt)
       ↓
6. JWT generation
       ↓
7. Token returned + stored in localStorage
       ↓
8. Axios interceptor adds token to headers
       ↓
9. Protected routes verify JWT (middleware)
       ↓
10. Request proceeds or 401 Unauthorized
```

### Authorization Levels

```typescript
enum SubscriptionTier {
  FREE = 'free',           // 1 chart, basic reports
  MYSTIC = 'mystic',       // 10 charts, advanced features
  ORACLE = 'oracle'        // Unlimited charts, all features
}

interface Permissions {
  maxCharts: number;
  canAccessSynastry: boolean;
  canAccessTransits: boolean;
  canAccessLearning: boolean;
  canGeneratePDF: boolean;
  canOrderPrinted: boolean;
}
```

### Rate Limiting

```typescript
const rateLimits = {
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
  },
  api: {
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
  },
  chartCalculation: {
    windowMs: 60 * 1000,
    max: 10, // 10 calculations per minute
  },
};
```

---

## Performance Architecture

### Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Initial Page Load | < 2s | Lighthouse |
| Time to Interactive | < 3s | Lighthouse |
| Chart Rendering | < 500ms | Performance API |
| Calendar Loading | < 300ms | Performance API |
| API Response Time | < 200ms (p95) | Server logs |
| Animations | 60fps | Chrome DevTools |

### Optimization Strategies

1. **Code Splitting**
   - Route-based splitting with React.lazy
   - Component-based splitting for large modals
   - Vendor chunking for libraries

2. **Asset Optimization**
   - WebP images with fallbacks
   - Font subsetting
   - SVG sprite sheets
   - Gzip/Brotli compression

3. **Caching Strategy**
   - Static assets: CDN with long cache
   - API responses: SWR or React Query
   - Chart calculations: Memoization
   - Database query results: Redis (optional)

4. **Database Optimization**
   - Indexed columns on foreign keys
   - Connection pooling
   - Query optimization with EXPLAIN ANALYZE
   - JSONB for flexible data storage

5. **Rendering Optimization**
   - React.memo for expensive components
   - useMemo for computed values
   - useCallback for event handlers
   - Virtualization for long lists

---

## Accessibility Architecture

### WCAG 2.1 AA Compliance

1. **Perceivable**
   - Color contrast ratio ≥ 4.5:1 for normal text
   - Color contrast ratio ≥ 3:1 for large text
   - Alt text for all images
   - Captions for video content

2. **Operable**
   - All functions keyboard accessible
   - No keyboard traps
   - Focus indicators visible
   - Skip to main content link

3. **Understandable**
   - Error identification and suggestions
   - Labels and instructions
   - Consistent navigation
   - Language of page declared

4. **Robust**
   - Valid HTML
   - ARIA attributes where needed
   - Compatible with assistive tech
   - Name, role, value defined

### ARIA Implementation Strategy

```tsx
// Example: Accessible Button
<button
  aria-label="Close dialog"
  aria-pressed={isPressed}
  onClick={handleClose}
>
  <span aria-hidden="true">×</span>
</button>

// Example: Accessible Form
<label htmlFor="birth-date">Birth Date</label>
<input
  id="birth-date"
  type="date"
  aria-invalid={hasError}
  aria-describedby="birth-date-error"
  required
/>
{hasError && (
  <span id="birth-date-error" role="alert">
    {errorMessage}
  </span>
)}
```

---

## Deployment Architecture

### Environment Configuration

```bash
# .env.production
VITE_API_URL=https://api.astroverse.com/v1
VITE_WS_URL=wss://api.astroverse.com
VITE_ENABLE_ANALYTICS=true
VITE_SENTRY_DSN=<sentry-dsn>

# Backend .env
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_EXPIRES_IN=7d
SWISS_EPHEMERIS_PATH=/usr/local/lib/sweph
NODE_ENV=production
PORT=3000
```

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - checkout
      - setup Node.js
      - install dependencies
      - run tests
      - run linting
      - build frontend

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - checkout
      - deploy to Railway

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - checkout
      - build frontend
      - deploy to Vercel/Netlify
```

---

## Monitoring & Observability

### Logging Strategy

```typescript
// Structured logging
logger.info('Chart created', {
  userId: user.id,
  chartId: chart.id,
  birthDate: chart.birthDate,
  duration: calculationTime,
});
```

### Error Tracking

```typescript
// Sentry integration
Sentry.captureException(error, {
  user: { id: user.id },
  tags: {
    component: 'ChartWheel',
    action: 'render',
  },
});
```

### Performance Monitoring

```typescript
// Web Vitals tracking
reportWebVitals((metric) => {
  analytics.track('web-vital', {
    name: metric.name,
    value: metric.value,
    id: metric.id,
  });
});
```

---

## Appendix

### Technology Alternatives Considered

| Decision | Choice | Alternative | Rationale |
|----------|--------|-------------|-----------|
| State Management | Zustand | Redux, Jotai | Simpler API, built-in DevTools |
| Forms | React Hook Form | Formik | Better performance, less code |
| Validation | Zod | Yup | TypeScript-first |
| HTTP Client | Axios | Fetch, React Query | Interceptors, better error handling |
| Animations | Framer Motion | GSAP, CSS | React-specific, great API |
| Charts | Custom SVG | Recharts, D3 | Full control, astrology-specific |
| PDF | jsPDF | Puppeteer, Server-side | Client-side generation |

### Glossary

- **Natal Chart**: Birth chart showing planetary positions at birth
- **Transit**: Current planetary positions and their relationship to natal chart
- **Synastry**: Compatibility comparison between two charts
- **Solar Return**: Chart calculated when Sun returns to natal position (birthday)
- **Lunar Return**: Monthly chart when Moon returns to natal position
- **Aspect**: Angular relationship between two planets
- **House**: 12 divisions of the chart representing life areas
- **Zodiac Sign**: 12 signs of the tropical zodiac
- **Swiss Ephemeris**: High-precision astronomical calculation library

---

**Document Version:** 2.0
**Last Updated:** 2026-02-21
**Next Review:** After Phase 1 completion
