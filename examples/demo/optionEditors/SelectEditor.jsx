import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

export function SelectEditor({ definition, value, onChange }) {
  const options = definition.options ?? [];
  return (
    <FormControl size="small" fullWidth>
      <InputLabel>{definition.label}</InputLabel>
      <Select
        value={value ?? definition.default ?? ''}
        label={definition.label}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
