import React from 'react';
import { TableRow, TableCell, Checkbox } from '@mui/material';
import { useDataGridContext } from '../DataGrid/useDataGridContext';
import { GridCell } from './GridCell';

/**
 * @param {Object} props
 * @param {Object} props.row
 * @param {string|number} props.rowId
 * @param {boolean} props.selected
 * @param {Function} props.onSelect
 * @param {string|number|null} props.editRowId
 * @param {Object} props.editValues
 * @param {Function} props.getEditor
 * @param {Set<string>} props.validationErrors
 * @param {Function} [props.onRowClick]
 * @param {Function} [props.onRowDoubleClick]
 * @param {string|number|null} [props.selectedRowId]
 * @param {Object} [props.rowSx]
 */
export function GridBodyRow({
  row,
  rowId,
  selected,
  onSelect,
  editRowId,
  editValues,
  getEditor,
  validationErrors,
  onRowClick,
  onRowDoubleClick,
  selectedRowId,
  rowSx,
}) {
  const ctx = useDataGridContext();
  const { columns, multiSelectable } = ctx;
  const isEditing = editRowId === rowId;
  const isSelected = selectedRowId === rowId;

  return (
    <TableRow
      hover
      selected={selected || isSelected}
      sx={rowSx}
      onClick={onRowClick ? () => onRowClick(row) : undefined}
      onDoubleClick={onRowDoubleClick ? () => onRowDoubleClick(row) : undefined}
    >
      {multiSelectable && (
        <TableCell padding="checkbox">
          <Checkbox
            checked={selected}
            onChange={(e) => onSelect(rowId, e.target.checked)}
            inputProps={{ 'aria-label': 'Select row' }}
          />
        </TableCell>
      )}
      {columns.map((col) => {
        const colEditable = typeof col.editable === 'function' ? col.editable(row) : col.editable;
        return (
          <GridCell
            key={col.field}
            value={isEditing && editValues[col.field] !== undefined ? editValues[col.field] : row[col.field]}
            row={row}
            column={col}
            isEditing={isEditing && colEditable}
            editor={isEditing && colEditable ? getEditor(col, row, editValues) : null}
            hasError={isEditing && validationErrors?.has(col.field)}
          />
        );
      })}
    </TableRow>
  );
}
