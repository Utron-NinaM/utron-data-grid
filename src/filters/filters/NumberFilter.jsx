import React from 'react';
import { TextField, Box } from '@mui/material';
import { OperatorDropdown } from './OperatorDropdown';
import { ClearButton } from './ClearButton';

const MAX_INPUT_LENGTH = 50;

/** Value input (from only) + clear. "To" is rendered in separate header row when inRange. */
export function NumberFilterInputs({ value, onChange, placeholder }) {
  const val = value?.value ?? '';

  const handleChange = (next) => {
    const newValue = { ...value, ...next };
    // If both value and valueTo are empty, clear the filter
    const hasValue = newValue.value !== undefined && newValue.value !== '';
    const hasValueTo = newValue.valueTo !== undefined && newValue.valueTo !== '';
    if (!hasValue && !hasValueTo) {
      onChange(null);
    } else {
      onChange(newValue);
    }
  };

  const handleClear = () => onChange(null);

  const hasValue = value != null && ((value.value !== undefined && value.value !== '') || (value.valueTo !== undefined && value.valueTo !== ''));

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, width: '100%', minWidth: 0, maxWidth: '100%' }}>
      <TextField
        size="small"
        type="number"
        placeholder={placeholder}
        value={val}
        onChange={(e) => handleChange({ value: e.target.value })}
        sx={{ flex: 1, minWidth: 0, maxWidth: '100%' }}
        inputProps={{ maxLength: MAX_INPUT_LENGTH }}
      />
      <ClearButton onClick={handleClear} visible={hasValue} />
    </Box>
  );
}

/** "To" value input only (for in-range second header row) */
export function NumberFilterToInput({ value, onChange }) {
  const valueTo = value?.valueTo ?? '';

  const handleChange = (next) => {
    const newValue = { ...value, ...next };
    // If both value and valueTo are empty, clear the filter
    const hasValue = newValue.value !== undefined && newValue.value !== '';
    const hasValueTo = newValue.valueTo !== undefined && newValue.valueTo !== '';
    if (!hasValue && !hasValueTo) {
      onChange(null);
    } else {
      onChange(newValue);
    }
  };

  const handleClear = () => onChange(null);

  const hasValue = value != null && (value.valueTo !== undefined && value.valueTo !== '');

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, width: '100%', minWidth: 0, maxWidth: '100%' }}>
      <TextField
        size="small"
        type="number"
        placeholder="To"
        value={valueTo}
        onChange={(e) => handleChange({ valueTo: e.target.value })}
        sx={{ flex: 1, minWidth: 0, maxWidth: '100%' }}
        inputProps={{ maxLength: MAX_INPUT_LENGTH }}
      />
      <ClearButton onClick={handleClear} visible={hasValue} />
    </Box>
  );
}

export function NumberFilter({ value, onChange, placeholder }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, width: '100%', minWidth: 0 }}>
      <OperatorDropdown value={value} onChange={onChange} />
      <NumberFilterInputs value={value} onChange={onChange} placeholder={placeholder} />
    </Box>
  );
}

