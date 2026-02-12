import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { ValidationAlert } from '../../src/validation/ValidationAlert';
import { DataGridProvider } from '../../src/DataGrid/DataGridContext';
import { DIRECTION_LTR } from '../../src/config/schema';

describe('ValidationAlert Component', () => {
  const theme = createTheme();

  const defaultStableValue = {
    columns: [],
    getRowId: () => {},
    multiSelectable: false,
    direction: DIRECTION_LTR,
    translations: {},
    defaultTranslations: {},
  };

  const defaultFilterValue = {
    getHeaderComboSlot: null,
    getFilterInputSlot: null,
    getFilterToInputSlot: null,
  };

  const renderValidationAlert = (errors, stableValue = defaultStableValue) => {
    return render(
      <ThemeProvider theme={theme}>
        <DataGridProvider stableValue={stableValue} filterValue={defaultFilterValue}>
          <ValidationAlert errors={errors} />
        </DataGridProvider>
      </ThemeProvider>
    );
  };

  describe('Render validation errors', () => {
    it('should render nothing when errors is null', () => {
      const { container } = renderValidationAlert(null);
      expect(container.firstChild).toBeNull();
    });

    it('should render nothing when errors is undefined', () => {
      const { container } = renderValidationAlert(undefined);
      expect(container.firstChild).toBeNull();
    });

    it('should render nothing when errors is empty array', () => {
      const { container } = renderValidationAlert([]);
      expect(container.firstChild).toBeNull();
    });

    it('should render Alert component when errors exist', () => {
      const errors = [{ field: 'name' }];
      renderValidationAlert(errors);
      
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });

    it('should render AlertTitle with validation errors text', () => {
      const errors = [{ field: 'name' }];
      renderValidationAlert(errors);
      
      expect(screen.getByText('Please correct the following:')).toBeInTheDocument();
    });
  });

  describe('Test error message display', () => {
    it('should display field name when message is not provided', () => {
      const errors = [{ field: 'email' }];
      renderValidationAlert(errors);
      
      expect(screen.getByText('email')).toBeInTheDocument();
    });

    it('should display field name and message when both are provided', () => {
      const errors = [{ field: 'email', message: 'Invalid email format' }];
      renderValidationAlert(errors);
      
      expect(screen.getByText('email: Invalid email format')).toBeInTheDocument();
    });

    it('should display error in list format', () => {
      const errors = [{ field: 'name', message: 'Name is required' }];
      renderValidationAlert(errors);
      
      const listItem = screen.getByText('name: Name is required');
      expect(listItem.tagName).toBe('LI');
      expect(listItem.closest('ul')).toBeInTheDocument();
    });
  });

  describe('Test multiple errors', () => {
    it('should display all errors in a list', () => {
      const errors = [
        { field: 'name', message: 'Name is required' },
        { field: 'email', message: 'Invalid email format' },
        { field: 'age' },
      ];
      renderValidationAlert(errors);
      
      expect(screen.getByText('name: Name is required')).toBeInTheDocument();
      expect(screen.getByText('email: Invalid email format')).toBeInTheDocument();
      expect(screen.getByText('age')).toBeInTheDocument();
    });

    it('should render correct number of list items', () => {
      const errors = [
        { field: 'field1' },
        { field: 'field2', message: 'Error 2' },
        { field: 'field3', message: 'Error 3' },
      ];
      renderValidationAlert(errors);
      
      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(3);
    });

    it('should handle errors with same field name', () => {
      const errors = [
        { field: 'email', message: 'Required' },
        { field: 'email', message: 'Invalid format' },
      ];
      renderValidationAlert(errors);
      
      expect(screen.getByText('email: Required')).toBeInTheDocument();
      expect(screen.getByText('email: Invalid format')).toBeInTheDocument();
    });
  });

  describe('Test error clearing', () => {
    it('should clear errors when errors prop changes to empty array', () => {
      const { rerender } = renderValidationAlert([{ field: 'name' }]);
      
      expect(screen.getByRole('alert')).toBeInTheDocument();
      
      rerender(
        <ThemeProvider theme={theme}>
          <DataGridProvider stableValue={defaultStableValue} filterValue={defaultFilterValue}>
            <ValidationAlert errors={[]} />
          </DataGridProvider>
        </ThemeProvider>
      );
      
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should clear errors when errors prop changes to null', () => {
      const { rerender } = renderValidationAlert([{ field: 'name' }]);
      
      expect(screen.getByRole('alert')).toBeInTheDocument();
      
      rerender(
        <ThemeProvider theme={theme}>
          <DataGridProvider stableValue={defaultStableValue} filterValue={defaultFilterValue}>
            <ValidationAlert errors={null} />
          </DataGridProvider>
        </ThemeProvider>
      );
      
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should update displayed errors when errors prop changes', () => {
      const { rerender } = renderValidationAlert([{ field: 'name', message: 'Name error' }]);
      
      expect(screen.getByText('name: Name error')).toBeInTheDocument();
      
      rerender(
        <ThemeProvider theme={theme}>
          <DataGridProvider stableValue={defaultStableValue} filterValue={defaultFilterValue}>
            <ValidationAlert errors={[{ field: 'email', message: 'Email error' }]} />
          </DataGridProvider>
        </ThemeProvider>
      );
      
      expect(screen.queryByText('name: Name error')).not.toBeInTheDocument();
      expect(screen.getByText('email: Email error')).toBeInTheDocument();
    });
  });
});
