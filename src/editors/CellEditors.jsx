import React from 'react';
import { TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Autocomplete } from '@mui/material';
import dayjs from 'dayjs';
import 'dayjs/locale/he';
import { getDateFormat } from '../utils/directionUtils';
import { getOptionLabel } from '../utils/optionUtils';
import {
  DEFAULT_FIELD_TYPE,
  FIELD_TYPE_NUMBER,
  FIELD_TYPE_DATE,
  FIELD_TYPE_DATETIME,
  FIELD_TYPE_LIST,
  DIRECTION_RTL,
  DIRECTION_LTR,
  LOCALE_HE,
  LOCALE_EN,
} from '../config/schema';

export function getEditor(column, row, editValues, onChange, direction = DIRECTION_LTR) {
  const value = editValues[column.field];
  const type = column.type ?? DEFAULT_FIELD_TYPE;
  const format = getDateFormat(direction);

  switch (type) {
    case FIELD_TYPE_NUMBER:
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
    case FIELD_TYPE_DATE:
    case FIELD_TYPE_DATETIME:
      return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={direction === DIRECTION_RTL ? LOCALE_HE : LOCALE_EN}>
          <DatePicker
            value={value != null ? dayjs(value) : null}
            onChange={(d) => onChange(column.field, d ? d.toISOString() : null)}
            format={format}
            slotProps={{ textField: { size: 'small', fullWidth: true } }}
          />
        </LocalizationProvider>
      );
    case FIELD_TYPE_LIST:
      return (
        <Autocomplete
          size="small"
          options={column.options ?? []}
          value={value ?? null}
          onChange={(_, v) => onChange(column.field, v)}
          getOptionLabel={getOptionLabel}
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
