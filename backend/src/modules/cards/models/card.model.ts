/**
 * Generated Card Model
 */

import knex from '../../../config/database';
import { AppError } from '../../../utils/appError';

export interface GeneratedCard {
  id: string;
  user_id: string;
  chart_id: string;
  share_token: string;
  template: string;
  planet_placements: string[];
  show_insight: boolean;
  insight_text?: string;
  image_url?: string;
  image_width?: number;
  image_height?: number;
  og_title?: string;
  og_description?: string;
  referral_code?: string;
  is_public: boolean;
  view_count: number;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface CreateCardData {
  user_id: string;
  chart_id: string;
  template?: string;
  planet_placements?: string[];
  show_insight?: boolean;
  insight_text?: string;
  referral_code?: string;
}

const VALID_TEMPLATES = [
  'instagram_story',
  'twitter_x',
  'pinterest',
  'square',
  'linkedin',
];

const VALID_PLANETS = [
  'sun', 'moon', 'ascendant', 'mercury', 'venus', 'mars',
  'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'north_node', 'chiron',
];

class CardModel {
  private tableName = 'generated_cards';

  async findById(id: string): Promise<GeneratedCard | null> {
    const card = await knex(this.tableName)
      .where({ id })
      .whereNull('deleted_at')
      .first();
    return card || null;
  }

  async findByShareToken(shareToken: string): Promise<GeneratedCard | null> {
    const card = await knex(this.tableName)
      .where({ share_token: shareToken })
      .where('is_public', true)
      .whereNull('deleted_at')
      .first();
    return card || null;
  }

  async findByUser(userId: string, limit = 20, offset = 0): Promise<GeneratedCard[]> {
    return knex(this.tableName)
      .where({ user_id: userId })
      .whereNull('deleted_at')
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);
  }

  async countByUserToday(userId: string): Promise<number> {
    const result = await knex(this.tableName)
      .where({ user_id: userId })
      .whereNull('deleted_at')
      .whereRaw("created_at >= CURRENT_DATE")
      .count('* as count')
      .first();
    return Number(result?.count || 0);
  }

  async create(data: CreateCardData & { share_token: string }): Promise<GeneratedCard> {
    const template = data.template || 'instagram_story';
    const placements = data.planet_placements || ['sun', 'moon', 'ascendant'];

    // Validate template
    if (!VALID_TEMPLATES.includes(template)) {
      throw new AppError(`Invalid template: ${template}. Valid: ${VALID_TEMPLATES.join(', ')}`, 400);
    }

    // Validate placements (3-5 planets)
    const validPlacements = placements.filter(p => VALID_PLANETS.includes(p));
    if (validPlacements.length < 3 || validPlacements.length > 5) {
      throw new AppError('Must select between 3 and 5 planet placements', 400);
    }

    const [card] = await knex(this.tableName)
      .insert({
        user_id: data.user_id,
        chart_id: data.chart_id,
        share_token: data.share_token,
        template,
        planet_placements: JSON.stringify(validPlacements),
        show_insight: data.show_insight !== false,
        insight_text: data.insight_text || null,
        referral_code: data.referral_code || null,
        is_public: true,
        view_count: 0,
      })
      .returning('*');

    return card;
  }

  async incrementViewCount(id: string): Promise<void> {
    await knex(this.tableName)
      .where({ id })
      .increment('view_count', 1);
  }

  async updateImageUrl(id: string, imageUrl: string, width?: number, height?: number): Promise<void> {
    await knex(this.tableName)
      .where({ id })
      .update({
        image_url: imageUrl,
        image_width: width ?? null,
        image_height: height ?? null,
        updated_at: new Date(),
      });
  }

  async softDelete(id: string, userId: string): Promise<boolean> {
    const count = await knex(this.tableName)
      .where({ id, user_id: userId })
      .whereNull('deleted_at')
      .update({
        deleted_at: new Date(),
        updated_at: new Date(),
      });
    return count > 0;
  }

  isValidTemplate(template: string): boolean {
    return VALID_TEMPLATES.includes(template);
  }

  getValidTemplates(): string[] {
    return [...VALID_TEMPLATES];
  }
}

export default new CardModel();
