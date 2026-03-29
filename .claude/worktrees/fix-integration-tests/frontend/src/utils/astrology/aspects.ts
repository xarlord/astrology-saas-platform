/**
 * Aspect Calculator
 * Calculate aspects between planets, orb calculations, applying/separating determination
 */

import {
  AspectType,
  AspectData,
  AspectDefinition,
  AspectPattern,
  PlanetData,
  ASPECT_DEFINITIONS,
  DEFAULT_ORBS,
  OrbConfig,
  MAJOR_ASPECTS,
} from './types';
import { normalizeAngle } from './planetPosition';

/**
 * Calculate the angular difference between two longitudes
 */
export function angularDifference(long1: number, long2: number): number {
  let diff = Math.abs(normalizeAngle(long1) - normalizeAngle(long2));
  if (diff > 180) {
    diff = 360 - diff;
  }
  return diff;
}

/**
 * Determine if an aspect exists between two angles
 */
export function findAspect(
  long1: number,
  long2: number,
  orbs: OrbConfig = DEFAULT_ORBS
): { type: AspectType; orb: number; exact: boolean } | null {
  const diff = angularDifference(long1, long2);

  for (const [type, definition] of Object.entries(ASPECT_DEFINITIONS)) {
    const aspectType = type as AspectType;
    const maxOrb = orbs[aspectType];
    const angleDiff = Math.abs(diff - definition.angle);

    if (angleDiff <= maxOrb) {
      return {
        type: aspectType,
        orb: Number(angleDiff.toFixed(4)),
        exact: angleDiff < 0.5,
      };
    }
  }

  return null;
}

/**
 * Determine if aspect is applying or separating
 * An aspect is applying if the planets are moving towards exact aspect
 */
export function isAspectApplying(
  long1: number,
  speed1: number,
  long2: number,
  speed2: number,
  aspectAngle: number
): boolean {
  // Calculate the angle from planet1 to planet2
  let angle = normalizeAngle(long2) - normalizeAngle(long1);
  if (angle > 180) angle -= 360;
  if (angle < -180) angle += 360;

  // Relative speed
  const relativeSpeed = speed1 - speed2;

  // For conjunction (0 degrees)
  if (aspectAngle === 0) {
    // If planet1 is faster and behind planet2, it's applying
    // If planet1 is faster and ahead of planet2, it's separating
    if (relativeSpeed > 0) {
      return angle > 0; // Applying if planet2 is ahead
    } else {
      return angle < 0; // Applying if planet2 is behind
    }
  }

  // For opposition (180 degrees)
  if (aspectAngle === 180) {
    const absAngle = Math.abs(angle);
    if (relativeSpeed > 0) {
      return (absAngle > 180 - aspectAngle) !== (angle > 0);
    } else {
      return (absAngle < 180 - aspectAngle) !== (angle > 0);
    }
  }

  // General case for other aspects
  // Calculate current separation from exact aspect
  const currentSeparation = Math.abs(Math.abs(angle) - aspectAngle);

  // Estimate future separation
  const futureLong1 = normalizeAngle(long1 + relativeSpeed);
  const futureAngle = normalizeAngle(long2) - futureLong1;
  const futureSeparation = Math.abs(Math.abs(futureAngle > 180 ? 360 - futureAngle : futureAngle) - aspectAngle);

  return futureSeparation < currentSeparation;
}

/**
 * Calculate all aspects between two sets of planets
 */
export function calculateAspects(
  planets1: PlanetData[],
  planets2: PlanetData[],
  orbs: OrbConfig = DEFAULT_ORBS,
  includeMinor = false
): AspectData[] {
  const aspects: AspectData[] = [];

  for (const planet1 of planets1) {
    for (const planet2 of planets2) {
      // Skip if same planet
      if (planet1.name === planet2.name && planets1 === planets2) {
        continue;
      }

      const aspectResult = findAspect(planet1.longitude, planet2.longitude, orbs);

      if (aspectResult) {
        const definition = ASPECT_DEFINITIONS[aspectResult.type];

        // Skip minor aspects if not included
        if (!includeMinor && !definition.major) {
          continue;
        }

        const applying = isAspectApplying(
          planet1.longitude,
          planet1.speed,
          planet2.longitude,
          planet2.speed,
          definition.angle
        );

        aspects.push({
          planet1: planet1.name,
          planet2: planet2.name,
          type: aspectResult.type,
          angle: definition.angle,
          orb: aspectResult.orb,
          applying,
          exact: aspectResult.exact,
        });
      }
    }
  }

  // Sort by orb (tightest first)
  return aspects.sort((a, b) => a.orb - b.orb);
}

/**
 * Calculate aspects within a single chart
 */
export function calculateNatalAspects(
  planets: PlanetData[],
  orbs: OrbConfig = DEFAULT_ORBS,
  includeMinor = false
): AspectData[] {
  const aspects: AspectData[] = [];

  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const planet1 = planets[i];
      const planet2 = planets[j];

      const aspectResult = findAspect(planet1.longitude, planet2.longitude, orbs);

      if (aspectResult) {
        const definition = ASPECT_DEFINITIONS[aspectResult.type];

        // Skip minor aspects if not included
        if (!includeMinor && !definition.major) {
          continue;
        }

        const applying = isAspectApplying(
          planet1.longitude,
          planet1.speed,
          planet2.longitude,
          planet2.speed,
          definition.angle
        );

        aspects.push({
          planet1: planet1.name,
          planet2: planet2.name,
          type: aspectResult.type,
          angle: definition.angle,
          orb: aspectResult.orb,
          applying,
          exact: aspectResult.exact,
        });
      }
    }
  }

  // Sort by orb (tightest first)
  return aspects.sort((a, b) => a.orb - b.orb);
}

/**
 * Get aspect definition
 */
export function getAspectDefinition(type: AspectType): AspectDefinition {
  return ASPECT_DEFINITIONS[type];
}

/**
 * Get all major aspects
 */
export function getMajorAspects(): AspectType[] {
  return [...MAJOR_ASPECTS];
}

/**
 * Detect aspect patterns (Grand Trine, T-Square, etc.)
 */
export function detectAspectPatterns(
  planets: PlanetData[],
  aspects: AspectData[],
  maxOrb = 8
): AspectPattern[] {
  const patterns: AspectPattern[] = [];

  // Detect Stellium (3+ planets in same sign)
  const stelliums = detectStelliums(planets);
  patterns.push(...stelliums);

  // Detect Grand Trine
  const grandTrines = detectGrandTrine(planets, aspects, maxOrb);
  patterns.push(...grandTrines);

  // Detect T-Square
  const tSquares = detectTSquare(planets, aspects, maxOrb);
  patterns.push(...tSquares);

  // Detect Grand Cross
  const grandCrosses = detectGrandCross(planets, aspects, maxOrb);
  patterns.push(...grandCrosses);

  // Detect Yod
  const yods = detectYod(planets, aspects, maxOrb);
  patterns.push(...yods);

  // Detect Kite
  const kites = detectKite(planets, aspects, maxOrb);
  patterns.push(...kites);

  // Detect Mystic Rectangle
  const mysticRectangles = detectMysticRectangle(planets, aspects, maxOrb);
  patterns.push(...mysticRectangles);

  return patterns;
}

/**
 * Detect Stelliums (3+ planets in same sign or house)
 */
function detectStelliums(planets: PlanetData[]): AspectPattern[] {
  const patterns: AspectPattern[] = [];

  // Group by sign
  const signGroups: Record<string, string[]> = {};
  for (const planet of planets) {
    if (!signGroups[planet.sign]) {
      signGroups[planet.sign] = [];
    }
    signGroups[planet.sign].push(planet.name);
  }

  // Find stelliums (3+ planets)
  for (const [sign, planetNames] of Object.entries(signGroups)) {
    if (planetNames.length >= 3) {
      patterns.push({
        type: 'stellium',
        planets: planetNames,
        aspects: [],
        description: `${planetNames.length}-planet stellium in ${sign}`,
      });
    }
  }

  return patterns;
}

/**
 * Detect Grand Trine (3 planets in trine to each other)
 */
function detectGrandTrine(
  planetList: PlanetData[],
  aspects: AspectData[],
  maxOrb: number
): AspectPattern[] {
  const patterns: AspectPattern[] = [];
  const trineAspects = aspects.filter(
    a => a.type === 'trine' && a.orb <= maxOrb
  );

  // Look for 3 planets all trining each other
  for (let i = 0; i < trineAspects.length; i++) {
    for (let j = i + 1; j < trineAspects.length; j++) {
      for (let k = j + 1; k < trineAspects.length; k++) {
        const a1 = trineAspects[i];
        const a2 = trineAspects[j];
        const a3 = trineAspects[k];

        const uniquePlanets = new Set([a1.planet1, a1.planet2, a2.planet1, a2.planet2, a3.planet1, a3.planet2]);

        if (uniquePlanets.size === 3) {
          const planetArray = Array.from(uniquePlanets);
          const elements = planetArray.map(p => {
            const planet = planetList.find(pl => pl.name === p);
            return planet ? getSignElement(planet.sign) : null;
          });

          // Check if all same element
          if (elements.every(e => e === elements[0])) {
            patterns.push({
              type: 'grand-trine',
              planets: planetArray,
              aspects: [a1, a2, a3],
              description: `Grand Trine in ${elements[0]} signs`,
            });
          }
        }
      }
    }
  }

  return patterns;
}

/**
 * Detect T-Square (2 planets in opposition, both squaring a third)
 */
function detectTSquare(
  planets: PlanetData[],
  aspects: AspectData[],
  maxOrb: number
): AspectPattern[] {
  const patterns: AspectPattern[] = [];
  const oppositions = aspects.filter(
    a => a.type === 'opposition' && a.orb <= maxOrb
  );
  const squares = aspects.filter(
    a => a.type === 'square' && a.orb <= maxOrb
  );

  for (const opp of oppositions) {
    const apexCandidates = squares.filter(
      sq =>
        (sq.planet1 === opp.planet1 || sq.planet2 === opp.planet1) ||
        (sq.planet1 === opp.planet2 || sq.planet2 === opp.planet2)
    );

    for (const sq1 of apexCandidates) {
      const apex = sq1.planet1 === opp.planet1 || sq1.planet1 === opp.planet2
        ? sq1.planet2
        : sq1.planet1;

      // Find the second square from apex to the other opposition planet
      const sq2 = squares.find(
        s =>
          ((s.planet1 === apex && s.planet2 === opp.planet1) ||
            (s.planet1 === apex && s.planet2 === opp.planet2)) &&
          s !== sq1
      );

      // Using || here is intentional: sq2 is either undefined or a truthy object
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      if (sq2 || (sq1.planet1 === apex &&
        ((sq1.planet2 === opp.planet1) || (sq1.planet2 === opp.planet2)))) {
        const allPlanets = [opp.planet1, opp.planet2, apex];

        // Check we haven't already found this pattern
        const exists = patterns.some(
          p => p.planets.sort().join() === allPlanets.sort().join()
        );

        if (!exists) {
          patterns.push({
            type: 't-square',
            planets: allPlanets,
            aspects: [opp, sq1],
            description: `T-Square with apex at ${apex}`,
          });
        }
      }
    }
  }

  return patterns;
}

/**
 * Detect Grand Cross (2 oppositions at right angles)
 */
function detectGrandCross(
  planets: PlanetData[],
  aspects: AspectData[],
  maxOrb: number
): AspectPattern[] {
  const patterns: AspectPattern[] = [];
  const oppositions = aspects.filter(
    a => a.type === 'opposition' && a.orb <= maxOrb
  );
  const squares = aspects.filter(
    a => a.type === 'square' && a.orb <= maxOrb
  );

  // Find two oppositions that form a cross
  for (let i = 0; i < oppositions.length; i++) {
    for (let j = i + 1; j < oppositions.length; j++) {
      const opp1 = oppositions[i];
      const opp2 = oppositions[j];

      const planets = new Set([
        opp1.planet1, opp1.planet2,
        opp2.planet1, opp2.planet2
      ]);

      if (planets.size === 4) {
        // Check for squares connecting the opposition pairs
        const planetArray = Array.from(planets);
        let squareCount = 0;
        const foundSquares: AspectData[] = [];

        for (const sq of squares) {
          if (planets.has(sq.planet1) && planets.has(sq.planet2)) {
            squareCount++;
            foundSquares.push(sq);
          }
        }

        // Need at least 4 squares for a grand cross
        if (squareCount >= 4) {
          patterns.push({
            type: 'grand-cross',
            planets: planetArray,
            aspects: [opp1, opp2, ...foundSquares.slice(0, 4)],
            description: `Grand Cross`,
          });
        }
      }
    }
  }

  return patterns;
}

/**
 * Detect Yod (2 planets sextile, both quincunx a third)
 */
function detectYod(
  planets: PlanetData[],
  aspects: AspectData[],
  maxOrb: number
): AspectPattern[] {
  const patterns: AspectPattern[] = [];
  const sextiles = aspects.filter(
    a => a.type === 'sextile' && a.orb <= maxOrb
  );
  const quincunxes = aspects.filter(
    a => a.type === 'quincunx' && a.orb <= maxOrb
  );

  for (const sextile of sextiles) {
    const apex1Quincunxes = quincunxes.filter(
      q => (q.planet1 === sextile.planet1 || q.planet2 === sextile.planet1)
    );
    const apex2Quincunxes = quincunxes.filter(
      q => (q.planet1 === sextile.planet2 || q.planet2 === sextile.planet2)
    );

    // Find common apex
    for (const q1 of apex1Quincunxes) {
      const apex1 = q1.planet1 === sextile.planet1 ? q1.planet2 : q1.planet1;

      for (const q2 of apex2Quincunxes) {
        const apex2 = q2.planet1 === sextile.planet2 ? q2.planet2 : q2.planet1;

        if (apex1 === apex2) {
          patterns.push({
            type: 'yod',
            planets: [sextile.planet1, sextile.planet2, apex1],
            aspects: [sextile, q1, q2],
            description: `Yod with apex at ${apex1}`,
          });
        }
      }
    }
  }

  return patterns;
}

/**
 * Detect Kite (Grand Trine with opposition)
 */
function detectKite(
  planets: PlanetData[],
  aspects: AspectData[],
  maxOrb: number
): AspectPattern[] {
  const patterns: AspectPattern[] = [];
  const grandTrines = detectGrandTrine(planets, aspects, maxOrb);
  const oppositions = aspects.filter(
    a => a.type === 'opposition' && a.orb <= maxOrb
  );

  for (const gt of grandTrines) {
    for (const opp of oppositions) {
      // Check if opposition connects to one planet in grand trine
      const gtPlanet = gt.planets.find(
        p => p === opp.planet1 || p === opp.planet2
      );

      if (gtPlanet) {
        const fourthPlanet = opp.planet1 === gtPlanet ? opp.planet2 : opp.planet1;

        if (!gt.planets.includes(fourthPlanet)) {
          patterns.push({
            type: 'kite',
            planets: [...gt.planets, fourthPlanet],
            aspects: [...gt.aspects, opp],
            description: `Kite pattern with focus at ${fourthPlanet}`,
          });
        }
      }
    }
  }

  return patterns;
}

/**
 * Detect Mystic Rectangle (2 oppositions with sextile/trine connections)
 */
function detectMysticRectangle(
  planets: PlanetData[],
  aspects: AspectData[],
  maxOrb: number
): AspectPattern[] {
  const patterns: AspectPattern[] = [];
  const oppositions = aspects.filter(
    a => a.type === 'opposition' && a.orb <= maxOrb
  );
  const trines = aspects.filter(a => a.type === 'trine' && a.orb <= maxOrb);
  const sextiles = aspects.filter(a => a.type === 'sextile' && a.orb <= maxOrb);

  // Look for two oppositions connected by trines and sextiles
  for (let i = 0; i < oppositions.length; i++) {
    for (let j = i + 1; j < oppositions.length; j++) {
      const opp1 = oppositions[i];
      const opp2 = oppositions[j];

      const planets = new Set([
        opp1.planet1, opp1.planet2,
        opp2.planet1, opp2.planet2
      ]);

      if (planets.size === 4) {
        const planetArray = Array.from(planets);

        // Count trine and sextile connections
        let trineCount = 0;
        let sextileCount = 0;

        for (const trine of trines) {
          if (planets.has(trine.planet1) && planets.has(trine.planet2)) {
            trineCount++;
          }
        }

        for (const sextile of sextiles) {
          if (planets.has(sextile.planet1) && planets.has(sextile.planet2)) {
            sextileCount++;
          }
        }

        // Mystic Rectangle has 2 trines and 2 sextiles
        if (trineCount >= 2 && sextileCount >= 2) {
          patterns.push({
            type: 'mystic-rectangle',
            planets: planetArray,
            aspects: [opp1, opp2],
            description: `Mystic Rectangle`,
          });
        }
      }
    }
  }

  return patterns;
}

/**
 * Helper to get element from sign
 */
function getSignElement(sign: string): 'fire' | 'earth' | 'air' | 'water' {
  const elements: Record<'fire' | 'earth' | 'air' | 'water', string[]> = {
    fire: ['Aries', 'Leo', 'Sagittarius'],
    earth: ['Taurus', 'Virgo', 'Capricorn'],
    air: ['Gemini', 'Libra', 'Aquarius'],
    water: ['Cancer', 'Scorpio', 'Pisces'],
  };

  for (const [element, signs] of Object.entries(elements)) {
    if (signs.includes(sign)) {
      return element as 'fire' | 'earth' | 'air' | 'water';
    }
  }
  return 'fire'; // Default
}

export default {
  angularDifference,
  findAspect,
  isAspectApplying,
  calculateAspects,
  calculateNatalAspects,
  getAspectDefinition,
  getMajorAspects,
  detectAspectPatterns,
};
