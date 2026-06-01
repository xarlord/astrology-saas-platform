/**
 * Card Routes
 * Shareable natal chart card API endpoints
 */

import { Router } from 'express';
import Joi from 'joi';
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

// Public routes (no auth required)
router.get('/public/:shareToken', validateParams(shareTokenParamSchema), getPublicCard);
router.get('/public/:shareToken/og', validateParams(shareTokenParamSchema), getOgData);

// Protected routes (auth required)
router.post(
  '/generate',
  authenticate,
  validateBody(
    Joi.object({
      chartId: Joi.string().uuid().required(),
      template: Joi.string()
        .valid('instagram_story', 'twitter_x', 'pinterest', 'square', 'linkedin')
        .optional(),
      planetPlacements: Joi.array().items(Joi.string()).optional(),
      insightText: Joi.string().max(500).optional(),
      showInsight: Joi.boolean().optional(),
    }),
  ),
  generateCard,
);
router.get('/history', authenticate, validateQuery(paginationSchema), getCardHistory);
router.get('/:id', authenticate, validateParams(uuidParamSchema), getCard);
router.delete('/:id', authenticate, validateParams(uuidParamSchema), deleteCard);

export { router as cardRoutes };
