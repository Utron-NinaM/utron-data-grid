import { createContext } from 'react';
import { defaultTranslations } from '../localization/defaultTranslations';
import { DIRECTION_LTR, DIRECTION_RTL } from '../config/schema';

// Stable context - contains values that rarely change (config, callbacks, styles)
export const DataGridStableContext = createContext(null);

// Filter context - contains filter-related functions that change when filterModel changes
export const DataGridFilterContext = createContext(null);

// When containScroll is used, GridTable provides the scroll container ref so cell tooltips can mount inside it
export const ScrollContainerContext = createContext(null);

/**
 * @param {Object} stableValue Stable values that rarely change
 * @param {import('../config/schema').ColumnDef[]} stableValue.columns
 * @param {Object} stableValue.translations
 * @param {DIRECTION_LTR|DIRECTION_RTL} stableValue.direction
 * @param {Function} stableValue.getRowId
 * @param {Function} [stableValue.onSortChange]
 * @param {Function} [stableValue.onFilterChange]
 * @param {Function} [stableValue.onEditCommit]
 * @param {Function} [stableValue.onSelectionChange]
 * @param {Function} [stableValue.onPageChange]
 * @param {Function} [stableValue.onPageSizeChange]
 * @param {boolean} stableValue.editable
 * @param {boolean} stableValue.multiSelectable
 * @param {Function} [stableValue.onRowSelect]
 * @param {Function} [stableValue.getEditor]
 * @param {Function} [stableValue.onClearSort]
 * @param {Function} [stableValue.onClearAllFilters]
 * @param {Object} [stableValue.selectedRowStyle] MUI sx object for selected rows
 * @param {Object} [stableValue.headerConfig] Header configuration object (base, mainRow, filterRows, filterCells)
 * @param {number|string} [stableValue.filterInputHeight]
 * @param {Map<string, string>} [stableValue.columnWidthMap] Map of field -> normalized width string
 * @param {{ current: string|null }} [stableValue.resizingColumnRef] Ref whose .current is the column field being resized, or null
 * @param {React.ReactNode|Function} [stableValue.toolbarActions] Optional slot for right side of toolbar row (ReactNode or (params: { selectedRow, selectedRowId }) => ReactNode)
 * @param {Object} filterValue Filter-related functions that change with filterModel
 * @param {Function} [filterValue.getHeaderComboSlot]
 * @param {Function} [filterValue.getFilterInputSlot]
 * @param {Function} [filterValue.getFilterToInputSlot]
 */
export function DataGridProvider({ stableValue, filterValue, children }) {
  const stableMerged = {
    defaultTranslations,
    ...stableValue,
  };
  
  return (
    <DataGridStableContext.Provider value={stableMerged}>
      <DataGridFilterContext.Provider value={filterValue || null}>
        {children}
      </DataGridFilterContext.Provider>
    </DataGridStableContext.Provider>
  );
}
