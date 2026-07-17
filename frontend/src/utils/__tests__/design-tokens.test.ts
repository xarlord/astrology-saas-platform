import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ASPECT_COLORS, COSMIC_COLORS, PLANET_COLORS, UI_TOKENS, ZODIAC_COLORS } from '../../utils/design-tokens';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const globalsCss = readFileSync(resolve(testDirectory, '../../assets/styles/globals.css'), 'utf8');

const cssVariable = (name: string) => new RegExp(`^[ \\t]*--${name}\\s*:`, 'm');

describe('UI_TOKENS', () => {
  it('references exact declarations in the canonical loaded stylesheet', () => {
    for (const category of Object.values(UI_TOKENS)) {
      for (const reference of Object.values(category)) {
        const variableName = reference.slice(6, -1);
        expect(globalsCss).toMatch(cssVariable(variableName));
      }
    }
  });

  it('does not expose page-specific component values', () => {
    expect(Object.keys(UI_TOKENS.color)).not.toContain('cardBackground');
    expect(Object.keys(UI_TOKENS.color)).not.toContain('modalBackground');
  });

  it('preserves every existing chart color contract', () => {
    expect(COSMIC_COLORS).toEqual({
      pageBg: '#0B0D17', cardBg: 'rgba(20, 22, 39, 0.7)', cardBgSolid: '#141627',
      border: '#2f2645', borderSubtle: 'rgba(255, 255, 255, 0.08)', textPrimary: '#ffffff',
      textSecondary: '#cbd5e1', textBody: '#94a3b8', accent: '#6b3de1', accentGlow: 'rgba(107, 61, 225, 0.25)',
    });
    expect(PLANET_COLORS).toEqual({
      Sun: '#FFD700', Moon: '#C0C0C0', Mercury: '#87CEEB', Venus: '#FF69B4', Mars: '#FF4500',
      Jupiter: '#FF8C00', Saturn: '#8B4513', Uranus: '#00CED1', Neptune: '#4169E1', Pluto: '#8B0000',
      NorthNode: '#9370DB', SouthNode: '#9370DB', Chiron: '#BC8F8F',
    });
    expect(ASPECT_COLORS).toEqual({ conjunction: '#FF0000', opposition: '#FF4500', trine: '#00FF00', square: '#FF8C00', sextile: '#4169E1', quincunx: '#9370DB' });
    expect(ZODIAC_COLORS).toEqual({
      Aries: '#FF4136', Taurus: '#2ECC40', Gemini: '#FFDC00', Cancer: '#B10DC9', Leo: '#FF851B', Virgo: '#3D9970',
      Libra: '#0074D9', Scorpio: '#85144b', Sagittarius: '#FF6347', Capricorn: '#5dade2', Aquarius: '#7FDBFF', Pisces: '#39CCCC',
    });
  });
});
