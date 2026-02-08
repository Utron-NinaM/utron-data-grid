import React from 'react';
import { Table, TableBody, TableContainer, TableHead, TableRow, TableCell, Paper, Box, Button } from '@mui/material';
import { useTranslations } from '../localization/useTranslations';
import { GridHeaderCell, GridHeaderCellFilter } from './GridHeaderCell';
import { GridBodyRow } from './GridBodyRow';
import { ALIGN_CENTER } from '../config/schema';
import { useDataGridContext } from '../DataGrid/useDataGridContext';

/**
 * @param {Object} props
 * @param {Object[]} props.columns
 * @param {Object[]} props.rows
 * @param {Function} props.getRowId
 * @param {boolean} props.selectable
 * @param {Set<string|number>} props.selection
 * @param {Function} props.onSelect
 * @param {Array<{ field: string, order: string }>} props.sortModel
 * @param {Function} props.onSort
 * @param {Function} props.onClearSort
 * @param {Function} [props.onClearAllFilters]
 * @param {boolean} [props.hasActiveFilters]
 * @param {string|number|null} props.editRowId
 * @param {Object} props.editValues
 * @param {Function} props.getEditor
 * @param {Set<string>} props.validationErrors
 * @param {Function} [props.getHeaderComboSlot]
 * @param {Function} [props.getFilterInputSlot]
 * @param {Function} [props.getFilterToInputSlot]
 * @param {Function} [props.onRowDoubleClick]
 */
export function GridTable({
  columns,
  rows,
  getRowId,
  selectable,
  selection,
  onSelect,
  sortModel,
  onSort,
  onClearSort,
  onClearAllFilters,
  hasActiveFilters,
  editRowId,
  editValues,
  getEditor,
  validationErrors,
  getHeaderComboSlot,
  getFilterInputSlot,
  getFilterToInputSlot,
  onRowDoubleClick,
}) {
  const sortModelLength = sortModel?.length ?? 0;
  const t = useTranslations();
  const ctx = useDataGridContext();
  const direction = ctx?.direction ?? 'ltr';

  return (
    <>
      {(onClearSort || onClearAllFilters) && (
        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
          {onClearSort && (
            <Button size="small" variant="outlined" onClick={onClearSort} disabled={sortModelLength === 0}>
              {t('clearSort')}
            </Button>
          )}
          {onClearAllFilters && (
            <Button size="small" variant="outlined" onClick={onClearAllFilters} disabled={!hasActiveFilters}>
              {t('clearAllFilters')}
            </Button>
          )}
        </Box>
      )}
      <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto', width: '100%' }}>
        <Table size="small" stickyHeader aria-label="Data grid" sx={{ width: '100%' }}>
          <TableHead>
            <TableRow>
              {selectable && <TableCell padding="checkbox" />}
              {columns.map((col, idx) => (
                <GridHeaderCell
                  key={col.field}
                  column={col}
                  sortModel={sortModel}
                  onSort={onSort}
                  showClearSort={idx === 0 && sortModelLength > 0}
                  onClearSort={onClearSort}
                  headerComboSlot={getHeaderComboSlot ? getHeaderComboSlot(col) : null}
                  filterSlot={getFilterInputSlot && !getFilterToInputSlot ? getFilterInputSlot(col) : null}
                  sortOrderIndex={
                    sortModel?.findIndex((s) => s.field === col.field) >= 0
                      ? sortModel.findIndex((s) => s.field === col.field) + 1
                      : undefined
                  }
                />
              ))}
            </TableRow>
            {getFilterInputSlot && getFilterToInputSlot && (
              <TableRow>
                {selectable && <TableCell padding="checkbox" variant="head" />}
                {columns.map((col) => (
                  <GridHeaderCellFilter
                    key={col.field}
                    column={col}
                    slot={getFilterInputSlot(col)}
                  />
                ))}
              </TableRow>
            )}
            {getFilterToInputSlot && (
              <TableRow>
                {selectable && <TableCell padding="checkbox" variant="head" />}
                {columns.map((col) => (
                  <GridHeaderCellFilter
                    key={col.field}
                    column={col}
                    slot={getFilterToInputSlot(col)}
                  />
                ))}
              </TableRow>
            )}
          </TableHead>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length + (selectable ? 1 : 0)} align={ALIGN_CENTER}>
                {t('noRows')}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => {
              const rowId = getRowId(row);
              const rowSx = columns.reduce(
                (acc, col) =>
                  typeof col.rowStyle === 'function' ? { ...acc, ...col.rowStyle(row) } : acc,
                {}
              );
              return (
                <GridBodyRow
                  key={rowId}
                  row={row}
                  columns={columns}
                  rowId={rowId}
                  selectable={selectable}
                  selected={selection?.has(rowId)}
                  onSelect={onSelect}
                  editRowId={editRowId}
                  editValues={editValues}
                  getEditor={getEditor}
                  validationErrors={validationErrors}
                  onRowDoubleClick={onRowDoubleClick}
                  rowSx={Object.keys(rowSx).length ? rowSx : undefined}
                />
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
    </>
  );
}
