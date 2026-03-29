import { describe, it, expect } from 'vitest';
import { getToolbarClearButtonsSx } from '../../src/core/coreStyles';

describe('getToolbarClearButtonsSx', () => {
  it('adds hover and active from color and borderColor with alpha backgrounds', () => {
    const sx = getToolbarClearButtonsSx({ color: '#cc0000', borderColor: '#cc0000' });
    const hover = {
      borderColor: '#cc0000',
      color: '#cc0000',
    };
    expect(sx['&:hover']).toMatchObject(hover);
    expect(sx['&.MuiButton-outlinedPrimary:hover']).toEqual(sx['&:hover']);
    expect(typeof sx['&:hover'].backgroundColor).toBe('string');
    expect(sx['&:hover'].backgroundColor.length).toBeGreaterThan(0);
    expect(sx['&:active']).toMatchObject(hover);
    expect(sx['&.MuiButton-outlinedPrimary:active']).toEqual(sx['&:active']);
    expect(typeof sx['&:active'].backgroundColor).toBe('string');
  });

  it('uses color-mix hover fill when color is a CSS variable (alpha unavailable)', () => {
    const sx = getToolbarClearButtonsSx({ color: 'var(--brand)', borderColor: 'var(--brand)' });
    expect(sx['&:hover'].backgroundColor).toContain('color-mix');
    expect(sx['&:hover'].borderColor).toBe('var(--brand)');
  });

  it('does not add auto hover when &:hover is already set', () => {
    const custom = { color: '#00c', '&:hover': { backgroundColor: 'transparent' } };
    const sx = getToolbarClearButtonsSx(custom);
    expect(sx['&:hover']).toEqual({ backgroundColor: 'transparent' });
  });

  it('leaves array toolbarClearButtonsSx behavior as spread-only (no auto accent keys)', () => {
    const arr = [{ mt: 1 }];
    const sx = getToolbarClearButtonsSx(arr);
    expect(sx['&:hover']).toBeUndefined();
    expect(sx[0]).toEqual({ mt: 1 });
  });

  it('skips auto accent when color is a theme callback function', () => {
    const sx = getToolbarClearButtonsSx({ color: () => 'red' });
    expect(sx['&:hover']).toBeUndefined();
  });
});
