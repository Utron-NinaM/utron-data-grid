import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { DataGridProvider } from '../../src/DataGrid/DataGridContext';
import { PaginationIcons } from '../../src/pagination/PaginationIcons';
import { DIRECTION_LTR, DIRECTION_RTL } from '../../src/config/schema';

describe('PaginationIcons Component', () => {
  const defaultProps = {
    onFirstPage: vi.fn(),
    onPrevPage: vi.fn(),
    onNextPage: vi.fn(),
    onLastPage: vi.fn(),
    firstDisabled: false,
    prevDisabled: false,
    nextDisabled: false,
    lastDisabled: false,
  };

  const renderWithProviders = (props = {}, contextValue = { direction: DIRECTION_LTR }) => {
    return render(
      <ThemeProvider theme={createTheme()}>
        <DataGridProvider stableValue={contextValue} filterValue={null}>
          <PaginationIcons {...defaultProps} {...props} />
        </DataGridProvider>
      </ThemeProvider>
    );
  };

  describe('Render pagination icons', () => {
    it('should render all four icon buttons', () => {
      renderWithProviders();
      
      expect(screen.getByLabelText('First page')).toBeInTheDocument();
      expect(screen.getByLabelText('Previous page')).toBeInTheDocument();
      expect(screen.getByLabelText('Next page')).toBeInTheDocument();
      expect(screen.getByLabelText('Last page')).toBeInTheDocument();
    });

    it('should render with correct aria labels', () => {
      renderWithProviders();
      
      expect(screen.getByLabelText('First page')).toBeInTheDocument();
      expect(screen.getByLabelText('Previous page')).toBeInTheDocument();
      expect(screen.getByLabelText('Next page')).toBeInTheDocument();
      expect(screen.getByLabelText('Last page')).toBeInTheDocument();
    });
  });

  describe('Test icon button clicks', () => {
    it('should call onFirstPage when first page button is clicked', () => {
      const onFirstPage = vi.fn();
      renderWithProviders({ onFirstPage });
      
      const button = screen.getByLabelText('First page');
      fireEvent.click(button);
      
      expect(onFirstPage).toHaveBeenCalledTimes(1);
    });

    it('should call onPrevPage when previous page button is clicked', () => {
      const onPrevPage = vi.fn();
      renderWithProviders({ onPrevPage });
      
      const button = screen.getByLabelText('Previous page');
      fireEvent.click(button);
      
      expect(onPrevPage).toHaveBeenCalledTimes(1);
    });

    it('should call onNextPage when next page button is clicked', () => {
      const onNextPage = vi.fn();
      renderWithProviders({ onNextPage });
      
      const button = screen.getByLabelText('Next page');
      fireEvent.click(button);
      
      expect(onNextPage).toHaveBeenCalledTimes(1);
    });

    it('should call onLastPage when last page button is clicked', () => {
      const onLastPage = vi.fn();
      renderWithProviders({ onLastPage });
      
      const button = screen.getByLabelText('Last page');
      fireEvent.click(button);
      
      expect(onLastPage).toHaveBeenCalledTimes(1);
    });

    it('should not call callback when disabled button is clicked', () => {
      const onFirstPage = vi.fn();
      renderWithProviders({ onFirstPage, firstDisabled: true });
      
      const button = screen.getByLabelText('First page');
      fireEvent.click(button);
      
      expect(onFirstPage).not.toHaveBeenCalled();
    });

    it('should call multiple callbacks correctly', () => {
      const onFirstPage = vi.fn();
      const onPrevPage = vi.fn();
      const onNextPage = vi.fn();
      const onLastPage = vi.fn();
      
      renderWithProviders({ onFirstPage, onPrevPage, onNextPage, onLastPage });
      
      fireEvent.click(screen.getByLabelText('First page'));
      fireEvent.click(screen.getByLabelText('Previous page'));
      fireEvent.click(screen.getByLabelText('Next page'));
      fireEvent.click(screen.getByLabelText('Last page'));
      
      expect(onFirstPage).toHaveBeenCalledTimes(1);
      expect(onPrevPage).toHaveBeenCalledTimes(1);
      expect(onNextPage).toHaveBeenCalledTimes(1);
      expect(onLastPage).toHaveBeenCalledTimes(1);
    });
  });

  describe('Test disabled state styling', () => {
    it('should disable first page button when firstDisabled is true', () => {
      renderWithProviders({ firstDisabled: true });
      
      const button = screen.getByLabelText('First page');
      expect(button).toBeDisabled();
    });

    it('should disable previous page button when prevDisabled is true', () => {
      renderWithProviders({ prevDisabled: true });
      
      const button = screen.getByLabelText('Previous page');
      expect(button).toBeDisabled();
    });

    it('should disable next page button when nextDisabled is true', () => {
      renderWithProviders({ nextDisabled: true });
      
      const button = screen.getByLabelText('Next page');
      expect(button).toBeDisabled();
    });

    it('should disable last page button when lastDisabled is true', () => {
      renderWithProviders({ lastDisabled: true });
      
      const button = screen.getByLabelText('Last page');
      expect(button).toBeDisabled();
    });

    it('should enable all buttons when all disabled props are false', () => {
      renderWithProviders({
        firstDisabled: false,
        prevDisabled: false,
        nextDisabled: false,
        lastDisabled: false,
      });
      
      expect(screen.getByLabelText('First page')).not.toBeDisabled();
      expect(screen.getByLabelText('Previous page')).not.toBeDisabled();
      expect(screen.getByLabelText('Next page')).not.toBeDisabled();
      expect(screen.getByLabelText('Last page')).not.toBeDisabled();
    });

    it('should handle mixed disabled states', () => {
      renderWithProviders({
        firstDisabled: true,
        prevDisabled: true,
        nextDisabled: false,
        lastDisabled: false,
      });
      
      expect(screen.getByLabelText('First page')).toBeDisabled();
      expect(screen.getByLabelText('Previous page')).toBeDisabled();
      expect(screen.getByLabelText('Next page')).not.toBeDisabled();
      expect(screen.getByLabelText('Last page')).not.toBeDisabled();
    });
  });

  describe('Test icon rendering', () => {
    it('should render FirstPageIcon for first button in LTR mode', () => {
      renderWithProviders({}, { direction: DIRECTION_LTR });
      
      const button = screen.getByLabelText('First page');
      const icon = button.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should render ChevronLeftIcon for prev button in LTR mode', () => {
      renderWithProviders({}, { direction: DIRECTION_LTR });
      
      const button = screen.getByLabelText('Previous page');
      const icon = button.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should render ChevronRightIcon for next button in LTR mode', () => {
      renderWithProviders({}, { direction: DIRECTION_LTR });
      
      const button = screen.getByLabelText('Next page');
      const icon = button.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should render LastPageIcon for last button in LTR mode', () => {
      renderWithProviders({}, { direction: DIRECTION_LTR });
      
      const button = screen.getByLabelText('Last page');
      const icon = button.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should render LastPageIcon for first button in RTL mode', () => {
      renderWithProviders({}, { direction: DIRECTION_RTL });
      
      const button = screen.getByLabelText('First page');
      const icon = button.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should render ChevronRightIcon for prev button in RTL mode', () => {
      renderWithProviders({}, { direction: DIRECTION_RTL });
      
      const button = screen.getByLabelText('Previous page');
      const icon = button.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should render ChevronLeftIcon for next button in RTL mode', () => {
      renderWithProviders({}, { direction: DIRECTION_RTL });
      
      const button = screen.getByLabelText('Next page');
      const icon = button.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should render FirstPageIcon for last button in RTL mode', () => {
      renderWithProviders({}, { direction: DIRECTION_RTL });
      
      const button = screen.getByLabelText('Last page');
      const icon = button.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should default to LTR when context is not provided', () => {
      render(
        <ThemeProvider theme={createTheme()}>
          <DataGridProvider stableValue={null} filterValue={null}>
            <PaginationIcons {...defaultProps} />
          </DataGridProvider>
        </ThemeProvider>
      );
      
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(4);
    });

    it('should default to LTR when direction is not in context', () => {
      renderWithProviders({}, {});
      
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(4);
    });
  });
});
