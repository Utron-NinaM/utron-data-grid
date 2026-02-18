const COLUMN_WIDTH_STORAGE_KEY_PREFIX = 'utron-datagrid-column-widths-';

/**
 * Load persisted column width state from localStorage. Returns only entries for known column fields with valid positive widths.
 * @param {string} gridId
 * @param {Object[]} columns
 * @returns {Map<string, number>}
 */
export function getStoredColumnWidthState(gridId, columns) {
  if (!gridId || typeof localStorage === 'undefined') return new Map();
  try {
    const raw = localStorage.getItem(COLUMN_WIDTH_STORAGE_KEY_PREFIX + gridId);
    if (raw == null) return new Map();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return new Map();
    const fieldSet = new Set((columns || []).map((c) => c.field));
    const entries = [];
    for (const [field, value] of Object.entries(parsed)) {
      const width = typeof value === 'number' ? value : Number(value);
      if (fieldSet.has(field) && Number.isFinite(width) && width > 0) {
        entries.push([field, width]);
      }
    }
    return new Map(entries);
  } catch {
    return new Map();
  }
}

/**
 * Persist column width state to localStorage.
 * @param {string} gridId
 * @param {Map<string, number>} columnWidthState
 */
export function saveColumnWidthState(gridId, columnWidthState) {
  if (gridId && typeof localStorage !== 'undefined') {
    const obj = columnWidthState instanceof Map ? Object.fromEntries(columnWidthState) : columnWidthState;
    localStorage.setItem(COLUMN_WIDTH_STORAGE_KEY_PREFIX + gridId, JSON.stringify(obj));
  }
}
