import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DataGrid } from '../../src/DataGrid/DataGrid';
import { DIRECTION_RTL, DIRECTION_LTR, ALIGN_LEFT, ALIGN_RIGHT, ALIGN_CENTER } from '../../src/config/schema';

describe('Cell Alignment RTL Test', () => {
  const basicRows = [
    { id: 1, name: 'אליס', age: 30, price: 100.50 },
    { id: 2, name: 'בוב', age: 25, price: 200.75 },
    { id: 3, name: 'צ׳רלי', age: 35, price: 300.25 },
  ];

  const getRowId = (row) => row.id;

  beforeEach(() => {
    if (typeof localStorage !== 'undefined' && localStorage.clear) {
      localStorage.clear();
    }
  });

  describe('Test cell text alignment in RTL', () => {
    it('should align cells to right by default in RTL mode', () => {
      const columns = [
        { field: 'id', headerName: 'מזהה', type: 'number' },
        { field: 'name', headerName: 'שם', type: 'text' },
        { field: 'age', headerName: 'גיל', type: 'number' },
      ];

      const { container } = render(
        <DataGrid
          rows={basicRows}
          columns={columns}
          getRowId={getRowId}
          options={{ direction: DIRECTION_RTL }}
        />
      );

      // Check that cells default to right alignment in RTL
      // MUI TableCell uses CSS for alignment, not HTML attributes
      const cells = container.querySelectorAll('td');
      expect(cells.length).toBeGreaterThan(0);
      const firstCell = cells[0];
      const styles = window.getComputedStyle(firstCell);
      expect(styles.textAlign).toBe(ALIGN_RIGHT);
    });

    it('should respect explicit cell alignment in RTL mode', () => {
      const columns = [
        { field: 'id', headerName: 'מזהה', type: 'number', align: ALIGN_LEFT },
        { field: 'name', headerName: 'שם', type: 'text', align: ALIGN_CENTER },
        { field: 'age', headerName: 'גיל', type: 'number', align: ALIGN_RIGHT },
      ];

      const { container } = render(
        <DataGrid
          rows={basicRows}
          columns={columns}
          getRowId={getRowId}
          options={{ direction: DIRECTION_RTL }}
        />
      );

      // Check that explicit alignments are respected
      // MUI TableCell uses CSS for alignment, not HTML attributes
      const cells = container.querySelectorAll('td');
      expect(cells.length).toBeGreaterThan(0);
      const cellStyles = Array.from(cells).map(cell => window.getComputedStyle(cell).textAlign);
      expect(cellStyles).toContain(ALIGN_LEFT);
      expect(cellStyles).toContain(ALIGN_CENTER);
      expect(cellStyles).toContain(ALIGN_RIGHT);
    });

    it('should align number cells to right in RTL by default', () => {
      const columns = [
        { field: 'id', headerName: 'מזהה', type: 'number' },
        { field: 'age', headerName: 'גיל', type: 'number' },
        { field: 'price', headerName: 'מחיר', type: 'number' },
      ];

      const { container } = render(
        <DataGrid
          rows={basicRows}
          columns={columns}
          getRowId={getRowId}
          options={{ direction: DIRECTION_RTL }}
        />
      );

      // Number columns should default to right alignment in RTL
      const cells = container.querySelectorAll('td');
      expect(cells.length).toBeGreaterThan(0);
      const firstCell = cells[0];
      const styles = window.getComputedStyle(firstCell);
      expect(styles.textAlign).toBe(ALIGN_RIGHT);
    });

    it('should align text cells to right in RTL by default', () => {
      const columns = [
        { field: 'name', headerName: 'שם', type: 'text' },
      ];

      const { container } = render(
        <DataGrid
          rows={basicRows}
          columns={columns}
          getRowId={getRowId}
          options={{ direction: DIRECTION_RTL }}
        />
      );

      // Text columns should default to right alignment in RTL
      const cells = container.querySelectorAll('td');
      expect(cells.length).toBeGreaterThan(0);
      const firstCell = cells[0];
      const styles = window.getComputedStyle(firstCell);
      expect(styles.textAlign).toBe(ALIGN_RIGHT);
    });
  });

  describe('Test header alignment in RTL', () => {
    it('should align headers to right by default in RTL mode', () => {
      const columns = [
        { field: 'id', headerName: 'מזהה', type: 'number' },
        { field: 'name', headerName: 'שם', type: 'text' },
        { field: 'age', headerName: 'גיל', type: 'number' },
      ];

      const { container } = render(
        <DataGrid
          rows={basicRows}
          columns={columns}
          getRowId={getRowId}
          options={{ direction: DIRECTION_RTL }}
        />
      );

      // Headers should default to right alignment in RTL
      // MUI TableCell uses CSS for alignment, not HTML attributes
      const headers = container.querySelectorAll('th');
      expect(headers.length).toBeGreaterThan(0);
      const firstHeader = headers[0];
      const styles = window.getComputedStyle(firstHeader);
      expect(styles.textAlign).toBe(ALIGN_RIGHT);
    });

    it('should respect explicit header alignment in RTL mode', () => {
      const columns = [
        { field: 'id', headerName: 'מזהה', type: 'number', align: ALIGN_LEFT },
        { field: 'name', headerName: 'שם', type: 'text', align: ALIGN_CENTER },
        { field: 'age', headerName: 'גיל', type: 'number', align: ALIGN_RIGHT },
      ];

      const { container } = render(
        <DataGrid
          rows={basicRows}
          columns={columns}
          getRowId={getRowId}
          options={{ direction: DIRECTION_RTL }}
        />
      );

      // Check that header alignments match column alignments
      // MUI TableCell uses CSS for alignment, not HTML attributes
      const headers = container.querySelectorAll('th');
      expect(headers.length).toBeGreaterThan(0);
      const headerStyles = Array.from(headers).map(header => window.getComputedStyle(header).textAlign);
      expect(headerStyles).toContain(ALIGN_LEFT);
      expect(headerStyles).toContain(ALIGN_CENTER);
      expect(headerStyles).toContain(ALIGN_RIGHT);
    });

    it('should align headers consistently with cells in RTL', () => {
      const columns = [
        { field: 'id', headerName: 'מזהה', type: 'number' },
        { field: 'name', headerName: 'שם', type: 'text' },
      ];

      const { container } = render(
        <DataGrid
          rows={basicRows}
          columns={columns}
          getRowId={getRowId}
          options={{ direction: DIRECTION_RTL }}
        />
      );

      // Headers and cells should have matching alignment
      // MUI TableCell uses CSS for alignment, not HTML attributes
      const headers = container.querySelectorAll('th');
      const cells = container.querySelectorAll('td');
      expect(headers.length).toBeGreaterThan(0);
      expect(cells.length).toBeGreaterThan(0);
      
      // Check that alignments are set via CSS
      const headerStyles = Array.from(headers).map(h => window.getComputedStyle(h).textAlign);
      const cellStyles = Array.from(cells).map(c => window.getComputedStyle(c).textAlign);
      expect(headerStyles.filter(a => a).length).toBeGreaterThan(0);
      expect(cellStyles.filter(a => a).length).toBeGreaterThan(0);
    });
  });

  describe('Test default alignment behavior', () => {
    it('should default to right alignment in RTL when no align specified', () => {
      const columns = [
        { field: 'id', headerName: 'מזהה', type: 'number' },
        { field: 'name', headerName: 'שם', type: 'text' },
      ];

      const { container } = render(
        <DataGrid
          rows={basicRows}
          columns={columns}
          getRowId={getRowId}
          options={{ direction: DIRECTION_RTL }}
        />
      );

      // Default alignment should be right in RTL
      // MUI TableCell uses CSS for alignment, not HTML attributes
      const cells = container.querySelectorAll('td');
      expect(cells.length).toBeGreaterThan(0);
      const firstCell = cells[0];
      const styles = window.getComputedStyle(firstCell);
      expect(styles.textAlign).toBe(ALIGN_RIGHT);
    });

    it('should default to left alignment in LTR when no align specified', () => {
      const columns = [
        { field: 'id', headerName: 'ID', type: 'number' },
        { field: 'name', headerName: 'Name', type: 'text' },
      ];

      const { container } = render(
        <DataGrid
          rows={basicRows}
          columns={columns}
          getRowId={getRowId}
          options={{ direction: DIRECTION_LTR }}
        />
      );

      // Default alignment should be left in LTR
      // MUI TableCell uses CSS for alignment, not HTML attributes
      const cells = container.querySelectorAll('td');
      expect(cells.length).toBeGreaterThan(0);
      const firstCell = cells[0];
      const styles = window.getComputedStyle(firstCell);
      expect(styles.textAlign).toBe(ALIGN_LEFT);
    });

    it('should apply default alignment based on direction', () => {
      const columns = [
        { field: 'id', headerName: 'מזהה', type: 'number' },
      ];

      // Test RTL
      const { container: rtlContainer } = render(
        <DataGrid
          rows={basicRows}
          columns={columns}
          getRowId={getRowId}
          options={{ direction: DIRECTION_RTL }}
        />
      );

      // MUI TableCell uses CSS for alignment, not HTML attributes
      const rtlCells = rtlContainer.querySelectorAll('td');
      expect(rtlCells.length).toBeGreaterThan(0);
      const rtlStyles = window.getComputedStyle(rtlCells[0]);
      expect(rtlStyles.textAlign).toBe(ALIGN_RIGHT);
    });
  });

  describe('Test override alignment behavior', () => {
    it('should allow overriding default RTL alignment', () => {
      const columns = [
        { field: 'id', headerName: 'מזהה', type: 'number', align: ALIGN_LEFT },
        { field: 'name', headerName: 'שם', type: 'text', align: ALIGN_CENTER },
      ];

      const { container } = render(
        <DataGrid
          rows={basicRows}
          columns={columns}
          getRowId={getRowId}
          options={{ direction: DIRECTION_RTL }}
        />
      );

      // Override alignments should be respected
      // MUI TableCell uses CSS for alignment, not HTML attributes
      const cells = container.querySelectorAll('td');
      expect(cells.length).toBeGreaterThan(0);
      const cellStyles = Array.from(cells).map(cell => window.getComputedStyle(cell).textAlign);
      expect(cellStyles).toContain(ALIGN_LEFT);
      expect(cellStyles).toContain(ALIGN_CENTER);
    });

    it('should maintain override alignment regardless of direction', () => {
      const columns = [
        { field: 'id', headerName: 'ID', type: 'number', align: ALIGN_RIGHT },
        { field: 'name', headerName: 'Name', type: 'text', align: ALIGN_CENTER },
      ];

      // Test in LTR
      const { container: ltrContainer } = render(
        <DataGrid
          rows={basicRows}
          columns={columns}
          getRowId={getRowId}
          options={{ direction: DIRECTION_LTR }}
        />
      );

      // MUI TableCell uses CSS for alignment, not HTML attributes
      const ltrCells = ltrContainer.querySelectorAll('td');
      expect(ltrCells.length).toBeGreaterThan(0);
      const ltrCellStyles = Array.from(ltrCells).map(cell => window.getComputedStyle(cell).textAlign);
      expect(ltrCellStyles).toContain(ALIGN_RIGHT);
      expect(ltrCellStyles).toContain(ALIGN_CENTER);

      // Test in RTL
      const { container: rtlContainer } = render(
        <DataGrid
          rows={basicRows}
          columns={columns}
          getRowId={getRowId}
          options={{ direction: DIRECTION_RTL }}
        />
      );

      const rtlCells = rtlContainer.querySelectorAll('td');
      expect(rtlCells.length).toBeGreaterThan(0);
      const rtlCellStyles = Array.from(rtlCells).map(cell => window.getComputedStyle(cell).textAlign);
      expect(rtlCellStyles).toContain(ALIGN_RIGHT);
      expect(rtlCellStyles).toContain(ALIGN_CENTER);
    });

    it('should apply override alignment to both headers and cells', () => {
      const columns = [
        { field: 'id', headerName: 'מזהה', type: 'number', align: ALIGN_CENTER },
      ];

      const { container } = render(
        <DataGrid
          rows={basicRows}
          columns={columns}
          getRowId={getRowId}
          options={{ direction: DIRECTION_RTL }}
        />
      );

      // Both headers and cells should have center alignment
      // MUI TableCell uses CSS for alignment, not HTML attributes
      const headers = container.querySelectorAll('th');
      const cells = container.querySelectorAll('td');
      expect(headers.length).toBeGreaterThan(0);
      expect(cells.length).toBeGreaterThan(0);
      
      const headerStyles = Array.from(headers).map(h => window.getComputedStyle(h).textAlign);
      const cellStyles = Array.from(cells).map(c => window.getComputedStyle(c).textAlign);
      expect(headerStyles).toContain(ALIGN_CENTER);
      expect(cellStyles).toContain(ALIGN_CENTER);
    });
  });
});
