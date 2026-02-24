import React, { useState, useCallback } from 'react';
import { TextField } from '@mui/material';

function safeStringify(val) {
  if (val === undefined || val === null) return '';
  try {
    return typeof val === 'string' ? val : JSON.stringify(val, null, 2);
  } catch {
    return '';
  }
}

export function JsonEditor({ definition, value, onChange }) {
  const [raw, setRaw] = useState(() => safeStringify(value));
  const [error, setError] = useState(null);

  const handleChange = useCallback(
    (str) => {
      setRaw(str);
      if (!str.trim()) {
        setError(null);
        onChange(undefined);
        return;
      }
      try {
        const parsed = JSON.parse(str);
        setError(null);
        onChange(parsed);
      } catch (e) {
        setError(e.message || 'Invalid JSON');
      }
    },
    [onChange]
  );

  return (
    <TextField
      label={definition.label}
      value={raw}
      onChange={(e) => handleChange(e.target.value)}
      size="small"
      fullWidth
      multiline
      minRows={2}
      maxRows={6}
      placeholder={definition.placeholder}
      error={Boolean(error)}
      helperText={error}
    />
  );
}
