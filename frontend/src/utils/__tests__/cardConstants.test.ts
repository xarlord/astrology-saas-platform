/**
 * Card Constants Tests
 */

import { describe, it, expect } from 'vitest';
import {
  ZODIAC_SYMBOLS,
  getZodiacSymbol,
  PLANET_COLORS,
  ELEMENT_COLORS,
  getElementColor,
  type CardChartPosition,
  type CardChartData,
} from '../cardConstants';

describe('cardConstants', () => {
  describe('ZODIAC_SYMBOLS', () => {
    it('should have all 12 zodiac symbols', () => {
      expect(Object.keys(ZODIAC_SYMBOLS)).toHaveLength(12);
      expect(ZODIAC_SYMBOLS.aries).toBe('♈');
      expect(ZODIAC_SYMBOLS.taurus).toBe('♉');
      expect(ZODIAC_SYMBOLS.gemini).toBe('♊');
      expect(ZODIAC_SYMBOLS.cancer).toBe('♋');
      expect(ZODIAC_SYMBOLS.leo).toBe('♌');
      expect(ZODIAC_SYMBOLS.virgo).toBe('♍');
      expect(ZODIAC_SYMBOLS.libra).toBe('♎');
      expect(ZODIAC_SYMBOLS.scorpio).toBe('♏');
      expect(ZODIAC_SYMBOLS.sagittarius).toBe('♐');
      expect(ZODIAC_SYMBOLS.capricorn).toBe('♑');
      expect(ZODIAC_SYMBOLS.aquarius).toBe('♒');
      expect(ZODIAC_SYMBOLS.pisces).toBe('♓');
    });
  });

  describe('getZodiacSymbol', () => {
    it('should return correct symbol for lowercase sign', () => {
      expect(getZodiacSymbol('aries')).toBe('♈');
      expect(getZodiacSymbol('taurus')).toBe('♉');
      expect(getZodiacSymbol('gemini')).toBe('♊');
    });

    it('should handle uppercase sign names', () => {
      expect(getZodiacSymbol('ARIES')).toBe('♈');
      expect(getZodiacSymbol('Taurus')).toBe('♉');
      expect(getZodiacSymbol('GEMINI')).toBe('♊');
    });

    it('should return question mark for unknown sign', () => {
      expect(getZodiacSymbol('unknown')).toBe('?');
      expect(getZodiacSymbol('')).toBe('?');
    });
  });

  describe('PLANET_COLORS', () => {
    it('should have colors for all planets', () => {
      expect(Object.keys(PLANET_COLORS)).toContain('sun');
      expect(Object.keys(PLANET_COLORS)).toContain('moon');
      expect(Object.keys(PLANET_COLORS)).toContain('venus');
      expect(Object.keys(PLANET_COLORS)).toContain('mars');
      expect(Object.keys(PLANET_COLORS)).toContain('jupiter');
      expect(Object.keys(PLANET_COLORS)).toContain('saturn');
    });

    it('should have valid hex color values', () => {
      expect(PLANET_COLORS.sun).toBe('#FFD700');
      expect(PLANET_COLORS.moon).toBe('#C0C0C0');
      expect(PLANET_COLORS.venus).toBe('#FF69B4');
      expect(PLANET_COLORS.mars).toBe('#EF4444');
      expect(PLANET_COLORS.jupiter).toBe('#FFA500');
      expect(PLANET_COLORS.saturn).toBe('#696969');
    });
  });

  describe('ELEMENT_COLORS', () => {
    it('should have colors for all elements', () => {
      expect(Object.keys(ELEMENT_COLORS)).toContain('fire');
      expect(Object.keys(ELEMENT_COLORS)).toContain('earth');
      expect(Object.keys(ELEMENT_COLORS)).toContain('air');
      expect(Object.keys(ELEMENT_COLORS)).toContain('water');
    });

    it('should have valid hex color values', () => {
      expect(ELEMENT_COLORS.fire).toBe('#EF4444');
      expect(ELEMENT_COLORS.earth).toBe('#10B981');
      expect(ELEMENT_COLORS.air).toBe('#3B82F6');
      expect(ELEMENT_COLORS.water).toBe('#6366F1');
    });
  });

  describe('getElementColor', () => {
    it('should return fire color for fire signs', () => {
      expect(getElementColor('aries')).toBe(ELEMENT_COLORS.fire);
      expect(getElementColor('leo')).toBe(ELEMENT_COLORS.fire);
      expect(getElementColor('sagittarius')).toBe(ELEMENT_COLORS.fire);
    });

    it('should return earth color for earth signs', () => {
      expect(getElementColor('taurus')).toBe(ELEMENT_COLORS.earth);
      expect(getElementColor('virgo')).toBe(ELEMENT_COLORS.earth);
      expect(getElementColor('capricorn')).toBe(ELEMENT_COLORS.earth);
    });

    it('should return air color for air signs', () => {
      expect(getElementColor('gemini')).toBe(ELEMENT_COLORS.air);
      expect(getElementColor('libra')).toBe(ELEMENT_COLORS.air);
      expect(getElementColor('aquarius')).toBe(ELEMENT_COLORS.air);
    });

    it('should return water color for water signs', () => {
      expect(getElementColor('cancer')).toBe(ELEMENT_COLORS.water);
      expect(getElementColor('scorpio')).toBe(ELEMENT_COLORS.water);
      expect(getElementColor('pisces')).toBe(ELEMENT_COLORS.water);
    });

    it('should handle uppercase sign names', () => {
      expect(getElementColor('ARIES')).toBe(ELEMENT_COLORS.fire);
      expect(getElementColor('TAURUS')).toBe(ELEMENT_COLORS.earth);
      expect(getElementColor('GEMINI')).toBe(ELEMENT_COLORS.air);
    });

    it('should return white for unknown sign', () => {
      expect(getElementColor('unknown')).toBe('#ffffff');
      expect(getElementColor('')).toBe('#ffffff');
    });
  });

  describe('TypeScript Types', () => {
    it('should accept valid CardChartPosition', () => {
      const position: CardChartPosition = {
        name: 'Sun',
        sign: 'Aries',
        degree: 10.5,
        retrograde: false,
      };
      expect(position.name).toBe('Sun');
      expect(position.sign).toBe('Aries');
      expect(position.degree).toBe(10.5);
      expect(position.retrograde).toBe(false);
    });

    it('should accept CardChartPosition without retrograde', () => {
      const position: CardChartPosition = {
        name: 'Moon',
        sign: 'Taurus',
        degree: 15.0,
      };
      expect(position.name).toBe('Moon');
      expect(position.retrograde).toBeUndefined();
    });

    it('should accept valid CardChartData', () => {
      const chartData: CardChartData = {
        name: 'Test Chart',
        positions: [
          {
            name: 'Sun',
            sign: 'Aries',
            degree: 10.5,
          },
        ],
        birthData: {
          birthDate: '2026-04-06',
          birthPlace: 'New York',
        },
        element: 'fire',
      };
      expect(chartData.name).toBe('Test Chart');
      expect(chartData.positions).toHaveLength(1);
      expect(chartData.birthData?.birthDate).toBe('2026-04-06');
      expect(chartData.element).toBe('fire');
    });

    it('should accept CardChartData without optional fields', () => {
      const chartData: CardChartData = {
        name: 'Minimal Chart',
        positions: [],
      };
      expect(chartData.name).toBe('Minimal Chart');
      expect(chartData.positions).toHaveLength(0);
      expect(chartData.birthData).toBeUndefined();
      expect(chartData.element).toBeUndefined();
    });
  });
});
