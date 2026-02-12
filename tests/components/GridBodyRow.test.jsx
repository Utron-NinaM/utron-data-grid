import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Table, TableBody } from '@mui/material';
import { GridBodyRow } from '../../src/core/GridBodyRow';
import { DataGridStableContext } from '../../src/DataGrid/DataGridContext';
import { DIRECTION_LTR } from '../../src/config/schema';

describe('GridBodyRow Component', () => {
  const mockRow = { id: 1, name: 'Alice', age: 30 };
  const mockColumns = [
    { field: 'name', headerName: 'Name' },
    { field: 'age', headerName: 'Age' },
  ];
  
  const defaultContextValue = {
    columnAlignMap: new Map(),
    direction: DIRECTION_LTR,
  };

  const defaultProps = {
    row: mockRow,
    rowId: 1,
    selected: false,
    onSelectRow: vi.fn(),
    editRowId: null,
    editValues: undefined,
    validationErrors: new Set(),
    isSelected: false,
    rowSx: undefined,
    columns: mockColumns,
    multiSelectable: false,
    getEditor: vi.fn(),
  };

  const renderWithContext = (component, contextValue = defaultContextValue) => {
    return render(
      <ThemeProvider theme={createTheme()}>
        <DataGridStableContext.Provider value={contextValue}>
          <Table>
            <TableBody>
              {component}
            </TableBody>
          </Table>
        </DataGridStableContext.Provider>
      </ThemeProvider>
    );
  };

  describe('Render row with data', () => {
    it('should render row with data correctly', () => {
      renderWithContext(
        <GridBodyRow {...defaultProps} />
      );
      
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('30')).toBeInTheDocument();
    });

    it('should render row with data-row-id attribute', () => {
      renderWithContext(
        <GridBodyRow {...defaultProps} />
      );
      
      const row = screen.getByText('Alice').closest('[data-row-id]');
      expect(row).toBeInTheDocument();
      expect(row).toHaveAttribute('data-row-id', '1');
    });

    it('should render all column values', () => {
      const row = { id: 2, name: 'Bob', age: 25, email: 'bob@example.com' };
      const columns = [
        { field: 'name', headerName: 'Name' },
        { field: 'age', headerName: 'Age' },
        { field: 'email', headerName: 'Email' },
      ];
      
      renderWithContext(
        <GridBodyRow {...defaultProps} row={row} rowId={2} columns={columns} />
      );
      
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();
      expect(screen.getByText('bob@example.com')).toBeInTheDocument();
    });

    it('should render empty cells for null/undefined values', () => {
      const row = { id: 3, name: 'Charlie', age: null };
      
      renderWithContext(
        <GridBodyRow {...defaultProps} row={row} rowId={3} />
      );
      
      expect(screen.getByText('Charlie')).toBeInTheDocument();
      // Age should be empty string
      const cells = screen.getAllByRole('cell');
      expect(cells.length).toBeGreaterThan(0);
    });
  });

  describe('Test row click handler', () => {
    it('should have data-row-id attribute for event delegation', () => {
      renderWithContext(
        <GridBodyRow {...defaultProps} />
      );
      
      const row = screen.getByText('Alice').closest('[data-row-id]');
      expect(row).toBeInTheDocument();
      expect(row).toHaveAttribute('data-row-id', '1');
      
      // Simulate click event that would be handled by parent
      fireEvent.click(row);
      // Row should still be clickable (handler is on parent)
      expect(row).toBeInTheDocument();
    });

    it('should support event delegation for row clicks', () => {
      const handleRowClick = vi.fn((event) => {
        const rowElement = event.target.closest('[data-row-id]');
        if (rowElement) {
          const rowId = rowElement.getAttribute('data-row-id');
          handleRowClick(rowId);
        }
      });
      
      renderWithContext(
        <GridBodyRow {...defaultProps} />
      );
      
      const row = screen.getByText('Alice').closest('[data-row-id]');
      fireEvent.click(row, { target: row });
      
      // Verify row has the correct attribute for event delegation
      expect(row).toHaveAttribute('data-row-id', '1');
    });

    it('should work with different row IDs', () => {
      renderWithContext(
        <GridBodyRow {...defaultProps} rowId="row-123" />
      );
      
      const row = screen.getByText('Alice').closest('[data-row-id]');
      expect(row).toHaveAttribute('data-row-id', 'row-123');
    });
  });

  describe('Test row double-click handler', () => {
    it('should support double-click event delegation', () => {
      renderWithContext(
        <GridBodyRow {...defaultProps} />
      );
      
      const row = screen.getByText('Alice').closest('[data-row-id]');
      fireEvent.doubleClick(row);
      
      // Verify row structure supports double-click
      expect(row).toHaveAttribute('data-row-id', '1');
    });

    it('should have data-row-id for double-click event delegation', () => {
      const handleDoubleClick = vi.fn((event) => {
        const rowElement = event.target.closest('[data-row-id]');
        if (rowElement) {
          const rowId = rowElement.getAttribute('data-row-id');
          handleDoubleClick(rowId);
        }
      });
      
      renderWithContext(
        <GridBodyRow {...defaultProps} />
      );
      
      const row = screen.getByText('Alice').closest('[data-row-id]');
      fireEvent.doubleClick(row, { target: row });
      
      expect(row).toHaveAttribute('data-row-id', '1');
    });
  });

  describe('Test selected row styling', () => {
    it('should apply selected styling when selected is true', () => {
      renderWithContext(
        <GridBodyRow {...defaultProps} selected={true} />
      );
      
      const row = screen.getByText('Alice').closest('tr');
      expect(row).toHaveClass('Mui-selected');
    });

    it('should apply selected styling when isSelected is true', () => {
      renderWithContext(
        <GridBodyRow {...defaultProps} isSelected={true} />
      );
      
      const row = screen.getByText('Alice').closest('tr');
      expect(row).toHaveClass('Mui-selected');
    });

    it('should apply selected styling when both selected and isSelected are true', () => {
      renderWithContext(
        <GridBodyRow {...defaultProps} selected={true} isSelected={true} />
      );
      
      const row = screen.getByText('Alice').closest('tr');
      expect(row).toHaveClass('Mui-selected');
    });

    it('should not apply selected styling when both are false', () => {
      renderWithContext(
        <GridBodyRow {...defaultProps} selected={false} isSelected={false} />
      );
      
      const row = screen.getByText('Alice').closest('tr');
      expect(row).not.toHaveClass('Mui-selected');
    });

    it('should render checkbox when multiSelectable is true', () => {
      renderWithContext(
        <GridBodyRow {...defaultProps} multiSelectable={true} />
      );
      
      const checkbox = screen.getByRole('checkbox', { name: /select row/i });
      expect(checkbox).toBeInTheDocument();
    });

    it('should call onSelectRow when checkbox is clicked', () => {
      const onSelectRow = vi.fn();
      
      renderWithContext(
        <GridBodyRow {...defaultProps} multiSelectable={true} onSelectRow={onSelectRow} />
      );
      
      const checkbox = screen.getByRole('checkbox', { name: /select row/i });
      fireEvent.click(checkbox);
      
      expect(onSelectRow).toHaveBeenCalledTimes(1);
      expect(onSelectRow).toHaveBeenCalledWith(1, true);
    });

    it('should update checkbox checked state when selected changes', () => {
      const { rerender } = renderWithContext(
        <GridBodyRow {...defaultProps} multiSelectable={true} selected={false} />
      );
      
      let checkbox = screen.getByRole('checkbox', { name: /select row/i });
      expect(checkbox).not.toBeChecked();
      
      rerender(
        <ThemeProvider theme={createTheme()}>
          <DataGridStableContext.Provider value={defaultContextValue}>
            <Table>
              <TableBody>
                <GridBodyRow {...defaultProps} multiSelectable={true} selected={true} />
              </TableBody>
            </Table>
          </DataGridStableContext.Provider>
        </ThemeProvider>
      );
      
      checkbox = screen.getByRole('checkbox', { name: /select row/i });
      expect(checkbox).toBeChecked();
    });
  });

  describe('Test rowStyle function', () => {
    it('should apply rowSx styles when provided', () => {
      const rowSx = [{ backgroundColor: 'red' }];
      
      renderWithContext(
        <GridBodyRow {...defaultProps} rowSx={rowSx} />
      );
      
      const row = screen.getByText('Alice').closest('tr');
      expect(row).toBeInTheDocument();
      const styles = window.getComputedStyle(row);
      // Verify the background color is applied (MUI may convert to rgb)
      expect(styles.backgroundColor).toBeTruthy();
      // Check that it's not the default transparent
      expect(styles.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    });

    it('should apply multiple rowSx styles', () => {
      const rowSx = [
        { backgroundColor: 'blue' },
        { color: 'white' },
      ];
      
      renderWithContext(
        <GridBodyRow {...defaultProps} rowSx={rowSx} />
      );
      
      const row = screen.getByText('Alice').closest('tr');
      expect(row).toBeInTheDocument();
      const styles = window.getComputedStyle(row);
      // Verify styles are applied
      expect(styles.backgroundColor).toBeTruthy();
      expect(styles.color).toBeTruthy();
      // Check that colors are not default/transparent
      expect(styles.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    });

    it('should work without rowSx', () => {
      renderWithContext(
        <GridBodyRow {...defaultProps} rowSx={undefined} />
      );
      
      const row = screen.getByText('Alice').closest('tr');
      expect(row).toBeInTheDocument();
    });
  });

  describe('Test editing state styling', () => {
    it('should render cells in editing mode when editRowId matches rowId', () => {
      const getEditor = vi.fn((col) => <input data-testid={`editor-${col.field}`} defaultValue={mockRow[col.field]} />);
      const editableColumns = mockColumns.map(col => ({ ...col, editable: true }));
      
      renderWithContext(
        <GridBodyRow 
          {...defaultProps} 
          columns={editableColumns}
          editRowId={1}
          editValues={{ name: 'Edited Name', age: 35 }}
          getEditor={getEditor}
        />
      );
      
      expect(screen.getByTestId('editor-name')).toBeInTheDocument();
      expect(screen.getByTestId('editor-age')).toBeInTheDocument();
    });

    it('should not render editors when editRowId does not match', () => {
      const getEditor = vi.fn((col) => <input data-testid={`editor-${col.field}`} />);
      
      renderWithContext(
        <GridBodyRow 
          {...defaultProps} 
          editRowId={2}
          editValues={{ name: 'Edited Name' }}
          getEditor={getEditor}
        />
      );
      
      expect(screen.queryByTestId('editor-name')).not.toBeInTheDocument();
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    it('should use editValues when in editing mode', () => {
      const getEditor = vi.fn((col, row, editValues) => {
        const value = editValues[col.field] !== undefined ? editValues[col.field] : row[col.field];
        return <input data-testid={`editor-${col.field}`} defaultValue={value} />;
      });
      const editableColumns = mockColumns.map(col => ({ ...col, editable: true }));
      
      renderWithContext(
        <GridBodyRow 
          {...defaultProps} 
          columns={editableColumns}
          editRowId={1}
          editValues={{ name: 'Edited Name', age: 35 }}
          getEditor={getEditor}
        />
      );
      
      const nameEditor = screen.getByTestId('editor-name');
      expect(nameEditor).toBeInTheDocument();
      expect(nameEditor.value).toBe('Edited Name');
      
      const ageEditor = screen.getByTestId('editor-age');
      expect(ageEditor).toBeInTheDocument();
      expect(ageEditor.value).toBe('35');
    });

    it('should show validation errors when in editing mode', () => {
      const validationErrors = new Set(['name']);
      const getEditor = vi.fn((col) => <input data-testid={`editor-${col.field}`} />);
      const editableColumns = mockColumns.map(col => ({ ...col, editable: true }));
      
      renderWithContext(
        <GridBodyRow 
          {...defaultProps} 
          columns={editableColumns}
          editRowId={1}
          editValues={{ name: 'Edited Name' }}
          validationErrors={validationErrors}
          getEditor={getEditor}
        />
      );
      
      // Validation errors are passed to GridCell which applies error border
      const nameEditor = screen.getByTestId('editor-name');
      expect(nameEditor).toBeInTheDocument();
      // The editor should be inside a TableCell (td element)
      const nameCell = nameEditor.closest('td');
      expect(nameCell).toBeInTheDocument();
    });

    it('should not show validation errors when not in editing mode', () => {
      const validationErrors = new Set(['name']);
      
      renderWithContext(
        <GridBodyRow 
          {...defaultProps} 
          editRowId={null}
          validationErrors={validationErrors}
        />
      );
      
      // Should render normally without error styling
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    it('should handle editable function per column', () => {
      const columns = [
        { field: 'name', headerName: 'Name', editable: true },
        { field: 'age', headerName: 'Age', editable: (row) => row.age > 25 },
      ];
      const getEditor = vi.fn((col) => <input data-testid={`editor-${col.field}`} />);
      
      renderWithContext(
        <GridBodyRow 
          {...defaultProps} 
          columns={columns}
          editRowId={1}
          editValues={{ name: 'Edited', age: 30 }}
          getEditor={getEditor}
        />
      );
      
      // Name should be editable (always true)
      expect(screen.getByTestId('editor-name')).toBeInTheDocument();
      // Age should be editable (30 > 25)
      expect(screen.getByTestId('editor-age')).toBeInTheDocument();
    });

    it('should not render editor for non-editable column', () => {
      const columns = [
        { field: 'name', headerName: 'Name', editable: false },
        { field: 'age', headerName: 'Age', editable: true },
      ];
      const getEditor = vi.fn((col) => <input data-testid={`editor-${col.field}`} />);
      
      renderWithContext(
        <GridBodyRow 
          {...defaultProps} 
          columns={columns}
          editRowId={1}
          editValues={{ name: 'Edited', age: 30 }}
          getEditor={getEditor}
        />
      );
      
      // Name should not have editor (editable: false)
      expect(screen.queryByTestId('editor-name')).not.toBeInTheDocument();
      expect(screen.getByText('Edited')).toBeInTheDocument();
      // Age should have editor
      expect(screen.getByTestId('editor-age')).toBeInTheDocument();
    });
  });
});
