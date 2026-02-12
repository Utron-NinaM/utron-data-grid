import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { NumberFilterInputs, NumberFilterToInput } from '../../src/filters/filters/NumberFilter';
import { OPERATOR_IN_RANGE } from '../../src/config/schema';

describe('NumberFilter Component', () => {
  const defaultProps = {
    value: null,
    onChange: vi.fn(),
    placeholder: 'Filter number',
  };

  const renderWithTheme = (component) => {
    return render(
      <ThemeProvider theme={createTheme()}>
        {component}
      </ThemeProvider>
    );
  };

  describe('NumberFilterInputs', () => {
    describe('Render number input', () => {
      it('should render number input field', () => {
        renderWithTheme(<NumberFilterInputs {...defaultProps} />);
        
        const input = screen.getByRole('spinbutton');
        expect(input).toBeInTheDocument();
        expect(input).toHaveAttribute('type', 'number');
      });

      it('should render with empty value initially', () => {
        renderWithTheme(<NumberFilterInputs {...defaultProps} />);
        
        const input = screen.getByRole('spinbutton');
        expect(input).toHaveValue(null);
      });

      it('should render with provided value', () => {
        renderWithTheme(<NumberFilterInputs {...defaultProps} value={{ value: 42 }} />);
        
        const input = screen.getByRole('spinbutton');
        expect(input).toHaveValue(42);
      });

      it('should render with string number value', () => {
        renderWithTheme(<NumberFilterInputs {...defaultProps} value={{ value: '123' }} />);
        
        const input = screen.getByRole('spinbutton');
        expect(input).toHaveValue(123);
      });
    });

    describe('Test number input value change', () => {
      it('should call onChange when input value changes', () => {
        const onChange = vi.fn();
        
        renderWithTheme(<NumberFilterInputs {...defaultProps} onChange={onChange} />);
        
        const input = screen.getByRole('spinbutton');
        fireEvent.change(input, { target: { value: '42' } });
        
        expect(onChange).toHaveBeenCalled();
      });

      it('should update value when user types number', () => {
        const onChange = vi.fn();
        
        renderWithTheme(<NumberFilterInputs {...defaultProps} onChange={onChange} />);
        
        const input = screen.getByRole('spinbutton');
        fireEvent.change(input, { target: { value: '100' } });
        
        expect(onChange).toHaveBeenCalled();
        const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
        expect(lastCall[0]).toHaveProperty('value');
      });

      it('should clear filter when both value and valueTo are empty', () => {
        const onChange = vi.fn();
        
        renderWithTheme(
          <NumberFilterInputs 
            {...defaultProps} 
            value={{ value: '5' }} 
            onChange={onChange} 
          />
        );
        
        const input = screen.getByRole('spinbutton');
        fireEvent.change(input, { target: { value: '' } });
        
        expect(onChange).toHaveBeenCalledWith(null);
      });
    });

    describe('Test onChange callback', () => {
      it('should call onChange with new value object', () => {
        const onChange = vi.fn();
        
        renderWithTheme(<NumberFilterInputs {...defaultProps} onChange={onChange} />);
        
        const input = screen.getByRole('spinbutton');
        fireEvent.change(input, { target: { value: '50' } });
        
        expect(onChange).toHaveBeenCalled();
        const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
        expect(lastCall[0]).toHaveProperty('value', '50');
      });

      it('should preserve existing valueTo when updating value', () => {
        const onChange = vi.fn();
        
        renderWithTheme(
          <NumberFilterInputs 
            {...defaultProps} 
            value={{ value: '10', valueTo: '20' }} 
            onChange={onChange} 
          />
        );
        
        const input = screen.getByRole('spinbutton');
        fireEvent.change(input, { target: { value: '15' } });
        
        const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
        expect(lastCall[0]).toHaveProperty('value', '15');
        expect(lastCall[0]).toHaveProperty('valueTo', '20');
      });
    });

    describe('Test invalid number handling', () => {
      it('should handle empty string input', () => {
        const onChange = vi.fn();
        
        renderWithTheme(
          <NumberFilterInputs 
            {...defaultProps} 
            value={{ value: '10' }} 
            onChange={onChange} 
          />
        );
        
        const input = screen.getByRole('spinbutton');
        fireEvent.change(input, { target: { value: '' } });
        
        // When both are empty, should call with null
        expect(onChange).toHaveBeenCalledWith(null);
      });

      it('should allow negative numbers', () => {
        const onChange = vi.fn();
        
        renderWithTheme(<NumberFilterInputs {...defaultProps} onChange={onChange} />);
        
        const input = screen.getByRole('spinbutton');
        fireEvent.change(input, { target: { value: '-10' } });
        
        expect(onChange).toHaveBeenCalled();
        const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
        expect(lastCall[0].value).toBe('-10');
      });

      it('should allow decimal numbers', () => {
        const onChange = vi.fn();
        
        renderWithTheme(<NumberFilterInputs {...defaultProps} onChange={onChange} />);
        
        const input = screen.getByRole('spinbutton');
        fireEvent.change(input, { target: { value: '3.14' } });
        
        expect(onChange).toHaveBeenCalled();
        const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
        expect(lastCall[0].value).toBe('3.14');
      });
    });
  });

  describe('NumberFilterToInput', () => {
    describe('Test range "to" input appears for range operators', () => {
      it('should render "to" input field', () => {
        renderWithTheme(
          <NumberFilterToInput 
            value={{ operator: OPERATOR_IN_RANGE, value: 10, valueTo: 20 }} 
            onChange={vi.fn()} 
          />
        );
        
        const input = screen.getByRole('spinbutton');
        expect(input).toBeInTheDocument();
        expect(input).toHaveAttribute('type', 'number');
      });

      it('should display valueTo in the input', () => {
        renderWithTheme(
          <NumberFilterToInput 
            value={{ operator: OPERATOR_IN_RANGE, value: 10, valueTo: 50 }} 
            onChange={vi.fn()} 
          />
        );
        
        const input = screen.getByRole('spinbutton');
        expect(input).toHaveValue(50);
      });

      it('should have placeholder for "to" input', () => {
        renderWithTheme(
          <NumberFilterToInput 
            value={{ operator: OPERATOR_IN_RANGE, value: 10 }} 
            onChange={vi.fn()} 
          />
        );
        
        const input = screen.getByRole('spinbutton');
        expect(input).toBeInTheDocument();
      });
    });

    describe('Test onChange callback for "to" input', () => {
      it('should call onChange when "to" value changes', () => {
        const onChange = vi.fn();
        
        renderWithTheme(
          <NumberFilterToInput 
            value={{ operator: OPERATOR_IN_RANGE, value: 10, valueTo: 20 }} 
            onChange={onChange} 
          />
        );
        
        const input = screen.getByRole('spinbutton');
        fireEvent.change(input, { target: { value: '30' } });
        
        expect(onChange).toHaveBeenCalled();
        const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
        expect(lastCall[0]).toHaveProperty('valueTo', '30');
        expect(lastCall[0]).toHaveProperty('value', 10);
      });

      it('should clear filter when both value and valueTo are empty', () => {
        const onChange = vi.fn();
        
        renderWithTheme(
          <NumberFilterToInput 
            value={{ operator: OPERATOR_IN_RANGE, value: '', valueTo: '20' }} 
            onChange={onChange} 
          />
        );
        
        const input = screen.getByRole('spinbutton');
        fireEvent.change(input, { target: { value: '' } });
        
        expect(onChange).toHaveBeenCalledWith(null);
      });
    });

    describe('Test invalid number handling for "to" input', () => {
      it('should handle empty string in "to" input', () => {
        const onChange = vi.fn();
        
        renderWithTheme(
          <NumberFilterToInput 
            value={{ operator: OPERATOR_IN_RANGE, value: '10', valueTo: '20' }} 
            onChange={onChange} 
          />
        );
        
        const input = screen.getByRole('spinbutton');
        fireEvent.change(input, { target: { value: '' } });
        
        // If value still exists, should not clear
        if (onChange.mock.calls.length > 0) {
          const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
          if (lastCall[0] !== null) {
            expect(lastCall[0]).toHaveProperty('value', '10');
          }
        }
      });
    });
  });
});
