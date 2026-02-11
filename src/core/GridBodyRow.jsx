import React, { memo } from 'react';
import { TableRow, TableCell, Checkbox } from '@mui/material';
import { GridCell } from './GridCell';

/**
 * @param {Object} props
 * @param {Object} props.row
 * @param {string|number} props.rowId
 * @param {boolean} props.selected
 * @param {Function} props.onSelectRow Stable callback: (rowId, checked) => void
 * @param {string|number|null} props.editRowId
 * @param {Object} props.editValues
 * @param {Set<string>} props.validationErrors
 * @param {boolean} [props.isSelected]
 * @param {Array} [props.rowSx] Pre-computed merged row styles (base styles + selected styles)
 * @param {Array} props.columns
 * @param {boolean} props.multiSelectable
 * @param {Function} props.getEditor
 */
function GridBodyRowComponent({
  row,
  rowId,
  selected,
  onSelectRow,
  editRowId,
  editValues,
  validationErrors,
  isSelected,
  rowSx,
  columns,
  multiSelectable,
  getEditor,
}) {
  const isEditing = editRowId === rowId;
  const isRowSelected = selected || isSelected;
  
  return (
    <TableRow
      hover
      selected={isRowSelected}
      sx={rowSx}
      data-row-id={rowId}
    >
      {multiSelectable && (
        <TableCell padding="checkbox">
          <Checkbox
            checked={selected}
            onChange={(e) => onSelectRow(rowId, e.target.checked)}
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

// Memoized component - React.memo with default shallow comparison
// Props are stabilized upstream via context, so default comparison is sufficient
export const GridBodyRow = memo(GridBodyRowComponent);
