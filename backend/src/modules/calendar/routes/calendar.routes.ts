/**
 * Calendar Routes
 * API routes for astrological calendar functionality
 */

import { Router } from 'express';
import { authenticate } from '../../../middleware/auth';
import {
  getMonthEvents,
  createCustomEvent,
  deleteEvent,
} from '../controllers/calendar.controller';

const router = Router();

// All calendar routes require authentication
router.use(authenticate);

// GET /api/calendar/month/:year/:month - Get events for a specific month
router.get('/month/:year/:month', getMonthEvents);

// POST /api/calendar/events - Create custom calendar event
router.post('/events', createCustomEvent);

// DELETE /api/calendar/events/:id - Delete a calendar event
router.delete('/events/:id', deleteEvent);

export default router;
