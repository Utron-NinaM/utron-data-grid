import React, { useContext } from 'react';
import { TableCell } from '@mui/material';
import { ALIGN_LEFT, ALIGN_RIGHT } from '../config/schema';
import { DataGridStableContext } from '../DataGrid/DataGridContext';

/**
 * @param {Object} props
 * @param {*} props.value
 * @param {Object} props.row
 * @param {Object} props.column
 * @param {boolean} [props.isEditing]
 * @param {React.ReactNode} [props.editor]
 * @param {boolean} [props.hasError]
 */
export function GridCell({ value, row, column, isEditing, editor, hasError }) {
  const ctx = useContext(DataGridStableContext);
  const columnAlignMap = ctx?.columnAlignMap;
  
  // Use pre-computed align from context
  const align = columnAlignMap?.get(column.field) ?? (column.align ?? ALIGN_LEFT);
  const cellStyle = typeof column.cellStyle === 'function' ? column.cellStyle(value, row) : undefined;
  const sx = {
    ...(hasError && { border: '1px solid', borderColor: 'error.light' }),
    ...cellStyle,
  };

  return (
    <TableCell align={align} sx={sx} padding="none" variant="body">
      {isEditing && editor != null ? editor : column.render ? column.render(value, row) : String(value ?? '')}
    </TableCell>
  );
}
