import React, { useContext, useMemo, useRef, useEffect } from 'react';
import { TableCell, TableSortLabel, Box, Tooltip } from '@mui/material';
import { SORT_ORDER_ASC, SORT_ORDER_DESC, ALIGN_LEFT, DIRECTION_RTL } from '../config/schema';
import { DataGridStableContext } from '../DataGrid/DataGridContext';
import { getFilterRowBoxSx } from '../utils/filterBoxStyles';
import { getEffectiveMinWidth } from '../utils/columnWidthUtils';

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
  const multiColumn = sortModel?.length > 1;
  const filterBoxSx = useMemo(() => getFilterRowBoxSx(filterInputHeight), [filterInputHeight]); 

  const handleSortClick = (event) => {
    const multiColumn = event.ctrlKey || event.metaKey;
    onSort(column.field, multiColumn);
  };

  const onColumnResize = ctx?.onColumnResize;
  const colRefs = ctx?.colRefs;
  const columnWidthMap = ctx?.columnWidthMap;

  // Resize state - store width in ref during drag (not state)
  const resizeStateRef = useRef(null);

  // Get initial width from columnWidthMap
  const initialWidth = columnWidthMap?.get(column.field);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (resizeStateRef.current) {
        document.removeEventListener('mousemove', resizeStateRef.current.handleMouseMove);
        document.removeEventListener('mouseup', resizeStateRef.current.handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };
  }, []);

  const handleResizeMouseDown = (e) => {
    if (!onColumnResize || !colRefs) return;

    e.preventDefault();
    e.stopPropagation();

      const colElement = colRefs?.current?.get(column.field);
    if (!colElement) return;

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
    <TableCell align={align} padding="none" variant="head" sx={{ paddingLeft: '4px', paddingRight: '4px', ...cellSx, position: 'relative' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: headerComboSlot ? 'nowrap' : 'wrap', py: mainRowHeight ? 0 : 0.5, boxSizing: 'border-box', height: '100%' }}>
        <Tooltip title={column.headerName || ''}>
          <TableSortLabel
            active={!!sortDir}
            direction={order}
            onClick={handleSortClick}
            sx={{ minHeight: 20, minWidth: 0, overflow: 'hidden', flexShrink: 0 }}
          >
            <Box
              component="span"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'block',
                width: '100%',
              }}
            >
              {column.headerName}
            </Box>
          </TableSortLabel>
        </Tooltip>
        {sortOrderIndex != null && multiColumn && (
              <Box component="span" sx={{ ml: 0.25, fontSize: '0.75rem', opacity: 0.8, flexShrink: 0 }}>
                {`(${sortOrderIndex})`}
              </Box>
            )}
        {headerComboSlot != null && <Box sx={{ flexShrink: 0 }}>{headerComboSlot}</Box>}
        <Box sx={{ flex: 1, minWidth: 0 }} />        
      </Box>
      {filterSlot != null && <Box sx={filterBoxSx}>{filterSlot}</Box>}
      {/* Resize handle(s) - RTL: main handle at left (end of column); RTL first column also gets right edge. LTR: right edge only */}
      {onColumnResize && colRefs && (
        <>
          <Box
            data-testid="resize-handle"
            onMouseDown={handleResizeMouseDown}
            sx={{
              position: 'absolute',
              top: 0,
              ...(direction === DIRECTION_RTL ? { left: '-3px' } : { right: '-3px' }),
              width: '8px',
              height: '100%',
              cursor: 'col-resize',
              zIndex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.05)',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
              },
            }}
          />
        </>
      )}
    </TableCell>
  );
}


