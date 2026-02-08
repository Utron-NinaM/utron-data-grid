/**
 * Run column validators on a row. Returns array of { field, message }.
 * @param {Object} row
 * @param {Object[]} columns
 * @returns {Array<{ field: string, message: string }>}
 */
export function validateRow(row, columns) {
  const errors = [];
  for (const col of columns) {
    if (!col.validators?.length) continue;
    const value = row[col.field];
    for (const { validate, message } of col.validators) {
      const result = validate(value, row);
      if (result === false || (typeof result === 'string' && result.length > 0)) {
        errors.push({ field: col.field, message: typeof result === 'string' ? result : (message || 'Invalid') });
        break;
      }
    }
  }
  return errors;
}
