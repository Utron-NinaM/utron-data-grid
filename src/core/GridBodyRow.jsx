import React, { memo, useCallback, useMemo, useEffect, useRef } from 'react';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Checkbox from '@mui/material/Checkbox';
import { DataGridStableContext } from '../DataGrid/DataGridContext';
import { GridCell } from './GridCell';
import { HEADER_CELL_PADDING_PX, CHECKBOX_COLUMN_WIDTH_PX } from '../constants';

// Stable constants to prevent unnecessary rerenders when there are no errors/values
const EMPTY_ERROR_MESSAGES = [];
const EMPTY_EDIT_VALUES = {};

/**
 * Presentational body row. Receives already-derived props; no store subscriptions.
 *
 * @param {Object} props
 * @param {Object} props.row
 * @param {string|number} props.rowId
 * @param {boolean} props.selected - Checkbox selected (multi-select)
 * @param {Function} props.onSelectRow Stable callback: (rowId, checked) => void
 * @param {Array} [props.rowSx] Pre-computed row styles (including error border when applicable)
 * @param {Object} [props.rowStyle] Row-specific sx for cells
 * @param {boolean} [props.disableRowHover]
 * @param {Array} props.columns
 * @param {boolean} props.multiSelectable
 * @param {Function} props.getEditor
 * @param {boolean} [props.isEditing]
 * @param {Object} [props.editValues]
 * @param {string|null} [props.editMode] 'create' | 'update'
 * @param {Map<string, string[]>} [props.errorMessagesMap] Field -> error messages for this row
 * @param {boolean} [props.cellsOnly] When true, render only cell content (no outer TableRow); for use inside virtual table row wrapper
 */
function GridBodyRowComponent({
  row,
  rowId,
  selected,
  onSelectRow,
  rowSx,
  rowStyle,
  disableRowHover = false,
  columns,
  multiSelectable,
  getEditor,
  isEditing = false,
  editValues = EMPTY_EDIT_VALUES,
  editMode = null,
  errorMessagesMap = new Map(),
  cellsOnly = false,
}) {
  const rowRef = useRef(null);

  // Checkbox cell sx: row style only (selection highlight applied via SelectionStyleApplicator CSS)
  const checkboxCellSx = useMemo(() => ({
    ...(rowStyle ?? {}),
    boxSizing: 'border-box',
    width: `${CHECKBOX_COLUMN_WIDTH_PX}px`,
    minWidth: `${CHECKBOX_COLUMN_WIDTH_PX}px`,
    padding: '0 !important',
    paddingLeft: `${HEADER_CELL_PADDING_PX}px !important`,
    paddingRight: `${HEADER_CELL_PADDING_PX}px !important`,
    paddingInlineStart: `${HEADER_CELL_PADDING_PX}px !important`,
    paddingInlineEnd: `${HEADER_CELL_PADDING_PX}px !important`,
  }), [rowStyle]);

  // Focus first editable cell when entering edit mode
  useEffect(() => {
    if (isEditing && rowRef.current) {
      requestAnimationFrame(() => {
        const rowElement = rowRef.current;
        if (!rowElement) return;
        const firstInput = rowElement.querySelector('input:not([type="checkbox"]), textarea, [role="combobox"] input');
        if (firstInput) {
          firstInput.focus();
        }
      });
    }
  }, [cellsOnly, isEditing]);

  const cells = (
    <>
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
        const colEditable = editMode === 'create'
          ? (col.editable === true || col.addable === true)
          : (col.editable === true);
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
          />
        );
      })}
    </>
  );

  if (cellsOnly) return cells;

  return (
    <TableRow
      ref={rowRef}
      hover={false}
      sx={rowSx}
      data-row-id={rowId}
    >
      {cells}
    </TableRow>
  );
}

export const GridBodyRow = memo(GridBodyRowComponent);
