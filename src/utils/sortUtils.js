import { SORT_ORDER_ASC, SORT_ORDER_DESC } from '../config/schema';
import { STORAGE_KEY_PREFIX } from '../constants';

export const SORT_STORAGE_KEY_PREFIX = `${STORAGE_KEY_PREFIX}-sort-`;

const VALID_ORDERS = new Set([SORT_ORDER_ASC, SORT_ORDER_DESC]);

/**
 * Keep only entries whose field exists on columns and whose order is asc or desc.
 * @param {unknown} sortModel
 * @param {Object[]} columns
 * @returns {Array<{ field: string, order: 'asc'|'desc' }>}
 */
export function sanitizeSortModel(sortModel, columns) {
  if (!Array.isArray(sortModel)) return [];
  const fieldSet = new Set((columns || []).map((c) => c.field));
  return sortModel.filter(
    (s) =>
      s &&
      typeof s === 'object' &&
      fieldSet.has(s.field) &&
      VALID_ORDERS.has(s.order)
  );
}

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
    return sanitizeSortModel(parsed, columns);
  } catch {
    return [];
  }
}

/**
 * Effective sort on mount: non-empty validated persisted model wins. Otherwise (missing key, stored [],
 * invalid JSON, non-array, or every entry invalid for current columns) treat as no user choice and use
 * sanitized initialSortModel, or [] if initialSortModel is absent/empty after sanitize.
 * Without gridId or localStorage, uses sanitized initialSortModel only.
 * @param {string|undefined|null} gridId
 * @param {Object[]} columns
 * @param {Array<{ field: string, order: string }>|undefined|null} initialSortModel
 * @returns {Array<{ field: string, order: 'asc'|'desc' }>}
 */
export function getResolvedSortModelForMount(gridId, columns, initialSortModel) {
  const fallback = () => sanitizeSortModel(initialSortModel, columns);
  if (typeof localStorage === 'undefined') {
    return fallback();
  }
  if (!gridId) {
    return fallback();
  }
  try {
    const raw = localStorage.getItem(SORT_STORAGE_KEY_PREFIX + gridId);
    if (raw == null) {
      return fallback();
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return fallback();
    }
    const valid = sanitizeSortModel(parsed, columns);
    if (valid.length > 0) {
      return valid;
    }
    return fallback();
  } catch {
    return fallback();
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
