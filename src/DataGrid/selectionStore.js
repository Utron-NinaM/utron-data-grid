/**
 * External store for single-row selection (click-to-select).
 * Used with useSyncExternalStore so only subscribing components re-render when selection changes.
 * @param {string|number|null} [initialId]
 * @returns {{ getSnapshot: () => string|number|null, subscribe: (fn: () => void) => () => void, set: (id: string|number|null) => void }}
 */
export function createSelectionStore(initialId = null) {
  let currentId = initialId;
  const listeners = new Set();

  return {
    getSnapshot: () => currentId,

    subscribe: (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },

    set: (id) => {
      if (currentId === id) return;
      currentId = id;
      listeners.forEach((l) => l());
    },
  };
}
