import { useMemo } from 'react';
import { DIRECTION_RTL } from '../config/schema';

/**
 * Hook that computes column/header/row style maps from grid state.
 * @param {Object} params
 * @param {Object[]} params.columns
 * @param {Object[]} params.sortModel
 * @param {string} params.direction
 * @param {Object} params.headerConfig
 * @param {Object[]} params.displayRows
 * @param {Function} params.getRowId
 * @returns {{ sortOrderIndexMap: Map, columnSortDirMap: Map, columnAlignMap: Map, headerCellSxMap: Map, filterCellSxMap: Map, rowStylesMap: Map }}
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

  const headerCellSxMap = useMemo(() => {
    const map = new Map();
    const mainRowHeight = headerConfig?.mainRow?.height;
    columns.forEach((col) => {
      map.set(col.field, {
        verticalAlign: 'top',
        padding: mainRowHeight ? '2px' : '4px',
        width: 'inherit',
        maxWidth: 'inherit',
        overflow: 'hidden',
        boxSizing: 'border-box',
        ...(headerConfig?.mainRow?.backgroundColor && { backgroundColor: headerConfig.mainRow.backgroundColor }),
        ...(mainRowHeight && { height: mainRowHeight, maxHeight: mainRowHeight }),
        ...headerConfig?.base,
      });
    });
    return map;
  }, [columns, headerConfig]);

  const filterCellSxMap = useMemo(() => {
    const map = new Map();
    const filterRowHeight = headerConfig?.filterRows?.height || headerConfig?.filterCells?.height;
    columns.forEach((col) => {
      map.set(col.field, {
        verticalAlign: 'top',
        padding: filterRowHeight ? '2px' : '4px',
        width: 'inherit',
        maxWidth: 'inherit',
        overflow: 'hidden',
        boxSizing: 'border-box',
        ...(headerConfig?.filterCells?.backgroundColor && { backgroundColor: headerConfig.filterCells.backgroundColor }),
        ...(filterRowHeight && { height: filterRowHeight, maxHeight: filterRowHeight }),
        ...headerConfig?.base,
      });
    });
    return map;
  }, [columns, headerConfig]);

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
  };
}
