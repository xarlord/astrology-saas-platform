/**
 * Calendar Routes
 * API routes for astrological calendar functionality
 */

import { Router } from 'express';
import calendarController from '../controllers/calendar.controller';
import { authenticate, optionalAuthenticate } from '../../../middleware/auth';

const router = Router();

// GET /api/calendar/month/:year/:month - Get events for a specific month
// Uses optional auth - returns global events for unauthenticated users
router.get('/month/:year/:month', optionalAuthenticate, calendarController.getMonthEvents.bind(calendarController));

// All other calendar routes require authentication
router.use(authenticate);

// POST /api/calendar/events - Create custom calendar event
router.post('/events', calendarController.createCustomEvent.bind(calendarController));

// DELETE /api/calendar/events/:id - Delete a calendar event
router.delete('/events/:id', calendarController.deleteEvent.bind(calendarController));

export default router;
