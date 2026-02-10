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
 * @param {boolean} value.multiSelectable
 * @param {Object} value.theme
 * @param {Function} [value.onRowSelect]
 * @param {Function} [value.getEditor]
 * @param {Function} [value.getHeaderComboSlot]
 * @param {Function} [value.getFilterInputSlot]
 * @param {Function} [value.getFilterToInputSlot]
 * @param {Function} [value.onClearSort]
 * @param {Function} [value.onClearAllFilters]
 * @param {Object} [value.selectedRowStyle] MUI sx object for selected rows
 * @param {Object} [value.headerStyle] MUI sx object for TableHead
 * @param {Object} [value.headerConfig] Header configuration object
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
