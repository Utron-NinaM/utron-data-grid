import React, { useCallback, useContext, useMemo } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import Box from '@mui/material/Box';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { DataGridStableContext } from '../../DataGrid/DataGridContext';
import { getOptionLabel, getOptionValue, getOptionMap } from '../../utils/optionUtils';
import { DIRECTION_RTL, DIRECTION_LTR } from '../../config/schema';
import {
  filterRowWrapperSxNoPadding,
  getListFilterAutocompleteInputSx,
  getListFilterAutocompleteSx,
  getAutocompleteWrapperSx,
  getFilterContentHeight,
} from '../filterBoxStyles';
import { MAX_LIST_FILTER_INPUT_LENGTH } from '../../constants';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

export function ListFilter({ value, onChange, options }) {
  const ctx = useContext(DataGridStableContext);
  const filterInputHeight = ctx?.filterInputHeight;
  const contentHeight = getFilterContentHeight(filterInputHeight);
  const direction = ctx?.direction ?? DIRECTION_LTR;
  const isRtl = direction === DIRECTION_RTL;
  const boundaryEl = ctx?.dropdownBoundaryRef?.current ?? undefined;
  const listOptions = options ?? [];
  const optionMap = useMemo(() => getOptionMap(listOptions), [listOptions]);
  const keysArray = Array.isArray(value) ? value : value != null ? [value] : [];
  const valueResolved = useMemo(
    () => keysArray.map((key) => optionMap.get(key)).filter(Boolean),
    [keysArray, optionMap]
  );

  const filterOptions = useCallback(
    (options, state) => {
      const search = (state.inputValue ?? '').trim().toLowerCase();
      const filtered = !search
        ? options
        : options.filter((option) => {
            const label = getOptionLabel(option).toLowerCase();
            const code = String(getOptionValue(option)).toLowerCase();
            return label.includes(search) || code.includes(search);
          });      
      const selectedMissing = valueResolved.filter((o) => !filtered.some((f) => getOptionValue(f) === getOptionValue(o)));
      return selectedMissing.length ? [...selectedMissing, ...filtered] : filtered;
    },
    [valueResolved]
  );

  return (
    <Box sx={filterRowWrapperSxNoPadding}>
      <Box sx={getAutocompleteWrapperSx(contentHeight)}>
        <Autocomplete
          multiple
          size="small"
          options={listOptions}
          filterOptions={filterOptions}
          value={valueResolved}
          disableCloseOnSelect
          disableClearable
          getOptionLabel={getOptionLabel}
          isOptionEqualToValue={(a, b) => getOptionValue(a) === getOptionValue(b)}
          onChange={(_, newVal) => {
            onChange(newVal ? newVal.map(getOptionValue) : []);
          }}
          renderOption={(props, option, { selected: isSelected }) => {
            const { key, ...restProps } = props;
            return (
              <li key={key} {...restProps} style={{
                direction, textAlign: isRtl ? 'right' : 'left',
                paddingRight: 12, paddingLeft: 12, paddingTop: 0, paddingBottom: 0
              }}>
                <>
                  <Checkbox
                    icon={icon}
                    checkedIcon={checkedIcon}
                    style={{ [isRtl ? 'marginLeft' : 'marginRight']: 2 }}
                    checked={isSelected}
                  />

                  {getOptionLabel(option)}
                </>
              </li>
            );
          }}
          renderTags={() => null}
          renderInput={(params) => (
            <TextField
              {...params}
              inputProps={{ ...params.inputProps, maxLength: MAX_LIST_FILTER_INPUT_LENGTH, dir: direction }}
              sx={getListFilterAutocompleteInputSx(isRtl)}
            />
          )}
          sx={getListFilterAutocompleteSx(contentHeight)}
          slotProps={{
            popper: {
              disablePortal: false,
              placement: 'bottom-start',
              modifiers: [
                {
                  name: 'preventOverflow',
                  options: { rootBoundary: 'viewport', padding: 8, ...(boundaryEl ? { boundary: boundaryEl } : {}) },
                },
                { name: 'flip', enabled: false },
              ],
              sx: { minWidth: 'max-content', direction },
            },
            listbox: {
              sx: { direction, px: 2 },
            },
          }}
        />
      </Box>
    </Box>
  );
}
