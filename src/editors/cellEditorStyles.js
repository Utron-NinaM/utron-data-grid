/**
 * MUI sx for cell editors (TextField, Autocomplete, DatePicker) so they fit within body row height.
 */
import { getListFilterAutocompleteInputSx } from '../filters/filterBoxStyles';
import { LIST_EDITOR_RTL_ADORNMENT_PADDING_PX } from '../constants';
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

const _compactSx = getCompactEditorSx();
export const listEditorSx = {
  minWidth: 0,
  ..._compactSx,
  '& .MuiInputBase-root': {
    ..._compactSx['& .MuiInputBase-root'],
    minWidth: 0
  },
  '& .MuiOutlinedInput-root': {
    ..._compactSx['& .MuiOutlinedInput-root'],
    alignItems: 'center',
    overflow: 'visible !important',
    minWidth: 0,
    paddingLeft: 2,
    paddingRight: 2,
  },
  '& .MuiOutlinedInput-root.MuiInputBase-sizeSmall': {
    paddingLeft: 2,
    paddingRight: 2,
  },
  '& .MuiOutlinedInput-notchedOutline': {
    paddingLeft: '2px',
    paddingRight: '2px',
  },
  '& .MuiAutocomplete-inputRoot': {
    position: 'relative',
    overflow: 'visible !important',
    minWidth: 0,
  },
  '& .MuiAutocomplete-clearIndicator': {
    visibility: 'visible !important',
    opacity: '1 !important',
    pointerEvents: 'auto',
    display: 'flex',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: '-1px',
  },
  '& .MuiAutocomplete-popupIndicator': {
    display: 'flex',
    alignItems: 'center',
    alignSelf: 'center',
  },
  '& .MuiAutocomplete-endAdornment': {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    height: '100%',
    maxHeight: '100%',
    display: 'flex',
    alignItems: 'center',
  },
  '& .MuiAutocomplete-endAdornment .MuiSvgIcon-root': {
    display: 'block',
  },
  '& .MuiAutocomplete-endAdornment .MuiIconButton-root': {
    minHeight: '0',
    height: '100%',
    maxHeight: '100%',
    padding: '0',
    margin: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  '& .MuiInputBase-input': {
    ...(_compactSx['& .MuiInputBase-input'] || {}),
    alignSelf: 'center',
  },
};

export function getListEditorInputSx(isRtl) {
  return {
    ...getListFilterAutocompleteInputSx(isRtl),
    '& .MuiInputBase-input': {
      minWidth: 0,
      flex: '1 1 0%',   // add this – ensures constrained width in both LTR and RTL
      width: '100%',    // can keep for fallback or remove if you prefer only flex
      overflow: 'hidden !important',
      overflowX: 'hidden',
      overflowY: 'hidden',
      textOverflow: 'ellipsis !important',
      whiteSpace: 'nowrap !important',
      boxSizing: 'border-box !important',
    },
    ...{
      '& .MuiOutlinedInput-root': {
        minWidth: 0,
        paddingLeft: isRtl ? `${LIST_EDITOR_RTL_ADORNMENT_PADDING_PX}px !important` : '2px !important',
        paddingRight: isRtl ? '2px !important' : `${LIST_EDITOR_RTL_ADORNMENT_PADDING_PX}px !important`,
        paddingTop: '2px !important',
        paddingBottom: '2px !important',
        boxSizing: 'border-box !important',
      },
    },
  };
}