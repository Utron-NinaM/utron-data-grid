import React from 'react';
import { IconButton, Tooltip, Box } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilterCircleXmark } from '../config/schema';
import { useTranslations } from '../localization/useTranslations';
import { TextFilter } from './filters/TextFilter';
import { NumberFilterInputs, NumberFilterToInput } from './filters/NumberFilter';
import { DateFilterInputs, DateFilterToInput, DateFilterPeriodAmountInput } from './filters/DateFilter';
import { ListFilter } from './filters/ListFilter';
import { OperatorDropdown } from './filters/OperatorDropdown';
import { isColumnFilterActive } from './filterUtils';
import {
  DEFAULT_FIELD_TYPE,
  OPERATOR_IN_RANGE,
  OPERATOR_PERIOD,
  OPERATOR_CONTAINS,
  NUMBER_OP_IDS,
  DATE_OP_IDS,
  TEXT_OP_IDS,
  FILTER_TYPE_NUMBER,
  FILTER_TYPE_DATE,
  FILTER_TYPE_LIST,
  } from '../config/schema';
import {
  getOperatorWrapperSx,
  getToSlotWrapperSx,
  headerClearButtonSx,
} from '../utils/filterBoxStyles';

/**
 * Header combo slot: clear filter button when column has active filter. Renders next to column label.
 */
export function getHeaderComboSlot(column, filterModel, onFilterChange) {
  const field = column.field;
  const filterType = column.filter ?? column.type ?? DEFAULT_FIELD_TYPE;
  if (filterType === false) return null;
  if (!isColumnFilterActive(column, filterModel)) return null;
  return <HeaderClearFilterButton field={field} onClear={() => onFilterChange(field, null)} />;
}

function HeaderClearFilterButton({ field, onClear }) {
  const t = useTranslations();
  return (
    <Tooltip title={t('clearColumnFilter')} PopperProps={{ disablePortal: true, popperOptions: { strategy: 'absolute' } }}>
      <IconButton size="small" onClick={onClear} aria-label={t('clearColumnFilter')} sx={headerClearButtonSx}>
        <FontAwesomeIcon icon={faFilterCircleXmark} fontSize="small" />
      </IconButton>
    </Tooltip>
  );
}

/**
 * Filter input slot: operator (text/number/date) + value inputs in filter row. LTR: operator left, RTL: operator right.
 */
export function getFilterInputSlot(column, filterModel, onFilterChange, direction) {
  const field = column.field;
  const state = filterModel?.[field];
  const filterType = column.filter ?? column.type ?? DEFAULT_FIELD_TYPE;

  if (filterType === false) return null;

  const operatorWrapperSx = getOperatorWrapperSx(direction);

  switch (filterType) {
    case FILTER_TYPE_NUMBER:
      return (
        <Box sx={operatorWrapperSx}>
          <OperatorDropdown
            value={state}
            onChange={(v) => onFilterChange(field, v)}
            operatorMap={NUMBER_OP_IDS}
          />
          <NumberFilterInputs value={state} onChange={(v) => onFilterChange(field, v)} />
        </Box>
      );
    case FILTER_TYPE_DATE:
      return (
        <Box sx={operatorWrapperSx}>
          <OperatorDropdown
            value={state}
            onChange={(v) => onFilterChange(field, v)}
            operatorMap={DATE_OP_IDS}
          />
          <DateFilterInputs
            value={state}
            onChange={(v) => onFilterChange(field, v)}
            direction={direction}
          />
        </Box>
      );
    case FILTER_TYPE_LIST:
      return (
        <ListFilter
          value={state?.value ?? state}
          onChange={(v) => onFilterChange(field, v?.length ? { value: v } : null)}
          options={column.filterOptions?.listValues ?? column.options ?? []}
        />
      );
    default:
      return (
        <Box sx={operatorWrapperSx}>
          <OperatorDropdown
            value={state}
            onChange={(v) => onFilterChange(field, v)}
            operatorMap={TEXT_OP_IDS}
          />
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
          />
        </Box>
      );
  }
}

/**
 * "To" input slot (in-range second row) or period amount slot (OPERATOR_PERIOD second row). Returns null when column is not number/date or operator is not inRange/period.
 */
export function getFilterToInputSlot(column, filterModel, onFilterChange, direction) {
  const field = column.field;
  const state = filterModel?.[field];
  const filterType = column.filter ?? column.type ?? DEFAULT_FIELD_TYPE;

  if (filterType === false) return null;
  const isDatePeriod = filterType === FILTER_TYPE_DATE && state?.operator === OPERATOR_PERIOD;
  const isInRange = state?.operator === OPERATOR_IN_RANGE;
  if (!isInRange && !isDatePeriod) return null;

  switch (filterType) {
    case FILTER_TYPE_NUMBER:
      return (
        <Box sx={getToSlotWrapperSx(direction)}>
          <NumberFilterToInput
            value={state}
            onChange={(v) => onFilterChange(field, v)}
          />
        </Box>
      );
    case FILTER_TYPE_DATE:
      return (
        <Box sx={getToSlotWrapperSx(direction)}>
          {state?.operator === OPERATOR_PERIOD ? (
            <DateFilterPeriodAmountInput
              value={state}
              onChange={(v) => onFilterChange(field, v)}
              direction={direction}
            />
          ) : (
            <DateFilterToInput
              value={state}
              onChange={(v) => onFilterChange(field, v)}
              direction={direction}
            />
          )}
        </Box>
      );
    default:
      return null;
  }
}

