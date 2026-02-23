import { alpha, getLuminance } from '@mui/system/colorManipulator';
import { DIRECTION_RTL } from '../config/schema';

export function getResizeLineColor(columnBackground, theme) {
  if (columnBackground && typeof columnBackground === 'string' && theme?.palette) {
    try {
      const luminance = getLuminance(columnBackground);
      if (luminance < 0.3) {
        const white = theme.palette.common?.white;
        if (white) return alpha(white, 0.5);
      }
    } catch {
      /* fall through */
    }
  }
  if (theme?.palette?.divider) {
    try {
      return theme.palette.divider;
    } catch {
      /* fall through */
    }
  }
  return 'rgba(0, 0, 0, 0.1)';
}

// ----- GridTable -----

export function getToolbarBoxSx(containScroll) {
  return {
    ...(containScroll ? {} : { position: 'sticky', top: 0, zIndex: 3 }),
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    py: 0.5,
    pb: 1.5,
    backgroundColor: 'background.paper',
  };
}

export const toolbarActionsBoxSx = { display: 'flex', gap: 1 };

export function getTableContainerSx(enableHorizontalScroll, totalWidth, opts = {}) {
  const { hideTopBorder, noScroll } = opts;
  return {
    overflowX: noScroll ? 'visible' : (enableHorizontalScroll ? 'scroll' : 'visible'),
    overflowY: 'visible',
    width: '100%',
    ...(totalWidth && enableHorizontalScroll && { minWidth: `${totalWidth}px` }),
    borderRight: 'none',
    borderLeft: 'none',
    ...(hideTopBorder && { borderTop: 'none' }),
  };
}

export function getTableSx(totalWidth, enableHorizontalScroll) {
  return {
    width: '100%',
    tableLayout: 'fixed',
    ...(totalWidth && enableHorizontalScroll && { minWidth: `${totalWidth}px` }),
  };
}

export function getTableHeadSx(containScroll, headerConfig) {
  return {
    ...headerConfig?.base,
    position: containScroll ? 'relative' : 'sticky',
    top: containScroll ? 0 : 45,
    zIndex: 2,
    backgroundColor: headerConfig?.mainRow?.backgroundColor ?? headerConfig?.base?.backgroundColor ?? 'background.paper',
  };
}

export function getMainHeaderRowSx(headerConfig, hasFilterRow) {
  return {
    ...(headerConfig?.mainRow?.backgroundColor && { backgroundColor: headerConfig.mainRow.backgroundColor }),
    ...(hasFilterRow && { '& .MuiTableCell-root': { borderBottom: 'none' } }),
  };
}

export function getHeaderCheckboxCellSx(headerConfig, rowType = 'mainRow') {
  const bgKey = rowType === 'filterRows' ? 'filterRows' : 'mainRow';
  const rowConfig = headerConfig?.[bgKey] ?? {};
  const { backgroundColor: rowBg, ...rowSx } = rowConfig;
  return {
    ...headerConfig?.base,
    backgroundColor: rowBg || headerConfig?.base?.backgroundColor || 'inherit',
    ...rowSx,
  };
}

export function getFilterRowSx(headerConfig) {
  return {
    backgroundColor: headerConfig?.filterRows?.backgroundColor ?? headerConfig?.mainRow?.backgroundColor ?? headerConfig?.base?.backgroundColor ?? 'background.paper',
  };
}

/** Header wrapper when containScroll: syncs horizontal scroll with body, hides own scrollbar, reserves space for body scrollbar */
export function getHeaderScrollWrapperSx(direction, scrollbarWidth) {
  const padding = scrollbarWidth && scrollbarWidth > 0 ? scrollbarWidth : 0;
  return {
    overflowX: 'auto',
    overflowY: 'hidden',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    '&::-webkit-scrollbar': { display: 'none' },
    ...(padding > 0 && (direction === DIRECTION_RTL ? { paddingLeft: padding } : { paddingRight: padding })),
  };
}

export const scrollContainerSx = {
  flex: 1,
  minHeight: 0,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
};

export function getScrollInnerBoxSx(enableHorizontalScroll) {
  return {
    flex: 1,
    minHeight: 0,
    minWidth: 0,
    position: 'relative',
    overflow: 'auto',
    overflowX: enableHorizontalScroll ? 'scroll' : 'auto',
    // Reserve scrollbar space so width is stable when switching page size (10→25 rows); prevents brief horizontal scroll flash
    scrollbarGutter: 'stable',
  };
}

// ----- GridCell -----

export const truncationSx = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  width: '100%',
  minWidth: 0,
};

export const cellContentWrapperSx = { display: 'block', width: '100%', minWidth: 0 };

// ----- GridHeaderCell -----

export const headerCellBaseSx = { paddingLeft: '4px', paddingRight: '4px', position: 'relative' };

export function getHeaderInnerBoxSx(mainRowHeight, headerComboSlot) {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    flexWrap: headerComboSlot ? 'nowrap' : 'wrap',
    py: mainRowHeight ? 0 : 0.5,
    boxSizing: 'border-box',
    height: '100%',
  };
}

export const sortLabelSx = { minHeight: 20, minWidth: 0, overflow: 'hidden', flexShrink: 0 };

export const headerLabelSx = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  display: 'block',
  width: '100%',
};

export const sortOrderBadgeSx = { ml: 0.25, fontSize: '0.75rem', opacity: 0.8, flexShrink: 0 };

export const flexSpacerSx = { flex: 1, minWidth: 0 };

export function getResizeHandleSx(direction, columnBackground, theme) {
  const isRTL = direction === DIRECTION_RTL;
  const base = getResizeLineColor(columnBackground, theme);
  const hover = alpha(base, 0.85);
  return {
    position: 'absolute',
    top: 0,
    [isRTL ? 'left' : 'right']: '-4px',
    width: '8px',
    height: '100%',
    cursor: 'col-resize',
    zIndex: 2,
    backgroundColor: 'transparent',

    '&::after': {
      content: '""',
      position: 'absolute',
      top: '15%',
      ...(isRTL ? { right: '2px' } : { left: '2px' }),
      width: '2px',
      height: '70%',
      backgroundColor: base,
      pointerEvents: 'none',
    },

    '&:hover::after': {
      backgroundColor: hover,
    },
  };
}