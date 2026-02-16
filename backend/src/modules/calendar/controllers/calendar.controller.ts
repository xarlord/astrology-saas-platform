/**
 * Calendar Controller
 * Handles API endpoints for astrological calendar features
 */

import { Request, Response, NextFunction } from 'express';
import CalendarService from '../services/calendar.service';
import {
  RETROGRADE_INTERPRETATIONS,
  MOON_PHASE_INTERPRETATIONS,
  ECLIPSE_INTERPRETATIONS,
  SEASONAL_INGRESS_INTERPRETATIONS,
} from '../data/astrologicalEvents';
import {
  AstrologicalEvent,
  TransitEvent,
  CalendarMonth,
  DailyWeather,
  EventType,
  Planet,
} from '../models/calendar.model';
import { AppError } from '../../utils/appError';

// Helper function to get user's natal chart (simplified - in production, would fetch from database)
async function getUserNatalChart(userId: string) {
  // TODO: Fetch from database
  // For now, return a placeholder
  return {
    userId,
    planets: [
      { planet: 'sun' as Planet, degree: 15, sign: 'leo', house: 10 },
      { planet: 'moon' as Planet, degree: 20, sign: 'pisces', house: 4 },
      { planet: 'mercury' as Planet, degree: 5, sign: 'virgo', house: 11 },
      { planet: 'venus' as Planet, degree: 25, sign: 'cancer', house: 9 },
      { planet: 'mars' as Planet, degree: 10, sign: 'scorpio', house: 1 },
    ],
  };
}

// Helper function to calculate transits for a user's chart
async function calculatePersonalTransits(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<TransitEvent[]> {
  const natalChart = await getUserNatalChart(userId);
  const transits: TransitEvent[] = [];

  // For each natal planet, check if any transiting planet is making an aspect
  for (const natalPlanet of natalChart.planets) {
    // Check outer planet transits (Jupiter, Saturn, Uranus, Neptune, Pluto)
    const outerPlanets: Planet[] = ['jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];

    for (const transitingPlanet of outerPlanets) {
      // Get retrograde periods
      const retroPeriods = CalendarService.getRetrogradePeriod(transitingPlanet, startDate.getFullYear());

      // Simplified: Check if transit is active during date range
      // In production, would calculate exact transiting positions
      const hasTransit = Math.random() > 0.7; // Placeholder

      if (hasTransit) {
        const intensity = CalendarService.calculateTransitIntensity({
          transitingPlanet,
          natalPlanet: natalPlanet.planet,
          aspectType: 'square', // Placeholder
          orb: 2,
          applying: true,
        });

        if (intensity >= 7) {
          // Only include significant transits
          transits.push({
            id: `transit_${transitingPlanet}_${natalPlanet.planet}_${Date.now()}`,
            eventType: 'transit',
            eventName: `${transitingPlanet.charAt(0).toUpperCase() + transitingPlanet.slice(1)} Square ${natalPlanet.planet
              .charAt(0)
              .toUpperCase() + natalPlanet.planet.slice(1)}`,
            startDate: new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime())),
            intensity,
            affectedPlanets: [transitingPlanet, natalPlanet.planet],
            aspectType: 'square',
            description: `${transitingPlanet} transiting square your natal ${natalPlanet.planet}`,
            advice: [`This transit brings ${transitingPlanet} energy to your ${natalPlanet.planet}`],
            isGlobal: false,
            natalPlanet: natalPlanet.planet,
            natalHouse: natalPlanet.house,
            transitingPlanet,
            orb: 2,
            applying: true,
            createdAt: new Date(),
          } as TransitEvent);
        }
      }
    }
  }

  return transits;
}

/**
 * Get calendar events for a month
 * GET /api/calendar/month
 */
export async function getCalendarMonth(req: Request, res: Response, next: NextFunction) {
  try {
    const { month, year } = req.query;
    const userId = (req as any).user?.id; // From auth middleware

    if (!month || !year) {
      throw new AppError('Month and year are required', 400);
    }

    const monthNum = parseInt(month as string);
    const yearNum = parseInt(year as string);

    if (monthNum < 1 || monthNum > 12) {
      throw new AppError('Month must be between 1 and 12', 400);
    }

    const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 0);

    // Get global events
    const events: AstrologicalEvent[] = [];

    // 1. Mercury retrograde periods
    const mercuryRetros = CalendarService.getRetrogradePeriod('mercury', yearNum);
    mercuryRetros.forEach((retro) => {
      if (
        retro.startDate.getMonth() === monthNum - 1 ||
        retro.endDate?.getMonth() === monthNum - 1
      ) {
        const interpretation = RETROGRADE_INTERPRETATIONS.mercury;
        events.push({
          id: `mercury_retro_${retro.startDate.getTime()}`,
          eventType: 'retrograde',
          eventName: 'Mercury Retrograde',
          startDate: retro.startDate,
          endDate: retro.endDate,
          intensity: 7,
          affectedPlanets: ['mercury'],
          description: interpretation.description,
          advice: interpretation.generalAdvice,
          isGlobal: true,
          createdAt: new Date(),
        });
      }
    });

    // 2. Moon phases
    const moonPhases = CalendarService.calculateMoonPhases(monthNum, yearNum);
    moonPhases.forEach((phase) => {
      const interpretation = MOON_PHASE_INTERPRETATIONS[phase.phase];
      events.push({
        id: `moon_phase_${phase.date.getTime()}`,
        eventType: 'moon-phase',
        eventName: `${phase.phase
          .split('-')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')} Moon`,
        startDate: phase.date,
        intensity: 5,
        affectedPlanets: ['moon'],
        description: interpretation.advice,
        isGlobal: true,
        createdAt: new Date(),
      });
    });

    // 3. Eclipses
    const eclipses = CalendarService.getEclipses(yearNum);
    eclipses.forEach((eclipse) => {
      if (eclipse.startDate.getMonth() === monthNum - 1) {
        const interpretation = ECLIPSE_INTERPRETATIONS[eclipse.eclipseType];
        events.push({
          id: `eclipse_${eclipse.id}`,
          eventType: 'eclipse',
          eventName: `${eclipse.eclipseType === 'solar' ? 'Solar' : 'Lunar'} Eclipse`,
          startDate: eclipse.startDate,
          endDate: eclipse.endDate,
          intensity: 9,
          affectedPlanets: [],
          description: interpretation.description,
          advice: interpretation.advice,
          isGlobal: true,
          createdAt: new Date(),
        });
      }
    });

    // 4. Seasonal ingresses
    const ingresses = CalendarService.getSeasonalIngresses(yearNum);
    ingresses.forEach((ingress) => {
      if (ingress.date.getMonth() === monthNum - 1) {
        const interpretation = SEASONAL_INGRESS_INTERPRETATIONS[ingress.season];
        events.push({
          id: `ingress_${ingress.date.getTime()}`,
          eventType: 'ingress',
          eventName: `${ingress.season.charAt(0).toUpperCase() + ingress.season.slice(1)} ${ingress.type
            .charAt(0)
            .toUpperCase() + ingress.type.slice(1)}`,
          startDate: ingress.date,
          intensity: 6,
          affectedPlanets: ['sun'],
          description: interpretation.theme,
          advice: interpretation.advice,
          isGlobal: true,
          createdAt: new Date(),
        });
      }
    });

    // 5. Personal transits (if user is authenticated)
    let personalTransits: TransitEvent[] = [];
    if (userId) {
      personalTransits = await calculatePersonalTransits(userId, startDate, endDate);
      events.push(...personalTransits);
    }

    // Sort events by date
    events.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    // Generate daily weather
    const dailyWeather: Record<string, DailyWeather> = {};
    const daysInMonth = endDate.getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(yearNum, monthNum - 1, day);
      const dateStr = currentDate.toISOString().split('T')[0];

      // Get events for this day
      const dayEvents = events.filter(
        (event) =>
          event.startDate.toISOString().split('T')[0] === dateStr ||
          (event.endDate && event.endDate.toISOString().split('T')[0] === dateStr)
      );

      // Calculate moon phase for this day
      const moonPhase = CalendarService.calculateMoonPhase(currentDate);

      // Calculate rating based on events
      let rating = 5; // Base rating
      dayEvents.forEach((event) => {
        rating += event.intensity > 7 ? 1 : event.intensity < 4 ? -1 : 0;
      });
      rating = Math.max(1, Math.min(10, rating));

      // Determine color based on rating
      let color = '#10B981'; // green
      if (rating >= 8) color = '#F59E0B'; // yellow/gold
      if (rating <= 4) color = '#EF4444'; // red

      dailyWeather[dateStr] = {
        date: dateStr,
        summary: `${rating >= 7 ? 'High energy day' : rating <= 4 ? 'Challenging day' : 'Moderate energy day'}. ${
          dayEvents.length > 0
            ? `Focus on: ${dayEvents.map((e) => e.eventName).join(', ')}`
            : 'No major astrological events'
        }`,
        rating,
        color,
        moonPhase: {
          phase: moonPhase.phase,
          illumination: moonPhase.illumination,
          sign: moonPhase.sign,
          degree: moonPhase.degree,
        },
        globalEvents: dayEvents.filter((e) => e.isGlobal),
        personalTransits: dayEvents.filter((e) => !e.isGlobal) as TransitEvent[],
        luckyActivities: rating >= 7 ? ['Starting new projects', 'Important decisions'] : ['Rest and reflection'],
        challengingActivities: rating <= 4 ? ['Important meetings', 'Risk-taking'] : [],
      };
    }

    const response: CalendarMonth = {
      month: monthNum,
      year: yearNum,
      events,
      dailyWeather,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * Get detailed astrological weather for a specific day
 * GET /api/calendar/day/:date
 */
export async function getCalendarDay(req: Request, res: Response, next: NextFunction) {
  try {
    const { date } = req.params;
    const userId = (req as any).user?.id;

    if (!date) {
      throw new AppError('Date is required', 400);
    }

    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
      throw new AppError('Invalid date format', 400);
    }

    // Calculate moon phase
    const moonPhase = CalendarService.calculateMoonPhase(targetDate);

    // Get events for this day (would query database in production)
    // For now, return placeholder data
    const response: DailyWeather = {
      date: targetDate.toISOString().split('T')[0],
      summary: 'Moderate energy day. Focus on balance and steady progress.',
      rating: 5,
      color: '#10B981',
      moonPhase: {
        phase: moonPhase.phase,
        illumination: moonPhase.illumination,
        sign: moonPhase.sign,
        degree: moonPhase.degree,
      },
      globalEvents: [],
      personalTransits: [],
      luckyActivities: ['Planning', 'Organization'],
      challengingActivities: ['Risk-taking'],
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * Set up event reminders
 * POST /api/calendar/reminders
 */
export async function setReminder(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw new AppError('User must be authenticated', 401);
    }

    const { eventType, reminderType, reminderAdvanceHours, isActive } = req.body;

    // Validation
    const validEventTypes = ['all', 'major-transits', 'retrogrades', 'eclipses'];
    if (!validEventTypes.includes(eventType)) {
      throw new AppError('Invalid event type', 400);
    }

    if (reminderType !== 'email' && reminderType !== 'push') {
      throw new AppError('Invalid reminder type', 400);
    }

    if (!Array.isArray(reminderAdvanceHours) || reminderAdvanceHours.length === 0) {
      throw new AppError('reminderAdvanceHours must be a non-empty array', 400);
    }

    // TODO: Save to database
    const reminder = {
      id: `reminder_${Date.now()}`,
      userId,
      eventType,
      reminderType,
      reminderAdvanceHours,
      isActive: isActive !== undefined ? isActive : true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    res.status(201).json({
      message: 'Reminder saved successfully',
      reminder,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Export calendar as iCal file
 * GET /api/calendar/export
 */
export async function exportCalendar(req: Request, res: Response, next: NextFunction) {
  try {
    const { startDate, endDate, includePersonal } = req.query;

    if (!startDate || !endDate) {
      throw new AppError('Start date and end date are required', 400);
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new AppError('Invalid date format', 400);
    }

    // Get events for date range (would query database in production)
    const events: AstrologicalEvent[] = [];

    // Generate iCal format
    const iCalContent = CalendarService.generateICalFormat(events);

    res.setHeader('Content-Type', 'text/calendar');
    res.setHeader('Content-Disposition', `attachment; filename="astrological-calendar.ics"`);
    res.send(iCalContent);
  } catch (error) {
    next(error);
  }
}

export default {
  getCalendarMonth,
  getCalendarDay,
  setReminder,
  exportCalendar,
};
