/**
 * API v1 Routes
 * Current stable API version
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
import { pushNotificationRoutes } from '../../modules/notifications';
import { healthRoutes } from '../../routes/health.routes';
import { router as timezoneRoutes } from '../../modules/shared/routes/timezone.routes';
import { locationRoutes } from '../../modules/shared/routes/location.routes';
import { router as shareRoutes } from '../../modules/charts/routes/share.routes';
import { aiRoutes } from '../../modules/ai/routes/ai.routes';
import { billingRoutes } from '../../modules/billing';
import { briefingRoutes } from '../../modules/jobs';
import { cardRoutes } from '../../modules/cards';

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

// Chart sharing (public)
router.use('/share', shareRoutes);

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

// Timezone endpoints (public)
router.use('/timezone', timezoneRoutes);

// Location endpoints (public)
router.use('/location', locationRoutes);

// AI interpretation endpoints
router.use('/ai', aiRoutes);

// Push notification endpoints
router.use('/notifications', pushNotificationRoutes);

// Billing endpoints
router.use('/billing', billingRoutes);

// Daily briefing endpoints
router.use('/briefing', briefingRoutes);

// Shareable card endpoints
router.use('/cards', cardRoutes);

export default router;
