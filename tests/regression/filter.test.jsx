import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DataGrid } from '../../src/DataGrid/DataGrid';
import { getStoredFilterModel, saveFilterModel, FILTER_DEBOUNCE_MS } from '../../src/filters/filterUtils';
import { OPERATOR_IN_RANGE, OPERATOR_EQUALS, OPERATOR_GREATER_THAN } from '../../src/config/schema';

describe('Filter Regression Tests', () => {
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

  // Helper function to find filter input in a specific column
  const findFilterInput = async (columnName, inputType = 'any') => {
    const header = screen.getByText(columnName);
    const headerRow = header.closest('tr');
    const headerCells = Array.from(headerRow?.querySelectorAll('th') || []);
    const columnIndex = headerCells.findIndex(cell => cell.textContent?.includes(columnName));
    
    expect(columnIndex).toBeGreaterThanOrEqual(0);
    
    let input;
    await waitFor(() => {
      const allInputs = [];
      if (inputType === 'any' || inputType === 'spinbutton') {
        allInputs.push(...screen.queryAllByRole('spinbutton'));
      }
      if (inputType === 'any' || inputType === 'textbox') {
        allInputs.push(...screen.queryAllByRole('textbox'));
      }
      
      input = allInputs.find(input => {
        const cell = input.closest('th');
        if (!cell) return false;
        const row = cell.closest('tr');
        if (!row) return false;
        const cells = Array.from(row.querySelectorAll('th'));
        const inputColumnIndex = cells.indexOf(cell);
        return inputColumnIndex === columnIndex;
      });
      
      expect(input).toBeDefined();
    }, { timeout: 3000 });
    
    return input;
  };

  // Helper function to find operator dropdown button
  const findOperatorButton = async (columnName) => {
    const header = screen.getByText(columnName);
    const headerRow = header.closest('tr');
    const headerCells = Array.from(headerRow?.querySelectorAll('th') || []);
    const columnIndex = headerCells.findIndex(cell => cell.textContent?.includes(columnName));
    
    expect(columnIndex).toBeGreaterThanOrEqual(0);
    
    let button;
    await waitFor(() => {
      const allButtons = screen.queryAllByRole('button');
      button = allButtons.find(btn => {
        const cell = btn.closest('th');
        if (!cell) return false;
        const row = cell.closest('tr');
        if (!row) return false;
        const cells = Array.from(row.querySelectorAll('th'));
        const btnColumnIndex = cells.indexOf(cell);
        return btnColumnIndex === columnIndex && btn.getAttribute('aria-label') === 'Operator';
      });
      
      expect(button).toBeDefined();
    }, { timeout: 3000 });
    
    return button;
  };

  describe('Test operator change updates filter', () => {
    it('should update filter when operator changes from equals to greater than', async () => {
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

      // Find age filter input and set initial value with equals operator
      const ageInput = await findFilterInput('Age', 'spinbutton');
      fireEvent.change(ageInput, { target: { value: '30' } });

      // Wait for initial filter to apply
      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.queryByText('Bob')).not.toBeInTheDocument();
      }, { timeout: 3000 });

      // Find operator dropdown button
      const operatorButton = await findOperatorButton('Age');
      fireEvent.click(operatorButton);

      // Wait for menu to open and select "Greater Than"
      await waitFor(() => {
        const menuItems = screen.getAllByRole('menuitem');
        const greaterThanItem = menuItems.find(item => 
          item.textContent?.includes('Greater Than')
        );
        if (greaterThanItem) {
          fireEvent.click(greaterThanItem);
        } else {
          // Fallback: try clicking by index (Greater Than is typically 5th in NUMBER_OP_IDS)
          if (menuItems.length > 4) {
            fireEvent.click(menuItems[4]);
          }
        }
      }, { timeout: 1000 });

      // Wait for filter to update with new operator
      await waitFor(() => {
        // With age > 30, should show Charlie (35), Eve (32), but not Alice (30), Bob (25), or David (28)
        expect(screen.getByText('Charlie')).toBeInTheDocument();
        expect(screen.getByText('Eve')).toBeInTheDocument();
        expect(screen.queryByText('Alice')).not.toBeInTheDocument();
        expect(screen.queryByText('Bob')).not.toBeInTheDocument();
        expect(screen.queryByText('David')).not.toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should update filter when operator changes from greater than to in range', async () => {
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

      // Set initial filter with greater than operator
      const ageInput = await findFilterInput('Age', 'spinbutton');
      fireEvent.change(ageInput, { target: { value: '28' } });

      // Change operator to greater than
      const operatorButton = await findOperatorButton('Age');
      fireEvent.click(operatorButton);

      await waitFor(() => {
        const menuItems = screen.getAllByRole('menuitem');
        const greaterThanItem = menuItems.find(item => 
          item.textContent?.includes('Greater Than')
        );
        if (greaterThanItem) {
          fireEvent.click(greaterThanItem);
        } else if (menuItems.length > 4) {
          fireEvent.click(menuItems[4]);
        }
      }, { timeout: 1000 });

      // Wait for filter to apply
      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Charlie')).toBeInTheDocument();
        expect(screen.getByText('Eve')).toBeInTheDocument();
      }, { timeout: 3000 });

      // Change operator to in range
      fireEvent.click(operatorButton);
      await waitFor(() => {
        const menuItems = screen.getAllByRole('menuitem');
        const inRangeItem = menuItems.find(item => 
          item.textContent?.includes('In Range')
        );
        if (inRangeItem) {
          fireEvent.click(inRangeItem);
        } else if (menuItems.length > 9) {
          // In Range is typically 10th in NUMBER_OP_IDS
          fireEvent.click(menuItems[9]);
        }
      }, { timeout: 1000 });

      // Wait for "to" input to appear and filter to update
      await waitFor(() => {
        const toInput = screen.queryByPlaceholderText('To');
        expect(toInput).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Test range "to" input appears/disappears', () => {
    it('should show "to" input when operator is set to in range', async () => {
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

      // Find operator dropdown for age column
      const operatorButton = await findOperatorButton('Age');
      fireEvent.click(operatorButton);

      // Select "In Range" operator
      await waitFor(() => {
        const menuItems = screen.getAllByRole('menuitem');
        const inRangeItem = menuItems.find(item => 
          item.textContent?.includes('In Range')
        );
        if (inRangeItem) {
          fireEvent.click(inRangeItem);
        } else if (menuItems.length > 9) {
          fireEvent.click(menuItems[9]);
        }
      }, { timeout: 1000 });

      // Wait for "to" input to appear - it should have placeholder "To"
      await waitFor(() => {
        const toInput = screen.queryByPlaceholderText('To');
        expect(toInput).toBeInTheDocument();
        expect(toInput).toHaveAttribute('type', 'number');
      }, { timeout: 3000 });
    });

    it('should hide "to" input when operator changes from in range to equals', async () => {
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

      // Set operator to in range
      const operatorButton = await findOperatorButton('Age');
      fireEvent.click(operatorButton);

      await waitFor(() => {
        const menuItems = screen.getAllByRole('menuitem');
        const inRangeItem = menuItems.find(item => 
          item.textContent?.includes('In Range') || item.textContent?.includes('Range')
        );
        if (inRangeItem) {
          fireEvent.click(inRangeItem);
        }
      }, { timeout: 1000 });

      // Verify "to" input appears
      await waitFor(() => {
        const toInput = screen.queryByPlaceholderText('To');
        expect(toInput).toBeInTheDocument();
      }, { timeout: 3000 });

      // Change operator back to equals
      fireEvent.click(operatorButton);
      await waitFor(() => {
        const menuItems = screen.getAllByRole('menuitem');
        const equalsItem = menuItems.find(item => 
          item.textContent?.includes('Equals')
        );
        if (equalsItem) {
          fireEvent.click(equalsItem);
        } else if (menuItems.length > 0) {
          // Equals is typically first in NUMBER_OP_IDS
          fireEvent.click(menuItems[0]);
        }
      }, { timeout: 1000 });

      // Wait for "to" input to disappear
      await waitFor(() => {
        const toInput = screen.queryByPlaceholderText('To');
        expect(toInput).not.toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Test clear all filters', () => {
    it('should clear all active filters when clear all filters button is clicked', async () => {
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

      // Apply filter to name column
      const nameInput = await findFilterInput('Name', 'textbox');
      fireEvent.change(nameInput, { target: { value: 'Alice' } });

      // Apply filter to age column
      const ageInput = await findFilterInput('Age', 'spinbutton');
      fireEvent.change(ageInput, { target: { value: '30' } });

      // Wait for filters to apply
      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.queryByText('Bob')).not.toBeInTheDocument();
      }, { timeout: 3000 });

      // Find and click "Clear all filters" button
      const clearAllButton = screen.getByRole('button', { name: /clear all filters/i });
      expect(clearAllButton).toBeInTheDocument();
      fireEvent.click(clearAllButton);

      // Wait for all filters to be cleared
      await waitFor(() => {
        // All rows should be visible again
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
        expect(screen.getByText('Charlie')).toBeInTheDocument();
        expect(screen.getByText('David')).toBeInTheDocument();
        expect(screen.getByText('Eve')).toBeInTheDocument();
      }, { timeout: 3000 });

      // Verify filter inputs are cleared
      const nameInputAfter = await findFilterInput('Name', 'textbox');
      const ageInputAfter = await findFilterInput('Age', 'spinbutton');
      expect(nameInputAfter.value).toBe('');
      expect(ageInputAfter.value).toBe('');
    });

    it('should disable clear all filters button when no filters are active', async () => {
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

      // Initially, clear all filters button should be disabled
      const clearAllButton = screen.getByRole('button', { name: /clear all filters/i });
      expect(clearAllButton).toBeDisabled();

      // Apply a filter
      const nameInput = await findFilterInput('Name', 'textbox');
      fireEvent.change(nameInput, { target: { value: 'Alice' } });

      // Wait for filter to apply and button to become enabled
      await waitFor(() => {
        expect(clearAllButton).not.toBeDisabled();
      }, { timeout: 3000 });

      // Clear the filter
      fireEvent.click(clearAllButton);

      // Button should be disabled again
      await waitFor(() => {
        expect(clearAllButton).toBeDisabled();
      }, { timeout: 3000 });
    });
  });

  describe('Test filter debouncing', () => {
    it('should debounce filter input changes', async () => {
      const onFilterChange = vi.fn();

      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            pagination: false,
            onFilterChange,
          }}
        />
      );

      const nameInput = await findFilterInput('Name', 'textbox');

      // Type multiple characters quickly
      fireEvent.change(nameInput, { target: { value: 'A' } });
      fireEvent.change(nameInput, { target: { value: 'Al' } });
      fireEvent.change(nameInput, { target: { value: 'Ali' } });
      fireEvent.change(nameInput, { target: { value: 'Alic' } });
      fireEvent.change(nameInput, { target: { value: 'Alice' } });

      // onFilterChange should be called for each change (not debounced at the callback level)
      // But the actual filtering should be debounced
      await waitFor(() => {
        expect(onFilterChange).toHaveBeenCalled();
      }, { timeout: 100 });

      // Wait for debounced filter to apply (FILTER_DEBOUNCE_MS = 200ms)
      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.queryByText('Bob')).not.toBeInTheDocument();
      }, { timeout: FILTER_DEBOUNCE_MS + 300 });
    });

    it('should apply filter after debounce delay', async () => {
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

      const nameInput = await findFilterInput('Name', 'textbox');
      
      // Filter should show all rows initially
      expect(screen.getByText('Bob')).toBeInTheDocument();
      
      // Change filter value
      fireEvent.change(nameInput, { target: { value: 'Alice' } });

      // Filter should still show Bob immediately (debounced)
      expect(screen.getByText('Bob')).toBeInTheDocument();

      // Wait for debounced filter to apply
      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.queryByText('Bob')).not.toBeInTheDocument();
      }, { timeout: FILTER_DEBOUNCE_MS + 500 });
    });
  });

  describe('Test filter persistence', () => {
    it('should save filter to localStorage when filter is applied', async () => {
      const gridId = 'test-filter-persistence';

      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            gridId,
            pagination: false,
          }}
        />
      );

      // Apply filter
      const nameInput = await findFilterInput('Name', 'textbox');
      fireEvent.change(nameInput, { target: { value: 'Alice' } });

      // Wait for filter to be applied and saved (debounce + save)
      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument();
      }, { timeout: FILTER_DEBOUNCE_MS + 500 });

      // Check that filter was saved
      await waitFor(() => {
        const stored = getStoredFilterModel(gridId, columns);
        expect(stored.name).toBeDefined();
        // Value might be stored as string or in an object
        const nameValue = stored.name.value;
        expect(String(nameValue)).toContain('Alice');
      }, { timeout: 1000 });
    });

    it('should restore filter from localStorage on mount', async () => {
      const gridId = 'test-filter-restore';

      // Pre-populate localStorage with filter
      const filterModel = {
        name: { operator: 'operatorContains', value: 'Alice' },
        age: { operator: 'operatorGreaterThan', value: 28 },
      };
      saveFilterModel(gridId, filterModel);

      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            gridId,
            pagination: false,
          }}
        />
      );

      // Wait for filters to be restored and applied
      await waitFor(() => {
        // Should show only Alice (matches both filters: name contains 'Alice' and age > 28)
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.queryByText('Bob')).not.toBeInTheDocument();
        expect(screen.queryByText('David')).not.toBeInTheDocument();
      }, { timeout: 1000 });

      // Verify filter inputs are populated
      await waitFor(() => {
        const nameInput = screen.getByDisplayValue('Alice');
        expect(nameInput).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('should persist multiple filters across unmount/remount', async () => {
      const gridId = 'test-filter-multi-persistence';

      const { unmount } = render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            gridId,
            pagination: false,
          }}
        />
      );

      // Apply multiple filters
      const nameInput = await findFilterInput('Name', 'textbox');
      fireEvent.change(nameInput, { target: { value: 'A' } });

      const ageInput = await findFilterInput('Age', 'spinbutton');
      fireEvent.change(ageInput, { target: { value: '30' } });

      // Wait for filters to be applied and saved
      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument();
      }, { timeout: FILTER_DEBOUNCE_MS + 500 });

      // Check filters are saved
      const stored = getStoredFilterModel(gridId, columns);
      expect(stored.name).toBeDefined();
      expect(stored.age).toBeDefined();

      // Unmount
      unmount();

      // Verify filters persist after unmount
      const storedAfterUnmount = getStoredFilterModel(gridId, columns);
      expect(storedAfterUnmount.name).toBeDefined();
      expect(storedAfterUnmount.age).toBeDefined();

      // Remount
      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            gridId,
            pagination: false,
          }}
        />
      );

      // Wait for filters to be restored
      await waitFor(() => {
        const nameInputRestored = screen.getByDisplayValue('A');
        const ageInputRestored = screen.getByDisplayValue('30');
        expect(nameInputRestored).toBeInTheDocument();
        expect(ageInputRestored).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('should clear persisted filters when clear all filters is clicked', async () => {
      const gridId = 'test-filter-clear-persistence';

      // Pre-populate localStorage
      const filterModel = {
        name: { operator: 'operatorContains', value: 'Alice' },
        age: { operator: 'operatorEquals', value: '30' },
      };
      saveFilterModel(gridId, filterModel);

      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            gridId,
            pagination: false,
          }}
        />
      );

      // Wait for filters to be restored
      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument();
      }, { timeout: 1000 });

      // Clear all filters
      const clearAllButton = screen.getByRole('button', { name: /clear all filters/i });
      fireEvent.click(clearAllButton);

      // Wait for filters to be cleared from display
      await waitFor(() => {
        expect(screen.getByText('Bob')).toBeInTheDocument();
      }, { timeout: 1000 });

      // Wait for filters to be cleared from localStorage
      await waitFor(() => {
        const stored = getStoredFilterModel(gridId, columns);
        expect(Object.keys(stored).length).toBe(0);
      }, { timeout: 1000 });
    });
  });
});
