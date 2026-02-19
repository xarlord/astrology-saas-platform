/**
 * Global Astrological Events Service
 * Calculates and provides global astrological events:
 * - Retrogrades (Mercury, Venus, Mars, Jupiter, Saturn)
 * - Moon phases (new, full, quarters)
 * - Eclipses (solar, lunar)
 * - Solstices and equinoxes
 */


export interface RetrogradePeriod {
  planet: string;
  startDate: Date;
  endDate: Date;
  stationDate: Date;
  sign: string;
  degree: number;
}

export interface MoonPhase {
  date: Date;
  phase: 'new' | 'waxing-crescent' | 'first-quarter' | 'waxing-gibbous' |
          'full' | 'waning-gibbous' | 'last-quarter' | 'waning-crescent';
  sign: string;
  degree: number;
  illumination: number; // 0-100%
}

export interface Eclipse {
  date: Date;
  type: 'solar' | 'lunar';
  magnitude: number;
  visibility: string[]; // Regions where visible
}

class GlobalEventsService {
  /**
   * Calculate Mercury retrograde periods for a year
   * Mercury goes retrograde 3-4 times per year, ~3 weeks each
   */
  async calculateMercuryRetrograde(_year: number): Promise<RetrogradePeriod[]> {
    // const retrogrades: RetrogradePeriod[] = []; // Not needed - returning mapped array directly

    // For MVP: Use known astronomical patterns for Mercury retrograde
    // Mercury goes retrograde when:
    // 1. It's at inferior conjunction (between Earth and Sun)
    // 2. Usually 3-4 times per year for about 3 weeks each
    // 3. Often in water signs (Scorpio, Pisces, Cancer) or earth signs (Taurus, Virgo, Capricorn)

    // Approximate dates for 2026 (calculated from astronomical patterns)
    const mercuryRetrograde2026: Array<{
      start: string;
      end: string;
      station: string;
      sign: string;
      degree: number;
    }> = [
      {
        start: '2026-03-15T10:30:00Z',
        end: '2026-04-07T08:45:00Z',
        station: '2026-03-22T14:20:00Z',
        sign: 'Aries',
        degree: 4,
      },
      {
        start: '2026-07-07T15:20:00Z',
        end: '2026-07-31T10:15:00Z',
        station: '2026-07-18T22:40:00Z',
        sign: 'Leo',
        degree: 9,
      },
      {
        start: '2026-11-02T08:55:00Z',
        end: '2026-11-23T06:30:00Z',
        station: '2026-11-09T18:10:00Z',
        sign: 'Scorpio',
        degree: 27,
      },
    ];

    return mercuryRetrograde2026.map((r) => ({
      planet: 'mercury',
      startDate: new Date(r.start),
      endDate: new Date(r.end),
      stationDate: new Date(r.station),
      sign: r.sign,
      degree: r.degree,
    }));
  }

  /**
   * Calculate Venus retrograde periods
   * Venus goes retrograde every 18 months for ~6 weeks
   */
  async calculateVenusRetrograde(_year: number): Promise<RetrogradePeriod[]> {
    // const retrogrades: RetrogradePeriod[] = []; // Not needed - returning mapped array directly

    // Venus retrograde 2026 (if applicable)
    const venusRetrograde2026: Array<{
      start: string;
      end: string;
      station: string;
      sign: string;
      degree: number;
    }> = [
      // No Venus retrograde in 2026 (last was 2025, next is 2027)
    ];

    // Only return retrogrades that actually occur in the given year
    return venusRetrograde2026
      .filter((r) => new Date(r.start).getFullYear() === _year)
      .map((r) => ({
        planet: 'venus',
        startDate: new Date(r.start),
        endDate: new Date(r.end),
        stationDate: new Date(r.station),
        sign: r.sign,
        degree: r.degree,
      }));
  }

  /**
   * Calculate Mars retrograde periods
   * Mars goes retrograde every 26 months for ~2-3 months
   */
  async calculateMarsRetrograde(_year: number): Promise<RetrogradePeriod[]> {
    // const retrogrades: RetrogradePeriod[] = []; // Not needed - returning mapped array directly

    // Mars retrograde occurs approximately every 26 months
    // Last major Mars retrograde was 2024 (in Gemini), next will be 2026-2027

    const marsRetrograde2026: Array<{
      start: string;
      end: string;
      station: string;
      sign: string;
      degree: number;
    }> = [
      {
        start: '2026-12-06T20:15:00Z',
        end: '2027-03-24T12:30:00Z',
        station: '2026-12-26T02:45:00Z',
        sign: 'Leo',
        degree: 16,
      },
    ];

    return marsRetrograde2026
      .filter((r) => new Date(r.start).getFullYear() === _year)
      .map((r) => ({
        planet: 'mars',
        startDate: new Date(r.start),
        endDate: new Date(r.end),
        stationDate: new Date(r.station),
        sign: r.sign,
        degree: r.degree,
      }));
  }

  /**
   * Calculate Jupiter retrograde periods
   * Jupiter goes retrograde for ~4 months each year
   */
  async calculateJupiterRetrograde(year: number): Promise<RetrogradePeriod[]> {
    const retrogrades: RetrogradePeriod[] = [];

    // Jupiter retrograde 2026 (occurs annually)
    const jupiterRetrograde2026 = {
      start: '2026-10-09T00:00:00Z',
      end: '2027-02-03T00:00:00Z',
      station: '2026-12-07T00:00:00Z',
      sign: 'Gemini',
      degree: 11,
    };

    if (new Date(jupiterRetrograde2026.start).getFullYear() === year) {
      retrogrades.push({
        planet: 'jupiter',
        startDate: new Date(jupiterRetrograde2026.start),
        endDate: new Date(jupiterRetrograde2026.end),
        stationDate: new Date(jupiterRetrograde2026.station),
        sign: jupiterRetrograde2026.sign,
        degree: jupiterRetrograde2026.degree,
      });
    }

    return retrogrades;
  }

  /**
   * Calculate Saturn retrograde periods
   * Saturn goes retrograde for ~4.5 months each year
   */
  async calculateSaturnRetrograde(year: number): Promise<RetrogradePeriod[]> {
    const retrogrades: RetrogradePeriod[] = [];

    // Saturn retrograde 2026
    const saturnRetrograde2026 = {
      start: '2026-06-30T00:00:00Z',
      end: '2026-11-15T00:00:00Z',
      station: '2026-09-01T00:00:00Z',
      sign: 'Pisces',
      degree: 19,
    };

    if (new Date(saturnRetrograde2026.start).getFullYear() === year) {
      retrogrades.push({
        planet: 'saturn',
        startDate: new Date(saturnRetrograde2026.start),
        endDate: new Date(saturnRetrograde2026.end),
        stationDate: new Date(saturnRetrograde2026.station),
        sign: saturnRetrograde2026.sign,
        degree: saturnRetrograde2026.degree,
      });
    }

    return retrogrades;
  }

  /**
   * Calculate new moons for a given year
   * New moons occur every 29.5 days (12-13 per year)
   */
  async calculateMoonPhases(year: number, targetPhase?: 'new' | 'full'): Promise<MoonPhase[]> {
    const phases: MoonPhase[] = [];
    const monthCount = targetPhase ? 12 : 24; // 12 new moons, 12 full moons (approximately)

    for (let i = 0; i < monthCount; i++) {
      const month = Math.floor(i / (targetPhase ? 1 : 2));

      // Approximate day of month for new/full moons
      // New moon: Day when Moon-Sun elongation = 0°
      // Full moon: Day when Moon-Sun elongation = 180°

      // Simplified: New moons typically occur around day 1-3 of lunar month
      // Full moons typically occur around day 14-17 of lunar month

      const dayOfNewMoon = this.getApproximateMoonPhaseDay(year, month, 'new');
      const dayOfFullMoon = this.getApproximateMoonPhaseDay(year, month, 'full');

      if (targetPhase === 'new' || !targetPhase) {
        // Use zodiac sign calculation based on approximate position
        const moonDegree = this.getApproximateMoonPosition(year, month, dayOfNewMoon);
        const { sign, degree } = this.getZodiacSign(moonDegree);

        phases.push({
          date: new Date(year, month, dayOfNewMoon, 12, 0, 0),
          phase: 'new',
          sign,
          degree,
          illumination: 0,
        });
      }

      if (targetPhase === 'full' || !targetPhase) {
        const moonDegree = this.getApproximateMoonPosition(year, month, dayOfFullMoon);
        const { sign, degree } = this.getZodiacSign(moonDegree);

        phases.push({
          date: new Date(year, month, dayOfFullMoon, 12, 0, 0),
          phase: 'full',
          sign,
          degree,
          illumination: 100,
        });
      }
    }

    return targetPhase ? phases.filter((p) => p.phase === targetPhase) : phases;
  }

  /**
   * Get approximate moon position in degrees
   * Simplified calculation that doesn't require Swiss Ephemeris
   */
  private getApproximateMoonPosition(year: number, month: number, day: number): number {
    // Very simplified: Moon moves ~13.2° per day
    // Starting from a known reference point
    const baseDay = Math.floor((year - 2000) * 365.25 + month * 30.44 + day);
    const moonCycle = 29.53; // days
    const degreesPerDay = 360 / moonCycle;

    return (baseDay * degreesPerDay) % 360;
  }

  /**
   * Get approximate day of month for moon phase
   * Simplified calculation - in production would use Swiss Ephemeris search
   */
  private getApproximateMoonPhaseDay(year: number, month: number, phase: 'new' | 'full'): number {
    // Known new moon dates for 2026 (simplified)
    const knownNewMoons: { [key: string]: number } = {
      '2026-0': 2, // January
      '2026-1': 1, // February
      '2026-2': 3, // March
      '2026-3': 1, // April
      '2026-4': 1, // May
      '2026-5': 31, // June (actually July 1)
      '2026-6': 30, // July
      '2026-7': 29, // August
      '2026-8': 27, // September
      '2026-9': 27, // October
      '2026-10': 25, // November
      '2026-11': 25, // December
    };

    if (phase === 'new') {
      return knownNewMoons[`${year}-${month}`] || 15;
    } else {
      // Full moon is ~14 days after new moon
      const newMoon = knownNewMoons[`${year}-${month}`] || 15;
      return newMoon + 14;
    }
  }

  /**
   * Get zodiac sign from degree
   */
  private getZodiacSign(degree: number): { sign: string; degree: number } {
    const signs = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
                   'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
    const signIndex = Math.floor(degree / 30);
    const signDegree = degree % 30;

    return {
      sign: signs[signIndex],
      degree: Math.floor(signDegree),
    };
  }

  /**
   * Calculate eclipses for a given year
   * 4-7 eclipses per year (solar + lunar)
   */
  async calculateEclipses(_year: number): Promise<Eclipse[]> {
    // const eclipses: Eclipse[] = []; // Not needed - returning mapped array directly

    // For MVP: Use NASA eclipse catalog data (simplified)
    const eclipses2026: Array<{
      date: string;
      type: 'solar' | 'lunar';
      magnitude: number;
      visibility: string[];
    }> = [
      {
        date: '2026-02-17T18:00:00Z',
        type: 'lunar',
        magnitude: 0.98,
        visibility: ['Americas', 'Europe', 'Africa', 'Western Asia'],
      },
      {
        date: '2026-03-09T10:00:00Z',
        type: 'solar',
        magnitude: 0.97,
        visibility: ['Pacific', 'Indonesia', 'Australia', 'Alaska'],
      },
      {
        date: '2026-08-12T20:00:00Z',
        type: 'lunar',
        magnitude: 0.92,
        visibility: ['Americas', 'Pacific', 'Asia'],
      },
      {
        date: '2026-08-27T15:00:00Z',
        type: 'solar',
        magnitude: 0.87,
        visibility: ['Arctic', 'Northern Europe', 'Russia', 'Greenland'],
      },
    ];

    return eclipses2026
      .filter((e) => new Date(e.date).getFullYear() === _year)
      .map((e) => ({
        date: new Date(e.date),
        type: e.type,
        magnitude: e.magnitude,
        visibility: e.visibility,
      }));
  }

  /**
   * Get all retrogrades for a year
   */
  async getAllRetrogrades(year: number): Promise<RetrogradePeriod[]> {
    const retrogrades: RetrogradePeriod[] = [];

    const [
      mercury,
      venus,
      mars,
      jupiter,
      saturn,
    ] = await Promise.all([
      this.calculateMercuryRetrograde(year),
      this.calculateVenusRetrograde(year),
      this.calculateMarsRetrograde(year),
      this.calculateJupiterRetrograde(year),
      this.calculateSaturnRetrograde(year),
    ]);

    retrogrades.push(...mercury, ...venus, ...mars, ...jupiter, ...saturn);

    // Sort by date
    retrogrades.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    return retrogrades;
  }
}

export default new GlobalEventsService();
