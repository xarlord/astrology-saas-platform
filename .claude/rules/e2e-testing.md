---
paths:
  - "frontend/e2e/**"
---

## E2E Test Conventions

- Run: `cd frontend && npx playwright test`
- Use `frontend/e2e/*.spec.ts` files
- Use page objects from `frontend/src/pages/`
- Check components in `frontend/src/components/`
- Screenshots saved to `frontend/screenshots/`
- Test structure follows the pattern: describe > describe > test