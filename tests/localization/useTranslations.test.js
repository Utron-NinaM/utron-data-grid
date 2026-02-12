import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { useTranslations } from '../../src/localization/useTranslations';
import { DataGridStableContext } from '../../src/DataGrid/DataGridContext';
import { defaultTranslations, hebrewTranslations } from '../../src/localization/defaultTranslations';
import { DIRECTION_LTR, DIRECTION_RTL } from '../../src/config/schema';

describe('useTranslations', () => {
  describe('without provider', () => {
    it('returns function that uses defaultTranslations[key] ?? key', () => {
      const { result } = renderHook(useTranslations);
      const t = result.current;
      expect(t('clearSort')).toBe(defaultTranslations.clearSort);
      expect(t('filterPlaceholder')).toBe(defaultTranslations.filterPlaceholder);
      expect(t('unknownKey')).toBe('unknownKey');
    });

    it('replaces {{param}} when params passed', () => {
      const { result } = renderHook(useTranslations);
      const t = result.current;
      expect(t('paginationRange', { from: 1, to: 10, count: 100 })).toBe(
        '1–10 of 100'
      );
    });

    it('replaces multiple params', () => {
      const { result } = renderHook(useTranslations);
      const t = result.current;
      const str = t('paginationRange', { from: 11, to: 20, count: 50 });
      expect(str).toBe('11–20 of 50');
    });

    it('returns string unchanged when params not passed', () => {
      const { result } = renderHook(useTranslations);
      const t = result.current;
      expect(t('paginationRange')).toBe(defaultTranslations.paginationRange);
    });

    it('missing param leaves placeholder as-is', () => {
      const { result } = renderHook(useTranslations);
      const t = result.current;
      const str = t('paginationRange', { from: 1, to: 10 });
      expect(str).toContain('{{count}}');
      expect(str).toBe('1–10 of {{count}}');
    });
  });

  describe('with provider', () => {
    it('uses defaultTranslations when direction is LTR', () => {
      const wrapper = ({ children }) =>
        React.createElement(DataGridStableContext.Provider, {
          value: { direction: DIRECTION_LTR },
          children,
        });
      const { result } = renderHook(useTranslations, { wrapper });
      const t = result.current;
      expect(t('clearSort')).toBe(defaultTranslations.clearSort);
    });

    it('uses hebrewTranslations when direction is RTL', () => {
      const wrapper = ({ children }) =>
        React.createElement(DataGridStableContext.Provider, {
          value: { direction: DIRECTION_RTL },
          children,
        });
      const { result } = renderHook(useTranslations, { wrapper });
      const t = result.current;
      expect(t('clearSort')).toBe(hebrewTranslations.clearSort);
      expect(t('clearSort')).not.toBe(defaultTranslations.clearSort);
    });

    it('replaces params when context provided', () => {
      const wrapper = ({ children }) =>
        React.createElement(DataGridStableContext.Provider, {
          value: { direction: DIRECTION_RTL },
          children,
        });
      const { result } = renderHook(useTranslations, { wrapper });
      const t = result.current;
      expect(t('paginationRange', { from: 1, to: 10, count: 25 })).toBe(
        '1–10 מתוך 25'
      );
    });

    it('falls back to defaultTranslations then key when translation missing in context map', () => {
      const customContext = {
        direction: DIRECTION_LTR,
        defaultTranslations: { ...defaultTranslations, customKey: 'Custom' },
      };
      const wrapper = ({ children }) =>
        React.createElement(DataGridStableContext.Provider, {
          value: customContext,
          children,
        });
      const { result } = renderHook(useTranslations, { wrapper });
      const t = result.current;
      expect(t('clearSort')).toBe(defaultTranslations.clearSort);
      expect(t('neverDefined')).toBe('neverDefined');
    });
  });
});
