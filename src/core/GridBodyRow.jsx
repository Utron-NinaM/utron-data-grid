import React, { useRef, useContext } from 'react';
import { TableRow, TableCell, Checkbox } from '@mui/material';
import { DataGridContext } from '../DataGrid/DataGridContext';
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
  validationErrors,
  onRowClick,
  onRowDoubleClick,
  selectedRowId,
  rowSx,
}) {
  const ctx = useContext(DataGridContext);
  const { 
    columns, 
    multiSelectable, 
    getEditor, 
    selectedRowStyle,
  } = ctx;
  const isEditing = editRowId === rowId;
  const isSelected = selectedRowId === rowId;
  const isRowSelected = selected || isSelected;
  const mergedSx = [
    rowSx,
    {
      '&.Mui-selected': {
        ...selectedRowStyle,
      },
      '&.Mui-selected:hover': {
        ...selectedRowStyle,
      },      
    },
  ];
  
  const renderCount = useRef(0);
  renderCount.current++;
  console.log('GridBodyRow',rowId, 'render count:', renderCount.current);

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
