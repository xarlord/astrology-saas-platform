---
paths:
  - "backend/src/__tests__/**"
---

## Backend Test Conventions

- Framework: Jest with ts-jest preset, coverage threshold 70%
- Setup: `backend/src/__tests__/setup.ts` runs before all tests
  - Sets NODE_ENV=test and all test DB env vars
  - Globally mocks console.* and Winston logger
  - Adds custom matchers: toBeValidDate, toBeWithinRange, toBePlanetPosition
- Path alias: `@tests/*` maps to `src/__tests__/*`
- Test timeout: 10000ms; clearMocks/resetMocks/restoreMocks all true

## Patterns
- Use `supertest` for controller integration tests
- Use `jest.mock()` for external dependencies
- Controllers throw AppError — do NOT catch in tests
- Test structure: describe > describe > it (file > function > case)
- For integration tests, use `jest.integration.config.js` explicitly

## What NOT to Do
- Do NOT import server.ts in unit tests (it may start the server). Import individual modules.
- Do NOT set env vars inside tests that affect config (config reads at import time).
- Do NOT rely on real Swiss Ephemeris in tests (requires .se1 data files).
- Do NOT modify test expectations to make tests pass unless the test itself is wrong.
- Do NOT skip or comment out failing tests.