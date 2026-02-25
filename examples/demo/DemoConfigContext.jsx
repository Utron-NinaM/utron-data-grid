import React, { createContext, useContext, useState, useCallback } from 'react';
import { getDefaultDemoConfig, mergeConfigWithDefaults } from './demoConfigModel';
import { DEFAULT_SAMPLE_SIZE } from './ConfigPage';
import { DEFAULT_COLUMN_COUNT } from './ConfigPage';
import { DEFAULT_CONTAINER_WIDTH } from './ConfigPage';

const DemoConfigContext = createContext(null);

export function DemoConfigProvider({ children }) {
  const [gridOptions, setGridOptionsState] = useState(() => getDefaultDemoConfig());
  const [containerWidth, setContainerWidthState] = useState(DEFAULT_CONTAINER_WIDTH);
  const [sampleSize, setSampleSizeState] = useState(DEFAULT_SAMPLE_SIZE);
  const [columnCount, setColumnCountState] = useState(DEFAULT_COLUMN_COUNT);

  const setGridOptions = useCallback((next) => {
    setGridOptionsState((prev) => mergeConfigWithDefaults({ ...prev, ...next }));
  }, []);

  const setContainerWidth = useCallback((next) => {
    setContainerWidthState(next ?? DEFAULT_CONTAINER_WIDTH);
  }, []);

  const applyConfig = useCallback((options, width, size, cols) => {
    setGridOptionsState(mergeConfigWithDefaults(options ?? {}));
    setContainerWidthState(width ?? DEFAULT_CONTAINER_WIDTH);
    setSampleSizeState(size ?? DEFAULT_SAMPLE_SIZE);
    setColumnCountState(cols ?? DEFAULT_COLUMN_COUNT);
  }, []);

  const value = {
    gridOptions,
    containerWidth,
    sampleSize,
    columnCount,
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
