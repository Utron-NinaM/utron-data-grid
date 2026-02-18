import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { DataGrid } from '../../src/DataGrid/DataGrid';
import { getStoredFilterModel, saveFilterModel } from '../../src/filters/filterUtils';
import { FIELD_TYPE_LIST, FIELD_TYPE_TEXT, DIRECTION_LTR, DIRECTION_RTL } from '../../src/config/schema';

describe('List filter persistence by key', () => {
  const listOptionsEn = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' },
  ];
  const listOptionsHe = [
    { value: 'active', label: 'פעיל' },
    { value: 'inactive', label: 'לא פעיל' },
    { value: 'pending', label: 'ממתין' },
  ];

  const columnsEn = [
    { field: 'id', headerName: 'ID', type: 'number' },
    { field: 'name', headerName: 'Name', type: FIELD_TYPE_TEXT, filter: FIELD_TYPE_TEXT },
    {
      field: 'status',
      headerName: 'Status',
      type: FIELD_TYPE_LIST,
      filter: FIELD_TYPE_LIST,
      options: listOptionsEn,
      filterOptions: { listValues: listOptionsEn },
    },
  ];

  const columnsHe = [
    { field: 'id', headerName: 'ID', type: 'number' },
    { field: 'name', headerName: 'Name', type: FIELD_TYPE_TEXT, filter: FIELD_TYPE_TEXT },
    {
      field: 'status',
      headerName: 'סטטוס',
      type: FIELD_TYPE_LIST,
      filter: FIELD_TYPE_LIST,
      options: listOptionsHe,
      filterOptions: { listValues: listOptionsHe },
    },
  ];

  const rows = [
    { id: 1, name: 'Alice', status: 'active' },
    { id: 2, name: 'Bob', status: 'inactive' },
    { id: 3, name: 'Charlie', status: 'pending' },
    { id: 4, name: 'David', status: 'active' },
  ];

  const gridId = 'list-filter-persistence-grid';
  const getRowId = (row) => row.id;

  beforeEach(() => {
    const store = {};
    global.localStorage = {
      getItem: (key) => store[key] ?? null,
      setItem: (key, value) => { store[key] = value; },
      removeItem: (k) => { delete store[k]; },
      clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
      key: (i) => Object.keys(store)[i] ?? null,
      get length() { return Object.keys(store).length; },
    };
  });

  afterEach(() => {
    if (global.localStorage?.clear) global.localStorage.clear();
  });

  it('restores list filter by key and filters rows correctly', () => {
    saveFilterModel(gridId, { status: { value: ['active'] } });

    render(
      <DataGrid
        rows={rows}
        columns={columnsEn}
        getRowId={getRowId}
        options={{ gridId }}
      />
    );

    const restored = getStoredFilterModel(gridId, columnsEn);
    expect(restored.status).toBeDefined();
    expect(restored.status.value).toEqual(['active']);

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('David')).toBeInTheDocument();
    expect(screen.queryByText('Bob')).not.toBeInTheDocument();
    expect(screen.queryByText('Charlie')).not.toBeInTheDocument();
  });

  it('list filter persists by key so switching option labels (e.g. locale) still applies filter', () => {
    saveFilterModel(gridId, { status: { value: ['active', 'pending'] } });

    const { unmount } = render(
      <DataGrid
        rows={rows}
        columns={columnsEn}
        getRowId={getRowId}
        options={{ gridId }}
      />
    );

    let restored = getStoredFilterModel(gridId, columnsEn);
    expect(restored.status.value).toEqual(['active', 'pending']);
    unmount();

    render(
      <DataGrid
        rows={rows}
        columns={columnsHe}
        getRowId={getRowId}
        options={{ gridId }}
      />
    );

    restored = getStoredFilterModel(gridId, columnsHe);
    expect(restored.status.value).toEqual(['active', 'pending']);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
    expect(screen.queryByText('Bob')).not.toBeInTheDocument();
  });

  it('filters list in LTR, switches to RTL: data stays filtered and filter shows correct selected values', async () => {
    saveFilterModel(gridId, { status: { value: ['active'] } });

    const { unmount } = render(
      <DataGrid
        rows={rows}
        columns={columnsEn}
        getRowId={getRowId}
        options={{ gridId }}
        direction={DIRECTION_LTR}
      />
    );

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('David')).toBeInTheDocument();
    expect(screen.queryByText('Bob')).not.toBeInTheDocument();
    expect(screen.queryByText('Charlie')).not.toBeInTheDocument();
    unmount();

    render(
      <DataGrid
        rows={rows}
        columns={columnsEn}
        getRowId={getRowId}
        options={{ gridId }}
        direction={DIRECTION_RTL}
      />
    );

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('David')).toBeInTheDocument();
    expect(screen.queryByText('Bob')).not.toBeInTheDocument();
    expect(screen.queryByText('Charlie')).not.toBeInTheDocument();

    const restored = getStoredFilterModel(gridId, columnsEn);
    expect(restored.status?.value).toEqual(['active']);

    const combobox = screen.getByRole('combobox');
    fireEvent.mouseDown(combobox);
    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Active' })).toBeInTheDocument();
    });
    const activeOption = screen.getByRole('option', { name: 'Active' });
    expect(activeOption).toHaveAttribute('aria-selected', 'true');
  });
});
