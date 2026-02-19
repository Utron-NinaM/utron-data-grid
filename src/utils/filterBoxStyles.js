export const PADDING_INPUT_TOP_BOTTOM_PX = 4;

/** Width reserved for operator dropdown in filter row; used to align "to" input with "from". */
export const FILTER_OPERATOR_WIDTH_PX = 40;
export const FILTER_OPERATOR_WIDTH_PX_WITH_PADDING = FILTER_OPERATOR_WIDTH_PX + 6;

/** Default content height when headerConfig does not set filterInputHeight (match MUI small input). */
const DEFAULT_FILTER_CONTENT_HEIGHT = 40;

export function getFilterContentHeight(filterInputHeight) {
  return filterInputHeight
    ? filterInputHeight - PADDING_INPUT_TOP_BOTTOM_PX * 2
    : DEFAULT_FILTER_CONTENT_HEIGHT;
}
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
    minHeight: 20,
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    height: contentHeight,
    maxHeight: contentHeight,
    ...(fontSize != null && { fontSize }),
    '& .MuiInputBase-root': baseInputSx,
    '& .MuiInputBase-input': filterInputHeight ? inputPadding : {},
  };
}