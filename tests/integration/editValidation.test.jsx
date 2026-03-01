import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DataGrid } from '../../src/DataGrid/DataGrid';

describe('Edit + Validation Integration', () => {
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
            if (value.length < 2) {
              return 'Name must be at least 2 characters';
            }
            return true;
          },
          message: 'Name is required and must be at least 2 characters',
        },
      ],
    },
    {
      field: 'email',
      headerName: 'Email',
      type: 'text',
      editable: true,
      validators: [
        {
          validate: (value) => {
            if (!value || value.trim().length === 0) {
              return 'Email is required';
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
              return 'Invalid email format';
            }
            return true;
          },
          message: 'Email is required and must be valid',
        },
      ],
    },
    {
      field: 'age',
      headerName: 'Age',
      type: 'number',
      editable: true,
      validators: [
        {
          validate: (value) => {
            if (value === undefined || value === null || value === '') {
              return 'Age is required';
            }
            const num = Number(value);
            if (isNaN(num)) {
              return 'Age must be a number';
            }
            if (num < 18) {
              return 'Age must be at least 18';
            }
            return true;
          },
          message: 'Age must be at least 18',
        },
      ],
    },
  ];

  const rows = [
    { id: 1, name: 'Alice', email: 'alice@example.com', age: 30 },
    { id: 2, name: 'Bob', email: 'bob@example.com', age: 25 },
    { id: 3, name: 'Charlie', email: 'charlie@example.com', age: 35 },
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

  describe('Test edit mode activation', () => {
    it('should activate edit mode on double click', async () => {
      const onEditStart = vi.fn();
      const onEditCommit = vi.fn();

      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            editable: true,
            onEditCommit,
            onEditStart,
          }}
        />
      );

      const aliceRow = screen.getByText('Alice').closest('[data-row-id]');
      fireEvent.doubleClick(aliceRow);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(onEditStart).toHaveBeenCalledWith(1, expect.objectContaining({ id: 1, name: 'Alice' }));
    });

    it('should not activate edit mode when editable is false', () => {
      const onEditCommit = vi.fn();

      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            editable: false,
            onEditCommit,
          }}
        />
      );

      const aliceRow = screen.getByText('Alice').closest('[data-row-id]');
      fireEvent.doubleClick(aliceRow);

      expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument();
    });

    it('should not activate edit mode when onEditCommit is not provided', () => {
      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            editable: true,
          }}
        />
      );

      const aliceRow = screen.getByText('Alice').closest('[data-row-id]');
      fireEvent.doubleClick(aliceRow);

      expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument();
    });

    it('should initialize edit values with current row data', async () => {
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

      const bobRow = screen.getByText('Bob').closest('[data-row-id]');
      fireEvent.doubleClick(bobRow);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      });

      // Check that input fields contain the current values
      const nameInput = screen.getByDisplayValue('Bob');
      expect(nameInput).toBeInTheDocument();
    });
  });

  describe('Test validation on save', () => {
    it('should validate required fields on save', async () => {
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

      const aliceRow = screen.getByText('Alice').closest('[data-row-id]');
      fireEvent.doubleClick(aliceRow);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      });

      // Clear the name field
      const nameInput = screen.getByDisplayValue('Alice');
      fireEvent.change(nameInput, { target: { value: '' } });

      // Save
      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(onValidationFail).toHaveBeenCalled();
      });

      expect(onEditCommit).not.toHaveBeenCalled();
      expect(onValidationFail).toHaveBeenCalledWith(
        1,
        expect.arrayContaining([expect.objectContaining({ field: 'name' })])
      );
    });

    it('should validate email format on save', async () => {
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

      const bobRow = screen.getByText('Bob').closest('[data-row-id]');
      fireEvent.doubleClick(bobRow);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      });

      // Set invalid email
      const emailInput = screen.getByDisplayValue('bob@example.com');
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

      // Save
      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(onValidationFail).toHaveBeenCalled();
      });

      expect(onEditCommit).not.toHaveBeenCalled();
      expect(onValidationFail).toHaveBeenCalledWith(
        2,
        expect.arrayContaining([expect.objectContaining({ field: 'email' })])
      );
    });

    it('should validate age minimum value on save', async () => {
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

      const charlieRow = screen.getByText('Charlie').closest('[data-row-id]');
      fireEvent.doubleClick(charlieRow);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      });

      // Set age below minimum
      const ageInput = screen.getByDisplayValue('35');
      fireEvent.change(ageInput, { target: { value: '15' } });

      // Save
      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(onValidationFail).toHaveBeenCalled();
      });

      expect(onEditCommit).not.toHaveBeenCalled();
      expect(onValidationFail).toHaveBeenCalledWith(
        3,
        expect.arrayContaining([expect.objectContaining({ field: 'age' })])
      );
    });

    it('should validate multiple fields and return all errors', async () => {
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

      const aliceRow = screen.getByText('Alice').closest('[data-row-id]');
      fireEvent.doubleClick(aliceRow);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      });

      // Set multiple invalid values
      const nameInput = screen.getByDisplayValue('Alice');
      const emailInput = screen.getByDisplayValue('alice@example.com');
      const ageInput = screen.getByDisplayValue('30');

      fireEvent.change(nameInput, { target: { value: 'A' } }); // Too short
      fireEvent.change(emailInput, { target: { value: 'invalid' } }); // Invalid format
      fireEvent.change(ageInput, { target: { value: '10' } }); // Below minimum

      // Save
      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(onValidationFail).toHaveBeenCalled();
      });

      const validationCall = onValidationFail.mock.calls[0];
      expect(validationCall[0]).toBe(1);
      const errors = validationCall[1];
      expect(errors.length).toBeGreaterThanOrEqual(1);
      expect(onEditCommit).not.toHaveBeenCalled();
    });
  });

  describe('Test error display', () => {
    it('should display validation errors in ValidationAlert', async () => {
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

      const aliceRow = screen.getByText('Alice').closest('[data-row-id]');
      fireEvent.doubleClick(aliceRow);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      });

      // Clear name to trigger validation error
      const nameInput = screen.getByDisplayValue('Alice');
      fireEvent.change(nameInput, { target: { value: '' } });

      // Save
      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      expect(screen.getByText(/validation error/i)).toBeInTheDocument();
      expect(screen.getByText(/Name is required/i)).toBeInTheDocument();
    });

    it('should display multiple validation errors', async () => {
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

      const bobRow = screen.getByText('Bob').closest('[data-row-id]');
      fireEvent.doubleClick(bobRow);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      });

      // Set multiple invalid values
      const nameInput = screen.getByDisplayValue('Bob');
      const emailInput = screen.getByDisplayValue('bob@example.com');

      fireEvent.change(nameInput, { target: { value: '' } });
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

      // Save
      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      expect(screen.getByText(/validation error/i)).toBeInTheDocument();
      expect(screen.getByText(/Name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Invalid email format/i)).toBeInTheDocument();
    });

    it('should clear validation errors when entering edit mode again', async () => {
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

      const aliceRow = screen.getByText('Alice').closest('[data-row-id]');
      fireEvent.doubleClick(aliceRow);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      });

      // Trigger validation error
      const nameInput = screen.getByDisplayValue('Alice');
      fireEvent.change(nameInput, { target: { value: '' } });

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      // Cancel edit
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });

      // Enter edit mode again
      fireEvent.doubleClick(aliceRow);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      });

      // Validation errors should be cleared
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('Test successful save flow', () => {
    it('should call onEditCommit with correct values on successful save', async () => {
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

      const aliceRow = screen.getByText('Alice').closest('[data-row-id]');
      fireEvent.doubleClick(aliceRow);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      });

      // Modify values
      const nameInput = screen.getByDisplayValue('Alice');
      fireEvent.change(nameInput, { target: { value: 'Alicia' } });

      // Save
      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(onEditCommit).toHaveBeenCalled();
      });

      expect(onEditCommit).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          id: 1,
          name: 'Alicia',
          email: 'alice@example.com',
          age: 30,
        })
      );

      // Edit mode should be closed
      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument();
      });
    });

    it('should close edit mode after successful save', async () => {
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

      const bobRow = screen.getByText('Bob').closest('[data-row-id]');
      fireEvent.doubleClick(bobRow);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      });

      // Save without changes (valid data)
      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument();
      });

      expect(onEditCommit).toHaveBeenCalled();
      expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
    });

    it('should clear validation errors on successful save', async () => {
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

      const aliceRow = screen.getByText('Alice').closest('[data-row-id]');
      fireEvent.doubleClick(aliceRow);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      });

      // First, trigger a validation error
      const nameInput = screen.getByDisplayValue('Alice');
      fireEvent.change(nameInput, { target: { value: '' } });

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      // Fix the error and save again
      fireEvent.change(nameInput, { target: { value: 'Alicia' } });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(onEditCommit).toHaveBeenCalled();
      });

      // Validation errors should be cleared
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('Test cancel flow', () => {
    it('should call onEditCancel when cancel button is clicked', async () => {
      const onEditCommit = vi.fn();
      const onEditCancel = vi.fn();
      const onEditStart = vi.fn();

      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            editable: true,
            onEditCommit,
            onEditCancel,
            onEditStart,
          }}
        />
      );

      const bobRow = screen.getByText('Bob').closest('[data-row-id]');
      fireEvent.doubleClick(bobRow);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      });

      // Make some changes
      const nameInput = screen.getByDisplayValue('Bob');
      fireEvent.change(nameInput, { target: { value: 'Robert' } });

      // Cancel
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(onEditCancel).toHaveBeenCalled();
      });

      expect(onEditCancel).toHaveBeenCalledWith(2);
      expect(onEditCommit).not.toHaveBeenCalled();

      // Edit mode should be closed
      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument();
      });
    });

    it('should close edit mode on cancel', async () => {
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

      const charlieRow = screen.getByText('Charlie').closest('[data-row-id]');
      fireEvent.doubleClick(charlieRow);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument();
      });

      expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
    });

    it('should clear validation errors on cancel', async () => {
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

      const aliceRow = screen.getByText('Alice').closest('[data-row-id]');
      fireEvent.doubleClick(aliceRow);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      });

      // Trigger validation error
      const nameInput = screen.getByDisplayValue('Alice');
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

      expect(onEditCancel).toHaveBeenCalled();
      expect(onEditCommit).not.toHaveBeenCalled();
    });

    it('should not save changes when canceling', async () => {
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

      // Cancel
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(onEditCancel).toHaveBeenCalled();
      });

      expect(onEditCommit).not.toHaveBeenCalled();

      // Verify original values are still displayed
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('bob@example.com')).toBeInTheDocument();
    });
  });
});
