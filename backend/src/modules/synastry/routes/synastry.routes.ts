/**
 * Synastry Routes
 * API endpoints for synastry and compatibility calculations
 */

import { Router, RequestHandler } from 'express';
import { z } from 'zod';
import * as synastryController from '../controllers/synastry.controller';
import { authenticate } from '../../../middleware/auth';
import {
  validateBody,
  validateQuery,
  validateParams,
  paginationSchema,
  uuidParamSchema,
} from '../../../utils/validators';

const router = Router();

// All routes require authentication
router.use(authenticate);

const compareSchema = z.object({
  chart1Id: z.string().uuid(),
  chart2Id: z.string().uuid(),
});

const compatibilitySchema = z.object({
  chart1Id: z.string().uuid(),
  chart2Id: z.string().uuid(),
  includeComposite: z.boolean().optional(),
});

const updateReportSchema = z.object({
  isFavorite: z.boolean().optional(),
  notes: z.string().max(5000).optional(),
});

/**
 * @route   POST /api/synastry/compare
 * @desc    Compare two charts and calculate synastry
 * @access  Private
 * @body    { chart1Id: string, chart2Id: string }
 */
router.post(
  '/compare',
  validateBody(compareSchema),
  synastryController.compareCharts as RequestHandler,
);

/**
 * @route   POST /api/synastry/compatibility
 * @desc    Calculate compatibility scores between two charts
 * @access  Private
 * @body    { chart1Id: string, chart2Id: string, includeComposite?: boolean }
 */
router.post(
  '/compatibility',
  validateBody(compatibilitySchema),
  synastryController.getCompatibility as RequestHandler,
);

/**
 * @route   GET /api/synastry/reports
 * @desc    Get all synastry reports for user
 * @access  Private
 * @query   page, limit
 */
router.get('/reports', validateQuery(paginationSchema), synastryController.getSynastryReports);

/**
 * @route   GET /api/synastry/reports/:id
 * @desc    Get specific synastry report
 * @access  Private
 */
router.get('/reports/:id', validateParams(uuidParamSchema), synastryController.getSynastryReport);

/**
 * @route   PATCH /api/synastry/reports/:id
 * @desc    Update synastry report (notes, favorite)
 * @access  Private
 * @body    { isFavorite?: boolean, notes?: string }
 */
router.patch(
  '/reports/:id',
  validateParams(uuidParamSchema),
  validateBody(updateReportSchema),
  synastryController.updateSynastryReport,
);

/**
 * @route   DELETE /api/synastry/reports/:id
 * @desc    Delete a synastry report
 * @access  Private
 */
router.delete('/reports/:id', validateParams(uuidParamSchema), synastryController.deleteSynastryReport);

export { router };
