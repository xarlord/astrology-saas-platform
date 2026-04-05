/**
 * Card Types
 * Types for the shareable chart cards feature
 */

/** Card template options matching backend enum */
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

/** Request to generate a new shareable card */
export interface GenerateCardRequest {
  chart_id: string;
  template?: CardTemplate;
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
  planet_placements: CardPlanet[];
  show_insight: boolean;
  insight_text?: string;
  image_url?: string;
  is_public: boolean;
  created_at: string;
  og_title: string;
  og_description: string;
}

/** Public card data (no owner-specific fields) */
export interface PublicCard {
  id: string;
  template: CardTemplate;
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

/** All available card templates */
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
