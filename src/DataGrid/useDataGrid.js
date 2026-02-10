import { useMemo, useCallback,  useState, useRef } from 'react';
import { applySort } from '../utils/sortUtils';
import { applyFilters } from '../filters/filterUtils';
import { slicePage } from '../pagination/paginationUtils';
import { getHeaderComboSlot, getFilterInputSlot, getFilterToInputSlot } from '../filters/FilterBar';
import { getEditor } from '../editors/CellEditors';
import { validateRow } from '../validation/validateRow';
import { defaultGridConfig } from '../config/defaultConfig';
import { SORT_ORDER_ASC, SORT_ORDER_DESC, OPERATOR_IN_RANGE } from '../config/schema';

/**
 * Custom hook for DataGrid state management and business logic
 * @param {Object} props
 * @returns {Object} Grid state, handlers, and computed values
 */
export function useDataGrid(props) {
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

  // Refs for editValues and validationErrors to avoid prop changes triggering rerenders
  const editValuesRef = useRef({});
  const validationErrorsRef = useRef([]);
  const editValuesVersionRef = useRef(0);
  
  // Update refs when values change and increment version for editValues
  if (editValuesRef.current !== editValues) {
    editValuesRef.current = editValues;
    editValuesVersionRef.current += 1;
  }
  validationErrorsRef.current = validationErrors;

  const sortModel = controlledSort !== undefined ? controlledSort : internalSort;
  const filterModel = controlledFilter !== undefined ? controlledFilter : internalFilter;
  const page = controlledPage !== undefined ? controlledPage : internalPage;
  const pageSize = internalPageSize;

  const renderCount = useRef(0);
  renderCount.current++;
  if (renderCount.current === 1 || renderCount.current % 10 === 0) {
    console.log('[useDataGrid] Render #', renderCount.current);
  }

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
    (field, multiColumn = false) => {
      const current = sortModel.find((s) => s.field === field);
      let next;
      
      if (!multiColumn) {
        // Single click: replace entire sortModel with only this column
        if (!current) {
          next = [{ field, order: SORT_ORDER_ASC }];
        } else if (current.order === SORT_ORDER_ASC) {
          next = [{ field, order: SORT_ORDER_DESC }];
        } else {
          next = [];
        }
      } else {
        // Ctrl+click: add/update column in multi-column sort
        if (!current) next = [...sortModel, { field, order: SORT_ORDER_ASC }];
        else if (current.order === SORT_ORDER_ASC) next = sortModel.map((s) => (s.field === field ? { ...s, order: SORT_ORDER_DESC } : s));
        else next = sortModel.filter((s) => s.field !== field);
      }
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
      console.log('[useDataGrid] handleRowClick called for row:', getRowId(row));
      if (onRowSelect) {
        const id = getRowId(row);        
        setSelectedRowId(id);
        onRowSelect(id, row);
      }
    },
    [onRowSelect, getRowId]
  );
  
  // Debug: Track callback recreation
  const handleRowClickRef = useRef(handleRowClick);
  if (handleRowClickRef.current !== handleRowClick) {
    console.log('[useDataGrid] ⚠️ handleRowClick callback RECREATED (dependency changed)');
    handleRowClickRef.current = handleRowClick;
  }

  const handleRowDoubleClick = useCallback(
    (row) => {
      if (!editable || !onEditCommit) return;
      if (isRowEditable && !isRowEditable(row)) return;
      const id = getRowId(row);
      console.log('[useDataGrid] handleRowDoubleClick called for row:', id);
      setEditRowId(id);
      setEditValues({ ...row });
      setValidationErrors([]);
      onEditStart?.(id, row);
    },
    [editable, onEditCommit, getRowId, isRowEditable, onEditStart]
  );
  
  // Debug: Track callback recreation
  const handleRowDoubleClickRef = useRef(handleRowDoubleClick);
  if (handleRowDoubleClickRef.current !== handleRowDoubleClick) {
    console.log('[useDataGrid] ⚠️ handleRowDoubleClick callback RECREATED (dependency changed)');
    handleRowDoubleClickRef.current = handleRowDoubleClick;
  }

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

  const filterInputHeight = headerConfig?.filterCells?.height || headerConfig?.filterRows?.height;

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

  // Stable context - values that rarely change
  const stableContextValue = useMemo(
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
      onRowSelect,
      getEditor: getEditorForCell,
      onClearSort: handleClearSort,
      onClearAllFilters: handleClearAllFilters,
      selectedRowStyle,
      headerStyle,
      headerConfig,
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
      onRowSelect,
      getEditorForCell,
      handleClearSort,
      handleClearAllFilters,
      selectedRowStyle,
      headerStyle,
      headerConfig,
    ]
  );

  // Filter context - functions that change when filterModel changes
  const filterContextValue = useMemo(
    () => ({
      getHeaderComboSlot: getHeaderComboSlotForColumn,
      getFilterInputSlot: getFilterInputSlotForColumn,
      getFilterToInputSlot: getFilterToInputSlotForColumn,
    }),
    [
      getHeaderComboSlotForColumn,
      getFilterInputSlotForColumn,
      getFilterToInputSlotForColumn,
    ]
  );

  const hasActiveFilters = Object.keys(filterModel).length > 0;

  const hasActiveRangeFilter = useMemo(() => {
    return Object.values(filterModel).some(
      (state) => state?.operator === OPERATOR_IN_RANGE
    );
  }, [filterModel]);

  const errorSet = useMemo(() => new Set(validationErrors.map((e) => e.field)), [validationErrors]);

  return {
    // State
    selection,
    editRowId,
    editValues,
    validationErrors,
    selectedRowId,
    sortModel,
    filterModel,
    page,
    pageSize,
    pageSizeOptions,
    
    // Refs (for GridTable to avoid prop changes)
    editValuesRef,
    validationErrorsRef,
    editValuesVersion: editValuesVersionRef.current,
    
    // Computed values
    displayRows,
    paginationResult,
    stableContextValue,
    filterContextValue,
    hasActiveFilters,
    hasActiveRangeFilter,
    errorSet,
    
    // Handlers
    handleSelect,
    handleSort,
    handlePageChange,
    handlePageSizeChange,
    handleRowClick,
    handleRowDoubleClick,
    handleEditSave,
    handleEditCancel,
  };
}
