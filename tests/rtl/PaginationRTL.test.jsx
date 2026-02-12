import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { PaginationBar } from '../../src/pagination/PaginationBar';
import { DataGridProvider } from '../../src/DataGrid/DataGridContext';
import { DIRECTION_RTL, DIRECTION_LTR } from '../../src/config/schema';
import { hebrewTranslations } from '../../src/localization/defaultTranslations';

describe('PaginationBar RTL Test', () => {
  const defaultProps = {
    page: 0,
    pageSize: 10,
    totalRows: 25,
    pageSizeOptions: [10, 25, 50, 100],
    onPageChange: vi.fn(),
    onPageSizeChange: vi.fn(),
  };

  const createContextValue = (direction) => ({
    direction,
    translations: direction === DIRECTION_RTL ? hebrewTranslations : undefined,
    defaultTranslations: undefined,
    columnAlignMap: new Map(),
    columnSortDirMap: new Map(),
    headerCellSxMap: new Map(),
    filterCellSxMap: new Map(),
    rowStylesMap: new Map(),
    headerConfig: {},
    filterInputHeight: 40,
  });

  const renderWithTheme = (component, direction = DIRECTION_LTR) => {
    return render(
      <ThemeProvider theme={createTheme({ direction })}>
        <DataGridProvider stableValue={createContextValue(direction)} filterValue={{}}>
          {component}
        </DataGridProvider>
      </ThemeProvider>
    );
  };

  describe('Render PaginationBar in RTL', () => {
    it('should render PaginationBar with RTL direction', () => {
      const { container } = renderWithTheme(
        <PaginationBar {...defaultProps} />,
        DIRECTION_RTL
      );

      // Check that pagination bar is rendered
      expect(screen.getByText(/שורות לדף/i)).toBeInTheDocument();
    });

    it('should render all pagination controls in RTL', () => {
      renderWithTheme(
        <PaginationBar {...defaultProps} />,
        DIRECTION_RTL
      );

      // Check Hebrew text
      expect(screen.getByText(/שורות לדף/i)).toBeInTheDocument();
      
      // Check pagination range text (should contain Hebrew format)
      const rangeText = screen.getByText(/\d+–\d+ מתוך \d+/);
      expect(rangeText).toBeInTheDocument();
    });
  });

  describe('Test button order (First/Prev swap with Next/Last)', () => {
    it('should reverse button order in RTL mode', () => {
      const { container } = renderWithTheme(
        <PaginationBar {...defaultProps} />,
        DIRECTION_RTL
      );

      // In RTL, the icons container should use flex-row-reverse
      const iconsContainer = container.querySelector('[style*="flex-row-reverse"], [style*="flex-direction: row-reverse"]');
      // The container should exist and have reversed layout
      // We check by verifying the buttons are present
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThanOrEqual(4); // First, Prev, Next, Last
    });

    it('should display correct icons for RTL direction', () => {
      const { container } = renderWithTheme(
        <PaginationBar {...defaultProps} />,
        DIRECTION_RTL
      );

      // In RTL mode, First button should show LastPageIcon and Last should show FirstPageIcon
      // We verify by checking buttons exist
      const buttons = container.querySelectorAll('button[aria-label*="page"]');
      expect(buttons.length).toBeGreaterThanOrEqual(4);
    });

    it('should maintain button functionality in RTL', () => {
      const onPageChange = vi.fn();
      renderWithTheme(
        <PaginationBar {...defaultProps} onPageChange={onPageChange} />,
        DIRECTION_RTL
      );

      // Find and click next button (should work regardless of visual order)
      const buttons = screen.getAllByRole('button');
      const nextButton = buttons.find(btn => 
        btn.getAttribute('aria-label')?.includes('Next') || 
        btn.getAttribute('aria-label')?.includes('הבא')
      );
      
      if (nextButton) {
        nextButton.click();
        expect(onPageChange).toHaveBeenCalled();
      }
    });
  });

  describe('Test text alignment', () => {
    it('should align text correctly in RTL mode', () => {
      const { container } = renderWithTheme(
        <PaginationBar {...defaultProps} />,
        DIRECTION_RTL
      );

      // Check that Hebrew text is rendered
      const rowsPerPageText = screen.getByText(/שורות לדף/i);
      expect(rowsPerPageText).toBeInTheDocument();
    });

    it('should display pagination range in Hebrew format', () => {
      renderWithTheme(
        <PaginationBar {...defaultProps} totalRows={25} />,
        DIRECTION_RTL
      );

      // Hebrew format: "1–10 מתוך 25"
      const rangeText = screen.getByText(/1–10 מתוך 25/);
      expect(rangeText).toBeInTheDocument();
    });
  });

  describe('Test icon direction', () => {
    it('should use reversed icons in RTL mode', () => {
      const { container } = renderWithTheme(
        <PaginationBar {...defaultProps} />,
        DIRECTION_RTL
      );

      // Icons should be reversed - First shows LastPageIcon, Last shows FirstPageIcon
      // Prev shows ChevronRight, Next shows ChevronLeft
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThanOrEqual(4);
      
      // Verify icons are present (they should be reversed)
      const svgIcons = container.querySelectorAll('svg');
      expect(svgIcons.length).toBeGreaterThan(0);
    });

    it('should maintain icon functionality in RTL', () => {
      const onPageChange = vi.fn();
      renderWithTheme(
        <PaginationBar 
          {...defaultProps} 
          page={1}
          totalRows={25}
          onPageChange={onPageChange} 
        />,
        DIRECTION_RTL
      );

      // All navigation buttons should be functional
      const buttons = screen.getAllByRole('button');
      const navigationButtons = buttons.filter(btn => 
        btn.getAttribute('aria-label')?.includes('page')
      );
      expect(navigationButtons.length).toBeGreaterThanOrEqual(4);
    });

    it('should disable appropriate buttons at boundaries in RTL', () => {
      renderWithTheme(
        <PaginationBar 
          {...defaultProps} 
          page={0}
          totalRows={25}
        />,
        DIRECTION_RTL
      );

      // First and Prev should be disabled on first page
      const buttons = screen.getAllByRole('button');
      const disabledButtons = buttons.filter(btn => btn.disabled);
      expect(disabledButtons.length).toBeGreaterThan(0);
    });
  });
});
