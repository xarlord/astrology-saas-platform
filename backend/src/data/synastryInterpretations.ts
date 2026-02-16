/**
 * Synastry Interpretations Database
 * Comprehensive interpretations for synastry and compatibility readings
 */

export interface PlanetPairInterpretation {
  planet1: string;
  planet2: string;
  aspect: string;
  interpretation: string;
  strength: 'harmonious' | 'challenging' | 'neutral';
  relationshipArea: string;
  advice: string[];
}

export interface HouseOverlayInterpretation {
  house: number;
  meaning: string;
  influence: string;
  challenges: string[];
  opportunities: string[];
}

export interface SynastryAspectTheme {
  aspect: string;
  generalMeaning: string;
  inRelationship: string;
  growthPotential: string;
}

// Planet-to-planet synastry interpretations
export const planetPairSynastry: PlanetPairInterpretation[] = [
  // Sun-Moon aspects
  {
    planet1: 'sun',
    planet2: 'moon',
    aspect: 'conjunction',
    interpretation: 'A powerful emotional and conscious connection. You instinctively understand each other\'s core needs and emotional nature.',
    strength: 'harmonious',
    relationshipArea: 'Emotional bonding and mutual understanding',
    advice: [
      'Honor this deep connection',
      'Support each other\'s emotional needs',
      'Use this understanding to navigate challenges together',
    ],
  },
  {
    planet1: 'sun',
    planet2: 'moon',
    aspect: 'opposition',
    interpretation: 'Tension between conscious desires and emotional needs creates opportunities for growth and integration.',
    strength: 'challenging',
    relationshipArea: 'Balancing self-expression with emotional needs',
    advice: [
      'Communicate openly about your needs',
      'Find balance between giving and receiving',
      'Use this tension to understand each other better',
    ],
  },
  {
    planet1: 'sun',
    planet2: 'moon',
    aspect: 'trine',
    interpretation: 'Natural harmony and flow between your conscious and emotional natures. You instinctively "get" each other.',
    strength: 'harmonious',
    relationshipArea: 'Emotional compatibility and mutual support',
    advice: [
      'Cherish this natural rapport',
      'Build on your easy understanding',
      'Express appreciation for this connection',
    ],
  },

  // Sun-Sun aspects
  {
    planet1: 'sun',
    planet2: 'sun',
    aspect: 'conjunction',
    interpretation: 'Strong identification with each other. You see yourselves reflected in one another, for better or worse.',
    strength: 'neutral',
    relationshipArea: 'Core identity and life direction',
    advice: [
      'Maintain your individuality within the relationship',
      'Support each other\'s goals without merging completely',
      'Use this connection to grow together',
    ],
  },
  {
    planet1: 'sun',
    planet2: 'sun',
    aspect: 'trine',
    interpretation: 'Easy compatibility in life goals and basic approaches. You naturally understand each other\'s way of being.',
    strength: 'harmonious',
    relationshipArea: 'Life direction and self-expression',
    advice: [
      'Enjoy the natural flow between you',
      'Pursue shared goals together',
      'Maintain appreciation for your similarities',
    ],
  },

  // Moon-Moon aspects
  {
    planet1: 'moon',
    planet2: 'moon',
    aspect: 'conjunction',
    interpretation: 'Deep emotional resonance. You feel each other\'s feelings and react similarly to emotional situations.',
    strength: 'harmonious',
    relationshipArea: 'Emotional bonding and domestic harmony',
    advice: [
      'Create a nurturing home together',
      'Honor this emotional connection',
      'Be aware of amplifying each other\'s moods',
    ],
  },
  {
    planet1: 'moon',
    planet2: 'moon',
    aspect: 'opposition',
    interpretation: 'Emotional differences that can be complementary or conflicting. Learning to understand different emotional needs.',
    strength: 'challenging',
    relationshipArea: 'Emotional understanding and family dynamics',
    advice: [
      'Learn from each other\'s emotional approaches',
      'Give space for different emotional expressions',
      'Find common ground in emotional needs',
    ],
  },

  // Venus-Mars aspects
  {
    planet1: 'venus',
    planet2: 'mars',
    aspect: 'conjunction',
    interpretation: 'Powerful romantic and sexual attraction. Your love nature and desire nature are aligned.',
    strength: 'harmonious',
    relationshipArea: 'Romance, passion, and sexual chemistry',
    advice: [
      'Channel this intense energy constructively',
      'Maintain balance between giving and receiving',
      'Express affection and desire openly',
    ],
  },
  {
    planet1: 'venus',
    planet2: 'mars',
    aspect: 'opposition',
    interpretation: 'Strong attraction but potential conflict between how you give love and how you want to receive it.',
    strength: 'challenging',
    relationshipArea: 'Romantic dynamics and sexual expression',
    advice: [
      'Communicate about love languages openly',
      'Balance romance with independence',
      'Navigate passion differences with understanding',
    ],
  },
  {
    planet1: 'venus',
    planet2: 'mars',
    aspect: 'trine',
    interpretation: 'Easy flow of romantic and sexual energy. Natural affinity in expressing love and desire.',
    strength: 'harmonious',
    relationshipArea: 'Romance, creativity, and shared pleasures',
    advice: [
      'Enjoy the natural chemistry',
      'Express love and affection freely',
      'Create beautiful experiences together',
    ],
  },

  // Venus-Venus aspects
  {
    planet1: 'venus',
    planet2: 'venus',
    aspect: 'conjunction',
    interpretation: 'Shared values and aesthetic preferences. You appreciate similar things in life and love.',
    strength: 'harmonious',
    relationshipArea: 'Shared values, aesthetics, and pleasures',
    advice: [
      'Enjoy shared interests and activities',
      'Create beauty together',
      'Appreciate your aligned values',
    ],
  },
  {
    planet1: 'venus',
    planet2: 'venus',
    aspect: 'trine',
    interpretation: 'Harmonious expression of love and affection. Similar ways of showing and receiving love.',
    strength: 'harmonious',
    relationshipArea: 'Affection, social activities, and enjoyment',
    advice: [
      'Express love in ways you both appreciate',
      'Socialize and enjoy pleasures together',
      'Create a loving atmosphere',
    ],
  },

  // Mercury-Mercury aspects
  {
    planet1: 'mercury',
    planet2: 'mercury',
    aspect: 'conjunction',
    interpretation: 'Similar thought processes and communication styles. You "speak the same language" mentally.',
    strength: 'harmonious',
    relationshipArea: 'Communication and intellectual connection',
    advice: [
      'Enjoy easy communication',
      'Collaborate on intellectual projects',
      'Share ideas freely',
    ],
  },
  {
    planet1: 'mercury',
    planet2: 'mercury',
    aspect: 'trine',
    interpretation: 'Natural mental rapport. Easy flow of ideas and conversation.',
    strength: 'harmonious',
    relationshipArea: 'Learning, discussion, and mutual interests',
    advice: [
      'Explore shared interests together',
      'Engage in stimulating conversations',
      'Learn from each other\'s perspectives',
    ],
  },

  // Mars-Mars aspects
  {
    planet1: 'mars',
    planet2: 'mars',
    aspect: 'conjunction',
    interpretation: 'Similar energy levels and drive. You understand each other\'s actions and motivations.',
    strength: 'neutral',
    relationshipArea: 'Shared activities, goals, and energy',
    advice: [
      'Channel combined energy constructively',
      'Avoid competitive dynamics',
      'Support each other\'s initiatives',
    ],
  },
  {
    planet1: 'mars',
    planet2: 'mars',
    aspect: 'square',
    interpretation: 'Different ways of taking action can cause friction. Learning to work with different energies.',
    strength: 'challenging',
    relationshipArea: 'Action, initiative, and conflict resolution',
    advice: [
      'Find common ground in goals',
      'Respect different approaches',
      'Time actions carefully to avoid conflict',
    ],
  },

  // Jupiter-Jupiter aspects
  {
    planet1: 'jupiter',
    planet2: 'jupiter',
    aspect: 'trine',
    interpretation: 'Shared philosophy and optimism. You expand each other\'s horizons and beliefs.',
    strength: 'harmonious',
    relationshipArea: 'Growth, exploration, and shared wisdom',
    advice: [
      'Pursue growth together',
      'Explore philosophical questions',
      'Share your optimism and abundance',
    ],
  },

  // Saturn-Saturn aspects
  {
    planet1: 'saturn',
    planet2: 'saturn',
    aspect: 'conjunction',
    interpretation: 'Shared sense of responsibility and commitment. Serious and potentially long-lasting bond.',
    strength: 'neutral',
    relationshipArea: 'Commitment, responsibility, and structure',
    advice: [
      'Build solid foundations together',
      'Support each other\'s ambitions',
      'Avoid being too rigid or serious',
    ],
  },
  {
    planet1: 'saturn',
    planet2: 'saturn',
    aspect: 'square',
    interpretation: 'Different approaches to responsibility and commitment can create tension.',
    strength: 'challenging',
    relationshipArea: 'Commitment, boundaries, and life lessons',
    advice: [
      'Find middle ground on structure',
      'Learn from each other\'s lessons',
      'Build trust through shared experiences',
    ],
  },
];

// House overlay interpretations
export const houseOverlaySynastry: Record<number, HouseOverlayInterpretation> = {
  1: {
    house: 1,
    meaning: 'When your planets fall in their 1st house, you strongly influence their self-image and identity.',
    influence: 'You help them see themselves in new ways. Your presence is significant to their self-expression.',
    challenges: [
      'Potential for one person to dominate the other\'s identity',
      'Risk of merging too much',
      'Difficulty maintaining individuality',
    ],
    opportunities: [
      'Help each other grow and evolve',
      'Strengthen each other\'s self-confidence',
      'Discover new aspects of yourselves together',
    ],
  },
  2: {
    house: 2,
    meaning: 'When your planets fall in their 2nd house, you influence their values, finances, and sense of self-worth.',
    influence: 'You affect how they approach material security and what they value in life.',
    challenges: [
      'Different attitudes toward money can cause friction',
      'Conflicting values about possessions',
      'Self-worth triggers',
    ],
    opportunities: [
      'Help each other build financial security',
      'Align values around what matters most',
      'Teach each other about self-worth',
    ],
  },
  3: {
    house: 3,
    meaning: 'When your planets fall in their 3rd house, you influence their communication style and mental processes.',
    influence: 'You affect how they think, learn, and express themselves.',
    challenges: [
      'Communication style differences',
      'Intellectual competition',
      'Different approaches to learning',
    ],
    opportunities: [
      'Learn from each other constantly',
      'Stimulate each other\'s minds',
      'Improve communication together',
    ],
  },
  4: {
    house: 4,
    meaning: 'When your planets fall in their 4th house, you deeply influence their emotional nature and home life.',
    influence: 'You affect their sense of security, family dynamics, and private self.',
    challenges: [
      'Emotional triggers in home/family areas',
      'Issues around nurturing and being nurtured',
      'Privacy and boundary concerns',
    ],
    opportunities: [
      'Create emotional security together',
      'Heal family patterns',
      'Build a nurturing home life',
    ],
  },
  5: {
    house: 5,
    meaning: 'When your planets fall in their 5th house, you influence their creativity, romance, and self-expression.',
    influence: 'You bring out their playful, creative side and affect their romantic expression.',
    challenges: [
      'Creative differences or competition',
      'Romantic tension',
      'Different approaches to fun and leisure',
    ],
    opportunities: [
      'Inspire each other\'s creativity',
      'Enjoy romantic and playful connection',
      'Express yourselves authentically together',
    ],
  },
  6: {
    house: 6,
    meaning: 'When your planets fall in their 6th house, you influence their work, health, and daily routines.',
    influence: 'You affect how they approach service, health, and daily habits.',
    challenges: [
      'Different work ethics or habits',
      'Health and lifestyle differences',
      'Criticism or perfectionism',
    ],
    opportunities: [
      'Improve daily routines together',
      'Support each other\'s health goals',
      'Serve others as a team',
    ],
  },
  7: {
    house: 7,
    meaning: 'When your planets fall in their 7th house, you significantly influence their relationships and partnerships.',
    influence: 'You are important to how they relate to others and approach commitment.',
    challenges: [
      'Dependency issues',
      'Relationship boundaries',
      'Balancing partnership with autonomy',
    ],
    opportunities: [
      'Learn about relationships through each other',
      'Grow through partnership',
      'Achieve balance together',
    ],
  },
  8: {
    house: 8,
    meaning: 'When your planets fall in their 8th house, you have a deep, transformative influence on them.',
    influence: 'You affect their relationship with intimacy, shared resources, and transformation.',
    challenges: [
      'Power dynamics and control issues',
      'Intimacy fears and vulnerabilities',
      'Shared resource conflicts',
    ],
    opportunities: [
      'Deep emotional transformation',
      'Heal old wounds together',
      'Build profound trust',
    ],
  },
  9: {
    house: 9,
    meaning: 'When your planets fall in their 9th house, you influence their beliefs, philosophy, and life direction.',
    influence: 'You affect their worldview, spiritual path, and approach to expansion.',
    challenges: [
      'Different beliefs or philosophies',
      'Religious or spiritual differences',
      'Conflicting travel or educational goals',
    ],
    opportunities: [
      'Expand each other\'s horizons',
      'Explore beliefs together',
      'Grow philosophically',
    ],
  },
  10: {
    house: 10,
    meaning: 'When your planets fall in their 10th house, you influence their career, public image, and ambitions.',
    influence: 'You affect their professional life and how they\'re seen in the world.',
    challenges: [
      'Career competition or conflict',
      'Different ambitions or priorities',
      'Public image concerns',
    ],
    opportunities: [
      'Support each other\'s career goals',
      'Build professional success together',
      'Achieve recognition as a couple',
    ],
  },
  11: {
    house: 11,
    meaning: 'When your planets fall in their 11th house, you influence their friendships, goals, and community connections.',
    influence: 'You affect their social circle and hopes for the future.',
    challenges: [
      'Friendship dynamics',
      'Different social needs',
      'Conflicting goals or dreams',
    ],
    opportunities: [
      'Build a shared social network',
      'Support each other\'s dreams',
      'Create community together',
    ],
  },
  12: {
    house: 12,
    meaning: 'When your planets fall in their 12th house, you have a spiritual, unconscious influence on them.',
    influence: 'You affect their inner world, spirituality, and relationship with the unconscious.',
    challenges: [
      'Unconscious triggers',
      'Spiritual or psychological differences',
      'Issues around solitude and privacy',
    ],
    opportunities: [
      'Deep spiritual growth together',
      'Explore the unconscious',
      'Support each other\'s inner development',
    ],
  },
};

// Aspect themes
export const synastryAspectThemes: Record<string, SynastryAspectTheme> = {
  conjunction: {
    generalMeaning: 'Merging and fusion of energies',
    inRelationship: 'The two planets function as a unit, blending their energies completely.',
    growthPotential: 'Learn to use this combined energy constructively while maintaining individuality.',
  },
  opposition: {
    generalMeaning: 'Polarity and tension between complementary forces',
    inRelationship: 'The planets pull in opposite directions, creating awareness and potential conflict.',
    growthPotential: 'Integrate opposing qualities to find balance and wholeness.',
  },
  trine: {
    generalMeaning: 'Harmonious flow and easy expression',
    inRelationship: 'The planets work together naturally, creating ease and flow.',
    growthPotential: 'Appreciate and build upon natural harmony without becoming complacent.',
  },
  square: {
    generalMeaning: 'Dynamic tension and challenge',
    inRelationship: 'The planets create friction that requires conscious navigation.',
    growthPotential: 'Transform tension into growth through awareness and effort.',
  },
  sextile: {
    generalMeaning: 'Opportunities and creative expression',
    inRelationship: 'The planets offer chances for growth and cooperation.',
    growthPotential: 'Take advantage of opportunities while putting in necessary effort.',
  },
  quincunx: {
    generalMeaning: 'Adjustment and integration of different approaches',
    inRelationship: 'The planets require adaptation and understanding of differences.',
    growthPotential: 'Learn to appreciate differences and find creative ways to integrate them.',
  },
  'semi-sextile': {
    generalMeaning: 'Gentle influence and subtle connection',
    inRelationship: 'A mild, generally supportive connection that requires attention to activate.',
    growthPotential: 'Cultivate this connection through conscious effort and appreciation.',
  },
};

// Compatibility advice by elemental balance
export const elementalCompatibilityAdvice: Record<string, string[]> = {
  'fire-fire': [
    'Both passionate and energetic - channel this into shared activities',
    'Watch for ego conflicts and competition',
    'Balance excitement with patience',
  ],
  'earth-earth': [
    'Shared practical approach and values',
    'Support each other\'s material goals',
    'Avoid becoming too stuck in routines',
  ],
  'air-air': [
    'Excellent communication and mental connection',
    'Share ideas and intellectual pursuits',
    'Remember to connect emotionally, not just mentally',
  ],
  'water-water': [
    'Deep emotional understanding',
    'Create nurturing and supportive environment',
    'Avoid emotional codependency or overwhelm',
  ],
  'fire-earth': [
    'Fire inspires, Earth grounds - complementary',
    'Learn from each other\'s different approaches',
    'Balance spontaneity with planning',
  ],
  'fire-air': [
    'High energy and social connection',
    'Enjoy activities and conversations together',
    'Ground yourselves when needed',
  ],
  'fire-water': [
    'Challenging but potentially transformative',
    'Passion meets depth - powerful combination',
    'Respect fundamental differences in approach',
  ],
  'earth-air': [
    'Practical minds working together',
    'Combine planning with communication',
    'Balance work with discussion',
  ],
  'earth-water': [
    'Nurturing and supportive combination',
    'Build security and comfort together',
    'Avoid becoming too reserved or stuck',
  ],
  'air-water': [
    'Mental meets emotional - can be complementary',
    'Learn to communicate feelings',
    'Balance thought with emotion',
  ],
};

export default {
  planetPairSynastry,
  houseOverlaySynastry,
  synastryAspectThemes,
  elementalCompatibilityAdvice,
};
