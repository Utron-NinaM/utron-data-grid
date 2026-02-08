import React from 'react';
import { TableCell } from '@mui/material';

/**
 * @param {Object} props
 * @param {*} props.value
 * @param {Object} props.row
 * @param {Object} props.column
 * @param {boolean} [props.isEditing]
 * @param {React.ReactNode} [props.editor]
 * @param {boolean} [props.hasError]
 * @param {'ltr'|'rtl'} [props.direction]
 */
export function GridCell({ value, row, column, isEditing, editor, hasError, direction }) {
  const align = column.align ?? (direction === 'rtl' ? 'right' : 'left');
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
