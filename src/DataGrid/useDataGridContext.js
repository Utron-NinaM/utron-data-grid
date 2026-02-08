import { useContext } from 'react';
import { DataGridContext } from './DataGridContext';

/**
 * @returns {import('./DataGridContext').DataGridContextValue | null}
 */
export function useDataGridContext() {
  return useContext(DataGridContext);
}
