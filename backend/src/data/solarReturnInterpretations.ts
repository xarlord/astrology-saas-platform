/**
 * Solar Return Interpretations
 * Comprehensive interpretations for solar return charts
 */

import { SolarReturnInterpretation } from '../modules/solar/models/types';

/**
 * Sun in Houses Interpretations (1-12)
 */
const SUN_IN_HOUSES: Record<number, {
  interpretation: string;
  focus: string[];
  themes: string[];
}> = {
  1: {
    interpretation: "This year marks a powerful new beginning in your life. With the Sun in your solar return 1st house, the focus is on you—your identity, your personal goals, and how you present yourself to the world. This is your birthday month amplified, a time to set intentions that will unfold over the next twelve months. You have greater personal agency and the opportunity to reinvent yourself.",
    focus: ["Self-discovery", "Personal identity", "New beginnings", "Independence", "Self-expression"],
    themes: ["Personal empowerment", "Initiating new projects", "Physical vitality", "Self-confidence", "Leadership"],
  },
  2: {
    interpretation: "The Sun illuminates your 2nd house of values, possessions, and self-worth this year. Your focus shifts to building security, both financial and emotional. This is an excellent time to assess your relationship with money, possessions, and what truly matters to you. Investments made now tend to show good returns, and your earning potential may increase.",
    focus: ["Finances", "Material security", "Self-worth", "Values", "Possessions"],
    themes: ["Financial growth", "Building wealth", "Assessing priorities", "Resource management", "Self-value"],
  },
  3: {
    interpretation: "Communication and learning take center stage with the Sun in your 3rd house. Your curiosity is heightened, and you'll find yourself seeking knowledge, connecting with others, and sharing ideas. This is an excellent year for writing, teaching, learning new skills, and strengthening bonds with siblings and neighbors. Your words carry more power and influence.",
    focus: ["Communication", "Learning", "Siblings", "Local community", "Mental activity"],
    themes: ["Intellectual growth", "Information exchange", "Teaching and learning", "Short trips", "Networking"],
  },
  4: {
    interpretation: "The Sun in your 4th house brings focus to home, family, and your emotional foundations. This is a year of nesting, healing family dynamics, and creating a sense of belonging. You may make changes to your living situation, strengthen family bonds, or engage in deep emotional work. Your private life becomes more important than your public persona.",
    focus: ["Home", "Family", "Roots", "Emotional security", "Private life"],
    themes: ["Domestic harmony", "Property matters", "Family relationships", "Inner work", "Ancestral healing"],
  },
  5: {
    interpretation: "Creativity and romance blossom with the Sun in your 5th house. This is one of the most enjoyable solar return positions, bringing opportunities for love, creative expression, and playful self-expression. Children may become more prominent in your life, or you may reconnect with your own inner child. Your creative and romantic potential is at its peak.",
    focus: ["Creativity", "Romance", "Self-expression", "Children", "Pleasure"],
    themes: ["Artistic pursuits", "Love affairs", "Playfulness", "Speculative ventures", "Joy and recreation"],
  },
  6: {
    interpretation: "The Sun illuminates your 6th house of work, health, and daily routines. This is a year of productivity, service, and self-improvement. You may take on more responsibilities at work, focus on getting organized, or commit to a healthier lifestyle. Your daily habits become more important, and small improvements can lead to significant results.",
    focus: ["Work", "Health", "Service", "Daily routines", "Self-improvement"],
    themes: ["Job performance", "Wellness practices", "Efficiency", "Helping others", "Skill development"],
  },
  7: {
    interpretation: "Partnerships take center stage with the Sun in your 7th house. This year emphasizes relationships of all kinds—romantic, business, and social. You may encounter significant people who impact your life, or existing relationships may deepen and evolve. Balance between self and other becomes a key theme, and cooperation brings success.",
    focus: ["Partnerships", "Relationships", "Marriage", "Cooperation", "Public image"],
    themes: ["Marriage and commitment", "Business alliances", "Social connections", "Diplomacy", "Relationship growth"],
  },
  8: {
    interpretation: "The Sun in your 8th house signals a year of deep transformation and regeneration. This is an intense but potentially powerful period for psychological growth, shared resources, and intimate bonds. You may face endings that lead to new beginnings, particularly in areas of joint finances, sexuality, or emotional attachments. Transformation leads to empowerment.",
    focus: ["Transformation", "Shared resources", "Intimacy", "Psychology", "Investments"],
    themes: ["Personal metamorphosis", "Joint finances", "Emotional depth", "Occult studies", "Crisis and renewal"],
  },
  9: {
    interpretation: "The Sun illuminates your 9th house of philosophy, travel, and higher learning. This year expands your horizons through education, exploration, and spiritual growth. You may travel to distant places, engage in formal study, or develop your personal philosophy and beliefs. Your perspective broadens, and you seek meaning beyond the ordinary.",
    focus: ["Philosophy", "Travel", "Education", "Spirituality", "Expansion"],
    themes: ["Foreign cultures", "Higher education", "Religious or spiritual pursuits", "Publishing", "Adventure"],
  },
  10: {
    interpretation: "Career and public recognition become the focus with the Sun in your 10th house. This is often a year of significant professional achievement and advancement. Your ambitions are highlighted, and you may receive recognition for your accomplishments. Authority figures play important roles, and your public reputation may grow significantly.",
    focus: ["Career", "Ambition", "Public image", "Achievement", "Authority"],
    themes: ["Professional success", "Status and recognition", "Career changes", "Leadership", "Public responsibility"],
  },
  11: {
    interpretation: "The Sun in your 11th house emphasizes friendships, groups, and your hopes and dreams for the future. This is a social year where networks and community involvement bring opportunities. You may join organizations, participate in group activities, or work toward long-term goals. Your aspirations come into clearer focus, and others help you achieve them.",
    focus: ["Friendships", "Groups", "Aspirations", "Community", "Technology"],
    themes: ["Social networks", "Humanitarian causes", "Future planning", "Teamwork", "Innovation"],
  },
  12: {
    interpretation: "The Sun in your 12th house marks a more inward-facing year of spiritual growth, healing, and completion. This is a time for reflection, solitude, and working behind the scenes. You may conclude important cycles, address subconscious patterns, or engage in charitable activities. Though less visible externally, profound inner work occurs.",
    focus: ["Spirituality", "Subconscious", "Privacy", "Completions", "Healing"],
    themes: ["Solitude and retreat", "Psychological healing", "Charitable work", "Dream work", "Hidden enemies or allies"],
  },
};

/**
 * Planetary Interpretations for Solar Returns
 */
const PLANET_IN_HOUSE: Record<string, Record<number, string>> = {
  moon: {
    1: "Your emotional needs and inner world take precedence. Focus on self-nurturing and emotional independence.",
    2: "Financial security impacts your emotional well-being. Material comfort provides emotional stability.",
    3: "Feelings are expressed through communication. You're more emotionally connected to siblings and neighbors.",
    4: "Home and family become your emotional foundation. Domestic harmony affects your mood significantly.",
    5: "Emotional fulfillment comes through creative expression and romance. Children or romantic partners evoke strong feelings.",
    6: "Your emotional state affects your work and health. Self-care through daily routines is essential.",
    7: "Emotional needs are met through partnerships. Relationships reflect your inner emotional state.",
    8: "Deep emotional transformation occurs. Intense feelings and psychic sensitivity are heightened.",
    9: "Emotional growth comes through exploration of philosophy and spirituality. Your feelings expand beyond the mundane.",
    10: "Your emotional needs are expressed publicly. Career matters have strong emotional impact.",
    11: "Friendships and groups fulfill emotional needs. You're emotionally invested in community and social causes.",
    12: "A year of emotional introspection and healing. Subconscious patterns come to the surface for resolution.",
  },
  mercury: {
    1: "Your thinking is self-focused. You're more analytical about yourself and your identity.",
    2: "Mental energy is directed toward finances and values. Communication skills can enhance earning power.",
    3: "Extremely strong mental activity. Learning, teaching, and communication are highlighted.",
    4: "Your thinking is focused on home and family. Mental work happens primarily in your private space.",
    5: "Creative thinking and romantic communication are highlighted. Words express your playful side.",
    6: "Work-related communication is emphasized. Your mind is detail-oriented and service-focused.",
    7: "Thinking about partnerships and relationships. Important conversations with significant others.",
    8: "Deep, psychological thinking. Research and investigation bring mental satisfaction.",
    9: "Your mind expands to include philosophy, religion, and higher education. Learning is emphasized.",
    10: "Career matters dominate your thinking. Professional communication is especially important.",
    11: "Networking and group activities stimulate your mind. Social ideas and technological interests grow.",
    12: "Your thinking turns inward. Intuition and subconscious communication are strong.",
  },
  venus: {
    1: "You're more attractive and charming this year. Self-love and personal beauty are enhanced.",
    2: "Financial luck in love and possessions. Your earning power through charm and diplomacy increases.",
    3: "Harmonious communication characterizes your year. Relationships with siblings improve.",
    4: "Your home becomes more beautiful and harmonious. Domestic relationships are loving.",
    5: "One of the best positions for romance and creative fulfillment. Love affairs are likely.",
    6: "Pleasant work environment and cooperative coworkers. Health through pleasure and balance.",
    7: "Partnerships are especially harmonious. Marriage and close relationships bring joy.",
    8: "Deep emotional and financial bonds. Love enters your life intensely and transforms you.",
    9: "Love of travel, philosophy, and spiritual pursuits. Romance may come from afar.",
    10: "Career benefits from charm and diplomacy. You may have a pleasant public reputation.",
    11: "Friendships bring pleasure. Social activities and group involvement are enjoyable.",
    12: "Secret love affairs or spiritual love. You may need time alone for emotional restoration.",
  },
  mars: {
    1: "High energy and initiative. You're more assertive and ready to take charge of your life.",
    2: "Active pursuit of money and possessions. Financial activities require energy and drive.",
    3: "Mental energy is high but can be argumentative. Communication is direct and forceful.",
    4: "Energy directed into home projects. Family relationships may be conflictual or active.",
    5: "Strong creative and sexual energy. Romantic pursuits are bold and passionate.",
    6: "Hard work and potential conflicts with coworkers. Health through physical activity.",
    7: "Relationships require energy and may involve conflict. Assertiveness in partnerships.",
    8: "Intense sexual energy and potential conflicts over shared resources. Transformation through action.",
    9: "Active pursuit of knowledge and adventure. Physical travel and bold philosophical positions.",
    10: "Career ambition is strong. Professional advancement through initiative and energy.",
    11: "Active involvement in groups and friendships. Leadership in community organizations.",
    12: "Energy directed inward or into hidden activities. Need for solitude to process anger.",
  },
  jupiter: {
    1: "Personal growth and expansion. Increased confidence and optimism about yourself.",
    2: "Financial expansion and growth. Your material resources tend to increase.",
    3: "Positive communication and learning. Educational opportunities bring growth.",
    4: "Home and family expansion. Your domestic situation improves and grows.",
    5: "Creative and romantic expansion. Love affairs bring joy and learning.",
    6: "Work expansion and good health. Job opportunities and service to others bring fulfillment.",
    7: "Beneficial partnerships. Marriage and relationships bring growth and opportunities.",
    8: "Growth through shared resources. Financial support and intimacy bring positive transformation.",
    9: "Strong expansion through education, travel, and spirituality. Wisdom and understanding grow.",
    10: "Professional expansion and recognition. Career opportunities and advancement are favored.",
    11: "Growth through friendships and groups. Your social network expands beneficially.",
    12: "Spiritual growth and protection. Inner expansion through solitude and spiritual practices.",
  },
  saturn: {
    1: "Self-discipline and responsibility. You may feel heavier but can build solid foundations.",
    2: "Financial responsibility and discipline. Budgeting and careful planning are required.",
    3: "Serious thinking and communication. Learning requires discipline but brings lasting results.",
    4: "Responsibilities at home. Family obligations may feel heavy but teach important lessons.",
    5: "Creative expression requires discipline. Romance may be limited or serious.",
    6: "Hard work and responsibility. Job duties may increase but build career foundation.",
    7: "Relationships require work. Partnerships may be tested but can become stronger.",
    8: "Serious financial and emotional commitments. Facing fears brings transformation.",
    9: "Serious study of philosophy or spirituality. Wisdom comes through discipline.",
    10: "Career responsibilities increase. Professional advancement through hard work.",
    11: "Friends may be few but reliable. Group involvement requires commitment.",
    12: "Solitude and introspection. You may feel isolated but can do important inner work.",
  },
  uranus: {
    1: "Personal liberation and change. You may reinvent yourself or encounter unexpected freedom.",
    2: "Financial ups and downs. Unusual ways of making money become available.",
    3: "New ideas and communication methods. Your thinking becomes more innovative and unconventional.",
    4: "Changes in home or family. Domestic situation may become unusual or unpredictable.",
    5: "Creative innovation and unusual romantic encounters. Freedom in love is highlighted.",
    6: "Work changes and innovations. Health through alternative methods. New routines.",
    7: "Unusual relationships or sudden changes in partnerships. Freedom in close bonds.",
    8: "Sudden financial changes through others. Psychological breakthroughs and liberation.",
    9: "New philosophical insights. Travel to unusual places. Breakthroughs in understanding.",
    10: "Career changes and innovations. Professional freedom and non-traditional paths.",
    11: "Friends become more unusual or change. Group activities may be innovative or revolutionary.",
    12: "Spiritual awakening and liberation. Subconscious patterns suddenly shift.",
  },
  neptune: {
    1: "Spiritual sensitivity and inspiration. Your identity may feel less defined but more spiritual.",
    2: "Confusion about finances. Need for practical management of spiritual or artistic pursuits.",
    3: "Inspiration in communication. Artistic and creative thinking is heightened.",
    4: "Idealistic view of home and family. May sacrifice for domestic harmony.",
    5: "Romantic and creative inspiration. Love may be spiritual or artistic rather than practical.",
    6: "Service and healing work. Health through spiritual or alternative practices.",
    7: "Spiritual or idealistic partnerships. Relationships may lack clarity but feel destined.",
    8: "Deep spiritual transformation. Psychic sensitivity and financial confusion require caution.",
    9: "Spiritual exploration and expansion. Religious or philosophical inspiration is strong.",
    10: "Career in artistic or spiritual fields. Professional direction may feel unclear.",
    11: "Spiritual friendships and group involvement. Idealistic humanitarian impulses.",
    12: "Strong spiritual sensitivity. Need for solitude and spiritual practices.",
  },
  pluto: {
    1: "Personal transformation and empowerment. You may face your shadow and emerge stronger.",
    2: "Financial transformation through others. Joint resources bring power and control issues.",
    3: "Deep psychological communication. Research and investigation bring understanding.",
    4: "Transformation of home and family. Domestic situations undergo profound change.",
    5: "Powerful creative and sexual energy. Love affairs transform you deeply.",
    6: "Work-related transformation. Jobs may end and new powerful opportunities emerge.",
    7: "Relationships transform profoundly. Power struggles in close partnerships.",
    8: "Extreme transformation and regeneration. Facing death and rebirth experiences.",
    9: "Deep transformation of beliefs. Your philosophy undergoes profound change.",
    10: "Career transformation and empowerment. Professional rebirth and increased power.",
    11: "Group involvement brings transformation. Friendships may end or transform you.",
    12: "Deep psychological work and subconscious transformation. Spiritual rebirth.",
  },
};

/**
 * Moon Phase Interpretations
 */
const MOON_PHASES: Record<string, {
  interpretation: string;
  energy: string;
  advice: string[];
}> = {
  'new': {
    interpretation: "Your solar return new moon brings fresh energy and new beginnings. This is an excellent year for starting projects, setting intentions, and planting seeds for the future. The next 12 months represent a complete cycle of growth.",
    energy: "Initiatory, instinctive, spontaneous",
    advice: ["Start new projects", "Set clear intentions", "Trust your instincts", "Begin new cycles", "Plant seeds for future growth"],
  },
  'waxing-crescent': {
    interpretation: "With the waxing crescent moon, your year is about growth and expansion. The intentions you set will begin to take form. This is a time of increasing energy and building momentum.",
    energy: "Growing, expanding, committed",
    advice: ["Take action on goals", "Stay focused", "Build momentum", "Nurture new beginnings", "Maintain enthusiasm"],
  },
  'first-quarter': {
    interpretation: "The first quarter moon in your solar return indicates a year of action and overcoming obstacles. You'll face challenges but have the energy to overcome them. Decisions made now will shape your year.",
    energy: "Active, decisive, action-oriented",
    advice: ["Make important decisions", "Push through resistance", "Take decisive action", "Face challenges head-on", "Assert yourself"],
  },
  'waxing-gibbous': {
    interpretation: "The waxing gibbous moon brings a year of refinement and adjustment. Your projects and goals need fine-tuning. This is a time to analyze, perfect, and prepare for the culmination of your efforts.",
    energy: "Analytical, preparing, refining",
    advice: ["Refine your plans", "Stay flexible", "Perfect your skills", "Analyze progress", "Prepare for completion"],
  },
  'full': {
    interpretation: "Your solar return full moon illuminates your year with culmination and clarity. Projects started in the past reach completion. Relationships and situations come to full expression. Emotions are heightened, and awareness is at its peak.",
    energy: "Culminating, illuminating, emotional",
    advice: ["Celebrate achievements", "Complete projects", "Release what no longer serves", "Harvest what you've sown", "Honor your emotions"],
  },
  'waning-gibbous': {
    interpretation: "The waning gibbous moon brings a year of sharing and distribution. You're called to share your knowledge, teach others, and express gratitude for what you've accomplished. This is a social and generous phase.",
    energy: "Sharing, teaching, grateful",
    advice: ["Share your wisdom", "Teach others", "Express gratitude", "Distribute your abundance", "Mentor and guide"],
  },
  'last-quarter': {
    interpretation: "The last quarter moon in your solar return signals a year of reflection and release. Old patterns and completed cycles need to be cleared. This is a time for letting go, forgiveness, and making space for the new.",
    energy: "Reflective, releasing, letting go",
    advice: ["Release attachments", "Forgive others and yourself", "Clear space for the new", "Reflect on lessons learned", "Complete unfinished business"],
  },
  'waning-crescent': {
    interpretation: "With the waning crescent moon, your year is about rest, restoration, and surrender. This is a time of incubation before the next cycle. Low energy periods are normal and necessary for regeneration.",
    energy: "Resting, surrendering, emptying",
    advice: ["Rest and restore", "Meditate and reflect", "Clear your mind", "Release completely", "Prepare for rebirth"],
  },
};

/**
 * Generate complete solar return interpretation
 */
export function generateSolarReturnInterpretation(chartData: any, year: number): SolarReturnInterpretation {
  // Find Sun's house
  const sun = chartData.planets?.find((p: any) => p.planet === 'sun');
  const sunHouse = sun?.house || 1;

  // Get sun in house interpretation
  const sunInHouseData = SUN_IN_HOUSES[sunHouse];

  // Generate themes
  const themes: string[] = [
    ...sunInHouseData.themes,
    ...generatePlanetaryThemes(chartData.planets),
  ];

  // Generate challenges
  const challenges = generateChallenges(chartData);

  // Generate opportunities
  const opportunities = generateOpportunities(chartData);

  // Generate advice
  const advice = generateAdvice(sunHouse, chartData);

  return {
    themes,
    sunHouse: {
      house: sunHouse,
      interpretation: sunInHouseData.interpretation,
      focus: sunInHouseData.focus,
    },
    moonPhase: MOON_PHASES[chartData.moonPhase?.phase || 'new'],
    luckyDays: [], // Will be calculated separately
    challenges,
    opportunities,
    advice,
    keywords: generateKeywords(sunHouse, chartData),
  };
}

/**
 * Generate planetary themes
 */
function generatePlanetaryThemes(planets: any[]): string[] {
  const themes: string[] = [];

  for (const planet of planets) {
    const planetThemes = PLANET_IN_HOUSE[planet.planet]?.[planet.house];
    if (planetThemes) {
      themes.push(planetThemes);
    }
  }

  return themes;
}

/**
 * Generate challenges
 */
function generateChallenges(chartData: any): Array<{
  area: string;
  description: string;
  advice: string;
}> {
  const challenges: Array<{
    area: string;
    description: string;
    advice: string;
  }> = [];

  // Saturn challenges
  const saturn = chartData.planets?.find((p: any) => p.planet === 'saturn');
  if (saturn) {
    const saturnChallenges: Record<number, { area: string; description: string; advice: string }> = {
      1: {
        area: "Self-Expression",
        description: "You may feel heavier or more restricted this year. Self-confidence needs to be built through discipline and achievement.",
        advice: "Take on responsibilities that prove your capabilities to yourself. Focus on long-term goals rather than immediate gratification."
      },
      10: {
        area: "Career",
        description: "Professional responsibilities are heavy. You may feel overburdened but this is a time of building career foundations.",
        advice: "Embrace the hard work. What you build now will form the foundation of future success."
      },
    };

    const challenge = saturnChallenges[saturn.house];
    if (challenge) {
      challenges.push(challenge);
    }
  }

  return challenges;
}

/**
 * Generate opportunities
 */
function generateOpportunities(chartData: any): Array<{
  area: string;
  description: string;
  timing: string;
}> {
  const opportunities: Array<{
    area: string;
    description: string;
    timing: string;
  }> = [];

  // Jupiter opportunities
  const jupiter = chartData.planets?.find((p: any) => p.planet === 'jupiter');
  if (jupiter) {
    const jupiterOpportunities: Record<number, { area: string; description: string; timing: string }> = {
      2: {
        area: "Finances",
        description: "Financial growth opportunities arise. Income may increase through wise investments or career advancement.",
        timing: "Throughout the year, especially when Jupiter transits key points"
      },
      9: {
        area: "Personal Growth",
        description: "Expansion through education, travel, or spiritual pursuits. Broadening your horizons brings success.",
        timing: "Best during the latter half of the year"
      },
      10: {
        area: "Career",
        description: "Professional advancement and recognition. Leadership opportunities and promotion are favored.",
        timing: "Peak when Jupiter makes favorable aspects"
      },
    };

    const opportunity = jupiterOpportunities[jupiter.house];
    if (opportunity) {
      opportunities.push(opportunity);
    }
  }

  return opportunities;
}

/**
 * Generate advice
 */
function generateAdvice(sunHouse: number, chartData: any): string[] {
  const advice: string[] = [];

  const generalAdvice: Record<number, string[]> = {
    1: ["Focus on self-development", "Start new projects", "Build confidence", "Express your authentic self"],
    2: ["Budget wisely", "Invest in yourself", "Assess your values", "Build financial security"],
    3: ["Communicate clearly", "Learn continuously", "Connect with others", "Share your ideas"],
    4: ["Nurture family bonds", "Create a peaceful home", "Honor your emotions", "Build your sanctuary"],
    5: ["Express creativity", "Embrace romance", "Play and have fun", "Follow your heart"],
    6: ["Work diligently", "Maintain health routines", "Serve others", "Improve efficiency"],
    7: ["Cooperate with partners", "Balance self and other", "Build relationships", "Practice diplomacy"],
    8: ["Face your fears", "Transform deeply", "Handle shared resources wisely", "Embrace change"],
    9: ["Expand your horizons", "Seek truth", "Explore spirituality", "Travel or study"],
    10: ["Focus on career", "Build reputation", "Take leadership", "Achieve goals"],
    11: ["Build networks", "Work in groups", "Dream big", "Support community causes"],
    12: ["Reflect inward", "Practice spirituality", "Rest and restore", "Heal old wounds"],
  };

  advice.push(...(generalAdvice[sunHouse] || generalAdvice[1]));

  // Add specific advice based on challenging aspects
  if (chartData.aspects) {
    const hardAspects = chartData.aspects.filter((a: any) =>
      a.type === 'square' || a.type === 'opposition'
    );

    if (hardAspects.length > 3) {
      advice.push("This year has significant challenges. Patience and persistence will be your allies.");
    }
  }

  return advice;
}

/**
 * Generate keywords
 */
function generateKeywords(sunHouse: number, chartData: any): string[] {
  const keywords: string[] = [];

  const houseKeywords: Record<number, string[]> = {
    1: ["new beginnings", "self-focus", "independence", "leadership"],
    2: ["money", "values", "security", "possessions"],
    3: ["communication", "learning", "thinking", "connections"],
    4: ["home", "family", "emotions", "foundations"],
    5: ["creativity", "romance", "pleasure", "expression"],
    6: ["work", "health", "service", "routine"],
    7: ["partnerships", "relationships", "cooperation", "balance"],
    8: ["transformation", "intimacy", "shared resources", "depth"],
    9: ["expansion", "philosophy", "travel", "spirituality"],
    10: ["career", "ambition", "achievement", "recognition"],
    11: ["friendship", "groups", "aspirations", "community"],
    12: ["spirituality", "introspection", "solitude", "healing"],
  };

  keywords.push(...(houseKeywords[sunHouse] || houseKeywords[1]));

  return keywords;
}

export default {
  SUN_IN_HOUSES,
  PLANET_IN_HOUSE,
  MOON_PHASES,
  generateSolarReturnInterpretation,
};
