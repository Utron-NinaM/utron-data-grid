import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataGrid } from '../../src/DataGrid/DataGrid';
import { resetRenderCount, getRenderCount, incrementRenderCount } from './renderCount';

vi.mock('../../src/core/GridBodyRow', async () => {
  const actual = await vi.importActual('../../src/core/GridBodyRow');
  const React = await import('react');
  const Wrapper = (props) => {
    incrementRenderCount();
    return React.createElement(actual.GridBodyRow, props);
  };
  return { ...actual, GridBodyRow: Wrapper };
});

const COLUMNS = [
  { field: 'id', headerName: 'ID' },
  { field: 'name', headerName: 'Name' },
  { field: 'value', headerName: 'Value' },
];

function buildRows(n) {
  const rows = [];
  for (let i = 0; i < n; i++) {
    rows.push({ id: i, name: `name-${i}`, value: i });
  }
  return rows;
}

describe('DataGrid re-render efficiency', () => {
  const PAGE_SIZE = 25;
  const ROWS = buildRows(80);

  beforeEach(() => {
    resetRenderCount();
  });

  it('limits body row re-renders on sort to at most 2x visible rows', async () => {
    render(
      <DataGrid
        rows={ROWS}
        columns={COLUMNS}
        getRowId={(r) => r.id}
        options={{
          pagination: true,
          pageSize: PAGE_SIZE,
        }}
      />
    );

    const countAfterMount = getRenderCount();
    expect(countAfterMount).toBeGreaterThan(0);

    const sortButton = screen.getByText('Value');
    fireEvent.click(sortButton);

    const countAfterSort = getRenderCount();
    const extraRenders = countAfterSort - countAfterMount;
    expect(extraRenders).toBeLessThanOrEqual(PAGE_SIZE * 2);
    
    // Verify component still works correctly after re-renders
    // Data should still be displayed
    expect(screen.getByText('name-0')).toBeInTheDocument();
    // Verify sort actually worked - values should be sorted
    const valueCells = screen.getAllByText(/^\d+$/).filter(el => {
      const row = el.closest('[data-row-id]');
      return row !== null;
    });
    if (valueCells.length > 1) {
      const values = valueCells.map(cell => parseInt(cell.textContent, 10));
      for (let i = 1; i < values.length; i++) {
        expect(values[i]).toBeGreaterThanOrEqual(values[i - 1]);
      }
    }
  });

  it('limits body row re-renders on selection change', async () => {
    render(
      <DataGrid
        rows={ROWS}
        columns={COLUMNS}
        getRowId={(r) => r.id}
        options={{
          pagination: true,
          pageSize: PAGE_SIZE,
          multiSelectable: true,
        }}
      />
    );

    const countAfterMount = getRenderCount();
    const checkboxes = screen.getAllByRole('checkbox', { name: /select row/i });
    expect(checkboxes.length).toBeGreaterThanOrEqual(1);
    fireEvent.click(checkboxes[1]);

    const countAfterSelect = getRenderCount();
    const extraRenders = countAfterSelect - countAfterMount;
    expect(extraRenders).toBeLessThanOrEqual(PAGE_SIZE * 2);
    
    // Verify component still works correctly after re-renders
    // Data should still be displayed
    expect(screen.getByText('name-0')).toBeInTheDocument();
    // Selection should still work - checkbox should be checked
    const clickedCheckbox = checkboxes[1];
    expect(clickedCheckbox).toBeChecked();
    // Can still interact - click another checkbox
    if (checkboxes.length > 2) {
      fireEvent.click(checkboxes[2]);
      expect(checkboxes[2]).toBeChecked();
    }
  });
});
