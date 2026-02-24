import { alpha, getLuminance } from '@mui/system/colorManipulator';
import { DIRECTION_RTL } from '../config/schema';
import {
  HEADER_STICKY_TOP_PX,
  SORT_LABEL_MIN_HEIGHT,
  SORT_LABEL_MIN_WIDTH,
  SORT_ORDER_BADGE_FONT_SIZE_REM,
  SORT_ORDER_BADGE_OPACITY,
  HEADER_CELL_PADDING,
  RESIZE_HANDLE_WIDTH_PX,
  RESIZE_HANDLE_OFFSET_PX,
  RESIZE_LINE_WIDTH_PX,
  RESIZE_LINE_INSET_PX,
  RESIZE_LINE_TOP_PERCENT,
  RESIZE_LINE_HEIGHT_PERCENT,
  LUMINANCE_DARK_THRESHOLD,
  RESIZE_LINE_HOVER_ALPHA,
  DIVIDER_ALPHA,
} from '../constants';

export function getResizeLineColor(columnBackground, theme) {
  if (columnBackground && typeof columnBackground === 'string' && theme?.palette) {
    try {
      const luminance = getLuminance(columnBackground);
      if (luminance < LUMINANCE_DARK_THRESHOLD) {
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
  return `rgba(0, 0, 0, ${DIVIDER_ALPHA})`;
}

// ----- GridTable -----

export function getToolbarBoxSx(containScroll) {
  return {
    ...(containScroll ? {} : { position: 'sticky', top: 0, zIndex: 3 }),
    flexShrink: 0,
    minWidth: 0,
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
  const { hideTopBorder, noScroll, constrainToParent } = opts;
  return {
    overflowX: noScroll ? 'visible' : (enableHorizontalScroll ? 'scroll' : 'visible'),
    overflowY: 'visible',
    width: '100%',
    ...(totalWidth && enableHorizontalScroll && !constrainToParent && { minWidth: `${totalWidth}px` }),
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
    top: containScroll ? 0 : HEADER_STICKY_TOP_PX,
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

/** Header wrapper when containScroll: syncs horizontal scroll with body, hides own scrollbar unless showScrollbar, reserves space for body scrollbar */
export function getHeaderScrollWrapperSx(direction, scrollbarWidth, showScrollbar = false) {
  const padding = scrollbarWidth && scrollbarWidth > 0 ? scrollbarWidth : 0;
  return {
    minWidth: 0,
    overflowX: 'auto',
    overflowY: 'hidden',
    ...(showScrollbar ? {} : {
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
      '&::-webkit-scrollbar': { display: 'none' },
    }),
    ...(padding > 0 && (direction === DIRECTION_RTL ? { paddingLeft: padding } : { paddingRight: padding })),
  };
}

export const scrollContainerSx = {
  flex: 1,
  minHeight: 0,
  minWidth: 0,
  overflowX: 'hidden',
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
    overflowX: 'hidden',//enableHorizontalScroll ? 'scroll' : 'auto',
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

export const headerCellBaseSx = { paddingLeft: HEADER_CELL_PADDING, paddingRight: HEADER_CELL_PADDING, position: 'relative' };

export function getHeaderInnerBoxSx(mainRowHeight, headerComboSlot) {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 0,
    flexWrap: 'nowrap',
    overflow: 'hidden',
    minHeight: 0,
    py: mainRowHeight ? 0 : 0.5,
    boxSizing: 'border-box',
    height: '100%',
  };
}

export const sortLabelSx = { minHeight: SORT_LABEL_MIN_HEIGHT, minWidth: SORT_LABEL_MIN_WIDTH, overflow: 'hidden', flex: `1 1 ${SORT_LABEL_MIN_WIDTH}px` };

export const headerLabelSx = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  display: 'block',
  width: '100%',
};

export const sortOrderBadgeSx = { fontSize: `${SORT_ORDER_BADGE_FONT_SIZE_REM}rem`, opacity: SORT_ORDER_BADGE_OPACITY, flexShrink: 0 };

export const flexSpacerSx = { flex: '0 1 0', minWidth: 0 };

export function getResizeHandleSx(direction, columnBackground, theme) {
  const isRTL = direction === DIRECTION_RTL;
  const base = getResizeLineColor(columnBackground, theme);
  const hover = alpha(base, RESIZE_LINE_HOVER_ALPHA);
  return {
    position: 'absolute',
    top: 0,
    [isRTL ? 'left' : 'right']: `${RESIZE_HANDLE_OFFSET_PX}px`,
    width: `${RESIZE_HANDLE_WIDTH_PX}px`,
    height: '100%',
    cursor: 'col-resize',
    zIndex: 2,
    backgroundColor: 'transparent',

    '&::after': {
      content: '""',
      position: 'absolute',
      top: RESIZE_LINE_TOP_PERCENT,
      ...(isRTL ? { right: `${RESIZE_LINE_INSET_PX}px` } : { left: `${RESIZE_LINE_INSET_PX}px` }),
      width: `${RESIZE_LINE_WIDTH_PX}px`,
      height: RESIZE_LINE_HEIGHT_PERCENT,
      backgroundColor: base,
      pointerEvents: 'none',
    },

    '&:hover::after': {
      backgroundColor: hover,
    },
  };
}