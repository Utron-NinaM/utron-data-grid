import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { DataGrid } from '../../src/DataGrid/DataGrid';
import { FILTER_TYPE_NONE } from '../../src/config/schema';

const theme = createTheme();

const wideColumns = [
  { field: 'a', headerName: 'Col A', width: 500, filter: FILTER_TYPE_NONE },
  { field: 'b', headerName: 'Col B', width: 500, filter: FILTER_TYPE_NONE },
];

const rows = [{ id: 1, a: 'x', b: 'y' }];

/**
 * Scrollable layout: toolbar → header strip → body scroll (Virtuoso). Body scroll box is the
 * third child of [data-testid="grid-scroll-container"] (toolbar, header, body).
 */
function getBodyScrollElement() {
  const root = screen.getByTestId('grid-scroll-container');
  expect(root.children.length).toBeGreaterThanOrEqual(3);
  return root.children[2];
}

function getHeaderScrollElement() {
  const root = screen.getByTestId('grid-scroll-container');
  return root.children[1];
}

describe('Horizontal scroll layout (containScroll)', () => {
  it('places overflow-x on the body scroll box when showHorizontalScrollbar is true', async () => {
    render(
      <ThemeProvider theme={theme}>
        <DataGrid
          rows={rows}
          columns={wideColumns}
          getRowId={(r) => r.id}
          sx={{ width: 280, height: 320 }}
          options={{
            filters: false,
            showHorizontalScrollbar: true,
            pagination: false,
          }}
        />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole('table', { name: 'Data grid body' })).toBeInTheDocument();
    });

    const bodyScroll = getBodyScrollElement();
    const ox = window.getComputedStyle(bodyScroll).overflowX;
    expect(['auto', 'scroll']).toContain(ox);
  });

  it('keeps overflow-x hidden on the body scroll box when showHorizontalScrollbar is false', async () => {
    render(
      <ThemeProvider theme={theme}>
        <DataGrid
          rows={rows}
          columns={wideColumns}
          getRowId={(r) => r.id}
          sx={{ width: 280, height: 320 }}
          options={{
            filters: false,
            showHorizontalScrollbar: false,
            pagination: false,
          }}
        />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole('table', { name: 'Data grid body' })).toBeInTheDocument();
    });

    const bodyScroll = getBodyScrollElement();
    expect(window.getComputedStyle(bodyScroll).overflowX).toBe('hidden');
  });

  it('syncs scrollLeft from body to header when the body scrolls horizontally', async () => {
    render(
      <ThemeProvider theme={theme}>
        <DataGrid
          rows={rows}
          columns={wideColumns}
          getRowId={(r) => r.id}
          sx={{ width: 280, height: 320 }}
          options={{
            filters: false,
            showHorizontalScrollbar: true,
            pagination: false,
          }}
        />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole('table', { name: 'Data grid body' })).toBeInTheDocument();
    });

    const headerScroll = getHeaderScrollElement();
    const bodyScroll = getBodyScrollElement();

    bodyScroll.scrollLeft = 100;
    fireEvent.scroll(bodyScroll);

    expect(headerScroll.scrollLeft).toBe(100);
  });

  it('syncs scrollLeft from header to body when the header strip scrolls horizontally', async () => {
    render(
      <ThemeProvider theme={theme}>
        <DataGrid
          rows={rows}
          columns={wideColumns}
          getRowId={(r) => r.id}
          sx={{ width: 280, height: 320 }}
          options={{
            filters: false,
            showHorizontalScrollbar: true,
            pagination: false,
          }}
        />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole('table', { name: 'Data grid body' })).toBeInTheDocument();
    });

    const headerScroll = getHeaderScrollElement();
    const bodyScroll = getBodyScrollElement();

    headerScroll.scrollLeft = 88;
    fireEvent.scroll(headerScroll);

    expect(bodyScroll.scrollLeft).toBe(88);
  });

  it('keeps body overflow-x auto with showHorizontalScrollbar when pagination is enabled', async () => {
    render(
      <ThemeProvider theme={theme}>
        <DataGrid
          rows={rows}
          columns={wideColumns}
          getRowId={(r) => r.id}
          sx={{ width: 280, height: 320 }}
          options={{
            filters: false,
            showHorizontalScrollbar: true,
            pagination: true,
            pageSize: 10,
          }}
        />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole('table', { name: 'Data grid body' })).toBeInTheDocument();
    });

    const bodyScroll = getBodyScrollElement();
    const ox = window.getComputedStyle(bodyScroll).overflowX;
    expect(['auto', 'scroll']).toContain(ox);
  });
});
