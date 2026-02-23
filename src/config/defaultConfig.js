import { DEFAULT_FIELD_TYPE } from './schema';
import { DEFAULT_FONT_SIZE } from '../constants';

/** Sensible defaults for grid and column config */

export const defaultGridConfig = {
  editable: false,
  filters: true,
  multiSelectable: false,
  pagination: false,
  pageSize: 10,
  pageSizeOptions: [10, 25, 50, 100],
  density: 'standard',
  fontSize: DEFAULT_FONT_SIZE,
};

export const defaultColumnConfig = {
  type: DEFAULT_FIELD_TYPE,
  filter: true,
  editable: false,
  align: undefined, // use direction-based default
};
