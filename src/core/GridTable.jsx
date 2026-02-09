import React from 'react';
import { Table, TableBody, TableContainer, TableHead, TableRow, TableCell, Paper, Box, Button } from '@mui/material';
import { useTranslations } from '../localization/useTranslations';
import { useDataGridContext } from '../DataGrid/useDataGridContext';
import { GridHeaderCell, GridHeaderCellFilter } from './GridHeaderCell';
import { GridBodyRow } from './GridBodyRow';
import { ALIGN_CENTER } from '../config/schema';

/**
 * @param {Object} props
 * @param {Object[]} props.rows
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
 * @param {Function} [props.onRowClick]
 * @param {Function} [props.onRowDoubleClick]
 * @param {string|number|null} [props.selectedRowId]
 * @param {Object} [props.selectedRowStyle] MUI sx object for selected rows
 * @param {Object} [props.editedRowStyle] MUI sx object for rows being edited
 * @param {Object} [props.headerStyle] MUI sx object for TableHead
 * @param {Object} [props.headerConfig] Header configuration object
 * @param {Object} [props.headerConfig.mainRow] Main row styles { backgroundColor?: string, height?: string|number }
 * @param {Object} [props.headerConfig.filterRows] Filter rows styles { backgroundColor?: string, height?: string|number }
 * @param {Object} [props.headerConfig.filterCells] Filter cells styles { backgroundColor?: string, height?: string|number }
 * @param {boolean} [props.hasActiveRangeFilter] Whether any column has an active range filter
 */
export function GridTable({
  rows,
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
  onRowClick,
  onRowDoubleClick,
  selectedRowId,
  selectedRowStyle,
  editedRowStyle,
  headerStyle,
  headerConfig,
  hasActiveRangeFilter,
}) {
  const translations = useTranslations();
  const ctx = useDataGridContext();
  const { columns, getRowId, multiSelectable } = ctx;
  const sortModelLength = sortModel?.length ?? 0;

  return (
    <>
      {(onClearSort || onClearAllFilters) && (
        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
          {onClearSort && (
            <Button size="small" variant="outlined" onClick={onClearSort} disabled={sortModelLength === 0}>
              {translations('clearSort')}
            </Button>
          )}
          {onClearAllFilters && (
            <Button size="small" variant="outlined" onClick={onClearAllFilters} disabled={!hasActiveFilters}>
              {translations('clearAllFilters')}
            </Button>
          )}
        </Box>
      )}
      <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto', width: '100%' }}>
        <Table size="small" stickyHeader aria-label="Data grid" sx={{ width: '100%' }}>
          <TableHead sx={headerStyle}>
            <TableRow
              sx={{
                ...(headerConfig?.mainRow?.backgroundColor && { backgroundColor: headerConfig.mainRow.backgroundColor }),
              }}
            >
              {multiSelectable && (
                <TableCell
                  padding="checkbox"
                  variant="head"
                  sx={{
                    ...headerStyle,
                    backgroundColor: headerConfig?.mainRow?.backgroundColor || headerStyle?.backgroundColor || 'inherit',
                  }}
                />
              )}
              {columns.map((col, idx) => (
                <GridHeaderCell
                  key={col.field}
                  column={col}
                  sortModel={sortModel}
                  onSort={onSort}
                  showClearSort={idx === 0 && sortModelLength > 0}
                  onClearSort={onClearSort}
                  headerComboSlot={getHeaderComboSlot ? getHeaderComboSlot(col) : null}
                  filterSlot={getFilterInputSlot && !getFilterToInputSlot ? getFilterInputSlot(col, translations) : null}
                  sortOrderIndex={
                    sortModel?.findIndex((s) => s.field === col.field) >= 0
                      ? sortModel.findIndex((s) => s.field === col.field) + 1
                      : undefined
                  }
                  headerStyle={headerStyle}
                  headerConfig={headerConfig}
                />
              ))}
            </TableRow>
            {getFilterInputSlot && getFilterToInputSlot && (
              <TableRow
                sx={{
                  ...(headerConfig?.filterRows?.backgroundColor && { backgroundColor: headerConfig.filterRows.backgroundColor }),
                }}
              >
                {multiSelectable && (
                  <TableCell
                    padding="checkbox"
                    variant="head"
                    sx={{
                      ...headerStyle,
                      backgroundColor: headerConfig?.filterRows?.backgroundColor || headerStyle?.backgroundColor || 'inherit',
                    }}
                  />
                )}
                {columns.map((col) => (
                  <GridHeaderCellFilter
                    key={col.field}
                    column={col}
                    slot={getFilterInputSlot(col, translations)}
                    headerStyle={headerStyle}
                    headerConfig={headerConfig}
                  />
                ))}
              </TableRow>
            )}
            {getFilterToInputSlot && hasActiveRangeFilter && (
              <TableRow
                sx={{
                  ...(headerConfig?.filterRows?.backgroundColor && { backgroundColor: headerConfig.filterRows.backgroundColor }),
                }}
              >
                {multiSelectable && (
                  <TableCell
                    padding="checkbox"
                    variant="head"
                    sx={{
                      ...headerStyle,
                      backgroundColor: headerConfig?.filterRows?.backgroundColor || headerStyle?.backgroundColor || 'inherit',
                    }}
                  />
                )}
                {columns.map((col) => (
                  <GridHeaderCellFilter
                    key={col.field}
                    column={col}
                    slot={getFilterToInputSlot(col)}
                    headerStyle={headerStyle}
                    headerConfig={headerConfig}
                  />
                ))}
              </TableRow>
            )}
          </TableHead>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length + (multiSelectable ? 1 : 0)} align={ALIGN_CENTER}>
                {translations('noRows')}
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
                  rowId={rowId}
                  selected={selection?.has(rowId)}
                  onSelect={onSelect}
                  editRowId={editRowId}
                  editValues={editValues}
                  getEditor={getEditor}
                  validationErrors={validationErrors}
                  onRowClick={onRowClick}
                  onRowDoubleClick={onRowDoubleClick}
                  selectedRowId={selectedRowId}
                  rowSx={Object.keys(rowSx).length ? rowSx : undefined}
                  selectedRowStyle={selectedRowStyle}
                  editedRowStyle={editedRowStyle}
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
