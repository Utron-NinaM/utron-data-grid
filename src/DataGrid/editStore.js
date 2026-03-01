/**
 * External store for inline edit state.
 * Used with useSyncExternalStore so only subscribing components re-render.
 * validationState = { rowErrors: {} } (Option A); hasErrors derived when reading.
 * rowErrors[rowId][field] = array of { field, message, severity }.
 */

/** Stable object returned by selector when row is not editing. */
export const NOT_EDITING = Object.freeze({ isEditing: false });

/**
 * Returns { [editRowId]: { [field]: errors[] } } for merging into rowErrors. Do not replace entire rowErrors.
 * @param {string|number} editRowId
 * @param {Array<{ field: string, message: string, severity: string }>} errors
 */
export function toRowErrors(editRowId, errors) {
  if (!errors?.length) return {};
  const byField = {};
  for (const e of errors) {
    if (!byField[e.field]) byField[e.field] = [];
    byField[e.field].push(e);
  }
  return { [editRowId]: byField };
}

export function createEditStore() {
  let state = {
    editRowId: null,
    mode: null, // 'create' | 'update'
    editValues: null,
    originalRow: null,
    validationState: { rowErrors: {} },
    /** Cached { isEditing: true, editValues } for the editing row. */
    editStateForRow: null,
  };

  const listeners = new Set();
  const notify = () => listeners.forEach((l) => l());

  function getCellError(rowId, field) {
    const rowErrs = state.validationState.rowErrors[rowId];
    return rowErrs?.[field] ?? [];
  }

  function hasRowError(rowId) {
    const rowErrs = state.validationState.rowErrors[rowId];
    return rowErrs ? Object.keys(rowErrs).length > 0 : false;
  }

  function clearValidation() {
    state = {
      ...state,
      validationState: { rowErrors: {} },
    };
    updateEditStateForRow();
    notify();
  }

  /** Remove errors for (rowId, field) only. Immutable update. */
  function clearFieldError(rowId, field) {
    const rowErrs = state.validationState.rowErrors[rowId];
    if (!rowErrs || !(field in rowErrs)) return;
    const nextRow = { ...rowErrs };
    delete nextRow[field];
    const nextRowErrors =
      Object.keys(nextRow).length === 0
        ? (() => {
            const o = { ...state.validationState.rowErrors };
            delete o[rowId];
            return o;
          })()
        : { ...state.validationState.rowErrors, [rowId]: nextRow };
    state = {
      ...state,
      validationState: { rowErrors: nextRowErrors },
    };
    updateEditStateForRow();
    notify();
  }

  /**
   * Set errors for (rowId, field) only (strict field merge). Empty array = remove field.
   * Immutable: new validationState, new rowErrors, new row object, new arrays.
   */
  function setFieldErrors(rowId, field, errors) {
    const prevRow = state.validationState.rowErrors[rowId];
    const nextRow =
      prevRow == null
        ? errors.length ? { [field]: errors.slice() } : null
        : (() => {
            const n = { ...prevRow };
            if (errors.length) n[field] = errors.slice();
            else delete n[field];
            return Object.keys(n).length ? n : null;
          })();
    const nextRowErrors =
      nextRow == null
        ? (() => {
            const o = { ...state.validationState.rowErrors };
            delete o[rowId];
            return o;
          })()
        : { ...state.validationState.rowErrors, [rowId]: nextRow };
    state = {
      ...state,
      validationState: { rowErrors: nextRowErrors },
    };
    updateEditStateForRow();
    notify();
  }

  /** Merge slice into rowErrors (e.g. from toRowErrors). Preserves other rowIds. */
  function mergeRowErrors(mergeSlice) {
    if (!mergeSlice || Object.keys(mergeSlice).length === 0) return;
    const next = { ...state.validationState.rowErrors };
    for (const [rid, rowObj] of Object.entries(mergeSlice)) {
      next[rid] = { ...(next[rid] ?? {}), ...rowObj };
    }
    state = {
      ...state,
      validationState: { rowErrors: next },
    };
    updateEditStateForRow();
    notify();
  }

  function updateEditStateForRow() {
    if (state.editRowId == null) {
      state = { ...state, editStateForRow: null };
      return;
    }
    state = {
      ...state,
      editStateForRow: {
        isEditing: true,
        editValues: state.editValues ?? {},
        rowErrorsForRow: state.validationState.rowErrors[state.editRowId] ?? null,
      },
    };
  }

  return {
    getSnapshot: () => state,
    subscribe: (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    getCellError,
    hasRowError,
    clearValidation,
    clearFieldError,
    setFieldErrors,
    mergeRowErrors,

    setEditRowId(id) {
      if (state.editRowId === id) return;
      state = { ...state, editRowId: id };
      clearValidation();
      updateEditStateForRow();
      notify();
    },

    setEditValues(values) {
      state = { ...state, editValues: values };
      updateEditStateForRow();
      notify();
    },

    setOriginalRow(row) {
      state = { ...state, originalRow: row };
      notify();
    },

    /** Set all edit state; clears validation (edit start). */
    startEdit(id, row) {
      if (state.editRowId === id) return;
      state = {
        ...state,
        editRowId: id,
        mode: 'update',
        editValues: row ? { ...row } : null,
        originalRow: row ?? null,
        validationState: { rowErrors: {} },
      };
      updateEditStateForRow();
      notify();
    },

    /** Start edit for new row (placeholder); originalRow null. */
    startNewRowEdit(id) {
      if (state.editRowId === id) return;
      state = {
        ...state,
        editRowId: id,
        mode: 'create',
        editValues: {},
        originalRow: null,
        validationState: { rowErrors: {} },
      };
      updateEditStateForRow();
      notify();
    },

    clearEdit() {
      state = {
        editRowId: null,
        mode: null,
        editValues: null,
        originalRow: null,
        validationState: { rowErrors: {} },
        editStateForRow: null,
      };
      notify();
    },
  };
}
