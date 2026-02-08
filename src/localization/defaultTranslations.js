/** Fallback EN strings; all user-facing labels must use t() with these keys or overrides */

export const defaultTranslations = {
  // Sort / filters
  clearSort: 'Clear sort',
  clearAllFilters: 'Clear all filters',
  sortAsc: 'Sort ascending',
  sortDesc: 'Sort descending',

  // Filter placeholders
  filterPlaceholder: 'Filter',
  filterNumber: 'Filter',
  filterDate: 'Filter',
  selectOption: 'Select',

  // Number/date operators
  operatorEquals: 'Equals',
  operatorNotEqual: 'Not Equal',
  operatorGreaterThan: 'Greater Than',
  operatorLessThan: 'Less Than',
  operatorGreaterOrEqual: 'Greater Or Equal',
  operatorLessOrEqual: 'Less Or Equal',
  operatorInRange: 'In Range',

  // Pagination
  rowsPerPage: 'Rows per page',
  paginationRange: '{{from}}–{{to}} of {{count}}',
  firstPage: 'First page',
  lastPage: 'Last page',
  prevPage: 'Previous page',
  nextPage: 'Next page',

  // Empty / state
  noRows: 'No rows',
  noResults: 'No results match filters',

  // Edit
  save: 'Save',
  cancel: 'Cancel',
  edit: 'Edit',

  // Validation
  validationErrors: 'Please correct the following:',
  validationRequired: 'Required',
};
