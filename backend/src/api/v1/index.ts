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
