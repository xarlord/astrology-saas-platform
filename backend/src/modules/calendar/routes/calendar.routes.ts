/**
 * Calendar Routes
 * API routes for astrological calendar functionality
 */

import { Router } from 'express';
import { getMonthEvents, createCustomEvent, deleteEvent } from '../controllers/calendar.controller';
import { authenticate, optionalAuthenticate } from '../../../middleware/auth';
import { validateBody, createCalendarEventSchema } from '../../../utils/validators';

const router = Router();

// Uses optional auth - returns global events for unauthenticated users

/**
 * @route   GET /api/v1/calendar/month/:year/:month
 * @desc    Get events for a specific month
 * @access  Public
 *
 * @openapi
 * /api/v1/calendar/month/{year}/{month}:
 *   get:
 *     tags: [Calendar]
 *     summary: Get events for a specific month
 *     description: Returns astrological events for the specified month. Unauthenticated users receive global events; authenticated users also see personal events.
 *     security: []
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1900
 *           maximum: 2100
 *         description: Year (e.g. 2026)
 *       - in: path
 *         name: month
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: Month (1-12)
 *     responses:
 *       200:
 *         description: Monthly calendar events
 *       400:
 *         description: Invalid year or month
 *       500:
 *         description: Server error
 */
router.get('/month/:year/:month', optionalAuthenticate, getMonthEvents);

// All other calendar routes require authentication
router.use(authenticate);

// POST /api/calendar/events - Create custom calendar event

/**
 * @route   POST /api/v1/calendar/events
 * @desc    Create custom calendar event
 * @access  Private
 *
 * @openapi
 * /api/v1/calendar/events:
 *   post:
 *     tags: [Calendar]
 *     summary: Create a custom calendar event
 *     description: Create a new custom event on the authenticated user's calendar.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, date]
 *             properties:
 *               title:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *     responses:
 *       201:
 *         description: Event created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/events', validateBody(createCalendarEventSchema), createCustomEvent);

// DELETE /api/calendar/events/:id - Delete a calendar event

/**
 * @route   DELETE /api/v1/calendar/events/:id
 * @desc    Delete a calendar event
 * @access  Private
 *
 * @openapi
 * /api/v1/calendar/events/{id}:
 *   delete:
 *     tags: [Calendar]
 *     summary: Delete a calendar event
 *     description: Delete a custom calendar event belonging to the authenticated user.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Event not found
 *       500:
 *         description: Server error
 */
router.delete('/events/:id', deleteEvent);

export { router as calendarRoutes };
