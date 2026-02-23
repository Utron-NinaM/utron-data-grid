import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { getEditor } from '../../src/editors/CellEditors';
import { FIELD_TYPE_LIST, DIRECTION_LTR } from '../../src/config/schema';

describe('CellEditors getEditor', () => {
  const renderEditor = (column, row = {}, editValues = {}, onChange = vi.fn()) => {
    const Editor = getEditor(column, row, editValues, onChange, DIRECTION_LTR);
    return render(
      <ThemeProvider theme={createTheme()}>
        {Editor}
      </ThemeProvider>
    );
  };

  describe('FIELD_TYPE_LIST with onListInputChange', () => {
    const listColumn = {
      field: 'department',
      headerName: 'Department',
      type: FIELD_TYPE_LIST,
      options: [
        { value: 'eng', label: 'Engineering' },
        { value: 'sales', label: 'Sales' },
      ],
    };

    it('calls onListInputChange when user types in Autocomplete', () => {
      const onListInputChange = vi.fn();
      const column = { ...listColumn, onListInputChange };
      renderEditor(column, {}, { department: undefined });

      const input = screen.getByRole('combobox');
      fireEvent.change(input, { target: { value: 'abc' } });

      expect(onListInputChange).toHaveBeenCalledTimes(1);
      expect(onListInputChange).toHaveBeenCalledWith('abc');
    });

    it('does not call onListInputChange when input is empty or whitespace only', () => {
      const onListInputChange = vi.fn();
      const column = { ...listColumn, onListInputChange };
      renderEditor(column, {}, { department: undefined });

      const input = screen.getByRole('combobox');
      fireEvent.change(input, { target: { value: '' } });
      fireEvent.change(input, { target: { value: '   ' } });

      expect(onListInputChange).not.toHaveBeenCalled();
    });

    it('does not throw when onListInputChange is not provided', () => {
      renderEditor(listColumn, {}, { department: undefined });
      const input = screen.getByRole('combobox');
      expect(() => fireEvent.change(input, { target: { value: 'test' } })).not.toThrow();
    });
  });
});
