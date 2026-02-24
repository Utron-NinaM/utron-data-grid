import React from 'react';
import { FormControlLabel, Checkbox } from '@mui/material';

export function BooleanEditor({ definition, value, onChange }) {
  const checked = Boolean(value);
  return (
    <FormControlLabel
      control={
        <Checkbox
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          size="small"
        />
      }
      label={definition.label}
      sx={{ m: 0 }}
    />
  );
}
