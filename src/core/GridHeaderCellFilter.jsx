import React, { useContext } from 'react';
import { DataGridStableContext } from '../DataGrid/DataGridContext';
import { TableCell, Box } from '@mui/material';
import { ALIGN_RIGHT, ALIGN_LEFT } from '../config/schema';

const getFilterRowBoxSx = (filterInputHeight) => ({
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box',
    px: 0.5,
    minHeight: 20,
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    ...(filterInputHeight && { height: filterInputHeight, maxHeight: filterInputHeight }),
    '& .MuiInputBase-root': filterInputHeight ? { height: filterInputHeight, minHeight: filterInputHeight, maxHeight: filterInputHeight } : {},
    '& .MuiInputBase-input': filterInputHeight ? { height: '100%', padding: '4px 8px' } : {},
  });
  
/**
 * Filter or "to" row cell: full width slot with consistent padding/alignment.
 */
export function GridHeaderCellFilter({ column, slot }) {
    const ctx = useContext(DataGridStableContext);
    const filterInputHeight = ctx?.filterInputHeight;
    const columnAlignMap = ctx?.columnAlignMap;
    const filterCellSxMap = ctx?.filterCellSxMap;
    
    // Use pre-computed values from context
    const align = columnAlignMap?.get(column.field) ?? (column.align ?? ALIGN_LEFT);
    const cellSx = filterCellSxMap?.get(column.field);
    const filterBoxSx = getFilterRowBoxSx(filterInputHeight);
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