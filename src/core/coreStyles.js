import { alpha, getLuminance } from '@mui/system/colorManipulator';
import { DIRECTION_RTL } from '../config/schema';
import {
  HEADER_STICKY_TOP_PX,
  SORT_LABEL_MIN_HEIGHT,
  SORT_LABEL_MIN_WIDTH,
  SORT_ORDER_BADGE_FONT_SIZE_REM,
  SORT_ORDER_BADGE_OPACITY,
  HEADER_CELL_PADDING,
  HEADER_CELL_PADDING_PX,
  CHECKBOX_COLUMN_WIDTH_PX,
  RESIZE_HANDLE_WIDTH_PX,
  RESIZE_HANDLE_OFFSET_PX,
  RESIZE_LINE_WIDTH_PX,
  RESIZE_LINE_INSET_PX,
  RESIZE_LINE_TOP_PERCENT,
  RESIZE_LINE_HEIGHT_PERCENT,
  LUMINANCE_DARK_THRESHOLD,
  RESIZE_LINE_HOVER_ALPHA,
  DIVIDER_ALPHA,
  HEADER_Z_INDEX,
  TOOLTIP_OVER_HEADER_Z_INDEX,
  TOOLBAR_CLEAR_BUTTON_DISABLED_COLOR,
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

/** Thinner native horizontal scrollbar (Firefox `scrollbar-width: thin` + WebKit track height). */
export const gentleHorizontalScrollbarSx = {
  scrollbarWidth: 'thin',
  scrollbarColor: (theme) =>
    `${alpha(theme.palette.text.primary, 0.2)} ${alpha(theme.palette.divider, 0.06)}`,
  '&::-webkit-scrollbar:horizontal': {
    height: 5,
  },
  '&::-webkit-scrollbar-thumb:horizontal': {
    borderRadius: 3,
    backgroundColor: (theme) => alpha(theme.palette.text.primary, 0.2),
  },
  '&::-webkit-scrollbar-track:horizontal': {
    backgroundColor: (theme) => alpha(theme.palette.divider, 0.05),
  },
};

// ----- GridTable -----

export function getToolbarBoxSx(containScroll) {
  return {
    ...(containScroll ? {} : { position: 'sticky', top: 0, zIndex: TOOLTIP_OVER_HEADER_Z_INDEX }),
    flexShrink: 0,
    minWidth: 0,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 1,
    py: 0.5,
    pb: 1.5,
    backgroundColor: 'background.paper',
  };
}

export const toolbarLeftBoxSx = { display: 'flex', justifyContent: 'flex-start', gap: 2 , alignItems: 'flex-end'};
export const toolbarActionsBoxSx = { display: 'flex', gap: 1 };

/** Row above toolbar: optional title + multi-select summary grouped at inline-start; inherits dir from root for LTR/RTL */
export function getOutsideGridHeaderRowSx() {
  return {
    flexShrink: 0,
    minWidth: 0,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 1,
    pt: 1,
    pb: 0,
    px: 0.5,
    backgroundColor: 'background.paper',
  };
}

export function getTableContainerSx(enableHorizontalScroll, totalWidth, opts = {}) {
  const { hideTopBorder, noScroll, constrainToParent } = opts;
  const horizontalScrollOnContainer = Boolean(enableHorizontalScroll && !noScroll);
  return {
    overflowX: noScroll ? 'visible' : (enableHorizontalScroll ? 'scroll' : 'visible'),
    overflowY: 'visible',
    width: '100%',
    ...(totalWidth && enableHorizontalScroll && !constrainToParent && { minWidth: `${totalWidth}px` }),
    borderRight: 'none',
    borderLeft: 'none',
    ...(hideTopBorder && { borderTop: 'none' }),
    ...(horizontalScrollOnContainer && gentleHorizontalScrollbarSx),
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
    zIndex: HEADER_Z_INDEX,
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
    boxSizing: 'border-box',
    width: `${CHECKBOX_COLUMN_WIDTH_PX}px`,
    minWidth: `${CHECKBOX_COLUMN_WIDTH_PX}px`,
    padding: '0 !important',
    paddingLeft: `${HEADER_CELL_PADDING_PX}px !important`,
    paddingRight: `${HEADER_CELL_PADDING_PX}px !important`,
    paddingInlineStart: `${HEADER_CELL_PADDING_PX}px !important`,
    paddingInlineEnd: `${HEADER_CELL_PADDING_PX}px !important`,
  };
}

export function getFilterRowSx(headerConfig) {
  return {
    backgroundColor: headerConfig?.filterRows?.backgroundColor ?? headerConfig?.mainRow?.backgroundColor ?? headerConfig?.base?.backgroundColor ?? 'background.paper',
  };
}

/** Header wrapper when containScroll: horizontal scroll synced with body; scrollbar hidden when showScrollbar is false (default).
 *  Vertical-scrollbar padding compensation is applied imperatively by measureScrollbarWidth in GridTable. */
export function getHeaderScrollWrapperSx(showScrollbar = false) {
  return {
    minWidth: 0,
    overflowX: 'auto',
    overflowY: 'hidden',
    ...(showScrollbar ? {} : {
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
      '&::-webkit-scrollbar': { display: 'none' },
    }),
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

/**
 * @param {boolean} enableHorizontalScroll
 * @param {{ showHorizontalScrollbar?: boolean }} [opts] - When showHorizontalScrollbar and enableHorizontalScroll, horizontal overflow is on this box (scrollbar at bottom of grid viewport).
 */
export function getScrollInnerBoxSx(enableHorizontalScroll, opts = {}) {
  const { showHorizontalScrollbar = false } = opts;
  const horizontalOnBody = Boolean(enableHorizontalScroll && showHorizontalScrollbar);
  return {
    flex: 1,
    minHeight: 0,
    minWidth: 0,
    position: 'relative',
    overflow: 'auto',
    overflowX: horizontalOnBody ? 'auto' : 'hidden',
    // scrollbarGutter: 'stable' removed — in RTL Chrome it initializes body scrollLeft at -scrollbarWidth
    // instead of 0, causing a transient misalignment between header and body on mount.
    // Padding compensation is applied imperatively by measureScrollbarWidth (no layout flash).
    ...(horizontalOnBody && gentleHorizontalScrollbarSx),
  };
}

export function getBodyRowHeightSx(height) {
  if (height == null) return null;
  return {
    height: `${height}px`,
    maxHeight: `${height}px`,
    minHeight: 0,
    overflow: 'hidden',
  };
}

/** Inner wrapper for body scroll area: full logical height so scrollHeight is correct (virtualization-ready). */
export function getBodyScrollInnerHeightSx(totalBodyHeight) {
  return {
    height: totalBodyHeight,
    minHeight: totalBodyHeight,
  };
}

/** Translated layer for body content: positions visible slice (virtualization-ready). */
export function getBodyTranslatedLayerSx(offsetY) {
  return {
    transform: `translateY(${offsetY}px)`,
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

export const cellContentWrapperSx = {
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  minWidth: 0,
};

export const editorWrapperSx = {
  height: '100%',
  minHeight: 0,
  overflow: 'hidden',
  width: '100%',
  minWidth: 0,
  display: 'flex',
  alignItems: 'center',
};

export const editorInnerBoxSx = {
  flex: 1,
  minWidth: 0,
  minHeight: 0,
  height: '100%',
  overflow: 'hidden',
};

export function getErrorIconSx(isRTL) {
  return {
  fontSize: '1.2rem',
  color: 'error.light',
  flexShrink: 0,
  ...(isRTL ? { marginRight: '4px' } : { marginLeft: '4px' }),
  };
}

/** Default body cell base sx when bodyCellSx is not provided. width in px optional. */
export function getBodyCellBaseSx(width) {
  return {
    paddingLeft: '4px',
    paddingRight: '4px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    ...(width != null && { width: typeof width === 'string' ? width : `${width}px` }),
  };
}

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
    zIndex: HEADER_Z_INDEX,
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

// ----- Toolbar clear / export -----

/** Outlined toolbar clear buttons use MUI default color=primary; hover bg uses .MuiButton-outlinedPrimary:hover (higher specificity than bare &:hover). */
const TOOLBAR_CLEAR_OUTLINED_PRIMARY_HOVER = '&.MuiButton-outlinedPrimary:hover';
const TOOLBAR_CLEAR_OUTLINED_PRIMARY_ACTIVE = '&.MuiButton-outlinedPrimary:active';

function accentOverlayFill(colorStr, ratio) {
  if (typeof colorStr !== 'string') return undefined;
  try {
    return alpha(colorStr, ratio);
  } catch {
    try {
      return `color-mix(in srgb, ${colorStr} ${Math.round(ratio * 100)}%, transparent)`;
    } catch {
      return undefined;
    }
  }
}

/**
 * When toolbar clear buttons set `color` and/or `borderColor` (non-function), add hover/active
 * so MUI outlined-primary defaults do not override. Skipped if `&:hover` is already set.
 * @param {Object} userSx
 * @returns {Object}
 */
function getToolbarClearOutlinedAccentHoverSx(userSx) {
  if (!userSx || typeof userSx !== 'object' || Array.isArray(userSx)) return {};
  if (
    userSx['&:hover'] != null ||
    userSx['&.MuiButton-outlined:hover'] != null ||
    userSx[TOOLBAR_CLEAR_OUTLINED_PRIMARY_HOVER] != null
  ) {
    return {};
  }

  const border = userSx.borderColor ?? userSx.color;
  const text = userSx.color ?? userSx.borderColor;
  if (border == null && text == null) return {};
  if (typeof border === 'function' || typeof text === 'function') return {};

  const hoverBorder = border ?? text;
  const hoverColor = text ?? border;
  const alphaSource = text ?? border;

  const bgHover = accentOverlayFill(alphaSource, 0.04) ?? 'transparent';
  const bgActive = accentOverlayFill(alphaSource, 0.08) ?? 'transparent';

  const hoverStyles = {
    borderColor: hoverBorder,
    color: hoverColor,
    backgroundColor: bgHover,
  };
  const activeStyles = {
    borderColor: hoverBorder,
    color: hoverColor,
    backgroundColor: bgActive,
  };

  return {
    '&:hover': hoverStyles,
    [TOOLBAR_CLEAR_OUTLINED_PRIMARY_HOVER]: hoverStyles,
    '&:active': activeStyles,
    [TOOLBAR_CLEAR_OUTLINED_PRIMARY_ACTIVE]: activeStyles,
  };
}

/** Merged sx for Clear sort, Clear all filters, Reset column widths (outlined); disabled uses neutral gray. */
export function getToolbarClearButtonsSx(toolbarClearButtonsSx) {
  const userObject =
    toolbarClearButtonsSx && typeof toolbarClearButtonsSx === 'object' && !Array.isArray(toolbarClearButtonsSx)
      ? toolbarClearButtonsSx
      : {};
  return {
    '&.Mui-disabled': {
      color: TOOLBAR_CLEAR_BUTTON_DISABLED_COLOR,
      borderColor: TOOLBAR_CLEAR_BUTTON_DISABLED_COLOR,
      WebkitTextFillColor: TOOLBAR_CLEAR_BUTTON_DISABLED_COLOR,
    },
    ...getToolbarClearOutlinedAccentHoverSx(userObject),
    ...(toolbarClearButtonsSx || {}),
  };
}

export function getExportButtonSx(toolbarExportButtonSx) {
  return {
    alignItems: 'stretch',
    '& .MuiButton-startIcon': { mr: 0.75, display: 'flex', alignItems: 'stretch', paddingLeft: 1, paddingRight: 1 },
    '& .MuiButton-label': { display: 'flex', alignItems: 'stretch' },
    ...(toolbarExportButtonSx || {}),
  };
}

export function getPdfExportButtonSx(toolbarPdfExportButtonSx) {
  return {
    backgroundColor: 'gray',
    alignItems: 'stretch',
    '& .MuiButton-startIcon': { mr: 0.75, display: 'flex', alignItems: 'stretch', paddingLeft: 1, paddingRight: 1 },
    '& .MuiButton-label': { display: 'flex', alignItems: 'stretch' },
    ...(toolbarPdfExportButtonSx || {}),
  };
}