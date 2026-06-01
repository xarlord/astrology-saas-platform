/**
 * Synastry Routes
 * API endpoints for synastry and compatibility calculations
 */

import { Router, RequestHandler } from 'express';
import Joi from 'joi';
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

/**
 * @route   POST /api/synastry/compare
 * @desc    Compare two charts and calculate synastry
 * @access  Private
 * @body    { chart1Id: string, chart2Id: string }
 */
router.post(
  '/compare',
  validateBody(
    Joi.object({
      chart1Id: Joi.string().uuid().required(),
      chart2Id: Joi.string().uuid().required(),
    }),
  ),
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
  validateBody(
    Joi.object({
      chart1Id: Joi.string().uuid().required(),
      chart2Id: Joi.string().uuid().required(),
      includeComposite: Joi.boolean().optional(),
    }),
  ),
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
  validateBody(
    Joi.object({
      isFavorite: Joi.boolean().optional(),
      notes: Joi.string().max(5000).optional(),
    }),
  ),
  synastryController.updateSynastryReport,
);

/**
 * @route   DELETE /api/synastry/reports/:id
 * @desc    Delete a synastry report
 * @access  Private
 */
router.delete('/reports/:id', validateParams(uuidParamSchema), synastryController.deleteSynastryReport);

export { router };
