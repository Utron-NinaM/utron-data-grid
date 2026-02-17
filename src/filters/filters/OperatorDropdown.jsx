import React, { useState } from 'react';
import { IconButton, Menu, MenuItem, Box } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslations } from '../../localization/useTranslations';
import { OPERATOR_EQUALS, OPERATOR_CONTAINS, OPERATOR_ICONS, DIRECTION_LTR, DIRECTION_RTL } from '../../config/schema';
import { useContext } from 'react';
import { DataGridStableContext } from '../../DataGrid/DataGridContext';

export function OperatorDropdown({ value, onChange, operatorMap }) {
  const ctx = useContext(DataGridStableContext);
  const direction = ctx?.direction ?? DIRECTION_LTR;
  const t = useTranslations();
  const [anchor, setAnchor] = useState(null);
  const defaultOperator = operatorMap?.includes(OPERATOR_CONTAINS) ? OPERATOR_CONTAINS : OPERATOR_EQUALS;
  const operator = value?.operator ?? defaultOperator;
  const menuItemStyle = { display: 'flex', justifyContent: 'flex-start', flexDirection: direction === DIRECTION_RTL ? 'row-reverse' : 'row', width: '100%' };

  const renderOperator = (op) => <FontAwesomeIcon icon={OPERATOR_ICONS[op]} fontSize="small" />;

  return (
    <Box sx={{ paddingLeft: '1px', paddingRight: '1px' }}>
      <IconButton size="small" onClick={(e) => setAnchor(e.currentTarget)} aria-label="Operator" sx={{ boxSizing: 'border-box', paddingLeft: '1px', paddingRight: '1px' }}>
        <ArrowDropDownIcon />
        <Box component="span" sx={{ fontSize: '0.875rem', minWidth: 20 }}>
          {renderOperator(operator)}
        </Box>
      </IconButton>
      <Menu
        anchorEl={anchor}
        open={!!anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        {operatorMap.map((op) => (
          <MenuItem
            key={op}
            onClick={() => {
              onChange({ ...value, operator: op });
              setAnchor(null);
            }}
          >
            <Box sx={menuItemStyle}>
              <Box component="span" sx={{ direction: direction }}>
                {renderOperator(op)}
              </Box>
              <Box component="span" sx={{ alignItems: 'start', paddingLeft: 1, paddingRight: 1 }}>
                {t(op)}
              </Box>
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}
