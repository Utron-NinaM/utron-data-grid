/** Sensible defaults for grid and column config */

export const defaultGridConfig = {
  editable: false,
  selectable: false,
  pagination: false,
  pageSize: 10,
  pageSizeOptions: [10, 25, 50],
  density: 'standard',
};

export const defaultColumnConfig = {
  type: 'text',
  filter: true,
  editable: false,
  align: undefined, // use direction-based default
};
