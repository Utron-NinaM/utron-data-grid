import React, { memo } from 'react';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Checkbox from '@mui/material/Checkbox';
import { GridCell } from './GridCell';

// Valid React/CSS style keys we can safely apply from selectedRowStyle to the row's style prop
const SELECTED_ROW_STYLE_KEYS = ['backgroundColor', 'color', 'fontSize', 'fontSize', 'fontWeight', 'fontFamily',
  'fontStyle', 'textDecoration', 'textTransform', 'textOverflow', 'whiteSpace', 'wordBreak', 'wordWrap', 'wordSpacing',
];

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
 * @param {Object} [props.selectedRowStyle] MUI sx for selected row; when set, applied inline so it wins over MUI default (no flash)
 * @param {boolean} [props.disableRowHover] When true, TableRow hover is disabled
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
  selectedRowStyle,
  disableRowHover = false,
  columns,
  multiSelectable,
  getEditor,
}) {
  const isEditing = editRowId === rowId;
  const isRowSelected = selected || isSelected;

  const selectedInlineStyle =
    isRowSelected &&
      selectedRowStyle &&
      Object.keys(selectedRowStyle).length > 0
      ? SELECTED_ROW_STYLE_KEYS.reduce((acc, key) => {
        if (selectedRowStyle[key] != null) acc[key] = selectedRowStyle[key];
        return acc;
      }, {})
      : undefined;

  // Hover is driven by sx (rowSx) from GridTable; TableRow hover={true} would inject styles that override our sx, so keep it false.
  return (
    <TableRow
      hover={false}
      selected={isRowSelected}
      sx={rowSx}
      style={selectedInlineStyle}
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
