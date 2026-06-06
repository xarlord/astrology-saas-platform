/**
 * Aspect Interpretation Data
 *
 * Static/deterministic interpretation content for all planet + aspect combinations.
 * Used by AspectDetailPanel to display structured interpretation sections.
 */

// ─── Planet keyword maps ──────────────────────────────────────────────────────

/**
 * Short, user-facing planet/point meanings used in the aspect detail panel.
 * Each entry briefly explains what the planet or point represents so the user
 * understands both bodies before reading the synthesized aspect interpretation.
 */
export const PLANET_MEANINGS: Record<string, string> = {
  Sun: 'Identity, vitality, purpose, confidence, creative self-expression, life direction.',
  Moon: 'Emotions, instincts, habits, memory, emotional safety, body rhythms, belonging.',
  Mercury: 'Mind, communication, speech, writing, learning, perception, analysis, decision-making.',
  Venus: 'Love, attraction, values, pleasure, money, beauty, harmony, relationship style.',
  Mars: 'Action, desire, anger, courage, defense, motivation, physical energy, conflict style.',
  Jupiter: 'Growth, opportunity, wisdom, faith, expansion, optimism, belief, meaning.',
  Saturn: 'Structure, limits, time, discipline, responsibility, fear, maturity, long-term mastery.',
  Uranus: 'Change, freedom, awakening, rebellion, innovation, disruption, originality.',
  Neptune: 'Dreams, imagination, spirituality, compassion, confusion, idealization, dissolution.',
  Pluto: 'Transformation, power, crisis, shadow, depth, control, regeneration, psychological intensity.',
  Ascendant: 'Physical presence, instinctive approach to life, first impressions, identity gateway, how the person enters experience.',
  Midheaven: 'Career direction, public role, reputation, visibility, vocation, authority, long-term achievement.',
  'North Node': 'Growth direction, unfamiliar developmental path, future-oriented learning, evolutionary challenge.',
  'South Node': 'Familiar patterns, past conditioning, comfort zone, inherited tendencies, what the person already knows.',
  Chiron: 'Wound, sensitivity, healing process, vulnerability, teaching through lived experience.',
  'Part of Fortune': 'Natural flow, embodied ease, material and emotional wellbeing, where life can feel more naturally supported.',
};

export const PLANET_FUNCTIONS: Record<string, string> = {
  Sun: 'core identity, vitality, and self-expression',
  Moon: 'emotions, instincts, and inner needs',
  Mercury: 'thinking, communication, and learning',
  Venus: 'love, values, aesthetics, and pleasure',
  Mars: 'drive, action, assertiveness, and desire',
  Jupiter: 'growth, expansion, optimism, and wisdom',
  Saturn: 'structure, discipline, responsibility, and limitation',
  Uranus: 'innovation, freedom, rebellion, and sudden change',
  Neptune: 'imagination, spirituality, dreams, and illusion',
  Pluto: 'transformation, power, regeneration, and the unconscious',
  NorthNode: 'karmic direction, soul growth, and future potential',
  SouthNode: 'past-life talents, comfort zone, and karmic patterns',
  Chiron: 'the wounded healer, deep wounds, and healing gifts',
  Ascendant: 'outward personality, physical appearance, and how others see you',
  Midheaven: 'career, public reputation, and life direction',
  Lilith: 'repressed desires, shadow feminine, and primal instincts',
  'Part of Fortune': 'point of physical well-being, luck, and worldly success',
};

export const PLANET_KEYWORDS: Record<string, string[]> = {
  Sun: ['identity', 'ego', 'vitality', 'purpose', 'creativity'],
  Moon: ['emotions', 'instincts', 'nurture', 'memory', 'security'],
  Mercury: ['communication', 'analysis', 'adaptability', 'curiosity', 'logic'],
  Venus: ['love', 'beauty', 'harmony', 'values', 'pleasure'],
  Mars: ['action', 'courage', 'desire', 'competition', 'assertiveness'],
  Jupiter: ['abundance', 'philosophy', 'faith', 'opportunity', 'generosity'],
  Saturn: ['discipline', 'patience', 'ambition', 'boundaries', 'maturity'],
  Uranus: ['originality', 'freedom', 'invention', 'disruption', 'awakening'],
  Neptune: ['intuition', 'compassion', 'fantasy', 'transcendence', 'mysticism'],
  Pluto: ['power', 'rebirth', 'obsession', 'depth', 'transformation'],
  NorthNode: ['destiny', 'growth', 'new challenges', 'evolution'],
  SouthNode: ['past mastery', 'comfort zone', 'release', 'habit'],
  Chiron: ['wounding', 'healing', 'teaching', 'vulnerability'],
  Ascendant: ['persona', 'mask', 'approach to life', 'first impressions'],
  Midheaven: ['vocation', 'status', 'legacy', 'achievement'],
  Lilith: ['rebellion', 'shadow work', 'raw power', 'repressed needs'],
  'Part of Fortune': ['fortune', 'well-being', 'joy', 'material success'],
};

// ─── Aspect quality data ──────────────────────────────────────────────────────

export interface AspectTypeInfo {
  label: string;
  nature: 'harmonious' | 'challenging' | 'neutral' | 'dynamic' | 'creative';
  color: string;
  description: string;
  dynamic: string;
}

export const ASPECT_TYPE_INFO: Record<string, AspectTypeInfo> = {
  conjunction: {
    label: 'Conjunction (0°)',
    nature: 'neutral',
    color: 'text-amber-400',
    description:
      "A conjunction merges the energies of two planets into a single, concentrated force. The planets act as one, amplifying each other's themes. The effect depends heavily on which planets are involved - benefics bring ease, malefics bring intensity.",
    dynamic: 'fusion and intensification',
  },
  opposition: {
    label: 'Opposition (180°)',
    nature: 'challenging',
    color: 'text-red-400',
    description:
      'An opposition creates tension between two opposing forces, demanding balance and awareness. It often manifests as a push-pull dynamic where you feel torn between two poles. The key is integration rather than choosing one side.',
    dynamic: 'polarity and awareness',
  },
  trine: {
    label: 'Trine (120°)',
    nature: 'harmonious',
    color: 'text-green-400',
    description:
      'A trine creates a natural flow of energy between two planets. Talents and ease come effortlessly, but this can also lead to complacency if the gifts are taken for granted. It represents innate ability and harmony.',
    dynamic: 'flow and natural talent',
  },
  square: {
    label: 'Square (90°)',
    nature: 'challenging',
    color: 'text-orange-400',
    description:
      'A square generates internal friction and pressure that demands action. It is a catalyst for growth — the tension forces you to develop strength and overcome obstacles. While uncomfortable, it is one of the most productive aspects.',
    dynamic: 'tension and motivation',
  },
  sextile: {
    label: 'Sextile (60°)',
    nature: 'harmonious',
    color: 'text-blue-400',
    description:
      'A sextile offers opportunity and potential that requires conscious effort to activate. Unlike the trine, its gifts do not come automatically — you must reach for them. It favors cooperation, learning, and skill development.',
    dynamic: 'opportunity and potential',
  },
  quincunx: {
    label: 'Quincunx (150°)',
    nature: 'dynamic',
    color: 'text-purple-400',
    description:
      'A quincunx (inconjunct) connects two planets that have no natural relationship. This creates an awkward adjustment — a sense that two parts of life do not quite fit together. It requires continual tweaking and adaptation.',
    dynamic: 'adjustment and realignment',
  },
  semisextile: {
    label: 'Semi-sextile (30°)',
    nature: 'neutral',
    color: 'text-cyan-400',
    description:
      "A semi-sextile is a mild connection between adjacent signs. It brings subtle awareness and minor adjustments. The planets are in neighboring signs with different elements and modalities, so they don't naturally understand each other but can learn.",
    dynamic: 'subtle awareness and minor adjustment',
  },
  semisquare: {
    label: 'Semi-square (45°)',
    nature: 'challenging',
    color: 'text-orange-300',
    description:
      'A semi-square is a minor but irritating aspect that creates low-level friction. Like a pebble in your shoe, it nags at you until you address it. It often shows up as minor irritations or self-correcting challenges.',
    dynamic: 'minor friction and irritation',
  },
  sesquiquadrate: {
    label: 'Sesqui-square (135°)',
    nature: 'challenging',
    color: 'text-orange-300',
    description:
      'A sesqui-square (sesquiquadrate) is similar to the semi-square but more persistent. It creates nagging tension that builds over time. Issues related to this aspect tend to resurface until properly addressed.',
    dynamic: 'persistent tension and recurring adjustments',
  },
  quintile: {
    label: 'Quintile (72°)',
    nature: 'creative',
    color: 'text-teal-400',
    description:
      'A quintile is a creative, talent-based aspect connected to the number 5. It indicates a unique gift or specialized talent that sets you apart. It often shows a creative approach or an ability to synthesize ideas in novel ways. The person may express the planets involved through creative intelligence, unusual skill, or a distinctive way of organizing experience. There is often a compulsive drive to perfect or refine the talent — it does not feel optional.',
    dynamic: 'creative talent and uniqueness',
  },
  biquintile: {
    label: 'Bi-quintile (144°)',
    nature: 'creative',
    color: 'text-teal-400',
    description:
      'A bi-quintile amplifies the quintile\'s creative talent. It suggests a refined or developed gift — something you can master with practice. It often manifests as a distinctive style or approach that becomes a signature strength. The person may feel a strong need to bring order, elegance, or artistry to the area of life represented by the planets involved. There is often perfectionism and a desire to make things "just right."',
    dynamic: 'refined talent and mastery',
  },
  septile: {
    label: 'Septile (51°26\')',
    nature: 'dynamic',
    color: 'text-violet-400',
    description:
      'A septile (≈51.43°) is associated with subtle turning points, inner calling, symbolic awareness, and choices that feel meaningful or mysterious. It operates below the surface, connecting the planets through a sense of fate or deeper significance.',
    dynamic: 'symbolic awareness and fated-feeling choices',
  },
  novile: {
    label: 'Novile (40°)',
    nature: 'harmonious',
    color: 'text-indigo-400',
    description:
      'A novile (40°) is associated with inner development, integration, spiritual growth, or the gradual unfolding of potential. It represents a quiet developmental process rather than an obvious external event — a seed of completion slowly ripening.',
    dynamic: 'inner development and spiritual completion',
  },
  semiquintile: {
    label: 'Semi-quintile (36°)',
    nature: 'creative',
    color: 'text-teal-300',
    description:
      'A semi-quintile (decile, 36°) is a subtle creative spark. It suggests a minor but persistent talent or creative impulse that runs in the background of the personality. The person may have a quiet knack or hobby that brings satisfaction — not their main identity, but a source of personal enrichment and intuitive feel for aesthetics or timing.',
    dynamic: 'latent talent and creative impulse',
  },
};

// ─── Orb interpretation ───────────────────────────────────────────────────────

export function getOrbInterpretation(orb: number): { level: string; description: string } {
  if (orb < 0.5) {
    return {
      level: 'Exact (under 0°30\')',
      description:
        'This aspect is nearly exact — the two planets are within half a degree of the precise angle. This gives the aspect maximum potency. Its effects are unmistakable and play a dominant role in the personality or current transits.',
    };
  }
  if (orb < 1) {
    return {
      level: 'Very tight (under 1°)',
      description:
        'A very tight orb means the aspect is strongly felt and clearly expressed in behavior and experience. The planetary energies are closely linked and reinforce each other significantly.',
    };
  }
  if (orb < 3) {
    return {
      level: 'Tight (under 3°)',
      description:
        'A tight orb indicates a strong and reliable aspect. The connection between these planets is clearly active and influential in the chart. You can count on this aspect to manifest in noticeable ways.',
    };
  }
  if (orb < 5) {
    return {
      level: 'Moderate (3°–5°)',
      description:
        'A moderate orb gives a reliable but not overwhelming connection. The aspect is definitely active, though it may not be the first thing you notice. It contributes steadily to the chart\'s overall pattern.',
    };
  }
  if (orb < 8) {
    return {
      level: 'Wide (5°–8°)',
      description:
        'A wider orb means the aspect is present but subtler. It operates more in the background, coloring the personality or situation rather than dominating it. Its influence is real but may be harder to pinpoint.',
    };
  }
  return {
    level: 'Very wide (over 8°)',
    description:
      'A very wide orb indicates a faint connection. The aspect is technically within range but its influence is gentle and diffuse. It may only be noticed when triggered by transits or progressions.',
  };
}

// ─── Applying / Separating interpretation ─────────────────────────────────────

export function getApplyingSeparatingText(
  applying: boolean,
  planet1: string,
  planet2: string,
  aspectType: string,
): string {
  const aspectName = ASPECT_TYPE_INFO[aspectType]?.label ?? aspectType;
  if (applying) {
    return (
      `This ${aspectName} between ${planet1} and ${planet2} is applying — the two bodies are moving closer to an exact aspect. ` +
      'The energy is building and intensifying. In a natal chart, applying aspects are considered stronger because the planets are moving toward their peak expression. ' +
      'In transits, this means the event or theme associated with this aspect is approaching and has not yet fully manifested.'
    );
  }
  return (
    `This ${aspectName} between ${planet1} and ${planet2} is separating — the two bodies are moving away from the exact aspect. ` +
    'The energy has peaked and is now dispersing. In a natal chart, separating aspects represent energies that were strongest at or before birth. ' +
    'In transits, this means the event or theme has already occurred and its influence is beginning to wane, though still active.'
  );
}

// ─── Planet naming helper ─────────────────────────────────────────────────────

const NAME_MAP: Record<string, string> = {
  sun: 'Sun',
  moon: 'Moon',
  mercury: 'Mercury',
  venus: 'Venus',
  mars: 'Mars',
  jupiter: 'Jupiter',
  saturn: 'Saturn',
  uranus: 'Uranus',
  neptune: 'Neptune',
  pluto: 'Pluto',
  northnode: 'North Node',
  southnode: 'South Node',
  chiron: 'Chiron',
  ascendant: 'Ascendant',
  midheaven: 'Midheaven',
  lilith: 'Lilith',
  partoffortune: 'Part of Fortune',
  asc: 'Ascendant',
  mc: 'Midheaven',
  dsc: 'Descendant',
  ic: 'Imum Coeli',
};

export function displayName(raw: string): string {
  return NAME_MAP[raw.toLowerCase()] ?? (raw.charAt(0).toUpperCase() + raw.slice(1));
}

// ─── Core meaning builder ─────────────────────────────────────────────────────

/**
 * Build a deterministic core meaning sentence for any planet1-aspect-planet2 combo.
 * This is intentionally formulaic so that every combination produces a unique but
 * coherent paragraph without requiring a database of pre-written interpretations.
 */
export function buildCoreMeaning(planet1: string, aspectType: string, planet2: string): string {
  const p1 = displayName(planet1);
  const p2 = displayName(planet2);
  const fn1 = PLANET_FUNCTIONS[p1] ?? `the energies of ${p1}`;
  const fn2 = PLANET_FUNCTIONS[p2] ?? `the energies of ${p2}`;
  const info = ASPECT_TYPE_INFO[aspectType];
  const dynamic = info?.dynamic ?? 'interaction';
  const nature = info?.nature ?? 'neutral';

  const natureText =
    nature === 'harmonious'
      ? 'This harmonious connection supports ease and natural ability'
      : nature === 'challenging'
        ? 'This challenging connection creates tension that drives growth'
        : nature === 'dynamic'
          ? 'This dynamic connection requires continual adjustment and flexibility'
          : nature === 'creative'
            ? 'This creative connection reveals a specialized talent or unique gift'
            : 'This connection blends and intensifies the planetary energies';

  return (
    `${natureText} between ${p1} (${fn1}) and ${p2} (${fn2}). ` +
    `The ${dynamic} of the ${info?.label ?? aspectType} links these two areas of life, meaning that when one is activated, the other responds. ` +
    `Together, ${p1} and ${p2} form a key theme in the chart: how you express ${PLANET_KEYWORDS[p1]?.[0] ?? p1.toLowerCase()} in relation to ${PLANET_KEYWORDS[p2]?.[0] ?? p2.toLowerCase()}. ` +
    `Understanding this aspect helps you navigate the interplay between these two fundamental drives.`
  );
}

// ─── Psychological pattern ────────────────────────────────────────────────────

export function buildPsychologicalPattern(planet1: string, aspectType: string, planet2: string): string {
  const p1 = displayName(planet1);
  const p2 = displayName(planet2);
  const info = ASPECT_TYPE_INFO[aspectType];
  const nature = info?.nature ?? 'neutral';

  const kw1 = PLANET_KEYWORDS[p1] ?? [p1.toLowerCase()];
  const kw2 = PLANET_KEYWORDS[p2] ?? [p2.toLowerCase()];

  if (nature === 'harmonious') {
    return (
      `Internally, ${p1} and ${p2} support each other seamlessly. Your need for ${kw1[0]} and ${kw1[1]} ` +
      `naturally aligns with your desire for ${kw2[0]} and ${kw2[1]}. This creates an inner sense of ` +
      `wholeness — you rarely feel torn between these two drives. The challenge is that you may not ` +
      `push yourself to grow in these areas because things feel comfortable as they are.`
    );
  }
  if (nature === 'challenging') {
    return (
      `Internally, ${p1} and ${p2} create a dynamic tension. Your drive for ${kw1[0]} and ${kw1[1]} ` +
      `can feel at odds with your need for ${kw2[0]} and ${kw2[1]}. This inner conflict is not a flaw — ` +
      `it is a source of tremendous psychological depth. People with this pattern often develop ` +
      `remarkable resilience and self-awareness because they must constantly negotiate between two ` +
      `powerful inner drives.`
    );
  }
  if (nature === 'dynamic') {
    return (
      `Internally, ${p1} and ${p2} create an ongoing adjustment process. Your ${kw1[0]} nature and ` +
      `your ${kw2[0]} needs operate on different wavelengths, requiring constant calibration. ` +
      `This can feel like a background hum of slight discomfort — not a full conflict, but a ` +
      `sense that two parts of your psyche never quite sync up perfectly. Over time, this can ` +
      `become a source of unique wisdom and adaptability.`
    );
  }
  if (nature === 'creative') {
    return (
      `Internally, ${p1} and ${p2} combine through creative intelligence. Your ${kw1[0]} instincts ` +
      `and your ${kw2[0]} needs fuse into a specialized aptitude — a way of seeing or doing things ` +
      `that others find hard to replicate. This talent may feel compulsive rather than optional; ` +
      `you are driven to refine and perfect it. The pattern often shows up as an unusual ability ` +
      `to organize experience or synthesize ideas in novel ways.`
    );
  }
  // neutral (conjunction-like)
  return (
    `Internally, ${p1} and ${p2} are tightly fused. Your sense of ${kw1[0]} is deeply bound up with ` +
    `your experience of ${kw2[0]}. They are so intertwined that you may not even perceive them as ` +
    `separate drives — they form a single, powerful inner pattern. The more conscious you become of ` +
    `this fusion, the more skillfully you can direct its combined energy.`
  );
}

// ─── Real-life expression ─────────────────────────────────────────────────────

export function buildRealLifeExpression(planet1: string, aspectType: string, planet2: string): string {
  const p1 = displayName(planet1);
  const p2 = displayName(planet2);
  const info = ASPECT_TYPE_INFO[aspectType];
  const nature = info?.nature ?? 'neutral';

  const kw1 = PLANET_KEYWORDS[p1] ?? [p1.toLowerCase()];
  const kw2 = PLANET_KEYWORDS[p2] ?? [p2.toLowerCase()];

  if (nature === 'harmonious') {
    return (
      `In daily life, this aspect often shows up as natural talent or ease in areas combining ${kw1[0]} and ${kw2[0]}. ` +
      `For example, you might find it easy to express ${kw1[2] ?? kw1[0]} in ways that also satisfy your ${kw2[2] ?? kw2[0]} needs. ` +
      `Others may notice your gift for blending ${p1} and ${p2} qualities — perhaps through creative pursuits, ` +
      `relationship skills, or a natural sense of timing in professional or personal situations. ` +
      `The key is to actively use this talent rather than let it remain latent.`
    );
  }
  if (nature === 'challenging') {
    return (
      `In daily life, this aspect can manifest as situations where your ${kw1[0]} and ${kw2[0]} needs seem to conflict. ` +
      `You might feel pulled between expressing ${kw1[2] ?? kw1[0]} and maintaining ${kw2[2] ?? kw2[0]}. ` +
      `This tension often appears in relationships, career choices, or personal goals. A common pattern is ` +
      `overcompensating in one area and then swinging to the other. Over time, you learn to find a middle path ` +
      `that honors both ${p1} and ${p2}.`
    );
  }
  if (nature === 'dynamic') {
    return (
      `In daily life, this aspect shows up as a recurring need to adjust between ${kw1[0]} and ${kw2[0]}. ` +
      `You might notice that when things are going well with ${p1} matters, ${p2} issues need attention, ` +
      `and vice versa. It can feel like a perpetual calibration — not a crisis, but a constant fine-tuning. ` +
      `This develops a nuanced approach to life where you learn to hold seemingly unrelated concerns in balance.`
    );
  }
  if (nature === 'creative') {
    return (
      `In daily life, this aspect manifests as a natural gift for combining ${kw1[0]} and ${kw2[0]}. ` +
      `You may have a "knack" for something that others find hard to replicate — perhaps artistic ability, ` +
      `technical mastery, inventive thinking, or a distinctive design sense. The talent feels so natural ` +
      `that you may not even recognize it as special. Others often notice it before you do. ` +
      `This gift can become a signature strength when actively developed.`
    );
  }
  return (
    `In daily life, this aspect means that ${p1} and ${p2} always show up together. When ${kw1[0]} is ` +
    `activated, ${kw2[0]} is automatically engaged as well. This merged expression can be a powerful ` +
    `asset — you approach ${kw1[2] ?? kw1[0]} with the full force of both planetary energies behind it. ` +
    `The challenge is recognizing when one planet's needs are dominating and giving the other a voice.`
  );
}

// ─── Birth chart meaning ──────────────────────────────────────────────────────

export function buildBirthChartMeaning(planet1: string, aspectType: string, planet2: string): string {
  const p1 = displayName(planet1);
  const p2 = displayName(planet2);
  const info = ASPECT_TYPE_INFO[aspectType];
  const kw1 = PLANET_KEYWORDS[p1] ?? [p1.toLowerCase()];
  const kw2 = PLANET_KEYWORDS[p2] ?? [p2.toLowerCase()];

  return (
    `In the birth chart, the ${info?.label ?? aspectType} between ${p1} and ${p2} is a natal promise — ` +
    `a lifelong theme that colors your personality from birth. It describes how your ${kw1[0]} nature and ` +
    `your ${kw2[0]} instincts interact on the deepest level. This aspect was active at the moment you were born, ` +
    `meaning its pattern is foundational to who you are. It will be triggered and re-activated by transits and ` +
    `progressions throughout your life, each time offering new layers of understanding and growth. ` +
    `The natal aspect sets the baseline; how you work with it determines its evolution.`
  );
}

// ─── Transit meaning ──────────────────────────────────────────────────────────

export function buildTransitMeaning(planet1: string, aspectType: string, planet2: string): string {
  const p1 = displayName(planet1);
  const p2 = displayName(planet2);
  const info = ASPECT_TYPE_INFO[aspectType];
  const kw1 = PLANET_KEYWORDS[p1] ?? [p1.toLowerCase()];
  const kw2 = PLANET_KEYWORDS[p2] ?? [p2.toLowerCase()];

  return (
    `When activated by transit, the ${info?.label ?? aspectType} between ${p1} and ${p2} brings ` +
    `${kw1[0]} and ${kw2[0]} themes to the forefront of experience. A transiting planet triggering this ` +
    `aspect may bring events related to ${kw1[2] ?? kw1[0]} or ${kw2[2] ?? kw2[0]}, often simultaneously. ` +
    `The nature of the events depends on the transiting planet, but the underlying theme is the interaction ` +
    `between ${p1} and ${p2}. Pay attention to when slow-moving planets cross this aspect — those periods ` +
    `often mark significant chapters in your life story.`
  );
}

// ─── Constructive use ─────────────────────────────────────────────────────────

export function buildConstructiveUse(planet1: string, aspectType: string, planet2: string): string {
  const p1 = displayName(planet1);
  const p2 = displayName(planet2);
  const info = ASPECT_TYPE_INFO[aspectType];
  const nature = info?.nature ?? 'neutral';
  const kw1 = PLANET_KEYWORDS[p1] ?? [p1.toLowerCase()];
  const kw2 = PLANET_KEYWORDS[p2] ?? [p2.toLowerCase()];

  if (nature === 'harmonious') {
    return (
      `To make the most of this harmonious aspect, actively cultivate the talents it represents. ` +
      `Channel ${p1}'s ${kw1[0]} and ${p2}'s ${kw2[0]} into creative projects, relationships, or ` +
      `professional goals. Don't let the ease fool you into complacency — use this gift deliberately. ` +
      `Mentor others in the area where ${p1} and ${p2} combine, and seek challenges that push this ` +
      `natural talent to its highest expression.`
    );
  }
  if (nature === 'challenging') {
    return (
      `To work constructively with this challenging aspect, first acknowledge that the tension is not ` +
      `"bad" — it is a growth engine. Practice pausing when you feel pulled between ${kw1[0]} and ${kw2[0]}. ` +
      `Instead of choosing one side, look for a third option that integrates both ${p1} and ${p2}. ` +
      `Physical outlets, journaling, and conscious reflection can help transform the friction into ` +
      `productive energy. Over time, this aspect can become your greatest source of strength and wisdom.`
    );
  }
  if (nature === 'dynamic') {
    return (
      `To work with this aspect constructively, embrace the need for ongoing adjustment rather than ` +
      `seeking a permanent fix. Build routines that honor both ${p1}'s ${kw1[0]} and ${p2}'s ${kw2[0]}. ` +
      `Flexibility is your ally — rigid expectations will increase the discomfort. Consider practices ` +
      `like mindfulness or yoga that train you to hold opposing sensations in awareness without ` +
      `needing to resolve them.`
    );
  }
  if (nature === 'creative') {
    return (
      `To make the most of this creative aspect, actively cultivate and refine your talent. ` +
      `Channel ${p1}'s ${kw1[0]} and ${p2}'s ${kw2[0]} into deliberate practice — take classes, ` +
      `seek feedback, and push beyond your comfort zone in this area. The gift is real, but it ` +
      `reaches its highest expression through discipline and craft. Consider mentoring others in ` +
      `this talent; teaching often unlocks deeper mastery. Quintile-family aspects reward those ` +
      `who treat their gift as a craft rather than a given.`
    );
  }
  return (
    `To use this aspect constructively, become conscious of how ${p1} and ${p2} merge in your life. ` +
    `When you express ${kw1[0]}, notice how ${kw2[0]} is simultaneously activated. Use this awareness ` +
    `to make intentional choices rather than acting on autopilot. Channel the combined energy of these ` +
    `two planets into a focused purpose — when harnessed deliberately, this conjunction-like pattern ` +
    `can be extraordinarily powerful.`
  );
}

// ─── Beginner tip ─────────────────────────────────────────────────────────────

export function buildBeginnerTip(planet1: string, aspectType: string, planet2: string): string {
  const p1 = displayName(planet1);
  const p2 = displayName(planet2);
  const info = ASPECT_TYPE_INFO[aspectType];
  const nature = info?.nature ?? 'neutral';

  const natureNote =
    nature === 'harmonious'
      ? 'Don\'t worry — this is considered an "easy" aspect. Just remember that even easy aspects need your attention to truly shine.'
      : nature === 'challenging'
        ? 'Don\'t be alarmed by the word "challenging" — every challenging aspect is a superpower in disguise. The difficulty is temporary; the growth is permanent.'
        : nature === 'dynamic'
          ? 'This aspect is neither good nor bad — it simply requires flexibility. Think of it as a dance between two partners with different rhythms.'
          : nature === 'creative'
            ? 'This is a talent aspect — you have a natural gift here. The key is recognizing it and developing it deliberately, not just relying on it to "be there."'
            : 'This aspect blends two planetary energies together. Think of it like mixing two colors of paint — the result is a unique new shade.';

  return (
    `💡 ${natureNote} ` +
    `In simple terms: ${p1} and ${p2} are connected in your chart through a ${info?.label ?? aspectType}. ` +
    `When you notice themes of ${PLANET_KEYWORDS[p1]?.[0] ?? p1.toLowerCase()} coming up in your life, ` +
    `look for ${PLANET_KEYWORDS[p2]?.[0] ?? p2.toLowerCase()} themes showing up at the same time — ` +
    `they're linked. Understanding this connection gives you a practical tool for self-awareness.`
  );
}

// ─── Interpretation formula ───────────────────────────────────────────────────

export function buildInterpretationFormula(planet1: string, aspectType: string, planet2: string): string {
  const p1 = displayName(planet1);
  const p2 = displayName(planet2);
  const fn1 = PLANET_FUNCTIONS[p1] ?? p1;
  const fn2 = PLANET_FUNCTIONS[p2] ?? p2;
  const info = ASPECT_TYPE_INFO[aspectType];
  const dynamic = info?.dynamic ?? 'interaction';

  return `${p1} (${fn1})  +  ${info?.label ?? aspectType} → ${dynamic}  +  ${p2} (${fn2})  =  The theme of integrating ${PLANET_KEYWORDS[p1]?.[0] ?? p1.toLowerCase()} with ${PLANET_KEYWORDS[p2]?.[0] ?? p2.toLowerCase()} through ${dynamic}`;
}
