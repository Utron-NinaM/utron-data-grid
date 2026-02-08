import React from 'react';
import { Autocomplete, TextField, Checkbox } from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { useTranslations } from '../../localization/useTranslations';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

export function ListFilter({ value, onChange, options, placeholder }) {
  const t = useTranslations();
  const selected = Array.isArray(value) ? value : value != null ? [value] : [];
  const listOptions = options ?? [];

  return (
    <Autocomplete
      multiple
      size="small"
      options={listOptions}
      value={selected}
      disableCloseOnSelect
      getOptionLabel={(o) => (typeof o === 'object' && o != null && o.label != null ? o.label : String(o))}
      onChange={(_, newVal) => onChange(newVal?.length ? newVal : null)}
      renderOption={(props, option, { selected: isSelected }) => {
        const { key, ...restProps } = props;
        return (
          <li key={key} {...restProps}>
            <Checkbox
              icon={icon}
              checkedIcon={checkedIcon}
              style={{ marginRight: 8 }}
              checked={isSelected}
            />
            {typeof option === 'object' && option != null && option.label != null ? option.label : String(option)}
          </li>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={placeholder ?? t('selectOption')}
          inputProps={{ ...params.inputProps, maxLength: 200 }}
          />
      )}
      sx={{ width: '100%', minWidth: 0, '& .MuiInputBase-root': { minHeight: 40 } }}
      slotProps={{
        popper: {
          disablePortal: false,
          sx: { minWidth: 'max-content' },
          modifiers: [{ name: 'sameWidth', enabled: false }],
        },
      }}
    />
  );
}
