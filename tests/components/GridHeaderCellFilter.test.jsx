import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Table, TableHead, TableRow } from '@mui/material';
import { GridHeaderCellFilter } from '../../src/core/GridHeaderCellFilter';
import { DataGridStableContext } from '../../src/DataGrid/DataGridContext';
import { ALIGN_LEFT, ALIGN_RIGHT, ALIGN_CENTER, DIRECTION_LTR } from '../../src/config/schema';

describe('GridHeaderCellFilter Component', () => {
  const defaultColumn = { field: 'name', headerName: 'Name' };
  
  const defaultContextValue = {
    columnAlignMap: new Map(),
    filterCellSxMap: new Map(),
    filterInputHeight: undefined,
    direction: DIRECTION_LTR,
  };

  const renderWithContext = (component, contextValue = defaultContextValue) => {
    return render(
      <ThemeProvider theme={createTheme()}>
        <DataGridStableContext.Provider value={contextValue}>
          <Table>
            <TableHead>
              <TableRow>
                {component}
              </TableRow>
            </TableHead>
          </Table>
        </DataGridStableContext.Provider>
      </ThemeProvider>
    );
  };

  describe('Render filter row', () => {
    it('should render filter row cell', () => {
      renderWithContext(
        <GridHeaderCellFilter column={defaultColumn} slot={null} />
      );
      
      const cell = screen.getByRole('columnheader');
      expect(cell).toBeInTheDocument();
    });

    it('should render empty box when slot is null', () => {
      renderWithContext(
        <GridHeaderCellFilter column={defaultColumn} slot={null} />
      );
      
      const cell = screen.getByRole('columnheader');
      expect(cell).toBeInTheDocument();
      // Should render an empty Box with minHeight: 0
      expect(cell.children.length).toBeGreaterThan(0);
    });
  });

  describe('Test filter input slot rendering', () => {
    it('should render filter input slot when provided', () => {
      const filterSlot = (
        <div data-testid="filter-input">
          <input placeholder="Filter" />
        </div>
      );
      
      renderWithContext(
        <GridHeaderCellFilter column={defaultColumn} slot={filterSlot} />
      );
      
      expect(screen.getByTestId('filter-input')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Filter')).toBeInTheDocument();
    });

    it('should render text filter input', () => {
      const filterSlot = (
        <input data-testid="text-filter" type="text" placeholder="Filter by name" />
      );
      
      renderWithContext(
        <GridHeaderCellFilter column={defaultColumn} slot={filterSlot} />
      );
      
      const input = screen.getByTestId('text-filter');
      expect(input).toBeInTheDocument();
      expect(input.type).toBe('text');
    });

    it('should render number filter input', () => {
      const filterSlot = (
        <input data-testid="number-filter" type="number" placeholder="Filter by number" />
      );
      
      renderWithContext(
        <GridHeaderCellFilter column={defaultColumn} slot={filterSlot} />
      );
      
      const input = screen.getByTestId('number-filter');
      expect(input).toBeInTheDocument();
      expect(input.type).toBe('number');
    });

    it('should render complex filter component', () => {
      const FilterComponent = () => (
        <div data-testid="complex-filter">
          <input type="text" />
          <button>Clear</button>
        </div>
      );
      
      renderWithContext(
        <GridHeaderCellFilter column={defaultColumn} slot={<FilterComponent />} />
      );
      
      expect(screen.getByTestId('complex-filter')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Test filter operator dropdown', () => {
    it('should render operator dropdown in filter slot', () => {
      const filterSlot = (
        <div data-testid="filter-with-operator">
          <select data-testid="operator-dropdown">
            <option value="equals">Equals</option>
            <option value="contains">Contains</option>
          </select>
          <input type="text" />
        </div>
      );
      
      renderWithContext(
        <GridHeaderCellFilter column={defaultColumn} slot={filterSlot} />
      );
      
      const dropdown = screen.getByTestId('operator-dropdown');
      expect(dropdown).toBeInTheDocument();
      expect(dropdown.tagName).toBe('SELECT');
    });

    it('should handle operator dropdown change', () => {
      const filterSlot = (
        <select data-testid="operator-dropdown">
          <option value="equals">Equals</option>
          <option value="contains">Contains</option>
        </select>
      );
      
      renderWithContext(
        <GridHeaderCellFilter column={defaultColumn} slot={filterSlot} />
      );
      
      const dropdown = screen.getByTestId('operator-dropdown');
      fireEvent.change(dropdown, { target: { value: 'contains' } });
      
      expect(dropdown.value).toBe('contains');
    });
  });

  describe('Test "to" input for range filters', () => {
    it('should render "to" input for range filter', () => {
      const rangeFilterSlot = (
        <div data-testid="range-filter">
          <input data-testid="from-input" type="number" placeholder="From" />
          <span>to</span>
          <input data-testid="to-input" type="number" placeholder="To" />
        </div>
      );
      
      renderWithContext(
        <GridHeaderCellFilter column={defaultColumn} slot={rangeFilterSlot} />
      );
      
      expect(screen.getByTestId('range-filter')).toBeInTheDocument();
      expect(screen.getByTestId('from-input')).toBeInTheDocument();
      expect(screen.getByTestId('to-input')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('To')).toBeInTheDocument();
    });

    it('should handle "to" input value change', () => {
      const rangeFilterSlot = (
        <div>
          <input data-testid="to-input" type="number" placeholder="To" />
        </div>
      );
      
      renderWithContext(
        <GridHeaderCellFilter column={defaultColumn} slot={rangeFilterSlot} />
      );
      
      const toInput = screen.getByTestId('to-input');
      fireEvent.change(toInput, { target: { value: '100' } });
      
      expect(toInput.value).toBe('100');
    });
  });

  describe('Test clear button', () => {
    it('should render clear button in filter slot', () => {
      const handleClear = vi.fn();
      const filterSlot = (
        <div>
          <input type="text" />
          <button data-testid="clear-button" onClick={handleClear}>
            Clear
          </button>
        </div>
      );
      
      renderWithContext(
        <GridHeaderCellFilter column={defaultColumn} slot={filterSlot} />
      );
      
      const clearButton = screen.getByTestId('clear-button');
      expect(clearButton).toBeInTheDocument();
    });

    it('should call clear handler when clear button is clicked', () => {
      const handleClear = vi.fn();
      const filterSlot = (
        <div>
          <input type="text" />
          <button data-testid="clear-button" onClick={handleClear}>
            Clear
          </button>
        </div>
      );
      
      renderWithContext(
        <GridHeaderCellFilter column={defaultColumn} slot={filterSlot} />
      );
      
      const clearButton = screen.getByTestId('clear-button');
      fireEvent.click(clearButton);
      
      expect(handleClear).toHaveBeenCalledTimes(1);
    });

    it('should render clear button with icon', () => {
      const filterSlot = (
        <div>
          <input type="text" />
          <button data-testid="clear-button" aria-label="Clear filter">
            ×
          </button>
        </div>
      );
      
      renderWithContext(
        <GridHeaderCellFilter column={defaultColumn} slot={filterSlot} />
      );
      
      const clearButton = screen.getByTestId('clear-button');
      expect(clearButton).toBeInTheDocument();
      expect(clearButton).toHaveAttribute('aria-label', 'Clear filter');
    });
  });

  describe('Test filter alignment', () => {
    it('should align filter cell left by default', () => {
      renderWithContext(
        <GridHeaderCellFilter column={defaultColumn} slot={null} />
      );

      const cell = screen.getByRole('columnheader');
      const styles = window.getComputedStyle(cell);
      expect(styles.textAlign).toBe(ALIGN_LEFT);
    });

    it('should use column align property when provided', () => {
      const column = { ...defaultColumn, align: ALIGN_RIGHT };
      
      renderWithContext(
        <GridHeaderCellFilter column={column} slot={null} />
      );

      const cell = screen.getByRole('columnheader');
      const styles = window.getComputedStyle(cell);
      expect(styles.textAlign).toBe(ALIGN_RIGHT);
    });

    it('should use columnAlignMap when available', () => {
      const columnAlignMap = new Map([['name', ALIGN_CENTER]]);
      const contextValue = {
        ...defaultContextValue,
        columnAlignMap,
      };

      renderWithContext(
        <GridHeaderCellFilter column={defaultColumn} slot={null} />,
        contextValue
      );

      const cell = screen.getByRole('columnheader');
      const styles = window.getComputedStyle(cell);
      expect(styles.textAlign).toBe(ALIGN_CENTER);
    });
  });
});
