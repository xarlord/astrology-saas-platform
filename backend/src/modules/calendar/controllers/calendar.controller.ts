/**
 * Calendar Controller
 * API endpoints for astrological calendar functionality
 */

import { Response } from 'express';
import { AuthenticatedRequest } from '../../../middleware/auth';
import { asyncHandler } from '../../../middleware/errorHandler';
import { AppError } from '../../../utils/appError';
import calendarEventModel from '../models/calendarEvent.model';
import globalEventsService from '../services/globalEvents.service';

class CalendarController {
  /**
   * GET /api/calendar/month/:year/:month
   * Get calendar events for a specific month
   * Includes both personal events and global astrological events
   * With optional auth: returns only global events for unauthenticated users
   */
  async getMonthEvents(req: Request, res: Response): Promise<void> {
    try {
      const { year, month } = req.params;
      const { includeGlobal = 'true' } = req.query;

      // Validate year and month
      const yearNum = parseInt(year);
      const monthNum = parseInt(month);

      if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
        res.status(400).json({
          success: false,
          error: 'Invalid year or month. Month must be 1-12.',
        });
        return;
      }

      let events: any[] = [];

      // Get user's personalized events if authenticated
      if (req.user?.id) {
        const personalEvents = await calendarEventModel.findByMonth(
          req.user.id,
          yearNum,
          monthNum
        );
        events = [...personalEvents];
      }

      // Include global events if requested
      if (includeGlobal === 'true') {
        const globalEvents = await this.generateGlobalEvents(yearNum, monthNum);
        events = [...events, ...globalEvents];
      }

      res.status(200).json({
        success: true,
        data: events,
        meta: {
          year: yearNum,
          month: monthNum,
          total: events.length,
          isGuest: !req.user?.id,
        },
      });
    } catch (error) {
      logger.error('Error fetching calendar events:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch calendar events',
      });
    }
  }

  /**
   * Generate global astrological events for a month
   */
  private async generateGlobalEvents(year: number, month: number): Promise<any[]> {
    const events: any[] = [];

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // Get moon phases
    const newMoons = await globalEventsService.calculateMoonPhases(year, 'new');
    const monthNewMoons = newMoons.filter((nm) => {
      const nmDate = new Date(nm.date);
      return nmDate >= startDate && nmDate <= endDate;
    });

    monthNewMoons.forEach((nm) => {
      events.push({
        id: `global-newmoon-${nm.date.getTime()}`,
        user_id: null,
        event_type: 'new_moon',
        event_date: nm.date,
        event_data: {
          sign: nm.sign,
          degree: nm.degree,
          illumination: nm.illumination,
        },
        interpretation: `New Moon in ${this.capitalize(nm.sign)} - Time for new beginnings`,
      });
    });

    // Full moons
    const fullMoons = await globalEventsService.calculateMoonPhases(year, 'full');
    const monthFullMoons = fullMoons.filter((fm) => {
      const fmDate = new Date(fm.date);
      return fmDate >= startDate && fmDate <= endDate;
    });

    monthFullMoons.forEach((fm) => {
      events.push({
        id: `global-fullmoon-${fm.date.getTime()}`,
        user_id: null,
        event_type: 'full_moon',
        event_date: fm.date,
        event_data: {
          sign: fm.sign,
          degree: fm.degree,
          illumination: fm.illumination,
        },
        interpretation: `Full Moon in ${this.capitalize(fm.sign)} - Time for culmination`,
      });
    });

    return events;
  }

  /**
   * POST /api/calendar/events
   * Create a custom calendar event
   */
  async createCustomEvent(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { event_type, event_date, event_data, interpretation } = req.body;

      // Validate required fields
      if (!event_type || !event_date) {
        res.status(400).json({
          success: false,
          error: 'event_type and event_date are required',
        });
        return;
      }

      // Create event
      const event = await calendarEventModel.create(userId, {
        event_type,
        event_date: new Date(event_date),
        event_data: event_data || {},
        interpretation: interpretation || '',
      });

      res.status(201).json({
        success: true,
        data: event,
      });
    } catch (error) {
      logger.error('Error creating custom event:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create custom event',
      });
    }
  }

  /**
   * DELETE /api/calendar/events/:id
   * Delete a calendar event
   */
  async deleteEvent(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      // Delete event (only if it belongs to the user)
      const deleted = await calendarEventModel.delete(id, userId);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Event not found or does not belong to user',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Event deleted successfully',
      });
    } catch (error) {
      logger.error('Error deleting event:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete event',
      });
    }
  }

  /**
   * Helper: Capitalize first letter
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

/**
 * Generate global astrological events for a month
 */
async function generateGlobalEvents(year: number, month: number): Promise<any[]> {
  const events: any[] = [];

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  // Get moon phases
  const newMoons = await globalEventsService.calculateMoonPhases(year, 'new');
  const monthNewMoons = newMoons.filter((nm) => {
    const nmDate = new Date(nm.date);
    return nmDate >= startDate && nmDate <= endDate;
  });

  monthNewMoons.forEach((nm) => {
    events.push({
      id: `global-newmoon-${nm.date.getTime()}`,
      user_id: null,
      event_type: 'new_moon',
      event_date: nm.date,
      event_data: {
        sign: nm.sign,
        degree: nm.degree,
        illumination: nm.illumination,
      },
      interpretation: `New Moon in ${capitalize(nm.sign)} - Time for new beginnings`,
    });
  });

  // Full moons
  const fullMoons = await globalEventsService.calculateMoonPhases(year, 'full');
  const monthFullMoons = fullMoons.filter((fm) => {
    const fmDate = new Date(fm.date);
    return fmDate >= startDate && fmDate <= endDate;
  });

  monthFullMoons.forEach((fm) => {
    events.push({
      id: `global-fullmoon-${fm.date.getTime()}`,
      user_id: null,
      event_type: 'full_moon',
      event_date: fm.date,
      event_data: {
        sign: fm.sign,
        degree: fm.degree,
        illumination: fm.illumination,
      },
      interpretation: `Full Moon in ${capitalize(fm.sign)} - Time for culmination`,
    });
  });

  return events;
}

/**
 * GET /api/calendar/month/:year/:month
 * Get calendar events for a specific month
 * Includes both personal events and global astrological events
 */
export const getMonthEvents = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user.id;
    const { year, month } = req.params;
    const { includeGlobal = 'true' } = req.query;

    // Validate year and month
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);

    if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      throw new AppError('Invalid year or month. Month must be 1-12.', 400);
    }

    // Get user's personalized events for the month
    const personalEvents = await calendarEventModel.findByMonth(
      userId,
      yearNum,
      monthNum
    );

    let events = [...personalEvents];

    // Include global events if requested
    if (includeGlobal === 'true') {
      const globalEvents = await generateGlobalEvents(yearNum, monthNum);
      events = [...events, ...globalEvents];
    }

    res.status(200).json({
      success: true,
      data: events,
      meta: {
        year: yearNum,
        month: monthNum,
        total: events.length,
      },
    });
  }
);

/**
 * POST /api/calendar/events
 * Create a custom calendar event
 */
export const createCustomEvent = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user.id;
    const { event_type, event_date, event_data, interpretation } = req.body;

    // Validate required fields
    if (!event_type || !event_date) {
      throw new AppError('event_type and event_date are required', 400);
    }

    // Create event
    const event = await calendarEventModel.create(userId, {
      event_type,
      event_date: new Date(event_date),
      event_data: event_data || {},
      interpretation: interpretation || '',
    });

    res.status(201).json({
      success: true,
      data: event,
    });
  }
);

/**
 * DELETE /api/calendar/events/:id
 * Delete a calendar event
 */
export const deleteEvent = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user.id;
    const { id } = req.params;

    // Delete event (only if it belongs to the user)
    const deleted = await calendarEventModel.delete(id, userId);

    if (!deleted) {
      throw new AppError('Event not found or does not belong to user', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully',
    });
  }
);
