# Feature Specification: Synastry Comparison Types

**Version:** 1.0
**Status:** Ready for Development
**Priority:** P2 (Medium Impact, Low Effort)
**Requirement ID:** REQ-SYN-006
**Timeline:** 1 week

---

## 1. Feature Overview

### 1.1 Objective
Extend the synastry/compatibility feature to support multiple comparison types: Romantic, Business, and Friendship. Each type provides tailored interpretations and scoring weights appropriate to the relationship context.

### 1.2 User Stories
- **As a user**, I want to compare charts for romantic compatibility so I can understand relationship dynamics with a partner
- **As a user**, I want to compare charts for business compatibility so I can assess potential business partnerships
- **As a user**, I want to compare charts for friendship compatibility so I can understand platonic relationship dynamics

### 1.3 Success Criteria
- Users can select comparison type before calculation
- Each type produces different scoring weights
- Interpretations are tailored to relationship context
- UI clearly indicates current comparison mode
- Comparison type is saved with the report

---

## 2. Comparison Type Definitions

### 2.1 Romantic Compatibility

**Focus Areas:**
- Emotional connection (Moon aspects)
- Physical attraction (Venus/Mars aspects)
- Long-term potential (Saturn aspects)
- Communication (Mercury aspects)

**Scoring Weights:**
```typescript
const ROMANTIC_WEIGHTS = {
  moonAspects: 0.25,      // Emotional connection
  venusMarsAspects: 0.20, // Physical/romantic attraction
  sunAspects: 0.15,       // Core identity harmony
  mercuryAspects: 0.15,   // Communication
  saturnAspects: 0.15,    // Long-term stability
  jupiterAspects: 0.05,   // Growth potential
  otherAspects: 0.05      // Everything else
};
```

**Interpretation Themes:**
- Love language compatibility
- Emotional needs alignment
- Conflict resolution styles
- Intimacy and passion indicators

### 2.2 Business Compatibility

**Focus Areas:**
- Communication (Mercury aspects)
- Ambition and drive (Mars aspects)
- Growth potential (Jupiter aspects)
- Structure and discipline (Saturn aspects)

**Scoring Weights:**
```typescript
const BUSINESS_WEIGHTS = {
  mercuryAspects: 0.25,   // Communication is critical
  marsAspects: 0.20,      // Drive and action
  saturnAspects: 0.20,    // Structure and reliability
  jupiterAspects: 0.15,   // Growth and expansion
  sunAspects: 0.10,       // Leadership compatibility
  moonAspects: 0.05,      // Less emphasis on emotions
  otherAspects: 0.05      // Everything else
};
```

**Interpretation Themes:**
- Working style compatibility
- Decision-making alignment
- Strengths/weaknesses complementarity
- Communication efficiency

### 2.3 Friendship Compatibility

**Focus Areas:**
- Shared values (Sun/Jupiter aspects)
- Communication ease (Mercury aspects)
- Social compatibility (Venus aspects)
- Mutual support (Moon aspects)

**Scoring Weights:**
```typescript
const FRIENDSHIP_WEIGHTS = {
  sunAspects: 0.20,       // Core values alignment
  mercuryAspects: 0.20,   // Easy conversation
  venusAspects: 0.20,     // Social harmony
  jupiterAspects: 0.15,   // Shared adventures
  moonAspects: 0.15,      // Emotional support
  marsAspects: 0.05,      // Less competitive focus
  otherAspects: 0.05      // Everything else
};
```

**Interpretation Themes:**
- Shared interests and hobbies
- Communication style
- Social activity preferences
- Support and loyalty indicators

---

## 3. API Specification

### 3.1 Extended Synastry Request

```typescript
// POST /api/v1/synastry/calculate
interface SynastryRequest {
  chart1Id: string;
  chart2Id: string;
  comparisonType: 'romantic' | 'business' | 'friendship'; // NEW FIELD
  options?: {
    houseSystem?: string;
    zodiacType?: string;
    orbs?: OrbSettings;
  };
}
```

### 3.2 Extended Synastry Response

```typescript
interface SynastryResponse {
  id: string;
  chart1Id: string;
  chart2Id: string;
  comparisonType: 'romantic' | 'business' | 'friendship';

  scores: {
    overall: number;
    categories: {
      romantic?: CategoryScore;    // Only for romantic type
      business?: CategoryScore;    // Only for business type
      friendship?: CategoryScore;  // Only for friendship type
      communication: CategoryScore;
      emotional: CategoryScore;
      intellectual: CategoryScore;
      values: CategoryScore;
    };
  };

  aspects: SynastryAspect[];
  interpretation: {
    summary: string;
    strengths: string[];
    challenges: string[];
    advice: string[];
    // Type-specific sections
    focusAreas: string[];  // Different per type
  };

  compositeChart: ChartData;
  createdAt: string;
}
```

---

## 4. Frontend Components

### 4.1 ComparisonTypeSelector Component

**File:** `frontend/src/components/ComparisonTypeSelector.tsx`

```typescript
interface ComparisonTypeSelectorProps {
  value: ComparisonType;
  onChange: (type: ComparisonType) => void;
  disabled?: boolean;
}

type ComparisonType = 'romantic' | 'business' | 'friendship';

// Features:
// - Radio button group or segmented control
// - Icons for each type (heart, briefcase, users)
// - Brief description on hover/select
// - Visual indication of current selection
```

### 4.2 Updated SynastryCalculator Component

**Updates to existing component:**

```typescript
interface SynastryCalculatorProps {
  // ... existing props
  defaultComparisonType?: ComparisonType;
  onComparisonTypeChange?: (type: ComparisonType) => void;
}

// Add comparison type selector above chart selectors
// Pass type to API on calculation
```

---

## 5. Database Schema Updates

### 5.1 synastry_reports table

```sql
ALTER TABLE synastry_reports
ADD COLUMN comparison_type VARCHAR(20) DEFAULT 'romantic'
CHECK (comparison_type IN ('romantic', 'business', 'friendship'));

CREATE INDEX idx_synastry_type ON synastry_reports (comparison_type);
```

---

## 6. Test Cases

### 6.1 Unit Tests

| Test ID | Description | Expected Result |
|---------|-------------|-----------------|
| UT-SYN-TYPE-001 | Calculate romantic weights | Correct weighted score |
| UT-SYN-TYPE-002 | Calculate business weights | Correct weighted score |
| UT-SYN-TYPE-003 | Calculate friendship weights | Correct weighted score |
| UT-SYN-TYPE-004 | Same charts, different types produce different scores | Scores differ |
| UT-SYN-TYPE-005 | Interpretation contains type-specific language | Correct themes |

### 6.2 Integration Tests

| Test ID | Description | Expected Result |
|---------|-------------|-----------------|
| IT-SYN-TYPE-001 | API accepts comparison type | 200 response with correct type |
| IT-SYN-TYPE-002 | API defaults to romantic | Default type = 'romantic' |
| IT-SYN-TYPE-003 | Report saved with correct type | Database has correct type |
| IT-SYN-TYPE-004 | Invalid type returns error | 400 response |

### 6.3 E2E Tests

| Test ID | Description | Expected Result |
|---------|-------------|-----------------|
| E2E-SYN-TYPE-001 | Select romantic type, calculate | Romantic interpretation shown |
| E2E-SYN-TYPE-002 | Select business type, calculate | Business interpretation shown |
| E2E-SYN-TYPE-003 | Select friendship type, calculate | Friendship interpretation shown |
| E2E-SYN-TYPE-004 | Switch types, verify different results | Different scores/interpretations |
| E2E-SYN-TYPE-005 | Type persists in saved report | Report shows correct type |

---

## 7. Implementation Checklist

### Week 1: Backend & Frontend

**Day 1-2: Backend**
- [ ] Add comparison_type to synastry service
- [ ] Implement weighted scoring per type
- [ ] Create type-specific interpretation templates
- [ ] Update API schema
- [ ] Add database migration
- [ ] Unit tests for scoring logic

**Day 3-4: Frontend**
- [ ] Create ComparisonTypeSelector component
- [ ] Update SynastryCalculator to use selector
- [ ] Update SynastryPage to display type
- [ ] Update saved reports display
- [ ] Component tests

**Day 5: Integration & E2E**
- [ ] Integration tests
- [ ] E2E tests
- [ ] Documentation update

---

## 8. Acceptance Criteria

- [ ] User can select between romantic, business, and friendship modes
- [ ] Each mode produces different weighted scores
- [ ] Interpretations are contextually appropriate
- [ ] Comparison type is saved with reports
- [ ] All test cases pass
- [ ] No regression in existing synastry functionality

---

**Ready for development!** ✅
