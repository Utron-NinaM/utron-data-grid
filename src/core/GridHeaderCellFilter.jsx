import React, { useContext } from 'react';
import { DataGridContext } from '../DataGrid/DataGridContext';
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
    const ctx = useContext(DataGridContext);
    const direction = ctx?.direction ?? 'ltr';
    const headerStyle = ctx?.headerStyle;
    const headerConfig = ctx?.headerConfig;
    const align = column.align ?? (direction === 'rtl' ? ALIGN_RIGHT : ALIGN_LEFT);
    const filterRowHeight = headerConfig?.filterRows?.height || headerConfig?.filterCells?.height;
    const filterInputHeight = ctx?.filterInputHeight;
    const cellSx = {
      verticalAlign: 'top',
      padding: filterRowHeight ? '2px' : '4px',
      width: 'inherit',
      maxWidth: 'inherit',
      overflow: 'hidden',
      boxSizing: 'border-box',
      ...(headerConfig?.filterCells?.backgroundColor && { backgroundColor: headerConfig.filterCells.backgroundColor }),
      ...(filterRowHeight && { height: filterRowHeight, maxHeight: filterRowHeight }),
      ...headerStyle,
    };
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