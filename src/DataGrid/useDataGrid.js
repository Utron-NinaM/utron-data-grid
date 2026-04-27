import { useMemo, useCallback, useState, useEffect, useRef, useSyncExternalStore } from 'react';
import { applySort, getResolvedSortModelForMount, getStoredSortModel, saveSortModel, sanitizeSortModel } from '../utils/sortUtils';
import { getStoredColumnWidthState, saveColumnWidthState } from '../utils/columnWidthStorage';
import debounce from 'lodash/debounce';
import { applyFilters, FILTER_DEBOUNCE_MS, getStoredFilterModel, saveFilterModel } from '../filters/filterUtils';
import { slicePage } from '../pagination/paginationUtils';
import { getHeaderComboSlot, getFilterInputSlot, getFilterToInputSlot } from '../filters/FilterBar';
import { getEditor } from '../editors/CellEditors';
import { defaultGridConfig } from '../config/defaultConfig';
import { EDITOR_OUTLINE_BORDER_PX } from '../constants';
import { SORT_ORDER_ASC, SORT_ORDER_DESC, OPERATOR_IN_RANGE, OPERATOR_PERIOD, DIRECTION_LTR, FIELD_TYPE_LIST } from '../config/schema';
import { getOptionMap } from '../utils/optionUtils';
import { useDataGridMaps } from './useDataGridMaps';
import { useDataGridEdit } from './useDataGridEdit';
import { useColumnLayout } from './useColumnLayout';
import { createSelectionStore } from './selectionStore';
import { createEditStore } from './editStore';

function parsePx(v) {
  if (v == null) return 0;
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  const m = String(v).match(/^([\d.]+)px?$/i);
  return m ? Number(m[1]) : 0;
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
    onFilterChange,
    onEditCommit,
    onEditStart,
    onEditCancel: onEditCancelProp,
    onValidationFail,
    isRowEditable,
    onSelectionChange,
    onRowClick,
    onRowDoubleClick,
    getRowId,
    editable = defaultGridConfig.editable,
    filters = defaultGridConfig.filters ?? true,
    fitToContainer = defaultGridConfig.fitToContainer,
    multiSelectable = defaultGridConfig.multiSelectable,
    pagination = defaultGridConfig.pagination,
    pageSize: initialPageSize = defaultGridConfig.pageSize,
    pageSizeOptions = defaultGridConfig.pageSizeOptions,
    onPageSizeChange,
    headerConfig,
    bodyRow,
    selectedRowStyle,
    disableRowHover = false,
    rowHoverStyle,
    gridId,
    initialSortModel,
    toolbarActions,
    toolbarClearButtonsSx,
    toolbarExportButtonSx,
    toolbarPdfExportButtonSx,
    toolbarConfigButtonSx,
    showExportToExcel = defaultGridConfig.showExportToExcel ?? false,
    showExportToPdf = defaultGridConfig.showExportToPdf ?? false,
    onColumnConfigClick,
    editToolbarSaveButtonSx,
    editToolbarCancelButtonSx,
    fontSize = defaultGridConfig.fontSize,
    dropdownBoundaryRef,
    rowDoubleClickDelay = 250,
    rowClickSelectionMode = 'suppressWhenDoubleClick',
  } = props;

  const [internalSort, setInternalSort] = useState(() =>
    getResolvedSortModelForMount(props.gridId, props.columns, props.initialSortModel)
  );
  // false when sort came from initialSortModel (silent default), true when user has actively sorted.
  // Drives both persistence (skip saving the default) and the Clear Sort button disabled state.
  const [hasUserSort, setHasUserSort] = useState(
    () => getStoredSortModel(props.gridId, props.columns).length > 0
  );
  // Ref mirrors hasUserSort for use in the persistence effect without adding it to effect deps.
  const isDefaultSortRef = useRef(!hasUserSort);

  const columnFieldsSignature = useMemo(() => (columns ?? []).map((c) => c.field).join('\0'), [columns]);

  useEffect(() => {
    setInternalSort((prev) => sanitizeSortModel(prev, columns));
  }, [columnFieldsSignature]);
  const [internalFilter, setInternalFilter] = useState(() => getStoredFilterModel(props.gridId, props.columns));
  const [selection, setSelection] = useState(new Set());
  const [internalPage, setInternalPage] = useState(0);
  const [internalPageSize, setInternalPageSize] = useState(initialPageSize);
  // Selection store (external, no React state) so selection changes don't re-render GridTable
  const selectionStoreRef = useRef(null);
  if (!selectionStoreRef.current) {
    selectionStoreRef.current = createSelectionStore(null);
  }
  const selectionStore = selectionStoreRef.current;
  const editStoreRef = useRef(null);
  if (!editStoreRef.current) {
    editStoreRef.current = createEditStore();
  }
  const editStore = editStoreRef.current;

  const isEditing = useSyncExternalStore(
    editStore?.subscribe ?? (() => () => {}),
    () => editStore?.getSnapshot?.()?.editRowId != null ?? false,
    () => false
  );

  // Column width state: Map<field, width> for resized width overrides only (not full widths)
  const [columnWidthState, setColumnWidthState] = useState(() => getStoredColumnWidthState(props.gridId, props.columns));
  // Container ref for ResizeObserver (created here, passed to GridTable via context)
  const containerRef = useRef(null);
  // Scroll container ref for accurate width when body scrolls (useScrollableLayout); GridTable populates it
  const scrollContainerRef = useRef(null);
  const [scrollContainerReady, setScrollContainerReady] = useState(false);
  // Refs for col elements to enable column-wide width updates during resize
  const colRefs = useRef(new Map());
  // Ref for column currently being resized (field name or null); prevents layout from overwriting DOM width during drag
  const resizingColumnRef = useRef(null);
  // Ref for pending onRowClick timer; used to cancel it when a double-click arrives
  const rowClickTimerRef = useRef(null);

  const { handleRowDoubleClick, handleEditChange, handleCellBlur, handleEditCancel, handleEditSave } = useDataGridEdit({
    editStore,
    editable,
    onEditCommit,
    onEditStart,
    onEditCancel: onEditCancelProp,
    onValidationFail,
    isRowEditable,
    getRowId,
    columns,
    onRowDoubleClick,
  });

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
    saveFilterModel(gridId, filterModel);
  }, [filterModel, gridId]);

  useEffect(() => {
    if (!isDefaultSortRef.current) {
      saveSortModel(gridId, sortModel);
    }
  }, [sortModel, gridId]);

  useEffect(() => {
    saveColumnWidthState(gridId, columnWidthState);
  }, [gridId, columnWidthState]);

  const setSortModel = useCallback((next) => {
    setInternalSort(next);
    setInternalPage(0);
  }, []);

  const handleFilterChange = useCallback(
    (field, value) => {
      const next = { ...filterModel };
      if (value == null) delete next[field];
      else next[field] = value;
      setInternalFilter(next);
      setInternalPage(0);
    },
    [filterModel]
  );

  const handleSort = useCallback(
    (field, multiColumn = false) => {
      isDefaultSortRef.current = false;
      setHasUserSort(true);
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

  const handleClearSort = useCallback(() => {
    const next = sanitizeSortModel(initialSortModel, columns);
    saveSortModel(gridId, []); // clear any stored user preference
    isDefaultSortRef.current = true;
    setHasUserSort(false);
    setSortModel(next.length > 0 ? next : []);
  }, [columns, gridId, initialSortModel, setSortModel]);

  const handleClearAllFilters = useCallback(() => {
    setInternalFilter({});
    setInternalPage(0);
  }, []);

  const handleClearColumnWidths = useCallback(() => setColumnWidthState(new Map()), []);

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

  const handleClearMultiSelection = useCallback(() => {
    setSelection(new Set());
    onSelectionChange?.([]);
  }, [onSelectionChange]);

  const handlePageChange = useCallback((p) => setInternalPage(p), []);

  const handlePageSizeChange = useCallback(
    (size) => {
      setInternalPageSize(size);
      setInternalPage(0);
      onPageSizeChange?.(size);
    },
    [onPageSizeChange]
  );

  const clearRowClickTimer = useCallback(() => {
    if (rowClickTimerRef.current) {
      clearTimeout(rowClickTimerRef.current);
      rowClickTimerRef.current = null;
    }
  }, []);

  const selectRow = useCallback(
    (id, row = null) => {
      // Prevent selection changes when editing is active, unless selecting the editing row itself
      const editSnapshot = editStore.getSnapshot();
      if (editSnapshot.editRowId != null && String(editSnapshot.editRowId) !== String(id)) {
        return;
      }
      selectionStoreRef.current.set(id);
      if (!onRowClick || !row) return;
      if (onRowDoubleClick && rowClickSelectionMode === 'suppressWhenDoubleClick') {
        // Delay so a following dblclick can cancel before onRowClick fires
        clearRowClickTimer();
        rowClickTimerRef.current = window.setTimeout(() => {
          rowClickTimerRef.current = null;
          onRowClick(id, row);
        }, rowDoubleClickDelay);
      } else {
        onRowClick(id, row);
      }
    },
    [onRowClick, onRowDoubleClick, rowClickSelectionMode, rowDoubleClickDelay, editStore, clearRowClickTimer]
  );

  const handleColumnResize = useCallback(
    (field, newWidth) => {
      // CRITICAL: Always create new Map instance for React reference equality
      // Functional update pattern avoids dependencies
      setColumnWidthState((prev) => {
        const next = new Map(prev);
        next.set(field, newWidth);
        return next; // New Map instance every time
      });
    },
    [] // No dependencies needed - functional update pattern
  );

  // Wrapper: cancel any pending onRowClick, set selection highlight, optionally enter edit, clear checkbox selection
  const handleRowDoubleClickWrapper = useCallback(
    (row) => {
      clearRowClickTimer();
      const id = getRowId(row);
      selectionStoreRef.current.set(id);
      if (editable && onEditCommit) {
        handleRowDoubleClick(row);
        if (selection.size > 0) {
          setTimeout(() => {
            setSelection(new Set());
            onSelectionChange?.([]);
          }, 0);
        }
      } else {
        if (onRowDoubleClick) {
          onRowDoubleClick(row);
        }
      }
    },
    [clearRowClickTimer, getRowId, onRowDoubleClick, handleRowDoubleClick, editable, onEditCommit, selection.size, onSelectionChange]
  );

  useEffect(() => {
    return () => clearRowClickTimer();
  }, [clearRowClickTimer]);

  const handleValidationErrorClick = useCallback((rowId, _field) => {
    const container = containerRef?.current;
    if (!container) return;
    const rowEl = container.querySelector(`[data-row-id="${rowId}"]`);
    if (rowEl) {
      rowEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, []);

  const filteredRows = useMemo(
    () => applyFilters(rows, debouncedFilterModel, columns),
    [rows, debouncedFilterModel, columns]
  );

  useEffect(() => {
    onFilterChange?.(filterModel, {
      filteredRowCount: filteredRows.length,
      filteredRows,
    });
  }, [filterModel, filteredRows, onFilterChange]);

  const sortedRows = useMemo(() => applySort(filteredRows, sortModel), [filteredRows, sortModel]);
  const paginationResult = useMemo(
    () => (pagination ? slicePage(sortedRows, page, pageSize) : { rows: sortedRows, total: sortedRows.length, from: 1, to: sortedRows.length }),
    [sortedRows, page, pageSize, pagination]
  );
  const displayRows = paginationResult.rows;

  const hasHeightConstraint = useMemo(
    () => Boolean(props.sx && (props.sx.height != null || props.sx.maxHeight != null)),
    [props.sx]
  );

  // Calculate column widths using layout algorithm
  const { columnWidthMap: layoutColumnWidthMap, totalWidth, enableHorizontalScroll } = useColumnLayout({
    columns,
    containerRef,
    columnWidthState,
    multiSelectable,
    reserveScrollbarWidth: hasHeightConstraint,
    scrollContainerRef,
    scrollContainerReady,
    filters,
    fitToContainer,
  });

  const effectiveBodyRow = bodyRow ?? defaultGridConfig.bodyRow;

  const editorContentHeightPx = useMemo(() => {
    const row = effectiveBodyRow;
    if (row?.height == null) return undefined;
    const rowHeightPx = parsePx(row.height);
    const paddingTopPx = parsePx(row.paddingTop);
    const paddingBottomPx = parsePx(row.paddingBottom);
    // Match body cell content height minus outline so edited row height matches non-edited
    const content = rowHeightPx - paddingTopPx - paddingBottomPx - EDITOR_OUTLINE_BORDER_PX;
    return content > 0 ? content : undefined;
  }, [effectiveBodyRow]);

  const {
    sortOrderIndexMap,
    columnSortDirMap,
    columnAlignMap,
    headerCellSxMap,
    filterCellSxMap,
    bodyCellSxMap,
    rowStylesMap,
    columnWidthMap,
  } = useDataGridMaps({
    columns,
    sortModel,
    direction,
    headerConfig,
    bodyRow: effectiveBodyRow,
    displayRows,
    getRowId,
    columnWidthMap: layoutColumnWidthMap, // Pass layout-calculated widths
    filters,
  });

  const filterInputHeight = headerConfig?.filterCells?.height || headerConfig?.filterRows?.height;

  const getEditorForCell = useCallback(
    (col, row, values) =>
      getEditor(col, row, values, handleEditChange, direction, fontSize, {
        contentHeightPx: editorContentHeightPx,
        onBlur: () => handleCellBlur(getRowId(row), col.field),
      }),
    [handleEditChange, handleCellBlur, getRowId, direction, fontSize, editorContentHeightPx]
  );

  const getHeaderComboSlotForColumn = useCallback(
    (col) => getHeaderComboSlot(col, filterModel, handleFilterChange),
    [filterModel, handleFilterChange]
  );

  const getFilterInputSlotForColumn = useCallback(
    (col, translations, direction) => getFilterInputSlot(col, filterModel, handleFilterChange, direction, translations),
    [filterModel, handleFilterChange, direction, translations]
  );

  const getFilterToInputSlotForColumn = useCallback(
    (col, translations, direction) => getFilterToInputSlot(col, filterModel, handleFilterChange, direction, translations),
    [filterModel, handleFilterChange, direction]
  );

  const listColumnOptionMaps = useMemo(() => {
    const map = new Map();
    columns.forEach((col) => {
      if (col.type === FIELD_TYPE_LIST && Array.isArray(col.options) && col.options.length > 0) {
        map.set(col.field, getOptionMap(col.options));
      }
    });
    return map;
  }, [columns]);

  // Stable context - values that rarely change
  const stableContextValue = useMemo(
    () => ({
      columns,
      translations,
      direction,
      getRowId,
      onFilterChange,
      onEditCommit,
      onSelectionChange,
      onPageSizeChange,
      editable,
      filters,
      multiSelectable,
      filterInputHeight,
      onRowClick,
      onRowDoubleClick,
      getEditor: getEditorForCell,
      onClearSort: handleClearSort,
      onClearAllFilters: handleClearAllFilters,
      onClearColumnWidths: handleClearColumnWidths,
      hasResizedColumns: columnWidthState.size > 0,
      selectedRowStyle,
      disableRowHover,
      rowHoverStyle,
      headerConfig,
      rowStylesMap,
      sortOrderIndexMap,
      columnSortDirMap,
      columnAlignMap,
      headerCellSxMap,
      filterCellSxMap,
      bodyCellSxMap,
      columnWidthMap: layoutColumnWidthMap, // Use layout-calculated widths
      listColumnOptionMaps, // Map<field, optionMap> for list columns (key -> label)
      containerRef, // Container ref for ResizeObserver
      scrollContainerRef, // Body scroll container ref (for layout width when useScrollableLayout)
      setScrollContainerReady, // Called by GridTable when scroll container mounts
      colRefs, // Refs for col elements (Map of field -> col element)
      resizingColumnRef, // Ref: field name of column being resized, or null
      onColumnResize: handleColumnResize, // Resize handler
      totalWidth, // Total width for scroll calculation
      enableHorizontalScroll, // Whether to enable horizontal scroll
      toolbarActions,
      toolbarClearButtonsSx,
      toolbarExportButtonSx,
      toolbarPdfExportButtonSx,
      toolbarConfigButtonSx,
      showExportToExcel,
      showExportToPdf,
      onColumnConfigClick,
      editToolbarSaveButtonSx,
      editToolbarCancelButtonSx,
      fontSize,
      bodyRow: effectiveBodyRow,
      dropdownBoundaryRef,
      selectionStore,
      selectRow,
      editStore,
      isEditing,
      handleEditSave,
      handleEditCancel,
      handleValidationErrorClick,
      sortedRows, // All filtered and sorted rows (before pagination) for CSV export
    }),
    [
      columns,
      listColumnOptionMaps,
      translations,
      direction,
      getRowId,
      onFilterChange,
      onEditCommit,
      onSelectionChange,
      onPageSizeChange,
      editable,
      filters,
      multiSelectable,
      filterInputHeight,
      onRowClick,
      onRowDoubleClick,
      getEditorForCell,
      handleClearSort,
      handleClearAllFilters,
      handleClearColumnWidths,
      columnWidthState,
      selectedRowStyle,
      disableRowHover,
      rowHoverStyle,
      headerConfig,
      rowStylesMap,
      sortOrderIndexMap,
      columnSortDirMap,
      columnAlignMap,
      headerCellSxMap,
      filterCellSxMap,
      bodyCellSxMap,
      layoutColumnWidthMap,
      containerRef,
      scrollContainerRef,
      scrollContainerReady,
      colRefs,
      resizingColumnRef,
      handleColumnResize,
      totalWidth,
      enableHorizontalScroll,
      toolbarActions,
      toolbarClearButtonsSx,
      toolbarExportButtonSx,
      toolbarPdfExportButtonSx,
      toolbarConfigButtonSx,
      showExportToExcel,
      showExportToPdf,
      onColumnConfigClick,
      editToolbarSaveButtonSx,
      editToolbarCancelButtonSx,
      fontSize,
      dropdownBoundaryRef,
      selectionStore,
      selectRow,
      editStore,
      isEditing,
      handleEditSave,
      handleEditCancel,
      handleValidationErrorClick,
      sortedRows,
      effectiveBodyRow,
    ]
  );

  // Filter context - functions that change when filterModel changes
  const filterContextValue = useMemo(
    () =>
      filters
        ? {
            getHeaderComboSlot: getHeaderComboSlotForColumn,
            getFilterInputSlot: getFilterInputSlotForColumn,
            getFilterToInputSlot: getFilterToInputSlotForColumn,
          }
        : {
            getHeaderComboSlot: null,
            getFilterInputSlot: null,
            getFilterToInputSlot: null,
          },
    [
      filters,
      getHeaderComboSlotForColumn,
      getFilterInputSlotForColumn,
      getFilterToInputSlotForColumn,
    ]
  );

  const hasActiveFilters = Object.keys(filterModel).length > 0;

  const hasActiveRangeFilter = useMemo(() => {
    return Object.values(filterModel).some(
      (state) => state?.operator === OPERATOR_IN_RANGE || state?.operator === OPERATOR_PERIOD
    );
  }, [filterModel]);

  return {
    // State
    selection,
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

    // Handlers
    handleSelect,
    handleClearMultiSelection,
    handleSort,
    handleFilterChange,
    handlePageChange,
    handlePageSizeChange,
    selectRow,
    handleRowDoubleClick: handleRowDoubleClickWrapper,
    handleEditSave,
    handleEditCancel,
    handleValidationErrorClick,
    handleClearSort,
    handleClearAllFilters,
    handleClearColumnWidths,
    hasUserSort,
  };
}
