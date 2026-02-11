import React, { useState } from 'react';
import { IconButton, Menu, MenuItem, Box } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useTranslations } from '../../localization/useTranslations';
import { OPERATOR_MAP, OPERATOR_EQUALS, DIRECTION_LTR, DIRECTION_RTL } from '../../config/schema';
import { useContext } from 'react';
import { DataGridStableContext } from '../../DataGrid/DataGridContext';

export function OperatorDropdown({ value, onChange }) {
  const ctx = useContext(DataGridStableContext);
  const direction = ctx?.direction ?? DIRECTION_LTR;
  const t = useTranslations();
  const [anchor, setAnchor] = useState(null);
  const operator = value?.operator ?? OPERATOR_EQUALS;
  const menuItemStyle = { display: 'flex', justifyContent: 'flex-start', flexDirection: direction === DIRECTION_RTL ? 'row-reverse' : 'row', width: '100%' };
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
            <Box sx={menuItemStyle}>
              <Box component="span" sx={{ direction: direction }}>
                {op}
              </Box>
              <Box component="span" sx={{ alignItems: 'start', paddingLeft: 1, paddingRight: 1 }}>
                {t(OPERATOR_MAP[op])}
              </Box>
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
