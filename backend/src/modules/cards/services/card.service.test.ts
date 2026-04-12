/**
 * Unit Tests for Card Service
 * Tests CardService business logic in isolation
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { CardService } from './card.service';
import cardModel from '../models/card.model';
import openaiService from '../../ai/services/openai.service';
import { cardImageService } from './card-image.service';
import { AppError } from '../../../utils/appError';

// Mock dependencies
jest.mock('../models/card.model');
jest.mock('../../ai/services/openai.service');
jest.mock('./card-image.service');
jest.mock('../../../utils/logger');

describe('CardService', () => {
  let cardService: CardService;
  const mockUserId = 'test-user-id';
  const mockChartId = 'test-chart-id';
  const mockCardId = 'test-card-id';
  const mockShareToken = 'test-share-token-abc123';

  beforeAll(() => {
    // Ensure FRONTEND_URL is not set for consistent test behavior
    delete process.env.FRONTEND_URL;
  });

  beforeEach(() => {
    cardService = new CardService();
    jest.clearAllMocks();
  });

  describe('generateCard', () => {
    const mockCard = {
      id: mockCardId,
      user_id: mockUserId,
      chart_id: mockChartId,
      template: 'instagram_story',
      planet_placements: ['sun', 'moon', 'ascendant'],
      show_insight: true,
      insight_text: null,
      referral_code: null,
      share_token: mockShareToken,
      og_title: null,
      og_description: null,
      image_url: null,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
    };

    const setupMocks = () => {
      (cardModel.countByUserToday as jest.Mock).mockResolvedValue(0);
      (cardModel.isValidTemplate as jest.Mock).mockReturnValue(true);
      // Mock create to return a card with all required fields and OG data
      (cardModel.create as jest.Mock).mockImplementation((cardData: any) => {
        const card = {
          ...mockCard,
          ...cardData,  // Use the actual data passed to create
          og_title: `My ${(cardData.template || 'instagram_story').replace('_', ' ')} Chart Card - AstroVerse`,
          og_description: `Explore the cosmic placements: ${(cardData.planet_placements || ['sun', 'moon', 'ascendant']).join(', ')}. Generate your own astrology card at AstroVerse!`,
        };
        return card;
      });
      (cardModel.findByShareToken as jest.Mock).mockResolvedValue(mockCard);
      (openaiService.generateCardInsight as jest.Mock).mockResolvedValue('Test AI insight');
      (cardImageService.generateImage as jest.Mock).mockResolvedValue({
        imageUrl: 'https://example.com/card.png',
        width: 1080,
        height: 1920,
      });
    };

    // Mock the private checkRateLimit method to avoid rate limit state issues
    let checkRateLimitSpy: jest.SpyInstance;

    beforeEach(() => {
      checkRateLimitSpy = jest.spyOn(CardService.prototype as any, 'checkRateLimit').mockReturnValue(1);
      setupMocks();
    });

    afterEach(() => {
      checkRateLimitSpy.mockRestore();
    });

    it('should generate a new card with valid data', async () => {
      const result = await cardService.generateCard(mockUserId, mockChartId);

      expect(result).toBeDefined();
      expect(cardModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: mockUserId,
          chart_id: mockChartId,
          template: 'instagram_story',
          planet_placements: ['sun', 'moon', 'ascendant'],
        })
      );
    });

    it('should apply default values when options not provided', async () => {
      await cardService.generateCard(mockUserId, mockChartId);

      expect(cardModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          template: 'instagram_story',
          planet_placements: ['sun', 'moon', 'ascendant'],
          show_insight: true,
        })
      );
    });

    it('should use custom template when provided', async () => {
      await cardService.generateCard(mockUserId, mockChartId, {
        template: 'pinterest',
      });

      expect(cardModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          template: 'pinterest',
        })
      );
    });

    it('should use custom planet placements when provided', async () => {
      const customPlacements = ['sun', 'moon', 'mercury', 'venus', 'mars'];

      await cardService.generateCard(mockUserId, mockChartId, {
        planet_placements: customPlacements,
      });

      expect(cardModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          planet_placements: customPlacements,
        })
      );
    });

    it('should throw AppError with 429 when daily limit exceeded', async () => {
      (cardModel.countByUserToday as jest.Mock).mockResolvedValue(10);

      await expect(
        cardService.generateCard(mockUserId, mockChartId)
      ).rejects.toThrow(AppError);

      try {
        await cardService.generateCard(mockUserId, mockChartId);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(429);
        expect((error as AppError).message).toContain('Daily card generation limit reached');
      }
    });

    it('should throw AppError with 400 for invalid template', async () => {
      (cardModel.isValidTemplate as jest.Mock).mockReturnValue(false);
      (cardModel.getValidTemplates as jest.Mock).mockReturnValue(['instagram_story', 'pinterest']);

      await expect(
        cardService.generateCard(mockUserId, mockChartId, { template: 'invalid' })
      ).rejects.toThrow(AppError);

      try {
        await cardService.generateCard(mockUserId, mockChartId, { template: 'invalid' });
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(400);
        expect((error as AppError).message).toContain('Invalid template');
      }
    });

    it('should throw AppError with 400 for less than 3 placements', async () => {
      await expect(
        cardService.generateCard(mockUserId, mockChartId, { planet_placements: ['sun', 'moon'] })
      ).rejects.toThrow(AppError);

      try {
        await cardService.generateCard(mockUserId, mockChartId, { planet_placements: ['sun', 'moon'] });
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(400);
        expect((error as AppError).message).toContain('Must select between 3 and 5 planet placements');
      }
    });

    it('should throw AppError with 400 for more than 5 placements', async () => {
      const tooManyPlacements = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter'];
      await expect(
        cardService.generateCard(mockUserId, mockChartId, { planet_placements: tooManyPlacements })
      ).rejects.toThrow(AppError);

      try {
        await cardService.generateCard(mockUserId, mockChartId, { planet_placements: tooManyPlacements });
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(400);
        expect((error as AppError).message).toContain('Must select between 3 and 5 planet placements');
      }
    });

    it('should generate AI insight when show_insight is true and no custom text', async () => {
      await cardService.generateCard(mockUserId, mockChartId, {
        show_insight: true,
      });

      expect(openaiService.generateCardInsight).toHaveBeenCalledWith(
        ['sun', 'moon', 'ascendant'],
        mockUserId
      );
    });

    it('should not generate AI insight when custom insight text provided', async () => {
      const customInsight = 'Custom insight text';
      // Clear the mock from beforeEach and set it to not be called
      (openaiService.generateCardInsight as jest.Mock).mockClear();

      await cardService.generateCard(mockUserId, mockChartId, {
        insight_text: customInsight,
      });

      expect(openaiService.generateCardInsight).not.toHaveBeenCalled();
    });

    it('should not generate AI insight when show_insight is false', async () => {
      // Clear the mock from beforeEach and set it to not be called
      (openaiService.generateCardInsight as jest.Mock).mockClear();

      await cardService.generateCard(mockUserId, mockChartId, {
        show_insight: false,
      });

      expect(openaiService.generateCardInsight).not.toHaveBeenCalled();
    });

    it('should include OG title and description in result', async () => {
      const result = await cardService.generateCard(mockUserId, mockChartId);

      expect(result.og_title).toBeDefined();
      expect(result.og_description).toBeDefined();
    });

    it('should trigger card image generation in background', async () => {
      await cardService.generateCard(mockUserId, mockChartId);

      // Wait a tick for async call
      await new Promise(resolve => setImmediate(resolve));

      expect(cardImageService.generateImage).toHaveBeenCalledWith(
        expect.objectContaining({
          template: 'instagram_story',
          cardId: mockCardId,
          userId: mockUserId,
        })
      );
    });
  });

  describe('getCardById', () => {
    it('should return card when found and owned by user', async () => {
      const mockCard = {
        id: mockCardId,
        user_id: mockUserId,
        chart_id: mockChartId,
        template: 'instagram_story',
        planet_placements: ['sun'],
      };
      (cardModel.findById as jest.Mock).mockResolvedValue(mockCard);

      const result = await cardService.getCardById(mockCardId, mockUserId);

      expect(result).toEqual(mockCard);
      expect(cardModel.findById).toHaveBeenCalledWith(mockCardId);
    });

    it('should return null when card not found', async () => {
      (cardModel.findById as jest.Mock).mockResolvedValue(null);

      const result = await cardService.getCardById(mockCardId, mockUserId);

      expect(result).toBeNull();
    });

    it('should return null when card owned by different user', async () => {
      const otherUserId = 'other-user-id';
      const mockCard = {
        id: mockCardId,
        user_id: otherUserId,
        chart_id: mockChartId,
      };
      (cardModel.findById as jest.Mock).mockResolvedValue(mockCard);

      const result = await cardService.getCardById(mockCardId, mockUserId);

      expect(result).toBeNull();
    });
  });

  describe('getPublicCard', () => {
    it('should return card when share token valid', async () => {
      const mockCard = {
        id: mockCardId,
        user_id: mockUserId,
        share_token: mockShareToken,
        view_count: 5,
      };
      (cardModel.findByShareToken as jest.Mock).mockResolvedValue(mockCard);
      (cardModel.incrementViewCount as jest.Mock).mockResolvedValue(undefined);

      const result = await cardService.getPublicCard(mockShareToken);

      expect(result).toEqual(mockCard);
      expect(cardModel.findByShareToken).toHaveBeenCalledWith(mockShareToken);
      expect(cardModel.incrementViewCount).toHaveBeenCalledWith(mockCardId);
    });

    it('should return null when share token invalid', async () => {
      (cardModel.findByShareToken as jest.Mock).mockResolvedValue(null);

      const result = await cardService.getPublicCard('invalid-token');

      expect(result).toBeNull();
      expect(cardModel.incrementViewCount).not.toHaveBeenCalled();
    });
  });

  describe('getUserCards', () => {
    it('should return user cards with default pagination', async () => {
      const mockCards = [
        { id: 'card-1', user_id: mockUserId },
        { id: 'card-2', user_id: mockUserId },
      ];
      (cardModel.findByUser as jest.Mock).mockResolvedValue(mockCards);

      const result = await cardService.getUserCards(mockUserId);

      expect(result).toEqual(mockCards);
      expect(cardModel.findByUser).toHaveBeenCalledWith(mockUserId, 20, 0);
    });

    it('should respect custom limit parameter', async () => {
      (cardModel.findByUser as jest.Mock).mockResolvedValue([]);

      await cardService.getUserCards(mockUserId, 50);

      expect(cardModel.findByUser).toHaveBeenCalledWith(mockUserId, 50, 0);
    });

    it('should respect custom offset parameter', async () => {
      (cardModel.findByUser as jest.Mock).mockResolvedValue([]);

      await cardService.getUserCards(mockUserId, 20, 10);

      expect(cardModel.findByUser).toHaveBeenCalledWith(mockUserId, 20, 10);
    });
  });

  describe('deleteCard', () => {
    it('should delete card when owned by user', async () => {
      (cardModel.softDelete as jest.Mock).mockResolvedValue(true);

      const result = await cardService.deleteCard(mockCardId, mockUserId);

      expect(result).toBe(true);
      expect(cardModel.softDelete).toHaveBeenCalledWith(mockCardId, mockUserId);
    });

    it('should return false when card not found or not owned', async () => {
      (cardModel.softDelete as jest.Mock).mockResolvedValue(false);

      const result = await cardService.deleteCard(mockCardId, mockUserId);

      expect(result).toBe(false);
    });
  });

  describe('getOgData', () => {
    const mockCard = {
      id: mockCardId,
      user_id: mockUserId,
      share_token: mockShareToken,
      template: 'instagram_story',
      planet_placements: ['sun', 'moon'],
      og_title: 'Custom OG Title',
      og_description: 'Custom OG Description',
      image_url: 'https://example.com/card.png',
    };

    beforeEach(() => {
      (cardModel.findByShareToken as jest.Mock).mockResolvedValue(mockCard);
    });

    afterEach(() => {
      process.env.FRONTEND_URL = undefined;
    });

    it('should return OG data when card found', async () => {
      const result = await cardService.getOgData(mockShareToken);

      expect(result).toEqual({
        title: 'Custom OG Title',
        description: 'Custom OG Description',
        imageUrl: 'https://example.com/card.png',
        url: 'http://localhost:5173/share/' + mockShareToken,
      });
    });

    it('should use default OG title when card has none', async () => {
      const cardWithoutOg = { ...mockCard, og_title: null };
      (cardModel.findByShareToken as jest.Mock).mockResolvedValue(cardWithoutOg);

      const result = await cardService.getOgData(mockShareToken);

      expect(result.title).toBe('My Astrology Chart - AstroVerse');
    });

    it('should use default OG description when card has none', async () => {
      const cardWithoutOg = { ...mockCard, og_description: null };
      (cardModel.findByShareToken as jest.Mock).mockResolvedValue(cardWithoutOg);

      const result = await cardService.getOgData(mockShareToken);

      expect(result.description).toBe('Discover your cosmic blueprint with AstroVerse');
    });

    it('should return null imageUrl when card has no image', async () => {
      const cardWithoutImage = { ...mockCard, image_url: null };
      (cardModel.findByShareToken as jest.Mock).mockResolvedValue(cardWithoutImage);

      const result = await cardService.getOgData(mockShareToken);

      expect(result.imageUrl).toBeNull();
    });

    it('should use custom FRONTEND_URL when set', async () => {
      process.env.FRONTEND_URL = 'https://custom.example.com';
      (cardModel.findByShareToken as jest.Mock).mockResolvedValue(mockCard);

      const result = await cardService.getOgData(mockShareToken);

      expect(result.url).toBe('https://custom.example.com/share/' + mockShareToken);
    });

    it('should return null when card not found', async () => {
      (cardModel.findByShareToken as jest.Mock).mockResolvedValue(null);

      const result = await cardService.getOgData(mockShareToken);

      expect(result).toBeNull();
    });
  });
});
