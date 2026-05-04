# Development Environment Setup

## Prerequisites

- **Node.js** >= 20.0.0
- **npm** >= 10.0.0
- **PostgreSQL** 15+ (or Docker for containerized DB)
- **Git**

## Quick Start

### 1. Clone and Install

```bash
git clone <repo-url>
cd MVP_Projects
npm install          # Installs all workspaces (root + backend + frontend + packages/*)
```

### 2. Environment Variables

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

Edit `.env` and `backend/.env` with your local values. Minimum required:
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — random string for token signing
- `PORT` — backend port (default 3001)

### 3. Database

**Option A: Docker (recommended)**

```bash
docker compose -f docker-compose.dev.yml up -d
```

PostgreSQL runs on port **5434** (not default 5432).

**Option B: Local PostgreSQL**

Update `DATABASE_PORT` in `backend/.env` to match your local setup (default 5432).

### 4. Run Migrations & Seeds

```bash
cd backend
npx knex migrate:latest
npx knex seed:run
```

### 5. Start Development

```bash
# From repo root — starts both backend + frontend
npm run dev
```

- Backend: http://localhost:3001 (tsx watch, auto-reloads)
- Frontend: http://localhost:5173 (Vite, HMR)

Or start individually:

```bash
npm run dev:backend   # Backend only
npm run dev:frontend  # Frontend only
```

## Shared Packages

If you modify anything in `packages/*`, rebuild before testing in backend/frontend:

```bash
cd packages/shared-types && npm run build
cd packages/shared-utils && npm run build
```

## Testing

```bash
# Backend
cd backend && npx jest                        # All tests
cd backend && npx jest --testPathPattern=auth # Specific suite
cd backend && npm run test:coverage           # With coverage

# Frontend
cd frontend && npx vitest run                 # All unit tests
cd frontend && npx vitest                     # Watch mode
cd frontend && npm run test:coverage          # With coverage

# E2E
cd frontend && npx playwright install         # First time only
cd frontend && npx playwright test            # Headless
cd frontend && npx playwright test --headed   # With browser
```

## Code Quality

```bash
npm run lint                  # Lint all workspaces
npm run format:check          # Check formatting
npm run format:fix            # Auto-fix formatting
cd backend && npx tsc --noEmit   # Type check backend
cd frontend && npx tsc --noEmit  # Type check frontend
```

## Useful Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Build both workspaces |
| `npm run db:migrate` | Run pending migrations |
| `npm run db:seed` | Run seeders |
| `npm run clean` | Remove all node_modules |

## Troubleshooting

- **Port 5434 already in use**: Docker PostgreSQL uses 5434. Stop it with `docker compose -f docker-compose.dev.yml down`.
- **Swiss Ephemeris errors in tests**: Ephemeris data files (`.se1`) are mocked in tests. Only live tests need real data.
- **CSRF errors in development**: CSRF is auto-skipped in test env. For manual API testing, fetch `/csrf-token` first.
- **Config module shows wrong values**: Config reads env vars at import time. Set vars before starting the server.
