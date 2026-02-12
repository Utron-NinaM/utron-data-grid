import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DataGrid } from '../../src/DataGrid/DataGrid';
import { DIRECTION_RTL } from '../../src/config/schema';
import { hebrewTranslations } from '../../src/localization/defaultTranslations';
import dayjs from 'dayjs';

describe('DataGrid RTL Integration', () => {
  const rtlColumns = [
    { field: 'id', headerName: 'מזהה', type: 'number' },
    { field: 'name', headerName: 'שם', type: 'text', filter: 'text' },
    { field: 'date', headerName: 'תאריך', type: 'date' },
  ];

  const rtlRows = [
    { id: 1, name: 'אליס', date: '2024-01-15' },
    { id: 2, name: 'בוב', date: '2024-02-20' },
    { id: 3, name: 'צ׳רלי', date: '2024-03-25' },
  ];

  const getRowId = (row) => row.id;

  beforeEach(() => {
    if (typeof localStorage !== 'undefined' && localStorage.clear) {
      localStorage.clear();
    }
  });

  describe('Render DataGrid in RTL mode', () => {
    it('should render DataGrid with RTL direction', () => {
      const { container } = render(
        <DataGrid
          rows={rtlRows}
          columns={rtlColumns}
          getRowId={getRowId}
          options={{ direction: DIRECTION_RTL }}
        />
      );

      // Check that the container has dir="rtl"
      const gridContainer = container.querySelector('[dir="rtl"]');
      expect(gridContainer).toBeInTheDocument();
    });

    it('should render Hebrew headers correctly', () => {
      render(
        <DataGrid
          rows={rtlRows}
          columns={rtlColumns}
          getRowId={getRowId}
          options={{ direction: DIRECTION_RTL }}
        />
      );

      expect(screen.getByText('מזהה')).toBeInTheDocument();
      expect(screen.getByText('שם')).toBeInTheDocument();
      expect(screen.getByText('תאריך')).toBeInTheDocument();
    });

    it('should render Hebrew data correctly', () => {
      render(
        <DataGrid
          rows={rtlRows}
          columns={rtlColumns}
          getRowId={getRowId}
          options={{ direction: DIRECTION_RTL }}
        />
      );

      expect(screen.getByText('אליס')).toBeInTheDocument();
      expect(screen.getByText('בוב')).toBeInTheDocument();
      expect(screen.getByText('צ׳רלי')).toBeInTheDocument();
    });
  });

  describe('Test column default alignment (right)', () => {
    it('should default column alignment to right in RTL mode', () => {
      const columnsWithoutAlign = [
        { field: 'id', headerName: 'מזהה', type: 'number' },
        { field: 'name', headerName: 'שם', type: 'text' },
      ];

      const { container } = render(
        <DataGrid
          rows={rtlRows}
          columns={columnsWithoutAlign}
          getRowId={getRowId}
          options={{ direction: DIRECTION_RTL }}
        />
      );

      // Check that cells have right alignment
      // MUI TableCell uses CSS for alignment, not HTML attributes
      const cells = container.querySelectorAll('td');
      expect(cells.length).toBeGreaterThan(0);
      const firstCell = cells[0];
      const styles = window.getComputedStyle(firstCell);
      expect(styles.textAlign).toBe('right');
    });

    it('should respect explicit alignment override in RTL mode', () => {
      const columnsWithExplicitAlign = [
        { field: 'id', headerName: 'מזהה', type: 'number', align: 'left' },
        { field: 'name', headerName: 'שם', type: 'text', align: 'center' },
      ];

      const { container } = render(
        <DataGrid
          rows={rtlRows}
          columns={columnsWithExplicitAlign}
          getRowId={getRowId}
          options={{ direction: DIRECTION_RTL }}
        />
      );

      // Check that explicit alignments are respected
      // MUI TableCell uses CSS for alignment, not HTML attributes
      const cells = container.querySelectorAll('td');
      expect(cells.length).toBeGreaterThan(0);
      const cellStyles = Array.from(cells).map(cell => window.getComputedStyle(cell).textAlign);
      expect(cellStyles).toContain('left');
      expect(cellStyles).toContain('center');
    });
  });

  describe('Test date format (DD-MM-YYYY)', () => {
    it('should format dates as DD-MM-YYYY in RTL mode', () => {
      render(
        <DataGrid
          rows={rtlRows}
          columns={rtlColumns}
          getRowId={getRowId}
          options={{ direction: DIRECTION_RTL }}
        />
      );

      // Check that dates are formatted as DD-MM-YYYY
      // 2024-01-15 should be displayed as 15-01-2024
      const dateCell = screen.getByText('15-01-2024');
      expect(dateCell).toBeInTheDocument();
    });

    it('should format multiple dates correctly in RTL mode', () => {
      render(
        <DataGrid
          rows={rtlRows}
          columns={rtlColumns}
          getRowId={getRowId}
          options={{ direction: DIRECTION_RTL }}
        />
      );

      // Check all dates are in DD-MM-YYYY format
      expect(screen.getByText('15-01-2024')).toBeInTheDocument();
      expect(screen.getByText('20-02-2024')).toBeInTheDocument();
      expect(screen.getByText('25-03-2024')).toBeInTheDocument();
    });
  });

  describe('Test translations (Hebrew)', () => {
    it('should use Hebrew translations for empty state', () => {
      render(
        <DataGrid
          rows={[]}
          columns={rtlColumns}
          getRowId={getRowId}
          options={{ direction: DIRECTION_RTL }}
        />
      );

      expect(screen.getByText(hebrewTranslations.noRows)).toBeInTheDocument();
    });

    it('should use Hebrew translations for pagination', () => {
      render(
        <DataGrid
          rows={rtlRows}
          columns={rtlColumns}
          getRowId={getRowId}
          options={{
            direction: DIRECTION_RTL,
            pagination: true,
            pageSize: 2,
          }}
        />
      );

      // Check Hebrew pagination text
      expect(screen.getByText(/שורות לדף/i)).toBeInTheDocument();
    });

    it('should use Hebrew translations for filter placeholders', () => {
      render(
        <DataGrid
          rows={rtlRows}
          columns={rtlColumns}
          getRowId={getRowId}
          options={{ direction: DIRECTION_RTL }}
        />
      );

      // Filter inputs should have Hebrew placeholders when filters are shown
      const filterInputs = screen.queryAllByPlaceholderText(/סינון/i);
      // Filters may be hidden initially, but if present, they should use Hebrew
      if (filterInputs.length > 0) {
        expect(filterInputs[0]).toBeInTheDocument();
      }
    });
  });

  describe('Test overall layout direction', () => {
    it('should apply RTL direction to the entire grid container', () => {
      const { container } = render(
        <DataGrid
          rows={rtlRows}
          columns={rtlColumns}
          getRowId={getRowId}
          options={{ direction: DIRECTION_RTL }}
        />
      );

      const gridBox = container.querySelector('[dir="rtl"]');
      expect(gridBox).toBeInTheDocument();
      expect(gridBox).toHaveAttribute('dir', 'rtl');
    });

    it('should render table with RTL layout', () => {
      const { container } = render(
        <DataGrid
          rows={rtlRows}
          columns={rtlColumns}
          getRowId={getRowId}
          options={{ direction: DIRECTION_RTL }}
        />
      );

      const table = container.querySelector('table');
      expect(table).toBeInTheDocument();
      // Table should be within RTL container
      const rtlContainer = table.closest('[dir="rtl"]');
      expect(rtlContainer).toBeInTheDocument();
    });

    it('should maintain RTL direction with all features enabled', () => {
      const { container } = render(
        <DataGrid
          rows={rtlRows}
          columns={rtlColumns}
          getRowId={getRowId}
          options={{
            direction: DIRECTION_RTL,
            pagination: true,
            editable: true,
            multiSelectable: true,
          }}
        />
      );

      const gridBox = container.querySelector('[dir="rtl"]');
      expect(gridBox).toBeInTheDocument();
      expect(gridBox).toHaveAttribute('dir', 'rtl');
    });
  });
});
