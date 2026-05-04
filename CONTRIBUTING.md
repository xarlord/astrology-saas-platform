# Contributing to AstroVerse

## Branch Strategy

We use a trunk-based workflow with `master` as the production branch and `develop` as the integration branch.

### Branch Naming

All branches must follow these patterns:

| Type | Format | Example |
|------|--------|---------|
| Feature | `feature/CHI-XX-short-description` | `feature/CHI-91-ci-pipeline` |
| Bug fix | `fix/CHI-XX-short-description` | `fix/CHI-42-auth-redirect` |
| Hotfix | `hotfix/CHI-XX-short-description` | `hotfix/CHI-99-db-timeout` |
| Chore | `chore/CHI-XX-short-description` | `chore/CHI-15-deps-update` |

### Branch Flow

1. Create branch from `develop` (or `master` for hotfixes)
2. Make changes with conventional commits
3. Push and open a PR targeting `develop`
4. After review, merge to `develop`
5. `develop` is periodically merged to `master` for releases

## Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/) with task IDs:

```
type(scope): description

CHI-XX
```

Examples:
```
feat(auth): add password reset flow
fix(charts): resolve Swiss Ephemeris timezone offset
chore(deps): update React to 18.3
docs(api): add billing endpoint docs
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`

## Code Conventions

### Backend (Express + TypeScript)
- Controllers: standalone exported `async function(req, res)` — not class methods
- Routes: `export { router as XRoutes }` — named exports only
- No `console.log` — use `logger` from `utils/logger`
- No `require()` — use ES module `import`
- Error handling: throw `AppError`, caught by global error handler
- Response format: `{ success: true, data }` or `{ success: false, error }`

### Frontend (React + Vite)
- Use `import api from '../services/api'` — never raw axios
- Use `<Link>` or `useNavigate()` — never `<a href>`
- Use `tokenStorage` utility — never direct localStorage for auth tokens
- Barrel files (`index.ts`) in every component directory

### Testing
- Backend: Jest — `cd backend && npx jest`
- Frontend unit: Vitest — `cd frontend && npx vitest run`
- E2E: Playwright — `cd frontend && npx playwright test`
- Type check: `npx tsc --noEmit` in each workspace
- Lint: `npm run lint`

## Pull Request Process

1. Ensure all tests pass locally
2. Open PR against `develop` using the PR template
3. Address review feedback
4. Squash-merge when approved (single clean commit per feature)
