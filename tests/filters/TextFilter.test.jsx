import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { TextFilter } from '../../src/filters/filters/TextFilter';

describe('TextFilter Component', () => {
  const defaultProps = {
    value: '',
    onChange: vi.fn(),
    placeholder: 'Filter text',
  };

  const renderWithTheme = (props = {}) => {
    return render(
      <ThemeProvider theme={createTheme()}>
        <TextFilter {...defaultProps} {...props} />
      </ThemeProvider>
    );
  };

  describe('Render text input', () => {
    it('should render text input field', () => {
      renderWithTheme();
      
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
      expect(input.tagName).toBe('INPUT');
    });

    it('should render with empty value initially', () => {
      renderWithTheme();
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('');
    });

    it('should render with provided value', () => {
      renderWithTheme({ value: 'test value' });
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('test value');
    });
  });

  describe('Test input value change', () => {
    it('should call onChange when input value changes', () => {
      const onChange = vi.fn();
      
      renderWithTheme({ onChange });
      
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'hello' } });
      
      expect(onChange).toHaveBeenCalled();
      expect(onChange).toHaveBeenCalledWith('hello');
    });

    it('should update input value as user types', () => {
      let currentValue = '';
      const onChange = vi.fn((newValue) => {
        currentValue = newValue;
      });
      
      const { rerender } = renderWithTheme({ value: currentValue, onChange });
      
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'test' } });
      
      rerender(
        <ThemeProvider theme={createTheme()}>
          <TextFilter value={currentValue} onChange={onChange} placeholder={defaultProps.placeholder} />
        </ThemeProvider>
      );
      
      expect(input).toHaveValue('test');
    });
  });

  describe('Test placeholder', () => {
    it('should display placeholder text', () => {
      renderWithTheme({ placeholder: 'Enter search text' });
      
      const input = screen.getByPlaceholderText('Enter search text');
      expect(input).toBeInTheDocument();
    });

    it('should display default placeholder when provided', () => {
      renderWithTheme({ placeholder: 'Filter here' });
      
      const input = screen.getByPlaceholderText('Filter here');
      expect(input).toBeInTheDocument();
    });

    it('should handle empty placeholder', () => {
      renderWithTheme({ placeholder: '' });
      
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
      expect(input.getAttribute('placeholder')).toBe('');
    });
  });

  describe('Test max length constraint', () => {
    it('should enforce max length of 500 characters', () => {
      const onChange = vi.fn();
      const longText = 'a'.repeat(600);
      
      renderWithTheme({ onChange });
      
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: longText } });
      
      // onChange should be called with truncated value
      expect(onChange).toHaveBeenCalled();
      const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
      expect(lastCall[0].length).toBeLessThanOrEqual(500);
    });

    it('should truncate value if it exceeds max length', () => {
      const longValue = 'a'.repeat(600);
      renderWithTheme({ value: longValue });
      
      const input = screen.getByRole('textbox');
      expect(input.value.length).toBeLessThanOrEqual(500);
    });

    it('should allow values within max length', () => {
      const onChange = vi.fn();
      const validText = 'a'.repeat(100);
      
      renderWithTheme({ onChange });
      
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: validText } });
      
      expect(onChange).toHaveBeenCalledWith(validText);
    });

    it('should have maxLength attribute set to 500', () => {
      renderWithTheme();
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('maxLength', '500');
    });
  });

  describe('Test onChange callback', () => {
    it('should call onChange with new value when input changes', () => {
      const onChange = vi.fn();
      
      renderWithTheme({ onChange });
      
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'new text' } });
      
      expect(onChange).toHaveBeenCalled();
      expect(onChange).toHaveBeenCalledWith('new text');
    });

    it('should call onChange with empty string when cleared', () => {
      const onChange = vi.fn();
      
      renderWithTheme({ value: 'existing text', onChange });
      
      // Find and click clear button
      const clearButton = screen.getByRole('button');
      fireEvent.click(clearButton);
      
      expect(onChange).toHaveBeenCalledWith('');
    });

    it('should not call onChange if value does not change', () => {
      const onChange = vi.fn();
      
      renderWithTheme({ value: 'test', onChange });
      
      // Just rendering should not trigger onChange
      expect(onChange).not.toHaveBeenCalled();
    });

    it('should handle onChange being called multiple times', () => {
      const onChange = vi.fn();
      
      renderWithTheme({ onChange });
      
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'a' } });
      fireEvent.change(input, { target: { value: 'ab' } });
      fireEvent.change(input, { target: { value: 'abc' } });
      
      expect(onChange).toHaveBeenCalledTimes(3);
    });
  });
});
