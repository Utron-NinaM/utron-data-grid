import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

  describe('FIELD_TYPE_LIST with listDescriptionField', () => {
    const optionsWithDescription = [
      { value: '201', label: '201 מעטפות כיס 3424 A4', description: 'מעטפות כיס 3424 A4' },
      { value: '202', label: '202 Other', description: 'Other desc' },
      { value: '203', label: '203 No desc' },
    ];

    it('calls onChange for both column field and listDescriptionField when selecting option with description', async () => {
      const onChange = vi.fn();
      const column = {
        field: 'sku',
        headerName: 'SKU',
        type: FIELD_TYPE_LIST,
        listDescriptionField: 'skuDescription',
        options: optionsWithDescription,
      };
      renderEditor(column, {}, { sku: undefined, skuDescription: undefined }, onChange);

      const input = screen.getByRole('combobox');
      fireEvent.mouseDown(input);

      await waitFor(() => {
        expect(screen.getByText('201 מעטפות כיס 3424 A4')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('201 מעטפות כיס 3424 A4'));

      expect(onChange).toHaveBeenCalledWith('sku', '201');
      expect(onChange).toHaveBeenCalledWith('skuDescription', 'מעטפות כיס 3424 A4');
    });

    it('calls onChange only for column field when listDescriptionField is not set', async () => {
      const onChange = vi.fn();
      const column = {
        field: 'sku',
        headerName: 'SKU',
        type: FIELD_TYPE_LIST,
        options: optionsWithDescription,
      };
      renderEditor(column, {}, { sku: undefined }, onChange);

      const input = screen.getByRole('combobox');
      fireEvent.mouseDown(input);

      await waitFor(() => {
        expect(screen.getByText('201 מעטפות כיס 3424 A4')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('201 מעטפות כיס 3424 A4'));

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith('sku', '201');
    });

    it('sets description to undefined when selecting option without description and listDescriptionField is set', async () => {
      const onChange = vi.fn();
      const column = {
        field: 'sku',
        headerName: 'SKU',
        type: FIELD_TYPE_LIST,
        listDescriptionField: 'skuDescription',
        options: optionsWithDescription,
      };
      renderEditor(column, {}, { sku: undefined, skuDescription: undefined }, onChange);

      const input = screen.getByRole('combobox');
      fireEvent.mouseDown(input);

      await waitFor(() => {
        expect(screen.getByText('203 No desc')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('203 No desc'));

      expect(onChange).toHaveBeenCalledWith('sku', '203');
      expect(onChange).toHaveBeenCalledWith('skuDescription', undefined);
    });
  });
});
