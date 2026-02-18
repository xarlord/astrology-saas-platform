/**
 * Interpretations Database (Mock)
 * Provides astrological interpretations for testing
 */

// ============================================================================
// PLANET IN SIGN INTERPRETATIONS
// ============================================================================

export function getPlanetInSignInterpretation(planet: string, sign: string): string {
  const interpretations: Record<string, Record<string, string>> = {
    sun: {
      aries: 'You are a natural leader with boundless energy and enthusiasm.',
      taurus: 'You value stability and comfort, with a practical approach to life.',
      gemini: 'You are curious and adaptable, with a quick wit and love of communication.',
      cancer: 'You are deeply emotional and nurturing, with strong family ties.',
      leo: 'You are confident and charismatic, with a natural flair for drama.',
      virgo: 'You are analytical and detail-oriented, with a desire to help others.',
      libra: 'You value harmony and relationships, with a strong sense of justice.',
      scorpio: 'You are intense and transformative, with deep emotional insight.',
      sagittarius: 'You are optimistic and adventurous, with a love of learning.',
      capricorn: 'You are disciplined and ambitious, with a strong sense of responsibility.',
      aquarius: 'You are independent and original, with a humanitarian outlook.',
      pisces: 'You are compassionate and artistic, with a deep spiritual connection.',
    },
    moon: {
      aries: 'You react emotionally with passion and spontaneity.',
      taurus: 'You seek emotional security and comfort.',
      gemini: 'You process emotions through communication and intellectual analysis.',
      cancer: 'You are deeply nurturing and emotionally connected to home.',
      leo: 'You express emotions dramatically and need appreciation.',
      virgo: 'You analyze your emotions and seek to improve them.',
      libra: 'You need emotional harmony and companionship.',
      scorpio: 'You feel emotions intensely and seek deep connections.',
      sagittarius: 'You need emotional freedom and philosophical understanding.',
      capricorn: 'You control your emotions and seek emotional maturity.',
      aquarius: 'You process emotions intellectually and value independence.',
      pisces: 'You are deeply empathetic and emotionally intuitive.',
    },
    mercury: {
      aries: 'You think quickly and communicate directly.',
      taurus: 'You think practically and communicate reliably.',
      gemini: 'You are mentally quick and love to learn.',
      cancer: 'You think intuitively and communicate with feeling.',
      leo: 'You express yourself confidently and dramatically.',
      virgo: 'You analyze details and communicate precisely.',
      libra: 'You think diplomatically and seek balance.',
      scorpio: 'You think deeply and investigate thoroughly.',
      sagittarius: 'You think philosophically and communicate optimistically.',
      capricorn: 'You think practically and plan carefully.',
      aquarius: 'You think originally and communicate innovatively.',
      pisces: 'You think intuitively and communicate poetically.',
    },
    venus: {
      aries: 'You love passionately and pursue your desires boldly.',
      taurus: 'You value loyalty and physical affection.',
      gemini: 'You enjoy variety and intellectual stimulation in love.',
      cancer: 'You love nurturingly and seek emotional security.',
      leo: 'You love generously and need admiration.',
      virgo: 'You show love through service and attention to detail.',
      libra: 'You seek harmony and romantic partnership.',
      scorpio: 'You love intensely and seek deep emotional bonds.',
      sagittarius: 'You love adventurously and seek freedom.',
      capricorn: 'You love responsibly and value commitment.',
      aquarius: 'You love independently and seek uniqueness.',
      pisces: 'You love unconditionally and romantically.',
    },
    mars: {
      aries: 'You act boldly and assert yourself directly.',
      taurus: 'You act steadily and persist through obstacles.',
      gemini: 'You act variably and adapt to changing circumstances.',
      cancer: 'You act protectively and defend your loved ones.',
      leo: 'You act confidently and seek recognition.',
      virgo: 'You act precisely and strive for perfection.',
      libra: 'You act diplomatically and seek cooperation.',
      scorpio: 'You act intensely and pursue transformation.',
      sagittarius: 'You act enthusiastically and seek adventure.',
      capricorn: 'You act strategically and work toward goals.',
      aquarius: 'You act independently and seek innovation.',
      pisces: 'You act intuitively and follow your inspiration.',
    },
  };

  return interpretations[planet]?.[sign] || `${planet.charAt(0).toUpperCase() + planet.slice(1)} in ${sign.charAt(0).toUpperCase() + sign.slice(1)}`;
}

// ============================================================================
// ASPECT INTERPRETATIONS
// ============================================================================

export function getAspectInterpretation(aspect: any): string {
  const { type, planet1, planet2 } = aspect;

  const aspectMeanings: Record<string, string> = {
    conjunction: 'combines energies',
    opposition: 'creates tension between',
    trine: 'harmoniously connects',
    square: 'challenges',
    sextile: 'opportunistically links',
    quincunx: 'adjusts',
    semiSextile: 'subtly connects',
  };

  const meaning = aspectMeanings[type] || 'connects';

  return `The ${meaning} ${planet1} and ${planet2}, creating dynamic interaction in your chart.`;
}

// ============================================================================
// HOUSE INTERPRETATIONS
// ============================================================================

export function getHouseInterpretation(houseNumber: number, sign: string): string {
  const houseMeanings: Record<number, string> = {
    1: 'self-identity and personal expression',
    2: 'values, possessions, and self-worth',
    3: 'communication and immediate environment',
    4: 'home, family, and roots',
    5: 'creativity, romance, and self-expression',
    6: 'work, service, and daily routines',
    7: 'partnerships and close relationships',
    8: 'transformation, shared resources, and intimacy',
    9: 'higher learning, travel, and philosophy',
    10: 'career, public image, and achievements',
    11: 'friendships, groups, and aspirations',
    12: 'spirituality, hidden matters, and subconscious',
  };

  return `${sign.charAt(0).toUpperCase() + sign.slice(1)} rules your ${houseNumber}th house of ${houseMeanings[houseNumber] || 'life affairs'}.`;
}

// ============================================================================
// TRANSIT INTERPRETATIONS
// ============================================================================

export function getTransitInterpretation(transit: any): string {
  const { planet1, planet2, type } = transit;

  return `Transiting ${planet1} ${type} your natal ${planet2}. This energy influences your current experiences and personal growth.`;
}

// ============================================================================
// PERSONALITY ANALYSIS GENERATION
// ============================================================================

export function generatePersonalityAnalysis(data: {
  planets: any[];
  houses: any[];
  aspects: any[];
}): {
  overview: any;
  strengths: string[];
  challenges: string[];
  advice: string[];
} {
  const { planets, houses, aspects } = data;

  const sun = planets.find((p: any) => p.name === 'sun');
  const moon = planets.find((p: any) => p.name === 'moon');
  const ascendant = houses[0]?.cusp || 0;

  return {
    overview: {
      sunSign: sun?.sign || 'aries',
      moonSign: moon?.sign || 'aries',
      ascendant: getZodiacSign(ascendant),
      elementBalance: {
        fire: 3,
        earth: 2,
        air: 3,
        water: 2,
      },
    },
    strengths: [
      'Strong sense of self',
      'Emotional awareness',
      'Intellectual curiosity',
      'Adaptability',
    ],
    challenges: [
      'Impatience',
      'Stubbornness',
      'Overthinking',
      'Sensitivity',
    ],
    advice: [
      'Embrace your unique strengths',
      'Work on areas that challenge you',
      'Find balance in all aspects of life',
      'Trust your intuition',
    ],
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getZodiacSign(longitude: number): string {
  const signs = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
  const index = Math.floor(longitude / 30) % 12;
  return signs[index];
}

// ============================================================================
// EXPORT ALL FUNCTIONS
// ============================================================================

export default {
  getPlanetInSignInterpretation,
  getAspectInterpretation,
  getHouseInterpretation,
  getTransitInterpretation,
  generatePersonalityAnalysis,
};
