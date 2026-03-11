import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { SelectionStyleApplicator } from '../../src/core/SelectionStyleApplicator';
import { DataGridStableContext } from '../../src/DataGrid/DataGridContext';
import { createSelectionStore } from '../../src/DataGrid/selectionStore';

describe('SelectionStyleApplicator', () => {
  const theme = createTheme();

  const renderWithContext = (props = {}, contextOverrides = {}) => {
    const defaultContext = {
      selectionStore: createSelectionStore(null),
      selectedRowStyle: {},
      ...contextOverrides,
    };
    return render(
      <ThemeProvider theme={theme}>
        <DataGridStableContext.Provider value={defaultContext}>
          <SelectionStyleApplicator tableId="test-table" selection={new Set()} {...props} />
        </DataGridStableContext.Provider>
      </ThemeProvider>
    );
  };

  describe('when no selection', () => {
    it('returns null when selectionStore has no selectedRowId and selection is empty', () => {
      const { container } = renderWithContext();
      expect(container.firstChild).toBeNull();
    });

    it('returns null when selection is empty Set and store snapshot is null', () => {
      const { container } = renderWithContext({ selection: new Set() });
      expect(container.firstChild).toBeNull();
    });
  });

  describe('when selectionStore has selectedRowId', () => {
    it('renders a style tag with scoped CSS for the selected row', () => {
      const selectionStore = createSelectionStore(5);
      renderWithContext(
        { tableId: 'my-grid', selection: new Set() },
        { selectionStore }
      );
      const style = document.querySelector('style[data-grid-selection-highlight]');
      expect(style).toBeInTheDocument();
      expect(style.textContent).toContain('#my-grid');
      expect(style.textContent).toMatch(/tr\[data-row-id=/);
      expect(style.textContent).toContain('td');
    });

    it('uses default background when selectedRowStyle is not provided', () => {
      const selectionStore = createSelectionStore(1);
      renderWithContext({}, { selectionStore });
      const style = document.querySelector('style[data-grid-selection-highlight]');
      expect(style).toBeTruthy();
      expect(style.textContent).toMatch(/background-color:\s*\S+/);
    });

    it('uses selectedRowStyle from context when provided', () => {
      const selectionStore = createSelectionStore(1);
      const selectedRowStyle = { backgroundColor: 'rgb(100, 200, 100)', color: 'white' };
      renderWithContext({}, { selectionStore, selectedRowStyle });
      const style = document.querySelector('style[data-grid-selection-highlight]');
      expect(style).toBeTruthy();
      expect(style.textContent).toContain('background-color: rgb(100, 200, 100)');
      expect(style.textContent).toContain('color: white');
    });
  });

  describe('when selection prop has ids', () => {
    it('renders style tag with CSS for each row id in selection Set', () => {
      renderWithContext({
        tableId: 'grid-2',
        selection: new Set([10, 20]),
      });
      const style = document.querySelector('style[data-grid-selection-highlight]');
      expect(style).toBeInTheDocument();
      expect(style.textContent).toContain('#grid-2');
      const rowIdMatches = style.textContent.match(/tr\[data-row-id="[^"]*"]/g);
      expect(rowIdMatches).toHaveLength(2);
    });

    it('combines selectionStore selectedRowId and selection Set', () => {
      const selectionStore = createSelectionStore(1);
      renderWithContext(
        { selection: new Set([2, 3]) },
        { selectionStore }
      );
      const style = document.querySelector('style[data-grid-selection-highlight]');
      expect(style).toBeTruthy();
      const rowIdMatches = style.textContent.match(/tr\[data-row-id="[^"]*"]/g);
      expect(rowIdMatches).toHaveLength(3);
    });
  });

  describe('tableId scoping', () => {
    it('escapes tableId in CSS selector', () => {
      const selectionStore = createSelectionStore(1);
      renderWithContext(
        { tableId: 'grid-with-dash' },
        { selectionStore }
      );
      const style = document.querySelector('style[data-grid-selection-highlight]');
      expect(style.textContent).toContain('#grid-with-dash');
    });
  });

  describe('when context has no selectionStore', () => {
    it('returns null when selection is empty', () => {
      const { container } = renderWithContext(
        { selection: new Set() },
        { selectionStore: null }
      );
      expect(container.firstChild).toBeNull();
    });

    it('still renders style for selection prop when store is null', () => {
      renderWithContext(
        { selection: new Set([1]) },
        { selectionStore: null }
      );
      const style = document.querySelector('style[data-grid-selection-highlight]');
      expect(style).toBeInTheDocument();
      expect(style.textContent).toMatch(/tr\[data-row-id=/);
    });
  });
});
