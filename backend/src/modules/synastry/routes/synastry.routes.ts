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
 *
 * @openapi
 * /api/synastry/compare:
 *   post:
 *     tags: [Synastry]
 *     summary: Compare two charts and calculate synastry
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [chart1Id, chart2Id]
 *             properties:
 *               chart1Id:
 *                 type: string
 *                 format: uuid
 *               chart2Id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Synastry comparison data
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
 *
 * @openapi
 * /api/synastry/compatibility:
 *   post:
 *     tags: [Synastry]
 *     summary: Calculate compatibility scores between two charts
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [chart1Id, chart2Id]
 *             properties:
 *               chart1Id:
 *                 type: string
 *                 format: uuid
 *               chart2Id:
 *                 type: string
 *                 format: uuid
 *               includeComposite:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Compatibility scores
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
 *
 * @openapi
 * /api/synastry/reports:
 *   get:
 *     tags: [Synastry]
 *     summary: Get all synastry reports for the authenticated user
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Paginated synastry reports
 */
router.get('/reports', validateQuery(paginationSchema), synastryController.getSynastryReports);

/**
 * @route   GET /api/synastry/reports/:id
 * @desc    Get specific synastry report
 * @access  Private
 *
 * @openapi
 * /api/synastry/reports/{id}:
 *   get:
 *     tags: [Synastry]
 *     summary: Get a specific synastry report
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Synastry report data
 *       404:
 *         description: Report not found
 */
router.get('/reports/:id', validateParams(uuidParamSchema), synastryController.getSynastryReport);

/**
 * @route   PATCH /api/synastry/reports/:id
 * @desc    Update synastry report (notes, favorite)
 * @access  Private
 * @body    { isFavorite?: boolean, notes?: string }
 *
 * @openapi
 * /api/synastry/reports/{id}:
 *   patch:
 *     tags: [Synastry]
 *     summary: Update synastry report notes or favorite status
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isFavorite:
 *                 type: boolean
 *               notes:
 *                 type: string
 *                 maxLength: 5000
 *     responses:
 *       200:
 *         description: Report updated
 *       404:
 *         description: Report not found
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
 *
 * @openapi
 * /api/synastry/reports/{id}:
 *   delete:
 *     tags: [Synastry]
 *     summary: Delete a synastry report
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Report deleted
 *       404:
 *         description: Report not found
 */
router.delete('/reports/:id', validateParams(uuidParamSchema), synastryController.deleteSynastryReport);

export { router };
