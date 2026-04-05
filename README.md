# AstroVerse — Astrology SaaS Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-cyan)](https://react.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Full-stack astrology platform: natal charts, personality analysis, transit forecasting, synastry, lunar/solar returns, and AI interpretations. Monorepo via npm workspaces.

## Quick Start

```bash
git clone <repo-url> && cd MVP_Projects
npm install
docker compose up -d          # PostgreSQL (5434) + Redis (6379)
cd backend && cp .env.example .env && npm run db:migrate
npm run dev                    # backend :3001 + frontend :5173
```

See [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md) for the full walkthrough.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Express 4 + TypeScript 5 (ES2022/NodeNext) + Knex + PostgreSQL 15 |
| Frontend | React 18 + Vite 5 + Tailwind 3 + Zustand + React Query + D3 |
| Testing | Jest (backend), Vitest (frontend), Playwright (E2E) |
| Infra | Docker, Redis, JWT auth, Stripe billing |

## Architecture

```
backend/src/
  modules/{domain}/    # controllers, services, models, routes
  shared/services/     # astronomyEngine, natalChart, swissEphemeris
  middleware/          # auth, csrf, errorHandler, rateLimiter
  api/v1/              # route registration (16 modules)

frontend/src/
  components/          # React components (barrel index.ts per directory)
  pages/               # route-level pages (lazy-loaded)
  hooks/               # 34 custom hooks
  services/            # API client (axios-based)
  store/               # Zustand state (auth, charts)
```

## Commands

| What | Command |
|------|---------|
| Dev (both) | `npm run dev` |
| Backend tests | `cd backend && npm test` |
| Frontend tests | `cd frontend && npm run test:run` |
| E2E tests | `cd frontend && npx playwright test` |
| Build all | `npm run build` |
| Lint all | `npm run lint` |
| DB reset | `cd backend && npm run db:reset` |

## API Docs

Interactive Swagger UI at `/api/docs` when the backend is running. JSON spec at `/api/docs.json`.

## Documentation

| Doc | Description |
|-----|-------------|
| [GETTING_STARTED.md](docs/GETTING_STARTED.md) | New contributor guide |
| [backend/README.md](backend/README.md) | Backend setup, architecture, env vars |
| [frontend/README.md](frontend/README.md) | Frontend setup, components, state management |
| [API_ERROR_CODES.md](docs/API_ERROR_CODES.md) | Error code reference for API consumers |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture overview |
| [SECURITY_AUDIT.md](docs/SECURITY_AUDIT.md) | Security audit findings |
| [TESTING_GUIDE.md](docs/TESTING_GUIDE.md) | Testing conventions and examples |

## Contributing

1. Fork and create a feature branch
2. Write tests for new functionality
3. Ensure `npm run lint` and `npm test` pass
4. Follow [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `docs:`, etc.

## License

MIT
