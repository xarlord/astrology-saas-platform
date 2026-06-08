/**
 * Card Routes
 * Shareable natal chart card API endpoints
 */

import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../../../middleware/auth';
import {
  validateBody,
  validateQuery,
  validateParams,
  paginationSchema,
  uuidParamSchema,
  shareTokenParamSchema,
} from '../../../utils/validators';
import {
  generateCard,
  getCard,
  getPublicCard,
  getCardHistory,
  deleteCard,
  getOgData,
} from '../controllers/card.controller';

const router = Router();

const generateCardSchema = z.object({
  chart_id: z.string().uuid(),
  template: z
    .enum(['instagram_story', 'twitter_x', 'pinterest', 'square', 'linkedin'])
    .optional(),
  planet_placements: z.array(z.string()).optional(),
  insight_text: z.string().max(500).optional(),
  show_insight: z.boolean().optional(),
  referral_code: z.string().optional(),
});

// Public routes (no auth required)

/**
 * @openapi
 * /api/cards/public/{shareToken}:
 *   get:
 *     tags: [Cards]
 *     summary: Get a shareable card by token
 *     security: []
 *     parameters:
 *       - in: path
 *         name: shareToken
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Card data retrieved
 *       404:
 *         description: Card not found
 */
router.get('/public/:shareToken', validateParams(shareTokenParamSchema), getPublicCard);

/**
 * @openapi
 * /api/cards/public/{shareToken}/og:
 *   get:
 *     tags: [Cards]
 *     summary: Get OpenGraph metadata for a shared card
 *     security: []
 *     parameters:
 *       - in: path
 *         name: shareToken
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OG metadata
 *       404:
 *         description: Card not found
 */
router.get('/public/:shareToken/og', validateParams(shareTokenParamSchema), getOgData);

// Protected routes (auth required)

/**
 * @openapi
 * /api/cards/generate:
 *   post:
 *     tags: [Cards]
 *     summary: Generate a shareable chart card
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [chartId]
 *             properties:
 *               chartId:
 *                 type: string
 *                 format: uuid
 *               template:
 *                 type: string
 *                 enum: [instagram_story, twitter_x, pinterest, square, linkedin]
 *               planetPlacements:
 *                 type: array
 *                 items:
 *                   type: string
 *               insightText:
 *                 type: string
 *                 maxLength: 500
 *               showInsight:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Card generated
 *       400:
 *         description: Validation error
 */
router.post(
  '/generate',
  authenticate,
  validateBody(generateCardSchema),
  generateCard,
);

/**
 * @openapi
 * /api/cards/history:
 *   get:
 *     tags: [Cards]
 *     summary: Get user's card generation history
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Paginated card history
 */
router.get('/history', authenticate, validateQuery(paginationSchema), getCardHistory);

/**
 * @openapi
 * /api/cards/{id}:
 *   get:
 *     tags: [Cards]
 *     summary: Get a card by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Card data
 *       404:
 *         description: Card not found
 */
router.get('/:id', authenticate, validateParams(uuidParamSchema), getCard);

/**
 * @openapi
 * /api/cards/{id}:
 *   delete:
 *     tags: [Cards]
 *     summary: Delete a card
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Card deleted
 *       404:
 *         description: Card not found
 */
router.delete('/:id', authenticate, validateParams(uuidParamSchema), deleteCard);

export { router as cardRoutes };
