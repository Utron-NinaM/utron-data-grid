/**
 * Run column validators on a row. Returns array of { field, message, severity: 'error' }.
 * field is col.field (not headerName). Only validates columns that are editable for the original row.
 * @param {Object} row The row data to validate
 * @param {Object[]} columns Column definitions
 * @param {Object} originalRow Original row data to determine editable columns
 * @returns {Array<{ field: string, message: string, severity: 'error' }>}
 */
export function validateRow(row, columns, originalRow) {
  const errors = [];

  for (const col of columns) {
    if (!col.validators?.length) continue;

    const isEditable =
      typeof col.editable === 'function' ? col.editable(originalRow) : col.editable !== false;
    if (!isEditable) continue;

    const value = row[col.field];
    for (const { validate, message } of col.validators) {
      const result = validate(value, row);
      if (result === false || (typeof result === 'string' && result.length > 0)) {
        errors.push({
          field: col.field,
          message: typeof result === 'string' ? result : (message || 'Invalid'),
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
 * @returns {Array<{ field: string, message: string, severity: 'error' }>}
 */
export function validateField(row, columns, originalRow, field) {
  const col = columns.find((c) => c.field === field);
  if (!col?.validators?.length) return [];

  const isEditable =
    typeof col.editable === 'function' ? col.editable(originalRow) : col.editable !== false;
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
