import type { TransitCategory, TransitExample } from './types';

export const transitIntro = `Transits describe how current planetary movements interact with a birth chart. They do not force events mechanically. They describe timing, pressure, activation, opportunity, awareness, and developmental cycles.

Every day, the planets continue moving through the sky. As they move, they form aspects (angles) to the positions of the planets in your birth chart. These interactions — called transits — describe the themes, challenges, and opportunities you will encounter during specific periods of your life.

Think of transits as weather. They don't determine what you do, but they describe the conditions you're operating under. A Saturn transit is like winter — it's cold and demanding, but it's also when the roots grow deepest.`;

export const transitCategories: TransitCategory[] = [
  {
    id: 'fast-transits',
    name: 'Fast Transits',
    planets: ['Moon', 'Mercury', 'Venus', 'Mars'],
    description: 'Fast-moving planets create brief, frequent influences. They color moods, conversations, daily events, and short-term energy shifts. They don\'t usually create major life changes, but they describe the texture of your day-to-day experience.',
    speed: 'fast',
  },
  {
    id: 'social-transits',
    name: 'Social Transits',
    planets: ['Jupiter', 'Saturn'],
    description: 'Jupiter and Saturn move slowly enough to create significant periods of growth, challenge, and development. Jupiter transits (about 1 year per sign) bring expansion and opportunity. Saturn transits (about 2.5 years per sign) bring structure, responsibility, and reality checks.',
    speed: 'social',
  },
  {
    id: 'outer-transits',
    name: 'Outer Planet Transits',
    planets: ['Uranus', 'Neptune', 'Pluto'],
    description: 'The outer planets create generational shifts and deeply transformative periods. Uranus transits (about 7 years per sign) bring revolution and awakening. Neptune transits (about 14 years per sign) bring spiritual or creative evolution. Pluto transits (15-30 years per sign) bring death and rebirth of entire life structures.',
    speed: 'outer',
  },
];

export const transitFormula = {
  label: 'Transit Interpretation Formula',
  formula: 'Transiting Planet + Natal Planet or House + Aspect = Timing Theme',
  description: 'To interpret any transit, identify: (1) Which planet is transiting, (2) What natal planet or house cusp it is touching, and (3) What aspect it is forming. The combination gives you the specific timing theme.',
};

export const transitExamples: TransitExample[] = [
  {
    id: 'saturn-square-sun',
    title: 'Transiting Saturn square natal Sun',
    meaning: 'This may be a period of pressure, responsibility, self-definition, career seriousness, fatigue, or maturity. The person may feel tested, but the purpose is to strengthen identity and clarify what is worth committing to. This is one of the most significant transits — it occurs roughly every 7 years and marks a "reality check" moment.',
    difficulty: 'intermediate',
  },
  {
    id: 'jupiter-conjunct-venus',
    title: 'Transiting Jupiter conjunct natal Venus',
    meaning: 'A period of expansion in love, relationships, finances, and pleasure. New relationships may begin, financial opportunities may appear, and the person generally feels more optimistic and attractive. This is one of the most beneficial transits — enjoy it, but don\'t overdo the indulgence.',
    difficulty: 'beginner',
  },
  {
    id: 'uranus-opposite-moon',
    title: 'Transiting Uranus opposite natal Moon',
    meaning: 'Emotional revolution. The person may experience sudden changes in home life, family dynamics, or emotional patterns. Old emotional habits are disrupted to make way for greater emotional authenticity. This can feel destabilizing but ultimately liberating.',
    difficulty: 'advanced',
  },
  {
    id: 'pluto-conjunct-midheaven',
    title: 'Transiting Pluto conjunct natal Midheaven',
    meaning: 'Complete transformation of career, public role, and life direction. This is one of the most powerful transits — it can bring a total career reinvention, a rise to power, or the collapse of a professional identity that no longer serves. The outcome is always more authentic and empowered.',
    difficulty: 'advanced',
  },
  {
    id: 'neptune-square-ascendant',
    title: 'Transiting Neptune square natal Ascendant',
    meaning: 'Identity confusion, boundary dissolution, or spiritual awakening in relationships. The person may not know who they are or what they want. This transit asks for spiritual discernment — separating truth from illusion in how they present themselves and relate to others.',
    difficulty: 'advanced',
  },
  {
    id: 'jupiter-trine-sun',
    title: 'Transiting Jupiter trine natal Sun',
    meaning: 'A period of ease, opportunity, and good fortune. Things flow naturally, confidence is high, and doors open. This is an excellent time for launching projects, expanding horizons, or pursuing growth. The only risk is taking the ease for granted.',
    difficulty: 'beginner',
  },
  {
    id: 'saturn-return',
    title: 'Saturn Return (age 28-30)',
    meaning: 'When transiting Saturn returns to its natal position (roughly age 28-30), it marks a major life milestone. The person is asked to grow up fully — to commit to a path, take responsibility, and leave behind childish patterns. It can feel like a crisis, but it creates the foundation for the next 29 years of life.',
    difficulty: 'intermediate',
  },
  {
    id: 'mars-transit-7th',
    title: 'Transiting Mars through the 7th house',
    meaning: 'Energy, passion, and potential conflict in relationships. The person may feel more assertive in partnerships — which can be productive (addressing issues directly) or destructive (unnecessary arguments). This is a time for honest communication and healthy boundary-setting.',
    difficulty: 'beginner',
  },
];
