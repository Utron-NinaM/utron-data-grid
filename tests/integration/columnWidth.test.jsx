import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { DataGrid } from '../../src/DataGrid/DataGrid';
import { FILTER_TYPE_NONE } from '../../src/config/schema';

/**
 * Integration tests for column width rendering.
 * These tests verify that calculated widths are correctly applied to the DOM.
 * Algorithm logic is tested in tests/utils/columnWidthUtils.test.js
 */
describe('Column Width Integration', () => {
  const theme = createTheme();

  it('should apply same width to header and body cells', () => {
    const columns = [
      { field: 'name', headerName: 'Name', width: 150, filter: FILTER_TYPE_NONE },
      { field: 'age', headerName: 'Age', width: 140, filter: FILTER_TYPE_NONE },
    ];
    const rows = [
      { id: 1, name: 'John', age: 30 },
      { id: 2, name: 'Jane', age: 25 },
    ];

    render(
      <ThemeProvider theme={theme}>
        <DataGrid rows={rows} columns={columns} getRowId={(r) => r.id} />
      </ThemeProvider>
    );

    const headerCells = screen.getAllByRole('columnheader');
    const nameHeader = headerCells.find(cell => cell.textContent?.includes('Name'));
    const ageHeader = headerCells.find(cell => cell.textContent?.includes('Age'));

    const bodyCells = screen.getAllByRole('cell');
    const nameBody = bodyCells.find(cell => cell.textContent === 'John');
    const ageBody = bodyCells.find(cell => cell.textContent === '30');

    expect(nameHeader).toBeDefined();
    expect(ageHeader).toBeDefined();
    expect(nameBody).toBeDefined();
    expect(ageBody).toBeDefined();

    const nameHeaderStyles = window.getComputedStyle(nameHeader);
    const nameBodyStyles = window.getComputedStyle(nameBody);
    const ageHeaderStyles = window.getComputedStyle(ageHeader);
    const ageBodyStyles = window.getComputedStyle(ageBody);

    expect(nameHeaderStyles.width).toBe('150px');
    expect(nameBodyStyles.width).toBe('150px');
    expect(ageHeaderStyles.width).toBe('140px');
    expect(ageBodyStyles.width).toBe('140px');
  });

  it('should use table-layout: fixed', () => {
    const columns = [
      { field: 'name', headerName: 'Name', width: 200, filter: FILTER_TYPE_NONE },
    ];
    const rows = [{ id: 1, name: 'Test' }];

    render(
      <ThemeProvider theme={theme}>
        <DataGrid rows={rows} columns={columns} getRowId={(r) => r.id} />
      </ThemeProvider>
    );

    const table = screen.getByRole('table');
    const tableStyles = window.getComputedStyle(table);
    expect(tableStyles.tableLayout).toBe('fixed');
  });

  it('should enable horizontal scroll when total width exceeds container', async () => {
    const columns = [
      { field: 'col1', headerName: 'Col1', width: 600, filter: FILTER_TYPE_NONE },
      { field: 'col2', headerName: 'Col2', width: 600, filter: FILTER_TYPE_NONE },
    ];
    const rows = [{ id: 1, col1: 'A', col2: 'B' }];

    render(
      <ThemeProvider theme={theme}>
        <DataGrid rows={rows} columns={columns} getRowId={(r) => r.id} />
      </ThemeProvider>
    );

    await waitFor(() => {
      const tableContainer = screen.getByRole('table').closest('[class*="MuiTableContainer"]');
      if (tableContainer) {
        const containerStyles = window.getComputedStyle(tableContainer);
        // Should have overflow-x: auto or scroll when content exceeds
        expect(['auto', 'scroll']).toContain(containerStyles.overflowX);
      }
    });
  });
});
