import { useCallback } from 'react';
import { validateRow, validateField } from '../validation/validateRow';
import { toRowErrors } from './editStore';

/**
 * Helper function to detect if a row is empty (placeholder row).
 * A row is considered empty if it only has an id field, or if all values (except the id field) are null, undefined, or empty strings.
 * @param {Object} row - The row object
 * @param {Function} getRowId - Function to get the row ID field value
 */
export function isEmptyRow(row, getRowId) {
  if (!row || typeof row !== 'object') return true;
  
  // Get the ID value to identify which field/value is the ID
  const idValue = getRowId ? getRowId(row) : (row.id ?? null);
  
  // Check if row has only the id field, or if all other fields are empty
  const entries = Object.entries(row);
  if (entries.length === 0) return true;
  
  // If only one field exists, it's likely just the id field (empty row)
  if (entries.length === 1) {
    return true;
  }
  
  // Check if all fields except the one matching the id value are empty
  // This handles cases where the id field name might vary
  const nonEmptyFields = entries.filter(([key, value]) => {
    // Skip if this value is the id value (it's the id field)
    if (value === idValue) return false;
    // Check if field has a non-empty value
    return value != null && value !== '';
  });
  
  // Row is empty if no non-empty fields exist (only id field has a value)
  return nonEmptyFields.length === 0;
}

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
  onRowDoubleClick,
}) {
  const handleRowDoubleClick = useCallback(
    (row) => {
      // Call onRowDoubleClick callback if provided
      if (onRowDoubleClick) {
        onRowDoubleClick(row);
      }

      // If editing is not enabled or no commit handler, don't start edit mode
      if (!editable || !onEditCommit) return;

      const id = getRowId(row);
      const isEmpty = isEmptyRow(row, getRowId);

      // Empty rows should always be editable (to add new data)
      // Only check isRowEditable for non-empty rows
      if (!isEmpty && isRowEditable && !isRowEditable(row)) return;

      // Use startNewRowEdit for empty rows, startEdit for existing rows
      if (isEmpty) {
        editStore.startNewRowEdit(id);
      } else {
        editStore.startEdit(id, row);
      }
      onEditStart?.(id, row);
    },
    [editable, onEditCommit, getRowId, isRowEditable, onEditStart, editStore, onRowDoubleClick]
  );

  const handleEditChange = useCallback(
    (field, value) => {
      const snap = editStore.getSnapshot();
      const current = snap.editValues;
      editStore.setEditValues({ ...current, [field]: value });
      if (snap.editRowId != null) {
        // Clear field-specific error for this field
        editStore.clearFieldError(snap.editRowId, field);
        // Clear row-level errors since they depend on multiple fields and may no longer be valid
        editStore.clearFieldError(snap.editRowId, null);
      }
    },
    [editStore]
  );

  const handleCellBlur = useCallback(
    (rowId, field) => {
      const { editValues, originalRow, mode } = editStore.getSnapshot();
      if (editValues == null) return;
      const errors = validateField(
        editValues,
        columns,
        originalRow ?? {},
        field,
        mode
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
    const errors = validateRow(editValues, columns, orig, mode);
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
