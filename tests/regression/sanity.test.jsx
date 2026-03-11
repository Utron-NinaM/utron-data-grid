import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DataGrid } from '../../src/DataGrid/DataGrid';
import { DIRECTION_RTL } from '../../src/config/schema';

describe('DataGrid sanity / regression smoke', () => {
  const columns = [
    { field: 'id', headerName: 'ID', type: 'number' },
    { field: 'name', headerName: 'Name', type: 'text', filter: 'text' },
    { field: 'age', headerName: 'Age', type: 'number', filter: 'number' },
  ];

  const rows = [
    { id: 1, name: 'Alice', age: 30 },
    { id: 2, name: 'Bob', age: 25 },
    { id: 3, name: 'Charlie', age: 35 },
  ];

  const getRowId = (row) => row.id;

  beforeEach(() => {
    const storage = {};
    const localStorageMock = {
      getItem: vi.fn((key) => storage[key] || null),
      setItem: vi.fn((key, value) => {
        storage[key] = value;
      }),
      removeItem: vi.fn((key) => {
        delete storage[key];
      }),
      clear: vi.fn(() => {
        Object.keys(storage).forEach((k) => delete storage[k]);
      }),
    };
    vi.stubGlobal('localStorage', localStorageMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('Render scenarios', () => {
    it('minimal: renders with only required props and shows headers and first row', () => {
      render(
        <DataGrid rows={rows} columns={columns} getRowId={getRowId} />
      );
      expect(screen.getByText('ID')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Age')).toBeInTheDocument();
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    it('empty rows: renders headers and no body row', () => {
      render(
        <DataGrid rows={[]} columns={columns} getRowId={getRowId} />
      );
      expect(screen.getByText('ID')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Age')).toBeInTheDocument();
      expect(screen.queryByText('Alice')).not.toBeInTheDocument();
    });

    it('pagination on: shows pagination controls and first page rows', () => {
      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{ pagination: true, pageSize: 10, pageSizeOptions: [10, 25, 50] }}
        />
      );
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    it('filters on: shows filter row (Clear all filters or filter inputs)', () => {
      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{ pagination: false }}
        />
      );
      const clearFilters = screen.getByRole('button', { name: /clear all filters/i });
      expect(clearFilters).toBeInTheDocument();
    });

    it('editable: renders grid with editable option and shows data', () => {
      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{ editable: true }}
        />
      );
      expect(screen.getByText('ID')).toBeInTheDocument();
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    it('multiSelectable: shows row selection checkboxes', () => {
      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{ multiSelectable: true }}
        />
      );
      const checkboxes = screen.getAllByRole('checkbox', { name: /select row/i });
      expect(checkboxes.length).toBeGreaterThan(0);
    });

    it('sort + filter + pagination: combines options and shows headers, filter row, pagination, and data', () => {
      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            pagination: true,
            pageSize: 10,
          }}
        />
      );
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /clear all filters/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    it('with gridId: renders and persistence path does not throw', () => {
      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{ gridId: 'sanity-grid', pagination: false }}
        />
      );
      expect(screen.getByText('ID')).toBeInTheDocument();
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    it('RTL: renders with direction rtl', () => {
      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{ direction: DIRECTION_RTL, pagination: false }}
        />
      );
      expect(screen.getByText('ID')).toBeInTheDocument();
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    it('virtualized path: fixed height and many rows uses Virtuoso without throwing', () => {
      const manyRows = Array.from({ length: 150 }, (_, i) => ({
        id: i + 1,
        name: `Row ${i + 1}`,
        age: 20 + (i % 50),
      }));
      render(
        <DataGrid
          rows={manyRows}
          columns={columns}
          getRowId={getRowId}
          options={{
            pagination: false,
            sx: { height: 400 },
          }}
        />
      );
      expect(screen.getByText('ID')).toBeInTheDocument();
      expect(screen.getByTestId('grid-scroll-container')).toBeInTheDocument();
    });
  });

  describe('Short flow', () => {
    it('sort then filter then next page: no errors and data visible', async () => {
      render(
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          options={{
            pagination: true,
            pageSize: 10,
            pageSizeOptions: [10, 25, 50],
          }}
        />
      );

      fireEvent.click(screen.getByText('Name'));
      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument();
      });

      const nameHeader = screen.getByText('Name');
      const headerRow = nameHeader.closest('tr');
      const headerCells = Array.from(headerRow?.querySelectorAll('th') || []);
      const nameColIndex = headerCells.findIndex((c) => c.textContent?.includes('Name'));
      const textboxes = screen.queryAllByRole('textbox');
      const nameFilterInput = textboxes.find((input) => {
        const cell = input.closest('th');
        if (!cell) return false;
        const row = cell.closest('tr');
        const cells = Array.from(row?.querySelectorAll('th') || []);
        return cells.indexOf(cell) === nameColIndex;
      });
      if (nameFilterInput) {
        fireEvent.change(nameFilterInput, { target: { value: 'A' } });
      }

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument();
      });

      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Name')).toBeInTheDocument();
      });
    });
  });
});
