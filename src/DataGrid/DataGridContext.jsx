import { createContext } from 'react';
import { defaultTranslations } from '../localization/defaultTranslations';

export const DataGridContext = createContext(null);

/**
 * @param {Object} value
 * @param {import('../config/schema').ColumnDef[]} value.columns
 * @param {Object} value.translations
 * @param {Object} value.defaultTranslations
 * @param {'ltr'|'rtl'} value.direction
 * @param {Function} value.getRowId
 * @param {Function} [value.onSortChange]
 * @param {Function} [value.onFilterChange]
 * @param {Function} [value.onEditCommit]
 * @param {Function} [value.onSelectionChange]
 * @param {Function} [value.onPageChange]
 * @param {Function} [value.onPageSizeChange]
 * @param {boolean} value.editable
 * @param {boolean} value.selectable
 * @param {Object} value.theme
 */
export function DataGridProvider({ value, children }) {
  const merged = {
    defaultTranslations,
    ...value,
  };
  return (
    <DataGridContext.Provider value={merged}>
      {children}
    </DataGridContext.Provider>
  );
}
