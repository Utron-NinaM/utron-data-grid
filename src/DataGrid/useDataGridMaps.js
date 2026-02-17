import { useMemo } from 'react';
import { DIRECTION_RTL } from '../config/schema';
import { calculateEffectiveWidth } from '../utils/widthUtils';

/**
 * Hook that computes column/header/row style maps from grid state.
 * @param {Object} params
 * @param {Object[]} params.columns
 * @param {Object[]} params.sortModel
 * @param {string} params.direction
 * @param {Object} params.headerConfig
 * @param {Object[]} params.displayRows
 * @param {Function} params.getRowId
 * @returns {{ sortOrderIndexMap: Map, columnSortDirMap: Map, columnAlignMap: Map, headerCellSxMap: Map, filterCellSxMap: Map, rowStylesMap: Map, columnWidthMap: Map }}
 */
export function useDataGridMaps({
  columns,
  sortModel,
  direction,
  headerConfig,
  displayRows,
  getRowId,
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

  // Compute effective widths once per column and reuse
  const columnEffectiveWidthsMap = useMemo(() => {
    const map = new Map();
    columns.forEach((col) => {
      map.set(col.field, calculateEffectiveWidth(col));
    });
    return map;
  }, [columns]);

  const columnWidthMap = useMemo(() => {
    const map = new Map();
    columns.forEach((col) => {
      if (col.width != null) {
        const { width: effectiveWidth } = columnEffectiveWidthsMap.get(col.field);
        if (effectiveWidth != null) {
          map.set(col.field, effectiveWidth);
        }
      }
    });
    return map;
  }, [columns, columnEffectiveWidthsMap]);

  // Helper function to create cell style for header or filter cells
  const createCellSx = (col, options, effectiveWidthData) => {
    const { rowHeight, backgroundColor, baseConfig } = options;
    const { width: effectiveWidth, minWidth: effectiveMinWidth } = effectiveWidthData;
    
    return {
      verticalAlign: 'top',
      ...baseConfig,
      padding: rowHeight ? '2px' : '4px',
      ...(effectiveWidth ? { width: effectiveWidth } : { width: 'inherit' }),
      ...(effectiveMinWidth && { minWidth: effectiveMinWidth }),
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
      const effectiveWidthData = columnEffectiveWidthsMap.get(col.field);
      const cellSx = createCellSx(col, {
        rowHeight: mainRowHeight,
        backgroundColor: headerConfig?.mainRow?.backgroundColor,
        baseConfig: headerConfig?.base,
      }, effectiveWidthData);
      map.set(col.field, cellSx);
    });
    return map;
  }, [columns, headerConfig, columnEffectiveWidthsMap]);

  const filterCellSxMap = useMemo(() => {
    const map = new Map();
    const filterRowHeight = headerConfig?.filterRows?.height || headerConfig?.filterCells?.height;
    columns.forEach((col) => {
      const effectiveWidthData = columnEffectiveWidthsMap.get(col.field);
      const cellSx = createCellSx(col, {
        rowHeight: filterRowHeight,        
        backgroundColor: headerConfig?.filterCells?.backgroundColor,
        baseConfig: headerConfig?.base,
      }, effectiveWidthData);
      map.set(col.field, cellSx);
    });
    return map;
  }, [columns, headerConfig, columnEffectiveWidthsMap]);

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
