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
// Temporarily commented out for debugging
// import aiRoutes from '../../modules/ai/routes/ai.routes';
// import healthRoutes from '../../routes/health.routes';

const router = Router();

// Health check (no versioning) - temporarily disabled
// router.use('/health', healthRoutes);

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

// AI-powered interpretation endpoints (temporarily disabled)
// router.use('/ai', aiRoutes);

export default router;
