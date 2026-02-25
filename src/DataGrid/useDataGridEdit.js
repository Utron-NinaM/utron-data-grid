import { useCallback } from 'react';
import { validateRow } from '../validation/validateRow';

/**
 * Hook for DataGrid inline edit handlers. Edit state lives in editStore (passed in) so GridTable does not re-render on edit changes.
 * @param {Object} props
 * @param {Object} props.editStore - from createEditStore()
 * @param {boolean} props.editable
 * @param {Function} props.onEditCommit
 * @param {Function} [props.onEditStart]
 * @param {Function} [props.onEditCancel]
 * @param {Function} [props.onValidationFail]
 * @param {Function} [props.isRowEditable]
 * @param {Function} props.getRowId
 * @param {Object[]} props.columns
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
      const t0 = performance.now();
      editStore.startEdit(id, row);
      const t1 = performance.now();
      onEditStart?.(id, row);
    },
    [editable, onEditCommit, getRowId, isRowEditable, onEditStart, editStore]
  );

  const handleEditChange = useCallback(
    (field, value) => {
      const current = editStore.getSnapshot().editValues;
      editStore.setEditValues({ ...current, [field]: value });
    },
    [editStore]
  );

  const handleEditCancel = useCallback(() => {
    const { editRowId: id } = editStore.getSnapshot();
    editStore.clearEdit();
    onEditCancel?.(id);
  }, [editStore, onEditCancel]);

  const handleEditSave = useCallback(() => {
    const { editRowId, editValues, originalRow } = editStore.getSnapshot();
    const errors = validateRow(editValues, columns, originalRow);
    if (errors.length > 0) {
      onValidationFail?.(editRowId, errors);
      editStore.setValidationErrors(errors);
      return;
    }
    editStore.clearEdit();
    onEditCommit?.(editRowId, editValues);
  }, [editStore, columns, onEditCommit, onValidationFail]);

  return {
    handleRowDoubleClick,
    handleEditChange,
    handleEditCancel,
    handleEditSave,
  };
}
