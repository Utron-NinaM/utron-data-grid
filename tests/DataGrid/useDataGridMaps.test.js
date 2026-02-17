import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDataGridMaps } from '../../src/DataGrid/useDataGridMaps';
import { DIRECTION_RTL, FILTER_TYPE_NONE, FILTER_TYPE_NUMBER, FILTER_TYPE_TEXT } from '../../src/config/schema';

describe('useDataGridMaps', () => {
  const defaultColumns = [
    { field: 'a', headerName: 'A' },
    { field: 'b', headerName: 'B' },
  ];
  const defaultGetRowId = (row) => row.id;

  describe('sortOrderIndexMap', () => {
    it('returns empty Map when sortModel is empty', () => {
      const { result } = renderHook(useDataGridMaps, {
        initialProps: {
          columns: defaultColumns,
          sortModel: [],
          direction: 'ltr',
          headerConfig: {},
          displayRows: [],
          getRowId: defaultGetRowId,
        },
      });
      expect(result.current.sortOrderIndexMap.size).toBe(0);
    });

    it.each([
      ['null', null],
      ['undefined', undefined],
    ])('returns empty Map when sortModel is %s', (_, sortModel) => {
      const { result } = renderHook(useDataGridMaps, {
        initialProps: {
          columns: defaultColumns,
          sortModel,
          direction: 'ltr',
          headerConfig: {},
          displayRows: [],
          getRowId: defaultGetRowId,
        },
      });
      expect(result.current.sortOrderIndexMap.size).toBe(0);
    });

    it('handles sortModel with invalid fields not in columns', () => {
      const sortModel = [
        { field: 'nonexistent', order: 'asc' },
        { field: 'a', order: 'desc' },
      ];
      const { result } = renderHook(useDataGridMaps, {
        initialProps: {
          columns: defaultColumns,
          sortModel,
          direction: 'ltr',
          headerConfig: {},
          displayRows: [],
          getRowId: defaultGetRowId,
        },
      });
      // Should still map valid fields
      expect(result.current.sortOrderIndexMap.get('nonexistent')).toBe(1);
      expect(result.current.sortOrderIndexMap.get('a')).toBe(2);
    });

    it('handles sortModel with duplicate fields', () => {
      const sortModel = [
        { field: 'a', order: 'asc' },
        { field: 'a', order: 'desc' },
      ];
      const { result } = renderHook(useDataGridMaps, {
        initialProps: {
          columns: defaultColumns,
          sortModel,
          direction: 'ltr',
          headerConfig: {},
          displayRows: [],
          getRowId: defaultGetRowId,
        },
      });
      // Last occurrence should win
      expect(result.current.sortOrderIndexMap.get('a')).toBe(2);
      expect(result.current.columnSortDirMap.get('a')).toBe('desc');
    });

    it('maps field to 1-based sort index for multi-column sort', () => {
      const sortModel = [
        { field: 'a', order: 'asc' },
        { field: 'b', order: 'desc' },
      ];
      const { result } = renderHook(useDataGridMaps, {
        initialProps: {
          columns: defaultColumns,
          sortModel,
          direction: 'ltr',
          headerConfig: {},
          displayRows: [],
          getRowId: defaultGetRowId,
        },
      });
      expect(result.current.sortOrderIndexMap.get('a')).toBe(1);
      expect(result.current.sortOrderIndexMap.get('b')).toBe(2);
    });
  });

  describe('columnSortDirMap', () => {
    it('maps field to order for each sorted column', () => {
      const sortModel = [
        { field: 'a', order: 'asc' },
        { field: 'b', order: 'desc' },
      ];
      const { result } = renderHook(useDataGridMaps, {
        initialProps: {
          columns: defaultColumns,
          sortModel,
          direction: 'ltr',
          headerConfig: {},
          displayRows: [],
          getRowId: defaultGetRowId,
        },
      });
      expect(result.current.columnSortDirMap.get('a')).toBe('asc');
      expect(result.current.columnSortDirMap.get('b')).toBe('desc');
    });
  });

  describe('columnAlignMap', () => {
    it('uses column align when provided', () => {
      const columns = [{ field: 'a', align: 'center' }, { field: 'b', headerName: 'B' }];
      const { result } = renderHook(useDataGridMaps, {
        initialProps: {
          columns,
          sortModel: [],
          direction: 'ltr',
          headerConfig: {},
          displayRows: [],
          getRowId: defaultGetRowId,
        },
      });
      expect(result.current.columnAlignMap.get('a')).toBe('center');
    });

    it('handles empty columns array', () => {
      const { result } = renderHook(useDataGridMaps, {
        initialProps: {
          columns: [],
          sortModel: [],
          direction: 'ltr',
          headerConfig: {},
          displayRows: [],
          getRowId: defaultGetRowId,
        },
      });
      expect(result.current.columnAlignMap.size).toBe(0);
    });

    it('handles columns with missing field property', () => {
      const columns = [{ headerName: 'A' }, { field: 'b', headerName: 'B' }];
      const { result } = renderHook(useDataGridMaps, {
        initialProps: {
          columns,
          sortModel: [],
          direction: 'ltr',
          headerConfig: {},
          displayRows: [],
          getRowId: defaultGetRowId,
        },
      });
      // Column without field should still be processed (field will be undefined)
      expect(result.current.columnAlignMap.has(undefined)).toBe(true);
      expect(result.current.columnAlignMap.get('b')).toBe('left');
    });

    it('defaults to left when direction is ltr and no align', () => {
      const { result } = renderHook(useDataGridMaps, {
        initialProps: {
          columns: defaultColumns,
          sortModel: [],
          direction: 'ltr',
          headerConfig: {},
          displayRows: [],
          getRowId: defaultGetRowId,
        },
      });
      expect(result.current.columnAlignMap.get('a')).toBe('left');
      expect(result.current.columnAlignMap.get('b')).toBe('left');
    });

    it('defaults to right when direction is RTL and no align', () => {
      const { result } = renderHook(useDataGridMaps, {
        initialProps: {
          columns: defaultColumns,
          sortModel: [],
          direction: DIRECTION_RTL,
          headerConfig: {},
          displayRows: [],
          getRowId: defaultGetRowId,
        },
      });
      expect(result.current.columnAlignMap.get('a')).toBe('right');
      expect(result.current.columnAlignMap.get('b')).toBe('right');
    });
  });

  describe('columnWidthMap', () => {
    it('returns empty Map when no columns have width set', () => {
      const { result } = renderHook(useDataGridMaps, {
        initialProps: {
          columns: defaultColumns,
          sortModel: [],
          direction: 'ltr',
          headerConfig: {},
          displayRows: [],
          getRowId: defaultGetRowId,
        },
      });
      expect(result.current.columnWidthMap.size).toBe(0);
    });

    it('maps field to normalized width string for numeric width >= min', () => {
      const columns = [
        { field: 'a', headerName: 'A', width: 100, filter: FILTER_TYPE_NONE },
        { field: 'b', headerName: 'B', width: 200, filter: FILTER_TYPE_NONE },
      ];
      const { result } = renderHook(useDataGridMaps, {
        initialProps: {
          columns,
          sortModel: [],
          direction: 'ltr',
          headerConfig: {},
          displayRows: [],
          getRowId: defaultGetRowId,
        },
      });
      expect(result.current.columnWidthMap.get('a')).toBe('100px');
      expect(result.current.columnWidthMap.get('b')).toBe('200px');
    });


    it('only includes columns with width set in the map', () => {
      const columns = [
        { field: 'a', headerName: 'A', width: 100, filter: FILTER_TYPE_NONE },
        { field: 'b', headerName: 'B', filter: FILTER_TYPE_NONE },
        { field: 'c', headerName: 'C', width: 200, filter: FILTER_TYPE_NONE },
      ];
      const { result } = renderHook(useDataGridMaps, {
        initialProps: {
          columns,
          sortModel: [],
          direction: 'ltr',
          headerConfig: {},
          displayRows: [],
          getRowId: defaultGetRowId,
        },
      });
      expect(result.current.columnWidthMap.size).toBe(2);
      expect(result.current.columnWidthMap.get('a')).toBe('100px');
      expect(result.current.columnWidthMap.get('b')).toBeUndefined();
      expect(result.current.columnWidthMap.get('c')).toBe('200px');
    });
  });

  describe('headerCellSxMap and filterCellSxMap', () => {
    it('has one entry per column with base sx', () => {
      const { result } = renderHook(useDataGridMaps, {
        initialProps: {
          columns: defaultColumns,
          sortModel: [],
          direction: 'ltr',
          headerConfig: {},
          displayRows: [],
          getRowId: defaultGetRowId,
        },
      });
      const headerSx = result.current.headerCellSxMap.get('a');
      expect(headerSx).toMatchObject({
        verticalAlign: 'top',
        padding: '4px',
        width: 'inherit',
        overflow: 'hidden',
        boxSizing: 'border-box',
      });
      expect(result.current.headerCellSxMap.get('b')).toBeDefined();
    });


    it('applies minWidth to headerCellSxMap when no width is set but column has filter combo', () => {
      const columns = [
        { field: 'a', headerName: 'A', filter: FILTER_TYPE_NUMBER },
      ];
      const { result } = renderHook(useDataGridMaps, {
        initialProps: {
          columns,
          sortModel: [],
          direction: 'ltr',
          headerConfig: {},
          displayRows: [],
          getRowId: defaultGetRowId,
        },
      });
      const headerSx = result.current.headerCellSxMap.get('a');
      expect(headerSx.width).toBe('inherit');
      expect(headerSx.minWidth).toBe('135px');
    });



    it('applies minWidth to filterCellSxMap when column has filter combo', () => {
      const columns = [
        { field: 'a', headerName: 'A', filter: FILTER_TYPE_TEXT },
      ];
      const { result } = renderHook(useDataGridMaps, {
        initialProps: {
          columns,
          sortModel: [],
          direction: 'ltr',
          headerConfig: {},
          displayRows: [],
          getRowId: defaultGetRowId,
        },
      });
      const filterSx = result.current.filterCellSxMap.get('a');
      expect(filterSx.minWidth).toBe('135px');
    });

    it('merges mainRow height and backgroundColor into headerCellSxMap', () => {
      const headerConfig = {
        mainRow: { height: 40, backgroundColor: '#eee' },
      };
      const { result } = renderHook(useDataGridMaps, {
        initialProps: {
          columns: defaultColumns,
          sortModel: [],
          direction: 'ltr',
          headerConfig,
          displayRows: [],
          getRowId: defaultGetRowId,
        },
      });
      const headerSx = result.current.headerCellSxMap.get('a');
      expect(headerSx).toMatchObject({
        padding: '2px',
        height: 40,
        maxHeight: 40,
        backgroundColor: '#eee',
      });
    });

    it('merges filterCells height and backgroundColor into filterCellSxMap', () => {
      const headerConfig = {
        filterCells: { height: 32, backgroundColor: '#f5f5f5' },
      };
      const { result } = renderHook(useDataGridMaps, {
        initialProps: {
          columns: defaultColumns,
          sortModel: [],
          direction: 'ltr',
          headerConfig,
          displayRows: [],
          getRowId: defaultGetRowId,
        },
      });
      const filterSx = result.current.filterCellSxMap.get('a');
      expect(filterSx).toMatchObject({
        padding: '2px',
        height: 32,
        maxHeight: 32,
        backgroundColor: '#f5f5f5',
      });
    });

    it('uses filterRows.height when filterCells.height is not set', () => {
      const headerConfig = {
        filterRows: { height: 28 },
      };
      const { result } = renderHook(useDataGridMaps, {
        initialProps: {
          columns: defaultColumns,
          sortModel: [],
          direction: 'ltr',
          headerConfig,
          displayRows: [],
          getRowId: defaultGetRowId,
        },
      });
      const filterSx = result.current.filterCellSxMap.get('a');
      expect(filterSx).toMatchObject({ height: 28, maxHeight: 28 });
    });

    it('spreads headerConfig.base into both header and filter cell sx', () => {
      const headerConfig = { base: { borderBottom: '1px solid #ccc' } };
      const { result } = renderHook(useDataGridMaps, {
        initialProps: {
          columns: defaultColumns,
          sortModel: [],
          direction: 'ltr',
          headerConfig,
          displayRows: [],
          getRowId: defaultGetRowId,
        },
      });
      expect(result.current.headerCellSxMap.get('a').borderBottom).toBe('1px solid #ccc');
      expect(result.current.filterCellSxMap.get('a').borderBottom).toBe('1px solid #ccc');
    });

    it('handles headerConfig with conflicting properties', () => {
      const headerConfig = {
        mainRow: { height: 40, backgroundColor: '#eee' },
        filterCells: { height: 32, backgroundColor: '#f5f5f5' },
        base: { padding: '8px' },
      };
      const { result } = renderHook(useDataGridMaps, {
        initialProps: {
          columns: defaultColumns,
          sortModel: [],
          direction: 'ltr',
          headerConfig,
          displayRows: [],
          getRowId: defaultGetRowId,
        },
      });
      const headerSx = result.current.headerCellSxMap.get('a');
      // mainRow.height should override base padding
      expect(headerSx.height).toBe(40);
      expect(headerSx.padding).toBe('2px'); 
      expect(headerSx.backgroundColor).toBe('#eee');
    });
  });

  describe('rowStylesMap', () => {
    it('maps row id to undefined when no column has rowStyle', () => {
      const displayRows = [{ id: 'r1', name: 'Row 1' }];
      const { result } = renderHook(useDataGridMaps, {
        initialProps: {
          columns: defaultColumns,
          sortModel: [],
          direction: 'ltr',
          headerConfig: {},
          displayRows,
          getRowId: defaultGetRowId,
        },
      });
      expect(result.current.rowStylesMap.get('r1')).toBeUndefined();
    });

    it('maps row id to computed sx when column has rowStyle function', () => {
      const displayRows = [
        { id: 'r1', bold: true },
        { id: 'r2', bold: false },
      ];
      const columns = [
        { field: 'a', headerName: 'A' },
        {
          field: 'b',
          headerName: 'B',
          rowStyle: (row) => (row.bold ? { fontWeight: 'bold' } : {}),
        },
      ];
      const { result } = renderHook(useDataGridMaps, {
        initialProps: {
          columns,
          sortModel: [],
          direction: 'ltr',
          headerConfig: {},
          displayRows,
          getRowId: defaultGetRowId,
        },
      });
      expect(result.current.rowStylesMap.get('r1')).toEqual({ fontWeight: 'bold' });
      expect(result.current.rowStylesMap.get('r2')).toBeUndefined();
    });

    it('uses getRowId to key rows', () => {
      const displayRows = [{ id: 'r1' }];
      const getRowId = (row) => row.id;
      const { result } = renderHook(useDataGridMaps, {
        initialProps: {
          columns: defaultColumns,
          sortModel: [],
          direction: 'ltr',
          headerConfig: {},
          displayRows,
          getRowId,
        },
      });
      expect(result.current.rowStylesMap.has('r1')).toBe(true);
    });

    it('handles multiple columns with rowStyle functions', () => {
      const displayRows = [{ id: 'r1', priority: 'high', status: 'active' }];
      const columns = [
        { field: 'a', headerName: 'A', rowStyle: (row) => (row.priority === 'high' ? { fontWeight: 'bold' } : {}) },
        { field: 'b', headerName: 'B', rowStyle: (row) => (row.status === 'active' ? { color: 'green' } : {}) },
      ];
      const { result } = renderHook(useDataGridMaps, {
        initialProps: {
          columns,
          sortModel: [],
          direction: 'ltr',
          headerConfig: {},
          displayRows,
          getRowId: defaultGetRowId,
        },
      });
      const rowSx = result.current.rowStylesMap.get('r1');
      expect(rowSx).toEqual({ fontWeight: 'bold', color: 'green' });
    });

    it('handles empty displayRows array', () => {
      const { result } = renderHook(useDataGridMaps, {
        initialProps: {
          columns: defaultColumns,
          sortModel: [],
          direction: 'ltr',
          headerConfig: {},
          displayRows: [],
          getRowId: defaultGetRowId,
        },
      });
      expect(result.current.rowStylesMap.size).toBe(0);
    });
  });
});
