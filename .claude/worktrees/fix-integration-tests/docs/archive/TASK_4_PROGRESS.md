# Task #4: Fix API Contract Misalignment

**Started:** 2026-02-22
**Status:** IN PROGRESS
**Priority:** CRITICAL
**Estimated Effort:** 3-4 days

---

## Problem Statement

Frontend expects camelCase property names but backend sends snake_case. Type definitions don't match actual API responses, causing runtime errors.

### Known Contract Mismatches

**BirthData:**
- Frontend: `date`, `time`, `location`
- Backend: `birth_date`, `birth_time`, `birth_place_name`

**Chart:**
- Frontend: `birthData`
- Backend: `birth_data`

**User:**
- Frontend expects: `avatar`, `createdAt`
- Backend sends: Different structure

**Calendar:**
- Frontend: `EventType` enum
- Backend: String literals (`"moon-phase"`, etc.)

**PlanetPosition:**
- Frontend expects: Array or object structure
- Backend sends: Object with `sun`, `moon`, `ascendant` keys

---

## Strategy

**Decision:** Frontend adapts to backend with transformation utilities

**Rationale:**
- Backend is source of truth
- Easier to fix frontend than break all API clients
- Transformation layer isolates changes
- Can be reused across components

---

## Subtasks

### 4.1 Audit API Contracts ⏳
- Document all API endpoints
- Compare frontend types with backend responses
- Create mapping document

### 4.2 Choose Consistency Strategy ✅
- Decision: Frontend adapts to backend
- Document decision and rationale

### 4.3 Create API Transformation Utilities ⏳
- Create `src/utils/apiTransformers.ts`
- Implement transformer functions
- Add runtime validation

### 4.4 Update Service Layer ⏳
- Update chart.service.ts
- Update calendar.service.ts
- Update user.service.ts

### 4.5 Update Components ⏳
- Update UserProfile.tsx
- Update SavedChartsGalleryPage.tsx
- Update NatalChartDetailPage.tsx
- Update all components consuming API data

### 4.6 Update Type Definitions ⏳
- Define API response types (snake_case)
- Define frontend domain types (camelCase)
- Add Zod schemas for validation

---

## Acceptance Criteria

- [ ] All API contracts documented
- [ ] Transformation utilities created and tested
- [ ] All components work with actual API responses
- [ ] No property access errors
- [ ] Type safety maintained

---

**Last Updated:** 2026-02-22
**Current Focus:** Starting with API audit and transformer creation
