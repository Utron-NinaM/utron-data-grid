import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  FILTER_DEBOUNCE_MS,
  getStoredFilterModel,
  saveFilterModel,
  applyFilters,
} from '../../src/filters/filterUtils';
import {
  FIELD_TYPE_NUMBER,
  FIELD_TYPE_DATE,
  FIELD_TYPE_DATETIME,
  FIELD_TYPE_LIST,
  FIELD_TYPE_TEXT,
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
} from '../../src/config/schema';

const STORAGE_KEY_PREFIX = 'utron-datagrid-filters-';

describe('FILTER_DEBOUNCE_MS', () => {
  it('equals 200', () => {
    expect(FILTER_DEBOUNCE_MS).toBe(200);
  });
});

describe('getStoredFilterModel', () => {
  let getItemSpy;

  beforeEach(() => {
    getItemSpy = vi.fn();
    vi.stubGlobal('localStorage', { getItem: getItemSpy, setItem: vi.fn() });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns {} when gridId is empty string', () => {
    expect(getStoredFilterModel('', [])).toEqual({});
    expect(getItemSpy).not.toHaveBeenCalled();
  });

  it('returns {} when gridId is null', () => {
    expect(getStoredFilterModel(null, [])).toEqual({});
  });

  it('returns {} when gridId is undefined', () => {
    expect(getStoredFilterModel(undefined, [])).toEqual({});
  });

  it('returns {} when getItem returns null', () => {
    getItemSpy.mockReturnValue(null);
    expect(getStoredFilterModel('myGrid', [])).toEqual({});
  });

  it('returns {} when getItem returns undefined (key missing)', () => {
    getItemSpy.mockReturnValue(undefined);
    expect(getStoredFilterModel('myGrid', [])).toEqual({});
  });

  it('returns {} when stored value is invalid JSON', () => {
    getItemSpy.mockReturnValue('not json {');
    expect(getStoredFilterModel('myGrid', [])).toEqual({});
  });

  it('returns {} when parsed is null', () => {
    getItemSpy.mockReturnValue('null');
    expect(getStoredFilterModel('myGrid', [])).toEqual({});
  });

  it('returns {} when parsed is array', () => {
    getItemSpy.mockReturnValue('[]');
    expect(getStoredFilterModel('myGrid', [])).toEqual({});
  });

  it('returns {} when parsed is primitive', () => {
    getItemSpy.mockReturnValue('42');
    expect(getStoredFilterModel('myGrid', [])).toEqual({});
  });

  it('keeps only entries whose key is in columns[].field', () => {
    getItemSpy.mockReturnValue(
      JSON.stringify({
        known: { operator: 'eq', value: 'a' },
        unknown: { operator: 'eq', value: 'b' },
      })
    );
    const columns = [{ field: 'known' }];
    expect(getStoredFilterModel('myGrid', columns)).toEqual({
      known: { operator: 'eq', value: 'a' },
    });
  });

  it('drops entries where value is null or not object', () => {
    getItemSpy.mockReturnValue(
      JSON.stringify({
        a: null,
        b: 'string',
        c: 1,
        d: { operator: 'eq' },
      })
    );
    const columns = [{ field: 'a' }, { field: 'b' }, { field: 'c' }, { field: 'd' }];
    expect(getStoredFilterModel('myGrid', columns)).toEqual({
      d: { operator: 'eq' },
    });
  });

  it('returns filtered object for valid stored data and known columns', () => {
    const stored = { name: { operator: 'operatorContains', value: 'x' } };
    getItemSpy.mockReturnValue(JSON.stringify(stored));
    const columns = [{ field: 'name' }];
    expect(getStoredFilterModel('myGrid', columns)).toEqual(stored);
  });

  it('calls getItem with key utron-datagrid-filters- + gridId', () => {
    getItemSpy.mockReturnValue(null);
    getStoredFilterModel('abc', []);
    expect(getItemSpy).toHaveBeenCalledWith(STORAGE_KEY_PREFIX + 'abc');
  });
});

describe('getStoredFilterModel (no localStorage)', () => {
  let originalLocalStorage;

  beforeEach(() => {
    originalLocalStorage = globalThis.localStorage;
    Object.defineProperty(globalThis, 'localStorage', { value: undefined, configurable: true });
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'localStorage', { value: originalLocalStorage, configurable: true });
  });

  it('returns {} when localStorage is undefined (SSR)', () => {
    expect(getStoredFilterModel('grid', [])).toEqual({});
  });
});

describe('saveFilterModel', () => {
  let setItemSpy;

  beforeEach(() => {
    setItemSpy = vi.fn();
    vi.stubGlobal('localStorage', { getItem: vi.fn(), setItem: setItemSpy });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('does not call setItem when gridId is empty', () => {
    saveFilterModel('', { a: {} });
    expect(setItemSpy).not.toHaveBeenCalled();
  });

  it('does not call setItem when gridId is null', () => {
    saveFilterModel(null, { a: {} });
    expect(setItemSpy).not.toHaveBeenCalled();
  });

  it('calls setItem with key and stringified model when gridId and localStorage present', () => {
    const model = { name: { operator: 'operatorEquals', value: 'x' } };
    saveFilterModel('myGrid', model);
    expect(setItemSpy).toHaveBeenCalledWith(STORAGE_KEY_PREFIX + 'myGrid', JSON.stringify(model));
  });

  it('persists list filter by keys (value array of keys)', () => {
    const model = { status: { value: ['published', 'draft'] } };
    saveFilterModel('myGrid', model);
    expect(setItemSpy).toHaveBeenCalledWith(STORAGE_KEY_PREFIX + 'myGrid', JSON.stringify(model));
  });
});

describe('applyFilters — general', () => {
  const columns = [{ field: 'a', type: FIELD_TYPE_TEXT }];
  const rows = [{ a: 'x' }, { a: 'y' }];

  it('returns rows when filterModel is null', () => {
    const result = applyFilters(rows, null, columns);
    expect(result).toBe(rows);
    expect(result).toEqual(rows);
  });

  it('returns rows when filterModel is undefined', () => {
    const result = applyFilters(rows, undefined, columns);
    expect(result).toBe(rows);
  });

  it('returns rows when filterModel is empty object', () => {
    const result = applyFilters(rows, {}, columns);
    expect(result).toBe(rows);
  });

  it('returns empty array when rows is empty', () => {
    expect(applyFilters([], { a: { operator: OPERATOR_EQUALS, value: 'x' } }, columns)).toEqual([]);
  });

  it('AND across columns: row must match every column filter', () => {
    const rows2 = [
      { a: 'yes', b: 10 },
      { a: 'yes', b: 5 },
      { a: 'no', b: 10 },
    ];
    const cols = [
      { field: 'a', type: FIELD_TYPE_TEXT },
      { field: 'b', type: FIELD_TYPE_NUMBER },
    ];
    const filterModel = {
      a: { operator: OPERATOR_EQUALS, value: 'yes' },
      b: { operator: OPERATOR_GREATER_THAN, value: 7 },
    };
    const result = applyFilters(rows2, filterModel, cols);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ a: 'yes', b: 10 });
  });

  it('treats falsy state as pass (no filter)', () => {
    const result = applyFilters(
      [{ a: 'any' }],
      { a: null },
      [{ field: 'a', type: FIELD_TYPE_TEXT }]
    );
    expect(result).toHaveLength(1);
  });

  it('passes when hasValue is false and operator is not empty/notEmpty', () => {
    const result = applyFilters(
      [{ a: 'any' }],
      { a: { operator: OPERATOR_EQUALS } },
      [{ field: 'a', type: FIELD_TYPE_TEXT }]
    );
    expect(result).toHaveLength(1);
  });

  it('unknown column field: matchFilter runs with col?.type undefined (text path)', () => {
    const result = applyFilters(
      [{ foo: 'hello' }],
      { foo: { operator: OPERATOR_CONTAINS, value: 'ell' } },
      []
    );
    expect(result).toHaveLength(1);
  });
});

describe('applyFilters — number type', () => {
  const col = [{ field: 'x', type: FIELD_TYPE_NUMBER }];

  it('OPERATOR_EQUALS', () => {
    const rows = [{ x: 10 }, { x: 20 },{ x: 10 },{ x: undefined },{ x: '' }];
    expect(applyFilters(rows, { x: { operator: OPERATOR_EQUALS, value: 10 } }, col)).toHaveLength(2);
    expect(applyFilters(rows, { x: { operator: OPERATOR_EQUALS, value: 20 } }, col)[0].x).toBe(20);
  });

  it('OPERATOR_NOT_EQUAL', () => {
    const rows = [{ x: 10 }, { x: 20 }];
    const result = applyFilters(rows, { x: { operator: OPERATOR_NOT_EQUAL, value: 10 } }, col);
    expect(result).toHaveLength(1);
    expect(result[0].x).toBe(20);
  });

  it('OPERATOR_GREATER_THAN', () => {
    const rows = [{ x: 5 }, { x: 10 }, { x: 15 }];
    const result = applyFilters(rows, { x: { operator: OPERATOR_GREATER_THAN, value: 10 } }, col);
    expect(result).toHaveLength(1);
    expect(result[0].x).toBe(15);
  });

  it('OPERATOR_LESS_THAN', () => {
    const rows = [{ x: 5 }, { x: 10 }, { x: 15 }];
    const result = applyFilters(rows, { x: { operator: OPERATOR_LESS_THAN, value: 10 } }, col);
    expect(result).toHaveLength(1);
    expect(result[0].x).toBe(5);
  });

  it('OPERATOR_GREATER_OR_EQUAL at boundary', () => {
    const rows = [{ x: 10 }, { x: 20 }];
    const result = applyFilters(rows, { x: { operator: OPERATOR_GREATER_OR_EQUAL, value: 10 } }, col);
    expect(result).toHaveLength(2);
  });

  it('OPERATOR_LESS_OR_EQUAL at boundary', () => {
    const rows = [{ x: 10 }, { x: 20 }];
    const result = applyFilters(rows, { x: { operator: OPERATOR_LESS_OR_EQUAL, value: 20 } }, col);
    expect(result).toHaveLength(2);
  });

  it('OPERATOR_IN_RANGE inclusive', () => {
    const rows = [{ x: 5 }, { x: 10 }, { x: 15 }, { x: 20 }];
    const result = applyFilters(
      rows,
      { x: { operator: OPERATOR_IN_RANGE, value: 10, valueTo: 15 } },
      col
    );
    expect(result.map((r) => r.x)).toEqual([10, 15]);
  });

  it('OPERATOR_IN_RANGE with swapped value and valueTo', () => {
    const rows = [{ x: 10 }, { x: 20 }];
    const result = applyFilters(
      rows,
      { x: { operator: OPERATOR_IN_RANGE, value: 20, valueTo: 10 } },
      col
    );
    expect(result.map((r) => r.x)).toEqual([10, 20]);
  });

  it('OPERATOR_EMPTY: number type coerces cell to Number so null/undefined/"" become 0 or NaN; EMPTY checks val == null || val === "", so no rows match', () => {
    const rows = [{ x: 1 }, { x: null }, { x: undefined }, { x: '' }];
    const result = applyFilters(rows, { x: { operator: OPERATOR_EMPTY } }, col);
    expect(result).toHaveLength(0);
  });

  it('OPERATOR_NOT_EMPTY matches rows with numeric value; null coerces to 0 so it passes', () => {
    const rows = [{ x: 0 }, { x: null }, { x: 1 }];
    const result = applyFilters(rows, { x: { operator: OPERATOR_NOT_EMPTY } }, col);
    expect(result.map((r) => r.x)).toEqual([0, null, 1]);
  });

  it('coerces numeric string in cell via Number(v)', () => {
    const rows = [{ x: '42' }];
    const result = applyFilters(rows, { x: { operator: OPERATOR_EQUALS, value: 42 } }, col);
    expect(result).toHaveLength(1);
  });
});

describe('applyFilters — number type OPERATOR_PERIOD', () => {
  const col = [{ field: 'x', type: FIELD_TYPE_DATE }];

  it('passes row when cell timestamp is within period (last 7 days)', async () => {
    const dayjs = (await import('dayjs')).default;
    const now = dayjs().valueOf();
    const threeDaysAgo = dayjs().subtract(3, 'day').valueOf();
    const tenDaysAgo = dayjs().subtract(10, 'day').valueOf();
    const rows = [{ x: threeDaysAgo }, { x: tenDaysAgo }, { x: now }];
    const result = applyFilters(
      rows,
      { x: { operator: OPERATOR_PERIOD, value: 7, periodUnit: 'day' } },
      col
    );
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.x)).toEqual(expect.arrayContaining([threeDaysAgo, now]));
  });

  it('periodUnit ending in "s" is normalized to singular for dayjs', async () => {
    const dayjs = (await import('dayjs')).default;
    const mid = dayjs().subtract(1, 'day').valueOf();
    const rows = [{ x: mid }];
    const result = applyFilters(
      rows,
      { x: { operator: OPERATOR_PERIOD, value: 2, periodUnit: 'days' } },
      col
    );
    expect(result).toHaveLength(1);
  });
});

describe('applyFilters — OPERATOR_PERIOD edge cases', () => {
  const col = [{ field: 'x', type: FIELD_TYPE_DATE }];

  it('when periodUnit is null, hasValue is false so filter is not applied and row passes', () => {
    const result = applyFilters(
      [{ x: Date.now() }],
      { x: { operator: OPERATOR_PERIOD, value: 7, periodUnit: null } },
      col
    );
    expect(result).toHaveLength(1);
  });

  it('fails when amount is NaN', () => {
    const result = applyFilters(
      [{ x: Date.now() }],
      { x: { operator: OPERATOR_PERIOD, value: NaN, periodUnit: 'day' } },
      col
    );
    expect(result).toHaveLength(0);
  });

  it('fails when amount is 0', () => {
    const result = applyFilters(
      [{ x: Date.now() }],
      { x: { operator: OPERATOR_PERIOD, value: 0, periodUnit: 'day' } },
      col
    );
    expect(result).toHaveLength(0);
  });
});

describe('applyFilters — date/datetime type', () => {
  const colDate = [{ field: 'd', type: FIELD_TYPE_DATE }];

  it('OPERATOR_EQUALS with Date cell', () => {
    const d = new Date('2022-06-15');
    const rows = [{ d }, { d: new Date('2022-06-16') }];
    const result = applyFilters(
      rows,
      { d: { operator: OPERATOR_EQUALS, value: '2022-06-15' } },
      colDate
    );
    expect(result).toHaveLength(1);
    expect(result[0].d.getTime()).toBe(d.getTime());
  });

  it('OPERATOR_EQUALS with ISO string cell', () => {
    const rows = [{ d: '2022-06-15' }, { d: '2022-06-16' }];
    const result = applyFilters(
      rows,
      { d: { operator: OPERATOR_EQUALS, value: '2022-06-15' } },
      colDate
    );
    expect(result).toHaveLength(1);
    expect(result[0].d).toBe('2022-06-15');
  });

  it('OPERATOR_IN_RANGE with date strings', () => {
    const rows = [
      { d: '2022-06-10' },
      { d: '2022-06-15' },
      { d: '2022-06-20' },
    ];
    const result = applyFilters(
      rows,
      { d: { operator: OPERATOR_IN_RANGE, value: '2022-06-12', valueTo: '2022-06-18' } },
      colDate
    );
    expect(result).toHaveLength(1);
    expect(result[0].d).toBe('2022-06-15');
  });

  it('OPERATOR_EMPTY / OPERATOR_NOT_EMPTY for date column', () => {
    const rows = [{ d: null }, { d: '2022-06-15' }];
    expect(applyFilters(rows, { d: { operator: OPERATOR_EMPTY } }, colDate)).toHaveLength(0);
    expect(applyFilters(rows, { d: { operator: OPERATOR_NOT_EMPTY } }, colDate)).toHaveLength(1);
  });

  it('invalid date string: toTime returns null, row fails', () => {
    const rows = [{ d: 'not-a-date' }];
    const result = applyFilters(
      rows,
      { d: { operator: OPERATOR_EQUALS, value: '2022-06-15' } },
      colDate
    );
    expect(result).toHaveLength(0);
  });

  it('FIELD_TYPE_DATETIME same comparison behavior', () => {
    const colDt = [{ field: 'd', type: FIELD_TYPE_DATETIME }];
    const rows = [{ d: new Date('2022-01-01T12:00:00Z') }];
    const result = applyFilters(
      rows,
      { d: { operator: OPERATOR_EQUALS, value: new Date('2022-01-01T12:00:00Z') } },
      colDt
    );
    expect(result).toHaveLength(1);
  });
});

describe('applyFilters — list type', () => {
  const col = [{ field: 'tag', type: FIELD_TYPE_LIST }];

  it('state.value array: row passes if cell matches any selected', () => {
    const rows = [{ tag: 'a' }, { tag: 'b' }, { tag: 'c' }];
    const result = applyFilters(
      rows,
      { tag: { operator: OPERATOR_EQUALS, value: ['a', 'c'] } },
      col
    );
    expect(result.map((r) => r.tag)).toEqual(['a', 'c']);
  });

  it('state.value single value treated as single-element array', () => {
    const rows = [{ tag: 'x' }, { tag: 'y' }];
    const result = applyFilters(
      rows,
      { tag: { value: 'x' } },
      col
    );
    expect(result).toHaveLength(1);
    expect(result[0].tag).toBe('x');
  });

  it('empty selected array: no row filtered out', () => {
    const rows = [{ tag: 'a' }, { tag: 'b' }];
    const result = applyFilters(rows, { tag: { value: [] } }, col);
    expect(result).toHaveLength(2);
  });

  it('match by string coercion', () => {
    const rows = [{ tag: 42 }];
    const result = applyFilters(rows, { tag: { value: ['42'] } }, col);
    expect(result).toHaveLength(1);
  });

  it('empty array passes all rows (no filter)', () => {
    const rows = [{ tag: 'a' }, { tag: 'b' }];
    const result = applyFilters(rows, { tag: { value: [] } }, col);
    expect(result).toHaveLength(2);
  });

  it('state.value null normalized to empty selected, passes all', () => {
    const rows = [{ tag: 'a' }];
    const result = applyFilters(rows, { tag: { value: null } }, col);
    expect(result).toHaveLength(1);
  });
});

describe('applyFilters — text type', () => {
  const col = [{ field: 'name', type: FIELD_TYPE_TEXT }];

  it('OPERATOR_EMPTY', () => {
    const rows = [{ name: '' }, { name: 'x' }, { name: null }, { name: undefined }];
    const result = applyFilters(rows, { name: { operator: OPERATOR_EMPTY } }, col);
    expect(result.map((r) => r.name)).toEqual(expect.arrayContaining(['', null, undefined]));
    expect(result).toHaveLength(3);
  });

  it('OPERATOR_NOT_EMPTY', () => {
    const rows = [{ name: '' }, { name: 'x' }];
    const result = applyFilters(rows, { name: { operator: OPERATOR_NOT_EMPTY } }, col);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('x');
  });

  it('OPERATOR_EQUALS case-insensitive', () => {
    const rows = [{ name: 'Hello' }, { name: 'HELLO' }];
    const result = applyFilters(rows, { name: { operator: OPERATOR_EQUALS, value: 'hello' } }, col);
    expect(result).toHaveLength(2);
  });

  it('OPERATOR_EQUALS empty search passes all', () => {
    const rows = [{ name: 'a' }, { name: 'b' }];
    const result = applyFilters(rows, { name: { operator: OPERATOR_EQUALS, value: '' } }, col);
    expect(result).toHaveLength(2);
  });

  it('OPERATOR_NOT_EQUAL empty search passes all', () => {
    const rows = [{ name: 'a' }];
    const result = applyFilters(rows, { name: { operator: OPERATOR_NOT_EQUAL, value: '' } }, col);
    expect(result).toHaveLength(1);
  });

  it('OPERATOR_CONTAINS', () => {
    const rows = [{ name: 'hello world' }, { name: 'foo' }];
    const result = applyFilters(rows, { name: { operator: OPERATOR_CONTAINS, value: 'world' } }, col);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('hello world');
  });

  it('OPERATOR_CONTAINS case-insensitive', () => {
    const rows = [{ name: 'Hello World' }];
    const result = applyFilters(rows, { name: { operator: OPERATOR_CONTAINS, value: 'world' } }, col);
    expect(result).toHaveLength(1);
  });

  it('OPERATOR_NOT_CONTAINS', () => {
    const rows = [{ name: 'hello' }, { name: 'hello world' }];
    const result = applyFilters(rows, { name: { operator: OPERATOR_NOT_CONTAINS, value: 'world' } }, col);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('hello');
  });

  it('OPERATOR_STARTS_WITH', () => {
    const rows = [{ name: 'hello' }, { name: 'hi' }];
    const result = applyFilters(rows, { name: { operator: OPERATOR_STARTS_WITH, value: 'hel' } }, col);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('hello');
  });

  it('OPERATOR_ENDS_WITH', () => {
    const rows = [{ name: 'hello' }, { name: 'lo' }];
    const result = applyFilters(rows, { name: { operator: OPERATOR_ENDS_WITH, value: 'lo' } }, col);
    expect(result).toHaveLength(2);
  });

  it('null/undefined cell becomes empty string', () => {
    const rows = [{ name: null }, { name: undefined }];
    const result = applyFilters(rows, { name: { operator: OPERATOR_EMPTY } }, col);
    expect(result).toHaveLength(2);
  });

  it('unknown operator defaults to contains-like', () => {
    const rows = [{ name: 'abc' }, { name: 'x' }];
    const result = applyFilters(
      rows,
      { name: { operator: 'unknownOp', value: 'b' } },
      col
    );
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('abc');
  });
});

describe('applyFilters — edge cases and immutability', () => {
  it('does not mutate input rows', () => {
    const rows = [{ a: 1 }, { a: 2 }];
    const snapshot = rows.map((r) => ({ ...r }));
    applyFilters(rows, { a: { operator: OPERATOR_EQUALS, value: 1 } }, [
      { field: 'a', type: FIELD_TYPE_NUMBER },
    ]);
    expect(rows).toEqual(snapshot);
  });

  it('returns new array when filtering (not same reference as rows)', () => {
    const rows = [{ a: 1 }, { a: 2 }];
    const result = applyFilters(rows, { a: { operator: OPERATOR_EQUALS, value: 1 } }, [
      { field: 'a', type: FIELD_TYPE_NUMBER },
    ]);
    expect(result).not.toBe(rows);
  });

  it('column type undefined but cell is number uses number path', () => {
    const rows = [{ x: 42 }];
    const result = applyFilters(
      rows,
      { x: { operator: OPERATOR_EQUALS, value: 42 } },
      [{ field: 'x' }]
    );
    expect(result).toHaveLength(1);
  });
});
