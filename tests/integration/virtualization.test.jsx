import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DataGrid } from '../../src/DataGrid/DataGrid';

describe('Virtualization', () => {
  const columns = [
    { field: 'id', headerName: 'ID', type: 'number' },
    { field: 'name', headerName: 'Name', type: 'text' },
    { field: 'age', headerName: 'Age', type: 'number' },
  ];

  const getRowId = (row) => row.id;

  const manyRows = Array.from({ length: 10000 }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    age: 20 + (i % 50),
  }));

  it('renders only a window of rows when virtualization is true and grid has height', () => {
    render(
      <DataGrid
        rows={manyRows}
        columns={columns}
        getRowId={getRowId}
        options={{
          virtualization: true,
          sx: { height: 400 },
          bodyRow: { height: 30 },
        }}
      />
    );

    const container = screen.getByTestId('data-grid-root');
    const dataRows = container.querySelectorAll('tr[data-row-id]');
    // Virtualization + fixed height: only visible window + overscan (e.g. ~15–25) should be in DOM
    expect(dataRows.length).toBeLessThan(50);
    expect(dataRows.length).toBeGreaterThan(0);
    // At least first row is visible
    expect(screen.getByText('User 1')).toBeInTheDocument();
  });

  it('renders all rows when virtualization is false with same height constraint', () => {
    render(
      <DataGrid
        rows={manyRows}
        columns={columns}
        getRowId={getRowId}
        options={{
          virtualization: false,
          sx: { height: 400 },
        }}
      />
    );

    const container = screen.getByTestId('data-grid-root');
    const dataRows = container.querySelectorAll('tr[data-row-id]');
    expect(dataRows.length).toBe(10000);
    expect(screen.getByText('User 1')).toBeInTheDocument();
    expect(screen.getByText('User 10000')).toBeInTheDocument();
  });

  it('renders all rows when virtualization is true but grid has no height constraint', () => {
    render(
      <DataGrid
        rows={manyRows}
        columns={columns}
        getRowId={getRowId}
        options={{
          virtualization: true,
          bodyRow: { height: 30 },
        }}
      />
    );

    // No height → no scroll container → virtualization not active
    const container = screen.getByTestId('data-grid-root');
    const dataRows = container.querySelectorAll('tr[data-row-id]');
    expect(dataRows.length).toBe(10000);
  });

  it('shows empty state when virtualized and rows are empty', () => {
    render(
      <DataGrid
        rows={[]}
        columns={columns}
        getRowId={getRowId}
        options={{
          virtualization: true,
          sx: { height: 400 },
        }}
      />
    );

    expect(screen.getByText(/no rows/i)).toBeInTheDocument();
  });
});
