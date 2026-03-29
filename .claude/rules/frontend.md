---
paths:
  - "frontend/src/**"
---

## Frontend Architecture
- React 18 functional components with hooks only (no class components)
- Vite 5 with SWC, Tailwind CSS 3 with clsx + tailwind-merge
- State: Zustand (global), React Query (server)
- Routing: react-router-dom v6, Charts: D3, Icons: heroicons + lucide-react

## Conventions
- Named exports (not default), one component per file
- Barrel index.ts in component directories
- Tailwind classes first, colocated CSS only for complex animations
- API via shared axios client in services/api.ts - never import raw axios
- React Query for data fetching with proper cache keys
- Shared types in types/ directory; component props stay co-located
- Error handling: use getErrorMessage from utils/errorHandling.ts

## Type Centralization
- types/chart.types.ts: Chart, BirthData, ChartData, PlanetPosition, HouseCusp, Aspect
- types/synastry.types.ts: SynastryAspect, CompatibilityScores, SynastryChart, etc.
- types/lunar-return.types.ts: LunarReturnChart, SavedLunarReturn, etc.
- types/calendar.types.ts: Calendar events, moon phases, etc.
- Services re-export types for backward compatibility

## Path Aliases
- @/* -> src/*
- @components/* -> src/components/*
- @pages/* -> src/pages/*
- @services/* -> src/services/*
- @hooks/* -> src/hooks/*
- @stores/* -> src/store/* (singular directory, plural alias)
- @utils/* -> src/utils/*

## Testing
- Vitest with jsdom, Testing Library, MSW for API mocking
- Setup uses fake timers by default, coverage thresholds 100%
