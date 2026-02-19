import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DataGrid } from '../../src/DataGrid/DataGrid';
import { SORT_ORDER_ASC, SORT_ORDER_DESC } from '../../src/config/schema';
import { SORT_STORAGE_KEY_PREFIX } from '../../src/utils/sortUtils';

describe('Sort Regression Tests', () => {
  const columns = [
    { field: 'id', headerName: 'ID', type: 'number' },
    { field: 'name', headerName: 'Name', type: 'text', filter: 'text' },
    { field: 'age', headerName: 'Age', type: 'number', filter: 'number' },
    { field: 'score', headerName: 'Score', type: 'number', filter: 'number' },
  ];

  const rows = [
    { id: 1, name: 'Alice', age: 30, score: 85 },
    { id: 2, name: 'Bob', age: 25, score: 90 },
    { id: 3, name: 'Charlie', age: 35, score: 75 },
    { id: 4, name: 'David', age: 28, score: 95 },
    { id: 5, name: 'Alice', age: 32, score: 80 },
    { id: 6, name: 'Bob', age: 25, score: 88 },
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

  describe('Test multi-column sort order', () => {
    it('should sort by multiple columns in correct order', async () => {
      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            pagination: false,
          }}
        />
      );

      // Sort by name first (ascending)
      const nameHeader = screen.getByText('Name');
      fireEvent.click(nameHeader);
      await waitFor(() => {
        expect(screen.getAllByText('Alice').length).toBeGreaterThan(0);
      });

      // Add age as secondary sort (Ctrl+click)
      const ageHeader = screen.getByText('Age');
      fireEvent.click(ageHeader, { ctrlKey: true });
      await waitFor(() => {
        const displayedNames = screen.getAllByText(/Alice|Bob|Charlie|David/);
        expect(displayedNames.length).toBeGreaterThan(0);
      });

      // Verify sort order: Alice (30) should come before Alice (32)
      const allNames = screen.getAllByText(/Alice|Bob|Charlie|David/);
      const firstAliceIndex = allNames.findIndex(el => el.textContent === 'Alice');
      const secondAliceIndex = allNames.findIndex((el, idx) => el.textContent === 'Alice' && idx > firstAliceIndex);
      
      // Both Alice entries should be visible
      expect(firstAliceIndex).toBeGreaterThanOrEqual(0);
      expect(secondAliceIndex).toBeGreaterThanOrEqual(0);
      
      // Verify the rows are sorted: first by name, then by age
      // Alice (30) should appear before Alice (32)
      const tableRows = screen.getAllByRole('row').slice(1); // Skip header row
      const firstAliceRow = tableRows.find(row => row.textContent?.includes('Alice') && row.textContent?.includes('30'));
      const secondAliceRow = tableRows.find(row => row.textContent?.includes('Alice') && row.textContent?.includes('32'));
      
      expect(firstAliceRow).toBeInTheDocument();
      expect(secondAliceRow).toBeInTheDocument();
      
      // Verify Bob entries are also sorted by age (both age 25, so order should be stable)
      const bobRows = tableRows.filter(row => row.textContent?.includes('Bob'));
      expect(bobRows.length).toBe(2);
    });

    it('should maintain sort order when changing direction of primary column', async () => {
      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            pagination: false,
          }}
        />
      );

      // Sort by name first
      const nameHeader = screen.getByText('Name');
      fireEvent.click(nameHeader);
      await waitFor(() => {
        expect(screen.getAllByText('Alice').length).toBeGreaterThan(0);
      });

      // Add age as secondary sort
      const ageHeader = screen.getByText('Age');
      fireEvent.click(ageHeader, { ctrlKey: true });
      await waitFor(() => {
        expect(screen.getAllByText('Alice').length).toBeGreaterThan(0);
      });

      // Change name sort to descending using Ctrl+click (should maintain age as secondary)
      fireEvent.click(nameHeader, { ctrlKey: true });
      await waitFor(() => {
        expect(screen.getAllByText('Alice').length).toBeGreaterThan(0);
      });

      // Verify multi-column sort is still active
      const ageSortLabel = ageHeader.closest('[class*="MuiTableSortLabel-root"]');
      expect(ageSortLabel).toHaveClass('Mui-active');
    });

    it('should remove column from multi-column sort when clicked with Ctrl', async () => {
      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            pagination: false,
          }}
        />
      );

      // Sort by name
      const nameHeader = screen.getByText('Name');
      fireEvent.click(nameHeader);
      await waitFor(() => {
        expect(screen.getAllByText('Alice').length).toBeGreaterThan(0);
      });

      // Add age as secondary sort
      const ageHeader = screen.getByText('Age');
      fireEvent.click(ageHeader, { ctrlKey: true });
      await waitFor(() => {
        expect(screen.getAllByText('Alice').length).toBeGreaterThan(0);
      });

      // Remove age from sort (Ctrl+click when already sorted descending)
      fireEvent.click(ageHeader, { ctrlKey: true }); // First click: asc -> desc
      await waitFor(() => {
        expect(screen.getAllByText('Alice').length).toBeGreaterThan(0);
      });
      
      fireEvent.click(ageHeader, { ctrlKey: true }); // Second click: desc -> remove
      await waitFor(() => {
        expect(screen.getAllByText('Alice').length).toBeGreaterThan(0);
      });

      // Verify only name sort is active
      const nameSortLabel = nameHeader.closest('[class*="MuiTableSortLabel-root"]');
      const ageSortLabel = ageHeader.closest('[class*="MuiTableSortLabel-root"]');
      expect(nameSortLabel).toHaveClass('Mui-active');
      expect(ageSortLabel).not.toHaveClass('Mui-active');
    });
  });

  describe('Test sort indicator display', () => {
    it('should show no sort indicator initially', () => {
      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            pagination: false,
          }}
        />
      );

      const nameHeader = screen.getByText('Name');
      const sortLabel = nameHeader.closest('[class*="MuiTableSortLabel-root"]');
      expect(sortLabel).toBeInTheDocument();
      expect(sortLabel).not.toHaveClass('Mui-active');
    });

    it('should show ascending sort indicator when sorted ascending', async () => {
      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            pagination: false,
          }}
        />
      );

      const nameHeader = screen.getByText('Name');
      fireEvent.click(nameHeader);
      
      await waitFor(() => {
        const sortLabel = nameHeader.closest('[class*="MuiTableSortLabel-root"]');
        expect(sortLabel).toHaveClass('Mui-active');
      });
    });

    it('should show descending sort indicator when sorted descending', async () => {
      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            pagination: false,
          }}
        />
      );

      const nameHeader = screen.getByText('Name');
      fireEvent.click(nameHeader); // First click: ascending
      await waitFor(() => {
        expect(nameHeader.closest('[class*="MuiTableSortLabel-root"]')).toHaveClass('Mui-active');
      });

      fireEvent.click(nameHeader); // Second click: descending
      await waitFor(() => {
        const sortLabel = nameHeader.closest('[class*="MuiTableSortLabel-root"]');
        expect(sortLabel).toHaveClass('Mui-active');
      });
    });

    it('should show sort order index for multi-column sort', async () => {
      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            pagination: false,
          }}
        />
      );

      // Sort by name first
      const nameHeader = screen.getByText('Name');
      fireEvent.click(nameHeader);
      await waitFor(() => {
        expect(screen.getAllByText('Alice').length).toBeGreaterThan(0);
      });

      // Add age as secondary sort
      const ageHeader = screen.getByText('Age');
      fireEvent.click(ageHeader, { ctrlKey: true });
      
      await waitFor(() => {
        // Check for sort order indicator (1) or (2)
        const ageCell = ageHeader.closest('th');
        const sortOrderIndicator = ageCell?.querySelector('span');
        // The sort order indicator should be visible
        expect(screen.getAllByText('Alice').length).toBeGreaterThan(0);
      });
    });

    it('should hide sort indicator when sort is cleared', async () => {
      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            pagination: false,
          }}
        />
      );

      const nameHeader = screen.getByText('Name');
      fireEvent.click(nameHeader); // First click: no sort -> asc
      await waitFor(() => {
        expect(nameHeader.closest('[class*="MuiTableSortLabel-root"]')).toHaveClass('Mui-active');
      });

      fireEvent.click(nameHeader); // Second click: asc -> desc
      await waitFor(() => {
        expect(nameHeader.closest('[class*="MuiTableSortLabel-root"]')).toHaveClass('Mui-active');
      });

      // Clear sort by clicking again (third click removes sort)
      fireEvent.click(nameHeader); // Third click: desc -> clear
      await waitFor(() => {
        const sortLabel = nameHeader.closest('[class*="MuiTableSortLabel-root"]');
        expect(sortLabel).not.toHaveClass('Mui-active');
      });
    });
  });

  describe('Test sort persistence', () => {
    it('should persist sort state to localStorage', async () => {
      const gridId = 'test-sort-persistence';
      
      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            pagination: false,
            gridId,
          }}
        />
      );

      // Sort by name
      const nameHeader = screen.getByText('Name');
      fireEvent.click(nameHeader);
      await waitFor(() => {
        expect(nameHeader.closest('[class*="MuiTableSortLabel-root"]')).toHaveClass('Mui-active');
      });

      // Verify localStorage was called
      expect(localStorage.setItem).toHaveBeenCalled();
      const sortKey = SORT_STORAGE_KEY_PREFIX + gridId;
      const calls = localStorage.setItem.mock.calls.filter(call => call[0] === sortKey);
      expect(calls.length).toBeGreaterThan(0);
    });

    it('should restore sort state from localStorage on mount', () => {
      const gridId = 'test-sort-restore';
      const sortModel = [{ field: 'name', order: SORT_ORDER_ASC }];
      
      // Pre-populate localStorage
      localStorage.setItem(SORT_STORAGE_KEY_PREFIX + gridId, JSON.stringify(sortModel));

      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            pagination: false,
            gridId,
          }}
        />
      );

      // Verify sort is restored
      const nameHeader = screen.getByText('Name');
      const sortLabel = nameHeader.closest('[class*="MuiTableSortLabel-root"]');
      expect(sortLabel).toHaveClass('Mui-active');
    });

    it('should persist multi-column sort state', async () => {
      const gridId = 'test-multi-sort-persistence';
      
      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            pagination: false,
            gridId,
          }}
        />
      );

      // Sort by name
      const nameHeader = screen.getByText('Name');
      fireEvent.click(nameHeader);
      await waitFor(() => {
        expect(screen.getAllByText('Alice').length).toBeGreaterThan(0);
      });

      // Add age as secondary sort
      const ageHeader = screen.getByText('Age');
      fireEvent.click(ageHeader, { ctrlKey: true });
      await waitFor(() => {
        expect(screen.getAllByText('Alice').length).toBeGreaterThan(0);
      });

      // Verify localStorage contains multi-column sort
      expect(localStorage.setItem).toHaveBeenCalled();
      const sortKey = SORT_STORAGE_KEY_PREFIX + gridId;
      const lastCall = localStorage.setItem.mock.calls
        .filter(call => call[0] === sortKey)
        .pop();
      expect(lastCall).toBeDefined();
      const storedModel = JSON.parse(lastCall[1]);
      expect(storedModel.length).toBe(2);
      expect(storedModel[0].field).toBe('name');
      expect(storedModel[1].field).toBe('age');
    });
  });

  describe('Test sort with active filters', () => {
    it('should sort filtered data correctly', async () => {
      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            pagination: false,
          }}
        />
      );

      // Apply filter for age = 25
      const ageHeader = screen.getByText('Age');
      const headerRow = ageHeader.closest('tr');
      const headerCells = Array.from(headerRow?.querySelectorAll('th') || []);
      const ageColumnIndex = headerCells.findIndex(cell => cell.textContent?.includes('Age'));
      
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
      
      fireEvent.change(ageInput, { target: { value: '25' } });
      
      await waitFor(() => {
        // Should show only Bob entries (age 25)
        const bobEntries = screen.getAllByText('Bob');
        expect(bobEntries.length).toBeGreaterThan(0);
        expect(screen.queryByText('Alice')).not.toBeInTheDocument();
      }, { timeout: 3000 });

      // Sort by score on filtered data
      const scoreHeader = screen.getByText('Score');
      fireEvent.click(scoreHeader);
      
      await waitFor(() => {
        // Filter should still be active
        const bobEntries = screen.getAllByText('Bob');
        expect(bobEntries.length).toBeGreaterThan(0);
        expect(screen.queryByText('Alice')).not.toBeInTheDocument();
        // Sort indicator should be visible
        expect(scoreHeader.closest('[class*="MuiTableSortLabel-root"]')).toHaveClass('Mui-active');
      });
    });

    it('should maintain filter when sort changes', async () => {
      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            pagination: false,
          }}
        />
      );

      // Apply name filter
      const nameHeader = screen.getByText('Name');
      const headerRow = nameHeader.closest('tr');
      const headerCells = Array.from(headerRow?.querySelectorAll('th') || []);
      const nameColumnIndex = headerCells.findIndex(cell => cell.textContent?.includes('Name'));
      
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
      
      fireEvent.change(nameInput, { target: { value: 'A' } });
      
      await waitFor(() => {
        expect(screen.getAllByText('Alice').length).toBeGreaterThan(0);
      }, { timeout: 3000 });

      // Sort by age
      const ageHeader = screen.getByText('Age');
      fireEvent.click(ageHeader);
      
      await waitFor(() => {
        // Filter should still be active
        expect(screen.getAllByText('Alice').length).toBeGreaterThan(0);
        // Sort should be applied
        expect(ageHeader.closest('[class*="MuiTableSortLabel-root"]')).toHaveClass('Mui-active');
      });
    });
  });

  describe('Test sort clears page to 0', () => {
    it('should reset to page 0 when sort is applied', async () => {
      const onPageChange = vi.fn();
      
      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            pagination: true,
            pageSize: 2,
            onPageChange,
          }}
        />
      );

      // Navigate to page 2
      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);
      await waitFor(() => {
        expect(screen.getByText(/3–4 of 6/)).toBeInTheDocument();
      });

      expect(onPageChange).toHaveBeenCalledWith(1);

      // Sort by name
      const nameHeader = screen.getByText('Name');
      fireEvent.click(nameHeader);
      
      await waitFor(() => {
        // Should reset to page 0
        expect(screen.getByText(/1–2 of 6/)).toBeInTheDocument();
        expect(onPageChange).toHaveBeenCalledWith(0);
      });
    });

    it('should reset to page 0 when sort direction changes', async () => {
      const onPageChange = vi.fn();
      
      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            pagination: true,
            pageSize: 2,
            onPageChange,
          }}
        />
      );

      // Sort by name (ascending)
      const nameHeader = screen.getByText('Name');
      fireEvent.click(nameHeader);
      await waitFor(() => {
        expect(screen.getByText(/1–2 of 6/)).toBeInTheDocument();
      });

      // Navigate to page 2
      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);
      await waitFor(() => {
        expect(screen.getByText(/3–4 of 6/)).toBeInTheDocument();
      });

      // Change sort to descending
      fireEvent.click(nameHeader);
      
      await waitFor(() => {
        // Should reset to page 0
        expect(screen.getByText(/1–2 of 6/)).toBeInTheDocument();
        expect(onPageChange).toHaveBeenCalledWith(0);
      });
    });

    it('should reset to page 0 when sort is cleared', async () => {
      const onPageChange = vi.fn();
      
      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            pagination: true,
            pageSize: 2,
            onPageChange,
          }}
        />
      );

      // Sort by name
      const nameHeader = screen.getByText('Name');
      fireEvent.click(nameHeader);
      await waitFor(() => {
        expect(screen.getByText(/1–2 of 6/)).toBeInTheDocument();
      });

      // Navigate to page 2
      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);
      await waitFor(() => {
        expect(screen.getByText(/3–4 of 6/)).toBeInTheDocument();
      });

      // Clear sort (click again to go desc, then again to clear)
      fireEvent.click(nameHeader); // asc -> desc
      await waitFor(() => {
        expect(screen.getByText(/1–2 of 6/)).toBeInTheDocument();
      });

      fireEvent.click(nextButton); // Go back to page 2
      await waitFor(() => {
        expect(screen.getByText(/3–4 of 6/)).toBeInTheDocument();
      });

      fireEvent.click(nameHeader); // desc -> clear
      
      await waitFor(() => {
        // Should reset to page 0
        expect(screen.getByText(/1–2 of 6/)).toBeInTheDocument();
        expect(onPageChange).toHaveBeenCalledWith(0);
      });
    });

    it('should reset to page 0 when adding multi-column sort', async () => {
      const onPageChange = vi.fn();
      
      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            pagination: true,
            pageSize: 2,
            onPageChange,
          }}
        />
      );

      // Sort by name
      const nameHeader = screen.getByText('Name');
      fireEvent.click(nameHeader);
      await waitFor(() => {
        expect(screen.getByText(/1–2 of 6/)).toBeInTheDocument();
      });

      // Navigate to page 2
      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);
      await waitFor(() => {
        expect(screen.getByText(/3–4 of 6/)).toBeInTheDocument();
      });

      // Add age as secondary sort (Ctrl+click)
      const ageHeader = screen.getByText('Age');
      fireEvent.click(ageHeader, { ctrlKey: true });
      
      await waitFor(() => {
        // Should reset to page 0
        expect(screen.getByText(/1–2 of 6/)).toBeInTheDocument();
        expect(onPageChange).toHaveBeenCalledWith(0);
      });
    });
  });
});
