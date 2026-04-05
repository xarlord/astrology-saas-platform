/**
 * Synastry Routes
 * API endpoints for synastry and compatibility calculations
 */

import { Router, RequestHandler } from 'express';
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
/**
 * @openapi
 * /api/v1/synastry/compare:
 *   post:
 *     tags: [Synastry]
 *     summary: Compare two charts and calculate synastry
 *     description: Calculate synastry aspects and connections between two natal charts.
 *     security: [{ bearerAuth: [] }]
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
 *               chart2Id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Synastry comparison results
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Chart not found
 *       500:
 *         description: Server error
 */
router.post('/compare', synastryController.compareCharts as RequestHandler);

/**
 * @route   POST /api/synastry/compatibility
 * @desc    Calculate compatibility scores between two charts
 * @access  Private
 * @body    { chart1Id: string, chart2Id: string, includeComposite?: boolean }
 */
/**
 * @openapi
 * /api/v1/synastry/compatibility:
 *   post:
 *     tags: [Synastry]
 *     summary: Get compatibility scores
 *     description: Calculate compatibility scores between two natal charts with optional composite chart generation.
 *     security: [{ bearerAuth: [] }]
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
 *               chart2Id:
 *                 type: string
 *               includeComposite:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       200:
 *         description: Compatibility scores and analysis
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Chart not found
 *       500:
 *         description: Server error
 */
router.post('/compatibility', synastryController.getCompatibility as RequestHandler);

/**
 * @route   GET /api/synastry/reports
 * @desc    Get all synastry reports for user
 * @access  Private
 * @query   page, limit
 */
/**
 * @openapi
 * /api/v1/synastry/reports:
 *   get:
 *     tags: [Synastry]
 *     summary: Get all synastry reports
 *     description: Retrieve a paginated list of all synastry reports for the authenticated user.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Results per page
 *     responses:
 *       200:
 *         description: List of synastry reports
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/reports', synastryController.getSynastryReports);

/**
 * @route   GET /api/synastry/reports/:id
 * @desc    Get specific synastry report
 * @access  Private
 */
/**
 * @openapi
 * /api/v1/synastry/reports/{id}:
 *   get:
 *     tags: [Synastry]
 *     summary: Get a specific synastry report
 *     description: Retrieve detailed information about a specific synastry report by its ID.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Synastry report ID
 *     responses:
 *       200:
 *         description: Synastry report details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Report not found
 *       500:
 *         description: Server error
 */
router.get('/reports/:id', synastryController.getSynastryReport);

/**
 * @route   PATCH /api/synastry/reports/:id
 * @desc    Update synastry report (notes, favorite)
 * @access  Private
 * @body    { isFavorite?: boolean, notes?: string }
 */
/**
 * @openapi
 * /api/v1/synastry/reports/{id}:
 *   patch:
 *     tags: [Synastry]
 *     summary: Update a synastry report
 *     description: Update a synastry report's notes or favorite status.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Synastry report ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isFavorite:
 *                 type: boolean
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated synastry report
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Report not found
 *       500:
 *         description: Server error
 */
router.patch('/reports/:id', synastryController.updateSynastryReport);

/**
 * @route   DELETE /api/synastry/reports/:id
 * @desc    Delete a synastry report
 * @access  Private
 */
/**
 * @openapi
 * /api/v1/synastry/reports/{id}:
 *   delete:
 *     tags: [Synastry]
 *     summary: Delete a synastry report
 *     description: Permanently delete a synastry report belonging to the authenticated user.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Synastry report ID
 *     responses:
 *       200:
 *         description: Report deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Report not found
 *       500:
 *         description: Server error
 */
router.delete('/reports/:id', synastryController.deleteSynastryReport);

export { router };
