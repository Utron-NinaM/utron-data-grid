import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createEditStore } from '../../src/DataGrid/editStore';
import { useDataGridEdit } from '../../src/DataGrid/useDataGridEdit';

vi.mock('../../src/validation/validateRow', () => ({
  validateRow: vi.fn(),
}));

import { validateRow } from '../../src/validation/validateRow';

describe('useDataGridEdit', () => {
  const defaultColumns = [{ field: 'name', headerName: 'Name' }];
  const defaultGetRowId = (row) => row.id;

  function getDefaultProps(overrides = {}) {
    return {
      editStore: createEditStore(),
      editable: true,
      onEditCommit: vi.fn(),
      getRowId: defaultGetRowId,
      columns: defaultColumns,
      ...overrides,
    };
  }

  beforeEach(() => {
    vi.mocked(validateRow).mockReturnValue([]);
  });

  describe('initial state', () => {
    it('returns null editRowId, empty editValues, empty validationState.rowErrors', () => {
      const editStore = createEditStore();
      renderHook(useDataGridEdit, {
        initialProps: getDefaultProps({ editStore }),
      });
      const s = editStore.getSnapshot();
      expect(s.editRowId).toBeNull();
      expect(s.editValues).toBeNull();
      expect(s.validationState.rowErrors).toEqual({});
    });
  });

  describe('handleRowDoubleClick', () => {
    it('does not change state when editable is false', () => {
      const editStore = createEditStore();
      const { result } = renderHook(useDataGridEdit, {
        initialProps: getDefaultProps({ editStore, editable: false }),
      });
      const row = { id: '1', name: 'Alice' };
      act(() => {
        result.current.handleRowDoubleClick(row);
      });
      expect(editStore.getSnapshot().editRowId).toBeNull();
      expect(editStore.getSnapshot().editValues).toBeNull();
    });

    it('does not change state when onEditCommit is missing', () => {
      const editStore = createEditStore();
      const { result } = renderHook(useDataGridEdit, {
        initialProps: getDefaultProps({ editStore, onEditCommit: undefined }),
      });
      const row = { id: '1', name: 'Alice' };
      act(() => {
        result.current.handleRowDoubleClick(row);
      });
      expect(editStore.getSnapshot().editRowId).toBeNull();
    });

    it('does not change state when isRowEditable returns false', () => {
      const editStore = createEditStore();
      const isRowEditable = vi.fn().mockReturnValue(false);
      const { result } = renderHook(useDataGridEdit, {
        initialProps: getDefaultProps({ editStore, isRowEditable }),
      });
      const row = { id: '1', name: 'Alice' };
      act(() => {
        result.current.handleRowDoubleClick(row);
      });
      expect(isRowEditable).toHaveBeenCalledWith(row);
      expect(editStore.getSnapshot().editRowId).toBeNull();
    });

    it('sets editRowId and editValues and calls onEditStart when editable and allowed', () => {
      const editStore = createEditStore();
      const onEditStart = vi.fn();
      const { result } = renderHook(useDataGridEdit, {
        initialProps: getDefaultProps({ editStore, onEditStart }),
      });
      const row = { id: 'r1', name: 'Alice' };
      act(() => {
        result.current.handleRowDoubleClick(row);
      });
      const s = editStore.getSnapshot();
      expect(s.editRowId).toBe('r1');
      expect(s.editValues).toEqual({ id: 'r1', name: 'Alice' });
      expect(s.validationState.rowErrors).toEqual({});
      expect(onEditStart).toHaveBeenCalledWith('r1', row);
    });
  });

  describe('handleEditChange', () => {
    it('updates editValues by field', () => {
      const editStore = createEditStore();
      const { result } = renderHook(useDataGridEdit, {
        initialProps: getDefaultProps({ editStore }),
      });
      act(() => {
        result.current.handleRowDoubleClick({ id: '1', name: 'Alice' });
      });
      act(() => {
        result.current.handleEditChange('name', 'Bob');
      });
      expect(editStore.getSnapshot().editValues).toMatchObject({ name: 'Bob' });
    });
  });

  describe('handleEditSave', () => {
    it('sets validationState.rowErrors and calls onValidationFail when validateRow returns errors', () => {
      const errors = [{ field: 'name', message: 'Required', severity: 'error' }];
      vi.mocked(validateRow).mockReturnValue(errors);
      const editStore = createEditStore();
      const onValidationFail = vi.fn();
      const onEditCommit = vi.fn();
      const { result } = renderHook(useDataGridEdit, {
        initialProps: getDefaultProps({ editStore, onEditCommit, onValidationFail }),
      });
      act(() => {
        result.current.handleRowDoubleClick({ id: '1', name: '' });
      });
      act(() => {
        result.current.handleEditSave();
      });
      expect(editStore.getSnapshot().validationState.rowErrors['1'].name).toEqual(errors);
      expect(onValidationFail).toHaveBeenCalledWith('1', errors);
      expect(onEditCommit).not.toHaveBeenCalled();
      expect(editStore.getSnapshot().editRowId).toBe('1');
    });

    it('calls onEditCommit and clears edit state when validateRow returns no errors', () => {
      vi.mocked(validateRow).mockReturnValue([]);
      const editStore = createEditStore();
      const onEditCommit = vi.fn();
      const { result } = renderHook(useDataGridEdit, {
        initialProps: getDefaultProps({ editStore, onEditCommit }),
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
      const s = editStore.getSnapshot();
      expect(s.editRowId).toBeNull();
      expect(s.editValues).toBeNull();
      expect(s.validationState.rowErrors).toEqual({});
    });
  });

  describe('handleEditCancel', () => {
    it('clears edit state and calls onEditCancel with previous editRowId', () => {
      const editStore = createEditStore();
      const onEditCancel = vi.fn();
      const { result } = renderHook(useDataGridEdit, {
        initialProps: getDefaultProps({ editStore, onEditCancel }),
      });
      act(() => {
        result.current.handleRowDoubleClick({ id: '1', name: 'Alice' });
      });
      act(() => {
        result.current.handleEditCancel();
      });
      const s = editStore.getSnapshot();
      expect(s.editRowId).toBeNull();
      expect(s.editValues).toBeNull();
      expect(s.validationState.rowErrors).toEqual({});
      expect(onEditCancel).toHaveBeenCalledWith('1');
    });
  });
});
