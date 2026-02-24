import React from 'react';
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { DemoConfigProvider } from './DemoConfigContext';
import { ConfigPage } from './ConfigPage';
import { GridExamplePage } from './GridExamplePage';

export function ConfigDemoApp() {
  return (
    <DemoConfigProvider>
      <MemoryRouter initialEntries={['/config']} initialIndex={0} future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/config" element={<ConfigPage />} />
          <Route path="/example" element={<GridExamplePage />} />
          <Route path="/" element={<Navigate to="/config" replace />} />
          <Route path="*" element={<Navigate to="/config" replace />} />
        </Routes>
        </Box>
      </MemoryRouter>
    </DemoConfigProvider>
  );
}
