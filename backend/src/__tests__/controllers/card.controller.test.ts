/**
 * Unit Tests for Card Controller
 * Tests shareable natal chart card generation
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Response } from 'express';
import { generateCard, getCard, deleteCard } from '../../modules/cards/controllers/card.controller';
import { cardService } from '../../modules/cards/services/card.service';

jest.mock('../../modules/cards/services/card.service', () => ({
  cardService: {
    generateCard: jest.fn(),
    getCardByShareToken: jest.fn(),
    deleteCard: jest.fn(),
  },
}));

jest.mock('../../../utils/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

function createMockResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

function createAuthenticatedRequest(overrides: any = {}) {
  return {
    user: { id: 'user-123', email: 'test@example.com' },
    body: overrides.body || {},
    params: overrides.params || {},
    ...overrides,
  };
}

describe('Card Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateCard', () => {
    it('should generate a shareable card successfully', async () => {
      const cardData = {
        chart_id: 'chart-1',
        template: 'instagram-story',
        planet_placements: true,
        show_insight: true,
        insight_text: 'Your cosmic insight awaits',
      };

      const mockCard = {
        id: 'card-1',
        share_token: 'abc123',
        template: 'instagram-story',
        image_url: '/uploads/cards/card-1.png',
        created_at: new Date(),
      };

      (cardService.generateCard as jest.Mock).mockResolvedValue(mockCard);

      const req = createAuthenticatedRequest({ body: cardData });
      const res = createMockResponse();

      await generateCard(req as any, res as unknown as Response);

      expect(cardService.generateCard).toHaveBeenCalledWith('user-123', cardData.chart_id, cardData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          id: mockCard.id,
          share_token: mockCard.share_token,
        }),
      });
    });

    it('should throw error if chart_id is missing', async () => {
      const req = createAuthenticatedRequest({ body: { template: 'instagram-story' } });
      const res = createMockResponse();

      await expect(generateCard(req as any, res as unknown as Response)).rejects.toThrow(
        'chart_id is required',
      );
    });

    it('should handle service errors', async () => {
      (cardService.generateCard as jest.Mock).mockRejectedValue(new Error('Chart not found'));

      const req = createAuthenticatedRequest({ body: { chart_id: 'chart-1' } });
      const res = createMockResponse();

      await expect(generateCard(req as any, res as unknown as Response)).rejects.toThrow('Chart not found');
    });
  });

  describe('getCard', () => {
    it('should retrieve a card by share token', async () => {
      const mockCard = {
        id: 'card-1',
        share_token: 'abc123',
        template: 'square',
        image_url: '/uploads/cards/card-1.png',
      };

      (cardService.getCardByShareToken as jest.Mock).mockResolvedValue(mockCard);

      const req = createAuthenticatedRequest({ params: { token: 'abc123' } });
      const res = createMockResponse();

      await getCard(req as any, res as unknown as Response);

      expect(cardService.getCardByShareToken).toHaveBeenCalledWith('abc123');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockCard,
      });
    });

    it('should handle missing cards', async () => {
      (cardService.getCardByShareToken as jest.Mock).mockResolvedValue(null);

      const req = createAuthenticatedRequest({ params: { token: 'invalid' } });
      const res = createMockResponse();

      await getCard(req as any, res as unknown as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
      });
    });
  });

  describe('deleteCard', () => {
    it('should delete a card successfully', async () => {
      (cardService.deleteCard as jest.Mock).mockResolvedValue(undefined);

      const req = createAuthenticatedRequest({ params: { id: 'card-1' } });
      const res = createMockResponse();

      await deleteCard(req as any, res as unknown as Response);

      expect(cardService.deleteCard).toHaveBeenCalledWith('user-123', 'card-1');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Card deleted successfully',
      });
    });

    it('should handle delete errors', async () => {
      (cardService.deleteCard as jest.Mock).mockRejectedValue(new Error('Card not found'));

      const req = createAuthenticatedRequest({ params: { id: 'nonexistent' } });
      const res = createMockResponse();

      await expect(deleteCard(req as any, res as unknown as Response)).rejects.toThrow('Card not found');
    });
  });
});
