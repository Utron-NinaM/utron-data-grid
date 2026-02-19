import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useColumnLayout } from '../../src/DataGrid/useColumnLayout';
import { FILTER_TYPE_NONE } from '../../src/config/schema';
import { MIN_WIDTH_DEFAULT_PX } from '../../src/utils/columnWidthUtils';

// Mock useContainerWidth
vi.mock('../../src/DataGrid/useContainerWidth', () => ({
  useContainerWidth: vi.fn(),
}));

import { useContainerWidth } from '../../src/DataGrid/useContainerWidth';

describe('useColumnLayout', () => {
  let containerRef;

  beforeEach(() => {
    containerRef = { current: document.createElement('div') };
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic functionality', () => {
    it('should use fallback width when containerWidth is 0 but containerRef exists', () => {
      useContainerWidth.mockReturnValue(0);
      const columns = [
        { field: 'name', headerName: 'Name', width: 140, filter: FILTER_TYPE_NONE },
      ];

      const { result } = renderHook(() =>
        useColumnLayout({ columns, containerRef, columnWidthState: new Map() })
      );

      // When containerWidth is 0 but ref exists, should use fallback (1000px) to calculate widths
      expect(result.current.columnWidthMap.size).toBe(1);
      expect(result.current.columnWidthMap.get('name')).toBe(140);
      expect(result.current.totalWidth).toBe(140);
    });

    it('should return empty layout when columns array is empty', () => {
      useContainerWidth.mockReturnValue(1000);
      const columns = [];

      const { result } = renderHook(() =>
        useColumnLayout({ columns, containerRef, columnWidthState: new Map() })
      );

      expect(result.current.columnWidthMap.size).toBe(0);
      expect(result.current.totalWidth).toBe(0);
      expect(result.current.enableHorizontalScroll).toBe(false);
    });

    it('should calculate layout for fixed width columns', () => {
      useContainerWidth.mockReturnValue(1000);
      const columns = [
        { field: 'id', headerName: 'ID', width: 100, filter: FILTER_TYPE_NONE },
        { field: 'name', headerName: 'Name', width: 200, filter: FILTER_TYPE_NONE },
      ];

      const { result } = renderHook(() =>
        useColumnLayout({ columns, containerRef, columnWidthState: new Map() })
      );

      expect(result.current.columnWidthMap.get('id')).toBe(MIN_WIDTH_DEFAULT_PX);
      expect(result.current.columnWidthMap.get('name')).toBe(200);
      expect(result.current.totalWidth).toBe(MIN_WIDTH_DEFAULT_PX + 200);
    });

    it('should calculate layout for flex columns', () => {
      useContainerWidth.mockReturnValue(1000);
      const columns = [
        { field: 'id', headerName: 'ID', width: 100, filter: FILTER_TYPE_NONE },
        { field: 'name', headerName: 'Name', flex: 1, filter: FILTER_TYPE_NONE },
      ];

      const { result } = renderHook(() =>
        useColumnLayout({ columns, containerRef, columnWidthState: new Map() })
      );

      expect(result.current.columnWidthMap.get('id')).toBe(MIN_WIDTH_DEFAULT_PX);
      expect(result.current.columnWidthMap.get('name')).toBeGreaterThanOrEqual(MIN_WIDTH_DEFAULT_PX);
    });

    it('should calculate layout for auto columns', () => {
      useContainerWidth.mockReturnValue(1000);
      const columns = [
        { field: 'name', headerName: 'Name', filter: FILTER_TYPE_NONE },
      ];

      const { result } = renderHook(() =>
        useColumnLayout({ columns, containerRef, columnWidthState: new Map() })
      );

      expect(result.current.columnWidthMap.get('name')).toBeGreaterThanOrEqual(MIN_WIDTH_DEFAULT_PX);
    });
  });

  describe('Memoization', () => {
    it('should memoize results when inputs do not change', () => {
      useContainerWidth.mockReturnValue(1000);
      const columns = [
        { field: 'name', headerName: 'Name', width: 100, filter: FILTER_TYPE_NONE },
      ];
      const columnWidthState = new Map();

      const { result, rerender } = renderHook(
        ({ cols, state }) => useColumnLayout({ columns: cols, containerRef, columnWidthState: state }),
        { initialProps: { cols: columns, state: columnWidthState } }
      );

      const firstResult = result.current;
      rerender({ cols: columns, state: columnWidthState });
      const secondResult = result.current;

      // Should be same reference when inputs unchanged
      expect(firstResult.columnWidthMap).toBe(secondResult.columnWidthMap);
    });

    it('should recalculate when columns change', () => {
      useContainerWidth.mockReturnValue(1000);
      const columns1 = [
        { field: 'name', headerName: 'Name', width: 100, filter: FILTER_TYPE_NONE },
      ];
      const columns2 = [
        { field: 'name', headerName: 'Name', width: 200, filter: FILTER_TYPE_NONE },
      ];
      const columnWidthState = new Map();

      const { result, rerender } = renderHook(
        ({ cols }) => useColumnLayout({ columns: cols, containerRef, columnWidthState }),
        { initialProps: { cols: columns1 } }
      );

      const firstWidth = result.current.columnWidthMap.get('name');
      rerender({ cols: columns2 });
      const secondWidth = result.current.columnWidthMap.get('name');

      expect(firstWidth).toBe(MIN_WIDTH_DEFAULT_PX);
      expect(secondWidth).toBe(200);
    });

    it('should recalculate when containerWidth changes', () => {
      useContainerWidth.mockReturnValue(1000);
      const columns = [
        { field: 'name', headerName: 'Name', flex: 1, filter: FILTER_TYPE_NONE },
      ];
      const columnWidthState = new Map();

      const { result, rerender } = renderHook(() =>
        useColumnLayout({ columns, containerRef, columnWidthState })
      );

      const firstWidth = result.current.columnWidthMap.get('name');
      useContainerWidth.mockReturnValue(2000);
      rerender();
      const secondWidth = result.current.columnWidthMap.get('name');

      expect(secondWidth).toBeGreaterThan(firstWidth);
    });

    it('should recalculate when columnWidthState changes', () => {
      useContainerWidth.mockReturnValue(1000);
      const columns = [
        { field: 'name', headerName: 'Name', width: 100, filter: FILTER_TYPE_NONE },
      ];
      const state1 = new Map();
      const state2 = new Map([['name', 300]]);

      const { result, rerender } = renderHook(
        ({ state }) => useColumnLayout({ columns, containerRef, columnWidthState: state }),
        { initialProps: { state: state1 } }
      );

      const firstWidth = result.current.columnWidthMap.get('name');
      rerender({ state: state2 });
      const secondWidth = result.current.columnWidthMap.get('name');

      expect(firstWidth).toBe(MIN_WIDTH_DEFAULT_PX);
      expect(secondWidth).toBe(300);
    });

    it('should memoize columnWidthState as string key', () => {
      useContainerWidth.mockReturnValue(1000);
      const columns = [
        { field: 'name', headerName: 'Name', width: 100, filter: FILTER_TYPE_NONE },
      ];
      // Create two Map instances with same content
      const state1 = new Map([['name', 200]]);
      const state2 = new Map([['name', 200]]);

      const { result, rerender } = renderHook(
        ({ state }) => useColumnLayout({ columns, containerRef, columnWidthState: state }),
        { initialProps: { state: state1 } }
      );

      const firstResult = result.current;
      rerender({ state: state2 });
      const secondResult = result.current;

      // Should recognize same content and memoize
      expect(firstResult.columnWidthMap.get('name')).toBe(secondResult.columnWidthMap.get('name'));
    });

    it('should recalculate when columnWidthState content changes', () => {
      useContainerWidth.mockReturnValue(1000);
      const columns = [
        { field: 'name', headerName: 'Name', width: 100, filter: FILTER_TYPE_NONE },
      ];
      const state1 = new Map([['name', 200]]);
      const state2 = new Map([['name', 250]]);

      const { result, rerender } = renderHook(
        ({ state }) => useColumnLayout({ columns, containerRef, columnWidthState: state }),
        { initialProps: { state: state1 } }
      );

      const firstWidth = result.current.columnWidthMap.get('name');
      rerender({ state: state2 });
      const secondWidth = result.current.columnWidthMap.get('name');

      expect(firstWidth).toBe(200);
      expect(secondWidth).toBe(250);
    });
  });

  describe('Edge cases', () => {
    it('should handle null containerRef', () => {
      useContainerWidth.mockReturnValue(0);
      const columns = [
        { field: 'name', headerName: 'Name', width: 100, filter: FILTER_TYPE_NONE },
      ];

      const { result } = renderHook(() =>
        useColumnLayout({ columns, containerRef: null, columnWidthState: new Map() })
      );

      expect(result.current.columnWidthMap.size).toBe(0);
    });

    it('should handle undefined columns', () => {
      useContainerWidth.mockReturnValue(1000);

      const { result } = renderHook(() =>
        useColumnLayout({ columns: undefined, containerRef, columnWidthState: new Map() })
      );

      expect(result.current.columnWidthMap.size).toBe(0);
    });

    it('should handle null columnWidthState', () => {
      useContainerWidth.mockReturnValue(1000);
      const columns = [
        { field: 'name', headerName: 'Name', width: 100, filter: FILTER_TYPE_NONE },
      ];

      const { result } = renderHook(() =>
        useColumnLayout({ columns, containerRef, columnWidthState: null })
      );

      expect(result.current.columnWidthMap.get('name')).toBe(MIN_WIDTH_DEFAULT_PX);
    });

    it('should handle empty columnWidthState Map', () => {
      useContainerWidth.mockReturnValue(1000);
      const columns = [
        { field: 'name', headerName: 'Name', width: 100, filter: FILTER_TYPE_NONE },
      ];
      const emptyState = new Map();

      const { result } = renderHook(() =>
        useColumnLayout({ columns, containerRef, columnWidthState: emptyState })
      );

      expect(result.current.columnWidthMap.get('name')).toBe(MIN_WIDTH_DEFAULT_PX);
    });

    it('should handle negative containerWidth', () => {
      useContainerWidth.mockReturnValue(-100);
      const columns = [
        { field: 'name', headerName: 'Name', width: 100, filter: FILTER_TYPE_NONE },
      ];

      const { result } = renderHook(() =>
        useColumnLayout({ columns, containerRef, columnWidthState: new Map() })
      );

      expect(result.current.columnWidthMap.get('name')).toBe(MIN_WIDTH_DEFAULT_PX);
    });

    it('should handle very large containerWidth', () => {
      useContainerWidth.mockReturnValue(100000);
      const columns = [
        { field: 'name', headerName: 'Name', flex: 1, filter: FILTER_TYPE_NONE },
      ];

      const { result } = renderHook(() =>
        useColumnLayout({ columns, containerRef, columnWidthState: new Map() })
      );

      expect(result.current.columnWidthMap.get('name')).toBeGreaterThan(MIN_WIDTH_DEFAULT_PX);
    });

    it('should handle multiple columnWidthState entries', () => {
      useContainerWidth.mockReturnValue(1000);
      const columns = [
        { field: 'id', headerName: 'ID', width: 100, filter: FILTER_TYPE_NONE },
        { field: 'name', headerName: 'Name', width: 200, filter: FILTER_TYPE_NONE },
        { field: 'desc', headerName: 'Description', flex: 1, filter: FILTER_TYPE_NONE },
      ];
      const state = new Map([
        ['id', 150],
        ['name', 250],
      ]);

      const { result } = renderHook(() =>
        useColumnLayout({ columns, containerRef, columnWidthState: state })
      );

      expect(result.current.columnWidthMap.get('id')).toBe(150);
      expect(result.current.columnWidthMap.get('name')).toBe(250);
      expect(result.current.columnWidthMap.get('desc')).toBeGreaterThanOrEqual(MIN_WIDTH_DEFAULT_PX);
    });
  });

  describe('Integration with calculateColumnWidths', () => {
    it('should enable horizontal scroll when total exceeds container', () => {
      useContainerWidth.mockReturnValue(1000);
      const columns = [
        { field: 'col1', headerName: 'Col1', width: 600, filter: FILTER_TYPE_NONE },
        { field: 'col2', headerName: 'Col2', width: 600, filter: FILTER_TYPE_NONE },
      ];

      const { result } = renderHook(() =>
        useColumnLayout({ columns, containerRef, columnWidthState: new Map() })
      );

      expect(result.current.enableHorizontalScroll).toBe(true);
      expect(result.current.totalWidth).toBe(1200);
    });

    it('should disable horizontal scroll when total fits container', () => {
      useContainerWidth.mockReturnValue(1000);
      const columns = [
        { field: 'col1', headerName: 'Col1', width: 400, filter: FILTER_TYPE_NONE },
        { field: 'col2', headerName: 'Col2', width: 400, filter: FILTER_TYPE_NONE },
      ];

      const { result } = renderHook(() =>
        useColumnLayout({ columns, containerRef, columnWidthState: new Map() })
      );

      expect(result.current.enableHorizontalScroll).toBe(false);
      expect(result.current.totalWidth).toBeLessThanOrEqual(1000);
    });
  });
});
