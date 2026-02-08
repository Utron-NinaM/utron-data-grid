import React from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';

const MAX_FILTER_LENGTH = 500;

export function TextFilter({ value, onChange, placeholder }) {
  const safeValue = typeof value === 'string' ? value.slice(0, MAX_FILTER_LENGTH) : '';
  return (
    <TextField
      size="small"
      fullWidth
      placeholder={placeholder}
      value={safeValue}
      onChange={(e) => onChange(e.target.value.slice(0, MAX_FILTER_LENGTH))}
      variant="outlined"
      inputProps={{ 'aria-label': placeholder, maxLength: MAX_FILTER_LENGTH }}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton size="small" onClick={() => onChange('')} aria-label="Clear" sx={{ visibility: safeValue ? 'visible' : 'hidden' }}>
              <ClearIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
}
