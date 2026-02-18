import React, { useContext } from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Box, TextField } from '@mui/material';
import { getDateFormat } from '../../utils/directionUtils';
import { useTranslations } from '../../localization/useTranslations';
import { ThemeProvider } from '@mui/material/styles';
import { DataGridStableContext } from '../../DataGrid/DataGridContext';
import { getFilterContentHeight } from '../../utils/filterBoxStyles';

import dayjs from 'dayjs';
import 'dayjs/locale/he';
import { DIRECTION_RTL, LOCALE_HE, LOCALE_EN, OPERATOR_PERIOD, DIRECTION_LTR } from '../../config/schema';

const PERIOD_UNITS = ['hours', 'days', 'weeks', 'months', 'years'];
const ltrTheme = {
  direction: DIRECTION_LTR
};

function getSlotProps(direction) {
  const slotProps = {
    textField: {
      size: 'small',
      dir: direction,
      readOnly: false,
      placeholder: '',
      sx: {
        flex: 1,
        minWidth: 0,
        maxWidth: '100%',
      }
    }
  };
  if (direction === DIRECTION_RTL) {
    slotProps.textField.sx['& .MuiInputLabel-root'] = {
      right: 20,
    };
  }
  return slotProps;
}

/** Date picker (from only). "To" is rendered in separate header row when inRange. For OPERATOR_PERIOD: "Last" label + number input + unit combo. */
export function DateFilterInputs({ value, onChange, direction = DIRECTION_LTR }) {
  const t = useTranslations();
  const ctx = useContext(DataGridStableContext);
  const contentHeight = getFilterContentHeight(ctx?.filterInputHeight);
  const datePickerIconSize = contentHeight - 2;
  const format = getDateFormat(direction);
  const dateVal = value?.value != null ? dayjs(value.value) : null;
  const datePickerSlotProps = {
    ...getSlotProps(direction),
    openPickerButton: { sx: { width: datePickerIconSize, height: datePickerIconSize, minWidth: datePickerIconSize, minHeight: datePickerIconSize } },
    openPickerIcon: { sx: { width: datePickerIconSize, height: datePickerIconSize } },
  };

  const handleChange = (next) => {
    onChange({ ...value, ...next });
  };

  const isPeriod = value?.operator === OPERATOR_PERIOD;
  const periodAmount = isPeriod && (typeof value?.value === 'number' || (typeof value?.value === 'string' && value.value !== '' && !isNaN(Number(value.value))))
    ? String(value.value)
    : '';
  const periodUnit = value?.periodUnit ?? 'hours';

  const handlePeriodChange = (next) => {
    const newValue = { ...value, ...next };
    if (newValue.value !== undefined && newValue.value !== '' && newValue.periodUnit == null) {
      newValue.periodUnit = periodUnit;
    }
    const hasAmount = newValue.value !== undefined && newValue.value !== '';
    const hasUnit = newValue.periodUnit != null;
    if (!hasAmount && !hasUnit) {
      onChange(null);
    } else {
      onChange(newValue);
    }
  };

  if (isPeriod) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, width: '100%', minWidth: 0, maxWidth: '100%' }}>
        <TextField
          size="small"
          type="number"
          value={periodAmount}
          onChange={(e) => handlePeriodChange({ value: e.target.value })}
          sx={{ width: 72, minWidth: 0 }}
          inputProps={{ min: 1, step: 1 }}
        />
        <TextField
          select
          size="small"
          value={periodUnit}
          onChange={(e) => handlePeriodChange({ periodUnit: e.target.value })}
          sx={{ flex: 1, minWidth: 0 }}
          SelectProps={{ native: true }}
        >
          {PERIOD_UNITS.map((unit) => (
            <option key={unit} value={unit}>
              {t(`period${unit.charAt(0).toUpperCase() + unit.slice(1)}`)}
            </option>
          ))}
        </TextField>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={direction === DIRECTION_RTL ? LOCALE_HE : LOCALE_EN}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, width: '100%', minWidth: 0, maxWidth: '100%' }}>
        <ThemeProvider theme={ltrTheme}>
          <DatePicker
            value={dateVal}
            onChange={(d) => handleChange({ value: d && d.isValid() ? d.toISOString() : null })}
            slotProps={datePickerSlotProps}
            dir={direction}
            format={format}
          />
        </ThemeProvider>
      </Box>
    </LocalizationProvider>
  );
}

/** "To" date picker only (for in-range second header row) */
export function DateFilterToInput({ value, onChange, direction }) {
  const ctx = useContext(DataGridStableContext);
  const contentHeight = getFilterContentHeight(ctx?.filterInputHeight);
  const datePickerIconSize = contentHeight - 2;
  const format = getDateFormat(direction);
  const dateTo = value?.valueTo != null ? dayjs(value.valueTo) : null;

  const handleChange = (next) => {
    onChange({ ...value, ...next });
  };

  const toSlotProps = {
    ...getSlotProps(direction),
    openPickerButton: { sx: { width: datePickerIconSize, height: datePickerIconSize, minWidth: datePickerIconSize, minHeight: datePickerIconSize } },
    openPickerIcon: { sx: { width: datePickerIconSize, height: datePickerIconSize } },
    textField: {
      ...getSlotProps(direction).textField,
      inputProps: { 'aria-label': 'To' },
    },
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={direction === DIRECTION_RTL ? LOCALE_HE : LOCALE_EN}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, width: '100%', minWidth: 0, maxWidth: '100%' }}>
        <ThemeProvider theme={ltrTheme}>
          <DatePicker
            value={dateTo}
            onChange={(d) => handleChange({ valueTo: d && d.isValid() ? d.toISOString() : null })}
            slotProps={toSlotProps}
            dir={direction}
            format={format}
          />
        </ThemeProvider>
      </Box>
    </LocalizationProvider>
  );
}

