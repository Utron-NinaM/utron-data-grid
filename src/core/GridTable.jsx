import React , {useContext, useMemo, useRef} from 'react';
import { Table, TableBody, TableContainer, TableHead, TableRow, TableCell, Paper, Box, Button } from '@mui/material';
import { useTranslations } from '../localization/useTranslations';
import { DataGridStableContext, DataGridFilterContext } from '../DataGrid/DataGridContext';
import { GridHeaderCell } from './GridHeaderCell';
import { GridHeaderCellFilter } from './GridHeaderCellFilter';
import { GridBodyRow } from './GridBodyRow';
import { ALIGN_CENTER } from '../config/schema';

const EMPTY_ERROR_SET = new Set();
const EMPTY_EDIT_VALUES = {};

/**
 * @param {Object} props
 * @param {Object[]} props.rows
 * @param {Set<string|number>} props.selection
 * @param {Function} props.onSelect
 * @param {Array<{ field: string, order: string }>} props.sortModel
 * @param {Function} props.onSort
 * @param {boolean} [props.hasActiveFilters]
 * @param {string|number|null} props.editRowId
 * @param {Object} props.editValuesRef
 * @param {Object} props.validationErrorsRef
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
  editValuesRef,
  validationErrorsRef,
  editValuesVersion,
  onRowClick,
  onRowDoubleClick,
  selectedRowId,
  hasActiveRangeFilter,
}) {
  const translations = useTranslations();
  const ctx = useContext(DataGridStableContext);
  const filterCtx = useContext(DataGridFilterContext);
  const { columns, getRowId, multiSelectable, onClearSort, onClearAllFilters, headerStyle, headerConfig, getEditor, selectedRowStyle } = ctx;
  const { getHeaderComboSlot, getFilterInputSlot, getFilterToInputSlot } = filterCtx;
  const sortModelLength = sortModel?.length ?? 0;

  // Debug: Track bodyRows useMemo execution
  const bodyRowsMemoCount = useRef(0);
  
  // Memoize the body rows to prevent unnecessary recreations when only selectedRowId or editRowId changes
  const bodyRows = useMemo(() => {
    bodyRowsMemoCount.current++;
    console.log('[GridTable] bodyRows useMemo executed (#', bodyRowsMemoCount.current, ') - selectedRowId:', selectedRowId, 'editRowId:', editRowId);
    if (rows.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={columns.length + (multiSelectable ? 1 : 0)} align={ALIGN_CENTER}>
            {translations('noRows')}
          </TableCell>
        </TableRow>
      );
    }
    
    const currentEditValues = editValuesRef?.current || EMPTY_EDIT_VALUES;
    const currentValidationErrors = validationErrorsRef?.current || [];
    const errorSet = new Set(currentValidationErrors.map((e) => e.field));
    
    return rows.map((row) => {
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
          editValues={isEditing ? currentEditValues : undefined}
          validationErrors={isEditing ? errorSet : EMPTY_ERROR_SET}
          onRowClick={onRowClick}
          onRowDoubleClick={onRowDoubleClick}
          isSelected={isSelected}
          rowSx={undefined}
          columns={columns}
          multiSelectable={multiSelectable}
          getEditor={getEditor}
          selectedRowStyle={selectedRowStyle}
        />
      );
    });
  }, [rows, columns, multiSelectable, getRowId, selectedRowId, selection, onSelect, editRowId, editValuesVersion, onRowClick, editValuesRef, validationErrorsRef, onRowDoubleClick, translations, getEditor, selectedRowStyle]);
  
  // Debug: Track callback prop changes
  const onRowClickRef = useRef(onRowClick);
  const onRowDoubleClickRef = useRef(onRowDoubleClick);
  if (onRowClickRef.current !== onRowClick) {
    console.log('[GridTable] ⚠️ onRowClick prop CHANGED (new function reference)');
    onRowClickRef.current = onRowClick;
  }
  if (onRowDoubleClickRef.current !== onRowDoubleClick) {
    console.log('[GridTable] ⚠️ onRowDoubleClick prop CHANGED (new function reference)');
    onRowDoubleClickRef.current = onRowDoubleClick;
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
                  sortOrderIndex={
                    sortModel?.findIndex((s) => s.field === col.field) >= 0
                      ? sortModel.findIndex((s) => s.field === col.field) + 1
                      : undefined
                  }

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













