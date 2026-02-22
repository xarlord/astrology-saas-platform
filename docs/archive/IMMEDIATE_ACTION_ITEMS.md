# Immediate Action Items - Code Review Findings

**Generated:** 2026-02-22
**Priority:** CRITICAL - Must Start Immediately
**Target:** Production-readiness in 3-4 weeks

---

## Week 1: Critical Type Safety Fixes

### Day 1-2: Fix TypeScript Type Definitions

#### Action 1.1: Consolidate Type Definitions
**Priority:** CRITICAL
**File:** `/frontend/src/types/`

**Problem:** Multiple conflicting type definitions for same concepts

**Solution:**
```typescript
// Create unified types file: src/types/unified.types.ts

// Calendar event types - single source of truth
export enum EventType {
  MOON_PHASE = 'moon-phase',
  ECLIPSE = 'eclipse',
  PLANETARY_MOTION = 'planetary-motion',
  ASPECT = 'aspect',
  INGRESS = 'ingress',
  TRANSIT = 'transit',
  LUNAR_RETURN = 'lunar-return',
  SOLAR_RETURN = 'solar-return'
}

// Birth data - consistent naming
export interface BirthData {
  birthDate: string;      // ISO 8601
  birthTime: string;      // HH:MM format
  birthPlace: string;     // Place name
  latitude: number;
  longitude: number;
  timezone: string;
}

// Chart data - consistent naming
export interface Chart {
  id: string;
  userId: string;
  name: string;
  type: ChartType;
  birthData: BirthData;    // Note: singular, not birth_data
  createdAt: string;
  updatedAt: string;
  isDefault: boolean;
  notes?: string;
}

// Delete or deprecate conflicting definitions in:
// - src/types/api.types.ts
// - src/types/calendar.types.ts
```

#### Action 1.2: Fix CalendarEventType Conflicts
**Priority:** CRITICAL
**Files:** All calendar components

**Problem:** String literals vs enum mismatch

**Solution:**
```typescript
// Before (BROKEN):
if (event.eventType === 'new_moon') { ... }

// After (FIXED):
import { EventType } from '@/types/unified.types';
if (event.eventType === EventType.MOON_PHASE) { ... }
```

#### Action 1.3: Fix Chart Creation Wizard
**Priority:** CRITICAL
**File:** `/frontend/src/pages/ChartCreationWizardPage.tsx`

**Problem:** Property name mismatch

**Solution:**
```typescript
// Line 127 - Before (BROKEN):
await createChart({
  name: personalDetails.name,
  birthDate: birthData.date?.toISOString().split('T')[0],
  birthTime: birthData.unknownTime ? null : birthData.time,
  birthLocation: birthData.location,
  // ...
});

// After (FIXED):
await createChart({
  name: personalDetails.name,
  birth_date: birthData.date?.toISOString().split('T')[0],
  birth_time: birthData.unknownTime ? null : birthData.time,
  birth_place: birthData.location,
  latitude: birthData.latitude,
  longitude: birthData.longitude,
  // ...
});
```

### Day 3-4: Fix Component Props

#### Action 1.4: Fix ChartWheel Props
**Priority:** CRITICAL
**File:** `/frontend/src/pages/ChartViewPage.tsx`

**Problem:** Wrong prop name

**Solution:**
```typescript
// Line 129 - Before (BROKEN):
<ChartWheel chartData={chartData} />

// After (FIXED):
<ChartWheel data={chartData} />
```

#### Action 1.5: Fix LoadingSpinner Props
**Priority:** CRITICAL
**File:** `/frontend/src/components/ProtectedRoute.tsx`

**Problem:** Non-existent prop

**Solution:**
```typescript
// Line 19 - Before (BROKEN):
<LoadingSpinner fullPage={true} />

// After (FIXED):
<LoadingSpinner />
```

#### Action 1.6: Fix VideoPlayer Props
**Priority:** CRITICAL
**File:** `/frontend/src/pages/CourseDetailPage.tsx`

**Problem:** Non-existent prop

**Solution:**
```typescript
// Line 292 - Before (BROKEN):
<VideoPlayer
  onTimeUpdate={(currentTime, duration) => ...}
/>

// After (FIXED):
<VideoPlayer
  onProgress={(progress) => ...}
/>
```

### Day 5: Fix Framer Motion Types

#### Action 1.7: Fix Animation Variants
**Priority:** CRITICAL
**File:** `/frontend/src/assets/animations/framer-motion.ts`

**Problem:** Function signature mismatch

**Solution:**
```typescript
// Line 255 - Before (BROKEN):
const variants = {
  visible: (width: number, x: number) => ({
    x: x,
    width: width,
    transition: { type: 'spring', stiffness: 300, damping: 30 }
  })
};

// After (FIXED):
import { Variants } from 'framer-motion';

const variants: Variants = {
  visible: {
    x: 0,
    width: '100%',
    transition: { type: 'spring', stiffness: 300, damping: 30 }
  },
  hidden: {
    x: -100,
    width: 0
  }
};
```

---

## Week 1: React Hooks Fixes

### Day 6: Fix Event Handlers

#### Action 2.1: Fix Promise-Returning Functions in onClick
**Priority:** CRITICAL
**Files:** 25+ components

**Problem:** Async functions in event handlers

**Solution:**
```typescript
// Before (BROKEN):
<button onClick={handleLogout}>Logout</button>

// After (FIXED):
const handleLogoutClick = () => {
  handleLogout().catch(console.error);
};

<button onClick={handleLogoutClick}>Logout</button>
```

**Apply to:**
- `/frontend/src/components/AppLayout.tsx:151`
- `/frontend/src/components/BirthdaySharing.tsx:278,296,358`
- `/frontend/src/components/CalendarView.tsx:151`
- All other onClick handlers with async functions

#### Action 2.2: Fix useEffect Dependencies
**Priority:** CRITICAL
**Files:** 15+ components

**Problem:** Missing dependencies

**Solution:**
```typescript
// Before (BROKEN):
useEffect(() => {
  loadForecast();
}, []); // Missing loadForecast

// After (FIXED):
useEffect(() => {
  loadForecast();
}, [loadForecast]); // Add dependency

// OR use useCallback:
const loadForecast = useCallback(() => {
  // ...
}, [chartId, date]);
```

**Apply to:**
- `/frontend/src/components/LunarForecastView.tsx:28`
- `/frontend/src/components/LunarHistoryView.tsx:25`
- All other useEffect with missing dependencies

---

## Week 1: Error Handling

### Day 7: Add Error Boundaries

#### Action 3.1: Create ErrorBoundary Component
**Priority:** HIGH
**File:** `/frontend/src/components/ErrorBoundary.tsx` (NEW)

**Solution:**
```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by boundary:', error, errorInfo);

    // Log to error tracking service
    if (import.meta.env.PROD) {
      // TODO: Add Sentry or similar
      // Sentry.captureException(error, { contexts: { react: errorInfo } });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-background-dark">
          <div className="text-center p-8">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-white mb-4">
              Something went wrong
            </h1>
            <p className="text-slate-400 mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <Button onClick={this.handleReset}>Try Again</Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

#### Action 3.2: Add ErrorBoundary to App
**Priority:** HIGH
**File:** `/frontend/src/App.tsx`

**Solution:**
```typescript
import { ErrorBoundary } from './components/ErrorBoundary';

// Wrap your routes
<ErrorBoundary>
  <Routes>
    {/* ... your routes ... */}
  </Routes>
</ErrorBoundary>
```

---

## Week 2: API Contract Fixes

### Day 8-9: Create API Adapter Layer

#### Action 4.1: Create API Adapters
**Priority:** CRITICAL
**File:** `/frontend/src/services/api.adapters.ts` (NEW)

**Solution:**
```typescript
/**
 * API Response Adapters
 * Transform backend responses to frontend types
 */

import type { Chart, BirthData, User } from './api.types';

// Backend response types
interface ApiBirthData {
  birth_date: string;
  birth_time: string;
  birth_place: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

interface ApiChart {
  id: string;
  user_id: string;
  name: string;
  type: string;
  birth_data: ApiBirthData;
  created_at: string;
  updated_at: string;
  is_default: boolean;
  notes?: string;
}

// Adapter functions
export const adaptBirthData = (apiData: ApiBirthData): BirthData => ({
  birthDate: apiData.birth_date,
  birthTime: apiData.birth_time,
  birthPlace: apiData.birth_place,
  latitude: apiData.latitude,
  longitude: apiData.longitude,
  timezone: apiData.timezone,
});

export const adaptChart = (apiChart: ApiChart): Chart => ({
  id: apiChart.id,
  userId: apiChart.user_id,
  name: apiChart.name,
  type: apiChart.type as Chart['type'],
  birthData: adaptBirthData(apiChart.birth_data),
  createdAt: apiChart.created_at,
  updatedAt: apiChart.updated_at,
  isDefault: apiChart.is_default,
  notes: apiChart.notes,
});

export const adaptCharts = (apiCharts: ApiChart[]): Chart[] => {
  return apiCharts.map(adaptChart);
};
```

#### Action 4.2: Update Services to Use Adapters
**Priority:** CRITICAL
**File:** `/frontend/src/services/chart.service.ts`

**Solution:**
```typescript
import { adaptChart, adaptCharts } from './api.adapters';

export const chartService = {
  async getCharts(page = 1, limit = 20): Promise<{
    charts: Chart[];
    pagination: PaginationMeta;
  }> {
    const response = await api.get('/charts', { params: { page, limit } });
    return {
      charts: adaptCharts(response.data.data.charts),
      pagination: response.data.data.pagination
    };
  },

  async getChart(id: string): Promise<{ chart: Chart }> {
    const response = await api.get(`/charts/${id}`);
    return { chart: adaptChart(response.data.data) };
  },

  // ... other methods
};
```

---

## Week 2: Reduce ESLint Errors

### Day 10-12: Fix Unsafe Any Types

#### Action 5.1: Fix Service Response Types
**Priority:** HIGH
**Files:** All service files

**Problem:** Using `any` for API responses

**Solution:**
```typescript
// Before (BROKEN):
async getCharts(page = 1, limit = 20): Promise<{
  charts: Chart[];
  pagination: any
}>

// After (FIXED):
interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

async getCharts(
  page = 1,
  limit = 20
): Promise<{ charts: Chart[]; pagination: PaginationMeta }>
```

#### Action 5.2: Fix Error Handling Types
**Priority:** HIGH
**Files:** Components with error handling

**Problem:** `error: any` in catch blocks

**Solution:**
```typescript
// Before (BROKEN):
try {
  await doSomething();
} catch (error: any) {
  console.error(error.message);
}

// After (FIXED):
try {
  await doSomething();
} catch (error) {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error('Unknown error:', error);
  }
}

// OR use type guard:
const isError = (error: unknown): error is Error => {
  return error instanceof Error;
};

try {
  await doSomething();
} catch (error: unknown) {
  if (isError(error)) {
    console.error(error.message);
  }
}
```

---

## Week 2: Test Fixes

### Day 13-14: Fix Test Failures

#### Action 6.1: Fix Mock Import Paths
**Priority:** CRITICAL
**Files:** Test files

**Problem:** Mock paths don't match import paths

**Solution:**
```typescript
// Before (BROKEN):
vi.mock('../../store', () => ({
  useAuthStore: vi.fn(),
}));

// After (FIXED):
vi.mock('../store', () => ({
  useAuthStore: vi.fn(),
}));

// OR mock the hook directly:
vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));
```

#### Action 6.2: Add Missing Environment Mocks
**Priority:** CRITICAL
**File:** `/frontend/src/__tests__/setup.ts`

**Solution:**
```typescript
// Add service worker mock
global.navigator.serviceWorker = {
  register: vi.fn(),
  ready: Promise.resolve({
    showNotification: vi.fn(),
  }),
};

// Add geolocation mock
global.navigator.geolocation = {
  getCurrentPosition: vi.fn((success) => {
    success({
      coords: {
        latitude: 40.7128,
        longitude: -74.0060,
      },
    });
  }),
};

// Add clipboard mock
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve()),
  },
});
```

---

## Week 3: Code Quality

### Day 15-16: Remove Unused Code

#### Action 7.1: Remove Unused Variables
**Priority:** MEDIUM
**Files:** All files with unused code

**Solution:**
```typescript
// Before (BROKEN):
const getIntensityColor = (intensity: number) => { ... };
const getMoonPhaseIcon = (phase: string) => { ... };
const natalChartId = ...;

// After (FIXED):
// Remove them entirely OR prefix with _ if intentional:
const _getIntensityColor = (intensity: number) => { ... }; // Private
```

#### Action 7.2: Remove Unused Imports
**Priority:** MEDIUM
**Files:** All files

**Solution:**
```bash
# Run ESLint auto-fix
npm run lint:fix

# Or manually remove:
// Before (BROKEN):
import { Button } from './ui/Button';
import { Input } from './ui/Input'; // Unused
import { useState } from 'react';

// After (FIXED):
import { Button } from './ui/Button';
import { useState } from 'react';
```

### Day 17-18: Extract Magic Numbers

#### Action 8.1: Create Constants File
**Priority:** MEDIUM
**File:** `/frontend/src/utils/constants.ts` (NEW)

**Solution:**
```typescript
/**
 * Application Constants
 */

// Time constants
export const TOOLTIP_DELAY_MS = 3000;
export const DEBOUNCE_DELAY_MS = 300;
export const ANIMATION_DURATION_MS = 500;

// Thresholds
export const HIGH_INTENSITY_THRESHOLD = 0.7;
export const MEDIUM_INTENSITY_THRESHOLD = 0.4;
export const LOW_INTENSITY_THRESHOLD = 0.2;

// Chart limits
export const MAX_CHARTS_FREE = 3;
export const MAX_CHARTS_PRO = 50;

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Colors
export const COLOR_PRIMARY = '#8B5CF6';
export const COLOR_SUCCESS = '#10B981';
export const COLOR_WARNING = '#F59E0B';
export const COLOR_ERROR = '#EF4444';

// Zodiac
export const ZODIAC_SIGNS = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
] as const;
```

#### Action 8.2: Replace Magic Numbers
**Priority:** MEDIUM
**Files:** All files with magic numbers

**Solution:**
```typescript
// Before (BROKEN):
setTimeout(() => {}, 3000);
if (intensity > 0.7) { ... }
const color = '#FF0000';

// After (FIXED):
import { TOOLTIP_DELAY_MS, HIGH_INTENSITY_THRESHOLD, COLOR_ERROR } from '@/utils/constants';

setTimeout(() => {}, TOOLTIP_DELAY_MS);
if (intensity > HIGH_INTENSITY_THRESHOLD) { ... }
const color = COLOR_ERROR;
```

---

## Week 3: Performance

### Day 19-20: Optimize Re-renders

#### Action 9.1: Add useCallback
**Priority:** MEDIUM
**Files:** Components with event handlers

**Solution:**
```typescript
// Before (BROKEN):
const MyComponent = () => {
  const handleClick = () => { ... }; // New function on every render
  return <button onClick={handleClick}>Click</button>;
};

// After (FIXED):
const MyComponent = () => {
  const handleClick = useCallback(() => {
    // ...
  }, [/* dependencies */]);
  return <button onClick={handleClick}>Click</button>;
};
```

#### Action 9.2: Add useMemo
**Priority:** MEDIUM
**Files:** Components with expensive computations

**Solution:**
```typescript
// Before (BROKEN):
const MyComponent = ({ items }) => {
  const sorted = items.sort((a, b) => a.id - b.id); // Re-sorts on every render
  return <div>{sorted.map(...)}</div>;
};

// After (FIXED):
const MyComponent = ({ items }) => {
  const sorted = useMemo(
    () => [...items].sort((a, b) => a.id - b.id),
    [items]
  );
  return <div>{sorted.map(...)}</div>;
};
```

#### Action 9.3: Implement Code Splitting
**Priority:** MEDIUM
**File:** `/frontend/src/App.tsx`

**Solution:**
```typescript
// Before (BROKEN):
import ChartWheel from './components/ChartWheel';
import VideoPlayer from './components/VideoPlayer';

// After (FIXED):
import { lazy, Suspense } from 'react';

const ChartWheel = lazy(() => import('./components/ChartWheel'));
const VideoPlayer = lazy(() => import('./components/VideoPlayer'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ChartWheel />
      <VideoPlayer />
    </Suspense>
  );
}
```

---

## Configuration Updates

### Update ESLint Configuration

**File:** `/frontend/.eslintrc.cjs`

```javascript
module.exports = {
  // ... existing config ...
  rules: {
    '@typescript-eslint/no-explicit-any': 'error', // Was 'warn'
    '@typescript-eslint/no-unused-vars': 'error', // Was 'warn'
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-misused-promises': 'error',
    '@typescript-eslint/strict-boolean-expressions': 'warn',
    'react-hooks/exhaustive-deps': 'error', // Was 'warn'
  }
};
```

### Update TypeScript Configuration

**File:** `/frontend/tsconfig.json`

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true, // Was false
    "noUnusedParameters": true, // Was false
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true
  }
}
```

---

## Testing Strategy

### Week 1-2: Run These Commands Daily

```bash
# Check TypeScript errors
npm run type-check

# Check ESLint errors
npm run lint

# Run tests
npm run test:run

# Count errors
npm run type-check 2>&1 | grep "error TS" | wc -l
npm run lint 2>&1 | grep "error" | wc -l
npm run test:run 2>&1 | grep "failing" | wc -l
```

### Track Progress

| Metric | Day 1 | Day 5 | Day 10 | Day 15 | Target |
|--------|-------|-------|--------|--------|--------|
| TS Errors | 93 | ? | ? | ? | 0 |
| ESLint Errors | 686 | ? | ? | ? | <50 |
| Test Failures | 32 | ? | ? | ? | 0 |
| Coverage | ? | ? | ? | ? | 80%+ |

---

## Success Criteria

### End of Week 1
- [ ] 0 TypeScript compilation errors
- [ ] All React hooks violations fixed
- [ ] Error boundaries implemented

### End of Week 2
- [ ] <50 ESLint errors
- [ ] All API contracts aligned
- [ ] All tests passing (0 failures)

### End of Week 3
- [ ] Unused code removed
- [ ] Magic numbers extracted
- [ ] Performance optimizations in place

---

## Next Steps After This Document

1. **Create GitHub issues** for each action item
2. **Assign to developers** with deadlines
3. **Create feature branch** for each week's work
4. **Daily standups** to track progress
5. **Code reviews** before merging

---

**Remember:** This is a focused sprint. Don't try to do everything at once. Follow the priority order and complete each action fully before moving to the next.

**Questions?** Refer to:
- `CODE_QUALITY_REVIEW_2026-02-22.md` - Detailed analysis
- `REVIEW_SUMMARY_2026-02-22.md` - Executive summary
- `.devflow/findings.md` - Tracking document

**End of Action Items**
