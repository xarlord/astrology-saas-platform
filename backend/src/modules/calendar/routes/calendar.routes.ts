/**
 * Calendar Routes
 * API routes for astrological calendar functionality
 */

import { Router } from 'express';
import calendarController from '../controllers/calendar.controller';
import { authenticate, AuthenticatedRequest } from '../../../middleware/auth';

const router = Router();

// All calendar routes require authentication
router.use(authenticate);

// GET /api/calendar/month/:year/:month - Get events for a specific month
router.get('/month/:year/:month', (req, res, next) => {
  calendarController.getMonthEvents(req as AuthenticatedRequest, res).catch(next);
});

// POST /api/calendar/events - Create custom calendar event
router.post('/events', (req, res, next) => {
  calendarController.createCustomEvent(req as AuthenticatedRequest, res).catch(next);
});

// DELETE /api/calendar/events/:id - Delete a calendar event
router.delete('/events/:id', (req, res, next) => {
  calendarController.deleteEvent(req as AuthenticatedRequest, res).catch(next);
});

export default router;
