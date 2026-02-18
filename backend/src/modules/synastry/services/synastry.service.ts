/**
 * Synastry Service
 * Calculates compatibility and synastry between two natal charts
 */

import {
  calculateJulianDay,
  getZodiacSign,
  normalizeDegree,
} from '../../calendar/services/calendar.service';
import { MoonPhase, Planet, ZodiacSign } from '../../calendar/models/calendar.model';

// Helper function: Calculate angular distance between two degrees
function angularDistance(deg1: number, deg2: number): number {
  const diff = Math.abs(deg1 - deg2);
  return diff > 180 ? 360 - diff : diff;
}

// Helper function: Get absolute zodiac position from sign and degree
function signDegreeToAbsolute(sign: ZodiacSign, degree: number, minute: number = 0, second: number = 0): number {
  const signOffsets: Record<ZodiacSign, number> = {
    aries: 0,
    taurus: 30,
    gemini: 60,
    cancer: 90,
    leo: 120,
    virgo: 150,
    libra: 180,
    scorpio: 210,
    sagittarius: 240,
    capricorn: 270,
    aquarius: 300,
    pisces: 330,
  };

  const signOffset = signOffsets[sign];
  return signOffset + degree + minute / 60 + second / 3600;
}

// Types for synastry calculations
export interface PlanetPosition {
  name: Planet;
  degree: number;
  minute: number;
  second: number;
  sign: ZodiacSign;
}

export interface Chart {
  id: string;
  userId: string;
  planets: {
    [key in Planet]?: PlanetPosition;
  };
  // Could include houses, ascendant, etc.
}

export interface SynastryAspect {
  planet1: Planet;
  planet2: Planet;
  aspect: 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile' | 'quincunx' | 'semi-sextile';
  orb: number;
  applying: boolean;
  interpretation: string;
  weight: number;
  soulmateIndicator: boolean;
}

export interface SynastryChart {
  id: string;
  chart1Id: string;
  chart2Id: string;
  synastryAspects: SynastryAspect[];
  overallCompatibility: number;
  relationshipTheme: string;
  strengths: string[];
  challenges: string[];
  advice: string;
}

export interface CompositePlanet {
  name: Planet;
  degree: number;
  minute: number;
  second: number;
  sign: ZodiacSign;
}

export interface CompositeChart {
  chart1Id: string;
  chart2Id: string;
  planets: {
    [key in Planet]?: CompositePlanet;
  };
  interpretation: string;
}

export interface CompatibilityScores {
  overall: number;
  romantic: number;
  communication: number;
  emotional: number;
  intellectual: number;
  spiritual: number;
  values: number;
}

export interface ElementalBalance {
  fire: number;
  earth: number;
  air: number;
  water: number;
  balance: string;
}

export interface CompatibilityReport {
  user1Id: string;
  user2Id: string;
  scores: CompatibilityScores;
  elementalBalance: ElementalBalance;
  relationshipDynamics: string[];
  strengths: string[];
  challenges: string[];
  growthOpportunities: string[];
  detailedReport: string;
}

/**
 * Calculate synastry aspects between two charts
 */
export function calculateSynastryAspects(chart1: Chart, chart2: Chart): SynastryAspect[] {
  const aspects: SynastryAspect[] = [];
  const planets1 = chart1.planets;
  const planets2 = chart2.planets;

  // Define aspect orbs
  const aspectOrbs: Record<string, number> = {
    conjunction: 10,
    opposition: 8,
    trine: 8,
    square: 8,
    sextile: 6,
    quincunx: 3,
    'semi-sextile': 3,
  };

  // Get all planet pairs
  for (const p1 in planets1) {
    if (!planets1[p1]) continue;

    const planet1Pos = planets1[p1]!;
    const degree1 = planet1Pos.degree + planet1Pos.minute / 60 + planet1Pos.second / 3600;

    for (const p2 in planets2) {
      if (!planets2[p2]) continue;

      const planet2Pos = planets2[p2]!;
      const degree2 = planet2Pos.degree + planet2Pos.minute / 60 + planet2Pos.second / 3600;

      // Calculate angular distance
      const dist = angularDistance(degree1, degree2);

      // Check for aspects
      for (const [aspectType, orb] of Object.entries(aspectOrbs)) {
        const aspectAngle = getAspectAngle(aspectType);
        const diff = Math.abs(dist - aspectAngle);

        if (diff <= orb) {
          aspects.push({
            planet1: p1 as Planet,
            planet2: p2 as Planet,
            aspect: aspectType as SynastryAspect['aspect'],
            orb: Math.round(diff * 100) / 100,
            applying: degree1 < degree2, // Simplified
            interpretation: getSynastryAspectInterpretation(
              p1,
              p2,
              aspectType as SynastryAspect['aspect'],
              diff
            ),
            weight: calculateAspectWeight(p1 as Planet, p2 as Planet, aspectType as SynastryAspect['aspect']),
            soulmateIndicator: isSoulmateAspect(p1 as Planet, p2 as Planet, aspectType as SynastryAspect['aspect']),
          });
          break; // Only add closest aspect
        }
      }
    }
  }

  return aspects;
}

/**
 * Calculate overall compatibility score between two charts
 */
export function calculateCompatibilityScore(chart1: Chart, chart2: Chart): number {
  const aspects = calculateSynastryAspects(chart1, chart2);

  // Base score
  let score = 5;

  // Add points for harmonious aspects
  aspects.forEach((aspect) => {
    if (aspect.aspect === 'trine' || aspect.aspect === 'sextile') {
      score += aspect.weight * 0.5;
    } else if (aspect.aspect === 'conjunction') {
      score += aspect.weight * 0.3;
    } else if (aspect.aspect === 'opposition' || aspect.aspect === 'square') {
      score -= aspect.weight * 0.3;
    }
  });

  // Calculate elemental balance
  const balance = calculateElementalBalance(chart1, chart2);
  if (balance.balance === 'balanced') {
    score += 1;
  } else if (balance.balance === 'imbalanced') {
    score -= 0.5;
  }

  // Clamp to 1-10
  return Math.max(1, Math.min(10, Math.round(score * 10) / 10));
}

/**
 * Calculate category-specific compatibility scores
 */
export function calculateCategoryScores(chart1: Chart, chart2: Chart): CompatibilityScores {
  const aspects = calculateSynastryAspects(chart1, chart2);

  // Romantic: Venus, Mars, Moon aspects
  const romanticAspects = aspects.filter(a =>
    ['venus', 'mars', 'moon'].includes(a.planet1) ||
    ['venus', 'mars', 'moon'].includes(a.planet2)
  );
  const romantic = calculateCategoryScore(romanticAspects);

  // Communication: Mercury aspects
  const communicationAspects = aspects.filter(a =>
    a.planet1 === 'mercury' || a.planet2 === 'mercury'
  );
  const communication = calculateCategoryScore(communicationAspects);

  // Emotional: Moon, Venus, Neptune aspects
  const emotionalAspects = aspects.filter(a =>
    ['moon', 'venus', 'neptune'].includes(a.planet1) ||
    ['moon', 'venus', 'neptune'].includes(a.planet2)
  );
  const emotional = calculateCategoryScore(emotionalAspects);

  // Intellectual: Mercury, Jupiter, Uranus aspects
  const intellectualAspects = aspects.filter(a =>
    ['mercury', 'jupiter', 'uranus'].includes(a.planet1) ||
    ['mercury', 'jupiter', 'uranus'].includes(a.planet2)
  );
  const intellectual = calculateCategoryScore(intellectualAspects);

  // Spiritual: Neptune, Pluto, Jupiter aspects
  const spiritualAspects = aspects.filter(a =>
    ['neptune', 'pluto', 'jupiter'].includes(a.planet1) ||
    ['neptune', 'pluto', 'jupiter'].includes(a.planet2)
  );
  const spiritual = calculateCategoryScore(spiritualAspects);

  // Values: Venus, Saturn aspects
  const valuesAspects = aspects.filter(a =>
    ['venus', 'saturn'].includes(a.planet1) ||
    ['venus', 'saturn'].includes(a.planet2)
  );
  const values = calculateCategoryScore(valuesAspects);

  return {
    overall: calculateCompatibilityScore(chart1, chart2),
    romantic,
    communication,
    emotional,
    intellectual,
    spiritual,
    values,
  };
}

/**
 * Calculate synastry chart
 */
export function calculateSynastryChart(chart1: Chart, chart2: Chart): SynastryChart {
  const aspects = calculateSynastryAspects(chart1, chart2);
  const compatibility = calculateCompatibilityScore(chart1, chart2);

  return {
    id: `synastry_${chart1.id}_${chart2.id}`,
    chart1Id: chart1.id,
    chart2Id: chart2.id,
    synastryAspects: aspects,
    overallCompatibility: compatibility,
    relationshipTheme: getRelationshipTheme(aspects, compatibility),
    strengths: getRelationshipStrengths(aspects),
    challenges: getRelationshipChallenges(aspects),
    advice: getRelationshipAdvice(aspects, compatibility),
  };
}

/**
 * Calculate composite chart (midpoint of two charts)
 */
export function calculateCompositeChart(chart1: Chart, chart2: Chart): CompositeChart {
  const compositePlanets: { [key in Planet]?: CompositePlanet } = {};
  const planets1 = chart1.planets;
  const planets2 = chart2.planets;

  // Calculate midpoint for each planet
  for (const planet in planets1) {
    if (!planets1[planet] || !planets2[planet]) continue;

    const p1 = planets1[planet]!;
    const p2 = planets2[planet]!;

    // Convert to absolute zodiac positions
    const degree1 = signDegreeToAbsolute(p1.sign, p1.degree, p1.minute, p1.second);
    const degree2 = signDegreeToAbsolute(p2.sign, p2.degree, p2.minute, p2.second);

    // Calculate midpoint
    let midDegree = (degree1 + degree2) / 2;
    if (Math.abs(degree1 - degree2) > 180) {
      midDegree = (midDegree + 180) % 360;
    }

    const normalizedMid = normalizeDegree(midDegree);
    const sign = getZodiacSign(normalizedMid);
    const degreeInSign = normalizedMid % 30;
    const degree = Math.floor(degreeInSign);
    const minute = Math.floor((degreeInSign - degree) * 60);
    const second = Math.round(((degreeInSign - degree) * 60 - minute) * 60);

    compositePlanets[planet] = {
      name: planet,
      degree,
      minute,
      second,
      sign,
    };
  }

  return {
    chart1Id: chart1.id,
    chart2Id: chart2.id,
    planets: compositePlanets,
    interpretation: getCompositeChartInterpretation(compositePlanets),
  };
}

/**
 * Generate full compatibility report
 */
export function generateCompatibilityReport(
  chart1: Chart,
  chart2: Chart
): CompatibilityReport {
  const scores = calculateCategoryScores(chart1, chart2);
  const aspects = calculateSynastryAspects(chart1, chart2);
  const elementalBalance = calculateElementalBalance(chart1, chart2);
  const synastryChart = calculateSynastryChart(chart1, chart2);

  return {
    user1Id: chart1.userId,
    user2Id: chart2.userId,
    scores,
    elementalBalance,
    relationshipDynamics: getRelationshipDynamics(aspects, elementalBalance),
    strengths: synastryChart.strengths,
    challenges: synastryChart.challenges,
    growthOpportunities: getGrowthOpportunities(aspects, scores),
    detailedReport: generateDetailedReport(scores, aspects, elementalBalance, synastryChart),
  };
}

/**
 * Calculate elemental balance between two charts
 */
export function calculateElementalBalance(chart1: Chart, chart2: Chart): ElementalBalance {
  const getElements = (chart: Chart) => {
    const elements = { fire: 0, earth: 0, air: 0, water: 0 };
    const fireSigns = ['aries', 'leo', 'sagittarius'];
    const earthSigns = ['taurus', 'virgo', 'capricorn'];
    const airSigns = ['gemini', 'libra', 'aquarius'];
    const waterSigns = ['cancer', 'scorpio', 'pisces'];

    for (const planet in chart.planets) {
      const pos = chart.planets[planet];
      if (pos) {
        if (fireSigns.includes(pos.sign)) elements.fire++;
        if (earthSigns.includes(pos.sign)) elements.earth++;
        if (airSigns.includes(pos.sign)) elements.air++;
        if (waterSigns.includes(pos.sign)) elements.water++;
      }
    }

    return elements;
  };

  const e1 = getElements(chart1);
  const e2 = getElements(chart2);

  const combined = {
    fire: e1.fire + e2.fire,
    earth: e1.earth + e2.earth,
    air: e1.air + e2.air,
    water: e1.water + e2.water,
  };

  const total = combined.fire + combined.earth + combined.air + combined.water;
  const max = Math.max(combined.fire, combined.earth, combined.air, combined.water);
  const min = Math.min(combined.fire, combined.earth, combined.air, combined.water);

  let balance = 'balanced';
  if (max - min > total * 0.4) {
    balance = 'imbalanced';
  } else if (max - min < total * 0.15) {
    balance = 'well-balanced';
  }

  return {
    ...combined,
    balance,
  };
}

// Helper functions

function getAspectAngle(aspect: string): number {
  const angles: Record<string, number> = {
    'conjunction': 0,
    'opposition': 180,
    'trine': 120,
    'square': 90,
    'sextile': 60,
    'quincunx': 150,
    'semi-sextile': 30,
  };
  return angles[aspect] || 0;
}

function getSynastryAspectInterpretation(
  planet1: string,
  planet2: string,
  aspect: string,
  orb: number
): string {
  // Simplified interpretations - in production, use comprehensive database
  const interpretations: Record<string, string> = {
    'sun-moon-conjunction': 'A powerful emotional and conscious connection. You understand each other deeply.',
    'sun-moon-opposition': 'Tension between your conscious needs and emotional desires creates growth opportunities.',
    'sun-moon-trine': 'Natural harmony between your feelings and actions creates ease in the relationship.',
    'venus-mars-conjunction': 'Strong romantic and sexual attraction. Your love and desire nature are aligned.',
    'venus-mars-opposition': 'Passionate but potentially challenging dynamic between love and desire.',
    'mercury-mercury-trine': 'Excellent communication. You understand each other\'s thinking patterns.',
    'moon-moon-sextile': 'Emotional compatibility with room for growth. Your feelings flow well together.',
  };

  const key = `${planet1}-${planet2}-${aspect}`;
  return interpretations[key] || `This ${aspect} between ${planet1} and ${planet2} creates ${aspect === 'trine' || aspect === 'sextile' ? 'harmony' : aspect === 'square' || aspect === 'opposition' ? 'tension' : 'connection'} in your relationship.`;
}

function calculateAspectWeight(planet1: Planet, planet2: Planet, aspect: string): number {
  // Personal planets have more weight
  const personalPlanets: Planet[] = ['sun', 'moon', 'mercury', 'venus', 'mars'];
  const isPersonal1 = personalPlanets.includes(planet1);
  const isPersonal2 = personalPlanets.includes(planet2);

  let weight = 1;
  if (isPersonal1 && isPersonal2) weight = 3;
  else if (isPersonal1 || isPersonal2) weight = 2;

  // Major aspects have more weight
  if (aspect === 'conjunction' || aspect === 'opposition') weight *= 1.5;
  if (aspect === 'trine' || aspect === 'square') weight *= 1.2;

  return Math.min(5, weight);
}

function isSoulmateAspect(planet1: Planet, planet2: Planet, aspect: string): boolean {
  // Certain aspects are considered "soulmate" indicators
  const soulmateAspects = [
    'sun-moon-conjunction',
    'sun-moon-trine',
    'venus-venus-conjunction',
    'venus-mars-conjunction',
    'moon-moon-opposition',
  ];

  const key = `${planet1}-${planet2}-${aspect}`;
  return soulmateAspects.includes(key) || soulmateAspects.includes(`${planet2}-${planet1}-${aspect}`);
}

function calculateCategoryScore(aspects: SynastryAspect[]): number {
  if (aspects.length === 0) return 5;

  let score = 5;
  aspects.forEach((aspect) => {
    if (aspect.aspect === 'trine' || aspect.aspect === 'sextile') {
      score += aspect.weight * 0.5;
    } else if (aspect.aspect === 'conjunction') {
      score += aspect.weight * 0.3;
    } else if (aspect.aspect === 'opposition' || aspect.aspect === 'square') {
      score -= aspect.weight * 0.2;
    }
  });

  return Math.max(1, Math.min(10, Math.round(score * 10) / 10));
}

function getRelationshipTheme(aspects: SynastryAspect[], compatibility: number): string {
  if (compatibility >= 8) {
    return 'Highly compatible relationship with strong potential for harmony and growth';
  } else if (compatibility >= 6) {
    return 'Generally compatible with areas of both strength and challenge';
  } else {
    return 'Challenging relationship requiring conscious effort and understanding';
  }
}

function getRelationshipStrengths(aspects: SynastryAspect[]): string[] {
  const strengths: string[] = [];

  const trines = aspects.filter(a => a.aspect === 'trine');
  if (trines.length >= 3) {
    strengths.push('Natural flow and ease in multiple areas of life');
  }

  const sextiles = aspects.filter(a => a.aspect === 'sextile');
  if (sextiles.length >= 3) {
    strengths.push('Opportunities for growth and cooperation');
  }

  const soulmateAspects = aspects.filter(a => a.soulmateIndicator);
  if (soulmateAspects.length > 0) {
    strengths.push('Deep karmic or soul connections');
  }

  if (strengths.length === 0) {
    strengths.push('Each person brings unique qualities to the relationship');
  }

  return strengths;
}

function getRelationshipChallenges(aspects: SynastryAspect[]): string[] {
  const challenges: string[] = [];

  const squares = aspects.filter(a => a.aspect === 'square');
  if (squares.length >= 2) {
    challenges.push('Tension and friction that requires conscious navigation');
  }

  const oppositions = aspects.filter(a => a.aspect === 'opposition');
  if (oppositions.length >= 2) {
    challenges.push('Balancing opposing needs and perspectives');
  }

  const quincunxes = aspects.filter(a => a.aspect === 'quincunx');
  if (quincunxes.length >= 2) {
    challenges.push('Need for adjustment and adaptation');
  }

  if (challenges.length === 0) {
    challenges.push('Every relationship requires effort and understanding');
  }

  return challenges;
}

function getRelationshipAdvice(aspects: SynastryAspect[], compatibility: number): string {
  if (compatibility >= 8) {
    return 'Your high compatibility provides a strong foundation. Focus on maintaining appreciation and avoiding complacency.';
  } else if (compatibility >= 6) {
    return 'Work together on your challenges while celebrating your strengths. Open communication is key.';
  } else {
    return 'This relationship requires conscious effort, patience, and understanding. Focus on acceptance and growth.';
  }
}

function getRelationshipDynamics(aspects: SynastryAspect[], elementalBalance: ElementalBalance): string[] {
  const dynamics: string[] = [];

  // Analyze elemental balance
  if (elementalBalance.balance === 'well-balanced') {
    dynamics.push('You complement each other\'s elemental strengths');
  } else if (elementalBalance.balance === 'imbalanced') {
    dynamics.push('You may have difficulty understanding each other\'s fundamental approaches');
  }

  // Analyze major aspects
  const sunMoonAspects = aspects.filter(a =>
    (a.planet1 === 'sun' && a.planet2 === 'moon') ||
    (a.planet1 === 'moon' && a.planet2 === 'sun')
  );
  if (sunMoonAspects.length > 0) {
    dynamics.push('Strong emotional connection between your core identities');
  }

  const venusMarsAspects = aspects.filter(a =>
    (a.planet1 === 'venus' && a.planet2 === 'mars') ||
    (a.planet1 === 'mars' && a.planet2 === 'venus')
  );
  if (venusMarsAspects.length > 0) {
    dynamics.push('Powerful romantic and sexual chemistry');
  }

  return dynamics;
}

function getGrowthOpportunities(aspects: SynastryAspect[], scores: CompatibilityScores): string[] {
  const opportunities: string[] = [];

  // Find lowest scoring category
  const scoresArray = Object.entries(scores).filter(([key]) => key !== 'overall');
  const [lowestCategory, lowestScore] = scoresArray.sort(([, a], [, b]) => a - b)[0];

  if (lowestScore && lowestScore < 7) {
    opportunities.push(`Growth opportunity in ${lowestCategory} compatibility`);
  }

  const challengingAspects = aspects.filter(a =>
    a.aspect === 'square' || a.aspect === 'opposition'
  );
  if (challengingAspects.length > 0) {
    opportunities.push('Transform challenges into opportunities for understanding');
  }

  opportunities.push('Learn from each other\'s strengths and differences');

  return opportunities;
}

function getCompositeChartInterpretation(compositePlanets: { [key in Planet]?: CompositePlanet }): string {
  return 'The composite chart represents the relationship itself as a separate entity. ' +
    'It reveals the purpose and dynamics of your partnership.';
}

function generateDetailedReport(
  scores: CompatibilityScores,
  aspects: SynastryAspect[],
  elementalBalance: ElementalBalance,
  synastryChart: SynastryChart
): string {
  let report = '# Compatibility Report\n\n';

  report += `## Overall Compatibility: ${scores.overall}/10\n\n`;
  report += `${synastryChart.relationshipTheme}\n\n`;

  report += '## Category Scores\n\n';
  report += `- Romantic: ${scores.romantic}/10\n`;
  report += `- Communication: ${scores.communication}/10\n`;
  report += `- Emotional: ${scores.emotional}/10\n`;
  report += `- Intellectual: ${scores.intellectual}/10\n`;
  report += `- Spiritual: ${scores.spiritual}/10\n`;
  report += `- Values: ${scores.values}/10\n\n`;

  report += '## Elemental Balance\n\n';
  report += `Fire: ${elementalBalance.fire}, Earth: ${elementalBalance.earth}, ` +
           `Air: ${elementalBalance.air}, Water: ${elementalBalance.water}\n`;
  report += `Balance: ${elementalBalance.balance}\n\n`;

  report += '## Strengths\n\n';
  synastryChart.strengths.forEach((strength, i) => {
    report += `${i + 1}. ${strength}\n`;
  });
  report += '\n';

  report += '## Challenges\n\n';
  synastryChart.challenges.forEach((challenge, i) => {
    report += `${i + 1}. ${challenge}\n`;
  });
  report += '\n';

  report += `## Advice\n\n${synastryChart.advice}\n`;

  return report;
}

export default {
  calculateSynastryAspects,
  calculateCompatibilityScore,
  calculateCategoryScores,
  calculateSynastryChart,
  calculateCompositeChart,
  generateCompatibilityReport,
  calculateElementalBalance,
};
