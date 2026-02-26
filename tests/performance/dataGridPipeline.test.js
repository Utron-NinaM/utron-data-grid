import { describe, it, expect } from 'vitest';
import { applySort } from '../../src/utils/sortUtils';
import { applyFilters } from '../../src/filters/filterUtils';
import { slicePage } from '../../src/pagination/paginationUtils';
import { SORT_ORDER_ASC, OPERATOR_GREATER_OR_EQUAL, FIELD_TYPE_NUMBER } from '../../src/config/schema';

const COLUMNS = [
  { field: 'id', headerName: 'ID', type: FIELD_TYPE_NUMBER },
  { field: 'name', headerName: 'Name' },
  { field: 'value', headerName: 'Value', type: FIELD_TYPE_NUMBER },
];

// Seeded RNG for reproducible benchmarks (avoids variance from random data)
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateRows(n, seed = 42) {
  const rng = mulberry32(seed);
  const rows = [];
  for (let i = 0; i < n; i++) {
    rows.push({ id: i, name: `name-${i}`, value: Math.floor(rng() * 1e6) });
  }
  return rows;
}

describe('dataGridPipeline performance', () => {
  const SORT_10K_MS = 20 
  const SORT_50K_MS = 100;
  const FILTER_10K_MS = 30;
  const FILTER_50K_MS = 50;  
  const FULL_PIPELINE_50K_MS = 150;

  describe('applySort', () => {
    it('sorts 10k rows within threshold', () => {
      const rows = generateRows(10_000);
      const sortModel = [{ field: 'value', order: SORT_ORDER_ASC }];
      const start = performance.now();
      const result = applySort(rows, sortModel);
      const duration = performance.now() - start;
      expect(result.length).toBe(10_000);
      expect(duration).toBeLessThan(SORT_10K_MS);      
      // Verify results are actually sorted
      for (let i = 1; i < result.length; i++) {
        expect(result[i].value).toBeGreaterThanOrEqual(result[i - 1].value);
      }
    });

    it('sorts 50k rows within threshold', () => {
      const rows = generateRows(50_000);
      const sortModel = [{ field: 'value', order: SORT_ORDER_ASC }];
      const start = performance.now();
      const result = applySort(rows, sortModel);
      const duration = performance.now() - start;
      expect(result.length).toBe(50_000);
      expect(duration).toBeLessThan(SORT_50K_MS);
      // Verify results are actually sorted (sample check for performance)
      for (let i = 1; i < Math.min(100, result.length); i++) {
        expect(result[i].value).toBeGreaterThanOrEqual(result[i - 1].value);
      }
      // Check a few random positions
      for (let i = 0; i < 10; i++) {
        const idx = Math.floor(Math.random() * (result.length - 1));
        expect(result[idx + 1].value).toBeGreaterThanOrEqual(result[idx].value);
      }
    });
  });

  describe('applyFilters', () => {
    it('filters 10k rows within threshold', () => {
      const rows = generateRows(10_000);
      const filterModel = {
        value: { operator: OPERATOR_GREATER_OR_EQUAL, value: 100_000 },
      };
      const start = performance.now();
      const result = applyFilters(rows, filterModel, COLUMNS);
      const duration = performance.now() - start;
      expect(result.length).toBeLessThanOrEqual(10_000);
      expect(duration).toBeLessThan(FILTER_10K_MS);      
      // Verify all results match filter criteria
      result.forEach((row) => {
        expect(row.value).toBeGreaterThanOrEqual(100_000);
      });
    });

    it('filters 50k rows within threshold', () => {
      const rows = generateRows(50_000);
      const filterModel = {
        value: { operator: OPERATOR_GREATER_OR_EQUAL, value: 500_000 },
      };
      const start = performance.now();
      const result = applyFilters(rows, filterModel, COLUMNS);
      const duration = performance.now() - start;
      expect(result.length).toBeLessThanOrEqual(50_000);
      expect(duration).toBeLessThan(FILTER_50K_MS);
      // Verify all results match filter criteria (sample check for performance)
      const sampleSize = Math.min(100, result.length);
      for (let i = 0; i < sampleSize; i++) {
        expect(result[i].value).toBeGreaterThanOrEqual(500_000);
      }
    });
  });

  describe('full pipeline', () => {
    it('filter then sort then slice 50k rows within threshold', () => {
      const rows = generateRows(50_000);
      const filterModel = {
        value: { operator: OPERATOR_GREATER_OR_EQUAL, value: 0 },
      };
      const sortModel = [{ field: 'value', order: SORT_ORDER_ASC }];
      const start = performance.now();
      const filtered = applyFilters(rows, filterModel, COLUMNS);
      const sorted = applySort(filtered, sortModel);
      const { rows: pageRows } = slicePage(sorted, 0, 25);
      const duration = performance.now() - start;
      expect(pageRows.length).toBeLessThanOrEqual(25);
      expect(duration).toBeLessThan(FULL_PIPELINE_50K_MS);
      // Verify filtered results match criteria
      filtered.forEach((row) => {
        expect(row.value).toBeGreaterThanOrEqual(0);
      });
      // Verify sorted results are actually sorted
      for (let i = 1; i < Math.min(100, sorted.length); i++) {
        expect(sorted[i].value).toBeGreaterThanOrEqual(sorted[i - 1].value);
      }
      // Verify page rows are from the sorted results
      expect(pageRows.length).toBeGreaterThan(0);
      if (pageRows.length > 1) {
        for (let i = 1; i < pageRows.length; i++) {
          expect(pageRows[i].value).toBeGreaterThanOrEqual(pageRows[i - 1].value);
        }
      }
    });
  });
});
