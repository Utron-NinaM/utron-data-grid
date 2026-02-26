/**
 * Run column validators on a row. Returns array of { field, message }.
 * Only validates columns that are editable for the original row.
 * @param {Object} row The row data to validate
 * @param {Object[]} columns Column definitions
 * @param {Object} originalRow Original row data to determine editable columns
 * @returns {Array<{ field: string, message: string }>}
 */
export function validateRow(row, columns, originalRow) {
  const errors = [];
  
  for (const col of columns) {
    if (!col.validators?.length) continue;
    
    // Check if column is editable for this row
    const isEditable = typeof col.editable === 'function' 
      ? col.editable(originalRow) 
      : (col.editable !== false);
    
    // Only validate editable columns (non-editable columns can't be changed)
    if (!isEditable) continue;
    
    const value = row[col.field];
    for (const { validate, message } of col.validators) {
      const result = validate(value, row);
      if (result === false || (typeof result === 'string' && result.length > 0)) {
        errors.push({ field: col.headerName, message: typeof result === 'string' ? result : (message || 'Invalid') });
        break;
      }
    }
  }
  return errors;
}
