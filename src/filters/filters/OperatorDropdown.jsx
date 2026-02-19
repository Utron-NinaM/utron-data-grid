import React, { useState } from 'react';
import { IconButton, Menu, MenuItem, Box } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslations } from '../../localization/useTranslations';
import { OPERATOR_EQUALS, OPERATOR_CONTAINS, OPERATOR_ICONS, DIRECTION_LTR, DIRECTION_RTL } from '../../config/schema';
import { useContext } from 'react';
import { DataGridStableContext } from '../../DataGrid/DataGridContext';
import {
  operatorDropdownRootSx,
  operatorDropdownButtonSx,
  operatorDropdownArrowIconSx,
  operatorIconBoxSx,
  getOperatorMenuItemBoxSx,
  operatorMenuItemLabelSx,
} from '../../utils/filterBoxStyles';

const DEFAULT_OPERATOR_FONT_SIZE = 13;

export function OperatorDropdown({ value, onChange, operatorMap }) {
  const ctx = useContext(DataGridStableContext);
  const direction = ctx?.direction ?? DIRECTION_LTR;
  const t = useTranslations();
  const [anchor, setAnchor] = useState(null);
  const defaultOperator = operatorMap?.includes(OPERATOR_CONTAINS) ? OPERATOR_CONTAINS : OPERATOR_EQUALS;
  const operator = value?.operator ?? defaultOperator;
  const fontSize = ctx?.fontSize ?? DEFAULT_OPERATOR_FONT_SIZE;

  const renderOperator = (op) => <FontAwesomeIcon icon={OPERATOR_ICONS[op]} fontSize="small" />;

  return (
    <Box sx={operatorDropdownRootSx}>
      <IconButton
        size="small"
        onClick={(e) => setAnchor(e.currentTarget)}
        aria-label="Operator"
        sx={operatorDropdownButtonSx}
      >
        <ArrowDropDownIcon sx={{ ...operatorDropdownArrowIconSx, fontSize }} />
        <Box component="span" sx={{ ...operatorIconBoxSx, fontSize }}>
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
            <Box sx={getOperatorMenuItemBoxSx(direction)}>
              <Box component="span" sx={{ direction }}>
                {renderOperator(op)}
              </Box>
              <Box component="span" sx={operatorMenuItemLabelSx}>
                {t(op)}
              </Box>
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}
