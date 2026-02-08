import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@emotion/react': resolve(__dirname, 'node_modules/@emotion/react'),
      '@emotion/styled': resolve(__dirname, 'node_modules/@emotion/styled'),
    },
  },
  optimizeDeps: {
    include: ['@emotion/react', '@emotion/styled', '@mui/styled-engine', 'prop-types'],
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'UtronDataGrid',
      fileName: (format) =>
        format === 'es' ? 'utron-data-grid.js' : `utron-data-grid.umd.${format === 'cjs' ? 'cjs' : 'js'}`,
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@mui/material',
        '@mui/icons-material',
        '@mui/x-date-pickers',
        '@emotion/react',
        '@emotion/styled',
        'dayjs',
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@mui/material': 'MaterialUI',
          '@mui/icons-material': 'MaterialUIIcons',
          '@mui/x-date-pickers': 'MuiXDatePickers',
          '@emotion/react': 'emotionReact',
          '@emotion/styled': 'emotionStyled',
          dayjs: 'dayjs',
        },
      },
    },
    sourcemap: true,
  },
});
