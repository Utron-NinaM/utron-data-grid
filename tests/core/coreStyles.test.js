import { describe, it, expect } from 'vitest';
import {
  getScrollInnerBoxSx,
  getHeaderScrollWrapperSx,
  getTableContainerSx,
  getHorizontalScrollportDir,
  getScrollBodyOuterVerticalRtlSx,
  getScrollBodyInnerHorizontalSx,
} from '../../src/core/coreStyles';
import { DIRECTION_LTR, DIRECTION_RTL } from '../../src/config/schema';

describe('coreStyles horizontal scroll helpers', () => {
  describe('getHorizontalScrollportDir', () => {
    it('returns ltr for RTL grid direction', () => {
      expect(getHorizontalScrollportDir(DIRECTION_RTL)).toBe('ltr');
    });

    it('returns undefined for LTR', () => {
      expect(getHorizontalScrollportDir(DIRECTION_LTR)).toBeUndefined();
    });
  });

  describe('getScrollInnerBoxSx', () => {
    it('uses overflowX hidden when showHorizontalScrollbar is false', () => {
      expect(getScrollInnerBoxSx(true, { showHorizontalScrollbar: false }).overflowX).toBe('hidden');
      expect(getScrollInnerBoxSx(true).overflowX).toBe('hidden');
    });

    it('uses overflowX auto when enableHorizontalScroll and showHorizontalScrollbar are true', () => {
      expect(getScrollInnerBoxSx(true, { showHorizontalScrollbar: true }).overflowX).toBe('auto');
    });

    it('applies gentle horizontal scrollbar on body scroll area when horizontal scrollbar is shown', () => {
      const sx = getScrollInnerBoxSx(true, { showHorizontalScrollbar: true });
      expect(sx.scrollbarWidth).toBe('thin');
      expect(sx['&::-webkit-scrollbar:horizontal']).toEqual({ height: 5 });
    });

    it('uses overflowX hidden when horizontal scroll is disabled even if showHorizontalScrollbar is true', () => {
      expect(getScrollInnerBoxSx(false, { showHorizontalScrollbar: true }).overflowX).toBe('hidden');
    });
  });

  describe('getScrollBodyOuterVerticalRtlSx', () => {
    it('uses vertical auto and hidden horizontal overflow', () => {
      const sx = getScrollBodyOuterVerticalRtlSx();
      expect(sx.overflowY).toBe('auto');
      expect(sx.overflowX).toBe('hidden');
    });
  });

  describe('getScrollBodyInnerHorizontalSx', () => {
    it('enables horizontal overflow and gentle scrollbar when horizontal scroll is on', () => {
      const sx = getScrollBodyInnerHorizontalSx(true);
      expect(sx.overflowX).toBe('auto');
      expect(sx.overflowY).toBe('visible');
      expect(sx.scrollbarWidth).toBe('thin');
    });

    it('does not force horizontal overflow when disabled', () => {
      const sx = getScrollBodyInnerHorizontalSx(false);
      expect(sx.overflowX).toBe('visible');
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

  describe('getTableContainerSx horizontal scrollbar', () => {
    it('applies gentle horizontal scrollbar when this container scrolls horizontally', () => {
      const sx = getTableContainerSx(true, 800, {});
      expect(sx.scrollbarWidth).toBe('thin');
      expect(sx['&::-webkit-scrollbar:horizontal']).toEqual({ height: 5 });
    });

    it('does not apply scrollbar styling when noScroll is true', () => {
      const sx = getTableContainerSx(true, 800, { noScroll: true });
      expect(sx.scrollbarWidth).toBeUndefined();
    });
  });
});
