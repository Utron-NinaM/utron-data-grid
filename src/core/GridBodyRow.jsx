import React, { memo, useContext, useMemo, useEffect, useRef } from 'react';
import { useSyncExternalStore } from 'react';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Checkbox from '@mui/material/Checkbox';
import { useTheme } from '@mui/material/styles';
import { DataGridStableContext } from '../DataGrid/DataGridContext';
import { NOT_EDITING } from '../DataGrid/editStore';
import { GridCell } from './GridCell';
import { DIRECTION_RTL, DIRECTION_LTR } from '../config/schema';
import { HEADER_CELL_PADDING_PX, CHECKBOX_COLUMN_WIDTH_PX } from '../constants';

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
  const theme = useTheme();
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

  // Get edit mode from editStore
  const editMode = useSyncExternalStore(
    editStore?.subscribe ?? (() => () => {}),
    () => {
      const s = editStore?.getSnapshot?.();
      if (!s || s.editRowId !== rowId) return null;
      return s.mode ?? null;
    },
    () => null
  );

  // Get originalRow from editStore
  const originalRow = useSyncExternalStore(
    editStore?.subscribe ?? (() => () => {}),
    () => {
      const s = editStore?.getSnapshot?.();
      if (!s || s.editRowId !== rowId) return null;
      return s.originalRow ?? null;
    },
    () => null
  );

  const rowErrorsForRow = editState.isEditing && editState.rowErrorsForRow != null
    ? editState.rowErrorsForRow
    : null;
  const isEditing = editState.isEditing;
  const rowRef = useRef(null);
  // Check specifically for row-level errors (stored under null key)
  const hasRowLevelErr = rowErrorsForRow?.[null] != null && Array.isArray(rowErrorsForRow[null]) && rowErrorsForRow[null].length > 0;
  const isRowSelected = selected || isSelected;

  const isRTL = direction === DIRECTION_RTL;
  const rowSxWithError = useMemo(() => {
    // Apply red border to entire row when row-level errors exist
    if (!hasRowLevelErr || !rowSx) return rowSx;
    const arr = Array.isArray(rowSx) ? [...rowSx] : [rowSx];
    // RTL: border on right, LTR: border on left
    arr.push({
      [isRTL ? 'borderRight' : 'borderLeft']: '3px solid',
      [isRTL ? 'borderRightColor' : 'borderLeftColor']: 'error.light',
    });
    return arr;
  }, [hasRowLevelErr, rowSx, isRTL]);

  // Memoize errorMessages per column field to prevent unnecessary GridCell rerenders
  // Exclude row-level errors (field: null) from cell-level error display
  const errorMessagesMap = useMemo(() => {
    const map = new Map();
    if (!rowErrorsForRow) return map;
    columns.forEach((col) => {
      // Skip null field (row-level errors) - they're displayed at row level, not cell level
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

  // Checkbox cell sx: same precedence as GridCell (row style then selected). Minimum padding so cell looks correct when app theme overrides MuiTableCell-paddingCheck.
  const checkboxCellSx = useMemo(() => {
    const hasCustomSelected = selectedRowStyle && Object.keys(selectedRowStyle).length > 0;
    const appliedSelectedStyle = isRowSelected
      ? (hasCustomSelected ? selectedRowStyle : { backgroundColor: theme.palette.action.selected })
      : {};
    return {
      ...(rowStyle ?? {}),
      ...appliedSelectedStyle,
      boxSizing: 'border-box',
      width: `${CHECKBOX_COLUMN_WIDTH_PX}px`,
      minWidth: `${CHECKBOX_COLUMN_WIDTH_PX}px`,
      padding: '0 !important',
      paddingLeft: `${HEADER_CELL_PADDING_PX}px !important`,
      paddingRight: `${HEADER_CELL_PADDING_PX}px !important`,
      paddingInlineStart: `${HEADER_CELL_PADDING_PX}px !important`,
      paddingInlineEnd: `${HEADER_CELL_PADDING_PX}px !important`,
    };
  }, [rowStyle, isRowSelected, selectedRowStyle, theme]);

  // Focus first editable cell when entering edit mode
  useEffect(() => {
    if (isEditing && rowRef.current) {
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        const rowElement = rowRef.current;
        if (!rowElement) return;
        // Find first editable input/textarea in the row
        const firstInput = rowElement.querySelector('input:not([type="checkbox"]), textarea, [role="combobox"] input');
        if (firstInput) {
          firstInput.focus();
        }
      });
    }
  }, [isEditing]);

  return (
    <TableRow
      ref={rowRef}
      hover={false}
      selected={isRowSelected}
      sx={rowSxWithError}
      data-row-id={rowId}
    >
      {multiSelectable && (
        <TableCell padding="checkbox" sx={checkboxCellSx}>
          <Checkbox
            checked={selected}
            onChange={(e) => onSelectRow(rowId, e.target.checked)}
            inputProps={{ 'aria-label': 'Select row' }}
            sx={{ '&:hover': { backgroundColor: 'transparent' } }}
          />
        </TableCell>
      )}
      {columns.map((col) => {
        // Determine if column is editable based on editMode
        // For create mode: editable if editable === true OR addable === true
        // For update mode: editable if editable === true
        const colEditable = editMode === 'create' 
          ? (col.editable === true || col.addable === true)
          : (col.editable === true);
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
