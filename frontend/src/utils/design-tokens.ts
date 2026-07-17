/** Semantic design roles shared by CSS, Tailwind, and runtime-rendered UI. */
export const UI_TOKENS = {
  color: {
    canvas: 'var(--color-canvas)',
    surface: 'var(--color-surface)',
    surfaceElevated: 'var(--color-surface-elevated)',
    border: 'var(--color-border)',
    borderStrong: 'var(--color-border-strong)',
    text: 'var(--color-text)',
    textMuted: 'var(--color-text-muted)',
    textSubtle: 'var(--color-text-subtle)',
    accent: 'var(--color-accent)',
    accentSecondary: 'var(--color-accent-secondary)',
    focus: 'var(--color-focus)',
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
    danger: 'var(--color-danger)',
  },
  radius: {
    sm: 'var(--radius-sm)',
    md: 'var(--radius-md)',
    lg: 'var(--radius-lg)',
    xl: 'var(--radius-xl)',
    pill: 'var(--radius-pill)',
  },
  elevation: {
    surface: 'var(--shadow-surface)',
    elevated: 'var(--shadow-elevated)',
    overlay: 'var(--shadow-overlay)',
  },
  motion: {
    fast: 'var(--motion-fast)',
    normal: 'var(--motion-normal)',
    slow: 'var(--motion-slow)',
  },
} as const;

export type UiTokenPath =
  | keyof typeof UI_TOKENS.color
  | keyof typeof UI_TOKENS.radius
  | keyof typeof UI_TOKENS.elevation
  | keyof typeof UI_TOKENS.motion;

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
  Sun: '#FFD700', Moon: '#C0C0C0', Mercury: '#87CEEB', Venus: '#FF69B4',
  Mars: '#FF4500', Jupiter: '#FF8C00', Saturn: '#8B4513', Uranus: '#00CED1',
  Neptune: '#4169E1', Pluto: '#8B0000', NorthNode: '#9370DB', SouthNode: '#9370DB', Chiron: '#BC8F8F',
} as const;

export const ASPECT_COLORS = {
  conjunction: '#FF0000', opposition: '#FF4500', trine: '#00FF00', square: '#FF8C00', sextile: '#4169E1', quincunx: '#9370DB',
} as const;

export const ZODIAC_COLORS = {
  Aries: '#FF4136', Taurus: '#2ECC40', Gemini: '#FFDC00', Cancer: '#B10DC9', Leo: '#FF851B', Virgo: '#3D9970',
  Libra: '#0074D9', Scorpio: '#85144b', Sagittarius: '#FF6347', Capricorn: '#5dade2', Aquarius: '#7FDBFF', Pisces: '#39CCCC',
} as const;
