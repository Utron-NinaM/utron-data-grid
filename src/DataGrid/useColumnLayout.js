import { useMemo } from 'react';
import { calculateColumnWidths } from '../utils/columnWidthUtils';
import { useContainerWidth } from './useContainerWidth';

// MUI TableCell padding="checkbox" column width (px) – reserve this when multiSelectable so data columns fit
const CHECKBOX_COLUMN_WIDTH_PX = 48;

/**
 * Hook that computes column layout using the width calculation algorithm.
 * Memoizes results based on columns, containerWidth, and columnWidthState.
 *
 * @param {Object} params
 * @param {Object[]} params.columns - Array of column definitions
 * @param {React.RefObject} params.containerRef - Ref to the container element
 * @param {Map<string, number>} params.columnWidthState - Map of field -> width for user-resized columns (overrides only)
 * @param {boolean} [params.multiSelectable] - When true, reserve space for the checkbox column so total table width fits
 * @returns {{ columnWidthMap: Map<string, number>, totalWidth: number, enableHorizontalScroll: boolean }}
 */
export function useColumnLayout({ columns, containerRef, columnWidthState, multiSelectable = false }) {
  // Get container width using ResizeObserver
  const containerWidth = useContainerWidth(containerRef);

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
    const effectiveContainerWidth = rawWidth - (multiSelectable ? CHECKBOX_COLUMN_WIDTH_PX : 0);

    const result = calculateColumnWidths(columns, effectiveContainerWidth, columnWidthState);
    const dataColumnsTotal = result.totalWidth;
    const totalTableWidth = multiSelectable ? dataColumnsTotal + CHECKBOX_COLUMN_WIDTH_PX : dataColumnsTotal;

    return {
      columnWidthMap: result.columnWidthMap,
      totalWidth: totalTableWidth,
      enableHorizontalScroll: totalTableWidth > rawWidth
    };
  }, [columns, containerWidth, columnWidthStateKey, containerRef, multiSelectable]);

  return layoutResult;
}
