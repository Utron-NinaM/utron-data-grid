/**
 * Shared sx for the filter row box (used in GridHeaderCell and GridHeaderCellFilter).
 * @param {string|number} [filterInputHeight]
 * @returns {object}
 */
export function getFilterRowBoxSx(filterInputHeight) {
  return {
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box',
    px: 0.5,
    minHeight: 20,
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    ...(filterInputHeight && { height: filterInputHeight-PADDING_INPUT_TOP_BOTTOM_PX*2, maxHeight: filterInputHeight-PADDING_INPUT_TOP_BOTTOM_PX*2 }),
    '& .MuiInputBase-root': filterInputHeight ? { height: filterInputHeight-PADDING_INPUT_TOP_BOTTOM_PX*2, minHeight: filterInputHeight-PADDING_INPUT_TOP_BOTTOM_PX*2, maxHeight: filterInputHeight-PADDING_INPUT_TOP_BOTTOM_PX*2 } : {},
    '& .MuiInputBase-input': filterInputHeight ? { height: '100%', padding: `${PADDING_INPUT_TOP_BOTTOM_PX}px 8px` } : {},
  };
}


export const PADDING_INPUT_TOP_BOTTOM_PX = 4;