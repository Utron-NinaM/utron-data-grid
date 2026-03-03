import React, { useContext } from 'react';
import TextField from '@mui/material/TextField';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Autocomplete from '@mui/material/Autocomplete';
import dayjs from 'dayjs';
import 'dayjs/locale/he';
import { getDateFormat } from '../utils/directionUtils';
import { getListFilterAutocompleteInputSx } from '../filters/filterBoxStyles';
import { getOptionLabel, getOptionValue, getOptionDescription, getOptionMap } from '../utils/optionUtils';
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
import { DEFAULT_FONT_SIZE, MAX_TEXT_LENGTH, MAX_NUMBER_INPUT_LENGTH, MAX_WIDTH_LIST_DROPDOWN_PX } from '../constants';
import { getCompactEditorSx } from './cellEditorStyles';
import { ScrollContainerContext } from '../DataGrid/DataGridContext';

export function getEditor(column, row, editValues, onChange, direction = DIRECTION_LTR, fontSize, editorContext) {
  const contentHeightPx = editorContext?.contentHeightPx;
  const onBlur = editorContext?.onBlur;
  const compactEditorSx = getCompactEditorSx(contentHeightPx);
  const value = editValues[column.field];
  const type = column.type ?? DEFAULT_FIELD_TYPE;
  const format = getDateFormat(direction);
  const fontSx = { fontSize: fontSize ?? DEFAULT_FONT_SIZE, ...compactEditorSx };

  switch (type) {
    case FIELD_TYPE_NUMBER:
      return (
        <TextField
          type="number"
          size="small"
          fullWidth
          value={value ?? ''}
          onChange={(e) => onChange(column.field, e.target.value === '' ? undefined : Number(e.target.value))}
          onBlur={onBlur}
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
            onClose={onBlur}
            format={format}
            slotProps={{ textField: { size: 'small', fullWidth: true, onBlur, sx: { ...fontSx, ...compactEditorSx } } }}
          />
        </LocalizationProvider>
      );
    case FIELD_TYPE_LIST: {
      const listOptions = column.options ?? [];
      const optionMap = getOptionMap(listOptions);
      const valueOption = value != null ? optionMap.get(value) ?? null : null;
      const isRtl = direction === DIRECTION_RTL;
      const rtlSx = { direction, textAlign: isRtl ? 'right' : 'left' };
      // Return a component that can access ScrollContainerContext
      return (
        <ListEditor
          options={listOptions}
          value={valueOption}
          onChange={(v) => {
            const code = v != null ? getOptionValue(v) : undefined;
            onChange(column.field, code);
            if (column.listDescriptionField) {
              onChange(column.listDescriptionField, v != null ? getOptionDescription(v) : undefined);
            }
          }}
          onBlur={onBlur}
          onListInputChange={column.onListInputChange}
          direction={direction}
          isRtl={isRtl}
          rtlSx={rtlSx}
          compactEditorSx={compactEditorSx}
          fontSx={fontSx}
          listDropdownSx={column.listDropdownSx}
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
          onBlur={onBlur}
          inputProps={{ maxLength: MAX_TEXT_LENGTH }}
          sx={fontSx}
        />
      );
  }
}

/**
 * List editor component that uses ScrollContainerContext for proper popper positioning.
 */
const LIST_DROPDOWN_BASE_POPPER_SX = {
  minWidth: 'max-content',
  maxWidth: MAX_WIDTH_LIST_DROPDOWN_PX,
};

function ListEditor({
  options,
  value,
  onChange,
  onBlur,
  onListInputChange,
  direction,
  isRtl,
  rtlSx,
  compactEditorSx,
  fontSx,
  listDropdownSx,
}) {
  const scrollCtx = useContext(ScrollContainerContext);
  
  // Get popper container from ScrollContainerContext (same pattern as GridCell)
  const popperContainer = (scrollCtx?.ready && scrollCtx?.ref?.current) ? scrollCtx.ref.current : undefined;
  const popperProps = popperContainer
    ? { container: popperContainer, popperOptions: { strategy: 'absolute' } }
    : { disablePortal: true, popperOptions: { strategy: 'absolute' } };

  const popperSx = { direction, ...LIST_DROPDOWN_BASE_POPPER_SX, ...listDropdownSx };
  const listboxSx = { ...rtlSx, ...listDropdownSx };

  return (
    <Autocomplete
      size="small"
      options={options}
      value={value}
      onChange={(_, v) => onChange(v)}
      onBlur={onBlur}
      onInputChange={(event, newInputValue, reason) => {
        if (reason === 'input' && onListInputChange && newInputValue && newInputValue.trim() !== '') {
          onListInputChange(newInputValue);
        }
      }}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={(a, b) => getOptionValue(a) === getOptionValue(b)}
      renderOption={(props, option) => {
        const { key, ...otherProps } = props;
        return (
          <li key={key} {...otherProps} style={{ ...otherProps.style, ...rtlSx, minWidth: 0 }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
              {getOptionLabel(option)}
            </span>
          </li>
        );
      }}
      sx={compactEditorSx}
      renderInput={(params) => (
        <TextField
          {...params}
          inputProps={{ ...params.inputProps, dir: direction }}
          sx={{ ...params.sx, ...fontSx, ...compactEditorSx, ...getListFilterAutocompleteInputSx(isRtl) }}
        />
      )}
      slotProps={{
        popper: {
          sx: popperSx,
          ...popperProps,
        },
        listbox: { sx: listboxSx },
      }}
      fullWidth
    />
  );
}
