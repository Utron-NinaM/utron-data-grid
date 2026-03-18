import React, { useContext } from 'react';
import TextField from '@mui/material/TextField';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Autocomplete from '@mui/material/Autocomplete';
import dayjs from 'dayjs';
import 'dayjs/locale/he';
import { getDateFormat } from '../utils/directionUtils';
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
import { DEFAULT_FONT_SIZE, DROPDOWN_POPPER_Z_INDEX, MAX_TEXT_LENGTH, MAX_NUMBER_INPUT_LENGTH, MAX_WIDTH_LIST_DROPDOWN_PX } from '../constants';
import { getCompactEditorSx, listEditorSx, getListEditorInputSx, listEditorClearIndicatorSx, listEditorPopupIndicatorSx } from './cellEditorStyles';
import { DataGridStableContext, ScrollContainerContext } from '../DataGrid/DataGridContext';

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
      const listEditorDirectionSx = { direction, textAlign: isRtl ? 'right' : 'left' };
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
          listEditorSx={listEditorDirectionSx}
          listEditorRootSx={listEditorSx}
          compactEditorSx={compactEditorSx}
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
  listEditorSx,
  listEditorRootSx,
  compactEditorSx,
  fontSx,
  listDropdownSx,
}) {
  const stableCtx = useContext(DataGridStableContext);
  const scrollCtx = useContext(ScrollContainerContext);
  const boundaryEl = stableCtx?.dropdownBoundaryRef?.current ?? undefined;

  const popperOptions = {
    strategy: 'absolute',
    modifiers: [
      {
        name: 'preventOverflow',
        options: {
          rootBoundary: 'viewport',
          padding: 8,
          ...(boundaryEl ? { boundary: boundaryEl } : {}),
        },
      },
      { name: 'flip', options: { fallbackPlacements: ['top', 'bottom-start', 'top-start'] } },
    ],
  };
  const popperContainer = (scrollCtx?.ready && scrollCtx?.ref?.current) ? scrollCtx.ref.current : undefined;
  const popperProps = popperContainer
    ? { container: popperContainer, popperOptions }
    : { popperOptions };

  const popperSx = { direction, ...LIST_DROPDOWN_BASE_POPPER_SX, ...listDropdownSx };
  const listboxSx = { ...listEditorSx, ...listDropdownSx };

  const handleInputSelect = (e) => {
    const input = e.target;
    if (input && typeof input.scrollLeft === 'number') {
      requestAnimationFrame(() => {
        input.scrollLeft = 0;
      });
    }
  };

  return (
    <Autocomplete
      size="small"
      options={options}
      value={value}
      onChange={(_, v) => onChange(v)}
      onBlur={onBlur}
      disableClearable={false}
      clearOnBlur={false}
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
          <li key={key} {...otherProps} style={{ ...otherProps.style, ...listEditorSx, minWidth: 0 }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
              {getOptionLabel(option)}
            </span>
          </li>
        );
      }}
      sx={{ ...listEditorRootSx, ...listEditorSx, ...compactEditorSx }}
      renderInput={(params) => (
        <TextField
          {...params}
          inputProps={{
            ...params.inputProps,
            dir: direction,
            onSelect: (e) => {
              params.inputProps?.onSelect?.(e);
              handleInputSelect(e);
            },
          }}
          sx={{
            ...fontSx,
            ...compactEditorSx,
            ...getListEditorInputSx(isRtl),
          }}
        />
      )}
      slotProps={{
        clearIndicator: {
          sx: listEditorClearIndicatorSx,
        },
        popupIndicator: {
          sx: listEditorPopupIndicatorSx,
        },
        popper: {
          sx: { ...popperSx, zIndex: DROPDOWN_POPPER_Z_INDEX },
          ...popperProps,
        },
        listbox: { sx: listboxSx },
      }}
      fullWidth
    />
  );
}
