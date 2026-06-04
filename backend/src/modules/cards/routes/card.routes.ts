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
  chartId: z.string().uuid(),
  template: z
    .enum(['instagram_story', 'twitter_x', 'pinterest', 'square', 'linkedin'])
    .optional(),
  planetPlacements: z.array(z.string()).optional(),
  insightText: z.string().max(500).optional(),
  showInsight: z.boolean().optional(),
});

// Public routes (no auth required)
router.get('/public/:shareToken', validateParams(shareTokenParamSchema), getPublicCard);
router.get('/public/:shareToken/og', validateParams(shareTokenParamSchema), getOgData);

// Protected routes (auth required)
router.post(
  '/generate',
  authenticate,
  validateBody(generateCardSchema),
  generateCard,
);
router.get('/history', authenticate, validateQuery(paginationSchema), getCardHistory);
router.get('/:id', authenticate, validateParams(uuidParamSchema), getCard);
router.delete('/:id', authenticate, validateParams(uuidParamSchema), deleteCard);

export { router as cardRoutes };
