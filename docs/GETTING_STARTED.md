# Getting Started

From clone to running app in under 5 minutes.

## Prerequisites

- **Node.js** 20+
- **npm** 10+
- **Docker** (for PostgreSQL and Redis)
- **Git**

## 1. Clone & Install

```bash
git clone <repo-url>
cd MVP_Projects
npm install            # installs all workspaces (root + backend + frontend + packages)
```

## 2. Start Infrastructure

```bash
# PostgreSQL on port 5434, Redis on port 6379
docker compose up -d
```

## 3. Configure Backend

```bash
cd backend
cp .env.example .env
```

Minimum `.env` for local dev:

```
JWT_SECRET=local-dev-secret
DATABASE_URL=postgresql://postgres:postgresql@localhost:5434/astrology_saas
```

Then run migrations:

```bash
npm run db:migrate
npm run db:seed        # optional: seed sample data
```

## 4. Start the App

From the repo root:

```bash
npm run dev
```

This starts both backend (port 3001) and frontend (port 5173) concurrently.

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001/api/v1
- **Health check:** http://localhost:3001/health

## 5. Verify

| Check | Expected |
|-------|----------|
| Frontend loads | Landing page at localhost:5173 |
| API responds | `{ "success": true }` at localhost:3001/health |
| Register a user | Use the sign-up form |

## Monorepo Structure

```
MVP_Projects/
  backend/          # Express API server
  frontend/         # React SPA
  packages/
    shared-types/   # Shared TypeScript types
    shared-utils/   # Shared utility functions
    shared-constants/ # Shared constants
  docs/             # Project documentation
  agents/           # AI agent instruction files
```

## Common Commands

| What | Command |
|------|---------|
| Dev both | `npm run dev` |
| Dev backend only | `cd backend && npm run dev` |
| Dev frontend only | `cd frontend && npm run dev` |
| Backend tests | `cd backend && npm test` |
| Frontend tests | `cd frontend && npm run test:run` |
| E2E tests | `cd frontend && npx playwright test` |
| Lint everything | `npm run lint` |
| Build everything | `npm run build` |
| DB reset | `cd backend && npm run db:reset` |

## Troubleshooting

**Port already in use:** Kill existing processes on 3001 or 5173, or change `PORT` in backend `.env`.

**Database connection failed:** Ensure Docker PostgreSQL is running: `docker compose ps`. Check port is 5434 (not default 5432).

**Frontend can't reach API:** Vite proxies `/api` to `localhost:3001` automatically. Make sure backend is running.

**Type errors after pulling:** Shared packages may need rebuilding:
```bash
cd packages/shared-types && npm run build
```

## Next Steps

- Read `backend/README.md` for backend architecture and conventions
- Read `frontend/README.md` for frontend architecture and conventions
- Check `CLAUDE.md` for AI agent conventions and known gotchas

*Last updated: 2026-04-05*
