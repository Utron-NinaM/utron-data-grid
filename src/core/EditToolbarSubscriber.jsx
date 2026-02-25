import React, { useContext } from 'react';
import { useSyncExternalStore } from 'react';
import Box from '@mui/material/Box';
import { DataGridStableContext } from '../DataGrid/DataGridContext';
import { EditToolbar } from '../DataGrid/EditToolbar';

/**
 * Subscribes to edit store and renders EditToolbar when a row is in edit mode.
 * Re-renders only when editRowId changes, not when GridTable re-renders.
 * @param {number} [reserveSpaceHeight] When set and not editing, render a spacer Box with this height to reserve layout space.
 */
export function EditToolbarSubscriber({ reserveSpaceHeight }) {
  const ctx = useContext(DataGridStableContext);
  const editStore = ctx?.editStore;
  const onSave = ctx?.handleEditSave;
  const onCancel = ctx?.handleEditCancel;

  const editRowId = useSyncExternalStore(
    editStore?.subscribe ?? (() => () => {}),
    () => editStore?.getSnapshot?.()?.editRowId ?? null,
    () => null
  );
  
  if (editRowId == null) {
    if (reserveSpaceHeight != null) {
      return <Box component="span" sx={{ display: 'block', height: reserveSpaceHeight }} aria-hidden />;
    }
    return null;
  }
  return <EditToolbar onSave={onSave} onCancel={onCancel} />;
}
