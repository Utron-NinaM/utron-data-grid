import React from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Box } from '@mui/material';
import { ClearButton } from './ClearButton';
import { getDateFormat } from '../../utils/directionUtils';
import { useTranslations } from '../../localization/useTranslations';
import dayjs from 'dayjs';
import 'dayjs/locale/he';
import { DIRECTION_RTL, LOCALE_HE, LOCALE_EN, DATE_OPERATOR_MAP } from '../../config/schema';

function getSlotProps(direction) {
  const slotProps = {
    textField: {
      size: 'small',
      dir: direction,
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

/** Date picker (from only) + clear. "To" is rendered in separate header row when inRange. */
export function DateFilterInputs({ value, onChange, placeholder, direction = DIRECTION_LTR }) {
  const format = getDateFormat(direction);
  const dateVal = value?.value != null ? dayjs(value.value) : null;

  const handleChange = (next) => {
    onChange({ ...value, ...next });
  };

  const handleClear = () => onChange(null);

  const hasValue = value != null && (value.value != null || value.valueTo != null);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={direction === DIRECTION_RTL ? LOCALE_HE : LOCALE_EN}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, width: '100%', minWidth: 0, maxWidth: '100%' }}>
        <DatePicker          
          value={dateVal}
          onChange={(d) => handleChange({ value: d ? d.toISOString() : null })}
          slotProps={getSlotProps(direction)}
          dir={direction}
          format={format}
        />
        <ClearButton onClick={handleClear} visible={hasValue} />
      </Box>
    </LocalizationProvider>
  );
}

/** "To" date picker only (for in-range second header row) */
export function DateFilterToInput({ value, onChange, direction }) {
  const t = useTranslations();
  const format = getDateFormat(direction);
  const dateTo = value?.valueTo != null ? dayjs(value.valueTo) : null;

  const handleChange = (next) => {
    onChange({ ...value, ...next });
  };

  const handleClear = () => onChange(null);

  const hasValue = value != null && value.valueTo != null;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={direction === DIRECTION_RTL ? LOCALE_HE : LOCALE_EN}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, width: '100%', minWidth: 0, maxWidth: '100%' }}>
        <DatePicker
          label={t('filterTo')}
          value={dateTo}
          onChange={(d) => handleChange({ valueTo: d ? d.toISOString() : null })}
          slotProps={getSlotProps(direction)}
          dir={direction}
          format={format}
        />
        <ClearButton onClick={handleClear} visible={hasValue} />
      </Box>
    </LocalizationProvider>
  );
}

