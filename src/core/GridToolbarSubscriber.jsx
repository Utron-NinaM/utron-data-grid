import React, { useSyncExternalStore, useMemo, useContext } from 'react';
import { DataGridStableContext } from '../DataGrid/DataGridContext';

/**
 * Subscribes to selection store and renders toolbar actions with current selectedRow/selectedRowId.
 * Re-renders only when selection changes, not when GridTable re-renders.
 *
 * @param {Object} props
 * @param {Object[]} props.rows
 * @param {Function} props.getRowId
 */
export function GridToolbarSubscriber({ rows, getRowId }) {
  const ctx = useContext(DataGridStableContext);
  const { selectionStore, toolbarActions } = ctx || {};

  const selectedId = useSyncExternalStore(
    selectionStore?.subscribe ?? (() => () => {}),
    selectionStore?.getSnapshot ?? (() => null),
    () => null
  );

  const selectedRow = useMemo(() => {
    if (selectedId == null) return null;
    return rows.find((r) => getRowId(r) === selectedId) ?? null;
  }, [selectedId, rows, getRowId]);

  if (toolbarActions == null) return null;
  if (typeof toolbarActions === 'function') {
    return toolbarActions({ selectedRow, selectedRowId: selectedId });
  }
  return toolbarActions;
}
