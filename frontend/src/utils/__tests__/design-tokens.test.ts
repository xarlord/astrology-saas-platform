import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ASPECT_COLORS, COSMIC_COLORS, PLANET_COLORS, UI_TOKENS, ZODIAC_COLORS } from '../../utils/design-tokens';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const globalsCss = readFileSync(resolve(testDirectory, '../../assets/styles/globals.css'), 'utf8');

describe('UI_TOKENS', () => {
  it('references declarations in the canonical loaded stylesheet', () => {
    for (const category of Object.values(UI_TOKENS)) {
      for (const reference of Object.values(category)) {
        expect(globalsCss).toContain(reference.replace('var(', '').replace(')', ''));
      }
    }
  });

  it('does not expose page-specific component values', () => {
    expect(Object.keys(UI_TOKENS.color)).not.toContain('cardBackground');
    expect(Object.keys(UI_TOKENS.color)).not.toContain('modalBackground');
  });

  it('preserves existing chart color contracts', () => {
    expect(COSMIC_COLORS.pageBg).toBe('#0B0D17');
    expect(PLANET_COLORS.Sun).toBe('#FFD700');
    expect(ASPECT_COLORS.trine).toBe('#00FF00');
    expect(ZODIAC_COLORS.Aries).toBe('#FF4136');
  });
});
