import { useMemo } from 'react';
import { DIRECTION_RTL } from '../config/schema';
import { getEffectiveMinWidth } from '../utils/columnWidthUtils';


/**
 * Hook that computes column/header/row style maps from grid state.
 * @param {Object} params
 * @param {Object[]} params.columns
 * @param {Object[]} params.sortModel
 * @param {string} params.direction
 * @param {Object} params.headerConfig
 * @param {Object[]} params.displayRows
 * @param {Function} params.getRowId
 * @param {Map<string, number>} [params.columnWidthMap] - Map of field -> width (numbers) from useColumnLayout
 * @returns {{ sortOrderIndexMap: Map, columnSortDirMap: Map, columnAlignMap: Map, headerCellSxMap: Map, filterCellSxMap: Map, rowStylesMap: Map, columnWidthMap: Map }}
 */
export function useDataGridMaps({
  columns,
  sortModel,
  direction,
  headerConfig,
  displayRows,
  getRowId,
  columnWidthMap: providedColumnWidthMap,
}) {
  const sortOrderIndexMap = useMemo(() => {
    const map = new Map();
    if (sortModel?.length > 0) {
      sortModel.forEach((sort, index) => {
        map.set(sort.field, index + 1);
      });
    }
    return map;
  }, [sortModel]);

  const columnSortDirMap = useMemo(() => {
    const map = new Map();
    if (sortModel?.length > 0) {
      sortModel.forEach((sort) => {
        map.set(sort.field, sort.order);
      });
    }
    return map;
  }, [sortModel]);

  const columnAlignMap = useMemo(() => {
    const map = new Map();
    columns.forEach((col) => {
      map.set(col.field, col.align ?? (direction === DIRECTION_RTL ? 'right' : 'left'));
    });
    return map;
  }, [columns, direction]);

  // Build columnWidthMap from columns if not provided, normalizing widths to strings
  const columnWidthMap = useMemo(() => {
    if (providedColumnWidthMap) {
      // Normalize numeric values from useColumnLayout to strings
      const normalizedMap = new Map();
      providedColumnWidthMap.forEach((width, field) => {
        normalizedMap.set(field, typeof width === 'number' ? `${width}px` : width);
      });
      return normalizedMap;
    }
    // Build from columns when not provided (e.g., in tests)
    const map = new Map();
    columns.forEach((col) => {
      if (col.width != null) {
        const normalized = typeof col.width === 'number' ? `${col.width}px` : col.width;
        map.set(col.field, normalized);
      }
    });
    return map;
  }, [columns, providedColumnWidthMap]);

  // Helper function to create cell style for header or filter cells
  // Extracted to module level for performance (can be memoized)
  const createCellSx = (col, options, width, minWidth) => {
    const { rowHeight, backgroundColor, baseConfig } = options;
    
    // Convert width number to string if provided
    const widthStr = width != null ? `${width}px` : undefined;
    const minWidthStr = minWidth != null ? `${minWidth}px` : undefined;
    
    return {
      verticalAlign: 'top',
      ...baseConfig,
      padding: rowHeight ? '2px' : '4px',
      ...(widthStr ? { width: widthStr } : { width: 'inherit' }),
      ...(minWidthStr && { minWidth: minWidthStr }),
      overflow: 'hidden',
      boxSizing: 'border-box',
      ...(backgroundColor && { backgroundColor }),
      ...(rowHeight && { height: rowHeight, maxHeight: rowHeight }),      
    };
  };

  const headerCellSxMap = useMemo(() => {
    const map = new Map();
    const mainRowHeight = headerConfig?.mainRow?.height;
    columns.forEach((col) => {
      // Use provided width from layout calculation (number) or fall back to old calculation
      const width = providedColumnWidthMap?.get(col.field);
      const minWidth = getEffectiveMinWidth(col);
      const cellSx = createCellSx(col, {
        rowHeight: mainRowHeight,
        backgroundColor: headerConfig?.mainRow?.backgroundColor,
        baseConfig: headerConfig?.base,
      }, width, minWidth);
      map.set(col.field, cellSx);
    });
    return map;
  }, [columns, headerConfig, providedColumnWidthMap]);

  const filterCellSxMap = useMemo(() => {
    const map = new Map();
    const filterRowHeight = headerConfig?.filterRows?.height || headerConfig?.filterCells?.height;
    columns.forEach((col) => {
      // Use provided width from layout calculation (number) or fall back to old calculation
      const width = providedColumnWidthMap?.get(col.field);
      const minWidth = width != null ? undefined : getEffectiveMinWidth(col);
      const cellSx = createCellSx(col, {
        rowHeight: filterRowHeight,        
        backgroundColor: headerConfig?.filterCells?.backgroundColor,
        baseConfig: headerConfig?.base,
      }, width, minWidth);
      map.set(col.field, cellSx);
    });
    return map;
  }, [columns, headerConfig, providedColumnWidthMap]);

  const rowStylesMap = useMemo(() => {
    const map = new Map();
    displayRows.forEach((row) => {
      const rowId = getRowId(row);
      const computedRowSx = columns.reduce(
        (acc, col) =>
          typeof col.rowStyle === 'function' ? { ...acc, ...col.rowStyle(row) } : acc,
        {}
      );
      const finalRowSx = Object.keys(computedRowSx).length ? computedRowSx : undefined;
      map.set(rowId, finalRowSx);
    });
    return map;
  }, [displayRows, columns, getRowId]);

  return {
    sortOrderIndexMap,
    columnSortDirMap,
    columnAlignMap,
    headerCellSxMap,
    filterCellSxMap,
    rowStylesMap,
    columnWidthMap,
  };
}
