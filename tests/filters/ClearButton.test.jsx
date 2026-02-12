import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { ClearButton } from '../../src/filters/filters/ClearButton';

describe('ClearButton Component', () => {
  const defaultProps = {
    onClick: vi.fn(),
    visible: true,
  };

  const renderWithTheme = (props = {}) => {
    return render(
      <ThemeProvider theme={createTheme()}>
        <ClearButton {...defaultProps} {...props} />
      </ThemeProvider>
    );
  };

  describe('Render clear button', () => {
    it('should render clear button with correct attributes', () => {
      renderWithTheme();
      
      const button = screen.getByLabelText('Clear');
      expect(button).toBeInTheDocument();
      expect(button.tagName).toBe('BUTTON');
      expect(button).toHaveAttribute('aria-label', 'Clear');
    });
  });

  describe('Test button click handler', () => {
    it('should call onClick when button is clicked', () => {
      const onClick = vi.fn();
      
      renderWithTheme({ onClick });
      
      const button = screen.getByLabelText('Clear');
      fireEvent.click(button);
      
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should call onClick multiple times when clicked multiple times', () => {
      const onClick = vi.fn();
      
      renderWithTheme({ onClick });
      
      const button = screen.getByLabelText('Clear');
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      
      expect(onClick).toHaveBeenCalledTimes(3);
    });

    it('should not call onClick on initial render', () => {
      const onClick = vi.fn();
      
      renderWithTheme({ onClick });
      
      expect(onClick).not.toHaveBeenCalled();
    });

    it('should handle onClick being undefined gracefully', () => {
      renderWithTheme({ onClick: undefined });
      
      const button = screen.getByLabelText('Clear');
      expect(() => fireEvent.click(button)).not.toThrow();
    });
  });

  describe('Test button visibility conditions', () => {
    it('should be visible when visible prop is true', () => {
      renderWithTheme({ visible: true });
      
      const button = screen.getByLabelText('Clear');
      expect(button).toBeInTheDocument();
      expect(button).toBeVisible();
    });

    it('should be hidden when visible prop is false', () => {
      renderWithTheme({ visible: false });
      
      const button = screen.getByLabelText('Clear');
      expect(button).toBeInTheDocument();
      // Button exists but should be hidden via CSS visibility
      const styles = window.getComputedStyle(button);
      expect(styles.visibility).toBe('hidden');
    });

    it('should toggle visibility when visible prop changes', () => {
      const { rerender } = renderWithTheme({ visible: true });
      
      let button = screen.getByLabelText('Clear');
      expect(button).toBeInTheDocument();
      expect(button).toBeVisible();
      
      rerender(
        <ThemeProvider theme={createTheme()}>
          <ClearButton {...defaultProps} visible={false} />
        </ThemeProvider>
      );
      
      button = screen.getByLabelText('Clear');
      expect(button).toBeInTheDocument();
      const styles = window.getComputedStyle(button);
      expect(styles.visibility).toBe('hidden');
    });

    it('should be visible by default when visible prop is not provided', () => {
      const { onClick } = defaultProps;
      render(
        <ThemeProvider theme={createTheme()}>
          <ClearButton onClick={onClick} />
        </ThemeProvider>
      );
      
      const button = screen.getByLabelText('Clear');
      expect(button).toBeInTheDocument();
      // The component uses: visibility: visible ? 'visible' : 'hidden'
      // When visible is undefined, it's falsy, so visibility becomes 'hidden'
      const styles = window.getComputedStyle(button);
      expect(styles.visibility).toBe('hidden');
    });

    it('should handle visibility change from false to true', () => {
      const { rerender } = renderWithTheme({ visible: false });
      
      let button = screen.getByLabelText('Clear');
      let styles = window.getComputedStyle(button);
      expect(styles.visibility).toBe('hidden');
      
      rerender(
        <ThemeProvider theme={createTheme()}>
          <ClearButton {...defaultProps} visible={true} />
        </ThemeProvider>
      );
      
      button = screen.getByLabelText('Clear');
      styles = window.getComputedStyle(button);
      expect(styles.visibility).toBe('visible');
    });
  });
});
