import React, { memo, useContext, useMemo } from 'react';
import { useSyncExternalStore } from 'react';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Checkbox from '@mui/material/Checkbox';
import { DataGridStableContext } from '../DataGrid/DataGridContext';
import { NOT_EDITING } from '../DataGrid/editStore';
import { GridCell } from './GridCell';
import { DIRECTION_RTL, DIRECTION_LTR } from '../config/schema';

// Stable constants to prevent unnecessary rerenders when there are no errors/values
const EMPTY_ERROR_MESSAGES = [];
const EMPTY_EDIT_VALUES = {};

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
  const direction = ctx?.direction ?? DIRECTION_LTR;

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

  const rowErrorsForRow = editState.isEditing && editState.rowErrorsForRow != null
    ? editState.rowErrorsForRow
    : null;
  const isEditing = editState.isEditing;
  const hasRowErr = rowErrorsForRow ? Object.keys(rowErrorsForRow).length > 0 : false;
  const isRowSelected = selected || isSelected;

  const isRTL = direction === DIRECTION_RTL;
  const rowSxWithError = useMemo(() => {
    if (!hasRowErr || !rowSx) return rowSx;
    const arr = Array.isArray(rowSx) ? [...rowSx] : [rowSx];
    // RTL: border on right, LTR: border on left
    arr.push({
      [isRTL ? 'borderRight' : 'borderLeft']: '3px solid',
      [isRTL ? 'borderRightColor' : 'borderLeftColor']: 'error.light',
    });
    return arr;
  }, [hasRowErr, rowSx, isRTL]);

  // Memoize errorMessages per column field to prevent unnecessary GridCell rerenders
  const errorMessagesMap = useMemo(() => {
    const map = new Map();
    if (!rowErrorsForRow) return map;
    columns.forEach((col) => {
      const cellErrors = rowErrorsForRow[col.field];
      if (cellErrors != null) {
        const cellErrorsArr = Array.isArray(cellErrors) ? cellErrors : [];
        if (cellErrorsArr.length > 0) {
          map.set(col.field, cellErrorsArr.map((e) => e.message).filter(Boolean));
        }
      }
    });
    return map;
  }, [rowErrorsForRow, columns]);

  return (
    <TableRow
      hover={false}
      selected={isRowSelected}
      sx={rowSxWithError}
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
        const editValues = editState.editValues ?? EMPTY_EDIT_VALUES;
        const errorMessages = errorMessagesMap.get(col.field) ?? EMPTY_ERROR_MESSAGES;
        const hasError = errorMessages.length > 0;
        return (
          <GridCell
            key={col.field}
            value={isEditing && editValues[col.field] !== undefined ? editValues[col.field] : row[col.field]}
            row={row}
            column={col}
            isEditing={isEditing && colEditable}
            editor={isEditing && colEditable ? getEditor(col, row, editValues) : null}
            hasError={hasError}
            errorMessages={errorMessages}
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
