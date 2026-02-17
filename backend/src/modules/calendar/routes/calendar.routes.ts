/**
 * Calendar Routes
 * API routes for astrological calendar functionality
 */

import { Router } from 'express';
import calendarController from '../controllers/calendar.controller';
import { authenticate } from '../../../middleware/auth';

const router = Router();

// All calendar routes require authentication
router.use(authenticate);

// GET /api/calendar/month/:year/:month - Get events for a specific month
router.get('/month/:year/:month', calendarController.getMonthEvents.bind(calendarController));

// POST /api/calendar/events - Create custom calendar event
router.post('/events', calendarController.createCustomEvent.bind(calendarController));

// DELETE /api/calendar/events/:id - Delete a calendar event
router.delete('/events/:id', calendarController.deleteEvent.bind(calendarController));

export default router;
