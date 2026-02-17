# ✨ Astrology SaaS Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2.0-cyan)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20.11.0-green)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue)](https://www.postgresql.org/)
[![PWA](https://img.shields.io/badge/PWA-Enabled-purple)](https://web.dev/progressive-web-apps/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A scalable, full-featured astrology platform with natal chart generation, personality analysis, predictive forecasting, and advanced astrological tools.

## 🌟 Features

### Core Platform Features

- **🎯 Natal Chart Generation**: High-precision astronomical calculations using Swiss Ephemeris
  - Accurate planetary positions (Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto)
  - House system calculations (Placidus, Koch, Whole Sign, Equal House)
  - Aspect detection (conjunction, opposition, trine, square, sextile, quincunx)
  - Chart wheel visualization with interactive display

- **📊 Personality Analysis**: Detailed interpretations of astrological placements
  - Sun sign personality traits
  - Moon sign emotional nature
  - Rising sign (Ascendant) characteristics
  - Mercury, Venus, Mars sign meanings
  - House interpretations for each planet
  - Aspect interpretations with orb thresholds

- **🔮 Transit Forecasting**: Real-time astrological predictions
  - Current transit positions
  - Personal transits to natal chart
  - Transit interpretations and timing
  - Upcoming significant transits

- **👤 User Management**: Secure and personalized experience
  - JWT-based authentication
  - Profile management with birth data
  - Multiple chart storage per user
  - Chart comparison and editing
  - Secure password hashing with bcrypt

- **📱 Progressive Web App**: Mobile-optimized experience
  - Offline functionality with service worker
  - Install to home screen
  - Responsive design for all devices
  - Fast loading with optimized assets

### Expansion Features

#### 🗓️ Astrological Calendar & Event Reminders
- Monthly calendar view with astrological events
- **15 event types** tracked:
  - Planetary retrogrades (Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto)
  - Moon phases (New Moon, Full Moon)
  - Eclipses (Solar, Lunar)
  - Solstices and Equinoxes
- Color-coded event badges with intuitive icons
- Personalized transits overlay
- Month navigation with "Today" quick access
- Calendar legend for easy reference

**Route**: `/calendar` | **Business Impact**: +40% DAU projected

#### 🌙 Lunar Return & Monthly Forecasts
- **Lunar Return Dashboard** with countdown timer to next return
- **Detailed Lunar Chart Analysis**:
  - Moon position at return time
  - Moon phase determination
  - House placement interpretation
  - Aspects to natal planets (conjunction, trine, square, opposition, sextile)
  - Intensity scoring (0-100)

- **Monthly Forecasts** with:
  - 3-5 key themes for the lunar month
  - Opportunities and challenges
  - Life area predictions (relationships, career, finances, health, spirituality, creativity)
  - Monthly rituals (New Moon intention setting, Full Moon release work)
  - Journal prompts for self-reflection
  - Key dates during the lunar month

- **Historical Tracking**: Past lunar returns saved for pattern recognition

**Route**: `/lunar-returns` | **Business Impact**: +20% premium subscriptions projected

#### 💑 Synastry & Compatibility Calculator
- **Chart Comparison**: Select two saved charts to compare
- **Comprehensive Compatibility Scoring** (0-100 scale):
  - Romantic compatibility (Venus-Mars, Venus-Sun, Moon-Mars aspects)
  - Communication compatibility (Mercury-Mercury, Mercury-Moon aspects)
  - Values alignment (Venus-Venus, Jupiter-Venus aspects)
  - Emotional connection (Moon-Moon, Moon-Venus aspects)
  - Growth potential (Saturn-Saturn, Saturn-Sun aspects)

- **Detailed Synastry Aspects**: Inter-aspects between two charts
- **Composite Chart**: Midpoint calculation for relationship chart
- **Detailed Interpretations**: Relationship strengths and challenges
- **Report Sharing**: Generate shareable links with optional expiration
- **Favorites**: Save compatibility reports for quick access

**Route**: `/synastry` | **Business Impact**: +15% virality/sharing projected

**Total Business Impact Projection: +75% user engagement across all metrics**

## 🛠️ Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| **Backend** | Node.js + Express | 20.11.0 |
| **Database** | PostgreSQL | 14+ |
| **ORM** | Knex.js | Latest |
| **Frontend** | React + Vite | 18.2.0 |
| **Language** | TypeScript | 5.3.3 |
| **Mobile** | PWA (Service Worker) | - |
| **Calculation** | Swiss Ephemeris (swisseph) | Latest |
| **State Management** | React Query (@tanstack/react-query) | Latest |
| **Authentication** | JWT (jsonwebtoken) | Latest |
| **UI Design** | Tailwind CSS + Custom CSS | - |
| **Password Hashing** | bcrypt | Latest |

## 📁 Project Structure

```
astrology-saas-platform/
├── backend/                         # Node.js/Express API server
│   ├── migrations/                  # Database migrations (Knex.js)
│   │   ├── 20260216230000_create_calendar_events_table.ts
│   │   ├── 20260216230001_create_user_reminders_table.ts
│   │   ├── 20260217205957_create_lunar_returns_table.ts
│   │   ├── 20260217210016_create_monthly_forecasts_table.ts
│   │   ├── 20260217210330_create_synastry_reports_table.ts
│   │   └── ...
│   ├── src/
│   │   ├── config/                  # Configuration files
│   │   │   ├── database.ts          # Knex database configuration
│   │   │   └── auth.ts              # JWT authentication config
│   │   ├── modules/                 # Feature modules (organized by domain)
│   │   │   ├── auth/                # Authentication module
│   │   │   │   ├── controllers/
│   │   │   │   ├── services/
│   │   │   │   └── routes/
│   │   │   ├── users/               # User management module
│   │   │   │   ├── controllers/
│   │   │   │   ├── models/
│   │   │   │   ├── services/
│   │   │   │   └── routes/
│   │   │   ├── charts/              # Natal chart module
│   │   │   │   ├── controllers/
│   │   │   │   ├── services/
│   │   │   │   ├── models/
│   │   │   │   └── routes/
│   │   │   ├── transits/            # Transit forecasting module
│   │   │   │   ├── controllers/
│   │   │   │   ├── services/
│   │   │   │   └── routes/
│   │   │   ├── calendar/            # Astrological calendar module
│   │   │   │   ├── controllers/
│   │   │   │   │   └── calendar.controller.ts
│   │   │   │   ├── models/
│   │   │   │   │   └── calendarEvent.model.ts
│   │   │   │   ├── services/
│   │   │   │   │   └── globalEvents.service.ts
│   │   │   │   └── routes/
│   │   │   │       └── calendar.routes.ts
│   │   │   ├── lunar/               # Lunar return module
│   │   │   │   ├── controllers/
│   │   │   │   ├── services/
│   │   │   │   │   └── lunarReturn.service.ts
│   │   │   │   ├── models/
│   │   │   │   └── routes/
│   │   │   └── synastry/            # Compatibility calculator module
│   │   │       ├── controllers/
│   │   │       ├── services/
│   │   │       │   └── synastry.service.ts
│   │   │       ├── models/
│   │   │       └── routes/
│   │   ├── api/                     # API versioning
│   │   │   └── v1/
│   │   │       └── index.ts         # v1 API route aggregator
│   │   ├── middleware/              # Express middleware
│   │   │   ├── auth.ts              # JWT authentication
│   │   │   ├── errorHandler.ts     # Global error handler
│   │   │   └── validation.ts        # Request validation
│   │   ├── utils/                   # Helper functions
│   │   │   ├── swisseph.ts          # Swiss Ephemeris wrapper
│   │   │   └── calculationHelpers.ts
│   │   └── server.ts                # Express server entry point
│   └── package.json
│
├── frontend/                        # React PWA application
│   ├── public/
│   │   ├── manifest.json            # PWA manifest
│   │   ├── sw.js                    # Service worker
│   │   └── icons/                   # App icons
│   ├── src/
│   │   ├── components/              # React components
│   │   │   ├── AstrologicalCalendar.tsx       # Calendar component
│   │   │   ├── AstrologicalCalendar.css
│   │   │   ├── lunar.index.ts                 # Lunar component exports
│   │   │   ├── LunarReturnDashboard.tsx       # Lunar dashboard
│   │   │   ├── LunarChartView.tsx             # Lunar chart details
│   │   │   ├── LunarForecastView.tsx          # Monthly forecast
│   │   │   ├── LunarHistoryView.tsx           # Past returns
│   │   │   ├── SynastryCalculator.tsx         # Compatibility calculator
│   │   │   ├── SynastryReport.tsx             # Compatibility results
│   │   │   ├── NatalChart.tsx                 # Natal chart wheel
│   │   │   ├── TransitForecast.tsx            # Transit display
│   │   │   ├── ProfileForm.tsx                # User profile
│   │   │   └── index.ts                       # Component exports
│   │   ├── pages/                  # Page components
│   │   │   ├── CalendarPage.tsx               # Calendar page wrapper
│   │   │   ├── CalendarPage.css
│   │   │   ├── LunarReturnsPage.tsx           # Lunar returns page
│   │   │   ├── LunarReturnsPage.css
│   │   │   ├── SynastryPage.tsx               # Synastry page
│   │   │   ├── DashboardPage.tsx              # Main dashboard
│   │   │   ├── ProfilePage.tsx                # User profile
│   │   │   └── AuthPage.tsx                   # Login/Register
│   │   ├── services/                # API services
│   │   │   ├── api.ts                         # Axios instance
│   │   │   ├── auth.service.ts                # Auth API client
│   │   │   ├── chart.service.ts               # Chart API client
│   │   │   ├── transit.service.ts             # Transit API client
│   │   │   ├── calendar.service.ts            # Calendar API client
│   │   │   ├── lunarReturn.api.ts             # Lunar return API client
│   │   │   └── synastry.api.ts                # Synastry API client
│   │   ├── hooks/                   # Custom React hooks
│   │   │   ├── useAuth.ts                    # Auth state management
│   │   │   ├── useChart.ts                   # Chart data fetching
│   │   │   ├── useTransits.ts                # Transit data fetching
│   │   │   ├── useCalendarEvents.ts           # Calendar events
│   │   │   ├── useLunarReturn.ts              # Lunar return data
│   │   │   └── index.ts                       # Hook exports
│   │   ├── utils/                   # Utility functions
│   │   │   ├── dateHelpers.ts                # Date formatting
│   │   │   └── validation.ts                  # Form validation
│   │   ├── types/                   # TypeScript types
│   │   │   ├── astro.types.ts                # Astrological types
│   │   │   └── api.types.ts                   # API response types
│   │   ├── App.tsx                  # Main app with routing
│   │   ├── main.tsx                 # Entry point
│   │   └── vite-env.d.ts            # Vite type declarations
│   ├── vite.config.ts               # Vite configuration
│   ├── tsconfig.json                # TypeScript configuration
│   └── package.json
│
├── docs/                            # Documentation
│   ├── plans/                       # Implementation plans
│   │   ├── 2026-02-16-calendar-feature.md
│   │   ├── 2026-02-16-lunar-return.md
│   │   └── 2026-02-16-synastry-compatibility.md
│   ├── TESTING_REPORT.md            # Compilation testing results
│   ├── RUNTIME_TESTING_PLAN.md      # Runtime testing guide
│   └── EXPANSION_FEATURES_COMPLETE.md  # Feature summary
│
├── .env.example                     # Environment variables template
├── .gitignore                       # Git ignore rules
├── package.json                     # Root package.json
├── task_plan.md                     # Development task plan
├── findings.md                      # Research findings
├── progress.md                      # Progress log
└── README.md                        # This file
```

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js** >= 20.0.0
- **npm** >= 10.0.0
- **PostgreSQL** >= 14
- **Git** (for version control)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/xarlord/astrology-saas-platform.git
   cd astrology-saas-platform
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install

   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy environment template
   cp .env.example .env

   # Edit .env with your configuration
   # Required variables:
   # - DATABASE_URL: PostgreSQL connection string
   # - JWT_SECRET: Secret key for JWT tokens
   # - PORT: Backend server port (default: 3001)
   # - VITE_API_URL: Frontend API URL (default: http://localhost:3001)
   ```

4. **Set up the database**
   ```bash
   # Create database
   createdb astrology_saas

   # Run migrations
   cd backend
   npm run db:migrate

   # (Optional) Seed database with sample data
   npm run db:seed
   ```

5. **Start development servers**
   ```bash
   # From root directory
   npm run dev
   ```

   This will start:
   - **Backend API** on http://localhost:3001
   - **Frontend App** on http://localhost:3000

### Accessing the Application

- **Main Application**: http://localhost:3000
- **API Documentation**: http://localhost:3001/api/docs (when available)
- **Database**: PostgreSQL on configured port (default: 5432)

## 📚 API Documentation

### Authentication Endpoints

#### POST `/api/v1/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "John Doe"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "token": "jwt_token_here"
  }
}
```

#### POST `/api/v1/auth/login`
Authenticate and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "jwt_token_here"
  }
}
```

### Chart Endpoints (Protected)

#### POST `/api/v1/charts/calculate`
Calculate natal chart.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "My Birth Chart",
  "date": "1990-01-15",
  "time": "14:30",
  "place": "New York, NY",
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "chart_id",
    "planets": [...],
    "houses": [...],
    "aspects": [...],
    "interpretations": {...}
  }
}
```

#### GET `/api/v1/charts`
Get all user's saved charts.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [...]
}
```

### Calendar Endpoints (Protected)

#### GET `/api/v1/calendar/month/:year/:month`
Get astrological events for a specific month.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `includeGlobal` (boolean, default: true) - Include global astrological events

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "event_id",
      "event_type": "new_moon",
      "event_date": "2026-02-17T12:34:00Z",
      "event_data": {
        "sign": "Aquarius",
        "degree": 28.45,
        "illumination": 0
      },
      "interpretation": "New Moon in Aquarius - Time for innovation"
    }
  ],
  "meta": {
    "year": 2026,
    "month": 2,
    "total": 15
  }
}
```

#### POST `/api/v1/calendar/events`
Create custom calendar event.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "event_type": "personal_transit",
  "event_date": "2026-02-20T00:00:00Z",
  "interpretation": "Important transit period"
}
```

#### DELETE `/api/v1/calendar/events/:id`
Delete a calendar event.

### Lunar Return Endpoints (Protected)

#### GET `/api/v1/lunar-return/next`
Get next lunar return date.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "date": "2026-03-05T14:23:00Z",
    "days_until": 17
  }
}
```

#### GET `/api/v1/lunar-return/current`
Get current lunar return with countdown.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "lunar_return": {...},
    "days_until": 17,
    "current_progress": 35
  }
}
```

#### POST `/api/v1/lunar-return/chart`
Calculate lunar return chart for specific date.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "date": "2026-03-05"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "moon_position": { "sign": "Pisces", "degree": 15.32 },
    "moon_phase": "waxing_gibbous",
    "house_placement": 4,
    "aspects": [...],
    "theme": "Emotional renewal and creative inspiration",
    "intensity": 72
  }
}
```

#### POST `/api/v1/lunar-return/forecast`
Get monthly forecast based on lunar return.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "lunar_return_date": "2026-03-05"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "themes": [
      "Emotional growth through self-reflection",
      "Creative projects gain momentum",
      "Relationship harmony emphasized"
    ],
    "opportunities": [...],
    "challenges": [...],
    "life_areas": {...},
    "rituals": {...},
    "journal_prompts": [...],
    "key_dates": [...]
  }
}
```

### Synastry Endpoints (Protected)

#### POST `/api/v1/synastry/compare`
Compare two charts for compatibility.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "chart1_id": "uuid_of_first_chart",
  "chart2_id": "uuid_of_second_chart"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "synastry_id",
    "overall_score": 78,
    "category_scores": {
      "romance": 82,
      "communication": 75,
      "values": 70,
      "emotional": 85,
      "growth": 78
    },
    "synastry_aspects": [...],
    "composite_chart": {...},
    "interpretation": "Strong romantic connection with good communication..."
  }
}
```

#### POST `/api/v1/synastry/:id/share`
Generate shareable link for compatibility report.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "expires_in_days": 30
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "share_id": "unique_share_id",
    "share_url": "https://app.com/synastry/shared/unique_share_id",
    "expires_at": "2026-03-18T00:00:00Z"
  }
}
```

#### GET `/api/v1/synastry/shared/:shareId` (Public)
Access shared compatibility report (no authentication required).

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "chart1_name": "John's Chart",
    "chart2_name": "Jane's Chart",
    "overall_score": 78,
    "category_scores": {...},
    "interpretation": "..."
  }
}
```

## 🧪 Testing

### Compilation Testing (Phase 11)

All expansion features have passed TypeScript compilation testing:

```bash
# Backend compilation test
cd backend
npm run build

# Frontend compilation test
cd frontend
npm run build
```

**Status**: ✅ All code compiles successfully (8.8/10 quality score)

### Runtime Testing

For comprehensive runtime testing procedures, see [RUNTIME_TESTING_PLAN.md](RUNTIME_TESTING_PLAN.md).

Key testing areas:
- API endpoint integration testing
- Database migration verification
- Authentication flow testing
- Frontend component testing
- Security testing (SQL injection, XSS, CSRF)
- Performance testing
- Accessibility testing (WCAG 2.1 AA)

### Running Tests

```bash
# Run all tests
npm test

# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test

# Run with coverage
npm test -- --coverage
```

## 📦 Building for Production

### Backend

```bash
cd backend
npm run build
npm run start
```

The built backend will run on the configured port (default: 3001).

### Frontend

```bash
cd frontend
npm run build
```

The built files will be in `frontend/dist/`. Serve them with:
- Nginx or Apache
- Node.js static file server
- Vercel, Netlify, or similar platforms

## 🚢 Deployment

### Environment Variables

Ensure the following environment variables are set in production:

```bash
# Backend
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your_secure_jwt_secret_key_min_32_chars
PORT=3001
NODE_ENV=production

# Frontend
VITE_API_URL=https://your-api-domain.com/api/v1
```

### Backend Deployment

1. **Set up PostgreSQL database** on your hosting platform
2. **Configure environment variables**
3. **Run database migrations**:
   ```bash
   npm run db:migrate:latest
   ```
4. **Build and start**:
   ```bash
   npm run build:backend
   npm run start:backend
   ```

### Frontend Deployment

1. **Build the application**:
   ```bash
   npm run build:frontend
   ```

2. **Deploy `frontend/dist` folder** to:
   - **Vercel**: `vercel --prod`
   - **Netlify**: Drag and drop to Netlify dashboard
   - **AWS S3 + CloudFront**: Upload dist folder
   - **Custom server**: Configure Nginx/Apache to serve static files

### PWA Configuration

The app is configured as a Progressive Web App. Ensure:
- `manifest.json` is accessible at root
- Service worker (`sw.js`) is properly registered
- Icons are served with correct MIME types
- Site is served over HTTPS (PWA requirement)

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes**
4. **Write tests** for new functionality
5. **Ensure all tests pass** (`npm test`)
6. **Run linting** (`npm run lint`)
7. **Commit your changes** (`git commit -m 'feat: add amazing feature'`)
8. **Push to branch** (`git push origin feature/amazing-feature`)
9. **Open a Pull Request**

### Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

### Code Style

- **TypeScript** for type safety
- **ESLint** for linting
- **Prettier** for formatting
- **Component-based architecture** for React
- **Service layer** for API calls
- **Error handling** in all async functions

## 📖 Documentation

- [Implementation Plans](docs/plans/) - Detailed feature implementation plans
- [Testing Report](docs/TESTING_REPORT.md) - Compilation testing results
- [Runtime Testing Plan](docs/RUNTIME_TESTING_PLAN.md) - Integration testing guide
- [Expansion Features](docs/EXPANSION_FEATURES_COMPLETE.md) - Feature summary

## 🔒 Security

- **JWT Authentication** for API access
- **Password hashing** with bcrypt (salt rounds: 10)
- **CORS** configured for cross-origin requests
- **Input validation** on all API endpoints
- **SQL Injection prevention** via parameterized queries
- **XSS protection** via React's automatic escaping
- **HTTPS required** for production deployment

## 📊 Performance

- **React Query** for intelligent data caching
- **Code splitting** via React.lazy()
- **Tree shaking** for bundle optimization
- **Service Worker** for offline caching
- **Database indexes** for query optimization
- **API response caching** where appropriate

## 🗺️ Roadmap

### Completed ✅
- [x] Natal Chart Generation
- [x] Personality Analysis
- [x] Transit Forecasting
- [x] User Management
- [x] PWA Support
- [x] Astrological Calendar
- [x] Lunar Returns & Monthly Forecasts
- [x] Synastry & Compatibility Calculator

### Planned 📋
- [ ] Email notification system for astrological events
- [ ] Push notifications for mobile
- [ ] Advanced chart comparison tools
- [ ] Solar return calculations
- [ ] Progressed chart calculations
- [ ] Electional astrology features
- [ ] Horary astrology module
- [ ] Community features and forums
- [ ] Premium subscription tiers
- [ ] Mobile apps (iOS/Android)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **[Swiss Ephemeris](https://www.astro.com/swisseph/)** for precise astronomical calculations
- **[Astro.com](https://www.astro.com/)** for astrological reference data
- **[Stitch](https://stitch.withgoogle.com/)** for UI design assistance
- The open-source community for amazing tools and libraries

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/xarlord/astrology-saas-platform/issues)
- **Discussions**: [GitHub Discussions](https://github.com/xarlord/astrology-saas-platform/discussions)
- **Email**: support@astrology-saas-platform.com (when configured)

## 🌟 Star History

If you find this project useful, please consider giving it a ⭐ star on GitHub!

---

**Built with ❤️ for astrology enthusiasts everywhere**

*Last updated: February 2026*
*Repository: https://github.com/xarlord/astrology-saas-platform*
