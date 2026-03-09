import React, { useContext, useMemo, useCallback } from 'react';
import { useSyncExternalStore } from 'react';
import { TableVirtuoso } from 'react-virtuoso';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import { DataGridStableContext } from '../DataGrid/DataGridContext';
import { GridBodyRow } from './GridBodyRow';
import { DIRECTION_RTL } from '../config/schema';
import { getTableSx, getBodyRowHeightSx } from './coreStyles';
import { CHECKBOX_COLUMN_WIDTH_PX } from '../constants';

const EMPTY_EDIT_VALUES = {};
const EMPTY_ERROR_MAP = new Map();

/**
 * Virtualized table body using TableVirtuoso when containScroll is true.
 * Uses customScrollParent so the existing scroll container Box is the scroller.
 * Renders same row content as GridBodyContent via GridBodyRow (cellsOnly).
 */
export function GridTableBodyVirtuoso({
  rows,
  columns,
  getRowId,
  rowHeight,
  multiSelectable,
  selection,
  mergedRowStylesMap,
  rowStylesMap,
  selectedRowStyle,
  disableRowHover,
  onSelectRow,
  getEditor,
  direction,
  onClick,
  onDoubleClick,
  scrollContainerRef,
  scrollContainerReady,
  enableHorizontalScroll,
  totalWidth,
  bodyColRefs,
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

  const isRTL = direction === DIRECTION_RTL;
  const rowLevelErrorSx = useMemo(
    () => ({
      [isRTL ? 'borderRight' : 'borderLeft']: '3px solid',
      [isRTL ? 'borderRightColor' : 'borderLeftColor']: 'error.light',
    }),
    [isRTL]
  );

  const getRowProps = useCallback(
    (index) => {
      const row = rows[index];
      if (!row) return null;
      const rowId = getRowId(row);
      const selected = selection?.has(rowId) ?? false;
      const isRowSelected =
        selected || (selectedRowId != null && String(selectedRowId) === String(rowId));
      const isEditing = editRowId != null && String(editRowId) === String(rowId);
      const editValues =
        isEditing && editStateForRow?.editValues != null
          ? editStateForRow.editValues
          : EMPTY_EDIT_VALUES;
      const errorMessagesMap = isEditing ? editingRowErrorMessagesMap : EMPTY_ERROR_MAP;

      let rowSx = mergedRowStylesMap?.get(rowId);
      if (isEditing && hasRowLevelError && rowSx != null) {
        const arr = Array.isArray(rowSx) ? [...rowSx] : [rowSx];
        arr.push(rowLevelErrorSx);
        rowSx = arr;
      }

      return {
        row,
        rowId,
        selected,
        isRowSelected,
        isEditing,
        editValues,
        editMode: isEditing ? editMode : null,
        errorMessagesMap,
        rowSx,
        rowStyle: rowStylesMap?.get(rowId),
      };
    },
    [
      rows,
      getRowId,
      selection,
      selectedRowId,
      editRowId,
      editStateForRow,
      editMode,
      editingRowErrorMessagesMap,
      hasRowLevelError,
      mergedRowStylesMap,
      rowStylesMap,
      rowLevelErrorSx,
    ]
  );

  const itemContent = useCallback(
    (index) => {
      const props = getRowProps(index);
      if (!props) return null;
      return (
        <GridBodyRow
          cellsOnly
          row={props.row}
          rowId={props.rowId}
          selected={props.selected}
          isRowSelected={props.isRowSelected}
          onSelectRow={onSelectRow}
          rowSx={props.rowSx}
          rowStyle={props.rowStyle}
          selectedRowStyle={selectedRowStyle}
          disableRowHover={disableRowHover}
          columns={columns}
          multiSelectable={multiSelectable}
          getEditor={getEditor}
          isEditing={props.isEditing}
          editValues={props.editValues}
          editMode={props.editMode}
          errorMessagesMap={props.errorMessagesMap}
        />
      );
    },
    [
      getRowProps,
      onSelectRow,
      selectedRowStyle,
      disableRowHover,
      columns,
      multiSelectable,
      getEditor,
    ]
  );

  const components = useMemo(() => {
    const bodyRowHeightSx = getBodyRowHeightSx(rowHeight);
    return {
      Table: ({ style, ...rest }) => (
        <Table
          size="small"
          aria-label="Data grid body"
          sx={{ ...getTableSx(totalWidth, enableHorizontalScroll), ...style }}
          {...rest}
        >
          <colgroup>
            {multiSelectable && (
              <col
                style={{
                  width: `${CHECKBOX_COLUMN_WIDTH_PX}px`,
                  minWidth: `${CHECKBOX_COLUMN_WIDTH_PX}px`,
                }}
              />
            )}
            {columns.map((col) => (
              <col
                key={col.field}
                data-field={col.field}
                ref={(el) => {
                  if (el) bodyColRefs?.current?.set(col.field, el);
                  else bodyColRefs?.current?.delete(col.field);
                }}
              />
            ))}
          </colgroup>
          {rest.children}
        </Table>
      ),
      TableBody: React.forwardRef(({ style, ...rest }, ref) => (
        <TableBody
          ref={ref}
          onClick={onClick}
          onDoubleClick={onDoubleClick}
          sx={style}
          {...rest}
        />
      )),
      TableRow: ({ item, children, ...rest }) => {
        const index = rest['data-item-index'] ?? item?.index ?? 0;        
        const props = getRowProps(index);
        if (!props) return <TableRow {...rest}>{children}</TableRow>;
        const rowSxArr = [bodyRowHeightSx, props.rowSx].filter(Boolean).flat();
        const rowSx =
          rowSxArr.length > 0
            ? Object.assign({}, ...rowSxArr)
            : undefined;
        return (
          <TableRow
            component="tr"
            hover={false}
            selected={props.isRowSelected}
            sx={rowSx}
            data-row-id={props.rowId}
            {...rest}
          >
            {children}
          </TableRow>
        );
      },
    };
  }, [
    rowHeight,
    enableHorizontalScroll,
    totalWidth,
    multiSelectable,
    columns,
    bodyColRefs,
    onClick,
    onDoubleClick,
    getRowProps,
  ]);

  if (!scrollContainerReady || !scrollContainerRef?.current) {
    return null;
  }

  return (
    <TableVirtuoso
      customScrollParent={scrollContainerRef.current}
      totalCount={rows.length}
      defaultItemHeight={rowHeight}
      increaseViewportBy={{ top: 200, bottom: 200 }}
      itemContent={itemContent}
      components={components}
    />
  );
}
