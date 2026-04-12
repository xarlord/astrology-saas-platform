/**
 * AI Routes
 * Defines routes for AI-powered interpretation endpoints
 */

import { Router, RequestHandler } from 'express';
import {
  generateNatal,
  generateTransit,
  generateCompatibility,
  generateLunarReturn,
  generateSolarReturn,
  checkStatus,
  getUsageStats,
  clearCache,
} from '../controllers/ai.controller';
import {
  getUserStats,
  getUsageHistory,
  getDailyUsage,
  getUsageByDateRange,
  estimateCost,
  getPricing,
  checkUsageLimit,
} from '../controllers/aiUsage.controller';
import { authenticate } from '../../../middleware/auth';
import { enforceAILimit } from '../../../middleware/planEnforcement';
import { chartCreationRateLimiter } from '../../../middleware/rateLimiter';

const router = Router();

// AI interpretation rate limiter — shared across all generation endpoints
const aiRateLimiter = chartCreationRateLimiter;

// Public endpoints (no authentication required)

/**
 * @route   GET /api/v1/ai/status
 * @desc    Get AI service status
 * @access  Public
 *
 * @openapi
 * /api/v1/ai/status:
 *   get:
 *     tags: [AI]
 *     summary: Check AI service status
 *     security: []
 *     responses:
 *       200:
 *         description: AI service status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 */
router.get('/status', checkStatus);

// Protected endpoints (authentication required)
router.use(authenticate);

/**
 * @route   POST /api/v1/ai/natal
 * @desc    Generate natal chart AI interpretation
 * @access  Private
 *
 * @openapi
 * /api/v1/ai/natal:
 *   post:
 *     tags: [AI]
 *     summary: Generate natal chart AI interpretation
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Natal chart interpretation generated
 *       429:
 *         description: AI usage limit exceeded
 */
router.post('/natal', aiRateLimiter, enforceAILimit as RequestHandler, generateNatal as RequestHandler);

/**
 * @route   POST /api/v1/ai/transit
 * @desc    Generate transit AI interpretation
 * @access  Private
 *
 * @openapi
 * /api/v1/ai/transit:
 *   post:
 *     tags: [AI]
 *     summary: Generate transit AI interpretation
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Transit interpretation generated
 *       429:
 *         description: AI usage limit exceeded
 */
router.post('/transit', aiRateLimiter, enforceAILimit as RequestHandler, generateTransit as RequestHandler);

/**
 * @route   POST /api/v1/ai/compatibility
 * @desc    Generate compatibility AI interpretation
 * @access  Private
 *
 * @openapi
 * /api/v1/ai/compatibility:
 *   post:
 *     tags: [AI]
 *     summary: Generate compatibility AI interpretation
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Compatibility interpretation generated
 *       429:
 *         description: AI usage limit exceeded
 */
router.post('/compatibility', aiRateLimiter, enforceAILimit as RequestHandler, generateCompatibility as RequestHandler);

/**
 * @route   POST /api/v1/ai/lunar-return
 * @desc    Generate lunar return AI interpretation
 * @access  Private
 *
 * @openapi
 * /api/v1/ai/lunar-return:
 *   post:
 *     tags: [AI]
 *     summary: Generate lunar return AI interpretation
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Lunar return interpretation generated
 *       429:
 *         description: AI usage limit exceeded
 */
router.post('/lunar-return', aiRateLimiter, enforceAILimit as RequestHandler, generateLunarReturn as RequestHandler);

/**
 * @route   POST /api/v1/ai/solar-return
 * @desc    Generate solar return AI interpretation
 * @access  Private
 *
 * @openapi
 * /api/v1/ai/solar-return:
 *   post:
 *     tags: [AI]
 *     summary: Generate solar return AI interpretation
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Solar return interpretation generated
 *       429:
 *         description: AI usage limit exceeded
 */
router.post('/solar-return', aiRateLimiter, enforceAILimit as RequestHandler, generateSolarReturn as RequestHandler);

// Usage tracking endpoints

/**
 * @route   GET /api/v1/ai/usage/stats
 * @desc    Get AI usage statistics
 * @access  Private
 *
 * @openapi
 * /api/v1/ai/usage/stats:
 *   get:
 *     tags: [AI]
 *     summary: Get AI usage statistics
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Usage statistics
 */
router.get('/usage/stats', getUserStats);

/**
 * @route   GET /api/v1/ai/usage/history
 * @desc    Get AI usage history
 * @access  Private
 *
 * @openapi
 * /api/v1/ai/usage/history:
 *   get:
 *     tags: [AI]
 *     summary: Get AI usage history
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Usage history
 */
router.get('/usage/history', getUsageHistory);

/**
 * @route   GET /api/v1/ai/usage/daily
 * @desc    Get daily AI usage
 * @access  Private
 *
 * @openapi
 * /api/v1/ai/usage/daily:
 *   get:
 *     tags: [AI]
 *     summary: Get daily AI usage
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Daily usage data
 */
router.get('/usage/daily', getDailyUsage);

/**
 * @route   GET /api/v1/ai/usage/range
 * @desc    Get AI usage by date range
 * @access  Private
 *
 * @openapi
 * /api/v1/ai/usage/range:
 *   get:
 *     tags: [AI]
 *     summary: Get AI usage by date range
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Usage data for date range
 */
router.get('/usage/range', getUsageByDateRange);

/**
 * @route   GET /api/v1/ai/usage/limit
 * @desc    Check AI usage limit
 * @access  Private
 *
 * @openapi
 * /api/v1/ai/usage/limit:
 *   get:
 *     tags: [AI]
 *     summary: Check AI usage limit
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Usage limit status
 */
router.get('/usage/limit', checkUsageLimit);

/**
 * @route   GET /api/v1/ai/usage/pricing
 * @desc    Get AI usage pricing
 * @access  Private
 *
 * @openapi
 * /api/v1/ai/usage/pricing:
 *   get:
 *     tags: [AI]
 *     summary: Get AI usage pricing
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Pricing information
 */
router.get('/usage/pricing', getPricing);

/**
 * @route   POST /api/v1/ai/usage/estimate
 * @desc    Estimate AI interpretation cost
 * @access  Private
 *
 * @openapi
 * /api/v1/ai/usage/estimate:
 *   post:
 *     tags: [AI]
 *     summary: Estimate cost for an AI request
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Cost estimate
 */
router.post('/usage/estimate', estimateCost);

// Legacy endpoint (deprecated - use /usage/stats)

/**
 * @route   GET /api/v1/ai/usage
 * @desc    Get AI usage stats (legacy)
 * @access  Private
 *
 * @openapi
 * /api/v1/ai/usage:
 *   get:
 *     tags: [AI]
 *     summary: Get AI usage (legacy, use /usage/stats)
 *     deprecated: true
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Usage statistics
 */
router.get('/usage', getUsageStats);

/**
 * @route   POST /api/v1/ai/cache/clear
 * @desc    Clear AI response cache
 * @access  Private
 *
 * @openapi
 * /api/v1/ai/cache/clear:
 *   post:
 *     tags: [AI]
 *     summary: Clear AI response cache
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Cache cleared
 */
router.post('/cache/clear', clearCache);

export { router as aiRoutes };
