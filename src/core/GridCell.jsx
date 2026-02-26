import React, { memo, useContext, useMemo } from 'react';
import TableCell from '@mui/material/TableCell';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import dayjs from 'dayjs';
import { ALIGN_LEFT, FIELD_TYPE_DATE, FIELD_TYPE_DATETIME, FIELD_TYPE_LIST } from '../config/schema';
import { DataGridStableContext, ScrollContainerContext } from '../DataGrid/DataGridContext';
import { getDateFormat, getDateTimeFormat } from '../utils/directionUtils';
import { getOptionLabel } from '../utils/optionUtils';
import { DIRECTION_LTR } from '../config/schema';
import { DEFAULT_FONT_SIZE } from '../constants';
import { truncationSx, cellContentWrapperSx, editorWrapperSx, getBodyCellBaseSx } from './coreStyles';

/**
 * @param {*} displayValue
 * @param {*} value
 * @param {boolean} isEditing
 * @param {React.ReactNode} editor
 * @returns {string}
 */
export function getCellTooltipText(displayValue, value, isEditing, editor) {
  if (isEditing && editor != null) return '';
  const str = String(displayValue ?? '');
  if (str !== '[object Object]') return str;
  if (value != null && typeof value === 'object') {
    const label = getOptionLabel(value);
    if (label !== '[object Object]' && label !== '') return label;
    const vals = Object.values(value);
    if (vals.length === 1) {
      const v = vals[0];
      if (v != null && (typeof v === 'string' || typeof v === 'number')) return String(v);
    }
    try {
      return JSON.stringify(value);
    } catch {
      return str;
    }
  }
  return str;
}

/**
 * @param {Object} props
 * @param {*} props.value
 * @param {Object} props.row
 * @param {Object} props.column
 * @param {(value: *, row: Object) => string} [props.column.getTooltipText] - Optional. When set, used as tooltip text (e.g. for columns that render React elements or to show a label from value/row).
 * @param {boolean} [props.isEditing]
 * @param {React.ReactNode} [props.editor]
 * @param {boolean} [props.hasError]
 * @param {Object} [props.rowStyle] Row-specific sx (column rowStyle merged); column cellStyle overrides this
 * @param {boolean} [props.isSelected]
 * @param {Object} [props.selectedRowStyle] Selected row sx; overrides row and column style
 */
function GridCellInner({ value, row, column, isEditing, editor, hasError, rowStyle, isSelected, selectedRowStyle }) {
  const theme = useTheme();
  const ctx = useContext(DataGridStableContext);
  const scrollCtx = useContext(ScrollContainerContext);
  const columnAlignMap = ctx?.columnAlignMap;
  const columnWidthMap = ctx?.columnWidthMap;
  const bodyCellSxMap = ctx?.bodyCellSxMap;
  const direction = ctx?.direction ?? DIRECTION_LTR;

  const align = columnAlignMap?.get(column.field) ?? (column.align ?? ALIGN_LEFT);
  const width = columnWidthMap?.get(column.field);
  const bodyCellSx = bodyCellSxMap?.get(column.field);

  const sx = useMemo(() => {
    const cellStyle = typeof column.cellStyle === 'function' ? column.cellStyle(value, row) : column.cellStyle;
    const baseSx = bodyCellSx ?? getBodyCellBaseSx(width);
    const hasCustomSelected = selectedRowStyle && Object.keys(selectedRowStyle).length > 0;
    const appliedSelectedStyle =
      isSelected
        ? (hasCustomSelected ? selectedRowStyle : { backgroundColor: theme.palette.action.selected })
        : {};
    // Precedence: base → row style → column style → selected (hover is row-level via &:hover td)
    return {
      ...baseSx,
      ...(rowStyle ?? {}),
      ...(cellStyle ?? {}),
      ...appliedSelectedStyle,
      ...(hasError && { outlineWidth: '1px', outlineStyle: 'solid', outlineColor: 'error.light' }),
    };
  }, [hasError, column, value, row, width, bodyCellSx, rowStyle, isSelected, selectedRowStyle, theme]);

  const displayValue = useMemo(() => {
    if (isEditing && editor != null) return null;
    if (column.render) return column.render(value, row);
    const type = column.type;
    if (type === FIELD_TYPE_LIST && value != null) {
      const optionMap = ctx?.listColumnOptionMaps?.get(column.field);
      if (optionMap) {
        const option = optionMap.get(value);
        return option != null ? getOptionLabel(option) : String(value ?? '');
      }
    }
    if ((type === FIELD_TYPE_DATE || type === FIELD_TYPE_DATETIME) && value != null) {
      const d = dayjs(value);
      if (d.isValid()) {
        const format = type === FIELD_TYPE_DATETIME ? getDateTimeFormat(direction) : getDateFormat(direction);
        return d.format(format);
      }
    }
    if (value != null && typeof value === 'object') {
      const label = getOptionLabel(value);
      if (label !== '[object Object]') return label;
    }
    return String(value ?? '');
  }, [isEditing, editor, column, value, row, direction, ctx?.listColumnOptionMaps]);

  const tooltipText = useMemo(() => {
    if (typeof column.getTooltipText === 'function') {
      const custom = column.getTooltipText(value, row);
      if (custom != null && String(custom).trim() !== '') return String(custom).trim();
    }
    return getCellTooltipText(displayValue, value, isEditing, editor);
  }, [column, value, row, displayValue, isEditing, editor]);

  const popperContainer = (scrollCtx?.ready && scrollCtx?.ref?.current) ? scrollCtx.ref.current : undefined;
  const cellContent = useMemo(() => {
    if (isEditing && editor != null) {
      return (
        <Box sx={editorWrapperSx}>
          {editor}
        </Box>
      );
    }

    const content = (
      <Box sx={truncationSx}>
        {displayValue}
      </Box>
    );
    // When body scroll is contained, mount tooltip in scroll container so it clips and scrolls with rows
    const popperProps = popperContainer
      ? { container: popperContainer, popperOptions: { strategy: 'absolute' } }
      : { disablePortal: true, popperOptions: { strategy: 'absolute' } };

    return (
      <Tooltip title={tooltipText} arrow PopperProps={popperProps} placement="top"
        slotProps={{ tooltip: { sx: { fontSize: `${ctx?.fontSize ?? DEFAULT_FONT_SIZE}px` } } }}>
        <Box component="span" sx={cellContentWrapperSx}>
          {content}
        </Box>
      </Tooltip>
    );
  }, [isEditing, editor, displayValue, tooltipText, popperContainer, ctx?.fontSize]);

  return (
    <TableCell align={align} sx={sx} padding="none" variant="body">
      {cellContent}
    </TableCell>
  );
}

export const GridCell = memo(GridCellInner);
