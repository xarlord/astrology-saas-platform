# Local Development Setup

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | 18+ | LTS recommended |
| Docker Desktop | Latest | For PostgreSQL 15 and Redis |
| npm | 9+ | Monorepo workspace support |

## 1. Start Infrastructure

```bash
docker-compose -f docker-compose.dev.yml up -d
```

Runs PostgreSQL on **5434** and Redis on **6379**.

Verify: `docker ps | grep -E "postgres|redis"`

## 2. Install Dependencies

```bash
npm install                 # Root -- installs all workspaces
```

Rebuild shared packages after changes:

```bash
cd packages/shared-types && npm run build
```

## 3. Start Backend (port 3001)

```bash
cd backend
cp .env.example .env       # Configure DATABASE_URL, JWT_SECRET, etc.
npx knex migrate:latest     # Run migrations
npx knex seed:run           # Optional: seed data
npm run dev                 # tsx watch with hot reload
```

Health check: `curl http://localhost:3001/health`

## 4. Start Frontend (port 5173)

```bash
cd frontend
cp .env.example .env        # Set VITE_API_URL=http://localhost:3001
npm run dev                  # Vite dev server
```

Open `http://localhost:5173` in your browser.

## Key API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user (auth required) |
| GET | `/api/charts` | List user charts |
| POST | `/api/charts` | Create chart |
| GET | `/health` | Backend health |
| GET | `/health/db` | Database health |

## Database Access

```bash
docker exec -it astrology-staging-db psql -U postgres
\c astrology_db    # Connect to DB
\dt                # List tables
\q                 # Quit
```

## Running Tests

```bash
cd backend && npx jest                           # All backend tests
cd backend && npx jest --testPathPattern=chart    # Specific suite
cd frontend && npx vitest run                     # Frontend unit tests
cd frontend && npx playwright test                # E2E tests
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Port 3001 in use | `lsof -i :3001` or `netstat -ano \| findstr :3001`, then kill process |
| Port 5173 in use | Same approach, port 5173 |
| DB connection refused | `docker ps` to confirm postgres running; check DATABASE_URL port is **5434** |
| Migration errors | `npx knex migrate:rollback` then re-run `migrate:latest` |
| Swiss Ephemeris errors | Expected in tests -- mocked by default; real data requires `.se1` files |
| npm install fails | Delete `node_modules` in root + each workspace, then `npm install` |

*Last updated: 2026-04-05*
