import React, { useContext, useMemo } from 'react';
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
  getFilterContentHeight,
  filterRowWrapperSxNoPadding,
  getListFilterAutocompleteInputSx,
  getListFilterAutocompleteSx,
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
  const [inputValue, setInputValue] = React.useState('');
  const listOptions = options ?? [];
  const optionMap = useMemo(() => getOptionMap(listOptions), [listOptions]);
  const keysArray = Array.isArray(value) ? value : value != null ? [value] : [];
  const valueResolved = useMemo(
    () => keysArray.map((key) => optionMap.get(key)).filter(Boolean),
    [keysArray, optionMap]
  );

  return (
    <Box sx={filterRowWrapperSxNoPadding}>
      <Autocomplete
        multiple
        size="small"
        options={listOptions}
        value={valueResolved}
        inputValue={inputValue}
        onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
        disableCloseOnSelect
        disableClearable
        getOptionLabel={getOptionLabel}
        isOptionEqualToValue={(a, b) => getOptionValue(a) === getOptionValue(b)}
        onChange={(_, newVal) => {
          onChange(newVal ? newVal.map(getOptionValue) : []);
          setInputValue('');
        }}
        renderOption={(props, option, { selected: isSelected }) => {
          const { key, ...restProps } = props;          
          return (
            <li key={key} {...restProps} style={{ direction, textAlign: isRtl ? 'right' : 'left', 
                                                 paddingRight: 2, paddingLeft: 2, paddingTop: 0, paddingBottom: 0}}>             
                <>                  
                <Checkbox
              icon={icon}
              checkedIcon={checkedIcon}
              style={{ [isRtl ? 'marginLeft' : 'marginRight']: 2}}
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
            sx: { minWidth: 'max-content', direction },            
          },
          listbox: {
            sx: { direction, px: 1 },
          },
        }}
      />
    </Box>
  );
}
