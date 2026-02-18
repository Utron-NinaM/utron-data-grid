import React from 'react';
import { TextField, Box } from '@mui/material';

const MAX_INPUT_LENGTH = 50;

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
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, width: '100%', minWidth: 0, maxWidth: '100%' }}>
      <TextField
        size="small"
        type="number"
        value={val}
        onChange={(e) => handleChange({ value: e.target.value })}
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

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, width: '100%', minWidth: 0, maxWidth: '100%' }}>
      <TextField
        size="small"
        type="number"
        value={valueTo}
        onChange={(e) => handleChange({ valueTo: e.target.value })}
        sx={{ flex: 1, minWidth: 0, maxWidth: '100%' }}
        inputProps={{ maxLength: MAX_INPUT_LENGTH, 'aria-label': 'To' }}
      />
    </Box>
  );
}


