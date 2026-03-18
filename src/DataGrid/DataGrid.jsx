import React, { useMemo, forwardRef, useImperativeHandle } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { DataGridProvider, DataGridStableContext } from './DataGridContext';
import { GridTable } from '../core/GridTable';
import { PaginationBar } from '../pagination/PaginationBar';
import { GridValidationBanner } from './GridValidationBanner';
import { defaultGridConfig } from '../config/defaultConfig';
import { useDataGrid } from './useDataGrid';
import { getDataGridRootSx, scrollableContentSx } from './dataGridStyles';
import { EditToolbarSubscriber } from '../core/EditToolbarSubscriber';
import { DIRECTION_LTR, DIRECTION_RTL } from '../config/schema';
import { isEmptyRow } from './useDataGridEdit';

/**
 * @typedef {Object} DataGridOptions
 * @property {Object} [translations] - i18n map
 * @property {DIRECTION_LTR|DIRECTION_RTL} [direction=DIRECTION_LTR] - Layout direction
 * @property {Function} [onFilterChange] - (filterModel, result?: { filteredRowCount: number, filteredRows?: Object[] }) => void when filters or data change. result.filteredRowCount is the number of rows matching the current filters (before pagination). result.filteredRows is optional and may be provided for export/summary.
 * @property {Function} [onEditCommit] - (rowId, row) => void
 * @property {Function} [onEditStart] - (rowId, row) => void when entering edit
 * @property {Function} [onEditCancel] - (rowId) => void when user cancels edit
 * @property {Function} [onValidationFail] - (rowId, errors) => void when Save fails validation
 * @property {Function} [isRowEditable] - (row) => boolean
 * @property {Function} [onSelectionChange] - (selectedIds) => void when selection set changes
 * @property {Function} [onRowClick] - (rowId, row) => void when a row is clicked (distinct from selection; use onSelectionChange for selection changes)
 * @property {boolean} [editable] - Enable row editing
 * @property {boolean} [reserveEditToolbarSpace] - When true and editable, always reserve space for the edit toolbar so layout does not jump when entering/leaving edit mode
 * @property {number} [editToolbarHeight=30] - Height in px for the reserved edit toolbar slot when reserveEditToolbarSpace is true
 * @property {boolean} [filters=true] - Show filter row; when false, no filters are displayed
 * @property {boolean} [multiSelectable] - Allow multiple row selection
 * @property {boolean} [pagination] - Show pagination bar
 * @property {number} [pageSize] - Rows per page
 * @property {number[]} [pageSizeOptions] - Page size dropdown options
 * @property {Function} [onPageSizeChange] - (pageSize) => void when user changes page size
 * @property {Object} [sx] - MUI sx for root container. When pagination is true and sx includes height or maxHeight, the grid uses a flex layout so only the table body scrolls and the pagination bar stays visible at the bottom.
 * @property {Object} [headerConfig] - base (MUI sx for TableHead), mainRow, filterRows, filterCells (backgroundColor?, height?)
 * @property {Object} [bodyRow] - Body row config (height?, paddingTop?, paddingBottom?, paddingLeft?, paddingRight?, ...sx). Default used when undefined.
 * @property {Object} [selectedRowStyle] - MUI sx for selected rows
 * @property {boolean} [disableRowHover=false] - When true, no row hover styling
 * @property {Object} [rowHoverStyle] - MUI sx for row hover (e.g. { '&:hover': { backgroundColor: '...' } }). When set, overrides default hover; selected row on hover still uses selected style.
 * @property {string} [gridId] - Unique id for this grid; when set, filter, sort, and column width state are persisted in localStorage and restored on mount or refresh. Use a different id per grid when multiple grids exist.
 * @property {React.ReactNode|((params: { selectedRow: Object|null, selectedRowId: string|number|null }) => React.ReactNode)} [toolbarActions] - Optional content rendered on the right side of the toolbar row (same row as Clear sort / Clear filters / Reset column widths). Use for row actions (e.g. Release, Edit, Cancel). If a function, receives current selected row and id.
 * @property {Object} [toolbarClearButtonsSx] - MUI sx applied to Clear sort, Clear all filters, and Reset column widths toolbar buttons.
 * @property {boolean} [showExportToExcel=false] - When true, show an "Export to Excel" button in the toolbar (same row as Clear sort / Clear filters).
 * @property {Object} [editToolbarSaveButtonSx] - MUI sx applied to the Save button in the edit toolbar.
 * @property {Object} [editToolbarCancelButtonSx] - MUI sx applied to the Cancel button in the edit toolbar.
 * @property {number} [fontSize=13] - Font size in px for cells, filters, inputs, and pagination. Overridable via CSS (e.g. [data-testid="data-grid-root"] or --data-grid-font-size).
 * @property {string} [fontFamily] - Font family for all grid components (e.g. 'Roboto, sans-serif', var(--app-font-family)). Cascades from root.
 * @property {number|string} [fontWeight] - Font weight (e.g. 400, 600, 'bold'). Cascades from root.
 * @property {React.RefObject<HTMLElement|null>} [dropdownBoundaryRef] - Ref to the element that defines the clipping area for dropdowns (e.g. the main content wrapper that excludes sidebars). When set, list and filter dropdowns stay within this element's bounds. Omit to use viewport.
 */

/**
 * DataGrid – sortable, filterable table with optional editing, selection, and pagination.
 *
 * @param {Object} props
 * @param {Object[]} props.rows - Data rows
 * @param {import('../config/schema').ColumnDef[]} props.columns - Column definitions
 * @param {Function} props.getRowId - (row) => string|number; required for selection/edit
 * @param {DataGridOptions} [props.options] - Callbacks and styling overrides
 * @param {Object} [props.sx] - MUI sx for root container (overridden by options.sx if both set)
 * @param {Object} ref - Ref object with imperative handle methods
 *
 * @example
 * <DataGrid rows={rows} columns={columns} getRowId={(r) => r.id} options={{ editable: true }} />
 *
 * **Performance:** Use stable callbacks (e.g. useCallback) for options handlers and stable columns/getRowId to reduce re-renders.
 */
export const DataGrid = forwardRef(function DataGrid(props, ref) {
  const { rows, columns, getRowId, options = {}, sx } = props;
  const flatProps = useMemo(
    () => ({ rows, columns, getRowId, ...options, sx: options.sx ?? sx }),
    [rows, columns, getRowId, options, sx]
  );

  const grid = useDataGrid(flatProps);
  const direction = flatProps.direction ?? DIRECTION_LTR;
  const editable = flatProps.editable ?? defaultGridConfig.editable;
  const reserveEditToolbarSpace = flatProps.reserveEditToolbarSpace;
  const editToolbarHeight = flatProps.editToolbarHeight ?? 30;
  const pagination = flatProps.pagination ?? defaultGridConfig.pagination;
  const pageSizeOptions = flatProps.pageSizeOptions ?? defaultGridConfig.pageSizeOptions;

  // Expose imperative handle for programmatic control
  useImperativeHandle(ref, () => ({
    startEditMode: (rowId) => {
      if (!editable || !flatProps.onEditCommit) return;

      const row = flatProps.rows.find(r => String(flatProps.getRowId(r)) === String(rowId));
      if (!row) return;

      const isEmpty = isEmptyRow(row, flatProps.getRowId);

      // Empty rows should always be editable (to add new data)
      // Only check isRowEditable for non-empty rows
      if (!isEmpty && flatProps.isRowEditable && !flatProps.isRowEditable(row)) return;

      const editStore = grid.stableContextValue.editStore;

      if (isEmpty) {
        editStore.startNewRowEdit(rowId);
      } else {
        editStore.startEdit(rowId, row);
      }

      if (flatProps.onEditStart) {
        flatProps.onEditStart(rowId, row);
      }
    },
  }), [editable, flatProps, grid.stableContextValue.editStore]);

  const hasHeightConstraint = Boolean(
    flatProps.sx && (flatProps.sx.height != null || flatProps.sx.maxHeight != null)
  );
  const useScrollableLayout = hasHeightConstraint;

  const fontFamily = flatProps.fontFamily;
  const fontSize = flatProps.fontSize ?? defaultGridConfig.fontSize;
  const fontWeight = flatProps.fontWeight;

  const theme = useMemo(() => {
    const fontSx = [fontFamily, fontSize, fontWeight].some((v) => v != null)
      ? {
        ...(fontFamily != null && { fontFamily }),
        ...(fontSize != null && { fontSize }),
        ...(fontWeight != null && { fontWeight }),
      }
      : null;

    const muiSelectRtlOverrides =
      direction === DIRECTION_RTL
        ? {
          select: ({ theme }) => ({
            paddingLeft: `${theme.spacing(4)} !important`,
            paddingRight: `${theme.spacing(1.75)} !important`,
          }),
          icon: ({ theme }) => ({
            left: `${theme.spacing(1.125)} !important`,
            right: 'auto !important',
          }),
        }
        : {};

    const typoOverrides = fontSx
      ? {
        typography: {
          ...(fontFamily != null && { fontFamily }),
          ...(fontSize != null && { fontSize }),
          ...(fontWeight != null && {
            body1: { fontWeight },
            body2: { fontWeight },
            caption: { fontWeight },
            subtitle1: { fontWeight },
            subtitle2: { fontWeight },
            h6: { fontWeight },
            button: { fontWeight },
          }),
        },
      }
      : {};

    const fontComponents = fontSx
      ? {
        MuiTableCell: { styleOverrides: { root: fontSx } },
        MuiInputBase: { styleOverrides: { root: fontSx, input: fontSx } },
        MuiTypography: { styleOverrides: { root: fontSx } },
        MuiButton: { styleOverrides: { root: fontSx } },
        MuiIconButton: { styleOverrides: { root: fontSx } },
        MuiFormControlLabel: { styleOverrides: { label: fontSx } },
        MuiMenuItem: { styleOverrides: { root: fontSx } },
        MuiAlert: { styleOverrides: { root: fontSx, title: fontSx } },
        MuiSelect: {
          styleOverrides: {
            select: ({ theme }) => ({
              ...fontSx,
              ...(muiSelectRtlOverrides.select && muiSelectRtlOverrides.select({ theme })),
            }),
            ...(muiSelectRtlOverrides.icon && { icon: muiSelectRtlOverrides.icon }),
          },
        },
      }
      : {};

    const rtlComponents =
    {
      ...(!fontSx && muiSelectRtlOverrides.select && {
        MuiSelect: { styleOverrides: muiSelectRtlOverrides },
      }),
      MuiAutocomplete: {
        styleOverrides: {
          root: ({ theme }) => ({
            '& .MuiAutocomplete-endAdornment': {
              left: direction === DIRECTION_RTL ? `${theme.spacing(0.25)} !important` : 'auto !important',
              right: direction === DIRECTION_LTR ? `${theme.spacing(0.25)} !important` : 'auto !important',
              display: 'flex',
              alignItems: 'center',
            },
          }),
        },
      },
    };

    return createTheme({
      direction,
      ...typoOverrides,
      components: {
        MuiTableSortLabel: {
          styleOverrides: {
            root: ({ theme }) => ({
              color: 'inherit !important',
              '& .MuiTableSortLabel-icon': {
                color: 'inherit !important',
                fill: 'currentColor',
                fontSize: theme.typography.body2.fontSize,
                marginLeft: theme.spacing(0.25),
                marginRight: theme.spacing(0.25),
              },
              '& .MuiTableSortLabel-icon:hover': { color: 'inherit !important' },
              '&:hover': { color: 'inherit !important' },
              '&:hover .MuiTableSortLabel-icon': { color: 'inherit !important', opacity: 1 },
              '&.Mui-active': { color: 'inherit !important' },
              '&.Mui-active .MuiTableSortLabel-icon': { color: 'inherit !important' },
              '&.Mui-focusVisible': { color: 'inherit !important' },
              '&.Mui-focusVisible .MuiTableSortLabel-icon': { color: 'inherit !important' },
            }),
          },
        },
        ...fontComponents,
        ...rtlComponents,
      },
    });
  }, [direction, fontFamily, fontSize, fontWeight]);

  const gridTable = useMemo(
    () => (
      <GridTable
        rows={grid.displayRows}
        selection={grid.selection}
        onSelect={grid.handleSelect}
        sortModel={grid.sortModel}
        onSort={grid.handleSort}
        hasActiveFilters={grid.hasActiveFilters}
        onRowDoubleClick={grid.handleRowDoubleClick}
        hasActiveRangeFilter={grid.hasActiveRangeFilter}
        containScroll={useScrollableLayout}
      />
    ),
    [
      grid.displayRows,
      grid.selection,
      grid.handleSelect,
      grid.sortModel,
      grid.handleSort,
      grid.hasActiveFilters,
      grid.handleRowDoubleClick,
      grid.hasActiveRangeFilter,
      useScrollableLayout,
    ]
  );

  return (
    <ThemeProvider theme={theme}>
      <DataGridProvider stableValue={grid.stableContextValue} filterValue={grid.filterContextValue}>
        <Box
          ref={grid.stableContextValue.containerRef}
          sx={getDataGridRootSx({
            sx: flatProps.sx,
            fontSize,
            fontFamily: flatProps.fontFamily,
            fontWeight: flatProps.fontWeight,
            useScrollableLayout,
          })}
          dir={direction}
          data-testid="data-grid-root"
        >
          <GridValidationBanner
            columns={flatProps.columns}
            editStore={grid.stableContextValue.editStore}
            onErrorClick={grid.handleValidationErrorClick}
          />
          {useScrollableLayout ? (
            <Box sx={scrollableContentSx}>
              {gridTable}
            </Box>
          ) : (
            gridTable
          )}
          {editable && reserveEditToolbarSpace && (
            <Box sx={{ minHeight: editToolbarHeight }}>
              <EditToolbarSubscriber reserveSpaceHeight={editToolbarHeight} />
            </Box>
          )}
          {editable && !reserveEditToolbarSpace && <EditToolbarSubscriber />}
          {pagination && (
            <Box sx={{ pointerEvents: grid.stableContextValue.isEditing ? 'none' : 'auto' }}>
              <PaginationBar
                page={grid.page}
                pageSize={grid.pageSize}
                totalRows={grid.paginationResult.total}
                pageSizeOptions={pageSizeOptions}
                onPageChange={grid.handlePageChange}
                onPageSizeChange={grid.handlePageSizeChange}
              />
            </Box>
          )}
        </Box>
      </DataGridProvider>
    </ThemeProvider>
  );
});
