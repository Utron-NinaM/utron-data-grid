import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { GridTableBodyVirtuoso } from '../../src/core/GridTableBodyVirtuoso';
import { DataGridStableContext } from '../../src/DataGrid/DataGridContext';
import { createEditStore } from '../../src/DataGrid/editStore';
import { DIRECTION_LTR } from '../../src/config/schema';

describe('GridTableBodyVirtuoso', () => {
  const theme = createTheme();
  const columns = [
    { field: 'id', headerName: 'ID', type: 'number' },
    { field: 'name', headerName: 'Name', type: 'text' },
  ];
  const rows = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
  ];
  const getRowId = (row) => row.id;

  const defaultProps = {
    tableId: 'test-table',
    rows,
    columns,
    getRowId,
    rowHeight: 40,
    multiSelectable: false,
    selection: new Set(),
    mergedRowStylesMap: new Map(),
    rowStylesMap: new Map(),
    selectedRowStyle: {},
    disableRowHover: false,
    onSelectRow: vi.fn(),
    getEditor: null,
    direction: DIRECTION_LTR,
    onClick: vi.fn(),
    onDoubleClick: vi.fn(),
    enableHorizontalScroll: false,
    totalWidth: 200,
    bodyColRefs: { current: new Map() },
  };

  const renderWithContext = (props = {}, contextOverrides = {}) => {
    const contextValue = {
      editStore: createEditStore(),
      ...contextOverrides,
    };
    return render(
      <ThemeProvider theme={theme}>
        <DataGridStableContext.Provider value={contextValue}>
          <GridTableBodyVirtuoso {...defaultProps} {...props} />
        </DataGridStableContext.Provider>
      </ThemeProvider>
    );
  };

  describe('when scroll is not ready', () => {
    it('returns null when scrollContainerReady is false', () => {
      const scrollRef = { current: document.createElement('div') };
      const { container } = renderWithContext({
        scrollContainerRef: scrollRef,
        scrollContainerReady: false,
      });
      expect(container.firstChild).toBeNull();
    });

    it('returns null when scrollContainerRef.current is null', () => {
      const { container } = renderWithContext({
        scrollContainerRef: { current: null },
        scrollContainerReady: true,
      });
      expect(container.firstChild).toBeNull();
    });
  });

  describe('when scroll is ready', () => {
    /** Mount scroll container in DOM with height so Virtuoso can measure and render rows */
    function renderWithScrollContainer(props = {}) {
      const scrollEl = document.createElement('div');
      scrollEl.style.height = '300px';
      scrollEl.style.overflow = 'auto';
      document.body.appendChild(scrollEl);
      const scrollRef = { current: scrollEl };
      const result = renderWithContext({
        scrollContainerRef: scrollRef,
        scrollContainerReady: true,
        ...props,
      });
      result.scrollEl = scrollEl;
      return result;
    }

    function cleanupScroll(scrollEl, unmount) {
      if (unmount) unmount();
      if (scrollEl?.parentNode) scrollEl.parentNode.removeChild(scrollEl);
    }

    it('renders body table with correct aria-label', async () => {
      const scrollEl = document.createElement('div');
      scrollEl.style.height = '300px';
      document.body.appendChild(scrollEl);
      const scrollRef = { current: scrollEl };

      const { unmount } = renderWithContext({
        scrollContainerRef: scrollRef,
        scrollContainerReady: true,
      });

      await waitFor(() => {
        const table = document.querySelector('table[aria-label="Data grid body"]');
        expect(table).toBeInTheDocument();
      });
      unmount();
      document.body.removeChild(scrollEl);
    });

    it('body table structure is present; when rows render they have valid data-row-id', async () => {
      const { container, scrollEl, unmount } = renderWithScrollContainer();

      await waitFor(() => {
        const table = document.querySelector('table[aria-label="Data grid body"]');
        expect(table).toBeInTheDocument();
        const tbody = table?.querySelector('tbody');
        expect(tbody).toBeInTheDocument();
      });

      const bodyRows = container.querySelectorAll('tbody tr[data-row-id]');
      bodyRows.forEach((tr) => {
        const rowId = tr.getAttribute('data-row-id');
        expect(rowId).toBeDefined();
        expect(rowId).not.toBe('undefined');
      });
      cleanupScroll(scrollEl, unmount);
    });

    it('TableRow receives valid props (data-row-id set, no throw)', async () => {
      const { container, scrollEl, unmount } = renderWithScrollContainer();

      await waitFor(() => {
        const table = document.querySelector('table[aria-label="Data grid body"]');
        expect(table).toBeInTheDocument();
      });

      const firstRow = container.querySelector('tbody tr[data-row-id]');
      if (firstRow) {
        expect(firstRow.tagName).toBe('TR');
        expect(firstRow.getAttribute('data-row-id')).toBeTruthy();
      }
      cleanupScroll(scrollEl, unmount);
    });

    it('renders without throw when optional props are undefined', async () => {
      const scrollEl = document.createElement('div');
      scrollEl.style.height = '300px';
      document.body.appendChild(scrollEl);
      const scrollRef = { current: scrollEl };

      const { unmount } = renderWithContext({
        scrollContainerRef: scrollRef,
        scrollContainerReady: true,
        onClick: undefined,
        onDoubleClick: undefined,
        onSelectRow: undefined,
        getEditor: undefined,
      });

      await waitFor(() => {
        const table = document.querySelector('table[aria-label="Data grid body"]');
        expect(table).toBeInTheDocument();
      });
      cleanupScroll(scrollEl, unmount);
    });
  });
});
