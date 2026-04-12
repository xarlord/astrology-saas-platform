# Code Review Checklist

Use this checklist when reviewing PRs. Not every item applies to every PR — use judgement.

## Security

- [ ] No secrets, API keys, or credentials in code (use env vars)
- [ ] User input is validated at API boundaries (controllers/routes)
- [ ] SQL queries use parameterized inputs (Knex query builder, not raw strings)
- [ ] Auth-protected routes use `AuthenticatedRequest` type
- [ ] CSRF token handling is correct (global middleware, not per-route)
- [ ] Rate limiting applied to sensitive endpoints

## Code Quality

- [ ] No `console.log` in backend code — use `logger` from `utils/logger`
- [ ] No `require()` in backend source — use ES2022 `import`
- [ ] Frontend uses `import api from '../services/api'` — never raw `axios`
- [ ] Frontend uses `<Link>` or `useNavigate()` — never raw `<a href>`
- [ ] No unused imports or dead code
- [ ] Error handling: throw `AppError` in controllers, caught by global handler
- [ ] Response format: `{ success: true, data }` or `{ success: false, error }`

## Architecture

- [ ] Controllers are standalone exported functions, not class methods
- [ ] Route exports use `export { router as XRoutes }` — named exports only
- [ ] Imports go directly to source, not through proxy barrel layers
- [ ] New files follow the module structure: `modules/{domain}/controllers|services|models|routes/`
- [ ] Frontend barrel exports: `index.ts` per component directory
- [ ] Types imported from `types/` — component-specific props stay co-located

## Testing

- [ ] New code has corresponding tests
- [ ] Backend tests: `cd backend && npx jest --testPathPattern=<domain>`
- [ ] Frontend tests: `cd frontend && npx vitest run`
- [ ] Swiss Ephemeris is mocked in tests (no real .se1 files in CI)
- [ ] Config module: set env vars before importing (reads at import time)

## Performance & UX

- [ ] No unnecessary re-renders (React keys, memoization where appropriate)
- [ ] Token storage uses `tokenStorage` utility — never raw `localStorage`
- [ ] Loading states for async operations
- [ ] Error states displayed to user

## Git Hygiene

- [ ] Commit messages explain *why*, not *what*
- [ ] No unrelated changes bundled in the PR
- [ ] Branch is up to date with target branch
- [ ] CI passes: lint, type-check, tests
