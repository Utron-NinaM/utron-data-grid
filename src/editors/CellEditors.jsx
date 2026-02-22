import React from 'react';
import TextField from '@mui/material/TextField';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Autocomplete from '@mui/material/Autocomplete';
import dayjs from 'dayjs';
import 'dayjs/locale/he';
import { getDateFormat } from '../utils/directionUtils';
import { getOptionLabel, getOptionValue, getOptionMap } from '../utils/optionUtils';
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
import { DEFAULT_FONT_SIZE, MAX_TEXT_LENGTH, MAX_NUMBER_INPUT_LENGTH } from '../constants';

export function getEditor(column, row, editValues, onChange, direction = DIRECTION_LTR, fontSize) {
  const value = editValues[column.field];
  const type = column.type ?? DEFAULT_FIELD_TYPE;
  const format = getDateFormat(direction);
  const fontSx = { fontSize: fontSize ?? DEFAULT_FONT_SIZE };

  switch (type) {
    case FIELD_TYPE_NUMBER:
      return (
        <TextField
          type="number"
          size="small"
          fullWidth
          value={value ?? ''}
          onChange={(e) => onChange(column.field, e.target.value === '' ? undefined : Number(e.target.value))}
          inputProps={{ maxLength: MAX_NUMBER_INPUT_LENGTH }}
          sx={fontSx}
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
            slotProps={{ textField: { size: 'small', fullWidth: true, sx: fontSx } }}
          />
        </LocalizationProvider>
      );
    case FIELD_TYPE_LIST: {
      const listOptions = column.options ?? [];
      const optionMap = getOptionMap(listOptions);
      const valueOption = value != null ? optionMap.get(value) ?? null : null;
      return (
        <Autocomplete
          size="small"
          options={listOptions}
          value={valueOption}
          onChange={(_, v) => onChange(column.field, v != null ? getOptionValue(v) : undefined)}
          getOptionLabel={getOptionLabel}
          isOptionEqualToValue={(a, b) => getOptionValue(a) === getOptionValue(b)}
          renderInput={(params) => <TextField {...params} sx={{ ...params.sx, ...fontSx }} />}
          fullWidth
        />
      );
    }
    default:
      return (
        <TextField
          size="small"
          fullWidth
          value={value ?? ''}
          onChange={(e) => onChange(column.field, e.target.value)}
          inputProps={{ maxLength: MAX_TEXT_LENGTH }}
          sx={fontSx}
        />
      );
  }
}
