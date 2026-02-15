import React from 'react';
import { TextFilter } from './filters/TextFilter';
import { NumberFilterInputs, NumberFilterToInput } from './filters/NumberFilter';
import { DateFilterInputs, DateFilterToInput } from './filters/DateFilter';
import { ListFilter } from './filters/ListFilter';
import { OperatorDropdown } from './filters/OperatorDropdown';
import {
  DEFAULT_FIELD_TYPE,
  FIELD_TYPE_NUMBER,
  FIELD_TYPE_DATE,
  FIELD_TYPE_DATETIME,
  FIELD_TYPE_LIST,
  OPERATOR_IN_RANGE,
  OPERATOR_CONTAINS,
  DIRECTION_LTR,
  NUMBER_OP_IDS,
  DATE_OP_IDS,
  TEXT_OP_IDS,
} from '../config/schema';

/**
 * Header combo slot: operator dropdown (number/date) or multi-select (list). Renders next to column label.
 */
export function getHeaderComboSlot(column, filterModel, onFilterChange) {
  const field = column.field;
  const state = filterModel?.[field];
  const filterType = column.filter ?? column.type ?? DEFAULT_FIELD_TYPE;
  const operatorMap = filterType === FIELD_TYPE_NUMBER ? NUMBER_OP_IDS : filterType === FIELD_TYPE_DATE ? DATE_OP_IDS : TEXT_OP_IDS;

  if (filterType === false) return null;

  switch (filterType) {
    case FIELD_TYPE_NUMBER:
    case FIELD_TYPE_DATE:
    case FIELD_TYPE_DATETIME:
      return (
        <OperatorDropdown
          value={state}
          onChange={(v) => onFilterChange(field, v)}
          operatorMap={operatorMap}
        />
      );
    case FIELD_TYPE_LIST:
      return null;
    default:
      return (
        <OperatorDropdown
          value={state}
          onChange={(v) => onFilterChange(field, v)}
          operatorMap={operatorMap}
        />
      );
  }
}

/**
 * Filter input slot: value inputs only (filter row below). No operator, no list combo.
 */
export function getFilterInputSlot(column, filterModel, onFilterChange, direction = DIRECTION_LTR, translations) {
  const field = column.field;
  const state = filterModel?.[field];
  const filterType = column.filter ?? column.type ?? DEFAULT_FIELD_TYPE;
  const placeholder = translations ? translations('filterPlaceholder') : '';

  if (filterType === false) return null;

  switch (filterType) {
    case FIELD_TYPE_NUMBER:
      return (
        <NumberFilterInputs
          value={state}
          onChange={(v) => onFilterChange(field, v)}
          placeholder={placeholder}
        />
      );
    case FIELD_TYPE_DATE:
    case FIELD_TYPE_DATETIME:
      return (
        <DateFilterInputs
          value={state}
          onChange={(v) => onFilterChange(field, v)}
          placeholder={placeholder}
          direction={direction}
        />
      );
    case FIELD_TYPE_LIST:
      return (
        <ListFilter
          value={state?.value ?? state}
          onChange={(v) => onFilterChange(field, v != null ? { value: v } : null)}
          options={column.filterOptions?.listValues ?? column.options ?? []}
          placeholder={placeholder}
        />
      );
    default:
      return (
        <TextFilter
          value={typeof state === 'object' ? state?.value : state}
          onChange={(v) => {
            if (v === '') {
              onFilterChange(field, null);
            } else {
              const newState = { ...state, value: v };
              if (!newState.operator) {
                newState.operator = OPERATOR_CONTAINS;
              }
              onFilterChange(field, newState);
            }
          }}
          placeholder={placeholder}
        />
      );
  }
}

/**
 * "To" input slot only (for in-range second header row). Returns null when column is not number/date or operator is not inRange.
 */
export function getFilterToInputSlot(column, filterModel, onFilterChange, direction = DIRECTION_LTR) {
  const field = column.field;
  const state = filterModel?.[field];
  const filterType = column.filter ?? column.type ?? DEFAULT_FIELD_TYPE;

  if (filterType === false) return null;
  if (state?.operator !== OPERATOR_IN_RANGE) return null;

  switch (filterType) {
    case FIELD_TYPE_NUMBER:
      return (
        <NumberFilterToInput
          value={state}
          onChange={(v) => onFilterChange(field, v)}
        />
      );
    case FIELD_TYPE_DATE:
    case FIELD_TYPE_DATETIME:
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

