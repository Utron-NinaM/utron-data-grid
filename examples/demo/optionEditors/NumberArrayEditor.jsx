import React from 'react';
import { TextField } from '@mui/material';

function parseNumberArray(str) {
  if (!str || !str.trim()) return [];
  return str
    .split(/[,\s]+/)
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !Number.isNaN(n));
}

function formatNumberArray(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return '';
  return arr.join(', ');
}

export function NumberArrayEditor({ definition, value, onChange }) {
  const str = formatNumberArray(value ?? definition.default ?? []);
  return (
    <TextField
      label={definition.label}
      value={str}
      onChange={(e) => onChange(parseNumberArray(e.target.value))}
      size="small"
      fullWidth
      placeholder="e.g. 10, 25, 50, 100"
    />
  );
}
