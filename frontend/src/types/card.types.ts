/**
 * Card Types
 * Types for the shareable chart cards feature
 */

/** Card style presets - aesthetic themes instead of platform templates */
export type CardStyle = 'cosmic' | 'minimalist' | 'celestial';

/** Legacy platform templates - kept for backward compatibility */
export type CardTemplate = 'instagram_story' | 'twitter_x' | 'pinterest' | 'square' | 'linkedin';

/** Planet names that can be shown on a card */
export type CardPlanet =
  | 'sun'
  | 'moon'
  | 'ascendant'
  | 'mercury'
  | 'venus'
  | 'mars'
  | 'jupiter'
  | 'saturn'
  | 'uranus'
  | 'neptune'
  | 'pluto'
  | 'north_node'
  | 'chiron';

/** Color theme options for card customization */
export type CardColorTheme =
  | 'midnight_purple'    // Deep purple gradients
  | 'celestial_blue'     // Blue and silver
  | 'golden_hour'        // Gold and warm tones
  | 'forest_green'       // Green and earth tones
  | 'rose_quartz'        // Pink and crystal
  | 'monochrome';        // Black and white

/** Request to generate a new shareable card */
export interface GenerateCardRequest {
  chart_id: string;
  template?: CardTemplate;
  style?: CardStyle;              // New style preset
  color_theme?: CardColorTheme;   // New color theme
  planet_placements?: CardPlanet[];
  show_insight?: boolean;
  insight_text?: string;
  referral_code?: string;
}

/** A generated card record from the API */
export interface GeneratedCard {
  id: string;
  share_token: string;
  template: CardTemplate;
  style?: CardStyle;              // New style preset
  color_theme?: CardColorTheme;   // New color theme
  planet_placements: CardPlanet[];
  show_insight: boolean;
  insight_text?: string;
  image_url?: string;
  is_public: boolean;
  created_at: string;
  og_title: string;
  og_description: string;
  daily_generation_count?: number;  // For rate limiting UI
  daily_generation_limit?: number;  // For rate limiting UI
}

/** Public card data (no owner-specific fields) */
export interface PublicCard {
  id: string;
  template: CardTemplate;
  style?: CardStyle;              // New style preset
  color_theme?: CardColorTheme;   // New color theme
  planet_placements: CardPlanet[];
  show_insight: boolean;
  insight_text?: string;
  image_url?: string;
  referral_code?: string;
  created_at: string;
}

/** OG metadata for social previews */
export interface CardOGMetadata {
  title: string;
  description: string;
  imageUrl: string | null;
  url: string;
}

/** Card history response */
export interface CardHistoryResponse {
  cards: GeneratedCard[];
  limit: number;
  offset: number;
}

/** Card template display metadata (frontend-only) */
export interface CardTemplateInfo {
  id: CardTemplate;
  label: string;
  description: string;
  width: number;
  height: number;
  icon: string;
}

/** Card style preset display metadata */
export interface CardStyleInfo {
  id: CardStyle;
  label: string;
  description: string;
  previewGradient: string;  // CSS gradient for preview
  icon: string;
}

/** Card color theme display metadata */
export interface CardColorThemeInfo {
  id: CardColorTheme;
  label: string;
  description: string;
  primaryColor: string;     // CSS color
  gradient: string;         // CSS gradient for preview
  icon: string;
}

/** All available card templates (legacy - for backward compatibility) */
export const CARD_TEMPLATES: CardTemplateInfo[] = [
  {
    id: 'instagram_story',
    label: 'Instagram Story',
    description: '9:16 vertical for Stories',
    width: 1080,
    height: 1920,
    icon: '📸',
  },
  {
    id: 'twitter_x',
    label: 'X / Twitter',
    description: '16:9 landscape for posts',
    width: 1200,
    height: 675,
    icon: '🐦',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    description: 'Professional landscape',
    width: 1200,
    height: 627,
    icon: '💼',
  },
  {
    id: 'pinterest',
    label: 'Pinterest',
    description: '2:3 vertical for pins',
    width: 1000,
    height: 1500,
    icon: '📌',
  },
  {
    id: 'square',
    label: 'Square',
    description: '1:1 universal format',
    width: 1080,
    height: 1080,
    icon: '⬛',
  },
];

/** All available card style presets */
export const CARD_STYLES: CardStyleInfo[] = [
  {
    id: 'cosmic',
    label: 'Cosmic',
    description: 'Deep space with celestial elements',
    previewGradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    icon: '🌌',
  },
  {
    id: 'minimalist',
    label: 'Minimalist',
    description: 'Clean and simple design',
    previewGradient: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
    icon: '✨',
  },
  {
    id: 'celestial',
    label: 'Celestial',
    description: 'Ethereal with mystical elements',
    previewGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    icon: '🌟',
  },
];

/** All available card color themes */
export const CARD_COLOR_THEMES: CardColorThemeInfo[] = [
  {
    id: 'midnight_purple',
    label: 'Midnight Purple',
    description: 'Deep purple gradients',
    primaryColor: '#6B46C1',
    gradient: 'linear-gradient(135deg, #1a1a2e 0%, #4a1a6b 100%)',
    icon: '🟣',
  },
  {
    id: 'celestial_blue',
    label: 'Celestial Blue',
    description: 'Blue and silver',
    primaryColor: '#4299E1',
    gradient: 'linear-gradient(135deg, #1e3a8a 0%, #60a5fa 100%)',
    icon: '🔵',
  },
  {
    id: 'golden_hour',
    label: 'Golden Hour',
    description: 'Gold and warm tones',
    primaryColor: '#D69E2E',
    gradient: 'linear-gradient(135deg, #744210 0%, #F6E05E 100%)',
    icon: '🟡',
  },
  {
    id: 'forest_green',
    label: 'Forest Green',
    description: 'Green and earth tones',
    primaryColor: '#38A169',
    gradient: 'linear-gradient(135deg, #14532d 0%, #4ade80 100%)',
    icon: '🟢',
  },
  {
    id: 'rose_quartz',
    label: 'Rose Quartz',
    description: 'Pink and crystal',
    primaryColor: '#ED64A6',
    gradient: 'linear-gradient(135deg, #831843 0%, #f472b6 100%)',
    icon: '🩷',
  },
  {
    id: 'monochrome',
    label: 'Monochrome',
    description: 'Black and white',
    primaryColor: '#1F2937',
    gradient: 'linear-gradient(135deg, #000000 0%, #ffffff 100%)',
    icon: '⚫',
  },
];
