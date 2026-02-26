import React, { memo, useContext, useMemo, useRef, useEffect, useState, useLayoutEffect } from 'react';
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
import { ALIGN_CENTER } from '../config/schema';
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

/**
 * @param {Object} props
 * @param {Object[]} props.rows
 * @param {Set<string|number>} props.selection
 * @param {Function} props.onSelect
 * @param {Array<{ field: string, order: string }>} props.sortModel
 * @param {Function} props.onSort
 * @param {boolean} [props.hasActiveFilters]
 * @param {Function} [props.onRowDoubleClick]
 * @param {boolean} [props.hasActiveRangeFilter] Whether any column has an active range filter
 * @param {boolean} [props.containScroll] When true, toolbar stays fixed and only table body scrolls
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
  const { columns, getRowId, multiSelectable, filters, onClearSort, onClearAllFilters, onClearColumnWidths, 
    hasResizedColumns, headerConfig, getEditor, selectedRowStyle, disableRowHover, rowHoverStyle, rowStylesMap, sortOrderIndexMap, 
    scrollContainerRef: ctxScrollContainerRef, setScrollContainerReady: onScrollContainerReadyForLayout, 
    colRefs, resizingColumnRef, totalWidth, enableHorizontalScroll, showHorizontalScrollbar, columnWidthMap, 
    toolbarClearButtonsSx, direction, selectRow, bodyRow } = ctx;

  const bodyColRefs = useRef(new Map());
  const headerScrollRef = useRef(null);

  // Apply widths from columnWidthMap to col elements (skip column currently being resized to avoid overwriting drag width)
  // When containScroll, update both header and body cols in the same effect to avoid jitter
  useEffect(() => {
    if (!columnWidthMap || !colRefs) return;

    columns.forEach((col) => {
      if (resizingColumnRef?.current === col.field) return;
      const width = columnWidthMap.get(col.field);
      const w = width != null ? `${width}px` : null;
      const headerCol = colRefs.current?.get(col.field);
      if (headerCol && w) headerCol.style.width = w;
      if (containScroll) {
        const bodyCol = bodyColRefs.current?.get(col.field);
        if (bodyCol && w) bodyCol.style.width = w;
      }
    });
  }, [columns, columnWidthMap, colRefs, resizingColumnRef, containScroll]);
  const { getHeaderComboSlot, getFilterInputSlot, getFilterToInputSlot } = filterCtx;
  const sortModelLength = sortModel?.length ?? 0;

  // Row sx: row style + row-level hover (selector styles cells on row hover so hover overrides row/cell without state).
  const mergedRowStylesMap = useMemo(() => {
    const hasCustomHover = rowHoverStyle != null && typeof rowHoverStyle === 'object' && !Array.isArray(rowHoverStyle) && Object.keys(rowHoverStyle).length > 0;
    const hoverContent = hasCustomHover ? (rowHoverStyle['&:hover'] ?? rowHoverStyle) : null;
    const hoverBlock =
      disableRowHover
        ? null
        : hasCustomHover && hoverContent != null && Object.keys(hoverContent).length > 0
          ? { '&:hover:not(.Mui-selected) td': hoverContent }
          : (theme) => ({ '&:hover:not(.Mui-selected) td': { backgroundColor: theme.palette.action.hover } });
    const bodyRowHeightSx = getBodyRowHeightSx(bodyRow?.height);
    const map = new Map();
    rows.forEach((row) => {
      const rowId = getRowId(row);
      const baseRowSx = rowStylesMap?.get(rowId);
      const rowSxArray = [bodyRowHeightSx, baseRowSx, hoverBlock].filter(Boolean);
      map.set(rowId, rowSxArray.length ? rowSxArray : undefined);
    });
    return map;
  }, [rows, rowStylesMap, disableRowHover, rowHoverStyle, getRowId, bodyRow]);
  const handleTableBodyClick = useMemo(() => {
    if (!selectRow) return undefined;
    return (event) => {
      const rowElement = event.target.closest('[data-row-id]');
      if (!rowElement) return;
      const rowIdAttr = rowElement.getAttribute('data-row-id');
      const row = rows.find((r) => String(getRowId(r)) === rowIdAttr);
      if (row) selectRow(getRowId(row), row);
    };
  }, [selectRow, rows, getRowId]);

  const handleTableBodyDoubleClick = useMemo(() => {
    if (!onRowDoubleClick) return undefined;
    return (event) => {
      const rowElement = event.target.closest('[data-row-id]');
      if (!rowElement) return;
      const rowId = rowElement.getAttribute('data-row-id');
      const row = rows.find(r => String(getRowId(r)) === rowId);
      if (row) onRowDoubleClick(row);
    };
  }, [onRowDoubleClick, rows, getRowId]);

  // Stable callback for checkbox selection - takes (rowId, checked)
  const handleSelectRow = useMemo(() => {
    if (!onSelect) return undefined;
    return (rowId, checked) => onSelect(rowId, checked);
  }, [onSelect]);

  // Compute body rows inline - React reconciliation handles optimization efficiently
  let bodyRows;
  if (rows.length === 0) {
    bodyRows = (
      <TableRow>
        <TableCell colSpan={columns.length + (multiSelectable ? 1 : 0)} align={ALIGN_CENTER}>
          {translations('noRows')}
        </TableCell>
      </TableRow>
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
  const scrollContainerRef = useRef(null);
  const [scrollContainerReady, setScrollContainerReady] = useState(false);
  const [scrollbarWidth, setScrollbarWidth] = useState(0);

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
  const toolbarBox = (
    <Box sx={getToolbarBoxSx(containScroll)}>
      <Box sx={toolbarActionsBoxSx}>
        <Button size="small" variant="outlined" onClick={onClearSort} disabled={sortModelLength === 0} {...(toolbarClearButtonsSx && { sx: toolbarClearButtonsSx })}>
          {translations('clearSort')}
        </Button>
        {filters !== false && (
          <Button size="small" variant="outlined" onClick={onClearAllFilters} disabled={!hasActiveFilters} {...(toolbarClearButtonsSx && { sx: toolbarClearButtonsSx })}>
            {translations('clearAllFilters')}
          </Button>
        )}
        <Button size="small" variant="outlined" onClick={onClearColumnWidths} disabled={!hasResizedColumns} {...(toolbarClearButtonsSx && { sx: toolbarClearButtonsSx })}>
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
            {multiSelectable && <col />}
            {columns.map((col) => (
              <col
                key={col.field}
                data-field={col.field}
                ref={(el) => {
                  if (el) {
                    colRefs.current.set(col.field, el);
                  } else {
                    colRefs.current.delete(col.field);
                  }
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
              {multiSelectable && <col />}
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
                  <TableCell padding="checkbox" variant="head" sx={getHeaderCheckboxCellSx(headerConfig, 'mainRow')} />
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
                    <TableCell padding="checkbox" variant="head" sx={getHeaderCheckboxCellSx(headerConfig, 'filterRows')} />
                  )}
                  {columns.map((col) => (
                    <GridHeaderCellFilter key={col.field} column={col} slot={getFilterInputSlot(col, translations, direction)} />
                  ))}
                </TableRow>
              )}
              {getFilterToInputSlot && hasActiveRangeFilter && (
                <TableRow sx={getFilterRowSx(headerConfig)}>
                  {multiSelectable && (
                    <TableCell padding="checkbox" variant="head" sx={getHeaderCheckboxCellSx(headerConfig, 'filterRows')} />
                  )}
                  {columns.map((col) => (
                    <GridHeaderCellFilter key={col.field} column={col} slot={getFilterToInputSlot(col, translations, direction)} />
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
              {multiSelectable && <col />}
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
            <TableBody onClick={handleTableBodyClick} onDoubleClick={handleTableBodyDoubleClick}>
              {bodyRows}
            </TableBody>
          </Table>
        </TableContainer>
      </GridErrorBoundary>
    );

    return (
      <Box sx={scrollContainerSx} data-testid="grid-scroll-container">
        {toolbarBox}
        <Box
          ref={headerScrollRef}
          sx={{ ...getHeaderScrollWrapperSx(direction, scrollbarWidth, enableHorizontalScroll && showHorizontalScrollbar), flexShrink: 0 }}
        >
          {headerTable}
        </Box>
        <Box
          ref={(el) => {
            scrollContainerRef.current = el;
            if (ctxScrollContainerRef) ctxScrollContainerRef.current = el;
            if (onScrollContainerReadyForLayout) {
              const ready = Boolean(el);
              // eslint-disable-next-line no-console              
              onScrollContainerReadyForLayout(ready);
            }
          }}
          onScroll={handleBodyScroll}
          sx={getScrollInnerBoxSx(enableHorizontalScroll)}
        >
          <ScrollContainerContext.Provider value={{ ref: scrollContainerRef, ready: scrollContainerReady }}>
            {bodyTable}
          </ScrollContainerContext.Provider>
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









