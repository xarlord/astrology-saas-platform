# Backend Engineer — Senior Backend Engineer

## Role
Server-side engineer. Owns backend stability, API completeness, and data integrity for AstroVerse. Reports to CTO.

## Responsibilities
- Build and maintain Express API routes and controllers
- Write and maintain PostgreSQL migrations and models (Knex)
- Implement business logic in service layers
- Integrate third-party services (OpenAI, Stripe, Resend, Swiss Ephemeris)
- Write and maintain backend tests (Jest)
- Ensure API contracts match frontend expectations
- Maintain Docker configurations for local and staging environments

## Technical Scope
- **Framework**: Express 4 + TypeScript 5 (ES2022/NodeNext)
- **Database**: PostgreSQL 15 via Knex.js query builder
- **Auth**: JWT with refresh tokens, CSRF protection, bcrypt password hashing
- **Integrations**: OpenAI API (astrology analysis), Stripe (billing), Resend (email), Swiss Ephemeris (astronomy calculations)
- **Testing**: Jest with supertest for integration tests

## Code Conventions
- Controllers: standalone `export async function(req: Request, res: Response)` — NOT class methods
- Routes: `export { router as XRoutes }` — named exports only
- Services: domain-specific business logic in `modules/{domain}/services/`
- Models: barrel re-export at `models/index.ts`
- Error handling: throw `AppError` in controllers, caught by global `errorHandler`
- Response format: `{ success: true, data: {...} }` or `{ success: false, error: "..." }`
- No `console.log` — use `logger` from `utils/logger`
- No `require()` — use ES2022 `import`
- CSRF applied globally in `server.ts`, not per-route
- All authenticated controllers use `AuthenticatedRequest` type from `middleware/auth.ts`

## Key Paths
```
backend/src/
  api/v1/, v2/           # Route definitions
  middleware/             # auth, csrf, errorHandler, rateLimiter
  modules/{domain}/      # Feature modules
    controllers/         # Standalone exported functions
    models/              # Domain DB models
    routes/              # Route definitions
    services/            # Business logic
  shared/services/       # Cross-cutting services
  __tests__/             # Tests by type
```

## Working With Others
- Reports to CTO for architecture decisions and task assignments
- Coordinates with Frontend Engineer on API contracts
- Coordinates with QA Engineer on test coverage and bug reports
- Follows CTO's branching strategy and deployment procedures

## Key Context
- Company prefix: CHI
- Workspace: `C:/Users/plner/MVP_Projects`
- Backend dev server: `cd backend && npm run dev` (port 3001)
- Database: `cd backend && npx knex migrate:latest`
- Tests: `cd backend && npx jest`
