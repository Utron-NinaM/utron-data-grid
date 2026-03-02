import React, { createContext, useContext, useState, useCallback } from 'react';
import { getDefaultDemoConfig, mergeConfigWithDefaults } from './demoConfigModel';
import { DEFAULT_SAMPLE_SIZE } from './ConfigPage';
import { DEFAULT_COLUMN_COUNT } from './ConfigPage';
import { DEFAULT_CONTAINER_WIDTH } from './ConfigPage';
import { DEFAULT_EMPTY_ROW_COUNT } from './ConfigPage';

const DemoConfigContext = createContext(null);

/**
 * Adds demo validators to columns so you can test inline validation (blur + Save).
 * - make, model: required
 * - price: required, >= 0
 * - year: required, 1990–2030
 */
export function addDemoValidators(columns) {
  const validatorsByField = {
    make: [
      { validate: (v) => v != null && String(v).trim().length > 0, message: 'Make is required' },
    ],
    model: [
      { validate: (v) => v != null && String(v).trim().length > 0, message: 'Model is required' },
    ],
    price: [
      { validate: (v) => v != null && v !== '', message: 'Price is required' },
      { validate: (v) => Number(v) >= 0, message: 'Price must be >= 0' },
    ],
    year: [
      { validate: (v) => v != null && v !== '', message: 'Year is required' },
      { validate: (v) => { const n = Number(v); return n >= 1990 && n <= 2030; }, message: 'Year must be 1990–2030' },
    ],
  };
  return columns.map((col) => {
    const validators = validatorsByField[col.field];
    if (!validators?.length) return col;
    return { ...col, validators: [...(col.validators || []), ...validators] };
  });
}

/**
 * Adds demo columns that are addable only on new rows (create mode).
 * This demonstrates the addable property.
 */
export function addDemoCreateOnlyColumns(columns) {
  return columns.map((col) => {
    // Make the "make" field only addable when creating new rows
    if (col.field === 'make') {
      return {
        ...col,
        editable: false, // Not editable in existing rows
        addable: true, // But addable in new rows
      };
    }
    return col;
  });
}

/**
 * Adds row-level validation to the first column.
 * Validates the entire row as a whole (cross-field validation).
 * - If price > 50000, then year must be >= 2000 (expensive cars should be newer)
 */
export function addDemoRowValidators(columns) {
  if (columns.length === 0) return columns;
  
  const rowValidator = {
    validate: (_value, row) => {
      const price = Number(row.price);
      const year = Number(row.year);
      
      // Row-level rule: expensive cars (price > 50000) should be newer (year >= 2000)
      if (!isNaN(price) && price > 50000 && (!isNaN(year) && year < 2000)) {
        return 'Expensive cars (price > 50000) must be from year 2000 or later';
      }
      
      return true;
    },
    message: 'Row validation failed',
    rowLevel: true, // Mark as row-level validator so error applies to entire row, not specific cell
  };
  
  return columns.map((col, index) => {
    if (index === 0) {
      return {
        ...col,
        validators: [...(col.validators || []), rowValidator],
      };
    }
    return col;
  });
}

export function DemoConfigProvider({ children }) {
  const [gridOptions, setGridOptionsState] = useState(() => getDefaultDemoConfig());
  const [containerWidth, setContainerWidthState] = useState(DEFAULT_CONTAINER_WIDTH);
  const [sampleSize, setSampleSizeState] = useState(DEFAULT_SAMPLE_SIZE);
  const [columnCount, setColumnCountState] = useState(DEFAULT_COLUMN_COUNT);
  const [emptyRowCount, setEmptyRowCountState] = useState(DEFAULT_EMPTY_ROW_COUNT);

  const setGridOptions = useCallback((next) => {
    setGridOptionsState((prev) => mergeConfigWithDefaults({ ...prev, ...next }));
  }, []);

  const setContainerWidth = useCallback((next) => {
    setContainerWidthState(next ?? DEFAULT_CONTAINER_WIDTH);
  }, []);

  const applyConfig = useCallback((options, width, size, cols, emptyRows) => {
    setGridOptionsState(mergeConfigWithDefaults(options ?? {}));
    setContainerWidthState(width ?? DEFAULT_CONTAINER_WIDTH);
    setSampleSizeState(size ?? DEFAULT_SAMPLE_SIZE);
    setColumnCountState(cols ?? DEFAULT_COLUMN_COUNT);
    setEmptyRowCountState(emptyRows ?? DEFAULT_EMPTY_ROW_COUNT);
  }, []);

  const value = {
    gridOptions,
    containerWidth,
    sampleSize,
    columnCount,
    emptyRowCount,
    setGridOptions,
    setContainerWidth,
    applyConfig,
  };

  return (
    <DemoConfigContext.Provider value={value}>
      {children}
    </DemoConfigContext.Provider>
  );
}

export function useDemoConfig() {
  const ctx = useContext(DemoConfigContext);
  if (!ctx) throw new Error('useDemoConfig must be used within DemoConfigProvider');
  return ctx;
}
