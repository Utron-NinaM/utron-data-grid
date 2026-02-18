import React, { useContext, useMemo } from 'react';
import { Autocomplete, TextField, Checkbox, Box } from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { DataGridStableContext } from '../../DataGrid/DataGridContext';
import { getOptionLabel, getOptionValue, getOptionMap } from '../../utils/optionUtils';
import { DIRECTION_RTL, DIRECTION_LTR } from '../../config/schema';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

export function ListFilter({ value, onChange, options }) {
  const ctx = useContext(DataGridStableContext);
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
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, width: '100%', minWidth: 0, maxWidth: '100%' }}>
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
            <li key={key} {...restProps} style={{ direction, textAlign: isRtl ? 'right' : 'left' }}>             
                <>                  
                <Checkbox
              icon={icon}
              checkedIcon={checkedIcon}
              style={{ [isRtl ? 'marginLeft' : 'marginRight']: 8 }}
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
            inputProps={{ ...params.inputProps, maxLength: 200, dir: direction }}
            sx={{
              '& .MuiInputBase-input': {
                textAlign: isRtl ? 'right' : 'left',
              },
            }}
          />
        )}
        sx={{
          flex: 1,
          minWidth: 0,
          maxWidth: '100%',
          overflow: 'hidden',
          boxSizing: 'border-box',
          '& .MuiInputBase-root': { minHeight: 20, overflow: 'hidden', direction },
        }}
        slotProps={{
          popper: {
            disablePortal: false,
            sx: { minWidth: 'max-content', direction },            
          },
          listbox: {
            sx: { direction },
          },
        }}
      />
    </Box>
  );
}
