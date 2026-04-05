/**
 * Card Routes
 * Shareable natal chart card API endpoints
 */

import { Router } from 'express';
import { authenticate } from '../../../middleware/auth';
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
router.get('/public/:shareToken', getPublicCard);
router.get('/public/:shareToken/og', getOgData);

// Protected routes (auth required)
router.post('/generate', authenticate, generateCard);
router.get('/history', authenticate, getCardHistory);
router.get('/:id', authenticate, getCard);
router.delete('/:id', authenticate, deleteCard);

export { router as cardRoutes };
