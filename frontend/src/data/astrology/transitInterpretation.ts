/**
 * Transit Interpretation Engine
 *
 * Generates structured, deterministic interpretations for transiting-planet
 * → natal-planet/point aspects by combining:
 *   1. Transiting planet meaning (temporary influence / current activation)
 *   2. Natal planet/point meaning (personal function being activated)
 *   3. Aspect meaning (relationship between them)
 *   4. Orb strength (closeness → potency)
 *   5. Date range (active period)
 *   6. Peak date (exact or strongest moment)
 *   7. Applying / separating status (building or fading)
 *   8. Optional house information (if available)
 *
 * This is purely front-end, deterministic, and requires no AI / API calls.
 * Every combination produces a unique but coherent interpretation.
 */

import {
  getPlanetPointMeaning,
  type PlanetPointMeaning,
} from './planetPointMeanings';
import {
  ASPECT_TYPE_INFO,
  type AspectTypeInfo,
  displayName,
  getOrbInterpretation,
  getApplyingSeparatingText,
} from '../../components/astrology/aspectInterpretations';

// ─── Public Types ─────────────────────────────────────────────────────────────

export interface HouseData {
  /** House the transiting planet is currently moving through */
  transitingPlanetHouse?: number;
  /** Natal house of the natal planet / point */
  natalPlanetHouse?: number;
  /** House(s) ruled by the natal planet (if known) */
  natalPlanetRuledHouses?: number[];
}

export interface TransitInterpretationInput {
  transitingPlanet: string;
  natalPlanet: string;
  aspectType: string;
  orb: number;
  isApplying: boolean;
  startDate: string;
  endDate: string;
  peakDate: string;
  /** Optional house data – omit if not yet available */
  houseData?: HouseData;
}

export interface TransitInterpretationOutput {
  /** Header: "Transiting Saturn square Natal Sun" */
  header: string;
  /** Transiting planet section */
  transitingPlanetSection: {
    name: string;
    symbol: string;
    meaning: string;
    inTransit: string;
    keywords: string[];
  };
  /** Natal planet section */
  natalPlanetSection: {
    name: string;
    symbol: string;
    meaning: string;
    inBirthChart: string;
    keywords: string[];
  };
  /** Aspect section */
  aspectSection: {
    label: string;
    nature: 'harmonious' | 'challenging' | 'neutral' | 'dynamic' | 'creative';
    description: string;
    dynamic: string;
  };
  /** Orb strength */
  orbSection: {
    degrees: number;
    level: string;
    description: string;
  };
  /** Applying / separating */
  statusSection: {
    isApplying: boolean;
    label: string;
    text: string;
  };
  /** Date range */
  dateSection: {
    startDate: string;
    endDate: string;
    peakDate: string;
    formattedStart: string;
    formattedEnd: string;
    formattedPeak: string;
  };
  /** Optional house synthesis */
  houseSection: {
    available: boolean;
    transitingPlanetHouse?: number;
    natalPlanetHouse?: number;
    natalPlanetRuledHouses?: number[];
    synthesis: string;
  };
  /** Main synthesis paragraph */
  synthesis: string;
  /** What to watch for */
  manifestations: string[];
  /** Constructive approach */
  advice: string;
  /** Beginner-friendly summary */
  beginnerSummary: string;
}

// ─── Helper: Date formatting ──────────────────────────────────────────────────

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}



// ─── Transit-specific planet meanings ─────────────────────────────────────────

/**
 * When a planet is *transiting*, it carries a temporary thematic influence.
 * These are richer than the generic planet functions — they describe what
 * kind of weather that planet brings when it transits over natal points.
 */
const TRANSIT_PLANET_THEMES: Record<string, string> = {
  Sun:
    'Illumination, vitality, and conscious focus. The transiting Sun highlights whatever it touches, bringing attention, energy, and clarity for a few days.',
  Moon:
    'Emotional tides, instincts, and shifting moods. The transiting Moon colors the emotional atmosphere briefly (2–3 days), activating feelings and habits.',
  Mercury:
    'Thinking, communication, information flow, and short trips. Transiting Mercury activates conversations, ideas, messages, and mental activity.',
  Venus:
    'Love, pleasure, values, and aesthetic awareness. Transiting Venus brings grace, attraction, social ease, and attention to beauty and relationships.',
  Mars:
    'Energy, drive, assertiveness, and sometimes conflict. Transiting Mars activates ambition, courage, irritation, and the urge to take action.',
  Jupiter:
    'Expansion, opportunity, optimism, and growth. Transiting Jupiter opens doors, amplifies whatever it touches, and can bring abundance or excess.',
  Saturn:
    'Pressure, responsibility, realism, limits, and maturity. Transiting Saturn demands accountability, strips away illusions, and builds lasting structure.',
  Uranus:
    'Disruption, sudden change, breakthrough, and liberation. Transiting Uranus shakes up stagnant patterns, brings surprises, and demands authenticity.',
  Neptune:
    'Dissolution, idealism, confusion, spirituality, and creativity. Transiting Neptune blurs boundaries, inspires dreams, and can cloud judgment.',
  Pluto:
    'Transformation, power, intensity, death-and-rebirth. Transiting Pluto strips away what is false, forces deep psychological change, and empowers regeneration.',
  Chiron:
    'Wounding, healing, and teaching through vulnerability. Transiting Chiron activates old pain and offers the opportunity to heal and teach from experience.',
  NorthNode:
    'Karmic activation, fated encounters, and growth-direction triggers. Transiting North Node can bring pivotal events aligned with soul purpose.',
  SouthNode:
    'Past-pattern activation, release, and karmic returns. Transiting South Node may bring people or situations from the past for completion or letting go.',
  Ascendant:
    'Persona shifts, identity activation, and changes in how others perceive you. Transits to the Ascendant affect outward behavior and physical vitality.',
  Midheaven:
    'Career shifts, public visibility, and life-direction activation. Transits to the Midheaven often coincide with professional milestones.',
  Lilith:
    'Repressed desires, shadow material, and primal power rising. Transiting Lilith triggers confrontations with what has been denied or silenced.',
  PartOfFortune:
    'Luck, joy, and material well-being activation. Transiting contacts to the Part of Fortune can bring fortunate breaks or satisfaction.',
};

// ─── Core synthesis builder ───────────────────────────────────────────────────

function buildSynthesis(
  tp: PlanetPointMeaning,
  np: PlanetPointMeaning,
  aspect: AspectTypeInfo,
  orbInfo: { level: string; description: string },
  isApplying: boolean,
  houseData?: HouseData,
): { synthesis: string; manifestations: string[]; advice: string; beginnerSummary: string } {
  const tpName = tp.name;
  const npName = np.name;
  const tpKw = tp.keywords;
  const npKw = np.keywords;
  const nature = aspect.nature;
  const dynamic = aspect.dynamic;

  // ── Main synthesis paragraph ──
  const orbStrength =
    orbInfo.level.includes('Exact') || orbInfo.level.includes('Very tight')
      ? 'powerfully and unmistakably'
      : orbInfo.level.includes('Tight')
        ? 'strongly and noticeably'
        : orbInfo.level.includes('Moderate')
          ? 'steadily'
          : 'subtly, in the background';

  const statusPhrase = isApplying
    ? 'This influence is still building — the peak is yet to come.'
    : 'This influence has peaked and is now gradually fading, though still active.';

  let synthesis = '';

  if (nature === 'challenging') {
    synthesis =
      `Transiting ${tpName} is currently ${dynamic} your natal ${npName}, activating themes of ${tpKw[0]}, ${tpKw[1]}, and ${npKw[0]}. ` +
      `This transit may bring pressure, tension, or friction around areas of life connected to ${npKw[0]} and ${npKw[2] ?? npKw[0]}. ` +
      `You may feel tested, blocked, or forced to confront realities you have been avoiding. ` +
      `The purpose is not punishment — it is growth. The ${aspect.label} demands that you develop maturity, stronger structure, and clearer self-definition. ` +
      `This influence is operating ${orbStrength}. ${statusPhrase}`;
  } else if (nature === 'harmonious') {
    synthesis =
      `Transiting ${tpName} is currently in a flowing ${aspect.label} with your natal ${npName}, bringing ease and natural support to themes of ${tpKw[0]}, ${tpKw[1]}, and ${npKw[0]}. ` +
      `This is a period where things related to ${npKw[2] ?? npKw[0]} and ${tpKw[2] ?? tpKw[0]} tend to go smoothly. ` +
      `Opportunities may arise effortlessly, and you may feel more confident, supported, or creatively inspired. ` +
      `This influence is operating ${orbStrength}. ${statusPhrase} ` +
      `The invitation is to actively use this support rather than take it for granted.`;
  } else if (nature === 'dynamic') {
    synthesis =
      `Transiting ${tpName} is currently forming a ${aspect.label} with your natal ${npName}, creating an ongoing adjustment between ${tpKw[0]} and ${npKw[0]}. ` +
      `This transit requires continual calibration — you may feel that two areas of life don't quite sync up, needing constant fine-tuning. ` +
      `It is not a crisis, but a persistent hum of adjustment around ${npKw[1]} and ${tpKw[1]}. ` +
      `This influence is operating ${orbStrength}. ${statusPhrase}`;
  } else {
    // neutral / conjunction-like
    synthesis =
      `Transiting ${tpName} is currently conjunct or merged with your natal ${npName}, fusing the energies of ${tpKw[0]} and ${npKw[0]} into a single concentrated force. ` +
      `This activation amplifies both ${tpKw[1]} and ${npKw[1]} themes simultaneously — when one is triggered, the other responds automatically. ` +
      `This influence is operating ${orbStrength}. ${statusPhrase}`;
  }

  // ── House augmentation ──
  if (houseData) {
    const houseParts: string[] = [];
    if (houseData.transitingPlanetHouse) {
      houseParts.push(
        `The transiting ${tpName} is currently moving through your ${ordinal(houseData.transitingPlanetHouse)} house, focusing its energy on that life area.`,
      );
    }
    if (houseData.natalPlanetHouse) {
      houseParts.push(
        `Your natal ${npName} resides in the ${ordinal(houseData.natalPlanetHouse)} house, which is the domain being activated.`,
      );
    }
    if (houseData.natalPlanetRuledHouses && houseData.natalPlanetRuledHouses.length > 0) {
      const ruled = houseData.natalPlanetRuledHouses.map((h) => ordinal(h)).join(' and ');
      houseParts.push(
        `The natal ${npName} rules your ${ruled} house(s), so those areas may also be affected.`,
      );
    }
    if (houseParts.length > 0) {
      synthesis += ' ' + houseParts.join(' ');
    }
  }

  // ── Manifestations ──
  const manifestations = buildManifestations(tp, np, nature);

  // ── Advice ──
  const advice = buildAdvice(tp, np, nature, isApplying);

  // ── Beginner summary ──
  const beginnerSummary = buildBeginnerSummary(tp, np, aspect, isApplying);

  return { synthesis, manifestations, advice, beginnerSummary };
}

// ─── Manifestation builder ────────────────────────────────────────────────────

function buildManifestations(
  tp: PlanetPointMeaning,
  np: PlanetPointMeaning,
  nature: string,
): string[] {
  const tpKw = tp.keywords;
  const npKw = np.keywords;

  const common = [
    `Increased focus on ${npKw[0]} and ${tpKw[0]} themes`,
    `Events or feelings related to ${npKw[1]} may surface`,
  ];

  if (nature === 'challenging') {
    return [
      ...common,
      `Feeling tested, blocked, or pressured in areas related to ${npKw[2] ?? npKw[0]}`,
      `Tension between the need for ${tpKw[0]} and the desire for ${npKw[0]}`,
      `Situations that demand maturity, patience, or restructuring`,
      `Possible fatigue, frustration, or confrontation with limitations`,
    ];
  }
  if (nature === 'harmonious') {
    return [
      ...common,
      `Natural ease and flow in areas related to ${npKw[2] ?? npKw[0]}`,
      `Opportunities, support, or fortunate timing`,
      `Creative inspiration or relationship harmony`,
      `Confidence and positive momentum`,
    ];
  }
  if (nature === 'dynamic') {
    return [
      ...common,
      `A sense that two parts of life are slightly out of sync`,
      `Needing to adjust, recalibrate, or compromise`,
      `Recurring minor issues that require attention`,
      `Growth through flexibility and adaptation`,
    ];
  }
  // neutral / conjunction-like
  return [
    ...common,
    `Intense, concentrated energy blending ${tpKw[0]} and ${npKw[0]}`,
    `New beginnings or major activations related to both planets`,
    `A strong sense that "${tpKw[0]}" and "${npKw[0]}" are inseparable right now`,
  ];
}

// ─── Advice builder ───────────────────────────────────────────────────────────

function buildAdvice(
  tp: PlanetPointMeaning,
  np: PlanetPointMeaning,
  nature: string,
  isApplying: boolean,
): string {
  const tpKw = tp.keywords;
  const npKw = np.keywords;

  const timingNote = isApplying
    ? 'Since this transit is still approaching, use the remaining time to prepare and set intentions.'
    : 'Since this transit is separating, focus on integrating the lessons it has brought.';

  if (nature === 'challenging') {
    return (
      `This is not a time to force outcomes, but to build real structure. ` +
      `Acknowledge the pressure around ${npKw[0]} and ${tpKw[0]} without resisting it. ` +
      `Practical steps: define boundaries, commit to what matters, release what doesn't. ` +
      `Physical outlets, journaling, and honest self-reflection are especially helpful now. ` +
      `The friction is a growth engine — what you build during this transit will last. ` +
      timingNote
    );
  }
  if (nature === 'harmonious') {
    return (
      `This is a favorable period for ${npKw[0]} and ${tpKw[0]} related goals. ` +
      `Take advantage of the flow — initiate projects, nurture relationships, and express creativity. ` +
      `Don't let the ease lead to complacency. Use this support deliberately. ` +
      timingNote
    );
  }
  if (nature === 'dynamic') {
    return (
      `Embrace the need for ongoing adjustment. Build routines that honor both ${tpKw[0]} and ${npKw[0]}. ` +
      `Flexibility is your ally — rigid expectations will increase discomfort. ` +
      `Practices like mindfulness or journaling help you hold competing needs in balance. ` +
      timingNote
    );
  }
  return (
    `This concentrated energy can be a powerful asset if directed consciously. ` +
    `When you notice ${tpKw[0]} themes, be aware that ${npKw[0]} is simultaneously activated. ` +
    `Use this merged energy for a focused purpose — channel it into meaningful action. ` +
    timingNote
  );
}

// ─── Beginner summary ─────────────────────────────────────────────────────────

function buildBeginnerSummary(
  tp: PlanetPointMeaning,
  np: PlanetPointMeaning,
  aspect: AspectTypeInfo,
  isApplying: boolean,
): string {
  const nature = aspect.nature;
  const natureNote =
    nature === 'harmonious'
      ? "This is generally considered an 'easy' transit — things flow in your favor."
      : nature === 'challenging'
        ? "Don't be alarmed — challenging transits are growth opportunities in disguise. The difficulty is temporary; the growth is permanent."
        : nature === 'dynamic'
          ? 'This transit asks for flexibility — think of it as a dance between two different rhythms.'
          : 'This transit blends two planetary energies together like mixing two colors of paint.';

  const statusNote = isApplying
    ? 'The transit is building toward its peak.'
    : 'The transit has passed its peak and is winding down.';

  return (
    `💡 ${natureNote} ` +
    `In simple terms: the current position of ${tp.name} is activating your natal ${np.name} through a ${aspect.label}. ` +
    `This means themes of ${tp.keywords[0]} and ${np.keywords[0]} are highlighted right now. ` +
    `${statusNote}`
  );
}

// ─── Ordinal helper ───────────────────────────────────────────────────────────

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
}

// ─── House synthesis text ─────────────────────────────────────────────────────

function buildHouseSynthesis(
  tpName: string,
  npName: string,
  houseData: HouseData | undefined,
): string {
  if (!houseData) return '';
  const parts: string[] = [];
  if (houseData.transitingPlanetHouse) {
    parts.push(
      `${tpName} is transiting through the ${ordinal(houseData.transitingPlanetHouse)} house, directing its energy into that life area.`,
    );
  }
  if (houseData.natalPlanetHouse) {
    parts.push(
      `${npName} is located in the ${ordinal(houseData.natalPlanetHouse)} house in the natal chart — this is the domain being activated.`,
    );
  }
  if (houseData.natalPlanetRuledHouses && houseData.natalPlanetRuledHouses.length > 0) {
    const ruled = houseData.natalPlanetRuledHouses.map((h) => ordinal(h)).join(' and ');
    parts.push(
      `${npName} rules the ${ruled} house(s), so those areas are also affected by this transit.`,
    );
  }
  return parts.join(' ');
}

// ─── Main export: interpret transit ───────────────────────────────────────────

/**
 * Generate a complete, structured interpretation for a single transit.
 *
 * Returns null if planet data is missing (should not happen with our data,
 * but defensive).
 */
export function interpretTransit(
  input: TransitInterpretationInput,
): TransitInterpretationOutput | null {
  const tpMeaning = getPlanetPointMeaning(input.transitingPlanet);
  const npMeaning = getPlanetPointMeaning(input.natalPlanet);
  const aspectInfo = ASPECT_TYPE_INFO[input.aspectType];

  // Need at least both planets to generate an interpretation
  if (!tpMeaning && !npMeaning) return null;

  // Fallback for partial data
  const tp = tpMeaning ?? {
    id: input.transitingPlanet.toLowerCase(),
    name: displayName(input.transitingPlanet),
    symbol: '',
    keywords: [input.transitingPlanet.toLowerCase()],
    coreFunction: `the energies of ${input.transitingPlanet}`,
    description: '',
    beginnerTip: '',
    inBirthChart: '',
    inTransit: TRANSIT_PLANET_THEMES[displayName(input.transitingPlanet)] ?? '',
    healthyExpression: '',
    difficultExpression: '',
  };

  const np = npMeaning ?? {
    id: input.natalPlanet.toLowerCase(),
    name: displayName(input.natalPlanet),
    symbol: '',
    keywords: [input.natalPlanet.toLowerCase()],
    coreFunction: `the energies of ${input.natalPlanet}`,
    description: '',
    beginnerTip: '',
    inBirthChart: '',
    inTransit: '',
    healthyExpression: '',
    difficultExpression: '',
  };

  const aspect: AspectTypeInfo = aspectInfo ?? {
    label: input.aspectType,
    nature: 'neutral',
    color: 'text-slate-400',
    description: `${input.aspectType} aspect connecting two planetary energies.`,
    dynamic: 'interaction',
  };

  const orbInfo = getOrbInterpretation(Math.abs(input.orb));
  const applyingText = getApplyingSeparatingText(
    input.isApplying,
    displayName(input.transitingPlanet),
    displayName(input.natalPlanet),
    input.aspectType,
  );

  const houseSynthesisText = buildHouseSynthesis(tp.name, np.name, input.houseData);
  const { synthesis, manifestations, advice, beginnerSummary } = buildSynthesis(
    tp,
    np,
    aspect,
    orbInfo,
    input.isApplying,
    input.houseData,
  );

  return {
    header: `Transiting ${tp.name} ${aspect.label.split(' ')[0]} Natal ${np.name}`,

    transitingPlanetSection: {
      name: tp.name,
      symbol: tp.symbol,
      meaning:
        TRANSIT_PLANET_THEMES[tp.name] ?? tp.inTransit ?? tp.coreFunction,
      inTransit: tp.inTransit || TRANSIT_PLANET_THEMES[tp.name] || '',
      keywords: tp.keywords,
    },

    natalPlanetSection: {
      name: np.name,
      symbol: np.symbol,
      meaning: np.coreFunction,
      inBirthChart: np.inBirthChart,
      keywords: np.keywords,
    },

    aspectSection: {
      label: aspect.label,
      nature: aspect.nature,
      description: aspect.description,
      dynamic: aspect.dynamic,
    },

    orbSection: {
      degrees: input.orb,
      level: orbInfo.level,
      description: orbInfo.description,
    },

    statusSection: {
      isApplying: input.isApplying,
      label: input.isApplying ? 'Applying (building)' : 'Separating (fading)',
      text: applyingText,
    },

    dateSection: {
      startDate: input.startDate,
      endDate: input.endDate,
      peakDate: input.peakDate,
      formattedStart: fmtDate(input.startDate),
      formattedEnd: fmtDate(input.endDate),
      formattedPeak: fmtDate(input.peakDate),
    },

    houseSection: {
      available: !!input.houseData,
      transitingPlanetHouse: input.houseData?.transitingPlanetHouse,
      natalPlanetHouse: input.houseData?.natalPlanetHouse,
      natalPlanetRuledHouses: input.houseData?.natalPlanetRuledHouses,
      synthesis: houseSynthesisText,
    },

    synthesis,
    manifestations,
    advice,
    beginnerSummary,
  };
}
