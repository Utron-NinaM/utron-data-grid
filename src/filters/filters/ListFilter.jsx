import React, { useContext } from 'react';
import { Autocomplete, TextField, Checkbox, Box } from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { useTranslations } from '../../localization/useTranslations';
import { DataGridContext } from '../../DataGrid/DataGridContext';
import { ClearButton } from './ClearButton';
import { getOptionLabel } from '../../utils/optionUtils';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

export function ListFilter({ value, onChange, options, placeholder }) {
  const t = useTranslations();
  const ctx = useContext(DataGridContext);
  const direction = ctx?.direction ?? 'ltr';
  const isRtl = direction === 'rtl';
  const [inputValue, setInputValue] = React.useState('');
  const selected = Array.isArray(value) ? value : value != null ? [value] : [];
  const listOptions = options ?? [];
  const hasValue = selected.length > 0;

  const handleClear = () => onChange(null);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, width: '100%', minWidth: 0, maxWidth: '100%' }}>
      <Autocomplete
        multiple
        size="small"
        options={listOptions}
        value={selected}
        inputValue={inputValue}
        onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
        disableCloseOnSelect
        disableClearable
        getOptionLabel={getOptionLabel}
        onChange={(_, newVal) => {
          onChange(newVal?.length ? newVal : null);
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
            placeholder={placeholder ?? t('filterPlaceholder')}
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
            modifiers: [{ name: 'sameWidth', enabled: false }],
          },
          listbox: {
            sx: { direction },
          },
        }}
      />
      <ClearButton onClick={handleClear} visible={hasValue} />
    </Box>
  );
}
