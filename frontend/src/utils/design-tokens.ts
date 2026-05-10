export const COSMIC_COLORS = {
  pageBg: '#0B0D17',
  cardBg: 'rgba(20, 22, 39, 0.7)',
  cardBgSolid: '#141627',
  border: '#2f2645',
  borderSubtle: 'rgba(255, 255, 255, 0.08)',
  textPrimary: '#ffffff',
  textSecondary: '#cbd5e1',
  textBody: '#94a3b8',
  accent: '#6b3de1',
  accentGlow: 'rgba(107, 61, 225, 0.25)',
} as const;

export const PLANET_COLORS = {
  Sun: '#FFD700',
  Moon: '#C0C0C0',
  Mercury: '#87CEEB',
  Venus: '#FF69B4',
  Mars: '#FF4500',
  Jupiter: '#FF8C00',
  Saturn: '#8B4513',
  Uranus: '#00CED1',
  Neptune: '#4169E1',
  Pluto: '#8B0000',
  NorthNode: '#9370DB',
  SouthNode: '#9370DB',
  Chiron: '#BC8F8F',
} as const;

export const ASPECT_COLORS = {
  conjunction: '#FF0000',
  opposition: '#FF4500',
  trine: '#00FF00',
  square: '#FF8C00',
  sextile: '#4169E1',
  quincunx: '#9370DB',
} as const;

export const ZODIAC_COLORS = {
  Aries: '#FF4136',
  Taurus: '#2ECC40',
  Gemini: '#FFDC00',
  Cancer: '#B10DC9',
  Leo: '#FF851B',
  Virgo: '#3D9970',
  Libra: '#0074D9',
  Scorpio: '#85144b',
  Sagittarius: '#FF6347',
  Capricorn: '#001f3f',
  Aquarius: '#7FDBFF',
  Pisces: '#39CCCC',
} as const;

/**
 * Chart UI design tokens — ring strokes, fills, gradients, tooltips, badges, etc.
 * Shared by ChartWheel (SVG) and SolarReturnChart (Canvas).
 */
export const CHART_UI_COLORS = {
  /** Fallback color for unknown planet / aspect / element */
  fallback: '#888888',

  /** Background gradient stops */
  bgGradCenter: '#0d0f1a',
  bgGradMid: '#0a0c14',
  bgGradEdge: '#070810',

  /** Outermost background disc & ring strokes */
  rimStroke: '#1e1b3a',
  zodiacSegmentStroke: '#1a1730',
  centerHubStroke: '#2d2850',

  /** Center hub fill */
  centerHubFill: '#0a0c14',
  centerHubInnerFill: '#1e1b3a',

  /** Planet disc background fill */
  planetDiscFill: '#0d0f1a',

  /** Retrograde indicator */
  retrograde: '#ef4444',

  /** Zodiac symbol carved text color */
  zodiacSymbolFill: 'rgba(255,255,255,0.10)',

  /** House line strokes — angular (1/4/7/10) vs non-angular */
  houseLineAngular: 'rgba(255,255,255,0.18)',
  houseLineNonAngular: 'rgba(255,255,255,0.07)',

  /** House number text */
  houseNumberFill: 'rgba(255,255,255,0.12)',

  /** SVG shadow / highlight filter colors */
  shadowFlood: '#000000',
  highlightFlood: '#ffffff',

  /** Tooltip background (Tailwind bg-[#151823]) */
  tooltipBg: '#151823',

  /** Aspect nature badge colors */
  natureHarmonious: '#22C55E',
  natureChallenging: '#EF4444',
  natureNeutral: '#F59E0B',
  natureMinor: '#6B7280',

  /** Element badge colors (vivid, for legend) */
  elementFire: '#EF4444',
  elementEarth: '#22C55E',
  elementAir: '#38BDF8',
  elementWater: '#6366F1',

  /** Element tints (faint, for zodiac ring segments) */
  elementTintFire: 'rgba(239, 68, 68, 0.08)',
  elementTintEarth: 'rgba(34, 197, 94, 0.08)',
  elementTintAir: 'rgba(56, 189, 248, 0.08)',
  elementTintWater: 'rgba(99, 102, 241, 0.08)',
  elementTintFallback: 'rgba(255,255,255,0.04)',

  /** Extended aspect colors (overrides / additions beyond ASPECT_COLORS) */
  aspectSextile: '#00BFFF',
  aspectSquare: '#FF6600',
  aspectQuincunx: '#9932CC',
  aspectSemiSextile: '#888888',

  // ─── SolarReturnChart (Canvas) tokens ───
  /** Canvas zodiac outer stroke & label text */
  solarOuterStroke: '#2d3748',
  /** Canvas zodiac sector fills */
  solarSectorEven: '#f7fafc',
  solarSectorOdd: '#edf2f7',
  /** Canvas inner circle stroke */
  solarInnerStroke: '#cbd5e0',
  /** Canvas house cusp line */
  solarHouseLine: '#a0aec0',
  /** Canvas house number text */
  solarHouseText: '#4a5568',
  /** Canvas selected-planet stroke */
  solarSelectedStroke: '#2d3748',
  /** Canvas white (text / stroke) */
  solarWhite: '#fff',
  /** Canvas moon-phase label */
  solarMoonLabel: '#718096',

  // ─── Astrology ChartWheel (framer-motion variant) tokens ───
  /** Outer circle stroke */
  astrologyRimStroke: '#2f2645',
  /** Planet disc fill (dark) */
  astrologyPlanetDiscFill: '#141627',
  /** Center hub fill */
  astrologyCenterHubFill: '#0B0D17',
  /** Focus ring stroke (accent) */
  astrologyFocusStroke: '#6b3de1',
  /** Angle marker color (ASC / MC) */
  astrologyAngleMarker: '#fbbf24',

  /** Astrology variant — planet colors (Tailwind-based) */
  astrologyPlanetSun: '#fbbf24',
  astrologyPlanetMoon: '#e2e8f0',
  astrologyPlanetMercury: '#a5b4fc',
  astrologyPlanetVenus: '#f472b6',
  astrologyPlanetMars: '#ef4444',
  astrologyPlanetJupiter: '#f97316',
  astrologyPlanetSaturn: '#71717a',
  astrologyPlanetUranus: '#22d3ee',
  astrologyPlanetNeptune: '#3b82f6',
  astrologyPlanetPluto: '#8b5cf6',

  /** Astrology variant — element colors (Tailwind-based, used for zodiac fill+stroke) */
  astrologyElementFire: '#ef4444',
  astrologyElementEarth: '#22c55e',
  astrologyElementAir: '#38bdf8',
  astrologyElementWater: '#6366f1',

  /** Astrology variant — aspect colors */
  astrologyAspectConjunction: '#fbbf24',
  astrologyAspectOpposition: '#ef4444',
  astrologyAspectTrine: '#3b82f6',
  astrologyAspectSquare: '#f87171',
  astrologyAspectSextile: '#22c55e',
  astrologyAspectQuincunx: '#a78bfa',

  /** House line color (faint) */
  astrologyHouseLine: 'rgba(255,255,255,0.1)',
} as const;
