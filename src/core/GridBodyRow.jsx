import React, { useRef, memo, useCallback, useMemo } from 'react';
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
  
  // Use refs for callbacks to avoid comparing them in memo (they may change but handlers stay stable)
  const onRowClickRef = useRef(onRowClick);
  onRowClickRef.current = onRowClick;
  
  const onRowDoubleClickRef = useRef(onRowDoubleClick);
  onRowDoubleClickRef.current = onRowDoubleClick;
  
  const rowRef = useRef(row);
  rowRef.current = row;
  
  const handleClick = useCallback(() => {
    if (onRowClickRef.current) onRowClickRef.current(rowRef.current);
  }, []);
  
  const handleDoubleClick = useCallback(() => {
    if (onRowDoubleClickRef.current) onRowDoubleClickRef.current(rowRef.current);
  }, []);
  
  const computedRowSx = useMemo(() => {
    return columns.reduce(
      (acc, col) =>
        typeof col.rowStyle === 'function' ? { ...acc, ...col.rowStyle(row) } : acc,
      {}
    );
  }, [columns, row]);
  
  const finalRowSx = rowSx || (Object.keys(computedRowSx).length ? computedRowSx : undefined);
  
  const mergedSx = useMemo(() => [
    finalRowSx,
    {
      '&.Mui-selected': {
        ...selectedRowStyle,
      },
      '&.Mui-selected:hover': {
        ...selectedRowStyle,
      },      
    },
  ], [finalRowSx, selectedRowStyle]);
  
  const renderCount = useRef(0);
  renderCount.current++;
  if (renderCount.current <= 3 || renderCount.current % 10 === 0) {
    console.log('[GridBodyRow]', rowId, 'rendered (#', renderCount.current, ') - isSelected:', isSelected, 'selected:', selected, 'isEditing:', isEditing);
  }

  return (
    <TableRow
      hover
      selected={isRowSelected}
      sx={mergedSx}
      onClick={onRowClick ? handleClick : undefined}
      onDoubleClick={onRowDoubleClick ? handleDoubleClick : undefined}
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

// Helper function for shallow object comparison
function shallowEqualObjects(obj1, obj2) {
  if (obj1 === obj2) return true;
  if (!obj1 || !obj2) return false;
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return obj1 === obj2;
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) return false;
  }
  return true;
}

// Memoized component - no context usage, so React.memo can properly prevent rerenders
const MemoizedGridBodyRow = memo(GridBodyRowComponent, (prevProps, nextProps) => {
  // Compare all props (skip onRowClick and onRowDoubleClick - they're in refs)
  if (prevProps.rowId !== nextProps.rowId) return false;
  if (prevProps.selected !== nextProps.selected) return false;
  if (prevProps.isSelected !== nextProps.isSelected) return false;
  if (prevProps.editRowId !== nextProps.editRowId) return false;
  if (prevProps.editValues !== nextProps.editValues) return false;
  if (prevProps.validationErrors !== nextProps.validationErrors) return false;
  if (prevProps.rowSx !== nextProps.rowSx) return false;
  if (prevProps.onSelect !== nextProps.onSelect) return false;
  if (prevProps.columns !== nextProps.columns) return false;
  if (prevProps.multiSelectable !== nextProps.multiSelectable) return false;
  if (prevProps.getEditor !== nextProps.getEditor) return false;
  if (!shallowEqualObjects(prevProps.selectedRowStyle, nextProps.selectedRowStyle)) return false;
  if (prevProps.row !== nextProps.row) return false;
  // Skip onRowClick and onRowDoubleClick - they're stored in refs, handlers always use latest via refs
  
  // Debug: Log what changed when props differ (only for same rowId to avoid spam)
  if (prevProps.rowId === nextProps.rowId) {
    const changed = [];
    if (prevProps.selected !== nextProps.selected) changed.push('selected');
    if (prevProps.isSelected !== nextProps.isSelected) changed.push('isSelected');
    if (prevProps.editRowId !== nextProps.editRowId) changed.push('editRowId');
    if (prevProps.editValues !== nextProps.editValues) changed.push('editValues');
    if (prevProps.validationErrors !== nextProps.validationErrors) changed.push('validationErrors');
    if (prevProps.rowSx !== nextProps.rowSx) changed.push('rowSx');
    if (prevProps.onSelect !== nextProps.onSelect) changed.push('onSelect');
    if (prevProps.columns !== nextProps.columns) changed.push('columns');
    if (prevProps.multiSelectable !== nextProps.multiSelectable) changed.push('multiSelectable');
    if (prevProps.getEditor !== nextProps.getEditor) changed.push('getEditor');
    if (!shallowEqualObjects(prevProps.selectedRowStyle, nextProps.selectedRowStyle)) changed.push('selectedRowStyle');
    if (prevProps.row !== nextProps.row) changed.push('row');
    
    if (changed.length > 0) {
      console.log(`[GridBodyRow] ${nextProps.rowId} ⚠️ Props changed, allowing rerender:`, changed);
      return false; // Props changed, allow rerender
    }
  }
  
  // All props are the same, prevent rerender
  return true;
});

// Export the memoized component directly - context values are passed as props from GridTable
export const GridBodyRow = MemoizedGridBodyRow;
