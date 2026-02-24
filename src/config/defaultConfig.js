import { DEFAULT_FIELD_TYPE } from './schema';
import {
  DEFAULT_FONT_SIZE,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  BODY_ROW_HEIGHT,
  BODY_ROW_PADDING_VERTICAL_PX,
  BODY_ROW_PADDING_HORIZONTAL_PX,
} from '../constants';

/** Sensible defaults for grid and column config */

export const defaultGridConfig = {
  editable: false,
  filters: true,
  fitToContainer: false,
  multiSelectable: false,
  pagination: false,
  pageSize: DEFAULT_PAGE_SIZE,
  pageSizeOptions: PAGE_SIZE_OPTIONS,
  density: 'standard',
  fontSize: DEFAULT_FONT_SIZE,
  showHorizontalScrollbar: false,
  bodyRow: {
    height: BODY_ROW_HEIGHT,
    paddingTop: `${BODY_ROW_PADDING_VERTICAL_PX}px`,
    paddingBottom: `${BODY_ROW_PADDING_VERTICAL_PX}px`,
    paddingLeft: `${BODY_ROW_PADDING_HORIZONTAL_PX}px`,
    paddingRight: `${BODY_ROW_PADDING_HORIZONTAL_PX}px`,
  },
};

export const defaultColumnConfig = {
  type: DEFAULT_FIELD_TYPE,
  filter: true,
  editable: false,
  align: undefined, // use direction-based default
};
