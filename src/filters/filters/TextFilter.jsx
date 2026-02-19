import React from 'react';
import { TextField, Box } from '@mui/material';
import { filterRowWrapperSx, filterInputFlexSx } from '../../utils/filterBoxStyles';

const MAX_FILTER_LENGTH = 500;

export function TextFilter({ value, onChange }) {
  const safeValue = typeof value === 'string' ? value.slice(0, MAX_FILTER_LENGTH) : '';

  return (
    <Box sx={filterRowWrapperSx}>
      <TextField
        size="small"
        value={safeValue}
        onChange={(e) => onChange(e.target.value.slice(0, MAX_FILTER_LENGTH))}
        variant="outlined"
        inputProps={{ 'aria-label': 'Filter', maxLength: MAX_FILTER_LENGTH }}
        sx={filterInputFlexSx}
      />
    </Box>
  );
}
