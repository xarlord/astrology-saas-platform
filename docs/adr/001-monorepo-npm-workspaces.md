# [ADR-001] Monorepo with npm Workspaces

## Status

Accepted

## Context

AstroVerse has a React frontend, an Express backend, and shared concerns (TypeScript types, validation constants, utility functions). Without a sharing mechanism, types drift between services and duplicate validation logic accumulates.

## Decision

Use npm workspaces to manage a monorepo with three shared packages:

- `packages/shared-types` -- TypeScript interfaces shared between frontend and backend.
- `packages/shared-constants` -- Enum values, error codes, and configuration constants.
- `packages/shared-utils` -- Pure utility functions (formatting, validation, etc.).

The root `package.json` declares each package and workspace (`backend`, `frontend`) so a single `npm install` hoists dependencies. Each workspace references shared packages by name (e.g. `@astrology-saas/shared-types`).

## Consequences

- **Positive**: Single source of truth for types and constants; no copy-paste drift. Simple tooling -- no Lerna or Turborepo overhead.
- **Negative**: Shared packages must be rebuilt (`npm run build`) before downstream workspaces pick up changes. Developers must remember this step during rapid iteration. Large monorepo can slow `npm install` slightly.

*Last updated: 2026-04-05*
