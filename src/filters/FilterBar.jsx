import React from 'react';
import { Box } from '@mui/material';
import { TextFilter } from './filters/TextFilter';
import { NumberOperatorDropdown, NumberFilterInputs, NumberFilterToInput } from './filters/NumberFilter';
import { DateOperatorDropdown, DateFilterInputs, DateFilterToInput } from './filters/DateFilter';
import { ListFilter } from './filters/ListFilter';
import { useTranslations } from '../localization/useTranslations';

/**
 * Header combo slot: operator dropdown (number/date) or multi-select (list). Renders next to column label.
 */
export function getHeaderComboSlot(column, filterModel, onFilterChange, direction) {
  const t = useTranslations();
  const field = column.field;
  const state = filterModel?.[field];
  const filterType = column.filter ?? column.type ?? 'text';

  if (filterType === false) return null;

  switch (filterType) {
    case 'number':
      return (
        <NumberOperatorDropdown
          value={state}
          onChange={(v) => onFilterChange(field, v)}
        />
      );
    case 'date':
    case 'datetime':
      return (
        <DateOperatorDropdown
          value={state}
          onChange={(v) => onFilterChange(field, v)}
        />
      );
    case 'list':
      return null;
    default:
      return null;
  }
}

/**
 * Filter input slot: value inputs only (filter row below). No operator, no list combo.
 */
export function getFilterInputSlot(column, filterModel, onFilterChange, direction) {
  const t = useTranslations();
  const field = column.field;
  const state = filterModel?.[field];
  const filterType = column.filter ?? column.type ?? 'text';
  const placeholder = `${t('filterPlaceholder')} ${column.headerName ?? field}`.trim();

  if (filterType === false) return null;

  switch (filterType) {
    case 'number':
      return (
        <NumberFilterInputs
          value={state}
          onChange={(v) => onFilterChange(field, v)}
          placeholder={placeholder}
        />
      );
    case 'date':
    case 'datetime':
      return (
        <DateFilterInputs
          value={state}
          onChange={(v) => onFilterChange(field, v)}
          placeholder={placeholder}
          direction={direction}
        />
      );
    case 'list':
      return (
        <ListFilter
          value={state?.value ?? state}
          onChange={(v) => onFilterChange(field, v != null ? { value: v } : null)}
          options={column.filterOptions?.listValues ?? column.options ?? []}
          placeholder={t('selectOption') + ' ' + (column.headerName ?? field)}
        />
      );
    default:
      return (
        <TextFilter
          value={typeof state === 'object' ? state?.value : state}
          onChange={(v) => onFilterChange(field, v === '' ? null : { value: v })}
          placeholder={placeholder}
        />
      );
  }
}

/**
 * "To" input slot only (for in-range second header row). Returns null when column is not number/date or operator is not inRange.
 */
export function getFilterToInputSlot(column, filterModel, onFilterChange, direction) {
  const field = column.field;
  const state = filterModel?.[field];
  const filterType = column.filter ?? column.type ?? 'text';

  if (filterType === false) return null;
  if (state?.operator !== 'inRange') return null;

  switch (filterType) {
    case 'number':
      return (
        <NumberFilterToInput
          value={state}
          onChange={(v) => onFilterChange(field, v)}
        />
      );
    case 'date':
    case 'datetime':
      return (
        <DateFilterToInput
          value={state}
          onChange={(v) => onFilterChange(field, v)}
          direction={direction}
        />
      );
    default:
      return null;
  }
}

/** Legacy: full filter in one slot (for backward compat) */
export function getFilterSlot(column, filterModel, onFilterChange, direction) {
  const headerCombo = getHeaderComboSlot(column, filterModel, onFilterChange, direction);
  const filterInput = getFilterInputSlot(column, filterModel, onFilterChange, direction);
  if (!headerCombo && !filterInput) return null;
  return (
    <>
      {headerCombo && <Box sx={{ mb: 0.5 }}>{headerCombo}</Box>}
      {filterInput}
    </>
  );
}
