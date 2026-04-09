import { describe, it, expect } from 'vitest';
import { getScrollInnerBoxSx, getHeaderScrollWrapperSx } from '../../src/core/coreStyles';

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
      const sx = getHeaderScrollWrapperSx(false);
      expect(sx.scrollbarWidth).toBe('none');
      expect(sx['&::-webkit-scrollbar']).toEqual({ display: 'none' });
    });

    it('does not hide scrollbar styles when showScrollbar is true', () => {
      const sx = getHeaderScrollWrapperSx(true);
      expect(sx.scrollbarWidth).toBeUndefined();
      expect(sx['&::-webkit-scrollbar']).toBeUndefined();
    });

    it('contains no padding (padding is applied imperatively by measureScrollbarWidth)', () => {
      const sx = getHeaderScrollWrapperSx(false);
      expect(sx.paddingLeft).toBeUndefined();
      expect(sx.paddingRight).toBeUndefined();
    });
  });
});
