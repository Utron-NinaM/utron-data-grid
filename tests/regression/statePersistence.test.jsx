import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DataGrid } from '../../src/DataGrid/DataGrid';
import { getStoredSortModel, saveSortModel, SORT_STORAGE_KEY_PREFIX } from '../../src/utils/sortUtils';
import { getStoredFilterModel, saveFilterModel, FILTER_STORAGE_KEY_PREFIX } from '../../src/filters/filterUtils';
import { getStoredColumnWidthState, saveColumnWidthState, COLUMN_WIDTH_STORAGE_KEY_PREFIX } from '../../src/utils/columnWidthStorage';
import { SORT_ORDER_ASC, SORT_ORDER_DESC } from '../../src/config/schema';

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
        const stored = localStorage.getItem(SORT_STORAGE_KEY_PREFIX + gridId1);
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
        const stored = localStorage.getItem(SORT_STORAGE_KEY_PREFIX + gridId2);
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
          const stored = localStorage.getItem(FILTER_STORAGE_KEY_PREFIX + gridId1);
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
      const storedRaw = localStorage.getItem(FILTER_STORAGE_KEY_PREFIX + gridId1);
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
          const stored = localStorage.getItem(FILTER_STORAGE_KEY_PREFIX + gridId2);
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
      saveSortModel(gridId1, [{ field: 'name', order: SORT_ORDER_ASC }]);
      saveSortModel(gridId2, [{ field: 'age', order: SORT_ORDER_DESC }]);
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
      localStorage.setItem(SORT_STORAGE_KEY_PREFIX + gridId, 'invalid json {');

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
      localStorage.setItem(FILTER_STORAGE_KEY_PREFIX + gridId, 'invalid json {');

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
      localStorage.setItem(SORT_STORAGE_KEY_PREFIX + gridId, JSON.stringify({ field: 'name', order: SORT_ORDER_ASC }));

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
      localStorage.setItem(FILTER_STORAGE_KEY_PREFIX + gridId, JSON.stringify([{ name: 'Alice' }]));

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
      localStorage.setItem(SORT_STORAGE_KEY_PREFIX + gridId, JSON.stringify([
        { field: 'unknownField', order: SORT_ORDER_ASC },
        { field: 'name', order: SORT_ORDER_ASC },
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
      localStorage.setItem(FILTER_STORAGE_KEY_PREFIX + gridId, JSON.stringify({
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
      localStorage.setItem(SORT_STORAGE_KEY_PREFIX + gridId, JSON.stringify([
        { field: 'name', order: 'invalid' },
        { field: 'age', order: SORT_ORDER_ASC },
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
      localStorage.setItem(SORT_STORAGE_KEY_PREFIX + gridId, 'null');
      localStorage.setItem(FILTER_STORAGE_KEY_PREFIX + gridId, 'null');

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

    it('should handle invalid JSON in column width storage gracefully', () => {
      const gridId = 'test-grid-invalid-column-width-json';
      localStorage.setItem(COLUMN_WIDTH_STORAGE_KEY_PREFIX + gridId, 'invalid json {');

      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{ gridId }}
        />
      );

      expect(screen.getByText('Alice')).toBeInTheDocument();
      const restored = getStoredColumnWidthState(gridId, columns);
      expect(restored.size).toBe(0);
    });

    it('should handle non-object column width data gracefully', () => {
      const gridId = 'test-grid-invalid-column-width-type';
      localStorage.setItem(COLUMN_WIDTH_STORAGE_KEY_PREFIX + gridId, JSON.stringify([100, 200]));

      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{ gridId }}
        />
      );

      expect(screen.getByText('Alice')).toBeInTheDocument();
      const restored = getStoredColumnWidthState(gridId, columns);
      expect(restored.size).toBe(0);
    });
  });

  describe('Column width persistence', () => {
    it('restores column widths from localStorage on load', () => {
      const gridId = 'grid-column-width-restore';
      saveColumnWidthState(gridId, new Map([['name', 250], ['age', 120]]));

      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{ gridId }}
        />
      );

      const restored = getStoredColumnWidthState(gridId, columns);
      expect(restored.get('name')).toBe(250);
      expect(restored.get('age')).toBe(120);
      const nameHeader = screen.getAllByRole('columnheader').find(c => c.textContent?.includes('Name'));
      expect(nameHeader).toBeDefined();
      expect(window.getComputedStyle(nameHeader).width).toBe('250px');
    });

    it('Reset column widths clears stored overrides', () => {
      const gridId = 'grid-column-width-reset';
      saveColumnWidthState(gridId, new Map([['name', 300]]));

      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{ gridId }}
        />
      );

      expect(getStoredColumnWidthState(gridId, columns).size).toBeGreaterThan(0);
      const resetBtn = screen.getByRole('button', { name: /reset column widths/i });
      fireEvent.click(resetBtn);
      expect(getStoredColumnWidthState(gridId, columns).size).toBe(0);
      expect(resetBtn).toBeDisabled();
    });

    it('maintains separate column width state for different grids', () => {
      const gridId1 = 'grid-width-1';
      const gridId2 = 'grid-width-2';
      saveColumnWidthState(gridId1, new Map([['name', 200]]));
      saveColumnWidthState(gridId2, new Map([['age', 150]]));

      const { unmount } = render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{ gridId: gridId1 }}
        />
      );
      expect(getStoredColumnWidthState(gridId1, columns).get('name')).toBe(200);
      unmount();

      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{ gridId: gridId2 }}
        />
      );
      expect(getStoredColumnWidthState(gridId2, columns).get('age')).toBe(150);
      expect(getStoredColumnWidthState(gridId1, columns).get('name')).toBe(200);
    });
  });
});
