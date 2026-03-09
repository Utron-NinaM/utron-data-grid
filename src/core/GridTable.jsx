import React, { memo, useContext, useMemo, useRef, useEffect, useState, useLayoutEffect, useSyncExternalStore } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useTranslations } from '../localization/useTranslations';
import { DataGridStableContext, DataGridFilterContext, ScrollContainerContext } from '../DataGrid/DataGridContext';
import { GridHeaderCell } from './GridHeaderCell';
import { GridHeaderCellFilter } from './GridHeaderCellFilter';
import { GridBodyRow } from './GridBodyRow';
import { GridToolbarSubscriber } from './GridToolbarSubscriber';
import { GridErrorBoundary } from './GridErrorBoundary';
import { useVirtualWindow } from './useVirtualWindow';
import { ALIGN_CENTER } from '../config/schema';
import { BODY_ROW_HEIGHT, CHECKBOX_COLUMN_WIDTH_PX } from '../constants';
import {
  getToolbarBoxSx,
  toolbarActionsBoxSx,
  getTableContainerSx,
  getTableSx,
  getTableHeadSx,
  getMainHeaderRowSx,
  getHeaderCheckboxCellSx,
  getFilterRowSx,
  getHeaderScrollWrapperSx,
  scrollContainerSx,
  getScrollInnerBoxSx,
  getBodyRowHeightSx,
} from './coreStyles';

function ScrollSeekPlaceholderRows({ count, colSpanAll, rowHeightPx }) {
  const rows = [];

  for (let i = 0; i < count; i += 1) {
    rows.push(
      <TableRow key={`scroll-seek-${i}`} hover={false}>
        <TableCell
          colSpan={colSpanAll}
          sx={{
            height: `${rowHeightPx}px`,
            minHeight: `${rowHeightPx}px`,
            maxHeight: `${rowHeightPx}px`,
            py: 0,
            px: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.paper',
          }}
        >
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Box
              sx={{
                width: '100%',
                height: 10,
                borderRadius: 1,
                backgroundColor: 'action.hover',
                opacity: 0.85,
              }}
            />
          </Box>
        </TableCell>
      </TableRow>
    );
  }

  return rows;
}

/**
 * @param {Object} props
 * @param {Object[]} props.rows
 * @param {Set<string|number>} props.selection
 * @param {Function} props.onSelect
 * @param {Array<{ field: string, order: string }>} props.sortModel
 * @param {Function} props.onSort
 * @param {boolean} [props.hasActiveFilters]
 * @param {Function} [props.onRowDoubleClick]
 * @param {boolean} [props.hasActiveRangeFilter]
 * @param {boolean} [props.containScroll]
 */
function GridTableInner({
  rows,
  selection,
  onSelect,
  sortModel,
  onSort,
  hasActiveFilters,
  onRowDoubleClick,
  hasActiveRangeFilter,
  containScroll = false,
}) {
  const translations = useTranslations();
  const ctx = useContext(DataGridStableContext);
  const filterCtx = useContext(DataGridFilterContext);

  const {
    columns,
    getRowId,
    multiSelectable,
    filters,
    onClearSort,
    onClearAllFilters,
    onClearColumnWidths,
    hasResizedColumns,
    headerConfig,
    getEditor,
    selectedRowStyle,
    disableRowHover,
    rowHoverStyle,
    rowStylesMap,
    sortOrderIndexMap,
    scrollContainerRef: ctxScrollContainerRef,
    setScrollContainerReady: onScrollContainerReadyForLayout,
    colRefs,
    resizingColumnRef,
    totalWidth,
    enableHorizontalScroll,
    showHorizontalScrollbar,
    columnWidthMap,
    toolbarClearButtonsSx,
    direction,
    selectRow,
    bodyRow,
    editable,
    editStore,
    virtualization,
    rowHeightPx: ctxRowHeightPx,
  } = ctx;

  const { getHeaderComboSlot, getFilterInputSlot, getFilterToInputSlot } = filterCtx;
  const sortModelLength = sortModel?.length ?? 0;

  const editRowId = useSyncExternalStore(
    editStore?.subscribe ?? (() => () => {}),
    () => editStore?.getSnapshot?.()?.editRowId ?? null,
    () => null
  );

  const selectionDisabled = Boolean(editable && editRowId != null);

  const bodyColRefs = useRef(new Map());
  const headerScrollRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const tooltipContainerRef = useRef(null);

  const [scrollContainerReady, setScrollContainerReady] = useState(false);
  const [scrollbarWidth, setScrollbarWidth] = useState(0);

  useEffect(() => {
    if (!columnWidthMap || !colRefs) return;

    columns.forEach((col) => {
      if (resizingColumnRef?.current === col.field) return;
      const width = columnWidthMap.get(col.field);
      const widthPx = width != null ? `${width}px` : null;

      const headerCol = colRefs.current?.get(col.field);
      if (headerCol && widthPx) headerCol.style.width = widthPx;

      if (containScroll) {
        const bodyCol = bodyColRefs.current?.get(col.field);
        if (bodyCol && widthPx) bodyCol.style.width = widthPx;
      }
    });
  }, [columns, columnWidthMap, colRefs, resizingColumnRef, containScroll]);

  const handleTableBodyClick = useMemo(() => {
    if (!selectRow) return undefined;

    return (event) => {
      if (selectionDisabled) return;

      const rowElement = event.target.closest('[data-row-id]');
      if (!rowElement) return;

      const rowIdAttr = rowElement.getAttribute('data-row-id');
      const row = rows.find((r) => String(getRowId(r)) === rowIdAttr);
      if (!row) return;

      const rowId = getRowId(row);

      if (multiSelectable && onSelect) {
        const cell = event.target.closest('td');
        if (cell?.cellIndex === 0) return;
        onSelect(rowId, !selection?.has(rowId));
        return;
      }

      selectRow(rowId, row);
    };
  }, [selectRow, rows, getRowId, selectionDisabled, multiSelectable, onSelect, selection]);

  const handleTableBodyDoubleClick = useMemo(() => {
    if (!onRowDoubleClick) return undefined;

    return (event) => {
      if (selectionDisabled) return;

      const rowElement = event.target.closest('[data-row-id]');
      if (!rowElement) return;

      const rowId = rowElement.getAttribute('data-row-id');
      const row = rows.find((r) => String(getRowId(r)) === rowId);

      if (row) onRowDoubleClick(row);
    };
  }, [onRowDoubleClick, rows, getRowId, selectionDisabled]);

  const handleSelectRow = useMemo(() => {
    if (!onSelect) return undefined;

    return (rowId, checked) => {
      if (selectionDisabled) return;
      onSelect(rowId, checked);
    };
  }, [onSelect, selectionDisabled]);

  const measureScrollbarWidth = useMemo(() => () => {
    if (!scrollContainerRef.current) return;
    const el = scrollContainerRef.current;
    setScrollbarWidth(el.offsetWidth - el.clientWidth);
  }, []);

  useLayoutEffect(() => {
    if (!containScroll || !scrollContainerRef.current) return;

    setScrollContainerReady(true);
    measureScrollbarWidth();

    const el = scrollContainerRef.current;
    const ro = new ResizeObserver(measureScrollbarWidth);
    ro.observe(el);

    return () => ro.disconnect();
  }, [containScroll, measureScrollbarWidth]);

  const handleBodyScroll = useMemo(() => {
    if (!containScroll) return undefined;

    return () => {
      if (headerScrollRef.current && scrollContainerRef.current) {
        headerScrollRef.current.scrollLeft = scrollContainerRef.current.scrollLeft;
      }
    };
  }, [containScroll]);

  const rowHeightPx = ctxRowHeightPx ?? BODY_ROW_HEIGHT;

  const virtualWindow = useVirtualWindow({
    scrollContainerRef: ctxScrollContainerRef,
    scrollContainerReady: containScroll ? scrollContainerReady : false,
    rowCount: rows.length,
    rowHeightPx,
    overscan: 12,
  });

  const visibleRows =
    virtualization && containScroll
      ? rows.slice(virtualWindow.startIndex, virtualWindow.endIndex)
      : rows;

  const rowsForStyleMap = visibleRows;

  const mergedRowStylesMap = useMemo(() => {
    const hasCustomHover =
      rowHoverStyle != null &&
      typeof rowHoverStyle === 'object' &&
      !Array.isArray(rowHoverStyle) &&
      Object.keys(rowHoverStyle).length > 0;

    const hoverContent = hasCustomHover ? (rowHoverStyle['&:hover'] ?? rowHoverStyle) : null;

    const hoverBlock =
      disableRowHover
        ? null
        : hasCustomHover && hoverContent != null && Object.keys(hoverContent).length > 0
          ? { '&:hover:not(.Mui-selected) td': hoverContent }
          : (theme) => ({ '&:hover:not(.Mui-selected) td': { backgroundColor: theme.palette.action.hover } });

    const bodyRowHeightSx = getBodyRowHeightSx(bodyRow?.height);
    const map = new Map();

    rowsForStyleMap.forEach((row) => {
      const rowId = getRowId(row);
      const baseRowSx = rowStylesMap?.get(rowId);
      const rowSxArray = [bodyRowHeightSx, baseRowSx, hoverBlock].filter(Boolean);
      map.set(rowId, rowSxArray.length ? rowSxArray : undefined);
    });

    return map;
  }, [rowsForStyleMap, rowStylesMap, disableRowHover, rowHoverStyle, getRowId, bodyRow]);

  const colSpanAll = columns.length + (multiSelectable ? 1 : 0);

  const spacerRowSx = (heightPx) => ({
    height: `${heightPx}px`,
    minHeight: `${heightPx}px`,
    maxHeight: `${heightPx}px`,
    padding: 0,
    lineHeight: 0,
    border: 'none',
    overflow: 'hidden',
    verticalAlign: 'top',
  });

  let bodyRows;

  if (rows.length === 0) {
    bodyRows = (
      <TableRow>
        <TableCell colSpan={colSpanAll} align={ALIGN_CENTER}>
          {translations('noRows')}
        </TableCell>
      </TableRow>
    );
  } else if (virtualization && containScroll) {
    const topHeight = virtualWindow.topSpacerHeight;
    const bottomHeight = virtualWindow.bottomSpacerHeight;
    const shouldUsePlaceholders = virtualWindow.isScrollSeeking;

    bodyRows = (
      <>
        {topHeight > 0 && (
          <TableRow sx={{ ...spacerRowSx(topHeight), visibility: 'hidden' }}>
            <TableCell colSpan={colSpanAll} sx={spacerRowSx(topHeight)} aria-hidden="true" />
          </TableRow>
        )}

        {shouldUsePlaceholders ? (
          <ScrollSeekPlaceholderRows
            count={visibleRows.length}
            colSpanAll={colSpanAll}
            rowHeightPx={rowHeightPx}
          />
        ) : (
          visibleRows.map((row) => {
            const rowId = getRowId(row);

            return (
              <GridBodyRow
                key={rowId}
                row={row}
                rowId={rowId}
                selected={selection?.has(rowId)}
                onSelectRow={handleSelectRow}
                rowSx={mergedRowStylesMap.get(rowId)}
                rowStyle={rowStylesMap?.get(rowId)}
                selectedRowStyle={selectedRowStyle}
                disableRowHover={disableRowHover}
                columns={columns}
                multiSelectable={multiSelectable}
                getEditor={getEditor}
              />
            );
          })
        )}

        {bottomHeight > 0 && (
          <TableRow sx={{ ...spacerRowSx(bottomHeight), visibility: 'hidden' }}>
            <TableCell colSpan={colSpanAll} sx={spacerRowSx(bottomHeight)} aria-hidden="true" />
          </TableRow>
        )}
      </>
    );
  } else {
    bodyRows = rows.map((row) => {
      const rowId = getRowId(row);

      return (
        <GridBodyRow
          key={rowId}
          row={row}
          rowId={rowId}
          selected={selection?.has(rowId)}
          onSelectRow={handleSelectRow}
          rowSx={mergedRowStylesMap.get(rowId)}
          rowStyle={rowStylesMap?.get(rowId)}
          selectedRowStyle={selectedRowStyle}
          disableRowHover={disableRowHover}
          columns={columns}
          multiSelectable={multiSelectable}
          getEditor={getEditor}
        />
      );
    });
  }

  const toolbarBox = (
    <Box sx={getToolbarBoxSx(containScroll)}>
      <Box sx={toolbarActionsBoxSx}>
        <Button
          size="small"
          variant="outlined"
          onClick={onClearSort}
          disabled={sortModelLength === 0}
          {...(toolbarClearButtonsSx && { sx: toolbarClearButtonsSx })}
        >
          {translations('clearSort')}
        </Button>

        {filters !== false && (
          <Button
            size="small"
            variant="outlined"
            onClick={onClearAllFilters}
            disabled={!hasActiveFilters}
            {...(toolbarClearButtonsSx && { sx: toolbarClearButtonsSx })}
          >
            {translations('clearAllFilters')}
          </Button>
        )}

        <Button
          size="small"
          variant="outlined"
          onClick={onClearColumnWidths}
          disabled={!hasResizedColumns}
          {...(toolbarClearButtonsSx && { sx: toolbarClearButtonsSx })}
        >
          {translations('clearColumnWidths')}
        </Button>
      </Box>

      <GridToolbarSubscriber rows={rows} getRowId={getRowId} />
    </Box>
  );

  const tableContent = (
    <GridErrorBoundary>
      <TableContainer
        component={Paper}
        variant="outlined"
        sx={getTableContainerSx(enableHorizontalScroll, totalWidth, { constrainToParent: true })}
      >
        <Table
          size="small"
          stickyHeader={!containScroll}
          aria-label="Data grid"
          sx={getTableSx(totalWidth, enableHorizontalScroll)}
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
                  if (el) colRefs.current.set(col.field, el);
                  else colRefs.current.delete(col.field);
                }}
              />
            ))}
          </colgroup>

          <TableHead sx={getTableHeadSx(containScroll, headerConfig)}>
            <TableRow sx={getMainHeaderRowSx(headerConfig, !!(getFilterInputSlot && getFilterToInputSlot))}>
              {multiSelectable && (
                <TableCell
                  padding="checkbox"
                  variant="head"
                  sx={getHeaderCheckboxCellSx(headerConfig, 'mainRow')}
                />
              )}

              {columns.map((col) => (
                <GridHeaderCell
                  key={col.field}
                  column={col}
                  sortModel={sortModel}
                  onSort={onSort}
                  headerComboSlot={getHeaderComboSlot ? getHeaderComboSlot(col) : null}
                  filterSlot={getFilterInputSlot && !getFilterToInputSlot ? getFilterInputSlot(col, translations, direction) : null}
                  sortOrderIndex={sortOrderIndexMap?.get(col.field)}
                />
              ))}
            </TableRow>

            {getFilterInputSlot && getFilterToInputSlot && (
              <TableRow sx={getFilterRowSx(headerConfig)}>
                {multiSelectable && (
                  <TableCell
                    padding="checkbox"
                    variant="head"
                    sx={getHeaderCheckboxCellSx(headerConfig, 'filterRows')}
                  />
                )}

                {columns.map((col) => (
                  <GridHeaderCellFilter
                    key={col.field}
                    column={col}
                    slot={getFilterInputSlot(col, translations, direction)}
                  />
                ))}
              </TableRow>
            )}

            {getFilterToInputSlot && hasActiveRangeFilter && (
              <TableRow sx={getFilterRowSx(headerConfig)}>
                {multiSelectable && (
                  <TableCell
                    padding="checkbox"
                    variant="head"
                    sx={getHeaderCheckboxCellSx(headerConfig, 'filterRows')}
                  />
                )}

                {columns.map((col) => (
                  <GridHeaderCellFilter
                    key={col.field}
                    column={col}
                    slot={getFilterToInputSlot(col, translations, direction)}
                  />
                ))}
              </TableRow>
            )}
          </TableHead>

          <TableBody
            onClick={handleTableBodyClick}
            onDoubleClick={handleTableBodyDoubleClick}
          >
            {bodyRows}
          </TableBody>
        </Table>
      </TableContainer>
    </GridErrorBoundary>
  );

  if (containScroll) {
    const headerTable = (
      <GridErrorBoundary>
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={getTableContainerSx(enableHorizontalScroll, totalWidth, { noScroll: true })}
        >
          <Table
            size="small"
            aria-label="Data grid header"
            sx={getTableSx(totalWidth, enableHorizontalScroll)}
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
                    if (el) colRefs.current.set(col.field, el);
                    else colRefs.current.delete(col.field);
                  }}
                />
              ))}
            </colgroup>

            <TableHead sx={getTableHeadSx(true, headerConfig)}>
              <TableRow sx={getMainHeaderRowSx(headerConfig, !!(getFilterInputSlot && getFilterToInputSlot))}>
                {multiSelectable && (
                  <TableCell
                    padding="checkbox"
                    variant="head"
                    sx={getHeaderCheckboxCellSx(headerConfig, 'mainRow')}
                  />
                )}

                {columns.map((col) => (
                  <GridHeaderCell
                    key={col.field}
                    column={col}
                    sortModel={sortModel}
                    onSort={onSort}
                    headerComboSlot={getHeaderComboSlot ? getHeaderComboSlot(col) : null}
                    filterSlot={getFilterInputSlot && !getFilterToInputSlot ? getFilterInputSlot(col, translations, direction) : null}
                    sortOrderIndex={sortOrderIndexMap?.get(col.field)}
                  />
                ))}
              </TableRow>

              {getFilterInputSlot && getFilterToInputSlot && (
                <TableRow sx={getFilterRowSx(headerConfig)}>
                  {multiSelectable && (
                    <TableCell
                      padding="checkbox"
                      variant="head"
                      sx={getHeaderCheckboxCellSx(headerConfig, 'filterRows')}
                    />
                  )}

                  {columns.map((col) => (
                    <GridHeaderCellFilter
                      key={col.field}
                      column={col}
                      slot={getFilterInputSlot(col, translations, direction)}
                    />
                  ))}
                </TableRow>
              )}

              {getFilterToInputSlot && hasActiveRangeFilter && (
                <TableRow sx={getFilterRowSx(headerConfig)}>
                  {multiSelectable && (
                    <TableCell
                      padding="checkbox"
                      variant="head"
                      sx={getHeaderCheckboxCellSx(headerConfig, 'filterRows')}
                    />
                  )}

                  {columns.map((col) => (
                    <GridHeaderCellFilter
                      key={col.field}
                      column={col}
                      slot={getFilterToInputSlot(col, translations, direction)}
                    />
                  ))}
                </TableRow>
              )}
            </TableHead>
          </Table>
        </TableContainer>
      </GridErrorBoundary>
    );

    const bodyTable = (
      <GridErrorBoundary>
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={getTableContainerSx(enableHorizontalScroll, totalWidth, { hideTopBorder: true })}
        >
          <Table size="small" aria-label="Data grid body" sx={getTableSx(totalWidth, enableHorizontalScroll)}>
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
                    if (el) bodyColRefs.current.set(col.field, el);
                    else bodyColRefs.current.delete(col.field);
                  }}
                />
              ))}
            </colgroup>

            <TableBody
              onClick={handleTableBodyClick}
              onDoubleClick={handleTableBodyDoubleClick}
            >
              {bodyRows}
            </TableBody>
          </Table>
        </TableContainer>
      </GridErrorBoundary>
    );

    return (
      <Box ref={tooltipContainerRef} sx={scrollContainerSx} data-testid="grid-scroll-container">
        {toolbarBox}

        <Box
          ref={headerScrollRef}
          sx={{
            ...getHeaderScrollWrapperSx(
              direction,
              scrollbarWidth,
              enableHorizontalScroll && showHorizontalScrollbar
            ),
            flexShrink: 0,
          }}
        >
          {headerTable}
        </Box>

        <Box
          ref={(el) => {
            scrollContainerRef.current = el;
            if (ctxScrollContainerRef) ctxScrollContainerRef.current = el;
            if (onScrollContainerReadyForLayout) onScrollContainerReadyForLayout(Boolean(el));
          }}
          onScroll={handleBodyScroll}
          sx={getScrollInnerBoxSx(enableHorizontalScroll)}
        >
          {virtualization ? (
            <>
              <Box
                aria-hidden
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: virtualWindow.totalHeight,
                  width: enableHorizontalScroll ? `${totalWidth}px` : '100%',
                  pointerEvents: 'none',
                }}
              />

              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  zIndex: 1,
                }}
              >
                <ScrollContainerContext.Provider value={{ ref: tooltipContainerRef, ready: scrollContainerReady }}>
                  {bodyTable}
                </ScrollContainerContext.Provider>
              </Box>
            </>
          ) : (
            <ScrollContainerContext.Provider value={{ ref: tooltipContainerRef, ready: scrollContainerReady }}>
              {bodyTable}
            </ScrollContainerContext.Provider>
          )}
        </Box>
      </Box>
    );
  }

  return (
    <>
      {toolbarBox}
      {tableContent}
    </>
  );
}

export const GridTable = memo(GridTableInner);