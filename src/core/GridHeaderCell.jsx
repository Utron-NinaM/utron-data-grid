import React, { useContext, useMemo } from 'react';
import { TableCell, TableSortLabel, Box, Tooltip } from '@mui/material';
import { SORT_ORDER_ASC, SORT_ORDER_DESC, ALIGN_LEFT } from '../config/schema';
import { DataGridStableContext } from '../DataGrid/DataGridContext';
import { useTranslations } from '../localization/useTranslations';
import { getFilterRowBoxSx } from '../utils/filterBoxStyles';

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
  const headerConfig = ctx?.headerConfig;
  const filterInputHeight = ctx?.filterInputHeight;
  const columnAlignMap = ctx?.columnAlignMap;
  const columnSortDirMap = ctx?.columnSortDirMap;
  const headerCellSxMap = ctx?.headerCellSxMap;
  
  // Use pre-computed values from context
  const align = columnAlignMap?.get(column.field) ?? (column.align ?? ALIGN_LEFT);
  const sortOrder = columnSortDirMap?.get(column.field);
  const sortDir = sortOrder ? { field: column.field, order: sortOrder } : null;
  const order = sortOrder === SORT_ORDER_ASC ? SORT_ORDER_ASC : SORT_ORDER_DESC;
  const cellSx = headerCellSxMap?.get(column.field);
  const mainRowHeight = headerConfig?.mainRow?.height;
  const multiColumn = sortModel?.length > 1;
  const filterBoxSx = useMemo(() => getFilterRowBoxSx(filterInputHeight), [filterInputHeight]); 

  const handleSortClick = (event) => {
    const multiColumn = event.ctrlKey || event.metaKey;
    onSort(column.field, multiColumn);
  };

  return (
    <TableCell align={align} padding="none" variant="head" sx={{ paddingLeft: '4px', paddingRight: '4px', ...cellSx }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: headerComboSlot ? 'nowrap' : 'wrap', py: mainRowHeight ? 0 : 0.5, boxSizing: 'border-box', height: '100%' }}>
        <Tooltip title={t('sortMultiColumnHint')}>
          <TableSortLabel
            active={!!sortDir}
            direction={order}
            onClick={handleSortClick}
            sx={{ minHeight: 20, flex: headerComboSlot ? 1 : 'none', minWidth: 0, overflow: 'hidden' }}
          >
            <Box
              component="span"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'block',
                width: '100%',
              }}
            >
              {column.headerName}
            </Box>
          </TableSortLabel>
        </Tooltip>
        {sortOrderIndex != null && multiColumn && (
              <Box component="span" sx={{ ml: 0.25, fontSize: '0.75rem', opacity: 0.8, flexShrink: 0 }}>
                {`(${sortOrderIndex})`}
              </Box>
            )}
        {headerComboSlot != null && <Box sx={{ flexShrink: 0 }}>{headerComboSlot}</Box>}        
      </Box>
      {filterSlot != null && <Box sx={filterBoxSx}>{filterSlot}</Box>}
    </TableCell>
  );
}


