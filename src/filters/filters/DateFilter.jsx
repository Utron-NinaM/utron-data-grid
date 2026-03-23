import React, { useContext } from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { NumericTextField } from './NumericInput';
import { getDateFormat } from '../../utils/directionUtils';
import { useTranslations } from '../../localization/useTranslations';
import { ThemeProvider } from '@mui/material/styles';
import { DataGridStableContext } from '../../DataGrid/DataGridContext';
import {
  filterRowWrapperSx,
  filterInputFlexSx,
  filterInputFlexSxNarrow,
  filterInputFullWidthSx,
} from '../filterBoxStyles';
import dayjs from 'dayjs';
import 'dayjs/locale/he';
import {
  DIRECTION_RTL,
  LOCALE_HE,
  LOCALE_EN,
  OPERATOR_PERIOD,
  OPERATOR_IN_RANGE,
  OPERATOR_EMPTY,
  OPERATOR_NOT_EMPTY,
  DIRECTION_LTR,
} from '../../config/schema';
import { DATE_PICKER_ICON_SIZE_PX } from '../../constants';

const PERIOD_UNITS = ['hours', 'days', 'weeks', 'months', 'years'];
const ltrTheme = {
  direction: DIRECTION_LTR
};

/** Merge partial into date filter state; clear column when no bounds remain (same idea as NumberFilterInputs). */
function commitDateRangeFilter(prev, partial, onChange) {
  const newValue = { ...prev, ...partial };
  const isEmptyOp =
    newValue?.operator === OPERATOR_EMPTY || newValue?.operator === OPERATOR_NOT_EMPTY;
  if (isEmptyOp) {
    onChange(newValue);
    return;
  }
  const hasMain = newValue.value != null && newValue.value !== '';
  const hasTo = newValue.valueTo != null && newValue.valueTo !== '';
  if (!hasMain && !hasTo) {
    onChange(null);
  } else {
    onChange(newValue);
  }
}

function getDatePickerSlotProps(ctx, direction, placeholder = '') {
  const slotProps = {
    textField: {
      size: 'small',
      dir: direction,
      readOnly: false,
      placeholder,
      sx: {
        ...filterInputFlexSx,
        '& .MuiInputBase-input': { textAlign: 'center', paddingLeft: 0  },
      },
    },
    openPickerButton: { sx: { width: DATE_PICKER_ICON_SIZE_PX, height: DATE_PICKER_ICON_SIZE_PX, minWidth: DATE_PICKER_ICON_SIZE_PX, minHeight: DATE_PICKER_ICON_SIZE_PX } },
    openPickerIcon: { sx: { width: DATE_PICKER_ICON_SIZE_PX, height: DATE_PICKER_ICON_SIZE_PX } },
  };
  if (direction === DIRECTION_RTL) {
    slotProps.textField.sx['& .MuiInputLabel-root'] = {
      right: 20,
    };
    slotProps.textField.sx['& .MuiInputAdornment-positionEnd'] = {
      marginLeft: '2px',     
      paddingRight: '2px' 
    };
  }
  return slotProps;
}

function getDateField(dateVal, handleChange, direction, placeholder, ctx) {
  const format = getDateFormat(direction);
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={direction === DIRECTION_RTL ? LOCALE_HE : LOCALE_EN}>
      <Box sx={filterRowWrapperSx}>
        <ThemeProvider theme={ltrTheme}>
          <DatePicker
            value={dateVal}
            onChange={(d) => handleChange({ value: d && d.isValid() ? d.toISOString() : null })}
            slotProps={getDatePickerSlotProps(ctx, direction, placeholder)}
            dir={direction}
            format={format}
          />
        </ThemeProvider>
      </Box>
    </LocalizationProvider>
  );
}

/** Date picker (from only). "To" is rendered in separate header row when inRange. For OPERATOR_PERIOD: "Last" label + number input + unit combo. */
export function DateFilterInputs({ value, onChange, direction = DIRECTION_LTR }) {
  const t = useTranslations();
  const ctx = useContext(DataGridStableContext);
  const dateVal = value?.value != null ? dayjs(value.value) : null;

  const handleChange = (next) => commitDateRangeFilter(value, next, onChange);

  const isPeriod = value?.operator === OPERATOR_PERIOD;
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
      <Box sx={filterRowWrapperSx}>
        <TextField
          select
          size="small"
          value={periodUnit}
          onChange={(e) => handlePeriodChange({ periodUnit: e.target.value })}
          sx={filterInputFlexSxNarrow}
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
  const fromPlaceholder = value?.operator === OPERATOR_IN_RANGE ? t('filterFrom') : '';
  return getDateField(dateVal, handleChange, direction, fromPlaceholder, ctx);
}

/** Period amount (number) input only (for second header row when operator is OPERATOR_PERIOD). */
export function DateFilterPeriodAmountInput({ value, onChange }) {
  const periodAmount = value?.operator === OPERATOR_PERIOD && (typeof value?.value === 'number' || (typeof value?.value === 'string' && value.value !== '' && !isNaN(Number(value.value))))
    ? String(value.value)
    : '';
  const periodUnit = value?.periodUnit ?? 'hours';

  const handleChange = (next) => {
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

  return (
    <NumericTextField
      size="small"
      value={periodAmount}
      onChange={(raw) => handleChange({ value: raw })}
      integerOnly
      sx={filterInputFullWidthSx}
      inputProps={{ min: 1, step: 1 }}
    />
  );
}

/** "To" date picker only (for in-range second header row) */
export function DateFilterToInput({ value, onChange, direction }) {
  const t = useTranslations();
  const ctx = useContext(DataGridStableContext);
  const dateTo = value?.valueTo != null ? dayjs(value.valueTo) : null;

  const handleChange = (next) => {
    const partial = next.value !== undefined ? { valueTo: next.value } : next;
    commitDateRangeFilter(value, partial, onChange);
  };

  return getDateField(dateTo, handleChange, direction, t('filterTo'), ctx);
}

