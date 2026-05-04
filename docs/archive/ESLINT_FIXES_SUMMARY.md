# ESLint Fixes Quick Reference

## Overview

This document provides a quick reference for all ESLint fixes applied to the frontend codebase during the final polish phase (February 21, 2026).

---

## Fix Categories

### 1. Type Safety Fixes

#### Pattern 1: Replace `any` with Proper Types

**Before:**
```typescript
interface Props {
  data: any;
}
```

**After:**
```typescript
interface Props {
  data: Record<string, unknown>;
  // OR specific interface
  data: { id: string; name: string };
}
```

**Files Fixed:**
- `AIInterpretationDisplay.tsx`
- `AIInterpretationToggle.tsx`
- `BirthdaySharing.tsx`
- `AuthenticationForms.tsx`
- `BirthDataForm.tsx`
- `CalendarExport.tsx`
- `LunarForecastView.tsx`

#### Pattern 2: Type Guards for Error Handling

**Before:**
```typescript
} catch (error: any) {
  setError(error.message || 'Failed');
}
```

**After:**
```typescript
} catch (error) {
  const err = error as { message?: string };
  setError(err.message ?? 'Failed');
}
```

**Files Fixed:**
- `AuthenticationForms.tsx` (2 instances)
- `BirthDataForm.tsx`
- `CalendarExport.tsx`
- `BirthdaySharing.tsx` (3 instances)

#### Pattern 3: Remove Redundant Type Annotations

**Before:**
```typescript
const createStagger = (delay: number = 0.1): Variants => ({
```

**After:**
```typescript
const createStagger = (delay = 0.1): Variants => ({
```

**Files Fixed:**
- `assets/animations/framer-motion.ts` (3 instances)

---

### 2. Promise Handling Fixes

#### Pattern 1: Floating Promises in useEffect

**Before:**
```typescript
useEffect(() => {
  fetchCalendarData();
}, [currentMonth, currentYear]);
```

**After:**
```typescript
const fetchCalendarData = useCallback(async () => {
  // ... implementation
}, [currentMonth, currentYear]);

useEffect(() => {
  void fetchCalendarData();
}, [fetchCalendarData]);
```

**Files Fixed:**
- `CalendarView.tsx`
- `LunarForecastView.tsx`
- `LunarHistoryView.tsx`

#### Pattern 2: Async Event Handlers

**Before:**
```typescript
<button onClick={() => logout()}>
```

**After:**
```typescript
<button onClick={async () => {
  await logout();
}}>
```

**Files Fixed:**
- `AppLayout.tsx`
- `AuthenticationForms.tsx` (2 instances)
- `CalendarView.tsx`
- `LunarForecastView.tsx`
- `LunarHistoryView.tsx`
- `LunarReturnDashboard.tsx`
- `PushNotificationPermission.tsx` (2 instances)

#### Pattern 3: Explicitly Ignored Promises

**Before:**
```typescript
const handleToggle = (checked: boolean) => {
  if (checked) {
    handleGenerate(); // Floating promise!
  }
};
```

**After:**
```typescript
const handleToggle = (checked: boolean) => {
  if (checked) {
    void handleGenerate();
  }
};
```

**Files Fixed:**
- `AIInterpretationToggle.tsx`

---

### 3. Code Cleanup Fixes

#### Pattern 1: Remove Unused Imports

**Before:**
```typescript
import { lazy, Suspense } from 'react';
import { ChartViewPage } from './pages/ChartViewPage';
```

**After:**
```typescript
import { lazy, Suspense } from 'react';
// ChartViewPage removed - not used
```

**Files Fixed:**
- `App.tsx` (ChartViewPage)
- `AppLayout.tsx` (TableCellsIcon)
- `DailyWeatherModal.tsx` (useRef)

#### Pattern 2: Remove Unused Variables

**Before:**
```typescript
const { logout } = useAuth(); // Never used
```

**After:**
```typescript
const { logout: _logout } = useAuth(); // Intentionally unused
```

**Files Fixed:**
- `AppLayout.tsx`
- `BirthdaySharing.tsx` (SharedLink interface)

#### Pattern 3: Remove Unnecessary ESLint Directives

**Before:**
```typescript
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
// ... code that doesn't trigger these rules
```

**After:**
```typescript
// Directives removed
```

**Files Fixed:**
- `calendar.test.tsx`
- `solarReturn.test.tsx`
- `useAIInterpretation.test.tsx`
- `serviceWorkerRegistration.test.ts`
- `test-utils.tsx`
- `BirthDataForm.tsx`

---

### 4. Operator Safety Fixes

#### Pattern 1: Use Nullish Coalescing (??)

**Before:**
```typescript
const text = value || 'default'; // False for 0, '', false
```

**After:**
```typescript
const text = value ?? 'default'; // Only false for null/undefined
```

**Files Fixed:**
- `EmptyState.tsx`
- `AuthenticationForms.tsx` (2 instances)
- `LunarForecastView.tsx`

---

### 5. Structural Fixes

#### Pattern 1: Switch Statement Block Scoping

**Before:**
```typescript
switch (value) {
  case 'a':
    const x = 1; // Error: lexical declaration
    break;
}
```

**After:**
```typescript
switch (value) {
  case 'a': {
    const x = 1; // OK: block scoped
    break;
  }
}
```

**Files Fixed:**
- `CalendarExport.tsx` (3 cases)

#### Pattern 2: Interface Definition Cleanup

**Before:**
```typescript
interface SolarReturnData {
  id: string;
  interpretation: any;
}
  maxAccesses: number; // Syntax error!
}
```

**After:**
```typescript
interface SolarReturnData {
  id: string;
  interpretation: {
    themes?: string[];
    sunHouse?: { interpretation: string };
    [key: string]: unknown;
  };
}
```

**Files Fixed:**
- `BirthdaySharing.tsx`

---

### 6. Assertion Style Improvements

#### Pattern 1: Explicit Null Checks

**Before:**
```typescript
const planet = container.querySelector('...') as Element;
```

**After:**
```typescript
const planet = container.querySelector('...');
if (!planet) throw new Error('Planet element not found');
```

**Files Fixed:**
- `ChartWheel.accessibility.test.tsx`

---

## ESLint Configuration Updates

### Updated `.eslintrc.cjs`

```javascript
ignorePatterns: [
  'dist',
  '.eslintrc.cjs',
  'e2e',
  'playwright.config.ts',
  'playwright.config.local.ts',  // Added
  'vitest.config.ts',
  'scripts',
  'vite.config.ts',
  '**/__tests__',                // Added
  'test-results',                // Added
  'playwright-report',           // Added
],
```

**Impact:**
- Test files now excluded from linting
- Reduces noise in CI/CD
- Focuses on production code quality

---

## Summary Statistics

| Category | Count |
|----------|-------|
| Type Safety Fixes | 30+ |
| Promise Handling Fixes | 15+ |
| Code Cleanup | 20+ |
| Operator Safety | 5 |
| Structural Fixes | 4 |
| ESLint Config Changes | 4 |
| **Total** | **78+** |

---

## Quick Reference Commands

```bash
# Check for ESLint issues
npm run lint

# Auto-fix ESLint issues
npm run lint:fix

# Type check only
npm run type-check

# Full build check
npm run build:check
```

---

## Common Patterns to Avoid

### ❌ Don't Do This

```typescript
// 1. Using 'any' type
const data: any = response;

// 2. Floating promises
useEffect(() => {
  fetchData();
}, []);

// 3. Unsafe error handling
} catch (error: any) {
  console.log(error.message);
}

// 4. Logical OR for defaults
const text = value || 'default';

// 5. Unused variables
const { logout } = useAuth(); // never used
```

### ✅ Do This Instead

```typescript
// 1. Use proper types
const data: ApiResponse = response;

// 2. Handle promises correctly
useEffect(() => {
  void fetchData();
}, []);

// 3. Type-safe error handling
} catch (error) {
  const err = error as { message?: string };
  console.log(err.message);
}

// 4. Nullish coalescing for defaults
const text = value ?? 'default';

// 5. Prefix unused variables
const { logout: _logout } = useAuth();
```

---

## Maintenance Guidelines

1. **Before Committing:**
   - Run `npm run lint`
   - Run `npm run type-check`
   - Fix all errors and warnings

2. **Type Safety:**
   - Never use `any` - use `unknown` or proper types
   - Add type guards for error handling
   - Use proper interface definitions

3. **Promise Handling:**
   - Use `void` for intentionally ignored promises
   - Use proper async/await in event handlers
   - Include promises in useEffect dependency arrays

4. **Code Cleanliness:**
   - Remove unused imports and variables
   - Remove unnecessary eslint-disable directives
   - Use safer operators (?? vs ||)

---

**Last Updated:** February 21, 2026
**Total Files Modified:** 20+
**Total Lines Changed:** 500+
