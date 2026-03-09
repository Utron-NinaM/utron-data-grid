import React from 'react';
import { GridBodyRow } from './GridBodyRow';
import { DIRECTION_RTL } from '../config/schema';

const EMPTY_EDIT_VALUES = {};
const EMPTY_ERROR_MAP = new Map();

/**
 * Stateless body content: maps the given slice of rows to GridBodyRow with derived props only.
 * Parent controls which rows are rendered via visibleRows. No store subscriptions.
 *
 * @param {Object} props
 * @param {Object[]} props.visibleRows - Slice of rows to render (parent-controlled; may be full list or virtual window)
 * @param {Function} props.getRowId
 * @param {import('../config/schema').ColumnDef[]} props.columns
 * @param {Set<string|number>} [props.selection]
 * @param {string|number|null} [props.selectedRowId] From selectionStore
 * @param {string|number|null} [props.editRowId]
 * @param {{ isEditing: boolean, editValues?: Object, rowErrorsForRow?: Object }|null} [props.editStateForRow]
 * @param {string|null} [props.editMode] 'create' | 'update'
 * @param {Map<string, string[]>} [props.editingRowErrorMessagesMap] For the editing row only
 * @param {boolean} [props.hasRowLevelError] For the editing row
 * @param {Map<string|number, Array>} [props.mergedRowStylesMap] rowId -> rowSx array
 * @param {Map<string|number, Object>} [props.rowStylesMap] rowId -> rowStyle
 * @param {Object} [props.selectedRowStyle]
 * @param {boolean} [props.disableRowHover]
 * @param {boolean} [props.multiSelectable]
 * @param {Function} [props.onSelectRow]
 * @param {Function} [props.getEditor]
 * @param {string} [props.direction]
 */
export function GridBodyContent({
  visibleRows,
  getRowId,
  columns,
  selection,
  selectedRowId,
  editRowId,
  editStateForRow,
  editMode,
  editingRowErrorMessagesMap = EMPTY_ERROR_MAP,
  hasRowLevelError = false,
  mergedRowStylesMap,
  rowStylesMap,
  selectedRowStyle,
  disableRowHover,
  multiSelectable,
  onSelectRow,
  getEditor,
  direction = 'ltr',
}) {
  const isRTL = direction === DIRECTION_RTL;
  const rowLevelErrorSx = {
    [isRTL ? 'borderRight' : 'borderLeft']: '3px solid',
    [isRTL ? 'borderRightColor' : 'borderLeftColor']: 'error.light',
  };

  return (
    <>
      {visibleRows.map((row) => {
        const rowId = getRowId(row);
        const selected = selection?.has(rowId) ?? false;
        const isRowSelected = selected || (selectedRowId != null && String(selectedRowId) === String(rowId));
        const isEditing = editRowId != null && String(editRowId) === String(rowId);
        const editValues = isEditing && editStateForRow?.editValues != null ? editStateForRow.editValues : EMPTY_EDIT_VALUES;
        const errorMessagesMap = isEditing ? editingRowErrorMessagesMap : EMPTY_ERROR_MAP;

        let rowSx = mergedRowStylesMap?.get(rowId);
        if (isEditing && hasRowLevelError && rowSx != null) {
          const arr = Array.isArray(rowSx) ? [...rowSx] : [rowSx];
          arr.push(rowLevelErrorSx);
          rowSx = arr;
        }

        return (
          <GridBodyRow
            key={rowId}
            row={row}
            rowId={rowId}
            selected={selected}
            isRowSelected={isRowSelected}
            onSelectRow={onSelectRow}
            rowSx={rowSx}
            rowStyle={rowStylesMap?.get(rowId)}
            selectedRowStyle={selectedRowStyle}
            disableRowHover={disableRowHover}
            columns={columns}
            multiSelectable={multiSelectable}
            getEditor={getEditor}
            isEditing={isEditing}
            editValues={editValues}
            editMode={isEditing ? editMode : null}
            errorMessagesMap={errorMessagesMap}
          />
        );
      })}
    </>
  );
}
