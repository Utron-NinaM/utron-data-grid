import {
  FIELD_TYPE_NUMBER,
  FIELD_TYPE_DATE,
  FIELD_TYPE_DATETIME,
  FIELD_TYPE_LIST,
  OPERATOR_MAP,
  OPERATOR_EQUALS,
  OPERATOR_NOT_EQUAL,
  OPERATOR_GREATER_THAN,
  OPERATOR_LESS_THAN,
  OPERATOR_GREATER_OR_EQUAL,
  OPERATOR_LESS_OR_EQUAL,
  OPERATOR_IN_RANGE,
  OPERATOR_EMPTY,
  OPERATOR_NOT_EMPTY,
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
  let val = null;
  let val1 = null;
  let val2 = null;

  if (type === FIELD_TYPE_NUMBER || typeof v === 'number') {
    val = Number(v);
    val1 = Number(value);
    val2 = valueTo != null ? Number(valueTo) : null;
  }

  if (type === FIELD_TYPE_DATE || type === FIELD_TYPE_DATETIME || (v && (v instanceof Date || typeof v === 'string' && isDateLike(v)))) {
    val = toTime(v);
    val1 = toTime(value);
    val2 = valueTo != null ? toTime(valueTo) : null;
    if (val == null) return false;
  }

  if (type === FIELD_TYPE_NUMBER || typeof v === 'number' || type === FIELD_TYPE_DATE || type === FIELD_TYPE_DATETIME || (v && (v instanceof Date || typeof v === 'string' && isDateLike(v)))) {
    switch (operator) {
      case OPERATOR_EQUALS:
        return val === val1;
      case OPERATOR_NOT_EQUAL:
        return val !== val1;
      case OPERATOR_GREATER_THAN:
        return val > val1;
      case OPERATOR_LESS_THAN:
        return val < val1;
      case OPERATOR_GREATER_OR_EQUAL:
        return val >= val1;
      case OPERATOR_LESS_OR_EQUAL:
        return val <= val1;
      case OPERATOR_IN_RANGE:
        return val2 != null && val >= Math.min(val1, val2) && val <= Math.max(val1, val2);
      case OPERATOR_EMPTY:
        return val == null || val === '';
      case OPERATOR_NOT_EMPTY:
        return val != null && val !== '';
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
