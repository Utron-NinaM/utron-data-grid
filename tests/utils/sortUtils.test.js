import { describe, it, expect } from 'vitest';
import { applySort } from '../../src/utils/sortUtils';
import { SORT_ORDER_ASC, SORT_ORDER_DESC } from '../../src/config/schema';

describe('applySort', () => {
  describe('no sort', () => {
    it('returns a copy of rows when sortModel is missing', () => {
      const rows = [{ id: 1 }, { id: 2 }];
      const result = applySort(rows, undefined);
      expect(result).toEqual([{ id: 1 }, { id: 2 }]);
      expect(result).not.toBe(rows);
    });

    it('returns a copy of rows when sortModel is null', () => {
      const rows = [{ id: 1 }, { id: 2 }];
      const result = applySort(rows, null);
      expect(result).toEqual([{ id: 1 }, { id: 2 }]);
      expect(result).not.toBe(rows);
    });

    it('returns a copy of rows when sortModel is empty array', () => {
      const rows = [{ id: 1 }, { id: 2 }];
      const result = applySort(rows, []);
      expect(result).toEqual([{ id: 1 }, { id: 2 }]);
      expect(result).not.toBe(rows);
    });
  });

  describe('empty rows', () => {
    it('returns empty array when rows is empty and sortModel is valid', () => {
      const result = applySort([], [{ field: 'id', order: SORT_ORDER_ASC }]);
      expect(result).toEqual([]);
    });
  });

  describe('single column', () => {
    it('sorts ascending by numeric field', () => {
      const rows = [{ id: 3 }, { id: 1 }, { id: 2 }];
      const result = applySort(rows, [{ field: 'id', order: SORT_ORDER_ASC }]);
      expect(result.map((r) => r.id)).toEqual([1, 2, 3]);
    });

    it('sorts descending by numeric field', () => {
      const rows = [{ id: 3 }, { id: 1 }, { id: 2 }];
      const result = applySort(rows, [{ field: 'id', order: SORT_ORDER_DESC }]);
      expect(result.map((r) => r.id)).toEqual([3, 2, 1]);
    });
  });

  describe('multi-column', () => {
    it('sorts by primary then secondary column', () => {
      const rows = [
        { dept: 'B', name: 'y' },
        { dept: 'A', name: 'z' },
        { dept: 'A', name: 'a' },
      ];
      const result = applySort(rows, [
        { field: 'dept', order: SORT_ORDER_ASC },
        { field: 'name', order: SORT_ORDER_ASC },
      ]);
      expect(result).toEqual([
        { dept: 'A', name: 'a' },
        { dept: 'A', name: 'z' },
        { dept: 'B', name: 'y' },
      ]);
    });

    it('respects order per column (asc primary, desc secondary)', () => {
      const rows = [
        { k: 1, v: 10 },
        { k: 1, v: 20 },
        { k: 2, v: 5 },
      ];
      const result = applySort(rows, [
        { field: 'k', order: SORT_ORDER_ASC },
        { field: 'v', order: SORT_ORDER_DESC },
      ]);
      expect(result).toEqual([
        { k: 1, v: 20 },
        { k: 1, v: 10 },
        { k: 2, v: 5 },
      ]);
    });
  });

  describe('compare: numbers', () => {
    it('sorts numbers ascending', () => {
      const rows = [{ x: 5 }, { x: 1 }, { x: 3 }];
      const result = applySort(rows, [{ field: 'x', order: SORT_ORDER_ASC }]);
      expect(result.map((r) => r.x)).toEqual([1, 3, 5]);
    });

    it('sorts numbers descending', () => {
      const rows = [{ x: 5 }, { x: 1 }, { x: 3 }];
      const result = applySort(rows, [{ field: 'x', order: SORT_ORDER_DESC }]);
      expect(result.map((r) => r.x)).toEqual([5, 3, 1]);
    });
  });

  describe('compare: dates', () => {
    it('sorts Date values ascending', () => {
      const d1 = new Date('2020-01-01');
      const d2 = new Date('2022-01-01');
      const d3 = new Date('2021-01-01');
      const rows = [{ d: d2 }, { d: d1 }, { d: d3 }];
      const result = applySort(rows, [{ field: 'd', order: SORT_ORDER_ASC }]);
      expect(result.map((r) => r.d.getFullYear())).toEqual([2020, 2021, 2022]);
    });

    it('sorts Date values descending', () => {
      const d1 = new Date('2020-01-01');
      const d2 = new Date('2022-01-01');
      const d3 = new Date('2021-01-01');
      const rows = [{ d: d2 }, { d: d1 }, { d: d3 }];
      const result = applySort(rows, [{ field: 'd', order: SORT_ORDER_DESC }]);
      expect(result.map((r) => r.d.getFullYear())).toEqual([2022, 2021, 2020]);
    });
  });

  describe('compare: strings', () => {
    it('sorts string values ascending', () => {
      const rows = [{ s: 'c' }, { s: 'a' }, { s: 'b' }];
      const result = applySort(rows, [{ field: 's', order: SORT_ORDER_ASC }]);
      expect(result.map((r) => r.s)).toEqual(['a', 'b', 'c']);
    });

    it('sorts string values descending', () => {
      const rows = [{ s: 'c' }, { s: 'a' }, { s: 'b' }];
      const result = applySort(rows, [{ field: 's', order: SORT_ORDER_DESC }]);
      expect(result.map((r) => r.s)).toEqual(['c', 'b', 'a']);
    });

    it('uses numeric option for numeric-like strings (2 before 10)', () => {
      const rows = [{ n: '10' }, { n: '2' }, { n: '1' }];
      const result = applySort(rows, [{ field: 'n', order: SORT_ORDER_ASC }]);
      expect(result.map((r) => r.n)).toEqual(['1', '2', '10']);
    });
  });

  describe('compare: null and undefined', () => {
    it('treats both null as equal', () => {
      const rows = [{ x: null }, { x: null }];
      const result = applySort(rows, [{ field: 'x', order: SORT_ORDER_ASC }]);
      expect(result).toHaveLength(2);
      expect(result.every((r) => r.x == null)).toBe(true);
    });

    it('treats both undefined as equal', () => {
      const rows = [{ x: undefined }, { x: undefined }];
      const result = applySort(rows, [{ field: 'x', order: SORT_ORDER_ASC }]);
      expect(result).toHaveLength(2);
    });

    it('sorts null after non-null (a null compares as greater)', () => {
      const rows = [{ x: 1 }, { x: null }, { x: 2 }];
      const result = applySort(rows, [{ field: 'x', order: SORT_ORDER_ASC }]);
      expect(result.map((r) => r.x)).toEqual([1, 2, null]);
    });

    it('sorts undefined after non-null', () => {
      const rows = [{ x: 1 }, { x: undefined }, { x: 2 }];
      const result = applySort(rows, [{ field: 'x', order: SORT_ORDER_ASC }]);
      expect(result.map((r) => r.x)).toEqual([1, 2, undefined]);
    });
  });

  describe('immutability', () => {
    it('does not mutate input rows', () => {
      const rows = [{ id: 2 }, { id: 1 }];
      const snapshot = rows.map((r) => ({ ...r }));
      applySort(rows, [{ field: 'id', order: SORT_ORDER_ASC }]);
      expect(rows).toEqual(snapshot);
    });

    it('returns a new array reference', () => {
      const rows = [{ id: 1 }, { id: 2 }];
      const result = applySort(rows, [{ field: 'id', order: SORT_ORDER_ASC }]);
      expect(result).not.toBe(rows);
    });
  });
});
