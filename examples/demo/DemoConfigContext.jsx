import React, { createContext, useContext, useState, useCallback } from 'react';
import { getDefaultDemoConfig, mergeConfigWithDefaults } from './demoConfigModel';

const DemoConfigContext = createContext(null);

export function DemoConfigProvider({ children }) {
  const [gridOptions, setGridOptionsState] = useState(() => getDefaultDemoConfig());
  const [containerWidth, setContainerWidthState] = useState('100%');
  const [sampleSize, setSampleSizeState] = useState(105);
  const [columnCount, setColumnCountState] = useState(20);

  const setGridOptions = useCallback((next) => {
    setGridOptionsState((prev) => mergeConfigWithDefaults({ ...prev, ...next }));
  }, []);

  const setContainerWidth = useCallback((next) => {
    setContainerWidthState(next ?? '100%');
  }, []);

  const applyConfig = useCallback((options, width, size, cols) => {
    setGridOptionsState(mergeConfigWithDefaults(options ?? {}));
    setContainerWidthState(width ?? '100%');
    setSampleSizeState(size ?? 105);
    setColumnCountState(cols ?? 20);
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
