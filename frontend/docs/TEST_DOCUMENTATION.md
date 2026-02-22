# Frontend UI Component Test Specifications

## Overview

This document provides comprehensive test specifications for the frontend UI components using React Testing Library and Jest/Vitest. The test suite covers all major components including authentication, core features, calendar functionality, and expansion features.

## Test Framework Configuration

### Dependencies

- **Vitest**: Test runner
- **React Testing Library**: Component testing utilities
- **@testing-library/user-event**: User interaction simulation
- **@testing-library/jest-dom**: Custom DOM matchers

### Test Setup

Configuration file: `C:\Users\plner\MVP_Projects\frontend\src\components\__tests__\test-setup.ts`

**Features:**
- Global test cleanup
- Mock implementations for browser APIs (matchMedia, IntersectionObserver, ResizeObserver)
- Test data factories and helpers
- Custom render functions with routing support

---

## Test Files Created

### 1. Authentication Forms Tests
**File**: `AuthenticationForms.test.tsx`

**Coverage:**
- ✅ Login form validation (email, password, format, length)
- ✅ Registration form validation (name, email, password complexity, confirmation)
- ✅ Error handling and display
- ✅ Success states and callbacks
- ✅ Password visibility toggle
- ✅ Loading states
- ✅ Social auth buttons rendering
- ✅ Accessibility (labels, ARIA attributes, keyboard navigation)
- ✅ Required field indicators
- ✅ Error clearing on user input

**Test Count**: 40+ test cases

---

### 2. Birth Data Form Tests
**File**: `BirthDataForm.test.tsx`

**Coverage:**
- ✅ Form rendering with all sections (Date & Time, Location, Chart Details)
- ✅ Form validation (required fields, coordinates, chart name)
- ✅ Time unknown checkbox behavior
- ✅ Place search and geocoding API integration
- ✅ Coordinate display and validation
- ✅ House system and zodiac type selection
- ✅ Sidereal mode display (conditional)
- ✅ Form submission with API calls
- ✅ Loading states during submission
- ✅ Error handling and display
- ✅ Initial data population
- ✅ Accessibility (labels, required fields, date constraints)

**Test Count**: 35+ test cases

---

### 3. Chart Wheel Tests
**File**: `ChartWheel.test.tsx`

**Coverage:**
- ✅ SVG rendering and sizing
- ✅ Zodiac wheel with 12 segments
- ✅ Planet display with symbols and colors
- ✅ Retrograde indicators
- ✅ House lines and numbers
- ✅ Aspect lines with colors and styles
- ✅ Interactive features (planet click, aspect click)
- ✅ Legend component rendering
- ✅ Responsive design and scaling
- ✅ Empty data handling
- ✅ Edge cases (missing planet info, extreme positions)
- ✅ Accessibility (SVG attributes, text alignment)

**Test Count**: 30+ test cases

---

### 4. User Profile Tests
**File**: `UserProfile.test.tsx`

**Coverage:**
- ✅ Profile header with user info
- ✅ Tab navigation (Account, Charts, Preferences, Subscription)
- ✅ Profile editing mode
- ✅ Form validation and updates
- ✅ Chart list display and management
- ✅ Chart actions (view, edit, delete)
- ✅ Empty state handling
- ✅ Preferences configuration
- ✅ Subscription plan display
- ✅ Theme selection
- ✅ Accessibility (ARIA labels, button types)
- ✅ Responsive design

**Test Count**: 40+ test cases

---

### 5. App Layout Tests
**File**: `AppLayout.test.tsx`

**Coverage:**
- ✅ Layout structure (header, sidebar, footer, main content)
- ✅ Top navigation with user menu
- ✅ Sidebar navigation sections
- ✅ Mobile navigation (menu button, bottom nav)
- ✅ Footer with all links
- ✅ User dropdown menu
- ✅ Logout functionality
- ✅ Responsive behavior
- ✅ Dark mode support
- ✅ Logo rendering
- ✅ Accessibility (semantic HTML, ARIA labels)
- ✅ Edge cases (null user, missing name)

**Test Count**: 35+ test cases

---

### 6. Calendar View Tests
**File**: `CalendarView.test.tsx`

**Coverage:**
- ✅ Calendar rendering (header, weekdays, grid)
- ✅ Month navigation (previous, next, today)
- ✅ Year rollover handling
- ✅ Event display with badges
- ✅ Event icons and colors by intensity
- ✅ Event limit display (3 per day)
- ✅ Date click and modal interactions
- ✅ Loading states
- ✅ Error handling and retry
- ✅ Leap year handling
- ✅ Different month day counts
- ✅ Data fetching on month change
- ✅ Accessibility (ARIA labels, event titles)

**Test Count**: 35+ test cases

---

### 7. Astrological Calendar Tests
**File**: `AstrologicalCalendar.test.tsx`

**Coverage:**
- ✅ Calendar header and navigation
- ✅ Weekday display
- ✅ Moon phase events (new, full, phases)
- ✅ Retrograde events
- ✅ Eclipse events
- ✅ Event sign information
- ✅ Event badges and tooltips
- ✅ Loading states
- ✅ Error handling and retry
- ✅ Calendar layout (offsets, day counts)
- ✅ Event filtering by month
- ✅ Multiple events on same day
- ✅ Leap year February
- ✅ Responsive design

**Test Count**: 30+ test cases

---

### 8. Daily Weather Modal Tests
**File**: `DailyWeatherModal.test.tsx`

**Coverage:**
- ✅ Modal rendering (overlay, content)
- ✅ Formatted date display
- ✅ Rating display and color coding
- ✅ Summary section
- ✅ Moon phase section (icon, name, sign, illumination)
- ✅ Global events section
- ✅ Personal transits section
- ✅ Activities section (lucky, challenging)
- ✅ Modal interactions (close button, overlay click)
- ✅ Event card display
- ✅ Event intensity colors
- ✅ Empty state handling
- ✅ Unknown moon phase handling
- ✅ Accessibility (ARIA labels, focus trapping)

**Test Count**: 35+ test cases

---

### 9. Reminder Settings Tests
**File**: `ReminderSettings.test.tsx`

**Coverage:**
- ✅ Settings header and form rendering
- ✅ Event type selection (All, Major Transits, Retrogrades, Eclipses)
- ✅ Reminder type selection (Email, Push)
- ✅ Advance timing options (hour, day, week)
- ✅ Multiple timing selection
- ✅ Active toggle
- ✅ Form submission
- ✅ Loading states
- ✅ Success message display
- ✅ Visual feedback (highlighting, checkmarks)
- ✅ Existing reminder population
- ✅ Form state management
- ✅ Icon display
- ✅ Accessibility (labels, semantic HTML)

**Test Count**: 30+ test cases

---

## Additional Test Files (Existing)

The following test files were already present in the codebase:

- ✅ `SynastryPage.test.tsx`
- ✅ `SynastryCalculator.test.tsx`
- ✅ `LunarHistoryView.test.tsx`
- ✅ `LunarForecastView.test.tsx`
- ✅ `LunarReturnDashboard.test.tsx`
- ✅ `LunarChartView.test.tsx`

---

## Test Coverage Summary

### Components Tested: 15+
### Total Test Cases: 300+

### Coverage Areas:

1. **Rendering & Layout**
   - Component structure
   - Conditional rendering
   - Responsive design
   - Dark mode support

2. **User Interactions**
   - Form submissions
   - Button clicks
   - Input changes
   - Modal open/close
   - Navigation

3. **Data Handling**
   - API integration
   - Loading states
   - Error handling
   - Data validation
   - Empty states

4. **Form Validation**
   - Required fields
   - Format validation
   - Length constraints
   - Password complexity
   - Email validation
   - Error messages

5. **Accessibility**
   - ARIA labels
   - Semantic HTML
   - Keyboard navigation
   - Screen reader support
   - Focus management

6. **Edge Cases**
   - Null/undefined data
   - Empty arrays
   - Leap years
   - Month boundaries
   - API failures
   - Network errors

---

## Running Tests

### Run All Tests
```bash
npm test
```

### Run in Watch Mode
```bash
npm test -- --watch
```

### Run with Coverage
```bash
npm test -- --coverage
```

### Run Specific Test File
```bash
npm test -- AuthenticationForms.test.tsx
```

### Run with UI
```bash
npm test -- --ui
```

---

## Test Organization

### Directory Structure
```
frontend/
└── src/
    └── components/
        ├── __tests__/
        │   ├── test-setup.ts              # Global test configuration
        │   ├── AuthenticationForms.test.tsx
        │   ├── BirthDataForm.test.tsx
        │   ├── ChartWheel.test.tsx
        │   ├── UserProfile.test.tsx
        │   ├── AppLayout.test.tsx
        │   ├── CalendarView.test.tsx
        │   ├── AstrologicalCalendar.test.tsx
        │   ├── DailyWeatherModal.test.tsx
        │   ├── ReminderSettings.test.tsx
        │   ├── SynastryCalculator.test.tsx
        │   ├── SynastryPage.test.tsx
        │   ├── LunarReturnDashboard.test.tsx
        │   ├── LunarChartView.test.tsx
        │   ├── LunarForecastView.test.tsx
        │   └── LunarHistoryView.test.tsx
        ├── AuthenticationForms.tsx
        ├── BirthDataForm.tsx
        ├── ChartWheel.tsx
        ├── UserProfile.tsx
        ├── AppLayout.tsx
        ├── CalendarView.tsx
        ├── AstrologicalCalendar.tsx
        ├── DailyWeatherModal.tsx
        ├── ReminderSettings.tsx
        └── ... (other components)
```

---

## Testing Best Practices Used

1. **User-Centric Testing**: Tests simulate real user behavior
2. **Accessibility First**: All interactive elements are accessible
3. **Isolation**: Each test is independent and doesn't affect others
4. **Clear Test Names**: Descriptive test names that explain what is being tested
5. **Arrange-Act-Assert**: Clear structure in each test
6. **Mocking**: External dependencies are mocked appropriately
7. **Error Scenarios**: Both success and failure cases are tested
8. **Edge Cases**: Boundary conditions and unusual inputs are tested

---

## Future Test Coverage

### Components Still Needing Tests:
1. SolarReturnDashboard
2. SolarReturnChart
3. SolarReturnInterpretation
4. CalendarExport
5. Additional utility components

### Integration Tests Needed:
1. Multi-component workflows
2. Route navigation
3. State management (Zustand stores)
4. React Query integration

### E2E Tests Needed:
1. Complete user journeys
2. Authentication flows
3. Chart creation workflows
4. Calendar interactions

---

## Continuous Integration

These tests are designed to run in CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run Tests
  run: npm test -- --run --coverage

- name: Upload Coverage
  run: npm run test:coverage
```

---

## Maintenance

### Adding New Tests
1. Create test file in `__tests__` directory
2. Import necessary dependencies from `test-setup.ts`
3. Follow the naming convention: `[ComponentName].test.tsx`
4. Use `describe` blocks for grouping
5. Use descriptive test names

### Updating Tests
1. Keep tests synchronized with component changes
2. Update mocks when APIs change
3. Add new test cases for new features
4. Maintain high test coverage (>80%)

---

## Test Metrics Goals

- **Code Coverage**: >80%
- **Branch Coverage**: >75%
- **Function Coverage**: >85%
- **Statement Coverage**: >80%

---

## Documentation

For more detailed information about:
- React Testing Library: https://testing-library.com/docs/react-testing-library/intro/
- Vitest: https://vitest.dev/
- Jest DOM matchers: https://github.com/testing-library/jest-dom

---

**Last Updated**: 2026-02-18
**Total Test Files**: 15+
**Total Test Cases**: 300+
