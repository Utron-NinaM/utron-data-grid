import React, { useContext, useMemo } from 'react';
import { useSyncExternalStore } from 'react';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { DataGridStableContext } from '../DataGrid/DataGridContext';
import { GridBodyContent } from './GridBodyContent';
import { ALIGN_CENTER } from '../config/schema';

/**
 * Body layer: single subscription point for editStore and selectionStore.
 * Derives snapshot and error map for the editing row; renders TableBody wrapping GridBodyContent.
 */
export function GridBody({
  rows,
  columns,
  getRowId,
  selection,
  mergedRowStylesMap,
  rowStylesMap,
  selectedRowStyle,
  disableRowHover,
  multiSelectable,
  onSelectRow,
  getEditor,
  direction,
  onClick,
  onDoubleClick,
  noRowsMessage,
  colSpan,
}) {
  const ctx = useContext(DataGridStableContext);
  const selectionStore = ctx?.selectionStore;
  const editStore = ctx?.editStore;

  const selectedRowId = useSyncExternalStore(
    selectionStore?.subscribe ?? (() => () => {}),
    () => selectionStore?.getSnapshot?.() ?? null,
    () => null
  );

  const editSnapshot = useSyncExternalStore(
    editStore?.subscribe ?? (() => () => {}),
    () => editStore?.getSnapshot?.() ?? null,
    () => null
  );

  const editRowId = editSnapshot?.editRowId ?? null;
  const editStateForRow = editSnapshot?.editStateForRow ?? null;
  const editMode = editSnapshot?.mode ?? null;

  const { editingRowErrorMessagesMap, hasRowLevelError } = useMemo(() => {
    const map = new Map();
    if (!editStateForRow?.rowErrorsForRow || !columns) {
      return { editingRowErrorMessagesMap: map, hasRowLevelError: false };
    }
    const rowErrorsForRow = editStateForRow.rowErrorsForRow;
    columns.forEach((col) => {
      const cellErrors = rowErrorsForRow[col.field];
      if (cellErrors != null) {
        const arr = Array.isArray(cellErrors) ? cellErrors : [];
        if (arr.length > 0) {
          map.set(col.field, arr.map((e) => e.message).filter(Boolean));
        }
      }
    });
    const rowLevel = rowErrorsForRow[null];
    const hasRowLevelError =
      rowLevel != null && Array.isArray(rowLevel) && rowLevel.length > 0;
    return { editingRowErrorMessagesMap: map, hasRowLevelError };
  }, [editStateForRow?.rowErrorsForRow, columns]);

  if (rows.length === 0) {
    return (
      <TableBody onClick={onClick} onDoubleClick={onDoubleClick}>
        <TableRow>
          <TableCell colSpan={colSpan} align={ALIGN_CENTER}>
            {noRowsMessage}
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  return (
    <TableBody onClick={onClick} onDoubleClick={onDoubleClick}>
      <GridBodyContent
        rows={rows}
        getRowId={getRowId}
        columns={columns}
        selection={selection}
        selectedRowId={selectedRowId}
        editRowId={editRowId}
        editStateForRow={editStateForRow}
        editMode={editMode}
        editingRowErrorMessagesMap={editingRowErrorMessagesMap}
        hasRowLevelError={hasRowLevelError}
        mergedRowStylesMap={mergedRowStylesMap}
        rowStylesMap={rowStylesMap}
        selectedRowStyle={selectedRowStyle}
        disableRowHover={disableRowHover}
        multiSelectable={multiSelectable}
        onSelectRow={onSelectRow}
        getEditor={getEditor}
        direction={direction}
      />
    </TableBody>
  );
}
