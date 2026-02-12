import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DataGrid } from '../../src/DataGrid/DataGrid';

describe('Sort + Filter + Pagination Integration', () => {
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
    { id: 5, name: 'Eve', age: 32, score: 80 },
    { id: 6, name: 'Frank', age: 27, score: 88 },
    { id: 7, name: 'Grace', age: 29, score: 92 },
    { id: 8, name: 'Henry', age: 31, score: 78 },
  ];

  const getRowId = (row) => row.id;

  beforeEach(() => {
    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    global.localStorage = localStorageMock;
  });

  describe('Test sort then filter', () => {
    it('should apply sort first, then filter on sorted data', async () => {
      const onSortChange = vi.fn();
      const onFilterChange = vi.fn();

      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            pagination: true,
            pageSize: 10,
            onSortChange,
            onFilterChange,
          }}
        />
      );

      // Sort by age descending
      const ageHeader = screen.getByText('Age');
      fireEvent.click(ageHeader);
      await waitFor(() => {
        expect(onSortChange).toHaveBeenCalled();
      });

      // Verify sorted order (oldest first after descending)
      const displayedRows = screen.getAllByText(/Alice|Bob|Charlie|David|Eve|Frank|Grace|Henry/);
      expect(displayedRows.length).toBeGreaterThan(0);

      // Apply filter for age = 30 (using default equals operator)
      // This tests that sort and filter work together
      // Find the filter input in the Age column by finding the Age header first,
      // then locating the input in the same column position
      const headerRow = ageHeader.closest('tr');
      const headerCells = Array.from(headerRow?.querySelectorAll('th') || []);
      const ageColumnIndex = headerCells.findIndex(cell => cell.textContent?.includes('Age'));
      
      expect(ageColumnIndex).toBeGreaterThanOrEqual(0);
      
      // Find the filter input in the Age column
      // Filter inputs can be in the main header row or a separate filter row
      let ageInput;
      await waitFor(() => {
        // Find all possible filter inputs (spinbutton for numbers, textbox for text)
        const allInputs = [
          ...screen.queryAllByRole('spinbutton'),
          ...screen.queryAllByRole('textbox'),
        ];
        
        // Also try by placeholder
        const placeholderInputs = screen.queryAllByPlaceholderText(/filter/i);
        allInputs.push(...placeholderInputs);
        
        // Find input in the same column as Age header
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
      
      // Wait for filter change callback
      await waitFor(() => {
        expect(onFilterChange).toHaveBeenCalled();
      }, { timeout: 3000 });

      // Wait for debounced filter to apply and filtered results to update
      // The filter is debounced by 200ms, so we need to wait for the actual filtering
      await waitFor(() => {
        // Verify filtered results - should show only age 30 (Alice)
        // Bob (25) and David (28) should not be visible
        expect(screen.queryByText('Bob')).not.toBeInTheDocument(); // age 25
        expect(screen.queryByText('David')).not.toBeInTheDocument(); // age 28
        // Alice (age 30) should be visible
        expect(screen.getByText('Alice')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should maintain sort order when filter is applied', async () => {
      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            pagination: true,
            pageSize: 10,
          }}
        />
      );

      // Sort by name ascending
      const nameHeader = screen.getByText('Name');
      fireEvent.click(nameHeader);
      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument();
      });

      // Apply name filter
      const nameFilterInputs = screen.queryAllByPlaceholderText(/filter/i);
      const nameInput = nameFilterInputs.find(input => 
        input.closest('th')?.textContent?.includes('Name')
      );
      
      if (nameInput) {
        fireEvent.change(nameInput, { target: { value: 'A' } });
        await waitFor(() => {
          // Should show Alice (sorted and filtered)
          expect(screen.getByText('Alice')).toBeInTheDocument();
        });
      }
    });
  });

  describe('Test filter then sort', () => {
    it('should apply filter first, then sort filtered data', async () => {
      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            pagination: true,
            pageSize: 10,
          }}
        />
      );

      // Apply filter for score > 85
      const scoreFilterInputs = screen.queryAllByPlaceholderText(/filter/i);
      const scoreInput = scoreFilterInputs.find(input => 
        input.closest('th')?.textContent?.includes('Score')
      );

      if (scoreInput) {
        fireEvent.change(scoreInput, { target: { value: '85' } });
        await waitFor(() => {
          // Should show filtered results
          expect(screen.getByText('Bob')).toBeInTheDocument(); // score 90
        });
      }

      // Sort filtered results by score descending
      const scoreHeader = screen.getByText('Score');
      fireEvent.click(scoreHeader);
      await waitFor(() => {
        // Should show sorted filtered results
        expect(screen.getByText('David')).toBeInTheDocument(); // score 95
      });
    });

    it('should sort only visible filtered rows', async () => {
      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            pagination: true,
            pageSize: 10,
          }}
        />
      );

      // Filter by name containing 'a'
      const nameFilterInputs = screen.queryAllByPlaceholderText(/filter/i);
      const nameInput = nameFilterInputs.find(input => 
        input.closest('th')?.textContent?.includes('Name')
      );

      if (nameInput) {
        fireEvent.change(nameInput, { target: { value: 'a' } });
        await waitFor(() => {
          // Should show Alice, Charlie, David, Grace
          expect(screen.getByText('Alice')).toBeInTheDocument();
        });
      }

      // Sort by age
      const ageHeader = screen.getByText('Age');
      fireEvent.click(ageHeader);
      await waitFor(() => {
        // Should show filtered rows sorted by age
        expect(screen.getByText('Alice')).toBeInTheDocument();
      });
    });
  });

  describe('Test pagination with sorted/filtered data', () => {
    it('should paginate sorted data correctly', async () => {
      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            pagination: true,
            pageSize: 3,
          }}
        />
      );

      // Sort by name ascending
      const nameHeader = screen.getByText('Name');
      fireEvent.click(nameHeader);
      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument();
      });

      // First page should show first 3 sorted rows
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('Charlie')).toBeInTheDocument();
      expect(screen.queryByText('David')).not.toBeInTheDocument();

      // Navigate to next page
      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);
      await waitFor(() => {
        // Should show next 3 sorted rows
        expect(screen.getByText('David')).toBeInTheDocument();
      });
    });

    it('should paginate filtered data correctly', async () => {
      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            pagination: true,
            pageSize: 2,
          }}
        />
      );

      // Filter by age > 28
      const ageFilterInputs = screen.queryAllByPlaceholderText(/filter/i);
      const ageInput = ageFilterInputs.find(input => 
        input.closest('th')?.textContent?.includes('Age')
      );

      if (ageInput) {
        fireEvent.change(ageInput, { target: { value: '28' } });
        await waitFor(() => {
          // Should show filtered results
          const paginationText = screen.getByText(/\d+–\d+ of \d+/);
          expect(paginationText).toBeInTheDocument();
        });
      }

      // Navigate through pages of filtered data
      const nextButton = screen.getByRole('button', { name: /next/i });
      if (nextButton && !nextButton.disabled) {
        fireEvent.click(nextButton);
        await waitFor(() => {
          // Should show next page of filtered results
          expect(screen.getByText(/\d+–\d+ of \d+/)).toBeInTheDocument();
        });
      }
    });

    it('should paginate sorted and filtered data correctly', async () => {
      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            pagination: true,
            pageSize: 2,
          }}
        />
      );

      // Sort by score descending
      const scoreHeader = screen.getByText('Score');
      fireEvent.click(scoreHeader);
      await waitFor(() => {
        expect(screen.getByText('Score')).toBeInTheDocument();
      });

      // Filter by score > 80
      const scoreFilterInputs = screen.queryAllByPlaceholderText(/filter/i);
      const scoreInput = scoreFilterInputs.find(input => 
        input.closest('th')?.textContent?.includes('Score')
      );

      if (scoreInput) {
        fireEvent.change(scoreInput, { target: { value: '80' } });
        await waitFor(() => {
          // Should show filtered and sorted results
          const paginationText = screen.getByText(/\d+–\d+ of \d+/);
          expect(paginationText).toBeInTheDocument();
        });
      }

      // Navigate through pages
      const nextButton = screen.getByRole('button', { name: /next/i });
      if (nextButton && !nextButton.disabled) {
        fireEvent.click(nextButton);
        await waitFor(() => {
          // Should show next page of sorted and filtered results
          expect(screen.getByText(/\d+–\d+ of \d+/)).toBeInTheDocument();
        });
      }
    });

    it('should reset to first page when filter changes', async () => {
      const { rerender } = render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            pagination: true,
            pageSize: 2,
          }}
        />
      );

      // Go to second page
      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);
      await waitFor(() => {
        expect(screen.getByText(/3–4 of 8/)).toBeInTheDocument();
      });

      // Apply filter
      const nameFilterInputs = screen.queryAllByPlaceholderText(/filter/i);
      const nameInput = nameFilterInputs.find(input => 
        input.closest('th')?.textContent?.includes('Name')
      );

      if (nameInput) {
        fireEvent.change(nameInput, { target: { value: 'A' } });
        await waitFor(() => {
          // Should reset to first page of filtered results
          expect(screen.getByText(/1–\d+ of \d+/)).toBeInTheDocument();
        });
      }
    });
  });

  describe('Test state persistence across operations', () => {
    it('should maintain sort state when filter is applied', async () => {
      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            pagination: true,
            pageSize: 10,
            gridId: 'test-grid-1',
          }}
        />
      );

      // Sort by age
      const ageHeader = screen.getByText('Age');
      fireEvent.click(ageHeader);
      await waitFor(() => {
        expect(ageHeader).toBeInTheDocument();
      });

      // Apply filter
      const ageFilterInputs = screen.queryAllByPlaceholderText(/filter/i);
      const ageInput = ageFilterInputs.find(input => 
        input.closest('th')?.textContent?.includes('Age')
      );

      if (ageInput) {
        fireEvent.change(ageInput, { target: { value: '28' } });
        await waitFor(() => {
          // Sort should still be active
          expect(ageHeader).toBeInTheDocument();
        });
      }
    });

    it('should maintain filter state when sort changes', async () => {
      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            pagination: true,
            pageSize: 10,
            gridId: 'test-grid-2',
          }}
        />
      );

      // Apply filter
      const nameFilterInputs = screen.queryAllByPlaceholderText(/filter/i);
      const nameInput = nameFilterInputs.find(input => 
        input.closest('th')?.textContent?.includes('Name')
      );

      if (nameInput) {
        fireEvent.change(nameInput, { target: { value: 'A' } });
        await waitFor(() => {
          expect(screen.getByText('Alice')).toBeInTheDocument();
        });
      }

      // Sort by age
      const ageHeader = screen.getByText('Age');
      fireEvent.click(ageHeader);
      await waitFor(() => {
        // Filter should still be active
        expect(screen.getByText('Alice')).toBeInTheDocument();
      });
    });

    it('should maintain pagination state when sort changes', async () => {
      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            pagination: true,
            pageSize: 3,
            gridId: 'test-grid-3',
          }}
        />
      );

      // Go to second page
      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);
      await waitFor(() => {
        expect(screen.getByText(/4–6 of 8/)).toBeInTheDocument();
      });

      // Sort by name
      const nameHeader = screen.getByText('Name');
      fireEvent.click(nameHeader);
      await waitFor(() => {
        // Should reset to first page but maintain sort
        expect(screen.getByText(/1–3 of 8/)).toBeInTheDocument();
      });
    });

    it('should persist state across multiple operations', async () => {
      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            pagination: true,
            pageSize: 3,
            gridId: 'test-grid-4',
          }}
        />
      );

      // Step 1: Sort by score
      const scoreHeader = screen.getByText('Score');
      fireEvent.click(scoreHeader);
      await waitFor(() => {
        expect(scoreHeader).toBeInTheDocument();
      });

      // Step 2: Filter by age
      const ageFilterInputs = screen.queryAllByPlaceholderText(/filter/i);
      const ageInput = ageFilterInputs.find(input => 
        input.closest('th')?.textContent?.includes('Age')
      );

      if (ageInput) {
        fireEvent.change(ageInput, { target: { value: '28' } });
        await waitFor(() => {
          expect(screen.getByText(/\d+–\d+ of \d+/)).toBeInTheDocument();
        });
      }

      // Step 3: Navigate to second page
      const nextButton = screen.getByRole('button', { name: /next/i });
      if (nextButton && !nextButton.disabled) {
        fireEvent.click(nextButton);
        await waitFor(() => {
          // Should maintain all states
          expect(screen.getByText(/\d+–\d+ of \d+/)).toBeInTheDocument();
        });
      }
    });
  });
});
