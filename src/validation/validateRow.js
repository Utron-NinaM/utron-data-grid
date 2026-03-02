/**
 * Run column validators on a row. Returns array of { field, message, severity: 'error' }.
 * field is col.field (not headerName) for field-level errors, or null for row-level errors.
 * Only validates columns that are editable for the original row.
 * @param {Object} row The row data to validate
 * @param {Object[]} columns Column definitions
 * @param {Object} originalRow Original row data to determine editable columns
 * @param {string|null} [editMode] Edit mode: 'create' | 'update' | null
 * @returns {Array<{ field: string|null, message: string, severity: 'error' }>}
 */
export function validateRow(row, columns, originalRow, editMode = null) {
  const errors = [];

  for (const col of columns) {
    if (!col.validators?.length) continue;

    // Determine if column is editable based on editMode
    // For create mode: editable if editable === true OR addable === true
    // For update mode: editable if editable === true
    const isEditable = editMode === 'create'
      ? (col.editable === true || col.addable === true)
      : (col.editable === true);
    if (!isEditable) continue;

    const value = row[col.field];
    for (const validator of col.validators) {
      const { validate, message, rowLevel } = validator;
      const result = validate(value, row);
      // Check for error: false, non-empty string, or error object
      const isError = result === false 
        || (typeof result === 'string' && result.length > 0)
        || (typeof result === 'object' && result !== null && (result.field === null || result.message));
      
      if (isError) {
        // If validator has rowLevel flag or returns an object with field: null, treat as row-level error
        const isRowLevel = rowLevel === true || (typeof result === 'object' && result !== null && result.field === null);
        const errorField = isRowLevel ? null : col.field;
        const errorMessage = typeof result === 'string' 
          ? result 
          : (typeof result === 'object' && result !== null && result.message) 
            ? result.message 
            : (message || 'Invalid');
        
        errors.push({
          field: errorField,
          message: errorMessage,
          severity: 'error',
        });
        break;
      }
    }
  }
  return errors;
}

/**
 * Run validators for a single field only. Used on cell blur.
 * @param {Object} row The row data to validate
 * @param {Object[]} columns Column definitions
 * @param {Object} originalRow Original row data to determine editable columns
 * @param {string} field Column field name
 * @param {string|null} [editMode] Edit mode: 'create' | 'update' | null
 * @returns {Array<{ field: string, message: string, severity: 'error' }>}
 */
export function validateField(row, columns, originalRow, field, editMode = null) {
  const col = columns.find((c) => c.field === field);
  if (!col?.validators?.length) return [];

  // Determine if column is editable based on editMode
  // For create mode: editable if editable === true OR addable === true
  // For update mode: editable if editable === true
  const isEditable = editMode === 'create'
    ? (col.editable === true || col.addable === true)
    : (col.editable === true);
  if (!isEditable) return [];

  const value = row[field];
  for (const { validate, message } of col.validators) {
    const result = validate(value, row);
    if (result === false || (typeof result === 'string' && result.length > 0)) {
      return [
        {
          field: col.field,
          message: typeof result === 'string' ? result : (message || 'Invalid'),
          severity: 'error',
        },
      ];
    }
  }
  return [];
}
