import { describe, expect, it } from 'vitest';
import { UI_TOKENS } from '../../utils/design-tokens';

describe('UI_TOKENS', () => {
  it('exposes semantic roles for every shared visual layer', () => {
    expect(UI_TOKENS.color.canvas).toBe('var(--color-canvas)');
    expect(UI_TOKENS.color.surfaceElevated).toBe('var(--color-surface-elevated)');
    expect(UI_TOKENS.color.focus).toBe('var(--color-focus)');
    expect(UI_TOKENS.elevation.overlay).toBe('var(--shadow-overlay)');
    expect(UI_TOKENS.radius.pill).toBe('var(--radius-pill)');
    expect(UI_TOKENS.motion.normal).toBe('var(--motion-normal)');
  });

  it('does not expose page-specific component values', () => {
    expect(Object.keys(UI_TOKENS.color)).not.toContain('cardBackground');
    expect(Object.keys(UI_TOKENS.color)).not.toContain('modalBackground');
  });
});
