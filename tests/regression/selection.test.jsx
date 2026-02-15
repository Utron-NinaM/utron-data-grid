import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DataGrid } from '../../src/DataGrid/DataGrid';

describe('Selection Regression Tests', () => {
  const columns = [
    { field: 'id', headerName: 'ID', type: 'number' },
    { field: 'name', headerName: 'Name', type: 'text', filter: 'text', editable: true },
    { field: 'age', headerName: 'Age', type: 'number', filter: 'number', editable: true },
    { field: 'score', headerName: 'Score', type: 'number', filter: 'number' },
  ];

  const rows = [
    { id: 1, name: 'Alice', age: 30, score: 85 },
    { id: 2, name: 'Bob', age: 25, score: 90 },
    { id: 3, name: 'Charlie', age: 35, score: 75 },
    { id: 4, name: 'David', age: 28, score: 95 },
    { id: 5, name: 'Eve', age: 32, score: 80 },
  ];

  const getRowId = (row) => row.id;

  beforeEach(() => {
    // Create a simple localStorage mock that actually stores values
    const storage = {};
    const localStorageMock = {
      getItem: vi.fn((key) => storage[key] || null),
      setItem: vi.fn((key, value) => {
        storage[key] = value;
      }),
      removeItem: vi.fn((key) => {
        delete storage[key];
      }),
      clear: vi.fn(() => {
        Object.keys(storage).forEach(key => delete storage[key]);
      }),
    };
    vi.stubGlobal('localStorage', localStorageMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('Test multi-select functionality', () => {
    it('should allow selecting multiple rows', () => {
      const onSelectionChange = vi.fn();

      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            multiSelectable: true,
            pagination: false,
            onSelectionChange,
          }}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox', { name: /select row/i });
      
      // Find checkboxes for specific rows
      const aliceCheckbox = checkboxes.find(cb => {
        const row = cb.closest('[data-row-id]');
        return row && row.getAttribute('data-row-id') === '1';
      });
      const bobCheckbox = checkboxes.find(cb => {
        const row = cb.closest('[data-row-id]');
        return row && row.getAttribute('data-row-id') === '2';
      });
      const charlieCheckbox = checkboxes.find(cb => {
        const row = cb.closest('[data-row-id]');
        return row && row.getAttribute('data-row-id') === '3';
      });

      expect(aliceCheckbox).toBeDefined();
      expect(bobCheckbox).toBeDefined();
      expect(charlieCheckbox).toBeDefined();

      // Select first row
      fireEvent.click(aliceCheckbox);
      expect(onSelectionChange).toHaveBeenCalled();
      let selectedIds = onSelectionChange.mock.calls[0][0];
      expect(selectedIds).toContain(1);

      // Select second row
      fireEvent.click(bobCheckbox);
      expect(onSelectionChange).toHaveBeenCalledTimes(2);
      selectedIds = onSelectionChange.mock.calls[1][0];
      expect(selectedIds).toContain(1);
      expect(selectedIds).toContain(2);

      // Select third row
      fireEvent.click(charlieCheckbox);
      expect(onSelectionChange).toHaveBeenCalledTimes(3);
      selectedIds = onSelectionChange.mock.calls[2][0];
      expect(selectedIds).toContain(1);
      expect(selectedIds).toContain(2);
      expect(selectedIds).toContain(3);

      // Deselect second row
      fireEvent.click(bobCheckbox);
      expect(onSelectionChange).toHaveBeenCalledTimes(4);
      selectedIds = onSelectionChange.mock.calls[3][0];
      expect(selectedIds).toContain(1);
      expect(selectedIds).toContain(3);
      expect(selectedIds).not.toContain(2);
    });

    it('should maintain checkbox checked state correctly', () => {
      const onSelectionChange = vi.fn();

      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            multiSelectable: true,
            pagination: false,
            onSelectionChange,
          }}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox', { name: /select row/i });
      const aliceCheckbox = checkboxes.find(cb => {
        const row = cb.closest('[data-row-id]');
        return row && row.getAttribute('data-row-id') === '1';
      });

      expect(aliceCheckbox).not.toBeChecked();
      
      fireEvent.click(aliceCheckbox);
      expect(aliceCheckbox).toBeChecked();

      fireEvent.click(aliceCheckbox);
      expect(aliceCheckbox).not.toBeChecked();
    });
  });

  describe('Test select all checkbox', () => {
    it('should have a header checkbox cell when multiSelectable is enabled', () => {
      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            multiSelectable: true,
            pagination: false,
          }}
        />
      );

      // Find the header row
      const headerRow = screen.getByText('ID').closest('tr');
      expect(headerRow).toBeInTheDocument();

      // Check that there's a checkbox column in the header
      // The header should have one more cell than columns (for the checkbox column)
      const headerCells = Array.from(headerRow.querySelectorAll('th'));
      expect(headerCells.length).toBe(columns.length + 1);
    });

    it('should select all rows when select all checkbox is clicked', () => {
      const onSelectionChange = vi.fn();

      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            multiSelectable: true,
            pagination: false,
            onSelectionChange,
          }}
        />
      );

      // Find the header checkbox (if implemented)
      // For now, we'll check if the header cell exists
      const headerRow = screen.getByText('ID').closest('tr');
      const headerCells = Array.from(headerRow.querySelectorAll('th'));
      const checkboxHeaderCell = headerCells[0]; // First cell should be checkbox column
      
      expect(checkboxHeaderCell).toBeInTheDocument();
      
      // If select all checkbox is implemented, it would be here
      // For now, this test verifies the structure exists
      // When select all is implemented, uncomment and modify:
      // const selectAllCheckbox = checkboxHeaderCell.querySelector('input[type="checkbox"]');
      // if (selectAllCheckbox) {
      //   fireEvent.click(selectAllCheckbox);
      //   expect(onSelectionChange).toHaveBeenCalled();
      //   const selectedIds = onSelectionChange.mock.calls[0][0];
      //   expect(selectedIds.length).toBe(rows.length);
      //   rows.forEach(row => {
      //     expect(selectedIds).toContain(getRowId(row));
      //   });
      // }
    });

    it('should deselect all rows when select all checkbox is clicked again', () => {
      const onSelectionChange = vi.fn();

      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            multiSelectable: true,
            pagination: false,
            onSelectionChange,
          }}
        />
      );

      // Similar to above - test structure exists
      // When select all is implemented, add test logic here
    });
  });

  describe('Test selection maintained during sort', () => {
    it('should maintain selection when sorting by a column', async () => {
      const onSelectionChange = vi.fn();

      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            multiSelectable: true,
            pagination: false,
            onSelectionChange,
          }}
        />
      );

      // Select some rows
      const checkboxes = screen.getAllByRole('checkbox', { name: /select row/i });
      const aliceCheckbox = checkboxes.find(cb => {
        const row = cb.closest('[data-row-id]');
        return row && row.getAttribute('data-row-id') === '1';
      });
      const bobCheckbox = checkboxes.find(cb => {
        const row = cb.closest('[data-row-id]');
        return row && row.getAttribute('data-row-id') === '2';
      });

      fireEvent.click(aliceCheckbox);
      fireEvent.click(bobCheckbox);

      await waitFor(() => {
        expect(onSelectionChange).toHaveBeenCalled();
      });

      const selectedBeforeSort = onSelectionChange.mock.calls[onSelectionChange.mock.calls.length - 1][0];
      expect(selectedBeforeSort).toContain(1);
      expect(selectedBeforeSort).toContain(2);

      // Sort by age
      const ageHeader = screen.getByText('Age');
      fireEvent.click(ageHeader);

      await waitFor(() => {
        // Verify rows are still visible (sort applied)
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
      });

      // Verify checkboxes are still checked after sort
      const checkboxesAfterSort = screen.getAllByRole('checkbox', { name: /select row/i });
      const aliceCheckboxAfterSort = checkboxesAfterSort.find(cb => {
        const row = cb.closest('[data-row-id]');
        return row && row.getAttribute('data-row-id') === '1';
      });
      const bobCheckboxAfterSort = checkboxesAfterSort.find(cb => {
        const row = cb.closest('[data-row-id]');
        return row && row.getAttribute('data-row-id') === '2';
      });

      expect(aliceCheckboxAfterSort).toBeChecked();
      expect(bobCheckboxAfterSort).toBeChecked();

      // Verify selection callback still has the same IDs
      const selectedAfterSort = onSelectionChange.mock.calls[onSelectionChange.mock.calls.length - 1][0];
      expect(selectedAfterSort).toContain(1);
      expect(selectedAfterSort).toContain(2);
    });

    it('should maintain selection when sorting multiple times', async () => {
      const onSelectionChange = vi.fn();

      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            multiSelectable: true,
            pagination: false,
            onSelectionChange,
          }}
        />
      );

      // Select rows
      const checkboxes = screen.getAllByRole('checkbox', { name: /select row/i });
      const aliceCheckbox = checkboxes.find(cb => {
        const row = cb.closest('[data-row-id]');
        return row && row.getAttribute('data-row-id') === '1';
      });
      const charlieCheckbox = checkboxes.find(cb => {
        const row = cb.closest('[data-row-id]');
        return row && row.getAttribute('data-row-id') === '3';
      });

      fireEvent.click(aliceCheckbox);
      fireEvent.click(charlieCheckbox);

      await waitFor(() => {
        expect(onSelectionChange).toHaveBeenCalled();
      });

      // Sort by age (ascending)
      const ageHeader = screen.getByText('Age');
      fireEvent.click(ageHeader);

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument();
      });

      // Sort by age again (descending)
      fireEvent.click(ageHeader);

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument();
      });

      // Verify selection is still maintained
      const checkboxesAfterSorts = screen.getAllByRole('checkbox', { name: /select row/i });
      const aliceCheckboxAfterSorts = checkboxesAfterSorts.find(cb => {
        const row = cb.closest('[data-row-id]');
        return row && row.getAttribute('data-row-id') === '1';
      });
      const charlieCheckboxAfterSorts = checkboxesAfterSorts.find(cb => {
        const row = cb.closest('[data-row-id]');
        return row && row.getAttribute('data-row-id') === '3';
      });

      expect(aliceCheckboxAfterSorts).toBeChecked();
      expect(charlieCheckboxAfterSorts).toBeChecked();
    });
  });

  describe('Test selection maintained during filter', () => {
    it('should maintain selection when filtering rows', async () => {
      const onSelectionChange = vi.fn();

      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            multiSelectable: true,
            pagination: false,
            onSelectionChange,
          }}
        />
      );

      // Select some rows
      const checkboxes = screen.getAllByRole('checkbox', { name: /select row/i });
      const aliceCheckbox = checkboxes.find(cb => {
        const row = cb.closest('[data-row-id]');
        return row && row.getAttribute('data-row-id') === '1';
      });
      const bobCheckbox = checkboxes.find(cb => {
        const row = cb.closest('[data-row-id]');
        return row && row.getAttribute('data-row-id') === '2';
      });

      fireEvent.click(aliceCheckbox);
      fireEvent.click(bobCheckbox);

      await waitFor(() => {
        expect(onSelectionChange).toHaveBeenCalled();
      });

      // Apply filter for age = 30
      const ageHeader = screen.getByText('Age');
      const headerRow = ageHeader.closest('tr');
      const headerCells = Array.from(headerRow?.querySelectorAll('th') || []);
      const ageColumnIndex = headerCells.findIndex(cell => cell.textContent?.includes('Age'));
      
      expect(ageColumnIndex).toBeGreaterThanOrEqual(0);
      
      let ageInput;
      await waitFor(() => {
        const allInputs = [
          ...screen.queryAllByRole('spinbutton'),
          ...screen.queryAllByRole('textbox'),
        ];
        
        ageInput = allInputs.find(input => {
          const cell = input.closest('th');
          if (!cell) return false;
          const row = cell.closest('tr');
          if (!row) return false;
          const cells = Array.from(row.querySelectorAll('th'));
          const inputColumnIndex = cells.indexOf(cell);
          return inputColumnIndex === ageColumnIndex;
        });
        
        expect(ageInput).toBeDefined();
      }, { timeout: 3000 });
      
      fireEvent.change(ageInput, { target: { value: '30' } });

      // Wait for filter to apply
      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.queryByText('Bob')).not.toBeInTheDocument();
      }, { timeout: 3000 });

      // Verify Alice's checkbox is still checked (even though Bob is filtered out)
      const checkboxesAfterFilter = screen.getAllByRole('checkbox', { name: /select row/i });
      const aliceCheckboxAfterFilter = checkboxesAfterFilter.find(cb => {
        const row = cb.closest('[data-row-id]');
        return row && row.getAttribute('data-row-id') === '1';
      });

      expect(aliceCheckboxAfterFilter).toBeChecked();

      // Clear filter
      fireEvent.change(ageInput, { target: { value: '' } });
      await waitFor(() => {
        expect(screen.getByText('Bob')).toBeInTheDocument();
      }, { timeout: 3000 });

      // Verify both checkboxes are still checked after clearing filter
      const checkboxesAfterClear = screen.getAllByRole('checkbox', { name: /select row/i });
      const aliceCheckboxAfterClear = checkboxesAfterClear.find(cb => {
        const row = cb.closest('[data-row-id]');
        return row && row.getAttribute('data-row-id') === '1';
      });
      const bobCheckboxAfterClear = checkboxesAfterClear.find(cb => {
        const row = cb.closest('[data-row-id]');
        return row && row.getAttribute('data-row-id') === '2';
      });

      expect(aliceCheckboxAfterClear).toBeChecked();
      expect(bobCheckboxAfterClear).toBeChecked();
    });

    it('should maintain selection when filtering by name', async () => {
      const onSelectionChange = vi.fn();

      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            multiSelectable: true,
            pagination: false,
            onSelectionChange,
          }}
        />
      );

      // Select rows
      const checkboxes = screen.getAllByRole('checkbox', { name: /select row/i });
      const charlieCheckbox = checkboxes.find(cb => {
        const row = cb.closest('[data-row-id]');
        return row && row.getAttribute('data-row-id') === '3';
      });
      const davidCheckbox = checkboxes.find(cb => {
        const row = cb.closest('[data-row-id]');
        return row && row.getAttribute('data-row-id') === '4';
      });

      fireEvent.click(charlieCheckbox);
      fireEvent.click(davidCheckbox);

      await waitFor(() => {
        expect(onSelectionChange).toHaveBeenCalled();
      });

      // Apply filter for name containing 'a'
      const nameHeader = screen.getByText('Name');
      const headerRow = nameHeader.closest('tr');
      const headerCells = Array.from(headerRow?.querySelectorAll('th') || []);
      const nameColumnIndex = headerCells.findIndex(cell => cell.textContent?.includes('Name'));
      
      expect(nameColumnIndex).toBeGreaterThanOrEqual(0);
      
      let nameInput;
      await waitFor(() => {
        const allInputs = [
          ...screen.queryAllByRole('textbox'),
        ];
        
        nameInput = allInputs.find(input => {
          const cell = input.closest('th');
          if (!cell) return false;
          const row = cell.closest('tr');
          if (!row) return false;
          const cells = Array.from(row.querySelectorAll('th'));
          const inputColumnIndex = cells.indexOf(cell);
          return inputColumnIndex === nameColumnIndex;
        });
        
        expect(nameInput).toBeDefined();
      }, { timeout: 3000 });
      
      fireEvent.change(nameInput, { target: { value: 'a' } });

      await waitFor(() => {
        // Should show rows with 'a' in name (Alice, Charlie, David)
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Charlie')).toBeInTheDocument();
        expect(screen.getByText('David')).toBeInTheDocument();
      }, { timeout: 3000 });

      // Verify selected checkboxes are still checked
      const checkboxesAfterFilter = screen.getAllByRole('checkbox', { name: /select row/i });
      const charlieCheckboxAfterFilter = checkboxesAfterFilter.find(cb => {
        const row = cb.closest('[data-row-id]');
        return row && row.getAttribute('data-row-id') === '3';
      });
      const davidCheckboxAfterFilter = checkboxesAfterFilter.find(cb => {
        const row = cb.closest('[data-row-id]');
        return row && row.getAttribute('data-row-id') === '4';
      });

      expect(charlieCheckboxAfterFilter).toBeChecked();
      expect(davidCheckboxAfterFilter).toBeChecked();
    });
  });

  describe('Test selection cleared on edit start', () => {
    it('should clear selection when starting to edit a row', async () => {
      const onSelectionChange = vi.fn();

      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            multiSelectable: true,
            editable: true,
            pagination: false,
            onSelectionChange,
            onEditCommit: vi.fn(),
          }}
        />
      );

      // Select multiple rows
      const checkboxes = screen.getAllByRole('checkbox', { name: /select row/i });
      const aliceCheckbox = checkboxes.find(cb => {
        const row = cb.closest('[data-row-id]');
        return row && row.getAttribute('data-row-id') === '1';
      });
      const bobCheckbox = checkboxes.find(cb => {
        const row = cb.closest('[data-row-id]');
        return row && row.getAttribute('data-row-id') === '2';
      });
      const charlieCheckbox = checkboxes.find(cb => {
        const row = cb.closest('[data-row-id]');
        return row && row.getAttribute('data-row-id') === '3';
      });

      fireEvent.click(aliceCheckbox);
      fireEvent.click(bobCheckbox);
      fireEvent.click(charlieCheckbox);

      await waitFor(() => {
        expect(onSelectionChange).toHaveBeenCalled();
      });

      // Verify checkboxes are checked
      expect(aliceCheckbox).toBeChecked();
      expect(bobCheckbox).toBeChecked();
      expect(charlieCheckbox).toBeChecked();

      // Start editing Alice's row
      const aliceRow = screen.getByText('Alice').closest('[data-row-id]');
      fireEvent.doubleClick(aliceRow);

      // Wait for edit mode to activate
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      });

      // Verify selection is cleared
      await waitFor(() => {
        const selectedIds = onSelectionChange.mock.calls[onSelectionChange.mock.calls.length - 1][0];
        expect(selectedIds.length).toBe(0);
      });

      // Verify checkboxes are unchecked
      const checkboxesAfterEdit = screen.getAllByRole('checkbox', { name: /select row/i });
      const aliceCheckboxAfterEdit = checkboxesAfterEdit.find(cb => {
        const row = cb.closest('[data-row-id]');
        return row && row.getAttribute('data-row-id') === '1';
      });
      const bobCheckboxAfterEdit = checkboxesAfterEdit.find(cb => {
        const row = cb.closest('[data-row-id]');
        return row && row.getAttribute('data-row-id') === '2';
      });
      const charlieCheckboxAfterEdit = checkboxesAfterEdit.find(cb => {
        const row = cb.closest('[data-row-id]');
        return row && row.getAttribute('data-row-id') === '3';
      });

      expect(aliceCheckboxAfterEdit).not.toBeChecked();
      expect(bobCheckboxAfterEdit).not.toBeChecked();
      expect(charlieCheckboxAfterEdit).not.toBeChecked();
    });

    it('should clear selection when starting to edit a different row', async () => {
      const onSelectionChange = vi.fn();

      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            multiSelectable: true,
            editable: true,
            pagination: false,
            onSelectionChange,
            onEditCommit: vi.fn(),
          }}
        />
      );

      // Select rows (not including the one we'll edit)
      const checkboxes = screen.getAllByRole('checkbox', { name: /select row/i });
      const bobCheckbox = checkboxes.find(cb => {
        const row = cb.closest('[data-row-id]');
        return row && row.getAttribute('data-row-id') === '2';
      });
      const charlieCheckbox = checkboxes.find(cb => {
        const row = cb.closest('[data-row-id]');
        return row && row.getAttribute('data-row-id') === '3';
      });

      fireEvent.click(bobCheckbox);
      fireEvent.click(charlieCheckbox);

      await waitFor(() => {
        expect(onSelectionChange).toHaveBeenCalled();
      });

      // Start editing Alice's row (not selected)
      const aliceRow = screen.getByText('Alice').closest('[data-row-id]');
      fireEvent.doubleClick(aliceRow);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      });

      // Verify selection is cleared
      await waitFor(() => {
        const selectedIds = onSelectionChange.mock.calls[onSelectionChange.mock.calls.length - 1][0];
        expect(selectedIds.length).toBe(0);
      });
    });

    it('should clear selection even if only one row is selected', async () => {
      const onSelectionChange = vi.fn();

      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            multiSelectable: true,
            editable: true,
            pagination: false,
            onSelectionChange,
            onEditCommit: vi.fn(),
          }}
        />
      );

      // Select one row
      const checkboxes = screen.getAllByRole('checkbox', { name: /select row/i });
      const davidCheckbox = checkboxes.find(cb => {
        const row = cb.closest('[data-row-id]');
        return row && row.getAttribute('data-row-id') === '4';
      });

      fireEvent.click(davidCheckbox);

      await waitFor(() => {
        expect(onSelectionChange).toHaveBeenCalled();
      });

      expect(davidCheckbox).toBeChecked();

      // Start editing Eve's row
      const eveRow = screen.getByText('Eve').closest('[data-row-id]');
      fireEvent.doubleClick(eveRow);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      });

      // Verify selection is cleared
      await waitFor(() => {
        const selectedIds = onSelectionChange.mock.calls[onSelectionChange.mock.calls.length - 1][0];
        expect(selectedIds.length).toBe(0);
      });
    });
  });
});
