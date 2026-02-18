/** Fallback EN strings; all user-facing labels must use t() with these keys or overrides */

export const defaultTranslations = {
  // Sort / filters
  clearSort: 'Clear sort',
  clearAllFilters: 'Clear all filters',
  clearColumnFilter: 'Clear filter',
  clearColumnWidths: 'Reset column widths',
  sortAsc: 'Sort ascending',
  sortDesc: 'Sort descending',
  sortMultiColumnHint: 'Hold Ctrl to sort by multiple columns',

  // Filter placeholders
  filterPlaceholder: 'Filter',
  filterNumber: 'Filter',
  filterDate: 'Filter',
  selectOption: 'Select',
  filterTo: 'To',

  // Number/date operators
  operatorEquals: 'Equals',
  operatorNotEqual: 'Not Equal',
  operatorGreaterThan: 'Greater Than',
  operatorLessThan: 'Less Than',
  operatorGreaterOrEqual: 'Greater Or Equal',
  operatorLessOrEqual: 'Less Or Equal',
  operatorInRange: 'In Range',
  operatorEmpty: 'Empty',
  operatorNotEmpty: 'Not Empty',
  operatorContains: 'Contains',
  operatorNotContains: 'Does Not Contain',
  operatorStartsWith: 'Starts With',
  operatorEndsWith: 'Ends With',
  operatorPeriod: 'Last Period',  
  periodHours: 'Hours',
  periodDays: 'Days',
  periodWeeks: 'Weeks',
  periodMonths: 'Months',
  periodYears: 'Years',

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

/** Hebrew translations */
export const hebrewTranslations = {
  ...defaultTranslations,
  // Sort / filters
  clearSort: 'נקה מיון',
  clearAllFilters: 'נקה כל הסינונים',
  clearColumnFilter: 'נקה סינון',
  clearColumnWidths: 'איפוס רוחב עמודות',
  sortAsc: 'מיין בסדר עולה',
  sortDesc: 'מיין בסדר יורד',
  sortMultiColumnHint: 'החזק Ctrl למיון לפי מספר עמודות',

  // Filter placeholders
  filterPlaceholder: 'סינון',
  filterNumber: 'סינון',
  filterDate: 'סינון',
  selectOption: 'בחר',
  filterTo: 'עד',

  // Number/date operators
  operatorEquals: 'שווה',
  operatorNotEqual: 'לא שווה',
  operatorGreaterThan: 'גדול מ',
  operatorLessThan: 'קטן מ',
  operatorGreaterOrEqual: 'גדול או שווה',
  operatorLessOrEqual: 'קטן או שווה',
  operatorInRange: 'בטווח',
  operatorEmpty: 'ריק',
  operatorNotEmpty: 'לא ריק',
  operatorContains: 'מכיל',
  operatorNotContains: 'לא מכיל',
  operatorStartsWith: 'מתחיל ב',
  operatorEndsWith: 'מסתיים ב',
  operatorPeriod: 'תקופה אחרונה',  
  periodHours: 'שעות',
  periodDays: 'ימים',
  periodWeeks: 'שבועות',
  periodMonths: 'חודשים',
  periodYears: 'שנים',
  // Pagination
  rowsPerPage: 'שורות לדף',
  paginationRange: '{{from}}–{{to}} מתוך {{count}}',
  firstPage: 'דף ראשון',
  lastPage: 'דף אחרון',
  prevPage: 'דף קודם',
  nextPage: 'דף הבא',

  // Empty / state
  noRows: 'אין שורות',
  noResults: 'אין תוצאות התואמות לסינונים',

  // Edit
  save: 'שמור',
  cancel: 'בטל',
  edit: 'ערוך',

  // Validation
  validationErrors: 'יש לתקן את השגיאות הבאות:',
  validationRequired: 'נדרש',
};