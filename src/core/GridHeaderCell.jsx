import React, { useContext } from 'react';
import { TableCell, TableSortLabel, Box, Tooltip } from '@mui/material';
import { SORT_ORDER_ASC, SORT_ORDER_DESC, ALIGN_LEFT, ALIGN_RIGHT } from '../config/schema';
import { DataGridStableContext } from '../DataGrid/DataGridContext';
import { useTranslations } from '../localization/useTranslations';


/**
 * @param {Object} props
 * @param {Object} props.column
 * @param {Array<{ field: string, order: string }>} props.sortModel
 * @param {Function} props.onSort
 * @param {React.ReactNode} [props.headerComboSlot] Combo/operator next to label
 * @param {React.ReactNode} [props.filterSlot] Filter inputs row (below)
 * @param {number} [props.sortOrderIndex] 1-based index in sort order
 */
export function GridHeaderCell({
  column,
  sortModel,
  onSort,
  headerComboSlot,
  filterSlot,
  sortOrderIndex,
}) {
  const ctx = useContext(DataGridStableContext);
  const t = useTranslations();
  const direction = ctx?.direction ?? 'ltr';
  const headerStyle = ctx?.headerStyle;
  const headerConfig = ctx?.headerConfig;
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
  const multiColumn = sortModel?.length > 1;

  const handleSortClick = (event) => {
    const multiColumn = event.ctrlKey || event.metaKey;
    onSort(column.field, multiColumn);
  };

  return (
    <TableCell align={align} padding="none" variant="head" sx={cellSx}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', py: mainRowHeight ? 0 : 0.5, boxSizing: 'border-box', height: '100%' }}>
        <Tooltip title={t('sortMultiColumnHint')}>
          <TableSortLabel
            active={!!sortDir}
            direction={order}
            onClick={handleSortClick}
            sx={{ minHeight: 20 }}
          >
            {column.headerName}          
          </TableSortLabel>
        </Tooltip>
        {sortOrderIndex != null && multiColumn && (
              <Box component="span" sx={{ ml: 0.25, fontSize: '0.75rem', opacity: 0.8 }}>
                {`(${sortOrderIndex})`}
              </Box>
            )}
        {headerComboSlot != null && headerComboSlot}        
      </Box>
      {filterSlot != null && <Box sx={FILTER_ROW_BOX_SX}>{filterSlot}</Box>}
    </TableCell>
  );
}


