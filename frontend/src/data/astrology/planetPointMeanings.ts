/**
 * Planet & Point Meaning Map
 *
 * Centralized, reusable descriptions for every celestial body and chart point.
 * Used by: Natal Aspects, Transits, Compatibility, Forecast, Solar Returns, Lunar Returns.
 *
 * Each entry provides:
 *  - symbol       → glyph used in tables
 *  - keywords     → short thematic tags
 *  - coreFunction → one-sentence summary
 *  - description  → 2-3 sentence educational paragraph
 *  - beginnerTip  → practical tip for new students
 *  - inBirthChart → what it means in a natal chart
 *  - inTransit    → what it means during transits
 *  - healthyExpression  → positive manifestation keywords
 *  - difficultExpression → shadow/unhealthy manifestation keywords
 */

export interface PlanetPointMeaning {
  id: string;
  name: string;
  symbol: string;
  keywords: string[];
  coreFunction: string;
  description: string;
  beginnerTip: string;
  inBirthChart: string;
  inTransit: string;
  healthyExpression: string;
  difficultExpression: string;
}

export const planetPointMeaningMap: Record<string, PlanetPointMeaning> = {
  sun: {
    id: 'sun',
    name: 'Sun',
    symbol: '☉',
    keywords: ['identity', 'ego', 'vitality', 'purpose', 'creativity'],
    coreFunction: 'Core identity, vitality, conscious purpose, and creative self-expression.',
    description:
      "The Sun represents the core of who you are — your conscious self, your drive to shine, and your fundamental life purpose. A strong Sun gives confidence and clarity of purpose; a challenged Sun may manifest as self-doubt or excessive need for validation.",
    beginnerTip:
      'The Sun describes the "who" — your core identity. But remember: you are more than your Sun sign. The whole chart tells the full story.',
    inBirthChart:
      "The Sun sign and house show the area of life where you are meant to develop confidence, leadership, and self-awareness.",
    inTransit:
      'Sun transits illuminate and activate. They bring attention, energy, and visibility to the house or planet they touch.',
    healthyExpression: 'Confidence, generosity, leadership, creativity, warmth, vitality.',
    difficultExpression: 'Arrogance, egocentrism, need for constant attention, fragile self-esteem.',
  },
  moon: {
    id: 'moon',
    name: 'Moon',
    symbol: '☽',
    keywords: ['emotions', 'instincts', 'nurture', 'memory', 'security'],
    coreFunction: 'Emotions, instincts, subconscious, security needs, and the inner world.',
    description:
      "The Moon represents your emotional self — what happens beneath the surface. It shows how you process feelings, what makes you feel safe, and your automatic reactions to life. The Moon governs habits formed in childhood and the way you nurture others.",
    beginnerTip:
      'The Moon tells you what a person actually feels, not what they show the world. It is the private self.',
    inBirthChart:
      'The Moon sign and house reveal emotional needs, instinctive reactions, and what feels like "home."',
    inTransit:
      'Moon transits are brief (2–3 days) and emotional. They color moods and bring emotional reactions to the surface.',
    healthyExpression: 'Emotional intelligence, empathy, nurturing, intuition, adaptability.',
    difficultExpression: 'Mood swings, emotional neediness, over-attachment, fear of change.',
  },
  mercury: {
    id: 'mercury',
    name: 'Mercury',
    symbol: '☿',
    keywords: ['communication', 'analysis', 'adaptability', 'curiosity', 'logic'],
    coreFunction: 'Communication, thinking, learning, reasoning, and information processing.',
    description:
      "Mercury represents how you think, speak, learn, and connect ideas. It governs the rational mind, verbal expression, writing ability, and the way you process and share information.",
    beginnerTip:
      "Mercury is always close to the Sun (within 28°), so it is either in the same sign as the Sun or the sign before/after.",
    inBirthChart:
      "Mercury's sign and house show your preferred communication style, learning approach, and intellectual interests.",
    inTransit:
      'Mercury transits activate thinking, communication, and travel. Mercury retrograde is famous for miscommunications — but also excellent for reflection.',
    healthyExpression: 'Clear communication, intellectual curiosity, wit, strong reasoning.',
    difficultExpression: 'Overthinking, gossip, argumentativeness, restlessness.',
  },
  venus: {
    id: 'venus',
    name: 'Venus',
    symbol: '♀',
    keywords: ['love', 'beauty', 'harmony', 'values', 'pleasure'],
    coreFunction: 'Love, beauty, values, relationships, pleasure, aesthetics, and self-worth.',
    description:
      "Venus represents what you love, value, and find beautiful. It governs romantic attraction, aesthetic taste, relationship needs, and the capacity for pleasure. Venus shows how you give and receive love.",
    beginnerTip:
      'Venus shows what you are attracted TO, while Mars shows how you PURSUE it. Together they describe the full romantic dynamic.',
    inBirthChart:
      "Venus's sign and house show your relationship style, aesthetic preferences, and what brings pleasure.",
    inTransit:
      'Venus transits activate love, money, beauty, and pleasure. They can bring new relationships or creative inspiration.',
    healthyExpression: 'Harmonious relationships, aesthetic appreciation, generosity, diplomacy.',
    difficultExpression: 'Vanity, people-pleasing, materialism, jealousy, possessiveness.',
  },
  mars: {
    id: 'mars',
    name: 'Mars',
    symbol: '♂',
    keywords: ['action', 'courage', 'desire', 'competition', 'assertiveness'],
    coreFunction: 'Action, energy, drive, desire, assertiveness, courage, and physical vitality.',
    description:
      "Mars represents the warrior energy within — how you take action, assert yourself, and pursue desires. It governs anger, competition, physical energy, and the courage to fight for what matters.",
    beginnerTip:
      'Mars is the engine of the chart. Without Mars energy, nothing gets done. A well-placed Mars gives healthy ambition.',
    inBirthChart:
      "Mars's sign and house reveal how you take action, express anger, compete, and pursue goals.",
    inTransit:
      'Mars transits bring energy, drive, and sometimes conflict. They activate ambition and the desire to take bold action.',
    healthyExpression: 'Courage, initiative, determination, healthy assertiveness, passion.',
    difficultExpression: 'Aggression, impulsiveness, recklessness, anger issues, impatience.',
  },
  jupiter: {
    id: 'jupiter',
    name: 'Jupiter',
    symbol: '♃',
    keywords: ['abundance', 'philosophy', 'faith', 'opportunity', 'generosity'],
    coreFunction: 'Growth, expansion, optimism, wisdom, abundance, philosophy, and faith.',
    description:
      "Jupiter represents the principle of expansion — where you grow, take risks, and seek meaning. It governs optimism, philosophy, higher education, travel, and abundance. Jupiter shows where you are naturally lucky and where you may overdo things.",
    beginnerTip:
      'Jupiter is the "Great Benefic" — it generally brings blessings. But it can also inflate problems if unchecked.',
    inBirthChart:
      "Jupiter's sign and house reveal where you experience growth, abundance, and opportunity.",
    inTransit:
      'Jupiter transits bring growth, opportunity, and expansion. They can bring luck but also excess.',
    healthyExpression: 'Optimism, generosity, wisdom, broad-mindedness, abundance.',
    difficultExpression: 'Overindulgence, arrogance, extravagance, blind optimism.',
  },
  saturn: {
    id: 'saturn',
    name: 'Saturn',
    symbol: '♄',
    keywords: ['discipline', 'patience', 'ambition', 'boundaries', 'maturity'],
    coreFunction: 'Structure, time, limits, discipline, responsibility, and long-term growth.',
    description:
      "Saturn shows where life asks for effort, realism, and emotional maturity. It may feel difficult at first because it exposes insecurity, but it also shows where deep mastery is possible. Saturn is the teacher that doesn't grade on a curve.",
    beginnerTip:
      'Saturn does not only deny. Saturn strengthens what is weak through time, effort, and reality.',
    inBirthChart:
      "Saturn shows the area where you may feel delayed or tested — but also where you can achieve mastery.",
    inTransit:
      'Saturn transits often bring reality checks. They ask you to define boundaries, commit, and take responsibility.',
    healthyExpression: 'Discipline, patience, resilience, commitment, wisdom, mastery.',
    difficultExpression: 'Fear, guilt, pessimism, rigidity, emotional coldness.',
  },
  uranus: {
    id: 'uranus',
    name: 'Uranus',
    symbol: '♅',
    keywords: ['originality', 'freedom', 'invention', 'disruption', 'awakening'],
    coreFunction: 'Innovation, rebellion, sudden change, individuality, freedom, and awakening.',
    description:
      "Uranus represents the urge to break free from convention, innovate, and express radical individuality. It governs sudden insights, revolutionary thinking, and the desire for freedom. Uranus disrupts stagnation and forces evolution.",
    beginnerTip:
      'Uranus is a generational planet — it stays in each sign for ~7 years. The HOUSE it occupies in your personal chart matters most.',
    inBirthChart:
      'Uranus shows where you are unconventional, rebellious, or ahead of your time.',
    inTransit:
      'Uranus transits bring sudden changes, breakthroughs, and disruptions. They shake up stagnant areas.',
    healthyExpression: 'Innovation, independence, originality, humanitarianism, authenticity.',
    difficultExpression: 'Rebellion for its own sake, unpredictability, emotional detachment.',
  },
  neptune: {
    id: 'neptune',
    name: 'Neptune',
    symbol: '♆',
    keywords: ['intuition', 'compassion', 'fantasy', 'transcendence', 'mysticism'],
    coreFunction: 'Dreams, illusion, spirituality, compassion, creativity, and the dissolution of boundaries.',
    description:
      "Neptune represents the dissolution of the ego and the longing for transcendence. It governs imagination, spiritual seeking, compassion, and artistic inspiration. Neptune can lead to profound creativity or to escapism and illusion.",
    beginnerTip:
      'Neptune works through feeling, imagery, and intuition — not logic. Think: "Where is this person seeking something more beautiful than ordinary reality?"',
    inBirthChart:
      'Neptune shows where you are idealistic, creative, spiritually attuned, or prone to illusion.',
    inTransit:
      'Neptune transits dissolve structures and create confusion, inspiration, or spiritual awakening.',
    healthyExpression: 'Compassion, artistic genius, spiritual awareness, intuition, empathy.',
    difficultExpression: 'Deception, escapism, addiction, confusion, victimhood.',
  },
  pluto: {
    id: 'pluto',
    name: 'Pluto',
    symbol: '♇',
    keywords: ['power', 'rebirth', 'obsession', 'depth', 'transformation'],
    coreFunction: 'Transformation, power, death and rebirth, the unconscious, and regeneration.',
    description:
      "Pluto represents the deepest forces of transformation — the process of death and rebirth. It governs power, control, the unconscious, and the ability to regenerate from the ashes. Pluto strips away what is false and forces contact with what is real.",
    beginnerTip:
      'Pluto always asks: "What needs to die so something new can be born?" It is not a death sentence — it is the planet of REBIRTH.',
    inBirthChart:
      'Pluto shows where you have the capacity for deep transformation and where you can access extraordinary personal power.',
    inTransit:
      'Pluto transits strip away false structures and force complete regeneration. They are intense but lead to permanent empowerment.',
    healthyExpression: 'Transformation, empowerment, psychological depth, resilience, personal authority.',
    difficultExpression: 'Control issues, manipulation, obsession, destructiveness, power struggles.',
  },
  northnode: {
    id: 'northnode',
    name: 'North Node',
    symbol: '☊',
    keywords: ['destiny', 'growth', 'new challenges', 'evolution'],
    coreFunction: 'Soul purpose, growth direction, karmic path, and future potential.',
    description:
      "The North Node represents the direction of soul growth — the lessons and qualities you are meant to develop in this lifetime. It often feels unfamiliar and uncomfortable because it requires moving beyond the comfort zone of the South Node.",
    beginnerTip:
      'The North Node is always opposite the South Node. The goal is to integrate the South Node gifts while growing toward the North Node.',
    inBirthChart:
      "The North Node's sign and house show the area of life where you are meant to grow beyond habitual patterns.",
    inTransit:
      'Transits to the Nodes can trigger pivotal life events, fated encounters, and turning points.',
    healthyExpression: 'Purposeful growth, embracing challenges, trusting the unfamiliar.',
    difficultExpression: 'Avoidance of growth, retreating to comfort zone, feeling stuck.',
  },
  southnode: {
    id: 'southnode',
    name: 'South Node',
    symbol: '☋',
    keywords: ['past mastery', 'comfort zone', 'release', 'habit'],
    coreFunction: 'Past-life talents, comfort zone, and karmic patterns.',
    description:
      "The South Node represents past-life talents and habits — what comes naturally but may hold you back if over-relied upon. It is the comfort zone that feels safe but may prevent growth toward the North Node.",
    beginnerTip:
      "The South Node is not bad — it represents gifts and wisdom from the past. The challenge is not to abandon it but to grow beyond it.",
    inBirthChart:
      "The South Node's sign and house show innate talents and habitual patterns from earlier in life or past incarnations.",
    inTransit:
      'Transits to the South Node may trigger returns to old patterns or opportunities to release what no longer serves.',
    healthyExpression: 'Drawing on innate talents, wisdom from experience, mastery of familiar skills.',
    difficultExpression: 'Over-reliance on comfort zone, resistance to growth, stuck patterns.',
  },
  chiron: {
    id: 'chiron',
    name: 'Chiron',
    symbol: '⚷',
    keywords: ['wounding', 'healing', 'teaching', 'vulnerability'],
    coreFunction: 'The wounded healer — deep healing, teaching through pain, and integration of vulnerability.',
    description:
      "Chiron represents the wound that never fully heals — but this wound becomes the source of wisdom and the ability to heal others. It shows where you have experienced deep pain, and where that pain can be transformed into compassionate understanding.",
    beginnerTip:
      "Chiron's placement often explains the deepest emotional patterns. The wound itself becomes the healing gift.",
    inBirthChart:
      "Chiron's sign and house reveal the area of life where you carry a deep wound and have extraordinary healing gifts.",
    inTransit:
      'Chiron transits activate old wounds and offer healing opportunities. They can be painful but ultimately liberating.',
    healthyExpression: 'Healing gifts, empathy born from experience, mentoring, turning pain into purpose.',
    difficultExpression: 'Chronic pain, victim mentality, feeling fundamentally broken.',
  },
  ascendant: {
    id: 'ascendant',
    name: 'Ascendant',
    symbol: '↑',
    keywords: ['persona', 'mask', 'approach to life', 'first impressions'],
    coreFunction: 'Outward personality, physical appearance, and how others see you.',
    description:
      "The Ascendant (Rising Sign) is the mask you wear for the world — your outward personality, physical appearance, and first impressions. It is the lens through which all other chart energies are expressed. The Ascendant is determined by your exact birth time and location.",
    beginnerTip:
      'Your Ascendant is just as important as your Sun sign — many people identify more with their Rising sign than their Sun sign.',
    inBirthChart:
      'The Ascendant sign sets the wheel of houses and colors the entire chart. It shows how you approach new situations.',
    inTransit:
      'Transits to the Ascendant affect your outward persona, physical vitality, and how others perceive you.',
    healthyExpression: 'Authentic self-presentation, adaptability, healthy boundaries with the world.',
    difficultExpression: 'Over-identification with the mask, hiding the true self.',
  },
  midheaven: {
    id: 'midheaven',
    name: 'Midheaven',
    symbol: 'MC',
    keywords: ['vocation', 'status', 'legacy', 'achievement'],
    coreFunction: 'Career, public reputation, and life direction.',
    description:
      "The Midheaven (MC) is the highest point in the chart and represents your public persona, career, and life direction. It shows what you aspire to become in the eyes of the world. The MC often indicates the profession or social role that feels most meaningful.",
    beginnerTip:
      "The MC sign and any planets near it are crucial for understanding career direction. It's the 'peak' of your chart.",
    inBirthChart:
      "The Midheaven's sign and nearby planets show your career path, public reputation, and what you aspire to achieve.",
    inTransit:
      'Transits to the MC often coincide with career changes, public recognition, or shifts in life direction.',
    healthyExpression: 'Clear vocational direction, public respect, meaningful contribution to society.',
    difficultExpression: 'Career confusion, reputation issues, over-ambition or under-achievement.',
  },
  lilith: {
    id: 'lilith',
    name: 'Lilith',
    symbol: '⚫',
    keywords: ['rebellion', 'shadow work', 'raw power', 'repressed needs'],
    coreFunction: 'Repressed desires, shadow feminine, and primal instincts.',
    description:
      "Lilith represents the part of you that refuses to be tamed — repressed desires, raw power, and primal instincts. In the chart, Lilith shows where you may feel marginalized, silenced, or rebellious against social norms.",
    beginnerTip:
      "Lilith is an advanced chart point. It reveals where you need to reclaim power that was taken from you or that you gave away.",
    inBirthChart:
      "Lilith's placement shows where you carry repressed anger, sexual power, or a refusal to conform.",
    inTransit:
      'Transits to Lilith can trigger rebellious feelings, sexual awakening, or confrontations with authority.',
    healthyExpression: 'Owning your power, refusing to be silenced, healthy rebellion, authentic desire.',
    difficultExpression: 'Destructive rebellion, manipulation, refusing to compromise, self-sabotage.',
  },
  partoffortune: {
    id: 'partoffortune',
    name: 'Part of Fortune',
    symbol: '⊗',
    keywords: ['fortune', 'well-being', 'joy', 'material success'],
    coreFunction: 'Point of physical well-being, luck, and worldly success.',
    description:
      "The Part of Fortune is a calculated point based on the relationship between the Sun, Moon, and Ascendant. It represents where you can find joy, well-being, and material success in this lifetime.",
    beginnerTip:
      "The Part of Fortune is not a planet — it's a mathematical point. Look at its sign and house for clues about where life feels most rewarding.",
    inBirthChart:
      "The Part of Fortune's sign and house show the area of life where you can find the greatest happiness and material success.",
    inTransit:
      'Transits to the Part of Fortune can bring lucky breaks, financial opportunities, or moments of deep satisfaction.',
    healthyExpression: 'Finding joy in the material world, experiencing abundance, physical well-being.',
    difficultExpression: 'Chasing happiness externally, materialism, ignoring spiritual needs.',
  },
};

/** Resolve a raw planet key (any casing) to a PlanetPointMeaning entry */
export function getPlanetPointMeaning(raw: string): PlanetPointMeaning | undefined {
  return planetPointMeaningMap[raw.toLowerCase()];
}

/** Display name for any planet/point key */
export function getPlanetPointDisplayName(raw: string): string {
  return getPlanetPointMeaning(raw)?.name ?? (raw.charAt(0).toUpperCase() + raw.slice(1));
}

/** Symbol for any planet/point key */
export function getPlanetPointSymbol(raw: string): string {
  return getPlanetPointMeaning(raw)?.symbol ?? '';
}
