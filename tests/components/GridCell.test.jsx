import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Table, TableBody, TableRow } from '@mui/material';
import { GridCell, getCellTooltipText } from '../../src/core/GridCell';
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
    it.each([
      [42, '42'],
      [0, '0'],
      [-100, '-100'],
      [3.14, '3.14'],
      [1e10, '10000000000'],
      [-0, '0'],
      [Number.MAX_SAFE_INTEGER, String(Number.MAX_SAFE_INTEGER)],
    ])('should render number %s as string %s', (value, expected) => {
      renderWithContext(
        <GridCell value={value} row={mockRow} column={defaultColumn} />
      );
      
      expect(screen.getByText(expected)).toBeInTheDocument();
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

    it('should handle empty string for date type', () => {
      const column = { ...defaultColumn, type: FIELD_TYPE_DATE };
      renderWithContext(
        <GridCell value="" row={mockRow} column={column} />
      );
      // Empty string should render as empty cell
      const cell = screen.getByRole('cell');
      expect(cell.textContent).toBe('');
    });

    it.each([
      ['invalid format', 'not-a-date'],
      ['non-date string', 'hello world'],
      ['pure text', 'abc'],
    ])('should handle invalid date format: %s', (_, invalidDate) => {
      const column = { ...defaultColumn, type: FIELD_TYPE_DATE };
      renderWithContext(
        <GridCell value={invalidDate} row={mockRow} column={column} />
      );
      // Should render as string when date is invalid (dayjs.isValid() returns false)
      expect(screen.getByText(invalidDate)).toBeInTheDocument();
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

    it('should handle custom render returning React element', () => {
      const customRender = vi.fn((value) => <span data-testid="custom-element">{value}</span>);
      const column = { ...defaultColumn, render: customRender };

      renderWithContext(
        <GridCell value="test" row={mockRow} column={column} />
      );

      expect(screen.getByTestId('custom-element')).toBeInTheDocument();
      expect(screen.getByText('test')).toBeInTheDocument();
    });

    it.each([
      ['null', null],
      ['undefined', undefined],
    ])('should handle custom render returning %s', (_, returnValue) => {
      const customRender = vi.fn(() => returnValue);
      const column = { ...defaultColumn, render: customRender };

      renderWithContext(
        <GridCell value="test" row={mockRow} column={column} />
      );
      
      const cell = screen.getByRole('cell');
      expect(cell.textContent).toBe('');
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
    it('should use columnAlignMap when available, prioritizing over column align', () => {
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

    it.each([
      ['undefined', undefined],
      ['null', null],
    ])('should handle cellStyle returning %s', (_, returnValue) => {
      const cellStyle = vi.fn(() => returnValue);
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

    it('should handle cellStyle with conflicting border properties', () => {
      const cellStyle = vi.fn(() => ({ border: '2px solid blue', borderColor: 'blue' }));
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
      // Error border should still be applied (hasError takes precedence for border)
      expect(styles.borderWidth).toBe('1px');
      expect(styles.borderStyle).toBe('solid');
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

  describe('Test text truncation and tooltip', () => {
    it('should apply truncation styles to cell content', () => {
      const longText = 'This is a very long text that should be truncated with ellipsis when it exceeds the available space in the cell';
      renderWithContext(
        <GridCell value={longText} row={mockRow} column={defaultColumn} />
      );

      const cell = screen.getByRole('cell');
      const contentBox = cell.querySelector('div[class*="MuiBox"]');
      expect(contentBox).toBeInTheDocument();
      const styles = window.getComputedStyle(contentBox);
      expect(styles.overflow).toBe('hidden');
      expect(styles.textOverflow).toBe('ellipsis');
      expect(styles.whiteSpace).toBe('nowrap');
    });

    it.each([
      ['number', 12345678901234567890, defaultColumn],
      ['date', '2024-01-15', { ...defaultColumn, type: FIELD_TYPE_DATE }],
      ['datetime', '2024-01-15T14:30:00', { ...defaultColumn, type: FIELD_TYPE_DATETIME }],
      ['custom render', 'test', { ...defaultColumn, render: vi.fn((value) => `Custom: ${value} - This is a very long text that should be truncated`) }],
    ])('should truncate %s values', (_, value, column) => {
      renderWithContext(
        <GridCell value={value} row={mockRow} column={column} />
      );

      const cell = screen.getByRole('cell');
      const contentBox = cell.querySelector('div[class*="MuiBox"]');
      expect(contentBox).toBeInTheDocument();
      const styles = window.getComputedStyle(contentBox);
      expect(styles.overflow).toBe('hidden');
      expect(styles.textOverflow).toBe('ellipsis');
    });

    it('should not apply truncation in editing mode', () => {
      const longText = 'This is a very long text that should not be truncated when editing';
      const editor = <input data-testid="editor" defaultValue="edited" />;

      renderWithContext(
        <GridCell 
          value={longText} 
          row={mockRow} 
          column={defaultColumn}
          isEditing={true}
          editor={editor}
        />
      );

      // When editing, editor is returned directly without truncation Box or Tooltip
      const editorElement = screen.getByTestId('editor');
      expect(editorElement).toBeInTheDocument();
      const cell = screen.getByRole('cell');
      // Editor should be directly in the cell, not wrapped in truncation Box
      expect(cell.contains(editorElement)).toBe(true);
      // Check that there's no Box with truncation styles
      const truncationBox = cell.querySelector('div[class*="MuiBox"]');
      expect(truncationBox).toBeNull();
    });

    it('should handle unicode characters', () => {
      const unicodeText = '测试文本 🎉 émojis 测试';
      renderWithContext(
        <GridCell value={unicodeText} row={mockRow} column={defaultColumn} />
      );
      expect(screen.getByText(unicodeText)).toBeInTheDocument();
    });

    it('should handle very long strings', () => {
      const veryLongText = 'A'.repeat(10000);
      renderWithContext(
        <GridCell value={veryLongText} row={mockRow} column={defaultColumn} />
      );
      const cell = screen.getByRole('cell');
      const contentBox = cell.querySelector('div[class*="MuiBox"]');
      expect(contentBox).toBeInTheDocument();
      const styles = window.getComputedStyle(contentBox);
      expect(styles.overflow).toBe('hidden');
      expect(styles.textOverflow).toBe('ellipsis');
    });

    it('should preserve alignment and styling with truncation', () => {
      const longText = 'This is a very long text';
      const cellStyle = vi.fn(() => ({ backgroundColor: 'red', color: 'white' }));
      const column = { ...defaultColumn, align: 'right', cellStyle };
      renderWithContext(
        <GridCell value={longText} row={mockRow} column={column} />
      );

      const cell = screen.getByRole('cell');
      const styles = window.getComputedStyle(cell);
      expect(styles.textAlign).toBe('right');
      expect(styles.backgroundColor).toBe('rgb(255, 0, 0)');
      expect(styles.color).toBe('rgb(255, 255, 255)');
      
      // Truncation box should still be present
      const contentBox = cell.querySelector('div[class*="MuiBox"]');
      expect(contentBox).toBeInTheDocument();
    });

    it('should render with object value (cell shows [object Object])', () => {
      renderWithContext(
        <GridCell value={{ 1: 'red' }} row={mockRow} column={defaultColumn} />
      );
      expect(screen.getByRole('cell')).toBeInTheDocument();
      expect(screen.getByText('[object Object]')).toBeInTheDocument();
    });

    it('should show getTooltipText result when column renders React element (e.g. Autocomplete)', () => {
      const priorityKey = 2;
      const rowWithPriority = { ...mockRow, priority: priorityKey };
      const expectedLabel = 'דחופה';
      const column = {
        field: 'priority',
        headerName: 'Priority',
        render: () => <span>Custom dropdown</span>,
        getTooltipText: (value) => (value === 2 ? expectedLabel : String(value ?? '')),
      };
      renderWithContext(
        <GridCell value={priorityKey} row={rowWithPriority} column={column} />
      );
      expect(screen.getByText('Custom dropdown')).toBeInTheDocument();
      // Tooltip title is applied as aria-label on the wrapper (getTooltipText used instead of "[object Object]")
      const cell = screen.getByRole('cell');
      const wrapper = cell.querySelector('[aria-label]');
      expect(wrapper).toHaveAttribute('aria-label', expectedLabel);
    });
  });
});

describe('getCellTooltipText', () => {
  it('returns single primitive value for single-key object (e.g. { 1: "red" } -> "red")', () => {
    expect(getCellTooltipText('[object Object]', { 1: 'red' }, false, null)).toBe('red');
  });

  it('returns JSON string for multi-key object', () => {
    const obj = { foo: 'bar', id: 1 };
    expect(getCellTooltipText('[object Object]', obj, false, null)).toBe(JSON.stringify(obj));
  });

  it('returns displayValue when not [object Object]', () => {
    expect(getCellTooltipText('hello', null, false, null)).toBe('hello');
    expect(getCellTooltipText(42, 42, false, null)).toBe('42');
  });

  it('returns empty string when editing with editor', () => {
    expect(getCellTooltipText('x', 'x', true, <span />)).toBe('');
  });

});
