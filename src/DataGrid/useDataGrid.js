import { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { applySort, getStoredSortModel, saveSortModel } from '../utils/sortUtils';
import { getStoredColumnWidthState, saveColumnWidthState } from '../utils/columnWidthStorage';
import debounce from 'lodash/debounce';
import { applyFilters, FILTER_DEBOUNCE_MS, getStoredFilterModel, saveFilterModel } from '../filters/filterUtils';
import { slicePage } from '../pagination/paginationUtils';
import { getHeaderComboSlot, getFilterInputSlot, getFilterToInputSlot } from '../filters/FilterBar';
import { getEditor } from '../editors/CellEditors';
import { defaultGridConfig } from '../config/defaultConfig';
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
    onSortChange,
    onFilterChange,
    onEditCommit,
    onEditStart,
    onEditCancel: onEditCancelProp,
    onValidationFail,
    isRowEditable,
    onSelectionChange,
    onRowSelect,
    onRowDoubleClick,
    getRowId,
    editable = defaultGridConfig.editable,
    filters = defaultGridConfig.filters ?? true,
    fitToContainer = defaultGridConfig.fitToContainer,
    multiSelectable = defaultGridConfig.multiSelectable,
    pagination = defaultGridConfig.pagination,
    pageSize: initialPageSize = defaultGridConfig.pageSize,
    pageSizeOptions = defaultGridConfig.pageSizeOptions,
    onPageChange,
    onPageSizeChange,
    headerConfig,
    bodyRow,
    selectedRowStyle,
    disableRowHover = false,
    rowHoverStyle,
    gridId,
    toolbarActions,
    toolbarClearButtonsSx,
    fontSize = defaultGridConfig.fontSize,
    showHorizontalScrollbar = defaultGridConfig.showHorizontalScrollbar,
  } = props;

  const [internalSort, setInternalSort] = useState(() => getStoredSortModel(props.gridId, props.columns));
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

  const { handleRowDoubleClick, handleEditChange, handleEditCancel, handleEditSave } = useDataGridEdit({
    editStore,
    editable,
    onEditCommit,
    onEditStart,
    onEditCancel: onEditCancelProp,
    onValidationFail,
    isRowEditable,
    getRowId,
    columns,
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
    saveSortModel(gridId, sortModel);
  }, [sortModel, gridId]);

  useEffect(() => {
    saveColumnWidthState(gridId, columnWidthState);
  }, [gridId, columnWidthState]);

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

  const selectRow = useCallback(
    (id, row = null) => {
      selectionStoreRef.current.set(id);
      if (onRowSelect && row) onRowSelect(id, row);
    },
    [onRowSelect]
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

  // Wrapper: set selection highlight, optionally enter edit, clear checkbox selection without causing sync re-render
  const handleRowDoubleClickWrapper = useCallback(
    (row) => {
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
      }
      queueMicrotask(() => {
        if (onRowSelect) onRowSelect(id, row);
        if (onRowDoubleClick) onRowDoubleClick(row);
      });
    },
    [getRowId, onRowSelect, onRowDoubleClick, handleRowDoubleClick, editable, onEditCommit, selection.size, onSelectionChange]
  );

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
    // Subtract 1px for MUI input outline border so edited row height matches non-edited
    const content = rowHeightPx - paddingTopPx - paddingBottomPx - 1;
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
      getEditor(col, row, values, handleEditChange, direction, fontSize, { contentHeightPx: editorContentHeightPx }),
    [handleEditChange, direction, fontSize, editorContentHeightPx]
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
      onSortChange,
      onFilterChange,
      onEditCommit,
      onSelectionChange,
      onPageChange,
      onPageSizeChange,
      editable,
      filters,
      multiSelectable,
      filterInputHeight,
      onRowSelect,
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
      showHorizontalScrollbar,
      toolbarActions,
      toolbarClearButtonsSx,
      fontSize,
      selectionStore,
      selectRow,
      editStore,
      handleEditSave,
      handleEditCancel,
    }),
    [
      columns,
      listColumnOptionMaps,
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
      filters,
      multiSelectable,
      filterInputHeight,
      onRowSelect,
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
      showHorizontalScrollbar,
      toolbarActions,
      toolbarClearButtonsSx,
      fontSize,
      selectionStore,
      selectRow,
      editStore,
      handleEditSave,
      handleEditCancel,
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
    handleSort,
    handleFilterChange,
    handlePageChange,
    handlePageSizeChange,
    selectRow,
    handleRowDoubleClick: handleRowDoubleClickWrapper,
    handleEditSave,
    handleEditCancel,
    handleClearSort,
    handleClearAllFilters,
    handleClearColumnWidths,
  };
}
