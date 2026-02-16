/**
 * Interpretation Service
 *
 * Generates astrological interpretations using the interpretations database
 * and applies them to calculated chart data.
 */

import {
  getPlanetInSignInterpretation,
  getAspectInterpretation,
  getHouseInterpretation,
  getTransitInterpretation,
  generatePersonalityAnalysis,
} from '../../data/interpretations';
import { PlanetPosition, HouseCusp, Aspect } from '../types/chart';

// ============================================================================
// PERSONALITY ANALYSIS
// ============================================================================

export interface PersonalityAnalysisRequest {
  planets: PlanetPosition[];
  houses: HouseCusp[];
  aspects: Aspect[];
}

export interface PersonalityAnalysisResponse {
  overview: {
    sunSign: any;
    moonSign: any;
    ascendantSign?: any;
  };
  planetsInSigns: Array<{
    planet: string;
    sign: string;
    house: number;
    interpretation: any;
  }>;
  houses: Array<{
    house: number;
    signOnCusp: string;
    planetsInHouse: string[];
    themes: string[];
    interpretation: string;
    advice: string[];
  }>;
  aspects: Array<{
    planet1: string;
    planet2: string;
    aspect: string;
    orb: number;
    harmonious: boolean | null;
    keywords: string[];
    interpretation: string;
    expression: string;
    advice: string[];
  }>;
  patterns: AspectPattern[];
}

export interface AspectPattern {
  type: string;
  description: string;
  planets: string[];
  intensity: number;
}

/**
 * Generate complete personality analysis from chart data
 */
export function generateCompletePersonalityAnalysis(
  chartData: PersonalityAnalysisRequest
): PersonalityAnalysisResponse {
  const { planets, houses, aspects } = chartData;

  // Get Sun and Moon signs
  const sunPlanet = planets.find((p) => p.planet === 'sun');
  const moonPlanet = planets.find((p) => p.planet === 'moon');
  const ascendantSign = houses[0]?.sign; // First house cusp

  const sunSign = sunPlanet
    ? getPlanetInSignInterpretation('sun', sunPlanet.sign)
    : null;
  const moonSign = moonPlanet
    ? getPlanetInSignInterpretation('moon', moonPlanet.sign)
    : null;

  // Generate planets in signs analysis
  const planetsInSigns = planets.map((planet) => ({
    planet: planet.planet,
    sign: planet.sign,
    house: planet.house,
    interpretation: getPlanetInSignInterpretation(planet.planet, planet.sign),
  }));

  // Generate houses analysis
  const housesAnalysis = houses.map((house) => {
    const planetsInHouse = planets
      .filter((p) => p.house === house.house)
      .map((p) => p.planet);

    const houseInterpretation = getHouseInterpretation(house.house);

    return {
      house: house.house,
      signOnCusp: house.sign,
      planetsInHouse,
      themes: houseInterpretation?.themes || [],
      interpretation: houseInterpretation?.description || '',
      advice: houseInterpretation?.advice || [],
    };
  });

  // Generate aspects analysis
  const aspectsAnalysis = aspects.map((aspect) => {
    const aspectInterp = getAspectInterpretation(aspect.type);

    return {
      planet1: aspect.planet1,
      planet2: aspect.planet2,
      aspect: aspect.type,
      orb: aspect.orb,
      harmonious: aspectInterp?.harmonious ?? null,
      keywords: aspectInterp?.keywords || [],
      interpretation: aspectInterp?.general || '',
      expression: aspectInterp?.expression || '',
      advice: aspectInterp?.advice || [],
    };
  });

  // Detect aspect patterns
  const patterns = detectAspectPatterns(aspects, planets);

  return {
    overview: {
      sunSign,
      moonSign,
      ascendantSign: ascendantSign
        ? {
            planet: 'ascendant',
            sign: ascendantSign.toLowerCase(),
            keywords: ['outer personality', 'first impressions', 'approach to life'],
            general: `The Ascendant in ${ascendantSign} colors your entire approach to life. It represents your outer personality and the mask you present to the world.`,
            strengths: [],
            challenges: [],
            advice: [],
          }
        : undefined,
    },
    planetsInSigns,
    houses: housesAnalysis,
    aspects: aspectsAnalysis,
    patterns,
  };
}

/**
 * Detect aspect patterns (Grand Trine, T-Square, Grand Cross, Yod, etc.)
 */
function detectAspectPatterns(
  aspects: Aspect[],
  planets: PlanetPosition[]
): AspectPattern[] {
  const patterns: AspectPattern[] = [];

  // Group aspects by type
  const trines = aspects.filter((a) => a.type === 'trine');
  const squares = aspects.filter((a) => a.type === 'square');
  const oppositions = aspects.filter((a) => a.type === 'opposition');
  const sextiles = aspects.filter((a) => a.type === 'sextile');
  const quincunxes = aspects.filter((a) => a.type === 'quincunx');

  // Detect Grand Trine (3 planets in trine to each other)
  const grandTrines = findPolygonPatterns(trines, planets, 3);
  grandTrines.forEach((trinePlanets) => {
    patterns.push({
      type: 'Grand Trine',
      description: `A harmonious flow of energy between ${trinePlanets.join(', ')}. This creates natural talent and ease in these areas of life.`,
      planets: trinePlanets,
      intensity: 7,
    });
  });

  // Detect T-Square (2 planets in opposition, both squaring a third)
  const tSquares = findTSquares(oppositions, squares, planets);
  tSquares.forEach((squarePlanets) => {
    patterns.push({
      type: 'T-Square',
      description: `Dynamic tension between ${squarePlanets.join(', ')}. This creates a powerful drive for achievement and growth through overcoming obstacles.`,
      planets: squarePlanets,
      intensity: 9,
    });
  });

  // Detect Grand Cross (2 oppositions squaring each other)
  const grandCrosses = findGrandCross(oppositions, squares, planets);
  grandCrosses.forEach((crossPlanets) => {
    patterns.push({
      type: 'Grand Cross',
      description: `Four planets in cross formation: ${crossPlanets.join(', ')}. This creates intense life challenges and enormous potential for mastery and achievement.`,
      planets: crossPlanets,
      intensity: 10,
    });
  });

  // Detect Yod (Finger of God) (2 planets sextile, both quincunx a third)
  const yods = findYods(sextiles, quincunxes, planets);
  yods.forEach((yodPlanets) => {
    patterns.push({
      type: 'Yod',
      description: `A fateful configuration involving ${yodPlanets.join(', ')}. This indicates a special destiny or karmic mission that requires adjustment and spiritual growth.`,
      planets: yodPlanets,
      intensity: 8,
    });
  });

  // Detect Kite (Grand Trine + one planet sextile to two trine planets)
  const kites = findKites(trines, sextiles, planets);
  kites.forEach((kitePlanets) => {
    patterns.push({
      type: 'Kite',
      description: `A beneficial configuration involving ${kitePlanets.join(', ')}. This enhances the Grand Trine's potential and provides an outlet for expression.`,
      planets: kitePlanets,
      intensity: 8,
    });
  });

  return patterns;
}

/**
 * Find polygon patterns (e.g., Grand Trine)
 */
function findPolygonPatterns(
  aspects: Aspect[],
  planets: PlanetPosition[],
  sides: number
): string[][] {
  const patterns: string[][] = [];

  // Build adjacency list
  const adj: Record<string, string[]> = {};
  aspects.forEach((aspect) => {
    if (!adj[aspect.planet1]) adj[aspect.planet1] = [];
    if (!adj[aspect.planet2]) adj[aspect.planet2] = [];
    adj[aspect.planet1].push(aspect.planet2);
    adj[aspect.planet2].push(aspect.planet1);
  });

  // Find cycles of length 'sides'
  const visited = new Set<string>();

  const findCycle = (
    start: string,
    current: string,
    path: string[],
    depth: number
  ): void => {
    if (depth === sides) {
      if (current === start && path.length === sides) {
        patterns.push([...path]);
      }
      return;
    }

    if (depth > 0 && current === start) return;

    visited.add(current);
    const neighbors = adj[current] || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor) || (depth === sides - 1 && neighbor === start)) {
        path.push(neighbor);
        findCycle(start, neighbor, path, depth + 1);
        path.pop();
      }
    }
    visited.delete(current);
  };

  planets.forEach((planet) => {
    if (!visited.has(planet.planet)) {
      findCycle(planet.planet, planet.planet, [], 0);
    }
  });

  return patterns;
}

/**
 * Find T-Square patterns
 */
function findTSquares(
  oppositions: Aspect[],
  squares: Aspect[],
  planets: PlanetPosition[]
): string[][] {
  const patterns: string[][] = [];

  oppositions.forEach((opp) => {
    // Find a planet that squares both planets in the opposition
    const squaringPlanet1 = squares.filter(
      (s) => s.planet1 === opp.planet1 || s.planet2 === opp.planet1
    );
    const squaringPlanet2 = squares.filter(
      (s) => s.planet1 === opp.planet2 || s.planet2 === opp.planet2
    );

    // Find common squaring planet
    squaringPlanet1.forEach((sq1) => {
      const focalPlanet =
        sq1.planet1 === opp.planet1 ? sq1.planet2 : sq1.planet1;

      squaringPlanet2.forEach((sq2) => {
        if (
          (sq2.planet1 === opp.planet2 && sq2.planet2 === focalPlanet) ||
          (sq2.planet2 === opp.planet2 && sq2.planet1 === focalPlanet)
        ) {
          patterns.push([opp.planet1, opp.planet2, focalPlanet]);
        }
      });
    });
  });

  return patterns;
}

/**
 * Find Grand Cross patterns
 */
function findGrandCross(
  oppositions: Aspect[],
  squares: Aspect[],
  planets: PlanetPosition[]
): string[][] {
  const patterns: string[][] = [];

  // Find two oppositions that share no planets
  for (let i = 0; i < oppositions.length; i++) {
    for (let j = i + 1; j < oppositions.length; j++) {
      const opp1 = oppositions[i];
      const opp2 = oppositions[j];

      // Check if they share any planets
      if (
        opp1.planet1 === opp2.planet1 ||
        opp1.planet1 === opp2.planet2 ||
        opp1.planet2 === opp2.planet1 ||
        opp1.planet2 === opp2.planet2
      ) {
        continue;
      }

      // Check if all four planets square each other appropriately
      const fourPlanets = [opp1.planet1, opp1.planet2, opp2.planet1, opp2.planet2];
      let allSquare = true;

      for (const planet of fourPlanets) {
        const squaresToOthers = squares.filter(
          (s) => s.planet1 === planet || s.planet2 === planet
        );

        // Should have 2 squares to the other opposition's planets
        const squaresToOpposite = squaresToOthers.filter((s) =>
          fourPlanets.includes(s.planet1 === planet ? s.planet2 : s.planet1)
        );

        if (squaresToOpposite.length < 2) {
          allSquare = false;
          break;
        }
      }

      if (allSquare) {
        patterns.push(fourPlanets);
      }
    }
  }

  return patterns;
}

/**
 * Find Yod patterns
 */
function findYods(
  sextiles: Aspect[],
  quincunxes: Aspect[],
  planets: PlanetPosition[]
): string[][] {
  const patterns: string[][] = [];

  // Find two planets in sextile
  sextiles.forEach((sextile) => {
    const planet1 = sextile.planet1;
    const planet2 = sextile.planet2;

    // Find a planet that quincunxes both
    const quincunx1 = quincunxes.filter(
      (q) => q.planet1 === planet1 || q.planet2 === planet1
    );
    const quincunx2 = quincunxes.filter(
      (q) => q.planet1 === planet2 || q.planet2 === planet2
    );

    quincunx1.forEach((q1) => {
      const focalPlanet =
        q1.planet1 === planet1 ? q1.planet2 : q1.planet1;

      quincunx2.forEach((q2) => {
        if (
          (q2.planet1 === planet2 && q2.planet2 === focalPlanet) ||
          (q2.planet2 === planet2 && q2.planet1 === focalPlanet)
        ) {
          patterns.push([planet1, planet2, focalPlanet]);
        }
      });
    });
  });

  return patterns;
}

/**
 * Find Kite patterns
 */
function findKites(
  trines: Aspect[],
  sextiles: Aspect[],
  planets: PlanetPosition[]
): string[][] {
  const patterns: string[][] = [];

  // First find Grand Trines
  const grandTrines = findPolygonPatterns(trines, planets, 3);

  // For each Grand Trine, find a planet that sextiles two of the trine planets
  grandTrines.forEach((trinePlanets) => {
    planets.forEach((planet) => {
      if (trinePlanets.includes(planet.planet)) return;

      // Check if this planet sextiles at least 2 planets in the Grand Trine
      const sextileCount = sextiles.filter(
        (s) =>
          (s.planet1 === planet.planet && trinePlanets.includes(s.planet2)) ||
          (s.planet2 === planet.planet && trinePlanets.includes(s.planet1))
      ).length;

      if (sextileCount >= 2) {
        patterns.push([...trinePlanets, planet.planet]);
      }
    });
  });

  return patterns;
}

// ============================================================================
// TRANSIT ANALYSIS
// ============================================================================

export interface TransitAnalysisRequest {
  natalChart: {
    planets: PlanetPosition[];
    houses: HouseCusp[];
  };
  transitingPlanets: Array<{
    planet: string;
    longitude: number;
  }>;
  date: Date;
}

export interface TransitAnalysisResponse {
  activeTransits: Array<{
    transitingPlanet: string;
    natalPlanet: string;
    aspect: string;
    orb: number;
    applying: boolean;
    interpretation: any;
  }>;
  highlights: TransitHighlight[];
}

export interface TransitHighlight {
  type: 'major-transit' | 'moon-phase' | 'eclipse' | 'retrograde';
  title: string;
  date: Date;
  description: string;
  intensity?: number;
}

/**
 * Generate complete transit analysis
 */
export function generateTransitAnalysis(
  request: TransitAnalysisRequest
): TransitAnalysisResponse {
  const { natalChart, transitingPlanets, date } = request;

  // Calculate all aspects between transiting and natal planets
  const activeTransits: TransitAnalysisResponse['activeTransits'] = [];

  transitingPlanets.forEach((transitingPlanet) => {
    natalChart.planets.forEach((natalPlanet) => {
      const aspect = calculateAspect(
        transitingPlanet.longitude,
        natalPlanet.longitude
      );

      if (aspect && aspect.orb <= 10) {
        // Within orb
        const interpretation = getTransitInterpretation(
          transitingPlanet.planet,
          aspect.type,
          natalPlanet.planet
        );

        activeTransits.push({
          transitingPlanet: transitingPlanet.planet,
          natalPlanet: natalPlanet.planet,
          aspect: aspect.type,
          orb: aspect.orb,
          applying: aspect.applying,
          interpretation,
        });
      }
    });
  });

  // Sort by intensity (orb and aspect type)
  activeTransits.sort((a, b) => {
    const aspectIntensity = {
      conjunction: 10,
      opposition: 9,
      square: 8,
      trine: 6,
      sextile: 5,
      quincunx: 7,
    };
    const aIntensity = aspectIntensity[a.aspect as keyof typeof aspectIntensity] || 0;
    const bIntensity = aspectIntensity[b.aspect as keyof typeof aspectIntensity] || 0;
    const aScore = aIntensity - a.orb;
    const bScore = bIntensity - b.orb;
    return bScore - aScore;
  });

  // Generate highlights
  const highlights: TransitHighlight[] = [];

  // Major transits (outer planets or tight orbs)
  activeTransits.forEach((transit) => {
    const outerPlanets = ['jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
    if (
      outerPlanets.includes(transit.transitingPlanet) ||
      transit.orb <= 1
    ) {
      highlights.push({
        type: 'major-transit',
        title: `${transit.transitingPlanet} ${transit.aspect} ${transit.natalPlanet}`,
        date,
        description: transit.interpretation.description,
        intensity: 10 - transit.orb,
      });
    }
  });

  return {
    activeTransits,
    highlights,
  };
}

/**
 * Calculate aspect between two longitudes
 */
function calculateAspect(lon1: number, lon2: number): {
  type: string;
  orb: number;
  applying: boolean;
} | null {
  const aspects = [
    { type: 'conjunction', angle: 0, orb: 10 },
    { type: 'opposition', angle: 180, orb: 8 },
    { type: 'trine', angle: 120, orb: 8 },
    { type: 'square', angle: 90, orb: 8 },
    { type: 'sextile', angle: 60, orb: 6 },
    { type: 'quincunx', angle: 150, orb: 3 },
  ];

  const diff = Math.abs(lon1 - lon2);
  const normalizedDiff = diff > 180 ? 360 - diff : diff;

  for (const aspect of aspects) {
    if (normalizedDiff <= aspect.angle + aspect.orb && normalizedDiff >= aspect.angle - aspect.orb) {
      return {
        type: aspect.type,
        orb: Math.abs(normalizedDiff - aspect.angle),
        applying: lon1 > lon2, // Simplified - would need more complex calculation
      };
    }
  }

  return null;
}
