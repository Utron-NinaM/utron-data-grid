import React from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Box } from '@mui/material';
import { OperatorDropdown } from './OperatorDropdown';
import { ClearButton } from './ClearButton';
import { getDateFormat } from '../../utils/directionUtils';
import dayjs from 'dayjs';
import 'dayjs/locale/he';

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
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={direction === 'rtl' ? 'he' : 'en'}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, width: '100%', minWidth: 0, maxWidth: '100%' }}>
        <DatePicker
          label={placeholder}
          value={dateVal}
          onChange={(d) => handleChange({ value: d ? d.toISOString() : null })}
          slotProps={{ textField: { size: 'small', sx: { flex: 1, minWidth: 0, maxWidth: '100%' } } }}
          format={format}
        />
        <ClearButton onClick={handleClear} visible={hasValue} />
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
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={direction === 'rtl' ? 'he' : 'en'}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, width: '100%', minWidth: 0, maxWidth: '100%' }}>
        <DatePicker
          label="To"
          value={dateTo}
          onChange={(d) => handleChange({ valueTo: d ? d.toISOString() : null })}
          slotProps={{ textField: { size: 'small', sx: { flex: 1, minWidth: 0, maxWidth: '100%' } } }}
          format={format}
        />
        <ClearButton onClick={handleClear} visible={hasValue} />
      </Box>
    </LocalizationProvider>
  );
}

export function DateFilter({ value, onChange, placeholder, direction }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, width: '100%', minWidth: 0 }}>
      <OperatorDropdown value={value} onChange={onChange} />
      <DateFilterInputs value={value} onChange={onChange} placeholder={placeholder} direction={direction} />
    </Box>
  );
}
