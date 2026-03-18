import React, { memo, useContext, useMemo } from 'react';
import TableCell from '@mui/material/TableCell';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import ErrorIcon from '@mui/icons-material/Error';
import dayjs from 'dayjs';
import { ALIGN_LEFT, FIELD_TYPE_DATE, FIELD_TYPE_DATETIME, FIELD_TYPE_LIST, DIRECTION_RTL } from '../config/schema';
import { DataGridStableContext, ScrollContainerContext } from '../DataGrid/DataGridContext';
import { getDateFormat, getDateTimeFormat } from '../utils/directionUtils';
import { getOptionLabel, getOptionValue } from '../utils/optionUtils';
import { DIRECTION_LTR } from '../config/schema';
import { DEFAULT_FONT_SIZE, TOOLTIP_OVER_HEADER_Z_INDEX } from '../constants';
import { truncationSx, cellContentWrapperSx, editorWrapperSx, editorInnerBoxSx, getBodyCellBaseSx, getErrorIconSx } from './coreStyles';

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
 * @param {boolean} [props.hasError] Field-level error flag (row-level errors are handled at row level, not cell level)
 * @param {string[]} [props.errorMessages] Field-level validation messages for tooltip when hasError
 * @param {Object} [props.rowStyle] Row-specific sx (column rowStyle merged); column cellStyle overrides this
 */
function GridCellInner({ value, row, column, isEditing, editor, hasError, errorMessages = [], rowStyle }) {
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
    return {
      ...baseSx,
      ...(rowStyle ?? {}),
      ...(cellStyle ?? {}),
      ...(hasError && {
        boxShadow: (theme) => `inset 0 0 0 1px ${theme.palette.error.light}`,
      }),
    };
  }, [hasError, column, value, row, width, bodyCellSx, rowStyle]);

  const displayValue = useMemo(() => {
    if (isEditing && editor != null) return null;
    if (column.render) return column.render(value, row);
    const type = column.type;
    if (type === FIELD_TYPE_LIST && value != null) {
      const optionMap = ctx?.listColumnOptionMaps?.get(column.field);
      if (optionMap) {
        const option = optionMap.get(value);
        if (option == null) return String(value ?? '');
        return column.listDescriptionField ? String(getOptionValue(option)) : getOptionLabel(option);
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

  const contentTooltipText = useMemo(() => {
    if (hasError && errorMessages?.length) return '';
    if (typeof column.getTooltipText === 'function') {
      const custom = column.getTooltipText(value, row);
      if (custom != null && String(custom).trim() !== '') return String(custom).trim();
    }
    return getCellTooltipText(displayValue, value, isEditing, editor);
  }, [hasError, errorMessages, column, value, row, displayValue, isEditing, editor]);

  const errorTooltipText = useMemo(() => {
    return hasError && errorMessages?.length ? errorMessages.join('\n') : '';
  }, [hasError, errorMessages]);

  const isRTL = direction === DIRECTION_RTL;

  // Use scroll container as Popper boundary when in containScroll so flip/preventOverflow keep tooltips visible (no clipping on first rows)
  const scrollBoundaryEl = scrollCtx?.scrollContainerRef?.current ?? null;
  const popperProps = useMemo(() => {
    const baseOptions = { strategy: 'absolute' };
    if (scrollBoundaryEl) {
      baseOptions.modifiers = [
        { name: 'flip', options: { boundary: scrollBoundaryEl } },
        { name: 'preventOverflow', options: { boundary: scrollBoundaryEl } },
      ];
    }
    return { disablePortal: true, popperOptions: baseOptions };
  }, [scrollBoundaryEl]);

  // Shared tooltip props for error icons
  const errorTooltipProps = useMemo(() => ({
    title: errorTooltipText,
    arrow: true,
    PopperProps: popperProps,
    placement: 'top',
    disableInteractive: true,
    slotProps: {
      tooltip: { sx: { fontSize: `${ctx?.fontSize ?? DEFAULT_FONT_SIZE}px` } },
      popper: { sx: { pointerEvents: 'none', zIndex: TOOLTIP_OVER_HEADER_Z_INDEX } },
    },
  }), [errorTooltipText, popperProps, ctx?.fontSize]);

  // Shared tooltip props factory for content
  const getContentTooltipProps = useMemo(() => {
    const baseProps = {
      arrow: true,
      PopperProps: popperProps,
      placement: 'top',
      disableInteractive: true,
      slotProps: {
        tooltip: { sx: { fontSize: `${ctx?.fontSize ?? DEFAULT_FONT_SIZE}px` } },
        popper: { sx: { pointerEvents: 'none', zIndex: TOOLTIP_OVER_HEADER_Z_INDEX } },
      },
    };
    return (title) => ({ ...baseProps, title });
  }, [popperProps, ctx?.fontSize]);

  // Reusable error icon component
  const errorIcon = useMemo(() => {
    if (!hasError || !errorMessages?.length) return null;
    return (
      <Tooltip {...errorTooltipProps}>
        <ErrorIcon
          sx={getErrorIconSx(isRTL)}
          aria-label="Validation error"
        />
      </Tooltip>
    );
  }, [hasError, errorMessages, errorTooltipProps, isRTL]);

  const cellContent = useMemo(() => {
    if (isEditing && editor != null) {
      // When editing, show editor and error icon if needed
      return (
        <Box sx={editorWrapperSx}>
          <Box sx={editorInnerBoxSx}>
            {editor}
          </Box>
          {errorIcon}
        </Box>
      );
    }

    const content = (
      <Box sx={truncationSx}>
        {displayValue}
      </Box>
    );

    const contentWrapper = (
      <Box component="span" sx={{ flex: 1, minWidth: 0 }}>
        {content}
      </Box>
    );

    return (
      <Box component="span" sx={cellContentWrapperSx}>
        {contentTooltipText ? (
          <Tooltip {...getContentTooltipProps(contentTooltipText)}>
            {contentWrapper}
          </Tooltip>
        ) : (
          contentWrapper
        )}
        {errorIcon}
      </Box>
    );
  }, [isEditing, editor, displayValue, contentTooltipText, errorIcon, getContentTooltipProps]);

  return (
    <TableCell align={align} sx={sx} padding="none" variant="body" aria-invalid={hasError || undefined}>
      {cellContent}
    </TableCell>
  );
}

export const GridCell = memo(GridCellInner);
