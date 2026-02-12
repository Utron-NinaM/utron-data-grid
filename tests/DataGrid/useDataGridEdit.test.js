import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDataGridEdit } from '../../src/DataGrid/useDataGridEdit';

vi.mock('../../src/validation/validateRow', () => ({
  validateRow: vi.fn(),
}));

import { validateRow } from '../../src/validation/validateRow';

describe('useDataGridEdit', () => {
  const defaultColumns = [{ field: 'name', headerName: 'Name' }];
  const defaultGetRowId = (row) => row.id;

  beforeEach(() => {
    vi.mocked(validateRow).mockReturnValue([]);
  });

  describe('initial state', () => {
    it('returns null editRowId, empty editValues, empty validationErrors', () => {
      const { result } = renderHook(useDataGridEdit, {
        initialProps: {
          editable: true,
          onEditCommit: vi.fn(),
          getRowId: defaultGetRowId,
          columns: defaultColumns,
        },
      });
      expect(result.current.editRowId).toBeNull();
      expect(result.current.editValues).toEqual({});
      expect(result.current.validationErrors).toEqual([]);
    });
  });

  describe('handleRowDoubleClick', () => {
    it('does not change state when editable is false', () => {
      const onEditStart = vi.fn();
      const { result } = renderHook(useDataGridEdit, {
        initialProps: {
          editable: false,
          onEditCommit: vi.fn(),
          getRowId: defaultGetRowId,
          columns: defaultColumns,
        },
      });
      const row = { id: '1', name: 'Alice' };
      act(() => {
        result.current.handleRowDoubleClick(row);
      });
      expect(result.current.editRowId).toBeNull();
      expect(result.current.editValues).toEqual({});
      expect(onEditStart).not.toHaveBeenCalled();
    });

    it('does not change state when onEditCommit is missing', () => {
      const { result } = renderHook(useDataGridEdit, {
        initialProps: {
          editable: true,
          onEditCommit: undefined,
          getRowId: defaultGetRowId,
          columns: defaultColumns,
        },
      });
      const row = { id: '1', name: 'Alice' };
      act(() => {
        result.current.handleRowDoubleClick(row);
      });
      expect(result.current.editRowId).toBeNull();
    });

    it('does not change state when isRowEditable returns false', () => {
      const isRowEditable = vi.fn().mockReturnValue(false);
      const { result } = renderHook(useDataGridEdit, {
        initialProps: {
          editable: true,
          onEditCommit: vi.fn(),
          isRowEditable,
          getRowId: defaultGetRowId,
          columns: defaultColumns,
        },
      });
      const row = { id: '1', name: 'Alice' };
      act(() => {
        result.current.handleRowDoubleClick(row);
      });
      expect(isRowEditable).toHaveBeenCalledWith(row);
      expect(result.current.editRowId).toBeNull();
    });

    it('sets editRowId and editValues and calls onEditStart when editable and allowed', () => {
      const onEditStart = vi.fn();
      const { result } = renderHook(useDataGridEdit, {
        initialProps: {
          editable: true,
          onEditCommit: vi.fn(),
          onEditStart,
          getRowId: defaultGetRowId,
          columns: defaultColumns,
        },
      });
      const row = { id: 'r1', name: 'Alice' };
      act(() => {
        result.current.handleRowDoubleClick(row);
      });
      expect(result.current.editRowId).toBe('r1');
      expect(result.current.editValues).toEqual({ id: 'r1', name: 'Alice' });
      expect(result.current.validationErrors).toEqual([]);
      expect(onEditStart).toHaveBeenCalledWith('r1', row);
    });
  });

  describe('handleEditChange', () => {
    it('updates editValues by field', () => {
      const { result } = renderHook(useDataGridEdit, {
        initialProps: {
          editable: true,
          onEditCommit: vi.fn(),
          getRowId: defaultGetRowId,
          columns: defaultColumns,
        },
      });
      act(() => {
        result.current.handleRowDoubleClick({ id: '1', name: 'Alice' });
      });
      act(() => {
        result.current.handleEditChange('name', 'Bob');
      });
      expect(result.current.editValues).toMatchObject({ name: 'Bob' });
    });
  });

  describe('handleEditSave', () => {
    it('sets validationErrors and calls onValidationFail when validateRow returns errors', () => {
      const errors = [{ field: 'name', message: 'Required' }];
      vi.mocked(validateRow).mockReturnValue(errors);
      const onValidationFail = vi.fn();
      const onEditCommit = vi.fn();
      const { result } = renderHook(useDataGridEdit, {
        initialProps: {
          editable: true,
          onEditCommit,
          onValidationFail,
          getRowId: defaultGetRowId,
          columns: defaultColumns,
        },
      });
      act(() => {
        result.current.handleRowDoubleClick({ id: '1', name: '' });
      });
      act(() => {
        result.current.handleEditSave();
      });
      expect(result.current.validationErrors).toEqual(errors);
      expect(onValidationFail).toHaveBeenCalledWith('1', errors);
      expect(onEditCommit).not.toHaveBeenCalled();
      expect(result.current.editRowId).toBe('1');
    });

    it('calls onEditCommit and clears edit state when validateRow returns no errors', () => {
      vi.mocked(validateRow).mockReturnValue([]);
      const onEditCommit = vi.fn();
      const { result } = renderHook(useDataGridEdit, {
        initialProps: {
          editable: true,
          onEditCommit,
          getRowId: defaultGetRowId,
          columns: defaultColumns,
        },
      });
      const row = { id: '1', name: 'Alice' };
      act(() => {
        result.current.handleRowDoubleClick(row);
      });
      act(() => {
        result.current.handleEditChange('name', 'Alicia');
      });
      act(() => {
        result.current.handleEditSave();
      });
      expect(onEditCommit).toHaveBeenCalledWith('1', { id: '1', name: 'Alicia' });
      expect(result.current.editRowId).toBeNull();
      expect(result.current.editValues).toEqual({});
      expect(result.current.validationErrors).toEqual([]);
    });
  });

  describe('handleEditCancel', () => {
    it('clears edit state and calls onEditCancel with previous editRowId', () => {
      const onEditCancel = vi.fn();
      const { result } = renderHook(useDataGridEdit, {
        initialProps: {
          editable: true,
          onEditCommit: vi.fn(),
          onEditCancel,
          getRowId: defaultGetRowId,
          columns: defaultColumns,
        },
      });
      act(() => {
        result.current.handleRowDoubleClick({ id: '1', name: 'Alice' });
      });
      act(() => {
        result.current.handleEditCancel();
      });
      expect(result.current.editRowId).toBeNull();
      expect(result.current.editValues).toEqual({});
      expect(result.current.validationErrors).toEqual([]);
      expect(onEditCancel).toHaveBeenCalledWith('1');
    });
  });
});
