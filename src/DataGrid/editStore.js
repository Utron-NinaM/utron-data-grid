/**
 * External store for inline edit state.
 * Used with useSyncExternalStore so only subscribing components (e.g. the editing row, toolbar) re-render.
 * Snapshot is immutable; setters replace state so reference changes only when store updates.
 * editStateForRow is a single cached object for the editing row so selectors return stable references.
 */

/** Stable object returned by selector when row is not editing (shared reference for all non-edit rows). */
export const NOT_EDITING = Object.freeze({ isEditing: false });

function errorsToSet(errors) {
  return errors?.length ? new Set(errors.map((e) => e.field)) : new Set();
}

export function createEditStore() {
  let state = {
    editRowId: null,
    editValues: null,
    validationErrors: null,
    originalRow: null,
    /** Cached { isEditing: true, editValues, validationErrors } for the editing row; replaced when store updates so selectors get stable ref. */
    editStateForRow: null,
  };

  const listeners = new Set();

  const notify = () => {
    listeners.forEach((l) => l());
  };

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
        validationErrors: errorsToSet(state.validationErrors),
      },
    };
  }

  return {
    getSnapshot: () => state,

    subscribe: (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },

    setEditRowId(id) {
      if (state.editRowId === id) return;
      state = { ...state, editRowId: id };
      updateEditStateForRow();
      notify();
    },

    setEditValues(values) {
      state = { ...state, editValues: values };
      updateEditStateForRow();
      notify();
    },

    setValidationErrors(errors) {
      state = { ...state, validationErrors: errors };
      updateEditStateForRow();
      notify();
    },

    setOriginalRow(row) {
      state = { ...state, originalRow: row };
      notify();
    },

    /** Set all edit state and notify once (avoids 4 notify rounds on double-click). */
    startEdit(id, row) {
      if (state.editRowId === id) return;
      state = {
        ...state,
        editRowId: id,
        editValues: row ? { ...row } : null,
        originalRow: row ?? null,
        validationErrors: null,
      };
      updateEditStateForRow();
      notify();
    },

    clearEdit() {
      state = {
        editRowId: null,
        editValues: null,
        validationErrors: null,
        originalRow: null,
        editStateForRow: null,
      };
      notify();
    },
  };
}
