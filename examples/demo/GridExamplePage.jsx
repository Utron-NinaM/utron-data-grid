import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Paper,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { DataGrid } from '../../src/DataGrid/DataGrid';
import { columnsConfig, columnsConfigHebrew } from '../columnsConfig';
import { generateSampleData } from '../sampleData';
import { en } from '../translations';
import { useDemoConfig } from './DemoConfigContext';
import { DIRECTION_RTL } from '../../src/config/schema';

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
  const { gridOptions, containerWidth, sampleSize, columnCount } = useDemoConfig();
  const data = useMemo(
    () => generateSampleData(sampleSize ?? DEFAULT_SAMPLE_SIZE),
    [sampleSize]
  );

  const direction = gridOptions.direction ?? 'ltr';
  const count = Math.min(20, Math.max(1, columnCount ?? 20));
  const columns = useMemo(
    () => (direction === DIRECTION_RTL ? columnsConfigHebrew : columnsConfig).slice(0, count),
    [direction, count]
  );

  const [editedData, setEditedData] = useState(null);
  useEffect(() => {
    setEditedData(null);
  }, [sampleSize]);

  const handleEditCommit = useCallback((rowId, row) => {
    setEditedData((prev) => {
      const base = prev ?? data;
      return base.map((r) => (r.id === rowId ? { ...r, ...row } : r));
    });
  }, [data]);

  const options = useMemo(() => {
    const base = buildGridOptions(gridOptions);
    return {
      ...base,
      translations: en,
      sx: base.sx ?? { height: '100%' },
      onEditCommit: handleEditCommit,
    };
  }, [gridOptions, handleEditCommit]);

  const summaryEntries = [
    ['sampleSize', sampleSize],
    ['columnCount', columnCount],
    ['direction', gridOptions.direction],
    ['editable', gridOptions.editable],
    ['filters', gridOptions.filters],
    ['pagination', gridOptions.pagination],
    ['pageSize', gridOptions.pageSize],
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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexShrink: 0 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/config')}
        >
          Back to configuration
        </Button>
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
          width: containerWidth ?? '100%',
          maxWidth: '100%',
        }}
      >
        <DataGrid
          rows={editedData ?? data}
          columns={columns}
          getRowId={(row) => row.id}
          options={options}
        />
      </Box>
    </Box>
  );
}
