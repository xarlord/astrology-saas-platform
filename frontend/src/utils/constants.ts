/**
 * AstroVerse Design System Constants
 *
 * Centralized design tokens and application constants
 * Export these for use throughout the application
 */

// ===========================================
// COLOR PALETTE
// ===========================================

export const colors = {
  // Primary brand colors
  primary: {
    DEFAULT: '#6b3de1',
    dark: '#5a32c0',
    light: '#a78bfa',
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8B5CF6',
    600: '#6b3de1',
    700: '#5a32c0',
    800: '#4c1d95',
    900: '#4c1d95',
  },

  // Cosmic theme colors
  cosmicBlue: {
    DEFAULT: '#2563EB',
    dark: '#1d4ed8',
    light: '#60a5fa',
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563EB',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  accentGold: {
    DEFAULT: '#F5A623',
    dark: '#d97706',
    light: '#fbbf24',
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#F5A623',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  // Background colors
  background: {
    dark: '#0B0D17',
    light: '#f8fafc',
  },

  surface: {
    dark: '#151725',
    light: '#ffffff',
  },

  // Glassmorphism colors
  glass: {
    bg: 'rgba(255, 255, 255, 0.05)',
    bgHover: 'rgba(255, 255, 255, 0.1)',
    border: 'rgba(255, 255, 255, 0.1)',
    shadow: 'rgba(0, 0, 0, 0.1)',
  },

  // Semantic colors
  success: {
    DEFAULT: '#10B981',
    light: '#34D399',
    dark: '#059669',
  },

  warning: {
    DEFAULT: '#F59E0B',
    light: '#FBBF24',
    dark: '#D97706',
  },

  error: {
    DEFAULT: '#EF4444',
    light: '#F87171',
    dark: '#DC2626',
  },

  info: {
    DEFAULT: '#3B82F6',
    light: '#60A5FA',
    dark: '#2563EB',
  },

  // Zodiac element colors
  zodiac: {
    fire: '#EF4444',      // Aries, Leo, Sagittarius
    earth: '#10B981',     // Taurus, Virgo, Capricorn
    air: '#3B82F6',       // Gemini, Libra, Aquarius
    water: '#6366F1',     // Cancer, Scorpio, Pisces
  },

  // Planet colors
  planet: {
    sun: '#FFD700',
    moon: '#C0C0C0',
    mercury: '#8B4513',
    venus: '#FF69B4',
    mars: '#FF0000',
    jupiter: '#FFA500',
    saturn: '#696969',
    uranus: '#40E0D0',
    neptune: '#4169E1',
    pluto: '#8B0000',
  },

  // Aspect colors
  aspect: {
    conjunction: '#FFD700',
    opposition: '#EF4444',
    trine: '#10B981',
    square: '#F59E0B',
    sextile: '#3B82F6',
    quincunx: '#8B5CF6',
    semisextile: '#EC4899',
  },
} as const;

// ===========================================
// TYPOGRAPHY
// ===========================================

export const typography = {
  fontFamily: {
    display: "'Space Grotesk', sans-serif",
    body: "'Noto Sans', sans-serif",
    special: "'Epilogue', sans-serif",
    sans: "'Noto Sans', system-ui, sans-serif",
  },

  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
    '6xl': '3.75rem',   // 60px
    '7xl': '4.5rem',    // 72px
    '8xl': '6rem',      // 96px
  },

  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.7,
    loose: 2,
  },

  letterSpacing: {
    tight: '-0.02em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
  },
} as const;

// ===========================================
// SPACING
// ===========================================

export const spacing = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem',    // 48px
  '3xl': '4rem',    // 64px
  '4xl': '6rem',    // 96px
  '5xl': '8rem',    // 128px
} as const;

// ===========================================
// BORDERS
// ===========================================

export const borders = {
  radius: {
    none: '0',
    sm: '0.125rem',   // 2px
    md: '0.375rem',   // 6px
    lg: '1rem',       // 16px
    xl: '1.5rem',     // 24px
    '2xl': '2rem',    // 32px
    '3xl': '3rem',    // 48px
    full: '9999px',
  },

  width: {
    thin: '1px',
    normal: '2px',
    thick: '4px',
  },
} as const;

// ===========================================
// EFFECTS
// ===========================================

export const effects = {
  // Shadows
  shadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    glass: '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
    glow: '0 0 20px rgba(107, 61, 225, 0.3)',
    glowLg: '0 0 40px rgba(107, 61, 225, 0.4)',
    innerGlow: 'inset 0 0 20px rgba(107, 61, 225, 0.1)',
  },

  // Blur
  blur: {
    xs: '2px',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
    '3xl': '32px',
  },

  // Transitions
  transition: {
    fast: '150ms ease',
    normal: '300ms ease',
    slow: '500ms ease',
  },

  // Backdrop blur
  backdropBlur: '12px',
} as const;

// ===========================================
// BREAKPOINTS
// ===========================================

export const breakpoints = {
  sm: '640px',    // Mobile landscape
  md: '768px',    // Tablet
  lg: '1024px',   // Desktop
  xl: '1280px',   // Wide desktop
  '2xl': '1536px', // Extra wide desktop
} as const;

// ===========================================
// Z-INDEX SCALE
// ===========================================

export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
  notification: 80,
  max: 100,
} as const;

// ===========================================
// ASTROLOGY CONSTANTS
// ===========================================

export const astrology = {
  // Zodiac signs
  signs: [
    { name: 'Aries', symbol: '♈', element: 'fire', quality: 'cardinal' },
    { name: 'Taurus', symbol: '♉', element: 'earth', quality: 'fixed' },
    { name: 'Gemini', symbol: '♊', element: 'air', quality: 'mutable' },
    { name: 'Cancer', symbol: '♋', element: 'water', quality: 'cardinal' },
    { name: 'Leo', symbol: '♌', element: 'fire', quality: 'fixed' },
    { name: 'Virgo', symbol: '♍', element: 'earth', quality: 'mutable' },
    { name: 'Libra', symbol: '♎', element: 'air', quality: 'cardinal' },
    { name: 'Scorpio', symbol: '♏', element: 'water', quality: 'fixed' },
    { name: 'Sagittarius', symbol: '♐', element: 'fire', quality: 'mutable' },
    { name: 'Capricorn', symbol: '♑', element: 'earth', quality: 'cardinal' },
    { name: 'Aquarius', symbol: '♒', element: 'air', quality: 'fixed' },
    { name: 'Pisces', symbol: '♓', element: 'water', quality: 'mutable' },
  ],

  // Planets
  planets: [
    { name: 'Sun', symbol: '☉', abbr: 'SU' },
    { name: 'Moon', symbol: '☽', abbr: 'MO' },
    { name: 'Mercury', symbol: '☿', abbr: 'ME' },
    { name: 'Venus', symbol: '♀', abbr: 'VE' },
    { name: 'Mars', symbol: '♂', abbr: 'MA' },
    { name: 'Jupiter', symbol: '♃', abbr: 'JU' },
    { name: 'Saturn', symbol: '♄', abbr: 'SA' },
    { name: 'Uranus', symbol: '♅', abbr: 'UR' },
    { name: 'Neptune', symbol: '♆', abbr: 'NE' },
    { name: 'Pluto', symbol: '♇', abbr: 'PL' },
  ],

  // Aspects
  aspects: [
    { name: 'Conjunction', angle: 0, orb: 10, symbol: '☌' },
    { name: 'Semi-Sextile', angle: 30, orb: 2, symbol: '⚺' },
    { name: 'Sextile', angle: 60, orb: 6, symbol: '⚹' },
    { name: 'Square', angle: 90, orb: 8, symbol: '□' },
    { name: 'Trine', angle: 120, orb: 8, symbol: '△' },
    { name: 'Quincunx', angle: 150, orb: 2, symbol: '⚻' },
    { name: 'Opposition', angle: 180, orb: 10, symbol: '☍' },
  ],

  // Houses
  houses: Array.from({ length: 12 }, (_, i) => i + 1),

  // Elements
  elements: {
    fire: ['Aries', 'Leo', 'Sagittarius'],
    earth: ['Taurus', 'Virgo', 'Capricorn'],
    air: ['Gemini', 'Libra', 'Aquarius'],
    water: ['Cancer', 'Scorpio', 'Pisces'],
  },

  // Qualities
  qualities: {
    cardinal: ['Aries', 'Cancer', 'Libra', 'Capricorn'],
    fixed: ['Taurus', 'Leo', 'Scorpio', 'Aquarius'],
    mutable: ['Gemini', 'Virgo', 'Sagittarius', 'Pisces'],
  },
} as const;

// ===========================================
// LAYOUT CONSTANTS
// ===========================================

export const layout = {
  // Container widths
  container: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Header heights
  header: {
    mobile: '56px',
    desktop: '64px',
  },

  // Sidebar widths
  sidebar: {
    mobile: '240px',
    desktop: '280px',
    collapsed: '64px',
  },

  // Grid
  grid: {
    columns: {
      sm: 1,
      md: 2,
      lg: 3,
      xl: 4,
      '2xl': 6,
    },
    gap: {
      sm: '1rem',
      md: '1.5rem',
      lg: '2rem',
    },
  },
} as const;

// ===========================================
// FORM CONSTANTS
// ===========================================

export const forms = {
  // Input heights
  height: {
    sm: '2rem',     // 32px
    md: '2.5rem',   // 40px
    lg: '3rem',     // 48px
  },

  // Validation
  validation: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    maxTextAreaLength: 2000,
    maxInputLength: 500,
  },

  // Date formats
  dateFormat: 'YYYY-MM-DD',
  dateTimeFormat: 'YYYY-MM-DD HH:mm',
  displayDateFormat: 'MMMM D, YYYY',
  displayDateTimeFormat: 'MMMM D, YYYY at h:mm A',
} as const;

// ===========================================
// ANIMATION CONSTANTS
// ===========================================

export const animations = {
  // Durations
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },

  // Easing
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    custom: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Presets
  presets: {
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    slideUp: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
    },
    scaleIn: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
    },
  },
} as const;

// ===========================================
// API CONSTANTS
// ===========================================

export const api = {
  // Base URL (will be configured based on environment)
  baseUrl: (import.meta.env.VITE_API_URL ?? '') || 'http://localhost:3000/api/v1',

  // Timeouts
  timeout: {
    short: 5000,   // 5s
    normal: 10000, // 10s
    long: 30000,   // 30s
  },

  // Retry configuration
  retry: {
    attempts: 3,
    delay: 1000,
  },

  // Endpoints
  endpoints: {
    auth: {
      login: '/auth/login',
      register: '/auth/register',
      logout: '/auth/logout',
      refresh: '/auth/refresh',
    },
    charts: '/charts',
    calendar: '/calendar',
    synastry: '/synastry',
    transits: '/transits',
    reports: '/reports',
  },
} as const;

// ===========================================
// SUBSCRIPTION TIERS
// ===========================================

export const subscriptionTiers = {
  free: {
    name: 'Free',
    maxCharts: 1,
    features: ['basic_charts', 'daily_transits'],
  },
  mystic: {
    name: 'Mystic',
    maxCharts: 10,
    features: ['basic_charts', 'daily_transits', 'synastry', 'solar_returns'],
  },
  oracle: {
    name: 'Oracle',
    maxCharts: -1, // Unlimited
    features: ['all'],
  },
} as const;

// ===========================================
// TIMEOUT CONSTANTS (in milliseconds)
// ===========================================

export const TIMEOUTS = {
  // Toast/Notification durations
  TOAST_DURATION_MS: 3000,
  SUCCESS_MESSAGE_DURATION_MS: 3000,
  COPY_FEEDBACK_DURATION_MS: 2000,
  SAVE_STATUS_DURATION_MS: 2000,
  SAVE_ERROR_DURATION_MS: 3000,

  // Focus management
  FOCUS_DELAY_MS: 100,

  // Debounce/Throttle
  DEBOUNCE_DELAY_MS: 300,
  THROTTLE_DELAY_MS: 100,

  // API timeouts
  API_DEFAULT_TIMEOUT_MS: 30000,
  API_SHORT_TIMEOUT_MS: 5000,
  API_LONG_TIMEOUT_MS: 60000,
  FILE_UPLOAD_TIMEOUT_MS: 30000,
  CALENDAR_EXPORT_TIMEOUT_MS: 60000,

  // Loading states
  SIMULATED_LOADING_MS: 1000,
  REPORT_LOADING_MS: 3000,
  TRANSIT_LOADING_MS: 1500,
} as const;

// ===========================================
// INTENSITY THRESHOLDS
// ===========================================

export const INTENSITY_THRESHOLDS = {
  // General intensity levels (1-10 scale)
  LOW_MAX: 3,
  MEDIUM_MAX: 6,
  HIGH_MAX: 8,

  // Specific thresholds
  CHALLENGING_MAX: 4,
  EXCELLENT_MIN: 8,
  GOOD_MIN: 6,
  MODERATE_MIN: 4,
} as const;

// ===========================================
// HTTP & API CONSTANTS
// ===========================================

export const HTTP = {
  // Content Types
  CONTENT_TYPE_JSON: 'application/json',
  CONTENT_TYPE_HTML: 'text/html',
  CONTENT_TYPE_FORM_DATA: 'multipart/form-data',

  // Headers
  HEADER_CONTENT_TYPE: 'Content-Type',
  HEADER_AUTHORIZATION: 'Authorization',

  // Auth prefix
  BEARER_PREFIX: 'Bearer ',

  // HTTP Status Codes
  STATUS_BAD_REQUEST: 400,
  STATUS_UNAUTHORIZED: 401,
  STATUS_FORBIDDEN: 403,
  STATUS_NOT_FOUND: 404,
  STATUS_TOO_MANY_REQUESTS: 429,
  STATUS_INTERNAL_ERROR: 500,

  // Retry configuration
  DEFAULT_RETRIES: 3,
  DEFAULT_RETRY_DELAY_MS: 1000,
  SLOW_REQUEST_THRESHOLD_MS: 1000,
} as const;

// ===========================================
// CACHE CONSTANTS
// ===========================================

export const CACHE = {
  // Service worker cache durations (in seconds)
  ONE_HOUR_SECONDS: 60 * 60,
  ONE_DAY_SECONDS: 60 * 60 * 24,
  ONE_WEEK_SECONDS: 60 * 60 * 24 * 7,
  THIRTY_DAYS_SECONDS: 60 * 60 * 24 * 30,
} as const;

// ===========================================
// UI CONSTANTS
// ===========================================

export const UI = {
  // Likelihood scale
  LIKELIHOOD_MAX: 10,

  // Intensity scale
  INTENSITY_MAX: 10,

  // Theme slice limit
  THEMES_DISPLAY_LIMIT: 3,
} as const;

// ===========================================
// EVENT COLORS
// ===========================================

export const EVENT_COLORS = {
  // Calendar event types
  NEW_MOON: '#C0C0C0',
  FULL_MOON: '#FFD700',
  LUNAR_PHASE: '#94a3b8',
  RETROGRADE: '#FF6B6B',
  ECLIPSE: '#F59E0B',
  INGRESS: '#4D96FF',
  TRANSIT: '#6b3de1',
  ASPECT: '#a855f7',
  CUSTOM: '#22c55e',

  // Intensity-based colors
  HIGH_INTENSITY: '#F59E0B',
  CHALLENGING: '#EF4444',
  NEUTRAL: '#10B981',
  EXCELLENT: '#10b981',
  GOOD: '#f59e0b',

  // Social media brand colors
  GOOGLE_BLUE: '#4285F4',
  GOOGLE_GREEN: '#34A853',
  GOOGLE_YELLOW: '#FBBC05',
  GOOGLE_RED: '#EA4335',
} as const;

// ===========================================
// BACKGROUND COLORS
// ===========================================

export const BACKGROUND_COLORS = {
  DARK_BG: '#0B0D17',
  SURFACE_DARK: '#141627',
  SURFACE_LIGHTER: '#1a1d2d',
  BORDER_DARK: '#2f2645',
  GRADIENT_PURPLE: '#8b5cf6',
} as const;

// ===========================================
// LOCAL STORAGE KEYS
// ===========================================

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  THEME: 'theme',
} as const;

// ===========================================
// ROUTES
// ===========================================

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  CHARTS: '/charts',
  CALENDAR: '/calendar',
  PROFILE: '/profile',
  SETTINGS: '/settings',
} as const;

// ===========================================
// DATE FORMATS
// ===========================================

export const DATE_FORMATS = {
  ISO_DATE: 'YYYY-MM-DD',
  ISO_DATETIME: 'YYYY-MM-DD HH:mm',
  DISPLAY_DATE: 'MMMM D, YYYY',
  DISPLAY_DATETIME: 'MMMM D, YYYY at h:mm A',
  SHORT_DATE: 'MMM D',
} as const;

// ===========================================
// EXPORT ALL CONSTANTS
// ===========================================

export const designTokens = {
  colors,
  typography,
  spacing,
  borders,
  effects,
  breakpoints,
  zIndex,
  layout,
  forms,
  animations,
};

export default {
  colors,
  typography,
  spacing,
  borders,
  effects,
  breakpoints,
  zIndex,
  astrology,
  layout,
  forms,
  animations,
  api,
  subscriptionTiers,
  designTokens,
  TIMEOUTS,
  INTENSITY_THRESHOLDS,
  HTTP,
  CACHE,
  UI,
  EVENT_COLORS,
  BACKGROUND_COLORS,
  STORAGE_KEYS,
  ROUTES,
  DATE_FORMATS,
};
