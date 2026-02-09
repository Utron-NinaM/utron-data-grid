import React, { useState } from 'react';
import { IconButton, Box, Menu, MenuItem } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useTranslations } from '../../localization/useTranslations';
import { OPERATORS, OPERATOR_EQUALS, OPERATOR_IN_RANGE, OPERATOR_MAP } from '../../config/schema';

/** Operator dropdown only (for header row next to column label) */
export function OperatorDropdown({ value, onChange }) {
  const t = useTranslations();
  const [anchor, setAnchor] = useState(null);
  const operator = value?.operator ?? OPERATOR_EQUALS;

  return (
    <>
      <IconButton size="small" onClick={(e) => setAnchor(e.currentTarget)} aria-label="Operator">
        <ArrowDropDownIcon />
      </IconButton>
      <Box component="span" sx={{ fontSize: '0.875rem', minWidth: 20 }}>
        {operator === OPERATOR_IN_RANGE ? '…' : operator}
      </Box>
      <Menu
        anchorEl={anchor}
        open={!!anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        {OPERATORS.map((op) => (
          <MenuItem
            key={op}
            onClick={() => {
              onChange({ ...value, operator: op });
              setAnchor(null);
            }}
          >
            {op === OPERATOR_IN_RANGE ? '…' : op} {t(OPERATOR_MAP[op] || op)}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
