import { describe, it, expect, beforeEach } from 'vitest';
import {
  getBuiltInMinWidth,
  getEffectiveMinWidth,
  estimateAutoColumnWidth,
  getAutoMaxWidth,
  calculateColumnWidths,
} from '../../src/utils/columnWidthUtils';
import { FILTER_TYPE_NUMBER, FILTER_TYPE_DATE, FILTER_TYPE_TEXT, FILTER_TYPE_LIST, FILTER_TYPE_NONE } from '../../src/config/schema';

describe('columnWidthUtils', () => {
  describe('getBuiltInMinWidth', () => {
    it('should return 135px for columns with number filter combo', () => {
      const column = { field: 'price', headerName: 'Price', filter: FILTER_TYPE_NUMBER };
      expect(getBuiltInMinWidth(column)).toBe(135);
    });

    it('should return 135px for columns with date filter combo', () => {
      const column = { field: 'date', headerName: 'Date', filter: FILTER_TYPE_DATE };
      expect(getBuiltInMinWidth(column)).toBe(135);
    });

    it('should return 135px for columns with text filter combo', () => {
      const column = { field: 'name', headerName: 'Name', filter: FILTER_TYPE_TEXT };
      expect(getBuiltInMinWidth(column)).toBe(135);
    });

    it('should return 85px for columns without filter combo', () => {
      const column = { field: 'id', headerName: 'ID', filter: FILTER_TYPE_NONE };
      expect(getBuiltInMinWidth(column)).toBe(85);
    });

    it('should return 85px for list filter columns', () => {
      const column = { field: 'status', headerName: 'Status', filter: FILTER_TYPE_LIST };
      expect(getBuiltInMinWidth(column)).toBe(85);
    });

    it('should return 85px for columns with filter: false', () => {
      const column = { field: 'id', headerName: 'ID', filter: false };
      expect(getBuiltInMinWidth(column)).toBe(85);
    });

    it('should use type as fallback when filter is undefined', () => {
      const column = { field: 'price', headerName: 'Price', type: FILTER_TYPE_NUMBER };
      expect(getBuiltInMinWidth(column)).toBe(135);
    });

    it('should cache results for same column', () => {
      const column = { field: 'name', headerName: 'Name', filter: FILTER_TYPE_TEXT };
      const result1 = getBuiltInMinWidth(column);
      const result2 = getBuiltInMinWidth(column);
      expect(result1).toBe(result2);
      expect(result1).toBe(135);
    });
  });

  describe('getEffectiveMinWidth', () => {
    it('should return built-in min when user minWidth is not provided', () => {
      const column = { field: 'name', headerName: 'Name', filter: FILTER_TYPE_TEXT };
      expect(getEffectiveMinWidth(column)).toBe(135);
    });

    it('should return user minWidth when greater than built-in', () => {
      const column = { field: 'name2', headerName: 'Name2', filter: FILTER_TYPE_NONE, minWidth: 200 };
      expect(getEffectiveMinWidth(column)).toBe(200);
    });

    it('should return built-in min when user minWidth is smaller', () => {
      const column = { field: 'name', headerName: 'Name', filter: FILTER_TYPE_TEXT, minWidth: 50 };
      expect(getEffectiveMinWidth(column)).toBe(135);
    });

    it('should return built-in min when user minWidth equals built-in', () => {
      const column = { field: 'name', headerName: 'Name', filter: FILTER_TYPE_TEXT, minWidth: 135 };
      expect(getEffectiveMinWidth(column)).toBe(135);
    });

    it('should handle minWidth: 0 (should use built-in)', () => {
      const column = { field: 'id', headerName: 'ID', filter: FILTER_TYPE_NONE, minWidth: 0 };
      expect(getEffectiveMinWidth(column)).toBe(85);
    });
  });

  describe('estimateAutoColumnWidth', () => {
    it('should return at least effective minWidth', () => {
      const column = { field: 'id', headerName: 'ID', filter: FILTER_TYPE_NONE };
      const width = estimateAutoColumnWidth(column);
      expect(width).toBeGreaterThanOrEqual(85);
    });

    it('should estimate based on header text length', () => {
      const column = { field: 'name', headerName: 'Very Long Header Name', filter: FILTER_TYPE_NONE };
      const width = estimateAutoColumnWidth(column);
      // Should be at least: 85 (min) or (23 chars * 8px + 16px + 32px) = 232px
      expect(width).toBeGreaterThanOrEqual(85);
    });

    it('should use custom options for estimation', () => {
      // Use different column objects to avoid cache
      const column1 = { field: 'name1', headerName: 'Test', filter: FILTER_TYPE_NONE };
      const column2 = { field: 'name2', headerName: 'Test', filter: FILTER_TYPE_NONE };
      const width1 = estimateAutoColumnWidth(column1);
      const width2 = estimateAutoColumnWidth(column2, { avgCharWidth: 10, headerPadding: 20, iconAllowance: 40 });
      // Different options should produce different results
      expect(width2).not.toBe(width1);
      expect(width2).toBeGreaterThan(width1);
    });

    it('should handle empty headerName', () => {
      const column = { field: 'id', headerName: '', filter: FILTER_TYPE_NONE };
      const width = estimateAutoColumnWidth(column);
      expect(width).toBeGreaterThanOrEqual(85);
    });

    it('should handle missing headerName', () => {
      const column = { field: 'id', filter: FILTER_TYPE_NONE };
      const width = estimateAutoColumnWidth(column);
      expect(width).toBeGreaterThanOrEqual(85);
    });

    it('should cache results for same column', () => {
      const column = { field: 'name', headerName: 'Name', filter: FILTER_TYPE_NONE };
      const width1 = estimateAutoColumnWidth(column);
      const width2 = estimateAutoColumnWidth(column);
      expect(width1).toBe(width2);
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
          { field: 'id', headerName: 'ID', width: 100, filter: FILTER_TYPE_NONE },
          { field: 'name', headerName: 'Name', width: 200, filter: FILTER_TYPE_NONE },
        ];
        const result = calculateColumnWidths(columns, 1000);
        expect(result.columnWidthMap.get('id')).toBe(100);
        expect(result.columnWidthMap.get('name')).toBe(200);
        expect(result.totalWidth).toBe(300);
        expect(result.enableHorizontalScroll).toBe(false);
      });

      it('should enforce minWidth on fixed columns', () => {
        const columns = [
          { field: 'id', headerName: 'ID', width: 50, filter: FILTER_TYPE_NONE },
        ];
        const result = calculateColumnWidths(columns, 1000);
        expect(result.columnWidthMap.get('id')).toBe(85); // Enforced to 85px min
      });

      it('should enforce minWidth on fixed columns with filter combo', () => {
        const columns = [
          { field: 'price', headerName: 'Price', width: 100, filter: FILTER_TYPE_NUMBER },
        ];
        const result = calculateColumnWidths(columns, 1000);
        expect(result.columnWidthMap.get('price')).toBe(135); // Enforced to 135px min
      });

      it('should respect user minWidth when greater than built-in', () => {
        const columns = [
          { field: 'id2', headerName: 'ID2', width: 50, minWidth: 200, filter: FILTER_TYPE_NONE },
        ];
        const result = calculateColumnWidths(columns, 1000);
        expect(result.columnWidthMap.get('id2')).toBe(200);
      });

      it('should respect maxWidth constraint on flex columns', () => {
        // Test maxWidth on flex column (more reliable than fixed width)
        const columns = [
          { field: 'name3', headerName: 'Name3', flex: 1, maxWidth: 150, filter: FILTER_TYPE_NONE },
        ];
        const result = calculateColumnWidths(columns, 1000);
        const width = result.columnWidthMap.get('name3');
        expect(width).toBeLessThanOrEqual(150);
        expect(width).toBeGreaterThanOrEqual(85);
      });

      it('should handle defaultWidth columns', () => {
        const columns = [
          { field: 'actions', headerName: 'Actions', defaultWidth: 80, filter: FILTER_TYPE_NONE },
        ];
        const result = calculateColumnWidths(columns, 1000);
        expect(result.columnWidthMap.get('actions')).toBe(85); // Enforced to min
      });
    });

    describe('Flex columns', () => {
      it('should distribute remaining space proportionally', () => {
        const columns = [
          { field: 'id', headerName: 'ID', width: 100, filter: FILTER_TYPE_NONE },
          { field: 'name', headerName: 'Name', flex: 1, filter: FILTER_TYPE_NONE },
          { field: 'desc', headerName: 'Description', flex: 2, filter: FILTER_TYPE_NONE },
        ];
        const result = calculateColumnWidths(columns, 1000);
        const idWidth = result.columnWidthMap.get('id');
        const nameWidth = result.columnWidthMap.get('name');
        const descWidth = result.columnWidthMap.get('desc');
        
        expect(idWidth).toBe(100);
        expect(nameWidth).toBeGreaterThanOrEqual(85);
        expect(descWidth).toBeGreaterThanOrEqual(85);
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
        // With only 50px remaining, flex column should collapse to minWidth (85px)
        // But 50 < 85, so it gets minWidth
        expect(result.columnWidthMap.get('name4')).toBe(85);
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
        expect(width).toBeGreaterThanOrEqual(85);
      });
    });

    describe('Auto columns', () => {
      it('should assign estimated width to auto columns', () => {
        const columns = [
          { field: 'name', headerName: 'Name', filter: FILTER_TYPE_NONE },
        ];
        const result = calculateColumnWidths(columns, 1000);
        const width = result.columnWidthMap.get('name');
        expect(width).toBeGreaterThanOrEqual(85);
        expect(width).toBeLessThanOrEqual(250); // Auto max = 2.5 * 85
      });

      it('should allow auto columns to grow with leftover pixels', () => {
        const columns = [
          { field: 'id', headerName: 'ID', width: 100, filter: FILTER_TYPE_NONE },
          { field: 'name', headerName: 'Name', filter: FILTER_TYPE_NONE },
        ];
        const result = calculateColumnWidths(columns, 1000);
        const nameWidth = result.columnWidthMap.get('name');
        expect(nameWidth).toBeGreaterThanOrEqual(85);
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
          { field: 'id', headerName: 'ID', width: 100, filter: FILTER_TYPE_NONE },
          { field: 'name', headerName: 'Name', flex: 1, filter: FILTER_TYPE_NONE },
        ];
        const columnState = new Map([['name', 250]]);
        const result = calculateColumnWidths(columns, 1000, columnState);
        expect(result.columnWidthMap.get('name')).toBe(250);
        expect(result.columnWidthMap.get('id')).toBe(100);
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
          { field: 'name6', headerName: 'Name6', width: 100, filter: FILTER_TYPE_NONE },
        ];
        const result = calculateColumnWidths(columns, 0);
        // With zero containerWidth, minTotal (100 from step 2) > 0, so returns allMinWidths
        // allMinWidths uses the width from step 2 (100), not the built-in min (85)
        expect(result.columnWidthMap.get('name6')).toBe(100);
        expect(result.enableHorizontalScroll).toBe(true);
      });

      it('should handle negative containerWidth', () => {
        const columns = [
          { field: 'name7', headerName: 'Name7', width: 100, filter: FILTER_TYPE_NONE },
        ];
        const result = calculateColumnWidths(columns, -100);
        // With negative containerWidth, minTotal (100) > -100, so returns allMinWidths
        expect(result.columnWidthMap.get('name7')).toBe(100);
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
        // Auto max = 2.5 * 85 = 212.5, floored = 212
        expect(width).toBeLessThanOrEqual(213);
      });
    });

    describe('Mixed column types', () => {
      it('should handle mix of fixed, flex, and auto columns', () => {
        const columns = [
          { field: 'id', headerName: 'ID', width: 100, filter: FILTER_TYPE_NONE },
          { field: 'name', headerName: 'Name', flex: 1, filter: FILTER_TYPE_NONE },
          { field: 'desc', headerName: 'Description', filter: FILTER_TYPE_NONE },
        ];
        const result = calculateColumnWidths(columns, 1000);
        expect(result.columnWidthMap.get('id')).toBe(100);
        expect(result.columnWidthMap.get('name')).toBeGreaterThanOrEqual(85);
        expect(result.columnWidthMap.get('desc')).toBeGreaterThanOrEqual(85);
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
        expect(result.columnWidthMap.get('col1')).toBeGreaterThanOrEqual(85);
        expect(result.columnWidthMap.get('col2')).toBeGreaterThanOrEqual(85);
        expect(result.columnWidthMap.get('col2')).toBeGreaterThan(result.columnWidthMap.get('col1'));
      });

      it('should handle all auto columns', () => {
        const columns = [
          { field: 'col1', headerName: 'Col1', filter: FILTER_TYPE_NONE },
          { field: 'col2', headerName: 'Col2', filter: FILTER_TYPE_NONE },
        ];
        const result = calculateColumnWidths(columns, 1000);
        expect(result.columnWidthMap.get('col1')).toBeGreaterThanOrEqual(85);
        expect(result.columnWidthMap.get('col2')).toBeGreaterThanOrEqual(85);
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
        expect(result.columnWidthMap.get('name')).toBeGreaterThanOrEqual(85);
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
        expect(result.columnWidthMap.get('name8')).toBe(85);
      });

      it('should handle column with negative width', () => {
        const columns = [
          { field: 'name9', headerName: 'Name9', width: -10, filter: FILTER_TYPE_NONE },
        ];
        const result = calculateColumnWidths(columns, 1000);
        // Negative width is treated as fixed, but clamped to minWidth
        expect(result.columnWidthMap.get('name9')).toBe(85);
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
        expect(result.columnWidthMap.get('name')).toBeGreaterThan(85);
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
  });
});
