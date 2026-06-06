/**
 * Aspects Constants
 */

export const ASPECT_TYPES = [
  'conjunction',
  'opposition',
  'trine',
  'square',
  'sextile',
  'quincunx',
  'semi-sextile',
  'semisquare',
  'sesquisquare'
] as const;

export type AspectType = typeof ASPECT_TYPES[number];

export const ASPECT_SYMBOLS: Record<AspectType, string> = {
  conjunction: '☌',
  opposition: '☍',
  trine: '△',
  square: '□',
  sextile: '⚹',
  quincunx: '∘',
  'semi-sextile': 'semi-sextile',
  semisquare: '∠',
  sesquisquare: '⚼'
};

export const ASPECT_ANGLES: Record<AspectType, number> = {
  conjunction: 0,
  opposition: 180,
  trine: 120,
  square: 90,
  sextile: 60,
  quincunx: 150,
  'semi-sextile': 30,
  semisquare: 45,
  sesquisquare: 135
};

export const DEFAULT_ORBS: Record<AspectType, number> = {
  conjunction: 10,
  opposition: 8,
  trine: 8,
  square: 8,
  sextile: 6,
  quincunx: 3,
  'semi-sextile': 3,
  semisquare: 2,
  sesquisquare: 2
};

export const MAJOR_ASPECTS: AspectType[] = ['conjunction', 'opposition', 'trine', 'square'];
export const MINOR_ASPECTS: AspectType[] = ['sextile', 'quincunx', 'semi-sextile'];
export const MINOR_CHALLENGING_ASPECTS: AspectType[] = ['semisquare', 'sesquisquare'];
export const ALL_MINOR_ASPECTS: AspectType[] = [...MINOR_ASPECTS, ...MINOR_CHALLENGING_ASPECTS];

export const ASPECT_COLORS: Record<AspectType, string> = {
  conjunction: '#FF0000',      // Red
  opposition: '#FF0000',       // Red
  trine: '#00FF00',            // Green
  square: '#FF6600',           // Orange
  sextile: '#00BFFF',          // DeepSkyBlue
  quincunx: '#9932CC',         // DarkOrchid
  'semi-sextile': '#9370DB',   // MediumPurple
  semisquare: '#CC6600',       // DarkOrange
  sesquisquare: '#B8860B'      // DarkGoldenrod
};

export const ASPECT_QUALITIES: Record<AspectType, 'harmonious' | 'challenging' | 'neutral'> = {
  conjunction: 'neutral',
  opposition: 'challenging',
  trine: 'harmonious',
  square: 'challenging',
  sextile: 'harmonious',
  quincunx: 'challenging',
  'semi-sextile': 'neutral',
  semisquare: 'challenging',
  sesquisquare: 'challenging'
};

export const ASPECT_DESCRIPTIONS: Record<AspectType, {
  label: string;
  coreMeaning: string;
  aspectType: string;
  psychologicalPattern: string;
  beginnerTip: string;
}> = {
  conjunction: {
    label: 'Conjunction',
    coreMeaning: 'A conjunction occurs when two planets or points are close together. Their energies merge and act as a combined force.',
    aspectType: 'Intensifying / Blending Aspect',
    psychologicalPattern: 'The person may experience the two planetary functions as inseparable. This can create focus, intensity, talent, pressure, or over-identification with that combination.',
    beginnerTip: 'A conjunction is powerful, but not automatically positive or negative. Always interpret the planets, sign, house, and orb.',
  },
  opposition: {
    label: 'Opposition',
    coreMeaning: 'An opposition occurs when two planets face each other across the chart. It creates contrast, tension, projection, and the need for balance.',
    aspectType: 'Polarizing / Awareness Aspect',
    psychologicalPattern: 'The person may swing between two different needs or see one side of the aspect through other people. Oppositions often become visible through relationships, conflict, comparison, or external situations.',
    beginnerTip: 'An opposition does not mean one side must win. The goal is integration.',
  },
  trine: {
    label: 'Trine',
    coreMeaning: 'A trine shows natural flow between two planets. Their energies support each other easily.',
    aspectType: 'Harmonious / Flowing Aspect',
    psychologicalPattern: 'The person may have a natural ability, comfort, or ease connected with the planets involved.',
    beginnerTip: 'A trine is helpful, but it can become passive if not consciously used.',
  },
  square: {
    label: 'Square',
    coreMeaning: 'A square creates friction between two planets. It shows tension, pressure, conflict, and the need for action.',
    aspectType: 'Dynamic / Challenging Aspect',
    psychologicalPattern: 'The person may feel blocked, irritated, motivated, or forced to grow. Squares often describe inner conflicts that push development.',
    beginnerTip: 'Squares are not "bad." They are engines of growth. Many achievements come from square aspects.',
  },
  sextile: {
    label: 'Sextile',
    coreMeaning: 'A sextile shows cooperation and potential between two planets. It is helpful, but it usually requires conscious effort to activate.',
    aspectType: 'Supportive / Opportunity Aspect',
    psychologicalPattern: 'The person may have a skill or opportunity that develops through practice, choice, and awareness.',
    beginnerTip: 'A sextile is potential, not a guarantee.',
  },
  quincunx: {
    label: 'Quincunx (Inconjunct)',
    coreMeaning: 'A quincunx occurs when two planets do not easily understand each other. Their signs usually have different elements and modalities, creating a mismatch.',
    aspectType: 'Adjustment / Misalignment Aspect',
    psychologicalPattern: 'The person may feel that two needs cannot be satisfied at the same time. There may be discomfort, awkwardness, uncertainty, or the feeling that "something is off."',
    beginnerTip: 'A quincunx often feels subtle but irritating. It is the aspect of adjustment, recalibration, and practical adaptation.',
  },
  'semi-sextile': {
    label: 'Semi-Sextile',
    coreMeaning: 'A semisextile occurs between planets 30 degrees apart. It shows two neighboring signs that are close but very different in style.',
    aspectType: 'Subtle Adjustment Aspect',
    psychologicalPattern: 'The person may experience a mild but persistent need to coordinate two parts of life that do not naturally operate the same way.',
    beginnerTip: 'A semisextile is quiet. It usually does not shout. It nudges.',
  },
  semisquare: {
    label: 'Semi-Square',
    coreMeaning: 'A semisquare occurs at 45 degrees. It is a minor challenging aspect that creates irritation, internal pressure, or restlessness.',
    aspectType: 'Irritation / Friction Aspect',
    psychologicalPattern: 'The person may feel tension that is not as obvious as a square but still annoying enough to demand attention.',
    beginnerTip: 'A semisquare is like a small stone in the shoe. Not dramatic, but impossible to ignore forever.',
  },
  sesquisquare: {
    label: 'Sesquisquare (Sesquiquadrate)',
    coreMeaning: 'A sesquisquare occurs at 135 degrees. It is related to the square family and often shows tension, frustration, or pressure that has built up over time.',
    aspectType: 'Intensified Friction Aspect',
    psychologicalPattern: 'The person may experience irritation mixed with urgency. It can feel like unresolved tension demanding action.',
    beginnerTip: 'A sesquisquare is a minor aspect, but with a tight orb it can be very noticeable.',
  },
};
