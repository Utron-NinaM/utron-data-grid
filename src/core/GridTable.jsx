import React, { memo, useContext, useMemo, useRef } from 'react';
import { Table, TableBody, TableContainer, TableHead, TableRow, TableCell, Paper, Box, Button } from '@mui/material';
import { useTranslations } from '../localization/useTranslations';
import { DataGridStableContext, DataGridFilterContext } from '../DataGrid/DataGridContext';
import { GridHeaderCell } from './GridHeaderCell';
import { GridHeaderCellFilter } from './GridHeaderCellFilter';
import { GridBodyRow } from './GridBodyRow';
import { GridErrorBoundary } from './GridErrorBoundary';
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
function GridTableInner({
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
  const { columns, getRowId, multiSelectable, onClearSort, onClearAllFilters,
     headerConfig, getEditor, selectedRowStyle, rowStylesMap, sortOrderIndexMap } = ctx;
  const { getHeaderComboSlot, getFilterInputSlot, getFilterToInputSlot } = filterCtx;
  const sortModelLength = sortModel?.length ?? 0;
  
  // Ref to track pending click timeout and prevent click handler from firing on double-click
  const clickTimeoutRef = useRef(null);
  const DOUBLE_CLICK_DELAY = 300; // ms
    
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
  
  // Event delegation handlers for row clicks - single handler for all rows
  const handleTableBodyClick = useMemo(() => {
    if (!onRowClick) return undefined;
    return (event) => {
      const rowElement = event.target.closest('[data-row-id]');
      if (!rowElement) return;
      
      // Clear any pending click timeout
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }
      
      // Schedule the click handler with a delay to allow double-click to cancel it
      const rowId = rowElement.getAttribute('data-row-id');
      const row = rows.find(r => String(getRowId(r)) === rowId);
      
      if (row) {
        clickTimeoutRef.current = setTimeout(() => {
          clickTimeoutRef.current = null;
          onRowClick(row);
        }, DOUBLE_CLICK_DELAY);
      }
    };
  }, [onRowClick, rows, getRowId]);

  const handleTableBodyDoubleClick = useMemo(() => {
    if (!onRowDoubleClick) return undefined;
    return (event) => {
      // Cancel any pending click handler
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }
      
      const rowElement = event.target.closest('[data-row-id]');
      if (!rowElement) return;
      const rowId = rowElement.getAttribute('data-row-id');
      const row = rows.find(r => String(getRowId(r)) === rowId);
      if (row) onRowDoubleClick(row);
    };
  }, [onRowDoubleClick, rows, getRowId]);

  // Stable callback for checkbox selection - takes (rowId, checked)
  const handleSelectRow = useMemo(() => {
    if (!onSelect) return undefined;
    return (rowId, checked) => onSelect(rowId, checked);
  }, [onSelect]);
  
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
          onSelectRow={handleSelectRow}
          editRowId={isEditing ? editRowId : null}
          editValues={isEditing ? editValues : undefined}
          validationErrors={isEditing ? errorSetToUse : EMPTY_ERROR_SET}
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
      <GridErrorBoundary>
        <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto', width: '100%' }}>
          <Table size="small" stickyHeader aria-label="Data grid" sx={{ width: '100%', tableLayout: 'fixed' }}>
            <TableHead sx={headerConfig?.base}>
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
                      ...headerConfig?.base,
                      backgroundColor: headerConfig?.mainRow?.backgroundColor || headerConfig?.base?.backgroundColor || 'inherit',
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
                        ...headerConfig?.base,
                        backgroundColor: headerConfig?.filterRows?.backgroundColor || headerConfig?.base?.backgroundColor || 'inherit',
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
                        ...headerConfig?.base,
                        backgroundColor: headerConfig?.filterRows?.backgroundColor || headerConfig?.base?.backgroundColor || 'inherit',
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
          <TableBody
            onClick={handleTableBodyClick}
            onDoubleClick={handleTableBodyDoubleClick}
          >
            {bodyRows}
          </TableBody>
        </Table>
      </TableContainer>
      </GridErrorBoundary>
    </>
  );
}

export const GridTable = memo(GridTableInner);









