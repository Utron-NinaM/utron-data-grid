import { useCallback } from 'react';
import { validateRow, validateField } from '../validation/validateRow';
import { toRowErrors } from './editStore';

/**
 * Hook for DataGrid inline edit handlers. Edit state lives in editStore.
 * Validation: field-level on blur, full row on Save; clear field error on value change.
 */
export function useDataGridEdit({
  editStore,
  editable,
  onEditCommit,
  onEditStart,
  onEditCancel,
  onValidationFail,
  isRowEditable,
  getRowId,
  columns,
}) {
  const handleRowDoubleClick = useCallback(
    (row) => {
      if (!editable || !onEditCommit) return;
      if (isRowEditable && !isRowEditable(row)) return;
      const id = getRowId(row);
      editStore.startEdit(id, row);
      onEditStart?.(id, row);
    },
    [editable, onEditCommit, getRowId, isRowEditable, onEditStart, editStore]
  );

  const handleEditChange = useCallback(
    (field, value) => {
      const snap = editStore.getSnapshot();
      const current = snap.editValues;
      editStore.setEditValues({ ...current, [field]: value });
      if (snap.editRowId != null) {
        editStore.clearFieldError(snap.editRowId, field);
      }
    },
    [editStore]
  );

  const handleCellBlur = useCallback(
    (rowId, field) => {
      const { editValues, originalRow } = editStore.getSnapshot();
      if (editValues == null) return;
      const errors = validateField(
        editValues,
        columns,
        originalRow ?? {},
        field
      );
      editStore.setFieldErrors(rowId, field, errors);
    },
    [editStore, columns]
  );

  const handleEditCancel = useCallback(() => {
    const { editRowId: id } = editStore.getSnapshot();
    editStore.clearEdit();
    onEditCancel?.(id);
  }, [editStore, onEditCancel]);

  const handleEditSave = useCallback(() => {
    const snap = editStore.getSnapshot();
    const { editRowId, editValues, originalRow, mode } = snap;
    if (editRowId == null || editValues == null) return;
    const orig = originalRow ?? {};
    const errors = validateRow(editValues, columns, orig);
    if (errors.length > 0) {
      onValidationFail?.(editRowId, errors);
      editStore.mergeRowErrors(toRowErrors(editRowId, errors));
      return;
    }
    onEditCommit?.(editRowId, editValues);
    editStore.clearEdit();
  }, [editStore, columns, onEditCommit, onValidationFail]);

  return {
    handleRowDoubleClick,
    handleEditChange,
    handleCellBlur,
    handleEditCancel,
    handleEditSave,
  };
}
