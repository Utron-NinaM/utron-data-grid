import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Input,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useDemoConfig } from './DemoConfigContext';
import { gridOptionDefinitions, GROUP_LABELS } from './gridOptionDefinitions';
import { CONTAINER_WIDTH_PRESETS, parseContainerWidth } from './demoConfigModel';
import { OptionEditor } from './optionEditors/OptionEditor';

const GROUP_ORDER = ['layout', 'behavior', 'filtering', 'selection', 'appearance', 'pagination', 'identity'];

export function ConfigPage() {
  const navigate = useNavigate();
  const { gridOptions, containerWidth, sampleSize, columnCount, applyConfig } = useDemoConfig();
  const [localGridOptions, setLocalGridOptions] = useState({});
  const [localContainerWidth, setLocalContainerWidth] = useState('100%');
  const [localSampleSize, setLocalSampleSize] = useState('105');
  const [localColumnCount, setLocalColumnCount] = useState('20');

  useEffect(() => {
    setLocalGridOptions({ ...gridOptions });
    setLocalContainerWidth(containerWidth ?? '100%');
    setLocalSampleSize(String(sampleSize ?? 105));
    setLocalColumnCount(String(columnCount ?? 20));
  }, [gridOptions, containerWidth, sampleSize, columnCount]);

  const handleOptionChange = (key, value) => {
    setLocalGridOptions((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    const width = parseContainerWidth(localContainerWidth);
    const size = parseInt(localSampleSize, 10);
    const cols = parseInt(localColumnCount, 10);
    applyConfig(localGridOptions, width, Number.isFinite(size) ? size : 105, Number.isFinite(cols) ? Math.min(20, Math.max(1, cols)) : 20);
    navigate('/example');
  };

  const defsByGroup = {};
  for (const def of gridOptionDefinitions) {
    if (!defsByGroup[def.group]) defsByGroup[def.group] = [];
    defsByGroup[def.group].push(def);
  }

  return (
    <Box sx={{ p: 2, pb: 4, maxWidth: 800, mx: 'auto', flex: 1, minHeight: 0, overflowY: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Grid Configuration
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Configure the grid options and container width, then click Apply to render the grid.
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Container width & sample size
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mb: 2 }}>
          <TextField
            label="Sample size"
            value={localSampleSize}
            onChange={(e) => setLocalSampleSize(e.target.value)}
            size="small"
            sx={{ width: 120 }}
            placeholder="105"
          />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Columns</InputLabel>
            <Input
              label="Columns"
              value={localColumnCount}
              onChange={(e) => setLocalColumnCount(e.target.value)}
              inputProps={{ min: 1, max: 20, step: 1 }}
            />
          </FormControl>
          <TextField
            label="Width (px or %)"
            value={localContainerWidth}
            onChange={(e) => setLocalContainerWidth(e.target.value)}
            size="small"
            sx={{ width: 140 }}
            placeholder="800px or 100%"
          />
          {CONTAINER_WIDTH_PRESETS.map((preset) => (
            <Button
              key={preset}
              variant={localContainerWidth === preset ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setLocalContainerWidth(preset)}
            >
              {preset}
            </Button>
          ))}
        </Box>
      </Paper>

      <Box sx={{ mb: 2 }}>
        {GROUP_ORDER.filter((g) => defsByGroup[g]?.length).map((group) => (
          <Accordion key={group} defaultExpanded={group === 'layout'}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight={500}>{GROUP_LABELS[group] ?? group}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {defsByGroup[group].map((def) => (
                  <OptionEditor
                    key={def.key}
                    definition={def}
                    value={localGridOptions[def.key]}
                    onChange={handleOptionChange}
                  />
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      <Button variant="contained" color="primary" onClick={handleApply} size="large">
        Apply
      </Button>
    </Box>
  );
}
