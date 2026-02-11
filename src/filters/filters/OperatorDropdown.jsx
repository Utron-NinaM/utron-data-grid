import React, { useState } from 'react';
import { IconButton, Menu, MenuItem, Box } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useTranslations } from '../../localization/useTranslations';
import { OPERATOR_MAP, OPERATOR_EQUALS } from '../../config/schema';

/** Operator dropdown only (for header row next to column label) */
export function OperatorDropdown({ value, onChange }) {
  const t = useTranslations();
  const [anchor, setAnchor] = useState(null);
  const operator = value?.operator ?? OPERATOR_EQUALS;

  return (
    <>
      <IconButton size="small" onClick={(e) => setAnchor(e.currentTarget)} aria-label="Operator">
        <ArrowDropDownIcon />
        <Box component="span" sx={{ fontSize: '0.875rem', minWidth: 20 }}>
          {operator}
        </Box>
      </IconButton>
      <Menu
        anchorEl={anchor}
        open={!!anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        {Object.keys(OPERATOR_MAP).map((op) => (
          <MenuItem
            key={op}
            onClick={() => {
              onChange({ ...value, operator: op });
              setAnchor(null);
            }}
          >
            {op} {t(OPERATOR_MAP[op])}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
