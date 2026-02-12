import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DataGrid } from '../../src/DataGrid/DataGrid';

describe('Data Immutability Regression Tests', () => {
  const columns = [
    { field: 'id', headerName: 'ID', type: 'number' },
    { field: 'name', headerName: 'Name', type: 'text', filter: 'text', editable: true },
    { field: 'age', headerName: 'Age', type: 'number', filter: 'number', editable: true },
    { field: 'score', headerName: 'Score', type: 'number', filter: 'number' },
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

  describe('Test rows array not mutated by sort', () => {
    it('should not mutate original rows array when sorting', async () => {
      const originalRows = [
        { id: 1, name: 'Alice', age: 30, score: 85 },
        { id: 2, name: 'Bob', age: 25, score: 90 },
        { id: 3, name: 'Charlie', age: 35, score: 75 },
        { id: 4, name: 'David', age: 28, score: 95 },
      ];

      // Create deep copies to verify immutability
      const rowsCopy = JSON.parse(JSON.stringify(originalRows));
      const firstRowCopy = JSON.parse(JSON.stringify(originalRows[0]));
      const secondRowCopy = JSON.parse(JSON.stringify(originalRows[1]));

      render(
        <DataGrid
          rows={originalRows}
          columns={columns}
          getRowId={getRowId}
          options={{
            pagination: false,
          }}
        />
      );

      // Verify initial state
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();

      // Sort by age (ascending)
      const ageHeader = screen.getByText('Age');
      fireEvent.click(ageHeader);

      // Wait for sort to apply
      await waitFor(() => {
        const displayedNames = screen.getAllByText(/Alice|Bob|Charlie|David/);
        expect(displayedNames.length).toBe(4);
      });

      // Verify original array reference is unchanged
      expect(originalRows).toBe(originalRows);
      
      // Verify original array content is unchanged
      expect(originalRows).toEqual(rowsCopy);
      expect(originalRows[0]).toEqual(firstRowCopy);
      expect(originalRows[1]).toEqual(secondRowCopy);
      
      // Verify original row objects are unchanged
      expect(originalRows[0].id).toBe(1);
      expect(originalRows[0].name).toBe('Alice');
      expect(originalRows[0].age).toBe(30);
      expect(originalRows[1].id).toBe(2);
      expect(originalRows[1].name).toBe('Bob');
      expect(originalRows[1].age).toBe(25);

      // Sort by age again (descending)
      fireEvent.click(ageHeader);
      await waitFor(() => {
        const displayedNames = screen.getAllByText(/Alice|Bob|Charlie|David/);
        expect(displayedNames.length).toBe(4);
      });

      // Verify original array is still unchanged
      expect(originalRows).toEqual(rowsCopy);
      expect(originalRows[0]).toEqual(firstRowCopy);
      expect(originalRows[1]).toEqual(secondRowCopy);
    });
  });

  describe('Test rows array not mutated by filter', () => {
    it('should not mutate original rows array when filtering', async () => {
      const originalRows = [
        { id: 1, name: 'Alice', age: 30, score: 85 },
        { id: 2, name: 'Bob', age: 25, score: 90 },
        { id: 3, name: 'Charlie', age: 35, score: 75 },
        { id: 4, name: 'David', age: 28, score: 95 },
      ];

      // Create deep copies to verify immutability
      const rowsCopy = JSON.parse(JSON.stringify(originalRows));
      const firstRowCopy = JSON.parse(JSON.stringify(originalRows[0]));
      const secondRowCopy = JSON.parse(JSON.stringify(originalRows[1]));

      render(
        <DataGrid
          rows={originalRows}
          columns={columns}
          getRowId={getRowId}
          options={{
            pagination: false,
          }}
        />
      );

      // Verify initial state
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();

      // Find and apply filter for age = 30
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

      // Verify original array reference is unchanged
      expect(originalRows).toBe(originalRows);
      
      // Verify original array content is unchanged
      expect(originalRows).toEqual(rowsCopy);
      expect(originalRows[0]).toEqual(firstRowCopy);
      expect(originalRows[1]).toEqual(secondRowCopy);
      
      // Verify original row objects are unchanged
      expect(originalRows[0].id).toBe(1);
      expect(originalRows[0].name).toBe('Alice');
      expect(originalRows[0].age).toBe(30);
      expect(originalRows[1].id).toBe(2);
      expect(originalRows[1].name).toBe('Bob');
      expect(originalRows[1].age).toBe(25);

      // Clear filter
      fireEvent.change(ageInput, { target: { value: '' } });
      await waitFor(() => {
        expect(screen.getByText('Bob')).toBeInTheDocument();
      }, { timeout: 3000 });

      // Verify original array is still unchanged after clearing filter
      expect(originalRows).toEqual(rowsCopy);
      expect(originalRows[0]).toEqual(firstRowCopy);
      expect(originalRows[1]).toEqual(secondRowCopy);
    });
  });

  describe('Test rows array not mutated by pagination', () => {
    it('should not mutate original rows array when paginating', async () => {
      const originalRows = [
        { id: 1, name: 'Alice', age: 30, score: 85 },
        { id: 2, name: 'Bob', age: 25, score: 90 },
        { id: 3, name: 'Charlie', age: 35, score: 75 },
        { id: 4, name: 'David', age: 28, score: 95 },
        { id: 5, name: 'Eve', age: 32, score: 80 },
        { id: 6, name: 'Frank', age: 27, score: 88 },
      ];

      // Create deep copies to verify immutability
      const rowsCopy = JSON.parse(JSON.stringify(originalRows));
      const firstRowCopy = JSON.parse(JSON.stringify(originalRows[0]));
      const lastRowCopy = JSON.parse(JSON.stringify(originalRows[5]));

      render(
        <DataGrid
          rows={originalRows}
          columns={columns}
          getRowId={getRowId}
          options={{
            pagination: true,
            pageSize: 3,
          }}
        />
      );

      // Verify initial state (first page)
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('Charlie')).toBeInTheDocument();
      expect(screen.queryByText('David')).not.toBeInTheDocument();

      // Navigate to next page
      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);

      // Wait for pagination to apply
      await waitFor(() => {
        expect(screen.queryByText('Alice')).not.toBeInTheDocument();
        expect(screen.getByText('David')).toBeInTheDocument();
        expect(screen.getByText('Eve')).toBeInTheDocument();
        expect(screen.getByText('Frank')).toBeInTheDocument();
      });

      // Verify original array reference is unchanged
      expect(originalRows).toBe(originalRows);
      
      // Verify original array content is unchanged
      expect(originalRows).toEqual(rowsCopy);
      expect(originalRows[0]).toEqual(firstRowCopy);
      expect(originalRows[5]).toEqual(lastRowCopy);
      
      // Verify original row objects are unchanged
      expect(originalRows[0].id).toBe(1);
      expect(originalRows[0].name).toBe('Alice');
      expect(originalRows[5].id).toBe(6);
      expect(originalRows[5].name).toBe('Frank');

      // Navigate back to first page
      const prevButton = screen.getByRole('button', { name: /previous/i });
      fireEvent.click(prevButton);

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument();
      });

      // Verify original array is still unchanged
      expect(originalRows).toEqual(rowsCopy);
      expect(originalRows[0]).toEqual(firstRowCopy);
      expect(originalRows[5]).toEqual(lastRowCopy);
    });
  });

  describe('Test edit values don\'t mutate original row', () => {
    it('should not mutate original row object when editing', async () => {
      const originalRows = [
        { id: 1, name: 'Alice', age: 30, score: 85 },
        { id: 2, name: 'Bob', age: 25, score: 90 },
        { id: 3, name: 'Charlie', age: 35, score: 75 },
      ];

      // Create deep copies to verify immutability
      const rowsCopy = JSON.parse(JSON.stringify(originalRows));
      const aliceRowCopy = JSON.parse(JSON.stringify(originalRows[0]));

      const onEditCommit = vi.fn();

      render(
        <DataGrid
          rows={originalRows}
          columns={columns}
          getRowId={getRowId}
          options={{
            editable: true,
            onEditCommit,
            pagination: false,
          }}
        />
      );

      // Verify initial state
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('30')).toBeInTheDocument();

      // Start editing Alice's row
      const aliceRow = screen.getByText('Alice').closest('[data-row-id]');
      fireEvent.doubleClick(aliceRow);

      // Wait for edit mode to activate
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      });

      // Verify original row is unchanged after starting edit
      expect(originalRows[0]).toEqual(aliceRowCopy);
      expect(originalRows[0].name).toBe('Alice');
      expect(originalRows[0].age).toBe(30);

      // Change the name field
      const nameInput = screen.getByDisplayValue('Alice');
      fireEvent.change(nameInput, { target: { value: 'Alice Updated' } });

      // Wait for input to update
      await waitFor(() => {
        expect(screen.getByDisplayValue('Alice Updated')).toBeInTheDocument();
      });

      // Verify original row is still unchanged after editing
      expect(originalRows[0]).toEqual(aliceRowCopy);
      expect(originalRows[0].name).toBe('Alice');
      expect(originalRows[0].age).toBe(30);
      expect(originalRows).toEqual(rowsCopy);

      // Change the age field - number inputs can be found by display value
      const ageInput = screen.getByDisplayValue('30');
      fireEvent.change(ageInput, { target: { value: '31' } });

      await waitFor(() => {
        expect(screen.getByDisplayValue('31')).toBeInTheDocument();
      });

      // Verify original row is still unchanged
      expect(originalRows[0]).toEqual(aliceRowCopy);
      expect(originalRows[0].name).toBe('Alice');
      expect(originalRows[0].age).toBe(30);
      expect(originalRows).toEqual(rowsCopy);

      // Cancel edit
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument();
      });

      // Verify original row is still unchanged after canceling
      expect(originalRows[0]).toEqual(aliceRowCopy);
      expect(originalRows[0].name).toBe('Alice');
      expect(originalRows[0].age).toBe(30);
      expect(originalRows).toEqual(rowsCopy);
    });

    it('should not mutate original row object when saving edit', async () => {
      const originalRows = [
        { id: 1, name: 'Alice', age: 30, score: 85 },
        { id: 2, name: 'Bob', age: 25, score: 90 },
      ];

      // Create deep copies to verify immutability
      const rowsCopy = JSON.parse(JSON.stringify(originalRows));
      const aliceRowCopy = JSON.parse(JSON.stringify(originalRows[0]));

      const onEditCommit = vi.fn((rowId, editValues) => {
        // Simulate parent updating rows - but we're testing that the original
        // rows array passed to DataGrid is not mutated
      });

      render(
        <DataGrid
          rows={originalRows}
          columns={columns}
          getRowId={getRowId}
          options={{
            editable: true,
            onEditCommit,
            pagination: false,
          }}
        />
      );

      // Start editing Alice's row
      const aliceRow = screen.getByText('Alice').closest('[data-row-id]');
      fireEvent.doubleClick(aliceRow);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      });

      // Change the name field
      const nameInput = screen.getByDisplayValue('Alice');
      fireEvent.change(nameInput, { target: { value: 'Alice Updated' } });

      await waitFor(() => {
        expect(screen.getByDisplayValue('Alice Updated')).toBeInTheDocument();
      });

      // Save the edit
      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(onEditCommit).toHaveBeenCalled();
      });

      // Verify original row is still unchanged after saving
      // The onEditCommit callback receives the new values, but the original
      // rows array should remain unchanged
      expect(originalRows[0]).toEqual(aliceRowCopy);
      expect(originalRows[0].name).toBe('Alice');
      expect(originalRows[0].age).toBe(30);
      expect(originalRows).toEqual(rowsCopy);

      // Verify onEditCommit was called with the correct values
      expect(onEditCommit).toHaveBeenCalledWith(1, expect.objectContaining({
        id: 1,
        name: 'Alice Updated',
        age: 30,
        score: 85,
      }));
    });
  });
});
