# Loading and Empty States Documentation

## Overview

This document describes the loading and empty state components that have been implemented across the application to improve user experience during data loading and when content is unavailable.

## Components

### 1. SkeletonLoader Component

**Location:** `frontend/src/components/SkeletonLoader.tsx`

The SkeletonLoader component provides animated placeholder content that matches the layout of actual content, giving users a visual indication that content is loading.

#### Variants

The component supports multiple layout variants:

- **`card`** - Matches chart card layout with header, body, and footer
- **`list`** - Matches transit/analysis list items
- **`text`** - Generic text placeholder
- **`calendar`** - Full calendar grid layout
- **`chart`** - Chart wheel and planetary positions layout

#### Props

```typescript
interface SkeletonLoaderProps {
  variant?: 'card' | 'list' | 'text' | 'calendar' | 'chart';
  count?: number;
  className?: string;
}
```

#### Usage Examples

```tsx
// Single card skeleton
<SkeletonLoader variant="card" />

// Multiple list items
<SkeletonLoader variant="list" count={5} />

// Calendar skeleton
<SkeletonLoader variant="calendar" />

// Chart skeleton with custom class
<SkeletonLoader variant="chart" className="my-custom-class" />

// Grid of cards using helper
<SkeletonGrid count={3} />
```

#### Accessibility Features

- `role="status"` - Identifies as a status region
- `aria-live="polite"` - Announces to screen readers
- `aria-label="Loading content"` - Describes the loading state
- Screen reader only text "Loading..." - Additional context

#### Animation

All skeleton elements use a pulse animation that creates a shimmering effect:
```css
@keyframes skeleton-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

### 2. EmptyState Component

**Location:** `frontend/src/components/EmptyState.tsx`

The EmptyState component provides consistent empty state UI with customizable icons, messages, and call-to-action buttons.

#### Props

```typescript
interface EmptyStateProps {
  icon?: string | React.ReactNode;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
}
```

#### Size Variants

- **`small`** - Compact version for inline use
- **`medium`** - Default size for most cases
- **`large`** - Full-page empty state

#### Pre-configured Empty States

The component includes pre-configured empty states for common scenarios:

```tsx
import { EmptyStates } from './components';

// No charts
<EmptyStates.NoCharts onAction={() => navigate('/charts/new')} />

// No transits
<EmptyStates.NoTransits />

// Error state
<EmptyStates.Error onAction={() => window.location.reload()} />

// Network error
<EmptyStates.NetworkError />

// Not found
<EmptyStates.NotFound />

// No analyses
<EmptyStates.NoAnalyses />

// No reminders
<EmptyStates.NoReminders />

// No calendar events
<EmptyStates.NoCalendarEvents />

// No search results
<EmptyStates.NoSearchResults />
```

#### Usage Examples

```tsx
// Basic empty state
<EmptyState
  title="No data available"
  description="There is no data to display at this time."
/>

// With action button
<EmptyState
  icon="📭"
  title="No messages"
  description="You have no messages yet."
  actionText="Send Message"
  onAction={() => sendMessage()}
/>

// With two actions
<EmptyState
  icon="🔍"
  title="No results found"
  description="Try adjusting your search terms."
  actionText="Clear Search"
  onAction={() => clearSearch()}
  secondaryActionText="Go Back"
  onSecondaryAction={() => goBack()}
/>

// Custom React icon
<EmptyState
  icon={<CustomIcon />}
  title="Custom state"
  description="With custom icon"
/>

// Different sizes
<EmptyState title="Small" size="small" />
<EmptyState title="Medium" size="medium" />
<EmptyState title="Large" size="large" />
```

#### Accessibility Features

- `role="status"` - Identifies as a status region
- `aria-live="polite"` - Announces to screen readers
- `aria-hidden="true"` on icons - Prevents redundant announcements
- Proper heading hierarchy with semantic HTML
- Keyboard-accessible buttons with visible focus states

## Implementation Across Pages

### 1. DashboardPage

**File:** `frontend/src/pages/DashboardPage.tsx`

- **Loading:** `SkeletonGrid` with 3 card skeletons
- **Empty:** `EmptyStates.NoCharts` with CTA to create chart

```tsx
{isLoading ? (
  <SkeletonGrid count={3} />
) : charts.length === 0 ? (
  <EmptyStates.NoCharts onAction={() => navigate('/charts/new')} />
) : (
  // Chart cards
)}
```

### 2. CalendarPage / AstrologicalCalendar

**Files:**
- `frontend/src/pages/CalendarPage.tsx`
- `frontend/src/components/AstrologicalCalendar.tsx`

- **Loading:** `SkeletonLoader` variant="calendar"
- **Empty:** `EmptyState` with custom calendar message
- **Error:** `EmptyState` with retry action

```tsx
if (isLoading) {
  return <SkeletonLoader variant="calendar" />;
}

if (error) {
  return (
    <EmptyState
      icon="📅"
      title="Unable to load calendar"
      description="We encountered an error loading the astrological calendar."
      actionText="Retry"
      onAction={() => refetch()}
    />
  );
}

if (!events || events.data.length === 0) {
  return (
    <EmptyState
      icon="🌙"
      title="No events this month"
      description="There are no major astrological events scheduled."
    />
  );
}
```

### 3. TransitPage

**File:** `frontend/src/pages/TransitPage.tsx`

- **Loading:** `SkeletonLoader` variant="list" with count=5
- **Empty:** `EmptyState` with navigation to create chart
- **Error:** `EmptyState` with retry action

```tsx
if (isLoading) {
  return <SkeletonLoader variant="list" count={5} />;
}

if (error) {
  return (
    <EmptyState
      icon="⚠️"
      title="Unable to load transits"
      description={error}
      actionText="Retry"
      onAction={() => window.location.reload()}
    />
  );
}

if (!transitData) {
  return (
    <EmptyState
      icon="🌙"
      title="No transit data available"
      description="Transit calculations require a natal chart."
      actionText="Create Chart"
      onAction={() => window.location.href = '/charts/new'}
      secondaryActionText="Go to Dashboard"
      onSecondaryAction={() => window.location.href = '/dashboard'}
    />
  );
}
```

### 4. ChartViewPage

**File:** `frontend/src/pages/ChartViewPage.tsx`

- **Loading:** `SkeletonLoader` variant="chart"
- **Empty/Not Found:** `EmptyState` with navigation options
- **Error:** `EmptyState` with retry action

### 5. AnalysisPage

**File:** `frontend/src/pages/AnalysisPage.tsx`

- **Loading:** `SkeletonLoader` variant="text" with count=5
- **Empty:** `EmptyState` with CTA to create chart

### 6. ProfilePage

**File:** `frontend/src/pages/ProfilePage.tsx`

- **Loading:** `SkeletonLoader` variant="card"
- **Error:** `EmptyState` with retry action

### 7. SynastryPage

**File:** `frontend/src/pages/SynastryPage.tsx`

- **Loading:** `SkeletonLoader` variant="card" with count=2
- **Empty (no charts):** `EmptyState` with requirement message
- **Error:** `EmptyState` with retry action

## Styling

### CSS Variables

The components use CSS variables for consistent theming:

```css
/* Light mode */
--skeleton-bg: #f0f0f0;
--skeleton-gradient: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);

/* Dark mode */
.dark --skeleton-bg: #374151;
.dark --skeleton-gradient: linear-gradient(90deg, #374151 25%, #4b5563 50%, #374151 75%);
```

### Responsive Design

All components are fully responsive:

- **SkeletonLoader:** Adapts to container width
- **EmptyState:** Scales appropriately on mobile
- **SkeletonGrid:** Uses CSS Grid with breakpoints (`md:grid-cols-2`, `lg:grid-cols-3`)

## Testing

Comprehensive test suites have been created for both components:

### SkeletonLoader Tests
**File:** `frontend/src/components/__tests__/SkeletonLoader.test.tsx`

- 24 tests covering:
  - All variants rendering correctly
  - Multiple count rendering
  - Custom className application
  - Accessibility attributes
  - Component structure

### EmptyState Tests
**File:** `frontend/src/components/__tests__/EmptyState.test.tsx`

- 27 tests covering:
  - Basic rendering
  - Icon variants (emoji and React nodes)
  - Button rendering and interactions
  - Size variants
  - Accessibility features
  - All pre-configured EmptyStates

### Running Tests

```bash
# Test SkeletonLoader
npm test -- SkeletonLoader.test.tsx

# Test EmptyState
npm test -- EmptyState.test.tsx

# Test all loading/empty state components
npm test -- --testNamePattern="Skeleton|Empty"
```

## Best Practices

### When to Use SkeletonLoader

1. **First-time loads** - When content is loading for the first time
2. **Navigation** - When navigating between pages/routes
3. **Data refresh** - When user triggers a data refresh
4. **Complex layouts** - When layout is known but data is loading

### When to Use EmptyState

1. **No data** - When data array is empty or null
2. **No results** - When search/filter returns no results
3. **Errors** - When data loading fails (with retry action)
4. **Not found** - When requested resource doesn't exist
5. **Empty lists** - When user hasn't created any items yet

### Design Guidelines

1. **Match the layout** - Skeleton should match actual content structure
2. **Be specific** - Empty state messages should be clear and actionable
3. **Provide actions** - Always give users a way forward (CTA buttons)
4. **Use appropriate icons** - Icons should match the context
5. **Consider secondary actions** - Provide alternative paths when helpful
6. **Maintain accessibility** - All states must be accessible to screen readers

### Performance Considerations

1. **Avoid over-skeletonizing** - Don't use skeletons for very fast loads (< 200ms)
2. **Use appropriate count** - Match expected content count
3. **Keep animations smooth** - Pulse animation is performant
4. **Test on slow networks** - Ensure good UX on 3G/slow connections

## Migration Guide

To migrate existing pages to use these components:

### Step 1: Identify Loading States

Find places using basic spinners or loading text:
```tsx
// OLD
{isLoading && <div className="spinner"></div>}
{isLoading && <p>Loading...</p>}
```

Replace with appropriate SkeletonLoader:
```tsx
// NEW
{isLoading && <SkeletonLoader variant="card" count={3} />}
```

### Step 2: Identify Empty States

Find places with basic empty messages:
```tsx
// OLD
{items.length === 0 && <p>No items found</p>}
```

Replace with EmptyState:
```tsx
// NEW
{items.length === 0 && (
  <EmptyState
    icon="📭"
    title="No items found"
    description="Create your first item to get started."
    actionText="Create Item"
    onAction={() => createItem()}
  />
)}
```

### Step 3: Add Error States

If error handling is missing or basic:
```tsx
// OLD
{error && <p>Error: {error.message}</p>}
```

Replace with proper error EmptyState:
```tsx
// NEW
{error && (
  <EmptyState
    icon="⚠️"
    title="Unable to load data"
    description={error.message}
    actionText="Retry"
    onAction={() => refetch()}
  />
)}
```

## Future Enhancements

Potential improvements for future iterations:

1. **Animation variants** - Different loading animation styles (shimmer, pulse, fade)
2. **Progressive loading** - Skeletons that reveal content progressively
3. **Skeleton transitions** - Smooth fade-out/slide-in animations
4. **Personalized empty states** - Context-aware messages based on user behavior
5. **Illustration options** - Support for SVG illustrations in empty states
6. **Localization** - Multi-language support for all messages
7. **Theme customization** - Easy theme overrides for different brands

## Related Documentation

- [Component Testing Guide](../docs/TESTING.md)
- [Accessibility Guidelines](../docs/ACCESSIBILITY.md)
- [Design System](../docs/DESIGN_SYSTEM.md)
- [React Performance](../docs/PERFORMANCE.md)
