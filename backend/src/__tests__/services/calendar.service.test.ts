/**
 * Calendar Service Unit Tests
 * Testing calendar calculations, retrograde periods, eclipses, moon phases, and transit intensity
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  calculateJulianDay,
  normalizeDegree,
  getZodiacSign,
  calculateMoonPhase,
  getRetrogradePeriod,
  getEclipses,
  calculateMoonPhases,
  getSeasonalIngresses,
  calculateTransitIntensity,
  generateICalFormat,
} from '../../services/calendar.service';

describe('Calendar Service', () => {
  describe('Julian Day Calculation', () => {
    test('should calculate Julian Day for a given date', () => {
      const date = new Date('2026-02-05T12:00:00Z');
      const jd = calculateJulianDay(date);
      expect(jd).toBeCloseTo(2461077.0, 0); // Calculated JD for this date
    });

    test('should handle different timezones correctly', () => {
      const utcDate = new Date('2026-02-05T12:00:00Z');
      const estDate = new Date('2026-02-05T07:00:00Z'); // 5 hours behind

      const jdUTC = calculateJulianDay(utcDate);
      const jdEST = calculateJulianDay(estDate);

      // Should be same Julian Day (slight difference due to timezone offset in days)
      expect(Math.abs(jdUTC - jdEST)).toBeLessThan(0.25);
    });

    test('should calculate JD for historical dates', () => {
      const date = new Date('2000-01-01T12:00:00Z');
      const jd = calculateJulianDay(date);
      expect(jd).toBeCloseTo(2451545.0, 0); // J2000.0 epoch
    });
  });

  describe('Degree Normalization', () => {
    test('should normalize degrees to 0-360 range', () => {
      expect(normalizeDegree(0)).toBe(0);
      expect(normalizeDegree(180)).toBe(180);
      expect(normalizeDegree(360)).toBe(0);
      expect(normalizeDegree(400)).toBe(40);
      expect(normalizeDegree(-10)).toBe(350);
      expect(normalizeDegree(-360)).toBe(0);
    });

    test('should handle decimal degrees', () => {
      expect(normalizeDegree(370.5)).toBe(10.5);
      expect(normalizeDegree(-15.25)).toBe(344.75);
    });
  });

  describe('Zodiac Sign Calculation', () => {
    test('should calculate zodiac sign from degree', () => {
      expect(getZodiacSign(0)).toBe('aries');
      expect(getZodiacSign(30)).toBe('taurus');
      expect(getZodiacSign(60)).toBe('gemini');
      expect(getZodiacSign(90)).toBe('cancer');
      expect(getZodiacSign(120)).toBe('leo');
      expect(getZodiacSign(150)).toBe('virgo');
      expect(getZodiacSign(180)).toBe('libra');
      expect(getZodiacSign(210)).toBe('scorpio');
      expect(getZodiacSign(240)).toBe('sagittarius');
      expect(getZodiacSign(270)).toBe('capricorn');
      expect(getZodiacSign(300)).toBe('aquarius');
      expect(getZodiacSign(330)).toBe('pisces');
    });

    test('should handle boundary cases', () => {
      expect(getZodiacSign(29.99)).toBe('aries');
      expect(getZodiacSign(30.0)).toBe('taurus');
      expect(getZodiacSign(359.99)).toBe('pisces');
    });
  });

  describe('Moon Phase Calculation', () => {
    test('should calculate new moon phase', () => {
      // Known new moon date
      const newMoon = new Date('2026-02-17T12:00:00Z');
      const phase = calculateMoonPhase(newMoon);
      expect(phase.phase).toBe('new');
      expect(phase.illumination).toBeLessThan(5); // Allow some tolerance
    });

    test('should calculate full moon phase', () => {
      // Known full moon date
      const fullMoon = new Date('2026-03-03T12:00:00Z');
      const phase = calculateMoonPhase(fullMoon);
      expect(phase.phase).toBe('full');
      expect(phase.illumination).toBeGreaterThan(95); // Allow some tolerance
    });

    test('should handle waxing phases', () => {
      const waxingDate = new Date('2026-02-24T12:00:00Z');
      const phase = calculateMoonPhase(waxingDate);
      expect(['waxing-crescent', 'first-quarter', 'waxing-gibbous']).toContain(phase.phase);
      expect(phase.illumination).toBeGreaterThan(0);
      expect(phase.illumination).toBeLessThan(100);
    });

    test('should handle waning phases', () => {
      const waningDate = new Date('2026-03-10T12:00:00Z');
      const phase = calculateMoonPhase(waningDate);
      expect(['waning-gibbous', 'last-quarter', 'waning-crescent']).toContain(phase.phase);
      expect(phase.illumination).toBeGreaterThan(0);
      expect(phase.illumination).toBeLessThan(100);
    });
  });

  describe('Retrograde Period Calculation', () => {
    test('should calculate Mercury retrograde periods', () => {
      const year = 2026;
      const mercuryRetros = getRetrogradePeriod('mercury', year);

      expect(mercuryRetros.length).toBeGreaterThan(0);
      expect(mercuryRetros.length).toBeLessThanOrEqual(4); // Mercury goes retrograde 3-4 times per year

      mercuryRetros.forEach((retro) => {
        expect(retro.planet).toBe('mercury');
        expect(retro.startDate).toBeInstanceOf(Date);
        expect(retro.endDate).toBeInstanceOf(Date);
        expect(retro.endDate.getTime()).toBeGreaterThan(retro.startDate.getTime());
      });
    });

    test('should calculate Venus retrograde periods', () => {
      const year = 2026;
      const venusRetros = getRetrogradePeriod('venus', year);

      // Venus goes retrograde every 18 months (may not occur every year)
      if (venusRetros.length > 0) {
        venusRetros.forEach((retro) => {
          expect(retro.planet).toBe('venus');
          expect(retro.startDate).toBeInstanceOf(Date);
          expect(retro.endDate).toBeInstanceOf(Date);
        });
      }
    });

    test('should calculate Mars retrograde periods', () => {
      const year = 2026;
      const marsRetros = getRetrogradePeriod('mars', year);

      // Mars goes retrograde every 26 months (may not occur every year)
      if (marsRetros.length > 0) {
        marsRetros.forEach((retro) => {
          expect(retro.planet).toBe('mars');
          expect(retro.startDate).toBeInstanceOf(Date);
          expect(retro.endDate).toBeInstanceOf(Date);
        });
      }
    });

    test('should calculate outer planet retrogrades', () => {
      const year = 2026;

      // Jupiter, Saturn go retrograde every year for ~4-5 months
      const jupiterRetros = getRetrogradePeriod('jupiter', year);
      expect(jupiterRetros.length).toBeGreaterThanOrEqual(1);

      const saturnRetros = getRetrogradePeriod('saturn', year);
      expect(saturnRetros.length).toBeGreaterThanOrEqual(1);
    });

    test('should include shadow periods for Mercury', () => {
      const year = 2026;
      const mercuryRetros = getRetrogradePeriod('mercury', year);

      mercuryRetros.forEach((retro) => {
        if (retro.shadowStartDate && retro.shadowEndDate) {
          expect(retro.shadowStartDate.getTime()).toBeLessThan(retro.startDate.getTime());
          expect(retro.shadowEndDate.getTime()).toBeGreaterThan(retro.endDate.getTime());
        }
      });
    });
  });

  describe('Eclipse Calculation', () => {
    test('should get eclipses for a year', () => {
      const year = 2026;
      const eclipses = getEclipses(year);

      // There are typically 4-7 eclipses per year
      expect(eclipses.length).toBeGreaterThanOrEqual(4);
      expect(eclipses.length).toBeLessThanOrEqual(7);

      eclipses.forEach((eclipse) => {
        expect(eclipse.eclipseType).toMatch(/^(solar|lunar)$/);
        expect(eclipse.startDate).toBeInstanceOf(Date);
        expect(eclipse.endDate).toBeInstanceOf(Date);
        expect(eclipse.magnitude).toBeGreaterThanOrEqual(0);
        expect(eclipse.magnitude).toBeLessThanOrEqual(1);
        expect(eclipse.zodiacSign).toBeTruthy();
        expect(eclipse.degree).toBeGreaterThanOrEqual(0);
        expect(eclipse.degree).toBeLessThan(360);
      });
    });

    test('should include both solar and lunar eclipses', () => {
      const year = 2026;
      const eclipses = getEclipses(year);

      const solarEclipses = eclipses.filter((e) => e.eclipseType === 'solar');
      const lunarEclipses = eclipses.filter((e) => e.eclipseType === 'lunar');

      expect(solarEclipses.length).toBeGreaterThan(0);
      expect(lunarEclipses.length).toBeGreaterThan(0);
    });
  });

  describe('Moon Phase Generation', () => {
    test('should generate moon phases for a month', () => {
      const month = 2; // February
      const year = 2026;
      const phases = calculateMoonPhases(month, year);

      // Should have 4-6 moon phases per month (one per week)
      expect(phases.length).toBeGreaterThanOrEqual(4);
      expect(phases.length).toBeLessThanOrEqual(6);

      phases.forEach((phase) => {
        expect(phase.date).toBeInstanceOf(Date);
        expect(phase.phase).toMatch(
          /^(new|waxing-crescent|first-quarter|waxing-gibbous|full|waning-gibbous|last-quarter|waning-crescent)$/
        );
        expect(phase.sign).toBeTruthy();
        expect(phase.degree).toBeGreaterThanOrEqual(0);
        expect(phase.degree).toBeLessThan(360);
        expect(phase.illumination).toBeGreaterThanOrEqual(0);
        expect(phase.illumination).toBeLessThanOrEqual(100);
      });
    });

    test('should include new moon and full moon', () => {
      const month = 2;
      const year = 2026;
      const phases = calculateMoonPhases(month, year);

      const hasNewMoon = phases.some((p) => p.phase === 'new');
      const hasFullMoon = phases.some((p) => p.phase === 'full');

      expect(hasNewMoon).toBe(true);
      expect(hasFullMoon).toBe(true);
    });

    test('should calculate phases in chronological order', () => {
      const month = 2;
      const year = 2026;
      const phases = calculateMoonPhases(month, year);

      for (let i = 1; i < phases.length; i++) {
        expect(phases[i].date.getTime()).toBeGreaterThan(phases[i - 1].date.getTime());
      }
    });
  });

  describe('Seasonal Ingress Calculation', () => {
    test('should calculate seasonal ingresses for a year', () => {
      const year = 2026;
      const ingresses = getSeasonalIngresses(year);

      // Should have exactly 4 ingresses (solstices and equinoxes)
      expect(ingresses.length).toBe(4);

      ingresses.forEach((ingress) => {
        expect(ingress.date).toBeInstanceOf(Date);
        expect(ingress.season).toMatch(/^(spring|summer|autumn|winter)$/);
        expect(ingress.type).toMatch(/^(equinox|solstice)$/);
        expect(ingress.sign).toBeTruthy();
      });
    });

    test('should include both equinoxes and solstices', () => {
      const year = 2026;
      const ingresses = getSeasonalIngresses(year);

      const equinoxes = ingresses.filter((i) => i.type === 'equinox');
      const solstices = ingresses.filter((i) => i.type === 'solstice');

      expect(equinoxes.length).toBe(2);
      expect(solstices.length).toBe(2);
    });
  });

  describe('Transit Intensity Calculation', () => {
    test('should calculate intensity for conjunction (major aspect)', () => {
      const transit = {
        transitingPlanet: 'pluto',
        natalPlanet: 'sun',
        aspectType: 'conjunction' as const,
        orb: 0.5,
        applying: true,
      };

      const intensity = calculateTransitIntensity(transit);

      expect(intensity).toBeGreaterThanOrEqual(1);
      expect(intensity).toBeLessThanOrEqual(10);
      expect(intensity).toBeGreaterThan(7); // Should be high intensity
    });

    test('should calculate intensity for opposition (major aspect)', () => {
      const transit = {
        transitingPlanet: 'saturn',
        natalPlanet: 'moon',
        aspectType: 'opposition' as const,
        orb: 1.0,
        applying: true,
      };

      const intensity = calculateTransitIntensity(transit);

      expect(intensity).toBeGreaterThanOrEqual(1);
      expect(intensity).toBeLessThanOrEqual(10);
      expect(intensity).toBeGreaterThan(6); // Should be high intensity
    });

    test('should calculate intensity for trine (harmonious aspect)', () => {
      const transit = {
        transitingPlanet: 'jupiter',
        natalPlanet: 'venus',
        aspectType: 'trine' as const,
        orb: 2.0,
        applying: true,
      };

      const intensity = calculateTransitIntensity(transit);

      expect(intensity).toBeGreaterThanOrEqual(1);
      expect(intensity).toBeLessThanOrEqual(10);
      expect(intensity).toBeLessThan(8); // Should be moderate intensity
    });

    test('should calculate intensity for square (challenging aspect)', () => {
      const transit = {
        transitingPlanet: 'mars',
        natalPlanet: 'mercury',
        aspectType: 'square' as const,
        orb: 1.5,
        applying: true,
      };

      const intensity = calculateTransitIntensity(transit);

      expect(intensity).toBeGreaterThanOrEqual(1);
      expect(intensity).toBeLessThanOrEqual(10);
      expect(intensity).toBeGreaterThan(5); // Should be moderate-high intensity
    });

    test('should calculate intensity for sextile (opportunity aspect)', () => {
      const transit = {
        transitingPlanet: 'mercury',
        natalPlanet: 'venus',
        aspectType: 'sextile' as const,
        orb: 2.5,
        applying: false,
      };

      const intensity = calculateTransitIntensity(transit);

      expect(intensity).toBeGreaterThanOrEqual(1);
      expect(intensity).toBeLessThanOrEqual(10);
      expect(intensity).toBeLessThan(7); // Should be low-moderate intensity
    });

    test('should give higher intensity for tighter orbs', () => {
      const tightOrb = {
        transitingPlanet: 'jupiter' as const,
        natalPlanet: 'sun' as const,
        aspectType: 'trine' as const,
        orb: 0.2,
        applying: true,
      };

      const wideOrb = {
        transitingPlanet: 'jupiter' as const,
        natalPlanet: 'sun' as const,
        aspectType: 'trine' as const,
        orb: 6.0,
        applying: true,
      };

      const tightIntensity = calculateTransitIntensity(tightOrb);
      const wideIntensity = calculateTransitIntensity(wideOrb);

      expect(tightIntensity).toBeGreaterThan(wideIntensity);
    });

    test('should give higher intensity for applying aspects', () => {
      const applying = {
        transitingPlanet: 'saturn' as const,
        natalPlanet: 'mars' as const,
        aspectType: 'square' as const,
        orb: 2.0,
        applying: true,
      };

      const separating = {
        transitingPlanet: 'saturn' as const,
        natalPlanet: 'mars' as const,
        aspectType: 'square' as const,
        orb: 2.0,
        applying: false,
      };

      const applyingIntensity = calculateTransitIntensity(applying);
      const separatingIntensity = calculateTransitIntensity(separating);

      // Applying should be >= separating (may be equal due to rounding)
      expect(applyingIntensity).toBeGreaterThanOrEqual(separatingIntensity);
    });

    test('should clamp intensity to 1-10 range', () => {
      const extremeTransit = {
        transitingPlanet: 'pluto',
        natalPlanet: 'sun',
        aspectType: 'conjunction' as const,
        orb: 0.01, // Extremely tight
        applying: true,
      };

      const intensity = calculateTransitIntensity(extremeTransit);
      expect(intensity).toBeLessThanOrEqual(10);
      expect(intensity).toBeGreaterThanOrEqual(1);
    });
  });

  describe('iCal Generation', () => {
    test('should generate valid iCal format', () => {
      const events = [
        {
          id: 'evt_1',
          eventType: 'retrograde' as const,
          eventName: 'Mercury Retrograde',
          startDate: new Date('2026-02-15T00:00:00Z'),
          endDate: new Date('2026-02-25T00:00:00Z'),
          intensity: 7,
          description: 'Communication challenges',
          advice: ['Back up data', 'Avoid contracts'],
          isGlobal: true,
          createdAt: new Date(),
        },
      ];

      const iCal = generateICalFormat(events);

      expect(iCal).toContain('BEGIN:VCALENDAR');
      expect(iCal).toContain('VERSION:2.0');
      expect(iCal).toContain('BEGIN:VEVENT');
      expect(iCal).toContain('SUMMARY:Mercury Retrograde');
      expect(iCal).toContain('DESCRIPTION:Communication challenges');
      expect(iCal).toContain('END:VEVENT');
      expect(iCal).toContain('END:VCALENDAR');
    });

    test('should handle multiple events', () => {
      const events = [
        {
          id: 'evt_1',
          eventType: 'retrograde' as const,
          eventName: 'Mercury Retrograde',
          startDate: new Date('2026-02-15T00:00:00Z'),
          endDate: new Date('2026-02-25T00:00:00Z'),
          intensity: 7,
          description: 'Communication challenges',
          isGlobal: true,
          createdAt: new Date(),
        },
        {
          id: 'evt_2',
          eventType: 'moon-phase' as const,
          eventName: 'Full Moon',
          startDate: new Date('2026-02-28T00:00:00Z'),
          intensity: 5,
          description: 'Full moon in Leo',
          isGlobal: true,
          createdAt: new Date(),
        },
      ];

      const iCal = generateICalFormat(events);

      expect(iCal).toContain('BEGIN:VEVENT');
      expect(iCal).toContain('SUMMARY:Mercury Retrograde');
      expect(iCal).toContain('SUMMARY:Full Moon');
      // Should have 2 VEVENT blocks
      const eventCount = (iCal.match(/BEGIN:VEVENT/g) || []).length;
      expect(eventCount).toBe(2);
    });

    test('should format dates correctly in iCal', () => {
      const events = [
        {
          id: 'evt_1',
          eventType: 'eclipse' as const,
          eventName: 'Solar Eclipse',
          startDate: new Date('2026-02-15T10:30:00Z'),
          endDate: new Date('2026-02-15T12:30:00Z'),
          intensity: 9,
          description: 'Total solar eclipse',
          isGlobal: true,
          createdAt: new Date(),
        },
      ];

      const iCal = generateICalFormat(events);

      // iCal format: YYYYMMDDTHHmmssZ
      expect(iCal).toContain('DTSTART:20260215T103000Z');
      expect(iCal).toContain('DTEND:20260215T123000Z');
    });

    test('should escape special characters in descriptions', () => {
      const events = [
        {
          id: 'evt_1',
          eventType: 'retrograde' as const,
          eventName: 'Mercury Retrograde',
          startDate: new Date('2026-02-15T00:00:00Z'),
          intensity: 7,
          description: 'Don\'t sign contracts. "Wait" for better timing.',
          advice: ['Be careful'],
          isGlobal: true,
          createdAt: new Date(),
        },
      ];

      const iCal = generateICalFormat(events);

      // iCal escaping: backslashes for special chars
      expect(iCal).toContain('\\n'); // Newline escape
    });
  });
});
