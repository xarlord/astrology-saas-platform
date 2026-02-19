/**
 * Calendar Controller - Alias Export
 */

import calendarController from '../modules/calendar/controllers/calendar.controller';

export const getCalendarEvents = calendarController.getMonthEvents;
export const getPersonalTransits = calendarController.getMonthEvents; // Using getMonthEvents as placeholder
export const createEvent = calendarController.createCustomEvent;
export const updateEvent = calendarController.createCustomEvent; // Using createCustomEvent as placeholder
export const deleteEvent = calendarController.deleteEvent;
