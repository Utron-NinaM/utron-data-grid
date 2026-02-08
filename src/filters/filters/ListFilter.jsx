import React from 'react';
import { Autocomplete, TextField, Checkbox, Chip, IconButton, Box } from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import ClearIcon from '@mui/icons-material/Clear';
import { useTranslations } from '../../localization/useTranslations';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

function getOptionLabel(o) {
  return typeof o === 'object' && o != null && o.label != null ? o.label : String(o);
}

export function ListFilter({ value, onChange, options, placeholder }) {
  const t = useTranslations();
  const selected = Array.isArray(value) ? value : value != null ? [value] : [];
  const listOptions = options ?? [];
  const hasValue = selected.length > 0;

  const handleClear = () => onChange(null);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, width: '100%', minWidth: 0 }}>
      <Autocomplete
        multiple
        size="small"
        options={listOptions}
        value={selected}
        disableCloseOnSelect
        getOptionLabel={getOptionLabel}
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
              {getOptionLabel(option)}
            </li>
          );
        }}
        renderTags={(value) =>
          value.map((option, index) => (
            <Chip key={index} label={getOptionLabel(option)} size="small" />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={placeholder ?? t('selectOption')}
            inputProps={{ ...params.inputProps, maxLength: 200 }}
          />
        )}
        sx={{
          flex: 1,
          minWidth: 0,
          overflow: 'hidden',
          boxSizing: 'border-box',
          '& .MuiInputBase-root': { minHeight: 40, overflow: 'hidden' },
          '& .MuiAutocomplete-tagList': { overflow: 'hidden', maxWidth: '100%' },
        }}
        slotProps={{
          popper: {
            disablePortal: false,
            sx: { minWidth: 'max-content' },
            modifiers: [{ name: 'sameWidth', enabled: false }],
          },
        }}
      />
      <IconButton size="small" onClick={handleClear} aria-label="Clear" sx={{ visibility: hasValue ? 'visible' : 'hidden', flexShrink: 0 }}>
        <ClearIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}
