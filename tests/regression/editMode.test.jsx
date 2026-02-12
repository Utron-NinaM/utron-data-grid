import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { DataGrid } from '../../src/DataGrid/DataGrid';

describe('Edit Mode Regression Tests', () => {
  const columns = [
    { field: 'id', headerName: 'ID', type: 'number' },
    {
      field: 'name',
      headerName: 'Name',
      type: 'text',
      editable: true,
      validators: [
        {
          validate: (value) => {
            if (!value || value.trim().length === 0) {
              return 'Name is required';
            }
            return true;
          },
          message: 'Name is required',
        },
      ],
    },
    {
      field: 'email',
      headerName: 'Email',
      type: 'text',
      editable: true,
    },
  ];

  const rows = [
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob', email: 'bob@example.com' },
    { id: 3, name: 'Charlie', email: 'charlie@example.com' },
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

  describe('Test only one row editable at a time', () => {
    it('should close previous edit mode when starting edit on another row', async () => {
      const onEditCommit = vi.fn();
      const onEditStart = vi.fn();
      const onEditCancel = vi.fn();

      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            editable: true,
            onEditCommit,
            onEditStart,
            onEditCancel,
          }}
        />
      );

      // Start editing first row
      const aliceRow = screen.getByText('Alice').closest('[data-row-id]');
      fireEvent.doubleClick(aliceRow);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      });

      expect(onEditStart).toHaveBeenCalledWith(1, expect.objectContaining({ id: 1, name: 'Alice' }));

      // Start editing second row while first is still in edit mode
      const bobRow = screen.getByText('Bob').closest('[data-row-id]');
      fireEvent.doubleClick(bobRow);

      // Only Bob's row should be in edit mode now (previous edit is replaced, not canceled)
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      });

      // Verify Bob's row is in edit mode by checking for Bob's input value
      const bobNameInput = screen.getByDisplayValue('Bob');
      expect(bobNameInput).toBeInTheDocument();

      // Alice's input should not be present (edit mode closed)
      // Note: onEditCancel is not called when switching rows - the edit state is just replaced
      expect(screen.queryByDisplayValue('Alice')).not.toBeInTheDocument();
      expect(onEditCancel).not.toHaveBeenCalled();
    });

    it('should only have one row in edit mode at any time', async () => {
      const onEditCommit = vi.fn();

      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            editable: true,
            onEditCommit,
          }}
        />
      );

      // Start editing first row
      const aliceRow = screen.getByText('Alice').closest('[data-row-id]');
      fireEvent.doubleClick(aliceRow);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      });

      // Verify only one save button exists
      const saveButtons = screen.getAllByRole('button', { name: /save/i });
      expect(saveButtons).toHaveLength(1);

      // Start editing second row
      const bobRow = screen.getByText('Bob').closest('[data-row-id]');
      fireEvent.doubleClick(bobRow);

      await waitFor(() => {
        // Still only one save button should exist
        const saveButtonsAfter = screen.getAllByRole('button', { name: /save/i });
        expect(saveButtonsAfter).toHaveLength(1);
      });
    });
  });

  describe('Test edit state cleared after save', () => {
    it('should clear edit state after successful save', async () => {
      const onEditCommit = vi.fn();
      const onEditCancel = vi.fn();

      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            editable: true,
            onEditCommit,
            onEditCancel,
          }}
        />
      );

      // Enter edit mode
      const aliceRow = screen.getByText('Alice').closest('[data-row-id]');
      fireEvent.doubleClick(aliceRow);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      });

      // Modify a value
      const nameInput = screen.getByDisplayValue('Alice');
      fireEvent.change(nameInput, { target: { value: 'Alicia' } });

      // Save
      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(onEditCommit).toHaveBeenCalled();
      });

      // Edit mode should be closed
      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument();
      });

      expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
      expect(onEditCancel).not.toHaveBeenCalled();

      // Input fields should no longer be present
      expect(screen.queryByDisplayValue('Alicia')).not.toBeInTheDocument();
    });

    it('should clear edit values after save', async () => {
      const onEditCommit = vi.fn();

      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            editable: true,
            onEditCommit,
          }}
        />
      );

      // Enter edit mode
      const bobRow = screen.getByText('Bob').closest('[data-row-id]');
      fireEvent.doubleClick(bobRow);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      });

      // Make changes
      const nameInput = screen.getByDisplayValue('Bob');
      const emailInput = screen.getByDisplayValue('bob@example.com');
      fireEvent.change(nameInput, { target: { value: 'Robert' } });
      fireEvent.change(emailInput, { target: { value: 'robert@example.com' } });

      // Save
      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(onEditCommit).toHaveBeenCalled();
      });

      // Edit inputs should be gone
      await waitFor(() => {
        expect(screen.queryByDisplayValue('Robert')).not.toBeInTheDocument();
        expect(screen.queryByDisplayValue('robert@example.com')).not.toBeInTheDocument();
      });
    });
  });

  describe('Test edit state cleared after cancel', () => {
    it('should clear edit state after cancel', async () => {
      const onEditCommit = vi.fn();
      const onEditCancel = vi.fn();

      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            editable: true,
            onEditCommit,
            onEditCancel,
          }}
        />
      );

      // Enter edit mode
      const aliceRow = screen.getByText('Alice').closest('[data-row-id]');
      fireEvent.doubleClick(aliceRow);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      });

      // Make some changes
      const nameInput = screen.getByDisplayValue('Alice');
      fireEvent.change(nameInput, { target: { value: 'Alicia' } });

      // Cancel
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(onEditCancel).toHaveBeenCalledWith(1);
      });

      // Edit mode should be closed
      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument();
      });

      expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
      expect(onEditCommit).not.toHaveBeenCalled();

      // Input fields should no longer be present
      expect(screen.queryByDisplayValue('Alicia')).not.toBeInTheDocument();
    });

    it('should clear edit values after cancel', async () => {
      const onEditCancel = vi.fn();

      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            editable: true,
            onEditCommit: vi.fn(),
            onEditCancel,
          }}
        />
      );

      // Enter edit mode
      const charlieRow = screen.getByText('Charlie').closest('[data-row-id]');
      fireEvent.doubleClick(charlieRow);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      });

      // Make changes
      const nameInput = screen.getByDisplayValue('Charlie');
      const emailInput = screen.getByDisplayValue('charlie@example.com');
      fireEvent.change(nameInput, { target: { value: 'Charles' } });
      fireEvent.change(emailInput, { target: { value: 'charles@example.com' } });

      // Cancel
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(onEditCancel).toHaveBeenCalled();
      });

      // Edit inputs should be gone
      await waitFor(() => {
        expect(screen.queryByDisplayValue('Charles')).not.toBeInTheDocument();
        expect(screen.queryByDisplayValue('charles@example.com')).not.toBeInTheDocument();
      });
    });
  });

  describe('Test validation errors cleared on cancel', () => {
    it('should clear validation errors when canceling edit', async () => {
      const onEditCommit = vi.fn();
      const onEditCancel = vi.fn();
      const onValidationFail = vi.fn();

      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            editable: true,
            onEditCommit,
            onEditCancel,
            onValidationFail,
          }}
        />
      );

      // Enter edit mode
      const aliceRow = screen.getByText('Alice').closest('[data-row-id]');
      fireEvent.doubleClick(aliceRow);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      });

      // Trigger validation error by clearing required field
      const nameInput = screen.getByDisplayValue('Alice');
      fireEvent.change(nameInput, { target: { value: '' } });

      // Try to save (will fail validation)
      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(onValidationFail).toHaveBeenCalled();
      });

      // Validation error should be displayed
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      // Cancel edit
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(onEditCancel).toHaveBeenCalled();
      });

      // Validation errors should be cleared
      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });
    });

    it('should not show validation errors after cancel and re-entering edit mode', async () => {
      const onEditCommit = vi.fn();
      const onEditCancel = vi.fn();
      const onValidationFail = vi.fn();

      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            editable: true,
            onEditCommit,
            onEditCancel,
            onValidationFail,
          }}
        />
      );

      // Enter edit mode
      const bobRow = screen.getByText('Bob').closest('[data-row-id]');
      fireEvent.doubleClick(bobRow);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      });

      // Trigger validation error
      const nameInput = screen.getByDisplayValue('Bob');
      fireEvent.change(nameInput, { target: { value: '' } });

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      // Cancel
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });

      // Re-enter edit mode
      fireEvent.doubleClick(bobRow);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      });

      // Validation errors should not be present
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('Test edit state not cleared on validation fail', () => {
    it('should keep edit mode active when validation fails', async () => {
      const onEditCommit = vi.fn();
      const onValidationFail = vi.fn();

      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            editable: true,
            onEditCommit,
            onValidationFail,
          }}
        />
      );

      // Enter edit mode
      const aliceRow = screen.getByText('Alice').closest('[data-row-id]');
      fireEvent.doubleClick(aliceRow);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      });

      // Trigger validation error
      const nameInput = screen.getByDisplayValue('Alice');
      fireEvent.change(nameInput, { target: { value: '' } });

      // Try to save
      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(onValidationFail).toHaveBeenCalled();
      });

      // Edit mode should still be active
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();

      // onEditCommit should not have been called
      expect(onEditCommit).not.toHaveBeenCalled();

      // Input should still be present - find the input by its display value, then find its row
      // Since name is empty, find the email input which should still have the original value
      const emailInput = screen.getByDisplayValue('alice@example.com');
      const aliceRowAfter = emailInput.closest('[data-row-id]');
      expect(aliceRowAfter).toBeTruthy();
      const rowContainer = within(aliceRowAfter);
      const emptyNameInput = rowContainer.getByDisplayValue('');
      expect(emptyNameInput).toBeInTheDocument();
    });

    it('should keep edit values when validation fails', async () => {
      const onEditCommit = vi.fn();
      const onValidationFail = vi.fn();

      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            editable: true,
            onEditCommit,
            onValidationFail,
          }}
        />
      );

      // Enter edit mode
      const bobRow = screen.getByText('Bob').closest('[data-row-id]');
      fireEvent.doubleClick(bobRow);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      });

      // Make changes
      const nameInput = screen.getByDisplayValue('Bob');
      const emailInput = screen.getByDisplayValue('bob@example.com');
      fireEvent.change(nameInput, { target: { value: '' } }); // Invalid
      fireEvent.change(emailInput, { target: { value: 'robert@example.com' } }); // Valid change

      // Try to save (will fail validation)
      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(onValidationFail).toHaveBeenCalled();
      });

      // Edit values should still be present - find the email input, then find its row
      const emailInputAfter = screen.getByDisplayValue('robert@example.com');
      const bobRowAfter = emailInputAfter.closest('[data-row-id]');
      expect(bobRowAfter).toBeTruthy();
      const rowContainer = within(bobRowAfter);
      const emptyNameInputAfter = rowContainer.getByDisplayValue('');
      expect(emptyNameInputAfter).toBeInTheDocument();
      expect(emailInputAfter).toBeInTheDocument();

      // Edit mode should still be active
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    it('should allow fixing validation errors and saving again', async () => {
      const onEditCommit = vi.fn();
      const onValidationFail = vi.fn();

      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            editable: true,
            onEditCommit,
            onValidationFail,
          }}
        />
      );

      // Enter edit mode
      const charlieRow = screen.getByText('Charlie').closest('[data-row-id]');
      fireEvent.doubleClick(charlieRow);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      });

      // Trigger validation error
      const nameInput = screen.getByDisplayValue('Charlie');
      fireEvent.change(nameInput, { target: { value: '' } });

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(onValidationFail).toHaveBeenCalled();
      });

      // Fix the error
      fireEvent.change(nameInput, { target: { value: 'Charles' } });

      // Save again
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(onEditCommit).toHaveBeenCalled();
      });

      // Edit mode should now be closed
      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument();
      });
    });
  });
});
