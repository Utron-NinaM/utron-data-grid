import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Input,
  Divider,
} from '@mui/material';
import { useDemoConfig } from './DemoConfigContext';
import { gridOptionDefinitions, GROUP_LABELS } from './gridOptionDefinitions';
import { CONTAINER_WIDTH_PRESETS, parseContainerWidth } from './demoConfigModel';
import { OptionEditor } from './optionEditors/OptionEditor';

const GROUP_ORDER = ['layout', 'behavior', 'filtering', 'selection', 'appearance', 'pagination', 'identity'];
const MAX_COLUMN_COUNT = 20;
const DEFAULT_COLUMN_COUNT = 10;

const optionsGridSx = {
  display: 'grid',
  gap: 2,
  gridTemplateColumns: {
    xs: '1fr',
    sm: '1fr 1fr',
    md: '1fr 1fr 1fr',
    lg: '1fr 1fr 1fr 1fr',
  },
};

export function ConfigPage() {
  const navigate = useNavigate();
  const { gridOptions, containerWidth, sampleSize, columnCount, applyConfig } = useDemoConfig();
  const [localGridOptions, setLocalGridOptions] = useState({});
  const [localContainerWidth, setLocalContainerWidth] = useState('100%');
  const [localSampleSize, setLocalSampleSize] = useState('105');
  const [localColumnCount, setLocalColumnCount] = useState(String(DEFAULT_COLUMN_COUNT));

  useEffect(() => {
    setLocalGridOptions({ ...gridOptions });
    setLocalContainerWidth(containerWidth ?? '100%');
    setLocalSampleSize(String(sampleSize ?? 105));
    setLocalColumnCount(String(columnCount ?? DEFAULT_COLUMN_COUNT));
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
    <Box sx={{ p: 2, pb: 4, width: '100%', maxWidth: '100%', mx: 'auto', flex: 1, minHeight: 0, overflowY: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Grid Configuration
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Configure the grid options and container width, then click Apply to render the grid.
      </Typography>
      <Button variant="contained" color="primary" onClick={handleApply} size="large" sx={{ mb: 3 }}>
        Apply
      </Button>

      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Container width & sample size
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
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
              inputProps={{ min: 1, max: MAX_COLUMN_COUNT, step: 1 }}
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

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {GROUP_ORDER.filter((g) => defsByGroup[g]?.length).map((group) => (
          <Paper key={group} variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              {GROUP_LABELS[group] ?? group}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={optionsGridSx}>
              {defsByGroup[group].map((def) => (
                <OptionEditor
                  key={def.key}
                  definition={def}
                  value={localGridOptions[def.key]}
                  onChange={handleOptionChange}
                />
              ))}
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}
