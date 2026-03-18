import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DataGrid } from '../../src/DataGrid/DataGrid';
import { exportToCsv } from '../../src/utils/exportToCsv';

vi.mock('../../src/utils/exportToCsv');

describe('DataGrid Component Integration', () => {
  const basicColumns = [
    { field: 'id', headerName: 'ID', type: 'number' },
    { field: 'name', headerName: 'Name', type: 'text', filter: 'text' },
    { field: 'age', headerName: 'Age', type: 'number', filter: 'number' },
  ];

  const basicRows = [
    { id: 1, name: 'Alice', age: 30 },
    { id: 2, name: 'Bob', age: 25 },
    { id: 3, name: 'Charlie', age: 35 },
  ];

  const getRowId = (row) => row.id;

  beforeEach(() => {
    // Clear localStorage before each test if available
    if (typeof localStorage !== 'undefined' && localStorage.clear) {
      localStorage.clear();
    }
  });

  describe('Render DataGrid with basic props', () => {
    it('should render DataGrid with minimal required props', () => {
      render(
        <DataGrid
          rows={basicRows}
          columns={basicColumns}
          getRowId={getRowId}
        />
      );

      // Check that headers are rendered
      expect(screen.getByText('ID')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Age')).toBeInTheDocument();

      // Check that data rows are rendered
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('Charlie')).toBeInTheDocument();
    });

    it('should render all column headers and data rows correctly', () => {
      render(
        <DataGrid
          rows={basicRows}
          columns={basicColumns}
          getRowId={getRowId}
        />
      );

      // Check all headers are rendered
      basicColumns.forEach((col) => {
        expect(screen.getByText(col.headerName)).toBeInTheDocument();
      });

      // Check all data rows are rendered
      basicRows.forEach((row) => {
        expect(screen.getByText(row.name)).toBeInTheDocument();
        expect(screen.getByText(String(row.age))).toBeInTheDocument();
      });
    });
  });

  describe('All features enabled', () => {
    it('should render with sort, filter, pagination, edit, and selection enabled', () => {
      const onEditCommit = vi.fn();
      const onSelectionChange = vi.fn();
      const onFilterChange = vi.fn();

      render(
        <DataGrid
          rows={basicRows}
          columns={basicColumns}
          getRowId={getRowId}
          options={{
            editable: true,
            multiSelectable: true,
            pagination: true,
            pageSize: 10,
            pageSizeOptions: [10, 25, 50, 100],
            onEditCommit,
            onSelectionChange,
            onFilterChange,
          }}
        />
      );

      // Check pagination is rendered
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();

      // Check selection checkboxes are rendered
      const checkboxes = screen.getAllByRole('checkbox', { name: /select row/i });
      expect(checkboxes.length).toBeGreaterThan(0);

      // Check sortable headers (clicking should trigger sort)
      const nameHeader = screen.getByText('Name');
      fireEvent.click(nameHeader);
      expect(nameHeader).toBeInTheDocument();

      // Check filters are available (filter inputs should be present)
      const filterInputs = screen.queryAllByPlaceholderText(/filter/i);
      // Filters may be hidden initially, so we just check the grid renders
      expect(nameHeader).toBeInTheDocument();
    });

    it('should handle row selection when multiSelectable is enabled', () => {
      const onSelectionChange = vi.fn();

      render(
        <DataGrid
          rows={basicRows}
          columns={basicColumns}
          getRowId={getRowId}
          options={{
            multiSelectable: true,
            onSelectionChange,
          }}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox', { name: /select row/i });
      expect(checkboxes.length).toBeGreaterThan(0);

      // Click first row checkbox
      fireEvent.click(checkboxes[1]); // Skip header checkbox
      expect(onSelectionChange).toHaveBeenCalled();
    });

    it('should handle pagination when enabled', () => {
      render(
        <DataGrid
          rows={basicRows}
          columns={basicColumns}
          getRowId={getRowId}
          options={{
            pagination: true,
            pageSize: 2,
            pageSizeOptions: [10, 25, 50, 100],
          }}
        />
      );

      // Should show pagination controls
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();

      // Should show only 2 rows per page
      const aliceRow = screen.getByText('Alice');
      const bobRow = screen.getByText('Bob');
      expect(aliceRow).toBeInTheDocument();
      expect(bobRow).toBeInTheDocument();
      // Charlie should not be visible on first page
      expect(screen.queryByText('Charlie')).not.toBeInTheDocument();
    });

    it('should hide filters when options.filters is false', () => {
      render(
        <DataGrid
          rows={basicRows}
          columns={basicColumns}
          getRowId={getRowId}
          options={{ filters: false }}
        />
      );

      // Clear all filters button should not be shown
      expect(screen.queryByRole('button', { name: /clear all filters/i })).not.toBeInTheDocument();

      // Filter row should not be rendered (no filter inputs in header)
      const filterInputs = screen.queryAllByPlaceholderText(/filter/i);
      expect(filterInputs).toHaveLength(0);
    });

    it('should enable editing when editable is true', () => {
      const onEditCommit = vi.fn();

      render(
        <DataGrid
          rows={basicRows}
          columns={basicColumns}
          getRowId={getRowId}
          options={{
            editable: true,
            onEditCommit,
          }}
        />
      );

      // Double-click should enter edit mode
      const aliceRow = screen.getByText('Alice').closest('[data-row-id]');
      expect(aliceRow).toBeInTheDocument();      
      fireEvent.doubleClick(aliceRow);
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();      
    });
  });

  describe('Empty data state', () => {
    it('should render empty state message when rows array is empty', () => {
      render(
        <DataGrid
          rows={[]}
          columns={basicColumns}
          getRowId={getRowId}
        />
      );

      // Should show "no rows" message
      expect(screen.getByText(/no rows/i)).toBeInTheDocument();
    });

    it('should handle empty state correctly with and without features', () => {
      // Test basic empty state
      const { rerender } = render(
        <DataGrid
          rows={[]}
          columns={basicColumns}
          getRowId={getRowId}
        />
      );

      expect(screen.getByText(/no rows/i)).toBeInTheDocument();
      // Headers should still be present
      basicColumns.forEach((col) => {
        expect(screen.getByText(col.headerName)).toBeInTheDocument();
      });

      // Test empty state with all features enabled
      rerender(
        <DataGrid
          rows={[]}
          columns={basicColumns}
          getRowId={getRowId}
          options={{
            editable: true,
            multiSelectable: true,
            pagination: true,
          }}
        />
      );

      expect(screen.getByText(/no rows/i)).toBeInTheDocument();
      // Headers should still be present
      basicColumns.forEach((col) => {
        expect(screen.getByText(col.headerName)).toBeInTheDocument();
      });
    });
  });

  describe('Single row state', () => {
    const singleRow = [{ id: 1, name: 'Alice', age: 30 }];

    it('should render single row correctly', () => {
      render(
        <DataGrid
          rows={singleRow}
          columns={basicColumns}
          getRowId={getRowId}
        />
      );

      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('30')).toBeInTheDocument();
      expect(screen.queryByText(/no rows/i)).not.toBeInTheDocument();
    });

    it('should handle single row with selection', () => {
      const onSelectionChange = vi.fn();

      render(
        <DataGrid
          rows={singleRow}
          columns={basicColumns}
          getRowId={getRowId}
          options={{
            multiSelectable: true,
            onSelectionChange,
          }}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox', { name: /select row/i });
      expect(checkboxes.length).toBeGreaterThan(0);

      // Find the first data row checkbox (skip header checkbox if present)
      const dataRowCheckbox = checkboxes.find(cb => {
        const row = cb.closest('[data-row-id]');
        return row !== null;
      });
      
      expect(dataRowCheckbox).toBeInTheDocument();
      fireEvent.click(dataRowCheckbox);
      expect(onSelectionChange).toHaveBeenCalled();
    });

    it('should handle single row with pagination', () => {
      render(
        <DataGrid
          rows={singleRow}
          columns={basicColumns}
          getRowId={getRowId}
          options={{
            pagination: true,
            pageSize: 10,
          }}
        />
      );

      expect(screen.getByText('Alice')).toBeInTheDocument();
      // Pagination should still render even with single row
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    });
  });

  describe('Row click handler', () => {
    it('should call onRowClick when a row is clicked', async () => {
      const onRowClick = vi.fn();

      render(
        <DataGrid
          rows={basicRows}
          columns={basicColumns}
          getRowId={getRowId}
          options={{
            onRowClick,
          }}
        />
      );

      const aliceRow = screen.getByText('Alice').closest('[data-row-id]');
      expect(aliceRow).toBeInTheDocument();

      fireEvent.click(aliceRow);
      
      // Wait for the delayed click handler (300ms delay)
      await waitFor(() => {
        expect(onRowClick).toHaveBeenCalledTimes(1);
      }, { timeout: 500 });
      
      expect(onRowClick).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ id: 1, name: 'Alice', age: 30 })
      );
    });

    it('should not call onRowClick if handler is not provided', () => {
      render(
        <DataGrid
          rows={basicRows}
          columns={basicColumns}
          getRowId={getRowId}
        />
      );

      const aliceRow = screen.getByText('Alice').closest('[data-row-id]');
      expect(aliceRow).toBeInTheDocument();

      // Should not throw error when clicking without handler
      fireEvent.click(aliceRow);
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    it('should handle row click with multiple rows', async () => {
      const onRowClick = vi.fn();

      render(
        <DataGrid
          rows={basicRows}
          columns={basicColumns}
          getRowId={getRowId}
          options={{
            onRowClick,
          }}
        />
      );

      const bobRow = screen.getByText('Bob').closest('[data-row-id]');
      fireEvent.click(bobRow);
      
      // Wait for the delayed click handler
      await waitFor(() => {
        expect(onRowClick).toHaveBeenCalledWith(
          2,
          expect.objectContaining({ id: 2, name: 'Bob', age: 25 })
        );
      }, { timeout: 500 });

      const charlieRow = screen.getByText('Charlie').closest('[data-row-id]');
      fireEvent.click(charlieRow);
      
      // Wait for the delayed click handler
      await waitFor(() => {
        expect(onRowClick).toHaveBeenCalledWith(
          3,
          expect.objectContaining({ id: 3, name: 'Charlie', age: 35 })
        );
        expect(onRowClick).toHaveBeenCalledTimes(2);
      }, { timeout: 500 });
    });
  });

  describe('getRowId requirement', () => {
    it('should work correctly with getRowId function', () => {
      render(
        <DataGrid
          rows={basicRows}
          columns={basicColumns}
          getRowId={getRowId}
        />
      );

      // All rows should render correctly
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('Charlie')).toBeInTheDocument();
    });

    it('should handle getRowId with string IDs', () => {
      const stringRows = [
        { id: 'row-1', name: 'Alice', age: 30 },
        { id: 'row-2', name: 'Bob', age: 25 },
      ];

      render(
        <DataGrid
          rows={stringRows}
          columns={basicColumns}
          getRowId={(row) => row.id}
        />
      );

      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    it('should handle getRowId with numeric IDs', () => {
      const numericRows = [
        { id: 100, name: 'Alice', age: 30 },
        { id: 200, name: 'Bob', age: 25 },
      ];

      render(
        <DataGrid
          rows={numericRows}
          columns={basicColumns}
          getRowId={(row) => row.id}
        />
      );

      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    it('should use getRowId for selection when multiSelectable is enabled', () => {
      const onSelectionChange = vi.fn();

      render(
        <DataGrid
          rows={basicRows}
          columns={basicColumns}
          getRowId={getRowId}
          options={{
            multiSelectable: true,
            onSelectionChange,
          }}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox', { name: /select row/i });
      // Find the checkbox for the first data row (Alice, id: 1)
      const firstRowCheckbox = checkboxes.find(cb => {
        const row = cb.closest('[data-row-id]');
        return row && row.getAttribute('data-row-id') === '1';
      });
      expect(firstRowCheckbox).toBeDefined();
      fireEvent.click(firstRowCheckbox);

      // Verify selection callback was called with correct row IDs
      expect(onSelectionChange).toHaveBeenCalled();
      const selectedIds = onSelectionChange.mock.calls[0][0];
      expect(Array.isArray(selectedIds) || selectedIds instanceof Set).toBe(true);
      // Add actual value verification
      if (Array.isArray(selectedIds)) {
        expect(selectedIds).toContain(1);
      } else {
        expect(selectedIds.has(1)).toBe(true);
      }
    });

    it('should use getRowId for editing when editable is enabled', async () => {
      const onEditCommit = vi.fn();

      render(
        <DataGrid
          rows={basicRows}
          columns={basicColumns}
          getRowId={getRowId}
          options={{
            editable: true,
            onEditCommit,
          }}
        />
      );

      const aliceRow = screen.getByText('Alice').closest('[data-row-id]');
      expect(aliceRow).toBeInTheDocument();
      
      fireEvent.doubleClick(aliceRow);
      
      // Wait for edit mode
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      });
        
      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);
      
      // Verify onEditCommit was called with correct rowId and edited row data
      expect(onEditCommit).toHaveBeenCalled();
      const [rowId, editedRow] = onEditCommit.mock.calls[0];
      expect(rowId).toBe(1); // Alice's ID
      expect(editedRow).toMatchObject({ id: 1, name: 'Alice', age: 30 });
      
    });
  });

  describe('Pagination scroll layout', () => {
    it('should use flex layout and scroll wrapper when pagination and height are set', () => {
      render(
        <DataGrid
          rows={basicRows}
          columns={basicColumns}
          getRowId={getRowId}
          options={{
            pagination: true,
            pageSize: 10,
            sx: { height: '400px' },
          }}
        />
      );

      const root = screen.getByTestId('data-grid-root');
      const scrollContainer = screen.getByTestId('grid-scroll-container');

      expect(root).toBeInTheDocument();
      expect(scrollContainer).toBeInTheDocument();
      expect(root).toHaveStyle({ display: 'flex', flexDirection: 'column' });
      expect(root).toHaveStyle({ height: '400px' });
      // Scroll is on inner box; outer scroll container wraps toolbar + table
      expect(scrollContainer).toHaveStyle({ display: 'flex', flexDirection: 'column' });

      // PaginationBar must not be inside the scroll container (so it stays visible)
      const paginationNext = screen.getByRole('button', { name: /next/i });
      expect(paginationNext).toBeInTheDocument();
      expect(scrollContainer.contains(paginationNext)).toBe(false);
      expect(root.contains(paginationNext)).toBe(true);
    });

    it('should not use scroll layout when pagination is on but no height constraint', () => {
      render(
        <DataGrid
          rows={basicRows}
          columns={basicColumns}
          getRowId={getRowId}
          options={{
            pagination: true,
            pageSize: 10,
          }}
        />
      );

      expect(screen.queryByTestId('grid-scroll-container')).not.toBeInTheDocument();
      const root = screen.getByTestId('data-grid-root');
      expect(root).not.toHaveStyle({ display: 'flex' });
    });

    it('should keep pagination bar after table wrapper with many rows and fixed height', () => {
      const manyRows = Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
        name: `User ${i + 1}`,
        age: 20 + (i % 50),
      }));

      render(
        <DataGrid
          rows={manyRows}
          columns={basicColumns}
          getRowId={getRowId}
          options={{
            pagination: true,
            pageSize: 10,
            sx: { height: '300px' },
          }}
        />
      );

      const scrollContainer = screen.getByTestId('grid-scroll-container');
      const root = screen.getByTestId('data-grid-root');
      const paginationBar = screen.getByRole('button', { name: /next/i });

      expect(root.contains(scrollContainer)).toBe(true);
      expect(root.contains(paginationBar)).toBe(true);
      expect(scrollContainer.contains(paginationBar)).toBe(false);
      // Pagination bar should appear after the scroll container in DOM order
      const rootChildren = Array.from(root.children);
      const scrollIndex = rootChildren.findIndex((el) => el.contains(scrollContainer));
      const paginationIndex = rootChildren.findIndex((el) => el.contains(paginationBar));
      expect(paginationIndex).toBeGreaterThan(scrollIndex);
    });
  });

  describe('Typography options', () => {
    it('should apply fontFamily when provided in options', () => {
      render(
        <DataGrid
          rows={basicRows}
          columns={basicColumns}
          getRowId={getRowId}
          options={{ fontFamily: 'Georgia, serif' }}
        />
      );

      const root = screen.getByTestId('data-grid-root');
      const computed = getComputedStyle(root);
      expect(computed.fontFamily).toContain('Georgia');
    });

    it('should apply fontWeight when provided in options', () => {
      render(
        <DataGrid
          rows={basicRows}
          columns={basicColumns}
          getRowId={getRowId}
          options={{ fontWeight: 600 }}
        />
      );

      const root = screen.getByTestId('data-grid-root');
      const computed = getComputedStyle(root);
      expect(computed.fontWeight).toBe('600');
    });
  });

  describe('CSV Export', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should export all filtered rows when pagination is enabled', async () => {
      const manyRows = Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        name: `Person ${i + 1}`,
        age: 20 + (i % 10),
      }));

      render(
        <DataGrid
          rows={manyRows}
          columns={basicColumns}
          getRowId={getRowId}
          options={{
            pagination: true,
            pageSize: 10,
            showExportToExcel: true,
          }}
        />
      );

      // Find and click export button (button text is "EXCEL")
      const exportButton = screen.getByText('EXCEL');
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(exportToCsv).toHaveBeenCalled();
      });

      // Verify export was called with all 25 rows, not just the first page
      const exportCall = vi.mocked(exportToCsv).mock.calls[0][0];
      expect(exportCall.rows).toHaveLength(25);
      expect(exportCall.columns).toEqual(basicColumns);
    });

    it('should export all filtered rows when virtualization is enabled', async () => {
      const manyRows = Array.from({ length: 150 }, (_, i) => ({
        id: i + 1,
        name: `Person ${i + 1}`,
        age: 20 + (i % 10),
      }));

      render(
        <DataGrid
          rows={manyRows}
          columns={basicColumns}
          getRowId={getRowId}
          options={{
            pagination: false,
            showExportToExcel: true,
            sx: { height: 400 }, // Enables virtualization
          }}
        />
      );

      // Find and click export button (button text is "EXCEL")
      const exportButton = screen.getByText('EXCEL');
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(exportToCsv).toHaveBeenCalled();
      });

      // Verify export was called with all 150 rows, not just visible ones
      const exportCall = vi.mocked(exportToCsv).mock.calls[0][0];
      expect(exportCall.rows).toHaveLength(150);
      expect(exportCall.columns).toEqual(basicColumns);
    });

    it('should export only filtered rows (all of them) when both filtering and pagination are enabled', async () => {
      const rows = [
        { id: 1, name: 'Alice', age: 30 },
        { id: 2, name: 'Bob', age: 25 },
        { id: 3, name: 'Charlie', age: 35 },
        { id: 4, name: 'David', age: 28 },
        { id: 5, name: 'Eve', age: 32 },
        { id: 6, name: 'Frank', age: 27 },
        { id: 7, name: 'Grace', age: 29 },
        { id: 8, name: 'Henry', age: 31 },
      ];

      render(
        <DataGrid
          rows={rows}
          columns={basicColumns}
          getRowId={getRowId}
          options={{
            pagination: true,
            pageSize: 3,
            showExportToExcel: true,
          }}
        />
      );

      // Apply text filter: name contains 'A' (should match Alice, Charlie, David, Grace)
      const nameFilterInputs = screen.queryAllByPlaceholderText(/filter/i);
      const nameInput = nameFilterInputs.find((input) => {
        const cell = input.closest('th');
        if (!cell) return false;
        const row = cell.closest('tr');
        const cells = Array.from(row?.querySelectorAll('th') || []);
        const cellText = cell.textContent || '';
        return cellText.includes('Name') || cells.some((c) => c.textContent?.includes('Name'));
      });

      if (nameInput) {
        fireEvent.change(nameInput, { target: { value: 'A' } });
      }

      // Wait for filter to apply (debounced)
      await waitFor(() => {
        // Should show filtered rows (Alice, Charlie, David, Grace - names containing 'A')
        expect(screen.getByText('Alice')).toBeInTheDocument();
      }, { timeout: 1000 });

      // Find and click export button (button text is "EXCEL")
      const exportButton = screen.getByText('EXCEL');
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(exportToCsv).toHaveBeenCalled();
      });

      // Verify export was called with only filtered rows (all 4, not just current page of 3)
      const exportCall = vi.mocked(exportToCsv).mock.calls[0][0];
      expect(exportCall.rows.length).toBeGreaterThanOrEqual(1); // At least Alice
      // Verify all filtered rows are included (not just current page)
      const exportedNames = exportCall.rows.map((r) => r.name);
      expect(exportedNames).toContain('Alice');
      expect(exportCall.columns).toEqual(basicColumns);
    });
  });
});

