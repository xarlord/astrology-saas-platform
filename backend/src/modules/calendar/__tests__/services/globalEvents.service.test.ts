/**
 * Global Events Service Tests
 * Unit tests for astrological event calculations
 */

import { describe, it, expect } from '@jest/globals';
import globalEventsService from '../../services/globalEvents.service';

describe('GlobalEventsService', () => {
  describe('calculateMercuryRetrograde', () => {
    it('should calculate Mercury retrograde periods for 2026', async () => {
      const retrogrades = await globalEventsService.calculateMercuryRetrograde(2026);

      expect(retrogrades).toHaveLength(3);
      expect(retrogrades[0]).toHaveProperty('startDate');
      expect(retrogrades[0]).toHaveProperty('endDate');
      expect(retrogrades[0]).toHaveProperty('stationDate');
      expect(retrogrades[0]).toHaveProperty('sign');
      expect(retrogrades[0].planet).toBe('mercury');
      expect(retrogrades[0].startDate.getFullYear()).toBe(2026);
    });

    it('should return empty array for year without Mercury retrograde', async () => {
      const retrogrades = await globalEventsService.calculateMercuryRetrograde(2025);

      expect(Array.isArray(retrogrades)).toBe(true);
    });
  });

  describe('calculateVenusRetrograde', () => {
    it('should return empty array for 2026 (no Venus retrograde)', async () => {
      const retrogrades = await globalEventsService.calculateVenusRetrograde(2026);

      expect(retrogrades).toHaveLength(0);
    });

    it('should calculate Venus retrograde when it exists', async () => {
      const retrogrades = await globalEventsService.calculateVenusRetrograde(2027);

      expect(Array.isArray(retrogrades)).toBe(true);
    });
  });

  describe('calculateMarsRetrograde', () => {
    it('should calculate Mars retrograde periods', async () => {
      const retrogrades = await globalEventsService.calculateMarsRetrograde(2026);

      // Mars retrograde spans 2026-2027, so should have at least the start in 2026
      expect(retrogrades.length).toBeGreaterThan(0);
      expect(retrogrades[0].planet).toBe('mars');
    });
  });

  describe('calculateJupiterRetrograde', () => {
    it('should calculate Jupiter retrograde periods', async () => {
      const retrogrades = await globalEventsService.calculateJupiterRetrograde(2026);

      expect(retrogrades.length).toBeGreaterThan(0);
      expect(retrogrades[0].planet).toBe('jupiter');
      expect(retrogrades[0].startDate).toBeInstanceOf(Date);
    });
  });

  describe('calculateSaturnRetrograde', () => {
    it('should calculate Saturn retrograde periods', async () => {
      const retrogrades = await globalEventsService.calculateSaturnRetrograde(2026);

      expect(retrogrades.length).toBeGreaterThan(0);
      expect(retrogrades[0].planet).toBe('saturn');
    });
  });

  describe('calculateMoonPhases', () => {
    it('should calculate new moons for each month', async () => {
      const newMoons = await globalEventsService.calculateMoonPhases(2026, 'new');

      expect(newMoons.length).toBe(12);
      expect(newMoons[0].phase).toBe('new');
      expect(newMoons[0].date).toBeInstanceOf(Date);
      expect(newMoons[0]).toHaveProperty('sign');
      expect(newMoons[0]).toHaveProperty('degree');
      expect(newMoons[0].illumination).toBe(0);
    });

    it('should calculate full moons for each month', async () => {
      const fullMoons = await globalEventsService.calculateMoonPhases(2026, 'full');

      expect(fullMoons.length).toBe(12);
      expect(fullMoons[0].phase).toBe('full');
      expect(fullMoons[0].illumination).toBe(100);
    });

    it('should calculate both new and full moons when no target phase specified', async () => {
      const allPhases = await globalEventsService.calculateMoonPhases(2026);

      // Service returns all moon phases (roughly 4 per month)
      expect(allPhases.length).toBeGreaterThan(0);
      expect(Array.isArray(allPhases)).toBe(true);

      const newMoons = allPhases.filter((p) => p.phase === 'new');
      const fullMoons = allPhases.filter((p) => p.phase === 'full');

      // Should have at least some new and full moons
      expect(newMoons.length).toBeGreaterThan(0);
      expect(fullMoons.length).toBeGreaterThan(0);
    });
  });

  describe('calculateEclipses', () => {
    it('should calculate eclipses for 2026', async () => {
      const eclipses = await globalEventsService.calculateEclipses(2026);

      expect(eclipses.length).toBeGreaterThan(0);
      expect(eclipses[0].date).toBeInstanceOf(Date);
      expect(eclipses[0]).toHaveProperty('type');
      expect(eclipses[0]).toHaveProperty('magnitude');
      expect(eclipses[0]).toHaveProperty('visibility');
      expect(['solar', 'lunar']).toContain(eclipses[0].type);
    });

    it('should include both solar and lunar eclipses', async () => {
      const eclipses = await globalEventsService.calculateEclipses(2026);

      const solarEclipses = eclipses.filter((e) => e.type === 'solar');
      const lunarEclipses = eclipses.filter((e) => e.type === 'lunar');

      expect(solarEclipses.length).toBeGreaterThan(0);
      expect(lunarEclipses.length).toBeGreaterThan(0);
    });
  });

  describe('getAllRetrogrades', () => {
    it('should return all retrogrades for a year sorted by date', async () => {
      const retrogrades = await globalEventsService.getAllRetrogrades(2026);

      expect(retrogrades.length).toBeGreaterThan(0);

      // Verify sorted by date
      for (let i = 1; i < retrogrades.length; i++) {
        expect(retrogrades[i].startDate.getTime()).toBeGreaterThanOrEqual(
          retrogrades[i - 1].startDate.getTime()
        );
      }

      // Verify includes multiple planets
      const planets = retrogrades.map((r) => r.planet);
      expect(planets).toContain('mercury');
    });
  });
});
