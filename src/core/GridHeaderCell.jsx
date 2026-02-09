import React from 'react';
import { TableCell, TableSortLabel, IconButton, Box } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import { SORT_ORDER_ASC, SORT_ORDER_DESC, ALIGN_LEFT, ALIGN_RIGHT } from '../config/schema';
import { useDataGridContext } from '../DataGrid/useDataGridContext';

const getFilterRowBoxSx = (filterInputHeight) => ({
  width: '100%',
  maxWidth: '100%',
  boxSizing: 'border-box',
  px: 0.5,
  minHeight: 20,
  display: 'flex',
  alignItems: 'center',
  overflow: 'hidden',
  ...(filterInputHeight && { height: filterInputHeight, maxHeight: filterInputHeight }),
  '& .MuiInputBase-root': filterInputHeight ? { height: filterInputHeight, minHeight: filterInputHeight, maxHeight: filterInputHeight } : {},
  '& .MuiInputBase-input': filterInputHeight ? { height: '100%', padding: '4px 8px' } : {},
});

/**
 * Filter or "to" row cell: full width slot with consistent padding/alignment.
 * @param {Object} [props.headerStyle] MUI sx object for header styling
 * @param {Object} [props.headerConfig] Header configuration object
 * @param {Object} [props.headerConfig.filterCells] Filter cells styles { backgroundColor?: string, height?: string|number }
 */
export function GridHeaderCellFilter({ column, slot, headerStyle, headerConfig }) {
  const ctx = useDataGridContext();
  const direction = ctx?.direction ?? 'ltr';
  const align = column.align ?? (direction === 'rtl' ? ALIGN_RIGHT : ALIGN_LEFT);
  const filterRowHeight = headerConfig?.filterRows?.height || headerConfig?.filterCells?.height;
  const filterInputHeight = ctx?.filterInputHeight;
  const cellSx = {
    verticalAlign: 'top',
    padding: filterRowHeight ? '2px' : '4px',
    width: 'inherit',
    maxWidth: 'inherit',
    overflow: 'hidden',
    boxSizing: 'border-box',
    ...(headerConfig?.filterCells?.backgroundColor && { backgroundColor: headerConfig.filterCells.backgroundColor }),
    ...(filterRowHeight && { height: filterRowHeight, maxHeight: filterRowHeight }),
    ...headerStyle,
  };
  const filterBoxSx = getFilterRowBoxSx(filterInputHeight);
  return (
    <TableCell align={align} padding="none" variant="head" sx={cellSx}>
      {slot != null ? (
        <Box sx={filterBoxSx}>{slot}</Box>
      ) : (
        <Box sx={{ ...filterBoxSx, minHeight: 0 }} />
      )}
    </TableCell>
  );
}

/**
 * @param {Object} props
 * @param {Object} props.column
 * @param {Array<{ field: string, order: string }>} props.sortModel
 * @param {Function} props.onSort
 * @param {boolean} [props.showClearSort]
 * @param {Function} props.onClearSort
 * @param {React.ReactNode} [props.headerComboSlot] Combo/operator next to label
 * @param {React.ReactNode} [props.filterSlot] Filter inputs row (below)
 * @param {number} [props.sortOrderIndex] 1-based index in sort order
 * @param {Object} [props.headerStyle] MUI sx object for header styling
 * @param {Object} [props.headerConfig] Header configuration object
 * @param {Object} [props.headerConfig.mainRow] Main row styles { backgroundColor?: string, height?: string|number }
 */
export function GridHeaderCell({
  column,
  sortModel,
  onSort,
  showClearSort,
  onClearSort,
  headerComboSlot,
  filterSlot,
  sortOrderIndex,
  headerStyle,
  headerConfig,
}) {
  const ctx = useDataGridContext();
  const direction = ctx?.direction ?? 'ltr';
  const align = column.align ?? (direction === 'rtl' ? ALIGN_RIGHT : ALIGN_LEFT);
  const sortDir = sortModel?.find((s) => s.field === column.field);
  const order = sortDir?.order === SORT_ORDER_ASC ? SORT_ORDER_ASC : SORT_ORDER_DESC;
  const mainRowHeight = headerConfig?.mainRow?.height;
  const cellSx = {
    verticalAlign: 'top',
    padding: mainRowHeight ? '2px' : '4px',
    width: 'inherit',
    maxWidth: 'inherit',
    overflow: 'hidden',
    boxSizing: 'border-box',
    ...(headerConfig?.mainRow?.backgroundColor && { backgroundColor: headerConfig.mainRow.backgroundColor }),
    ...(mainRowHeight && { height: mainRowHeight, maxHeight: mainRowHeight }),
    ...headerStyle,
  };

  return (
    <TableCell align={align} padding="none" variant="head" sx={cellSx}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', py: mainRowHeight ? 0 : 0.5, boxSizing: 'border-box', height: '100%' }}>
        <TableSortLabel
          active={!!sortDir}
          direction={order}
          onClick={() => onSort(column.field)}
          sx={{ minHeight: 20 }}
        >
          {column.headerName}
          {sortOrderIndex != null && (
            <Box component="span" sx={{ ml: 0.25, fontSize: '0.75rem', opacity: 0.8 }}>
              {sortOrderIndex}
            </Box>
          )}
        </TableSortLabel>
        {headerComboSlot != null && headerComboSlot}
        {showClearSort && sortModel?.length > 0 && (
          <IconButton size="small" onClick={onClearSort} aria-label="Clear sort">
            <ClearIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
      {filterSlot != null && <Box sx={FILTER_ROW_BOX_SX}>{filterSlot}</Box>}
    </TableCell>
  );
}


