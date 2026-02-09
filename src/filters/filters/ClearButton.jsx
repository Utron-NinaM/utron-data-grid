import React from 'react';
import { IconButton } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';

export function ClearButton({ onClick, visible }) {
  return (
    <IconButton 
      size="small" 
      onClick={onClick} 
      aria-label="Clear" 
      sx={{ visibility: visible ? 'visible' : 'hidden', flexShrink: 0 }}
    >
      <ClearIcon fontSize="small" />
    </IconButton>
  );
}
