import React, { useContext, useMemo, useRef, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import TableCell from '@mui/material/TableCell';
import TableSortLabel from '@mui/material/TableSortLabel';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import { SORT_ORDER_ASC, SORT_ORDER_DESC, ALIGN_LEFT, DIRECTION_RTL } from '../config/schema';
import { DataGridStableContext } from '../DataGrid/DataGridContext';
import { getFilterRowBoxSx } from '../filters/filterBoxStyles';
import { getEffectiveMinWidth } from '../utils/columnWidthUtils';
import {
  headerCellBaseSx,
  getHeaderInnerBoxSx,
  sortLabelSx,
  headerLabelSx,
  sortOrderBadgeSx,
  flexSpacerSx,
  getResizeHandleSx,
} from './coreStyles';

/**
 * @param {Object} props
 * @param {Object} props.column
 * @param {Array<{ field: string, order: string }>} props.sortModel
 * @param {Function} props.onSort
 * @param {React.ReactNode} [props.headerComboSlot] Combo/operator next to label
 * @param {React.ReactNode} [props.filterSlot] Filter inputs row (below)
 * @param {number} [props.sortOrderIndex] 1-based index in sort order
 */
export function GridHeaderCell({
  column,
  sortModel,
  onSort, 
  headerComboSlot,
  filterSlot,
  sortOrderIndex,
}) {
  const theme = useTheme();
  const ctx = useContext(DataGridStableContext);
  const direction = ctx?.direction;
  const headerConfig = ctx?.headerConfig;
  const filterInputHeight = ctx?.filterInputHeight;
  const columnAlignMap = ctx?.columnAlignMap;
  const columnSortDirMap = ctx?.columnSortDirMap;
  const headerCellSxMap = ctx?.headerCellSxMap;
  
  // Use pre-computed values from context
  const align = columnAlignMap?.get(column.field) ?? (column.align ?? ALIGN_LEFT);
  const sortOrder = columnSortDirMap?.get(column.field);
  const sortDir = sortOrder ? { field: column.field, order: sortOrder } : null;
  const order = sortOrder === SORT_ORDER_ASC ? SORT_ORDER_ASC : SORT_ORDER_DESC;
  const cellSx = headerCellSxMap?.get(column.field);
  const mainRowHeight = headerConfig?.mainRow?.height;

  const columnBackground = useMemo(() => {
    const raw =
      cellSx?.backgroundColor ??
      headerConfig?.mainRow?.backgroundColor ??
      headerConfig?.base?.backgroundColor;
    if (!raw || typeof raw !== 'string') return undefined;
    if (raw.startsWith('#') || raw.startsWith('rgb')) return raw;
    const parts = raw.split('.');
    let val = theme?.palette;
    for (const p of parts) {
      val = val?.[p];
    }
    return typeof val === 'string' ? val : undefined;
  }, [cellSx?.backgroundColor, headerConfig?.mainRow?.backgroundColor, headerConfig?.base?.backgroundColor, theme?.palette]);
  
  const multiColumn = sortModel?.length > 1;
  const filterBoxSx = useMemo(() => getFilterRowBoxSx(filterInputHeight, ctx?.fontSize), [filterInputHeight, ctx?.fontSize]); 

  const handleSortClick = (event) => {
    const multiColumn = event.ctrlKey || event.metaKey;
    onSort(column.field, multiColumn);
  };

  const onColumnResize = ctx?.onColumnResize;
  const colRefs = ctx?.colRefs;
  const resizingColumnRef = ctx?.resizingColumnRef;
  const columnWidthMap = ctx?.columnWidthMap;

  // Resize state - store width in ref during drag (not state)
  const resizeStateRef = useRef(null);

  // Get initial width from columnWidthMap
  const initialWidth = columnWidthMap?.get(column.field);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (resizeStateRef.current) {
        if (resizingColumnRef) resizingColumnRef.current = null;
        document.removeEventListener('mousemove', resizeStateRef.current.handleMouseMove);
        document.removeEventListener('mouseup', resizeStateRef.current.handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };
  }, [resizingColumnRef]);

  const handleResizeMouseDown = (e) => {
    if (!onColumnResize || !colRefs) return;

    e.preventDefault();
    e.stopPropagation();

    const colElement = colRefs?.current?.get(column.field);
    if (!colElement) return;

    if (resizingColumnRef) resizingColumnRef.current = column.field;

    const currentWidth = parseFloat(colElement.style.width) || initialWidth || 100;
    const startX = e.clientX;
    const startWidth = currentWidth;

    // Get minWidth constraint using getEffectiveMinWidth
    const minWidth = getEffectiveMinWidth(column);

    const handleMouseMove = (e) => {
      const deltaX = e.clientX - startX;
      const effectiveDelta = direction === DIRECTION_RTL ? -deltaX : deltaX;
      let newWidth = startWidth + effectiveDelta;

      // Snap to integer pixels
      newWidth = Math.floor(newWidth);

      // Optional: Snap to 8px grid for visual consistency
      // newWidth = Math.round(newWidth / 8) * 8;

      // Apply minWidth constraint
      newWidth = Math.max(newWidth, minWidth);

      // Apply maxWidth constraint if provided
      if (column.maxWidth != null) {
        newWidth = Math.min(newWidth, column.maxWidth);
      }

      // Update col element directly (updates entire column instantly)
      colElement.style.width = `${newWidth}px`;
    };

    const handleMouseUp = () => {
      const finalWidth = Math.floor(parseFloat(colElement.style.width) || startWidth);
      
      // Commit to state on mouseup (once)
      onColumnResize(column.field, finalWidth);

      // Cleanup
      if (resizingColumnRef) resizingColumnRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      resizeStateRef.current = null;
    };

    // Store handlers in ref for cleanup
    resizeStateRef.current = {
      handleMouseMove,
      handleMouseUp,
    };

    // Set up global listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  return (
    <TableCell align={align} padding="none" variant="head" sx={{ ...headerCellBaseSx, ...cellSx }}>
      <Box sx={getHeaderInnerBoxSx(mainRowHeight, headerComboSlot)}>
        <Tooltip title={column.headerName || ''} PopperProps={{ disablePortal: true }}>
          <TableSortLabel
            active={!!sortDir}
            direction={order}
            onClick={handleSortClick}
            hideSortIcon={false}
            sx={sortLabelSx}
          >
            <Box component="span" sx={headerLabelSx}>
              {column.headerName}
            </Box>
          </TableSortLabel>
        </Tooltip>
        {/* Reserve space for sort order badge to prevent column width shift on multi-sort */}
        <Box component="span" sx={{ minWidth: 28, flexShrink: 0 }}>
          {sortOrderIndex != null && multiColumn ? (
            <Box component="span" sx={sortOrderBadgeSx}>{`(${sortOrderIndex})`}</Box>
          ) : null}
        </Box>
        {headerComboSlot != null && <Box sx={{ flexShrink: 0 }}>{headerComboSlot}</Box>}
        <Box sx={flexSpacerSx} />
      </Box>
      {filterSlot != null && <Box sx={filterBoxSx}>{filterSlot}</Box>}
      {onColumnResize && colRefs && (
        <Box
          data-testid="resize-handle"
          onMouseDown={handleResizeMouseDown}
          sx={getResizeHandleSx(direction, columnBackground, theme)}
        />
      )}
    </TableCell>
  );
}


