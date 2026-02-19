import React from 'react';
import { TextField, Box } from '@mui/material';

const MAX_INPUT_LENGTH = 50;
const NUMBER_INPUT_REGEX = /^-?\d*\.?\d*$/;

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

  const onValueChange = (raw) => {
    if (raw === '' || NUMBER_INPUT_REGEX.test(raw)) handleChange({ value: raw });
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, width: '100%', minWidth: 0, maxWidth: '100%' }}>
      <TextField
        size="small"
        type="text"
        value={val}
        onChange={(e) => onValueChange(e.target.value)}
        sx={{ flex: 1, minWidth: 0, maxWidth: '100%' }}
        inputProps={{ maxLength: MAX_INPUT_LENGTH }}
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

  const onValueToChange = (raw) => {
    if (raw === '' || NUMBER_INPUT_REGEX.test(raw)) handleChange({ valueTo: raw });
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, width: '100%', minWidth: 0, maxWidth: '100%' }}>
      <TextField
        size="small"
        type="text"
        value={valueTo}
        onChange={(e) => onValueToChange(e.target.value)}
        sx={{ flex: 1, minWidth: 0, maxWidth: '100%' }}
        inputProps={{ maxLength: MAX_INPUT_LENGTH, 'aria-label': 'To' }}
      />
    </Box>
  );
}


