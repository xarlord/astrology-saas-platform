/**
 * Card Controller Unit Tests
 *
 * card.controller.ts exports handlers wrapped in asyncHandler(), i.e. they are
 * middleware-style functions with signature (req, res, next). On success they
 * write to res; on error they throw, and asyncHandler forwards the thrown
 * error to next(). Tests call the handler with a mock next and assert:
 *   - success: res.status/res.json called, next NOT called
 *   - error:   next called with an AppError
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import type { Response, NextFunction } from 'express';
import { AppError } from '../../utils/appError';
import {
  generateCard,
  getCard,
  getPublicCard,
  getCardHistory,
  deleteCard,
  getOgData,
} from '../../modules/cards/controllers/card.controller';
const mockCardService: Record<string, jest.Mock> = {};

jest.mock('../../modules/cards/services/card.service', () => ({
  __esModule: true,
  cardService: new Proxy(
    {},
    {
      get: (_t, prop) => mockCardService[prop as string],
    },
  ),
}));

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const mockUser = { id: 'user-123', email: 'test@example.com' };

const mockCard = {
  id: 'card-123',
  user_id: mockUser.id,
  chart_id: 'chart-1',
  share_token: 'tok-abc123def456',
  template: 'instagram_story',
  planet_placements: ['Sun in Leo', 'Moon in Cancer'],
  show_insight: true,
  insight_text: 'A confident and creative soul.',
  image_url: 'https://cdn.example.com/card.png',
  is_public: true,
  og_title: 'My Chart',
  og_description: 'Sun in Leo',
  referral_code: undefined,
  view_count: 0,
  created_at: new Date('2026-06-29'),
  updated_at: new Date('2026-06-29'),
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildRes() {
  const res: any = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res as Response;
}

function buildReq(overrides: any = {}): any {
  return {
    user: mockUser,
    body: {},
    params: {},
    query: {},
    method: 'POST',
    path: '/api/v1/cards/generate',
    ...overrides,
  };
}

describe('Card Controller', () => {
  let res: Response;
  let next: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    jest.clearAllMocks();
    res = buildRes();
    next = jest.fn();

    for (const m of [
      'generateCard',
      'getCardById',
      'getPublicCard',
      'getUserCards',
      'deleteCard',
      'getOgData',
    ]) {
      mockCardService[m] = jest.fn();
    }
  });

  // -------------------------------------------------------------------------
  describe('generateCard', () => {
    it('should generate a shareable card successfully', async () => {
      const req = buildReq({
        body: {
          chart_id: 'chart-1',
          template: 'instagram_story',
          planet_placements: ['Sun in Leo'],
          show_insight: true,
        },
      });
      mockCardService.generateCard.mockResolvedValue(mockCard);

      await generateCard(req, res, next);

      expect(mockCardService.generateCard).toHaveBeenCalledWith(
        mockUser.id,
        'chart-1',
        expect.objectContaining({ template: 'instagram_story' }),
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({ id: 'card-123', share_token: 'tok-abc123def456' }),
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next() with AppError 400 when chart_id is missing', async () => {
      const req = buildReq({ body: {} });

      await generateCard(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err).toBeInstanceOf(AppError);
      expect(err.statusCode).toBe(400);
      expect(mockCardService.generateCard).not.toHaveBeenCalled();
    });

    it('should forward service errors to next()', async () => {
      const req = buildReq({ body: { chart_id: 'chart-1' } });
      mockCardService.generateCard.mockRejectedValue(new Error('image render failed'));

      await generateCard(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err).toBeInstanceOf(Error);
      expect(String(err.message)).toMatch(/image render failed/);
    });

    it('should use user.id from AuthenticatedRequest', async () => {
      const req = buildReq({ body: { chart_id: 'chart-1' } });
      mockCardService.generateCard.mockResolvedValue(mockCard);

      await generateCard(req, res, next);

      expect(mockCardService.generateCard).toHaveBeenCalledWith(
        mockUser.id,
        expect.any(String),
        expect.anything(),
      );
    });
  });

  // -------------------------------------------------------------------------
  describe('getCard', () => {
    it('should get card metadata for owner', async () => {
      const req = buildReq({ params: { id: 'card-123' } });
      mockCardService.getCardById.mockResolvedValue(mockCard);

      await getCard(req, res, next);

      expect(mockCardService.getCardById).toHaveBeenCalledWith('card-123', mockUser.id);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: mockCard });
    });

    it('should call next() with AppError 404 when card not found', async () => {
      const req = buildReq({ params: { id: 'nope' } });
      mockCardService.getCardById.mockResolvedValue(null);

      await getCard(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err).toBeInstanceOf(AppError);
      expect(err.statusCode).toBe(404);
    });

    it('should forward service errors to next()', async () => {
      const req = buildReq({ params: { id: 'card-123' } });
      mockCardService.getCardById.mockRejectedValue(new Error('DB error'));

      await getCard(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
    });

    it('should use user.id for authorization', async () => {
      const req = buildReq({ params: { id: 'card-123' } });
      mockCardService.getCardById.mockResolvedValue(mockCard);

      await getCard(req, res, next);

      expect(mockCardService.getCardById).toHaveBeenCalledWith('card-123', mockUser.id);
    });
  });

  // -------------------------------------------------------------------------
  describe('getPublicCard', () => {
    it('should get public card by share token without auth', async () => {
      // public endpoint — no req.user needed
      const req = buildReq({ user: undefined, params: { shareToken: 'tok-abc123def456' } });
      mockCardService.getPublicCard.mockResolvedValue(mockCard);

      await getPublicCard(req, res, next);

      expect(mockCardService.getPublicCard).toHaveBeenCalledWith('tok-abc123def456');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({ id: 'card-123' }),
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next() with AppError 404 when public card not found', async () => {
      const req = buildReq({ user: undefined, params: { shareToken: 'unknown' } });
      mockCardService.getPublicCard.mockResolvedValue(null);

      await getPublicCard(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err).toBeInstanceOf(AppError);
      expect(err.statusCode).toBe(404);
    });

    it('should forward service errors to next()', async () => {
      const req = buildReq({ params: { shareToken: 'tok' } });
      mockCardService.getPublicCard.mockRejectedValue(new Error('boom'));

      await getPublicCard(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
    });
  });

  // -------------------------------------------------------------------------
  describe('getCardHistory', () => {
    it('should get user card history with default pagination', async () => {
      const req = buildReq({ query: {} });
      mockCardService.getUserCards.mockResolvedValue([mockCard]);

      await getCardHistory(req, res, next);

      expect(mockCardService.getUserCards).toHaveBeenCalledWith(mockUser.id, 20, 0);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { cards: [mockCard], limit: 20, offset: 0 },
      });
    });

    it('should handle empty card history', async () => {
      const req = buildReq({ query: {} });
      mockCardService.getUserCards.mockResolvedValue([]);

      await getCardHistory(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { cards: [], limit: 20, offset: 0 },
      });
    });

    it('should enforce max limit of 50', async () => {
      const req = buildReq({ query: { limit: '200', offset: '5' } });
      mockCardService.getUserCards.mockResolvedValue([]);

      await getCardHistory(req, res, next);

      expect(mockCardService.getUserCards).toHaveBeenCalledWith(mockUser.id, 50, 5);
    });

    it('should forward service errors to next()', async () => {
      const req = buildReq({ query: {} });
      mockCardService.getUserCards.mockRejectedValue(new Error('fail'));

      await getCardHistory(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
    });
  });

  // -------------------------------------------------------------------------
  describe('deleteCard', () => {
    it('should delete a card successfully', async () => {
      const req = buildReq({ params: { id: 'card-123' } });
      mockCardService.deleteCard.mockResolvedValue(true);

      await deleteCard(req, res, next);

      expect(mockCardService.deleteCard).toHaveBeenCalledWith('card-123', mockUser.id);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: { deleted: true } });
    });

    it('should call next() with AppError 404 when card not found', async () => {
      const req = buildReq({ params: { id: 'nope' } });
      mockCardService.deleteCard.mockResolvedValue(false);

      await deleteCard(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err).toBeInstanceOf(AppError);
      expect(err.statusCode).toBe(404);
    });

    it('should use user.id for authorization', async () => {
      const req = buildReq({ params: { id: 'card-123' } });
      mockCardService.deleteCard.mockResolvedValue(true);

      await deleteCard(req, res, next);

      expect(mockCardService.deleteCard).toHaveBeenCalledWith('card-123', mockUser.id);
    });
  });

  // -------------------------------------------------------------------------
  describe('getOgData', () => {
    it('should return OG metadata for a valid share token', async () => {
      const req = buildReq({ params: { shareToken: 'tok-abc123def456' } });
      const og = { title: 'My Chart', description: 'Sun in Leo', image_url: 'https://cdn/x.png' };
      mockCardService.getOgData.mockResolvedValue(og);

      await getOgData(req, res, next);

      expect(mockCardService.getOgData).toHaveBeenCalledWith('tok-abc123def456');
      expect(res.json).toHaveBeenCalledWith({ success: true, data: og });
    });

    it('should call next() with AppError 404 for unknown share token', async () => {
      const req = buildReq({ params: { shareToken: 'unknown' } });
      mockCardService.getOgData.mockResolvedValue(null);

      await getOgData(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err).toBeInstanceOf(AppError);
      expect(err.statusCode).toBe(404);
    });
  });
});
