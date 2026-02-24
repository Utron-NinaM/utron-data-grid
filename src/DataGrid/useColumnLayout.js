import { useMemo } from 'react';
import { calculateColumnWidths } from '../utils/columnWidthUtils';
import { useContainerWidth } from './useContainerWidth';

// MUI TableCell padding="checkbox" column width (px) – reserve this when multiSelectable so data columns fit
const CHECKBOX_COLUMN_WIDTH_PX = 48;

let _scrollbarWidth = -1;
function getScrollbarWidth() {
  if (_scrollbarWidth >= 0) return _scrollbarWidth;
  if (typeof document === 'undefined') return 0;
  const outer = document.createElement('div');
  outer.style.cssText = 'width:100px;height:100px;overflow-y:scroll;position:absolute;visibility:hidden;top:-9999px;left:-9999px';
  const inner = document.createElement('div');
  inner.style.height = '200px';
  outer.appendChild(inner);
  document.body.appendChild(outer);
  _scrollbarWidth = outer.offsetWidth - outer.clientWidth;
  document.body.removeChild(outer);
  return _scrollbarWidth;
}

/**
 * Hook that computes column layout using the width calculation algorithm.
 * Memoizes results based on columns, containerWidth, and columnWidthState.
 *
 * @param {Object} params
 * @param {Object[]} params.columns - Array of column definitions
 * @param {React.RefObject} params.containerRef - Ref to the container element
 * @param {Map<string, number>} params.columnWidthState - Map of field -> width for user-resized columns (overrides only)
 * @param {boolean} [params.multiSelectable] - When true, reserve space for the checkbox column so total table width fits
 * @param {boolean} [params.reserveScrollbarWidth] - When true (e.g. useScrollableLayout), use scroll container width when available (avoids horizontal scroll)
 * @param {React.RefObject} [params.scrollContainerRef] - Ref to the body scroll container (populated when containScroll)
 * @param {boolean} [params.scrollContainerReady] - When true, scrollContainerRef.current is set
 * @param {boolean} [params.filters=true] - Whether filters are shown (affects built-in min width)
 * @param {boolean} [params.fitToContainer=false] - When true, treat no-width/flex columns as flexible and cap total to container
 * @returns {{ columnWidthMap: Map<string, number>, totalWidth: number, enableHorizontalScroll: boolean }}
 */
export function useColumnLayout({
  columns,
  containerRef,
  columnWidthState,
  multiSelectable = false,
  reserveScrollbarWidth = false,
  scrollContainerRef,
  scrollContainerReady = false,
  filters = true,
  fitToContainer = false,
}) {
  const useScrollContainer = reserveScrollbarWidth && scrollContainerReady && scrollContainerRef?.current;
  const containerWidth = useContainerWidth(containerRef, {
    scrollContainerRef: reserveScrollbarWidth ? scrollContainerRef : undefined,
    scrollContainerReady: reserveScrollbarWidth ? scrollContainerReady : false,
  });

  // Memoize columnWidthState as a string for dependency comparison
  // This avoids deep comparison issues with Map objects
  const columnWidthStateKey = useMemo(() => {
    if (!columnWidthState || columnWidthState.size === 0) {
      return '';
    }
    // Create a sorted string representation of the Map
    const entries = Array.from(columnWidthState.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([field, width]) => `${field}:${width}`)
      .join(',');
    return entries;
  }, [columnWidthState]);

  // Memoize results based on columns, containerWidth, and columnWidthState
  const layoutResult = useMemo(() => {
    if (!columns || columns.length === 0) {
      return {
        columnWidthMap: new Map(),
        totalWidth: 0,
        enableHorizontalScroll: false
      };
    }

    // If containerRef is null/undefined, return empty layout
    if (!containerRef) {
      return {
        columnWidthMap: new Map(),
        totalWidth: 0,
        enableHorizontalScroll: false
      };
    }

    // If containerWidth is 0 but ref exists, use fallback for ResizeObserver initialization delay
    // This handles the case where ResizeObserver hasn't fired yet on initial render
    // Note: Negative containerWidth is allowed (may be used for scroll calculations)
    const rawWidth = containerWidth > 0 ? containerWidth : 1000;
    // Always reserve scrollbar width when reserveScrollbarWidth: clientWidth can be reported before the
    // vertical scrollbar appears, so subtract it proactively. Add 2px buffer to avoid a brief horizontal
    // scroll flash when switching page size (10→25 rows) before ResizeObserver fires with the new width.
    const scrollbarReserve = reserveScrollbarWidth ? getScrollbarWidth() + 2 : 0;
    const effectiveContainerWidth = rawWidth
      - (multiSelectable ? CHECKBOX_COLUMN_WIDTH_PX : 0)
      - scrollbarReserve;
    const availableWidthForScrollCheck = rawWidth - scrollbarReserve;

    const result = calculateColumnWidths(columns, effectiveContainerWidth, columnWidthState, { filters, fitToContainer });
    const dataColumnsTotal = result.totalWidth;
    const totalTableWidth = multiSelectable ? dataColumnsTotal + CHECKBOX_COLUMN_WIDTH_PX : dataColumnsTotal;

    // Use 1px tolerance to avoid spurious horizontal scroll from sub-pixel rounding
    const enableH = totalTableWidth > availableWidthForScrollCheck + 1;
    return {
      columnWidthMap: result.columnWidthMap,
      totalWidth: totalTableWidth,
      enableHorizontalScroll: enableH
    };
  }, [columns, containerWidth, columnWidthStateKey, containerRef, multiSelectable, reserveScrollbarWidth, scrollContainerReady, scrollContainerRef, filters, fitToContainer]);

  return layoutResult;
}
