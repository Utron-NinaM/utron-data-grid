import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['tests/**/*.test.js', 'tests/**/*.test.jsx'],
    setupFiles: ['tests/setup.js'],
    server: {
      deps: {
        inline: ['@mui/material', '@mui/icons-material'],
      },
    },
  },
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
      external: (id) => {
        return (
          id === 'react' ||
          id === 'react-dom' ||
          id === 'react/jsx-runtime' ||
          id.startsWith('@mui/material') ||
          id.startsWith('@mui/icons-material') ||
          id.startsWith('@mui/x-date-pickers') ||
          id.startsWith('@emotion/react') ||
          id.startsWith('@emotion/styled') ||
          id === 'dayjs'
        );
      },
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'React.jsxRuntime',
          '@mui/material': 'MaterialUI',
          '@mui/icons-material': 'MaterialUIIcons',
          '@mui/icons-material/FirstPage': 'MaterialUIIcons.FirstPage',
          '@mui/icons-material/LastPage': 'MaterialUIIcons.LastPage',
          '@mui/icons-material/ChevronLeft': 'MaterialUIIcons.ChevronLeft',
          '@mui/icons-material/ChevronRight': 'MaterialUIIcons.ChevronRight',
          '@mui/icons-material/Clear': 'MaterialUIIcons.Clear',
          '@mui/icons-material/CheckBoxOutlineBlank': 'MaterialUIIcons.CheckBoxOutlineBlank',
          '@mui/icons-material/CheckBox': 'MaterialUIIcons.CheckBox',
          '@mui/icons-material/ArrowDropDown': 'MaterialUIIcons.ArrowDropDown',
          '@mui/x-date-pickers': 'MuiXDatePickers',
          '@mui/x-date-pickers/DatePicker': 'MuiXDatePickers.DatePicker',
          '@mui/x-date-pickers/LocalizationProvider': 'MuiXDatePickers.LocalizationProvider',
          '@mui/x-date-pickers/AdapterDayjs': 'MuiXDatePickers.AdapterDayjs',
          '@emotion/react': 'emotionReact',
          '@emotion/styled': 'emotionStyled',
          dayjs: 'dayjs',
        },
      },
    },
    sourcemap: true,
  },
});
