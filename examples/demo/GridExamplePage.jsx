import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Paper,
  Chip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { DataGrid } from '../../src/DataGrid/DataGrid';
import { columnsConfig, columnsConfigHebrew } from '../columnsConfig';
import { addDemoValidators, addDemoRowValidators, addDemoCreateOnlyColumns } from './DemoConfigContext';
import { generateSampleData } from '../sampleData';
import { en } from '../translations';
import { useDemoConfig } from './DemoConfigContext';
import { DEFAULT_SAMPLE_SIZE } from './ConfigPage';
import { DIRECTION_RTL, FIELD_TYPE_NUMBER, FILTER_TYPE_NONE } from '../../src/config/schema';
import { getDefaultAlign } from '../../src/utils/directionUtils';

function buildGridOptions(gridOptions) {
  const opts = { ...gridOptions };
  const result = {};
  for (const [k, v] of Object.entries(opts)) {
    if (v !== undefined && v !== null && v !== '') {
      result[k] = v;
    }
  }
  return result;
}

export function GridExamplePage() {
  const navigate = useNavigate();
  const { gridOptions, containerWidth, sampleSize, columnCount, emptyRowCount } = useDemoConfig();
  const data = useMemo(() => {
    const sampleData = generateSampleData(sampleSize ?? DEFAULT_SAMPLE_SIZE);
    const emptyRows = emptyRowCount ?? 0;
    if (emptyRows > 0) {
      // Add empty placeholder rows for testing
      const maxId = Math.max(...sampleData.map(r => r.id || 0), 0);
      const emptyRowsData = Array.from({ length: emptyRows }, (_, i) => ({
        id: maxId + i + 1,
      }));
      return [...sampleData, ...emptyRowsData];
    }
    return sampleData;
  }, [sampleSize, emptyRowCount]);

  const direction = gridOptions.direction ?? 'ltr';
  const count = Math.min(20, Math.max(1, columnCount ?? 20));
  const indexColumn = useMemo(
    () => ({
      field: '_index',
      headerName: '#',
      type: FIELD_TYPE_NUMBER,
      filter: FILTER_TYPE_NONE,
      editable: false,
      width: 48,
      align: getDefaultAlign(direction),
    }),
    [direction]
  );
  const dataColumns = useMemo(
    () => addDemoCreateOnlyColumns(addDemoRowValidators(addDemoValidators(
      (direction === DIRECTION_RTL ? columnsConfigHebrew : columnsConfig).slice(0, count)
    ))),
    [direction, count]
  );
  const columns = useMemo(
    () => [indexColumn, ...dataColumns],
    [indexColumn, dataColumns]
  );

  const gridRef = useRef(null);
  const mainContentRef = useRef(null);

  const [editedData, setEditedData] = useState(null);
  const displayData = editedData ?? data;
  const rowsWithIndex = useMemo(
    () => displayData.map((r, i) => ({ ...r, _index: i + 1 })),
    [displayData]
  );
  useEffect(() => {
    setEditedData(null);
  }, [sampleSize]);

  const handleEditCommit = useCallback((rowId, row) => {
    setEditedData((prev) => {
      const base = prev ?? data;
      // If this is a new row (no existing row with this ID), add it
      const existingIndex = base.findIndex((r) => r.id === rowId);
      if (existingIndex >= 0) {
        return base.map((r) => (r.id === rowId ? { ...r, ...row } : r));
      } else {
        // New row - add it to the data
        return [...base, { id: rowId, ...row }];
      }
    });
  }, [data]);

  const handleAddEmptyRow = useCallback(() => {
    // Add an empty placeholder row that can be edited
    // Empty rows are detected when all fields are null/undefined/empty string
    const base = editedData ?? data;
    const newId = Math.max(...base.map(r => r.id || 0), 0) + 1;
    const emptyRow = { id: newId }; // Empty row - all other fields are undefined
    setEditedData((prev) => {
      const current = prev ?? data;
      return [...current, emptyRow];
    });
    // Start editing the new row programmatically using the ref API
    setTimeout(() => {
      gridRef.current?.startEditMode(newId);
    }, 100);
  }, [data, editedData]);

  const handleStartEditFirstRow = useCallback(() => {
    const base = editedData ?? data;
    if (base.length > 0) {
      const firstRowId = base[0].id;
      gridRef.current?.startEditMode(firstRowId);
    }
  }, [data, editedData]);

  const options = useMemo(() => {
    const base = buildGridOptions(gridOptions);
    return {
      ...base,
      translations: en,
      sx: base.sx ?? { height: '100%' },
      onEditCommit: handleEditCommit,
      dropdownBoundaryRef: mainContentRef,
      onColumnConfigClick: () => navigate('/config'),
    };
  }, [gridOptions, handleEditCommit, navigate]);

  const summaryEntries = [
    ['sampleSize', sampleSize],
    ['columnCount', columnCount],
    ['direction', gridOptions.direction],
    ['editable', gridOptions.editable],
    ['filters', gridOptions.filters],
    ['pagination', gridOptions.pagination],
    ['pageSize', gridOptions.pageSize],
    ['showExportToExcel', gridOptions.showExportToExcel],
    ['multiSelectable', gridOptions.multiSelectable],
    ['containerWidth', containerWidth],
  ].filter(([, v]) => v !== undefined && v !== null);

  return (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        p: 2,
        boxSizing: 'border-box',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexShrink: 0, flexWrap: 'wrap' }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/config')}
        >
          Back to configuration
        </Button>
        {gridOptions.editable && (
          <>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={handleAddEmptyRow}
              title="Add an empty placeholder row and start editing it programmatically (demonstrates ref API and create mode)"
            >
              Add Empty Row (Ref API)
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={handleStartEditFirstRow}
              title="Start editing the first row programmatically using the ref API"
            >
              Edit First Row (Ref API)
            </Button>
            <Chip
              label="Tip: Double-click any empty row to start editing"
              size="small"
              color="info"
              variant="outlined"
            />
          </>
        )}
      </Box>

      <Accordion sx={{ mb: 2, flexShrink: 0 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2">Active configuration (debug)</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Paper variant="outlined" sx={{ p: 1.5, fontFamily: 'monospace', fontSize: 12 }}>
            {summaryEntries.map(([key, val]) => (
              <div key={key}>
                {key}: {typeof val === 'object' ? JSON.stringify(val) : String(val)}
              </div>
            ))}
          </Paper>
        </AccordionDetails>
      </Accordion>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'row',
          direction,
        }}
      >
        <Box
          sx={{
            width: 56,
            flexShrink: 0,
            backgroundColor: '#c62828',
            minHeight: '100%',
          }}
        />
        <Box
          ref={mainContentRef}
          sx={{
            flex: 1,
            minWidth: 0,
            padding: 2,
            direction,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              minWidth: 0,
              width: containerWidth ?? '100%',
              maxWidth: '100%',
            }}
          >
            <DataGrid
              ref={gridRef}
              rows={rowsWithIndex}
              columns={columns}
              getRowId={(row) => row.id}
              options={options}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
