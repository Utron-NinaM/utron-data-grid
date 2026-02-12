import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { DataGridProvider } from '../../src/DataGrid/DataGridContext';
import { PaginationBar } from '../../src/pagination/PaginationBar';
import { DIRECTION_LTR } from '../../src/config/schema';

describe('PaginationBar Component', () => {
  const defaultProps = {
    page: 0,
    pageSize: 10,
    totalRows: 100,
    pageSizeOptions: [10, 25, 50, 100],
    onPageChange: vi.fn(),
    onPageSizeChange: vi.fn(),
  };

  const renderWithProviders = (props = {}, contextValue = { direction: DIRECTION_LTR }) => {
    return render(
      <ThemeProvider theme={createTheme()}>
        <DataGridProvider stableValue={contextValue} filterValue={null}>
          <PaginationBar {...defaultProps} {...props} />
        </DataGridProvider>
      </ThemeProvider>
    );
  };

  describe('Render pagination bar', () => {
    it('should render pagination bar with all elements', () => {
      renderWithProviders();
      
      expect(screen.getByText('Rows per page')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByText(/1–10 of 100/)).toBeInTheDocument();
      expect(screen.getByLabelText('First page')).toBeInTheDocument();
      expect(screen.getByLabelText('Previous page')).toBeInTheDocument();
      expect(screen.getByLabelText('Next page')).toBeInTheDocument();
      expect(screen.getByLabelText('Last page')).toBeInTheDocument();
    });

    it('should render with correct page size selector value', () => {
      renderWithProviders({ pageSize: 25 });
      
      const select = screen.getByRole('combobox');
      expect(select).toHaveTextContent('25');
    });

    it('should render all page size options', () => {
      renderWithProviders();
      
      const select = screen.getByRole('combobox');
      fireEvent.mouseDown(select);
      
      expect(screen.getByRole('option', { name: '10' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '25' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '50' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '100' })).toBeInTheDocument();
    });
  });

  describe('Test pagination range text', () => {
    it('should display correct range for first page', () => {
      renderWithProviders({ page: 0, pageSize: 10, totalRows: 100 });
      
      expect(screen.getByText('1–10 of 100')).toBeInTheDocument();
    });

    it('should display correct range for middle page', () => {
      renderWithProviders({ page: 2, pageSize: 10, totalRows: 100 });
      
      expect(screen.getByText('21–30 of 100')).toBeInTheDocument();
    });

    it('should display correct range for last page', () => {
      renderWithProviders({ page: 9, pageSize: 10, totalRows: 100 });
      
      expect(screen.getByText('91–100 of 100')).toBeInTheDocument();
    });

    it('should display correct range when last page is not full', () => {
      renderWithProviders({ page: 9, pageSize: 10, totalRows: 95 });
      
      expect(screen.getByText('91–95 of 95')).toBeInTheDocument();
    });

    it('should display 0–0 of 0 when totalRows is 0', () => {
      renderWithProviders({ page: 0, pageSize: 10, totalRows: 0 });
      
      expect(screen.getByText('0–0 of 0')).toBeInTheDocument();
    });
  });

  describe('Test button disabled states', () => {
    it('should disable first and prev buttons on first page', () => {
      renderWithProviders({ page: 0, totalRows: 100 });
      
      const firstButton = screen.getByLabelText('First page');
      const prevButton = screen.getByLabelText('Previous page');
      
      expect(firstButton).toBeDisabled();
      expect(prevButton).toBeDisabled();
    });

    it('should disable next and last buttons on last page', () => {
      renderWithProviders({ page: 9, pageSize: 10, totalRows: 100 });
      
      const nextButton = screen.getByLabelText('Next page');
      const lastButton = screen.getByLabelText('Last page');
      
      expect(nextButton).toBeDisabled();
      expect(lastButton).toBeDisabled();
    });

    it('should enable all buttons on middle page', () => {
      renderWithProviders({ page: 5, pageSize: 10, totalRows: 100 });
      
      const firstButton = screen.getByLabelText('First page');
      const prevButton = screen.getByLabelText('Previous page');
      const nextButton = screen.getByLabelText('Next page');
      const lastButton = screen.getByLabelText('Last page');
      
      expect(firstButton).not.toBeDisabled();
      expect(prevButton).not.toBeDisabled();
      expect(nextButton).not.toBeDisabled();
      expect(lastButton).not.toBeDisabled();
    });

    it('should disable all buttons when there is only one page', () => {
      renderWithProviders({ page: 0, pageSize: 10, totalRows: 5 });
      
      const firstButton = screen.getByLabelText('First page');
      const prevButton = screen.getByLabelText('Previous page');
      const nextButton = screen.getByLabelText('Next page');
      const lastButton = screen.getByLabelText('Last page');
      
      expect(firstButton).toBeDisabled();
      expect(prevButton).toBeDisabled();
      expect(nextButton).toBeDisabled();
      expect(lastButton).toBeDisabled();
    });
  });

  describe('Test page navigation buttons', () => {
    it('should call onPageChange with 0 when first page button is clicked', () => {
      const onPageChange = vi.fn();
      renderWithProviders({ page: 5, onPageChange });
      
      const firstButton = screen.getByLabelText('First page');
      fireEvent.click(firstButton);
      
      expect(onPageChange).toHaveBeenCalledWith(0);
    });

    it('should call onPageChange with previous page when prev button is clicked', () => {
      const onPageChange = vi.fn();
      renderWithProviders({ page: 5, onPageChange });
      
      const prevButton = screen.getByLabelText('Previous page');
      fireEvent.click(prevButton);
      
      expect(onPageChange).toHaveBeenCalledWith(4);
    });

    it('should call onPageChange with next page when next button is clicked', () => {
      const onPageChange = vi.fn();
      renderWithProviders({ page: 5, onPageChange });
      
      const nextButton = screen.getByLabelText('Next page');
      fireEvent.click(nextButton);
      
      expect(onPageChange).toHaveBeenCalledWith(6);
    });

    it('should call onPageChange with last page when last button is clicked', () => {
      const onPageChange = vi.fn();
      renderWithProviders({ page: 5, pageSize: 10, totalRows: 100, onPageChange });
      
      const lastButton = screen.getByLabelText('Last page');
      fireEvent.click(lastButton);
      
      expect(onPageChange).toHaveBeenCalledWith(9);
    });

    it('should not call onPageChange when disabled buttons are clicked', () => {
      const onPageChange = vi.fn();
      renderWithProviders({ page: 0, onPageChange });
      
      const firstButton = screen.getByLabelText('First page');
      const prevButton = screen.getByLabelText('Previous page');
      
      fireEvent.click(firstButton);
      fireEvent.click(prevButton);
      
      expect(onPageChange).not.toHaveBeenCalled();
    });
  });

  describe('Test page size selector', () => {
    it('should render page size selector with current value', () => {
      renderWithProviders({ pageSize: 25 });
      
      const select = screen.getByRole('combobox');
      expect(select).toHaveTextContent('25');
    });

    it('should call onPageSizeChange when page size is changed', () => {
      const onPageSizeChange = vi.fn();
      renderWithProviders({ pageSize: 10, onPageSizeChange });
      
      const select = screen.getByRole('combobox');
      fireEvent.mouseDown(select);
      
      const option = screen.getByRole('option', { name: '25' });
      fireEvent.click(option);
      
      expect(onPageSizeChange).toHaveBeenCalledWith(25);
    });

    it('should convert page size value to number', () => {
      const onPageSizeChange = vi.fn();
      renderWithProviders({ pageSize: 10, onPageSizeChange });
      
      const select = screen.getByRole('combobox');
      fireEvent.mouseDown(select);
      
      const option = screen.getByRole('option', { name: '50' });
      fireEvent.click(option);
      
      expect(onPageSizeChange).toHaveBeenCalledWith(50);
      expect(typeof onPageSizeChange.mock.calls[0][0]).toBe('number');
    });
  });

  describe('Test onPageChange callback', () => {
    it('should call onPageChange when first page button is clicked', () => {
      const onPageChange = vi.fn();
      renderWithProviders({ page: 3, onPageChange });
      
      fireEvent.click(screen.getByLabelText('First page'));
      expect(onPageChange).toHaveBeenCalledTimes(1);
      expect(onPageChange).toHaveBeenCalledWith(0);
    });

    it('should call onPageChange when prev page button is clicked', () => {
      const onPageChange = vi.fn();
      renderWithProviders({ page: 3, onPageChange });
      
      fireEvent.click(screen.getByLabelText('Previous page'));
      expect(onPageChange).toHaveBeenCalledTimes(1);
      expect(onPageChange).toHaveBeenCalledWith(2);
    });

    it('should call onPageChange when next page button is clicked', () => {
      const onPageChange = vi.fn();
      renderWithProviders({ page: 3, onPageChange });
      
      fireEvent.click(screen.getByLabelText('Next page'));
      expect(onPageChange).toHaveBeenCalledTimes(1);
      expect(onPageChange).toHaveBeenCalledWith(4);
    });

    it('should call onPageChange when last page button is clicked', () => {
      const onPageChange = vi.fn();
      renderWithProviders({ page: 3, pageSize: 10, totalRows: 100, onPageChange });
      
      fireEvent.click(screen.getByLabelText('Last page'));
      expect(onPageChange).toHaveBeenCalledTimes(1);
      expect(onPageChange).toHaveBeenCalledWith(9);
    });
  });

  describe('Test onPageSizeChange callback', () => {
    it('should call onPageSizeChange when page size is selected', () => {
      const onPageSizeChange = vi.fn();
      renderWithProviders({ pageSize: 10, onPageSizeChange });
      
      const select = screen.getByRole('combobox');
      fireEvent.mouseDown(select);
      fireEvent.click(screen.getByRole('option', { name: '25' }));
      
      expect(onPageSizeChange).toHaveBeenCalledTimes(1);
      expect(onPageSizeChange).toHaveBeenCalledWith(25);
    });

    it('should call onPageSizeChange with correct value for each option', () => {
      const onPageSizeChange = vi.fn();
      renderWithProviders({ pageSize: 10, onPageSizeChange });
      
      const select = screen.getByRole('combobox');
      fireEvent.mouseDown(select);
      fireEvent.click(screen.getByRole('option', { name: '50' }));
      
      expect(onPageSizeChange).toHaveBeenCalledWith(50);
    });
  });
});
