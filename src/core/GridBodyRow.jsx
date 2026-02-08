import React from 'react';
import { TableRow, TableCell, Checkbox } from '@mui/material';
import { GridCell } from './GridCell';

/**
 * @param {Object} props
 * @param {Object} props.row
 * @param {Object[]} props.columns
 * @param {string|number} props.rowId
 * @param {boolean} props.selectable
 * @param {boolean} props.selected
 * @param {Function} props.onSelect
 * @param {string|number|null} props.editRowId
 * @param {Object} props.editValues
 * @param {Function} props.getEditor
 * @param {Set<string>} props.validationErrors
 * @param {'ltr'|'rtl'} props.direction
 * @param {Function} [props.onRowDoubleClick]
 */
export function GridBodyRow({
  row,
  columns,
  rowId,
  selectable,
  selected,
  onSelect,
  editRowId,
  editValues,
  getEditor,
  validationErrors,
  direction,
  onRowDoubleClick,
  rowSx,
}) {
  const isEditing = editRowId === rowId;

  return (
    <TableRow
      hover
      selected={selected}
      sx={rowSx}
      onDoubleClick={onRowDoubleClick}
    >
      {selectable && (
        <TableCell padding="checkbox">
          <Checkbox
            checked={selected}
            onChange={(e) => onSelect(rowId, e.target.checked)}
            inputProps={{ 'aria-label': 'Select row' }}
          />
        </TableCell>
      )}
      {columns.map((col) => (
        <GridCell
          key={col.field}
          value={isEditing && editValues[col.field] !== undefined ? editValues[col.field] : row[col.field]}
          row={row}
          column={col}
          isEditing={isEditing && col.editable}
          editor={isEditing && col.editable ? getEditor(col, row, editValues) : null}
          hasError={validationErrors?.has(col.field)}
          direction={direction}
        />
      ))}
    </TableRow>
  );
}
