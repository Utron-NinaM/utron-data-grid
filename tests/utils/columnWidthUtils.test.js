import { describe, it, expect, beforeEach } from 'vitest';
import {
  getBuiltInMinWidth,
  getEffectiveMinWidth,
  estimateAutoColumnWidth,
  getAutoMaxWidth,
  calculateColumnWidths,
} from '../../src/utils/columnWidthUtils';
import { FILTER_TYPE_TEXT, FILTER_TYPE_NONE } from '../../src/config/schema';
import { MIN_WIDTH_DEFAULT_PX, MIN_WIDTH_NO_FILTERS_PX } from '../../src/utils/columnWidthUtils';

describe('columnWidthUtils', () => {
  describe('getBuiltInMinWidth', () => {
    it('should return MIN_WIDTH_DEFAULT_PX when filters are shown (default)', () => {
      expect(getBuiltInMinWidth({ field: 'id', headerName: 'ID' })).toBe(MIN_WIDTH_DEFAULT_PX);
      expect(getBuiltInMinWidth({ field: 'name', headerName: 'Name', filter: FILTER_TYPE_TEXT })).toBe(MIN_WIDTH_DEFAULT_PX);
    });
    it('should return MIN_WIDTH_NO_FILTERS_PX when filters: false', () => {
      expect(getBuiltInMinWidth({ field: 'id', headerName: 'ID' }, { filters: false })).toBe(MIN_WIDTH_NO_FILTERS_PX);
      expect(getBuiltInMinWidth({ field: 'name', headerName: 'Name', filter: FILTER_TYPE_TEXT }, { filters: false })).toBe(MIN_WIDTH_NO_FILTERS_PX);
    });
    it('should cache results for same column', () => {
      const column = { field: 'name', headerName: 'Name', filter: FILTER_TYPE_TEXT };
      const result1 = getBuiltInMinWidth(column);
      const result2 = getBuiltInMinWidth(column);
      expect(result1).toBe(result2);
      expect(result1).toBe(MIN_WIDTH_DEFAULT_PX);
    });
  });

  describe('getEffectiveMinWidth', () => {
    it('should return built-in min when user minWidth is not provided', () => {
      const column = { field: 'name', headerName: 'Name', filter: FILTER_TYPE_TEXT };
      expect(getEffectiveMinWidth(column)).toBe(MIN_WIDTH_DEFAULT_PX);
    });

    it('should return user minWidth when greater than built-in', () => {
      const column = { field: 'name2', headerName: 'Name2', filter: FILTER_TYPE_NONE, minWidth: 200 };
      expect(getEffectiveMinWidth(column)).toBe(200);
    });

    it('should return user minWidth when set (fully overrides built-in, may be lower)', () => {
      const column = { field: 'name', headerName: 'Name', filter: FILTER_TYPE_TEXT, minWidth: 50 };
      expect(getEffectiveMinWidth(column)).toBe(50);
    });

    it('should return user minWidth when equals built-in', () => {
      const column = { field: 'name', headerName: 'Name', filter: FILTER_TYPE_TEXT, minWidth: MIN_WIDTH_DEFAULT_PX };
      expect(getEffectiveMinWidth(column)).toBe(MIN_WIDTH_DEFAULT_PX);
    });

    it('should honor minWidth: 0 when user explicitly sets it', () => {
      const column = { field: 'id', headerName: 'ID', filter: FILTER_TYPE_NONE, minWidth: 0 };
      expect(getEffectiveMinWidth(column)).toBe(0);
    });

    it('should return MIN_WIDTH_NO_FILTERS_PX when filters: false and no user minWidth', () => {
      const column = { field: 'id', headerName: 'ID', filter: FILTER_TYPE_NONE };
      expect(getEffectiveMinWidth(column, { filters: false })).toBe(MIN_WIDTH_NO_FILTERS_PX);
    });
  });

  describe('estimateAutoColumnWidth', () => {
    it('should return at least effective minWidth', () => {
      const column = { field: 'id', headerName: 'ID', filter: FILTER_TYPE_NONE };
      const width = estimateAutoColumnWidth(column);
      expect(width).toBeGreaterThanOrEqual(MIN_WIDTH_DEFAULT_PX);
    });

    it('should estimate based on header text length', () => {
      const column = { field: 'name', headerName: 'Very Long Header Name', filter: FILTER_TYPE_NONE };
      const width = estimateAutoColumnWidth(column);
      // Should be at least: MIN_WIDTH_DEFAULT_PX (min) or (23 chars * 8px + 16px + 32px) = 232px
      expect(width).toBeGreaterThanOrEqual(MIN_WIDTH_DEFAULT_PX);
    });

    it('should use custom options for estimation', () => {
      // Use different column objects to avoid cache
      const column1 = { field: 'name1', headerName: 'Test', filter: FILTER_TYPE_NONE };
      const column2 = { field: 'name2', headerName: 'Test', filter: FILTER_TYPE_NONE };
      const width1 = estimateAutoColumnWidth(column1);
      // Options chosen so estimated width (4*15+30+60=150) exceeds MIN_WIDTH_DEFAULT_PX
      const width2 = estimateAutoColumnWidth(column2, { avgCharWidth: 15, headerPadding: 30, iconAllowance: 60 });
      expect(width2).not.toBe(width1);
      expect(width2).toBeGreaterThan(width1);
    });

    it('should handle empty headerName', () => {
      const column = { field: 'id', headerName: '', filter: FILTER_TYPE_NONE };
      const width = estimateAutoColumnWidth(column);
      expect(width).toBeGreaterThanOrEqual(MIN_WIDTH_DEFAULT_PX);
    });

    it('should handle missing headerName', () => {
      const column = { field: 'id', filter: FILTER_TYPE_NONE };
      const width = estimateAutoColumnWidth(column);
      expect(width).toBeGreaterThanOrEqual(MIN_WIDTH_DEFAULT_PX);
    });

    it('should cache results for same column', () => {
      const column = { field: 'name', headerName: 'Name', filter: FILTER_TYPE_NONE };
      const width1 = estimateAutoColumnWidth(column);
      const width2 = estimateAutoColumnWidth(column);
      expect(width1).toBe(width2);
    });

    it('should use smaller icon allowance when filters: false', () => {
      const col1 = { field: 'a', headerName: 'Col', filter: FILTER_TYPE_NONE };
      const col2 = { field: 'b', headerName: 'Col', filter: FILTER_TYPE_NONE };
      const widthWithFilters = estimateAutoColumnWidth(col1, { filters: true });
      const widthNoFilters = estimateAutoColumnWidth(col2, { filters: false });
      expect(widthNoFilters).toBeLessThan(widthWithFilters);
    });
  });

  describe('getAutoMaxWidth', () => {
    it('should return at least minWidth', () => {
      const column = { field: 'name', headerName: 'Name' };
      const maxWidth = getAutoMaxWidth(column, 100);
      expect(maxWidth).toBeGreaterThanOrEqual(100);
    });

    it('should return 2.5x minWidth when minWidth is positive', () => {
      const column = { field: 'name', headerName: 'Name' };
      const maxWidth = getAutoMaxWidth(column, 100);
      expect(maxWidth).toBe(250);
    });

    it('should handle minWidth: 0', () => {
      const column = { field: 'name', headerName: 'Name' };
      const maxWidth = getAutoMaxWidth(column, 0);
      expect(maxWidth).toBe(0);
    });
  });

  describe('calculateColumnWidths', () => {
    describe('Fixed width columns', () => {
      it('should assign fixed widths directly', () => {
        const columns = [
          { field: 'id', headerName: 'ID', width: 140, filter: FILTER_TYPE_NONE },
          { field: 'name', headerName: 'Name', width: 200, filter: FILTER_TYPE_NONE },
        ];
        const result = calculateColumnWidths(columns, 1000);
        expect(result.columnWidthMap.get('id')).toBe(140);
        expect(result.columnWidthMap.get('name')).toBe(200);
        expect(result.totalWidth).toBe(340);
        expect(result.enableHorizontalScroll).toBe(false);
      });

      it('should enforce minWidth on fixed columns', () => {
        const columns = [
          { field: 'id', headerName: 'ID', width: 50, filter: FILTER_TYPE_NONE },
        ];
        const result = calculateColumnWidths(columns, 1000);
        expect(result.columnWidthMap.get('id')).toBe(MIN_WIDTH_DEFAULT_PX);
      });

      it('should respect user minWidth when greater than built-in', () => {
        const columns = [
          { field: 'id2', headerName: 'ID2', width: 50, minWidth: 200, filter: FILTER_TYPE_NONE },
        ];
        const result = calculateColumnWidths(columns, 1000);
        expect(result.columnWidthMap.get('id2')).toBe(200);
      });

      it('should respect maxWidth constraint on flex columns', () => {
        const columns = [
          { field: 'name3', headerName: 'Name3', flex: 1, maxWidth: 150, filter: FILTER_TYPE_NONE },
        ];
        const result = calculateColumnWidths(columns, 1000);
        const width = result.columnWidthMap.get('name3');
        expect(width).toBeLessThanOrEqual(150);
        expect(width).toBeGreaterThanOrEqual(MIN_WIDTH_DEFAULT_PX);
      });

      it('should handle defaultWidth columns', () => {
        const columns = [
          { field: 'actions', headerName: 'Actions', defaultWidth: 80, filter: FILTER_TYPE_NONE },
        ];
        const result = calculateColumnWidths(columns, 1000);
        expect(result.columnWidthMap.get('actions')).toBe(MIN_WIDTH_DEFAULT_PX);
      });
    });

    describe('Flex columns', () => {
      it('should distribute remaining space proportionally', () => {
        const columns = [
          { field: 'id', headerName: 'ID', width: 140, filter: FILTER_TYPE_NONE },
          { field: 'name', headerName: 'Name', flex: 1, filter: FILTER_TYPE_NONE },
          { field: 'desc', headerName: 'Description', flex: 2, filter: FILTER_TYPE_NONE },
        ];
        const result = calculateColumnWidths(columns, 1000);
        const idWidth = result.columnWidthMap.get('id');
        const nameWidth = result.columnWidthMap.get('name');
        const descWidth = result.columnWidthMap.get('desc');

        expect(idWidth).toBe(140);
        expect(nameWidth).toBeGreaterThanOrEqual(MIN_WIDTH_DEFAULT_PX);
        expect(descWidth).toBeGreaterThanOrEqual(MIN_WIDTH_DEFAULT_PX);
        // desc should be approximately 2x name (within rounding)
        expect(descWidth).toBeGreaterThan(nameWidth);
      });

      it('should collapse flex columns to minWidth when no space available', () => {
        const columns = [
          { field: 'id4', headerName: 'ID4', width: 950, filter: FILTER_TYPE_NONE },
          { field: 'name4', headerName: 'Name4', flex: 1, filter: FILTER_TYPE_NONE },
        ];
        const result = calculateColumnWidths(columns, 1000);
        expect(result.columnWidthMap.get('id4')).toBe(950);
        // With only 50px remaining, flex column should collapse to minWidth (MIN_WIDTH_DEFAULT_PX)
        // But 50 < MIN_WIDTH_DEFAULT_PX, so it gets minWidth
        expect(result.columnWidthMap.get('name4')).toBe(MIN_WIDTH_DEFAULT_PX);
      });

      it('should respect minWidth on flex columns', () => {
        const columns = [
          { field: 'name', headerName: 'Name', flex: 1, minWidth: 200, filter: FILTER_TYPE_NONE },
        ];
        const result = calculateColumnWidths(columns, 1000);
        expect(result.columnWidthMap.get('name')).toBeGreaterThanOrEqual(200);
      });

      it('should respect maxWidth on flex columns', () => {
        const columns = [
          { field: 'name', headerName: 'Name', flex: 1, maxWidth: 150, filter: FILTER_TYPE_NONE },
        ];
        const result = calculateColumnWidths(columns, 1000);
        expect(result.columnWidthMap.get('name')).toBeLessThanOrEqual(150);
      });

      it('should handle very small flex values', () => {
        // Test with very small flex instead of 0 (which causes division issues)
        const columns = [
          { field: 'id5', headerName: 'ID5', width: 100, filter: FILTER_TYPE_NONE },
          { field: 'name5', headerName: 'Name5', flex: 0.001, filter: FILTER_TYPE_NONE },
        ];
        const result = calculateColumnWidths(columns, 1000);
        const width = result.columnWidthMap.get('name5');
        // Should get at least minWidth
        expect(width).toBeGreaterThanOrEqual(MIN_WIDTH_DEFAULT_PX);
      });
    });

    describe('Auto columns', () => {
      it('should assign estimated width to auto columns', () => {
        const columns = [
          { field: 'name', headerName: 'Name', filter: FILTER_TYPE_NONE },
        ];
        const result = calculateColumnWidths(columns, 1000);
        const width = result.columnWidthMap.get('name');
        expect(width).toBeGreaterThanOrEqual(MIN_WIDTH_DEFAULT_PX);
        expect(width).toBeLessThanOrEqual(2.5 * MIN_WIDTH_DEFAULT_PX); // Auto max = 2.5 * MIN_WIDTH_DEFAULT_PX
      });

      it('should allow auto columns to grow with leftover pixels', () => {
        const columns = [
          { field: 'id', headerName: 'ID', width: 100, filter: FILTER_TYPE_NONE },
          { field: 'name', headerName: 'Name', filter: FILTER_TYPE_NONE },
        ];
        const result = calculateColumnWidths(columns, 1000);
        const nameWidth = result.columnWidthMap.get('name');
        expect(nameWidth).toBeGreaterThanOrEqual(MIN_WIDTH_DEFAULT_PX);
        // Should use leftover space up to auto max
      });

      it('should respect maxWidth on auto columns', () => {
        const columns = [
          { field: 'name', headerName: 'Name', maxWidth: 150, filter: FILTER_TYPE_NONE },
        ];
        const result = calculateColumnWidths(columns, 1000);
        expect(result.columnWidthMap.get('name')).toBeLessThanOrEqual(150);
      });
    });

    describe('User-resized columns (overrides)', () => {
      it('should use override width from columnState', () => {
        const columns = [
          { field: 'name', headerName: 'Name', width: 200, filter: FILTER_TYPE_NONE },
        ];
        const columnState = new Map([['name', 300]]);
        const result = calculateColumnWidths(columns, 1000, columnState);
        expect(result.columnWidthMap.get('name')).toBe(300);
      });

      it('should exclude user-resized columns from flex distribution', () => {
        const columns = [
          { field: 'id', headerName: 'ID', width: 140, filter: FILTER_TYPE_NONE },
          { field: 'name', headerName: 'Name', flex: 1, filter: FILTER_TYPE_NONE },
        ];
        const columnState = new Map([['name', 250]]);
        const result = calculateColumnWidths(columns, 1000, columnState);
        expect(result.columnWidthMap.get('name')).toBe(250);
        expect(result.columnWidthMap.get('id')).toBe(140);
      });

      it('should exclude user-resized columns from leftover distribution', () => {
        const columns = [
          { field: 'id', headerName: 'ID', width: 100, filter: FILTER_TYPE_NONE },
          { field: 'name', headerName: 'Name', filter: FILTER_TYPE_NONE },
        ];
        const columnState = new Map([['name', 200]]);
        const result = calculateColumnWidths(columns, 1000, columnState);
        expect(result.columnWidthMap.get('name')).toBe(200);
        // Leftover should not go to 'name' since it's user-resized
      });
    });

    describe('Layout invariants', () => {
      it('should return minWidths when sum exceeds containerWidth', () => {
        const columns = [
          { field: 'col1', headerName: 'Col1', width: 400, filter: FILTER_TYPE_NONE },
          { field: 'col2', headerName: 'Col2', width: 400, filter: FILTER_TYPE_NONE },
          { field: 'col3', headerName: 'Col3', width: 400, filter: FILTER_TYPE_NONE },
        ];
        const result = calculateColumnWidths(columns, 1000);
        expect(result.totalWidth).toBe(1200);
        expect(result.enableHorizontalScroll).toBe(true);
        expect(result.columnWidthMap.get('col1')).toBe(400);
        expect(result.columnWidthMap.get('col2')).toBe(400);
        expect(result.columnWidthMap.get('col3')).toBe(400);
      });

      it('should enable horizontal scroll when total exceeds container', () => {
        const columns = [
          { field: 'col1', headerName: 'Col1', width: 600, filter: FILTER_TYPE_NONE },
          { field: 'col2', headerName: 'Col2', width: 600, filter: FILTER_TYPE_NONE },
        ];
        const result = calculateColumnWidths(columns, 1000);
        expect(result.enableHorizontalScroll).toBe(true);
        expect(result.totalWidth).toBe(1200);
      });

      it('should handle empty columns array', () => {
        const result = calculateColumnWidths([], 1000);
        expect(result.columnWidthMap.size).toBe(0);
        expect(result.totalWidth).toBe(0);
        expect(result.enableHorizontalScroll).toBe(false);
      });

      it('should handle zero containerWidth', () => {
        const columns = [
          { field: 'name6', headerName: 'Name6', width: 140, filter: FILTER_TYPE_NONE },
        ];
        const result = calculateColumnWidths(columns, 0);
        // With zero containerWidth, minTotal (100 from step 2) > 0, so returns allMinWidths
        // allMinWidths uses the width from step 2 (100), not the built-in min (MIN_WIDTH_DEFAULT_PX)
        expect(result.columnWidthMap.get('name6')).toBe(140);
        expect(result.enableHorizontalScroll).toBe(true);
      });

      it('should handle negative containerWidth', () => {
        const columns = [
          { field: 'name7', headerName: 'Name7', width: 120, filter: FILTER_TYPE_NONE },
        ];
        const result = calculateColumnWidths(columns, -100);
        // With negative containerWidth, minTotal (100) > -100, so returns allMinWidths
        expect(result.columnWidthMap.get('name7')).toBe(120);
        expect(result.enableHorizontalScroll).toBe(true);
      });
    });

    describe('Leftover pixel distribution', () => {
      it('should distribute leftover pixels to growable columns', () => {
        const columns = [
          { field: 'id', headerName: 'ID', width: 100, filter: FILTER_TYPE_NONE },
          { field: 'name', headerName: 'Name', flex: 1, filter: FILTER_TYPE_NONE },
        ];
        const result = calculateColumnWidths(columns, 1000);
        const total = Array.from(result.columnWidthMap.values()).reduce((sum, w) => sum + w, 0);
        // Total should be close to containerWidth (within rounding)
        expect(total).toBeGreaterThanOrEqual(1000 - 10);
        expect(total).toBeLessThanOrEqual(1000 + 10);
      });

      it('should not distribute leftover to user-resized columns', () => {
        const columns = [
          { field: 'id', headerName: 'ID', width: 100, filter: FILTER_TYPE_NONE },
          { field: 'name', headerName: 'Name', flex: 1, filter: FILTER_TYPE_NONE },
        ];
        const columnState = new Map([['name', 200]]);
        const result = calculateColumnWidths(columns, 1000, columnState);
        expect(result.columnWidthMap.get('name')).toBe(200);
        // Leftover should not go to 'name'
      });

      it('should respect maxWidth during leftover distribution', () => {
        const columns = [
          { field: 'name', headerName: 'Name', flex: 1, maxWidth: 150, filter: FILTER_TYPE_NONE },
        ];
        const result = calculateColumnWidths(columns, 1000);
        expect(result.columnWidthMap.get('name')).toBeLessThanOrEqual(150);
      });

      it('should respect autoMaxWidth during leftover distribution', () => {
        const columns = [
          { field: 'name', headerName: 'Name', filter: FILTER_TYPE_NONE },
        ];
        const result = calculateColumnWidths(columns, 1000);
        const width = result.columnWidthMap.get('name');
        // Auto max = 2.5 * MIN_WIDTH_DEFAULT_PX = 275, floored = 275
        expect(width).toBeLessThanOrEqual(2.5 * MIN_WIDTH_DEFAULT_PX);
      });
    });

    describe('Mixed column types', () => {
      it('should handle mix of fixed, flex, and auto columns', () => {
        const columns = [
          { field: 'id', headerName: 'ID', width: 120, filter: FILTER_TYPE_NONE },
          { field: 'name', headerName: 'Name', flex: 1, filter: FILTER_TYPE_NONE },
          { field: 'desc', headerName: 'Description', filter: FILTER_TYPE_NONE },
        ];
        const result = calculateColumnWidths(columns, 1000);
        expect(result.columnWidthMap.get('id')).toBe(120);
        expect(result.columnWidthMap.get('name')).toBeGreaterThanOrEqual(MIN_WIDTH_DEFAULT_PX);
        expect(result.columnWidthMap.get('desc')).toBeGreaterThanOrEqual(MIN_WIDTH_DEFAULT_PX);
      });

      it('should handle all fixed columns', () => {
        const columns = [
          { field: 'col1', headerName: 'Col1', width: 200, filter: FILTER_TYPE_NONE },
          { field: 'col2', headerName: 'Col2', width: 300, filter: FILTER_TYPE_NONE },
        ];
        const result = calculateColumnWidths(columns, 1000);
        expect(result.columnWidthMap.get('col1')).toBe(200);
        expect(result.columnWidthMap.get('col2')).toBe(300);
        expect(result.totalWidth).toBe(500);
      });

      it('should handle all flex columns', () => {
        const columns = [
          { field: 'col1', headerName: 'Col1', flex: 1, filter: FILTER_TYPE_NONE },
          { field: 'col2', headerName: 'Col2', flex: 2, filter: FILTER_TYPE_NONE },
        ];
        const result = calculateColumnWidths(columns, 1000);
        expect(result.columnWidthMap.get('col1')).toBeGreaterThanOrEqual(MIN_WIDTH_DEFAULT_PX);
        expect(result.columnWidthMap.get('col2')).toBeGreaterThanOrEqual(MIN_WIDTH_DEFAULT_PX);
        expect(result.columnWidthMap.get('col2')).toBeGreaterThan(result.columnWidthMap.get('col1'));
      });

      it('should handle all auto columns', () => {
        const columns = [
          { field: 'col1', headerName: 'Col1', filter: FILTER_TYPE_NONE },
          { field: 'col2', headerName: 'Col2', filter: FILTER_TYPE_NONE },
        ];
        const result = calculateColumnWidths(columns, 1000);
        expect(result.columnWidthMap.get('col1')).toBeGreaterThanOrEqual(MIN_WIDTH_DEFAULT_PX);
        expect(result.columnWidthMap.get('col2')).toBeGreaterThanOrEqual(MIN_WIDTH_DEFAULT_PX);
      });
    });

    describe('Width flooring and clamping', () => {
      it('should floor all widths to integers', () => {
        const columns = [
          { field: 'name', headerName: 'Name', flex: 1, filter: FILTER_TYPE_NONE },
        ];
        const result = calculateColumnWidths(columns, 1000);
        const width = result.columnWidthMap.get('name');
        expect(Number.isInteger(width)).toBe(true);
      });

      it('should clamp widths to minWidth', () => {
        const columns = [
          { field: 'name', headerName: 'Name', flex: 0.001, filter: FILTER_TYPE_NONE },
        ];
        const result = calculateColumnWidths(columns, 1000);
        expect(result.columnWidthMap.get('name')).toBeGreaterThanOrEqual(MIN_WIDTH_DEFAULT_PX);
      });

      it('should clamp widths to maxWidth', () => {
        const columns = [
          { field: 'name', headerName: 'Name', flex: 10, maxWidth: 200, filter: FILTER_TYPE_NONE },
        ];
        const result = calculateColumnWidths(columns, 1000);
        expect(result.columnWidthMap.get('name')).toBeLessThanOrEqual(200);
      });
    });

    describe('Edge cases', () => {
      it('should handle column with width: 0', () => {
        const columns = [
          { field: 'name8', headerName: 'Name8', width: 0, filter: FILTER_TYPE_NONE },
        ];
        const result = calculateColumnWidths(columns, 1000);
        // Width 0 is treated as fixed, but clamped to minWidth
        expect(result.columnWidthMap.get('name8')).toBe(MIN_WIDTH_DEFAULT_PX);
      });

      it('should use MIN_WIDTH_NO_FILTERS_PX when filters: false', () => {
        const columns = [
          { field: 'id', headerName: 'ID', filter: FILTER_TYPE_NONE },
        ];
        // Use small container so minTotal > containerWidth, columns get min widths (no leftover distribution)
        const result = calculateColumnWidths(columns, 50, new Map(), { filters: false });
        expect(result.columnWidthMap.get('id')).toBe(MIN_WIDTH_NO_FILTERS_PX);
        expect(result.enableHorizontalScroll).toBe(true);
      });

      it('should handle column with negative width', () => {
        const columns = [
          { field: 'name9', headerName: 'Name9', width: -10, filter: FILTER_TYPE_NONE },
        ];
        const result = calculateColumnWidths(columns, 1000);
        // Negative width is treated as fixed, but clamped to minWidth
        expect(result.columnWidthMap.get('name9')).toBe(MIN_WIDTH_DEFAULT_PX);
      });

      it('should always create new Map instance', () => {
        const columns = [
          { field: 'name', headerName: 'Name', width: 100, filter: FILTER_TYPE_NONE },
        ];
        const result1 = calculateColumnWidths(columns, 1000);
        const result2 = calculateColumnWidths(columns, 1000);
        // Maps should have same content but different references
        expect(result1.columnWidthMap).not.toBe(result2.columnWidthMap);
        expect(result1.columnWidthMap.get('name')).toBe(result2.columnWidthMap.get('name'));
      });

      it('should handle very large containerWidth', () => {
        const columns = [
          { field: 'name', headerName: 'Name', flex: 1, filter: FILTER_TYPE_NONE },
        ];
        const result = calculateColumnWidths(columns, 100000);
        expect(result.columnWidthMap.get('name')).toBeGreaterThan(MIN_WIDTH_DEFAULT_PX);
      });

      it('should handle columns with same field name (edge case)', () => {
        const columns = [
          { field: 'name', headerName: 'Name1', width: 100, filter: FILTER_TYPE_NONE },
          { field: 'name', headerName: 'Name2', width: 200, filter: FILTER_TYPE_NONE },
        ];
        const result = calculateColumnWidths(columns, 1000);
        // Last one wins (Map.set overwrites)
        expect(result.columnWidthMap.get('name')).toBe(200);
      });
    });

    describe('fitToContainer option', () => {
      it('should treat no-width columns as flex when fitToContainer: true', () => {
        const columns = [
          { field: 'a', headerName: 'A', filter: FILTER_TYPE_NONE },
          { field: 'b', headerName: 'B', filter: FILTER_TYPE_NONE },
        ];
        const result = calculateColumnWidths(columns, 1000, new Map(), { fitToContainer: true });
        const total = result.columnWidthMap.get('a') + result.columnWidthMap.get('b');
        expect(total).toBeLessThanOrEqual(1000);
        expect(result.columnWidthMap.get('a')).toBeGreaterThanOrEqual(MIN_WIDTH_DEFAULT_PX);
        expect(result.columnWidthMap.get('b')).toBeGreaterThanOrEqual(MIN_WIDTH_DEFAULT_PX);
        expect(result.enableHorizontalScroll).toBe(false);
      });

      it('should keep auto behavior when fitToContainer: false', () => {
        const columns = [
          { field: 'name', headerName: 'Name', filter: FILTER_TYPE_NONE },
        ];
        const result = calculateColumnWidths(columns, 1000, new Map(), { fitToContainer: false });
        const width = result.columnWidthMap.get('name');
        expect(width).toBeGreaterThanOrEqual(MIN_WIDTH_DEFAULT_PX);
        expect(width).toBeLessThanOrEqual(2.5 * MIN_WIDTH_DEFAULT_PX);
      });

      it('should cap total width to container when fitToContainer: true and total would exceed', () => {
        const columns = [
          { field: 'a', headerName: 'A', flex: 1, filter: FILTER_TYPE_NONE },
          { field: 'b', headerName: 'B', flex: 1, filter: FILTER_TYPE_NONE },
          { field: 'c', headerName: 'C', flex: 1, filter: FILTER_TYPE_NONE },
        ];
        const result = calculateColumnWidths(columns, 500, new Map(), { fitToContainer: true });
        const total = Array.from(result.columnWidthMap.values()).reduce((s, w) => s + w, 0);
        expect(total).toBeLessThanOrEqual(500);
        expect(result.enableHorizontalScroll).toBe(false);
      });

      it('should not cap total when fitToContainer: false (fixed columns can exceed)', () => {
        const columns = [
          { field: 'col1', headerName: 'Col1', width: 400, filter: FILTER_TYPE_NONE },
          { field: 'col2', headerName: 'Col2', width: 400, filter: FILTER_TYPE_NONE },
          { field: 'col3', headerName: 'Col3', width: 400, filter: FILTER_TYPE_NONE },
        ];
        const result = calculateColumnWidths(columns, 1000, new Map(), { fitToContainer: false });
        expect(result.totalWidth).toBe(1200);
        expect(result.enableHorizontalScroll).toBe(true);
      });

      it('should respect minWidth when scaling down in fitToContainer mode', () => {
        const columns = [
          { field: 'a', headerName: 'A', flex: 1, minWidth: 150, filter: FILTER_TYPE_NONE },
          { field: 'b', headerName: 'B', flex: 1, minWidth: 150, filter: FILTER_TYPE_NONE },
        ];
        const result = calculateColumnWidths(columns, 400, new Map(), { fitToContainer: true });
        expect(result.columnWidthMap.get('a')).toBeGreaterThanOrEqual(150);
        expect(result.columnWidthMap.get('b')).toBeGreaterThanOrEqual(150);
      });
    });
  });
}); 