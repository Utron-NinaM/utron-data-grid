import React, { useMemo, useCallback, useState } from 'react';
import { ThemeProvider, createTheme, Box, Button } from '@mui/material';
import { useTranslations } from '../localization/useTranslations';
import { DataGridProvider } from './DataGridContext';
import { GridTable } from '../core/GridTable';
import { applySort } from '../utils/sortUtils';
import { applyFilters } from '../filters/filterUtils';
import { slicePage } from '../pagination/paginationUtils';
import { getHeaderComboSlot, getFilterInputSlot, getFilterToInputSlot } from '../filters/FilterBar';
import { getEditor } from '../editors/CellEditors';
import { PaginationBar } from '../pagination/PaginationBar';
import { ValidationAlert } from '../validation/ValidationAlert';
import { validateRow } from '../validation/validateRow';
import { defaultGridConfig } from '../config/defaultConfig';
import { SORT_ORDER_ASC, SORT_ORDER_DESC, OPERATOR_IN_RANGE } from '../config/schema';

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
    rows = [],
    columns = [],
    translations,
    direction = 'ltr',
    sortModel: controlledSort,
    filterModel: controlledFilter,
    onSortChange,
    onFilterChange,
    onEditCommit,
    onEditStart,
    onEditCancel: onEditCancelProp,
    onValidationFail,
    isRowEditable,
    onSelectionChange,
    onRowSelect,
    getRowId,
    editable = defaultGridConfig.editable,
    multiSelectable = defaultGridConfig.multiSelectable,
    pagination = defaultGridConfig.pagination,
    pageSize: initialPageSize = defaultGridConfig.pageSize,
    pageSizeOptions = defaultGridConfig.pageSizeOptions,
    page: controlledPage,
    onPageChange,
    onPageSizeChange,
    sx,
    headerStyle,
    headerConfig,
    selectedRowStyle,
  } = props;

  const [internalSort, setInternalSort] = useState([]);
  const [internalFilter, setInternalFilter] = useState({});
  const [selection, setSelection] = useState(new Set());
  const [editRowId, setEditRowId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [validationErrors, setValidationErrors] = useState([]);
  const [internalPage, setInternalPage] = useState(0);
  const [internalPageSize, setInternalPageSize] = useState(initialPageSize);
  const [selectedRowId, setSelectedRowId] = useState(null);

  const sortModel = controlledSort !== undefined ? controlledSort : internalSort;
  const filterModel = controlledFilter !== undefined ? controlledFilter : internalFilter;
  const page = controlledPage !== undefined ? controlledPage : internalPage;
  const pageSize = internalPageSize;

  const setSortModel = useCallback(
    (next) => {
      if (controlledSort === undefined) setInternalSort(next);
      onSortChange?.(next);
      if (controlledPage === undefined) setInternalPage(0);
      onPageChange?.(0);
    },
    [controlledSort, onSortChange, controlledPage, onPageChange]
  );

  const handleFilterChange = useCallback(
    (field, value) => {
      const next = { ...filterModel };
      if (value == null) delete next[field];
      else next[field] = value;
      if (controlledFilter === undefined) setInternalFilter(next);
      onFilterChange?.(next);
      if (controlledPage === undefined) setInternalPage(0);
      onPageChange?.(0);
    },
    [filterModel, controlledFilter, controlledPage, onFilterChange, onPageChange]
  );

  const handleSort = useCallback(
    (field) => {
      const current = sortModel.find((s) => s.field === field);
      let next;
      if (!current) next = [...sortModel, { field, order: SORT_ORDER_ASC }];
      else if (current.order === SORT_ORDER_ASC) next = sortModel.map((s) => (s.field === field ? { ...s, order: SORT_ORDER_DESC } : s));
      else next = sortModel.filter((s) => s.field !== field);
      setSortModel(next);
    },
    [sortModel, setSortModel]
  );

  const handleClearSort = useCallback(() => setSortModel([]), [setSortModel]);

  const handleClearAllFilters = useCallback(() => {
    const next = {};
    if (controlledFilter === undefined) setInternalFilter(next);
    onFilterChange?.(next);
    if (controlledPage === undefined) setInternalPage(0);
    onPageChange?.(0);
  }, [controlledFilter, onFilterChange, controlledPage, onPageChange]);

  const handleSelect = useCallback(
    (rowId, checked) => {
      setSelection((prev) => {
        const next = new Set(prev);
        if (checked) next.add(rowId);
        else next.delete(rowId);
        onSelectionChange?.(Array.from(next));
        return next;
      });
    },
    [onSelectionChange]
  );

  const handlePageChange = useCallback(
    (p) => {
      if (controlledPage === undefined) setInternalPage(p);
      onPageChange?.(p);
    },
    [controlledPage, onPageChange]
  );

  const handlePageSizeChange = useCallback(
    (size) => {
      setInternalPageSize(size);
      if (controlledPage === undefined) setInternalPage(0);
      onPageChange?.(0);
      onPageSizeChange?.(size);
    },
    [controlledPage, onPageChange, onPageSizeChange]
  );

  const handleRowClick = useCallback(
    (row) => {
      if (onRowSelect) {
        const id = getRowId(row);
        setSelectedRowId(id);
        onRowSelect(id, row);
      }
    },
    [onRowSelect, getRowId]
  );

  const handleRowDoubleClick = useCallback(
    (row) => {
      if (!editable || !onEditCommit) return;
      if (isRowEditable && !isRowEditable(row)) return;
      const id = getRowId(row);
      setEditRowId(id);
      setEditValues({ ...row });
      setValidationErrors([]);
      onEditStart?.(id, row);
    },
    [editable, onEditCommit, getRowId, isRowEditable, onEditStart]
  );

  const handleEditChange = useCallback((field, value) => {
    setEditValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleEditCancel = useCallback(() => {
    const id = editRowId;
    setEditRowId(null);
    setEditValues({});
    setValidationErrors([]);
    onEditCancelProp?.(id);
  }, [editRowId, onEditCancelProp]);

  const handleEditSave = useCallback(() => {
    const errors = validateRow(editValues, columns);
    if (errors.length > 0) {
      onValidationFail?.(editRowId, errors);
      setValidationErrors(errors);
      return;
    }
    setValidationErrors([]);
    onEditCommit?.(editRowId, editValues);
    setEditRowId(null);
    setEditValues({});
  }, [editValues, editRowId, columns, onEditCommit, onValidationFail]);

  const filteredRows = useMemo(
    () => applyFilters(rows, filterModel, columns),
    [rows, filterModel, columns]
  );
  const sortedRows = useMemo(() => applySort(filteredRows, sortModel), [filteredRows, sortModel]);
  const paginationResult = useMemo(
    () => (pagination ? slicePage(sortedRows, page, pageSize) : { rows: sortedRows, total: sortedRows.length, from: 1, to: sortedRows.length }),
    [sortedRows, page, pageSize, pagination]
  );
  const displayRows = paginationResult.rows;

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

  const filterInputHeight = headerConfig?.filterCells?.height || headerConfig?.filterRows?.height;

  const contextValue = useMemo(
    () => ({
      columns,
      translations,
      direction,
      getRowId,
      onSortChange,
      onFilterChange,
      onEditCommit,
      onSelectionChange,
      onPageChange,
      onPageSizeChange,
      editable,
      multiSelectable,
      filterInputHeight,
    }),
    [
      columns,
      translations,
      direction,
      getRowId,
      onSortChange,
      onFilterChange,
      onEditCommit,
      onSelectionChange,
      onPageChange,
      onPageSizeChange,
      editable,
      multiSelectable,
      filterInputHeight,
    ]
  );

  const getEditorForCell = useCallback(
    (col, row, values) => getEditor(col, row, values, handleEditChange, direction),
    [handleEditChange, direction]
  );

  const getHeaderComboSlotForColumn = useCallback(
    (col) => getHeaderComboSlot(col, filterModel, handleFilterChange),
    [filterModel, handleFilterChange]
  );

  const getFilterInputSlotForColumn = useCallback(
    (col, translations) => getFilterInputSlot(col, filterModel, handleFilterChange, direction, translations),
    [filterModel, handleFilterChange, direction]
  );

  const getFilterToInputSlotForColumn = useCallback(
    (col) => getFilterToInputSlot(col, filterModel, handleFilterChange, direction),
    [filterModel, handleFilterChange, direction]
  );

  const hasActiveFilters = Object.keys(filterModel).length > 0;

  const hasActiveRangeFilter = useMemo(() => {
    return Object.values(filterModel).some(
      (state) => state?.operator === OPERATOR_IN_RANGE
    );
  }, [filterModel]);

  const errorSet = useMemo(() => new Set(validationErrors.map((e) => e.field)), [validationErrors]);

  return (
    <ThemeProvider theme={theme}>
      <DataGridProvider value={contextValue}>
        <Box sx={{ ...sx }} dir={direction}>
        <ValidationAlert errors={validationErrors} />
          <GridTable
            rows={displayRows}
            selection={selection}
            onSelect={handleSelect}
            sortModel={sortModel}
            onSort={handleSort}
            onClearSort={handleClearSort}
            onClearAllFilters={handleClearAllFilters}
            hasActiveFilters={hasActiveFilters}
            editRowId={editRowId}
            editValues={editValues}
            getEditor={getEditorForCell}
            validationErrors={errorSet}
            getHeaderComboSlot={getHeaderComboSlotForColumn}
            getFilterInputSlot={getFilterInputSlotForColumn}
            getFilterToInputSlot={getFilterToInputSlotForColumn}
            onRowClick={handleRowClick}
            onRowDoubleClick={handleRowDoubleClick}
            selectedRowId={selectedRowId}
            selectedRowStyle={selectedRowStyle}
            headerStyle={headerStyle}
            headerConfig={headerConfig}
            hasActiveRangeFilter={hasActiveRangeFilter}
          />
          {editable && editRowId != null && (
            <EditToolbar onSave={handleEditSave} onCancel={handleEditCancel} />
          )}
          {pagination && (
            <PaginationBar
              page={page}
              pageSize={pageSize}
              totalRows={paginationResult.total}
              pageSizeOptions={pageSizeOptions}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          )}         
        </Box>
      </DataGridProvider>
    </ThemeProvider>
  );
}
