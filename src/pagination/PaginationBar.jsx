import React from 'react';
import { Box, Select, MenuItem, Typography } from '@mui/material';
import { useTranslations } from '../localization/useTranslations';
import { PaginationIcons } from '../core/GridHeaderCell';
import { useDataGridContext } from '../DataGrid/useDataGridContext';

/**
 * RTL-aware: First/Prev and Next/Last swap sides in RTL; use translations for labels.
 */
export function PaginationBar({
  page,
  pageSize,
  totalRows,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
}) {
  const t = useTranslations();
  const ctx = useDataGridContext();
  const direction = ctx?.direction ?? 'ltr';
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const from = totalRows === 0 ? 0 : page * pageSize + 1;
  const to = Math.min((page + 1) * pageSize, totalRows);

  const firstDisabled = page <= 0;
  const prevDisabled = page <= 0;
  const nextDisabled = page >= totalPages - 1;
  const lastDisabled = page >= totalPages - 1;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 1,
        py: 1,
        px: 0.5,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" component="span">
          {t('rowsPerPage')}
        </Typography>
        <Select
          size="small"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          sx={{ minWidth: 64 }}
          variant="outlined"
        >
          {pageSizeOptions.map((n) => (
            <MenuItem key={n} value={n}>
              {n}
            </MenuItem>
          ))}
        </Select>
      </Box>
      <Typography variant="body2">
        {t('paginationRange', { from, to, count: totalRows })}
      </Typography>
      <PaginationIcons
        onFirstPage={() => onPageChange(0)}
        onPrevPage={() => onPageChange(page - 1)}
        onNextPage={() => onPageChange(page + 1)}
        onLastPage={() => onPageChange(totalPages - 1)}
        firstDisabled={firstDisabled}
        prevDisabled={prevDisabled}
        nextDisabled={nextDisabled}
        lastDisabled={lastDisabled}
      />
    </Box>
  );
}
