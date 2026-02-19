import React from 'react';
import { Box } from '@mui/material';
import { NumericTextField } from './NumericInput';
import { filterRowWrapperSx, filterInputFlexSx } from '../filterBoxStyles';

/** Value input (from only). "To" is rendered in separate header row when inRange. */
export function NumberFilterInputs({ value, onChange }) {
  const val = value?.value ?? '';

  const handleChange = (next) => {
    const newValue = { ...value, ...next };
    const hasValue = newValue.value !== undefined && newValue.value !== '';
    const hasValueTo = newValue.valueTo !== undefined && newValue.valueTo !== '';
    if (!hasValue && !hasValueTo) {
      onChange(null);
    } else {
      onChange(newValue);
    }
  };

  return (
    <Box sx={filterRowWrapperSx}>
      <NumericTextField
        size="small"
        value={val}
        onChange={(raw) => handleChange({ value: raw })}
        sx={filterInputFlexSx}
      />
    </Box>
  );
}

/** "To" value input only (for in-range second header row) */
export function NumberFilterToInput({ value, onChange }) {
  const valueTo = value?.valueTo ?? '';

  const handleChange = (next) => {
    const newValue = { ...value, ...next };
    const hasValue = newValue.value !== undefined && newValue.value !== '';
    const hasValueTo = newValue.valueTo !== undefined && newValue.valueTo !== '';
    if (!hasValue && !hasValueTo) {
      onChange(null);
    } else {
      onChange(newValue);
    }
  };

  return (
    <Box sx={filterRowWrapperSx}>
      <NumericTextField
        size="small"
        value={valueTo}
        onChange={(raw) => handleChange({ valueTo: raw })}
        sx={filterInputFlexSx}
        inputProps={{ 'aria-label': 'To' }}
      />
    </Box>
  );
}


