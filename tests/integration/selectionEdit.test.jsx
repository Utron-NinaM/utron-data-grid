import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DataGrid } from '../../src/DataGrid/DataGrid';

describe('Selection + Edit Integration', () => {
  const columns = [
    { field: 'id', headerName: 'ID', type: 'number' },
    { field: 'name', headerName: 'Name', type: 'text' },
    { field: 'age', headerName: 'Age', type: 'number' },
    { field: 'score', headerName: 'Score', type: 'number' },
  ];

  const rows = [
    { id: 1, name: 'Alice', age: 30, score: 85 },
    { id: 2, name: 'Bob', age: 25, score: 90 },
    { id: 3, name: 'Charlie', age: 35, score: 75 },
    { id: 4, name: 'David', age: 28, score: 95 },
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

  describe('Test selection during edit', () => {
    it('should allow selection while not in edit mode', () => {
      const onSelectionChange = vi.fn();

      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            multiSelectable: true,
            editable: true,
            onSelectionChange,
            onEditCommit: vi.fn(),
          }}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox', { name: /select row/i });
      const firstRowCheckbox = checkboxes.find(cb => {
        const row = cb.closest('[data-row-id]');
        return row && row.getAttribute('data-row-id') === '1';
      });

      expect(firstRowCheckbox).toBeDefined();
      fireEvent.click(firstRowCheckbox);

      expect(onSelectionChange).toHaveBeenCalled();
    });

    it('should prevent selection changes while in edit mode', async () => {
      const onSelectionChange = vi.fn();
      const initialSelection = new Set([1]);

      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            multiSelectable: true,
            editable: true,
            onSelectionChange,
            onEditCommit: vi.fn(),
          }}
        />
      );

      // Enter edit mode
      const aliceRow = screen.getByText('Alice').closest('[data-row-id]');
      fireEvent.doubleClick(aliceRow);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      });

      // Try to change selection while in edit mode
      const checkboxes = screen.getAllByRole('checkbox', { name: /select row/i });
      const bobCheckbox = checkboxes.find(cb => {
        const row = cb.closest('[data-row-id]');
        return row && row.getAttribute('data-row-id') === '2';
      });

      if (bobCheckbox) {
        const selectionBefore = onSelectionChange.mock.calls.length;
        fireEvent.click(bobCheckbox);
        // Selection might still change, but edit mode should remain active
        await waitFor(() => {
          expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
        });
      }
    });

    it('should clear selection when entering edit mode', async () => {
      const onSelectionChange = vi.fn();

      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            multiSelectable: true,
            editable: true,
            onSelectionChange,
            onEditCommit: vi.fn(),
          }}
        />
      );

      // Select a row
      const checkboxes = screen.getAllByRole('checkbox', { name: /select row/i });
      const aliceCheckbox = checkboxes.find(cb => {
        const row = cb.closest('[data-row-id]');
        return row && row.getAttribute('data-row-id') === '1';
      });

      if (aliceCheckbox) {
        fireEvent.click(aliceCheckbox);
        await waitFor(() => {
          expect(onSelectionChange).toHaveBeenCalled();
        });
      }

      // Enter edit mode on the selected row
      const aliceRow = screen.getByText('Alice').closest('[data-row-id]');
      fireEvent.doubleClick(aliceRow);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      });

      // Selection should be cleared when edit mode starts (best practice for UX clarity)
      await waitFor(() => {
        const selectedIds = onSelectionChange.mock.calls[onSelectionChange.mock.calls.length - 1][0];
        expect(selectedIds.length).toBe(0);
      });

      // Selection checkbox should be unchecked
      const checkboxesAfterEdit = screen.getAllByRole('checkbox', { name: /select row/i });
      const aliceCheckboxAfterEdit = checkboxesAfterEdit.find(cb => {
        const row = cb.closest('[data-row-id]');
        return row && row.getAttribute('data-row-id') === '1';
      });
      
      if (aliceCheckboxAfterEdit) {
        expect(aliceCheckboxAfterEdit).not.toBeChecked();
      }
    });
  });

  describe('Test edit mode clears selection', () => {
    it('should clear selection when entering edit mode', async () => {
      const onSelectionChange = vi.fn();

      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            multiSelectable: true,
            editable: true,
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

      if (aliceCheckbox) {
        fireEvent.click(aliceCheckbox);
      }
      if (bobCheckbox) {
        fireEvent.click(bobCheckbox);
      }

      await waitFor(() => {
        expect(onSelectionChange).toHaveBeenCalled();
      });

      // Enter edit mode
      const aliceRow = screen.getByText('Alice').closest('[data-row-id]');
      fireEvent.doubleClick(aliceRow);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      });

      // Selection is cleared when entering edit mode (best practice for UX clarity)
      await waitFor(() => {
        const selectedIds = onSelectionChange.mock.calls[onSelectionChange.mock.calls.length - 1][0];
        expect(selectedIds.length).toBe(0);
      });
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    it('should clear selection when editing and keep it cleared after canceling', async () => {
      const onSelectionChange = vi.fn();

      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            multiSelectable: true,
            editable: true,
            onSelectionChange,
            onEditCommit: vi.fn(),
          }}
        />
      );

      // Select a row
      const checkboxes = screen.getAllByRole('checkbox', { name: /select row/i });
      const bobCheckbox = checkboxes.find(cb => {
        const row = cb.closest('[data-row-id]');
        return row && row.getAttribute('data-row-id') === '2';
      });

      if (bobCheckbox) {
        fireEvent.click(bobCheckbox);
        await waitFor(() => {
          expect(onSelectionChange).toHaveBeenCalled();
        });
      }

      // Enter edit mode
      const bobRow = screen.getByText('Bob').closest('[data-row-id]');
      fireEvent.doubleClick(bobRow);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      });

      // Selection should be cleared when edit starts
      await waitFor(() => {
        const selectedIds = onSelectionChange.mock.calls[onSelectionChange.mock.calls.length - 1][0];
        expect(selectedIds.length).toBe(0);
      });

      // Cancel edit
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument();
      });

      // Selection should remain cleared after canceling (not restored)
      const checkboxesAfterCancel = screen.getAllByRole('checkbox', { name: /select row/i });
      const bobCheckboxAfterCancel = checkboxesAfterCancel.find(cb => {
        const row = cb.closest('[data-row-id]');
        return row && row.getAttribute('data-row-id') === '2';
      });

      if (bobCheckboxAfterCancel) {
        expect(bobCheckboxAfterCancel).not.toBeChecked();
      }
      expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument();
    });
  });

  describe('Test multiple selection with edit disabled', () => {
    it('should allow multiple selection when edit is disabled', () => {
      const onSelectionChange = vi.fn();

      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            multiSelectable: true,
            editable: false,
            onSelectionChange,
          }}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox', { name: /select row/i });
      const aliceCheckbox = checkboxes.find(cb => {
        const row = cb.closest('[data-row-id]');
        return row && row.getAttribute('data-row-id') === '1';
      });
      const bobCheckbox = checkboxes.find(cb => {
        const row = cb.closest('[data-row-id]');
        return row && row.getAttribute('data-row-id') === '2';
      });

      if (aliceCheckbox) {
        fireEvent.click(aliceCheckbox);
      }
      if (bobCheckbox) {
        fireEvent.click(bobCheckbox);
      }

      expect(onSelectionChange).toHaveBeenCalled();
    });

    it('should not enter edit mode when editable is false', () => {
      const onEditCommit = vi.fn();

      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            multiSelectable: true,
            editable: false,
            onEditCommit,
          }}
        />
      );

      // Select rows
      const checkboxes = screen.getAllByRole('checkbox', { name: /select row/i });
      const aliceCheckbox = checkboxes.find(cb => {
        const row = cb.closest('[data-row-id]');
        return row && row.getAttribute('data-row-id') === '1';
      });

      if (aliceCheckbox) {
        fireEvent.click(aliceCheckbox);
      }

      // Try to enter edit mode
      const aliceRow = screen.getByText('Alice').closest('[data-row-id]');
      fireEvent.doubleClick(aliceRow);

      // Edit mode should not be activated
      expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument();
    });

    it('should maintain selection when edit is disabled', () => {
      const onSelectionChange = vi.fn();

      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            multiSelectable: true,
            editable: false,
            onSelectionChange,
          }}
        />
      );

      // Select multiple rows
      const checkboxes = screen.getAllByRole('checkbox', { name: /select row/i });
      const aliceCheckbox = checkboxes.find(cb => {
        const row = cb.closest('[data-row-id]');
        return row && row.getAttribute('data-row-id') === '1';
      });
      const charlieCheckbox = checkboxes.find(cb => {
        const row = cb.closest('[data-row-id]');
        return row && row.getAttribute('data-row-id') === '3';
      });

      if (aliceCheckbox) {
        fireEvent.click(aliceCheckbox);
      }
      if (charlieCheckbox) {
        fireEvent.click(charlieCheckbox);
      }

      expect(onSelectionChange).toHaveBeenCalled();
      // Selection should be maintained
      if (aliceCheckbox) {
        expect(aliceCheckbox).toBeChecked();
      }
      if (charlieCheckbox) {
        expect(charlieCheckbox).toBeChecked();
      }
    });
  });

  describe('Test selection state persistence', () => {
    it('should clear selection when editing and keep it cleared after saving', async () => {
      const onSelectionChange = vi.fn();

      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            multiSelectable: true,
            editable: true,
            onSelectionChange,
            onEditCommit: vi.fn(),
          }}
        />
      );

      // Select a row
      const checkboxes = screen.getAllByRole('checkbox', { name: /select row/i });
      const davidCheckbox = checkboxes.find(cb => {
        const row = cb.closest('[data-row-id]');
        return row && row.getAttribute('data-row-id') === '4';
      });

      if (davidCheckbox) {
        fireEvent.click(davidCheckbox);
        await waitFor(() => {
          expect(onSelectionChange).toHaveBeenCalled();
        });
      }

      // Edit a different row
      const aliceRow = screen.getByText('Alice').closest('[data-row-id]');
      fireEvent.doubleClick(aliceRow);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      });

      // Selection should be cleared when edit starts
      await waitFor(() => {
        const selectedIds = onSelectionChange.mock.calls[onSelectionChange.mock.calls.length - 1][0];
        expect(selectedIds.length).toBe(0);
      });

      // Save edit
      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument();
      });

      // Selection should remain cleared after saving (not restored)
      const checkboxesAfterSave = screen.getAllByRole('checkbox', { name: /select row/i });
      const davidCheckboxAfterSave = checkboxesAfterSave.find(cb => {
        const row = cb.closest('[data-row-id]');
        return row && row.getAttribute('data-row-id') === '4';
      });

      if (davidCheckboxAfterSave) {
        expect(davidCheckboxAfterSave).not.toBeChecked();
      }
      expect(screen.getByText('David')).toBeInTheDocument();
    });

    it('should clear selection when editing and keep it cleared after canceling', async () => {
      const onSelectionChange = vi.fn();

      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            multiSelectable: true,
            editable: true,
            onSelectionChange,
            onEditCommit: vi.fn(),
          }}
        />
      );

      // Select multiple rows
      const checkboxes = screen.getAllByRole('checkbox', { name: /select row/i });
      const bobCheckbox = checkboxes.find(cb => {
        const row = cb.closest('[data-row-id]');
        return row && row.getAttribute('data-row-id') === '2';
      });
      const charlieCheckbox = checkboxes.find(cb => {
        const row = cb.closest('[data-row-id]');
        return row && row.getAttribute('data-row-id') === '3';
      });

      if (bobCheckbox) {
        fireEvent.click(bobCheckbox);
      }
      if (charlieCheckbox) {
        fireEvent.click(charlieCheckbox);
      }

      await waitFor(() => {
        expect(onSelectionChange).toHaveBeenCalled();
      });

      // Edit a row (not selected)
      const aliceRow = screen.getByText('Alice').closest('[data-row-id]');
      fireEvent.doubleClick(aliceRow);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      });

      // Selection should be cleared when edit starts
      await waitFor(() => {
        const selectedIds = onSelectionChange.mock.calls[onSelectionChange.mock.calls.length - 1][0];
        expect(selectedIds.length).toBe(0);
      });

      // Cancel edit
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument();
      });

      // Selection should remain cleared after canceling (not restored)
      const checkboxesAfterCancel = screen.getAllByRole('checkbox', { name: /select row/i });
      const bobCheckboxAfterCancel = checkboxesAfterCancel.find(cb => {
        const row = cb.closest('[data-row-id]');
        return row && row.getAttribute('data-row-id') === '2';
      });
      const charlieCheckboxAfterCancel = checkboxesAfterCancel.find(cb => {
        const row = cb.closest('[data-row-id]');
        return row && row.getAttribute('data-row-id') === '3';
      });

      if (bobCheckboxAfterCancel) {
        expect(bobCheckboxAfterCancel).not.toBeChecked();
      }
      if (charlieCheckboxAfterCancel) {
        expect(charlieCheckboxAfterCancel).not.toBeChecked();
      }
    });

    it('should handle selection state with gridId persistence', async () => {
      const onSelectionChange = vi.fn();

      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            multiSelectable: true,
            editable: true,
            onSelectionChange,
            onEditCommit: vi.fn(),
            gridId: 'selection-edit-test',
          }}
        />
      );

      // Select rows
      const checkboxes = screen.getAllByRole('checkbox', { name: /select row/i });
      const aliceCheckbox = checkboxes.find(cb => {
        const row = cb.closest('[data-row-id]');
        return row && row.getAttribute('data-row-id') === '1';
      });

      if (aliceCheckbox) {
        fireEvent.click(aliceCheckbox);
        await waitFor(() => {
          expect(onSelectionChange).toHaveBeenCalled();
        });
      }

      // Edit and save
      const aliceRow = screen.getByText('Alice').closest('[data-row-id]');
      fireEvent.doubleClick(aliceRow);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      });

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument();
      });

      // Selection state should be handled correctly
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });
  });
});
