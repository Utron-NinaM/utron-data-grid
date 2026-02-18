import React from 'react';
import { IconButton, Tooltip, Box } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilterCircleXmark } from '../config/schema';
import { useTranslations } from '../localization/useTranslations';
import { TextFilter } from './filters/TextFilter';
import { NumberFilterInputs, NumberFilterToInput } from './filters/NumberFilter';
import { DateFilterInputs, DateFilterToInput } from './filters/DateFilter';
import { ListFilter } from './filters/ListFilter';
import { OperatorDropdown } from './filters/OperatorDropdown';
import { isColumnFilterActive } from './filterUtils';
import {
  DEFAULT_FIELD_TYPE,
  OPERATOR_IN_RANGE,
  OPERATOR_CONTAINS,
  DIRECTION_LTR,
  DIRECTION_RTL,
  NUMBER_OP_IDS,
  DATE_OP_IDS,
  TEXT_OP_IDS,
  FILTER_TYPE_NUMBER,
  FILTER_TYPE_DATE,
  FILTER_TYPE_LIST,
} from '../config/schema';

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
    <Tooltip title={t('clearColumnFilter')} PopperProps={{ disablePortal: true }}>
      <IconButton size="small" onClick={onClear} aria-label={t('clearColumnFilter')} sx={{ flexShrink: 0 }}>
        <FontAwesomeIcon icon={faFilterCircleXmark} fontSize="small" />
      </IconButton>
    </Tooltip>
  );
}

/**
 * Filter input slot: operator (text/number/date) + value inputs in filter row. LTR: operator left, RTL: operator right.
 */
export function getFilterInputSlot(column, filterModel, onFilterChange, direction = DIRECTION_LTR, translations) {
  const field = column.field;
  const state = filterModel?.[field];
  const filterType = column.filter ?? column.type ?? DEFAULT_FIELD_TYPE;

  if (filterType === false) return null;

  const isRtl = direction === DIRECTION_RTL;
  const operatorWrapperSx = {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    width: '100%',
    minWidth: 0,
    maxWidth: '100%',
    flexDirection: isRtl ? 'row-reverse' : 'row',
    transition: 'opacity 120ms ease',
  };

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
 * "To" input slot only (for in-range second header row). Returns null when column is not number/date or operator is not inRange.
 */
export function getFilterToInputSlot(column, filterModel, onFilterChange, direction = DIRECTION_LTR) {
  const field = column.field;
  const state = filterModel?.[field];
  const filterType = column.filter ?? column.type ?? DEFAULT_FIELD_TYPE;

  if (filterType === false) return null;
  if (state?.operator !== OPERATOR_IN_RANGE) return null;

  switch (filterType) {
    case FILTER_TYPE_NUMBER:
      return (
        <NumberFilterToInput
          value={state}
          onChange={(v) => onFilterChange(field, v)}
        />
      );
    case FILTER_TYPE_DATE:    
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

