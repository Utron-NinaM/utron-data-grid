/** Fallback EN strings; all user-facing labels must use t() with these keys or overrides */

export const defaultTranslations = {
  // Sort / filters
  clearSort: 'Clear sort',
  clearAllFilters: 'Clear all Filters',
  clearColumnFilter: 'Clear Filter',
  clearColumnWidths: 'Reset Column Widths',
  columnConfig: 'Configure Columns',
  exportToCsv: 'EXCEL',
  exportToPdf: 'PDF',
  exportToCsvTooltip: 'Export to CSV',
  exportToPdfTooltip: 'Export to PDF',
  sortAsc: 'Sort Ascending',
  sortDesc: 'Sort Descending',
  sortMultiColumnHint: 'Hold Ctrl to sort by multiple columns',

  // Filter placeholders
  filterPlaceholder: 'Filter',
  filterNumber: 'Filter',
  filterDate: 'Filter',
  selectOption: 'Select',
  filterFrom: 'From',
  filterTo: 'To',
  listFilterSelectedSingle: '1 value',
  listFilterSelectedCount: '{{count}} values',

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
  firstPage: 'First Pa ge',
  lastPage: 'Last Page',
  prevPage: 'Previous Page',
  nextPage: 'Next Page',

  // Empty / state
  noRows: 'No Rows',
  noResults: 'No Results Match Filters',
  clearMultiSelectionIconTooltip: 'Clear Selected Rows',
  clearMultiSelectionIconAria: 'Clear Selected Rows',

  // Edit
  save: 'Save',
  cancel: 'Cancel',
  edit: 'Edit',

  // Validation
  validationErrors: 'Please correct the following:',
  validationErrorsFound: '{{count}} validation error(s) found',
  validationFieldErrorsCount: '{{count}} field error(s)',
  validationRowErrorsCount: '{{count}} row error(s)',
  validationRequired: 'Required',

  // Error messages
  internalErrorOccurred: 'Internal error occurred',
  errorTitle: 'Error',
  close: 'Close',
};

/** Hebrew translations */
export const hebrewTranslations = {
  ...defaultTranslations,
  // Sort / filters
  clearSort: 'איפוס מיון',
  clearAllFilters: 'איפוס כל הסינונים',
  clearColumnFilter: 'איפוס סינון',
  clearColumnWidths: 'איפוס רוחב עמודות',
  columnConfig: 'הגדרת עמודות',
  exportToCsv: 'EXCEL',
  exportToPdf: 'PDF',
  exportToCsvTooltip: 'CSV ייצוא ל ',
  exportToPdfTooltip: 'PDF ייצוא ל ',
  sortAsc: 'מיון בסדר עולה',
  sortDesc: 'מיון בסדר יורד',
  sortMultiColumnHint: 'יש להחזיק Ctrl למיון לפי מספר עמודות',

  // Filter placeholders
  filterPlaceholder: 'סינון',
  filterNumber: 'סינון',
  filterDate: 'סינון',
  selectOption: 'בחירה',
  filterFrom: 'מ',
  filterTo: 'עד',
  listFilterSelectedSingle: 'ערך אחד',
  listFilterSelectedCount: '{{count}} ערכים',

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
  clearMultiSelectionIconTooltip: 'איפוס שורות נבחרות',
  clearMultiSelectionIconAria: 'איפוס שורות נבחרות',

  // Edit
  save: 'שמירה',
  cancel: 'ביטול',
  edit: 'עריכה',

  // Validation
  validationErrors: 'יש לתקן את השגיאות הבאות:',
  validationErrorsFound: 'נמצאו {{count}} שגיאות אימות',
  validationFieldErrorsCount: '{{count}} שגיאות שדה',
  validationRowErrorsCount: '{{count}} שגיאות שורה',
  validationRequired: 'נדרש',

  // Error messages
  internalErrorOccurred: 'אירעה שגיאה פנימית',
  errorTitle: 'שגיאה',
  close: 'סגירה',
};