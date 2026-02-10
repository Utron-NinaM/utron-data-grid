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
const cellRenderCount = new Map(); // Track renders per cell (field + rowId combo)

export function GridCell({ value, row, column, isEditing, editor, hasError }) {
  const ctx = useContext(DataGridStableContext);
  const direction = ctx?.direction ?? 'ltr';
  const align = column.align ?? (direction === 'rtl' ? ALIGN_RIGHT : ALIGN_LEFT);
  const cellStyle = typeof column.cellStyle === 'function' ? column.cellStyle(value, row) : undefined;
  const sx = {
    ...(hasError && { border: '1px solid', borderColor: 'error.light' }),
    ...cellStyle,
  };

  // Debug: Track cell renders (only first few to avoid spam)
  const cellKey = `${column.field}-${row?.id || 'unknown'}`;
  const count = (cellRenderCount.get(cellKey) || 0) + 1;
  cellRenderCount.set(cellKey, count);
  if (count <= 2) {
    console.log(`[GridCell] ${cellKey} rendered (#${count})`);
  }

  return (
    <TableCell align={align} sx={sx} padding="none" variant="body">
      {isEditing && editor != null ? editor : column.render ? column.render(value, row) : String(value ?? '')}
    </TableCell>
  );
}
