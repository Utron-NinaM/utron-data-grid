import React, { useState, useCallback, useMemo } from 'react';
import { Box, Autocomplete, TextField } from '@mui/material';
import { DataGrid } from '../src/DataGrid/DataGrid';
import { conditionalEditingColumns } from './conditionalEditingColumns';
import { conditionalEditingData } from './conditionalEditingData';
import { en } from './translations';
import { DIRECTION_RTL } from '../src/config/schema';

/** Selected row style (draft orders config: BUTTON_DISABLED_DARKER_GRAY) */
const SELECTED_ROW_BG = 'yellow';

const PRIORITY_OPTIONS = ['Low', 'Medium', 'High'];

/**
 * Always-visible Priority cell. Single click selects the row (grid onRowClick) and opens the dropdown.
 * Selected row display is updated on dropdown close so the grid does not re-render while the dropdown is open.
 */
function AlwaysVisiblePriorityCell({ value, row, onChange, onDropdownClose }) {
  const option = value != null ? (PRIORITY_OPTIONS.includes(value) ? value : null) : null;
  const handleClose = useCallback(() => {
    onDropdownClose?.(row);
  }, [row, onDropdownClose]);
  return (
    <Box sx={{ minWidth: 0, width: '100%' }}>
      <Autocomplete
        size="small"
        options={PRIORITY_OPTIONS}
        value={option}
        onChange={(_, newValue) => onChange(row.id, newValue)}
        onClose={handleClose}
        getOptionLabel={(o) => o ?? ''}
        isOptionEqualToValue={(a, b) => a === b}
        renderInput={(params) => (
          <TextField {...params} variant="standard" size="small" InputProps={{ ...params.InputProps, disableUnderline: true }} />
        )}
        sx={{ width: '100%', minWidth: 100, '& .MuiInputBase-root': { minHeight: 28 } }}
      />
    </Box>
  );
}

export function ConditionalEditingExample() {
  const [data, setData] = useState(conditionalEditingData);
  const [selectedRow, setSelectedRow] = useState(null);

  const handlePriorityChange = useCallback((rowId, newValue) => {
    setData((prev) => prev.map((r) => (r.id === rowId ? { ...r, priority: newValue ?? '' } : r)));
  }, []);

  const handleDropdownClose = useCallback((row) => {
    setSelectedRow(row);
  }, []);

  const columns = useMemo(
    () =>
      conditionalEditingColumns.map((col) => {
        if (col.field !== 'priority') {
          return { ...col, editable: false, addable: false };
        }
        return {
          ...col,
          editable: false,
          addable: false,
          render: (value, row) => (
            <AlwaysVisiblePriorityCell
              value={value}
              row={row}
              onChange={handlePriorityChange}
              onDropdownClose={handleDropdownClose}
            />
          ),
        };
      }),
    [handlePriorityChange, handleDropdownClose]
  );

  const handleRowClick = useCallback(() => {
    // Do not set state here: it would re-render the grid and close the dropdown.
    // Selected row is updated in onDropdownClose so the dropdown stays open.
  }, []);

  const options = useMemo(
    () => ({
      gridId: 'draftOrdersGrid',
      translations: en,
      direction: DIRECTION_RTL,
      editable: false,
      pagination: true,
      pageSize: 25,
      pageSizeOptions: [10, 25, 50, 100],
      bodyRow: { height: 30 },
      headerConfig: {
        mainRow: {
          backgroundColor: '#8b0000',
          color: '#fff',
          height: 30,
        },
        filterRows: { backgroundColor: 'rgb(250, 250, 250)', height: 30 },
        filterCells: { backgroundColor: 'rgb(250, 250, 250)', height: 30 },
      },
      onRowClick: handleRowClick,
      onRowDoubleClick: () => {},
      selectedRowStyle: {
        backgroundColor: SELECTED_ROW_BG,
        '&:hover': { backgroundColor: SELECTED_ROW_BG },
      },
      sx: { height: '100%' },
    }),
    [handleRowClick]
  );

  return (
    <div style={{ padding: 24 }}>
      <h1>React Data Grid – Conditional Editing</h1>
      <h2>Single-click row select + open dropdown (test)</h2>
      <p>
        Draft-orders-style config: dark red header, gray selected row. The <strong>Priority</strong> column
        always shows an Autocomplete. This example tests that <strong>one click</strong> on the Priority cell
        (input or dropdown arrow) both <strong>selects the row</strong> and <strong>opens the dropdown</strong>—no
        second click needed.
      </p>
      <ul style={{ marginBottom: 16 }}>
        <li><strong>Priority:</strong> Single click should highlight the row and open the dropdown at once</li>
        <li>Other columns are read-only</li>
      </ul>
      {selectedRow && (
        <p style={{ marginBottom: 8, fontSize: 14 }}>Selected: {selectedRow.name} (id: {selectedRow.id}) — updates when you close the dropdown</p>
      )}
      <div style={{ marginTop: 16, height: 400 }}>
        <DataGrid
          rows={data}
          columns={columns}
          getRowId={(row) => row.id}
          options={options}
        />
      </div>
    </div>
  );
}
