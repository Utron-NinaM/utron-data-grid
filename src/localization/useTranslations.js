import { useCallback, useContext } from 'react';
import { DataGridStableContext } from '../DataGrid/DataGridContext';
import { defaultTranslations, hebrewTranslations } from './defaultTranslations';
import { DIRECTION_RTL } from '../config/schema';

/**
 * @returns {(key: string, params?: Record<string, string|number>) => string}
 */
export function useTranslations() {
  const ctx = useContext(DataGridStableContext);
  const hasCtx = ctx != null;
  const direction = ctx?.direction;
  const mergedDefaults = ctx?.defaultTranslations;

  return useCallback(
    (key, params) => {
      if (!hasCtx) {
        const str = defaultTranslations[key] ?? key;
        return params ? replaceParams(str, params) : str;
      }
      const translations = direction === DIRECTION_RTL ? hebrewTranslations : defaultTranslations;
      const defaults = mergedDefaults ?? defaultTranslations;
      const raw = translations[key] ?? defaults[key] ?? key;
      const str = typeof raw === 'string' ? raw : String(raw);
      return params ? replaceParams(str, params) : str;
    },
    [hasCtx, direction, mergedDefaults]
  );
}

function replaceParams(str, params) {
  return Object.keys(params).reduce(
    (acc, k) => acc.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(params[k])),
    str
  );
}
