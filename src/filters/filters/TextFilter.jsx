import React from 'react';
import { TextField, Box } from '@mui/material';
import { filterRowWrapperSx, filterInputFlexSx } from '../filterBoxStyles';
import { MAX_TEXT_LENGTH } from '../../constants';

export function TextFilter({ value, onChange }) {
  const safeValue = typeof value === 'string' ? value.slice(0, MAX_TEXT_LENGTH) : '';

  return (
    <Box sx={filterRowWrapperSx}>
      <TextField
        size="small"
        value={safeValue}
        onChange={(e) => onChange(e.target.value.slice(0, MAX_TEXT_LENGTH))}
        variant="outlined"
        inputProps={{ 'aria-label': 'Filter', maxLength: MAX_TEXT_LENGTH }}
        sx={filterInputFlexSx}
      />
    </Box>
  );
}
