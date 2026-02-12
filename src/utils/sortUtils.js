import { SORT_ORDER_ASC, SORT_ORDER_DESC } from '../config/schema';

const SORT_STORAGE_KEY_PREFIX = 'utron-datagrid-sort-';

/**
 * Load persisted sort model from localStorage. Returns only entries for known column fields with valid order.
 * @param {string} gridId
 * @param {Object[]} columns
 * @returns {Array<{ field: string, order: 'asc'|'desc' }>}
 */
export function getStoredSortModel(gridId, columns) {
  if (!gridId || typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SORT_STORAGE_KEY_PREFIX + gridId);
    if (raw == null) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const fieldSet = new Set((columns || []).map((c) => c.field));
    const validOrders = new Set([SORT_ORDER_ASC, SORT_ORDER_DESC]);
    return parsed.filter(
      (s) =>
        s &&
        typeof s === 'object' &&
        fieldSet.has(s.field) &&
        validOrders.has(s.order)
    );
  } catch {
    return [];
  }
}

/**
 * Persist sort model to localStorage.
 * @param {string} gridId
 * @param {Array<{ field: string, order: 'asc'|'desc' }>} sortModel
 */
export function saveSortModel(gridId, sortModel) {
  if (gridId && typeof localStorage !== 'undefined') {
    localStorage.setItem(SORT_STORAGE_KEY_PREFIX + gridId, JSON.stringify(sortModel || []));
  }
}

/**
 * Multi-column sort: apply sortModel in order (primary, secondary, ...)
 * @param {Object[]} rows
 * @param {Array<{ field: string, order: 'asc'|'desc' }>} sortModel
 * @returns {Object[]} new sorted array
 */
export function applySort(rows, sortModel) {
  if (!sortModel?.length) return [...rows];
  return [...rows].sort((a, b) => {
    for (const { field, order } of sortModel) {
      const va = a[field];
      const vb = b[field];
      const cmp = compare(va, vb);
      if (cmp !== 0) return order === SORT_ORDER_ASC ? cmp : -cmp;
    }
    return 0;
  });
}

function compare(a, b) {
  const aNil = a == null;
  const bNil = b == null;
  if (aNil && bNil) return 0;
  if (aNil) return 1;
  if (bNil) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  const sa = String(a);
  const sb = String(b);
  return sa.localeCompare(sb, undefined, { numeric: true });
}
