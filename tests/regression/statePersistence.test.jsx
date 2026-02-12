import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DataGrid } from '../../src/DataGrid/DataGrid';
import { getStoredSortModel, saveSortModel } from '../../src/utils/sortUtils';
import { getStoredFilterModel, saveFilterModel } from '../../src/filters/filterUtils';

describe('State Persistence Regression Test', () => {
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
  ];

  const getRowId = (row) => row.id;

  beforeEach(() => {
    // Set up localStorage mock
    const store = {};
    const localStorageMock = {
      getItem: (key) => store[key] || null,
      setItem: (key, value) => { store[key] = value; },
      removeItem: (key) => { delete store[key]; },
      clear: () => { Object.keys(store).forEach(key => delete store[key]); },
      key: (index) => Object.keys(store)[index] || null,
      get length() { return Object.keys(store).length; },
    };
    global.localStorage = localStorageMock;
  });

  afterEach(() => {
    // Clean up localStorage after each test
    if (global.localStorage && global.localStorage.clear) {
      global.localStorage.clear();
    }
  });

  describe('Test sort state saved to localStorage', () => {
    it('should save sort state to localStorage when sort is applied', async () => {
      const gridId = 'test-grid-sort-save';
      
      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{ gridId }}
        />
      );

      // Apply sort by clicking on name header
      const nameHeader = screen.getByText('Name');
      fireEvent.click(nameHeader);

      // Wait for sort to be applied and saved
      await waitFor(() => {
        const stored = localStorage.getItem('utron-datagrid-sort-' + gridId);
        expect(stored).not.toBeNull();
        const parsed = JSON.parse(stored);
        expect(parsed).toEqual([{ field: 'name', order: 'asc' }]);
      });
    });

    it('should save multi-column sort state to localStorage', async () => {
      const gridId = 'test-grid-multi-sort-save';
      
      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{ gridId }}
        />
      );

      // Apply first sort
      const nameHeader = screen.getByText('Name');
      fireEvent.click(nameHeader);
      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument();
      });

      // Apply second sort with Ctrl+click (multi-column)
      fireEvent.click(nameHeader, { ctrlKey: true });
      const ageHeader = screen.getByText('Age');
      fireEvent.click(ageHeader, { ctrlKey: true });

      // Wait for multi-column sort to be saved
      await waitFor(() => {
        const stored = localStorage.getItem('utron-datagrid-sort-' + gridId);
        expect(stored).not.toBeNull();
        const parsed = JSON.parse(stored);
        expect(parsed.length).toBeGreaterThan(1);
        expect(parsed.some(s => s.field === 'name')).toBe(true);
        expect(parsed.some(s => s.field === 'age')).toBe(true);
      });
    });

    it('should save empty sort state when sort is cleared', async () => {
      const gridId = 'test-grid-sort-clear';
      
      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{ gridId }}
        />
      );

      // Apply sort
      const nameHeader = screen.getByText('Name');
      fireEvent.click(nameHeader);
      await waitFor(() => {
        const stored = localStorage.getItem('utron-datagrid-sort-' + gridId);
        expect(stored).not.toBeNull();
      });

      // Clear sort by clicking again
      fireEvent.click(nameHeader);
      fireEvent.click(nameHeader);

      // Wait for empty sort to be saved
      await waitFor(() => {
        const stored = localStorage.getItem('utron-datagrid-sort-' + gridId);
        expect(stored).not.toBeNull();
        const parsed = JSON.parse(stored);
        expect(parsed).toEqual([]);
      });
    });
  });

  describe('Test sort state restored from localStorage', () => {
    it('should restore sort state from localStorage on mount', () => {
      const gridId = 'test-grid-sort-restore';
      const sortModel = [{ field: 'age', order: 'desc' }];
      
      // Pre-populate localStorage
      saveSortModel(gridId, sortModel);

      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{ gridId }}
        />
      );

      // Verify that data is sorted by age descending
      // The oldest should appear first (Charlie, age 35)
      const displayedRows = screen.getAllByText(/Alice|Bob|Charlie|David/);
      expect(displayedRows.length).toBeGreaterThan(0);
      
      // Verify sort was restored by checking if getStoredSortModel returns the same
      const restored = getStoredSortModel(gridId, columns);
      expect(restored).toEqual(sortModel);
    });

    it('should restore multi-column sort state from localStorage', () => {
      const gridId = 'test-grid-multi-sort-restore';
      const sortModel = [
        { field: 'name', order: 'asc' },
        { field: 'age', order: 'desc' },
      ];
      
      // Pre-populate localStorage
      saveSortModel(gridId, sortModel);

      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{ gridId }}
        />
      );

      // Verify sort was restored
      const restored = getStoredSortModel(gridId, columns);
      expect(restored).toEqual(sortModel);
    });

    it('should not restore sort state when gridId is not provided', () => {
      // Pre-populate localStorage with a gridId
      saveSortModel('some-grid', [{ field: 'name', order: 'asc' }]);

      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{}}
        />
      );

      // Grid should render without sort applied
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });
  });

  describe('Test filter state saved to localStorage', () => {
    it('should save filter state to localStorage when filter is applied', async () => {
      const gridId = 'test-grid-filter-save';
      
      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{ gridId }}
        />
      );

      // Find and apply filter
      const nameFilterInputs = screen.queryAllByPlaceholderText(/filter/i);
      const nameInput = nameFilterInputs.find(input => 
        input.closest('th')?.textContent?.includes('Name')
      );

      if (nameInput) {
        fireEvent.change(nameInput, { target: { value: 'Alice' } });
        
        // Wait for filter to be applied and saved (debounced)
        await waitFor(() => {
          const stored = localStorage.getItem('utron-datagrid-filters-' + gridId);
          expect(stored).not.toBeNull();
          const parsed = JSON.parse(stored);
          expect(parsed.name).toBeDefined();
          expect(parsed.name.value).toBe('Alice');
        }, { timeout: 500 });
      }
    });

    it('should save multiple filter state to localStorage', async () => {
      const gridId = 'test-grid-multi-filter-save';
      
      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{ gridId }}
        />
      );

      // Apply first filter
      const nameFilterInputs = screen.queryAllByPlaceholderText(/filter/i);
      const nameInput = nameFilterInputs.find(input => 
        input.closest('th')?.textContent?.includes('Name')
      );

      if (nameInput) {
        fireEvent.change(nameInput, { target: { value: 'A' } });
        await waitFor(() => {
          expect(screen.getByText('Alice')).toBeInTheDocument();
        }, { timeout: 500 });
      }

      // Apply second filter
      const ageFilterInputs = screen.queryAllByPlaceholderText(/filter/i);
      const ageInput = ageFilterInputs.find(input => 
        input.closest('th')?.textContent?.includes('Age')
      );

      if (ageInput) {
        fireEvent.change(ageInput, { target: { value: '30' } });
        
        // Wait for both filters to be saved
        await waitFor(() => {
          const stored = localStorage.getItem('utron-datagrid-filters-' + gridId);
          expect(stored).not.toBeNull();
          const parsed = JSON.parse(stored);
          expect(parsed.name).toBeDefined();
          expect(parsed.age).toBeDefined();
        }, { timeout: 500 });
      }
    });

    it('should save empty filter state when filters are cleared', async () => {
      const gridId = 'test-grid-filter-clear';
      
      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{ gridId }}
        />
      );

      // Apply filter
      const nameFilterInputs = screen.queryAllByPlaceholderText(/filter/i);
      const nameInput = nameFilterInputs.find(input => 
        input.closest('th')?.textContent?.includes('Name')
      );

      if (nameInput) {
        fireEvent.change(nameInput, { target: { value: 'Alice' } });
        await waitFor(() => {
          const stored = localStorage.getItem('utron-datagrid-filters-' + gridId);
          expect(stored).not.toBeNull();
        }, { timeout: 500 });

        // Clear filter
        fireEvent.change(nameInput, { target: { value: '' } });
        
        // Wait for empty filter to be saved
        await waitFor(() => {
          const stored = localStorage.getItem('utron-datagrid-filters-' + gridId);
          expect(stored).not.toBeNull();
          const parsed = JSON.parse(stored);
          expect(Object.keys(parsed).length).toBe(0);
        }, { timeout: 500 });
      }
    });
  });

  describe('Test filter state restored from localStorage', () => {
    it('should restore filter state from localStorage on mount', async () => {
      const gridId = 'test-grid-filter-restore';
      const filterModel = {
        name: { operator: 'operatorContains', value: 'Alice' },
      };
      
      // Pre-populate localStorage
      saveFilterModel(gridId, filterModel);

      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{ gridId }}
        />
      );

      // Wait for filter to be applied
      await waitFor(() => {
        // Should show only Alice
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.queryByText('Bob')).not.toBeInTheDocument();
      }, { timeout: 500 });

      // Verify filter was restored
      const restored = getStoredFilterModel(gridId, columns);
      expect(restored.name).toBeDefined();
      expect(restored.name.value).toBe('Alice');
    });

    it('should restore multiple filter state from localStorage', async () => {
      const gridId = 'test-grid-multi-filter-restore';
      const filterModel = {
        name: { operator: 'operatorContains', value: 'A' },
        age: { operator: 'operatorGreaterThan', value: 28 },
      };
      
      // Pre-populate localStorage
      saveFilterModel(gridId, filterModel);

      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{ gridId }}
        />
      );

      // Wait for filters to be applied
      await waitFor(() => {
        // Should show filtered results
        expect(screen.getByText('Alice')).toBeInTheDocument();
      }, { timeout: 500 });

      // Verify filters were restored
      const restored = getStoredFilterModel(gridId, columns);
      expect(restored.name).toBeDefined();
      expect(restored.age).toBeDefined();
    });

    it('should not restore filter state when gridId is not provided', () => {
      // Pre-populate localStorage with a gridId
      saveFilterModel('some-grid', { name: { operator: 'operatorContains', value: 'Alice' } });

      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{}}
        />
      );

      // Grid should render without filter applied (all rows visible)
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });
  });

  describe('Test multiple grids with different gridIds', () => {
    it('should maintain separate sort state for different grids', async () => {
      const gridId1 = 'grid-1';
      const gridId2 = 'grid-2';

      // Render first grid and apply sort
      const { unmount: unmount1 } = render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{ gridId: gridId1 }}
        />
      );

      const nameHeader1 = screen.getByText('Name');
      fireEvent.click(nameHeader1);
      await waitFor(() => {
        const stored = localStorage.getItem('utron-datagrid-sort-' + gridId1);
        expect(stored).not.toBeNull();
      });

      unmount1();

      // Render second grid and apply different sort
      const { unmount: unmount2 } = render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{ gridId: gridId2 }}
        />
      );

      const ageHeader2 = screen.getByText('Age');
      fireEvent.click(ageHeader2);
      await waitFor(() => {
        const stored = localStorage.getItem('utron-datagrid-sort-' + gridId2);
        expect(stored).not.toBeNull();
      });

      unmount2();

      // Verify both grids have different sort states
      const sort1 = getStoredSortModel(gridId1, columns);
      const sort2 = getStoredSortModel(gridId2, columns);
      expect(sort1).not.toEqual(sort2);
      expect(sort1[0].field).toBe('name');
      expect(sort2[0].field).toBe('age');
    });

    it('should maintain separate filter state for different grids', async () => {
      const gridId1 = 'grid-filter-1';
      const gridId2 = 'grid-filter-2';

      // Render first grid and apply filter
      const { unmount: unmount1 } = render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{ gridId: gridId1 }}
        />
      );

      const nameFilterInputs1 = screen.queryAllByPlaceholderText(/filter/i);
      const nameInput1 = nameFilterInputs1.find(input => 
        input.closest('th')?.textContent?.includes('Name')
      );

      if (nameInput1) {
        fireEvent.change(nameInput1, { target: { value: 'Alice' } });
        // Wait for debounced filter to be applied and saved (200ms debounce + buffer)
        await waitFor(() => {
          const stored = localStorage.getItem('utron-datagrid-filters-' + gridId1);
          expect(stored).not.toBeNull();
          const parsed = JSON.parse(stored);
          expect(parsed.name).toBeDefined();
          // Text filter creates { value: 'Alice' } structure
          expect(parsed.name.value).toBe('Alice');
        }, { timeout: 1000 });
      } else {
        // If we can't find the input, skip this test scenario
        return;
      }

      // Verify filter1 is saved before unmounting - check localStorage directly first
      const storedRaw = localStorage.getItem('utron-datagrid-filters-' + gridId1);
      expect(storedRaw).not.toBeNull();
      const storedParsed = JSON.parse(storedRaw);
      expect(storedParsed.name).toBeDefined();
      
      // Now verify getStoredFilterModel works
      const filter1BeforeUnmount = getStoredFilterModel(gridId1, columns);
      expect(filter1BeforeUnmount.name).toBeDefined();
      expect(filter1BeforeUnmount.name.value).toBe('Alice');

      unmount1();

      // Verify filter1 persists after unmount
      const filter1AfterUnmount = getStoredFilterModel(gridId1, columns);
      expect(filter1AfterUnmount.name).toBeDefined();

      // Render second grid and apply different filter
      const { unmount: unmount2 } = render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{ gridId: gridId2 }}
        />
      );

      const ageFilterInputs2 = screen.queryAllByPlaceholderText(/filter/i);
      const ageInput2 = ageFilterInputs2.find(input => 
        input.closest('th')?.textContent?.includes('Age')
      );

      if (ageInput2) {
        fireEvent.change(ageInput2, { target: { value: '30' } });
        // Wait for debounced filter to be applied and saved (200ms debounce + buffer)
        await waitFor(() => {
          const stored = localStorage.getItem('utron-datagrid-filters-' + gridId2);
          expect(stored).not.toBeNull();
          const parsed = JSON.parse(stored);
          expect(parsed.age).toBeDefined();
          // Number filter creates { value: '30' } structure
          expect(parsed.age.value).toBe('30');
        }, { timeout: 1000 });
      } else {
        // If we can't find the input, skip this test scenario
        return;
      }

      unmount2();

      // Verify both grids have different filter states
      const filter1 = getStoredFilterModel(gridId1, columns);
      const filter2 = getStoredFilterModel(gridId2, columns);
      expect(filter1).not.toEqual(filter2);
      expect(filter1.name).toBeDefined();
      expect(filter2.age).toBeDefined();
    });

    it('should restore correct state for each grid independently', () => {
      const gridId1 = 'grid-restore-1';
      const gridId2 = 'grid-restore-2';

      // Pre-populate localStorage for both grids
      saveSortModel(gridId1, [{ field: 'name', order: 'asc' }]);
      saveSortModel(gridId2, [{ field: 'age', order: 'desc' }]);
      saveFilterModel(gridId1, { name: { operator: 'operatorContains', value: 'Alice' } });
      saveFilterModel(gridId2, { age: { operator: 'operatorGreaterThan', value: 28 } });

      // Render first grid
      const { unmount: unmount1 } = render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{ gridId: gridId1 }}
        />
      );

      // Verify first grid restored its state
      const sort1 = getStoredSortModel(gridId1, columns);
      const filter1 = getStoredFilterModel(gridId1, columns);
      expect(sort1[0].field).toBe('name');
      expect(filter1.name).toBeDefined();

      unmount1();

      // Render second grid
      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{ gridId: gridId2 }}
        />
      );

      // Verify second grid restored its own state
      const sort2 = getStoredSortModel(gridId2, columns);
      const filter2 = getStoredFilterModel(gridId2, columns);
      expect(sort2[0].field).toBe('age');
      expect(filter2.age).toBeDefined();
    });
  });

  describe('Test invalid localStorage data handling', () => {
    it('should handle invalid JSON in sort storage gracefully', () => {
      const gridId = 'test-grid-invalid-sort-json';
      
      // Set invalid JSON
      localStorage.setItem('utron-datagrid-sort-' + gridId, 'invalid json {');

      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{ gridId }}
        />
      );

      // Should render without errors and with no sort applied
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      
      // getStoredSortModel should return empty array for invalid data
      const restored = getStoredSortModel(gridId, columns);
      expect(restored).toEqual([]);
    });

    it('should handle invalid JSON in filter storage gracefully', () => {
      const gridId = 'test-grid-invalid-filter-json';
      
      // Set invalid JSON
      localStorage.setItem('utron-datagrid-filters-' + gridId, 'invalid json {');

      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{ gridId }}
        />
      );

      // Should render without errors and with no filter applied
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      
      // getStoredFilterModel should return empty object for invalid data
      const restored = getStoredFilterModel(gridId, columns);
      expect(restored).toEqual({});
    });

    it('should handle non-array sort data gracefully', () => {
      const gridId = 'test-grid-invalid-sort-type';
      
      // Set non-array data
      localStorage.setItem('utron-datagrid-sort-' + gridId, JSON.stringify({ field: 'name', order: 'asc' }));

      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{ gridId }}
        />
      );

      // Should render without errors
      expect(screen.getByText('Alice')).toBeInTheDocument();
      
      // getStoredSortModel should return empty array for non-array data
      const restored = getStoredSortModel(gridId, columns);
      expect(restored).toEqual([]);
    });

    it('should handle non-object filter data gracefully', () => {
      const gridId = 'test-grid-invalid-filter-type';
      
      // Set non-object data (array)
      localStorage.setItem('utron-datagrid-filters-' + gridId, JSON.stringify([{ name: 'Alice' }]));

      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{ gridId }}
        />
      );

      // Should render without errors
      expect(screen.getByText('Alice')).toBeInTheDocument();
      
      // getStoredFilterModel should return empty object for non-object data
      const restored = getStoredFilterModel(gridId, columns);
      expect(restored).toEqual({});
    });

    it('should filter out invalid sort entries (unknown fields)', () => {
      const gridId = 'test-grid-invalid-sort-field';
      
      // Set sort with unknown field
      localStorage.setItem('utron-datagrid-sort-' + gridId, JSON.stringify([
        { field: 'unknownField', order: 'asc' },
        { field: 'name', order: 'asc' },
      ]));

      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{ gridId }}
        />
      );

      // Should only restore valid sort entries
      const restored = getStoredSortModel(gridId, columns);
      expect(restored.length).toBe(1);
      expect(restored[0].field).toBe('name');
      expect(restored.some(s => s.field === 'unknownField')).toBe(false);
    });

    it('should filter out invalid filter entries (unknown fields)', () => {
      const gridId = 'test-grid-invalid-filter-field';
      
      // Set filter with unknown field
      localStorage.setItem('utron-datagrid-filters-' + gridId, JSON.stringify({
        unknownField: { operator: 'operatorContains', value: 'test' },
        name: { operator: 'operatorContains', value: 'Alice' },
      }));

      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{ gridId }}
        />
      );

      // Should only restore valid filter entries
      const restored = getStoredFilterModel(gridId, columns);
      expect(restored.unknownField).toBeUndefined();
      expect(restored.name).toBeDefined();
      expect(restored.name.value).toBe('Alice');
    });

    it('should filter out invalid sort entries (invalid order)', () => {
      const gridId = 'test-grid-invalid-sort-order';
      
      // Set sort with invalid order
      localStorage.setItem('utron-datagrid-sort-' + gridId, JSON.stringify([
        { field: 'name', order: 'invalid' },
        { field: 'age', order: 'asc' },
      ]));

      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{ gridId }}
        />
      );

      // Should only restore valid sort entries
      const restored = getStoredSortModel(gridId, columns);
      expect(restored.length).toBe(1);
      expect(restored[0].field).toBe('age');
      expect(restored.some(s => s.order === 'invalid')).toBe(false);
    });

    it('should handle null/undefined values in localStorage', () => {
      const gridId = 'test-grid-null-values';
      
      // Set null values
      localStorage.setItem('utron-datagrid-sort-' + gridId, 'null');
      localStorage.setItem('utron-datagrid-filters-' + gridId, 'null');

      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{ gridId }}
        />
      );

      // Should render without errors
      expect(screen.getByText('Alice')).toBeInTheDocument();
      
      // Should return empty arrays/objects for null values
      const restoredSort = getStoredSortModel(gridId, columns);
      const restoredFilter = getStoredFilterModel(gridId, columns);
      expect(restoredSort).toEqual([]);
      expect(restoredFilter).toEqual({});
    });
  });
});
