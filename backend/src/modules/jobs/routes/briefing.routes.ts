/**
 * Briefing Routes
 * API routes for daily cosmic briefing
 *
 * CHI-68: In-app briefing page accessible from dashboard
 */

import { Router, RequestHandler } from 'express';
import { authenticate } from '../../../middleware/auth';
import { getBriefing, getBriefingByDate } from '../controllers/briefing.controller';

const router = Router();

// All briefing routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/briefing
 * @desc    Get today's daily cosmic briefing
 * @access  Private
 */
router.get('/', getBriefing as RequestHandler);

/**
 * @route   GET /api/v1/briefing/:date
 * @desc    Get briefing for a specific date
 * @access  Private
 */
router.get('/:date', getBriefingByDate as RequestHandler);

export { router as briefingRoutes };
