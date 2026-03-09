import React, { memo, useContext, useMemo, useEffect, useRef } from 'react';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Checkbox from '@mui/material/Checkbox';
import { useTheme } from '@mui/material/styles';
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
 * @param {boolean} props.isRowSelected - Visual selection highlight (multi or single)
 * @param {Function} props.onSelectRow Stable callback: (rowId, checked) => void
 * @param {Array} [props.rowSx] Pre-computed row styles (including error border when applicable)
 * @param {Object} [props.rowStyle] Row-specific sx for cells
 * @param {Object} [props.selectedRowStyle] MUI sx for selected row
 * @param {boolean} [props.disableRowHover]
 * @param {Array} props.columns
 * @param {boolean} props.multiSelectable
 * @param {Function} props.getEditor
 * @param {boolean} [props.isEditing]
 * @param {Object} [props.editValues]
 * @param {string|null} [props.editMode] 'create' | 'update'
 * @param {Map<string, string[]>} [props.errorMessagesMap] Field -> error messages for this row
 */
function GridBodyRowComponent({
  row,
  rowId,
  selected,
  isRowSelected,
  onSelectRow,
  rowSx,
  rowStyle,
  selectedRowStyle,
  disableRowHover = false,
  columns,
  multiSelectable,
  getEditor,
  isEditing = false,
  editValues = EMPTY_EDIT_VALUES,
  editMode = null,
  errorMessagesMap = new Map(),
}) {
  const theme = useTheme();
  const rowRef = useRef(null);

  // Checkbox cell sx: same precedence as GridCell (row style then selected)
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
      requestAnimationFrame(() => {
        const rowElement = rowRef.current;
        if (!rowElement) return;
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
      sx={rowSx}
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
            isSelected={isRowSelected}
            selectedRowStyle={selectedRowStyle}
          />
        );
      })}
    </TableRow>
  );
}

export const GridBodyRow = memo(GridBodyRowComponent);
