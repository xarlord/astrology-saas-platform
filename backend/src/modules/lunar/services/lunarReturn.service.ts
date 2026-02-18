/**
 * Lunar Return Service
 * Calculates lunar return charts and generates monthly forecasts
 */

import {
  calculateJulianDay,
  getZodiacSign,
  normalizeDegree,
  calculateMoonPhase,
} from '../../calendar/services/calendar.service';
import { MoonPhase, Planet, ZodiacSign } from '../../calendar/models/calendar.model';

export interface NatalChart {
  id: string;
  userId: string;
  moon: {
    sign: string;
    degree: number;
    minute: number;
    second: number;
  };
  // Other planets could be added later
}

export interface LunarReturnChart {
  returnDate: Date;
  moonPosition: {
    sign: string;
    degree: number;
    minute: number;
    second: number;
  };
  moonPhase: MoonPhase;
  housePlacement: number;
  aspects: LunarAspect[];
  theme: string;
  intensity: number;
}

export interface LunarAspect {
  planets: [string, string];
  type: 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile';
  orb: number;
  applying: boolean;
  interpretation: string;
}

export interface LunarMonthForecast {
  userId: string;
  returnDate: Date;
  theme: string;
  intensity: number;
  emotionalTheme: string;
  actionAdvice: string[];
  keyDates: KeyDate[];
  predictions: MonthlyPrediction[];
  rituals: MonthlyRitual[];
  journalPrompts: string[];
}

export interface KeyDate {
  date: Date;
  type: 'new-moon' | 'full-moon' | 'eclipse' | 'aspect-exact';
  description: string;
  significance: string;
}

export interface MonthlyPrediction {
  category: 'relationships' | 'career' | 'finances' | 'health' | 'creativity' | 'spirituality';
  prediction: string;
  likelihood: number; // 1-10
  advice: string[];
}

export interface MonthlyRitual {
  phase: 'new-moon' | 'full-moon' | 'quarter-moon';
  title: string;
  description: string;
  materials?: string[];
  steps: string[];
}

/**
 * Calculate the next lunar return for a given natal moon position
 */
export function calculateNextLunarReturn(natalMoon: {
  sign: string;
  degree: number;
  minute: number;
  second: number;
}): Date {
  // Synodic month: ~29.530588 days (average time between same moon phases)
  const synodicMonthDays = 29.530588;

  // Calculate natal moon position in degrees (0-360)
  const natalDegree = natalMoon.degree + natalMoon.minute / 60 + natalMoon.second / 3600;

  // Use a simpler approach: estimate days until next lunar return
  // This is a simplified calculation - for production, use Swiss Ephemeris
  const today = new Date();
  const currentJD = calculateJulianDay(today);

  // Moon's mean motion: ~13.176 degrees per day
  const moonDailyMotion = 13.1763966;

  // Calculate approximate moon position today (simplified)
  // Using J2000 epoch + days elapsed * daily motion
  const daysSinceJ2000 = currentJD - 2451545.0;
  const currentMoonDegree = (90.0 + moonDailyMotion * daysSinceJ2000) % 360;
  if (currentMoonDegree < 0) currentMoonDegree += 360;

  // Calculate degrees to next lunar return
  let degreesToReturn = (natalDegree - currentMoonDegree) % 360;
  if (degreesToReturn < 0) degreesToReturn += 360;

  // Convert degrees to days
  const daysToReturn = degreesToReturn / moonDailyMotion;

  const returnDate = new Date(today.getTime() + daysToReturn * 24 * 60 * 60 * 1000);

  return returnDate;
}

/**
 * Calculate lunar return chart
 */
export function calculateLunarReturnChart(
  natalChart: NatalChart,
  returnDate: Date
): LunarReturnChart {
  // Get moon position at return time
  const moonPhase = calculateMoonPhase(returnDate);

  // Calculate moon's position (simplified - in production, use Swiss Ephemeris)
  const returnJD = calculateJulianDay(returnDate);
  const daysSinceEpoch = returnJD - 2415020; // J2000.0 epoch

  // Moon's mean longitude (simplified formula)
  const moonLongitude = (13.1763966 * daysSinceEpoch + 90.0) % 360;
  const normalizedDegree = normalizeDegree(moonLongitude);
  const sign = getZodiacSign(normalizedDegree);

  const degree = normalizedDegree % 30;
  const minute = (degree % 1) * 60;
  const second = ((degree * 60) % 1) * 60;

  // Calculate house placement (simplified - equal house system)
  const housePlacement = Math.floor(normalizedDegree / 30) + 1;

  // Generate aspects (simplified)
  const aspects: LunarAspect[] = generateMoonAspects(normalizedDegree, natalChart.moon);

  // Determine theme and intensity
  const theme = getLunarReturnTheme(housePlacement, moonPhase.phase);
  const intensity = calculateLunarIntensity(housePlacement, moonPhase.phase, aspects);

  return {
    returnDate,
    moonPosition: {
      sign,
      degree,
      minute,
      second,
    },
    moonPhase: moonPhase.phase,
    housePlacement,
    aspects,
    theme,
    intensity,
  };
}

/**
 * Generate aspects between transiting moon and natal planets
 */
function generateMoonAspects(
  transitingMoonDegree: number,
  natalMoon: { degree: number; minute: number }
): LunarAspect[] {
  const aspects: LunarAspect[] = [];
  const natalMoonDegree = natalMoon.degree + natalMoon.minute / 60;

  // Check aspects with major planets (simplified - in production, use actual natal chart)
  const natalPlanets = [
    { name: 'Sun', degree: 120 }, // Example: 120°
    { name: 'Mercury', degree: 125 },
    { name: 'Venus', degree: 130 },
    { name: 'Mars', degree: 90 },
    { name: 'Jupiter', degree: 200 },
  ];

  const aspectOrbs = {
    conjunction: 10,
    opposition: 8,
    trine: 8,
    square: 8,
    sextile: 6,
  };

  for (const planet of natalPlanets) {
    const angularDistance = Math.abs(transitingMoonDegree - planet.degree);
    const normalizedDistance = angularDistance > 180 ? 360 - angularDistance : angularDistance;

    // Check if within orb for any aspect
    for (const [type, orb] of Object.entries(aspectOrbs)) {
      if (normalizedDistance <= orb) {
        aspects.push({
          planets: ['Moon', planet.name] as [string, string],
          type: type as LunarAspect['type'],
          orb: Math.round(normalizedDistance * 100) / 100,
          applying: true, // Simplified
          interpretation: getMoonAspectInterpretation(type, planet.name),
        });
        break; // Only add closest aspect
      }
    }
  }

  return aspects;
}

/**
 * Get lunar return theme based on house placement and moon phase
 */
function getLunarReturnTheme(house: number, moonPhase: MoonPhase): string {
  const houseThemes = {
    1: 'Self-Discovery and New Beginnings',
    2: 'Values, Finances, and Possessions',
    3: 'Communication, Learning, and Local Community',
    4: 'Home, Family, and Emotional Foundations',
    5: 'Creativity, Romance, and Self-Expression',
    6: 'Work, Service, and Daily Routines',
    7: 'Partnerships, Relationships, and Balance',
    8: 'Transformation, Intimacy, and Shared Resources',
    9: 'Philosophy, Travel, and Higher Learning',
    10: 'Career, Ambition, and Public Image',
    11: 'Friendship, Social Networks, and Community',
    12: 'Spirituality, Endings, and the Unconscious',
  };

  const phaseModifiers: Record<MoonPhase, string> = {
    'new-moon': 'with Fresh Intentions',
    'waxing-crescent': 'with Growing Energy',
    'first-quarter': 'with Decisive Action',
    'waxing-gibbous': 'with Building Momentum',
    'full': 'with Culmination and Clarity',
    'waning-gibbous': 'with Gratitude and Sharing',
    'last-quarter': 'with Reflection and Release',
    'waning-crescent': 'with Rest and Renewal',
  };

  return `${houseThemes[house as keyof typeof houseThemes]} ${phaseModifiers[moonPhase]}`;
}

/**
 * Calculate lunar intensity score
 */
function calculateLunarIntensity(
  house: number,
  moonPhase: MoonPhase,
  aspects: LunarAspect[]
): number {
  let intensity = 5; // Base score

  // House intensity (houses 4, 8, 12 are more emotional)
  if ([4, 8, 12].includes(house)) {
    intensity += 1;
  }

  // Moon phase intensity
  if (moonPhase === 'full' || moonPhase === 'new') {
    intensity += 1;
  }

  // Aspect intensity
  aspects.forEach((aspect) => {
    if (aspect.type === 'conjunction') intensity += 2;
    if (aspect.type === 'opposition') intensity += 1;
    if (aspect.type === 'square') intensity += 1;
  });

  // Clamp to 1-10
  return Math.max(1, Math.min(10, intensity));
}

/**
 * Get moon aspect interpretation
 */
function getMoonAspectInterpretation(aspect: string, planet: string): string {
  const interpretations: Record<string, string> = {
    'Moon-conjunction-Sun': 'Your conscious and emotional nature are aligned, creating harmony between your inner and outer self.',
    'Moon-opposition-Sun': 'Tension between your emotional needs and your conscious desires creates an opportunity for growth and integration.',
    'Moon-trine-Sun': 'Harmonious flow between your feelings and actions creates ease in self-expression.',
    'Moon-square-Mercury': 'Emotional communications may be challenging; practice clarity and patience.',
    'Moon-trine-Venus': 'Your emotional nature is in harmony with your capacity for love and connection.',
  };

  const key = `Moon-${aspect}-${planet}`;
  return interpretations[key] || 'Emotional significance';
}

/**
 * Generate monthly forecast
 */
export function generateLunarMonthForecast(
  userId: string,
  natalChart: NatalChart,
  returnDate: Date
): LunarMonthForecast {
  const chart = calculateLunarReturnChart(natalChart, returnDate);

  // Generate key dates for the lunar month
  const keyDates = generateKeyDates(returnDate, chart);

  // Generate predictions
  const predictions = generatePredictions(chart);

  // Generate rituals
  const rituals = generateRituals(returnDate, chart);

  // Generate journal prompts
  const journalPrompts = generateJournalPrompts(chart);

  return {
    userId,
    returnDate,
    theme: chart.theme,
    intensity: chart.intensity,
    emotionalTheme: getEmotionalTheme(chart),
    actionAdvice: getActionAdvice(chart),
    keyDates,
    predictions,
    rituals,
    journalPrompts,
  };
}

/**
 * Generate key dates for the lunar month
 */
function generateKeyDates(returnDate: Date, chart: LunarReturnChart): KeyDate[] {
  const dates: KeyDate[] = [];

  // Add the return date itself
  dates.push({
    date: returnDate,
    type: 'aspect-exact',
    description: 'Lunar Return',
    significance: `Your lunar return in ${chart.moonPosition.sign} brings fresh energy to ${chart.theme.toLowerCase()}`,
  });

  // Find new moon and full moon in the lunar month
  const lunarMonth = 29.53; // days
  const newMoonDate = new Date(returnDate.getTime() + 29.53 * 0 * 24 * 60 * 60 * 1000);

  dates.push({
    date: newMoonDate,
    type: 'new-moon',
    description: 'New Moon',
    significance: 'Set intentions for the lunar month ahead',
  });

  const fullMoonDate = new Date(returnDate.getTime() + 14.77 * 24 * 60 * 60 * 1000);

  dates.push({
    date: fullMoonDate,
    type: 'full-moon',
    description: 'Full Moon',
    significance: 'Culmination point; celebrate achievements and release what no longer serves',
  });

  return dates;
}

/**
 * Generate monthly predictions by life area
 */
function generatePredictions(chart: LunarReturnChart): MonthlyPrediction[] {
  const predictions: MonthlyPrediction[] = [];

  // Predictions based on house placement
  const housePredictions: Record<number, MonthlyPrediction> = {
    1: {
      category: 'creativity',
      prediction: 'New creative projects and self-expression are favored this month',
      likelihood: 7,
      advice: ['Start a creative project', 'Express yourself authentically', 'Take calculated risks'],
    },
    2: {
      category: 'finances',
      prediction: 'Financial matters come into focus; review your budget and values',
      likelihood: 6,
      advice: ['Review expenses', 'Align spending with values', 'Consider investments'],
    },
    4: {
      category: 'health',
      prediction: 'Emotional and physical wellbeing require attention',
      likelihood: 7,
      advice: ['Prioritize self-care', 'Nurture yourself', 'Set emotional boundaries'],
    },
    5: {
      category: 'creativity',
      prediction: 'Romantic and creative energies are heightened',
      likelihood: 8,
      advice: ['Express love', 'Create art', 'Enjoy leisure activities'],
    },
    6: {
      category: 'career',
      prediction: 'Work routines require attention; efficiency is key',
      likelihood: 6,
      advice: ['Organize your workflow', 'Focus on priorities', 'Help colleagues'],
    },
    7: {
      category: 'relationships',
      prediction: 'Partnerships bring both challenges and rewards',
      likelihood: 7,
      advice: ['Communicate clearly', 'Find balance', 'Compromise when needed'],
    },
    8: {
      category: 'relationships',
      prediction: 'Deep emotional transformations are possible',
      likelihood: 8,
      advice: ['Face fears', 'Release old patterns', 'Trust the process'],
    },
    10: {
      category: 'career',
      prediction: 'Career advancement and public recognition opportunities',
      likelihood: 6,
      advice: ['Take initiative', 'Show your skills', 'Network strategically'],
    },
  };

  // Add prediction based on house placement
  const prediction = housePredictions[chart.housePlacement as keyof typeof housePredictions];
  if (prediction) {
    predictions.push(prediction);
  }

  // Add prediction based on moon phase
  if (chart.moonPhase === 'full') {
    predictions.push({
      category: 'spirituality',
      prediction: 'Emotions and insights reach their peak; celebrate your achievements',
      likelihood: 9,
      advice: ['Express gratitude', 'Share your wisdom', 'Honor your growth'],
    });
  }

  return predictions;
}

/**
 * Generate monthly rituals
 */
function generateRituals(returnDate: Date, chart: LunarReturnChart): MonthlyRitual[] {
  const rituals: MonthlyRitual[] = [];

  // New moon ritual
  rituals.push({
    phase: 'new-moon',
    title: 'Set Intentions',
    description: 'Create a sacred space to set your intentions for this lunar month',
    materials: ['Journal', 'Pen', 'Candle', 'Quiet space'],
    steps: [
      'Light a candle and create a quiet space',
      'Reflect on your goals for this month',
      'Write down 3-5 intentions',
      'Speak them aloud',
      'Blow out the candle',
      'Keep your intentions visible all month',
    ],
  });

  // Full moon ritual
  rituals.push({
    phase: 'full-moon',
    title: 'Celebrate and Release',
    description: 'Honor the culmination of the lunar month and release what no longer serves',
    materials: ['Journal', 'Fire-safe bowl', 'Matches/lighter', 'Quiet space'],
    steps: [
      'Create sacred space',
      'Review your intentions from the new moon',
      'Write down what to release',
      'Burn the paper safely',
      'Express gratitude for achievements',
      'Celebrate your growth',
    ],
  });

  return rituals;
}

/**
 * Generate journal prompts
 */
function generateJournalPrompts(chart: LunarReturnChart): string[] {
  const prompts: string[] = [];

  // House-based prompts
  const housePrompts: Record<number, string[]> = {
    1: [
    'How can I express my authentic self more fully this month?',
    'What new beginnings am I ready to embrace?',
    'How is my relationship with myself evolving?',
  ],
    2: [
    'What do I truly value and cherish?',
    'How can I better align my spending with my values?',
    'What material or emotional resources do I need to feel secure?',
  ],
    4: [
    'What emotional patterns am I noticing in myself?',
    'How can I nurture myself more deeply?',
    'What does "home" mean to me?',
  ],
    5: [
    'What creative expressions are calling to me?',
    'How can I bring more playfulness into my life?',
    'What romantic connection do I desire?',
  ],
    6: [
    'How can I improve my daily routines?',
    'What work habits no longer serve me?',
    'How can I be of service while maintaining my boundaries?',
  ],
    7: [
    'What relationships need my attention?',
    'How can I create more balance in my partnerships?',
    'What am I ready to receive from others?',
    'What am I ready to let go of?',
  ],
    8: [
    'What deep transformations am I ready for?',
    'What shared resources need attention?',
    'How can I embrace change rather than fear it?',
    'What fears am I ready to release?',
  ],
    9: [
    'What philosophical questions are arising?',
    'How can I expand my horizons this month?',
    'What new learning opportunities am I drawn to?',
  ],
    10: [
    'What career goals are calling to me?',
    'How can I step into my power more fully?',
    'What impression am I making on others?',
  ],
    11: [
    'How can I better connect with my community?',
    'What friendships need attention?',
    'What groups or organizations align with my values?',
  ],
    12: [
    'What spiritual insights am I receiving?',
    'What old patterns am I ready to release?',
    'How can I deepen my connection to the unconscious?',
    'What dreams or intuition should I pay attention to?',
  ],
  };

  const promptsForHouse = housePrompts[chart.housePlacement as keyof typeof housePrompts];
  if (promptsForHouse) {
    prompts.push(...promptsForHouse);
  }

  // Add moon phase prompts
  if (chart.moonPhase === 'new') {
    prompts.push('What seeds do I want to plant this lunar month?', 'What new beginnings am I ready for?');
  }

  if (chart.moonPhase === 'full') {
    prompts.push(
      'What have I accomplished since the last new moon?',
      'What am I ready to celebrate?',
      'What must I release to move forward?'
    );
  }

  return prompts;
}

/**
 * Get emotional theme for the lunar month
 */
function getEmotionalTheme(chart: LunarReturnChart): string {
  const themes: Record<string, string> = {
    'new-1': 'Initiating new projects with courage and authenticity',
    'new-4': 'Nurturing your emotional foundation and creating inner security',
    'full-5': 'Celebrating creative self-expression and romantic connections',
    'full-8': 'Deep emotional healing and transformational insights',
    // Add more combinations as needed
  };

  const key = `${chart.moonPhase}-${chart.housePlacement}`;
  return themes[key] || 'Emotional growth and self-awareness';
}

/**
 * Get action advice for the lunar month
 */
function getActionAdvice(chart: LunarReturnChart): string[] {
  const advice: string[] = [];

  // House-based advice
  const houseAdvice: Record<number, string[]> = {
    1: ['Be bold and initiate new projects', 'Express yourself authentically', 'Practice self-assertion'],
    2: ['Review your budget', 'Align spending with values', 'Secure your resources'],
    3: ['Communicate clearly', 'Learn something new', 'Connect with neighbors'],
    4: ['Nurture yourself', 'Create a peaceful home', 'Honor your feelings'],
    5: ['Express creativity', 'Enjoy leisure activities', 'Be romantic', 'Take risks'],
    6: ['Organize your workflow', 'Focus on efficiency', 'Help colleagues', 'Improve routines'],
    7: ['Communicate in partnerships', 'Find balance', 'Compromise when needed', 'Show appreciation'],
    8: ['Face your shadows', 'Embrace transformation', 'Share resources', 'Deepen intimacy'],
    9: ['Study philosophy', 'Plan travel', 'Expand your horizons', 'Seek wisdom'],
    10: ['Take initiative at work', 'Show your skills', 'Network strategically', 'Be visible'],
    11: ['Connect with friends', 'Join groups', 'Socialize', 'Network'],
    12: ['Meditate', 'Dream work', 'Spiritual practice', 'Rest and reflect'],
  };

  const adviceForHouse = houseAdvice[chart.housePlacement as keyof typeof houseAdvice];
  if (adviceForHouse) {
    advice.push(...adviceForHouse);
  }

  // Moon phase-based advice
  if (chart.moonPhase === 'new') {
    advice.push('Set clear intentions', 'Start new projects', 'Plant seeds for the future');
  }

  if (chart.moonPhase === 'full') {
    advice.push('Celebrate achievements', 'Release what no longer serves', 'Honor your growth');
  }

  return advice.slice(0, 5); // Return top 5
}

/**
 * Get current lunar return for a user
 */
export async function getCurrentLunarReturn(userId: string): Promise<{
  returnDate: Date;
  daysUntil: number;
}> {
  // In production, fetch from database
  // For now, return a calculated value

  // Get user's natal chart (mock)
  const natalMoon = {
    sign: 'leo',
    degree: 15,
    minute: 30,
    second: 0,
  };

  const nextReturn = calculateNextLunarReturn(natalMoon);
  const today = new Date();
  const daysUntil = Math.ceil((nextReturn.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return {
    returnDate: nextReturn,
    daysUntil,
  };
}

export default {
  calculateNextLunarReturn,
  calculateLunarReturnChart,
  generateLunarMonthForecast,
  getCurrentLunarReturn,
  generateKeyDates,
  generatePredictions,
  generateRituals,
  generateJournalPrompts,
};
