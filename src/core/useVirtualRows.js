import { useState, useEffect, useRef } from 'react';

// Overscan: base rows above/below viewport; extra when scroll delta is large (e.g. scrollbar drag, Page Down).
const OVERCAN_ROWS_BASE = 3;
const OVERCAN_ROWS_LARGE_JUMP = 5;
const LARGE_JUMP_PX = 250;

/**
 * Computes the virtual row range from the body scroll container.
 * Used only when containScroll and rowCount > 0. Otherwise returns full range and offsetY 0.
 *
 * @param {Object} opts
 * @param {React.RefObject<HTMLElement>} opts.scrollContainerRef - The scrollable body container (overflow: auto)
 * @param {number} opts.rowCount
 * @param {number} opts.rowHeight - Same source as totalBodyHeight (e.g. bodyRow?.height ?? BODY_ROW_HEIGHT)
 * @param {boolean} opts.containScroll
 * @param {number|null} opts.editRowIndex - When editing, expand range so this row is always rendered
 * @returns {{ startIndex: number, endIndex: number, offsetY: number, totalBodyHeight: number, visibleCount: number, overscanRows: number }}
 */
export function useVirtualRows({
  scrollContainerRef,
  rowCount,
  rowHeight,
  containScroll,
  editRowIndex,
}) {
  const [scrollState, setScrollState] = useState({ scrollTop: 0, containerHeight: 0 });
  const prevScrollTopRef = useRef(0);

  useEffect(() => {
    if (!containScroll || rowCount === 0) return;
    const el = scrollContainerRef?.current;
    if (!el) return;

    const onScroll = () => {
      setScrollState((prev) => ({ ...prev, scrollTop: el.scrollTop }));
    };
    const onResize = () => {
      setScrollState((prev) => ({ ...prev, containerHeight: el.clientHeight }));
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    const ro = new ResizeObserver(onResize);
    ro.observe(el);

    setScrollState({ scrollTop: el.scrollTop, containerHeight: el.clientHeight });

    return () => {
      el.removeEventListener('scroll', onScroll);
      ro.disconnect();
    };
  }, [containScroll, rowCount, scrollContainerRef]);

  const { scrollTop, containerHeight } = scrollState;

  if (!containScroll || rowCount === 0) {
    return {
      startIndex: 0,
      endIndex: rowCount,
      offsetY: 0,
      totalBodyHeight: rowCount * rowHeight,
      visibleCount: rowCount,
      overscanRows: 0,
    };
  }

  const safeRowHeight = rowHeight > 0 ? rowHeight : 1;
  const rawStart = Math.floor(scrollTop / safeRowHeight);
  const visibleCount = Math.max(1, Math.ceil((containerHeight || 0) / safeRowHeight));

  const delta = Math.abs(scrollTop - prevScrollTopRef.current);
  prevScrollTopRef.current = scrollTop;
  const overscanRows = OVERCAN_ROWS_BASE + (delta > LARGE_JUMP_PX ? OVERCAN_ROWS_LARGE_JUMP : 0);

  let startIndex = Math.max(0, rawStart - overscanRows);
  let endIndex = Math.min(rowCount, rawStart + visibleCount + overscanRows);

  if (editRowIndex != null && editRowIndex >= 0 && editRowIndex < rowCount) {
    startIndex = Math.min(startIndex, editRowIndex);
    endIndex = Math.max(endIndex, editRowIndex + 1);
  }

  startIndex = Math.max(0, startIndex);
  endIndex = Math.min(rowCount, endIndex);

  const offsetY = startIndex * safeRowHeight;
  const totalBodyHeight = rowCount * safeRowHeight;

  return {
    startIndex,
    endIndex,
    offsetY,
    totalBodyHeight,
    visibleCount,
    overscanRows,
  };
}
