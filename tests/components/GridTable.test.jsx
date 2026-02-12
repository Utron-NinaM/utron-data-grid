import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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
      expect(screen.getByText('ID')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Age')).toBeInTheDocument();
    });

    it('should render header row for each column in columns array', () => {
      renderGridTable();

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
});
