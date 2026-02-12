import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Table, TableHead, TableRow } from '@mui/material';
import { GridHeaderCell } from '../../src/core/GridHeaderCell';
import { DataGridStableContext } from '../../src/DataGrid/DataGridContext';
import { ALIGN_LEFT, ALIGN_RIGHT, ALIGN_CENTER, SORT_ORDER_ASC, SORT_ORDER_DESC, DIRECTION_LTR } from '../../src/config/schema';

describe('GridHeaderCell Component', () => {
  const defaultColumn = { field: 'name', headerName: 'Name' };
  
  const defaultContextValue = {
    columnAlignMap: new Map(),
    columnSortDirMap: new Map(),
    headerCellSxMap: new Map(),
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

  describe('Render header with text', () => {
    it('should render header text correctly', () => {
      renderWithContext(
        <GridHeaderCell column={defaultColumn} sortModel={[]} onSort={vi.fn()} />
      );
      
      expect(screen.getByText('Name')).toBeInTheDocument();
    });

    it('should render header text from column.headerName', () => {
      const column = { field: 'age', headerName: 'Age' };
      renderWithContext(
        <GridHeaderCell column={column} sortModel={[]} onSort={vi.fn()} />
      );
      
      expect(screen.getByText('Age')).toBeInTheDocument();
    });
  });

  describe('Test sort indicator (asc, desc, none)', () => {
    it('should show no sort indicator when column is not sorted', () => {
      const contextValue = {
        ...defaultContextValue,
        columnSortDirMap: new Map(),
      };
      
      renderWithContext(
        <GridHeaderCell column={defaultColumn} sortModel={[]} onSort={vi.fn()} />,
        contextValue
      );
      
      const sortLabel = screen.getByText('Name').closest('[class*="MuiTableSortLabel-root"]');
      expect(sortLabel).toBeInTheDocument();
      // When not active, MUI doesn't show direction indicator
      expect(sortLabel).not.toHaveClass('Mui-active');
    });

    it('should show ascending sort indicator when column is sorted ascending', () => {
      const contextValue = {
        ...defaultContextValue,
        columnSortDirMap: new Map([['name', SORT_ORDER_ASC]]),
      };
      
      renderWithContext(
        <GridHeaderCell column={defaultColumn} sortModel={[{ field: 'name', order: SORT_ORDER_ASC }]} onSort={vi.fn()} />,
        contextValue
      );
      
      const sortLabel = screen.getByText('Name').closest('[class*="MuiTableSortLabel-root"]');
      expect(sortLabel).toBeInTheDocument();
      expect(sortLabel).toHaveClass('Mui-active');
    });

    it('should show descending sort indicator when column is sorted descending', () => {
      const contextValue = {
        ...defaultContextValue,
        columnSortDirMap: new Map([['name', SORT_ORDER_DESC]]),
      };
      
      renderWithContext(
        <GridHeaderCell column={defaultColumn} sortModel={[{ field: 'name', order: SORT_ORDER_DESC }]} onSort={vi.fn()} />,
        contextValue
      );
      
      const sortLabel = screen.getByText('Name').closest('[class*="MuiTableSortLabel-root"]');
      expect(sortLabel).toBeInTheDocument();
      expect(sortLabel).toHaveClass('Mui-active');
    });

    it('should show sort order index when multiple columns are sorted', () => {
      const contextValue = {
        ...defaultContextValue,
        columnSortDirMap: new Map([['name', SORT_ORDER_ASC]]),
      };
      
      const sortModel = [
        { field: 'age', order: SORT_ORDER_ASC },
        { field: 'name', order: SORT_ORDER_ASC },
      ];
      
      renderWithContext(
        <GridHeaderCell 
          column={defaultColumn} 
          sortModel={sortModel} 
          onSort={vi.fn()}
          sortOrderIndex={2}
        />,
        contextValue
      );
      
      expect(screen.getByText('(2)')).toBeInTheDocument();
    });

    it('should not show sort order index when single column is sorted', () => {
      const contextValue = {
        ...defaultContextValue,
        columnSortDirMap: new Map([['name', SORT_ORDER_ASC]]),
      };
      
      renderWithContext(
        <GridHeaderCell 
          column={defaultColumn} 
          sortModel={[{ field: 'name', order: SORT_ORDER_ASC }]} 
          onSort={vi.fn()}
          sortOrderIndex={1}
        />,
        contextValue
      );
      
      expect(screen.queryByText('(1)')).not.toBeInTheDocument();
    });
  });

  describe('Test sort click handler', () => {
    it('should call onSort when sort label is clicked', () => {
      const onSort = vi.fn();
      
      renderWithContext(
        <GridHeaderCell column={defaultColumn} sortModel={[]} onSort={onSort} />
      );
      
      const sortLabel = screen.getByText('Name').closest('[class*="MuiTableSortLabel-root"]');
      fireEvent.click(sortLabel);
      
      expect(onSort).toHaveBeenCalledTimes(1);
      expect(onSort).toHaveBeenCalledWith('name', false);
    });

    it('should call onSort with multiColumn true when ctrl key is pressed', () => {
      const onSort = vi.fn();
      
      renderWithContext(
        <GridHeaderCell column={defaultColumn} sortModel={[]} onSort={onSort} />
      );
      
      const sortLabel = screen.getByText('Name').closest('[class*="MuiTableSortLabel-root"]');
      fireEvent.click(sortLabel, { ctrlKey: true });
      
      expect(onSort).toHaveBeenCalledTimes(1);
      expect(onSort).toHaveBeenCalledWith('name', true);
    });

    it('should call onSort with multiColumn true when meta key is pressed', () => {
      const onSort = vi.fn();
      
      renderWithContext(
        <GridHeaderCell column={defaultColumn} sortModel={[]} onSort={onSort} />
      );
      
      const sortLabel = screen.getByText('Name').closest('[class*="MuiTableSortLabel-root"]');
      fireEvent.click(sortLabel, { metaKey: true });
      
      expect(onSort).toHaveBeenCalledTimes(1);
      expect(onSort).toHaveBeenCalledWith('name', true);
    });

    it('should call onSort with correct field name', () => {
      const onSort = vi.fn();
      const column = { field: 'age', headerName: 'Age' };
      
      renderWithContext(
        <GridHeaderCell column={column} sortModel={[]} onSort={onSort} />
      );
      
      const sortLabel = screen.getByText('Age').closest('[class*="MuiTableSortLabel-root"]');
      fireEvent.click(sortLabel);
      
      expect(onSort).toHaveBeenCalledWith('age', false);
    });
  });

  describe('Test header alignment', () => {
    it('should align left by default', () => {
      renderWithContext(
        <GridHeaderCell column={defaultColumn} sortModel={[]} onSort={vi.fn()} />
      );

      const cell = screen.getByRole('columnheader');
      const styles = window.getComputedStyle(cell);
      expect(styles.textAlign).toBe(ALIGN_LEFT);
    });

    it('should use column align property when provided', () => {
      const column = { ...defaultColumn, align: ALIGN_RIGHT };
      
      renderWithContext(
        <GridHeaderCell column={column} sortModel={[]} onSort={vi.fn()} />
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
        <GridHeaderCell column={defaultColumn} sortModel={[]} onSort={vi.fn()} />,
        contextValue
      );

      const cell = screen.getByRole('columnheader');
      const styles = window.getComputedStyle(cell);
      expect(styles.textAlign).toBe(ALIGN_CENTER);
    });

    it('should prioritize columnAlignMap over column align property', () => {
      const column = { ...defaultColumn, align: ALIGN_LEFT };
      const columnAlignMap = new Map([['name', ALIGN_RIGHT]]);
      const contextValue = {
        ...defaultContextValue,
        columnAlignMap,
      };

      renderWithContext(
        <GridHeaderCell column={column} sortModel={[]} onSort={vi.fn()} />,
        contextValue
      );

      const cell = screen.getByRole('columnheader');
      const styles = window.getComputedStyle(cell);
      expect(styles.textAlign).toBe(ALIGN_RIGHT);
    });
  });

  describe('Test custom header rendering', () => {
    it('should render headerComboSlot when provided', () => {
      const headerComboSlot = <div data-testid="header-combo">Combo Slot</div>;
      
      renderWithContext(
        <GridHeaderCell 
          column={defaultColumn} 
          sortModel={[]} 
          onSort={vi.fn()}
          headerComboSlot={headerComboSlot}
        />
      );
      
      expect(screen.getByTestId('header-combo')).toBeInTheDocument();
      expect(screen.getByText('Combo Slot')).toBeInTheDocument();
    });

    it('should not render headerComboSlot when not provided', () => {
      renderWithContext(
        <GridHeaderCell 
          column={defaultColumn} 
          sortModel={[]} 
          onSort={vi.fn()}
        />
      );
      
      expect(screen.queryByTestId('header-combo')).not.toBeInTheDocument();
    });

    it('should render filterSlot when provided', () => {
      const filterSlot = <div data-testid="filter-slot">Filter Input</div>;
      
      renderWithContext(
        <GridHeaderCell 
          column={defaultColumn} 
          sortModel={[]} 
          onSort={vi.fn()}
          filterSlot={filterSlot}
        />
      );
      
      expect(screen.getByTestId('filter-slot')).toBeInTheDocument();
      expect(screen.getByText('Filter Input')).toBeInTheDocument();
    });

    it('should not render filterSlot when not provided', () => {
      renderWithContext(
        <GridHeaderCell 
          column={defaultColumn} 
          sortModel={[]} 
          onSort={vi.fn()}
        />
      );
      
      expect(screen.queryByTestId('filter-slot')).not.toBeInTheDocument();
    });

    it('should render both headerComboSlot and filterSlot when both provided', () => {
      const headerComboSlot = <div data-testid="header-combo">Combo</div>;
      const filterSlot = <div data-testid="filter-slot">Filter</div>;
      
      renderWithContext(
        <GridHeaderCell 
          column={defaultColumn} 
          sortModel={[]} 
          onSort={vi.fn()}
          headerComboSlot={headerComboSlot}
          filterSlot={filterSlot}
        />
      );
      
      expect(screen.getByTestId('header-combo')).toBeInTheDocument();
      expect(screen.getByTestId('filter-slot')).toBeInTheDocument();
    });
  });
});
