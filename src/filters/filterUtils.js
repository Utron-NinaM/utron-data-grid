/**
 * Apply filter model to rows. AND across columns.
 * @param {Object[]} rows
 * @param {Object} filterModel - { [field]: { operator?, value?, valueTo? } }
 * @param {Object[]} columns
 * @returns {Object[]}
 */
export function applyFilters(rows, filterModel, columns) {
  if (!filterModel || Object.keys(filterModel).length === 0) return rows;
  const colMap = new Map(columns.map((c) => [c.field, c]));
  return rows.filter((row) => {
    return Object.entries(filterModel).every(([field, state]) => {
      if (!state || (state.value === undefined && state.valueTo === undefined)) return true;
      const col = colMap.get(field);
      return matchFilter(row[field], state, col?.type);
    });
  });
}

function matchFilter(cellValue, state, type) {
  const { operator = '=', value, valueTo } = state;
  const v = cellValue;

  if (type === 'number' || typeof v === 'number') {
    const n = Number(v);
    const a = Number(value);
    const b = valueTo != null ? Number(valueTo) : null;
    switch (operator) {
      case '=':
        return n === a;
      case '!=':
        return n !== a;
      case '>':
        return n > a;
      case '<':
        return n < a;
      case '>=':
        return n >= a;
      case '<=':
        return n <= a;
      case 'inRange':
        return b != null && n >= Math.min(a, b) && n <= Math.max(a, b);
      default:
        return true;
    }
  }

  if (type === 'date' || type === 'datetime' || (v && (v instanceof Date || typeof v === 'string' && isDateLike(v)))) {
    const t = toTime(v);
    const t1 = toTime(value);
    const t2 = valueTo != null ? toTime(valueTo) : null;
    if (t == null) return false;
    switch (operator) {
      case '=':
        return t === t1;
      case '!=':
        return t !== t1;
      case '>':
        return t > t1;
      case '<':
        return t < t1;
      case '>=':
        return t >= t1;
      case '<=':
        return t <= t1;
      case 'inRange':
        return t2 != null && t >= Math.min(t1, t2) && t <= Math.max(t1, t2);
      default:
        return true;
    }
  }

  if (type === 'list' || Array.isArray(state.value)) {
    const selected = Array.isArray(state.value) ? state.value : [state.value];
    if (selected.length === 0) return true;
    return selected.some((s) => String(v) === String(s) || v === s);
  }

  // text contains
  const str = String(v ?? '').toLowerCase();
  const search = String(value ?? '').toLowerCase();
  return search === '' || str.includes(search);
}

function toTime(x) {
  if (x == null) return null;
  if (typeof x === 'number') return x;
  const d = x instanceof Date ? x : new Date(x);
  return isNaN(d.getTime()) ? null : d.getTime();
}

function isDateLike(s) {
  return /^\d{4}-\d{2}-\d{2}/.test(s) || /^\d{2}-\d{2}-\d{4}/.test(s);
}
