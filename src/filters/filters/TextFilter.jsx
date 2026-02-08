import React from 'react';
import { TextField, IconButton, Box } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';

const MAX_FILTER_LENGTH = 500;

export function TextFilter({ value, onChange, placeholder }) {
  const safeValue = typeof value === 'string' ? value.slice(0, MAX_FILTER_LENGTH) : '';
  const hasValue = safeValue.length > 0;

  const handleClear = () => onChange('');

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, width: '100%', minWidth: 0, maxWidth: '100%' }}>
      <TextField
        size="small"
        placeholder={placeholder}
        value={safeValue}
        onChange={(e) => onChange(e.target.value.slice(0, MAX_FILTER_LENGTH))}
        variant="outlined"
        inputProps={{ 'aria-label': placeholder, maxLength: MAX_FILTER_LENGTH }}
        sx={{ flex: 1, minWidth: 0, maxWidth: '100%' }}
      />
      <IconButton size="small" onClick={handleClear} aria-label="Clear" sx={{ visibility: hasValue ? 'visible' : 'hidden', flexShrink: 0 }}>
        <ClearIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}
