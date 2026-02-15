import React, { memo, useContext, useMemo } from 'react';
import { TableCell } from '@mui/material';
import dayjs from 'dayjs';
import { ALIGN_LEFT, FIELD_TYPE_DATE, FIELD_TYPE_DATETIME } from '../config/schema';
import { DataGridStableContext } from '../DataGrid/DataGridContext';
import { getDateFormat, getDateTimeFormat } from '../utils/directionUtils';
import { DIRECTION_LTR } from '../config/schema';
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
  const direction = ctx?.direction ?? DIRECTION_LTR ;

  const align = columnAlignMap?.get(column.field) ?? (column.align ?? ALIGN_LEFT);
  const sx = useMemo(() => {
    const cellStyle = typeof column.cellStyle === 'function' ? column.cellStyle(value, row) : undefined;
    return {
      paddingLeft: '4px',
      paddingRight: '4px',
      ...(hasError && { border: '1px solid', borderColor: 'error.light'}),
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

  return (
    <TableCell align={align} sx={sx} padding="none" variant="body">
      {isEditing && editor != null ? editor : displayValue}
    </TableCell>
  );
}

export const GridCell = memo(GridCellInner);
