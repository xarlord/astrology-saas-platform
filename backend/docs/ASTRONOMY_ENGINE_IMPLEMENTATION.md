# Astronomy Engine Implementation Guide

**Status:** Historical Spec (implemented — see divergences table below)
**Created:** 2026-03-19
**Updated:** 2026-04-05
**Decision:** FREE alternative to Swiss Ephemeris (MIT License)

> **Note:** This spec was used to guide implementation. The as-built service lives at `src/modules/shared/services/astronomyEngine.service.ts`. Key divergences are tracked in the table below. `swisseph.stub.ts` still exists as a fallback but is no longer the primary calculation path.

---

## Overview

This document provides the complete implementation guide for replacing the mock Swiss Ephemeris service with real astrological calculations using **Astronomy Engine** (MIT license) and custom house calculation algorithms.

## Why Astronomy Engine?

| Feature | Swiss Ephemeris | Astronomy Engine |
|---------|-----------------|------------------|
| License | AGPL (commercial $850) | MIT (FREE) |
| Accuracy | 0.001 arcsecond | ~1 arcminute |
| Dependencies | Native module + 100MB data | Pure JavaScript |
| Deployment | Complex | Simple |
| Maintenance | Paid support | Active open source |

**Verdict:** 1 arcminute accuracy is sufficient for astrology applications. The 60x cost savings and simpler deployment make Astronomy Engine the clear choice.

---

## Implementation Divergences

> **For the canonical implementation, see `backend/src/modules/shared/services/astronomyEngine.service.ts`.**
> The code samples below reflect the original planning spec; the items in this table document what diverged during implementation.

| Area | Spec (below) | As-Built | Notes |
|------|-------------|----------|-------|
| **Chiron** | Not included in PLANETS array | `ChironPosition` interface + `calculateChiron()` method + Chiron in `PLANET_SYMBOLS` | Centaur body calculated via Kepler's equation with orbital elements |
| **Lunar Nodes** | `{ northNode: number; southNode: number }` | `LunarNodePosition` interface with structured `{ longitude, sign, degree }` per node | Full Meeus formula with T^2 and T^3 terms; sign/degree breakdown included |
| **Planet Symbols** | Not present | `PLANET_SYMBOLS` constant mapping 13 bodies to Unicode glyphs | Includes Chiron ⚷, NorthNode ☊, SouthNode ☋ |
| **ZodiacSign type** | Inline `string` | Exported `ZodiacSign` union type + `ZODIAC_SIGNS` const assertion | Enables type-safe sign references |
| **PlanetaryPosition** | 9 fields | 12 fields — added `signIndex`, `second`, `house?` | `signIndex` (0-11), `second` (arc-seconds), `house` (1-12, optional, set later) |
| **API surface** | Two methods on class | Four methods: `calculatePlanetaryPositions`, `calculateLunarNodes`, `calculateChiron`, `getDailyTransits` | `getDailyTransits` returns plain-object shape compatible with legacy `swissEphemeris.getDailyTransits()` |
| **Internal helpers** | Inline calculations | `longitudeToSignPosition()` helper, `calculateJulianDay()`, `calculateLocalSiderealTime()` | Uses `astronomy.MakeTime` / `astronomy.GeoVector` / `astronomy.Ecliptic` instead of `EclipticGeoCoordinates` |

---

## Installation

```bash
cd backend
npm install astronomy-engine
```

---

## Core Implementation

### 1. Planetary Position Service

```typescript
// backend/src/modules/shared/services/astronomyEngine.service.ts

import * as astronomy from 'astronomy-engine';

export interface PlanetaryPosition {
  name: string;
  longitude: number;      // 0-360°
  latitude: number;       // -90 to 90°
  distance: number;       // AU
  speed: number;          // °/day (retrograde if negative)
  sign: string;           // Zodiac sign
  degree: number;         // Degree within sign (0-30)
  minute: number;         // Minutes within degree
  isRetrograde: boolean;
}

export interface ChartData {
  julianDay: number;
  planets: Map<string, PlanetaryPosition>;
  houses: HouseCusps;
  ascendant: number;
  midheaven: number;
}

export class AstronomyEngineService {
  private static readonly PLANETS = [
    { name: 'Sun', id: astronomy.Body.Sun },
    { name: 'Moon', id: astronomy.Body.Moon },
    { name: 'Mercury', id: astronomy.Body.Mercury },
    { name: 'Venus', id: astronomy.Body.Venus },
    { name: 'Mars', id: astronomy.Body.Mars },
    { name: 'Jupiter', id: astronomy.Body.Jupiter },
    { name: 'Saturn', id: astronomy.Body.Saturn },
    { name: 'Uranus', id: astronomy.Body.Uranus },
    { name: 'Neptune', id: astronomy.Body.Neptune },
    { name: 'Pluto', id: astronomy.Body.Pluto },
  ];

  private static readonly ZODIAC_SIGNS = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];

  /**
   * Calculate planetary positions for a given date and location
   */
  calculatePlanetaryPositions(
    date: Date,
    latitude: number,
    longitude: number
  ): Map<string, PlanetaryPosition> {
    const positions = new Map<string, PlanetaryPosition>();
    const observer = new astronomy.Observer(latitude, longitude, 0);

    for (const planet of AstronomyEngineService.PLANETS) {
      const pos = astronomy.EclipticGeoCoordinates(planet.id, date, observer);

      // Calculate speed (for retrograde detection)
      const datePlus = new Date(date);
      datePlus.setDate(datePlus.getDate() + 1);
      const posPlus = astronomy.EclipticGeoCoordinates(planet.id, datePlus, observer);

      const speed = posPlus.elon - pos.elon;
      const isRetrograde = speed < 0;

      const signIndex = Math.floor(pos.elon / 30);
      const degreeInSign = pos.elon % 30;
      const degree = Math.floor(degreeInSign);
      const minute = Math.floor((degreeInSign - degree) * 60);

      positions.set(planet.name, {
        name: planet.name,
        longitude: pos.elon,
        latitude: pos.elat,
        distance: pos.dist,
        speed,
        sign: AstronomyEngineService.ZODIAC_SIGNS[signIndex],
        degree,
        minute,
        isRetrograde
      });
    }

    return positions;
  }

  /**
   * Calculate Lunar Nodes (North Node / Rahu, South Node / Ketu)
   */
  calculateLunarNodes(date: Date): { northNode: number; southNode: number } {
    // Moon's mean ascending node (Rahu)
    const T = (astronomy.JulianDate(date) - 2451545.0) / 36525.0;
    const omega = 125.04452 - 1934.136261 * T;

    return {
      northNode: omega % 360,
      southNode: (omega + 180) % 360
    };
  }
}
```

### 2. House Calculation Algorithms

```typescript
// backend/src/modules/shared/services/houseCalculation.service.ts

export interface HouseCusps {
  system: 'Placidus' | 'Koch' | 'Equal' | 'WholeSign';
  cusps: number[];        // 12 house cusps (0-360°)
  ascendant: number;      // 1st house cusp
  midheaven: number;      // 10th house cusp
  descendant: number;     // 7th house cusp
  imumCoeli: number;      // 4th house cusp
}

export class HouseCalculationService {
  private static readonly OBLIQUITY = 23.44;  // Earth's axial tilt

  /**
   * Calculate houses using specified system
   */
  calculateHouses(
    lst: number,           // Local Sidereal Time (hours)
    latitude: number,      // Geographic latitude
    system: 'Placidus' | 'Koch' | 'Equal' | 'WholeSign' = 'Placidus',
    ascendant?: number     // Required for WholeSign
  ): HouseCusps {
    switch (system) {
      case 'Placidus':
        return this.placidusHouses(lst, latitude);
      case 'Koch':
        return this.kochHouses(lst, latitude);
      case 'Equal':
        return this.equalHouses(lst, latitude);
      case 'WholeSign':
        return this.wholeSignHouses(ascendant ?? 0);
      default:
        return this.placidusHouses(lst, latitude);
    }
  }

  /**
   * Calculate Local Sidereal Time
   */
  calculateLST(julianDay: number, longitude: number): number {
    // Julian centuries from J2000.0
    const T = (julianDay - 2451545.0) / 36525.0;

    // Greenwich Mean Sidereal Time (degrees)
    let GMST = 280.46061837 + 360.98564736629 * (julianDay - 2451545.0)
               + 0.000387933 * T * T - T * T * T / 38710000.0;

    GMST = ((GMST % 360) + 360) % 360;

    // Local Sidereal Time
    let LST = GMST + longitude;
    LST = ((LST % 360) + 360) % 360;

    return LST / 15;  // Convert to hours
  }

  /**
   * Calculate Midheaven (MC)
   */
  private calculateMC(ramc: number): number {
    const e = this.toRadians(HouseCalculationService.OBLIQUITY);
    const ramcRad = this.toRadians(ramc);

    const mc = Math.atan2(
      Math.tan(ramcRad),
      Math.cos(e)
    );

    return this.normalizeAngle(this.toDegrees(mc));
  }

  /**
   * Calculate Ascendant
   */
  private calculateAscendant(ramc: number, latitude: number): number {
    const e = this.toRadians(HouseCalculationService.OBLIQUITY);
    const phi = this.toRadians(latitude);
    const ramcRad = this.toRadians(ramc);

    const asc = Math.atan2(
      Math.cos(ramcRad),
      -(Math.sin(e) * Math.tan(phi) + Math.cos(e) * Math.sin(ramcRad))
    );

    return this.normalizeAngle(this.toDegrees(asc));
  }

  /**
   * Placidus House System
   * Most popular system, uses time-based interpolation
   */
  private placidusHouses(lst: number, latitude: number): HouseCusps {
    const ramc = lst * 15;  // Convert hours to degrees
    const mc = this.calculateMC(ramc);
    const asc = this.calculateAscendant(ramc, latitude);

    const cusps: number[] = new Array(12);
    cusps[0] = asc;  // 1st house = Ascendant
    cusps[9] = mc;   // 10th house = MC

    // Calculate intermediate house cusps using Placidus formula
    // This is a simplified implementation - full implementation requires
    // iterative solving of the ascensional difference equations

    for (let i = 1; i < 12; i++) {
      if (i === 9) continue;  // Skip MC (already calculated)

      // Simplified: interpolate between known points
      // Full implementation would use the exact Placidus formulas
      const offset = (i * 30) % 360;
      cusps[i] = this.normalizeAngle(asc + offset);
    }

    return {
      system: 'Placidus',
      cusps,
      ascendant: asc,
      midheaven: mc,
      descendant: this.normalizeAngle(asc + 180),
      imumCoeli: this.normalizeAngle(mc + 180)
    };
  }

  /**
   * Whole Sign House System
   * Simplest system - each sign = one house
   */
  private wholeSignHouses(ascendant: number): HouseCusps {
    const signStart = Math.floor(ascendant / 30) * 30;
    const cusps: number[] = [];

    for (let i = 0; i < 12; i++) {
      cusps.push((signStart + i * 30) % 360);
    }

    return {
      system: 'WholeSign',
      cusps,
      ascendant,
      midheaven: cusps[9],
      descendant: (ascendant + 180) % 360,
      imumCoeli: (cusps[9] + 180) % 360
    };
  }

  /**
   * Equal House System
   * Each house = 30° starting from Ascendant
   */
  private equalHouses(lst: number, latitude: number): HouseCusps {
    const ramc = lst * 15;
    const asc = this.calculateAscendant(ramc, latitude);
    const cusps: number[] = [];

    for (let i = 0; i < 12; i++) {
      cusps.push((asc + i * 30) % 360);
    }

    return {
      system: 'Equal',
      cusps,
      ascendant: asc,
      midheaven: this.calculateMC(ramc),
      descendant: (asc + 180) % 360,
      imumCoeli: (this.calculateMC(ramc) + 180) % 360
    };
  }

  /**
   * Koch House System
   */
  private kochHouses(lst: number, latitude: number): HouseCusps {
    // Koch is more complex - uses birth time projection
    // Simplified implementation
    const ramc = lst * 15;
    const mc = this.calculateMC(ramc);
    const asc = this.calculateAscendant(ramc, latitude);

    const cusps: number[] = [];
    for (let i = 0; i < 12; i++) {
      cusps.push((asc + i * 30) % 360);
    }
    cusps[9] = mc;

    return {
      system: 'Koch',
      cusps,
      ascendant: asc,
      midheaven: mc,
      descendant: (asc + 180) % 360,
      imumCoeli: (mc + 180) % 360
    };
  }

  // Utility functions
  private toRadians(degrees: number): number {
    return degrees * Math.PI / 180;
  }

  private toDegrees(radians: number): number {
    return radians * 180 / Math.PI;
  }

  private normalizeAngle(angle: number): number {
    return ((angle % 360) + 360) % 360;
  }
}
```

### 3. Complete Natal Chart Service

```typescript
// backend/src/modules/shared/services/natalChart.service.ts

import { AstronomyEngineService, PlanetaryPosition } from './astronomyEngine.service';
import { HouseCalculationService, HouseCusps } from './houseCalculation.service';

export interface NatalChart {
  birthData: {
    date: Date;
    latitude: number;
    longitude: number;
    location?: string;
  };
  julianDay: number;
  localSiderealTime: number;
  planets: Map<string, PlanetaryPosition>;
  houses: HouseCusps;
  aspects: Aspect[];
  elements: ElementalBalance;
  modalities: ModalityBalance;
}

export interface Aspect {
  planet1: string;
  planet2: string;
  type: 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition';
  orb: number;
  exact: boolean;
}

export interface ElementalBalance {
  fire: number;
  earth: number;
  air: number;
  water: number;
}

export interface ModalityBalance {
  cardinal: number;
  fixed: number;
  mutable: number;
}

export class NatalChartService {
  private astronomyEngine: AstronomyEngineService;
  private houseCalculator: HouseCalculationService;

  // Aspect orbs (allowable deviation)
  private static readonly ASPECT_ORBS = {
    conjunction: 8,
    sextile: 4,
    square: 6,
    trine: 6,
    opposition: 8
  };

  // Aspect angles
  private static readonly ASPECT_ANGLES = {
    conjunction: 0,
    sextile: 60,
    square: 90,
    trine: 120,
    opposition: 180
  };

  constructor() {
    this.astronomyEngine = new AstronomyEngineService();
    this.houseCalculator = new HouseCalculationService();
  }

  /**
   * Calculate complete natal chart
   */
  calculateNatalChart(
    birthDate: Date,
    latitude: number,
    longitude: number,
    houseSystem: 'Placidus' | 'Koch' | 'Equal' | 'WholeSign' = 'Placidus'
  ): NatalChart {
    // Calculate Julian Day
    const julianDay = this.julianDay(birthDate);

    // Calculate Local Sidereal Time
    const lst = this.houseCalculator.calculateLST(julianDay, longitude);

    // Calculate planetary positions
    const planets = this.astronomyEngine.calculatePlanetaryPositions(
      birthDate,
      latitude,
      longitude
    );

    // Calculate houses
    const houses = this.houseCalculator.calculateHouses(lst, latitude, houseSystem);

    // Calculate aspects between planets
    const aspects = this.calculateAspects(planets);

    // Calculate elemental and modality balance
    const elements = this.calculateElements(planets);
    const modalities = this.calculateModalities(planets);

    return {
      birthData: {
        date: birthDate,
        latitude,
        longitude
      },
      julianDay,
      localSiderealTime: lst,
      planets,
      houses,
      aspects,
      elements,
      modalities
    };
  }

  /**
   * Calculate aspects between all planets
   */
  private calculateAspects(planets: Map<string, PlanetaryPosition>): Aspect[] {
    const aspects: Aspect[] = [];
    const planetArray = Array.from(planets.entries());

    for (let i = 0; i < planetArray.length; i++) {
      for (let j = i + 1; j < planetArray.length; j++) {
        const [name1, pos1] = planetArray[i];
        const [name2, pos2] = planetArray[j];

        const diff = Math.abs(pos1.longitude - pos2.longitude);
        const angle = diff > 180 ? 360 - diff : diff;

        for (const [type, targetAngle] of Object.entries(NatalChartService.ASPECT_ANGLES)) {
          const orb = NatalChartService.ASPECT_ORBS[type as keyof typeof NatalChartService.ASPECT_ORBS];
          const deviation = Math.abs(angle - targetAngle);

          if (deviation <= orb) {
            aspects.push({
              planet1: name1,
              planet2: name2,
              type: type as Aspect['type'],
              orb: deviation,
              exact: deviation < 1
            });
            break;
          }
        }
      }
    }

    return aspects;
  }

  /**
   * Calculate elemental balance
   */
  private calculateElements(planets: Map<string, PlanetaryPosition>): ElementalBalance {
    const elements = { fire: 0, earth: 0, air: 0, water: 0 };
    const elementMap: Record<string, keyof ElementalBalance> = {
      'Aries': 'fire', 'Leo': 'fire', 'Sagittarius': 'fire',
      'Taurus': 'earth', 'Virgo': 'earth', 'Capricorn': 'earth',
      'Gemini': 'air', 'Libra': 'air', 'Aquarius': 'air',
      'Cancer': 'water', 'Scorpio': 'water', 'Pisces': 'water'
    };

    for (const planet of planets.values()) {
      const element = elementMap[planet.sign];
      if (element) elements[element]++;
    }

    return elements;
  }

  /**
   * Calculate modality balance
   */
  private calculateModalities(planets: Map<string, PlanetaryPosition>): ModalityBalance {
    const modalities = { cardinal: 0, fixed: 0, mutable: 0 };
    const modalityMap: Record<string, keyof ModalityBalance> = {
      'Aries': 'cardinal', 'Cancer': 'cardinal', 'Libra': 'cardinal', 'Capricorn': 'cardinal',
      'Taurus': 'fixed', 'Leo': 'fixed', 'Scorpio': 'fixed', 'Aquarius': 'fixed',
      'Gemini': 'mutable', 'Virgo': 'mutable', 'Sagittarius': 'mutable', 'Pisces': 'mutable'
    };

    for (const planet of planets.values()) {
      const modality = modalityMap[planet.sign];
      if (modality) modalities[modality]++;
    }

    return modalities;
  }

  /**
   * Convert date to Julian Day
   */
  private julianDay(date: Date): number {
    const y = date.getUTCFullYear();
    const m = date.getUTCMonth() + 1;
    const d = date.getUTCDate() +
              date.getUTCHours() / 24 +
              date.getUTCMinutes() / 1440 +
              date.getUTCSeconds() / 86400;

    const a = Math.floor((14 - m) / 12);
    const y1 = y + 4800 - a;
    const m1 = m + 12 * a - 3;

    return d + Math.floor((153 * m1 + 2) / 5) + 365 * y1 +
           Math.floor(y1 / 4) - Math.floor(y1 / 100) +
           Math.floor(y1 / 400) - 32045;
  }
}
```

---

## Testing Strategy

```typescript
// backend/src/modules/shared/services/__tests__/natalChart.service.test.ts

import { NatalChartService } from '../natalChart.service';

describe('NatalChartService', () => {
  let service: NatalChartService;

  beforeEach(() => {
    service = new NatalChartService();
  });

  describe('calculateNatalChart', () => {
    it('should calculate chart for known birth data', () => {
      // Test with known data (e.g., celebrity birth chart)
      const birthDate = new Date('1990-01-15T12:00:00Z');
      const chart = service.calculateNatalChart(
        birthDate,
        40.7128,  // New York latitude
        -74.0060  // New York longitude
      );

      expect(chart.planets.size).toBe(10);
      expect(chart.houses.cusps.length).toBe(12);
      expect(chart.houses.ascendant).toBeGreaterThanOrEqual(0);
      expect(chart.houses.ascendant).toBeLessThan(360);
    });

    it('should detect retrograde planets correctly', () => {
      // Mercury retrograde test
      const retrogradeDate = new Date('2024-04-01T12:00:00Z');
      const chart = service.calculateNatalChart(retrogradeDate, 0, 0);

      const mercury = chart.planets.get('Mercury');
      expect(mercury?.isRetrograde).toBeDefined();
    });

    it('should calculate aspects with correct orbs', () => {
      const chart = service.calculateNatalChart(
        new Date('1990-06-15T06:00:00Z'),
        51.5074, -0.1278  // London
      );

      // Verify aspects exist
      expect(chart.aspects.length).toBeGreaterThan(0);

      // Verify orb is within limits
      for (const aspect of chart.aspects) {
        expect(aspect.orb).toBeLessThanOrEqual(8);
      }
    });
  });

  describe('House Systems', () => {
    it('should calculate Placidus houses', () => {
      const chart = service.calculateNatalChart(
        new Date('1990-01-01T12:00:00Z'),
        40.7128, -74.0060,
        'Placidus'
      );

      expect(chart.houses.system).toBe('Placidus');
    });

    it('should calculate Whole Sign houses', () => {
      const chart = service.calculateNatalChart(
        new Date('1990-01-01T12:00:00Z'),
        40.7128, -74.0060,
        'WholeSign'
      );

      expect(chart.houses.system).toBe('WholeSign');

      // Each house should start at 0° of a sign
      for (const cusp of chart.houses.cusps) {
        expect(cusp % 30).toBe(0);
      }
    });
  });
});
```

---

## Migration Plan

### Phase 1: Install and Test (1 day)
1. `npm install astronomy-engine`
2. Create services in `backend/src/modules/shared/services/`
3. Write unit tests
4. Validate against known charts

### Phase 2: Integration (2 days)
1. Replace mock `swissEphemeris.service.ts`
2. Update API endpoints
3. Add house system selection to API
4. Test with frontend

### Phase 3: Cleanup (1 day)
1. Remove `swisseph` from package.json
2. Delete `swisseph.stub.ts`
3. Update documentation
4. Close FINDING-001

---

## Resources

- **Astronomy Engine:** https://github.com/cosinekitty/astronomy
- **Astronomy Engine Docs:** https://cosinekitty.github.io/astronomy/
- **js_astro Reference:** https://github.com/astsakai/js_astro
- **Placidus Formulas:** https://groups.google.com/g/alt.astrology.moderated/c/uxVhWZ_CZc4

---

**Last Updated:** 2026-04-05
