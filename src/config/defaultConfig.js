import { DEFAULT_FIELD_TYPE } from './schema';

/** Sensible defaults for grid and column config */

export const defaultGridConfig = {
  editable: false,
  multiSelectable: false,
  pagination: false,
  pageSize: 10,
  pageSizeOptions: [10, 25, 50, 100],
  density: 'standard',
  fontSize: 13,
};

export const defaultColumnConfig = {
  type: DEFAULT_FIELD_TYPE,
  filter: true,
  editable: false,
  align: undefined, // use direction-based default
};
