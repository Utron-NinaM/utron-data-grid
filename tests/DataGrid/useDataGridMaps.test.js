import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDataGridMaps } from '../../src/DataGrid/useDataGridMaps';
import { DIRECTION_RTL } from '../../src/config/schema';

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

    it('returns empty Map when sortModel is null/undefined', () => {
      const { result } = renderHook(useDataGridMaps, {
        initialProps: {
          columns: defaultColumns,
          sortModel: null,
          direction: 'ltr',
          headerConfig: {},
          displayRows: [],
          getRowId: defaultGetRowId,
        },
      });
      expect(result.current.sortOrderIndexMap.size).toBe(0);
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
  });
});
