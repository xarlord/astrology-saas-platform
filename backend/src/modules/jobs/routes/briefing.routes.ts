/**
 * Briefing Routes
 * API routes for daily cosmic briefing
 *
 * CHI-68: In-app briefing page accessible from dashboard
 */

import { Router, RequestHandler } from 'express';
import { authenticate } from '../../../middleware/auth';
import { validateParams, dateParamSchema } from '../../../utils/validators';
import { getBriefing, getBriefingByDate } from '../controllers/briefing.controller';

const router = Router();

// All briefing routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/briefing
 * @desc    Get today's daily cosmic briefing
 * @access  Private
 *
 * @openapi
 * /api/v1/briefing:
 *   get:
 *     tags: [Briefing]
 *     summary: Get today's daily cosmic briefing
 *     responses:
 *       200:
 *         description: Daily briefing data
 */
router.get('/', getBriefing as RequestHandler);

/**
 * @route   GET /api/v1/briefing/:date
 * @desc    Get briefing for a specific date
 * @access  Private
 *
 * @openapi
 * /api/v1/briefing/{date}:
 *   get:
 *     tags: [Briefing]
 *     summary: Get briefing for a specific date
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Briefing data for the specified date
 *       400:
 *         description: Invalid date format
 */
router.get('/:date', validateParams(dateParamSchema), getBriefingByDate as RequestHandler);

export { router as briefingRoutes };
