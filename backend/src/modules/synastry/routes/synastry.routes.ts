/**
 * Synastry Routes
 * API endpoints for synastry and compatibility calculations
 */

import { Router } from 'express';
import * as synastryController from '../controllers/synastry.controller';
import { authenticate } from '../../../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/synastry/compare
 * @desc    Compare two charts and calculate synastry
 * @access  Private
 * @body    { chart1Id: string, chart2Id: string }
 */
router.post('/compare', synastryController.compareCharts);

/**
 * @route   POST /api/synastry/compatibility
 * @desc    Calculate compatibility scores between two charts
 * @access  Private
 * @body    { chart1Id: string, chart2Id: string, includeComposite?: boolean }
 */
router.post('/compatibility', synastryController.getCompatibility);

/**
 * @route   GET /api/synastry/reports
 * @desc    Get all synastry reports for user
 * @access  Private
 * @query   page, limit
 */
router.get('/reports', synastryController.getSynastryReports);

/**
 * @route   GET /api/synastry/reports/:id
 * @desc    Get specific synastry report
 * @access  Private
 */
router.get('/reports/:id', synastryController.getSynastryReport);

/**
 * @route   PATCH /api/synastry/reports/:id
 * @desc    Update synastry report (notes, favorite)
 * @access  Private
 * @body    { isFavorite?: boolean, notes?: string }
 */
router.patch('/reports/:id', synastryController.updateSynastryReport);

/**
 * @route   DELETE /api/synastry/reports/:id
 * @desc    Delete a synastry report
 * @access  Private
 */
router.delete('/reports/:id', synastryController.deleteSynastryReport);

export const router = Router();;
