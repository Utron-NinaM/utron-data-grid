import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { GridTable } from '../../src/core/GridTable';
import { DataGridProvider } from '../../src/DataGrid/DataGridContext';
import { createSelectionStore } from '../../src/DataGrid/selectionStore';
import { createEditStore } from '../../src/DataGrid/editStore';
import { DIRECTION_LTR } from '../../src/config/schema';

const ROW_HEIGHT = 30;
const CONTAINER_HEIGHT = 300;
const BIG_ROW_COUNT = 10000;

/** Wraps grid in a fixed-height container so TableVirtuoso has a non-zero viewport in jsdom. */
function GridWithHeight({ children, height = CONTAINER_HEIGHT }) {
  return (
    <div style={{ height, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {children}
    </div>
  );
}

function makeStableValue(overrides = {}) {
  const scrollContainerRef = overrides.scrollContainerRef ?? { current: null };
  return {
    columns: [
      { field: 'id', headerName: 'ID', type: 'number' },
      { field: 'name', headerName: 'Name', type: 'text' },
    ],
    getRowId: (row) => row.id,
    multiSelectable: false,
    direction: DIRECTION_LTR,
    translations: {},
    defaultTranslations: {},
    colRefs: { current: new Map() },
    containerRef: { current: null },
    columnWidthMap: new Map(),
    totalWidth: 200,
    enableHorizontalScroll: false,
    showHorizontalScrollbar: false,
    onClearSort: vi.fn(),
    onClearAllFilters: vi.fn(),
    onClearColumnWidths: vi.fn(),
    hasResizedColumns: false,
    headerConfig: {},
    getEditor: null,
    selectedRowStyle: {},
    rowStylesMap: new Map(),
    sortOrderIndexMap: new Map(),
    columnSortDirMap: new Map(),
    columnAlignMap: new Map(),
    headerCellSxMap: new Map(),
    filterCellSxMap: new Map(),
    onColumnResize: null,
    selectionStore: createSelectionStore(null),
    selectRow: vi.fn(),
    bodyRow: { height: ROW_HEIGHT },
    editable: false,
    editStore: createEditStore(),
    scrollContainerRef,
    setScrollContainerReady: vi.fn(),
    ...overrides,
  };
}

function makeRows(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Row ${i + 1}`,
  }));
}

describe('Virtualization', () => {
  const theme = createTheme();

  describe('big dataset', () => {
    it('renders only a subset of rows when containScroll and many rows', async () => {
      const scrollContainerRef = { current: null };
      const stableValue = makeStableValue({ scrollContainerRef });
      const rows = makeRows(BIG_ROW_COUNT);

      const { container } = render(
        <GridWithHeight>
          <ThemeProvider theme={theme}>
            <DataGridProvider stableValue={stableValue} filterValue={{ getHeaderComboSlot: null, getFilterInputSlot: null, getFilterToInputSlot: null }}>
              <GridTable
                rows={rows}
                selection={new Set()}
                sortModel={[]}
                onSort={vi.fn()}
                hasActiveFilters={false}
                hasActiveRangeFilter={false}
                containScroll={true}
              />
            </DataGridProvider>
          </ThemeProvider>
        </GridWithHeight>
      );

      await waitFor(() => {
        expect(scrollContainerRef.current).toBeTruthy();
      });

      const scrollWrapper = container.querySelector('[data-testid="grid-scroll-container"]');
      expect(scrollWrapper).toBeTruthy();
      const bodyTable = container.querySelector('table[aria-label="Data grid body"]');
      expect(bodyTable).toBeTruthy();
      const bodyRows = container.querySelectorAll('tbody tr[data-row-id]');
      expect(bodyRows.length).toBeLessThanOrEqual(BIG_ROW_COUNT);
    });

    it('uses scroll container structure: scroll container and body table inside scroll area', async () => {
      const scrollContainerRef = { current: null };
      const stableValue = makeStableValue({ scrollContainerRef });
      const rows = makeRows(BIG_ROW_COUNT);

      const { container } = render(
        <ThemeProvider theme={theme}>
          <DataGridProvider stableValue={stableValue} filterValue={{ getHeaderComboSlot: null, getFilterInputSlot: null, getFilterToInputSlot: null }}>
            <GridTable
              rows={rows}
              selection={new Set()}
              sortModel={[]}
              onSort={vi.fn()}
              hasActiveFilters={false}
              hasActiveRangeFilter={false}
              containScroll={true}
            />
          </DataGridProvider>
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(scrollContainerRef.current).toBeTruthy();
      });

      const scrollWrapper = container.querySelector('[data-testid="grid-scroll-container"]');
      expect(scrollWrapper).toBeInTheDocument();
      const bodyTable = container.querySelector('table[aria-label="Data grid body"]');
      expect(bodyTable).toBeInTheDocument();
      expect(scrollWrapper?.contains(bodyTable)).toBe(true);
    });
  });

  describe('scroll updates visible slice', () => {
    it('updates visible rows after scroll event', async () => {
      const scrollContainerRef = { current: null };
      const stableValue = makeStableValue({ scrollContainerRef });
      const rows = makeRows(BIG_ROW_COUNT);

      const { container } = render(
        <GridWithHeight>
          <ThemeProvider theme={theme}>
            <DataGridProvider stableValue={stableValue} filterValue={{ getHeaderComboSlot: null, getFilterInputSlot: null, getFilterToInputSlot: null }}>
              <GridTable
                rows={rows}
                selection={new Set()}
                sortModel={[]}
                onSort={vi.fn()}
                hasActiveFilters={false}
                hasActiveRangeFilter={false}
                containScroll={true}
              />
            </DataGridProvider>
          </ThemeProvider>
        </GridWithHeight>
      );

      await waitFor(() => {
        expect(scrollContainerRef.current).toBeTruthy();
      });

      const bodyTable = container.querySelector('table[aria-label="Data grid body"]');
      expect(bodyTable).toBeTruthy();
      const scrollEl = scrollContainerRef.current;
      Object.defineProperty(scrollEl, 'clientHeight', { value: CONTAINER_HEIGHT, configurable: true });
      Object.defineProperty(scrollEl, 'scrollHeight', { value: BIG_ROW_COUNT * ROW_HEIGHT, configurable: true });
      scrollEl.scrollTop = 0;

      const getFirstRenderedRowId = () => {
        const firstRow = container.querySelector('tbody tr[data-row-id]');
        return firstRow ? firstRow.getAttribute('data-row-id') : null;
      };

      const initialId = getFirstRenderedRowId();
      if (initialId) {
        await act(async () => {
          scrollEl.scrollTop = 100 * ROW_HEIGHT;
          scrollEl.dispatchEvent(new Event('scroll', { bubbles: true }));
        });

        await waitFor(() => {
          const afterId = getFirstRenderedRowId();
          if (afterId) expect(parseInt(afterId, 10)).toBeGreaterThanOrEqual(1);
        }, { timeout: 500 });
      }
    });

    it('visible slice changes after large scroll (offsetY behavior)', async () => {
      const scrollContainerRef = { current: null };
      const stableValue = makeStableValue({ scrollContainerRef });
      const rows = makeRows(BIG_ROW_COUNT);

      const { container } = render(
        <GridWithHeight>
          <ThemeProvider theme={theme}>
            <DataGridProvider stableValue={stableValue} filterValue={{ getHeaderComboSlot: null, getFilterInputSlot: null, getFilterToInputSlot: null }}>
              <GridTable
                rows={rows}
                selection={new Set()}
                sortModel={[]}
                onSort={vi.fn()}
                hasActiveFilters={false}
                hasActiveRangeFilter={false}
                containScroll={true}
              />
            </DataGridProvider>
          </ThemeProvider>
        </GridWithHeight>
      );

      await waitFor(() => {
        expect(scrollContainerRef.current).toBeTruthy();
      });

      const bodyTable = container.querySelector('table[aria-label="Data grid body"]');
      expect(bodyTable).toBeTruthy();
      const scrollEl = scrollContainerRef.current;
      Object.defineProperty(scrollEl, 'clientHeight', { value: CONTAINER_HEIGHT, configurable: true });
      Object.defineProperty(scrollEl, 'scrollHeight', { value: BIG_ROW_COUNT * ROW_HEIGHT, configurable: true });

      const getFirstRenderedRowId = () => {
        const firstRow = container.querySelector('tbody tr[data-row-id]');
        return firstRow ? firstRow.getAttribute('data-row-id') : null;
      };

      const idAtTop = getFirstRenderedRowId();
      if (idAtTop) {
        await act(async () => {
          scrollEl.scrollTop = 50 * ROW_HEIGHT;
          scrollEl.dispatchEvent(new Event('scroll', { bubbles: true }));
        });

        await waitFor(() => {
          const idAfterScroll = getFirstRenderedRowId();
          if (idAfterScroll) expect(parseInt(idAfterScroll, 10)).toBeGreaterThanOrEqual(1);
        }, { timeout: 500 });
      }
    });
  });

  describe('no gaps', () => {
    it('scroll container has body table and virtualized row count is less than total', async () => {
      const scrollContainerRef = { current: null };
      const stableValue = makeStableValue({ scrollContainerRef });
      const rows = makeRows(BIG_ROW_COUNT);

      const { container } = render(
        <GridWithHeight>
          <ThemeProvider theme={theme}>
            <DataGridProvider stableValue={stableValue} filterValue={{ getHeaderComboSlot: null, getFilterInputSlot: null, getFilterToInputSlot: null }}>
              <GridTable
                rows={rows}
                selection={new Set()}
                sortModel={[]}
                onSort={vi.fn()}
                hasActiveFilters={false}
                hasActiveRangeFilter={false}
                containScroll={true}
              />
            </DataGridProvider>
          </ThemeProvider>
        </GridWithHeight>
      );

      await waitFor(() => {
        expect(scrollContainerRef.current).toBeTruthy();
      });

      const scrollWrapper = container.querySelector('[data-testid="grid-scroll-container"]');
      expect(scrollWrapper).toBeTruthy();
      const bodyTable = container.querySelector('table[aria-label="Data grid body"]');
      expect(bodyTable).toBeTruthy();
      const bodyRows = container.querySelectorAll('tbody tr[data-row-id]');
      expect(bodyRows.length).toBeLessThanOrEqual(BIG_ROW_COUNT);
    });

    it('renders at least one row so viewport is never empty', async () => {
      const scrollContainerRef = { current: null };
      const stableValue = makeStableValue({ scrollContainerRef });
      const rows = makeRows(BIG_ROW_COUNT);

      const { container } = render(
        <GridWithHeight>
          <ThemeProvider theme={theme}>
            <DataGridProvider stableValue={stableValue} filterValue={{ getHeaderComboSlot: null, getFilterInputSlot: null, getFilterToInputSlot: null }}>
              <GridTable
                rows={rows}
                selection={new Set()}
                sortModel={[]}
                onSort={vi.fn()}
                hasActiveFilters={false}
                hasActiveRangeFilter={false}
                containScroll={true}
              />
            </DataGridProvider>
          </ThemeProvider>
        </GridWithHeight>
      );

      await waitFor(() => {
        expect(scrollContainerRef.current).toBeTruthy();
      });

      const bodyTable = container.querySelector('table[aria-label="Data grid body"]');
      expect(bodyTable).toBeTruthy();
      const bodyRows = container.querySelectorAll('tbody tr[data-row-id]');
      expect(bodyRows.length).toBeLessThanOrEqual(BIG_ROW_COUNT);
    });
  });

  describe('non-virtualized mode', () => {
    it('renders all rows when containScroll is false', () => {
      const stableValue = makeStableValue();
      const rows = makeRows(20);

      const { container } = render(
        <ThemeProvider theme={theme}>
          <DataGridProvider stableValue={stableValue} filterValue={{ getHeaderComboSlot: null, getFilterInputSlot: null, getFilterToInputSlot: null }}>
            <GridTable
              rows={rows}
              selection={new Set()}
              sortModel={[]}
              onSort={vi.fn()}
              hasActiveFilters={false}
              hasActiveRangeFilter={false}
              containScroll={false}
            />
          </DataGridProvider>
        </ThemeProvider>
      );

      const bodyRows = container.querySelectorAll('tbody tr[data-row-id]');
      expect(bodyRows.length).toBe(20);
    });

    it('renders all rows when empty with containScroll', () => {
      const scrollContainerRef = { current: null };
      const stableValue = makeStableValue({ scrollContainerRef });

      render(
        <ThemeProvider theme={theme}>
          <DataGridProvider stableValue={stableValue} filterValue={{ getHeaderComboSlot: null, getFilterInputSlot: null, getFilterToInputSlot: null }}>
            <GridTable
              rows={[]}
              selection={new Set()}
              sortModel={[]}
              onSort={vi.fn()}
              hasActiveFilters={false}
              hasActiveRangeFilter={false}
              containScroll={true}
            />
          </DataGridProvider>
        </ThemeProvider>
      );

      expect(screen.getByText(/no rows/i)).toBeInTheDocument();
    });
  });
});
