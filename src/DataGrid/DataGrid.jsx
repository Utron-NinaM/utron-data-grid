import React, { useMemo } from 'react';
import { ThemeProvider, createTheme, Box, Button } from '@mui/material';
import { useTranslations } from '../localization/useTranslations';
import { DataGridProvider } from './DataGridContext';
import { GridTable } from '../core/GridTable';
import { PaginationBar } from '../pagination/PaginationBar';
import { ValidationAlert } from '../validation/ValidationAlert';
import { defaultGridConfig } from '../config/defaultConfig';
import { useDataGrid } from './useDataGrid';

function EditToolbar({ onSave, onCancel }) {
  const t = useTranslations();
  return (
    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
      <Button size="small" variant="contained" onClick={onSave}>{t('save')}</Button>
      <Button size="small" onClick={onCancel}>{t('cancel')}</Button>
    </Box>
  );
}

/**
 * @param {Object} props
 * @param {Object[]} props.rows
 * @param {Object[]} props.columns
 * @param {Object} [props.translations]
 * @param {'ltr'|'rtl'} [props.direction='ltr']
 * @param {Array<{ field: string, order: string }>} [props.sortModel] controlled
 * @param {Object} [props.filterModel] controlled
 * @param {Function} [props.onSortChange]
 * @param {Function} [props.onFilterChange]
 * @param {Function} [props.onEditCommit]
 * @param {Function} [props.onEditStart] (rowId, row) when entering edit
 * @param {Function} [props.onEditCancel] (rowId) when user cancels edit
 * @param {Function} [props.onValidationFail] (rowId, errors) when Save fails validation
 * @param {Function} [props.isRowEditable] (row) => boolean – only these rows are editable
 * @param {Function} [props.onSelectionChange]
 * @param {Function} [props.onRowSelect] (rowId, row) when a row is clicked
 * @param {Function} props.getRowId
 * @param {boolean} [props.editable]
 * @param {boolean} [props.multiSelectable]
 * @param {boolean} [props.pagination]
 * @param {number} [props.pageSize]
 * @param {number[]} [props.pageSizeOptions]
 * @param {number} [props.page] controlled
 * @param {Function} [props.onPageChange]
 * @param {Function} [props.onPageSizeChange]
 * @param {Object} [props.sx]
 * @param {Object} [props.headerStyle] MUI sx object for TableHead
 * @param {Object} [props.headerConfig] Header configuration object
 * @param {Object} [props.headerConfig.mainRow] Main row styles { backgroundColor?: string, height?: string|number }
 * @param {Object} [props.headerConfig.filterRows] Filter rows styles { backgroundColor?: string, height?: string|number }
 * @param {Object} [props.headerConfig.filterCells] Filter cells styles { backgroundColor?: string, height?: string|number }
 * @param {Object} [props.selectedRowStyle] MUI sx object for selected rows
 */
export function DataGrid(props) {
  const {
    direction = 'ltr',
    editable = defaultGridConfig.editable,
    pagination = defaultGridConfig.pagination,
    pageSizeOptions = defaultGridConfig.pageSizeOptions,
    sx,
  } = props;

  const grid = useDataGrid(props);

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
      <DataGridProvider value={grid.contextValue}>
        <Box sx={{ ...sx }} dir={direction}>
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
            validationErrors={grid.errorSet}
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
