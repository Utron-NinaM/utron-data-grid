import React, { useMemo } from 'react';
import { ThemeProvider, createTheme, Box } from '@mui/material';
import { DataGridProvider, DataGridStableContext } from './DataGridContext';
import { GridTable } from '../core/GridTable';
import { PaginationBar } from '../pagination/PaginationBar';
import { ValidationAlert } from '../validation/ValidationAlert';
import { defaultGridConfig } from '../config/defaultConfig';
import { useDataGrid } from './useDataGrid';
import { getDataGridRootSx, scrollableContentSx } from './dataGridStyles';
import { EditToolbar } from './EditToolbar';
import { DIRECTION_LTR, DIRECTION_RTL } from '../config/schema';

/**
 * @typedef {Object} DataGridOptions
 * @property {Object} [translations] - i18n map
 * @property {DIRECTION_LTR|DIRECTION_RTL} [direction=DIRECTION_LTR] - Layout direction
 * @property {Function} [onSortChange] - (sortModel) => void when user changes sort; notification only
 * @property {Function} [onFilterChange] - (filterModel) => void when user changes filters; notification only
 * @property {Function} [onEditCommit] - (rowId, row) => void
 * @property {Function} [onEditStart] - (rowId, row) => void when entering edit
 * @property {Function} [onEditCancel] - (rowId) => void when user cancels edit
 * @property {Function} [onValidationFail] - (rowId, errors) => void when Save fails validation
 * @property {Function} [isRowEditable] - (row) => boolean
 * @property {Function} [onSelectionChange] - (selectedIds) => void
 * @property {Function} [onRowSelect] - (rowId, row) => void when a row is clicked
 * @property {boolean} [editable] - Enable row editing
 * @property {boolean} [multiSelectable] - Allow multiple row selection
 * @property {boolean} [pagination] - Show pagination bar
 * @property {number} [pageSize] - Rows per page
 * @property {number[]} [pageSizeOptions] - Page size dropdown options
 * @property {Function} [onPageChange] - (page) => void when user changes page; notification only
 * @property {Function} [onPageSizeChange] - (pageSize) => void when user changes page size; notification only
 * @property {Object} [sx] - MUI sx for root container. When pagination is true and sx includes height or maxHeight, the grid uses a flex layout so only the table body scrolls and the pagination bar stays visible at the bottom.
 * @property {Object} [headerConfig] - base (MUI sx for TableHead), mainRow, filterRows, filterCells (backgroundColor?, height?)
 * @property {Object} [selectedRowStyle] - MUI sx for selected rows
 * @property {string} [gridId] - Unique id for this grid; when set, filter, sort, and column width state are persisted in localStorage and restored on mount or refresh. Use a different id per grid when multiple grids exist.
 * @property {React.ReactNode|((params: { selectedRow: Object|null, selectedRowId: string|number|null }) => React.ReactNode)} [toolbarActions] - Optional content rendered on the right side of the toolbar row (same row as Clear sort / Clear filters / Reset column widths). Use for row actions (e.g. Release, Edit, Cancel). If a function, receives current selected row and id.
 * @property {number} [fontSize=13] - Font size in px for cells, filters, inputs, and pagination. Overridable via CSS (e.g. [data-testid="data-grid-root"] or --data-grid-font-size).
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
 *
 * @example
 * <DataGrid rows={rows} columns={columns} getRowId={(r) => r.id} options={{ editable: true }} />
 *
 * **Performance:** Use stable callbacks (e.g. useCallback) for options handlers and stable columns/getRowId to reduce re-renders.
 */
export function DataGrid(props) {
  const { rows, columns, getRowId, options = {}, sx } = props;
  const flatProps = useMemo(
    () => ({ rows, columns, getRowId, ...options, sx: options.sx ?? sx }),
    [rows, columns, getRowId, options, sx]
  );

  const grid = useDataGrid(flatProps);
  const direction = flatProps.direction ?? DIRECTION_LTR;
  const editable = flatProps.editable ?? defaultGridConfig.editable;
  const pagination = flatProps.pagination ?? defaultGridConfig.pagination;
  const pageSizeOptions = flatProps.pageSizeOptions ?? defaultGridConfig.pageSizeOptions;

  const hasHeightConstraint = Boolean(
    flatProps.sx && (flatProps.sx.height != null || flatProps.sx.maxHeight != null)
  );
  const useScrollableLayout = pagination && hasHeightConstraint;

  const theme = useMemo(
    () =>
      createTheme({
        direction,
        components: {
          MuiTableSortLabel: { styleOverrides: { root: { '&.Mui-active': { color: 'inherit' } } } },
        },
      }),
    [direction]
  );

  const gridTable = useMemo(() => <GridTable
    rows={grid.displayRows}
    selection={grid.selection}
    onSelect={grid.handleSelect}
    sortModel={grid.sortModel}
    onSort={grid.handleSort}
    hasActiveFilters={grid.hasActiveFilters}
    editRowId={grid.editRowId}
    editValues={grid.editValues}
    validationErrors={grid.validationErrors}
    errorSet={grid.errorSet}
    onRowClick={grid.handleRowClick}
    onRowDoubleClick={grid.handleRowDoubleClick}
    selectedRowId={grid.selectedRowId}
    hasActiveRangeFilter={grid.hasActiveRangeFilter}
    containScroll={useScrollableLayout}
  />, [grid.displayRows, grid.selection, grid.handleSelect, grid.sortModel, grid.handleSort, grid.hasActiveFilters,
  grid.editRowId, grid.editValues, grid.validationErrors, grid.errorSet, grid.handleRowClick, grid.handleRowDoubleClick,
  grid.selectedRowId, grid.hasActiveRangeFilter, useScrollableLayout]);

  return (
    <ThemeProvider theme={theme}>
      <DataGridProvider stableValue={grid.stableContextValue} filterValue={grid.filterContextValue}>
        <Box
          ref={grid.stableContextValue.containerRef}
          sx={getDataGridRootSx({
            sx: flatProps.sx,
            fontSize: flatProps.fontSize ?? defaultGridConfig.fontSize,
            useScrollableLayout,
          })}
          dir={direction}
          data-testid="data-grid-root"
        >
          <ValidationAlert errors={grid.validationErrors} />
          {useScrollableLayout ? (
            <Box sx={scrollableContentSx}>
              {gridTable}
            </Box>
          ) : (
            gridTable
          )}
          {editable && grid.editRowId != null && (
            <EditToolbar onSave={grid.handleEditSave} onCancel={grid.handleEditCancel} />
          )}
          {pagination && (
            <PaginationBar
              page={grid.page}
              pageSize={grid.pageSize}
              totalRows={grid.paginationResult.total}
              pageSizeOptions={pageSizeOptions}
              onPageChange={grid.handlePageChange}
              onPageSizeChange={grid.handlePageSizeChange}
            />
          )}
        </Box>
      </DataGridProvider>
    </ThemeProvider>
  );
}
