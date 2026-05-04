# @astrology-saas/shared-types

Shared TypeScript type definitions used across the AstroVerse monorepo.

## Installation

```bash
npm install @astrology-saas/shared-types
```

> Part of the monorepo — changes here require `npm run build` before backend/frontend pick them up.

## Exports

| Export | Kind | Description |
|--------|------|-------------|
| `User` | interface | `{ id, email, name }` |
| `PlanetPosition` | interface | Planet placement: planet, sign, degree, minute, second, house, retrograde, optional lat/lon/speed |
| `HouseCusp` | interface | House cusp: house number, sign, degree, minute, second |
| `Aspect` | interface | Aspect between planets: planet1, planet2, type, degree, orb, applying/separating |
| `AspectType` | type | `'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile' | 'quincunx' | 'semi-sextile'` |

## Usage

```typescript
import { PlanetPosition, Aspect } from '@astrology-saas/shared-types';
```

*Last updated: 2026-04-05*
