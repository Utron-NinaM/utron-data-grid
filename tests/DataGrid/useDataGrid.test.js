import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDataGrid } from '../../src/DataGrid/useDataGrid';
import { OPERATOR_IN_RANGE } from '../../src/config/schema';

vi.mock('lodash/debounce', () => ({
  default: (fn) => {
    const wrapped = (...args) => fn(...args);
    wrapped.cancel = () => {};
    return wrapped;
  },
}));

vi.mock('../../src/utils/sortUtils', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getStoredSortModel: () => [],
    saveSortModel: () => {},
  };
});

vi.mock('../../src/filters/filterUtils', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getStoredFilterModel: () => ({}),
    saveFilterModel: () => {},
  };
});

const defaultRows = [
  { id: 1, name: 'Alice', score: 10 },
  { id: 2, name: 'Bob', score: 20 },
  { id: 3, name: 'Carol', score: 30 },
];
const defaultColumns = [
  { field: 'name', headerName: 'Name' },
  { field: 'score', headerName: 'Score' },
];
const defaultGetRowId = (row) => row.id;

describe('useDataGrid', () => {
  describe('initial state', () => {
    it('returns empty sortModel, filterModel, page 0, and displayRows from rows when no sort/filter', () => {
      const { result } = renderHook(useDataGrid, {
        initialProps: {
          rows: defaultRows,
          columns: defaultColumns,
          getRowId: defaultGetRowId,
        },
      });
      expect(result.current.sortModel).toEqual([]);
      expect(result.current.filterModel).toEqual({});
      expect(result.current.page).toBe(0);
      expect(result.current.pageSize).toBe(10);
      expect(result.current.selection).toEqual(new Set());
      expect(result.current.displayRows).toHaveLength(3);
      expect(result.current.displayRows.map((r) => r.id)).toEqual([1, 2, 3]);
    });

    it('uses initialPageSize when provided', () => {
      const { result } = renderHook(useDataGrid, {
        initialProps: {
          rows: defaultRows,
          columns: defaultColumns,
          getRowId: defaultGetRowId,
          pageSize: 25,
        },
      });
      expect(result.current.pageSize).toBe(25);
    });
  });

  describe('handleSort', () => {
    it('single-column: first call sets asc, second desc, third clears', () => {
      const onSortChange = vi.fn();
      const { result } = renderHook(useDataGrid, {
        initialProps: {
          rows: defaultRows,
          columns: defaultColumns,
          getRowId: defaultGetRowId,
          onSortChange,
        },
      });
      act(() => {
        result.current.handleSort('score', false);
      });
      expect(result.current.sortModel).toEqual([{ field: 'score', order: 'asc' }]);
      expect(onSortChange).toHaveBeenCalledWith([{ field: 'score', order: 'asc' }]);

      act(() => {
        result.current.handleSort('score', false);
      });
      expect(result.current.sortModel).toEqual([{ field: 'score', order: 'desc' }]);

      act(() => {
        result.current.handleSort('score', false);
      });
      expect(result.current.sortModel).toEqual([]);
    });

    it('multi-column: adds column, toggles order, removes column', () => {
      const { result } = renderHook(useDataGrid, {
        initialProps: {
          rows: defaultRows,
          columns: defaultColumns,
          getRowId: defaultGetRowId,
        },
      });
      act(() => {
        result.current.handleSort('name', true);
      });
      act(() => {
        result.current.handleSort('score', true);
      });
      expect(result.current.sortModel).toEqual([
        { field: 'name', order: 'asc' },
        { field: 'score', order: 'asc' },
      ]);
      act(() => {
        result.current.handleSort('score', true);
      });
      expect(result.current.sortModel).toEqual([
        { field: 'name', order: 'asc' },
        { field: 'score', order: 'desc' },
      ]);
      act(() => {
        result.current.handleSort('score', true);
      });
      expect(result.current.sortModel).toEqual([{ field: 'name', order: 'asc' }]);
    });

    it('resets page to 0 when sort changes', () => {
      const onPageChange = vi.fn();
      const { result } = renderHook(useDataGrid, {
        initialProps: {
          rows: defaultRows,
          columns: defaultColumns,
          getRowId: defaultGetRowId,
          pagination: true,
          onPageChange,
        },
      });
      act(() => {
        result.current.handlePageChange(1);
      });
      expect(result.current.page).toBe(1);
      act(() => {
        result.current.handleSort('name', false);
      });
      expect(result.current.page).toBe(0);
      expect(onPageChange).toHaveBeenCalledWith(0);
    });
  });

  describe('handleFilterChange', () => {
    it('updates filterModel and resets page', () => {
      const onFilterChange = vi.fn();
      const onPageChange = vi.fn();
      const { result } = renderHook(useDataGrid, {
        initialProps: {
          rows: defaultRows,
          columns: defaultColumns,
          getRowId: defaultGetRowId,
          onFilterChange,
          onPageChange,
        },
      });
      act(() => {
        result.current.handlePageChange(1);
      });
      act(() => {
        result.current.handleFilterChange('name', { value: 'A', operator: 'contains' });
      });
      expect(result.current.filterModel).toEqual({ name: { value: 'A', operator: 'contains' } });
      expect(result.current.page).toBe(0);
      expect(onFilterChange).toHaveBeenCalledWith({ name: { value: 'A', operator: 'contains' } });
      expect(onPageChange).toHaveBeenCalledWith(0);
    });

    it('removes field when value is null/undefined', () => {
      const { result } = renderHook(useDataGrid, {
        initialProps: {
          rows: defaultRows,
          columns: defaultColumns,
          getRowId: defaultGetRowId,
        },
      });
      act(() => {
        result.current.handleFilterChange('name', { value: 'x' });
      });
      expect(result.current.filterModel.name).toBeDefined();
      act(() => {
        result.current.handleFilterChange('name', null);
      });
      expect(result.current.filterModel).toEqual({});
    });
  });

  describe('handleClearSort and handleClearAllFilters', () => {
    it('handleClearSort sets sortModel to []', () => {
      const { result } = renderHook(useDataGrid, {
        initialProps: {
          rows: defaultRows,
          columns: defaultColumns,
          getRowId: defaultGetRowId,
        },
      });
      act(() => result.current.handleSort('name', false));
      expect(result.current.sortModel).toHaveLength(1);
      act(() => result.current.handleClearSort());
      expect(result.current.sortModel).toEqual([]);
    });

    it('handleClearAllFilters clears filterModel and resets page', () => {
      const onFilterChange = vi.fn();
      const { result } = renderHook(useDataGrid, {
        initialProps: {
          rows: defaultRows,
          columns: defaultColumns,
          getRowId: defaultGetRowId,
          onFilterChange,
        },
      });
      act(() => result.current.handleFilterChange('name', { value: 'x' }));
      act(() => result.current.handlePageChange(1));
      act(() => result.current.handleClearAllFilters());
      expect(result.current.filterModel).toEqual({});
      expect(result.current.page).toBe(0);
      expect(onFilterChange).toHaveBeenCalledWith({});
    });
  });

  describe('handlePageChange and handlePageSizeChange', () => {
    it('handlePageChange updates page and calls onPageChange', () => {
      const onPageChange = vi.fn();
      const { result } = renderHook(useDataGrid, {
        initialProps: {
          rows: defaultRows,
          columns: defaultColumns,
          getRowId: defaultGetRowId,
          pagination: true,
          onPageChange,
        },
      });
      act(() => result.current.handlePageChange(2));
      expect(result.current.page).toBe(2);
      expect(onPageChange).toHaveBeenCalledWith(2);
    });

    it('handlePageSizeChange updates pageSize, resets page to 0, calls onPageSizeChange', () => {
      const onPageChange = vi.fn();
      const onPageSizeChange = vi.fn();
      const { result } = renderHook(useDataGrid, {
        initialProps: {
          rows: defaultRows,
          columns: defaultColumns,
          getRowId: defaultGetRowId,
          pagination: true,
          onPageChange,
          onPageSizeChange,
        },
      });
      act(() => result.current.handlePageChange(1));
      act(() => result.current.handlePageSizeChange(25));
      expect(result.current.pageSize).toBe(25);
      expect(result.current.page).toBe(0);
      expect(onPageChange).toHaveBeenCalledWith(0);
      expect(onPageSizeChange).toHaveBeenCalledWith(25);
    });
  });

  describe('handleSelect', () => {
    it('adds and removes row id from selection and calls onSelectionChange', () => {
      const onSelectionChange = vi.fn();
      const { result } = renderHook(useDataGrid, {
        initialProps: {
          rows: defaultRows,
          columns: defaultColumns,
          getRowId: defaultGetRowId,
          onSelectionChange,
        },
      });
      act(() => result.current.handleSelect(1, true));
      expect(result.current.selection.has(1)).toBe(true);
      expect(onSelectionChange).toHaveBeenLastCalledWith([1]);
      act(() => result.current.handleSelect(2, true));
      expect(result.current.selection.has(2)).toBe(true);
      expect(onSelectionChange).toHaveBeenLastCalledWith([1, 2]);
      act(() => result.current.handleSelect(1, false));
      expect(result.current.selection.has(1)).toBe(false);
      expect(onSelectionChange).toHaveBeenLastCalledWith([2]);
    });
  });

  describe('handleRowClick', () => {
    it('sets selectedRowId and calls onRowSelect when onRowSelect provided', () => {
      const onRowSelect = vi.fn();
      const { result } = renderHook(useDataGrid, {
        initialProps: {
          rows: defaultRows,
          columns: defaultColumns,
          getRowId: defaultGetRowId,
          onRowSelect,
        },
      });
      const row = defaultRows[1];
      act(() => result.current.handleRowClick(row));
      expect(result.current.selectedRowId).toBe(2);
      expect(onRowSelect).toHaveBeenCalledWith(2, row);
    });
  });

  describe('pagination', () => {
    it('when pagination true, displayRows length <= pageSize and paginationResult has total, from, to', () => {
      const rows = Array.from({ length: 25 }, (_, i) => ({ id: i + 1, name: `Row ${i + 1}` }));
      const { result } = renderHook(useDataGrid, {
        initialProps: {
          rows,
          columns: defaultColumns,
          getRowId: defaultGetRowId,
          pagination: true,
          pageSize: 10,
        },
      });
      expect(result.current.displayRows).toHaveLength(10);
      expect(result.current.paginationResult.total).toBe(25);
      expect(result.current.paginationResult.from).toBe(1);
      expect(result.current.paginationResult.to).toBe(10);
      act(() => result.current.handlePageChange(1));
      expect(result.current.displayRows).toHaveLength(10);
      expect(result.current.paginationResult.from).toBe(11);
      expect(result.current.paginationResult.to).toBe(20);
    });

    it('when pagination false, displayRows is all sorted/filtered rows', () => {
      const { result } = renderHook(useDataGrid, {
        initialProps: {
          rows: defaultRows,
          columns: defaultColumns,
          getRowId: defaultGetRowId,
          pagination: false,
        },
      });
      expect(result.current.displayRows).toHaveLength(3);
      expect(result.current.paginationResult.rows).toHaveLength(3);
      expect(result.current.paginationResult.total).toBe(3);
    });
  });

  describe('hasActiveFilters and hasActiveRangeFilter', () => {
    it('hasActiveFilters is true when filterModel has keys', () => {
      const { result } = renderHook(useDataGrid, {
        initialProps: {
          rows: defaultRows,
          columns: defaultColumns,
          getRowId: defaultGetRowId,
        },
      });
      expect(result.current.hasActiveFilters).toBe(false);
      act(() => result.current.handleFilterChange('name', { value: 'x' }));
      expect(result.current.hasActiveFilters).toBe(true);
    });

    it('hasActiveRangeFilter is true when any filter has operator OPERATOR_IN_RANGE', () => {
      const { result } = renderHook(useDataGrid, {
        initialProps: {
          rows: defaultRows,
          columns: defaultColumns,
          getRowId: defaultGetRowId,
        },
      });
      expect(result.current.hasActiveRangeFilter).toBe(false);
      act(() =>
        result.current.handleFilterChange('score', {
          operator: OPERATOR_IN_RANGE,
          value: 0,
          valueTo: 100,
        })
      );
      expect(result.current.hasActiveRangeFilter).toBe(true);
    });
  });

  describe('stableContextValue and filterContextValue', () => {
    it('include expected keys', () => {
      const { result } = renderHook(useDataGrid, {
        initialProps: {
          rows: defaultRows,
          columns: defaultColumns,
          getRowId: defaultGetRowId,
        },
      });
      expect(result.current.stableContextValue).toMatchObject({
        columns: defaultColumns,
        getRowId: defaultGetRowId,
        getEditor: expect.any(Function),
        onClearSort: expect.any(Function),
        onClearAllFilters: expect.any(Function),
        rowStylesMap: expect.any(Map),
        sortOrderIndexMap: expect.any(Map),
        columnSortDirMap: expect.any(Map),
      });
      expect(result.current.filterContextValue).toMatchObject({
        getHeaderComboSlot: expect.any(Function),
        getFilterInputSlot: expect.any(Function),
        getFilterToInputSlot: expect.any(Function),
      });
    });
  });

  describe('integration with useDataGridEdit', () => {
    it('after handleRowDoubleClick, editRowId and editValues reflect edit state', () => {
      const { result } = renderHook(useDataGrid, {
        initialProps: {
          rows: defaultRows,
          columns: defaultColumns,
          getRowId: defaultGetRowId,
          editable: true,
          onEditCommit: vi.fn(),
        },
      });
      expect(result.current.editRowId).toBeNull();
      const row = defaultRows[0];
      act(() => result.current.handleRowDoubleClick(row));
      expect(result.current.editRowId).toBe(1);
      expect(result.current.editValues).toEqual(row);
      act(() => result.current.handleEditCancel());
      expect(result.current.editRowId).toBeNull();
      expect(result.current.editValues).toEqual({});
    });
  });
});
