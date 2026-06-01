# AstroVerse — Astrology SaaS Platform

[![CI/CD](https://img.shields.io/badge/CI%2FCD-All%20Green-brightgreen)](https://github.com/xarlord/astrology-saas-platform/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-cyan)](https://react.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Full-stack astrology platform: natal charts with interactive chart wheel, AI-powered interpretations (GPT-4), transit forecasting, synastry compatibility, lunar/solar returns, and subscription billing via Stripe.

## Project Status

**Current Version:** v1.5.0
**CI Status:** All 9 pipeline jobs green (backend, frontend, live, e2e, visual, integration, BDD, accessibility, verify-build) + mutation testing
**Tests:** 1,354 backend (Jest) + 4,463 frontend (Vitest)

### What's Done
- **80+ API endpoints** across 16 backend modules
- **22 frontend pages** with dark cosmic theme
- **22 database tables** with full migrations
- Real astronomical calculations via astronomy-engine
- AI interpretations (OpenAI GPT-4)
- Stripe billing (Free/Pro/Premium tiers)
- Email (Resend), PDF reports (Puppeteer), push notifications
- Chart sharing, solar/lunar returns, synastry reports
- Full test suite: unit, integration, BDD, E2E, visual regression, mutation

### What's Next
- Circular natal chart / ephemeris view enhancements
- UI polish — remaining design review items
- Onboarding flow optimization
- Performance tuning

## Quick Start

```bash
git clone https://github.com/xarlord/astrology-saas-platform.git && cd astrology-saas-platform
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
| AI | OpenAI GPT-4 Turbo (interpretations, transit analysis) |
| Testing | Jest (backend), Vitest (frontend), Playwright (E2E), Playwright visual regression, Stryker (mutation) |
| Infra | Docker, Redis, JWT auth, CSRF protection, Stripe billing, Resend email |
| Deployment | Fly.io (Docker), Docker Compose (staging), GitHub Actions CI/CD |

## Architecture

```
backend/src/
  modules/{domain}/    # controllers, services, models, routes
  shared/services/     # astronomyEngine, natalChart, swissEphemeris
  middleware/          # auth, csrf, errorHandler, rateLimiter, planEnforcement
  api/v1/              # route registration (16 modules)

frontend/src/
  components/          # React components (barrel index.ts per directory)
  pages/               # route-level pages (lazy-loaded)
  hooks/               # 34 custom hooks
  services/            # API client (axios-based)
  store/               # Zustand state (auth, charts)
```

## Features

- **Natal Chart Creation** — Interactive SVG/D3 chart wheel with real astronomical calculations
- **AI Interpretations** — GPT-4 powered personality analysis, transit forecasts, synastry reports
- **Transit Forecasting** — Daily, weekly, monthly transit tracking with orb calculations
- **Synastry Compatibility** — Full aspect-level comparison between two charts
- **Solar & Lunar Returns** — Annual return charts with interpretations
- **Astrological Calendar** — Moon phases, retrogrades, global events
- **Chart Sharing** — Public/private/password-protected sharing links
- **PDF Reports** — Puppeteer-generated natal chart reports
- **Subscription Billing** — Stripe Checkout + Customer Portal (Free/Pro/Premium)
- **Push Notifications** — Web Push for transit alerts and daily briefings

## Commands

| What | Command |
|------|---------|
| Dev (both) | `npm run dev` |
| Backend tests | `cd backend && npm test` |
| Frontend tests | `cd frontend && npm run test:run` |
| E2E tests | `cd frontend && npx playwright test` |
| Visual regression | `cd frontend && npx playwright test --config=tests/visual/playwright.visual.config.ts` |
| Build all | `npm run build` |
| Lint all | `npm run lint` |
| DB reset | `cd backend && npm run db:reset` |

## CI Pipeline

All checks run on every PR via GitHub Actions:

1. **Backend test** — lint, typecheck, unit tests
2. **Frontend test** — lint, typecheck, unit tests
3. **Live tests** — backend integration against running server
4. **BDD tests** — 5 browser configs (Chromium/Firefox/WebKit × desktop/mobile)
5. **Visual regression** — screenshot comparison across 3 viewports
6. **E2E tests** — Playwright full user journey
7. **Integration tests** — API route integration
8. **Accessibility tests** — axe-core automated audit
9. **Mutation testing** — Stryker kill score verification

## API Docs

Interactive Swagger UI at `/api/docs` when the backend is running. JSON spec at `/api/docs.json`.

## Documentation

| Doc | Description |
|-----|-------------|
| [MVP Sprint Plan](.planning/mvp-scope-sprint-plan.md) | Full MVP scope & 4-sprint plan |
| [GETTING_STARTED.md](docs/GETTING_STARTED.md) | New contributor guide |
| [backend/README.md](backend/README.md) | Backend setup, architecture, env vars |
| [frontend/README.md](frontend/README.md) | Frontend setup, components, state management |
| [API_ERROR_CODES.md](docs/API_ERROR_CODES.md) | Error code reference |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture overview |
| [SECURITY_AUDIT.md](docs/SECURITY_AUDIT.md) | Security audit findings |
| [TESTING_GUIDE.md](docs/TESTING_GUIDE.md) | Testing conventions |

## Contributing

1. Fork and create a feature branch from `master`
2. Write tests for new functionality
3. Ensure all CI checks pass
4. Follow [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `docs:`, etc.
5. Open PR — squash merge after CI green + review

## License

MIT
