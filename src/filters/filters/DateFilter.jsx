import React, { useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { IconButton, Box, Menu, MenuItem } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useTranslations } from '../../localization/useTranslations';
import { DATE_OPERATORS } from '../../config/schema';
import { getDateFormat } from '../../utils/directionUtils';
import dayjs from 'dayjs';

const operatorMap = {
  '=': 'operatorEquals',
  '!=': 'operatorNotEqual',
  '>': 'operatorGreaterThan',
  '<': 'operatorLessThan',
  '>=': 'operatorGreaterOrEqual',
  '<=': 'operatorLessOrEqual',
  inRange: 'operatorInRange',
};

/** Operator dropdown only (for header row next to column label) */
export function DateOperatorDropdown({ value, onChange }) {
  const t = useTranslations();
  const [anchor, setAnchor] = useState(null);
  const operator = value?.operator ?? '=';

  return (
    <>
      <IconButton size="small" onClick={(e) => setAnchor(e.currentTarget)} aria-label="Operator">
        <ArrowDropDownIcon />
      </IconButton>
      <Box component="span" sx={{ fontSize: '0.875rem', minWidth: 20 }}>
        {operator === 'inRange' ? '…' : operator}
      </Box>
      <Menu
        anchorEl={anchor}
        open={!!anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        {DATE_OPERATORS.map((op) => (
          <MenuItem
            key={op}
            onClick={() => {
              onChange({ ...value, operator: op });
              setAnchor(null);
            }}
          >
            {op === 'inRange' ? '…' : op} {t(operatorMap[op] || op)}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

/** Date picker (from only) + clear. "To" is rendered in separate header row when inRange. */
export function DateFilterInputs({ value, onChange, placeholder, direction }) {
  const format = getDateFormat(direction);
  const dateVal = value?.value != null ? dayjs(value.value) : null;

  const handleChange = (next) => {
    onChange({ ...value, ...next });
  };

  const handleClear = () => onChange(null);

  const hasValue = value != null && (value.value != null || value.valueTo != null);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={direction === 'rtl' ? 'ar' : 'en'}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, width: '100%', minWidth: 0, maxWidth: '100%' }}>
        <DatePicker
          label={placeholder}
          value={dateVal}
          onChange={(d) => handleChange({ value: d ? d.toISOString() : null })}
          slotProps={{ textField: { size: 'small', sx: { flex: 1, minWidth: 0, maxWidth: '100%' } } }}
          format={format}
        />
        <IconButton size="small" onClick={handleClear} aria-label="Clear" sx={{ visibility: hasValue ? 'visible' : 'hidden', flexShrink: 0 }}>
          <ClearIcon fontSize="small" />
        </IconButton>
      </Box>
    </LocalizationProvider>
  );
}

/** "To" date picker only (for in-range second header row) */
export function DateFilterToInput({ value, onChange, direction }) {
  const format = getDateFormat(direction);
  const dateTo = value?.valueTo != null ? dayjs(value.valueTo) : null;

  const handleChange = (next) => {
    onChange({ ...value, ...next });
  };

  const handleClear = () => onChange(null);

  const hasValue = value != null && value.valueTo != null;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={direction === 'rtl' ? 'ar' : 'en'}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, width: '100%', minWidth: 0, maxWidth: '100%' }}>
        <DatePicker
          label="To"
          value={dateTo}
          onChange={(d) => handleChange({ valueTo: d ? d.toISOString() : null })}
          slotProps={{ textField: { size: 'small', sx: { flex: 1, minWidth: 0, maxWidth: '100%' } } }}
          format={format}
        />
        <IconButton size="small" onClick={handleClear} aria-label="Clear" sx={{ visibility: hasValue ? 'visible' : 'hidden', flexShrink: 0 }}>
          <ClearIcon fontSize="small" />
        </IconButton>
      </Box>
    </LocalizationProvider>
  );
}

export function DateFilter({ value, onChange, placeholder, direction }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, width: '100%', minWidth: 0 }}>
      <DateOperatorDropdown value={value} onChange={onChange} />
      <DateFilterInputs value={value} onChange={onChange} placeholder={placeholder} direction={direction} />
    </Box>
  );
}
