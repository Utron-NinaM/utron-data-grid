import React from 'react';
import { TextField } from '@mui/material';

export function NumberEditor({ definition, value, onChange }) {
  const str = value != null ? String(value) : '';
  return (
    <TextField
      label={definition.label}
      type="number"
      value={str}
      onChange={(e) => {
        const v = e.target.value === '' ? undefined : Number(e.target.value);
        onChange(Number.isNaN(v) ? definition.default : v);
      }}
      size="small"
      fullWidth
      inputProps={{ min: 0 }}
    />
  );
}
