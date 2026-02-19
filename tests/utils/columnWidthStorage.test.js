import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getStoredColumnWidthState, saveColumnWidthState } from '../../src/utils/columnWidthStorage';

describe('getStoredColumnWidthState', () => {
  let getItemSpy;

  beforeEach(() => {
    getItemSpy = vi.fn();
    vi.stubGlobal('localStorage', { getItem: getItemSpy, setItem: vi.fn() });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });
 
  it('filters out unknown column fields', () => {
    const columns = [{ field: 'name' }, { field: 'age' }];
    getItemSpy.mockReturnValue(JSON.stringify({ name: 150, unknown: 200, age: 100 }));
    const result = getStoredColumnWidthState('myGrid', columns);
    expect(result.size).toBe(2);
    expect(result.get('name')).toBe(150);
    expect(result.get('age')).toBe(100);
    expect(result.has('unknown')).toBe(false);
  });

  it('filters out non-finite and non-positive widths', () => {
    const columns = [{ field: 'a' }, { field: 'b' }, { field: 'c' }, { field: 'd' }];
    getItemSpy.mockReturnValue(JSON.stringify({
      a: 100,
      b: 0,
      c: -50,
      d: NaN,
      e: Infinity,
    }));
    const result = getStoredColumnWidthState('myGrid', columns);
    expect(result.size).toBe(1);
    expect(result.get('a')).toBe(100);
  });

  it('returns valid Map for known columns with positive widths', () => {
    const columns = [{ field: 'name' }, { field: 'age' }];
    getItemSpy.mockReturnValue(JSON.stringify({ name: 200, age: 120 }));
    const result = getStoredColumnWidthState('myGrid', columns);
    expect(result.size).toBe(2);
    expect(result.get('name')).toBe(200);
    expect(result.get('age')).toBe(120);
  }); 
});