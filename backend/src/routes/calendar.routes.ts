/**
 * Calendar Routes
 * API endpoints for astrological calendar features
 */

import { Router } from 'express';
import * as CalendarController from '../controllers/calendar.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/calendar/month
 * @desc    Get calendar events for a month
 * @access  Private (optional - returns global events if not authenticated)
 * @query   month - Month number (1-12)
 * @query   year - Year
 */
router.get('/month', CalendarController.getCalendarMonth);

/**
 * @route   GET /api/calendar/day/:date
 * @desc    Get detailed astrological weather for a specific day
 * @access  Private (optional)
 * @param   date - Date in ISO format (YYYY-MM-DD)
 */
router.get('/day/:date', CalendarController.getCalendarDay);

/**
 * @route   POST /api/calendar/reminders
 * @desc    Set up event reminders
 * @access  Private
 * @body    eventType - Event type to remind about
 * @body    reminderType - Type of reminder (email/push)
 * @body    reminderAdvanceHours - Array of hours before event to notify
 * @body    isActive - Whether reminder is active
 */
router.post('/reminders', authenticate, CalendarController.setReminder);

/**
 * @route   GET /api/calendar/export
 * @desc    Export calendar as iCal file
 * @access  Private (optional)
 * @query   startDate - Start date in ISO format
 * @query   endDate - End date in ISO format
 * @query   includePersonal - Whether to include personal transits
 */
router.get('/export', CalendarController.exportCalendar);

export default router;
