import { describe, it, expect } from 'vitest';
import { getScrollInnerBoxSx, getHeaderScrollWrapperSx } from '../../src/core/coreStyles';
import { DIRECTION_LTR, DIRECTION_RTL } from '../../src/config/schema';

describe('coreStyles horizontal scroll helpers', () => {
  describe('getScrollInnerBoxSx', () => {
    it('uses overflowX hidden when showHorizontalScrollbar is false', () => {
      expect(getScrollInnerBoxSx(true, { showHorizontalScrollbar: false }).overflowX).toBe('hidden');
      expect(getScrollInnerBoxSx(true).overflowX).toBe('hidden');
    });

    it('uses overflowX auto when enableHorizontalScroll and showHorizontalScrollbar are true', () => {
      expect(getScrollInnerBoxSx(true, { showHorizontalScrollbar: true }).overflowX).toBe('auto');
    });

    it('uses overflowX hidden when horizontal scroll is disabled even if showHorizontalScrollbar is true', () => {
      expect(getScrollInnerBoxSx(false, { showHorizontalScrollbar: true }).overflowX).toBe('hidden');
    });
  });

  describe('getHeaderScrollWrapperSx', () => {
    it('hides native scrollbar when showScrollbar is false', () => {
      const sx = getHeaderScrollWrapperSx(DIRECTION_LTR, 0, false);
      expect(sx.scrollbarWidth).toBe('none');
      expect(sx['&::-webkit-scrollbar']).toEqual({ display: 'none' });
    });

    it('does not hide scrollbar styles when showScrollbar is true', () => {
      const sx = getHeaderScrollWrapperSx(DIRECTION_LTR, 0, true);
      expect(sx.scrollbarWidth).toBeUndefined();
      expect(sx['&::-webkit-scrollbar']).toBeUndefined();
    });

    it('pads inline end for vertical scrollbar width in LTR', () => {
      const sx = getHeaderScrollWrapperSx(DIRECTION_LTR, 12, false);
      expect(sx.paddingRight).toBe(12);
    });

    it('pads inline start for vertical scrollbar width in RTL', () => {
      const sx = getHeaderScrollWrapperSx(DIRECTION_RTL, 12, false);
      expect(sx.paddingLeft).toBe(12);
    });
  });
});
