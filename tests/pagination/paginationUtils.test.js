import { describe, it, expect } from 'vitest';
import { slicePage } from '../../src/pagination/paginationUtils';

describe('slicePage', () => {
  function makeRows(n) {
    return Array.from({ length: n }, (_, i) => ({ id: i + 1, name: `Row ${i + 1}` }));
  }

  it('first page: returns first pageSize rows, from 1, to pageSize', () => {
    const rows = makeRows(100);
    const result = slicePage(rows, 0, 10);
    expect(result.rows).toHaveLength(10);
    expect(result.rows[0].id).toBe(1);
    expect(result.rows[9].id).toBe(10);
    expect(result.total).toBe(100);
    expect(result.from).toBe(1);
    expect(result.to).toBe(10);
  });

  it('normal case: page 1, pageSize 10 gives rows 11-20, from 11, to 20', () => {
    const rows = makeRows(100);
    const result = slicePage(rows, 1, 10);
    expect(result.rows).toHaveLength(10);
    expect(result.rows[0].id).toBe(11);
    expect(result.rows[9].id).toBe(20);
    expect(result.total).toBe(100);
    expect(result.from).toBe(11);
    expect(result.to).toBe(20);
  });

  it('empty rows: returns empty slice, from 0, to 0, total 0', () => {
    const result = slicePage([], 0, 10);
    expect(result.rows).toEqual([]);
    expect(result.total).toBe(0);
    expect(result.from).toBe(0);
    expect(result.to).toBe(0);
  });

  it('page past end: returns empty slice, from/to clamped', () => {
    const rows = makeRows(5);
    const result = slicePage(rows, 2, 10);
    expect(result.rows).toHaveLength(0);
    expect(result.total).toBe(5);
    expect(result.from).toBe(6);
    expect(result.to).toBe(5);
  });

  it('last partial page: returns remaining rows, correct from and to', () => {
    const rows = makeRows(25);
    const result = slicePage(rows, 2, 10);
    expect(result.rows).toHaveLength(5);
    expect(result.rows[0].id).toBe(21);
    expect(result.rows[4].id).toBe(25);
    expect(result.total).toBe(25);
    expect(result.from).toBe(21);
    expect(result.to).toBe(25);
  });
});
