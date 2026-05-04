# AstroVerse Design Specifications

**Version:** 1.0
**Last Updated:** 2026-02-22
**Status:** FINAL

---

## Table of Contents

1. [API Response Schemas](#1-api-response-schemas)
2. [Loading States Design](#2-loading-states-design)
3. [Error States Design](#3-error-states-design)
4. [Keyboard Navigation](#4-keyboard-navigation)
5. [Modal Designs](#5-modal-designs)
6. [Chart Calculation Methods](#6-chart-calculation-methods)
7. [Form Validation Rules](#7-form-validation-rules)
8. [Real-Time Optimization](#8-real-time-optimization)
9. [PDF Generation Specifications](#9-pdf-generation-specifications)
10. [Video Player Specifications](#10-video-player-specifications)

---

## 1. API Response Schemas

### Standard Response Format

All API responses follow this standard structure:

```typescript
// Success Response
interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

// Error Response
interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}
```

### Authentication Endpoints

```typescript
// POST /api/v1/auth/register
interface RegisterResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// POST /api/v1/auth/login
interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// GET /api/v1/auth/me
interface ProfileResponse {
  user: User;
}

// User Entity
interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  timezone?: string;
  preferences: UserPreferences;
  created_at: string;
  updated_at: string;
}

interface UserPreferences {
  houseSystem: 'placidus' | 'koch' | 'whole_sign' | 'equal';
  aspectOrbs: AspectOrbSettings;
  notifications: NotificationSettings;
  theme: 'light' | 'dark' | 'cosmic';
}
```

### Chart Endpoints

```typescript
// GET /api/v1/charts
interface ChartsListResponse {
  charts: Chart[];
  pagination: PaginationMeta;
}

// GET /api/v1/charts/:id
interface ChartResponse {
  chart: Chart;
  calculations: ChartCalculations;
}

// POST /api/v1/charts
interface CreateChartResponse {
  chart: Chart;
  calculations: ChartCalculations;
}

// Chart Entity
interface Chart {
  id: string;
  name: string;
  type: 'natal' | 'synastry' | 'transit' | 'solar_return' | 'lunar_return';
  birthData: BirthData;
  planets: PlanetPosition[];
  houses: HouseCusp[];
  aspects: Aspect[];
  createdAt: string;
  updatedAt: string;
}

interface BirthData {
  date: string;           // ISO date: "1990-01-15"
  time: string;           // HH:mm: "14:30"
  location: string;       // Display name: "New York, NY, USA"
  latitude: number;
  longitude: number;
  timezone: string;       // IANA timezone: "America/New_York"
}

interface PlanetPosition {
  planet: PlanetName;
  sign: ZodiacSign;
  degree: number;
  minute: number;
  house: number;
  retrograde: boolean;
  latitude: number;
  longitude: number;
  speed: number;
}

type PlanetName = 'Sun' | 'Moon' | 'Mercury' | 'Venus' | 'Mars' |
                  'Jupiter' | 'Saturn' | 'Uranus' | 'Neptune' | 'Pluto' |
                  'North Node' | 'South Node' | 'Chiron' | 'Lilith';

type ZodiacSign = 'Aries' | 'Taurus' | 'Gemini' | 'Cancer' | 'Leo' | 'Virgo' |
                  'Libra' | 'Scorpio' | 'Sagittarius' | 'Capricorn' |
                  'Aquarius' | 'Pisces';
```

### Calendar Endpoints

```typescript
// GET /api/v1/calendar/events
interface CalendarEventsResponse {
  events: CalendarEvent[];
  pagination: PaginationMeta;
}

interface CalendarEvent {
  id: string;
  type: EventType;
  title: string;
  description?: string;
  date: string;
  time?: string;
  intensity: number;        // 1-10
  isPersonal: boolean;
  chartId?: string;
}

type EventType =
  | 'new_moon' | 'full_moon' | 'first_quarter' | 'last_quarter'
  | 'solar_eclipse' | 'lunar_eclipse'
  | 'mercury_retrograde' | 'venus_retrograde' | 'mars_retrograde'
  | 'jupiter_retrograde' | 'saturn_retrograde'
  | 'ingress' | 'aspect';
```

### Transit Endpoints

```typescript
// GET /api/v1/transits/:chartId
interface TransitsResponse {
  chartId: string;
  startDate: string;
  endDate: string;
  transits: Transit[];
}

interface Transit {
  id: string;
  transitPlanet: PlanetName;
  transitSign: ZodiacSign;
  transitDegree: number;
  natalPlanet: PlanetName;
  natalSign: ZodiacSign;
  natalDegree: number;
  aspect: AspectType;
  orb: number;
  applying: boolean;
  exactDate: string;
  startDate: string;
  endDate: string;
  intensity: number;
}

type AspectType = 'conjunction' | 'sextile' | 'square' | 'trine' |
                  'opposition' | 'quincunx' | 'semisextile';
```

### Synastry Endpoints

```typescript
// POST /api/v1/synastry
interface SynastryResponse {
  id: string;
  chart1: Chart;
  chart2: Chart;
  compatibility: CompatibilityScore;
  aspects: SynastryAspect[];
  houseOverlays: HouseOverlay[];
}

interface CompatibilityScore {
  overall: number;          // 0-100
  categories: {
    romantic: number;
    communication: number;
    friendship: number;
    passion: number;
    growth: number;
  };
}

interface SynastryAspect {
  planet1: PlanetPosition;
  planet2: PlanetPosition;
  aspect: AspectType;
  orb: number;
  interpretation: string;
}
```

### Pagination

```typescript
interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Query Parameters
interface PaginationParams {
  page?: number;     // Default: 1
  limit?: number;    // Default: 20, Max: 100
  sort?: string;     // e.g., "createdAt:desc"
  filter?: string;   // e.g., "type:natal"
}
```

---

## 2. Loading States Design

### Spinner Component

**Sizes:**
- `sm`: 16px (inline loading)
- `md`: 32px (default)
- `lg`: 48px (page loading)
- `xl`: 64px (full screen)

**Colors:**
- Primary: `#8B5CF6` (cosmic purple)
- Secondary: `#6366F1` (indigo)
- White: `#FFFFFF` (on dark backgrounds)

```tsx
// Component Usage
<Spinner size="md" color="primary" />
```

### Skeleton Screens

**Card Skeleton:**
```
┌─────────────────────────────┐
│ ▓▓▓▓▓▓▓▓                    │  <- Avatar placeholder
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓          │  <- Title placeholder
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │  <- Content placeholder
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓             │  <- Content placeholder
└─────────────────────────────┘
```

**Chart Skeleton:**
```
┌─────────────────────────────┐
│         ▓▓▓▓▓▓▓▓            │
│       ▓▓         ▓▓          │
│     ▓▓    ▓▓▓▓    ▓▓         │
│     ▓▓   ▓▓   ▓▓   ▓▓        │
│       ▓▓         ▓▓          │
│         ▓▓▓▓▓▓▓▓            │
└─────────────────────────────┘
```

### Progress Indicators

**Linear Progress:**
- Height: 4px
- Color: Primary gradient
- Animation: Shimmer effect

**Circular Progress:**
- Used for: Chart calculation progress
- Shows percentage complete
- Size: 120px centered

### Loading States by Component

| Component | Loading Type | Duration |
|-----------|--------------|----------|
| Chart Wheel | Skeleton | 1-2s |
| Calendar | Skeleton cards | 0.5-1s |
| Transits | Spinner + text | 1-3s |
| Synastry | Progress bar | 2-5s |
| Profile | Skeleton form | 0.5-1s |
| Reports | Progress modal | 3-10s |

---

## 3. Error States Design

### Alert Components

**Types:**
- `error` (red): Critical errors
- `warning` (yellow): Warnings
- `info` (blue): Informational
- `success` (green): Success messages

**Sizes:**
- `sm`: Compact inline alerts
- `md`: Standard alerts
- `lg`: Page-level alerts

```tsx
<Alert type="error" size="md" dismissible>
  <AlertTitle>Unable to load chart</AlertTitle>
  <AlertDescription>
    The requested chart could not be found. It may have been deleted.
  </AlertDescription>
  <AlertAction onClick={onRetry}>Try Again</AlertAction>
</Alert>
```

### Form Validation Errors

**Inline Field Errors:**
```
┌─────────────────────────────┐
│ Email                       │
│ ┌─────────────────────────┐ │
│ │ invalid-email@          │ │
│ └─────────────────────────┘ │
│ ⚠️ Please enter a valid    │
│    email address           │
└─────────────────────────────┘
```

**Form-Level Errors:**
```
┌─────────────────────────────┐
│ ⚠️ Please fix 3 errors:     │
│    • Email is required      │
│    • Password too short     │
│    • Must accept terms      │
└─────────────────────────────┘
```

### Network Error States

**Offline Banner:**
```
┌─────────────────────────────────────────┐
│ 📡 You're offline. Some features may    │
│    be unavailable. [Retry Connection]   │
└─────────────────────────────────────────┘
```

**API Error Page:**
```
┌─────────────────────────────┐
│                             │
│      ┌───────────┐          │
│      │    500    │          │
│      └───────────┘          │
│                             │
│   Something went wrong      │
│                             │
│   We're having trouble      │
│   loading this page.        │
│                             │
│   [Try Again]  [Go Home]    │
│                             │
└─────────────────────────────┘
```

### Error Recovery Actions

| Error Type | Primary Action | Secondary Action |
|------------|----------------|------------------|
| Network | Retry | Go Offline Mode |
| 401 Unauthorized | Login Again | Contact Support |
| 403 Forbidden | Request Access | Go Home |
| 404 Not Found | Go Back | Search |
| 500 Server Error | Retry | Report Issue |
| Validation | Fix Fields | Reset Form |

---

## 4. Keyboard Navigation

### Global Shortcuts

| Shortcut | Action | Context |
|----------|--------|---------|
| `?` | Open keyboard help | Anywhere |
| `/` | Focus search | Anywhere |
| `Esc` | Close modal/dropdown | Modal open |
| `g h` | Go to Dashboard | Anywhere |
| `g c` | Go to Charts | Anywhere |
| `g a` | Go to Calendar | Anywhere |
| `g s` | Go to Settings | Anywhere |

### Chart Wheel Navigation

| Key | Action |
|-----|--------|
| `Tab` | Cycle through planets |
| `Shift+Tab` | Reverse cycle |
| `Enter` | Select planet |
| `Arrow keys` | Navigate by house |
| `+/-` | Zoom in/out |
| `r` | Reset view |

### Calendar Navigation

| Key | Action |
|-----|--------|
| `Arrow keys` | Navigate dates |
| `Enter` | Select date |
| `t` | Go to today |
| `m` | Toggle month view |
| `w` | Toggle week view |

### Form Navigation

| Key | Action |
|-----|--------|
| `Tab` | Next field |
| `Shift+Tab` | Previous field |
| `Enter` | Submit (or next in wizard) |
| `Ctrl+Enter` | Force submit |
| `Esc` | Cancel/Close |

### Focus Management

1. **Modal Open:** Focus first interactive element
2. **Modal Close:** Return focus to trigger element
3. **Page Navigation:** Focus main heading
4. **Form Error:** Focus first error field
5. **List Navigation:** Arrow keys move selection

### Skip Links

```html
<a href="#main-content" class="skip-link">
  Skip to main content
</a>
<a href="#navigation" class="skip-link">
  Skip to navigation
</a>
```

---

## 5. Modal Designs

### Base Modal Structure

```
┌─────────────────────────────────────────┐
│ ┌─────────────────────────────────────┐ │
│ │ Modal Title                    [X]  │ │  <- Header (fixed)
│ ├─────────────────────────────────────┤ │
│ │                                     │ │
│ │         Modal Content               │ │  <- Body (scrollable)
│ │                                     │ │
│ │                                     │ │
│ ├─────────────────────────────────────┤ │
│ │              [Cancel]  [Confirm]    │ │  <- Footer (fixed)
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Video Modal

**Purpose:** Play learning center videos

```
┌─────────────────────────────────────────┐
│ Introduction to Birth Charts       [X]  │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐    │
│  │                                 │    │
│  │        Video Player             │    │
│  │         ▶️                      │    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ▶️ ━━━━━━━━━●─────── 🔊 ── ⚙️  📺    │  <- Controls
│  0:00 / 12:34                           │
│                                         │
│  📝 Transcript                          │  <- Expandable
│  Chapter 1: The Basics (0:00)           │
│  Chapter 2: Planets (3:45)              │
│  Chapter 3: Houses (7:20)               │
│                                         │
└─────────────────────────────────────────┘
```

**Features:**
- Playback speed: 0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x
- Quality: Auto, 720p, 1080p
- Captions: On/Off, Language selection
- Fullscreen toggle
- Transcript panel (collapsible)

### Share Modal

**Purpose:** Share charts and reports

```
┌─────────────────────────────────────────┐
│ Share Chart                        [X]  │
├─────────────────────────────────────────┤
│                                         │
│  Link Settings                          │
│  ┌─────────────────────────────────┐    │
│  │ ○ Public (anyone with link)     │    │
│  │ ● Private (requires login)      │    │
│  │ ○ Password protected            │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Share Link                             │
│  ┌─────────────────────────────────┐    │
│  │ https://astroverse.app/c/abc123 │ 📋 │
│  └─────────────────────────────────┘    │
│                                         │
│  ─────────── or share via ───────────   │
│                                         │
│  [📧 Email] [📱 SMS] [💬 WhatsApp]      │
│                                         │
│  Expires: 7 days  [Change]              │
│                                         │
├─────────────────────────────────────────┤
│                    [Cancel]  [Copy Link]│
└─────────────────────────────────────────┘
```

### Delete Confirmation Modal

**Purpose:** Confirm destructive actions

```
┌─────────────────────────────────────────┐
│ ⚠️ Delete Chart?                   [X]  │
├─────────────────────────────────────────┤
│                                         │
│  Are you sure you want to delete        │
│  "John's Natal Chart"?                  │
│                                         │
│  This action cannot be undone. The      │
│  chart and all associated data will     │
│  be permanently removed.                │
│                                         │
│  ☐ Also delete transit history          │
│                                         │
│  Type "DELETE" to confirm:              │
│  ┌─────────────────────────────────┐    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
│                                         │
├─────────────────────────────────────────┤
│              [Cancel]  [Delete Forever] │
└─────────────────────────────────────────┘
```

### Modal Specifications

| Property | Value |
|----------|-------|
| Width (mobile) | 100% (fullscreen) |
| Width (tablet) | 90% |
| Width (desktop) | 480px - 640px |
| Border radius | 16px |
| Background | rgba(0,0,0,0.5) |
| Animation | Fade + Scale (150ms) |
| Close on | Esc, backdrop click, X button |

---

## 6. Chart Calculation Methods

### House Systems

**Supported Systems:**

| System | Description | Use Case |
|--------|-------------|----------|
| Placidus | Default, time-based | Most common |
| Koch | Time-based, slightly different | Professional |
| Whole Sign | Each sign = 1 house | Traditional |
| Equal | 30° per house from Ascendant | Simplified |
| Porphyry | Quadrants divided equally | Hellenistic |
| Topocentric | Based on geographic location | Precision |

### Calculation Parameters

```typescript
interface CalculationSettings {
  // House System
  houseSystem: 'placidus' | 'koch' | 'whole_sign' | 'equal' | 'porphyry';

  // Coordinate System
  coordinateSystem: 'geocentric' | 'heliocentric';

  // Zodac Type
  zodiacType: 'tropical' | 'sidereal';
  ayanamsa?: 'lahiri' | 'krishnamurti' | 'raman'; // For sidereal

  // Node Calculation
  nodeCalculation: 'true_node' | 'mean_node';

  // Additional Points
  includeChiron: boolean;
  includeLilith: boolean;
  includeAsteroids: boolean;
  includeFixedStars: boolean;
}
```

### Aspect Orb Tolerances

| Aspect | Default Orb | Sun/Moon | Outer Planets |
|--------|-------------|----------|---------------|
| Conjunction | 10° | 12° | 8° |
| Opposition | 8° | 10° | 6° |
| Trine | 8° | 10° | 6° |
| Square | 8° | 10° | 6° |
| Sextile | 6° | 8° | 4° |
| Quincunx | 3° | 4° | 2° |
| Semisextile | 2° | 3° | 1° |

### Swiss Ephemeris Integration

```typescript
// Required calculations
interface ChartCalculations {
  // Julian Day
  julianDay: number;

  // Planetary positions
  planetPositions: Map<PlanetName, {
    longitude: number;
    latitude: number;
    distance: number;
    speed: number;
    retrograde: boolean;
  }>;

  // House cusps
  houseCusps: number[];  // 12 cusps in degrees

  // Angles
  ascendant: number;
    midheaven: number;
  descendant: number;
  imumCoeli: number;

  // Part of Fortune
  partOfFortune: number;

  // Vertex
  vertex: number;
}
```

### Accuracy Requirements

| Calculation | Tolerance | Notes |
|-------------|-----------|-------|
| Planet positions | ±0.01° | Essential for aspects |
| House cusps | ±0.1° | Acceptable for most uses |
| Angles | ±0.01° | Critical for accuracy |
| Moon position | ±0.001° | Moon moves fast |
| Eclipse timing | ±1 minute | For event prediction |

---

## 7. Form Validation Rules

### Email Validation

```typescript
const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Rules:
// - Required field
// - Valid email format
// - Max length: 254 characters
// - Cannot be disposable email domain
// - Must be unique in system
```

### Password Validation

```typescript
interface PasswordRequirements {
  minLength: 8;
  maxLength: 128;
  requireUppercase: true;    // At least 1
  requireLowercase: true;    // At least 1
  requireNumber: true;       // At least 1
  requireSpecialChar: true;  // At least 1
  preventCommonPasswords: true;
  preventUserInfoInPassword: true;
}

// Strength meter:
// Weak: < 4 requirements met
// Medium: 4 requirements met
// Strong: All requirements + 12+ chars
// Very Strong: All requirements + 16+ chars + uncommon
```

### Birth Data Validation

```typescript
interface BirthDataValidation {
  // Date
  date: {
    required: true;
    minDate: '1900-01-01';
    maxDate: 'today';
    format: 'YYYY-MM-DD';
  };

  // Time
  time: {
    required: false;  // Can be unknown
    format: 'HH:mm';
    allowUnknown: true;
    defaultIfUnknown: '12:00';
  };

  // Location
  location: {
    required: true;
    minLength: 2;
    mustSelectFromSuggestions: true;
  };

  // Coordinates
  latitude: {
    min: -90;
    max: 90;
    precision: 4;  // decimal places
  };

  longitude: {
    min: -180;
    max: 180;
    precision: 4;
  };
}
```

### Name Validation

```typescript
interface NameValidation {
  required: true;
  minLength: 1;
  maxLength: 100;
  pattern: /^[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF\s'-]+$/;
  // Allows: letters, accents, spaces, hyphens, apostrophes
}
```

### Validation Messages

```typescript
const validationMessages = {
  required: '{field} is required',
  email: 'Please enter a valid email address',
  emailTaken: 'This email is already registered',
  passwordLength: 'Password must be at least 8 characters',
  passwordStrength: 'Please choose a stronger password',
  passwordMatch: 'Passwords do not match',
  dateInvalid: 'Please enter a valid date',
  dateRange: 'Date must be between 1900 and today',
  locationRequired: 'Please select a location from the list',
  nameInvalid: 'Name can only contain letters, spaces, and hyphens',
  termsRequired: 'You must accept the terms and conditions',
};
```

---

## 8. Real-Time Optimization

### Debounce Timings

| Action | Delay | Reason |
|--------|-------|--------|
| Search input | 300ms | Reduce API calls |
| Location search | 300ms | Geocoding API limits |
| Form validation | 500ms | Don't validate while typing |
| Chart preview | 1000ms | Complex calculation |
| Autosave | 2000ms | Reduce database writes |

### Implementation

```typescript
// useDebounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// Usage
const debouncedSearch = useDebounce(searchQuery, 300);
```

### Caching Strategy

```typescript
interface CacheConfig {
  // React Query defaults
  staleTime: 5 * 60 * 1000,      // 5 minutes
  cacheTime: 30 * 60 * 1000,     // 30 minutes

  // Specific caches
  charts: {
    staleTime: 10 * 60 * 1000,   // 10 minutes
    cacheTime: 60 * 60 * 1000,   // 1 hour
  },
  transits: {
    staleTime: 60 * 60 * 1000,   // 1 hour
    cacheTime: 24 * 60 * 60 * 1000, // 24 hours
  },
  userData: {
    staleTime: 0,                // Always fresh
    cacheTime: 5 * 60 * 1000,    // 5 minutes
  },
}
```

### Performance Budgets

| Resource | Budget | Target |
|----------|--------|--------|
| Initial bundle | < 200KB | 150KB |
| Route chunk | < 50KB | 30KB |
| Time to Interactive | < 3s | 2s |
| First Contentful Paint | < 1.5s | 1s |
| Largest Contentful Paint | < 2.5s | 2s |

---

## 9. PDF Generation Specifications

### Report Types

1. **Natal Chart Report** (5-10 pages)
2. **Transit Report** (3-5 pages)
3. **Synastry Report** (8-12 pages)
4. **Solar Return Report** (4-6 pages)
5. **Lunar Return Report** (2-3 pages)

### Page Layout

```
┌─────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────┐ │
│ │           AstroVerse Logo               │ │  <- Header (20mm)
│ │     Personal Astrology Report           │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│  ┌───────────────┐  ┌─────────────────────┐ │
│  │               │  │                     │ │
│  │  Chart Wheel  │  │   Interpretation    │ │  <- Content
│  │     (SVG)     │  │       Text          │ │
│  │               │  │                     │ │
│  └───────────────┘  └─────────────────────┘ │
│                                             │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ Generated: 2026-02-22 | Page 1 of 5    │ │  <- Footer (15mm)
│ │ © AstroVerse | www.astroverse.app      │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### Specifications

| Property | Value |
|----------|-------|
| Page Size | A4 (210mm × 297mm) |
| Margins | Top: 25mm, Bottom: 20mm, Left: 20mm, Right: 20mm |
| Font | Inter (headings), Open Sans (body) |
| Base Font Size | 11pt |
| Line Height | 1.6 |
| Colors | CMYK for print compatibility |

### Chart Embedding

```typescript
interface ChartEmbedConfig {
  // SVG chart wheel
  format: 'svg' | 'png';
  resolution: 300; // DPI for PNG
  size: {
    width: 200;  // mm
    height: 200;
  };

  // Elements to include
  showPlanets: true;
  showHouses: true;
  showAspects: true;
  showSigns: true;
  showDegreeMarkers: true;
}
```

### Generation Process

1. User requests report
2. Server validates data
3. Generate chart calculations
4. Render SVG chart wheel
5. Compile interpretation text
6. Generate PDF using Puppeteer/wkhtmltopdf
7. Upload to cloud storage
8. Return download URL

---

## 10. Video Player Specifications

### Player Library

**Recommended:** Video.js or Plyr

**Features Required:**
- HLS/DASH streaming support
- Multiple quality options
- Playback speed control
- Captions/subtitles
- Thumbnail previews
- Analytics integration

### Controls Layout

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│                                                     │
│                   Video Content                     │
│                                                     │
│                                                     │
├─────────────────────────────────────────────────────┤
│ 00:00 ━━━━━━━━━━━━━━━━━●━━━━━━━━━━━━━ 12:34        │ <- Progress
│                                                     │
│ ▶️  ⏮️  ⏭️  🔊 ────── ⚙️  📝  📺                    │ <- Controls
│                                                     │
│    1x    720p    CC                                 │ <- Menus
└─────────────────────────────────────────────────────┘
```

### Playback Speeds

```typescript
const playbackSpeeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
```

### Quality Options

```typescript
const qualityLevels = [
  { label: 'Auto', value: 'auto' },
  { label: '1080p HD', value: '1080' },
  { label: '720p HD', value: '720' },
  { label: '480p', value: '480' },
  { label: '360p', value: '360' },
];
```

### Transcript Panel

```typescript
interface TranscriptConfig {
  enabled: true;
  position: 'below' | 'side';  // Responsive
  fontSize: 14;                // px
  autoScroll: true;
  highlightCurrent: true;

  // Chapter markers
  chapters: {
    id: string;
    title: string;
    startTime: number;  // seconds
    endTime: number;
  }[];
}
```

### Accessibility

- Keyboard navigation (all controls)
- Screen reader announcements
- High contrast captions
- Audio description track option
- Focus visible on all controls

### Analytics Events

```typescript
interface VideoAnalytics {
  play: { timestamp: number; position: number };
  pause: { timestamp: number; position: number };
  seek: { timestamp: number; from: number; to: number };
  complete: { timestamp: number };
  qualityChange: { timestamp: number; from: string; to: string };
  speedChange: { timestamp: number; from: number; to: number };
}
```

---

## Summary

| Spec | Status | Owner |
|------|--------|-------|
| API Response Schemas | ✅ Complete | Backend Lead |
| Loading States | ✅ Complete | Frontend Lead |
| Error States | ✅ Complete | Frontend Lead |
| Keyboard Navigation | ✅ Complete | Frontend Lead |
| Modal Designs | ✅ Complete | Designer |
| Chart Calculation | ✅ Complete | Backend Lead |
| Form Validation | ✅ Complete | Frontend Lead |
| Real-Time Optimization | ✅ Complete | Frontend Lead |
| PDF Generation | ✅ Complete | Backend Lead |
| Video Player | ✅ Complete | Frontend Lead |

---

**Document Version:** 1.0
**Last Updated:** 2026-02-22
**Next Review:** After Phase 1 implementation
