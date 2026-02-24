import { useMemo } from 'react';
import { DIRECTION_RTL } from '../config/schema';
import { defaultGridConfig } from '../config/defaultConfig';
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
 * @param {boolean} [params.filters=true] - Whether filters are shown (affects built-in min width)
 * @param {Object} [params.bodyRow] - Body row config (height, paddingTop, paddingBottom, paddingLeft, paddingRight, ...sx). Uses default when undefined.
 * @returns {{ sortOrderIndexMap: Map, columnSortDirMap: Map, columnAlignMap: Map, headerCellSxMap: Map, filterCellSxMap: Map, bodyCellSxMap: Map, rowStylesMap: Map, columnWidthMap: Map }}
 */
export function useDataGridMaps({
  columns,
  sortModel,
  direction,
  headerConfig,
  bodyRow,
  displayRows,
  getRowId,
  columnWidthMap: providedColumnWidthMap,
  filters = true,
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
  const createCellSx = (col, options, width, minWidth) => {
    const { rowHeight, backgroundColor, baseConfig, rowSx, verticalAlign = 'top' } = options;

    const widthStr = width != null ? `${width}px` : undefined;
    const minWidthStr = minWidth != null ? `${minWidth}px` : undefined;
    
    return {
      verticalAlign,
      ...baseConfig,
      paddingTop: '2px',
      paddingBottom: '2px',
      paddingLeft: '4px',
      paddingRight: '4px',
      ...(widthStr ? { width: widthStr } : { width: 'inherit' }),
      ...(minWidthStr && { minWidth: minWidthStr }),
      overflow: 'hidden',
      boxSizing: 'border-box',
      ...(backgroundColor && { backgroundColor }),
      ...(rowHeight && { height: rowHeight, maxHeight: rowHeight }),
      ...rowSx,
    };
  };

  const headerCellSxMap = useMemo(() => {
    const map = new Map();
    const mainRow = headerConfig?.mainRow ?? {};
    const { height: mainRowHeight, backgroundColor: mainRowBg, ...mainRowSx } = mainRow;
    columns.forEach((col) => {
      const width = providedColumnWidthMap?.get(col.field);
      const minWidth = getEffectiveMinWidth(col, { filters });
      const cellSx = createCellSx(
        col,
        {
          rowHeight: mainRowHeight,
          backgroundColor: mainRowBg,
          baseConfig: headerConfig?.base,
          rowSx: { ...mainRowSx, ...(mainRowHeight ? {} : { minHeight: 30 }) },
        },
        width,
        minWidth
      );
      map.set(col.field, cellSx);
    });
    return map;
  }, [columns, headerConfig, providedColumnWidthMap, filters]);

  const bodyCellSxMap = useMemo(() => {
    const map = new Map();
    const bodyRowConfig = bodyRow ?? defaultGridConfig.bodyRow ?? {};
    const { height: bodyRowHeight, paddingTop, paddingBottom, paddingLeft, paddingRight, ...bodyRowSx } = bodyRowConfig;
    columns.forEach((col) => {
      const width = providedColumnWidthMap?.get(col.field);
      const minWidth = getEffectiveMinWidth(col, { filters });
      const cellSx = createCellSx(
        col,
        {
          rowHeight: bodyRowHeight,
          baseConfig: {},
          rowSx: {
            paddingTop: paddingTop ?? '2px',
            paddingBottom: paddingBottom ?? '2px',
            paddingLeft: paddingLeft ?? '4px',
            paddingRight: paddingRight ?? '4px',
            ...bodyRowSx,
          },
          verticalAlign: 'middle',
        },
        width,
        minWidth
      );
      map.set(col.field, cellSx);
    });
    return map;
  }, [columns, bodyRow, providedColumnWidthMap, filters]);

  const filterCellSxMap = useMemo(() => {
    const map = new Map();
    const filterRows = headerConfig?.filterRows ?? {};
    const filterCells = headerConfig?.filterCells ?? {};
    const { height: frHeight, backgroundColor: frBg, ...filterRowsSx } = filterRows;
    const { height: fcHeight, backgroundColor: fcBg, ...filterCellsSx } = filterCells;
    const filterRowHeight = frHeight || fcHeight;
    const filterBg =
      fcBg ?? frBg ?? headerConfig?.mainRow?.backgroundColor ?? headerConfig?.base?.backgroundColor ?? 'background.paper';
    const filterRowSx = { ...filterRowsSx, ...filterCellsSx };
    columns.forEach((col) => {
      const width = providedColumnWidthMap?.get(col.field);
      const minWidth = width != null ? undefined : getEffectiveMinWidth(col, { filters });
      const cellSx = createCellSx(
        col,
        {
          rowHeight: filterRowHeight,
          backgroundColor: filterBg,
          baseConfig: headerConfig?.base,
          rowSx: filterRowSx,
          verticalAlign: 'middle',
        },
        width,
        minWidth
      );
      map.set(col.field, cellSx);
    });
    return map;
  }, [columns, headerConfig, providedColumnWidthMap, filters]);

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
    bodyCellSxMap,
    rowStylesMap,
    columnWidthMap,
  };
}
