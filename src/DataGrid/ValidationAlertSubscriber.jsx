import React, { useContext } from 'react';
import { useSyncExternalStore } from 'react';
import { DataGridStableContext } from './DataGridContext';
import { ValidationAlert } from '../validation/ValidationAlert';

/**
 * Subscribes to edit store and renders ValidationAlert when there are validation errors.
 */
export function ValidationAlertSubscriber() {
  const ctx = useContext(DataGridStableContext);
  const editStore = ctx?.editStore;

  const errors = useSyncExternalStore(
    editStore?.subscribe ?? (() => () => {}),
    () => editStore?.getSnapshot?.()?.validationErrors ?? null,
    () => null
  );

  if (!errors?.length) return null;
  return <ValidationAlert errors={errors} />;
}
