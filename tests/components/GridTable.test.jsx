import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { GridTable } from '../../src/core/GridTable';
import { DataGridProvider } from '../../src/DataGrid/DataGridContext';
import { DIRECTION_LTR } from '../../src/config/schema';

describe('GridTable Component', () => {
  const theme = createTheme();

  const basicColumns = [
    { field: 'id', headerName: 'ID', type: 'number' },
    { field: 'name', headerName: 'Name', type: 'text' },
    { field: 'age', headerName: 'Age', type: 'number' },
  ];

  const basicRows = [
    { id: 1, name: 'Alice', age: 30 },
    { id: 2, name: 'Bob', age: 25 },
    { id: 3, name: 'Charlie', age: 35 },
  ];

  const getRowId = (row) => row.id;

  const defaultStableValue = {
    columns: basicColumns,
    getRowId,
    multiSelectable: false,
    direction: DIRECTION_LTR,
    translations: {},
    defaultTranslations: {},
    // Add missing required properties
    colRefs: { current: new Map() },
    containerRef: { current: null },
    columnWidthMap: new Map(),
    totalWidth: 0,
    enableHorizontalScroll: false,
    onClearSort: vi.fn(),
    onClearAllFilters: vi.fn(),
    onClearColumnWidths: vi.fn(),
    hasResizedColumns: false,
    headerConfig: {},
    getEditor: null,
    selectedRowStyle: {},
    rowStylesMap: new Map(),
    sortOrderIndexMap: new Map(),
    columnSortDirMap: new Map(),
    columnAlignMap: new Map(),
    headerCellSxMap: new Map(),
    filterCellSxMap: new Map(),
    onColumnResize: null,
  };

  const defaultFilterValue = {
    getHeaderComboSlot: null,
    getFilterInputSlot: null,
    getFilterToInputSlot: null,
  };

  const renderGridTable = (props = {}, stableValue = defaultStableValue, filterValue = defaultFilterValue) => {
    const defaultProps = {
      rows: basicRows,
      selection: new Set(),
      onSelect: null,
      sortModel: [],
      onSort: vi.fn(),
      hasActiveFilters: false,
      editRowId: null,
      editValues: {},
      validationErrors: [],
      errorSet: new Set(),
      onRowClick: null,
      onRowDoubleClick: null,
      selectedRowId: null,
      hasActiveRangeFilter: false,
      ...props,
    };

    return render(
      <ThemeProvider theme={theme}>
        <DataGridProvider stableValue={stableValue} filterValue={filterValue}>
          <GridTable {...defaultProps} />
        </DataGridProvider>
      </ThemeProvider>
    );
  };

  describe('Render table structure', () => {
    it('should render table structure with Table, TableHead, and TableBody', () => {
      renderGridTable();

      // Check for table element
      const table = screen.getByRole('table', { name: 'Data grid' });
      expect(table).toBeInTheDocument();

      // Check for table head (header)
      const tableHead = table.querySelector('thead');
      expect(tableHead).toBeInTheDocument();

      // Check for table body
      const tableBody = table.querySelector('tbody');
      expect(tableBody).toBeInTheDocument();
    });

    it('should render TableContainer with Paper component', () => {
      const { container } = renderGridTable();
      
      // TableContainer should be present (wraps the table)
      const tableContainer = container.querySelector('[class*="MuiTableContainer"]');
      expect(tableContainer).toBeInTheDocument();
    });
  });

  describe('Test header row rendering', () => {
    it('should render header row with all column headers', () => {
      renderGridTable();

      // Check that all header names are rendered
      basicColumns.forEach((col) => {
        expect(screen.getByText(col.headerName)).toBeInTheDocument();
      });
    });

    it('should render header row even when rows are empty', () => {
      renderGridTable({ rows: [] });

      basicColumns.forEach((col) => {
        expect(screen.getByText(col.headerName)).toBeInTheDocument();
      });
    });

    it('should render checkbox column in header when multiSelectable is true', () => {
      const stableValue = {
        ...defaultStableValue,
        multiSelectable: true,
      };

      renderGridTable({}, stableValue);

      // Checkbox column should be present in header
      const checkboxes = screen.getAllByRole('checkbox', { name: /select row/i });
      expect(checkboxes.length).toBeGreaterThan(0);
    });
  });

  describe('Test body rows rendering', () => {
    it('should render all body rows with data', () => {
      renderGridTable();

      // Check that all row data is rendered
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('Charlie')).toBeInTheDocument();
    });

    it('should render body rows for each row in rows array', () => {
      renderGridTable();

      basicRows.forEach((row) => {
        expect(screen.getByText(row.name)).toBeInTheDocument();
        expect(screen.getByText(String(row.age))).toBeInTheDocument();
      });
    });

    it('should render empty state message when rows array is empty', () => {
      renderGridTable({ rows: [] });

      // Should show "no rows" message
      expect(screen.getByText(/no rows/i)).toBeInTheDocument();
    });

    it('should render checkbox in body rows when multiSelectable is true', () => {
      const stableValue = {
        ...defaultStableValue,
        multiSelectable: true,
      };

      renderGridTable({}, stableValue);

      // Should have checkboxes for each row (header has empty cell, not checkbox)
      const checkboxes = screen.getAllByRole('checkbox', { name: /select row/i });
      expect(checkboxes.length).toBe(basicRows.length); // one checkbox per row
    });
  });

  describe('Test column count matches', () => {
    it('should render correct number of columns in header', () => {
      renderGridTable();

      const table = screen.getByRole('table');
      const headerRow = table.querySelector('thead tr');
      const headerCells = headerRow.querySelectorAll('th');

      // Should have same number of header cells as columns
      expect(headerCells.length).toBe(basicColumns.length);
    });

    it('should render correct number of columns in body rows', () => {
      renderGridTable();

      const table = screen.getByRole('table');
      const bodyRows = table.querySelectorAll('tbody tr');
      
      // Each body row should have same number of cells as columns
      bodyRows.forEach((row) => {
        const cells = row.querySelectorAll('td');
        expect(cells.length).toBe(basicColumns.length);
      });
    });

    it('should include checkbox column in count when multiSelectable is true', () => {
      const stableValue = {
        ...defaultStableValue,
        multiSelectable: true,
      };

      renderGridTable({}, stableValue);

      const table = screen.getByRole('table');
      const headerRow = table.querySelector('thead tr');
      const headerCells = headerRow.querySelectorAll('th');

      // Should have columns + 1 checkbox column
      expect(headerCells.length).toBe(basicColumns.length + 1);
    });

    it('should handle different column counts correctly', () => {
      const twoColumns = [
        { field: 'id', headerName: 'ID', type: 'number' },
        { field: 'name', headerName: 'Name', type: 'text' },
      ];

      const stableValue = {
        ...defaultStableValue,
        columns: twoColumns,
      };

      renderGridTable({}, stableValue);

      const table = screen.getByRole('table');
      const headerRow = table.querySelector('thead tr');
      const headerCells = headerRow.querySelectorAll('th');

      expect(headerCells.length).toBe(2);
    });
  });

  describe('Test row count matches', () => {
    it('should render correct number of body rows', () => {
      renderGridTable();

      const table = screen.getByRole('table');
      const bodyRows = table.querySelectorAll('tbody tr');

      // Should have same number of rows as data
      expect(bodyRows.length).toBe(basicRows.length);
    });

    it('should render single row correctly', () => {
      const singleRow = [{ id: 1, name: 'Alice', age: 30 }];
      renderGridTable({ rows: singleRow });

      const table = screen.getByRole('table');
      const bodyRows = table.querySelectorAll('tbody tr');

      expect(bodyRows.length).toBe(1);
    });

    it('should render empty state row when rows array is empty', () => {
      renderGridTable({ rows: [] });

      const table = screen.getByRole('table');
      const bodyRows = table.querySelectorAll('tbody tr');

      // Should have one row showing "no rows" message
      expect(bodyRows.length).toBe(1);
      expect(screen.getByText(/no rows/i)).toBeInTheDocument();
    });

    it('should handle different row counts correctly', () => {
      const manyRows = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        name: `User ${i + 1}`,
        age: 20 + i,
      }));

      renderGridTable({ rows: manyRows });

      const table = screen.getByRole('table');
      const bodyRows = table.querySelectorAll('tbody tr');

      expect(bodyRows.length).toBe(10);
    });
  });

  describe('Test row click and double-click handlers', () => {
    it('should trigger onRowClick once on single click', async () => {
      const onRowClick = vi.fn();
      
      renderGridTable({ onRowClick });
      
      const row = screen.getByText('Alice').closest('[data-row-id]');
      fireEvent.click(row);
      
      // Wait for the delayed click handler (300ms delay)
      await waitFor(() => {
        expect(onRowClick).toHaveBeenCalledTimes(1);
      }, { timeout: 500 });
      
      expect(onRowClick).toHaveBeenCalledWith(basicRows[0]);
    });

    it('should trigger onRowDoubleClick once on double-click and NOT trigger onRowClick', async () => {
      const onRowClick = vi.fn();
      const onRowDoubleClick = vi.fn();
      
      renderGridTable({ onRowClick, onRowDoubleClick });
      
      const row = screen.getByText('Alice').closest('[data-row-id]');
      
      // Simulate double-click
      fireEvent.click(row);
      fireEvent.click(row);
      fireEvent.doubleClick(row);
      
      // Double-click should be called immediately
      expect(onRowDoubleClick).toHaveBeenCalledTimes(1);
      expect(onRowDoubleClick).toHaveBeenCalledWith(basicRows[0]);
      
      // Wait to ensure click handler doesn't fire after the delay
      await new Promise(resolve => setTimeout(resolve, 350));
      
      // onRowClick should NOT have been called (double-click should cancel it)
      expect(onRowClick).not.toHaveBeenCalled();
    });

    it('should call onRowDoubleClick with correct row data', () => {
      const onRowDoubleClick = vi.fn();
      
      renderGridTable({ onRowDoubleClick });
      
      const bobRow = screen.getByText('Bob').closest('[data-row-id]');
      fireEvent.doubleClick(bobRow);
      
      expect(onRowDoubleClick).toHaveBeenCalledTimes(1);
      expect(onRowDoubleClick).toHaveBeenCalledWith(basicRows[1]);
    });

    it('should handle rapid clicks correctly - only one click should fire', async () => {
      const onRowClick = vi.fn();
      
      renderGridTable({ onRowClick });
      
      const row = screen.getByText('Alice').closest('[data-row-id]');
      
      // Two rapid clicks (but not a double-click)
      // Second click cancels first timeout and sets new one
      fireEvent.click(row);
      fireEvent.click(row);
      
      // Wait for delayed click handler (300ms delay from last click)
      await waitFor(() => {
        // Should fire once after the delay (second click's timeout)
        expect(onRowClick).toHaveBeenCalledTimes(1);
      }, { timeout: 500 });
      
      expect(onRowClick).toHaveBeenCalledWith(basicRows[0]);
    });
  });

  describe('Toolbar actions slot', () => {
    it('should render toolbarActions content on the right when provided as ReactNode', () => {
      const stableValue = {
        ...defaultStableValue,
        toolbarActions: <span data-testid="toolbar-actions-slot">Row actions</span>,
      };
      renderGridTable({}, stableValue);
      expect(screen.getByTestId('toolbar-actions-slot')).toHaveTextContent('Row actions');
      expect(screen.getByRole('button', { name: /clear sort/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /clear all filters/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reset column widths/i })).toBeInTheDocument();
    });

    it('should render toolbarActions when provided as function with selectedRow and selectedRowId', () => {
      const toolbarActionsFn = vi.fn(({ selectedRow, selectedRowId }) => (
        <span data-testid="toolbar-actions-fn">Selected: {selectedRowId ?? 'none'}</span>
      ));
      const stableValue = {
        ...defaultStableValue,
        toolbarActions: toolbarActionsFn,
      };
      renderGridTable({ selectedRowId: 2 }, stableValue);
      expect(screen.getByTestId('toolbar-actions-fn')).toHaveTextContent('Selected: 2');
      expect(toolbarActionsFn).toHaveBeenCalledWith({ selectedRow: basicRows[1], selectedRowId: 2 });
      expect(screen.getByRole('button', { name: /clear sort/i })).toBeInTheDocument();
    });

    it('should not render toolbar slot when toolbarActions is not provided', () => {
      renderGridTable();
      expect(screen.queryByTestId('toolbar-actions-slot')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /clear sort/i })).toBeInTheDocument();
    });
  });

  describe('Reset column widths button', () => {
    it('should render Reset column widths button and disable it when no resized columns', () => {
      renderGridTable();
      const btn = screen.getByRole('button', { name: /reset column widths/i });
      expect(btn).toBeInTheDocument();
      expect(btn).toBeDisabled();
    });

    it('should enable button when hasResizedColumns is true', () => {
      const stableValue = {
        ...defaultStableValue,
        hasResizedColumns: true,
      };
      renderGridTable({}, stableValue);
      const btn = screen.getByRole('button', { name: /reset column widths/i });
      expect(btn).not.toBeDisabled();
    });

    it('should call onClearColumnWidths when Reset column widths is clicked', () => {
      const onClearColumnWidths = vi.fn();
      const stableValue = {
        ...defaultStableValue,
        onClearColumnWidths,
        hasResizedColumns: true,
      };
      renderGridTable({}, stableValue);
      fireEvent.click(screen.getByRole('button', { name: /reset column widths/i }));
      expect(onClearColumnWidths).toHaveBeenCalledTimes(1);
    });
  });

  describe('toolbarClearButtonsSx', () => {
    it('should apply toolbarClearButtonsSx to Clear sort, Clear all filters, and Reset column widths buttons', () => {
      const stableValue = {
        ...defaultStableValue,
        toolbarClearButtonsSx: { minWidth: 200, backgroundColor: 'rgb(255, 192, 203)' },
      };
      renderGridTable({}, stableValue);

      const clearSortBtn = screen.getByRole('button', { name: /clear sort/i });
      const clearFiltersBtn = screen.getByRole('button', { name: /clear all filters/i });
      const resetWidthsBtn = screen.getByRole('button', { name: /reset column widths/i });

      expect(getComputedStyle(clearSortBtn).minWidth).toBe('200px');
      expect(getComputedStyle(clearFiltersBtn).minWidth).toBe('200px');
      expect(getComputedStyle(resetWidthsBtn).minWidth).toBe('200px');
      expect(getComputedStyle(clearSortBtn).backgroundColor).toBe('rgb(255, 192, 203)');
      expect(getComputedStyle(clearFiltersBtn).backgroundColor).toBe('rgb(255, 192, 203)');
      expect(getComputedStyle(resetWidthsBtn).backgroundColor).toBe('rgb(255, 192, 203)');
    });
  });
});
