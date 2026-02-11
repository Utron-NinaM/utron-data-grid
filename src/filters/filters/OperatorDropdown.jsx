import React, { useState } from 'react';
import { IconButton, Menu, MenuItem } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useTranslations } from '../../localization/useTranslations';
import { OPERATOR_MAP } from '../../config/schema';

/** Operator dropdown only (for header row next to column label) */
export function OperatorDropdown({ value, onChange }) {
  const t = useTranslations();
  const [anchor, setAnchor] = useState(null);  

  return (
    <>
      <IconButton size="small" onClick={(e) => setAnchor(e.currentTarget)} aria-label="Operator">
        <ArrowDropDownIcon />
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
