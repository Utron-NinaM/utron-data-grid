import React, { useContext, useMemo } from 'react';
import { DataGridStableContext } from '../DataGrid/DataGridContext';
import TableCell from '@mui/material/TableCell';
import Box from '@mui/material/Box';
import { ALIGN_LEFT } from '../config/schema';
import { getFilterRowBoxSx } from '../filters/filterBoxStyles';
import { DIRECTION_RTL } from '../config/schema';

/**
 * Filter or "to" row cell: full width slot with consistent padding/alignment.
 */
export function GridHeaderCellFilter({ column, slot }) {
    const ctx = useContext(DataGridStableContext);
    const filterInputHeight = ctx?.filterInputHeight;
    const columnAlignMap = ctx?.columnAlignMap;
    const filterCellSxMap = ctx?.filterCellSxMap;
    const direction = ctx?.direction;
    
    // Use pre-computed values from context
    const align = columnAlignMap?.get(column.field) ?? (column.align ?? ALIGN_LEFT);
    const cellSx = filterCellSxMap?.get(column.field);
    const filterBoxSx = useMemo(() => getFilterRowBoxSx(filterInputHeight, ctx?.fontSize, direction === DIRECTION_RTL), [filterInputHeight, ctx?.fontSize, direction]);
    return (
      <TableCell align={align} padding="none" variant="head" sx={cellSx}>
        {slot != null ? (
          <Box sx={filterBoxSx}>{slot}</Box>
        ) : (
          <Box sx={{ ...filterBoxSx, minHeight: 0 }} />
        )}
      </TableCell>
    );
  }