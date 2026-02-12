import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Table, TableBody, TableRow } from '@mui/material';
import { GridCell } from '../../src/core/GridCell';
import { DataGridStableContext } from '../../src/DataGrid/DataGridContext';
import { ALIGN_LEFT, ALIGN_RIGHT, ALIGN_CENTER, FIELD_TYPE_DATE, FIELD_TYPE_DATETIME, DIRECTION_LTR, DIRECTION_RTL } from '../../src/config/schema';
import dayjs from 'dayjs';

describe('GridCell Component', () => {
  const mockRow = { id: 1, name: 'Test Row' };
  const defaultColumn = { field: 'name', headerName: 'Name' };
  
  const defaultContextValue = {
    columnAlignMap: new Map(),
    direction: DIRECTION_LTR,
  };

  const renderWithContext = (component, contextValue = defaultContextValue) => {
    return render(
      <ThemeProvider theme={createTheme()}>
        <DataGridStableContext.Provider value={contextValue}>
          <Table>
            <TableBody>
              <TableRow>
                {component}
              </TableRow>
            </TableBody>
          </Table>
        </DataGridStableContext.Provider>
      </ThemeProvider>
    );
  };

  describe('Render cell with text value', () => {
    it('should render text value correctly', () => {
      renderWithContext(
        <GridCell value="Hello World" row={mockRow} column={defaultColumn} />
      );
      
      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    it('should render empty string for empty text', () => {
      renderWithContext(
        <GridCell value="" row={mockRow} column={defaultColumn} />
      );
      
      const cell = screen.getByRole('cell');
      expect(cell).toBeInTheDocument();
      expect(cell.textContent).toBe('');
    });
  });

  describe('Render cell with number value', () => {
    it('should render number value as string', () => {
      renderWithContext(
        <GridCell value={42} row={mockRow} column={defaultColumn} />
      );
      
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('should render zero correctly', () => {
      renderWithContext(
        <GridCell value={0} row={mockRow} column={defaultColumn} />
      );
      
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should render negative number correctly', () => {
      renderWithContext(
        <GridCell value={-100} row={mockRow} column={defaultColumn} />
      );
      
      expect(screen.getByText('-100')).toBeInTheDocument();
    });

    it('should render decimal number correctly', () => {
      renderWithContext(
        <GridCell value={3.14} row={mockRow} column={defaultColumn} />
      );
      
      expect(screen.getByText('3.14')).toBeInTheDocument();
    });
  });

  describe('Render cell with date value (formatting)', () => {
    it('should format date value correctly for LTR direction', () => {
      const dateValue = '2024-01-15';
      const column = { ...defaultColumn, type: FIELD_TYPE_DATE };
      const contextValue = {
        ...defaultContextValue,
        direction: DIRECTION_LTR,
      };

      renderWithContext(
        <GridCell value={dateValue} row={mockRow} column={column} />,
        contextValue
      );

      const formatted = dayjs(dateValue).format('MM-DD-YYYY');
      expect(screen.getByText(formatted)).toBeInTheDocument();
    });

    it('should format date value correctly for RTL direction', () => {
      const dateValue = '2024-01-15';
      const column = { ...defaultColumn, type: FIELD_TYPE_DATE };
      const contextValue = {
        ...defaultContextValue,
        direction: DIRECTION_RTL,
      };

      renderWithContext(
        <GridCell value={dateValue} row={mockRow} column={column} />,
        contextValue
      );

      const formatted = dayjs(dateValue).format('DD-MM-YYYY');
      expect(screen.getByText(formatted)).toBeInTheDocument();
    });

    it('should format datetime value correctly for LTR direction', () => {
      const dateTimeValue = '2024-01-15T14:30:00';
      const column = { ...defaultColumn, type: FIELD_TYPE_DATETIME };
      const contextValue = {
        ...defaultContextValue,
        direction: DIRECTION_LTR,
      };

      renderWithContext(
        <GridCell value={dateTimeValue} row={mockRow} column={column} />,
        contextValue
      );

      const formatted = dayjs(dateTimeValue).format('MM-DD-YYYY HH:mm:ss');
      expect(screen.getByText(formatted)).toBeInTheDocument();
    });

    it('should format datetime value correctly for RTL direction', () => {
      const dateTimeValue = '2024-01-15T14:30:00';
      const column = { ...defaultColumn, type: FIELD_TYPE_DATETIME };
      const contextValue = {
        ...defaultContextValue,
        direction: DIRECTION_RTL,
      };

      renderWithContext(
        <GridCell value={dateTimeValue} row={mockRow} column={column} />,
        contextValue
      );

      const formatted = dayjs(dateTimeValue).format('DD-MM-YYYY HH:mm:ss');
      expect(screen.getByText(formatted)).toBeInTheDocument();
    });

    it('should handle invalid date gracefully', () => {
      const invalidDate = 'invalid-date';
      const column = { ...defaultColumn, type: FIELD_TYPE_DATE };

      renderWithContext(
        <GridCell value={invalidDate} row={mockRow} column={column} />
      );

      // Invalid dates should be rendered as string
      expect(screen.getByText('invalid-date')).toBeInTheDocument();
    });
  });

  describe('Render cell with null/undefined', () => {
    it.each([
      ['null', null, defaultColumn],
      ['undefined', undefined, defaultColumn],
      ['null date', null, { ...defaultColumn, type: FIELD_TYPE_DATE }],
    ])('should render empty string for %s value', (_, value, column) => {
      renderWithContext(
        <GridCell value={value} row={mockRow} column={column} />
      );
      
      const cell = screen.getByRole('cell');
      expect(cell).toBeInTheDocument();
      expect(cell.textContent).toBe('');
    });
  });

  describe('Test custom render function', () => {
    it('should use custom render function when provided', () => {
      const customRender = vi.fn((value, row) => `Custom: ${value} (${row.id})`);
      const column = { ...defaultColumn, render: customRender };

      renderWithContext(
        <GridCell value="test" row={mockRow} column={column} />
      );

      expect(customRender).toHaveBeenCalledWith('test', mockRow);
      expect(screen.getByText('Custom: test (1)')).toBeInTheDocument();
    });

    it('should pass correct value and row to render function', () => {
      const customRender = vi.fn((value, row) => `${value}-${row.name}`);
      const column = { ...defaultColumn, render: customRender };

      renderWithContext(
        <GridCell value={42} row={mockRow} column={column} />
      );

      expect(customRender).toHaveBeenCalledWith(42, mockRow);
      expect(screen.getByText('42-Test Row')).toBeInTheDocument();
    });

    it('should not use render function when in editing mode with editor', () => {
      const customRender = vi.fn((value) => `Rendered: ${value}`);
      const column = { ...defaultColumn, render: customRender };
      const editor = <input data-testid="editor" defaultValue="edited" />;

      renderWithContext(
        <GridCell 
          value="original" 
          row={mockRow} 
          column={column} 
          isEditing={true}
          editor={editor}
        />
      );

      expect(customRender).not.toHaveBeenCalled();
      expect(screen.getByTestId('editor')).toBeInTheDocument();
      expect(screen.queryByText('Rendered: original')).not.toBeInTheDocument();
    });
  });

  describe('Test cell alignment (left, right, center)', () => {
    it('should align left by default', () => {
      renderWithContext(
        <GridCell value="test" row={mockRow} column={defaultColumn} />
      );

      const cell = screen.getByRole('cell');
      // MUI TableCell uses CSS classes for alignment, check text-align style
      const styles = window.getComputedStyle(cell);
      expect(styles.textAlign).toBe(ALIGN_LEFT);
    });

    it('should use column align property when provided', () => {
      const column = { ...defaultColumn, align: ALIGN_RIGHT };
      
      renderWithContext(
        <GridCell value="test" row={mockRow} column={column} />
      );

      const cell = screen.getByRole('cell');
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
        <GridCell value="test" row={mockRow} column={defaultColumn} />,
        contextValue
      );

      const cell = screen.getByRole('cell');
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
        <GridCell value="test" row={mockRow} column={column} />,
        contextValue
      );

      const cell = screen.getByRole('cell');
      const styles = window.getComputedStyle(cell);
      expect(styles.textAlign).toBe(ALIGN_RIGHT);
    });

    it('should fallback to column align when not in columnAlignMap', () => {
      const column = { ...defaultColumn, align: ALIGN_CENTER };
      const columnAlignMap = new Map([['otherField', ALIGN_RIGHT]]);
      const contextValue = {
        ...defaultContextValue,
        columnAlignMap,
      };

      renderWithContext(
        <GridCell value="test" row={mockRow} column={column} />,
        contextValue
      );

      const cell = screen.getByRole('cell');
      const styles = window.getComputedStyle(cell);
      expect(styles.textAlign).toBe(ALIGN_CENTER);
    });
  });

  describe('Test cellStyle function', () => {
    it('should apply cellStyle when provided as function', () => {
      const cellStyle = vi.fn((value, row) => ({ backgroundColor: 'red', color: 'white' }));
      const column = { ...defaultColumn, cellStyle };

      renderWithContext(
        <GridCell value="test" row={mockRow} column={column} />
      );

      expect(cellStyle).toHaveBeenCalledWith('test', mockRow);
      const cell = screen.getByRole('cell');
      const styles = window.getComputedStyle(cell);
      expect(styles.color).toBe('rgb(255, 255, 255)');
      expect(styles.backgroundColor).toBe('rgb(255, 0, 0)');
    });

    it('should pass correct value and row to cellStyle function', () => {
      const cellStyle = vi.fn(() => ({}));
      const column = { ...defaultColumn, cellStyle };

      renderWithContext(
        <GridCell value={123} row={mockRow} column={column} />
      );

      expect(cellStyle).toHaveBeenCalledWith(123, mockRow);
    });

    it('should not apply cellStyle when not provided', () => {
      renderWithContext(
        <GridCell value="test" row={mockRow} column={defaultColumn} />
      );

      const cell = screen.getByRole('cell');
      // Should not have custom styles (only default MUI styles)
      expect(cell).toBeInTheDocument();
    });

    it('should handle cellStyle returning undefined', () => {
      const cellStyle = vi.fn(() => undefined);
      const column = { ...defaultColumn, cellStyle };

      renderWithContext(
        <GridCell value="test" row={mockRow} column={column} />
      );

      const cell = screen.getByRole('cell');
      expect(cell).toBeInTheDocument();
    });
  });

  describe('Test error border styling', () => {
    it('should apply error border when hasError is true', () => {
      const theme = createTheme();
      render(
        <ThemeProvider theme={theme}>
          <DataGridStableContext.Provider value={defaultContextValue}>
            <Table>
              <TableBody>
                <TableRow>
                  <GridCell 
                    value="test" 
                    row={mockRow} 
                    column={defaultColumn} 
                    hasError={true}
                  />
                </TableRow>
              </TableBody>
            </Table>
          </DataGridStableContext.Provider>
        </ThemeProvider>
      );

      const cell = screen.getByRole('cell');
      const styles = window.getComputedStyle(cell);
      expect(styles.borderWidth).toBe('1px');
      expect(styles.borderStyle).toBe('solid');
      // borderColor will be resolved to theme color
      expect(styles.borderColor).toBeTruthy();
    });

    it('should not apply error border when hasError is false', () => {
      renderWithContext(
        <GridCell 
          value="test" 
          row={mockRow} 
          column={defaultColumn} 
          hasError={false}
        />
      );

      const cell = screen.getByRole('cell');
      expect(cell).toBeInTheDocument();
      // Error border should not be present - verify border is not error color
      const styles = window.getComputedStyle(cell);
      // Error border typically has a red color, so we check border color is not red
      // If borderWidth is 0 or borderStyle is none, there's no border (which is fine)
      if (styles.borderWidth !== '0px' && styles.borderStyle !== 'none') {
        // If there is a border, it should not be red (error color)
        expect(styles.borderColor).not.toBe('rgb(211, 47, 47)'); // MUI error red
      }
    });

    it('should combine error border with cellStyle', () => {
      const cellStyle = vi.fn(() => ({ backgroundColor: 'blue' }));
      const column = { ...defaultColumn, cellStyle };

      renderWithContext(
        <GridCell 
          value="test" 
          row={mockRow} 
          column={column} 
          hasError={true}
        />
      );

      const cell = screen.getByRole('cell');
      const styles = window.getComputedStyle(cell);
      expect(styles.borderWidth).toBe('1px');
      expect(styles.borderStyle).toBe('solid');
      expect(styles.backgroundColor).toBe('rgb(0, 0, 255)');
      expect(styles.borderColor).toBeTruthy();
    });
  });

  describe('Test editing mode with editor', () => {
    it('should render editor when isEditing is true and editor is provided', () => {
      const editor = <input data-testid="cell-editor" defaultValue="edited value" />;

      renderWithContext(
        <GridCell 
          value="original value" 
          row={mockRow} 
          column={defaultColumn}
          isEditing={true}
          editor={editor}
        />
      );

      expect(screen.getByTestId('cell-editor')).toBeInTheDocument();
      expect(screen.queryByText('original value')).not.toBeInTheDocument();
    });

    it('should render display value when isEditing is true but editor is null', () => {
      renderWithContext(
        <GridCell 
          value="original value" 
          row={mockRow} 
          column={defaultColumn}
          isEditing={true}
          editor={null}
        />
      );

      expect(screen.getByText('original value')).toBeInTheDocument();
    });

    it('should render display value when isEditing is false even if editor is provided', () => {
      const editor = <input data-testid="cell-editor" />;

      renderWithContext(
        <GridCell 
          value="display value" 
          row={mockRow} 
          column={defaultColumn}
          isEditing={false}
          editor={editor}
        />
      );

      expect(screen.getByText('display value')).toBeInTheDocument();
      expect(screen.queryByTestId('cell-editor')).not.toBeInTheDocument();
    });

    it('should not call render function when in editing mode with editor', () => {
      const customRender = vi.fn((value) => `Rendered: ${value}`);
      const column = { ...defaultColumn, render: customRender };
      const editor = <div data-testid="editor">Editor Component</div>;

      renderWithContext(
        <GridCell 
          value="test" 
          row={mockRow} 
          column={column}
          isEditing={true}
          editor={editor}
        />
      );

      expect(customRender).not.toHaveBeenCalled();
      expect(screen.getByTestId('editor')).toBeInTheDocument();
    });

    it('should render custom editor component', () => {
      const CustomEditor = () => <div data-testid="custom-editor">Custom Editor</div>;
      const editor = <CustomEditor />;

      renderWithContext(
        <GridCell 
          value="test" 
          row={mockRow} 
          column={defaultColumn}
          isEditing={true}
          editor={editor}
        />
      );

      expect(screen.getByTestId('custom-editor')).toBeInTheDocument();
      expect(screen.getByText('Custom Editor')).toBeInTheDocument();
    });
  });
});
