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

function generateRows(n) {
  const rows = [];
  for (let i = 0; i < n; i++) {
    rows.push({ id: i, name: `name-${i}`, value: Math.floor(Math.random() * 1e6) });
  }
  return rows;
}

describe('dataGridPipeline performance', () => {
  const SORT_50K_MS = 150;
  const FILTER_50K_MS = 110;
  const FULL_PIPELINE_50K_MS = 200;

  describe('applySort', () => {
    it('sorts 10k rows within threshold', () => {
      const rows = generateRows(10_000);
      const sortModel = [{ field: 'value', order: SORT_ORDER_ASC }];
      const start = performance.now();
      const result = applySort(rows, sortModel);
      const duration = performance.now() - start;
      expect(result.length).toBe(10_000);
      expect(duration).toBeLessThan(SORT_50K_MS);
    });

    it('sorts 50k rows within threshold', () => {
      const rows = generateRows(50_000);
      const sortModel = [{ field: 'value', order: SORT_ORDER_ASC }];
      const start = performance.now();
      const result = applySort(rows, sortModel);
      const duration = performance.now() - start;
      expect(result.length).toBe(50_000);
      expect(duration).toBeLessThan(SORT_50K_MS);
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
      expect(duration).toBeLessThan(FILTER_50K_MS);
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
    });
  });
});
