import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { DataGrid } from '../../src/DataGrid/DataGrid';
import { FILTER_TYPE_NONE } from '../../src/config/schema';

describe('Column Width Integration', () => {
  const theme = createTheme();

  describe('Header and body cell width matching', () => {
    it('should apply same width to header and body cells for numeric width', () => {
      const columns = [
        { field: 'name', headerName: 'Name', width: 150, filter: FILTER_TYPE_NONE },
        { field: 'age', headerName: 'Age', width: 100, filter: FILTER_TYPE_NONE },
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

      // Get header cells
      const headerCells = screen.getAllByRole('columnheader');
      const nameHeader = headerCells.find(cell => cell.textContent?.includes('Name'));
      const ageHeader = headerCells.find(cell => cell.textContent?.includes('Age'));

      // Get body cells from first row
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

      // Age column with width 100 is >= 85px, so it's applied as-is
      expect(ageHeaderStyles.width).toBe('100px');
      expect(ageBodyStyles.width).toBe('100px');
    });

    it('should apply same width to header and body cells for percentage width', () => {
      const columns = [
        { field: 'name', headerName: 'Name', width: '30%' },
        { field: 'age', headerName: 'Age', width: '20%' },
      ];
      const rows = [
        { id: 1, name: 'John', age: 30 },
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

      const nameHeaderStyles = window.getComputedStyle(nameHeader);
      const nameBodyStyles = window.getComputedStyle(nameBody);
      const ageHeaderStyles = window.getComputedStyle(ageHeader);
      const ageBodyStyles = window.getComputedStyle(ageBody);

      expect(nameHeaderStyles.width).toBe('30%');
      expect(nameBodyStyles.width).toBe('30%');

      expect(ageHeaderStyles.width).toBe('20%');
      expect(ageBodyStyles.width).toBe('20%');
    });
  });

  describe('Mixed width types', () => {
    it('should handle mix of numeric and percentage widths', () => {
      const columns = [
        { field: 'id', headerName: 'ID', width: 80, filter: FILTER_TYPE_NONE },
        { field: 'name', headerName: 'Name', width: '40%' },
        { field: 'price', headerName: 'Price', width: 120 },
        { field: 'discount', headerName: 'Discount', width: '15%' },
      ];
      const rows = [
        { id: 1, name: 'Item 1', price: 100, discount: 10 },
      ];

      render(
        <ThemeProvider theme={theme}>
          <DataGrid rows={rows} columns={columns} getRowId={(r) => r.id} />
        </ThemeProvider>
      );

      const headerCells = screen.getAllByRole('columnheader');
      const idHeader = headerCells.find(cell => cell.textContent?.includes('ID'));
      const nameHeader = headerCells.find(cell => cell.textContent?.includes('Name'));
      const priceHeader = headerCells.find(cell => cell.textContent?.includes('Price'));
      const discountHeader = headerCells.find(cell => cell.textContent?.includes('Discount'));

      // ID column with width 80 should be enforced to minimum 85px (no combo)
      expect(window.getComputedStyle(idHeader).width).toBe('85px');
      expect(window.getComputedStyle(nameHeader).width).toBe('40%');
      // Price column with width 120 is >= 85px, so it's applied as-is
      expect(window.getComputedStyle(priceHeader).width).toBe('120px');
      expect(window.getComputedStyle(discountHeader).width).toBe('15%');
    });

    it('should enforce minimum width of 120px when width is too small and column has filter combo', () => {
      const columns = [
        { field: 'id', headerName: 'ID', width: 50, filter: 'number' },
        { field: 'name', headerName: 'Name', width: 100, filter: 'text' },
      ];
      const rows = [
        { id: 1, name: 'Item 1' },
      ];

      render(
        <ThemeProvider theme={theme}>
          <DataGrid rows={rows} columns={columns} getRowId={(r) => r.id} />
        </ThemeProvider>
      );

      const headerCells = screen.getAllByRole('columnheader');
      const idHeader = headerCells.find(cell => cell.textContent?.includes('ID'));
      const nameHeader = headerCells.find(cell => cell.textContent?.includes('Name'));

      // ID column with width 50 should be enforced to minimum 120px (with combo)
      expect(window.getComputedStyle(idHeader).width).toBe('120px');
      // Name column with width 100 should be enforced to minimum 120px (with combo)
      expect(window.getComputedStyle(nameHeader).width).toBe('120px');
    });
  });

  describe('Columns without width', () => {
    it('should handle columns with and without width in same grid', () => {
      const columns = [
        { field: 'id', headerName: 'ID', width: 100, filter: FILTER_TYPE_NONE },
        { field: 'name', headerName: 'Name', filter: FILTER_TYPE_NONE },
        { field: 'age', headerName: 'Age', width: 80, filter: FILTER_TYPE_NONE },
      ];
      const rows = [
        { id: 1, name: 'John', age: 30 },
      ];

      render(
        <ThemeProvider theme={theme}>
          <DataGrid rows={rows} columns={columns} getRowId={(r) => r.id} />
        </ThemeProvider>
      );

      const headerCells = screen.getAllByRole('columnheader');
      const idHeader = headerCells.find(cell => cell.textContent?.includes('ID'));
      const nameHeader = headerCells.find(cell => cell.textContent?.includes('Name'));
      const ageHeader = headerCells.find(cell => cell.textContent?.includes('Age'));
      
      expect(window.getComputedStyle(idHeader).width).toBe('100px');
      expect(window.getComputedStyle(ageHeader).width).toBe('85px');
      const nameHeaderStyles = window.getComputedStyle(nameHeader);
      expect(nameHeaderStyles.width).toBeTruthy();
    });
  });

  describe('Table layout fixed behavior', () => {
    it('should work with tableLayout fixed', () => {
      const columns = [
        { field: 'name', headerName: 'Name', width: 200 },
        { field: 'description', headerName: 'Description', width: '50%' },
      ];
      const rows = [
        { id: 1, name: 'Test', description: 'Long description text' },
      ];

      render(
        <ThemeProvider theme={theme}>
          <DataGrid rows={rows} columns={columns} getRowId={(r) => r.id} />
        </ThemeProvider>
      );

      // Table should have table-layout: fixed
      const table = screen.getByRole('table');
      const tableStyles = window.getComputedStyle(table);
      expect(tableStyles.tableLayout).toBe('fixed');

      // Cells should have their specified widths
      const headerCells = screen.getAllByRole('columnheader');
      const nameHeader = headerCells.find(cell => cell.textContent?.includes('Name'));
      const descHeader = headerCells.find(cell => cell.textContent?.includes('Description'));

      expect(window.getComputedStyle(nameHeader).width).toBe('200px');
      expect(window.getComputedStyle(descHeader).width).toBe('50%');
    });
  });

  describe('Edge cases', () => {
    it('should handle width greater than 100%', () => {
      const columns = [
        { field: 'name', headerName: 'Name', width: '150%' },
      ];
      const rows = [{ id: 1, name: 'Test' }];

      render(
        <ThemeProvider theme={theme}>
          <DataGrid rows={rows} columns={columns} getRowId={(r) => r.id} />
        </ThemeProvider>
      );

      const headerCells = screen.getAllByRole('columnheader');
      const nameHeader = headerCells.find(cell => cell.textContent?.includes('Name'));
      expect(window.getComputedStyle(nameHeader).width).toBe('150%');
    });

    it('should handle very large numeric widths', () => {
      const columns = [
        { field: 'name', headerName: 'Name', width: 10000, filter: FILTER_TYPE_NONE },
      ];
      const rows = [{ id: 1, name: 'Test' }];

      render(
        <ThemeProvider theme={theme}>
          <DataGrid rows={rows} columns={columns} getRowId={(r) => r.id} />
        </ThemeProvider>
      );

      const headerCells = screen.getAllByRole('columnheader');
      const nameHeader = headerCells.find(cell => cell.textContent?.includes('Name'));
      expect(window.getComputedStyle(nameHeader).width).toBe('10000px');
    });

    it('should handle mixed width types causing layout constraints', () => {
      const columns = [
        { field: 'id', headerName: 'ID', width: 50, filter: FILTER_TYPE_NONE },
        { field: 'name', headerName: 'Name', width: '100%' },
        { field: 'age', headerName: 'Age', width: 200, filter: FILTER_TYPE_NONE },
      ];
      const rows = [{ id: 1, name: 'Test', age: 30 }];

      render(
        <ThemeProvider theme={theme}>
          <DataGrid rows={rows} columns={columns} getRowId={(r) => r.id} />
        </ThemeProvider>
      );

      const headerCells = screen.getAllByRole('columnheader');
      const idHeader = headerCells.find(cell => cell.textContent?.includes('ID'));
      const nameHeader = headerCells.find(cell => cell.textContent?.includes('Name'));
      const ageHeader = headerCells.find(cell => cell.textContent?.includes('Age'));

      // ID should be enforced to 85px minimum
      expect(window.getComputedStyle(idHeader).width).toBe('85px');
      expect(window.getComputedStyle(nameHeader).width).toBe('100%');
      expect(window.getComputedStyle(ageHeader).width).toBe('200px');
    });
  });
});
