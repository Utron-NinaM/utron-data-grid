import { useCallback, useState } from 'react';
import { validateRow } from '../validation/validateRow';

/**
 * Hook for DataGrid inline edit state and handlers.
 * @param {Object} props
 * @param {boolean} props.editable
 * @param {Function} props.onEditCommit
 * @param {Function} [props.onEditStart]
 * @param {Function} [props.onEditCancel]
 * @param {Function} [props.onValidationFail]
 * @param {Function} [props.isRowEditable]
 * @param {Function} props.getRowId
 * @param {Object[]} props.columns
 * @returns {{ editRowId: string|null, editValues: Object, validationErrors: Array, handleRowDoubleClick: Function, handleEditChange: Function, handleEditCancel: Function, handleEditSave: Function }}
 */
export function useDataGridEdit({
  editable,
  onEditCommit,
  onEditStart,
  onEditCancel,
  onValidationFail,
  isRowEditable,
  getRowId,
  columns,
}) {
  const [editRowId, setEditRowId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [originalRow, setOriginalRow] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);

  const handleRowDoubleClick = useCallback(
    (row) => {
      if (!editable || !onEditCommit) return;
      if (isRowEditable && !isRowEditable(row)) return;
      const id = getRowId(row);
      setEditRowId(id);
      setEditValues({ ...row });
      setOriginalRow(row);
      setValidationErrors([]);
      onEditStart?.(id, row);
    },
    [editable, onEditCommit, getRowId, isRowEditable, onEditStart]
  );

  const handleEditChange = useCallback((field, value) => {
    setEditValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleEditCancel = useCallback(() => {
    const id = editRowId;
    setEditRowId(null);
    setEditValues({});
    setOriginalRow(null);
    setValidationErrors([]);
    onEditCancel?.(id);
  }, [editRowId, onEditCancel]);

  const handleEditSave = useCallback(() => {
    const errors = validateRow(editValues, columns, originalRow);
    if (errors.length > 0) {
      onValidationFail?.(editRowId, errors);
      setValidationErrors(errors);
      return;
    }
    setValidationErrors([]);
    onEditCommit?.(editRowId, editValues);
    setEditRowId(null);
    setEditValues({});
    setOriginalRow(null);
  }, [editValues, editRowId, columns, originalRow, onEditCommit, onValidationFail]);

  return {
    editRowId,
    editValues,
    validationErrors,
    handleRowDoubleClick,
    handleEditChange,
    handleEditCancel,
    handleEditSave,
  };
}
