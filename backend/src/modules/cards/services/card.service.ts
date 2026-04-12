/**
 * Card Generation Service
 * Handles shareable natal chart card generation, rate limiting, and image storage
 */

import * as crypto from 'crypto';
import logger from '../../../utils/logger';
import cardModel from '../models/card.model';
import type { GeneratedCard } from '../models/card.model';
import openaiService from '../../ai/services/openai.service';
import { cardImageService } from './card-image.service';
import { AppError } from '../../../utils/appError';

const DAILY_CARD_LIMIT = 10;
const SHARE_TOKEN_LENGTH = 24;

// In-memory rate limiter (per user, per day). Resets on server restart.
const rateLimitCounters = new Map<string, { count: number; resetAt: number }>();

export class CardService {
  /**
   * Generate a new shareable card from chart data
   */
  async generateCard(
    userId: string,
    chartId: string,
    options: {
      template?: string;
      planet_placements?: string[];
      show_insight?: boolean;
      insight_text?: string;
      referral_code?: string;
    } = {}
  ): Promise<GeneratedCard> {
    // Rate limit check
    const dailyCount = await cardModel.countByUserToday(userId);
    if (dailyCount >= DAILY_CARD_LIMIT) {
      throw new AppError(`Daily card generation limit reached (${DAILY_CARD_LIMIT}/day)`, 429);
    }

    // Also check in-memory counter for faster burst protection
    const memCount = this.checkRateLimit(userId);
    if (memCount > DAILY_CARD_LIMIT) {
      throw new AppError(`Daily card generation limit reached (${DAILY_CARD_LIMIT}/day)`, 429);
    }

    // Validate template
    if (options.template && !cardModel.isValidTemplate(options.template)) {
      throw new AppError(
        `Invalid template: ${options.template}. Valid: ${cardModel.getValidTemplates().join(', ')}`,
        400
      );
    }

    // Validate placements
    const placements = options.planet_placements || ['sun', 'moon', 'ascendant'];
    if (placements.length < 3 || placements.length > 5) {
      throw new AppError('Must select between 3 and 5 planet placements', 400);
    }

    // Generate unique share token
    const shareToken = this.generateShareToken();

    // Create card record
    const card = await cardModel.create({
      user_id: userId,
      chart_id: chartId,
      template: options.template || 'instagram_story',
      planet_placements: placements,
      show_insight: options.show_insight !== false,
      insight_text: options.insight_text,
      referral_code: options.referral_code,
      share_token: shareToken,
    });

    // Generate OG metadata
    const ogTitle = await this.generateOgTitle(card);
    const ogDescription = await this.generateOgDescription(card);

    // Generate AI insight if requested and no custom text provided
    let insightText = card.insight_text;
    if (card.show_insight && !insightText) {
      try {
        insightText = await openaiService.generateCardInsight(placements, userId) ?? undefined;
      } catch {
        logger.warn('Failed to generate AI insight for card', { cardId: card.id });
      }
    }

    // Update with OG data
    logger.info('Card generated', { cardId: card.id, userId, chartId });

    // Build result with OG data and insight
    const result: GeneratedCard = {
      ...card,
      insight_text: insightText ?? card.insight_text,
      og_title: ogTitle,
      og_description: ogDescription,
    };

    // Generate card image asynchronously (non-blocking — image_url updated after generation)
    this.generateCardImage(card, result.insight_text).catch(err => {
      logger.warn('Background card image generation failed', {
        cardId: card.id,
        error: err instanceof Error ? err.message : String(err),
      });
    });

    return result;
  }

  /**
   * Get a card by ID (owner only)
   */
  async getCardById(cardId: string, userId: string): Promise<GeneratedCard | null> {
    const card = await cardModel.findById(cardId);
    if (!card || card.user_id !== userId) {
      return null;
    }
    return card;
  }

  /**
   * Get a public card by share token
   */
  async getPublicCard(shareToken: string): Promise<GeneratedCard | null> {
    const card = await cardModel.findByShareToken(shareToken);
    if (!card) {
      return null;
    }

    // Increment view count
    await cardModel.incrementViewCount(card.id);

    return card;
  }

  /**
   * Get user's card history
   */
  async getUserCards(userId: string, limit = 20, offset = 0): Promise<GeneratedCard[]> {
    return cardModel.findByUser(userId, limit, offset);
  }

  /**
   * Delete a card
   */
  async deleteCard(cardId: string, userId: string): Promise<boolean> {
    return cardModel.softDelete(cardId, userId);
  }

  /**
   * Get OG meta data for social previews
   */
  async getOgData(shareToken: string): Promise<{
    title: string;
    description: string;
    imageUrl: string | null;
    url: string;
  } | null> {
    const card = await cardModel.findByShareToken(shareToken);
    if (!card) {
      return null;
    }

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    return {
      title: card.og_title || 'My Astrology Chart - AstroVerse',
      description: card.og_description || 'Discover your cosmic blueprint with AstroVerse',
      imageUrl: card.image_url || null,
      url: `${baseUrl}/share/${shareToken}`,
    };
  }

  /**
   * In-memory rate limit check (burst protection)
   */
  private checkRateLimit(userId: string): number {
    const now = Date.now();
    const entry = rateLimitCounters.get(userId);

    // Reset counter if day has changed (24h window)
    if (!entry || now > entry.resetAt) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      rateLimitCounters.set(userId, {
        count: 1,
        resetAt: tomorrow.getTime(),
      });
      return 1;
    }

    entry.count++;
    return entry.count;
  }

  private generateShareToken(): string {
    return crypto.randomBytes(SHARE_TOKEN_LENGTH).toString('base64url');
  }

  private async generateOgTitle(card: GeneratedCard): Promise<string> {
    return `My ${card.template.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Chart Card - AstroVerse`;
  }

  private async generateOgDescription(card: GeneratedCard): Promise<string> {
    const placements = Array.isArray(card.planet_placements)
      ? card.planet_placements.join(', ')
      : String(card.planet_placements);
    return `Explore the cosmic placements: ${placements}. Generate your own astrology card at AstroVerse!`;
  }

  /**
   * Generate and persist card image, then update the card record.
   */
  private async generateCardImage(card: GeneratedCard, insightText?: string): Promise<void> {
    const imageResult = await cardImageService.generateImage({
      template: card.template,
      planetPlacements: Array.isArray(card.planet_placements)
        ? card.planet_placements
        : [card.planet_placements].flat(),
      insightText: insightText,
      showInsight: card.show_insight,
      cardId: card.id,
      userId: card.user_id,
    });

    if (imageResult) {
      await cardModel.updateImageUrl(
        card.id,
        imageResult.imageUrl,
        imageResult.width,
        imageResult.height
      );
      logger.info('Card image saved', {
        cardId: card.id,
        imageUrl: imageResult.imageUrl,
      });
    }
  }
}

export const cardService = new CardService();
export default CardService;
