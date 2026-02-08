import React from 'react';
import { createRoot } from 'react-dom/client';
import { ExampleMenu } from './ExampleMenu';

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ExampleMenu />
  </React.StrictMode>
);
