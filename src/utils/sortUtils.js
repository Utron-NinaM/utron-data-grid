import { SORT_ORDER_ASC } from '../config/schema';

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
