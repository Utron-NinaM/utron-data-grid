import React from 'react';
import { TextField } from '@mui/material';

export function StringEditor({ definition, value, onChange }) {
  const str = value != null ? String(value) : '';
  return (
    <TextField
      label={definition.label}
      value={str}
      onChange={(e) => onChange(e.target.value || undefined)}
      size="small"
      fullWidth
      placeholder={definition.placeholder}
    />
  );
}
