// ─── Shared constants ───────────────────────────────────────────────────────

export const PADDING_INPUT_TOP_BOTTOM_PX = 4;

/** Width reserved for operator dropdown in filter row; used to align "to" input with "from". */
export const FILTER_OPERATOR_WIDTH_PX = 40;
export const FILTER_OPERATOR_WIDTH_PX_WITH_PADDING = FILTER_OPERATOR_WIDTH_PX + 6;

/** Default content height when headerConfig does not set filterInputHeight (match MUI small input). */
const DEFAULT_FILTER_CONTENT_HEIGHT = 40;

// ─── Filter row box (GridHeaderCell / GridHeaderCellFilter) ──────────────────

export function getFilterContentHeight(filterInputHeight) {
  return filterInputHeight
    ? filterInputHeight - PADDING_INPUT_TOP_BOTTOM_PX * 2
    : DEFAULT_FILTER_CONTENT_HEIGHT;
}

// ─── Operator dropdown (OperatorDropdown) ────────────────────────────────────

/** Operator dropdown (filter row): root Box sx. */
export const operatorDropdownRootSx = {
  paddingLeft: '1px',
  paddingRight: '1px',
  width: FILTER_OPERATOR_WIDTH_PX,
  minWidth: FILTER_OPERATOR_WIDTH_PX,
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'row-reverse',
};

/** Operator dropdown: IconButton sx. */
export const operatorDropdownButtonSx = {
  boxSizing: 'border-box',
  paddingLeft: '1px',
  paddingRight: '1px',
};

/** Operator dropdown: ArrowDropDown icon base sx (add fontSize in component). */
export const operatorDropdownArrowIconSx = {
  minWidth: 20,
  minHeight: 20,
  width: 20,
  height: 20,
};

/** Operator dropdown: operator icon Box base sx (add fontSize in component). */
export const operatorIconBoxSx = {
  minWidth: 18,
  minHeight: 18,
  width: 18,
  height: 18,
  verticalAlign: 'middle',
  '& .svg-inline--fa': { verticalAlign: 'middle' },
};

/**
 * Operator dropdown: menu item row Box sx.
 * @param {string} direction - 'ltr' | 'rtl'
 */
export function getOperatorMenuItemBoxSx(direction) {
  return {
    display: 'flex',
    justifyContent: 'flex-start',
    flexDirection: direction === 'rtl' ? 'row-reverse' : 'row',
    width: '100%',
  };
}

/** Operator dropdown: menu item label span sx. */
export const operatorMenuItemLabelSx = {
  alignItems: 'start',
  paddingLeft: 1,
  paddingRight: 1,
};

// ─── Filter row wrappers (filter components) ──────────────────────────────────

/** Wrapper Box for filter row: flex row, full width, no padding. */
export const filterRowWrapperSx = {
  display: 'flex',
  alignItems: 'center',
  gap: 0.5,
  width: '100%',
  minWidth: 0,
  maxWidth: '100%',
};

/** Same as filterRowWrapperSx with padding: 0 (e.g. ListFilter). */
export const filterRowWrapperSxNoPadding = {
  ...filterRowWrapperSx,
  padding: 0,
};

/** Input/control that fills remaining space in filter row. */
export const filterInputFlexSx = {
  flex: 1,
  minWidth: 0,
  maxWidth: '100%',
};

/** Input that fills but without maxWidth (e.g. date period unit select). */
export const filterInputFlexSxNarrow = {
  flex: 1,
  minWidth: 0,
};

/** Full-width filter input (e.g. period amount). */
export const filterInputFullWidthSx = {
  width: '100%',
  minWidth: 0,
};

/**
 * ListFilter Autocomplete: input textAlign by direction.
 * @param {boolean} isRtl
 */
export function getListFilterAutocompleteInputSx(isRtl) {
  return {
    '& .MuiInputBase-root': {
      display: 'flex',
      alignItems: 'center',
    },
    '& .MuiInputBase-input': {
      textAlign: isRtl ? 'right' : 'left',
    },
  };
}

/**
 * ListFilter Autocomplete root sx (height/overflow).
 * @param {number} contentHeight
 */
export function getListFilterAutocompleteSx(contentHeight) {
  return {
    flex: 1,
    minWidth: 0,
    maxWidth: '100%',
    overflow: 'hidden',
    boxSizing: 'border-box',
    height: contentHeight,
    minHeight: contentHeight,
    maxHeight: contentHeight,
  };
}

// ─── FilterBar (operator + to slot) ─────────────────────────────────────────

/** @param {'ltr'|'rtl'} direction */
export function getOperatorWrapperSx(direction) {
  const isRtl = direction === 'rtl';
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    width: '100%',
    minWidth: 0,
    maxWidth: '100%',
    flexDirection: isRtl ? 'row-reverse' : 'row',
    transition: 'opacity 120ms ease',
  };
}

/** @param {'ltr'|'rtl'} direction */
export function getToSlotWrapperSx(direction) {
  return {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    minWidth: 0,
    maxWidth: '100%',
    paddingInlineStart: direction === 'ltr' ? `${FILTER_OPERATOR_WIDTH_PX_WITH_PADDING}px` : 0,
    paddingInlineEnd: direction === 'rtl' ? `${FILTER_OPERATOR_WIDTH_PX_WITH_PADDING}px` : 0,
  };
}

/** Header clear-filter IconButton sx. */
export const headerClearButtonSx = { flexShrink: 0 };

/**
 * Shared sx for the filter row box (used in GridHeaderCell and GridHeaderCellFilter).
 * @param {string|number} [filterInputHeight]
 * @param {number} [fontSize] - Grid font size in px; when set, filter inputs use it
 * @returns {object}
 */
export function getFilterRowBoxSx(filterInputHeight, fontSize) {
  const contentHeight = getFilterContentHeight(filterInputHeight);
  const inputPadding = { height: '100%', padding: `${PADDING_INPUT_TOP_BOTTOM_PX}px 8px` };
  const baseInputSx = {
    height: contentHeight,
    minHeight: contentHeight,
    maxHeight: contentHeight,
    ...(fontSize != null && { fontSize: 'inherit' }),
  };
  return {
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box',
    px: 0.5,
    minHeight: contentHeight,
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    height: '100%',
    ...(fontSize != null && { fontSize }),
    '& .MuiInputBase-root': baseInputSx,
    '& .MuiInputBase-input': filterInputHeight ? inputPadding : {},
  };
}