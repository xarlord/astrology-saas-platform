/**
 * Card Service
 * API client for shareable chart cards
 */

import api from './api';
import type {
  GenerateCardRequest,
  GeneratedCard,
  PublicCard,
  CardOGMetadata,
  CardHistoryResponse,
} from '@/types/card.types';

export const cardService = {
  /**
   * Generate a new shareable card
   * Image is generated asynchronously — poll getCard() for image_url
   */
  async generateCard(data: GenerateCardRequest): Promise<GeneratedCard> {
    const response = await api.post<{ success: true; data: GeneratedCard }>(
      '/v1/cards/generate',
      data,
    );
    return response.data.data;
  },

  /**
   * Get a card by ID (owner only)
   */
  async getCard(id: string): Promise<GeneratedCard> {
    const response = await api.get<{ success: true; data: GeneratedCard }>(`/v1/cards/${id}`);
    return response.data.data;
  },

  /**
   * Get a public card by share token (no auth required)
   */
  async getPublicCard(shareToken: string): Promise<PublicCard> {
    const response = await api.get<{ success: true; data: PublicCard }>(
      `/v1/cards/public/${shareToken}`,
    );
    return response.data.data;
  },

  /**
   * Get OG metadata for social previews
   */
  async getCardOGMetadata(shareToken: string): Promise<CardOGMetadata> {
    const response = await api.get<{ success: true; data: CardOGMetadata }>(
      `/v1/cards/public/${shareToken}/og`,
    );
    return response.data.data;
  },

  /**
   * Get a public card by ID (new route - no auth required)
   */
  async getPublicCardById(id: string): Promise<PublicCard> {
    const response = await api.get<{ success: true; data: PublicCard }>(`/v1/cards/shared/${id}`);
    return response.data.data;
  },

  /**
   * Get OG metadata by ID (new route)
   */
  async getCardOGMetadataById(id: string): Promise<CardOGMetadata> {
    const response = await api.get<{ success: true; data: CardOGMetadata }>(
      `/v1/cards/shared/${id}/og`,
    );
    return response.data.data;
  },

  /**
   * Get user's card generation history
   */
  async getCardHistory(limit = 20, offset = 0): Promise<CardHistoryResponse> {
    const response = await api.get<{ success: true; data: CardHistoryResponse }>(
      '/v1/cards/history',
      {
        params: { limit, offset },
      },
    );
    return response.data.data;
  },

  /**
   * Delete a card (soft delete)
   */
  async deleteCard(id: string): Promise<void> {
    await api.delete(`/v1/cards/${id}`);
  },

  /**
   * Get rate limit status for card generation
   */
  async getRateLimitStatus(): Promise<{
    count: number;
    limit: number;
    remaining: number;
    resetAt: string;
  }> {
    const response = await api.get<{
      success: true;
      data: { count: number; limit: number; remaining: number; resetAt: string };
    }>('/v1/cards/rate-limit');
    return response.data.data;
  },
};
