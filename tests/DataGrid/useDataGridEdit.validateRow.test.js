import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createEditStore } from '../../src/DataGrid/editStore';
import { useDataGridEdit } from '../../src/DataGrid/useDataGridEdit';

/**
 * Integration test: useDataGridEdit with real validateRow (no mock).
 * Verifies validationState.rowErrors, onValidationFail, clearFieldError on value change, clearEdit on success.
 */
describe('useDataGridEdit with real validateRow', () => {
  const getRowId = (row) => row.id;
  const columns = [
    { field: 'name', headerName: 'Name' },
    {
      field: 'score',
      headerName: 'Score',
      validators: [
        { validate: (v) => v != null && Number(v) >= 0, message: 'Score must be >= 0' },
      ],
    },
  ];

  it('sets validationState.rowErrors and calls onValidationFail when validateRow returns errors; onEditCommit when valid', () => {
    const editStore = createEditStore();
    const onValidationFail = vi.fn();
    const onEditCommit = vi.fn();
    const { result } = renderHook(useDataGridEdit, {
      initialProps: {
        editStore,
        editable: true,
        onEditCommit,
        onValidationFail,
        getRowId,
        columns,
      },
    });

    act(() => {
      result.current.handleRowDoubleClick({ id: 1, name: 'Alice', score: -5 });
    });
    act(() => {
      result.current.handleEditSave();
    });

    const s1 = editStore.getSnapshot();
    expect(s1.validationState.rowErrors[1]).toBeDefined();
    expect(s1.validationState.rowErrors[1].score).toHaveLength(1);
    expect(s1.validationState.rowErrors[1].score[0]).toMatchObject({
      field: 'score',
      message: 'Score must be >= 0',
    });
    expect(onValidationFail).toHaveBeenCalledWith(1, expect.any(Array));
    expect(onValidationFail.mock.calls[0][1][0]).toMatchObject({
      field: 'score',
      message: 'Score must be >= 0',
    });
    expect(onEditCommit).not.toHaveBeenCalled();
    expect(s1.editRowId).toBe(1);

    act(() => {
      result.current.handleEditChange('score', 10);
    });
    expect(editStore.getCellError(1, 'score')).toHaveLength(0);

    act(() => {
      result.current.handleEditSave();
    });

    const s2 = editStore.getSnapshot();
    expect(Object.keys(s2.validationState.rowErrors)).toHaveLength(0);
    expect(s2.editRowId).toBeNull();
    expect(onEditCommit).toHaveBeenCalledWith(1, { id: 1, name: 'Alice', score: 10 });
  });

  it('clearValidation on edit start (startEdit clears validationState)', () => {
    const editStore = createEditStore();
    editStore.startEdit(1, { id: 1, name: 'A', score: -1 });
    editStore.mergeRowErrors({ 1: { score: [{ field: 'score', message: 'Bad', severity: 'error' }] } });
    expect(editStore.getCellError(1, 'score')).toHaveLength(1);
    editStore.startEdit(2, { id: 2, name: 'B', score: 0 });
    expect(editStore.getCellError(1, 'score')).toHaveLength(0);
    expect(editStore.getSnapshot().validationState.rowErrors).toEqual({});
  });
});
