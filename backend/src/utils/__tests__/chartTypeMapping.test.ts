/**
 * Tests for chart type mapping utilities
 */

import { describe, it, expect } from '@jest/globals';
import { mapHouseSystem, mapChartType } from '../chartTypeMapping';

describe('chartTypeMapping utilities', () => {
  describe('mapHouseSystem', () => {
    it('should map whole-sign to whole', () => {
      expect(mapHouseSystem('whole-sign')).toBe('whole');
    });

    it('should pass through placidus unchanged', () => {
      expect(mapHouseSystem('placidus')).toBe('placidus');
    });

    it('should pass through koch unchanged', () => {
      expect(mapHouseSystem('koch')).toBe('koch');
    });

    it('should pass through porphyry unchanged', () => {
      expect(mapHouseSystem('porphyry')).toBe('porphyry');
    });

    it('should pass through equal unchanged', () => {
      expect(mapHouseSystem('equal')).toBe('equal');
    });

    it('should pass through topocentric unchanged', () => {
      expect(mapHouseSystem('topocentric')).toBe('topocentric');
    });

    it('should pass through whole unchanged', () => {
      expect(mapHouseSystem('whole')).toBe('whole');
    });
  });

  describe('mapChartType', () => {
    it('should map solar-return to progressed', () => {
      expect(mapChartType('solar-return')).toBe('progressed');
    });

    it('should map lunar-return to transit', () => {
      expect(mapChartType('lunar-return')).toBe('transit');
    });

    it('should pass through natal unchanged', () => {
      expect(mapChartType('natal')).toBe('natal');
    });

    it('should pass through transit unchanged', () => {
      expect(mapChartType('transit')).toBe('transit');
    });

    it('should pass through progressed unchanged', () => {
      expect(mapChartType('progressed')).toBe('progressed');
    });

    it('should pass through synastry unchanged', () => {
      expect(mapChartType('synastry')).toBe('synastry');
    });

    it('should pass through composite unchanged', () => {
      expect(mapChartType('composite')).toBe('composite');
    });
  });
});
