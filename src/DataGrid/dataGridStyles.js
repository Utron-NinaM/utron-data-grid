/**
 * Shared MUI sx objects and helpers for DataGrid.
 */

/** sx for the inner scrollable content box when using pagination + height constraint */
export const scrollableContentSx = {
  flex: 1,
  minHeight: 0,
  minWidth: 0,
  overflowX: 'hidden',
  display: 'flex',
  flexDirection: 'column',
};

/**
 * @param {Object} opts
 * @param {Object} [opts.sx] - Consumer sx overrides
 * @param {number} opts.fontSize - Resolved font size (px)
 * @param {string} [opts.fontFamily] - Font family for all grid components
 * @param {number|string} [opts.fontWeight] - Font weight (e.g. 400, 600, 'bold')
 * @param {boolean} opts.useScrollableLayout - Whether to apply flex scroll layout
 * @returns {Object} MUI sx for the DataGrid root Box
 */
export function getDataGridRootSx({ sx, fontSize, fontFamily, fontWeight, useScrollableLayout }) {
  return {
    ...sx,
    fontSize,
    '--data-grid-font-size': `${fontSize}px`,
    ...(fontFamily != null && { fontFamily, '--data-grid-font-family': fontFamily }),
    ...(fontWeight != null && { fontWeight, '--data-grid-font-weight': fontWeight }),
    minWidth: 0,
    width: '100%',
    maxWidth: '100%',
    overflowX: 'hidden',
    ...(useScrollableLayout && {
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }),
  };
}