import React, { useMemo } from 'react';
import { ThemeProvider, createTheme, Box } from '@mui/material';
import { DataGridProvider } from './DataGridContext';
import { GridTable } from '../core/GridTable';
import { PaginationBar } from '../pagination/PaginationBar';
import { ValidationAlert } from '../validation/ValidationAlert';
import { defaultGridConfig } from '../config/defaultConfig';
import { useDataGrid } from './useDataGrid';
import { EditToolbar } from './EditToolbar';
import { DIRECTION_LTR, DIRECTION_RTL } from '../config/schema';

/**
 * @typedef {Object} DataGridOptions
 * @property {Object} [translations] - i18n map
 * @property {DIRECTION_LTR|DIRECTION_RTL} [direction=DIRECTION_LTR] - Layout direction
 * @property {Array<{ field: string, order: string }>} [sortModel] - Controlled sort
 * @property {Object} [filterModel] - Controlled filters
 * @property {Function} [onSortChange] - (sortModel) => void
 * @property {Function} [onFilterChange] - (filterModel) => void
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
 * @property {number} [page] - Controlled current page (0-based)
 * @property {Function} [onPageChange] - (page) => void
 * @property {Function} [onPageSizeChange] - (pageSize) => void
 * @property {Object} [sx] - MUI sx for root container
 * @property {Object} [headerStyle] - MUI sx for TableHead
 * @property {Object} [headerConfig] - mainRow, filterRows, filterCells (backgroundColor?, height?)
 * @property {Object} [selectedRowStyle] - MUI sx for selected rows
 */

/**
 * DataGrid – sortable, filterable table with optional editing, selection, and pagination.
 *
 * @param {Object} props
 * @param {Object[]} props.rows - Data rows
 * @param {import('../config/schema').ColumnDef[]} props.columns - Column definitions
 * @param {Function} props.getRowId - (row) => string|number; required for selection/edit
 * @param {DataGridOptions} [props.options] - Callbacks, controlled state, and styling overrides
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

  return (
    <ThemeProvider theme={theme}>
      <DataGridProvider stableValue={grid.stableContextValue} filterValue={grid.filterContextValue}>
        <Box sx={{ ...flatProps.sx }} dir={direction}>
          <ValidationAlert errors={grid.validationErrors} />
          <GridTable
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
          />
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
