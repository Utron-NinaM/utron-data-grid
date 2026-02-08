import { useContext } from 'react';
import { DataGridContext } from '../DataGrid/DataGridContext';
import { defaultTranslations } from './defaultTranslations';

/**
 * @returns {(key: string, params?: Record<string, string|number>) => string}
 */
export function useTranslations() {
  const ctx = useContext(DataGridContext);
  if (!ctx) {
    return (key, params) => {
      const str = defaultTranslations[key] ?? key;
      return params ? replaceParams(str, params) : str;
    };
  }
  const translations = ctx.translations || {};
  const defaults = ctx.defaultTranslations ?? defaultTranslations;
  return function t(key, params) {
    const raw = translations[key] ?? defaults[key] ?? key;
    const str = typeof raw === 'string' ? raw : String(raw);
    return params ? replaceParams(str, params) : str;
  };
}

function replaceParams(str, params) {
  return Object.keys(params).reduce(
    (acc, k) => acc.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(params[k])),
    str
  );
}
