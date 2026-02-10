import React , {useContext, useMemo} from 'react';
import { Table, TableBody, TableContainer, TableHead, TableRow, TableCell, Paper, Box, Button } from '@mui/material';
import { useTranslations } from '../localization/useTranslations';
import { DataGridStableContext, DataGridFilterContext } from '../DataGrid/DataGridContext';
import { GridHeaderCell } from './GridHeaderCell';
import { GridHeaderCellFilter } from './GridHeaderCellFilter';
import { GridBodyRow } from './GridBodyRow';
import { ALIGN_CENTER } from '../config/schema';

const EMPTY_ERROR_SET = new Set();

/**
 * @param {Object} props
 * @param {Object[]} props.rows
 * @param {Set<string|number>} props.selection
 * @param {Function} props.onSelect
 * @param {Array<{ field: string, order: string }>} props.sortModel
 * @param {Function} props.onSort
 * @param {boolean} [props.hasActiveFilters]
 * @param {string|number|null} props.editRowId
 * @param {Object} props.editValues
 * @param {Array} props.validationErrors
 * @param {Set<string>} props.errorSet
 * @param {Function} [props.onRowClick]
 * @param {Function} [props.onRowDoubleClick]
 * @param {string|number|null} [props.selectedRowId]
 * @param {boolean} [props.hasActiveRangeFilter] Whether any column has an active range filter
 */
export function GridTable({
  rows,
  selection,
  onSelect,
  sortModel,
  onSort,
  hasActiveFilters,
  editRowId,
  editValues,
  errorSet,
  onRowClick,
  onRowDoubleClick,
  selectedRowId,
  hasActiveRangeFilter,
}) {
  const translations = useTranslations();
  const ctx = useContext(DataGridStableContext);
  const filterCtx = useContext(DataGridFilterContext);
  const { columns, getRowId, multiSelectable, onClearSort, onClearAllFilters, headerStyle,
     headerConfig, getEditor, selectedRowStyle, rowStylesMap, sortOrderIndexMap } = ctx;
  const { getHeaderComboSlot, getFilterInputSlot, getFilterToInputSlot } = filterCtx;
  const sortModelLength = sortModel?.length ?? 0;
    
  const mergedRowStylesMap = useMemo(() => {
    const map = new Map();
    rows.forEach((row) => {
      const rowId = getRowId(row);
      const baseRowSx = rowStylesMap?.get(rowId);
      map.set(rowId, [
        baseRowSx,
        {
          '&.Mui-selected': {
            ...selectedRowStyle,
          },
          '&.Mui-selected:hover': {
            ...selectedRowStyle,
          },      
        },
      ]);
    });
    return map;
  }, [rows, rowStylesMap, selectedRowStyle, getRowId]);
  
  // Compute body rows inline - React reconciliation handles optimization efficiently
  let bodyRows;
  if (rows.length === 0) {
    bodyRows = (
      <TableRow>
        <TableCell colSpan={columns.length + (multiSelectable ? 1 : 0)} align={ALIGN_CENTER}>
          {translations('noRows')}
        </TableCell>
      </TableRow>
    );
  } else {
    const errorSetToUse = errorSet || EMPTY_ERROR_SET;
    
    bodyRows = rows.map((row) => {
      const rowId = getRowId(row);
      const isSelected = selectedRowId === rowId;
      const isEditing = editRowId === rowId;
      
      return (
        <GridBodyRow
          key={rowId}
          row={row}
          rowId={rowId}
          selected={selection?.has(rowId)}
          onSelect={onSelect}
          editRowId={isEditing ? editRowId : null}
          editValues={isEditing ? editValues : undefined}
          validationErrors={isEditing ? errorSetToUse : EMPTY_ERROR_SET}
          onRowClick={onRowClick}
          onRowDoubleClick={onRowDoubleClick}
          isSelected={isSelected}
          rowSx={mergedRowStylesMap.get(rowId)}
          columns={columns}
          multiSelectable={multiSelectable}
          getEditor={getEditor}
        />
      );
    });
  }
  
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
              {columns.map((col) => (
                <GridHeaderCell
                  key={col.field}
                  column={col}
                  sortModel={sortModel}
                  onSort={onSort}
                  headerComboSlot={getHeaderComboSlot ? getHeaderComboSlot(col) : null}
                  filterSlot={getFilterInputSlot && !getFilterToInputSlot ? getFilterInputSlot(col, translations) : null}
                  sortOrderIndex={sortOrderIndexMap?.get(col.field)}

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
  
                  />
                ))}
              </TableRow>
            )}
          </TableHead>
        <TableBody>
          {bodyRows}
        </TableBody>
      </Table>
    </TableContainer>
    </>
  );
}













