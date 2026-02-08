import React from 'react';
import { createRoot } from 'react-dom/client';
import { DataGridExample } from './DataGridExample';

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <DataGridExample />
  </React.StrictMode>
);
