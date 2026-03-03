/**
 * MUI sx for cell editors (TextField, Autocomplete, DatePicker) so they fit within body row height.
 */
import { getListFilterAutocompleteInputSx } from '../filters/filterBoxStyles';
/**
 * Compact sx so editors fit within body row. Overrides MUI small input min-height.
 * When contentHeightPx is set, caps editor height so edited row matches non-edited row height.
 * @param {number|undefined} contentHeightPx - Max content height in px (row height minus cell padding and border), or undefined for no cap
 * @returns {Object} MUI sx for the editor root
 */
export function getCompactEditorSx(contentHeightPx) {
  const maxHeight = contentHeightPx != null && contentHeightPx > 0 ? { maxHeight: `${contentHeightPx}px` } : {};
  const sizeBlock = { minHeight: 0, height: '100%', ...maxHeight };
  const inputVariantSx = {
    ...sizeBlock,
    paddingTop: '1px',
    paddingBottom: '1px',
    '& .MuiOutlinedInput-input, & .MuiFilledInput-input': { py: 0, boxSizing: 'border-box' },
  };
  return {
    ...sizeBlock,
    '& .MuiInputBase-root': sizeBlock,
    '& .MuiOutlinedInput-root': inputVariantSx,
    '& .MuiFilledInput-root': inputVariantSx,
    '& .MuiInputBase-input': { py: 0, boxSizing: 'border-box' },
  };
}

export const listEditorSx = {
  minWidth: 0,
  ...getCompactEditorSx(),
  '& .MuiOutlinedInput-root': { overflow: 'visible !important' },
  '& .MuiAutocomplete-inputRoot': { overflow: 'visible !important' },
  '& .MuiAutocomplete-clearIndicator': {
    visibility: 'visible !important',
    opacity: '1 !important',
    pointerEvents: 'auto',
  },
};

export function getListEditorInputSx(isRtl) {
  return {
    ...getListFilterAutocompleteInputSx(isRtl),
    '& .MuiInputBase-input': {
      minWidth: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  };
}