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
    ...(filterInputHeight && { height: filterInputHeight, maxHeight: filterInputHeight }),
    '& .MuiInputBase-root': filterInputHeight ? { height: filterInputHeight, minHeight: filterInputHeight, maxHeight: filterInputHeight } : {},
    '& .MuiInputBase-input': filterInputHeight ? { height: '100%', padding: '4px 8px' } : {},
  };
}
