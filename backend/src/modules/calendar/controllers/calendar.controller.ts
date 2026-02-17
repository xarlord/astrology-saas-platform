/**
 * Calendar Controller
 * API endpoints for astrological calendar functionality
 */

import { Request, Response } from 'express';
import calendarEventModel from '../models/calendarEvent.model';
import globalEventsService from '../services/globalEvents.service';
import { RequestWithUser } from '../../../middleware/auth';

class CalendarController {
  /**
   * GET /api/calendar/month/:year/:month
   * Get calendar events for a specific month
   * Includes both personal events and global astrological events
   */
  async getMonthEvents(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
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

      // Get user's personalized events for the month
      const personalEvents = await calendarEventModel.findByMonth(
        userId,
        yearNum,
        monthNum
      );

      let events = [...personalEvents];

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
        },
      });
    } catch (error) {
      console.error('Error fetching calendar events:', error);
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
        id: \`global-newmoon-\${nm.date.getTime()}\`,
        user_id: null,
        event_type: 'new_moon',
        event_date: nm.date,
        event_data: {
          sign: nm.sign,
          degree: nm.degree,
          illumination: nm.illumination,
        },
        interpretation: \`New Moon in \${this.capitalize(nm.sign)} - Time for new beginnings\`,
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
        id: \`global-fullmoon-\${fm.date.getTime()}\`,
        user_id: null,
        event_type: 'full_moon',
        event_date: fm.date,
        event_data: {
          sign: fm.sign,
          degree: fm.degree,
          illumination: fm.illumination,
        },
        interpretation: \`Full Moon in \${this.capitalize(fm.sign)} - Time for culmination\`,
      });
    });

    return events;
  }

  /**
   * Helper: Capitalize first letter
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

export default new CalendarController();
