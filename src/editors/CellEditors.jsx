import React from 'react';
import { TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Autocomplete } from '@mui/material';
import dayjs from 'dayjs';
import { getDateFormat } from '../utils/directionUtils';

export function getEditor(column, row, editValues, direction, onChange) {
  const value = editValues[column.field];
  const type = column.type ?? 'text';
  const format = getDateFormat(direction);

  switch (type) {
    case 'number':
      return (
        <TextField
          type="number"
          size="small"
          fullWidth
          value={value ?? ''}
          onChange={(e) => onChange(column.field, e.target.value === '' ? undefined : Number(e.target.value))}
          inputProps={{ maxLength: 50 }}
        />
      );
    case 'date':
    case 'datetime':
      return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            value={value != null ? dayjs(value) : null}
            onChange={(d) => onChange(column.field, d ? d.toISOString() : null)}
            format={format}
            slotProps={{ textField: { size: 'small', fullWidth: true } }}
          />
        </LocalizationProvider>
      );
    case 'list':
      return (
        <Autocomplete
          size="small"
          options={column.options ?? []}
          value={value ?? null}
          onChange={(_, v) => onChange(column.field, v)}
          getOptionLabel={(o) => (typeof o === 'object' && o != null && o.label != null ? o.label : String(o))}
          renderInput={(params) => <TextField {...params} />}
          fullWidth
        />
      );
    default:
      return (
        <TextField
          size="small"
          fullWidth
          value={value ?? ''}
          onChange={(e) => onChange(column.field, e.target.value)}
          inputProps={{ maxLength: 500 }}
        />
      );
  }
}
