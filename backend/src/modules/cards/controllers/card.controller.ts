/**
 * Card Controller
 * Handles shareable natal chart card API endpoints
 */

import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../../../middleware/auth';
import { AppError } from '../../../utils/appError';
import { asyncHandler } from '../../../middleware/errorHandler';
import { cardService } from '../services/card.service';

/**
 * @route   POST /api/v1/cards/generate
 * @desc    Generate a shareable card from natal chart data
 * @access  Private
 */
export const generateCard = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { chart_id, template, planet_placements, show_insight, insight_text, referral_code } = req.body;

  if (!chart_id) {
    throw new AppError('chart_id is required', 400);
  }

  const card = await cardService.generateCard(req.user.id, chart_id, {
    template,
    planet_placements,
    show_insight,
    insight_text,
    referral_code,
  });

  res.status(201).json({
    success: true,
    data: {
      id: card.id,
      share_token: card.share_token,
      template: card.template,
      planet_placements: card.planet_placements,
      show_insight: card.show_insight,
      insight_text: card.insight_text,
      image_url: card.image_url,
      is_public: card.is_public,
      created_at: card.created_at,
      og_title: card.og_title,
      og_description: card.og_description,
    },
  });
});

/**
 * @route   GET /api/v1/cards/:id
 * @desc    Get card metadata + image URL
 * @access  Private (owner only)
 */
export const getCard = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const card = await cardService.getCardById(req.params.id, req.user.id);

  if (!card) {
    throw new AppError('Card not found', 404);
  }

  res.status(200).json({
    success: true,
    data: card,
  });
});

/**
 * @route   GET /api/v1/cards/public/:shareToken
 * @desc    Public card view (no auth required)
 * @access  Public
 */
export const getPublicCard = asyncHandler(async (req: Request, res: Response) => {
  const card = await cardService.getPublicCard(req.params.shareToken);

  if (!card) {
    throw new AppError('Card not found or no longer available', 404);
  }

  res.status(200).json({
    success: true,
    data: {
      id: card.id,
      template: card.template,
      planet_placements: card.planet_placements,
      show_insight: card.show_insight,
      insight_text: card.insight_text,
      image_url: card.image_url,
      referral_code: card.referral_code,
      created_at: card.created_at,
    },
  });
});

/**
 * @route   GET /api/v1/cards/history
 * @desc    Get user's generated cards list
 * @access  Private
 */
export const getCardHistory = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
  const offset = parseInt(req.query.offset as string) || 0;

  const cards = await cardService.getUserCards(req.user.id, limit, offset);

  res.status(200).json({
    success: true,
    data: {
      cards,
      limit,
      offset,
    },
  });
});

/**
 * @route   DELETE /api/v1/cards/:id
 * @desc    Delete a card (soft delete)
 * @access  Private (owner only)
 */
export const deleteCard = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const deleted = await cardService.deleteCard(req.params.id, req.user.id);

  if (!deleted) {
    throw new AppError('Card not found or already deleted', 404);
  }

  res.status(200).json({
    success: true,
    data: { deleted: true },
  });
});

/**
 * @route   GET /api/v1/cards/public/:shareToken/og
 * @desc    Get OG meta data for social previews
 * @access  Public
 */
export const getOgData = asyncHandler(async (req: Request, res: Response) => {
  const ogData = await cardService.getOgData(req.params.shareToken);

  if (!ogData) {
    throw new AppError('Card not found', 404);
  }

  res.status(200).json({
    success: true,
    data: ogData,
  });
});
