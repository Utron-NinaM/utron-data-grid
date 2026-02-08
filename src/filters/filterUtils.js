import {
  FIELD_TYPE_NUMBER,
  FIELD_TYPE_DATE,
  FIELD_TYPE_DATETIME,
  FIELD_TYPE_LIST,
  OPERATOR_EQUALS,
  OPERATOR_NOT_EQUAL,
  OPERATOR_GREATER_THAN,
  OPERATOR_LESS_THAN,
  OPERATOR_GREATER_OR_EQUAL,
  OPERATOR_LESS_OR_EQUAL,
  OPERATOR_IN_RANGE,
} from '../config/schema';

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
  const { operator = OPERATOR_EQUALS, value, valueTo } = state;
  const v = cellValue;

  if (type === FIELD_TYPE_NUMBER || typeof v === 'number') {
    const n = Number(v);
    const a = Number(value);
    const b = valueTo != null ? Number(valueTo) : null;
    switch (operator) {
      case OPERATOR_EQUALS:
        return n === a;
      case OPERATOR_NOT_EQUAL:
        return n !== a;
      case OPERATOR_GREATER_THAN:
        return n > a;
      case OPERATOR_LESS_THAN:
        return n < a;
      case OPERATOR_GREATER_OR_EQUAL:
        return n >= a;
      case OPERATOR_LESS_OR_EQUAL:
        return n <= a;
      case OPERATOR_IN_RANGE:
        return b != null && n >= Math.min(a, b) && n <= Math.max(a, b);
      default:
        return true;
    }
  }

  if (type === FIELD_TYPE_DATE || type === FIELD_TYPE_DATETIME || (v && (v instanceof Date || typeof v === 'string' && isDateLike(v)))) {
    const t = toTime(v);
    const t1 = toTime(value);
    const t2 = valueTo != null ? toTime(valueTo) : null;
    if (t == null) return false;
    switch (operator) {
      case OPERATOR_EQUALS:
        return t === t1;
      case OPERATOR_NOT_EQUAL:
        return t !== t1;
      case OPERATOR_GREATER_THAN:
        return t > t1;
      case OPERATOR_LESS_THAN:
        return t < t1;
      case OPERATOR_GREATER_OR_EQUAL:
        return t >= t1;
      case OPERATOR_LESS_OR_EQUAL:
        return t <= t1;
      case OPERATOR_IN_RANGE:
        return t2 != null && t >= Math.min(t1, t2) && t <= Math.max(t1, t2);
      default:
        return true;
    }
  }

  if (type === FIELD_TYPE_LIST || Array.isArray(state.value)) {
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
