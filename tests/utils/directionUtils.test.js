import { describe, it, expect } from 'vitest';
import {
  getDateFormat,
  getDateTimeFormat,
  getDefaultAlign,
} from '../../src/utils/directionUtils';
import { DIRECTION_LTR, DIRECTION_RTL } from '../../src/config/schema';

describe('directionUtils', () => {
  describe('LTR', () => {
    it('getDateFormat returns MM-DD-YY', () => {
      expect(getDateFormat(DIRECTION_LTR)).toBe('MM-DD-YY');
      expect(getDateFormat('ltr')).toBe('MM-DD-YY');
    });

    it('getDateTimeFormat returns MM-DD-YY HH:mm:ss', () => {
      expect(getDateTimeFormat(DIRECTION_LTR)).toBe('MM-DD-YY HH:mm:ss');
      expect(getDateTimeFormat('ltr')).toBe('MM-DD-YY HH:mm:ss');
    });

    it('getDefaultAlign returns left', () => {
      expect(getDefaultAlign(DIRECTION_LTR)).toBe('left');
      expect(getDefaultAlign('ltr')).toBe('left');
    });
  });

  describe('RTL', () => {
    it('getDateFormat returns DD-MM-YY', () => {
      expect(getDateFormat(DIRECTION_RTL)).toBe('DD-MM-YY');
      expect(getDateFormat('rtl')).toBe('DD-MM-YY');
    });

    it('getDateTimeFormat returns DD-MM-YY HH:mm:ss', () => {
      expect(getDateTimeFormat(DIRECTION_RTL)).toBe('DD-MM-YY HH:mm:ss');
      expect(getDateTimeFormat('rtl')).toBe('DD-MM-YY HH:mm:ss');
    });

    it('getDefaultAlign returns right', () => {
      expect(getDefaultAlign(DIRECTION_RTL)).toBe('right');
      expect(getDefaultAlign('rtl')).toBe('right');
    });
  });
});
