import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { OperatorDropdown } from '../../src/filters/filters/OperatorDropdown';
import { DataGridStableContext } from '../../src/DataGrid/DataGridContext';
import { 
  OPERATOR_EQUALS, 
  OPERATOR_NOT_EQUAL,
  OPERATOR_CONTAINS,
  OPERATOR_GREATER_THAN,
  OPERATOR_PERIOD,
  TEXT_OP_IDS,
  NUMBER_OP_IDS,
  DATE_OP_IDS,
  DIRECTION_LTR,
  DIRECTION_RTL
} from '../../src/config/schema';

describe('OperatorDropdown Component', () => {
  const defaultProps = {
    value: null,
    onChange: vi.fn(),
    operatorMap: TEXT_OP_IDS,
  };

  const defaultContextValue = {
    direction: DIRECTION_LTR,
  };

  const renderWithTheme = (props = {}, contextValue = defaultContextValue) => {
    return render(
      <ThemeProvider theme={createTheme()}>
        <DataGridStableContext.Provider value={contextValue}>
          <OperatorDropdown {...defaultProps} {...props} />
        </DataGridStableContext.Provider>
      </ThemeProvider>
    );
  };

  describe('Render dropdown', () => {
    it('should render operator dropdown button', () => {
      renderWithTheme();
      
      const button = screen.getByLabelText('Operator');
      expect(button).toBeInTheDocument();
      expect(button.tagName).toBe('BUTTON');
    });

    it('should render with default or provided operator value', () => {
      // Test with null value (default)
      const { rerender } = renderWithTheme();
      let button = screen.getByLabelText('Operator');
      expect(button).toBeInTheDocument();
      
      // Test with provided operator value
      rerender(
        <ThemeProvider theme={createTheme()}>
          <DataGridStableContext.Provider value={defaultContextValue}>
            <OperatorDropdown {...defaultProps} value={{ operator: OPERATOR_CONTAINS }} />
          </DataGridStableContext.Provider>
        </ThemeProvider>
      );
      button = screen.getByLabelText('Operator');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Test operator selection', () => {
    it('should open menu when button is clicked', async () => {
      renderWithTheme();
      
      const button = screen.getByLabelText('Operator');
      fireEvent.click(button);
      
      await waitFor(() => {
        const menu = screen.getByRole('menu');
        expect(menu).toBeInTheDocument();
      });
    });

    it('should close menu when menu item is selected', async () => {
      const onChange = vi.fn();
      renderWithTheme({ onChange });
      
      const button = screen.getByLabelText('Operator');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });
      
      const menuItems = screen.getAllByRole('menuitem');
      expect(menuItems.length).toBeGreaterThan(0);
      fireEvent.click(menuItems[0]);
      
      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      });
    });

    it('should call onChange when operator is selected', async () => {
      const onChange = vi.fn();
      const currentValue = { operator: OPERATOR_EQUALS, value: 'test' };
      
      renderWithTheme({ value: currentValue, onChange });
      
      const button = screen.getByLabelText('Operator');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });
      
      const menuItems = screen.getAllByRole('menuitem');
      expect(menuItems.length).toBeGreaterThan(1);
      fireEvent.click(menuItems[1]);
      
      expect(onChange).toHaveBeenCalled();
      const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
      expect(lastCall[0]).toHaveProperty('operator');
      expect(lastCall[0]).toHaveProperty('value', 'test');
    });

    it('should preserve existing value properties when operator changes', async () => {
      const onChange = vi.fn();
      const currentValue = { operator: OPERATOR_EQUALS, value: 'existing', otherProp: 'preserved' };
      
      renderWithTheme({ value: currentValue, onChange });
      
      const button = screen.getByLabelText('Operator');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });
      
      const menuItems = screen.getAllByRole('menuitem');
      expect(menuItems.length).toBeGreaterThan(1);
      fireEvent.click(menuItems[1]);
      
      expect(onChange).toHaveBeenCalled();
      const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
      expect(lastCall[0]).toHaveProperty('value', 'existing');
      expect(lastCall[0]).toHaveProperty('otherProp', 'preserved');
    });
  });

  describe('Test available operators per field type', () => {
    it('should render text operators for TEXT_OP_IDS', async () => {
      renderWithTheme({ operatorMap: TEXT_OP_IDS });
      
      const button = screen.getByLabelText('Operator');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });
      
      const menuItems = screen.getAllByRole('menuitem');
      expect(menuItems.length).toBeGreaterThan(0);
      expect(menuItems.length).toBe(TEXT_OP_IDS.length);
    });

    it('should render number operators for NUMBER_OP_IDS', async () => {
      renderWithTheme({ operatorMap: NUMBER_OP_IDS });
      
      const button = screen.getByLabelText('Operator');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });
      
      const menuItems = screen.getAllByRole('menuitem');
      expect(menuItems.length).toBeGreaterThan(0);
      expect(menuItems.length).toBe(NUMBER_OP_IDS.length);
    });

    it('should render date operators for DATE_OP_IDS', async () => {
      renderWithTheme({ operatorMap: DATE_OP_IDS });
      
      const button = screen.getByLabelText('Operator');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });
      
      const menuItems = screen.getAllByRole('menuitem');
      expect(menuItems.length).toBeGreaterThan(0);
      expect(menuItems.length).toBe(DATE_OP_IDS.length);
    });

  });

  describe('Test onChange callback', () => {
    it('should call onChange with new operator value', async () => {
      const onChange = vi.fn();
      
      renderWithTheme({ onChange });
      
      const button = screen.getByLabelText('Operator');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });
      
      const menuItems = screen.getAllByRole('menuitem');
      expect(menuItems.length).toBeGreaterThan(0);
      fireEvent.click(menuItems[0]);
      
      expect(onChange).toHaveBeenCalled();
      const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
      expect(lastCall[0]).toHaveProperty('operator');
    });

    it('should call onChange with updated operator when different operator is selected', async () => {
      const onChange = vi.fn();
      const currentValue = { operator: OPERATOR_EQUALS };
      
      renderWithTheme({ value: currentValue, onChange });
      
      const button = screen.getByLabelText('Operator');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });
      
      const menuItems = screen.getAllByRole('menuitem');
      expect(menuItems.length).toBeGreaterThan(1);
      fireEvent.click(menuItems[1]);
      
      expect(onChange).toHaveBeenCalled();
      const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
      expect(lastCall[0].operator).not.toBe(OPERATOR_EQUALS);
    });

    it('should not call onChange on initial render', () => {
      const onChange = vi.fn();
      
      renderWithTheme({ onChange });
      
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('Test current value display', () => {
    it('should display default operator icon when value is null', () => {
      renderWithTheme({ value: null });
      
      const button = screen.getByLabelText('Operator');
      expect(button).toBeInTheDocument();
      // Verify icon is rendered (FontAwesome icons render as SVG)
      const icon = button.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should display operator icon for current operator', () => {
      renderWithTheme({ value: { operator: OPERATOR_CONTAINS } });
      
      const button = screen.getByLabelText('Operator');
      expect(button).toBeInTheDocument();
      // Verify icon is rendered
      const icon = button.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should update displayed operator when value changes', () => {
      const { rerender } = renderWithTheme({ value: { operator: OPERATOR_EQUALS } });
      
      let button = screen.getByLabelText('Operator');
      expect(button).toBeInTheDocument();
      let icon = button.querySelector('svg');
      expect(icon).toBeInTheDocument();
      
      rerender(
        <ThemeProvider theme={createTheme()}>
          <DataGridStableContext.Provider value={defaultContextValue}>
            <OperatorDropdown {...defaultProps} value={{ operator: OPERATOR_NOT_EQUAL }} />
          </DataGridStableContext.Provider>
        </ThemeProvider>
      );
      
      button = screen.getByLabelText('Operator');
      expect(button).toBeInTheDocument();
      // Verify icon is still present after update
      icon = button.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });
});
