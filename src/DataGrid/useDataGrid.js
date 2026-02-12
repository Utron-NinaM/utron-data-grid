import { useMemo, useCallback, useState, useEffect } from 'react';
import { applySort } from '../utils/sortUtils';
import debounce from 'lodash/debounce';
import { applyFilters, FILTER_DEBOUNCE_MS } from '../filters/filterUtils';
import { slicePage } from '../pagination/paginationUtils';
import { getHeaderComboSlot, getFilterInputSlot, getFilterToInputSlot } from '../filters/FilterBar';
import { getEditor } from '../editors/CellEditors';
import { validateRow } from '../validation/validateRow';
import { defaultGridConfig } from '../config/defaultConfig';
import { SORT_ORDER_ASC, SORT_ORDER_DESC, OPERATOR_IN_RANGE, DIRECTION_RTL } from '../config/schema';
import { DIRECTION_LTR } from '../config/schema';

const FILTER_STORAGE_KEY_PREFIX = 'utron-datagrid-filters-';

function getStoredFilterModel(gridId, columns) {
  if (!gridId || typeof localStorage === 'undefined') return {};
  try {
    const raw = localStorage.getItem(FILTER_STORAGE_KEY_PREFIX + gridId);
    if (raw == null) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const fieldSet = new Set((columns || []).map((c) => c.field));
    const filtered = {};
    for (const [key, val] of Object.entries(parsed)) {
      if (fieldSet.has(key) && val != null && typeof val === 'object') filtered[key] = val;
    }
    return filtered;
  } catch {
    return {};
  }
}

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
    direction = DIRECTION_LTR,
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
    onPageChange,
    onPageSizeChange,
    headerStyle,
    headerConfig,
    selectedRowStyle,
    gridId,
  } = props;

  const [internalSort, setInternalSort] = useState([]);
  const [internalFilter, setInternalFilter] = useState(() => getStoredFilterModel(props.gridId, props.columns));
  const [selection, setSelection] = useState(new Set());
  const [editRowId, setEditRowId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [validationErrors, setValidationErrors] = useState([]);
  const [internalPage, setInternalPage] = useState(0);
  const [internalPageSize, setInternalPageSize] = useState(initialPageSize);
  const [selectedRowId, setSelectedRowId] = useState(null);

  const sortModel = internalSort;
  const filterModel = internalFilter;
  const page = internalPage;
  const pageSize = internalPageSize;

  const [debouncedFilterModel, setDebouncedFilterModel] = useState(filterModel);
  
  useEffect(() => {
    const isEmpty = !filterModel || Object.keys(filterModel).length === 0;
    if (isEmpty) {
      setDebouncedFilterModel(filterModel);
      return;
    }
    const apply = debounce(() => setDebouncedFilterModel(filterModel), FILTER_DEBOUNCE_MS);
    apply();
    return () => apply.cancel();
  }, [filterModel]);

  useEffect(() => {
    if (gridId && typeof localStorage !== 'undefined') {
      localStorage.setItem(FILTER_STORAGE_KEY_PREFIX + gridId, JSON.stringify(filterModel));
    }
  }, [filterModel, gridId]);

  const setSortModel = useCallback(
    (next) => {
      setInternalSort(next);
      onSortChange?.(next);
      setInternalPage(0);
      onPageChange?.(0);
    },
    [onSortChange, onPageChange]
  );

  const handleFilterChange = useCallback(
    (field, value) => {
      const next = { ...filterModel };
      if (value == null) delete next[field];
      else next[field] = value;
      setInternalFilter(next);
      onFilterChange?.(next);
      setInternalPage(0);
      onPageChange?.(0);
    },
    [filterModel, onFilterChange, onPageChange]
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
    setInternalFilter(next);
    onFilterChange?.(next);
    setInternalPage(0);
    onPageChange?.(0);
  }, [onFilterChange, onPageChange]);

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
      setInternalPage(p);
      onPageChange?.(p);
    },
    [onPageChange]
  );

  const handlePageSizeChange = useCallback(
    (size) => {
      setInternalPageSize(size);
      setInternalPage(0);
      onPageChange?.(0);
      onPageSizeChange?.(size);
    },
    [onPageChange, onPageSizeChange]
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
    () => applyFilters(rows, debouncedFilterModel, columns),
    [rows, debouncedFilterModel, columns]
  );
  const sortedRows = useMemo(() => applySort(filteredRows, sortModel), [filteredRows, sortModel]);
  const paginationResult = useMemo(
    () => (pagination ? slicePage(sortedRows, page, pageSize) : { rows: sortedRows, total: sortedRows.length, from: 1, to: sortedRows.length }),
    [sortedRows, page, pageSize, pagination]
  );
  const displayRows = paginationResult.rows;
  
  const rowStylesMap = useMemo(() => {    
    const map = new Map();
    displayRows.forEach((row) => {
      const rowId = getRowId(row);
      const computedRowSx = columns.reduce(
        (acc, col) =>
          typeof col.rowStyle === 'function' ? { ...acc, ...col.rowStyle(row) } : acc,
        {}
      );
      const finalRowSx = Object.keys(computedRowSx).length ? computedRowSx : undefined;
      map.set(rowId, finalRowSx);
    });
    return map;
  }, [displayRows, columns, getRowId]);

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
    [filterModel, handleFilterChange, direction, translations]
  );

  const getFilterToInputSlotForColumn = useCallback(
    (col) => getFilterToInputSlot(col, filterModel, handleFilterChange, direction),
    [filterModel, handleFilterChange, direction]
  );
  
  const sortOrderIndexMap = useMemo(() => {
    const map = new Map();
    if (sortModel?.length > 0) {
      sortModel.forEach((sort, index) => {
        map.set(sort.field, index + 1);
      });
    }
    return map;
  }, [sortModel]);

  const columnSortDirMap = useMemo(() => {
    const map = new Map();
    if (sortModel?.length > 0) {
      sortModel.forEach((sort) => {
        map.set(sort.field, sort.order);
      });
    }
    return map;
  }, [sortModel]);

  const columnAlignMap = useMemo(() => {
    const map = new Map();
    columns.forEach((col) => {
      map.set(col.field, col.align ?? (direction === DIRECTION_RTL ? 'right' : 'left'));
    });
    return map;
  }, [columns, direction]);

  const headerCellSxMap = useMemo(() => {    
    const map = new Map();
    const mainRowHeight = headerConfig?.mainRow?.height;
    columns.forEach((col) => {
      map.set(col.field, {
        verticalAlign: 'top',
        padding: mainRowHeight ? '2px' : '4px',
        width: 'inherit',
        maxWidth: 'inherit',
        overflow: 'hidden',
        boxSizing: 'border-box',
        ...(headerConfig?.mainRow?.backgroundColor && { backgroundColor: headerConfig.mainRow.backgroundColor }),
        ...(mainRowHeight && { height: mainRowHeight, maxHeight: mainRowHeight }),
        ...headerStyle,
      });
    });
    return map;
  }, [columns, headerConfig, headerStyle]);

  const filterCellSxMap = useMemo(() => {
    const map = new Map();
    const filterRowHeight = headerConfig?.filterRows?.height || headerConfig?.filterCells?.height;
    columns.forEach((col) => {
      map.set(col.field, {
        verticalAlign: 'top',
        padding: filterRowHeight ? '2px' : '4px',
        width: 'inherit',
        maxWidth: 'inherit',
        overflow: 'hidden',
        boxSizing: 'border-box',
        ...(headerConfig?.filterCells?.backgroundColor && { backgroundColor: headerConfig.filterCells.backgroundColor }),
        ...(filterRowHeight && { height: filterRowHeight, maxHeight: filterRowHeight }),
        ...headerStyle,
      });
    });
    return map;
  }, [columns, headerConfig, headerStyle]);

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
      rowStylesMap,
      sortOrderIndexMap,
      columnSortDirMap,
      columnAlignMap,
      headerCellSxMap,
      filterCellSxMap,
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
      rowStylesMap,
      sortOrderIndexMap,
      columnSortDirMap,
      columnAlignMap,
      headerCellSxMap,
      filterCellSxMap,
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
