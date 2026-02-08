import React from 'react';
import { TableCell } from '@mui/material';
import { ALIGN_LEFT, ALIGN_RIGHT } from '../config/schema';
import { useDataGridContext } from '../DataGrid/useDataGridContext';

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
  const ctx = useDataGridContext();
  const direction = ctx?.direction ?? 'ltr';
  const align = column.align ?? (direction === 'rtl' ? ALIGN_RIGHT : ALIGN_LEFT);
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
