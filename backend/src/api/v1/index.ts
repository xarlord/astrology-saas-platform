/**
 * API v1 Routes
 * Current stable API version
 *
 * NOTE: AI-powered interpretation endpoints are disabled pending resolution of
 * module loading issues. The comprehensive interpretation engine in
 * modules/analysis/services/interpretation.service.ts provides full
 * personality analysis, transit interpretations, and aspect pattern detection.
 * The AI enhancement feature can be re-enabled when needed.
 */

import { Router } from 'express';
import { authRoutes } from '../../modules/auth';
import { userRoutes } from '../../modules/users';
import { chartRoutes } from '../../modules/charts';
import { analysisRoutes } from '../../modules/analysis';
import { transitRoutes } from '../../modules/transits';
import { calendarRoutes } from '../../modules/calendar';
import { lunarReturnRoutes } from '../../modules/lunar';
import { synastryRoutes } from '../../modules/synastry';
import { solarReturnRoutes } from '../../modules/solar';
import healthRoutes from '../../routes/health.routes';

const router = Router();

// v1 API root endpoint
router.get('/', (_req, res) => {
  res.json({
    version: 'v1',
    status: 'active',
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      charts: '/api/v1/charts',
      analysis: '/api/v1/analysis',
      transits: '/api/v1/transits',
      calendar: '/api/v1/calendar',
      'lunar-return': '/api/v1/lunar-return',
      synastry: '/api/v1/synastry',
      'solar-returns': '/api/v1/solar-returns',
      health: '/health'
    }
  });
});

// Health check (no versioning)
router.use('/health', healthRoutes);

// Authentication endpoints
router.use('/auth', authRoutes);

// User endpoints
router.use('/users', userRoutes);

// Chart endpoints
router.use('/charts', chartRoutes);

// Analysis endpoints
router.use('/analysis', analysisRoutes);

// Transit endpoints
router.use('/transits', transitRoutes);

// Calendar endpoints
router.use('/calendar', calendarRoutes);

// Lunar return endpoints
router.use('/lunar-return', lunarReturnRoutes);

// Synastry endpoints
router.use('/synastry', synastryRoutes);

// Solar return endpoints
router.use('/solar-returns', solarReturnRoutes);

export default router;
