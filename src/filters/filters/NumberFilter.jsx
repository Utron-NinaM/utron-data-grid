import React, { useState } from 'react';
import { TextField, Menu, MenuItem, IconButton, Box } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ClearIcon from '@mui/icons-material/Clear';
import { useTranslations } from '../../localization/useTranslations';
import { NUMBER_OPERATORS } from '../../config/schema';

const MAX_INPUT_LENGTH = 50;

const operatorMap = {
  '=': 'operatorEquals',
  '!=': 'operatorNotEqual',
  '>': 'operatorGreaterThan',
  '<': 'operatorLessThan',
  '>=': 'operatorGreaterOrEqual',
  '<=': 'operatorLessOrEqual',
  inRange: 'operatorInRange',
};

/** Operator dropdown only (for header row next to column label) */
export function NumberOperatorDropdown({ value, onChange }) {
  const t = useTranslations();
  const [anchor, setAnchor] = useState(null);
  const operator = value?.operator ?? '=';

  return (
    <>
      <IconButton size="small" onClick={(e) => setAnchor(e.currentTarget)} aria-label="Operator">
        <ArrowDropDownIcon />
      </IconButton>
      <Box component="span" sx={{ fontSize: '0.875rem', minWidth: 20 }}>
        {operator === 'inRange' ? '…' : operator}
      </Box>
      <Menu
        anchorEl={anchor}
        open={!!anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        {NUMBER_OPERATORS.map((op) => (
          <MenuItem
            key={op}
            onClick={() => {
              onChange({ ...value, operator: op });
              setAnchor(null);
            }}
          >
            {op === 'inRange' ? '…' : op} {t(operatorMap[op] || op)}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

/** Value input (from only) + clear. "To" is rendered in separate header row when inRange. */
export function NumberFilterInputs({ value, onChange, placeholder }) {
  const val = value?.value ?? '';

  const handleChange = (next) => {
    onChange({ ...value, ...next });
  };

  const handleClear = () => onChange(null);

  const hasValue = value != null && ((value.value !== undefined && value.value !== '') || (value.valueTo !== undefined && value.valueTo !== ''));

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, width: '100%', minWidth: 0 }}>
      <TextField
        size="small"
        type="number"
        placeholder={placeholder}
        value={val}
        onChange={(e) => handleChange({ value: e.target.value })}
        sx={{ flex: 1, minWidth: 0 }}
        inputProps={{ maxLength: MAX_INPUT_LENGTH }}
      />
      {hasValue && (
        <IconButton size="small" onClick={handleClear} aria-label="Clear">
          <ClearIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
}

/** "To" value input only (for in-range second header row) */
export function NumberFilterToInput({ value, onChange }) {
  const valueTo = value?.valueTo ?? '';

  const handleChange = (next) => {
    onChange({ ...value, ...next });
  };

  const handleClear = () => onChange(null);

  const hasValue = value != null && (value.valueTo !== undefined && value.valueTo !== '');

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, width: '100%', minWidth: 0 }}>
      <TextField
        size="small"
        type="number"
        placeholder="To"
        value={valueTo}
        onChange={(e) => handleChange({ valueTo: e.target.value })}
        sx={{ flex: 1, minWidth: 0 }}
        inputProps={{ maxLength: MAX_INPUT_LENGTH }}
      />
      {hasValue && (
        <IconButton size="small" onClick={handleClear} aria-label="Clear">
          <ClearIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
}

export function NumberFilter({ value, onChange, placeholder }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <NumberOperatorDropdown value={value} onChange={onChange} />
      <NumberFilterInputs value={value} onChange={onChange} placeholder={placeholder} />
    </Box>
  );
}
