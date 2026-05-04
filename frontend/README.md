# AstroVerse Frontend

React 18 + Vite 5 SPA with PWA support. Serves the astrology SaaS UI at `localhost:5173`.

## Quick Start

```bash
npm install
npm run dev    # starts on port 5173, proxies /api to backend:3001
```

Requires the backend running on port 3001 for API calls.

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Vite dev server (port 5173) |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build |
| `npm run test` | Vitest in watch mode |
| `npm run test:run` | Single Vitest run |
| `npm run test:coverage` | Coverage report (v8) |
| `npm run test:e2e` | Playwright E2E tests |
| `npm run test:e2e:quick` | E2E (Chromium only) |
| `npm run lint` | ESLint check |
| `npm run type-check` | TypeScript type check |

## Architecture

```
src/
  App.tsx                # Root with lazy-loaded routes
  main.tsx               # Entry (BrowserRouter, StrictMode)
  sw.ts                  # Service worker (PWA)
  components/            # Reusable UI components
    ui/                  # Design system primitives (Button, Card, Modal, etc.)
    chart/               # Chart rendering (D3-based)
    layout/              # Page layout shells
  pages/                 # Route-level page components (lazy-loaded)
  hooks/                 # Custom React hooks (34 hooks)
  services/              # API client layer (axios-based)
  store/                 # Zustand global state (auth, charts)
  types/                 # Centralized type definitions
  utils/                 # Shared utilities
  __tests__/             # Unit tests
```

## Key Routes

**Public:** `/`, `/login`, `/register`, `/forgot-password`, `/subscription`

**Protected (require auth):** `/dashboard`, `/charts/*`, `/analysis/*`, `/calendar`, `/synastry`, `/transits`, `/solar-returns`, `/lunar-returns`, `/profile`, `/settings`, `/learning`

All pages are lazy-loaded via `React.lazy()`.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI | React 18 |
| Build | Vite 5 (SWC) |
| Styling | Tailwind CSS 3 |
| State | Zustand (client) + React Query (server) |
| Charts | D3 + Recharts |
| Routing | React Router 6 |
| Animations | Framer Motion |
| HTTP | Axios (via shared API client) |
| PWA | vite-plugin-pwa (injectManifest) |
| Testing | Vitest + Playwright + Testing Library |

## Path Aliases

| Alias | Resolves To |
|-------|-------------|
| `@/*` | `src/*` |
| `@services` | `src/services` |
| `@components` | `src/components` |
| `@hooks` | `src/hooks` |
| `@utils` | `src/utils` |
| `@types` | `src/types` |

## State Management

- **Zustand:** Auth state (`useAuthStore`), charts state (`useChartsStore`). Persisted to localStorage.
- **React Query:** Server data fetching. 5-min stale time, 1 retry, no refetch on window focus.

## Conventions

- **API calls:** Always use `import api from '../services/api'` — never raw axios
- **Navigation:** Use `<Link>` or `useNavigate()` — never raw `<a href>`
- **Tokens:** Use `tokenStorage` utility — never access localStorage directly for auth
- **Barrel exports:** Every directory has `index.ts` re-exporting public API
- **Components:** Functional components with TypeScript props interfaces
- **Dark mode:** Class-based (`darkMode: 'class'`), cosmic theme with glassmorphism tokens

## Build Output

- **Directory:** `dist/`
- **Chunking:** vendor (react), charts (d3), query, utils — 1000 kB warning limit
- **Minification:** Terser (drops `console` and `debugger` in prod)
- **Sourcemaps:** Enabled

*Last updated: 2026-04-05*
