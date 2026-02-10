import React, { memo } from 'react';
import { TableRow, TableCell, Checkbox } from '@mui/material';
import { GridCell } from './GridCell';

/**
 * @param {Object} props
 * @param {Object} props.row
 * @param {string|number} props.rowId
 * @param {boolean} props.selected
 * @param {Function} props.onSelect
 * @param {string|number|null} props.editRowId
 * @param {Object} props.editValues
 * @param {Set<string>} props.validationErrors
 * @param {Function} [props.onRowClick]
 * @param {Function} [props.onRowDoubleClick]
 * @param {boolean} [props.isSelected]
 * @param {Object} [props.rowSx]
 * @param {Array} props.columns
 * @param {boolean} props.multiSelectable
 * @param {Function} props.getEditor
 * @param {Object} props.selectedRowStyle
 */
function GridBodyRowComponent({
  row,
  rowId,
  selected,
  onSelect,
  editRowId,
  editValues,
  validationErrors,
  onRowClick,
  onRowDoubleClick,
  isSelected,
  rowSx,
  columns,
  multiSelectable,
  getEditor,
  selectedRowStyle,
}) {
  const isEditing = editRowId === rowId;
  const isRowSelected = selected || isSelected;
  
  // Compute row styles inline - optimize later if profiling shows it's a bottleneck
  const computedRowSx = columns.reduce(
    (acc, col) =>
      typeof col.rowStyle === 'function' ? { ...acc, ...col.rowStyle(row) } : acc,
    {}
  );
  
  const finalRowSx = rowSx || (Object.keys(computedRowSx).length ? computedRowSx : undefined);
  
  const mergedSx = [
    finalRowSx,
    {
      '&.Mui-selected': {
        ...selectedRowStyle,
      },
      '&.Mui-selected:hover': {
        ...selectedRowStyle,
      },      
    },
  ];
  
  return (
    <TableRow
      hover
      selected={isRowSelected}
      sx={mergedSx}
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

// Memoized component - React.memo with default shallow comparison
// Props are stabilized upstream via context, so default comparison is sufficient
export const GridBodyRow = memo(GridBodyRowComponent);
