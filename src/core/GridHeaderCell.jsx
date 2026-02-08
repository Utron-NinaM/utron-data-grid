import React from 'react';
import { TableCell, TableSortLabel, IconButton, Box } from '@mui/material';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ClearIcon from '@mui/icons-material/Clear';
import { SORT_ORDER_ASC, SORT_ORDER_DESC, ALIGN_LEFT, ALIGN_RIGHT } from '../config/schema';

const FILTER_ROW_BOX_SX = {
  width: '100%',
  maxWidth: '100%',
  boxSizing: 'border-box',
  px: 0.5,
  minHeight: 40,
  display: 'flex',
  alignItems: 'center',
  overflow: 'hidden',
};

/**
 * Filter or "to" row cell: full width slot with consistent padding/alignment.
 */
export function GridHeaderCellFilter({ column, direction, slot }) {
  const align = column.align ?? (direction === 'rtl' ? ALIGN_RIGHT : ALIGN_LEFT);
  return (
    <TableCell align={align} padding="none" variant="head" sx={{ verticalAlign: 'top', padding: '4px', width: 'inherit', maxWidth: 'inherit', overflow: 'hidden' }}>
      {slot != null ? (
        <Box sx={FILTER_ROW_BOX_SX}>{slot}</Box>
      ) : (
        <Box sx={{ ...FILTER_ROW_BOX_SX, minHeight: 0 }} />
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
 * @param {'ltr'|'rtl'} props.direction
 * @param {React.ReactNode} [props.headerComboSlot] Combo/operator next to label
 * @param {React.ReactNode} [props.filterSlot] Filter inputs row (below)
 * @param {number} [props.sortOrderIndex] 1-based index in sort order
 */
export function GridHeaderCell({
  column,
  sortModel,
  onSort,
  showClearSort,
  onClearSort,
  direction,
  headerComboSlot,
  filterSlot,
  sortOrderIndex,
}) {
  const align = column.align ?? (direction === 'rtl' ? ALIGN_RIGHT : ALIGN_LEFT);
  const sortDir = sortModel?.find((s) => s.field === column.field);
  const order = sortDir?.order === SORT_ORDER_ASC ? SORT_ORDER_ASC : SORT_ORDER_DESC;

  return (
    <TableCell align={align} padding="none" variant="head" sx={{ verticalAlign: 'top', padding: '4px', width: 'inherit', maxWidth: 'inherit', overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', py: 0.5 }}>
        <TableSortLabel
          active={!!sortDir}
          direction={order}
          onClick={() => onSort(column.field)}
          sx={{ minHeight: 32 }}
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

export function PaginationIcons({ direction, onFirstPage, onPrevPage, onNextPage, onLastPage, firstDisabled, prevDisabled, nextDisabled, lastDisabled }) {
  const isRtl = direction === 'rtl';
  return (
    <Box sx={{ display: 'flex' }}>
      <IconButton onClick={onFirstPage} disabled={firstDisabled} size="small" aria-label="First page">
        {isRtl ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton onClick={onPrevPage} disabled={prevDisabled} size="small" aria-label="Previous page">
        <ChevronLeftIcon />
      </IconButton>
      <IconButton onClick={onNextPage} disabled={nextDisabled} size="small" aria-label="Next page">
        <ChevronRightIcon />
      </IconButton>
      <IconButton onClick={onLastPage} disabled={lastDisabled} size="small" aria-label="Last page">
        {isRtl ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </Box>
  );
}
