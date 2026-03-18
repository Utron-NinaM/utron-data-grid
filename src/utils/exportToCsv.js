const DEFAULT_FILENAME = 'export.csv';

/**
 * Escape a CSV cell value (wrap in quotes and escape internal quotes).
 * @param {*} value
 * @returns {string}
 */
function escapeCsvCell(value) {
  if (value == null) return '';
  const s = String(value);
  if (s.includes('"') || s.includes(',') || s.includes('\n') || s.includes('\r')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/**
 * Export columns and rows to a CSV file and trigger download.
 *
 * @param {Object} options
 * @param {Array<{ field: string, headerName?: string }>} options.columns - Column definitions (headerName optional, fallback to field).
 * @param {Object[]} options.rows - Row objects (values keyed by column.field).
 * @param {string} [options.filename='export.csv'] - Download filename.
 * @throws {Error} If export fails
 */
export function exportToCsv({ columns = [], rows = [], filename = DEFAULT_FILENAME }) {
  let url = null;
  try {
    const headers = columns.map((col) => col.headerName ?? col.field);
    const headerRow = headers.map(escapeCsvCell).join(',');
    const dataRows = rows.map((row) =>
      columns.map((col) => escapeCsvCell(row[col.field])).join(',')
    );
    const bom = '\uFEFF';
    const csv = [headerRow, ...dataRows].join('\r\n');
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8' });
    url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  } catch (error) {
    console.error('CSV export failed:', error);
    throw error;
  } finally {
    if (url) {
      URL.revokeObjectURL(url);
    }
  }
}
