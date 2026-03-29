# Dashboard Usage Display - Detailed Specification

## Overview

**ID:** UI-USAGE-001
**Priority:** P2 (Medium)
**Category:** Frontend UI Component
**Estimated Effort:** 2 hours

## Problem Statement

Users need visibility into their chart storage usage to:
- Understand how many charts they've created vs their limit
- Know when they're approaching their limit
- Get prompted to upgrade when they need more storage
- Plan their chart management accordingly

## Requirements

### Functional Requirements

#### FR-1: Usage Display Component
- Display current chart count vs tier limit
- Visual progress bar showing usage percentage
- Color-coded warning states (green → yellow → red)
- Quick action button when approaching limit

#### FR-2: Warning States
- Normal (0-79%): Green indicator
- Warning (80-99%): Yellow/amber indicator with upgrade prompt
- Limit Reached (100%): Red indicator, create button disabled

#### FR-3: Tier Information
- Display current tier name (Free/Pro/Premium)
- Show tier-specific features
- Link to upgrade page

### Non-Functional Requirements

#### NFR-1: Performance
- Component loads instantly (<100ms)
- Updates after chart creation/deletion

#### NFR-2: Accessibility
- ARIA labels for progress bar
- Color-independent indicators (icons + color)
- Screen reader announcements

## Component Design

### UsageMeter Component

```typescript
interface UsageMeterProps {
  currentCount: number;
  limit: number;
  tier: 'free' | 'pro' | 'premium';
  onUpgradeClick: () => void;
}

// Visual states:
// 0-79%: Green progress bar, no warning
// 80-99%: Yellow progress bar, upgrade prompt visible
// 100%: Red progress bar, "Limit reached" message, create disabled
```

### Component Structure

```tsx
<UsageMeter>
  <UsageHeader>
    <TierBadge tier={tier} />
    <UsageText>{current} / {limit} charts</UsageText>
  </UsageHeader>
  <ProgressBar percentage={percentage} variant={variant} />
  <UsageFooter>
    {isAtWarning && <UpgradePrompt onClick={onUpgradeClick} />}
    {isAtLimit && <LimitReachedMessage />}
  </UsageFooter>
</UsageMeter>
```

## API Integration

### Get Usage Info

```typescript
// GET /api/v1/users/me/usage
interface UsageResponse {
  charts: {
    current: number;
    limit: number;
    percentage: number;
  };
  tier: {
    name: string;
    features: string[];
  };
  canCreate: boolean;
  warningLevel: 'none' | 'warning' | 'limit';
}
```

## Test Plan

### Unit Tests

| Test ID | Description | Expected Result |
|---------|-------------|-----------------|
| UT-1 | Renders with correct count | Shows "3 / 3 charts" |
| UT-2 | Shows green bar at 50% | Green progress bar |
| UT-3 | Shows yellow bar at 85% | Yellow progress bar + upgrade prompt |
| UT-4 | Shows red bar at 100% | Red progress bar + limit message |
| UT-5 | Upgrade button triggers callback | onUpgradeClick called |
| UT-6 | Accessibility: ARIA labels present | Role="progressbar" with aria-valuenow |

### Coverage Targets

- Component: 90% line coverage
- Integration: 85% scenario coverage

## Success Criteria

1. Usage displays correctly for all tiers
2. Warning states show at correct thresholds
3. Upgrade prompts appear appropriately
4. 90%+ test coverage
5. All tests passing
