import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createEditStore } from '../../src/DataGrid/editStore';
import { useDataGridEdit } from '../../src/DataGrid/useDataGridEdit';

/**
 * Integration test: useDataGridEdit with real validateRow (no mock).
 * Verifies the contract between the hook and validateRow.
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

  it('sets validationErrors and calls onValidationFail when validateRow returns errors; onEditCommit when valid', () => {
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
    expect(s1.validationErrors).toHaveLength(1);
    expect(s1.validationErrors[0]).toMatchObject({
      field: 'score',
      message: 'Score must be >= 0',
    });
    expect(onValidationFail).toHaveBeenCalledWith(1, s1.validationErrors);
    expect(onEditCommit).not.toHaveBeenCalled();
    expect(s1.editRowId).toBe(1);

    act(() => {
      result.current.handleEditChange('score', 10);
    });
    act(() => {
      result.current.handleEditSave();
    });

    const s2 = editStore.getSnapshot();
    expect(s2.validationErrors).toBeNull();
    expect(s2.editRowId).toBeNull();
    expect(onEditCommit).toHaveBeenCalledWith(1, { id: 1, name: 'Alice', score: 10 });
  });
});
