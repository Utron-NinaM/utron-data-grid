import React, { memo, useContext, useId, useMemo, useRef, useEffect, useState, useLayoutEffect, useSyncExternalStore } from 'react';
import Table from '@mui/material/Table';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import SettingsIcon from '@mui/icons-material/Settings';
import { ExportIcon } from './icons/ExportIcon';
import CircularProgress from '@mui/material/CircularProgress';
import { useTranslations } from '../localization/useTranslations';
import { DataGridStableContext, DataGridFilterContext, ScrollContainerContext } from '../DataGrid/DataGridContext';
import { GridHeaderCell } from './GridHeaderCell';
import { GridHeaderCellFilter } from './GridHeaderCellFilter';
import { GridBody } from './GridBody';
import { GridTableBodyVirtuoso } from './GridTableBodyVirtuoso';
import { SelectionStyleApplicator } from './SelectionStyleApplicator';
import { GridToolbarSubscriber } from './GridToolbarSubscriber';
import { GridErrorBoundary } from './GridErrorBoundary';
import { exportToCsv } from '../utils/exportToCsv';
import { exportToPdf } from '../utils/exportToPdf';
import { CHECKBOX_COLUMN_WIDTH_PX, BODY_ROW_HEIGHT } from '../constants';
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
  toolbarLeftBoxSx,
} from './coreStyles';
import { GRID_BUTTONS_COLOR } from '../constants';

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
    toolbarClearButtonsSx, toolbarExportButtonSx, toolbarPdfExportButtonSx, toolbarConfigButtonSx, showExportToExcel, showExportToPdf, onColumnConfigClick, direction, selectRow, bodyRow, editable,
    editStore, sortedRows } = ctx;

  const editRowId = useSyncExternalStore(
    editStore?.subscribe ?? (() => () => { }),
    () => editStore?.getSnapshot?.()?.editRowId ?? null,
    () => null
  );

  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState({ current: 0, total: 0 });
  const [exportError, setExportError] = useState(null);

  // Log error to console when modal opens
  useEffect(() => {
    if (exportError !== null) {
      console.error('Export error details:', exportError);
    }
  }, [exportError]);

  const tableId = useId();
  const bodyColRefs = useRef(new Map());
  const headerScrollRef = useRef(null);

  // Apply widths from columnWidthMap to col elements (skip column currently being resized to avoid overwriting drag width)
  // When containScroll, update both header and body cols in the same effect to avoid jitter
  useEffect(() => {
    if (!columnWidthMap || !colRefs) return;

    columns.forEach((col) => {
      if (resizingColumnRef?.current === col.field) return;
      const width = columnWidthMap.get(col.field);
      const w = width != null ? (typeof width === 'string' ? width : `${width}px`) : null;
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
      if (!row) return;
      const rowId = getRowId(row);
      if (editRowId != null && String(rowId) !== String(editRowId)) return;
      if (multiSelectable && onSelect) {
        const cell = event.target.closest('td');
        if (cell?.cellIndex === 0) return;
        onSelect(rowId, !selection?.has(rowId));
        return;
      }
      selectRow(rowId, row);
    };
  }, [selectRow, rows, getRowId, multiSelectable, onSelect, selection, editRowId]);

  const handleTableBodyDoubleClick = useMemo(() => {
    if (!onRowDoubleClick) return undefined;
    return (event) => {
      const rowElement = event.target.closest('[data-row-id]');
      if (!rowElement) return;
      const rowId = rowElement.getAttribute('data-row-id');
      const row = rows.find(r => String(getRowId(r)) === rowId);
      if (!row) return;
      if (editRowId != null && String(getRowId(row)) !== String(editRowId)) return;
      onRowDoubleClick(row);
    };
  }, [onRowDoubleClick, rows, getRowId, editRowId]);

  // Stable callback for checkbox selection - takes (rowId, checked)
  const handleSelectRow = useMemo(() => {
    if (!onSelect) return undefined;
    return (rowId, checked) => {
      if (editRowId != null && String(rowId) !== String(editRowId)) return;
      onSelect(rowId, checked);
    };
  }, [onSelect, editRowId]);

  const scrollContainerRef = useRef(null);
  const tooltipContainerRef = useRef(null);
  const [scrollContainerReady, setScrollContainerReady] = useState(false);
  const [scrollbarWidth, setScrollbarWidth] = useState(0);

  const rowHeight = bodyRow?.height ?? BODY_ROW_HEIGHT;
  const visibleRows = containScroll ? rows : rows;

  const bodyContent = (
    <GridBody
      rows={rows}
      visibleRows={visibleRows}
      columns={columns}
      getRowId={getRowId}
      selection={selection}
      mergedRowStylesMap={mergedRowStylesMap}
      rowStylesMap={rowStylesMap}
      selectedRowStyle={selectedRowStyle}
      disableRowHover={disableRowHover}
      multiSelectable={multiSelectable}
      onSelectRow={handleSelectRow}
      getEditor={getEditor}
      direction={direction}
      onClick={handleTableBodyClick}
      onDoubleClick={handleTableBodyDoubleClick}
      noRowsMessage={translations('noRows')}
      colSpan={columns.length + (multiSelectable ? 1 : 0)}
    />
  );

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
    <Box sx={{ pointerEvents: editRowId != null ? 'none' : 'auto' }}>
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
        <Box sx={toolbarLeftBoxSx}>
          <GridToolbarSubscriber rows={rows} getRowId={getRowId} />
          {(showExportToExcel || showExportToPdf || onColumnConfigClick) && (
            <Box sx={toolbarActionsBoxSx}>
              {showExportToExcel && (
                <Tooltip title={translations('exportToCsvTooltip')}>
                  <IconButton
                    size="small"
                    onClick={() => {
                      try {
                        exportToCsv({ columns, rows: sortedRows ?? rows, filename: 'export.csv' });
                      } catch (error) {
                        console.error('CSV export failed:', error);
                        setExportError(error);
                      }
                    }}
                    sx={{ color: GRID_BUTTONS_COLOR, ...toolbarExportButtonSx }}
                  >
                    <ExportIcon type="csv" />
                  </IconButton>
                </Tooltip>
              )}
              {showExportToPdf && (
                <Tooltip title={translations('exportToPdfTooltip')}>
                  <IconButton
                    size="small"
                    onClick={async () => {
                      setIsExportingPdf(true);
                      setPdfProgress({ current: 0, total: (sortedRows ?? rows).length });
                      try {
                        await exportToPdf({
                          columns,
                          rows: sortedRows ?? rows,
                          filename: 'export.pdf',
                          direction,
                          onProgress: (current, total) => {
                            setPdfProgress({ current, total });
                          },
                        });
                      } catch (error) {
                        console.error('PDF export failed:', error);
                        setExportError(error);
                      } finally {
                        setIsExportingPdf(false);
                        setPdfProgress({ current: 0, total: 0 });
                      }
                    }}
                    disabled={isExportingPdf}
                    sx={{ color: GRID_BUTTONS_COLOR, ...toolbarPdfExportButtonSx }}
                  >
                    {isExportingPdf ? <CircularProgress size={16} color="inherit" /> : <ExportIcon type="pdf" />}
                  </IconButton>
                </Tooltip>
              )}
              {onColumnConfigClick && (
                <Tooltip title={translations('columnConfig')}>
                  <IconButton
                    size="small"
                    onClick={onColumnConfigClick}
                    sx={{ color: GRID_BUTTONS_COLOR, ...toolbarConfigButtonSx }}
                  >
                    <SettingsIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );

  const errorDialog = (
    <Dialog
      open={exportError !== null}
      onClose={() => setExportError(null)}
      aria-labelledby="error-dialog-title"
      aria-describedby="error-dialog-description"
      maxWidth="sm"
      sx={{
        '& .MuiDialog-paper': {
          width: '400px',
          minHeight: '150px',
        },
      }}
    >
      <DialogTitle
        id="error-dialog-title"
        sx={{
          backgroundColor: GRID_BUTTONS_COLOR,
          color: 'white',
          textAlign: 'center',
          fontSize: '18px'
        }}
      >
        {translations('errorTitle')}
      </DialogTitle>
      <DialogContent sx={{ textAlign: 'center', margin: '20px' }}>
        <DialogContentText id="error-dialog-description" sx={{ fontSize: '18px' }}>
          {translations('internalErrorOccurred')}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setExportError(null)} autoFocus>
          {translations('close')}
        </Button>
      </DialogActions>
    </Dialog>
  );

  const tableContent = (
    <GridErrorBoundary>
      <TableContainer
        component={Paper}
        variant="outlined"
        sx={getTableContainerSx(enableHorizontalScroll, totalWidth, { constrainToParent: true })}
      >
        <SelectionStyleApplicator tableId={tableId} selection={selection} />
        <Table
          id={tableId}
          size="small"
          stickyHeader={!containScroll}
          aria-label="Data grid"
          sx={getTableSx(totalWidth, enableHorizontalScroll)}
        >
          <colgroup>
            {multiSelectable && <col style={{ width: `${CHECKBOX_COLUMN_WIDTH_PX}px`, minWidth: `${CHECKBOX_COLUMN_WIDTH_PX}px` }} />}
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
          <TableHead sx={{ ...getTableHeadSx(containScroll, headerConfig), ...(editRowId != null && { pointerEvents: 'none' }) }}>
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
          {bodyContent}
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
              {multiSelectable && <col style={{ width: `${CHECKBOX_COLUMN_WIDTH_PX}px`, minWidth: `${CHECKBOX_COLUMN_WIDTH_PX}px` }} />}
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
            <TableHead sx={{ ...getTableHeadSx(true, headerConfig), ...(editRowId != null && { pointerEvents: 'none' }) }}>
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

    const bodyTableEmpty = (
      <GridErrorBoundary>
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={getTableContainerSx(enableHorizontalScroll, totalWidth, { hideTopBorder: true })}
        >
          <Table size="small" aria-label="Data grid body" sx={getTableSx(totalWidth, enableHorizontalScroll)}>
            <colgroup>
              {multiSelectable && <col style={{ width: `${CHECKBOX_COLUMN_WIDTH_PX}px`, minWidth: `${CHECKBOX_COLUMN_WIDTH_PX}px` }} />}
              {columns.map((col) => (
                <col key={col.field} data-field={col.field} />
              ))}
            </colgroup>
            {bodyContent}
          </Table>
        </TableContainer>
      </GridErrorBoundary>
    );

    return (
      <Box ref={tooltipContainerRef} sx={scrollContainerSx} data-testid="grid-scroll-container">
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
          <ScrollContainerContext.Provider value={{ ref: tooltipContainerRef, scrollContainerRef, ready: scrollContainerReady }}>
            {rows.length > 0 ? (
              <TableContainer
                component={Paper}
                variant="outlined"
                sx={getTableContainerSx(enableHorizontalScroll, totalWidth, { hideTopBorder: true })}
              >
                <SelectionStyleApplicator tableId={tableId} selection={selection} />
                <GridTableBodyVirtuoso
                  tableId={tableId}
                  rows={rows}
                  columns={columns}
                  getRowId={getRowId}
                  rowHeight={rowHeight}
                  multiSelectable={multiSelectable}
                  selection={selection}
                  mergedRowStylesMap={mergedRowStylesMap}
                  rowStylesMap={rowStylesMap}
                  selectedRowStyle={selectedRowStyle}
                  disableRowHover={disableRowHover}
                  onSelectRow={handleSelectRow}
                  getEditor={getEditor}
                  direction={direction}
                  onClick={handleTableBodyClick}
                  onDoubleClick={handleTableBodyDoubleClick}
                  scrollContainerRef={scrollContainerRef}
                  scrollContainerReady={scrollContainerReady}
                  enableHorizontalScroll={enableHorizontalScroll}
                  totalWidth={totalWidth}
                  bodyColRefs={bodyColRefs}
                />
              </TableContainer>
            ) : (
              bodyTableEmpty
            )}
          </ScrollContainerContext.Provider>
        </Box>
        {errorDialog}
      </Box>
    );
  }

  return (
    <>
      {toolbarBox}
      {tableContent}
      {errorDialog}
    </>
  );
}

export const GridTable = memo(GridTableInner);









