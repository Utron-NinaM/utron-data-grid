import React, { memo, useContext } from 'react';
import { useSyncExternalStore } from 'react';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Checkbox from '@mui/material/Checkbox';
import { DataGridStableContext } from '../DataGrid/DataGridContext';
import { NOT_EDITING } from '../DataGrid/editStore';
import { GridCell } from './GridCell';

/**
 * @param {Object} props
 * @param {Object} props.row
 * @param {string|number} props.rowId
 * @param {boolean} props.selected
 * @param {Function} props.onSelectRow Stable callback: (rowId, checked) => void
 * @param {Array} [props.rowSx] Pre-computed row styles (row style + hover via &:hover td; selected at cell level)
 * @param {Object} [props.rowStyle] Row-specific sx for cells (from column rowStyle); applied before column cellStyle
 * @param {Object} [props.selectedRowStyle] MUI sx for selected row; applied at cell level so it overrides row/column
 * @param {boolean} [props.disableRowHover] When true, TableRow hover is disabled (used by GridTable for rowSx)
 * @param {Array} props.columns
 * @param {boolean} props.multiSelectable
 * @param {Function} props.getEditor
 */
function GridBodyRowComponent({
  row,
  rowId,
  selected,
  onSelectRow,
  rowSx,
  rowStyle,
  selectedRowStyle,
  disableRowHover = false,
  columns,
  multiSelectable,
  getEditor,
}) {
  const ctx = useContext(DataGridStableContext);
  const selectionStore = ctx?.selectionStore;
  const editStore = ctx?.editStore;

  const isSelected = useSyncExternalStore(
    selectionStore?.subscribe ?? (() => () => {}),
    () => selectionStore?.getSnapshot?.() === rowId,
    () => false
  );

  const editState = useSyncExternalStore(
    editStore?.subscribe ?? (() => () => {}),
    () => {
      const s = editStore?.getSnapshot?.();
      if (!s || s.editRowId !== rowId) return NOT_EDITING;
      return s.editStateForRow ?? NOT_EDITING;
    },
    () => NOT_EDITING
  );

  const isEditing = editState.isEditing;

  const isRowSelected = selected || isSelected;

  return (
    <TableRow
      hover={false}
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
        const editValues = editState.editValues ?? {};
        const validationErrors = editState.validationErrors ?? new Set();
        return (
          <GridCell
            key={col.field}
            value={isEditing && editValues[col.field] !== undefined ? editValues[col.field] : row[col.field]}
            row={row}
            column={col}
            isEditing={isEditing && colEditable}
            editor={isEditing && colEditable ? getEditor(col, row, editValues) : null}
            hasError={isEditing && validationErrors.has(col.field)}
            rowStyle={rowStyle}
            isSelected={isRowSelected}
            selectedRowStyle={selectedRowStyle}
          />
        );
      })}
    </TableRow>
  );
}

// Memoized component - React.memo with default shallow comparison
// Props are stabilized upstream via context, so default comparison is sufficient
export const GridBodyRow = memo(GridBodyRowComponent);
