import {
  FIELD_TYPE_TEXT,
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
  OPERATOR_EMPTY,
  OPERATOR_NOT_EMPTY,
  OPERATOR_CONTAINS,
  OPERATOR_NOT_CONTAINS,
  OPERATOR_STARTS_WITH,
  OPERATOR_ENDS_WITH,
  OPERATOR_PERIOD,
} from '../config/schema';
import dayjs from 'dayjs';


export const FILTER_DEBOUNCE_MS = 200;

const FILTER_STORAGE_KEY_PREFIX = 'utron-datagrid-filters-';

/**
 * Load persisted filter model from localStorage. Returns only entries for known column fields.
 * @param {string} gridId
 * @param {Object[]} columns
 * @returns {Object}
 */
export function getStoredFilterModel(gridId, columns) {
  if (!gridId || typeof localStorage === 'undefined') return {};
  try {
    const raw = localStorage.getItem(FILTER_STORAGE_KEY_PREFIX + gridId);
    if (raw == null) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const fieldSet = new Set((columns || []).map((c) => c.field));
    const filtered = {};
    for (const [key, val] of Object.entries(parsed)) {
      if (fieldSet.has(key) && val != null && typeof val === 'object') filtered[key] = val;
    }
    return filtered;
  } catch {
    return {};
  }
}

/**
 * Persist filter model to localStorage.
 * @param {string} gridId
 * @param {Object} filterModel
 */
export function saveFilterModel(gridId, filterModel) {
  if (gridId && typeof localStorage !== 'undefined') {
    localStorage.setItem(FILTER_STORAGE_KEY_PREFIX + gridId, JSON.stringify(filterModel));
  }
}

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
      if (!state) return true;
      const isEmptyNotEmpty = state.operator === OPERATOR_EMPTY || state.operator === OPERATOR_NOT_EMPTY;
      const hasValue = state.operator === OPERATOR_PERIOD
        ? (state.value !== undefined && state.value !== '' && state.periodUnit != null)
        : (state.value !== undefined || state.valueTo !== undefined);
      if (!hasValue && !isEmptyNotEmpty) return true;
      const col = colMap.get(field);
      return matchFilter(row[field], state, col?.type);
    });
  });
}

function matchFilter(cellValue, state, type) {  
  const defaultOperator = type === FIELD_TYPE_TEXT ? OPERATOR_CONTAINS : OPERATOR_EQUALS;
  const { operator = defaultOperator, value, valueTo } = state;
  
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
      case OPERATOR_PERIOD: {
        const amount = Number(state.value);
        const periodUnit = state.periodUnit;
        if (periodUnit == null || amount == null || isNaN(amount) || amount <= 0) return false;
        const unit = periodUnit.endsWith('s') ? periodUnit.slice(0, -1) : periodUnit;
        const start = dayjs().subtract(amount, unit).valueOf();
        const now = dayjs().valueOf();
        return val >= start && val <= now;
      }
      case OPERATOR_EMPTY:
        return val == null || val === '';
      case OPERATOR_NOT_EMPTY:
        return val != null && val !== '';
      default:
        return true;
    }
  }

  if (type === FIELD_TYPE_LIST || Array.isArray(state.value)) {
    const selected = Array.isArray(state.value) ? state.value : state.value != null ? [state.value] : [];
    if (selected.length === 0) return true;
    return selected.some((s) => String(v) === String(s) || v === s);
  }

  // text operators
  const str = String(v ?? '').toLowerCase();
  const search = String(value ?? '').toLowerCase();

  switch (operator) {
    case OPERATOR_EMPTY:
      return str === '';
    case OPERATOR_NOT_EMPTY:
      return str !== '';
    case OPERATOR_EQUALS:
      return search === '' || str === search;
    case OPERATOR_NOT_EQUAL:
      return search === '' || str !== search;
    case OPERATOR_CONTAINS:
      return search === '' || str.includes(search);
    case OPERATOR_NOT_CONTAINS:
      return search === '' || !str.includes(search);
    case OPERATOR_STARTS_WITH:
      return search === '' || str.startsWith(search);
    case OPERATOR_ENDS_WITH:
      return search === '' || str.endsWith(search);
    default:
      return search === '' || str.includes(search);
  }
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
