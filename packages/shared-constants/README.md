# @mooncalender/shared-constants

Shared astrology constants used across the AstroVerse monorepo.

## Installation

```bash
npm install @mooncalender/shared-constants
```

## Build

```bash
npm run build    # compiles to dist/
npm run watch    # watch mode
npm run clean    # remove dist/
```

> Changes require rebuild before backend/frontend pick them up.

## Exports by Sub-module

### `./zodiac`
`ZODIAC_SIGNS`, `ZodiacSign`, `ZODIAC_SYMBOLS`, `ZODIAC_NAMES`, `ELEMENTS`, `MODALITIES`, `ZODIAC_RULERS`

### `./planets`
`PLANETS`, `Planet`, `PLANET_SYMBOLS`, `PLANET_NAMES`, `PERSONAL_PLANETS`, `SOCIAL_PLANETS`, `OUTER_PLANETS`, `PLANET_COLORS`

### `./aspects`
`ASPECT_TYPES`, `AspectType`, `ASPECT_SYMBOLS`, `ASPECT_ANGLES`, `DEFAULT_ORBS`, `MAJOR_ASPECTS`, `MINOR_ASPECTS`, `ASPECT_COLORS`, `ASPECT_QUALITIES`

### `./houses`
`HOUSE_SYSTEMS`, `HouseSystem`, `HOUSE_SYSTEM_NAMES`, `DEFAULT_HOUSE_SYSTEM`, `HOUSE_COUNT`, `HOUSE_MEANINGS`

### `./errors`
`ERROR_MESSAGES`, `ErrorMessage`, `HTTP_STATUS_CODES`

### `./config`
`ZODIAC_TYPES`, `ZodiacType`, `SIDEREAL_MODES`, `CHART_TYPES`, `ChartType`, `USER_ROLES`, `UserRole`, `SUBSCRIPTION_TIERS`, `SubscriptionTier`, `TIMEZONES`, `DEFAULT_TIMEZONE`, `API_VERSIONS`, `DEFAULT_API_VERSION`

## Usage

```typescript
import { ZODIAC_SIGNS, PLANETS } from '@mooncalender/shared-constants';
import { ASPECT_TYPES } from '@mooncalender/shared-constants/aspects';
```

*Last updated: 2026-04-05*
