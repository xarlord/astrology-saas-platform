---
description: Full QA pass — lint, type check, and test everything
---

# Full QA Pass

Run all quality checks:

## Step 1: Backend Lint & Type Check
- `cd backend && npx eslint src --ext .ts`
- `cd backend && npx tsc --noEmit`

## Step 2: Frontend Lint & Type Check
- `cd frontend && npx eslint . --ext ts,tsx`
- `cd frontend && npx tsc --noEmit`

## Step 3: Backend Tests
- `cd backend && npx jest --coverage`

## Step 4: Frontend Tests
- `cd frontend && npx vitest run`

## Step 5: Summary
| Check | Status | Issues |
|-------|--------|--------|
| Backend Lint | pass/fail | count |
| Backend Types | pass/fail | errors |
| Backend Tests | pass/fail | pass/total + coverage |
| Frontend Lint | pass/fail | count |
| Frontend Types | pass/fail | errors |
| Frontend Tests | pass/fail | pass/total |

For any failures, provide the top 3 most critical issues to fix.