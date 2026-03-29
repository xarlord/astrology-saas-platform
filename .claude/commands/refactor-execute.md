---
description: Execute refactoring from an audit report. Usage: /refactor-execute [report-path]
---

# Refactor Execute

Execute refactoring changes from an audit report using parallel agents.

## Input
The user provides a report path (e.g., `reports/refactor/backend-controllers.md`).

## Steps

1. **Read the report** from the provided path

2. **Parse items** into independent work units:
   - Group by file/module for minimal conflict
   - Each unit should be self-contained (no cross-dependencies within batch)

3. **Launch refactor-worker agents in parallel** (max 3 at a time):
   - Each agent gets:
     - One or more related items from the report
     - Preloaded `refactoring-patterns` skill
     - The `acceptEdits` flag for direct file editing
   - Workers apply changes and run relevant tests

4. **Verify results**:
   - Run `cd backend && npx jest` for backend changes
   - Run `cd frontend && npx tsc --noEmit` for frontend changes
   - Run `cd frontend && npx vitest run` for frontend test changes

5. **Report results**:
   - List completed items
   - List any failures or regressions
   - Show test output summary

6. **Offer to commit** changes if all tests pass