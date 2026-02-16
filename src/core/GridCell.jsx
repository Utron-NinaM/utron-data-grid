import React, { memo, useContext, useMemo } from 'react';
import { TableCell, Box, Tooltip } from '@mui/material';
import dayjs from 'dayjs';
import { ALIGN_LEFT, FIELD_TYPE_DATE, FIELD_TYPE_DATETIME } from '../config/schema';
import { DataGridStableContext } from '../DataGrid/DataGridContext';
import { getDateFormat, getDateTimeFormat } from '../utils/directionUtils';
import { DIRECTION_LTR } from '../config/schema';

const truncationSx = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  width: '100%',
  minWidth: 0,
};

/**
 * @param {Object} props
 * @param {*} props.value
 * @param {Object} props.row
 * @param {Object} props.column
 * @param {boolean} [props.isEditing]
 * @param {React.ReactNode} [props.editor]
 * @param {boolean} [props.hasError]
 */
function GridCellInner({ value, row, column, isEditing, editor, hasError }) {
  const ctx = useContext(DataGridStableContext);
  const columnAlignMap = ctx?.columnAlignMap;
  const direction = ctx?.direction ?? DIRECTION_LTR;

  const align = columnAlignMap?.get(column.field) ?? (column.align ?? ALIGN_LEFT);
  const sx = useMemo(() => {
    const cellStyle = typeof column.cellStyle === 'function' ? column.cellStyle(value, row) : column.cellStyle;
    return {
      paddingLeft: '4px',
      paddingRight: '4px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      ...(hasError && { border: '1px solid', borderColor: 'error.light' }),
      ...cellStyle,
    };
  }, [hasError, column, value, row]);

  const displayValue = useMemo(() => {
    if (isEditing && editor != null) return null;
    if (column.render) return column.render(value, row);
    const type = column.type;
    if ((type === FIELD_TYPE_DATE || type === FIELD_TYPE_DATETIME) && value != null) {
      const d = dayjs(value);
      if (d.isValid()) {
        const format = type === FIELD_TYPE_DATETIME ? getDateTimeFormat(direction) : getDateFormat(direction);
        return d.format(format);
      }
    }
    return String(value ?? '');
  }, [isEditing, editor, column, value, row, direction]);

  const tooltipText = useMemo(() => {
    if (isEditing && editor != null) return '';
    return React.isValidElement(displayValue) ? String(value ?? '') : String(displayValue ?? '');
  }, [displayValue, isEditing, editor, value]);

  const cellContent = useMemo(() => {
    if (isEditing && editor != null) {
      return editor;
    }

    const content = (
      <Box sx={truncationSx}>
        {displayValue}
      </Box>
    );

    return (
      <Tooltip title={tooltipText} arrow slotProps={{ tooltip: { sx: { fontSize: '13px' } } }}>
        <Box component="span" sx={{ display: 'block', width: '100%', minWidth: 0 }}>
          {content}
        </Box>
      </Tooltip>
    );
  }, [isEditing, editor, displayValue, tooltipText, truncationSx]);

  return (
    <TableCell align={align} sx={sx} padding="none" variant="body">
      {cellContent}
    </TableCell>
  );
}

export const GridCell = memo(GridCellInner);
