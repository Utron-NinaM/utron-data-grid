import { describe, it, expect } from 'vitest';
import { normalizeWidth } from '../../src/utils/widthUtils';

describe('normalizeWidth', () => {
  describe('number values', () => {
    it.each([
      [100, '100px'],
      [0, '0px'],
      [50, '50px'],
      [200.5, '200.5px'],
      [-10, '-10px'],
      [1e10, '10000000000px'],
      [-0, '0px'],
    ])('should convert number %s to px string %s', (input, expected) => {
      expect(normalizeWidth(input)).toBe(expected);
    });
  });

  describe('string values', () => {
    it.each([
      ['20%', '20%'],
      ['100%', '100%'],
      ['50%', '50%'],
      ['33.33%', '33.33%'],
      ['100px', '100px'],
      ['0px', '0px'],
      ['200px', '200px'],
      ['100', '100px'],
      ['0', '0px'],
      ['50', '50px'],
    ])('should normalize string %s to %s', (input, expected) => {
      expect(normalizeWidth(input)).toBe(expected);
    });
  });

  describe('edge cases', () => {
    it.each([
      ['undefined', undefined],
      ['null', null],
    ])('should return undefined for %s', (_, input) => {
      expect(normalizeWidth(input)).toBeUndefined();
    });

    it('should handle empty string', () => {
      expect(normalizeWidth('')).toBe('px');
    });

    it.each([
      ['object', {}],
      ['array', []],
      ['boolean true', true],
      ['boolean false', false],
    ])('should return undefined for invalid type: %s', (_, input) => {
      expect(normalizeWidth(input)).toBeUndefined();
    });

    it('should handle very large numbers', () => {
      expect(normalizeWidth(Number.MAX_SAFE_INTEGER)).toBe(`${Number.MAX_SAFE_INTEGER}px`);
      expect(normalizeWidth(1e10)).toBe('10000000000px');
    });
 
  });
});
