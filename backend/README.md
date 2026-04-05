# AstroVerse Backend

Express 4 + TypeScript 5 API server. Serves the astrology SaaS platform at `localhost:3001`.

## Quick Start

```bash
npm install
cp .env.example .env   # then fill in required values (see below)
npm run db:migrate     # set up PostgreSQL schema
npm run dev            # starts on port 3001 with hot reload
```

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server with hot reload (tsx watch) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run production build |
| `npm test` | Full test suite (Jest) |
| `npm run test:unit` | Unit tests only |
| `npm run test:integration` | Integration tests |
| `npm run test:coverage` | Tests with coverage report |
| `npm run lint` | ESLint check |
| `npm run db:migrate` | Run Knex migrations |
| `npm run db:rollback` | Rollback last migration batch |
| `npm run db:seed` | Seed the database |
| `npm run db:reset` | Rollback + migrate + seed |

## Architecture

```
src/
  server.ts              # Entry point, middleware stack, graceful shutdown
  config/                # Environment config (dotenv loaded here)
  api/v1/                # Route registration (16 modules)
  middleware/             # auth, csrf, errorHandler, rateLimiter, requestLogger
  modules/{domain}/      # Feature modules
    controllers/         # Standalone exported async functions: (req, res) => void
    models/              # Domain DB models
    routes/              # Route definitions: export { router as XRoutes }
    services/            # Business logic
  shared/services/       # Cross-cutting: swissEphemeris, natalChart, astronomyEngine
  utils/                 # Shared utilities (logger, appError, etc.)
  __tests__/             # Tests organized by type
```

## API Routes (v1)

| Path | Domain |
|------|--------|
| `/api/v1/auth` | Authentication |
| `/api/v1/users` | User management |
| `/api/v1/charts` | Natal charts |
| `/api/v1/share` | Chart sharing (public) |
| `/api/v1/analysis` | Personality analysis |
| `/api/v1/transits` | Transit forecasting |
| `/api/v1/calendar` | Calendar events |
| `/api/v1/lunar-return` | Lunar return charts |
| `/api/v1/synastry` | Synastry/compatibility |
| `/api/v1/solar-returns` | Solar return charts |
| `/api/v1/timezone` | Timezone lookup (public) |
| `/api/v1/location` | Location lookup (public) |
| `/api/v1/ai` | AI interpretation |
| `/api/v1/notifications` | Push notifications |
| `/api/v1/billing` | Billing/Stripe |
| `/api/v1/health` | Health check |

## Environment Variables

### Required

| Variable | Notes |
|----------|-------|
| `JWT_SECRET` | **Must set in production** (throws if missing) |
| `DATABASE_URL` | PostgreSQL connection string |

### Optional (with defaults)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port |
| `NODE_ENV` | `development` | Environment |
| `FRONTEND_URL` | `http://localhost:3000` | CORS origin |
| `DATABASE_PORT` | `5434` | Docker PostgreSQL port |
| `REDIS_URL` | `redis://localhost:6379` | Redis for caching |
| `STRIPE_SECRET_KEY` | — | Stripe payments |
| `OPENAI_API_KEY` | — | AI interpretations |
| `LOG_LEVEL` | `info` | Winston log level |

## Conventions

- **Controllers:** Standalone `export async function(req, res) => void` — no classes, no `next` param
- **Routes:** `export { router as XRoutes }` — named exports only
- **Errors:** Throw `AppError` subclasses, caught by global error handler
- **Responses:** `{ success: true, data }` or `{ success: false, error }`
- **Imports:** ES2022/NodeNext — no `require()`, use `import`
- **Logging:** Use `logger` from `utils/logger` — never `console.log`
- **Auth:** All authenticated controllers use `AuthenticatedRequest` from `middleware/auth.ts`
- **Path aliases:** `@/*` → `src/*`, `@tests/*` → `src/__tests__/*`

## Middleware Stack

helmet → cors → body-parser (10MB) → cookie-parser → compression → CSRF → rate limiter (prod) → request logger → routes → 404 → error handler

- CSRF skipped in test env unless `TEST_CSRF` is set
- Rate limiter skips auth endpoints

*Last updated: 2026-04-05*
