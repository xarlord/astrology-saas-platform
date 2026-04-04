/**
 * AI Routes
 * Defines routes for AI-powered interpretation endpoints
 */

import { Router } from 'express';
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

const router = Router();

// Public endpoints (no authentication required)
router.get('/status', checkStatus);

// Protected endpoints (authentication required)
router.use(authenticate);

router.post('/natal', enforceAILimit as any, generateNatal as any);
router.post('/transit', enforceAILimit as any, generateTransit as any);
router.post('/compatibility', enforceAILimit as any, generateCompatibility as any);
router.post('/lunar-return', enforceAILimit as any, generateLunarReturn as any);
router.post('/solar-return', enforceAILimit as any, generateSolarReturn as any);

// Usage tracking endpoints
router.get('/usage/stats', getUserStats);
router.get('/usage/history', getUsageHistory);
router.get('/usage/daily', getDailyUsage);
router.get('/usage/range', getUsageByDateRange);
router.get('/usage/limit', checkUsageLimit);
router.get('/usage/pricing', getPricing);
router.post('/usage/estimate', estimateCost);

// Legacy endpoint (deprecated - use /usage/stats)
router.get('/usage', getUsageStats);
router.post('/cache/clear', clearCache);

export default router;
